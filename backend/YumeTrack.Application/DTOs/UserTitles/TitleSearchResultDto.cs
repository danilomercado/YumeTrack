using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace YumeTrack.Application.DTOs.UserTitles
{
    public class TitleSearchResultDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Synopsis { get; set; }
        public string? PosterImage { get; set; }
        public string? MediaType { get; set; }
        public string? Status { get; set; }
        public string? StartDate { get; set; }
        public int? EpisodeCount { get; set; }
        public int? ChapterCount { get; set; }
    }
}
