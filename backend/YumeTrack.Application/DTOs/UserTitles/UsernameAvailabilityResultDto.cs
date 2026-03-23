namespace YumeTrack.Application.DTOs.Users
{
    public class UsernameAvailabilityResultDto
    {
        public bool Available { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<string> Suggestions { get; set; } = new();
    }
}