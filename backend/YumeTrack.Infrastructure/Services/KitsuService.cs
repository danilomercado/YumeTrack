using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using YumeTrack.Application.DTOs.Kitsu;
using YumeTrack.Application.DTOs.UserTitles;
using YumeTrack.Application.Interfaces;

namespace YumeTrack.Infrastructure.Services
{
    public class KitsuService : IKitsuService
    {
        private readonly HttpClient _httpClient;
        private readonly ITranslationService _translationService;
        private readonly IMemoryCache _cache;
        private const int KitsuMaxLimit = 20;
        private const int TranslatedSynopsisCount = 6;
        private static readonly TimeSpan ListCacheDuration = TimeSpan.FromMinutes(10);

        public KitsuService(HttpClient httpClient, ITranslationService translationService, IMemoryCache cache)
        {
            _httpClient = httpClient;
            _translationService = translationService;
            _cache = cache;
        }

        public async Task<List<TitleSearchResultDto>> SearchTitlesAsync(string query)
        {
            var url = $"anime?filter[text]={Uri.EscapeDataString(query)}";
            return await GetTitlesListAsync(url, "Anime");
        }

        public async Task<List<TitleSearchResultDto>> GetTrendingAnimeAsync(int limit = 12, CancellationToken cancellationToken = default)
        {
            limit = NormalizeLimit(limit, 12);

            // Lo que está al aire en la temporada actual; la temporada se calcula
            // con la fecha, así cambia sola cada tres meses.
            var (season, year) = GetCurrentSeason(DateTime.UtcNow);

            var seasonUrl =
                $"anime?filter[season]={season}&filter[seasonYear]={year}" +
                $"&filter[status]=current&filter[subtype]=TV,ONA" +
                $"&page[limit]={limit}&sort=popularityRank";

            var results = await GetTitlesListAsync(seasonUrl, "Anime", cancellationToken);

            if (results.Count >= limit)
                return await TranslateSynopsesAsync(results, "anime", cancellationToken);

            // Al empezar la temporada hay pocos títulos al aire: se completa con
            // los más populares que siguen en emisión.
            var airingUrl =
                $"anime?filter[status]=current&filter[subtype]=TV,ONA" +
                $"&page[limit]={limit}&sort=popularityRank";

            var airing = await GetTitlesListAsync(airingUrl, "Anime", cancellationToken);

            var combined = results
                .Concat(airing.Where(a => results.All(r => r.Id != a.Id)))
                .Take(limit)
                .ToList();

            return await TranslateSynopsesAsync(combined, "anime", cancellationToken);
        }

        // El destacado de inicio muestra las primeras sinopsis: se traducen al español
        // (con caché en base de datos) sobre una copia, sin tocar la lista cacheada.
        private async Task<List<TitleSearchResultDto>> TranslateSynopsesAsync(
            List<TitleSearchResultDto> titles,
            string mediaType,
            CancellationToken cancellationToken)
        {
            var translated = new List<TitleSearchResultDto>(titles.Count);

            for (var position = 0; position < titles.Count; position++)
            {
                var title = titles[position];

                if (position >= TranslatedSynopsisCount)
                {
                    translated.Add(title);
                    continue;
                }

                translated.Add(new TitleSearchResultDto
                {
                    Id = title.Id,
                    Title = title.Title,
                    Synopsis = await _translationService.GetTranslatedSynopsisAsync(
                        title.Id.ToString(), mediaType, title.Synopsis, "es", cancellationToken),
                    PosterImage = title.PosterImage,
                    MediaType = title.MediaType,
                    Status = title.Status,
                    StartDate = title.StartDate,
                    EpisodeCount = title.EpisodeCount,
                    ChapterCount = title.ChapterCount
                });
            }

            return translated;
        }

        private static (string Season, int Year) GetCurrentSeason(DateTime now)
        {
            var season = now.Month switch
            {
                >= 1 and <= 3 => "winter",
                >= 4 and <= 6 => "spring",
                >= 7 and <= 9 => "summer",
                _ => "fall"
            };

            return (season, now.Year);
        }

        public async Task<List<TitleSearchResultDto>> GetTrendingMangaAsync(int limit = 12, CancellationToken cancellationToken = default)
        {
            limit = NormalizeLimit(limit, 12);

            // Manga que se está publicando ahora.
            var url = $"manga?filter[status]=current&page[limit]={limit}&sort=popularityRank";
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
        public async Task<List<TitleCharacterDto>> GetCharactersAsync(
            string id,
            string mediaType,
            CancellationToken cancellationToken = default)
        {
            var kind = mediaType.Equals("manga", StringComparison.OrdinalIgnoreCase) ? "manga" : "anime";
            var cacheKey = $"kitsu:characters:{kind}:{id}";

            if (_cache.TryGetValue(cacheKey, out List<TitleCharacterDto>? cached) && cached is not null)
                return cached;

            var url = $"{kind}-characters?filter[{kind}Id]={id}&include=character&page[limit]=20";
            var response = await _httpClient.GetAsync(url, cancellationToken);

            if (!response.IsSuccessStatusCode)
                return new List<TitleCharacterDto>();

            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            using var document = JsonDocument.Parse(json);
            var root = document.RootElement;

            // character id -> role (main / supporting)
            var roles = new Dictionary<string, string>();

            if (root.TryGetProperty("data", out var links) && links.ValueKind == JsonValueKind.Array)
            {
                foreach (var link in links.EnumerateArray())
                {
                    var role = link.GetProperty("attributes").TryGetProperty("role", out var roleValue)
                        ? roleValue.GetString() ?? "supporting"
                        : "supporting";

                    if (link.TryGetProperty("relationships", out var rel) &&
                        rel.TryGetProperty("character", out var ch) &&
                        ch.TryGetProperty("data", out var chData) &&
                        chData.ValueKind == JsonValueKind.Object)
                    {
                        roles[chData.GetProperty("id").GetString() ?? ""] = role;
                    }
                }
            }

            var characters = new List<TitleCharacterDto>();

            if (root.TryGetProperty("included", out var included) && included.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in included.EnumerateArray())
                {
                    if (item.GetProperty("type").GetString() != "characters")
                        continue;

                    var attributes = item.GetProperty("attributes");

                    if (!attributes.TryGetProperty("image", out var image) || image.ValueKind != JsonValueKind.Object)
                        continue;

                    var imageUrl = image.TryGetProperty("original", out var original) ? original.GetString() : null;

                    if (string.IsNullOrWhiteSpace(imageUrl))
                        continue;

                    var characterId = item.GetProperty("id").GetString() ?? "";

                    characters.Add(new TitleCharacterDto
                    {
                        Id = characterId,
                        Name = attributes.TryGetProperty("canonicalName", out var name) ? name.GetString() ?? "" : "",
                        ImageUrl = imageUrl,
                        Role = roles.GetValueOrDefault(characterId, "supporting")
                    });
                }
            }

            var result = characters
                .OrderBy(c => c.Role == "main" ? 0 : 1)
                .Where(c => c.Name != "")
                .Take(8)
                .ToList();

            _cache.Set(cacheKey, result, new MemoryCacheEntryOptions
            {
                Size = 1,
                AbsoluteExpirationRelativeToNow = ListCacheDuration
            });
            return result;
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
            var cacheKey = $"kitsu:{mediaType}:{url}";

            if (_cache.TryGetValue(cacheKey, out List<TitleSearchResultDto>? cached) && cached is not null)
                return cached;

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

            _cache.Set(cacheKey, results, new MemoryCacheEntryOptions
            {
                Size = 1,
                AbsoluteExpirationRelativeToNow = ListCacheDuration
            });

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