namespace YumeTrack.Application.Interfaces
{
    public interface ITranslationService
    {
        Task<string?> GetTranslatedSynopsisAsync(
            string kitsuId,
            string mediaType,
            string? originalSynopsis,
            string language,
            CancellationToken cancellationToken = default);
    }
}