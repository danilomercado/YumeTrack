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

        // Usuarios bloqueados en cualquiera de los dos sentidos.
        private async Task<List<int>> BlockedIdsAsync(int? me)
        {
            if (!me.HasValue)
                return new List<int>();

            return await _context.UserBlocks
                .Where(b => b.BlockerId == me.Value || b.BlockedId == me.Value)
                .Select(b => b.BlockerId == me.Value ? b.BlockedId : b.BlockerId)
                .ToListAsync();
        }

        [HttpGet("global")]
        public async Task<IActionResult> GetGlobalFeed([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            int? currentUserId = null;

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out var parsedUserId))
                currentUserId = parsedUserId;

            var blockedIds = await BlockedIdsAsync(currentUserId);

            var query = _context.UserTitles
                .Where(ut => ut.Notes != null && ut.Notes.Trim() != "")
                .Where(ut => ut.ReviewUpdatedAt != null)
                .Where(ut => !blockedIds.Contains(ut.UserId));

            var items = await query
                .OrderByDescending(ut => ut.ReviewUpdatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize + 1)
                .Select(ut => new FeedItemDto
                {
                    UserTitleId = ut.Id,
                    UserId = ut.UserId,
                    UserName = ut.User.UserName,
                    AvatarUrl = ut.User.AvatarUrl,
                    CanonicalTitle = ut.Title.CanonicalTitle,
                    PosterImageUrl = ut.Title.PosterImageUrl,
                    MediaType = ut.Title.MediaType,
                    Score = ut.Score,
                    Review = ut.Notes,
                    ReviewUpdatedAt = ut.ReviewUpdatedAt!.Value,
                    LikesCount = ut.ReviewLikes.Count(),
                    CommentsCount = ut.Comments.Count(),
                    IsLikedByCurrentUser = currentUserId.HasValue &&
                        ut.ReviewLikes.Any(rl => rl.UserId == currentUserId.Value),
                    IsFollowingAuthor = currentUserId.HasValue &&
                        _context.UserFollows.Any(f => f.FollowerId == currentUserId.Value && f.FollowingId == ut.UserId)
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

            var blockedIds = await BlockedIdsAsync(userId);

            var query = _context.UserTitles
                .Where(ut => followingIds.Contains(ut.UserId))
                .Where(ut => !blockedIds.Contains(ut.UserId))
                .Where(ut => ut.Notes != null && ut.Notes.Trim() != "")
                .Where(ut => ut.ReviewUpdatedAt != null);

            var items = await query
                .OrderByDescending(ut => ut.ReviewUpdatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize + 1)
                .Select(ut => new FeedItemDto
                {
                    UserTitleId = ut.Id,
                    UserId = ut.UserId,
                    UserName = ut.User.UserName,
                    AvatarUrl = ut.User.AvatarUrl,
                    CanonicalTitle = ut.Title.CanonicalTitle,
                    PosterImageUrl = ut.Title.PosterImageUrl,
                    MediaType = ut.Title.MediaType,
                    Score = ut.Score,
                    Review = ut.Notes,
                    ReviewUpdatedAt = ut.ReviewUpdatedAt!.Value,
                    LikesCount = ut.ReviewLikes.Count(),
                    CommentsCount = ut.Comments.Count(),
                    IsLikedByCurrentUser = ut.ReviewLikes.Any(rl => rl.UserId == userId),
                    IsFollowingAuthor = true
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

        [HttpGet("title/{externalId}")]
        public async Task<IActionResult> GetTitleReviews(string externalId, [FromQuery] string mediaType = "anime")
        {
            int? currentUserId = null;

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out var parsedUserId))
                currentUserId = parsedUserId;

            var kind = mediaType.Trim().ToLower();

            var items = await _context.UserTitles
                .Where(ut => ut.Title.ExternalId == externalId && ut.Title.MediaType.ToLower() == kind)
                .Where(ut => ut.Notes != null && ut.Notes.Trim() != "")
                .Where(ut => ut.ReviewUpdatedAt != null)
                .OrderByDescending(ut => ut.ReviewLikes.Count())
                .ThenByDescending(ut => ut.ReviewUpdatedAt)
                .Take(5)
                .Select(ut => new FeedItemDto
                {
                    UserTitleId = ut.Id,
                    UserId = ut.UserId,
                    UserName = ut.User.UserName,
                    AvatarUrl = ut.User.AvatarUrl,
                    CanonicalTitle = ut.Title.CanonicalTitle,
                    PosterImageUrl = ut.Title.PosterImageUrl,
                    MediaType = ut.Title.MediaType,
                    Score = ut.Score,
                    Review = ut.Notes,
                    ReviewUpdatedAt = ut.ReviewUpdatedAt!.Value,
                    LikesCount = ut.ReviewLikes.Count(),
                    CommentsCount = ut.Comments.Count(),
                    IsLikedByCurrentUser = currentUserId.HasValue &&
                        ut.ReviewLikes.Any(rl => rl.UserId == currentUserId.Value),
                    IsFollowingAuthor = currentUserId.HasValue &&
                        _context.UserFollows.Any(f => f.FollowerId == currentUserId.Value && f.FollowingId == ut.UserId)
                })
                .ToListAsync();

            return Ok(items);
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
                    AvatarUrl = ut.User.AvatarUrl,

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