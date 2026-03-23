using YumeTrack.Application.DTOs.UserTitles;
using YumeTrack.Application.DTOs.Users;

namespace YumeTrack.Application.Interfaces
{
    public interface IUserTitleService
    {
        Task AddAsync(int userId, CreateUserTitleDto dto);
        Task<List<UserTitleListItemDto>> GetUserListAsync(int userId, GetUserTitlesQueryDto filters);
        Task UpdateAsync(int userId, int userTitleId, UpdateUserTitleDto dto);
        Task DeleteAsync(int userId, int userTitleId);

        Task<PublicUserProfileDto?> GetPublicProfileByUsernameAsync(string username, int? currentUserId);
        Task<List<PublicUserSearchItemDto>> SearchUsersAsync(string query);
    }
}