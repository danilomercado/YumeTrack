using System.Text.Json;
using YumeTrack.Application.DTOs.Kitsu;
using YumeTrack.Application.DTOs.UserTitles;
using YumeTrack.Application.Interfaces;

namespace YumeTrack.Infrastructure.Services
{
    public class KitsuService : IKitsuService
    {
        private readonly HttpClient _httpClient;
        private readonly ITranslationService _translationService;

        public KitsuService(HttpClient httpClient, ITranslationService translationService)
        {
            _httpClient = httpClient;
            _translationService = translationService;
        }

        private static int? GetNullableInt(JsonElement element, string propertyName)
        {
            if (element.TryGetProperty(propertyName, out var property))
            {
                if (property.ValueKind == JsonValueKind.Number && property.TryGetInt32(out var number))
                    return number;
            }

            return null;
        }

        public async Task<List<TitleSearchResultDto>> SearchAnimeAsync(string query)
        {
            var response = await _httpClient.GetAsync($"anime?filter[text]={Uri.EscapeDataString(query)}");

            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();

            using var document = JsonDocument.Parse(json);
            var data = document.RootElement.GetProperty("data");

            var results = new List<TitleSearchResultDto>();

            foreach (var item in data.EnumerateArray())
            {
                var attributes = item.GetProperty("attributes");

                var id = int.Parse(item.GetProperty("id").GetString() ?? "0");

                results.Add(new TitleSearchResultDto
                {
                    Id = id,
                    Title = GetTitle(attributes),
                    Synopsis = GetOptionalString(attributes, "synopsis"),
                    PosterImage = GetPosterImage(attributes),
                    MediaType = "Anime",
                    Status = TranslateStatus(GetOptionalString(attributes, "status")),
                    StartDate = GetOptionalString(attributes, "startDate"),
                    EpisodeCount = GetNullableInt(attributes, "episodeCount"),
                    ChapterCount = GetNullableInt(attributes, "chapterCount")
                });
            }

            return results;
        }

        public async Task<KitsuAnimeDto?> GetAnimeByIdAsync(string id, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync($"anime/{id}", cancellationToken);

            if (!response.IsSuccessStatusCode)
                return null;

            var json = await response.Content.ReadAsStringAsync(cancellationToken);

            using var document = JsonDocument.Parse(json);
            var data = document.RootElement.GetProperty("data");
            var attributes = data.GetProperty("attributes");

            var originalSynopsis = GetOptionalString(attributes, "synopsis");

            var translatedSynopsis = await _translationService.GetTranslatedSynopsisAsync(
                kitsuId: id,
                mediaType: "anime",
                originalSynopsis: originalSynopsis,
                language: "es",
                cancellationToken: cancellationToken);

            return new KitsuAnimeDto
            {
                Id = int.Parse(id),
                Title = GetTitle(attributes),
                Synopsis = translatedSynopsis,
                PosterImage = GetPosterImage(attributes),
                MediaType = "anime",
                EpisodeCount = GetNullableInt(attributes, "episodeCount"),
                ChapterCount = GetNullableInt(attributes, "chapterCount")
            };
        }

        private static string GetTitle(JsonElement attributes)
        {
            if (attributes.TryGetProperty("titles", out var titles))
            {
                if (titles.TryGetProperty("es_jp", out var esJp))
                    return esJp.GetString() ?? "Sin título";

                if (titles.TryGetProperty("en_jp", out var enJp))
                    return enJp.GetString() ?? "Sin título";

                if (titles.TryGetProperty("en", out var en))
                    return en.GetString() ?? "Sin título";

                if (titles.TryGetProperty("ja_jp", out var ja))
                    return ja.GetString() ?? "Sin título";
            }

            if (attributes.TryGetProperty("canonicalTitle", out var canonicalTitle))
                return canonicalTitle.GetString() ?? "Sin título";

            return "Sin título";
        }

        private static string? GetPosterImage(JsonElement attributes)
        {
            if (attributes.TryGetProperty("posterImage", out var posterImage))
            {
                if (posterImage.TryGetProperty("medium", out var medium))
                    return medium.GetString();

                if (posterImage.TryGetProperty("small", out var small))
                    return small.GetString();

                if (posterImage.TryGetProperty("original", out var original))
                    return original.GetString();
            }

            return null;
        }

        private static string? GetOptionalString(JsonElement element, string propertyName)
        {
            if (element.TryGetProperty(propertyName, out var property))
                return property.GetString();

            return null;
        }

        private static string TranslateStatus(string? status)
        {
            return status?.ToLower() switch
            {
                "finished" => "Finalizado",
                "current" => "En emisión",
                "upcoming" => "Próximamente",
                "unreleased" => "No publicado",
                _ => status ?? "Desconocido"
            };
        }
    }
}