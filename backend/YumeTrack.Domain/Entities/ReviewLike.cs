using System.ComponentModel.DataAnnotations;

namespace YumeTrack.Domain.Entities
{
    public class ReviewLike
    {
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public int UserTitleId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User User { get; set; } = null!;
        public UserTitle UserTitle { get; set; } = null!;
    }
}