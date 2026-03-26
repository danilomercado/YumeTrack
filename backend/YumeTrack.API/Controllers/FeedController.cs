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
        public async Task<IActionResult> GetGlobalFeed()
        {
            int? currentUserId = null;

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out var parsedUserId))
                currentUserId = parsedUserId;

            var items = await _context.UserTitles
                .Where(ut => ut.Notes != null && ut.Notes.Trim() != "")
                .Where(ut => ut.ReviewUpdatedAt != null)
                .OrderByDescending(ut => ut.ReviewUpdatedAt)
                .Take(20)
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

            return Ok(items);
        }

        [Authorize]
        [HttpGet("following")]
        public async Task<IActionResult> GetFollowingFeed()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var followingIds = await _context.UserFollows
                .Where(f => f.FollowerId == userId)
                .Select(f => f.FollowingId)
                .ToListAsync();

            var items = await _context.UserTitles
                .Where(ut => followingIds.Contains(ut.UserId))
                .Where(ut => ut.Notes != null && ut.Notes.Trim() != "")
                .Where(ut => ut.ReviewUpdatedAt != null)
                .OrderByDescending(ut => ut.ReviewUpdatedAt)
                .Take(20)
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

            return Ok(items);
        }
    }
}