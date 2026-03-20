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
        private const int KitsuMaxLimit = 20;

        public KitsuService(HttpClient httpClient, ITranslationService translationService)
        {
            _httpClient = httpClient;
            _translationService = translationService;
        }

        public async Task<List<TitleSearchResultDto>> SearchTitlesAsync(string query)
        {
            var url = $"anime?filter[text]={Uri.EscapeDataString(query)}";
            return await GetTitlesListAsync(url, "Anime");
        }

        public async Task<List<TitleSearchResultDto>> GetTrendingAnimeAsync(int limit = 12, CancellationToken cancellationToken = default)
        {
            limit = NormalizeLimit(limit, 12);

            var url = $"anime?page[limit]={limit}&sort=popularityRank";
            return await GetTitlesListAsync(url, "Anime", cancellationToken);
        }

        public async Task<List<TitleSearchResultDto>> GetTrendingMangaAsync(int limit = 12, CancellationToken cancellationToken = default)
        {
            limit = NormalizeLimit(limit, 12);

            var url = $"manga?page[limit]={limit}&sort=popularityRank";
            return await GetTitlesListAsync(url, "Manga", cancellationToken);
        }

        public async Task<List<TitleSearchResultDto>> GetAnimeCatalogAsync(int limit = 20, int offset = 0, CancellationToken cancellationToken = default)
        {
            limit = NormalizeLimit(limit, 20);

            if (offset < 0)
                offset = 0;

            var url = $"anime?page[limit]={limit}&page[offset]={offset}&sort=popularityRank";
            return await GetTitlesListAsync(url, "Anime", cancellationToken);
        }

        public async Task<KitsuAnimeDto?> GetAnimeByIdAsync(string id, CancellationToken cancellationToken = default)
        {
            return await GetTitleByIdAsync(id, "anime", "anime", cancellationToken);
        }

        public async Task<KitsuAnimeDto?> GetMangaByIdAsync(string id, CancellationToken cancellationToken = default)
        {
            return await GetTitleByIdAsync(id, "manga", "manga", cancellationToken);
        }
        public async Task<List<TitleSearchResultDto>> GetMangaCatalogAsync(int limit = 20, int offset = 0, CancellationToken cancellationToken = default)
        {
            limit = NormalizeLimit(limit, 20);

            if (offset < 0)
                offset = 0;

            var url = $"manga?page[limit]={limit}&page[offset]={offset}&sort=popularityRank";
            return await GetTitlesListAsync(url, "Manga", cancellationToken);
        }
        private async Task<KitsuAnimeDto?> GetTitleByIdAsync(
            string id,
            string endpoint,
            string mediaType,
            CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync($"{endpoint}/{id}", cancellationToken);

            if (!response.IsSuccessStatusCode)
                return null;

            var json = await response.Content.ReadAsStringAsync(cancellationToken);

            using var document = JsonDocument.Parse(json);
            var data = document.RootElement.GetProperty("data");
            var attributes = data.GetProperty("attributes");

            var originalSynopsis = GetOptionalString(attributes, "synopsis");

            var translatedSynopsis = await _translationService.GetTranslatedSynopsisAsync(
                kitsuId: id,
                mediaType: mediaType,
                originalSynopsis: originalSynopsis,
                language: "es",
                cancellationToken: cancellationToken);

            return new KitsuAnimeDto
            {
                Id = int.Parse(id),
                Title = GetTitle(attributes),
                Synopsis = translatedSynopsis,
                PosterImage = GetPosterImage(attributes),
                MediaType = mediaType,
                EpisodeCount = GetNullableInt(attributes, "episodeCount"),
                ChapterCount = GetNullableInt(attributes, "chapterCount")
            };
        }

        private async Task<List<TitleSearchResultDto>> GetTitlesListAsync(
            string url,
            string mediaType,
            CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync(url, cancellationToken);
            var rawJson = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Kitsu error. Status: {(int)response.StatusCode} - {response.StatusCode}. Body: {rawJson}");
            }

            using var document = JsonDocument.Parse(rawJson);

            if (!document.RootElement.TryGetProperty("data", out var data) || data.ValueKind != JsonValueKind.Array)
            {
                throw new Exception($"Kitsu response sin 'data' válido. Body: {rawJson}");
            }

            var results = new List<TitleSearchResultDto>();

            foreach (var item in data.EnumerateArray())
            {
                var attributes = item.GetProperty("attributes");
                var idString = item.GetProperty("id").GetString();

                if (!int.TryParse(idString, out var id))
                    continue;

                results.Add(new TitleSearchResultDto
                {
                    Id = id,
                    Title = GetTitle(attributes),
                    Synopsis = GetOptionalString(attributes, "synopsis"),
                    PosterImage = GetPosterImage(attributes),
                    MediaType = mediaType,
                    Status = TranslateStatus(GetOptionalString(attributes, "status")),
                    StartDate = GetOptionalString(attributes, "startDate"),
                    EpisodeCount = GetNullableInt(attributes, "episodeCount"),
                    ChapterCount = GetNullableInt(attributes, "chapterCount")
                });
            }

            return results;
        }

        private static int NormalizeLimit(int limit, int defaultValue)
        {
            if (limit <= 0)
                return defaultValue;

            if (limit > KitsuMaxLimit)
                return KitsuMaxLimit;

            return limit;
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
            if (element.TryGetProperty(propertyName, out var property) && property.ValueKind != JsonValueKind.Null)
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