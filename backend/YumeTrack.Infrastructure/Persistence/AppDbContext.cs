using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;
using YumeTrack.Domain.Entities;

namespace YumeTrack.Infrastructure.Persistence
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Title> Titles => Set<Title>();
        public DbSet<UserTitle> UserTitles => Set<UserTitle>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
               
            modelBuilder.Entity<UserTitle>()
                .HasIndex(ut => new { ut.UserId, ut.TitleId })
                .IsUnique();

            modelBuilder.Entity<UserTitle>()
                .HasOne(ut => ut.User)
                .WithMany(u => u.UserTitles)
                .HasForeignKey(ut => ut.UserId);

            modelBuilder.Entity<UserTitle>()
                .HasOne(ut => ut.Title)
                .WithMany(t => t.UserTitles)
                .HasForeignKey(ut => ut.TitleId);
        }
    }
}
