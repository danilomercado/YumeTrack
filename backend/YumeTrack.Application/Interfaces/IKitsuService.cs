using YumeTrack.Application.DTOs.Kitsu;

namespace YumeTrack.Application.Interfaces
{
    public interface IKitsuService
    {
        Task<List<KitsuAnimeDto>> SearchAnimeAsync(string query);
        Task<KitsuAnimeDto?> GetAnimeByIdAsync(int id);
    }
}