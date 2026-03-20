using Microsoft.EntityFrameworkCore;
using YumeTrack.Domain.Entities;

namespace YumeTrack.Infrastructure.Persistence
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Title> Titles => Set<Title>();
        public DbSet<UserTitle> UserTitles => Set<UserTitle>();

        public DbSet<MediaTranslation> MediaTranslations => Set<MediaTranslation>();
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

            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        }
    }
}
