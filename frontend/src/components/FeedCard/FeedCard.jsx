import { Link } from "react-router-dom";

const FeedCard = ({ item }) => {
  if (!item) return null;

  const userName = item.userName || "Usuario";
  const canonicalTitle = item.canonicalTitle || "Sin título";
  const mediaType = item.mediaType || "media";
  const review = item.review || "Sin review.";
  const posterImageUrl = item.posterImageUrl || "";
  const score =
    item.score !== null && item.score !== undefined ? item.score : null;

  return (
    <article className="group rounded-2xl border border-white/10 bg-zinc-900/70 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-violet-500/30 hover:bg-zinc-900">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 font-bold text-white shadow-lg shadow-violet-900/30">
          {userName.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0">
          <Link
            to={`/profile/${userName}`}
            className="block truncate text-sm font-semibold text-white transition group-hover:text-violet-400"
          >
            {userName}
          </Link>

          <span className="text-xs text-zinc-400">
            {item.reviewUpdatedAt
              ? new Date(item.reviewUpdatedAt).toLocaleDateString()
              : ""}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        {posterImageUrl ? (
          <img
            src={posterImageUrl}
            alt={canonicalTitle}
            className="h-24 w-16 rounded-xl object-cover shadow-md"
          />
        ) : (
          <div className="h-24 w-16 rounded-xl bg-white/5" />
        )}

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="line-clamp-1 text-sm font-bold text-white">
              {canonicalTitle}
            </h3>

            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-300">
              {mediaType}
            </span>

            {score !== null && (
              <span className="rounded-full bg-yellow-500/15 px-2 py-0.5 text-[11px] font-semibold text-yellow-300">
                ★ {score}/10
              </span>
            )}
          </div>

          <p className="line-clamp-4 text-sm leading-6 text-zinc-300">
            {review}
          </p>
        </div>
      </div>
    </article>
  );
};

export default FeedCard;
