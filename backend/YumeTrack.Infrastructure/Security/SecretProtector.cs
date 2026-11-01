using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;

namespace YumeTrack.Infrastructure.Security
{
    // Cifra el secreto MFA en la base (AES-256-GCM). La clave se deriva de
    // JwtSettings:Key, así sobrevive a los redeploys sin guardar claves aparte.
    public class SecretProtector
    {
        private readonly byte[] _key;

        public SecretProtector(IConfiguration configuration)
        {
            var master = configuration["JwtSettings:Key"]
                         ?? throw new InvalidOperationException("JwtSettings:Key no está configurada.");

            _key = HKDF.DeriveKey(
                HashAlgorithmName.SHA256,
                Encoding.UTF8.GetBytes(master),
                32,
                salt: Encoding.UTF8.GetBytes("yumetrack-mfa"),
                info: Encoding.UTF8.GetBytes("mfa-secret-v1"));
        }

        public string Protect(string plainText)
        {
            var nonce = RandomNumberGenerator.GetBytes(12);
            var plain = Encoding.UTF8.GetBytes(plainText);
            var cipher = new byte[plain.Length];
            var tag = new byte[16];

            using var aes = new AesGcm(_key, 16);
            aes.Encrypt(nonce, plain, cipher, tag);

            return Convert.ToBase64String(nonce.Concat(tag).Concat(cipher).ToArray());
        }

        public string Unprotect(string protectedText)
        {
            var data = Convert.FromBase64String(protectedText);
            var nonce = data[..12];
            var tag = data[12..28];
            var cipher = data[28..];
            var plain = new byte[cipher.Length];

            using var aes = new AesGcm(_key, 16);
            aes.Decrypt(nonce, cipher, tag, plain);

            return Encoding.UTF8.GetString(plain);
        }
    }
}
