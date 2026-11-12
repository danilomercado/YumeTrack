using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace YumeTrack.Application.DTOs.UserTitles
{
    public class PublicUserSearchItemDto
    {
        public string UserName { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public int TotalTitles { get; set; }
    }
}
