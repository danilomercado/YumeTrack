using YumeTrack.Domain.Enums;

namespace YumeTrack.Application.DTOs.UserTitles
{
    public class CreateUserTitleDto
    {
        public int KitsuId { get; set; }
        public string MediaType { get; set; } = "anime";
        public UserTitleStatus Status { get; set; }
        public bool IsFavorite { get; set; }
    }
}