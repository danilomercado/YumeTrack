using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using YumeTrack.Application.DTOs.Auth;
using YumeTrack.Infrastructure.Services;

namespace YumeTrack.API.Controllers;

[ApiController]
[Authorize]
[Route("api/security")]
[EnableRateLimiting("auth")]
public class SecurityController : ControllerBase
{
    private readonly MfaService _mfa;
    private readonly AccountService _account;

    public SecurityController(MfaService mfa, AccountService account)
    {
        _mfa = mfa;
        _account = account;
    }

    private int UserId =>
        int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id)
            ? id
            : throw new UnauthorizedAccessException("Token inválido.");

    [HttpGet("mfa")]
    public async Task<IActionResult> Status() => Ok(await _mfa.GetStatusAsync(UserId));

    [HttpPost("mfa/setup")]
    public async Task<IActionResult> Setup() => await Run(async () => Ok(await _mfa.SetupAsync(UserId)));

    [HttpPost("mfa/enable")]
    public async Task<IActionResult> Enable([FromBody] MfaCodeRequestDto request) =>
        await Run(async () => Ok(await _mfa.EnableAsync(UserId, request.Code)));

    [HttpPost("mfa/disable")]
    public async Task<IActionResult> Disable([FromBody] MfaDisableRequestDto request) =>
        await Run(async () =>
        {
            await _mfa.DisableAsync(UserId, request.Password, request.Code);
            return Ok(new { message = "Verificación en dos pasos desactivada." });
        });

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDto request) =>
        await Run(async () =>
        {
            await _account.ChangePasswordAsync(UserId, request.CurrentPassword, request.NewPassword);
            return Ok(new { message = "Contraseña actualizada." });
        });

    private static async Task<IActionResult> Run(Func<Task<IActionResult>> action)
    {
        try
        {
            return await action();
        }
        catch (InvalidOperationException ex)
        {
            return new BadRequestObjectResult(new { message = ex.Message });
        }
    }
}
