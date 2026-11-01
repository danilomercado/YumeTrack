using System.ComponentModel.DataAnnotations;

namespace YumeTrack.Domain.Entities
{
    // Lista armada por un usuario ("Mis 5 de acción") que se puede compartir por enlace.
    public class UserList
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        // Parte del enlace público: /l/{Token}
        [Required, MaxLength(16)]
        public string Token { get; set; } = string.Empty;

        [Required, MaxLength(80)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(300)]
        public string? Description { get; set; }

        public bool IsPublic { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<UserListItem> Items { get; set; } = new List<UserListItem>();
    }

    public class UserListItem
    {
        public int Id { get; set; }

        public int ListId { get; set; }
        public UserList List { get; set; } = null!;

        public int TitleId { get; set; }
        public Title Title { get; set; } = null!;

        public int Position { get; set; }

        [MaxLength(200)]
        public string? Note { get; set; }

        public DateTime AddedAt { get; set; } = DateTime.UtcNow;
    }
}
