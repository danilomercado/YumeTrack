const TitleCard = ({ title, onClick }) => {
  const metaText =
    title.mediaType?.toLowerCase() === "manga"
      ? title.chapterCount
        ? `${title.chapterCount} caps`
        : null
      : title.episodeCount
        ? `${title.episodeCount} eps`
        : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 text-left transition duration-300 hover:-translate-y-1 hover:border-violet-400/40 hover:bg-zinc-900/80"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-zinc-800">
        {title.posterImage ? (
          <img
            src={title.posterImage}
            alt={title.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-500">
            Sin imagen
          </div>
        )}

        <span className="absolute left-2 top-2 rounded-full border border-white/10 bg-black/70 px-2 py-1 text-[11px] font-medium text-white backdrop-blur">
          {title.mediaType}
        </span>
      </div>

      <div className="p-3">
        <h3 className="line-clamp-2 min-h-[3.5rem] font-semibold text-white">
          {title.title}
        </h3>

        <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-400">
          {title.status && (
            <span className="rounded-full bg-white/5 px-2 py-1">
              {title.status}
            </span>
          )}

          {metaText && (
            <span className="rounded-full bg-white/5 px-2 py-1">
              {metaText}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default TitleCard;
