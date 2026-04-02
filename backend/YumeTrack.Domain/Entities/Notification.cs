namespace YumeTrack.Domain.Entities
{
    public class Notification
    {
        public int Id { get; set; }

        public int UserId { get; set; } // destinatario
        public User User { get; set; } = null!;

        public int ActorUserId { get; set; } // quien hizo la acción
        public User ActorUser { get; set; } = null!;

        public string Type { get; set; } = "follow";

        public bool IsRead { get; set; } = false;

        public int ? UserTitleId { get; set; } // para notificaciones relacionadas con títulos

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}