using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using YumeTrack.Application.Interfaces;
using YumeTrack.Domain.Entities;
using YumeTrack.Infrastructure.Persistence;

namespace YumeTrack.Infrastructure.Services
{
    public class TranslationService : ITranslationService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly AppDbContext _context;
        private readonly ILogger<TranslationService> _logger;

        public TranslationService(
            HttpClient httpClient,
            IConfiguration configuration,
            AppDbContext context,
            ILogger<TranslationService> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _context = context;
            _logger = logger;
        }


        public async Task<string?> GetTranslatedSynopsisAsync(
            string kitsuId,
            string mediaType,
            string? originalSynopsis,
            string language,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(kitsuId) ||
                string.IsNullOrWhiteSpace(mediaType) ||
                string.IsNullOrWhiteSpace(language) ||
                string.IsNullOrWhiteSpace(originalSynopsis))
            {
                return originalSynopsis;
            }

            language = language.ToLowerInvariant();
            mediaType = mediaType.ToLowerInvariant();

            var existing = await _context.MediaTranslations
                .FirstOrDefaultAsync(x =>
                    x.KitsuId == kitsuId &&
                    x.MediaType == mediaType &&
                    x.Language == language,
                    cancellationToken);

            if (existing is not null && existing.OriginalSynopsis == originalSynopsis)
            {
                return existing.TranslatedSynopsis;
            }

            var translatedSynopsis = await TryTranslateWithDeepLAsync(
                originalSynopsis,
                language,
                cancellationToken);

            // Sin traducción disponible (sin API key, cuota agotada, DeepL caído): sinopsis original, sin cachear.
            if (translatedSynopsis is null)
                return existing?.TranslatedSynopsis ?? originalSynopsis;

            if (existing is not null)
            {
                existing.OriginalSynopsis = originalSynopsis;
                existing.TranslatedSynopsis = translatedSynopsis;
                existing.UpdatedAtUtc = DateTime.UtcNow;
            }
            else
            {
                _context.MediaTranslations.Add(new MediaTranslation
                {
                    KitsuId = kitsuId,
                    MediaType = mediaType,
                    Language = language,
                    OriginalSynopsis = originalSynopsis,
                    TranslatedSynopsis = translatedSynopsis,
                    CreatedAtUtc = DateTime.UtcNow,
                    UpdatedAtUtc = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync(cancellationToken);

            return translatedSynopsis;
        }

        private async Task<string?> TryTranslateWithDeepLAsync(
             string text,
             string language,
             CancellationToken cancellationToken)
        {
            var apiKey = _configuration["DeepL:ApiKey"];

            if (string.IsNullOrWhiteSpace(apiKey))
            {
                _logger.LogWarning("DeepL:ApiKey no está configurada; se devuelve la sinopsis original.");
                return null;
            }

            try
            {
                var targetLanguage = language.ToUpperInvariant();

                using var request = new HttpRequestMessage(HttpMethod.Post, "https://api-free.deepl.com/v2/translate");

                request.Headers.Add("Authorization", $"DeepL-Auth-Key {apiKey}");

                request.Content = new FormUrlEncodedContent(new[]
                {
                    new KeyValuePair<string, string>("text", text),
                    new KeyValuePair<string, string>("target_lang", targetLanguage)
                });

                using var response = await _httpClient.SendAsync(request, cancellationToken);

                var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("DeepL respondió {StatusCode}: {Body}", (int)response.StatusCode, responseBody);
                    return null;
                }

                using var document = JsonDocument.Parse(responseBody);

                return document.RootElement
                    .GetProperty("translations")[0]
                    .GetProperty("text")
                    .GetString();
            }
            catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or JsonException or KeyNotFoundException or InvalidOperationException
                                       && !cancellationToken.IsCancellationRequested)
            {
                _logger.LogWarning(ex, "Falló la traducción con DeepL; se devuelve la sinopsis original.");
                return null;
            }
        }
    }
}
