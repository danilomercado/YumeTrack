namespace YumeTrack.Domain.Entities
{
    public class MediaTranslation
    {
        public int Id { get; set; }

        public string KitsuId { get; set; } = string.Empty;
        public string MediaType { get; set; } = string.Empty; // anime o manga
        public string Language { get; set; } = string.Empty;  // es

        public string OriginalSynopsis { get; set; } = string.Empty;
        public string TranslatedSynopsis { get; set; } = string.Empty;

        public DateTime CreatedAtUtc { get; set; }
        public DateTime UpdatedAtUtc { get; set; }
    }
}