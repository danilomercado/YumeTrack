using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
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
            var items = await _context.UserTitles
                .Where(ut => ut.Notes != null && ut.Notes.Trim() != "")
                .Where(ut => ut.ReviewUpdatedAt != null)
                .Include(ut => ut.User)
                .Include(ut => ut.Title)
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
                    ReviewUpdatedAt = ut.ReviewUpdatedAt!.Value
                })
                .ToListAsync();
            return Ok(items);
        }

        [Authorize]
        [HttpGet("following")]
        public async Task<IActionResult> GetFollowingFeed()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var followingIds = await _context.UserFollows
                .Where(f => f.FollowerId == userId)
                .Select(f => f.FollowingId)
                .ToListAsync();

            var items = await _context.UserTitles
                .Where(ut => followingIds.Contains(ut.UserId))
                .Where(ut => ut.Notes != null && ut.Notes.Trim() != "")
                .Where(ut => ut.ReviewUpdatedAt != null)
                .Include(ut => ut.User)
                .Include(ut => ut.Title)
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
                    ReviewUpdatedAt = ut.ReviewUpdatedAt!.Value
                })
                .ToListAsync();

            return Ok(items);
        }
    }
}

