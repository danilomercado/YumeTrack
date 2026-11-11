using YumeTrack.Application.DTOs.Chat;

namespace YumeTrack.Application.Interfaces
{
    public interface IChatNotifier
    {
        // Avisa en tiempo real a los usuarios conectados que llegó un mensaje.
        Task MessageSentAsync(IEnumerable<int> userIds, ChatMessageDto message);
    }
}
