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
        public DbSet<UserBlock> UserBlocks => Set<UserBlock>();
        public DbSet<CommentReaction> CommentReactions => Set<CommentReaction>();
        public DbSet<UserList> UserLists => Set<UserList>();
        public DbSet<UserListItem> UserListItems => Set<UserListItem>();
        public DbSet<EpisodeComment> EpisodeComments => Set<EpisodeComment>();
        public DbSet<ContentReport> ContentReports => Set<ContentReport>();
        public DbSet<ActivityEvent> ActivityEvents => Set<ActivityEvent>();
        public DbSet<Conversation> Conversations => Set<Conversation>();
        public DbSet<ConversationParticipant> ConversationParticipants => Set<ConversationParticipant>();
        public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();
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

                entity.Property(u => u.AvatarUrl)
                    .HasMaxLength(500);

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

            modelBuilder.Entity<CommentReaction>(entity =>
            {
                entity.HasKey(r => r.Id);

                // Una reacción por usuario y comentario (se puede cambiar).
                entity.HasIndex(r => new { r.CommentId, r.UserId }).IsUnique();

                entity.HasOne(r => r.Comment)
                    .WithMany(c => c.Reactions)
                    .HasForeignKey(r => r.CommentId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(r => r.User)
                    .WithMany()
                    .HasForeignKey(r => r.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<UserList>(entity =>
            {
                entity.HasKey(l => l.Id);
                entity.HasIndex(l => l.Token).IsUnique();
                entity.HasIndex(l => l.UserId);

                entity.HasOne(l => l.User)
                    .WithMany()
                    .HasForeignKey(l => l.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<UserListItem>(entity =>
            {
                entity.HasKey(i => i.Id);
                entity.HasIndex(i => new { i.ListId, i.TitleId }).IsUnique();

                entity.HasOne(i => i.List)
                    .WithMany(l => l.Items)
                    .HasForeignKey(i => i.ListId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(i => i.Title)
                    .WithMany()
                    .HasForeignKey(i => i.TitleId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<EpisodeComment>(entity =>
            {
                entity.HasKey(c => c.Id);
                entity.HasIndex(c => new { c.TitleId, c.Episode, c.CreatedAt });

                entity.HasOne(c => c.User)
                    .WithMany()
                    .HasForeignKey(c => c.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(c => c.Title)
                    .WithMany()
                    .HasForeignKey(c => c.TitleId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<UserBlock>(entity =>
            {
                entity.HasKey(b => b.Id);

                entity.HasIndex(b => new { b.BlockerId, b.BlockedId }).IsUnique();

                entity.HasOne(b => b.Blocker)
                    .WithMany()
                    .HasForeignKey(b => b.BlockerId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(b => b.Blocked)
                    .WithMany()
                    .HasForeignKey(b => b.BlockedId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ContentReport>(entity =>
            {
                entity.HasKey(r => r.Id);

                entity.HasIndex(r => new { r.ReporterId, r.TargetType, r.TargetId }).IsUnique();
                entity.HasIndex(r => r.Status);

                entity.HasOne(r => r.Reporter)
                    .WithMany()
                    .HasForeignKey(r => r.ReporterId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ActivityEvent>(entity =>
            {
                entity.HasKey(a => a.Id);

                entity.HasIndex(a => new { a.UserId, a.CreatedAt });

                entity.HasOne(a => a.User)
                    .WithMany()
                    .HasForeignKey(a => a.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(a => a.Title)
                    .WithMany()
                    .HasForeignKey(a => a.TitleId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Conversation>(entity =>
            {
                entity.HasKey(c => c.Id);

                entity.Property(c => c.DirectKey).HasMaxLength(50);

                // Varias conversaciones pueden tener DirectKey nulo (grupos); las 1 a 1 son únicas.
                entity.HasIndex(c => c.DirectKey).IsUnique();
            });

            modelBuilder.Entity<ConversationParticipant>(entity =>
            {
                entity.HasKey(p => p.Id);

                entity.HasIndex(p => new { p.ConversationId, p.UserId }).IsUnique();
                entity.HasIndex(p => p.UserId);

                entity.HasOne(p => p.Conversation)
                    .WithMany(c => c.Participants)
                    .HasForeignKey(p => p.ConversationId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(p => p.User)
                    .WithMany()
                    .HasForeignKey(p => p.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ChatMessage>(entity =>
            {
                entity.HasKey(m => m.Id);

                entity.Property(m => m.Content)
                    .IsRequired()
                    .HasMaxLength(2000);

                entity.HasIndex(m => new { m.ConversationId, m.Id });

                entity.HasOne(m => m.Conversation)
                    .WithMany(c => c.Messages)
                    .HasForeignKey(m => m.ConversationId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(m => m.Sender)
                    .WithMany()
                    .HasForeignKey(m => m.SenderId)
                    .OnDelete(DeleteBehavior.Cascade);
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