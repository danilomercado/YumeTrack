using System.ComponentModel.DataAnnotations;

namespace YumeTrack.Domain.Entities
{
    // Actividad automática: "empezó a ver", "terminó", "agregó a su lista".
    public class ActivityEvent
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public int TitleId { get; set; }
        public Title Title { get; set; } = null!;

        // "planned", "started" o "completed"
        [Required, MaxLength(20)]
        public string Type { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
