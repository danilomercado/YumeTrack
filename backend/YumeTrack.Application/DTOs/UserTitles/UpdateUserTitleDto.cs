using System;
using System.Collections.Generic;
using System.Text;
using YumeTrack.Domain.Enums;

namespace YumeTrack.Application.DTOs.UserTitles
{
    public class UpdateUserTitleDto
    {
        public UserTitleStatus Status { get; set; }
        public int Progress { get; set; }
        public int? Score { get; set; }
        public bool IsFavorite { get; set; }
        public string? Notes { get; set; }
    }
}
