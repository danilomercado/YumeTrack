using System;
using System.Collections.Generic;
using System.Text;
using YumeTrack.Application.DTOs.Auth;
using YumeTrack.Domain.Entities;

namespace YumeTrack.Application.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request);
        Task<AuthResponseDto> LoginAsync(LoginRequestDto request);
    }
}
