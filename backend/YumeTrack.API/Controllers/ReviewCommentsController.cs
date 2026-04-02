using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using YumeTrack.Domain.Entities;
using YumeTrack.Infrastructure.Persistence;

[ApiController]
[Route("api/reviews/{userTitleId}/comments")]
public class ReviewCommentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReviewCommentsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetComments(int userTitleId)
    {
        var comments = await _context.ReviewComments
            .Where(c => c.UserTitleId == userTitleId)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new ReviewCommentsDto
            {
                Id = c.Id,
                UserName = c.User.UserName,
                Content = c.Content,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();

        return Ok(comments);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create(int userTitleId, [FromBody] CreateReviewCommentsDto dto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        if (string.IsNullOrWhiteSpace(dto.Content))
            return BadRequest("Comentario vacío");

        // 🔥 Buscar la review
        var review = await _context.UserTitles
            .FirstOrDefaultAsync(ut => ut.Id == userTitleId);

        if (review == null)
            return NotFound();

        // 🔥 Crear comentario
        var comment = new ReviewComments
        {
            UserId = userId,
            UserTitleId = userTitleId,
            Content = dto.Content
        };

        _context.ReviewComments.Add(comment);

        // 🔥 Crear notificación (solo si no es tu propia review)
        if (review.UserId != userId)
        {
            var notification = new Notification
            {
                UserId = review.UserId,         // destinatario
                ActorUserId = userId,           // quien comentó
                Type = "review_comment",
                UserTitleId = userTitleId,      // 🔥 CLAVE
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);
        }

        await _context.SaveChangesAsync();

        return Ok();
    }

    [Authorize]
    [HttpDelete("{commentId}")]
    public async Task<IActionResult> Delete(int commentId)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var comment = await _context.ReviewComments.FindAsync(commentId);

        if (comment == null)
            return NotFound();

        if (comment.UserId != userId)
            return Forbid();

        _context.ReviewComments.Remove(comment);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}