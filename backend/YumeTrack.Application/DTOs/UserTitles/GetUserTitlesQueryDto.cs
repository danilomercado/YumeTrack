using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using YumeTrack.Domain.Enums;

namespace YumeTrack.Application.DTOs.UserTitles
{
    public class GetUserTitlesQueryDto
    {  
        public UserTitleStatus? Status { get; set; }
        public bool? FavoritesOnly { get; set; }
    }
}
