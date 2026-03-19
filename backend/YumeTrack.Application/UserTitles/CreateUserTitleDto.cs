using System;
using System.Collections.Generic;
using System.Text;
using YumeTrack.Domain.Enums;

namespace YumeTrack.Application.UserTitles
{
    public class CreateUserTitleDto
    {
        public int TitleId { get; set; }
        public UserTitleStatus Status { get; set; }
    }
}
