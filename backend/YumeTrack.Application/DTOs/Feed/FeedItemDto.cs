namespace YumeTrack.Application.DTOs.Feed
{
    public class FeedItemDto
    {
        public int UserTitleId { get; set; }
        public int UserId { get; set; }

        public string UserName { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }

        public string CanonicalTitle { get; set; } = string.Empty;
        public string? PosterImageUrl { get; set; }
        public string MediaType { get; set; } = string.Empty;

        public int? Score { get; set; }
        public string? Review { get; set; }

        public DateTime ReviewUpdatedAt { get; set; }
        public int LikesCount { get; set; }
        public bool IsLikedByCurrentUser { get; set; }
        public int CommentsCount { get; set; }
        public bool IsFollowingAuthor { get; set; }
    }
}