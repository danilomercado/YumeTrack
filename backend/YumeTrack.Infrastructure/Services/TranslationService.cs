using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
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

        public TranslationService(
            HttpClient httpClient,
            IConfiguration configuration,
            AppDbContext context)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _context = context;
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

            if (existing is not null)
            {
                Console.WriteLine("🟢 USANDO CACHE");

                if (existing.OriginalSynopsis == originalSynopsis)
                {
                    return existing.TranslatedSynopsis;
                }

                Console.WriteLine("🟡 ACTUALIZANDO TRADUCCIÓN");

                var updatedTranslation = await TranslateWithDeepLAsync(
                    originalSynopsis,
                    language,
                    cancellationToken);

                existing.OriginalSynopsis = originalSynopsis;
                existing.TranslatedSynopsis = updatedTranslation;
                existing.UpdatedAtUtc = DateTime.UtcNow;

                await _context.SaveChangesAsync(cancellationToken);

                return existing.TranslatedSynopsis;
            }

            Console.WriteLine("🔴 LLAMANDO A DEEPL");

            var translatedSynopsis = await TranslateWithDeepLAsync(
                originalSynopsis,
                language,
                cancellationToken);

            var translation = new MediaTranslation
            {
                KitsuId = kitsuId,
                MediaType = mediaType,
                Language = language,
                OriginalSynopsis = originalSynopsis,
                TranslatedSynopsis = translatedSynopsis,
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            };

            _context.MediaTranslations.Add(translation);
            await _context.SaveChangesAsync(cancellationToken);

            return translatedSynopsis;
        }

        private async Task<string> TranslateWithDeepLAsync(
             string text,
             string language,
             CancellationToken cancellationToken)
        {
            var apiKey = _configuration["DeepL:ApiKey"];

            if (string.IsNullOrWhiteSpace(apiKey))
                throw new InvalidOperationException("DeepL:ApiKey no está configurada.");

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
                throw new Exception($"Error en DeepL: {(int)response.StatusCode} - {responseBody}");
            }

            using var document = JsonDocument.Parse(responseBody);

            var translatedText = document.RootElement
                .GetProperty("translations")[0]
                .GetProperty("text")
                .GetString();

            return translatedText ?? text;
        }
    }
}