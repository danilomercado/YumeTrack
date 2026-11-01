using System.Net;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using YumeTrack.Infrastructure.Persistence;
using YumeTrack.Infrastructure.Services;

namespace YumeTrack.Tests;

public class TranslationServiceTests
{
    private const string DeepLOk = """{"translations":[{"text":"Hola mundo"}]}""";

    private static TranslationService CreateService(AppDbContext db, FakeHttpHandler handler, string? apiKey) =>
        new(
            new HttpClient(handler),
            TestHelpers.CreateConfig(new() { ["DeepL:ApiKey"] = apiKey }),
            db,
            NullLogger<TranslationService>.Instance);

    private static HttpResponseMessage Json(HttpStatusCode status, string body) =>
        new(status) { Content = new StringContent(body, Encoding.UTF8, "application/json") };

    [Fact]
    public async Task WithoutApiKey_ReturnsOriginalAndDoesNotCall()
    {
        using var db = TestHelpers.CreateDb();
        var handler = new FakeHttpHandler(_ => Json(HttpStatusCode.OK, DeepLOk));

        var result = await CreateService(db, handler, apiKey: "").GetTranslatedSynopsisAsync("1", "anime", "Hello world", "es");

        Assert.Equal("Hello world", result);
        Assert.Equal(0, handler.Calls);
        Assert.Empty(db.MediaTranslations);
    }

    [Fact]
    public async Task WhenDeepLFails_ReturnsOriginalAndDoesNotCache()
    {
        using var db = TestHelpers.CreateDb();
        var handler = new FakeHttpHandler(_ => Json(HttpStatusCode.TooManyRequests, "{}"));

        var result = await CreateService(db, handler, "key").GetTranslatedSynopsisAsync("1", "anime", "Hello world", "es");

        Assert.Equal("Hello world", result);
        Assert.Empty(db.MediaTranslations);
    }

    [Fact]
    public async Task WhenDeepLThrows_ReturnsOriginal()
    {
        using var db = TestHelpers.CreateDb();
        var handler = new FakeHttpHandler(_ => throw new HttpRequestException("network down"));

        var result = await CreateService(db, handler, "key").GetTranslatedSynopsisAsync("1", "anime", "Hello world", "es");

        Assert.Equal("Hello world", result);
    }

    [Fact]
    public async Task TranslatesOnce_ThenServesFromCache()
    {
        using var db = TestHelpers.CreateDb();
        var handler = new FakeHttpHandler(_ => Json(HttpStatusCode.OK, DeepLOk));
        var service = CreateService(db, handler, "key");

        var first = await service.GetTranslatedSynopsisAsync("1", "anime", "Hello world", "es");
        var second = await service.GetTranslatedSynopsisAsync("1", "anime", "Hello world", "es");

        Assert.Equal("Hola mundo", first);
        Assert.Equal("Hola mundo", second);
        Assert.Equal(1, handler.Calls);
        Assert.Equal(1, await db.MediaTranslations.CountAsync());
    }

    [Fact]
    public async Task RetranslatesWhenOriginalSynopsisChanged()
    {
        using var db = TestHelpers.CreateDb();
        var handler = new FakeHttpHandler(_ => Json(HttpStatusCode.OK, DeepLOk));
        var service = CreateService(db, handler, "key");

        await service.GetTranslatedSynopsisAsync("1", "anime", "Hello world", "es");
        await service.GetTranslatedSynopsisAsync("1", "anime", "Hello again", "es");

        Assert.Equal(2, handler.Calls);
        Assert.Equal("Hello again", (await db.MediaTranslations.SingleAsync()).OriginalSynopsis);
    }
}
