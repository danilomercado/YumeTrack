using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using YumeTrack.Application.DTOs.Chat;
using YumeTrack.Application.Interfaces;
using YumeTrack.Domain.Entities;
using YumeTrack.Infrastructure.Persistence;

namespace YumeTrack.API.Controllers;

[ApiController]
[Authorize]
[Route("api/chat")]
[EnableRateLimiting("chat")]
public class ChatController : ControllerBase
{
    private const int DefaultPageSize = 30;

    private readonly AppDbContext _context;
    private readonly IChatNotifier _notifier;

    public ChatController(AppDbContext context, IChatNotifier notifier)
    {
        _context = context;
        _notifier = notifier;
    }

    private int RequireUserId() =>
        int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id)
            ? id
            : throw new UnauthorizedAccessException("Token inválido.");

    private Task<bool> AreBlockedAsync(int a, int b) =>
        _context.UserBlocks.AnyAsync(x =>
            (x.BlockerId == a && x.BlockedId == b) || (x.BlockerId == b && x.BlockedId == a));

    private static string DirectKey(int a, int b) => $"{Math.Min(a, b)}-{Math.Max(a, b)}";

    // ---------- Personas ----------

    // Sin texto devuelve a quienes seguís y te siguen; con texto busca por nombre de usuario.
    [HttpGet("people")]
    public async Task<IActionResult> GetPeople([FromQuery] string? q = null)
    {
        var me = RequireUserId();
        var term = q?.Trim().ToLower() ?? string.Empty;

        var blocked = await _context.UserBlocks
            .Where(b => b.BlockerId == me || b.BlockedId == me)
            .Select(b => b.BlockerId == me ? b.BlockedId : b.BlockerId)
            .ToListAsync();

        var iFollow = await _context.UserFollows
            .Where(f => f.FollowerId == me)
            .Select(f => f.FollowingId)
            .ToListAsync();

        var followMe = await _context.UserFollows
            .Where(f => f.FollowingId == me)
            .Select(f => f.FollowerId)
            .ToListAsync();

        var people = _context.Users.Where(u => u.Id != me && !blocked.Contains(u.Id));

        people = term.Length == 0
            ? people.Where(u => iFollow.Contains(u.Id) || followMe.Contains(u.Id))
            : people.Where(u => u.UserName.ToLower().Contains(term));

        var users = await people
            .OrderBy(u => u.UserName)
            .Take(term.Length == 0 ? 30 : 15)
            .Select(u => new { u.Id, u.UserName, u.AvatarUrl })
            .ToListAsync();

        return Ok(users.Select(u => new ChatPersonDto
        {
            Id = u.Id,
            UserName = u.UserName,
            AvatarUrl = u.AvatarUrl,
            IsFollowing = iFollow.Contains(u.Id),
            FollowsMe = followMe.Contains(u.Id)
        }));
    }

    // ---------- Conversaciones ----------

    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations()
    {
        var me = RequireUserId();

        var rows = await _context.ConversationParticipants
            .Where(p => p.UserId == me)
            .Select(p => new
            {
                p.ConversationId,
                Other = p.Conversation.Participants
                    .Where(o => o.UserId != me)
                    .Select(o => new { o.UserId, o.User.UserName, o.User.AvatarUrl })
                    .FirstOrDefault(),
                Last = p.Conversation.Messages
                    .OrderByDescending(m => m.CreatedAt)
                    .Select(m => new { m.Content, m.CreatedAt, m.SenderId })
                    .FirstOrDefault(),
                Unread = p.Conversation.Messages
                    .Count(m => m.SenderId != me && (p.LastReadAt == null || m.CreatedAt > p.LastReadAt))
            })
            .Where(r => r.Last != null && r.Other != null)
            .ToListAsync();

        var blocked = await _context.UserBlocks
            .Where(b => b.BlockerId == me || b.BlockedId == me)
            .Select(b => b.BlockerId == me ? b.BlockedId : b.BlockerId)
            .ToListAsync();

        var conversations = rows
            .Where(r => !blocked.Contains(r.Other!.UserId))
            .OrderByDescending(r => r.Last!.CreatedAt)
            .Select(r => new ConversationDto
            {
                Id = r.ConversationId,
                OtherUserId = r.Other!.UserId,
                OtherUserName = r.Other.UserName,
                OtherAvatarUrl = r.Other.AvatarUrl,
                LastMessage = r.Last!.Content,
                LastMessageAt = r.Last.CreatedAt,
                LastMessageIsMine = r.Last.SenderId == me,
                UnreadCount = r.Unread
            })
            .ToList();

        return Ok(conversations);
    }

    [HttpPost("conversations")]
    public async Task<IActionResult> StartConversation([FromBody] StartConversationDto dto)
    {
        var me = RequireUserId();

        if (dto.UserId == me)
            return BadRequest(new { message = "No podés chatear con vos mismo." });

        var other = await _context.Users
            .Where(u => u.Id == dto.UserId)
            .Select(u => new { u.Id, u.UserName, u.AvatarUrl })
            .FirstOrDefaultAsync();

        if (other is null)
            return NotFound(new { message = "Usuario no encontrado." });

        if (await AreBlockedAsync(me, other.Id))
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "No podés escribirle a este usuario." });

        var key = DirectKey(me, other.Id);
        var conversationId = await _context.Conversations
            .Where(c => c.DirectKey == key)
            .Select(c => (int?)c.Id)
            .FirstOrDefaultAsync();

        if (conversationId is null)
        {
            var conversation = new Conversation
            {
                DirectKey = key,
                Participants =
                {
                    new ConversationParticipant { UserId = me },
                    new ConversationParticipant { UserId = other.Id }
                }
            };

            _context.Conversations.Add(conversation);

            try
            {
                await _context.SaveChangesAsync();
                conversationId = conversation.Id;
            }
            catch (DbUpdateException)
            {
                // Otro pedido la creó al mismo tiempo: se usa esa.
                _context.ChangeTracker.Clear();
                conversationId = await _context.Conversations
                    .Where(c => c.DirectKey == key)
                    .Select(c => (int?)c.Id)
                    .FirstAsync();
            }
        }

        return Ok(new ConversationDto
        {
            Id = conversationId!.Value,
            OtherUserId = other.Id,
            OtherUserName = other.UserName,
            OtherAvatarUrl = other.AvatarUrl
        });
    }

    // ---------- Mensajes ----------

    [HttpGet("conversations/{id:int}/messages")]
    public async Task<IActionResult> GetMessages(int id, [FromQuery] int? before = null, [FromQuery] int limit = DefaultPageSize)
    {
        var me = RequireUserId();
        limit = Math.Clamp(limit, 1, 100);

        var otherId = await GetOtherParticipantAsync(id, me);

        if (otherId is null)
            return NotFound();

        if (await AreBlockedAsync(me, otherId.Value))
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "No podés ver esta conversación." });

        var query = _context.ChatMessages.Where(m => m.ConversationId == id);

        if (before.HasValue)
            query = query.Where(m => m.Id < before.Value);

        // Se piden los más recientes y se devuelven en orden cronológico.
        var page = await query
            .OrderByDescending(m => m.Id)
            .Take(limit + 1)
            .Select(m => new ChatMessageDto
            {
                Id = m.Id,
                ConversationId = m.ConversationId,
                SenderId = m.SenderId,
                SenderUserName = m.Sender.UserName,
                Content = m.Content,
                CreatedAt = m.CreatedAt
            })
            .ToListAsync();

        var hasMore = page.Count > limit;

        return Ok(new
        {
            items = page.Take(limit).OrderBy(m => m.Id).ToList(),
            hasMore
        });
    }

    [HttpPost("conversations/{id:int}/messages")]
    public async Task<IActionResult> SendMessage(int id, [FromBody] SendMessageDto dto)
    {
        var me = RequireUserId();
        var content = dto.Content?.Trim() ?? string.Empty;

        if (content.Length == 0 || content.Length > 2000)
            return BadRequest(new { message = "El mensaje no puede estar vacío ni superar los 2000 caracteres." });

        var otherId = await GetOtherParticipantAsync(id, me);

        if (otherId is null)
            return NotFound();

        if (await AreBlockedAsync(me, otherId.Value))
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "No podés escribirle a este usuario." });

        var message = new ChatMessage { ConversationId = id, SenderId = me, Content = content };
        _context.ChatMessages.Add(message);

        // Un solo aviso por conversación mientras no lo lea: los mensajes siguientes lo suben al tope.
        var pendingNotice = await _context.Notifications.FirstOrDefaultAsync(n =>
            n.UserId == otherId.Value &&
            n.ActorUserId == me &&
            n.Type == "chat_message" &&
            n.ConversationId == id &&
            !n.IsRead);

        if (pendingNotice is null)
        {
            _context.Notifications.Add(new Notification
            {
                UserId = otherId.Value,
                ActorUserId = me,
                Type = "chat_message",
                ConversationId = id
            });
        }
        else
        {
            pendingNotice.CreatedAt = message.CreatedAt;
        }

        // Quien escribe ya leyó todo lo anterior.
        var mine = await _context.ConversationParticipants
            .FirstAsync(p => p.ConversationId == id && p.UserId == me);
        mine.LastReadAt = message.CreatedAt;

        await _context.SaveChangesAsync();

        var result = new ChatMessageDto
        {
            Id = message.Id,
            ConversationId = id,
            SenderId = me,
            SenderUserName = User.FindFirst(ClaimTypes.Name)?.Value ?? string.Empty,
            Content = message.Content,
            CreatedAt = message.CreatedAt
        };

        // El aviso en vivo es un extra: si falla, el mensaje ya quedó guardado.
        try
        {
            await _notifier.MessageSentAsync(new[] { me, otherId.Value }, result);
        }
        catch (Exception)
        {
        }

        return Ok(result);
    }

    [HttpPost("conversations/{id:int}/read")]
    public async Task<IActionResult> MarkRead(int id)
    {
        var me = RequireUserId();

        var participant = await _context.ConversationParticipants
            .FirstOrDefaultAsync(p => p.ConversationId == id && p.UserId == me);

        if (participant is null)
            return NotFound();

        participant.LastReadAt = DateTime.UtcNow;

        // Leer la conversación también apaga sus avisos en la campana.
        var notices = await _context.Notifications
            .Where(n => n.UserId == me && n.Type == "chat_message" && n.ConversationId == id && !n.IsRead)
            .ToListAsync();

        foreach (var notice in notices)
            notice.IsRead = true;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> UnreadCount()
    {
        var me = RequireUserId();

        var blocked = await _context.UserBlocks
            .Where(b => b.BlockerId == me || b.BlockedId == me)
            .Select(b => b.BlockerId == me ? b.BlockedId : b.BlockerId)
            .ToListAsync();

        var count = await _context.ConversationParticipants
            .Where(p => p.UserId == me)
            .SelectMany(p => p.Conversation.Messages
                .Where(m => m.SenderId != me &&
                            !blocked.Contains(m.SenderId) &&
                            (p.LastReadAt == null || m.CreatedAt > p.LastReadAt)))
            .CountAsync();

        return Ok(count);
    }

    // Devuelve el otro integrante si el usuario participa de la conversación (chats 1 a 1).
    private async Task<int?> GetOtherParticipantAsync(int conversationId, int me)
    {
        var participants = await _context.ConversationParticipants
            .Where(p => p.ConversationId == conversationId)
            .Select(p => p.UserId)
            .ToListAsync();

        if (!participants.Contains(me))
            return null;

        return participants.Where(userId => userId != me).Select(userId => (int?)userId).FirstOrDefault();
    }
}
