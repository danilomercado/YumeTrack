using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Xml.Linq;
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

                var poster = attributes.TryGetProperty("posterImage", out var posterProp) &&
                             posterProp.TryGetProperty("medium", out var mediumProp)
                    ? mediumProp.GetString()
                    : null;

                var id = int.TryParse(item.GetProperty("id").GetString(), out var parsedId)
                    ? parsedId
                    : 0;

                result.Add(new KitsuAnimeDto
                {
                    Id = id,
                    Title = title,
                    PosterImage = poster
                });
            }

            return result;
        }
    }
}
