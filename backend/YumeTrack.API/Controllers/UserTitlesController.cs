using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using YumeTrack.Application.DTOs.UserTitles;
using YumeTrack.Application.Interfaces;

namespace YumeTrack.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserTitlesController : ControllerBase
    {
        private readonly IUserTitleService _userTitleService;

        public UserTitlesController(IUserTitleService userTitleService)
        {
            _userTitleService = userTitleService;
        }

        [HttpPost]
        public async Task<IActionResult> Add([FromBody] CreateUserTitleDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out var userId))
                return Unauthorized("Token inválido.");

            try
            {
                await _userTitleService.AddAsync(userId, dto);
                return Ok(new { message = "Título agregado correctamente." });
            }
            catch (Exception ex) when (ex.Message == "Ya tenés este título en tu lista.")
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetMyList()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out var userId))
                return Unauthorized("Token inválido.");

            var list = await _userTitleService.GetUserListAsync(userId);

            return Ok(list);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateUserTitleDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out var userId))
                return Unauthorized("Token inválido.");

            await _userTitleService.UpdateAsync(userId, id, dto);

            return Ok(new { message = "Título actualizado correctamente." });
        }
    }
}