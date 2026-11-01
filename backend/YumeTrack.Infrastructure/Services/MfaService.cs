using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using YumeTrack.Application.Common;
using YumeTrack.Application.DTOs.Auth;
using YumeTrack.Domain.Entities;
using YumeTrack.Infrastructure.Persistence;
using YumeTrack.Infrastructure.Security;

namespace YumeTrack.Infrastructure.Services
{
    public class MfaService
    {
        private const string Issuer = "YumeTrack";
        private const int RecoveryCodeCount = 10;
        private const string CodeAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

        private readonly AppDbContext _context;
        private readonly SecretProtector _protector;

        public MfaService(AppDbContext context, SecretProtector protector)
        {
            _context = context;
            _protector = protector;
        }

        private async Task<User> GetUserAsync(int userId) =>
            await _context.Users.FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new InvalidOperationException("Usuario no encontrado.");

        public async Task<MfaStatusDto> GetStatusAsync(int userId)
        {
            var user = await GetUserAsync(userId);

            return new MfaStatusDto
            {
                Enabled = user.MfaEnabled,
                RecoveryCodesLeft = ReadHashes(user).Count
            };
        }

        public async Task<MfaSetupDto> SetupAsync(int userId)
        {
            var user = await GetUserAsync(userId);

            if (user.MfaEnabled)
                throw new InvalidOperationException("La verificación en dos pasos ya está activada.");

            var secret = Totp.GenerateSecret();
            user.MfaSecretProtected = _protector.Protect(secret);
            await _context.SaveChangesAsync();

            return new MfaSetupDto
            {
                Secret = secret,
                OtpAuthUri = Totp.BuildUri(Issuer, user.Email, secret)
            };
        }

        public async Task<MfaEnabledDto> EnableAsync(int userId, string code)
        {
            var user = await GetUserAsync(userId);

            if (user.MfaEnabled)
                throw new InvalidOperationException("La verificación en dos pasos ya está activada.");

            if (string.IsNullOrEmpty(user.MfaSecretProtected))
                throw new InvalidOperationException("Primero generá el código QR.");

            var secret = _protector.Unprotect(user.MfaSecretProtected);

            if (!Totp.TryVerify(secret, code, DateTimeOffset.UtcNow, out var step))
                throw new InvalidOperationException("El código no es correcto. Revisá la hora de tu teléfono e intentá de nuevo.");

            var plainCodes = Enumerable.Range(0, RecoveryCodeCount).Select(_ => NewRecoveryCode()).ToList();

            user.MfaEnabled = true;
            user.MfaLastStep = step;
            user.MfaRecoveryCodes = JsonSerializer.Serialize(
                plainCodes.Select(c => BCrypt.Net.BCrypt.HashPassword(Normalize(c))).ToList());

            await _context.SaveChangesAsync();

            return new MfaEnabledDto { RecoveryCodes = plainCodes };
        }

        public async Task DisableAsync(int userId, string password, string code)
        {
            var user = await GetUserAsync(userId);

            if (!user.MfaEnabled)
                return;

            if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
                throw new InvalidOperationException("La contraseña no es correcta.");

            if (!TryConsumeCode(user, code))
                throw new InvalidOperationException("El código no es correcto.");

            user.MfaEnabled = false;
            user.MfaSecretProtected = null;
            user.MfaRecoveryCodes = null;
            user.MfaLastStep = 0;

            await _context.SaveChangesAsync();
        }

        // Valida un código TOTP o uno de recuperación. Modifica el usuario
        // (paso usado / código quemado); quien llama guarda los cambios.
        public bool TryConsumeCode(User user, string code)
        {
            if (!user.MfaEnabled || string.IsNullOrEmpty(user.MfaSecretProtected))
                return false;

            var digits = new string(code.Where(char.IsDigit).ToArray());

            if (digits.Length == 6 && code.Count(char.IsLetter) == 0)
            {
                var secret = _protector.Unprotect(user.MfaSecretProtected);

                if (!Totp.TryVerify(secret, digits, DateTimeOffset.UtcNow, out var step))
                    return false;

                // Un mismo código no se puede reutilizar.
                if (step <= user.MfaLastStep)
                    return false;

                user.MfaLastStep = step;
                return true;
            }

            var normalized = Normalize(code);
            var hashes = ReadHashes(user);

            var match = hashes.FirstOrDefault(h => BCrypt.Net.BCrypt.Verify(normalized, h));
            if (match is null)
                return false;

            hashes.Remove(match);
            user.MfaRecoveryCodes = JsonSerializer.Serialize(hashes);
            return true;
        }

        private static List<string> ReadHashes(User user) =>
            string.IsNullOrEmpty(user.MfaRecoveryCodes)
                ? new List<string>()
                : JsonSerializer.Deserialize<List<string>>(user.MfaRecoveryCodes) ?? new List<string>();

        private static string Normalize(string code) =>
            new string(code.Where(char.IsLetterOrDigit).ToArray()).ToUpperInvariant();

        private static string NewRecoveryCode()
        {
            var chars = RandomNumberGenerator.GetBytes(8).Select(b => CodeAlphabet[b % CodeAlphabet.Length]).ToArray();
            return new string(chars, 0, 4) + "-" + new string(chars, 4, 4);
        }
    }
}
