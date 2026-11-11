using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using YumeTrack.API.Controllers;
using YumeTrack.Application.DTOs.Chat;
using YumeTrack.Application.Interfaces;
using YumeTrack.Domain.Entities;
using YumeTrack.Infrastructure.Persistence;

namespace YumeTrack.Tests;

public class NotificationTests
{
    private sealed class NoopNotifier : IChatNotifier
    {
        public Task MessageSentAsync(IEnumerable<int> userIds, ChatMessageDto message) => Task.CompletedTask;
    }

    private static ClaimsPrincipal Principal(int userId) =>
        new(new ClaimsIdentity(
            new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Name, $"user{userId}")
            }, "test"));

    private static ReviewLikesController LikesFor(AppDbContext db, int userId) => new(db)
    {
        ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = Principal(userId) } }
    };

    private static ChatController ChatFor(AppDbContext db, int userId) => new(db, new NoopNotifier())
    {
        ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = Principal(userId) } }
    };

    private static async Task<(AppDbContext Db, User Author, User Fan, UserTitle Review)> SeedAsync()
    {
        var db = TestHelpers.CreateDb();
        var author = new User { UserName = "ana", NormalizedUserName = "ana", Email = "ana@mail.com", PasswordHash = "x" };
        var fan = new User { UserName = "beto", NormalizedUserName = "beto", Email = "beto@mail.com", PasswordHash = "x" };
        var title = new Title { ExternalId = "1", Source = "kitsu", CanonicalTitle = "Cowboy Bebop", MediaType = "anime" };
        db.AddRange(author, fan, title);
        await db.SaveChangesAsync();

        var review = new UserTitle { UserId = author.Id, TitleId = title.Id, Notes = "Genial" };
        db.UserTitles.Add(review);
        await db.SaveChangesAsync();

        return (db, author, fan, review);
    }

    [Fact]
    public async Task ReviewLike_NotifiesTheAuthorOnlyOnce()
    {
        var (db, author, fan, review) = await SeedAsync();
        var likes = LikesFor(db, fan.Id);

        await likes.ToggleLike(review.Id);
        await likes.ToggleLike(review.Id);
        await likes.ToggleLike(review.Id);

        var notice = Assert.Single(db.Notifications);
        Assert.Equal(author.Id, notice.UserId);
        Assert.Equal(fan.Id, notice.ActorUserId);
        Assert.Equal("review_like", notice.Type);
        Assert.Equal(review.Id, notice.UserTitleId);
    }

    [Fact]
    public async Task ReviewLike_OnYourOwnReviewOrFromABlockedUser_DoesNotNotify()
    {
        var (db, author, fan, review) = await SeedAsync();

        await LikesFor(db, author.Id).ToggleLike(review.Id);
        db.UserBlocks.Add(new UserBlock { BlockerId = author.Id, BlockedId = fan.Id });
        await db.SaveChangesAsync();
        await LikesFor(db, fan.Id).ToggleLike(review.Id);

        Assert.Empty(db.Notifications);
    }

    [Fact]
    public async Task ChatMessages_GiveOneNoticePerConversationUntilRead()
    {
        var (db, author, fan, _) = await SeedAsync();
        var fromFan = ChatFor(db, fan.Id);
        var started = (ConversationDto)((OkObjectResult)await fromFan.StartConversation(
            new StartConversationDto { UserId = author.Id })).Value!;

        await fromFan.SendMessage(started.Id, new SendMessageDto { Content = "hola" });
        await fromFan.SendMessage(started.Id, new SendMessageDto { Content = "¿estás?" });

        var notice = Assert.Single(db.Notifications);
        Assert.Equal(author.Id, notice.UserId);
        Assert.Equal(fan.Id, notice.ActorUserId);
        Assert.Equal("chat_message", notice.Type);
        Assert.Equal(started.Id, notice.ConversationId);
        Assert.False(notice.IsRead);

        await ChatFor(db, author.Id).MarkRead(started.Id);
        Assert.True(notice.IsRead);

        // Tras leer, un mensaje nuevo vuelve a avisar.
        await fromFan.SendMessage(started.Id, new SendMessageDto { Content = "otra vez" });
        Assert.Equal(2, db.Notifications.Count());
    }
}
