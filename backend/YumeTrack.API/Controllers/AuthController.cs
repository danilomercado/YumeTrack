using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using YumeTrack.Application.Common;
using YumeTrack.Application.DTOs.Auth;
using YumeTrack.Application.Interfaces;
using YumeTrack.Infrastructure.Services;

namespace YumeTrack.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly AccountService _accountService;

    public AuthController(IAuthService authService, AccountService accountService)
    {
        _authService = authService;
        _accountService = accountService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
    {
        try
        {
            var response = await _authService.RegisterAsync(request);
            return Ok(response);
        }
        catch (UsernameAlreadyTakenException ex)
        {
            return BadRequest(new
            {
                message = ex.Message,
                suggestions = ex.Suggestions
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        try
        {
            var response = await _authService.LoginAsync(request);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPost("login/mfa")]
    public async Task<IActionResult> LoginWithMfa([FromBody] MfaLoginRequestDto request)
    {
        try
        {
            return Ok(await _authService.LoginWithMfaAsync(request));
        }
        catch (InvalidOperationException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto request, CancellationToken cancellationToken)
    {
        await _accountService.RequestPasswordResetAsync(request.Email, cancellationToken);

        // Misma respuesta exista o no la cuenta.
        return Ok(new { message = "Si el correo está registrado, te enviamos un enlace para elegir una contraseña nueva." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto request)
    {
        try
        {
            await _accountService.ResetPasswordAsync(request.Email, request.Token, request.NewPassword);
            return Ok(new { message = "Listo, ya podés ingresar con tu contraseña nueva." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
