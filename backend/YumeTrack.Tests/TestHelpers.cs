using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using YumeTrack.Infrastructure.Persistence;

namespace YumeTrack.Tests;

internal static class TestHelpers
{
    public static AppDbContext CreateDb() =>
        new(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);

    public static IConfiguration CreateConfig(Dictionary<string, string?>? values = null) =>
        new ConfigurationBuilder()
            .AddInMemoryCollection(values ?? new Dictionary<string, string?>())
            .Build();

    public static IConfiguration JwtConfig() =>
        CreateConfig(new()
        {
            ["JwtSettings:Key"] = "test_key_test_key_test_key_test_key_1234",
            ["JwtSettings:Issuer"] = "YumeTrackAPI",
            ["JwtSettings:Audience"] = "YumeTrackClient",
            ["JwtSettings:ExpiresInMinutes"] = "60"
        });
}

internal sealed class FakeHttpHandler : HttpMessageHandler
{
    private readonly Func<HttpRequestMessage, HttpResponseMessage> _respond;

    public int Calls { get; private set; }

    public FakeHttpHandler(Func<HttpRequestMessage, HttpResponseMessage> respond) => _respond = respond;

    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        Calls++;
        return Task.FromResult(_respond(request));
    }
}
