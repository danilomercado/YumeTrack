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

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out var userId))
                throw new UnauthorizedAccessException("Token inválido.");

            return userId;
        }

        [HttpPost]
        public async Task<IActionResult> Add([FromBody] CreateUserTitleDto dto)
        {
            try
            {
                var userId = GetUserId();
                await _userTitleService.AddAsync(userId, dto);

                return Ok(new { message = "Título agregado correctamente." });
            }
            catch (InvalidOperationException ex)
            {
                if (ex.Message.Contains("Ya tenés este título", StringComparison.OrdinalIgnoreCase))
                    return Conflict(new { message = ex.Message });

                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetMyList([FromQuery] GetUserTitlesQueryDto filters)
        {
            var userId = GetUserId();

            var list = await _userTitleService.GetUserListAsync(userId, filters);

            return Ok(list);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateUserTitleDto dto)
        {
            try
            {
                var userId = GetUserId();
                await _userTitleService.UpdateAsync(userId, id, dto);

                return Ok(new { message = "Título actualizado correctamente." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var userId = GetUserId();
                await _userTitleService.DeleteAsync(userId, id);

                return Ok(new { message = "Título eliminado correctamente." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}