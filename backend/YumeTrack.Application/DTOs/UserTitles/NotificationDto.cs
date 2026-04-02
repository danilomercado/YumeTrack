namespace YumeTrack.Application.DTOs.Notifications
{
    public class NotificationDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public bool IsRead { get; set; }

        public string ActorUserName { get; set; } = string.Empty;
        public int? UserTitleId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}