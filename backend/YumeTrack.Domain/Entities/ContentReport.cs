using System.ComponentModel.DataAnnotations;

namespace YumeTrack.Domain.Entities
{
    public class ContentReport
    {
        public int Id { get; set; }

        public int ReporterId { get; set; }
        public User Reporter { get; set; } = null!;

        // "review", "comment" o "user"
        [Required, MaxLength(20)]
        public string TargetType { get; set; } = string.Empty;

        public int TargetId { get; set; }

        [Required, MaxLength(30)]
        public string Reason { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Details { get; set; }

        // "open" hasta que alguien lo revise
        [Required, MaxLength(20)]
        public string Status { get; set; } = "open";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
