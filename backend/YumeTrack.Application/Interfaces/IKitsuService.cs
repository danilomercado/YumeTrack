using YumeTrack.Application.DTOs.Kitsu;
using YumeTrack.Application.DTOs.UserTitles;

namespace YumeTrack.Application.Interfaces
{
    public interface IKitsuService
    {
        Task<List<TitleSearchResultDto>> SearchTitlesAsync(string query);
        Task<KitsuAnimeDto?> GetAnimeByIdAsync(string id, CancellationToken cancellationToken = default);
        Task<KitsuAnimeDto?> GetMangaByIdAsync(string id, CancellationToken cancellationToken = default);
        Task<List<TitleSearchResultDto>> GetTrendingAnimeAsync(int limit = 12, CancellationToken cancellationToken = default);
        Task<List<TitleSearchResultDto>> GetTrendingMangaAsync(int limit = 12, CancellationToken cancellationToken = default);
        Task<List<TitleSearchResultDto>> GetAnimeCatalogAsync(int limit = 20, int offset = 0, CancellationToken cancellationToken = default);
        Task<List<TitleSearchResultDto>> GetMangaCatalogAsync(int limit = 20, int offset = 0, CancellationToken cancellationToken = default);
    }
}