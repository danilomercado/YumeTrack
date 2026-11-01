using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace YumeTrack.Tests;

public class ApiTests : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client;

    public ApiTests(ApiFactory factory) => _client = factory.CreateClient();

    private async Task<string> RegisterAsync(string userName, string email)
    {
        var response = await _client.PostAsJsonAsync("/api/auth/register", new { userName, email, password = "secret123" });
        response.EnsureSuccessStatusCode();

        using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        return doc.RootElement.GetProperty("token").GetString()!;
    }

    [Fact]
    public async Task Health_ReturnsOk()
    {
        var response = await _client.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Login_AfterRegisteringWithUppercaseEmail_Succeeds()
    {
        await RegisterAsync("maria", "Maria@Mail.com");

        var response = await _client.PostAsJsonAsync("/api/auth/login", new { email = "maria@mail.com", password = "secret123" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithWrongPassword_ReturnsUnauthorizedWithMessage()
    {
        await RegisterAsync("pedro", "pedro@mail.com");

        var response = await _client.PostAsJsonAsync("/api/auth/login", new { email = "pedro@mail.com", password = "incorrecta" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Contains("Credenciales", await response.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task Comment_LongerThan1000Characters_ReturnsBadRequest()
    {
        var token = await RegisterAsync("ana", "ana@mail.com");
        using var request = new HttpRequestMessage(HttpMethod.Post, "/api/reviews/1/comments")
        {
            Content = JsonContent.Create(new { content = new string('a', 1001) })
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Comment_WithoutToken_ReturnsUnauthorized()
    {
        var response = await _client.PostAsJsonAsync("/api/reviews/1/comments", new { content = "hola" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Theory]
    [InlineData("/api/titles/anime/abc")]
    [InlineData("/api/titles/manga/1;drop")]
    public async Task TitleDetail_WithNonNumericId_ReturnsNotFound(string url)
    {
        var response = await _client.GetAsync(url);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}

public class RateLimitTests : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client;

    public RateLimitTests(ApiFactory factory) => _client = factory.CreateClient();

    [Fact]
    public async Task Login_IsLimitedTo10RequestsPerMinute()
    {
        var statuses = new List<HttpStatusCode>();

        for (var i = 0; i < 12; i++)
        {
            var response = await _client.PostAsJsonAsync("/api/auth/login", new { email = "x@mail.com", password = "incorrecta" });
            statuses.Add(response.StatusCode);
        }

        Assert.All(statuses.Take(10), s => Assert.Equal(HttpStatusCode.Unauthorized, s));
        Assert.All(statuses.Skip(10), s => Assert.Equal(HttpStatusCode.TooManyRequests, s));
    }
}
