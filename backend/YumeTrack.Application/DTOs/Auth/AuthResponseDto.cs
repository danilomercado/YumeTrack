using System;
using System.Collections.Generic;
using System.Text;

namespace YumeTrack.Application.DTOs.Auth
{
    public class AuthResponseDto
    {
        public string Token { get; set; } = null!;
        public string UserName { get; set; } = null!;
        public string Email { get; set; } = null!;

    }
}
