using Microsoft.EntityFrameworkCore;
using YumeTrack.Application.DTOs.UserTitles;
using YumeTrack.Application.Interfaces;
using YumeTrack.Domain.Entities;
using YumeTrack.Infrastructure.Persistence;

namespace YumeTrack.Infrastructure.Services
{
    public class UserTitleService : IUserTitleService
    {
        private readonly AppDbContext _context;
        private readonly IKitsuService _kitsuService;

        public UserTitleService(AppDbContext context, IKitsuService kitsuService)
        {
            _context = context;
            _kitsuService = kitsuService;
        }

        public async Task AddAsync(int userId, CreateUserTitleDto dto)
        {
            var externalId = dto.KitsuId.ToString();

            var title = await _context.Titles
                .FirstOrDefaultAsync(t => t.ExternalId == externalId && t.Source == "kitsu");

            if (title == null)
            {
                var kitsuData = await _kitsuService.GetAnimeByIdAsync(externalId);

                if (kitsuData == null)
                    throw new InvalidOperationException("El anime no existe en Kitsu.");

                title = new Title
                {
                    ExternalId = kitsuData.Id.ToString(),
                    Source = "kitsu",
                    CanonicalTitle = kitsuData.Title,
                    Synopsis = kitsuData.Synopsis,
                    PosterImageUrl = kitsuData.PosterImage,
                    MediaType = kitsuData.MediaType,
                    EpisodeCount = kitsuData.EpisodeCount,
                    ChapterCount = kitsuData.ChapterCount
                };

                _context.Titles.Add(title);
                await _context.SaveChangesAsync();
            }

            var exists = await _context.UserTitles
                .AnyAsync(ut => ut.UserId == userId && ut.TitleId == title.Id);

            if (exists)
                throw new InvalidOperationException("Ya tenés este título en tu lista.");

            var userTitle = new UserTitle
            {
                UserId = userId,
                TitleId = title.Id,
                Status = dto.Status,
                Progress = 0,
                IsFavorite = dto.IsFavorite
            };

            _context.UserTitles.Add(userTitle);
            await _context.SaveChangesAsync();
        }

        public async Task<List<UserTitleListItemDto>> GetUserListAsync(int userId, GetUserTitlesQueryDto filters)
        {
            var query = _context.UserTitles
                .Where(ut => ut.UserId == userId)
                .Include(ut => ut.Title)
                .AsQueryable();

            if (filters.Status.HasValue)
                query = query.Where(ut => ut.Status == filters.Status.Value);

            if (filters.FavoritesOnly == true)
                query = query.Where(ut => ut.IsFavorite);

            return await query
                .Select(ut => new UserTitleListItemDto
                {
                    Id = ut.Id,
                    Status = ut.Status,
                    Progress = ut.Progress,
                    Score = ut.Score,
                    IsFavorite = ut.IsFavorite,
                    CanonicalTitle = ut.Title.CanonicalTitle,
                    PosterImageUrl = ut.Title.PosterImageUrl,
                    MediaType = ut.Title.MediaType,
                    EpisodeCount = ut.Title.EpisodeCount,
                    ChapterCount = ut.Title.ChapterCount
                })
                .ToListAsync();
        }

        public async Task UpdateAsync(int userId, int userTitleId, UpdateUserTitleDto dto)
        {
            var userTitle = await _context.UserTitles
                .FirstOrDefaultAsync(ut => ut.Id == userTitleId && ut.UserId == userId);

            if (userTitle == null)
                throw new KeyNotFoundException("No encontrado.");

            if (dto.Progress < 0)
                throw new InvalidOperationException("El progreso no puede ser negativo.");

            if (dto.Score.HasValue && (dto.Score < 0 || dto.Score > 10))
                throw new InvalidOperationException("El score debe estar entre 0 y 10.");

            userTitle.Status = dto.Status;
            userTitle.Progress = dto.Progress;
            userTitle.Score = dto.Score;
            userTitle.IsFavorite = dto.IsFavorite;
            userTitle.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int userId, int userTitleId)
        {
            var userTitle = await _context.UserTitles
                .FirstOrDefaultAsync(ut => ut.Id == userTitleId && ut.UserId == userId);

            if (userTitle == null)
                throw new KeyNotFoundException("No encontrado.");

            _context.UserTitles.Remove(userTitle);
            await _context.SaveChangesAsync();
        }
    }
}