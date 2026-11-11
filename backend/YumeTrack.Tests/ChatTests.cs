using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YumeTrack.API.Controllers;
using YumeTrack.Application.DTOs.Chat;
using YumeTrack.Application.Interfaces;
using YumeTrack.Domain.Entities;
using YumeTrack.Infrastructure.Persistence;

namespace YumeTrack.Tests;

public class ChatTests
{
    private sealed class FakeNotifier : IChatNotifier
    {
        public List<(int[] Users, ChatMessageDto Message)> Sent { get; } = new();

        public Task MessageSentAsync(IEnumerable<int> userIds, ChatMessageDto message)
        {
            Sent.Add((userIds.ToArray(), message));
            return Task.CompletedTask;
        }
    }

    private sealed class FailingNotifier : IChatNotifier
    {
        public Task MessageSentAsync(IEnumerable<int> userIds, ChatMessageDto message) =>
            throw new InvalidOperationException("hub caído");
    }

    private static ChatController ControllerFor(AppDbContext db, int userId, IChatNotifier? notifier = null) =>
        new(db, notifier ?? new FakeNotifier())
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(
                        new[]
                        {
                            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                            new Claim(ClaimTypes.Name, $"user{userId}")
                        }, "test"))
                }
            }
        };

    private static async Task<(AppDbContext Db, User A, User B, User C)> SeedAsync()
    {
        var db = TestHelpers.CreateDb();
        var a = new User { UserName = "ana", NormalizedUserName = "ana", Email = "ana@mail.com", PasswordHash = "x" };
        var b = new User { UserName = "beto", NormalizedUserName = "beto", Email = "beto@mail.com", PasswordHash = "x" };
        var c = new User { UserName = "cami", NormalizedUserName = "cami", Email = "cami@mail.com", PasswordHash = "x" };
        db.Users.AddRange(a, b, c);
        await db.SaveChangesAsync();
        return (db, a, b, c);
    }

    private static async Task<int> StartAsync(ChatController controller, int otherId)
    {
        var result = await controller.StartConversation(new StartConversationDto { UserId = otherId });
        return ((ConversationDto)((OkObjectResult)result).Value!).Id;
    }

    [Fact]
    public async Task StartConversation_ReusesTheSameConversationForBothUsers()
    {
        var (db, a, b, _) = await SeedAsync();

        var first = await StartAsync(ControllerFor(db, a.Id), b.Id);
        var again = await StartAsync(ControllerFor(db, a.Id), b.Id);
        var fromOtherSide = await StartAsync(ControllerFor(db, b.Id), a.Id);

        Assert.Equal(first, again);
        Assert.Equal(first, fromOtherSide);
        Assert.Single(db.Conversations);
        Assert.Equal(2, db.ConversationParticipants.Count());
    }

    [Fact]
    public async Task StartConversation_RejectsSelfUnknownAndBlockedUsers()
    {
        var (db, a, b, _) = await SeedAsync();
        var controller = ControllerFor(db, a.Id);
        db.UserBlocks.Add(new UserBlock { BlockerId = b.Id, BlockedId = a.Id });
        await db.SaveChangesAsync();

        var self = await controller.StartConversation(new StartConversationDto { UserId = a.Id });
        var unknown = await controller.StartConversation(new StartConversationDto { UserId = 999 });
        var blocked = await controller.StartConversation(new StartConversationDto { UserId = b.Id });

        Assert.IsType<BadRequestObjectResult>(self);
        Assert.IsType<NotFoundObjectResult>(unknown);
        Assert.Equal(403, ((ObjectResult)blocked).StatusCode);
        Assert.Empty(db.Conversations);
    }

    [Fact]
    public async Task SendMessage_StoresItAndNotifiesBothUsers()
    {
        var (db, a, b, _) = await SeedAsync();
        var notifier = new FakeNotifier();
        var controller = ControllerFor(db, a.Id, notifier);
        var conversationId = await StartAsync(controller, b.Id);

        var result = await controller.SendMessage(conversationId, new SendMessageDto { Content = "  Hola  " });

        var message = (ChatMessageDto)((OkObjectResult)result).Value!;
        Assert.Equal("Hola", message.Content);
        Assert.Single(db.ChatMessages);
        var sent = Assert.Single(notifier.Sent);
        Assert.Equal(new[] { a.Id, b.Id }, sent.Users);
    }

    [Fact]
    public async Task SendMessage_StillWorksWhenTheLiveNotificationFails()
    {
        var (db, a, b, _) = await SeedAsync();
        var controller = ControllerFor(db, a.Id, new FailingNotifier());
        var conversationId = await StartAsync(controller, b.Id);

        var result = await controller.SendMessage(conversationId, new SendMessageDto { Content = "Hola" });

        Assert.IsType<OkObjectResult>(result);
        Assert.Single(db.ChatMessages);
    }

    [Fact]
    public async Task SendMessage_RejectsEmptyBlockedAndOutsiders()
    {
        var (db, a, b, c) = await SeedAsync();
        var controller = ControllerFor(db, a.Id);
        var conversationId = await StartAsync(controller, b.Id);

        var empty = await controller.SendMessage(conversationId, new SendMessageDto { Content = "   " });
        var tooLong = await controller.SendMessage(conversationId, new SendMessageDto { Content = new string('x', 2001) });
        var outsider = await ControllerFor(db, c.Id).SendMessage(conversationId, new SendMessageDto { Content = "hola" });

        db.UserBlocks.Add(new UserBlock { BlockerId = b.Id, BlockedId = a.Id });
        await db.SaveChangesAsync();
        var blocked = await controller.SendMessage(conversationId, new SendMessageDto { Content = "hola" });

        Assert.IsType<BadRequestObjectResult>(empty);
        Assert.IsType<BadRequestObjectResult>(tooLong);
        Assert.IsType<NotFoundResult>(outsider);
        Assert.Equal(403, ((ObjectResult)blocked).StatusCode);
        Assert.Empty(db.ChatMessages);
    }

    [Fact]
    public async Task Conversations_ShowLastMessageAndUnreadUntilMarkedRead()
    {
        var (db, a, b, _) = await SeedAsync();
        var fromAna = ControllerFor(db, a.Id);
        var conversationId = await StartAsync(fromAna, b.Id);
        await fromAna.SendMessage(conversationId, new SendMessageDto { Content = "uno" });
        await fromAna.SendMessage(conversationId, new SendMessageDto { Content = "dos" });

        var beto = ControllerFor(db, b.Id);
        var before = (List<ConversationDto>)((OkObjectResult)await beto.GetConversations()).Value!;
        var unreadBefore = (int)((OkObjectResult)await beto.UnreadCount()).Value!;
        await beto.MarkRead(conversationId);
        var after = (List<ConversationDto>)((OkObjectResult)await beto.GetConversations()).Value!;
        var unreadAfter = (int)((OkObjectResult)await beto.UnreadCount()).Value!;
        var ana = (List<ConversationDto>)((OkObjectResult)await fromAna.GetConversations()).Value!;

        var row = Assert.Single(before);
        Assert.Equal("ana", row.OtherUserName);
        Assert.Equal("dos", row.LastMessage);
        Assert.Equal(2, row.UnreadCount);
        Assert.Equal(2, unreadBefore);
        Assert.Equal(0, Assert.Single(after).UnreadCount);
        Assert.Equal(0, unreadAfter);
        Assert.Equal(0, Assert.Single(ana).UnreadCount);
        Assert.True(Assert.Single(ana).LastMessageIsMine);
    }

    [Fact]
    public async Task Conversations_HideEmptyOnesAndBlockedUsers()
    {
        var (db, a, b, c) = await SeedAsync();
        var controller = ControllerFor(db, a.Id);
        await StartAsync(controller, b.Id);
        var withCami = await StartAsync(controller, c.Id);
        await controller.SendMessage(withCami, new SendMessageDto { Content = "hola" });

        var visible = (List<ConversationDto>)((OkObjectResult)await controller.GetConversations()).Value!;

        db.UserBlocks.Add(new UserBlock { BlockerId = a.Id, BlockedId = c.Id });
        await db.SaveChangesAsync();
        var afterBlock = (List<ConversationDto>)((OkObjectResult)await controller.GetConversations()).Value!;

        Assert.Equal("cami", Assert.Single(visible).OtherUserName);
        Assert.Empty(afterBlock);
    }

    [Fact]
    public async Task GetMessages_PagesBackwardsAndKeepsChronologicalOrder()
    {
        var (db, a, b, c) = await SeedAsync();
        var controller = ControllerFor(db, a.Id);
        var conversationId = await StartAsync(controller, b.Id);

        for (var i = 1; i <= 5; i++)
            await controller.SendMessage(conversationId, new SendMessageDto { Content = $"m{i}" });

        var newest = (OkObjectResult)await controller.GetMessages(conversationId, limit: 2);
        var firstPage = ((IEnumerable<ChatMessageDto>)newest.Value!.GetType().GetProperty("items")!.GetValue(newest.Value)!).ToList();
        var hasMore = (bool)newest.Value!.GetType().GetProperty("hasMore")!.GetValue(newest.Value)!;

        var older = (OkObjectResult)await controller.GetMessages(conversationId, before: firstPage[0].Id, limit: 10);
        var secondPage = ((IEnumerable<ChatMessageDto>)older.Value!.GetType().GetProperty("items")!.GetValue(older.Value)!).ToList();
        var outsider = await ControllerFor(db, c.Id).GetMessages(conversationId);

        Assert.Equal(new[] { "m4", "m5" }, firstPage.Select(m => m.Content));
        Assert.True(hasMore);
        Assert.Equal(new[] { "m1", "m2", "m3" }, secondPage.Select(m => m.Content));
        Assert.IsType<NotFoundResult>(outsider);
    }

    [Fact]
    public async Task People_WithoutQueryListsFollowersAndFollowing_WithQuerySearchesByName()
    {
        var (db, a, b, c) = await SeedAsync();
        var d = new User { UserName = "dani", NormalizedUserName = "dani", Email = "d@mail.com", PasswordHash = "x" };
        db.Users.Add(d);
        db.UserFollows.AddRange(
            new UserFollow { FollowerId = a.Id, FollowingId = b.Id },
            new UserFollow { FollowerId = c.Id, FollowingId = a.Id });
        await db.SaveChangesAsync();
        var controller = ControllerFor(db, a.Id);

        var known = ((IEnumerable<ChatPersonDto>)((OkObjectResult)await controller.GetPeople()).Value!).ToList();
        var search = ((IEnumerable<ChatPersonDto>)((OkObjectResult)await controller.GetPeople("DA")).Value!).ToList();

        Assert.Equal(new[] { "beto", "cami" }, known.Select(p => p.UserName));
        Assert.True(known.Single(p => p.UserName == "beto").IsFollowing);
        Assert.True(known.Single(p => p.UserName == "cami").FollowsMe);
        var found = Assert.Single(search);
        Assert.Equal("dani", found.UserName);
        Assert.False(found.IsFollowing);
    }

    [Fact]
    public async Task People_ExcludeSelfAndBlockedUsers()
    {
        var (db, a, b, c) = await SeedAsync();
        db.UserBlocks.Add(new UserBlock { BlockerId = b.Id, BlockedId = a.Id });
        await db.SaveChangesAsync();

        var result = ((IEnumerable<ChatPersonDto>)((OkObjectResult)await ControllerFor(db, a.Id).GetPeople("a")).Value!).ToList();

        Assert.Equal(new[] { "cami" }, result.Select(p => p.UserName));
    }
}
