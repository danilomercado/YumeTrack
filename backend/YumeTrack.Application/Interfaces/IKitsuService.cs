using YumeTrack.Application.DTOs.Kitsu;
using YumeTrack.Application.DTOs.UserTitles;

namespace YumeTrack.Application.Interfaces
{
    public interface IKitsuService
    {
        Task<List<TitleSearchResultDto>> SearchAnimeAsync(string query);
        Task<KitsuAnimeDto?> GetAnimeByIdAsync(string id, CancellationToken cancellationToken = default);
    }
}