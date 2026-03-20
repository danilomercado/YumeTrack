using System.Text.Json;
using YumeTrack.Application.DTOs.Kitsu;
using YumeTrack.Application.Interfaces;

namespace YumeTrack.Infrastructure.Services
{
    public class KitsuService : IKitsuService
    {
        private readonly HttpClient _httpClient;

        public KitsuService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<List<KitsuAnimeDto>> SearchAnimeAsync(string query)
        {
            var response = await _httpClient.GetAsync(
                $"anime?filter[text]={Uri.EscapeDataString(query)}&page[limit]=10"
            );

            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();

            using var doc = JsonDocument.Parse(json);

            var result = new List<KitsuAnimeDto>();

            foreach (var item in doc.RootElement.GetProperty("data").EnumerateArray())
            {
                if (!item.TryGetProperty("attributes", out var attributes))
                    continue;

                var title = attributes.TryGetProperty("canonicalTitle", out var titleProp)
                    ? titleProp.GetString()
                    : "Sin título";

                var synopsis = attributes.TryGetProperty("synopsis", out var synopsisProp)
                    ? synopsisProp.GetString()
                    : null;

                var poster = attributes.TryGetProperty("posterImage", out var posterProp) &&
                             posterProp.TryGetProperty("medium", out var mediumProp)
                    ? mediumProp.GetString()
                    : null;

                int? episodeCount = attributes.TryGetProperty("episodeCount", out var episodeProp) &&
                                    episodeProp.ValueKind != JsonValueKind.Null
                    ? episodeProp.GetInt32()
                    : (int?)null;

                int? chapterCount = attributes.TryGetProperty("chapterCount", out var chapterProp) &&
                                    chapterProp.ValueKind != JsonValueKind.Null
                    ? chapterProp.GetInt32()
                    : (int?)null;

                var id = int.TryParse(item.GetProperty("id").GetString(), out var parsedId)
                    ? parsedId
                    : 0;

                result.Add(new KitsuAnimeDto
                {
                    Id = id,
                    Title = title ?? "Sin título",
                    Synopsis = synopsis,
                    PosterImage = poster,
                    MediaType = "anime",
                    EpisodeCount = episodeCount,
                    ChapterCount = chapterCount
                });
            }

            return result;
        }

        public async Task<KitsuAnimeDto?> GetAnimeByIdAsync(int id)
        {
            var response = await _httpClient.GetAsync($"anime/{id}");

            if (!response.IsSuccessStatusCode)
                return null;

            var json = await response.Content.ReadAsStringAsync();

            using var doc = JsonDocument.Parse(json);

            var data = doc.RootElement.GetProperty("data");

            if (!data.TryGetProperty("attributes", out var attributes))
                return null;

            var title = attributes.TryGetProperty("canonicalTitle", out var titleProp)
                ? titleProp.GetString()
                : "Sin título";

            var synopsis = attributes.TryGetProperty("synopsis", out var synopsisProp)
                ? synopsisProp.GetString()
                : null;

            var poster = attributes.TryGetProperty("posterImage", out var posterProp) &&
                         posterProp.TryGetProperty("medium", out var mediumProp)
                ? mediumProp.GetString()
                : null;

            int? episodeCount = attributes.TryGetProperty("episodeCount", out var episodeProp) &&
                                episodeProp.ValueKind != JsonValueKind.Null
                ? episodeProp.GetInt32()
                : (int?)null;

            int? chapterCount = attributes.TryGetProperty("chapterCount", out var chapterProp) &&
                                chapterProp.ValueKind != JsonValueKind.Null
                ? chapterProp.GetInt32()
                : (int?)null;

            return new KitsuAnimeDto
            {
                Id = id,
                Title = title ?? "Sin título",
                Synopsis = synopsis,
                PosterImage = poster,
                MediaType = "anime",
                EpisodeCount = episodeCount,
                ChapterCount = chapterCount
            };
        }
    }
}