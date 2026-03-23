using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace YumeTrack.Application.DTOs.UserTitles
{
    public class PublicUserProfileDto
    {
        public int Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string? Bio { get; set; }
        public DateTime CreatedAt { get; set; }

        public int TotalTitles { get; set; }
        public int FavoritesCount { get; set; }

        public int FollowersCount { get; set; }
        public int FollowingCount { get; set; }
        public bool IsFollowing { get; set; }

        public List<UserTitleListItemDto> Titles { get; set; } = new();

    }
}
