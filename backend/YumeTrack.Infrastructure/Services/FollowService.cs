using Microsoft.EntityFrameworkCore;
using YumeTrack.Application.DTOs.Users;
using YumeTrack.Domain.Entities;
using YumeTrack.Infrastructure.Persistence;

namespace YumeTrack.Infrastructure.Services
{
    public class FollowService
    {
        private readonly AppDbContext _context;

        public FollowService(AppDbContext context)
        {
            _context = context;
        }

        public async Task FollowAsync(int followerId, int followingId)
        {
            if (followerId == followingId)
                throw new InvalidOperationException("No podés seguirte a vos mismo.");

            var targetUserExists = await _context.Users
                .AnyAsync(u => u.Id == followingId);

            if (!targetUserExists)
                throw new InvalidOperationException("El usuario no existe.");

            var alreadyExists = await _context.UserFollows
                .AnyAsync(f => f.FollowerId == followerId && f.FollowingId == followingId);

            if (alreadyExists)
                throw new InvalidOperationException("Ya estás siguiendo a este usuario.");

            var follow = new UserFollow
            {
                FollowerId = followerId,
                FollowingId = followingId,
                CreatedAt = DateTime.UtcNow
            };

            _context.UserFollows.Add(follow);
            await _context.SaveChangesAsync();
        }

        public async Task UnfollowAsync(int followerId, int followingId)
        {
            var follow = await _context.UserFollows
                .FirstOrDefaultAsync(f => f.FollowerId == followerId && f.FollowingId == followingId);

            if (follow == null)
                return;

            _context.UserFollows.Remove(follow);
            await _context.SaveChangesAsync();
        }

        public async Task<List<FollowUserDto>> GetFollowersAsync(int currentUserId)
        {
            var users = await _context.UserFollows
                .Where(f => f.FollowingId == currentUserId)
                .Select(f => f.Follower)
                .AsNoTracking()
                .ToListAsync();

            var userIds = users.Select(u => u.Id).ToList();

            var followingIds = await _context.UserFollows
                .Where(f => f.FollowerId == currentUserId && userIds.Contains(f.FollowingId))
                .Select(f => f.FollowingId)
                .ToListAsync();

            return users.Select(u => new FollowUserDto
            {
                Id = u.Id,
                UserName = u.UserName,
                Bio = u.Bio,
                IsFollowing = followingIds.Contains(u.Id)
            }).ToList();
        }

        public async Task<List<FollowUserDto>> GetFollowingAsync(int currentUserId)
        {
            var users = await _context.UserFollows
                .Where(f => f.FollowerId == currentUserId)
                .Select(f => f.Following)
                .AsNoTracking()
                .ToListAsync();

            return users.Select(u => new FollowUserDto
            {
                Id = u.Id,
                UserName = u.UserName,
                Bio = u.Bio,
                IsFollowing = true
            }).ToList();
        }
    }
}