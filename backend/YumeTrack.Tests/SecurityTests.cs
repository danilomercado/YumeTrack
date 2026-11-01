using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using YumeTrack.Application.Common;
using YumeTrack.Application.DTOs.Auth;
using YumeTrack.Application.Interfaces;
using YumeTrack.Infrastructure.Persistence;
using YumeTrack.Infrastructure.Security;
using YumeTrack.Infrastructure.Services;

namespace YumeTrack.Tests;

public class SecurityTests
{
    private sealed class CapturingEmail : IEmailSender
    {
        public string? LastBody { get; private set; }

        public Task SendAsync(string to, string subject, string htmlBody, CancellationToken cancellationToken = default)
        {
            LastBody = htmlBody;
            return Task.CompletedTask;
        }
    }

    private static (AuthService Auth, MfaService Mfa, AccountService Account, CapturingEmail Email) Build(AppDbContext db)
    {
        var config = TestHelpers.JwtConfig();
        var jwt = new JwtTokenService(config);
        var mfa = new MfaService(db, new SecretProtector(config));
        var email = new CapturingEmail();
        var account = new AccountService(db, email, config, NullLogger<AccountService>.Instance);

        return (new AuthService(db, jwt, mfa), mfa, account, email);
    }

    private static RegisterRequestDto Register() =>
        new() { UserName = "juan", Email = "juan@mail.com", Password = "secret123" };

    [Fact]
    public void Totp_MatchesRfc6238Vector()
    {
        // RFC 6238, secreto ASCII "12345678901234567890", T = 59 s -> 94287082 (8 díg.)
        var key = System.Text.Encoding.ASCII.GetBytes("12345678901234567890");

        Assert.Equal("287082", Totp.ComputeCode(key, Totp.StepFor(DateTimeOffset.FromUnixTimeSeconds(59))));
    }

    [Fact]
    public void Base32_RoundTrips()
    {
        var bytes = new byte[] { 1, 2, 3, 250, 251, 252, 9, 8, 7 };

        Assert.Equal(bytes, Totp.Base32Decode(Totp.Base32Encode(bytes)));
    }

    [Theory]
    [InlineData("short1")]
    [InlineData("onlyletters")]
    [InlineData("12345678")]
    public void PasswordPolicy_RejectsWeakPasswords(string password)
    {
        Assert.Throws<InvalidOperationException>(() => PasswordPolicy.Validate(password));
    }

    [Fact]
    public async Task Login_LocksAccountAfterFiveFailures()
    {
        await using var db = TestHelpers.CreateDb();
        var (auth, _, _, _) = Build(db);
        await auth.RegisterAsync(Register());

        for (var i = 0; i < 5; i++)
            await Assert.ThrowsAsync<InvalidOperationException>(
                () => auth.LoginAsync(new LoginRequestDto { Email = "juan@mail.com", Password = "mala-clave1" }));

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(
            () => auth.LoginAsync(new LoginRequestDto { Email = "juan@mail.com", Password = "secret123" }));

        Assert.Contains("Demasiados intentos", ex.Message);
    }

    [Fact]
    public async Task Mfa_FullFlow_RequiresCodeAtLogin()
    {
        await using var db = TestHelpers.CreateDb();
        var (auth, mfa, _, _) = Build(db);
        await auth.RegisterAsync(Register());
        var userId = (await db.Users.SingleAsync()).Id;

        var setup = await mfa.SetupAsync(userId);
        var code = Totp.ComputeCode(Totp.Base32Decode(setup.Secret), Totp.StepFor(DateTimeOffset.UtcNow));
        var enabled = await mfa.EnableAsync(userId, code);

        Assert.Equal(10, enabled.RecoveryCodes.Count);

        var first = await auth.LoginAsync(new LoginRequestDto { Email = "juan@mail.com", Password = "secret123" });
        Assert.True(first.MfaRequired);
        Assert.True(string.IsNullOrEmpty(first.Token));

        // Un código de recuperación sirve una sola vez.
        var recovery = enabled.RecoveryCodes[0];
        var session = await auth.LoginWithMfaAsync(new MfaLoginRequestDto { MfaToken = first.MfaToken!, Code = recovery });
        Assert.False(string.IsNullOrEmpty(session.Token));

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => auth.LoginWithMfaAsync(new MfaLoginRequestDto { MfaToken = first.MfaToken!, Code = recovery }));
    }

    [Fact]
    public async Task MfaToken_IsNotAcceptedAsSessionAudience()
    {
        var config = TestHelpers.JwtConfig();
        var jwt = new JwtTokenService(config);
        var user = new YumeTrack.Domain.Entities.User { Id = 7, Email = "a@b.com", UserName = "a" };

        var mfaToken = jwt.GenerateMfaToken(user);

        Assert.Equal(7, jwt.ValidateMfaToken(mfaToken));
        Assert.Null(jwt.ValidateMfaToken(jwt.GenerateToken(user)));
        await Task.CompletedTask;
    }

    [Fact]
    public async Task PasswordReset_WorksOnceAndNeverRevealsUnknownEmails()
    {
        await using var db = TestHelpers.CreateDb();
        var (auth, _, account, email) = Build(db);
        await auth.RegisterAsync(Register());

        await account.RequestPasswordResetAsync("nadie@mail.com");
        Assert.Null(email.LastBody);

        await account.RequestPasswordResetAsync("juan@mail.com");
        var token = System.Text.RegularExpressions.Regex.Match(email.LastBody!, "token=([^\"&]+)").Groups[1].Value;

        await account.ResetPasswordAsync("juan@mail.com", token, "nueva-clave99");
        await auth.LoginAsync(new LoginRequestDto { Email = "juan@mail.com", Password = "nueva-clave99" });

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => account.ResetPasswordAsync("juan@mail.com", token, "otra-clave123"));
    }
}
