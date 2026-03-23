namespace YumeTrack.Application.DTOs.Users
{
    public class FollowUserDto
    {
        public int Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string? Bio { get; set; }
        public bool IsFollowing { get; set; }
    }
}