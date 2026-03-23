using System;

namespace YumeTrack.Application.DTOs.Users
{
    public class MyProfileDto
    {
        public int Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Bio { get; set; }
        public DateTime CreatedAt { get; set; }

        public int FollowersCount { get; set; }
        public int FollowingCount { get; set; }
    }
}