import UserAvatar from "../UserAvatar/UserAvatar";
import { useState } from "react";
import ReportMenu from "../ReportMenu/ReportMenu";
import { Link, useNavigate } from "react-router-dom";
import { toggleLikeRequest } from "../../services/feedService";
import {
  followUserRequest,
  unfollowUserRequest,
} from "../../services/followService";
import { useToast } from "../../context/ToastContext";
import { formatRelativeTime } from "../../utils/formatRelativeTime";
import { useAuth } from "../../context/AuthContext";

// Pétalos que salen disparados del corazón al dar like.
const BURST = [
  { dx: "-26px", dy: "-22px" },
  { dx: "0px", dy: "-32px" },
  { dx: "26px", dy: "-22px" },
  { dx: "-30px", dy: "4px" },
  { dx: "30px", dy: "4px" },
  { dx: "0px", dy: "28px" },
];

const FeedCard = ({ item, index = 0 }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [liked, setLiked] = useState(item.isLikedByCurrentUser);
  const [likesCount, setLikesCount] = useState(item.likesCount);
  const [burstKey, setBurstKey] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [following, setFollowing] = useState(Boolean(item.isFollowingAuthor));
  const [followBusy, setFollowBusy] = useState(false);

  if (!item || hidden) return null;

  const userName = item.userName || "Usuario";
  const canonicalTitle = item.canonicalTitle || "Sin título";
  const mediaType = item.mediaType || "media";
  const review = item.review || "Sin review.";
  const posterImageUrl = item.posterImageUrl || "";
  const score =
    item.score !== null && item.score !== undefined ? item.score : null;
  const avatarTone =
    userName.charCodeAt(0) % 2
      ? "bg-accent text-paper"
      : "bg-paper text-ground";

  const isOwnReview = Boolean(user?.id) && user.id === item.userId;
  const canFollow = Boolean(item.userId) && !isOwnReview;

  const handleFollow = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (followBusy) return;

    const wasFollowing = following;
    setFollowing(!wasFollowing);
    setFollowBusy(true);

    try {
      if (wasFollowing) {
        await unfollowUserRequest(item.userId);
      } else {
        await followUserRequest(item.userId);
        toast(`Ahora seguís a ${userName}`);
      }
    } catch (error) {
      setFollowing(wasFollowing);
      toast(error.message || "No se pudo actualizar el seguimiento", "error");
    } finally {
      setFollowBusy(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const prevLiked = liked;
    const prevLikesCount = likesCount;

    setLiked(!prevLiked);
    setLikesCount(prevLiked ? prevLikesCount - 1 : prevLikesCount + 1);
    if (!prevLiked) setBurstKey((value) => value + 1);

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
      style={{ "--i": Math.min(index, 9) }}
      className="stagger-item springy group cursor-pointer rounded-2xl bg-panel p-4 hover:-translate-y-1 hover:bg-panel-2"
    >
      <div className="mb-3 flex items-center gap-3">
        <UserAvatar name={userName} src={item.avatarUrl} tone={avatarTone} />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-zinc-400">
            <Link
              to={`/profile/${userName}`}
              onClick={(event) => event.stopPropagation()}
              className="font-bold text-paper hover:text-accent-soft"
            >
              {userName}
            </Link>{" "}
            reseñó
          </p>
          <p className="text-[13px] text-zinc-500">
            {formatRelativeTime(item.reviewUpdatedAt)}
          </p>
        </div>

        {canFollow && (
          <button
            type="button"
            aria-pressed={following}
            onClick={(event) => {
              event.stopPropagation();
              handleFollow();
            }}
            className={`springy rounded-full px-3 py-1.5 text-[13px] font-bold hover:scale-105 ${
              following
                ? "bg-panel-2 text-zinc-300 hover:bg-white/10"
                : "bg-paper text-ground hover:bg-accent hover:text-paper"
            }`}
          >
            {following ? "Siguiendo" : "+ Seguir"}
          </button>
        )}

        <ReportMenu
          targetType="review"
          targetId={item.userTitleId}
          userId={item.userId}
          userName={userName}
          onBlocked={() => setHidden(true)}
        />

        <button
          type="button"
          aria-pressed={liked}
          aria-label={liked ? "Quitar me gusta" : "Me gusta"}
          onClick={(event) => {
            event.stopPropagation();
            handleLike();
          }}
          className={`relative inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-bold ${
            liked
              ? "bg-accent text-paper"
              : "bg-panel-2 text-zinc-300 hover:bg-accent/20 hover:text-accent-soft"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={liked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.8"
            className={`h-4 w-4 ${liked ? "heart-pop" : ""}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0 6.075-9 11.25-9 11.25s-9-5.175-9-11.25a5.25 5.25 0 0 1 9-3.712A5.25 5.25 0 0 1 21 8.25Z"
            />
          </svg>

          <span>{likesCount}</span>

          {burstKey > 0 &&
            BURST.map((petal, position) => (
              <span
                key={`${burstKey}-${position}`}
                aria-hidden="true"
                className="burst-petal"
                style={{ "--dx": petal.dx, "--dy": petal.dy }}
              />
            ))}
        </button>
      </div>

      <div className="flex gap-3">
        {posterImageUrl ? (
          <img
            src={posterImageUrl}
            alt={canonicalTitle}
            loading="lazy"
            decoding="async"
            className="h-28 w-[4.5rem] shrink-0 rounded-xl object-cover"
          />
        ) : (
          <div className="kanji flex h-28 w-[4.5rem] shrink-0 items-center justify-center rounded-xl bg-panel-2 text-3xl text-zinc-600">
            夢
          </div>
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
              <span className="rounded-full bg-paper px-2 py-0.5 text-[13px] font-bold text-ground">
                ★ {score}/10
              </span>
            )}
          </div>

          <p className="line-clamp-4 text-sm leading-6 text-zinc-300">
            {review}
          </p>

          <p className="mt-3 flex items-center gap-1.5 text-[13px] text-zinc-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 10h8M8 14h5m-9 6 3-3h11a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14Z"
              />
            </svg>
            {item.commentsCount ?? 0}{" "}
            {item.commentsCount === 1 ? "comentario" : "comentarios"}
          </p>
        </div>
      </div>
    </article>
  );
};

export default FeedCard;
