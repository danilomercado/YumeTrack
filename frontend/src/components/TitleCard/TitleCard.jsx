const TitleCard = ({ title, onClick, index = 0 }) => {
  const isManga = title.mediaType?.toLowerCase() === "manga";

  const metaText = isManga
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
      style={{ "--i": Math.min(index, 9) }}
      className="stagger-item group flex flex-col overflow-hidden rounded-2xl bg-panel text-left springy hover:-translate-y-2 hover:-rotate-1 hover:scale-[1.03] hover:bg-panel-2"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-panel-2">
        {title.posterImage ? (
          <img
            src={title.posterImage}
            alt={title.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center kanji text-6xl text-zinc-600">
            夢
          </div>
        )}

        <span
          className={`absolute bottom-0 left-0 py-1 pl-2 pr-5 text-[13px] font-bold [clip-path:polygon(0_0,100%_0,calc(100%-10px)_100%,0_100%)] ${
            isManga ? "bg-ai text-ground" : "bg-accent text-paper"
          }`}
        >
          {isManga ? "Manga" : "Anime"}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-2 min-h-[2.75rem] text-sm font-bold leading-snug text-paper sm:text-base">
          {title.title}
        </h3>

        {(title.status || metaText) && (
          <p className="text-[13px] text-zinc-400">
            {[title.status, metaText].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
    </button>
  );
};

export default TitleCard;
