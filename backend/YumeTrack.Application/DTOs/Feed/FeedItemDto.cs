namespace YumeTrack.Application.DTOs.Feed
{
    public class FeedItemDto
    {
        public int UserTitleId { get; set; }

        public string UserName { get; set; } = string.Empty;

        public string CanonicalTitle { get; set; } = string.Empty;
        public string? PosterImageUrl { get; set; }
        public string MediaType { get; set; } = string.Empty;

        public int? Score { get; set; }
        public string? Review { get; set; }

        public DateTime ReviewUpdatedAt { get; set; }
    }
}