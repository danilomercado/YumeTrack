using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using YumeTrack.Domain.Entities;

namespace YumeTrack.Infrastructure.Persistence
{
    public class MediaTranslationConfiguration : IEntityTypeConfiguration<MediaTranslation>
    {
        public void Configure(EntityTypeBuilder<MediaTranslation> builder)
        {
            builder.ToTable("MediaTranslations");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.KitsuId)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(x => x.MediaType)
                .IsRequired()
                .HasMaxLength(20);

            builder.Property(x => x.Language)
                .IsRequired()
                .HasMaxLength(10);

            builder.Property(x => x.OriginalSynopsis)
                .IsRequired();

            builder.Property(x => x.TranslatedSynopsis)
                .IsRequired();

            builder.Property(x => x.CreatedAtUtc)
                .IsRequired();

            builder.Property(x => x.UpdatedAtUtc)
                .IsRequired();

            builder.HasIndex(x => new { x.KitsuId, x.MediaType, x.Language })
                .IsUnique();
        }
    }
}