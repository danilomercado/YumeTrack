namespace YumeTrack.Application.DTOs.Users
{
    public class FollowStatusDto
    {
        public bool IsFollowing { get; set; }
        public int FollowersCount { get; set; }
        public int FollowingCount { get; set; }
    }
}