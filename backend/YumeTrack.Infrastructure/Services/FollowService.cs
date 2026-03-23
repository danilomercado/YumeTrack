using Microsoft.EntityFrameworkCore;
using YumeTrack.Infrastructure.Persistence;
using YumeTrack.Domain.Entities;

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

            var exists = await _context.UserFollows
                .AnyAsync(f => f.FollowerId == followerId && f.FollowingId == followingId);

            if (exists)
                throw new InvalidOperationException("Ya estás siguiendo a este usuario.");

            var follow = new UserFollow
            {
                FollowerId = followerId,
                FollowingId = followingId
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

        public async Task<bool> IsFollowingAsync(int followerId, int followingId)
        {
            return await _context.UserFollows
                .AnyAsync(f => f.FollowerId == followerId && f.FollowingId == followingId);
        }

        public async Task<int> GetFollowersCountAsync(int userId)
        {
            return await _context.UserFollows
                .CountAsync(f => f.FollowingId == userId);
        }

        public async Task<int> GetFollowingCountAsync(int userId)
        {
            return await _context.UserFollows
                .CountAsync(f => f.FollowerId == userId);
        }
    }
}