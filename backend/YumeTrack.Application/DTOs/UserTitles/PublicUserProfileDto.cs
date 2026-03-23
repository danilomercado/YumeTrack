using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace YumeTrack.Application.DTOs.UserTitles
{
    public class PublicUserProfileDto
    {
        public string UserName { get; set; } = string.Empty;
        public DateTime CreateAdt { get; set; }
        public int TotalTitles { get; set; }
        public int FavoriteCount { get; set; }
        public List<UserTitleListItemDto> Titles { get; set; } = new();

    }
}
