using System.ComponentModel.DataAnnotations;

namespace YumeTrack.Domain.Entities
{
    public class CommentReaction
    {
        public int Id { get; set; }

        public int CommentId { get; set; }
        public ReviewComments Comment { get; set; } = null!;

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        // like, laugh, wow, sad, fire
        [Required, MaxLength(10)]
        public string Key { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
