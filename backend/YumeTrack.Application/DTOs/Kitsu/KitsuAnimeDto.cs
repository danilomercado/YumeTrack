namespace YumeTrack.Application.DTOs.Kitsu
{
    public class KitsuAnimeDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Synopsis { get; set; }
        public string? PosterImage { get; set; }
        public string MediaType { get; set; } = "anime";
        public int? EpisodeCount { get; set; }
        public int? ChapterCount { get; set; }
    }
}