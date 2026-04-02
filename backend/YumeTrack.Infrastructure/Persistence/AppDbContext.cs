using Microsoft.EntityFrameworkCore;
using YumeTrack.Domain.Entities;

namespace YumeTrack.Infrastructure.Persistence
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Title> Titles => Set<Title>();
        public DbSet<UserTitle> UserTitles => Set<UserTitle>();
        public DbSet<MediaTranslation> MediaTranslations => Set<MediaTranslation>();
        public DbSet<UserFollow> UserFollows => Set<UserFollow>();
        public DbSet<Notification> Notifications => Set<Notification>();
        public DbSet<ReviewLike> ReviewLikes { get; set; }
        public DbSet<ReviewComments> ReviewComments { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.Id);

                entity.Property(u => u.UserName)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(u => u.NormalizedUserName)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(u => u.Email)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(u => u.PasswordHash)
                    .IsRequired();

                entity.Property(u => u.Bio)
                    .HasMaxLength(300);

                entity.Property(u => u.CreatedAt)
                    .IsRequired();

                entity.HasIndex(u => u.NormalizedUserName)
                    .IsUnique();

                entity.HasIndex(u => u.Email)
                    .IsUnique();
            });

            modelBuilder.Entity<Title>(entity =>
            {
                entity.HasKey(t => t.Id);

                entity.Property(t => t.ExternalId)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(t => t.Source)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(t => t.CanonicalTitle)
                    .IsRequired()
                    .HasMaxLength(300);

                entity.Property(t => t.Synopsis);

                entity.Property(t => t.PosterImageUrl)
                    .HasMaxLength(1000);

                entity.Property(t => t.MediaType)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.HasIndex(t => new { t.ExternalId, t.Source })
                    .IsUnique();
            });

            modelBuilder.Entity<UserTitle>(entity =>
            {
                entity.HasKey(ut => ut.Id);

                entity.Property(ut => ut.Notes)
                    .HasMaxLength(2000);

                entity.Property(ut => ut.UpdatedAt)
                    .IsRequired();

                entity.HasOne(ut => ut.User)
                    .WithMany(u => u.UserTitles)
                    .HasForeignKey(ut => ut.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ut => ut.Title)
                    .WithMany(t => t.UserTitles)
                    .HasForeignKey(ut => ut.TitleId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(ut => new { ut.UserId, ut.TitleId })
                    .IsUnique();
            });

            modelBuilder.Entity<MediaTranslation>(entity =>
            {
                entity.HasKey(mt => mt.Id);

                entity.Property(mt => mt.KitsuId)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(mt => mt.MediaType)
                    .IsRequired()
                    .HasMaxLength(20);

                entity.Property(mt => mt.Language)
                    .IsRequired()
                    .HasMaxLength(10);

                entity.Property(mt => mt.OriginalSynopsis)
                    .IsRequired();

                entity.Property(mt => mt.TranslatedSynopsis)
                    .IsRequired();

                entity.Property(mt => mt.CreatedAtUtc)
                    .IsRequired();

                entity.Property(mt => mt.UpdatedAtUtc)
                    .IsRequired();

                entity.HasIndex(mt => new { mt.KitsuId, mt.MediaType, mt.Language })
                    .IsUnique();
            });

            modelBuilder.Entity<UserFollow>(entity =>
            {
                entity.HasKey(f => f.Id);

                entity.Property(f => f.CreatedAt)
                    .IsRequired();

                entity.HasOne(f => f.Follower)
                    .WithMany(u => u.Following)
                    .HasForeignKey(f => f.FollowerId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(f => f.Following)
                    .WithMany(u => u.Followers)
                    .HasForeignKey(f => f.FollowingId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(f => new { f.FollowerId, f.FollowingId })
                    .IsUnique();
            });

            modelBuilder.Entity<Notification>(entity =>
            {
                entity.HasKey(n => n.Id);

                entity.HasOne(n => n.User)
                    .WithMany()
                    .HasForeignKey(n => n.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(n => n.ActorUser)
                    .WithMany()
                    .HasForeignKey(n => n.ActorUserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<ReviewLike>()
                .HasIndex(x => new { x.UserId, x.UserTitleId })
                .IsUnique();

            modelBuilder.Entity<ReviewLike>()
                .HasOne(x => x.User)
                .WithMany(u => u.ReviewLikes)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ReviewLike>()
                .HasOne(x => x.UserTitle)
                .WithMany(ut => ut.ReviewLikes)
                .HasForeignKey(x => x.UserTitleId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ReviewComments>(entity =>
            {
                entity.HasKey(c => c.Id);

                entity.Property(c => c.Content)
                    .IsRequired()
                    .HasMaxLength(1000);

                entity.Property(c => c.CreatedAt)
                    .IsRequired();

                entity.HasOne(c => c.User)
                    .WithMany()
                    .HasForeignKey(c => c.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(c => c.UserTitle)
                    .WithMany(ut => ut.Comments)
                    .HasForeignKey(c => c.UserTitleId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }

    }
}