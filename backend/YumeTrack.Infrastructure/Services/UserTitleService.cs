using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using YumeTrack.Application.DTOs.UserTitles;
using YumeTrack.Application.Interfaces;
using YumeTrack.Domain.Entities;
using YumeTrack.Infrastructure.Persistence;

namespace YumeTrack.Infrastructure.Services
{
    public class UserTitleService : IUserTitleService
    {
        private readonly AppDbContext _context;

        public UserTitleService(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(int userId, CreateUserTitleDto dto)
        {
            // 🔴 1. Validar que el título exista
            var titleExists = await _context.Titles
                .AnyAsync(t => t.Id == dto.TitleId);

            if (!titleExists)
                throw new Exception("El título no existe en la base de datos.");

            // 🔴 2. Validar duplicado (esto ya lo tenías bien)
            var exists = await _context.UserTitles
                .AnyAsync(ut => ut.UserId == userId && ut.TitleId == dto.TitleId);

            if (exists)
                throw new Exception("Ya tenes este título en tu lista.");

            // 🔴 3. Crear
            var userTitle = new UserTitle
            {
                UserId = userId,
                TitleId = dto.TitleId,
                Status = dto.Status,
                Progress = 0,
                IsFavorite = false,
            };

            _context.UserTitles.Add(userTitle);
            await _context.SaveChangesAsync();
        }

        public async Task<List<object>> GetUserListAsync(int userId)
        {
            return await _context.UserTitles
                .Where(ut => ut.UserId == userId)
                .Include(ut => ut.Title)
                .Select(ut => new
                {
                    ut.Id,
                    ut.Status,
                    ut.Progress,
                    ut.Score,
                    ut.IsFavorite,
                    ut.Title.CanonicalTitle,
                    ut.Title.PosterImageUrl
                })
                .ToListAsync<object>();
        }

        public async Task UpdateAsync(int userId, int userTitleId, UpdateUserTitleDto dto)
        {
            var userTitle = await _context.UserTitles
                .FirstOrDefaultAsync(ut => ut.Id == userTitleId && ut.UserId == userId);

            if (userTitle is null)
                throw new Exception("No encontrado.");

            userTitle.Status = dto.Status;
            userTitle.Progress = dto.Progress;
            userTitle.Score = dto.Score;
            userTitle.IsFavorite = dto.IsFavorite;
            userTitle.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }
    }
}
