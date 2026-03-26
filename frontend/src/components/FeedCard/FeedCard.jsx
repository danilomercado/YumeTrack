import { useState } from "react";
import { Link } from "react-router-dom";
import { toggleLikeRequest } from "../../services/feedService";

const FeedCard = ({ item }) => {
  const [liked, setLiked] = useState(item.isLikedByCurrentUser);
  const [likesCount, setLikesCount] = useState(item.likesCount);

  if (!item) return null;

  const userName = item.userName || "Usuario";
  const canonicalTitle = item.canonicalTitle || "Sin título";
  const mediaType = item.mediaType || "media";
  const review = item.review || "Sin review.";
  const posterImageUrl = item.posterImageUrl || "";
  const score =
    item.score !== null && item.score !== undefined ? item.score : null;

  const handleLike = async () => {
    const prevLiked = liked;
    const prevLikesCount = likesCount;

    setLiked(!prevLiked);
    setLikesCount(prevLiked ? prevLikesCount - 1 : prevLikesCount + 1);

    try {
      await toggleLikeRequest(item.userTitleId);
    } catch {
      setLiked(prevLiked);
      setLikesCount(prevLikesCount);
    }
  };

  return (
    <article className="group rounded-2xl border border-white/10 bg-zinc-900/70 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-violet-500/30 hover:bg-zinc-900">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 font-bold text-white shadow-lg shadow-violet-900/30">
          {userName.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <Link
            to={`/profile/${userName}`}
            className="block truncate text-sm font-semibold text-white transition group-hover:text-violet-400"
          >
            {userName}
          </Link>

          <div className="mt-1 flex items-center gap-3">
            <span className="text-xs text-zinc-400">
              {item.reviewUpdatedAt
                ? new Date(item.reviewUpdatedAt).toLocaleDateString()
                : ""}
            </span>

            <button
              onClick={handleLike}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                liked
                  ? "border-pink-500/30 bg-pink-500/10 text-pink-300 hover:bg-pink-500/20"
                  : "border-white/10 bg-white/5 text-zinc-300 hover:border-pink-500/20 hover:bg-pink-500/10 hover:text-pink-300"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={liked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.8"
                className={`h-4 w-4 transition-transform ${
                  liked ? "scale-110" : "scale-100"
                }`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0 6.075-9 11.25-9 11.25s-9-5.175-9-11.25a5.25 5.25 0 0 1 9-3.712A5.25 5.25 0 0 1 21 8.25Z"
                />
              </svg>

              <span>{likesCount}</span>
            </button>
          </div>
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
