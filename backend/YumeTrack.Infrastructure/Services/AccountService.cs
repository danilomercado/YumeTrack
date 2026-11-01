using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using YumeTrack.Application.Common;
using YumeTrack.Application.Interfaces;
using YumeTrack.Infrastructure.Persistence;

namespace YumeTrack.Infrastructure.Services
{
    // Recuperación y cambio de contraseña.
    public class AccountService
    {
        private static readonly TimeSpan ResetLifetime = TimeSpan.FromMinutes(30);

        private readonly AppDbContext _context;
        private readonly IEmailSender _email;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AccountService> _logger;

        public AccountService(
            AppDbContext context,
            IEmailSender email,
            IConfiguration configuration,
            ILogger<AccountService> logger)
        {
            _context = context;
            _email = email;
            _configuration = configuration;
            _logger = logger;
        }

        private static string Hash(string token) =>
            Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token))).ToLowerInvariant();

        // Siempre responde igual exista o no el correo: no revela quién tiene cuenta.
        public async Task RequestPasswordResetAsync(string email, CancellationToken cancellationToken = default)
        {
            var normalized = email.Trim().ToLowerInvariant();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalized, cancellationToken);

            if (user is null)
                return;

            var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
                .Replace('+', '-').Replace('/', '_').TrimEnd('=');

            user.PasswordResetTokenHash = Hash(token);
            user.PasswordResetExpiresAt = DateTime.UtcNow.Add(ResetLifetime);
            await _context.SaveChangesAsync(cancellationToken);

            var baseUrl = (_configuration["App:FrontendUrl"]
                           ?? _configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()?.FirstOrDefault()
                           ?? "http://localhost:5173").TrimEnd('/');

            var link = $"{baseUrl}/reset-password?email={Uri.EscapeDataString(user.Email)}&token={token}";

            try
            {
                await _email.SendAsync(
                    user.Email,
                    "Recuperá tu contraseña de YumeTrack",
                    $"<p>Hola {System.Net.WebUtility.HtmlEncode(user.UserName)},</p>" +
                    "<p>Recibimos un pedido para cambiar tu contraseña. Este enlace vale 30 minutos:</p>" +
                    $"<p><a href=\"{link}\">Elegir una contraseña nueva</a></p>" +
                    "<p>Si no fuiste vos, ignorá este mensaje: tu contraseña no cambia.</p>",
                    cancellationToken);
            }
            catch (Exception ex)
            {
                // No se le cuenta al cliente: sería una forma de saber si el correo existe.
                _logger.LogError(ex, "No se pudo enviar el correo de recuperación.");
            }
        }

        public async Task ResetPasswordAsync(string email, string token, string newPassword)
        {
            PasswordPolicy.Validate(newPassword);

            var normalized = email.Trim().ToLowerInvariant();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalized);

            var valid =
                user is not null &&
                user.PasswordResetTokenHash is not null &&
                user.PasswordResetExpiresAt > DateTime.UtcNow &&
                CryptographicOperations.FixedTimeEquals(
                    Encoding.UTF8.GetBytes(user.PasswordResetTokenHash),
                    Encoding.UTF8.GetBytes(Hash(token)));

            if (!valid || user is null)
                throw new InvalidOperationException("El enlace no es válido o venció. Pedí uno nuevo.");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            user.PasswordResetTokenHash = null;
            user.PasswordResetExpiresAt = null;
            user.FailedLoginCount = 0;
            user.LockoutUntil = null;

            await _context.SaveChangesAsync();
        }

        public async Task ChangePasswordAsync(int userId, string currentPassword, string newPassword)
        {
            PasswordPolicy.Validate(newPassword);

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId)
                       ?? throw new InvalidOperationException("Usuario no encontrado.");

            if (!BCrypt.Net.BCrypt.Verify(currentPassword, user.PasswordHash))
                throw new InvalidOperationException("La contraseña actual no es correcta.");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            await _context.SaveChangesAsync();
        }
    }
}
