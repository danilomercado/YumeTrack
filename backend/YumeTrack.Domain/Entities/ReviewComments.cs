using System;
namespace YumeTrack.Domain.Entities
{
    public class ReviewComments
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public int UserTitleId { get; set; }

        public string Content { get; set; } = string.Empty;

        // Respuesta a otro comentario (un solo nivel de anidación).
        public int? ParentCommentId { get; set; }

        public ICollection<CommentReaction> Reactions { get; set; } = new List<CommentReaction>();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User User { get; set; } = null!;
        public UserTitle UserTitle { get; set; } = null!;
    }
}