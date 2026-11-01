using System.ComponentModel.DataAnnotations;

namespace YumeTrack.Domain.Entities
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string UserName { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string NormalizedUserName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [MaxLength(300)]
        public string? Bio { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Autenticación en dos pasos (opcional, TOTP).
        public bool MfaEnabled { get; set; }

        [MaxLength(300)]
        public string? MfaSecretProtected { get; set; }

        // Hashes bcrypt de los códigos de recuperación, como JSON.
        public string? MfaRecoveryCodes { get; set; }

        // Último intervalo TOTP aceptado, para que un código no se use dos veces.
        public long MfaLastStep { get; set; }

        // Recuperación de contraseña: solo se guarda el hash del token.
        [MaxLength(64)]
        public string? PasswordResetTokenHash { get; set; }

        public DateTime? PasswordResetExpiresAt { get; set; }

        // Bloqueo temporal tras varios intentos fallidos.
        public int FailedLoginCount { get; set; }

        public DateTime? LockoutUntil { get; set; }

        public ICollection<UserTitle> UserTitles { get; set; } = new List<UserTitle>();
        public ICollection<ReviewLike> ReviewLikes { get; set; } = new List<ReviewLike>();
        public ICollection<UserFollow> Followers { get; set; } = new List<UserFollow>();
        public ICollection<UserFollow> Following { get; set; } = new List<UserFollow>();
    }
}