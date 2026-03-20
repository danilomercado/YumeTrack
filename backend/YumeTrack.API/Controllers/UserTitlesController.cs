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
            var userId = GetUserId();

            await _userTitleService.AddAsync(userId, dto);

            return Ok(new { message = "Título agregado correctamente." });
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
            var userId = GetUserId();

            await _userTitleService.UpdateAsync(userId, id, dto);

            return Ok(new { message = "Título actualizado correctamente." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = GetUserId();

            await _userTitleService.DeleteAsync(userId, id);

            return Ok(new { message = "Título eliminado correctamente." });
        }
    }
}