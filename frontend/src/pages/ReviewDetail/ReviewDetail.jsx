import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getReviewDetailRequest,
  toggleLikeRequest,
} from "../../services/feedService";

const ReviewDetail = () => {
  const { id } = useParams();

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
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleLike = async () => {
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

  if (loading) return <div className="text-white p-6">Cargando...</div>;
  if (!data) return <div className="text-red-400 p-6">No encontrada</div>;

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* Usuario */}
        <Link
          to={`/profile/${data.userName}`}
          className="text-violet-400 text-sm hover:underline"
        >
          @{data.userName}
        </Link>

        {/* Header */}
        <div className="mt-4 flex gap-4">
          <img src={data.posterImageUrl} className="w-24 rounded-xl" />

          <div>
            <h1 className="text-2xl font-bold">{data.canonicalTitle}</h1>

            <p className="text-sm text-zinc-400">{data.mediaType}</p>

            {data.score && (
              <span className="text-yellow-300 font-semibold">
                ★ {data.score}/10
              </span>
            )}
          </div>
        </div>

        {/* Review */}
        <p className="mt-6 text-zinc-300 leading-7 whitespace-pre-line">
          {data.review}
        </p>

        {/* Like */}
        <button
          onClick={handleLike}
          className={`mt-6 px-4 py-2 rounded-xl ${
            liked ? "bg-pink-500/20 text-pink-300" : "bg-white/10"
          }`}
        >
          ❤️ {likesCount}
        </button>
      </div>
    </main>
  );
};

export default ReviewDetail;
