using Microsoft.EntityFrameworkCore;
using YumeTrack.Application.Common;
using YumeTrack.Application.DTOs.Auth;
using YumeTrack.Domain.Entities;
using YumeTrack.Infrastructure.Persistence;
using YumeTrack.Infrastructure.Services;

namespace YumeTrack.Tests;

public class AuthServiceTests
{
    private static AuthService CreateService(AppDbContext db) =>
        new(db, new JwtTokenService(TestHelpers.JwtConfig()));

    private static RegisterRequestDto Register(string userName, string email) =>
        new() { UserName = userName, Email = email, Password = "secret123" };

    [Fact]
    public async Task Register_StoresEmailInLowerCase()
    {
        using var db = TestHelpers.CreateDb();

        var result = await CreateService(db).RegisterAsync(Register("juan", "  Juan@Mail.COM "));

        Assert.Equal("juan@mail.com", result.Email);
        Assert.Equal("juan@mail.com", (await db.Users.SingleAsync()).Email);
        Assert.False(string.IsNullOrWhiteSpace(result.Token));
    }

    [Fact]
    public async Task Register_RejectsDuplicateEmailIgnoringCase()
    {
        using var db = TestHelpers.CreateDb();
        var service = CreateService(db);
        await service.RegisterAsync(Register("juan", "juan@mail.com"));

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.RegisterAsync(Register("otro", "JUAN@mail.com")));

        Assert.Equal("El email ya está registrado.", ex.Message);
    }

    [Fact]
    public async Task Register_RejectsDuplicateUserNameWithSuggestions()
    {
        using var db = TestHelpers.CreateDb();
        var service = CreateService(db);
        await service.RegisterAsync(Register("Juan", "a@mail.com"));

        var ex = await Assert.ThrowsAsync<UsernameAlreadyTakenException>(
            () => service.RegisterAsync(Register("juan", "b@mail.com")));

        Assert.NotEmpty(ex.Suggestions);
    }

    [Fact]
    public async Task Login_WorksWithAnyEmailCasing()
    {
        using var db = TestHelpers.CreateDb();
        var service = CreateService(db);
        await service.RegisterAsync(Register("juan", "Juan@Mail.com"));

        var result = await service.LoginAsync(new LoginRequestDto { Email = "JUAN@MAIL.COM", Password = "secret123" });

        Assert.Equal("juan", result.UserName);
    }

    [Fact]
    public async Task Login_WorksForLegacyUsersStoredWithMixedCaseEmail()
    {
        using var db = TestHelpers.CreateDb();
        db.Users.Add(new User
        {
            UserName = "legacy",
            NormalizedUserName = "legacy",
            Email = "Legacy@Mail.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("secret123")
        });
        await db.SaveChangesAsync();

        var result = await CreateService(db).LoginAsync(new LoginRequestDto { Email = "legacy@mail.com", Password = "secret123" });

        Assert.Equal("legacy", result.UserName);
    }

    [Theory]
    [InlineData("juan@mail.com", "wrong-password")]
    [InlineData("nadie@mail.com", "secret123")]
    public async Task Login_RejectsInvalidCredentials(string email, string password)
    {
        using var db = TestHelpers.CreateDb();
        var service = CreateService(db);
        await service.RegisterAsync(Register("juan", "juan@mail.com"));

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.LoginAsync(new LoginRequestDto { Email = email, Password = password }));

        Assert.Equal("Credenciales invalidas.", ex.Message);
    }
}
