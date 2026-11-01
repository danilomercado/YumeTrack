using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;
using YumeTrack.API.Middlewares;

namespace YumeTrack.Tests;

public class ExceptionMiddlewareTests
{
    private static async Task<(int Status, string Message)> Run(Exception ex)
    {
        var middleware = new ExceptionMiddleware(_ => throw ex, NullLogger<ExceptionMiddleware>.Instance);
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();

        await middleware.InvokeAsync(context);

        context.Response.Body.Position = 0;
        using var doc = await JsonDocument.ParseAsync(context.Response.Body);
        return (context.Response.StatusCode, doc.RootElement.GetProperty("message").GetString()!);
    }

    [Fact]
    public async Task KnownExceptions_MapToStatusAndKeepMessage()
    {
        Assert.Equal((404, "No encontrado."), await Run(new KeyNotFoundException("No encontrado.")));
        Assert.Equal((400, "Dato inválido."), await Run(new InvalidOperationException("Dato inválido.")));
        Assert.Equal((401, "No autorizado."), await Run(new UnauthorizedAccessException("No autorizado.")));
    }

    [Fact]
    public async Task UnexpectedExceptions_DoNotLeakInternalDetails()
    {
        var (status, message) = await Run(new Exception("Host=db;Password=secreta"));

        Assert.Equal(500, status);
        Assert.DoesNotContain("secreta", message);
    }
}
