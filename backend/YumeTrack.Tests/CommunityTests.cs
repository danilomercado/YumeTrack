using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YumeTrack.API.Controllers;
using YumeTrack.Domain.Entities;
using YumeTrack.Infrastructure.Persistence;
using YumeTrack.Infrastructure.Services;

namespace YumeTrack.Tests;

public class CommunityTests
{
    private static ControllerContext AsUser(int? userId) => new()
    {
        HttpContext = new DefaultHttpContext
        {
            User = userId is null
                ? new ClaimsPrincipal(new ClaimsIdentity())
                : new ClaimsPrincipal(new ClaimsIdentity(
                    new[] { new Claim(ClaimTypes.NameIdentifier, userId.Value.ToString()) }, "test"))
        }
    };

    private static async Task<(AppDbContext Db, User Ana, User Beto, UserTitle Review, Title Title)> SeedAsync()
    {
        var db = TestHelpers.CreateDb();
        var ana = new User { UserName = "ana", NormalizedUserName = "ana", Email = "ana@mail.com", PasswordHash = "x" };
        var beto = new User { UserName = "beto", NormalizedUserName = "beto", Email = "beto@mail.com", PasswordHash = "x" };
        var title = new Title { ExternalId = "7442", Source = "kitsu", CanonicalTitle = "Shingeki", MediaType = "anime", EpisodeCount = 25 };
        db.Users.AddRange(ana, beto);
        db.Titles.Add(title);
        await db.SaveChangesAsync();

        var review = new UserTitle { UserId = ana.Id, TitleId = title.Id, Notes = "Obra maestra", ReviewUpdatedAt = DateTime.UtcNow };
        db.UserTitles.Add(review);
        await db.SaveChangesAsync();

        return (db, ana, beto, review, title);
    }

    private static ReviewCommentsController Comments(AppDbContext db, int? userId) =>
        new(db) { ControllerContext = AsUser(userId) };

    [Fact]
    public async Task Reaction_TogglesAndChanges()
    {
        var (db, ana, beto, review, _) = await SeedAsync();
        db.ReviewComments.Add(new ReviewComments { UserId = ana.Id, UserTitleId = review.Id, Content = "hola" });
        await db.SaveChangesAsync();
        var commentId = (await db.ReviewComments.SingleAsync()).Id;
        var controller = Comments(db, beto.Id);

        await controller.React(review.Id, commentId, new ReactionRequestDto { Key = "like" });
        Assert.Equal("like", (await db.CommentReactions.SingleAsync()).Key);

        await controller.React(review.Id, commentId, new ReactionRequestDto { Key = "fire" });
        Assert.Equal("fire", (await db.CommentReactions.SingleAsync()).Key);

        await controller.React(review.Id, commentId, new ReactionRequestDto { Key = "fire" });
        Assert.Empty(db.CommentReactions);

        var invalid = await controller.React(review.Id, commentId, new ReactionRequestDto { Key = "nope" });
        Assert.IsType<BadRequestObjectResult>(invalid);
    }

    [Fact]
    public async Task Reply_ToAReply_HangsFromTheOriginalComment()
    {
        var (db, ana, beto, review, _) = await SeedAsync();
        var original = new ReviewComments { UserId = ana.Id, UserTitleId = review.Id, Content = "original" };
        db.ReviewComments.Add(original);
        await db.SaveChangesAsync();

        var controller = Comments(db, beto.Id);
        await controller.Create(review.Id, new CreateReviewCommentsDto { Content = "respuesta", ParentCommentId = original.Id });
        var reply = await db.ReviewComments.SingleAsync(c => c.Content == "respuesta");

        await Comments(db, ana.Id).Create(review.Id, new CreateReviewCommentsDto { Content = "re-respuesta", ParentCommentId = reply.Id });
        var nested = await db.ReviewComments.SingleAsync(c => c.Content == "re-respuesta");

        Assert.Equal(original.Id, nested.ParentCommentId);
        Assert.Contains(db.Notifications, n => n.Type == "comment_reply" && n.UserId == beto.Id);
    }

    [Fact]
    public async Task DeletingAComment_RemovesItsReplies()
    {
        var (db, ana, beto, review, _) = await SeedAsync();
        var original = new ReviewComments { UserId = ana.Id, UserTitleId = review.Id, Content = "original" };
        db.ReviewComments.Add(original);
        await db.SaveChangesAsync();
        db.ReviewComments.Add(new ReviewComments { UserId = beto.Id, UserTitleId = review.Id, Content = "r", ParentCommentId = original.Id });
        await db.SaveChangesAsync();

        await Comments(db, ana.Id).Delete(original.Id);

        Assert.Empty(db.ReviewComments);
    }

    [Fact]
    public async Task Lists_RejectDuplicatesAndHidePrivateOnes()
    {
        var (db, ana, beto, _, title) = await SeedAsync();
        var resolver = new TitleResolver(db, null!);
        var owner = new ListsController(db, resolver) { ControllerContext = AsUser(ana.Id) };

        var created = Assert.IsType<OkObjectResult>(await owner.Create(new ListInputDto { Title = "Mis 5", IsPublic = false }));
        var token = (string)created.Value!.GetType().GetProperty("Token")!.GetValue(created.Value)!;

        var item = new ListItemInputDto { KitsuId = int.Parse(title.ExternalId), MediaType = "anime" };
        Assert.IsType<OkObjectResult>(await owner.AddItem(token, item));
        Assert.IsType<BadRequestObjectResult>(await owner.AddItem(token, item));

        var stranger = new ListsController(db, resolver) { ControllerContext = AsUser(beto.Id) };
        Assert.IsType<NotFoundObjectResult>(await stranger.Get(token));

        await owner.Update(token, new ListInputDto { Title = "Mis 5", IsPublic = true });
        Assert.IsType<OkObjectResult>(await stranger.Get(token));

        // Solo el dueño puede modificar.
        Assert.IsType<NotFoundResult>(await stranger.Delete(token));
    }

    [Fact]
    public async Task Episodes_RejectOutOfRangeEpisodes()
    {
        var (db, ana, _, _, title) = await SeedAsync();
        var controller = new EpisodesController(db, new TitleResolver(db, null!)) { ControllerContext = AsUser(ana.Id) };
        var kitsuId = int.Parse(title.ExternalId);

        Assert.IsType<OkResult>(await controller.Create(kitsuId, 3, new EpisodeCommentInputDto { Content = "Qué episodio" }));
        Assert.IsType<BadRequestObjectResult>(await controller.Create(kitsuId, 99, new EpisodeCommentInputDto { Content = "No existe" }));
        Assert.Single(db.EpisodeComments);
    }

    [Fact]
    public async Task Admin_RemovingContent_DeletesCommentAndClosesAllReports()
    {
        var (db, ana, beto, review, _) = await SeedAsync();
        var comment = new ReviewComments { UserId = ana.Id, UserTitleId = review.Id, Content = "malo" };
        db.ReviewComments.Add(comment);
        await db.SaveChangesAsync();
        db.ContentReports.AddRange(
            new ContentReport { ReporterId = beto.Id, TargetType = "comment", TargetId = comment.Id, Reason = "spam" },
            new ContentReport { ReporterId = ana.Id, TargetType = "comment", TargetId = comment.Id, Reason = "acoso" });
        await db.SaveChangesAsync();

        var first = await db.ContentReports.FirstAsync();
        await new AdminReportsController(db).RemoveContent(first.Id);

        Assert.Empty(db.ReviewComments);
        Assert.All(db.ContentReports, r => Assert.Equal("resolved", r.Status));
    }

    [Fact]
    public void IsAdmin_ComesFromConfiguredEmails()
    {
        var config = TestHelpers.CreateConfig(new()
        {
            ["JwtSettings:Key"] = "test_key_test_key_test_key_test_key_1234",
            ["Admin:Emails"] = "Jefe@Mail.com, otro@mail.com"
        });
        var jwt = new JwtTokenService(config);

        Assert.True(jwt.IsAdmin(new User { Email = "jefe@mail.com" }));
        Assert.False(jwt.IsAdmin(new User { Email = "ana@mail.com" }));
    }
}
