using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using YumeTrack.Domain.Entities;
using YumeTrack.Infrastructure.Persistence;
using YumeTrack.Infrastructure.Services;

namespace YumeTrack.API.Controllers;

// Hilos por episodio (anime) o capítulo (manga).
[ApiController]
[Route("api/episodes")]
[EnableRateLimiting("social")]
public class EpisodesController : ControllerBase
{
    private const int MaxEpisode = 5000;
    private const int PageSize = 50;

    private readonly AppDbContext _context;
    private readonly TitleResolver _titles;

    public EpisodesController(AppDbContext context, TitleResolver titles)
    {
        _context = context;
        _titles = titles;
    }

    private int? CurrentUserId =>
        int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : null;

    [HttpGet("{kitsuId:int}/{episode:int}")]
    public async Task<IActionResult> List(int kitsuId, int episode, [FromQuery] string mediaType = "anime")
    {
        if (episode < 1 || episode > MaxEpisode)
            return BadRequest(new { message = "Episodio inválido." });

        var title = await _titles.FindAsync(kitsuId, mediaType);

        // Si nadie comentó todavía, el título ni siquiera está en la base.
        if (title is null)
            return Ok(new List<object>());

        var me = CurrentUserId;
        var blocked = new List<int>();

        if (me.HasValue)
        {
            blocked = await _context.UserBlocks
                .Where(b => b.BlockerId == me.Value || b.BlockedId == me.Value)
                .Select(b => b.BlockerId == me.Value ? b.BlockedId : b.BlockerId)
                .ToListAsync();
        }

        var comments = await _context.EpisodeComments
            .Where(c => c.TitleId == title.Id && c.Episode == episode)
            .Where(c => !blocked.Contains(c.UserId))
            .OrderByDescending(c => c.CreatedAt)
            .Take(PageSize)
            .Select(c => new
            {
                c.Id,
                c.UserId,
                UserName = c.User.UserName,
                AvatarUrl = c.User.AvatarUrl,
                c.Content,
                c.CreatedAt
            })
            .ToListAsync();

        return Ok(comments);
    }

    [Authorize]
    [HttpPost("{kitsuId:int}/{episode:int}")]
    public async Task<IActionResult> Create(
        int kitsuId,
        int episode,
        [FromBody] EpisodeCommentInputDto dto,
        [FromQuery] string mediaType = "anime")
    {
        var me = CurrentUserId ?? throw new UnauthorizedAccessException("Token inválido.");

        if (string.IsNullOrWhiteSpace(dto.Content))
            return BadRequest(new { message = "El comentario está vacío." });

        Title title;
        try
        {
            title = await _titles.GetOrCreateAsync(kitsuId, mediaType);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }

        var max = title.EpisodeCount ?? title.ChapterCount ?? MaxEpisode;

        if (episode < 1 || episode > Math.Max(max, 1))
            return BadRequest(new { message = "Ese episodio no existe." });

        _context.EpisodeComments.Add(new EpisodeComment
        {
            UserId = me,
            TitleId = title.Id,
            Episode = episode,
            Content = dto.Content.Trim()
        });

        await _context.SaveChangesAsync();

        return Ok();
    }

    [Authorize]
    [HttpDelete("comments/{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var me = CurrentUserId ?? throw new UnauthorizedAccessException("Token inválido.");

        var comment = await _context.EpisodeComments.FindAsync(id);

        if (comment is null)
            return NotFound();

        if (comment.UserId != me)
            return Forbid();

        _context.EpisodeComments.Remove(comment);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public class EpisodeCommentInputDto
{
    [Required, MaxLength(1000)]
    public string Content { get; set; } = string.Empty;
}
