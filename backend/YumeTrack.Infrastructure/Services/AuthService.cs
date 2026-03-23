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

        public AuthService(AppDbContext context, IJwtTokenService jwtTokenService)
        {
            _context = context;
            _jwtTokenService = jwtTokenService;
        }
        private static string NormalizeUserName(string userName)
        {
            return userName.Trim().ToLowerInvariant();
        }


        public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
        {
            var userName = request.UserName.Trim();
            var normalizedUserName = NormalizeUserName(userName);

            if (string.IsNullOrWhiteSpace(userName))
                throw new Exception("El nombre de usuario es obligatorio.");

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

            var emailExists = await _context.Users
                .AnyAsync(u => u.Email == request.Email);

            if (emailExists)
                throw new Exception("El email ya está registrado.");

            var user = new User
            {
                UserName = userName,
                NormalizedUserName = normalizedUserName,
                Email = request.Email.Trim(),
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
                Email = user.Email
            };
        }



        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
        {
            var normalizedEmail = request.Email.Trim().ToLower();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);
            if (user is null)
                throw new Exception("Credenciales invalidas.");

            var passwordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            if (!passwordValid)
                throw new Exception("Credenciales invalidas.");

            var token = _jwtTokenService.GenerateToken(user);

            return new AuthResponseDto
            {
                Token = token,
                UserName = user.UserName,
                Email = user.Email
            };
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
