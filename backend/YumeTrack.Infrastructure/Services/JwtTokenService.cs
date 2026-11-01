using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using YumeTrack.Application.Interfaces;
using YumeTrack.Domain.Entities;

namespace YumeTrack.Infrastructure.Services
{
    public class JwtTokenService : IJwtTokenService
    {
        private readonly IConfiguration _configuration;

        public JwtTokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        
        public string GenerateToken(User user)
        {
            var key = _configuration["JwtSettings:Key"]
                      ?? throw new InvalidOperationException("JWT Key is not configured");
            var issuer = _configuration["JwtSettings:Issuer"];
            var audience = _configuration["JwtSettings:Audience"];
            var expiresInMinutes = int.Parse(_configuration["JwtSettings:ExpiresInMinutes"] ?? "60");

            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new(JwtRegisteredClaimNames.Email, user.Email),
                new(ClaimTypes.Name, user.UserName),
                new(ClaimTypes.NameIdentifier, user.Id.ToString())
            };

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                    issuer: issuer, 
                    audience: audience,
                    claims: claims,
                    expires: DateTime.UtcNow.AddMinutes(expiresInMinutes),
                    signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string MfaAudience => $"{_configuration["JwtSettings:Audience"]}:mfa";

        // Vale 5 minutos y tiene otra audiencia, así que la API no lo acepta
        // como sesión: solo sirve para terminar el login con el código MFA.
        public string GenerateMfaToken(User user)
        {
            var key = _configuration["JwtSettings:Key"]
                      ?? throw new InvalidOperationException("JWT Key is not configured");

            var credentials = new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
                SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["JwtSettings:Issuer"],
                audience: MfaAudience,
                claims: new[] { new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()) },
                expires: DateTime.UtcNow.AddMinutes(5),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public int? ValidateMfaToken(string token)
        {
            var key = _configuration["JwtSettings:Key"];
            if (string.IsNullOrWhiteSpace(key))
                return null;

            try
            {
                var principal = new JwtSecurityTokenHandler().ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = _configuration["JwtSettings:Issuer"],
                    ValidateAudience = true,
                    ValidAudience = MfaAudience,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                }, out _);

                var sub = principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                          ?? principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                return int.TryParse(sub, out var id) ? id : null;
            }
            catch
            {
                return null;
            }
        }
    }
}
