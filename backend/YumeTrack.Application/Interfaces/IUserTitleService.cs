using System;
using System.Collections.Generic;
using System.Text;
using YumeTrack.Application.DTOs.UserTitles;

namespace YumeTrack.Application.Interfaces
{
    public interface IUserTitleService
    {
        Task AddAsync(int userId, CreateUserTitleDto dto);
        Task<List<UserTitleListItemDto>> GetUserListAsync(int userId, GetUserTitlesQueryDto filters);
        Task UpdateAsync(int userId, int userTitleId, UpdateUserTitleDto dto);
        Task DeleteAsync(int userId, int userTitleId);
    }
}
