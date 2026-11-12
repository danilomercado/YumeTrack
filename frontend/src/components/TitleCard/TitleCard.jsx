// showType: el badge Anime/Manga solo aporta donde se mezclan los dos tipos
// (búsqueda, catálogo). En un rail de un solo tipo se omite.
const TitleCard = ({ title, onClick, index = 0, showType = true }) => {
  const isManga = title.mediaType?.toLowerCase() === "manga";

  const metaText = isManga
    ? title.chapterCount
      ? `${title.chapterCount} caps`
      : null
    : title.episodeCount
      ? `${title.episodeCount} eps`
      : null;

  const meta = [title.status, metaText].filter(Boolean).join(" · ");

  return (
    <button
      type="button"
      onClick={onClick}
      style={{ "--i": Math.min(index, 9) }}
      className="stagger-item poster-card group flex w-full flex-col gap-3 rounded-2xl text-left"
    >
      <div className="poster aspect-[2/3] bg-panel-2">
        {title.posterImage ? (
          <img
            src={title.posterImage}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center kanji text-6xl text-zinc-500">
            夢
          </div>
        )}

        {showType && (
          <span
            className={`absolute left-2 top-2 z-10 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
              isManga ? "bg-paper text-ground" : "bg-accent text-paper"
            }`}
          >
            {isManga ? "Manga" : "Anime"}
          </span>
        )}
      </div>

      <div className="px-0.5">
        <h3 className="poster-title line-clamp-2 text-sm font-bold leading-snug text-paper transition-colors duration-200 sm:text-[15px]">
          {title.title}
        </h3>

        {meta && <p className="mt-1 text-[13px] text-zinc-400">{meta}</p>}
      </div>
    </button>
  );
};

export default TitleCard;
