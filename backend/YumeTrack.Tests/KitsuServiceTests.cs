using System.Net;
using System.Text;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging.Abstractions;
using YumeTrack.Infrastructure.Services;

namespace YumeTrack.Tests;

public class KitsuServiceTests
{
    private const string KitsuList = """
        {"data":[{"id":"1","attributes":{"canonicalTitle":"Cowboy Bebop","status":"finished","episodeCount":26}}]}
        """;

    private static KitsuService CreateService(FakeHttpHandler handler, IMemoryCache cache)
    {
        var translation = new TranslationService(
            new HttpClient(handler), TestHelpers.CreateConfig(), TestHelpers.CreateDb(), NullLogger<TranslationService>.Instance);

        return new KitsuService(
            new HttpClient(handler) { BaseAddress = new Uri("https://kitsu.test/api/edge/") },
            translation,
            cache);
    }

    private static HttpResponseMessage Ok(string body) =>
        new(HttpStatusCode.OK) { Content = new StringContent(body, Encoding.UTF8, "application/json") };

    [Fact]
    public async Task TrendingList_IsCachedBetweenCalls()
    {
        var handler = new FakeHttpHandler(_ => Ok(KitsuList));
        using var cache = new MemoryCache(new MemoryCacheOptions { SizeLimit = 10 });
        var service = CreateService(handler, cache);

        var first = await service.GetTrendingAnimeAsync(12);
        var second = await service.GetTrendingAnimeAsync(12);

        Assert.Single(first);
        Assert.Equal("Cowboy Bebop", second[0].Title);
        Assert.Equal("Finalizado", second[0].Status);
        Assert.Equal(1, handler.Calls);
    }

    [Fact]
    public async Task DifferentRequests_AreCachedSeparately()
    {
        var handler = new FakeHttpHandler(_ => Ok(KitsuList));
        using var cache = new MemoryCache(new MemoryCacheOptions { SizeLimit = 10 });
        var service = CreateService(handler, cache);

        await service.GetTrendingAnimeAsync(12);
        await service.GetTrendingMangaAsync(12);

        Assert.Equal(2, handler.Calls);
    }

    [Fact]
    public async Task FailedResponses_AreNotCached()
    {
        var handler = new FakeHttpHandler(_ => new HttpResponseMessage(HttpStatusCode.ServiceUnavailable) { Content = new StringContent("{}") });
        using var cache = new MemoryCache(new MemoryCacheOptions { SizeLimit = 10 });
        var service = CreateService(handler, cache);

        await Assert.ThrowsAsync<Exception>(() => service.GetTrendingAnimeAsync(12));
        await Assert.ThrowsAsync<Exception>(() => service.GetTrendingAnimeAsync(12));

        Assert.Equal(2, handler.Calls);
    }
}
