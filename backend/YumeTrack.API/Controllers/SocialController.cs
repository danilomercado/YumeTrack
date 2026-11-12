using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using YumeTrack.Application.DTOs.Social;
using YumeTrack.Domain.Entities;
using YumeTrack.Domain.Enums;
using YumeTrack.Infrastructure.Persistence;

namespace YumeTrack.API.Controllers;

[ApiController]
[Route("api/social")]
[EnableRateLimiting("social")]
public class SocialController : ControllerBase
{
    private static readonly string[] TargetTypes = { "review", "comment", "user" };
    private static readonly string[] Reasons = { "spam", "acoso", "inapropiado", "spoilers", "otro" };

    private readonly AppDbContext _context;

    public SocialController(AppDbContext context)
    {
        _context = context;
    }

    private int? CurrentUserId =>
        int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : null;

    private int RequireUserId() => CurrentUserId ?? throw new UnauthorizedAccessException("Token inválido.");

    // ---------- Bloqueos ----------

    [Authorize]
    [HttpGet("blocks")]
    public async Task<IActionResult> GetBlocks()
    {
        var me = RequireUserId();

        var blocked = await _context.UserBlocks
            .Where(b => b.BlockerId == me)
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new BlockedUserDto { Id = b.BlockedId, UserName = b.Blocked.UserName })
            .ToListAsync();

        return Ok(blocked);
    }

    [Authorize]
    [HttpPost("blocks/{userId:int}")]
    public async Task<IActionResult> Block(int userId)
    {
        var me = RequireUserId();

        if (userId == me)
            return BadRequest(new { message = "No podés bloquearte a vos mismo." });

        if (!await _context.Users.AnyAsync(u => u.Id == userId))
            return NotFound();

        var alreadyBlocked = await _context.UserBlocks.AnyAsync(b => b.BlockerId == me && b.BlockedId == userId);

        if (!alreadyBlocked)
        {
            _context.UserBlocks.Add(new UserBlock { BlockerId = me, BlockedId = userId });

            // Bloquear corta el seguimiento en los dos sentidos.
            var follows = await _context.UserFollows
                .Where(f => (f.FollowerId == me && f.FollowingId == userId) ||
                            (f.FollowerId == userId && f.FollowingId == me))
                .ToListAsync();

            _context.UserFollows.RemoveRange(follows);
            await _context.SaveChangesAsync();
        }

        return Ok(new { message = "Usuario bloqueado." });
    }

    [Authorize]
    [HttpDelete("blocks/{userId:int}")]
    public async Task<IActionResult> Unblock(int userId)
    {
        var me = RequireUserId();

        var block = await _context.UserBlocks.FirstOrDefaultAsync(b => b.BlockerId == me && b.BlockedId == userId);

        if (block is not null)
        {
            _context.UserBlocks.Remove(block);
            await _context.SaveChangesAsync();
        }

        return Ok(new { message = "Usuario desbloqueado." });
    }

    // ---------- Denuncias ----------

    [Authorize]
    [HttpPost("reports")]
    public async Task<IActionResult> Report([FromBody] CreateReportDto dto)
    {
        var me = RequireUserId();
        var targetType = dto.TargetType.Trim().ToLowerInvariant();
        var reason = dto.Reason.Trim().ToLowerInvariant();

        if (!TargetTypes.Contains(targetType) || !Reasons.Contains(reason))
            return BadRequest(new { message = "Denuncia inválida." });

        var exists = targetType switch
        {
            "review" => await _context.UserTitles.AnyAsync(x => x.Id == dto.TargetId),
            "comment" => await _context.ReviewComments.AnyAsync(x => x.Id == dto.TargetId),
            _ => await _context.Users.AnyAsync(x => x.Id == dto.TargetId)
        };

        if (!exists)
            return NotFound(new { message = "El contenido ya no existe." });

        var already = await _context.ContentReports
            .AnyAsync(r => r.ReporterId == me && r.TargetType == targetType && r.TargetId == dto.TargetId);

        // Denunciar dos veces lo mismo no hace nada: se responde igual.
        if (!already)
        {
            _context.ContentReports.Add(new ContentReport
            {
                ReporterId = me,
                TargetType = targetType,
                TargetId = dto.TargetId,
                Reason = reason,
                Details = string.IsNullOrWhiteSpace(dto.Details) ? null : dto.Details.Trim()
            });

            await _context.SaveChangesAsync();
        }

        return Ok(new { message = "Gracias por avisarnos. Vamos a revisarlo." });
    }

    // ---------- Actividad ----------

    [Authorize]
    [HttpGet("activity")]
    public async Task<IActionResult> Activity([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var me = RequireUserId();
        pageSize = Math.Clamp(pageSize, 1, 50);
        page = Math.Max(page, 1);

        var following = await _context.UserFollows
            .Where(f => f.FollowerId == me)
            .Select(f => f.FollowingId)
            .ToListAsync();

        var blocked = await _context.UserBlocks
            .Where(b => b.BlockerId == me || b.BlockedId == me)
            .Select(b => b.BlockerId == me ? b.BlockedId : b.BlockerId)
            .ToListAsync();

        var items = await _context.ActivityEvents
            .Where(a => following.Contains(a.UserId) && !blocked.Contains(a.UserId))
            .OrderByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize + 1)
            .Select(a => new ActivityItemDto
            {
                Id = a.Id,
                UserId = a.UserId,
                UserName = a.User.UserName,
                Type = a.Type,
                TitleName = a.Title.CanonicalTitle,
                PosterImageUrl = a.Title.PosterImageUrl,
                MediaType = a.Title.MediaType,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync();

        var hasMore = items.Count > pageSize;

        return Ok(new { items = items.Take(pageSize).ToList(), hasMore });
    }

    // ---------- Sugerencias de a quién seguir ----------

    [Authorize]
    [HttpGet("suggestions")]
    public async Task<IActionResult> Suggestions()
    {
        var me = RequireUserId();

        var excluded = await _context.UserFollows
            .Where(f => f.FollowerId == me)
            .Select(f => f.FollowingId)
            .ToListAsync();

        var blocked = await _context.UserBlocks
            .Where(b => b.BlockerId == me || b.BlockedId == me)
            .Select(b => b.BlockerId == me ? b.BlockedId : b.BlockerId)
            .ToListAsync();

        excluded.AddRange(blocked);
        excluded.Add(me);

        var users = await _context.Users
            .Where(u => !excluded.Contains(u.Id))
            .Select(u => new SuggestedUserDto
            {
                Id = u.Id,
                UserName = u.UserName,
                AvatarUrl = u.AvatarUrl,
                FollowersCount = u.Followers.Count(),
                TitlesCount = u.UserTitles.Count()
            })
            .Where(u => u.TitlesCount > 0)
            .OrderByDescending(u => u.FollowersCount)
            .ThenByDescending(u => u.TitlesCount)
            .Take(6)
            .ToListAsync();

        return Ok(users);
    }

    // ---------- Estadísticas de un perfil ----------

    [HttpGet("stats/{username}")]
    public async Task<IActionResult> Stats(string username)
    {
        var normalized = username.Trim().ToLower();

        var userId = await _context.Users
            .Where(u => u.UserName.ToLower() == normalized)
            .Select(u => (int?)u.Id)
            .FirstOrDefaultAsync();

        if (userId is null)
            return NotFound();

        var rows = await _context.UserTitles
            .Where(ut => ut.UserId == userId)
            .Select(ut => new { ut.Status, ut.Score, MediaType = ut.Title.MediaType, HasReview = ut.Notes != null && ut.Notes != "" })
            .ToListAsync();

        var scores = rows.Where(r => r.Score.HasValue).Select(r => r.Score!.Value).ToList();

        return Ok(new ProfileStatsDto
        {
            Total = rows.Count,
            Planned = rows.Count(r => r.Status == UserTitleStatus.Planned),
            Watching = rows.Count(r => r.Status == UserTitleStatus.Watching),
            Completed = rows.Count(r => r.Status == UserTitleStatus.Completed),
            OnHold = rows.Count(r => r.Status == UserTitleStatus.OnHold),
            Dropped = rows.Count(r => r.Status == UserTitleStatus.Dropped),
            Anime = rows.Count(r => r.MediaType.ToLower() == "anime"),
            Manga = rows.Count(r => r.MediaType.ToLower() == "manga"),
            Reviews = rows.Count(r => r.HasReview),
            AverageScore = scores.Count > 0 ? Math.Round(scores.Average(), 1) : null
        });
    }
}
