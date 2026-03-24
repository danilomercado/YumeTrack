using Microsoft.EntityFrameworkCore;
using YumeTrack.Application.DTOs.UserTitles;
using YumeTrack.Application.DTOs.Users;
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
            ValidateInput(dto.Progress, dto.Score, dto.Notes);

            var externalId = dto.KitsuId.ToString();

            var title = await _context.Titles
                .FirstOrDefaultAsync(t => t.ExternalId == externalId && t.Source == "kitsu");

            if (title == null)
            {
                var mediaType = dto.MediaType?.Trim().ToLowerInvariant();

                var kitsuData = mediaType == "manga"
                    ? await _kitsuService.GetMangaByIdAsync(externalId)
                    : await _kitsuService.GetAnimeByIdAsync(externalId);

                if (kitsuData == null)
                    throw new InvalidOperationException("El título no existe en Kitsu.");

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
                Progress = dto.Progress,
                Score = dto.Score,
                IsFavorite = dto.IsFavorite,
                Notes = NormalizeNotes(dto.Notes),
                UpdatedAt = DateTime.UtcNow,
                ReviewUpdatedAt = string.IsNullOrWhiteSpace(dto.Notes) ? null : DateTime.UtcNow,
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
                .OrderByDescending(ut => ut.UpdatedAt)
                .Select(ut => new UserTitleListItemDto
                {
                    Id = ut.Id,
                    Status = ut.Status,
                    Progress = ut.Progress,
                    Score = ut.Score,
                    IsFavorite = ut.IsFavorite,
                    Notes = ut.Notes,
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
            ValidateInput(dto.Progress, dto.Score, dto.Notes);

            var userTitle = await _context.UserTitles
                .FirstOrDefaultAsync(ut => ut.Id == userTitleId && ut.UserId == userId);

            if (userTitle == null)
                throw new KeyNotFoundException("No encontrado.");

            var newNotes = NormalizeNotes(dto.Notes);

            if (userTitle.Notes != newNotes)
            {
                userTitle.Notes = newNotes;
                userTitle.ReviewUpdatedAt = DateTime.UtcNow;
            }
            else
            {
                userTitle.Notes = newNotes;
            }

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

        public async Task<PublicUserProfileDto?> GetPublicProfileByUsernameAsync(string username, int? currentUserId)
        {
            if (string.IsNullOrWhiteSpace(username))
                return null;

            var normalizedUsername = username.Trim().ToLower();

            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserName.ToLower() == normalizedUsername);

            if (user == null)
                return null;

            var titles = await _context.UserTitles
                .AsNoTracking()
                .Where(ut => ut.UserId == user.Id)
                .Include(ut => ut.Title)
                .OrderByDescending(ut => ut.UpdatedAt)
                .Select(ut => new UserTitleListItemDto
                {
                    Id = ut.Id,
                    Status = ut.Status,
                    Progress = ut.Progress,
                    Score = ut.Score,
                    IsFavorite = ut.IsFavorite,
                    Notes = ut.Notes,
                    CanonicalTitle = ut.Title.CanonicalTitle,
                    PosterImageUrl = ut.Title.PosterImageUrl,
                    MediaType = ut.Title.MediaType,
                    EpisodeCount = ut.Title.EpisodeCount,
                    ChapterCount = ut.Title.ChapterCount
                })
                .ToListAsync();

            var followersCount = await _context.UserFollows
                .AsNoTracking()
                .CountAsync(f => f.FollowingId == user.Id);

            var followingCount = await _context.UserFollows
                .AsNoTracking()
                .CountAsync(f => f.FollowerId == user.Id);

            var isFollowing = false;

            if (currentUserId.HasValue)
            {
                isFollowing = await _context.UserFollows
                    .AsNoTracking()
                    .AnyAsync(f => f.FollowerId == currentUserId.Value && f.FollowingId == user.Id);
            }

            return new PublicUserProfileDto
            {
                Id = user.Id,
                UserName = user.UserName,
                Bio = user.Bio,
                CreatedAt = user.CreatedAt,
                TotalTitles = titles.Count,
                FavoritesCount = titles.Count(t => t.IsFavorite),
                FollowersCount = followersCount,
                FollowingCount = followingCount,
                IsFollowing = isFollowing,
                Titles = titles
            };
        }

        public async Task<List<PublicUserSearchItemDto>> SearchUsersAsync(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return new List<PublicUserSearchItemDto>();

            var normalizedQuery = query.Trim().ToLower();

            return await _context.Users
                .AsNoTracking()
                .Where(u => u.UserName.ToLower().Contains(normalizedQuery))
                .OrderBy(u => u.UserName)
                .Select(u => new PublicUserSearchItemDto
                {
                    UserName = u.UserName,
                    TotalTitles = u.UserTitles.Count
                })
                .Take(8)
                .ToListAsync();
        }

        private static void ValidateInput(int progress, int? score, string? notes)
        {
            if (progress < 0)
                throw new InvalidOperationException("El progreso no puede ser negativo.");

            if (score.HasValue && (score < 0 || score > 10))
                throw new InvalidOperationException("El score debe estar entre 0 y 10.");

            if (!string.IsNullOrWhiteSpace(notes) && notes.Trim().Length > 2000)
                throw new InvalidOperationException("La review no puede superar los 2000 caracteres.");
        }

        private static string? NormalizeNotes(string? notes)
        {
            if (string.IsNullOrWhiteSpace(notes))
                return null;

            return notes.Trim();
        }
    }
}