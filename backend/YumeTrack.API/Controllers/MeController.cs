using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YumeTrack.Application.DTOs.Users;
using YumeTrack.Infrastructure.Persistence;

namespace YumeTrack.API.Controllers
{
    [ApiController]
    [Route("api/me")]
    [Authorize]
    public class MeController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MeController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out var userId))
                throw new UnauthorizedAccessException("Token inválido.");

            return userId;
        }

        [HttpGet]
        public async Task<IActionResult> GetMyProfile()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return NotFound();

            var followersCount = await _context.UserFollows
                .CountAsync(f => f.FollowingId == userId);

            var followingCount = await _context.UserFollows
                .CountAsync(f => f.FollowerId == userId);

            var dto = new MyProfileDto
            {
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email,
                Bio = user.Bio,
                CreatedAt = user.CreatedAt,
                FollowersCount = followersCount,
                FollowingCount = followingCount
            };

            return Ok(dto);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateMyProfileDto dto)
        {
            var userId = GetUserId();

            if (!string.IsNullOrWhiteSpace(dto.Bio) && dto.Bio.Trim().Length > 300)
                return BadRequest(new { message = "La biografía no puede superar los 300 caracteres." });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return NotFound(new { message = "Usuario no encontrado." });

            user.Bio = string.IsNullOrWhiteSpace(dto.Bio) ? null : dto.Bio.Trim();

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Perfil actualizado correctamente.",
                bio = user.Bio
            });
        }
    }
}