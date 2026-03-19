using System;
using System.Collections.Generic;
using System.Text;
using YumeTrack.Domain.Enums;

namespace YumeTrack.Application.UserTitles
{
    public class UpdateUserTitleDto
    {
        public UserTitleStatus Status { get; set; }
        public int Progress { get; set; }
        public int? Score { get; set; }
        public bool IsFavorite { get; set; }
    }
}
