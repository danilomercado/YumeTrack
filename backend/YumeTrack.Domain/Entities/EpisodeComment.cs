using System.ComponentModel.DataAnnotations;

namespace YumeTrack.Domain.Entities
{
    // Hilo por episodio (o capítulo): se comenta cada uno por separado.
    public class EpisodeComment
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public int TitleId { get; set; }
        public Title Title { get; set; } = null!;

        public int Episode { get; set; }

        [Required, MaxLength(1000)]
        public string Content { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
