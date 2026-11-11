using System.ComponentModel.DataAnnotations;

namespace YumeTrack.Application.DTOs.Chat
{
    public class StartConversationDto
    {
        public int UserId { get; set; }
    }

    public class SendMessageDto
    {
        [Required]
        [MaxLength(2000)]
        public string Content { get; set; } = string.Empty;
    }

    public class ConversationDto
    {
        public int Id { get; set; }
        public int OtherUserId { get; set; }
        public string OtherUserName { get; set; } = string.Empty;
        public string? LastMessage { get; set; }
        public DateTime? LastMessageAt { get; set; }
        public bool LastMessageIsMine { get; set; }
        public int UnreadCount { get; set; }
    }

    public class ChatPersonDto
    {
        public int Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public bool IsFollowing { get; set; }
        public bool FollowsMe { get; set; }
    }

    public class ChatMessageDto
    {
        public int Id { get; set; }
        public int ConversationId { get; set; }
        public int SenderId { get; set; }
        public string SenderUserName { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
