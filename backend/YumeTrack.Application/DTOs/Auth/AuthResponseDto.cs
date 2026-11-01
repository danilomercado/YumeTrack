using System;
using System.Collections.Generic;
using System.Text;

namespace YumeTrack.Application.DTOs.Auth
{
    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;

        // Si el usuario activó MFA, el login devuelve esto en lugar del token final.
        public bool MfaRequired { get; set; }
        public string? MfaToken { get; set; }

    }
}
