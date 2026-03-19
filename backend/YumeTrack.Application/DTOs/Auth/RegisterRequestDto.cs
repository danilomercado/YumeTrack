using System;
using System.Collections.Generic;
using System.Text;

namespace YumeTrack.Application.DTOs.Auth
{
    public class RegisterRequestDto
    {
        public string UserName { get; set; } = null!;
        public string Email { get; set; } = null!;  
        public string Password { get; set; } = null!;  
    }
}
