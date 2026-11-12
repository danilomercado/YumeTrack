using System.ComponentModel.DataAnnotations;

namespace YumeTrack.Application.DTOs.Social
{
    public class CreateReportDto
    {
        [Required]
        public string TargetType { get; set; } = string.Empty;

        public int TargetId { get; set; }

        [Required]
        public string Reason { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Details { get; set; }
    }

    public class BlockedUserDto
    {
        public int Id { get; set; }
        public string UserName { get; set; } = string.Empty;
    }

    public class ActivityItemDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string TitleName { get; set; } = string.Empty;
        public string? PosterImageUrl { get; set; }
        public string MediaType { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class SuggestedUserDto
    {
        public int Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public int FollowersCount { get; set; }
        public int TitlesCount { get; set; }
    }

    public class ProfileStatsDto
    {
        public int Total { get; set; }
        public int Planned { get; set; }
        public int Watching { get; set; }
        public int Completed { get; set; }
        public int OnHold { get; set; }
        public int Dropped { get; set; }
        public int Anime { get; set; }
        public int Manga { get; set; }
        public int Reviews { get; set; }
        public double? AverageScore { get; set; }
    }
}
