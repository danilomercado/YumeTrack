using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using YumeTrack.Application.DTOs.UserTitles;
using YumeTrack.Application.Interfaces;

namespace YumeTrack.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserTitlesController : ControllerBase
{
    private readonly IUserTitleService _service;

    public UserTitlesController(IUserTitleService service)
    {
        _service = service;
    }

    private int GetUserId()
    {
        return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Add(CreateUserTitleDto dto)
    {
        await _service.AddAsync(GetUserId(), dto);
        return Ok();
    }

    [HttpGet]
    public async Task<IActionResult> GetMyList()
    {
        var result = await _service.GetUserListAsync(GetUserId());
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateUserTitleDto dto)
    {
        await _service.UpdateAsync(GetUserId(), id, dto);
        return Ok();
    }
}
