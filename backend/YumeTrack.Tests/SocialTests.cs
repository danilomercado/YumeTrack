using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YumeTrack.API.Controllers;
using YumeTrack.Application.DTOs.Social;
using YumeTrack.Domain.Entities;
using YumeTrack.Infrastructure.Persistence;

namespace YumeTrack.Tests;

public class SocialTests
{
    private static SocialController ControllerFor(AppDbContext db, int userId) => new(db)
    {
        ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(
                    new[] { new Claim(ClaimTypes.NameIdentifier, userId.ToString()) }, "test"))
            }
        }
    };

    private static async Task<(AppDbContext Db, User A, User B)> SeedAsync()
    {
        var db = TestHelpers.CreateDb();
        var a = new User { UserName = "ana", NormalizedUserName = "ana", Email = "ana@mail.com", PasswordHash = "x" };
        var b = new User { UserName = "beto", NormalizedUserName = "beto", Email = "beto@mail.com", PasswordHash = "x" };
        db.Users.AddRange(a, b);
        await db.SaveChangesAsync();
        return (db, a, b);
    }

    [Fact]
    public async Task Block_RemovesFollowsInBothDirections()
    {
        var (db, a, b) = await SeedAsync();
        db.UserFollows.AddRange(
            new UserFollow { FollowerId = a.Id, FollowingId = b.Id },
            new UserFollow { FollowerId = b.Id, FollowingId = a.Id });
        await db.SaveChangesAsync();

        await ControllerFor(db, a.Id).Block(b.Id);

        Assert.Empty(db.UserFollows);
        Assert.Single(db.UserBlocks);
    }

    [Fact]
    public async Task Block_Self_IsRejected()
    {
        var (db, a, _) = await SeedAsync();

        var result = await ControllerFor(db, a.Id).Block(a.Id);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Report_IsIdempotentAndValidatesInput()
    {
        var (db, a, b) = await SeedAsync();
        var controller = ControllerFor(db, a.Id);
        var dto = new CreateReportDto { TargetType = "user", TargetId = b.Id, Reason = "spam" };

        await controller.Report(dto);
        await controller.Report(dto);
        var invalid = await controller.Report(new CreateReportDto { TargetType = "user", TargetId = b.Id, Reason = "no-existe" });

        Assert.Single(db.ContentReports);
        Assert.IsType<BadRequestObjectResult>(invalid);
    }

    [Fact]
    public async Task Suggestions_ExcludeSelfFollowedAndBlocked()
    {
        var (db, a, b) = await SeedAsync();
        var c = new User { UserName = "cami", NormalizedUserName = "cami", Email = "c@mail.com", PasswordHash = "x" };
        db.Users.Add(c);
        await db.SaveChangesAsync();

        var title = new Title { ExternalId = "1", CanonicalTitle = "T", MediaType = "anime" };
        db.Titles.Add(title);
        await db.SaveChangesAsync();
        db.UserTitles.AddRange(
            new UserTitle { UserId = b.Id, TitleId = title.Id },
            new UserTitle { UserId = c.Id, TitleId = title.Id });
        db.UserBlocks.Add(new UserBlock { BlockerId = a.Id, BlockedId = b.Id });
        await db.SaveChangesAsync();

        var ok = Assert.IsType<OkObjectResult>(await ControllerFor(db, a.Id).Suggestions());
        var users = Assert.IsAssignableFrom<List<SuggestedUserDto>>(ok.Value);

        Assert.Equal(new[] { "cami" }, users.Select(u => u.UserName));
    }
}
