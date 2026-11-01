using Npgsql;

namespace YumeTrack.Infrastructure.DependencyInjection
{
    public static class PostgresConnectionString
    {
        /// <summary>
        /// Acepta tanto el formato clave=valor de Npgsql como las URLs postgres://user:pass@host/db
        /// que entregan Neon, Supabase o Render, y devuelve siempre un connection string de Npgsql.
        /// </summary>
        public static string Normalize(string? connectionString)
        {
            if (string.IsNullOrWhiteSpace(connectionString))
                throw new InvalidOperationException("ConnectionStrings:DefaultConnection no está configurada.");

            var value = connectionString.Trim();

            if (!value.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) &&
                !value.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
            {
                return value;
            }

            var uri = new Uri(value);
            var userInfo = uri.UserInfo.Split(':', 2);

            var builder = new NpgsqlConnectionStringBuilder
            {
                Host = uri.Host,
                Port = uri.Port > 0 ? uri.Port : 5432,
                Database = uri.AbsolutePath.Trim('/'),
                Username = Uri.UnescapeDataString(userInfo[0]),
                Password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : null,
                SslMode = SslMode.Require
            };

            return builder.ConnectionString;
        }
    }
}
