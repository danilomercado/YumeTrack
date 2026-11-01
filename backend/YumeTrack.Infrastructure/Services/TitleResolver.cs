using Microsoft.EntityFrameworkCore;
using YumeTrack.Application.Interfaces;
using YumeTrack.Domain.Entities;
using YumeTrack.Infrastructure.Persistence;

namespace YumeTrack.Infrastructure.Services
{
    // Devuelve el título de la base; si todavía no existe, lo trae de Kitsu y lo guarda.
    public class TitleResolver
    {
        private readonly AppDbContext _context;
        private readonly IKitsuService _kitsu;

        public TitleResolver(AppDbContext context, IKitsuService kitsu)
        {
            _context = context;
            _kitsu = kitsu;
        }

        public async Task<Title?> FindAsync(int kitsuId, string mediaType)
        {
            var externalId = kitsuId.ToString();
            var kind = Normalize(mediaType);

            return await _context.Titles.FirstOrDefaultAsync(t =>
                t.ExternalId == externalId && t.Source == "kitsu" && t.MediaType.ToLower() == kind);
        }

        public async Task<Title> GetOrCreateAsync(int kitsuId, string mediaType)
        {
            var existing = await FindAsync(kitsuId, mediaType);
            if (existing is not null)
                return existing;

            var kind = Normalize(mediaType);
            var externalId = kitsuId.ToString();

            var data = kind == "manga"
                ? await _kitsu.GetMangaByIdAsync(externalId)
                : await _kitsu.GetAnimeByIdAsync(externalId);

            if (data is null)
                throw new InvalidOperationException("El título no existe en Kitsu.");

            var title = new Title
            {
                ExternalId = data.Id.ToString(),
                Source = "kitsu",
                CanonicalTitle = data.Title,
                Synopsis = data.Synopsis,
                PosterImageUrl = data.PosterImage,
                MediaType = data.MediaType,
                EpisodeCount = data.EpisodeCount,
                ChapterCount = data.ChapterCount
            };

            _context.Titles.Add(title);
            await _context.SaveChangesAsync();
            return title;
        }

        private static string Normalize(string mediaType) =>
            mediaType.Trim().ToLowerInvariant() == "manga" ? "manga" : "anime";
    }
}
