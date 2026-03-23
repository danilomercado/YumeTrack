using Microsoft.AspNetCore.Mvc;
using YumeTrack.Application.Interfaces;

namespace YumeTrack.API.Controllers
{
    [ApiController]
    [Route("api/public/users")]
    public class PublicUserController : ControllerBase
    {
        private readonly IUserTitleService _userTitleService;

        public PublicUserController(IUserTitleService userTitleService)
        {
            _userTitleService = userTitleService;
        }

        [HttpGet("{username}")]
        public async Task<IActionResult> GetByUsername(string username)
        {
            var profile = await _userTitleService.GetPublicProfileByUsernameAsync(username);
            if (profile == null)
                return NotFound(new { message = "Usuario no encontrado" });

            return Ok(profile);
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchUsers([FromQuery] string q)
        {
            var users = await _userTitleService.SearchUserAsync(q);
            return Ok(users);

        }
    }
}
