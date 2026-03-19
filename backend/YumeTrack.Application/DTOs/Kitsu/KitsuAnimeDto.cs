using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace YumeTrack.Application.DTOs.Kitsu
{
    public class KitsuAnimeDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? PosterImage { get; set; }
    }
}
