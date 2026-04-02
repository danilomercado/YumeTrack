using System;
using System.Collections.Generic;
using System.Text;
using YumeTrack.Domain.Enums;

namespace YumeTrack.Domain.Entities
{
    public class UserTitle
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public int TitleId { get; set; }

        public UserTitleStatus Status { get; set; }
        public int Progress { get; set; }
        public int? Score { get; set; }
        public bool IsFavorite { get; set; }
        public string? Notes { get; set; }

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReviewUpdatedAt { get; set; }


        public ICollection<ReviewLike> ReviewLikes { get; set; } = new List<ReviewLike>();
        public ICollection<ReviewComments> Comments { get; set; } = new List<ReviewComments>();
        public User User { get; set; } = null!;
        public Title Title { get; set; } = null!;

    }
}
