using System;
using System.Collections.Generic;
using System.Text;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using YumeTrack.Application.Common;
using YumeTrack.Application.DTOs.Auth;
using YumeTrack.Application.Interfaces;
using YumeTrack.Domain.Entities;
using YumeTrack.Infrastructure.Persistence;

namespace YumeTrack.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IJwtTokenService _jwtTokenService;
        private readonly MfaService? _mfa;

        private const int MaxFailedLogins = 5;
        private static readonly TimeSpan LockoutDuration = TimeSpan.FromMinutes(15);

        // Hash de relleno: si el correo no existe se verifica igual, así el
        // tiempo de respuesta no delata qué cuentas existen.
        private static readonly string DummyHash = BCrypt.Net.BCrypt.HashPassword("yumetrack-dummy-password");

        public AuthService(AppDbContext context, IJwtTokenService jwtTokenService, MfaService? mfa = null)
        {
            _context = context;
            _jwtTokenService = jwtTokenService;
            _mfa = mfa;
        }
        private static string NormalizeUserName(string userName)
        {
            return userName.Trim().ToLowerInvariant();
        }

        private static string NormalizeEmail(string email)
        {
            return email.Trim().ToLowerInvariant();
        }


        public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
        {
            var userName = request.UserName.Trim();
            var normalizedUserName = NormalizeUserName(userName);

            if (string.IsNullOrWhiteSpace(userName))
                throw new InvalidOperationException("El nombre de usuario es obligatorio.");

            var userNameExists = await _context.Users
                .AnyAsync(u => u.NormalizedUserName == normalizedUserName);

            if (userNameExists)
            {
                var suggestions = await GenerateUsernameSuggestionsAsync(userName);

                throw new UsernameAlreadyTakenException(
                    "Ese nombre de usuario ya está en uso.",
                    suggestions
                );
            }

            PasswordPolicy.Validate(request.Password);

            var normalizedEmail = NormalizeEmail(request.Email);

            var emailExists = await _context.Users
                .AnyAsync(u => u.Email.ToLower() == normalizedEmail);

            if (emailExists)
                throw new InvalidOperationException("El email ya está registrado.");

            var user = new User
            {
                UserName = userName,
                NormalizedUserName = normalizedUserName,
                Email = normalizedEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var token = _jwtTokenService.GenerateToken(user);

            return new AuthResponseDto
            {
                Token = token,
                UserName = user.UserName,
                Email = user.Email,
                IsAdmin = _jwtTokenService.IsAdmin(user)
            };
        }



        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
        {
            var normalizedEmail = NormalizeEmail(request.Email);

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

            if (user is null)
            {
                BCrypt.Net.BCrypt.Verify(request.Password, DummyHash);
                throw new InvalidOperationException("Credenciales invalidas.");
            }

            EnsureNotLocked(user);

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                await RegisterFailureAsync(user);
                throw new InvalidOperationException("Credenciales invalidas.");
            }

            // Con MFA activo la contraseña sola no alcanza: se pide el código.
            if (user.MfaEnabled)
            {
                return new AuthResponseDto
                {
                    MfaRequired = true,
                    MfaToken = _jwtTokenService.GenerateMfaToken(user)
                };
            }

            await ResetFailuresAsync(user);

            return BuildSession(user);
        }

        public async Task<AuthResponseDto> LoginWithMfaAsync(MfaLoginRequestDto request)
        {
            var userId = _jwtTokenService.ValidateMfaToken(request.MfaToken)
                         ?? throw new InvalidOperationException("La verificación venció. Ingresá de nuevo.");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId)
                       ?? throw new InvalidOperationException("La verificación venció. Ingresá de nuevo.");

            EnsureNotLocked(user);

            if (_mfa is null || !_mfa.TryConsumeCode(user, request.Code))
            {
                await RegisterFailureAsync(user);
                throw new InvalidOperationException("El código no es correcto.");
            }

            await ResetFailuresAsync(user);

            return BuildSession(user);
        }

        private AuthResponseDto BuildSession(User user) => new()
        {
            Token = _jwtTokenService.GenerateToken(user),
            UserName = user.UserName,
            Email = user.Email,
            IsAdmin = _jwtTokenService.IsAdmin(user)
        };

        private static void EnsureNotLocked(User user)
        {
            if (user.LockoutUntil.HasValue && user.LockoutUntil.Value > DateTime.UtcNow)
                throw new InvalidOperationException("Demasiados intentos. Probá de nuevo en unos minutos.");
        }

        private async Task RegisterFailureAsync(User user)
        {
            user.FailedLoginCount++;

            if (user.FailedLoginCount >= MaxFailedLogins)
            {
                user.LockoutUntil = DateTime.UtcNow.Add(LockoutDuration);
                user.FailedLoginCount = 0;
            }

            await _context.SaveChangesAsync();
        }

        private async Task ResetFailuresAsync(User user)
        {
            user.FailedLoginCount = 0;
            user.LockoutUntil = null;
            await _context.SaveChangesAsync();
        }

        private async Task<List<string>> GenerateUsernameSuggestionsAsync(string baseUserName)
        {
            var cleanBase = new string(baseUserName
                .Trim()
                .Where(c => char.IsLetterOrDigit(c) || c == '_' || c == '.')
                .ToArray());

            if (string.IsNullOrWhiteSpace(cleanBase))
                cleanBase = "user";

            var candidates = new List<string>
    {
        $"{cleanBase}123",
        $"{cleanBase}_ok",
        $"{cleanBase}.anime",
        $"{cleanBase}_track",
        $"{cleanBase}{Random.Shared.Next(10, 99)}",
        $"{cleanBase}{Random.Shared.Next(100, 999)}"
    };

            var available = new List<string>();

            foreach (var candidate in candidates.Distinct())
            {
                var normalized = NormalizeUserName(candidate);

                var exists = await _context.Users
                    .AnyAsync(u => u.NormalizedUserName == normalized);

                if (!exists)
                    available.Add(candidate);

                if (available.Count == 4)
                    break;
            }

            if (available.Count == 0)
            {
                for (int i = 0; i < 20 && available.Count < 4; i++)
                {
                    var candidate = $"{cleanBase}{Random.Shared.Next(1000, 9999)}";
                    var normalized = NormalizeUserName(candidate);

                    var exists = await _context.Users
                        .AnyAsync(u => u.NormalizedUserName == normalized);

                    if (!exists && !available.Contains(candidate))
                        available.Add(candidate);
                }
            }

            return available;
        }
    }
}
