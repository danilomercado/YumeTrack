using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using YumeTrack.Domain.Entities;
using YumeTrack.Infrastructure.Persistence;

[ApiController]
[Route("api/reviews/{userTitleId}/comments")]
public class ReviewCommentsController : ControllerBase
{
    private static readonly string[] ReactionKeys = { "like", "laugh", "wow", "sad", "fire" };

    private readonly AppDbContext _context;

    public ReviewCommentsController(AppDbContext context)
    {
        _context = context;
    }

    private int? CurrentUserId =>
        int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : null;

    [HttpGet]
    public async Task<IActionResult> GetComments(int userTitleId)
    {
        var me = CurrentUserId;
        var blocked = new List<int>();

        if (me.HasValue)
        {
            blocked = await _context.UserBlocks
                .Where(b => b.BlockerId == me.Value || b.BlockedId == me.Value)
                .Select(b => b.BlockerId == me.Value ? b.BlockedId : b.BlockerId)
                .ToListAsync();
        }

        var rows = await _context.ReviewComments
            .Where(c => c.UserTitleId == userTitleId)
            .Where(c => !blocked.Contains(c.UserId))
            .OrderBy(c => c.CreatedAt)
            .Select(c => new
            {
                c.Id,
                c.UserId,
                UserName = c.User.UserName,
                c.Content,
                c.CreatedAt,
                c.ParentCommentId,
                Reactions = c.Reactions.Select(r => new { r.Key, r.UserId }).ToList()
            })
            .ToListAsync();

        var comments = rows.Select(c => new ReviewCommentsDto
        {
            Id = c.Id,
            UserId = c.UserId,
            UserName = c.UserName,
            Content = c.Content,
            CreatedAt = c.CreatedAt,
            ParentCommentId = c.ParentCommentId,
            Reactions = c.Reactions
                .GroupBy(r => r.Key)
                .Select(g => new ReactionCountDto { Key = g.Key, Count = g.Count() })
                .ToList(),
            MyReaction = me.HasValue ? c.Reactions.FirstOrDefault(r => r.UserId == me.Value)?.Key : null
        }).ToList();

        return Ok(comments);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create(int userTitleId, [FromBody] CreateReviewCommentsDto dto)
    {
        var userId = CurrentUserId ?? throw new UnauthorizedAccessException("Token inválido.");

        if (string.IsNullOrWhiteSpace(dto.Content))
            return BadRequest("Comentario vacío");

        var review = await _context.UserTitles.FirstOrDefaultAsync(ut => ut.Id == userTitleId);

        if (review == null)
            return NotFound();

        ReviewComments? parent = null;
        ReviewComments? replyTarget = null;

        if (dto.ParentCommentId.HasValue)
        {
            parent = await _context.ReviewComments
                .FirstOrDefaultAsync(c => c.Id == dto.ParentCommentId.Value && c.UserTitleId == userTitleId);

            if (parent == null)
                return BadRequest("El comentario al que respondés ya no existe.");

            replyTarget = parent;

            // Solo un nivel: responder a una respuesta cuelga del comentario original.
            if (parent.ParentCommentId.HasValue)
            {
                parent = await _context.ReviewComments
                    .FirstOrDefaultAsync(c => c.Id == parent.ParentCommentId.Value) ?? parent;
            }
        }

        var comment = new ReviewComments
        {
            UserId = userId,
            UserTitleId = userTitleId,
            ParentCommentId = parent?.Id,
            Content = dto.Content.Trim()
        };

        _context.ReviewComments.Add(comment);

        // Avisar al dueño de la reseña (si no es uno mismo)...
        if (review.UserId != userId)
        {
            _context.Notifications.Add(new Notification
            {
                UserId = review.UserId,
                ActorUserId = userId,
                Type = "review_comment",
                UserTitleId = userTitleId,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });
        }

        // ...y a quien recibe la respuesta.
        if (replyTarget != null && replyTarget.UserId != userId && replyTarget.UserId != review.UserId)
        {
            _context.Notifications.Add(new Notification
            {
                UserId = replyTarget.UserId,
                ActorUserId = userId,
                Type = "comment_reply",
                UserTitleId = userTitleId,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync();

        return Ok();
    }

    // Una reacción por persona: repetir la misma la quita, otra distinta la cambia.
    [Authorize]
    [HttpPut("{commentId:int}/reaction")]
    public async Task<IActionResult> React(int userTitleId, int commentId, [FromBody] ReactionRequestDto dto)
    {
        var userId = CurrentUserId ?? throw new UnauthorizedAccessException("Token inválido.");
        var key = dto.Key.Trim().ToLowerInvariant();

        if (!ReactionKeys.Contains(key))
            return BadRequest("Reacción inválida.");

        var exists = await _context.ReviewComments.AnyAsync(c => c.Id == commentId && c.UserTitleId == userTitleId);

        if (!exists)
            return NotFound();

        var current = await _context.CommentReactions
            .FirstOrDefaultAsync(r => r.CommentId == commentId && r.UserId == userId);

        string? mine = key;

        if (current == null)
        {
            _context.CommentReactions.Add(new CommentReaction { CommentId = commentId, UserId = userId, Key = key });
        }
        else if (current.Key == key)
        {
            _context.CommentReactions.Remove(current);
            mine = null;
        }
        else
        {
            current.Key = key;
        }

        await _context.SaveChangesAsync();

        return Ok(new { myReaction = mine });
    }

    [Authorize]
    [HttpDelete("{commentId}")]
    public async Task<IActionResult> Delete(int commentId)
    {
        var userId = CurrentUserId ?? throw new UnauthorizedAccessException("Token inválido.");

        var comment = await _context.ReviewComments.FindAsync(commentId);

        if (comment == null)
            return NotFound();

        if (comment.UserId != userId)
            return Forbid();

        // Borrar un comentario se lleva sus respuestas.
        var replies = await _context.ReviewComments.Where(c => c.ParentCommentId == commentId).ToListAsync();
        _context.ReviewComments.RemoveRange(replies);
        _context.ReviewComments.Remove(comment);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public class ReactionRequestDto
{
    [Required]
    public string Key { get; set; } = string.Empty;
}
