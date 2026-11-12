import { useEffect, useState } from "react";
import UserAvatar from "../../components/UserAvatar/UserAvatar";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getReviewDetailRequest,
  toggleLikeRequest,
} from "../../services/feedService";
import ReviewComments from "../../components/ReviewComments/ReviewComments";
import { formatRelativeTime } from "../../utils/formatRelativeTime";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { useAuth } from "../../context/AuthContext";

const ReviewDetail = () => {
  useDocumentTitle("Reseña");
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [data, setData] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getReviewDetailRequest(id);
        setData(res.data);
        setLiked(res.data.isLikedByCurrentUser);
        setLikesCount(res.data.likesCount);
      } catch (err) {
        console.error("Error cargando review detail:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const prevLiked = liked;
    const prevLikes = likesCount;

    setLiked(!prevLiked);
    setLikesCount(prevLiked ? prevLikes - 1 : prevLikes + 1);

    try {
      await toggleLikeRequest(id);
    } catch {
      setLiked(prevLiked);
      setLikesCount(prevLikes);
    }
  };

  if (loading) {
    return (
      <main className="min-h-dvh text-paper">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse rounded-2xl bg-panel p-6">
            <div className="mb-6 h-4 w-28 rounded bg-white/10" />
            <div className="flex gap-5">
              <div className="h-40 w-28 rounded-2xl bg-white/10" />
              <div className="flex-1 space-y-3">
                <div className="h-5 w-48 rounded bg-white/10" />
                <div className="h-4 w-24 rounded bg-white/10" />
                <div className="h-4 w-32 rounded bg-white/10" />
                <div className="mt-6 h-4 w-full rounded bg-white/10" />
                <div className="h-4 w-11/12 rounded bg-white/10" />
                <div className="h-4 w-10/12 rounded bg-white/10" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-dvh text-paper">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-red-500/10 p-6 text-red-300">
            No se pudo cargar la reseña.
          </div>
        </div>
      </main>
    );
  }

  const userName = data.userName || "Usuario";
  const canonicalTitle = data.canonicalTitle || "Sin título";
  const mediaType = data.mediaType || "media";
  const score =
    data.score !== null && data.score !== undefined ? data.score : null;

  return (
    <main className="min-h-dvh text-paper">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-2 rounded-xl bg-panel-2 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/10 hover:text-paper"
        >
          ← Volver
        </button>

        <section className="overflow-hidden rounded-2xl bg-panel">
          <div className="  bg-accent/10 px-6 py-5">
            <div className="flex items-start gap-3">
              <Link
                to={`/profile/${userName}`}
                aria-label={userName}
              >
                <UserAvatar
                  name={userName}
                  src={data.avatarUrl}
                  size="h-12 w-12"
                  text="text-lg"
                />
              </Link>{" "}
              <div className="min-w-0 flex-1">
                <Link
                  to={`/profile/${userName}`}
                  className="block truncate text-base font-semibold text-paper transition hover:text-accent-soft"
                >
                  {userName}
                </Link>

                <div className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-zinc-400">
                  <span>{formatRelativeTime(data.reviewUpdatedAt)}</span>

                  <span className="h-1 w-1 rounded-full bg-zinc-600" />

                  <span className="rounded-full bg-panel-2 px-2 py-0.5 text-zinc-300">
                    {mediaType}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex flex-col gap-6 md:flex-row">
              <div className="mx-auto w-full max-w-[180px] md:mx-0 md:w-[180px]">
                {data.posterImageUrl ? (
                  <img
                    src={data.posterImageUrl}
                    alt={canonicalTitle}
                    className="w-full rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex aspect-[2/3] w-full items-center justify-center rounded-2xl   bg-panel-2 text-sm text-zinc-500">
                    Sin imagen
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl leading-tight text-paper sm:text-3xl">
                    {canonicalTitle}
                  </h1>

                  {score !== null && (
                    <span className="rounded-full bg-gold/15 px-3 py-1 text-sm font-semibold text-gold">
                      ★ {score}/10
                    </span>
                  )}
                </div>

                <div className="rounded-2xl bg-ground p-4">
                  <p className="whitespace-pre-line text-sm leading-7 text-zinc-300 sm:text-[15px]">
                    {data.review}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleLike}
                    className={`inline-flex items-center gap-2 rounded-xl  px-4 py-2 text-sm font-medium transition ${
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
                      className={`h-5 w-5 transition-transform ${
                        liked ? "scale-110" : "scale-100"
                      }`}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 8.25c0 6.075-9 11.25-9 11.25s-9-5.175-9-11.25a5.25 5.25 0 0 1 9-3.712A5.25 5.25 0 0 1 21 8.25Z"
                      />
                    </svg>

                    <span>{liked ? "Te gusta" : "Me gusta"}</span>
                    <span className="text-zinc-400">·</span>
                    <span>{likesCount}</span>
                  </button>

                  <Link
                    to={`/profile/${userName}`}
                    className="inline-flex items-center rounded-xl bg-panel-2 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/10 hover:text-paper"
                  >
                    Ver perfil
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-panel p-6">
          <h2 className="mb-4 text-lg text-paper">Comentarios</h2>

          <ReviewComments userTitleId={id} />
        </section>
      </div>
    </main>
  );
};

export default ReviewDetail;
