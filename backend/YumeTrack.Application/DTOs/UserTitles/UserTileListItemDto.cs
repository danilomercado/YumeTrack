using YumeTrack.Domain.Enums;

namespace YumeTrack.Application.DTOs.UserTitles
{
    public class UserTitleListItemDto
    {
        public int Id { get; set; }
        public UserTitleStatus Status { get; set; }
        public int Progress { get; set; }
        public int? Score { get; set; }
        public bool IsFavorite { get; set; }

        public string CanonicalTitle { get; set; } = string.Empty;
        public string? PosterImageUrl { get; set; }
        public string MediaType { get; set; } = string.Empty;
        public int? EpisodeCount { get; set; }
        public int? ChapterCount { get; set; }
        public string? Notes { get; set; }
    }
}