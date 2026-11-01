using System.ComponentModel.DataAnnotations;

public class CreateReviewCommentsDto
{
    [MaxLength(1000)]
    public string Content { get; set; } = string.Empty;

    public int? ParentCommentId { get; set; }
}
