using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YumeTrack.Application.DTOs.Feed;
using YumeTrack.Infrastructure.Persistence;

namespace YumeTrack.API.Controllers
{
    [ApiController]
    [Route("api/feed")]
    public class FeedController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FeedController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("global")]
        public async Task<IActionResult> GetGlobalFeed([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            int? currentUserId = null;

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out var parsedUserId))
                currentUserId = parsedUserId;

            var query = _context.UserTitles
                .Where(ut => ut.Notes != null && ut.Notes.Trim() != "")
                .Where(ut => ut.ReviewUpdatedAt != null);

            var items = await query
                .OrderByDescending(ut => ut.ReviewUpdatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize + 1)
                .Select(ut => new FeedItemDto
                {
                    UserTitleId = ut.Id,
                    UserName = ut.User.UserName,
                    CanonicalTitle = ut.Title.CanonicalTitle,
                    PosterImageUrl = ut.Title.PosterImageUrl,
                    MediaType = ut.Title.MediaType,
                    Score = ut.Score,
                    Review = ut.Notes,
                    ReviewUpdatedAt = ut.ReviewUpdatedAt!.Value,
                    LikesCount = ut.ReviewLikes.Count(),
                    IsLikedByCurrentUser = currentUserId.HasValue &&
                        ut.ReviewLikes.Any(rl => rl.UserId == currentUserId.Value)
                })
                .ToListAsync();

            var hasMore = items.Count > pageSize;

            if (hasMore)
                items = items.Take(pageSize).ToList();

            return Ok(new
            {
                items,
                hasMore
            });
        }

        [Authorize]
        [HttpGet("following")]
        public async Task<IActionResult> GetFollowingFeed([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var followingIds = await _context.UserFollows
                .Where(f => f.FollowerId == userId)
                .Select(f => f.FollowingId)
                .ToListAsync();

            var query = _context.UserTitles
                .Where(ut => followingIds.Contains(ut.UserId))
                .Where(ut => ut.Notes != null && ut.Notes.Trim() != "")
                .Where(ut => ut.ReviewUpdatedAt != null);

            var items = await query
                .OrderByDescending(ut => ut.ReviewUpdatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize + 1)
                .Select(ut => new FeedItemDto
                {
                    UserTitleId = ut.Id,
                    UserName = ut.User.UserName,
                    CanonicalTitle = ut.Title.CanonicalTitle,
                    PosterImageUrl = ut.Title.PosterImageUrl,
                    MediaType = ut.Title.MediaType,
                    Score = ut.Score,
                    Review = ut.Notes,
                    ReviewUpdatedAt = ut.ReviewUpdatedAt!.Value,
                    LikesCount = ut.ReviewLikes.Count(),
                    IsLikedByCurrentUser = ut.ReviewLikes.Any(rl => rl.UserId == userId)
                })
                .ToListAsync();

            var hasMore = items.Count > pageSize;

            if (hasMore)
                items = items.Take(pageSize).ToList();

            return Ok(new
            {
                items,
                hasMore
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetReviewDetail(int id)
        {
            int? currentUserId = null;

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out var parsedUserId))
                currentUserId = parsedUserId;

            var review = await _context.UserTitles
                .Where(ut => ut.Id == id)
                .Where(ut => ut.Notes != null && ut.Notes.Trim() != "")
                .Select(ut => new ReviewDetailDto
                {
                    UserTitleId = ut.Id,
                    UserId = ut.UserId,
                    UserName = ut.User.UserName,

                    TitleId = ut.TitleId,
                    CanonicalTitle = ut.Title.CanonicalTitle,
                    PosterImageUrl = ut.Title.PosterImageUrl,
                    MediaType = ut.Title.MediaType,

                    Score = ut.Score,
                    Review = ut.Notes!,
                    ReviewUpdatedAt = ut.ReviewUpdatedAt!.Value,

                    LikesCount = ut.ReviewLikes.Count(),
                    IsLikedByCurrentUser = currentUserId.HasValue &&
                        ut.ReviewLikes.Any(rl => rl.UserId == currentUserId.Value)
                })
                .FirstOrDefaultAsync();

            if (review == null)
                return NotFound();

            return Ok(review);
        }
    }
}