using System;
using System.Collections.Generic;
using System.Security.Cryptography.X509Certificates;
using System.Text;

namespace YumeTrack.Domain.Entities
{
    public class Title
    {
        public int Id { get; set; }
        public string ExternalId { get; set; } = null!;
        public string Source { get; set; } = "kitsu";
        public string CanonicalTitle { get; set; } = null!;
        public string? Synopsis { get; set; }
        public string? PosterImageUrl { get; set; }
        public string MediaType { get; set; } = null!;

        public int? EpisodeCount { get; set; }
        public int? ChapterCount { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<UserTitle> UserTitles { get; set; } = new List<UserTitle>();
    }
}
