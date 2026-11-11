namespace YumeTrack.Domain.Entities
{
    public class Conversation
    {
        public int Id { get; set; }

        // Para chats 1 a 1: "menorId-mayorId". Garantiza una sola conversación por par
        // de usuarios aunque dos pedidos lleguen a la vez. Queda nulo en los grupos.
        public string? DirectKey { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<ConversationParticipant> Participants { get; set; } = new List<ConversationParticipant>();
        public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
    }

    public class ConversationParticipant
    {
        public int Id { get; set; }

        public int ConversationId { get; set; }
        public Conversation Conversation { get; set; } = null!;

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        // Hasta cuándo leyó este usuario; lo posterior de otros cuenta como no leído.
        public DateTime? LastReadAt { get; set; }

        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    }

    public class ChatMessage
    {
        public int Id { get; set; }

        public int ConversationId { get; set; }
        public Conversation Conversation { get; set; } = null!;

        public int SenderId { get; set; }
        public User Sender { get; set; } = null!;

        public string Content { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
