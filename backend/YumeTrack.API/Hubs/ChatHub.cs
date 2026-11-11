using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using YumeTrack.Application.DTOs.Chat;
using YumeTrack.Application.Interfaces;

namespace YumeTrack.API.Hubs;

// Solo empuja mensajes al navegador; enviar y leer pasa por la API REST (ChatController).
[Authorize]
public class ChatHub : Hub
{
}

public class SignalRChatNotifier : IChatNotifier
{
    private readonly IHubContext<ChatHub> _hub;

    public SignalRChatNotifier(IHubContext<ChatHub> hub)
    {
        _hub = hub;
    }

    public Task MessageSentAsync(IEnumerable<int> userIds, ChatMessageDto message) =>
        _hub.Clients
            .Users(userIds.Distinct().Select(id => id.ToString()).ToList())
            .SendAsync("MessageReceived", message);
}
