import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getReviewDetailRequest,
  likeReviewRequest,
  unlikeReviewRequest,
} from "../../services/feedService";

const ReviewDetail = () => {
  const { userTitleId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getReviewDetailRequest(userTitleId);
        setItem(res?.data ?? null);
      } catch (err) {
        console.error("Error cargando review:", err);
        setError("No se pudo cargar la review.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userTitleId]);

  const handleToggleLike = async () => {
    if (!item) return;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const wasLiked = Boolean(item.isLikedByCurrentUser);
    const previous = item;

    setLiking(true);
    setItem((prev) =>
      prev
        ? {
            ...prev,
            isLikedByCurrentUser: !wasLiked,
            likesCount: wasLiked
              ? Math.max(0, (prev.likesCount ?? 0) - 1)
              : (prev.likesCount ?? 0) + 1,
          }
        : prev,
    );

    try {
      if (wasLiked) {
        await unlikeReviewRequest(item.userTitleId);
      } else {
        await likeReviewRequest(item.userTitleId);
      }
    } catch (err) {
      console.error("Error al actualizar like:", err);
      setItem(previous);
    } finally {
      setLiking(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white">
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
          Cargando review...
        </div>
      </main>
    );
  }

  if (error || !item) {
    return (
      <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
          {error || "Review no encontrada."}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-3xl space-y-4">
        <Link
          to="/feed"
          className="text-sm text-violet-400 hover:text-violet-300"
        >
          ← Volver al feed
        </Link>

        <article className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 font-bold text-white">
              {item.userName?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div>
              <Link
                to={`/profile/${item.userName}`}
                className="text-sm font-semibold text-white hover:text-violet-400"
              >
                {item.userName}
              </Link>
              <p className="text-xs text-zinc-400">
                {new Date(item.reviewUpdatedAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mb-4 flex gap-4">
            {item.posterImageUrl ? (
              <img
                src={item.posterImageUrl}
                alt={item.canonicalTitle}
                className="h-28 w-20 rounded-xl object-cover"
              />
            ) : (
              <div className="h-28 w-20 rounded-xl bg-white/5" />
            )}

            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white">
                {item.canonicalTitle}
              </h1>
              <p className="text-xs uppercase text-zinc-400">
                {item.mediaType}
              </p>
              {item.score !== null && item.score !== undefined && (
                <p className="mt-2 text-sm font-semibold text-yellow-300">
                  ★ {item.score}/10
                </p>
              )}
            </div>
          </div>

          <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-200">
            {item.review}
          </p>

          <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={handleToggleLike}
              disabled={liking}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                item.isLikedByCurrentUser
                  ? "bg-fuchsia-500/20 text-fuchsia-300"
                  : "bg-white/10 text-zinc-200 hover:bg-white/20"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {item.isLikedByCurrentUser ? "♥ Te gusta" : "♡ Me gusta"}
            </button>

            <span className="text-xs text-zinc-400">
              {item.likesCount ?? 0} likes
            </span>
          </div>
        </article>
      </div>
    </main>
  );
};

export default ReviewDetail;
