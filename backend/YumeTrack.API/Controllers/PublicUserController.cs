using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using YumeTrack.Application.Interfaces;

namespace YumeTrack.API.Controllers
{
    [ApiController]
    [Route("api/public/users")]
    public class PublicUsersController : ControllerBase
    {
        private readonly IUserTitleService _userTitleService;

        public PublicUsersController(IUserTitleService userTitleService)
        {
            _userTitleService = userTitleService;
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchUsers([FromQuery] string q)
        {
            var users = await _userTitleService.SearchUsersAsync(q);
            return Ok(users);
        }

        [HttpGet("{username}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByUsername(string username)
        {
            int? currentUserId = null;

            if (User.Identity?.IsAuthenticated == true)
            {
                var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (int.TryParse(claim, out var parsedUserId))
                    currentUserId = parsedUserId;
            }

            var profile = await _userTitleService.GetPublicProfileByUsernameAsync(username, currentUserId);

            if (profile == null)
                return NotFound(new { message = "Usuario no encontrado." });

            return Ok(profile);
        }
    }
}