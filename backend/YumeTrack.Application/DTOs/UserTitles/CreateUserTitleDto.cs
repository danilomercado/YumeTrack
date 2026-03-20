using YumeTrack.Domain.Enums;

namespace YumeTrack.Application.DTOs.UserTitles
{
    public class CreateUserTitleDto
    {
        public int KitsuId { get; set; }
        public UserTitleStatus Status { get; set; } = UserTitleStatus.Planned;
        public bool IsFavorite { get; set; } = false;
    }
}