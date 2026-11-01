using System.ComponentModel.DataAnnotations;

namespace YumeTrack.Application.DTOs.Auth
{
    public class ForgotPasswordRequestDto
    {
        [Required, EmailAddress, MaxLength(100)]
        public string Email { get; set; } = string.Empty;
    }

    public class ResetPasswordRequestDto
    {
        [Required, EmailAddress, MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Token { get; set; } = string.Empty;

        [Required]
        public string NewPassword { get; set; } = string.Empty;
    }

    public class ChangePasswordRequestDto
    {
        [Required]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required]
        public string NewPassword { get; set; } = string.Empty;
    }

    public class MfaLoginRequestDto
    {
        [Required]
        public string MfaToken { get; set; } = string.Empty;

        [Required]
        public string Code { get; set; } = string.Empty;
    }

    public class MfaCodeRequestDto
    {
        [Required]
        public string Code { get; set; } = string.Empty;
    }

    public class MfaDisableRequestDto
    {
        [Required]
        public string Password { get; set; } = string.Empty;

        [Required]
        public string Code { get; set; } = string.Empty;
    }

    public class MfaStatusDto
    {
        public bool Enabled { get; set; }
        public int RecoveryCodesLeft { get; set; }
    }

    public class MfaSetupDto
    {
        public string Secret { get; set; } = string.Empty;
        public string OtpAuthUri { get; set; } = string.Empty;
    }

    public class MfaEnabledDto
    {
        public List<string> RecoveryCodes { get; set; } = new();
    }
}
