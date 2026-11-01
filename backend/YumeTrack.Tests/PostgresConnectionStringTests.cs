using Npgsql;
using YumeTrack.Infrastructure.DependencyInjection;

namespace YumeTrack.Tests;

public class PostgresConnectionStringTests
{
    [Fact]
    public void KeyValueFormat_IsReturnedUntouched()
    {
        const string value = "Host=localhost;Port=5433;Database=db;Username=u;Password=p";

        Assert.Equal(value, PostgresConnectionString.Normalize(value));
    }

    [Theory]
    [InlineData("postgres://user:p%40ss@db.example.com:6543/mydb?sslmode=require")]
    [InlineData("postgresql://user:p%40ss@db.example.com:6543/mydb")]
    public void PostgresUrl_IsConvertedToNpgsqlFormat(string url)
    {
        var builder = new NpgsqlConnectionStringBuilder(PostgresConnectionString.Normalize(url));

        Assert.Equal("db.example.com", builder.Host);
        Assert.Equal(6543, builder.Port);
        Assert.Equal("mydb", builder.Database);
        Assert.Equal("user", builder.Username);
        Assert.Equal("p@ss", builder.Password);
        Assert.Equal(SslMode.Require, builder.SslMode);
    }

    [Fact]
    public void PostgresUrl_WithoutPort_UsesDefault()
    {
        var builder = new NpgsqlConnectionStringBuilder(PostgresConnectionString.Normalize("postgres://u:p@host/db"));

        Assert.Equal(5432, builder.Port);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("  ")]
    public void MissingValue_Throws(string? value)
    {
        Assert.Throws<InvalidOperationException>(() => PostgresConnectionString.Normalize(value));
    }
}
