using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YumeTrack.Domain.Entities;
using YumeTrack.Infrastructure.Persistence;

namespace YumeTrack.API.Controllers
{
    [ApiController]
    [Route("api/review-likes")]
    [Authorize]
    public class ReviewLikesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReviewLikesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("{userTitleId:int}")]
        public async Task<IActionResult> ToggleLike(int userTitleId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var userTitle = await _context.UserTitles
                .FirstOrDefaultAsync(x => x.Id == userTitleId);

            if (userTitle == null)
                return NotFound("La review no existe.");

            if (string.IsNullOrWhiteSpace(userTitle.Notes))
                return BadRequest("No se puede dar like a una review vacía.");

            var existingLike = await _context.ReviewLikes
                .FirstOrDefaultAsync(x => x.UserId == userId && x.UserTitleId == userTitleId);

            if (existingLike != null)
            {
                _context.ReviewLikes.Remove(existingLike);
                await _context.SaveChangesAsync();

                return Ok(new { liked = false });
            }

            var like = new ReviewLike
            {
                UserId = userId,
                UserTitleId = userTitleId
            };

            _context.ReviewLikes.Add(like);

            // Avisar al dueño de la reseña; dar y quitar el like varias veces no repite el aviso.
            if (userTitle.UserId != userId)
            {
                var blocked = await _context.UserBlocks.AnyAsync(b =>
                    (b.BlockerId == userId && b.BlockedId == userTitle.UserId) ||
                    (b.BlockerId == userTitle.UserId && b.BlockedId == userId));

                var alreadyNotified = await _context.Notifications.AnyAsync(n =>
                    n.UserId == userTitle.UserId &&
                    n.ActorUserId == userId &&
                    n.Type == "review_like" &&
                    n.UserTitleId == userTitleId);

                if (!blocked && !alreadyNotified)
                {
                    _context.Notifications.Add(new Notification
                    {
                        UserId = userTitle.UserId,
                        ActorUserId = userId,
                        Type = "review_like",
                        UserTitleId = userTitleId
                    });
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { liked = true });
        }
    }
}