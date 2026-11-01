public class ReviewCommentsDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int? ParentCommentId { get; set; }
    public List<ReactionCountDto> Reactions { get; set; } = new();
    public string? MyReaction { get; set; }
}

public class ReactionCountDto
{
    public string Key { get; set; } = string.Empty;
    public int Count { get; set; }
}
