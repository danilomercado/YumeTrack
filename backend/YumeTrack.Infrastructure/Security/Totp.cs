using System.Security.Cryptography;
using System.Text;

namespace YumeTrack.Infrastructure.Security
{
    // TOTP según RFC 6238 (HMAC-SHA1, 6 dígitos, 30 s), compatible con
    // Google Authenticator, Authy, 1Password, etc.
    public static class Totp
    {
        private const string Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        public const int PeriodSeconds = 30;

        public static string GenerateSecret(int bytes = 20) =>
            Base32Encode(RandomNumberGenerator.GetBytes(bytes));

        public static string Base32Encode(byte[] data)
        {
            var result = new StringBuilder((data.Length * 8 + 4) / 5);
            int buffer = 0, bits = 0;

            foreach (var b in data)
            {
                buffer = (buffer << 8) | b;
                bits += 8;

                while (bits >= 5)
                {
                    result.Append(Alphabet[(buffer >> (bits - 5)) & 31]);
                    bits -= 5;
                }
            }

            if (bits > 0)
                result.Append(Alphabet[(buffer << (5 - bits)) & 31]);

            return result.ToString();
        }

        public static byte[] Base32Decode(string text)
        {
            var bytes = new List<byte>();
            int buffer = 0, bits = 0;

            foreach (var c in text.Trim().TrimEnd('=').ToUpperInvariant())
            {
                var value = Alphabet.IndexOf(c);
                if (value < 0)
                    throw new FormatException("Secreto inválido.");

                buffer = (buffer << 5) | value;
                bits += 5;

                if (bits >= 8)
                {
                    bytes.Add((byte)((buffer >> (bits - 8)) & 0xFF));
                    bits -= 8;
                }
            }

            return bytes.ToArray();
        }

        public static long StepFor(DateTimeOffset time) =>
            time.ToUnixTimeSeconds() / PeriodSeconds;

        public static string ComputeCode(byte[] key, long step)
        {
            var counter = BitConverter.GetBytes(step);
            if (BitConverter.IsLittleEndian)
                Array.Reverse(counter);

            using var hmac = new HMACSHA1(key);
            var hash = hmac.ComputeHash(counter);

            var offset = hash[^1] & 0x0F;
            var binary =
                ((hash[offset] & 0x7F) << 24) |
                (hash[offset + 1] << 16) |
                (hash[offset + 2] << 8) |
                hash[offset + 3];

            return (binary % 1_000_000).ToString("D6");
        }

        // Acepta el intervalo actual y uno antes/después por desfase de reloj.
        public static bool TryVerify(string secret, string code, DateTimeOffset now, out long matchedStep)
        {
            matchedStep = 0;

            var clean = new string(code.Where(char.IsDigit).ToArray());
            if (clean.Length != 6)
                return false;

            var key = Base32Decode(secret);
            var current = StepFor(now);
            var candidate = Encoding.ASCII.GetBytes(clean);

            for (var offset = -1; offset <= 1; offset++)
            {
                var step = current + offset;
                var expected = Encoding.ASCII.GetBytes(ComputeCode(key, step));

                if (CryptographicOperations.FixedTimeEquals(expected, candidate))
                {
                    matchedStep = step;
                    return true;
                }
            }

            return false;
        }

        public static string BuildUri(string issuer, string account, string secret) =>
            $"otpauth://totp/{Uri.EscapeDataString(issuer)}:{Uri.EscapeDataString(account)}" +
            $"?secret={secret}&issuer={Uri.EscapeDataString(issuer)}&algorithm=SHA1&digits=6&period={PeriodSeconds}";
    }
}
