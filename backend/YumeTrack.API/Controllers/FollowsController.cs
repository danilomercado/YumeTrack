using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using YumeTrack.Application.DTOs.Users;
using YumeTrack.Infrastructure.Services;

namespace YumeTrack.API.Controllers
{
    [ApiController]
    [Route("api/follows")]
    [Authorize]
    public class FollowsController : ControllerBase
    {
        private readonly FollowService _followService;
        public FollowsController(FollowService followService)
        {
            _followService = followService;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out var userId))
                throw new UnauthorizedAccessException("Token inválido.");

            return userId;
        }

        [HttpPost("{userId}")]
        public async Task<IActionResult> Follow(int userId)
        {
            try
            {
                var currentUserId = GetUserId();
                await _followService.FollowAsync(currentUserId, userId);

                return Ok(new { message = "Ahora seguís a este usuario." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Error interno al seguir usuario.",
                    detail = ex.Message
                });
            }
        }

        [HttpDelete("{userId}")]
        public async Task<IActionResult> Unfollow(int userId)
        {
            var currentUserId = GetUserId();
            await _followService.UnfollowAsync(currentUserId, userId);
            return Ok(new { Message = "Dejaste de seguir a este usuario." });
        }

        [HttpGet("followers")]
        public async Task<IActionResult> GetFollowers()
        {
            var currentUserId = GetUserId();
            var users = await _followService.GetFollowersAsync(currentUserId);
            return Ok(users);
        }

        [HttpGet("following")]
        public async Task<IActionResult> GetFollowing()
        {
            var currentUserId = GetUserId();
            var users = await _followService.GetFollowingAsync(currentUserId);
            return Ok(users);
        }
    }
}
