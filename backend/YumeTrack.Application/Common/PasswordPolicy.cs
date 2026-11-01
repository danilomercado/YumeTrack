using System.Text;

namespace YumeTrack.Application.Common
{
    public static class PasswordPolicy
    {
        public const int MinLength = 8;

        // bcrypt ignora todo lo que pase de 72 bytes.
        public const int MaxBytes = 72;

        public static void Validate(string? password)
        {
            if (string.IsNullOrEmpty(password) || password.Length < MinLength)
                throw new InvalidOperationException($"La contraseña debe tener al menos {MinLength} caracteres.");

            if (Encoding.UTF8.GetByteCount(password) > MaxBytes)
                throw new InvalidOperationException("La contraseña es demasiado larga.");

            if (!password.Any(char.IsLetter) || !password.Any(char.IsDigit))
                throw new InvalidOperationException("La contraseña debe combinar letras y números.");
        }
    }
}
