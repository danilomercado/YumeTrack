using System;
using System.Collections.Generic;
using System.Text;
using YumeTrack.Application.UserTitles;

namespace YumeTrack.Application.Interfaces
{
    public interface IUserTitleService
    {
        Task AddAsync(int userId, CreateUserTitleDto dto);
        Task<List<object>> GetUserListAsync(int userId);
        Task UpdateAsync(int userId, int titleId, UpdateUserTitleDto dto);
    }
}
