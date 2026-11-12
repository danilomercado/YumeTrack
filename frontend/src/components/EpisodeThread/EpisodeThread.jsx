import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import UserAvatar from "../UserAvatar/UserAvatar";
import {
  createEpisodeCommentRequest,
  deleteEpisodeCommentRequest,
  getEpisodeCommentsRequest,
} from "../../services/communityService";
import { formatRelativeTime } from "../../utils/formatRelativeTime";

// Hilo por episodio (o capítulo): se comenta cada uno por separado para no spoilear.
const EpisodeThread = ({ kitsuId, mediaType, total, onNavigate }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isManga = mediaType?.toLowerCase() === "manga";
  const unit = isManga ? "capítulo" : "episodio";
  const max = total || 999;

  const [episode, setEpisode] = useState(1);
  const [comments, setComments] = useState(null);
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = async (target) => {
    try {
      setComments(await getEpisodeCommentsRequest(kitsuId, target, mediaType));
    } catch {
      setComments([]);
    }
  };

  useEffect(() => {
    let cancelled = false;

    getEpisodeCommentsRequest(kitsuId, episode, mediaType)
      .then((data) => {
        if (!cancelled) setComments(data);
      })
      .catch(() => {
        if (!cancelled) setComments([]);
      });

    return () => {
      cancelled = true;
    };
  }, [kitsuId, episode, mediaType]);

  const goTo = (value) => {
    const next = Math.min(Math.max(Number(value) || 1, 1), max);
    setComments(null);
    setError("");
    setEpisode(next);
  };

  const submit = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      onNavigate?.();
      navigate("/login");
      return;
    }

    if (!content.trim() || busy) return;

    try {
      setBusy(true);
      setError("");
      await createEpisodeCommentRequest(kitsuId, episode, content, mediaType);
      setContent("");
      await load(episode);
    } catch (err) {
      setError(err.message || "No se pudo publicar.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    try {
      await deleteEpisodeCommentRequest(id);
      setComments((list) => list.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message || "No se pudo eliminar.");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg text-paper">Comentarios por {unit}</h3>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={`${unit} anterior`}
            disabled={episode <= 1}
            onClick={() => goTo(episode - 1)}
            className="h-9 w-9 rounded-full bg-panel-2 text-paper hover:bg-white/10 disabled:opacity-40"
          >
            ‹
          </button>

          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <span className="capitalize">{unit}</span>
            <input
              type="number"
              min={1}
              max={max}
              value={episode}
              onChange={(e) => goTo(e.target.value)}
              aria-label={`Número de ${unit}`}
              className="w-16 rounded-xl bg-ground px-2 py-1.5 text-center text-paper"
            />
            {total ? <span className="text-zinc-500">/ {total}</span> : null}
          </label>

          <button
            type="button"
            aria-label={`${unit} siguiente`}
            disabled={episode >= max}
            onClick={() => goTo(episode + 1)}
            className="h-9 w-9 rounded-full bg-panel-2 text-paper hover:bg-white/10 disabled:opacity-40"
          >
            ›
          </button>
        </div>
      </div>

      <form onSubmit={submit} className="mt-3 flex gap-2">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={1000}
          placeholder={`¿Qué te pareció el ${unit} ${episode}?`}
          aria-label="Tu comentario"
          className="flex-1 rounded-xl bg-ground px-4 py-2 text-sm text-paper"
        />
        <button
          type="submit"
          disabled={busy || (isAuthenticated && !content.trim())}
          className="rounded-full bg-accent px-5 py-2 text-sm font-bold text-paper disabled:opacity-60"
        >
          {isAuthenticated ? "Enviar" : "Ingresar"}
        </button>
      </form>

      {error && <p className="mt-2 text-sm text-red-300">{error}</p>}

      <div className="mt-3 space-y-2">
        {comments === null ? (
          <div className="h-14 animate-pulse rounded-2xl bg-panel-2" />
        ) : comments.length === 0 ? (
          <p className="rounded-2xl bg-panel-2 p-4 text-sm text-zinc-400">
            Nadie comentó este {unit} todavía.
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="rounded-2xl bg-panel-2 p-3">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2">
                  <UserAvatar
                    name={comment.userName}
                    src={comment.avatarUrl}
                    size="h-7 w-7"
                    text="text-[13px]"
                  />
                  <Link
                    to={`/profile/${comment.userName}`}
                    onClick={onNavigate}
                    className="font-bold text-paper hover:text-accent-soft"
                  >
                    {comment.userName}
                  </Link>
                  <span className="ml-2 text-[13px] text-zinc-500">
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                </span>

                {user?.userName === comment.userName && (
                  <button
                    type="button"
                    onClick={() => remove(comment.id)}
                    className="text-[13px] text-red-400 hover:text-red-300"
                  >
                    Eliminar
                  </button>
                )}
              </div>
              <p className="mt-1 whitespace-pre-line break-words text-sm text-zinc-300">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EpisodeThread;
