import { useState } from "react";
import { Link } from "react-router-dom";
import { toggleLikeRequest } from "../../services/feedService";
import { useNavigate } from "react-router-dom";
import { formatRelativeTime } from "../../utils/formatRelativeTime";
import { useAuth } from "../../context/AuthContext";

const FeedCard = ({ item }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
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
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

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
    <article
      onClick={() => navigate(`/reviews/${item.userTitleId}`)}
      className="group rounded-lg bg-panel p-4 transition duration-200 hover:-translate-y-0.5 hover:bg-panel-2"
    >
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent font-bold text-paper">
          {userName.charAt(0).toUpperCase()}{" "}
        </div>
        <div className="min-w-0 flex-1">
          <Link
            to={`/profile/${userName}`}
            className="block truncate text-sm font-semibold text-paper transition group-hover:text-accent-soft"
          >
            {userName}
          </Link>

          <div className="mt-1 flex items-center gap-3">
            <span className="text-[13px] text-zinc-400">
              {formatRelativeTime(item.reviewUpdatedAt)}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
              className={`inline-flex items-center gap-1.5 rounded-full  px-2.5 py-1 text-[13px] font-medium transition ${
                liked
                  ? " bg-accent/10 text-accent-soft hover:bg-accent/20"
                  : " bg-panel-2 text-zinc-300  hover:bg-accent/10 hover:text-accent-soft"
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
            loading="lazy"
            decoding="async"
            className="h-24 w-16 rounded-md object-cover"
          />
        ) : (
          <div className="h-24 w-16 rounded-md bg-panel-2" />
        )}

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="line-clamp-1 text-sm font-bold text-paper">
              {canonicalTitle}
            </h3>

            <span className="rounded-full bg-panel-2 px-2 py-0.5 text-[13px] text-zinc-300">
              {mediaType}
            </span>

            {score !== null && (
              <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[13px] font-semibold text-gold">
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
