import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReportMenu from "../ReportMenu/ReportMenu";
import {
  getCommentsRequest,
  createCommentRequest,
  deleteCommentRequest,
  reactToCommentRequest,
} from "../../services/commentsService";
import { useAuth } from "../../context/AuthContext";
import { formatRelativeTime } from "../../utils/formatRelativeTime";

const REACTIONS = [
  ["like", "❤️"],
  ["laugh", "😂"],
  ["wow", "😮"],
  ["sad", "😢"],
  ["fire", "🔥"],
];

const glyphFor = (key) => REACTIONS.find(([id]) => id === key)?.[1] ?? "👍";

const Comment = ({
  comment,
  isReply,
  user,
  deletingId,
  setDeletingId,
  onReply,
  onReact,
  onDelete,
  onBlocked,
  replyingId,
  composer,
}) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef(null);
  const isMine = user?.userName === comment.userName;

  useEffect(() => {
    if (!pickerOpen) return undefined;

    const close = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setPickerOpen(false);
      }
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [pickerOpen]);

  return (
    <div className="flex gap-3">
      <div
        className={`flex shrink-0 items-center justify-center rounded-full bg-accent font-bold text-paper ${
          isReply ? "h-7 w-7 text-[13px]" : "h-9 w-9 text-sm"
        }`}
      >
        {comment.userName.charAt(0).toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <Link
              to={`/profile/${comment.userName}`}
              className="text-sm font-semibold text-paper transition hover:text-accent-soft"
            >
              {comment.userName}
            </Link>

            {comment.createdAt && (
              <span className="ml-2 text-[13px] text-zinc-500">
                {formatRelativeTime(comment.createdAt)}
              </span>
            )}
          </div>

          {!isMine && (
            <ReportMenu
              targetType="comment"
              targetId={comment.id}
              userId={comment.userId}
              userName={comment.userName}
              onBlocked={() => onBlocked(comment.userId)}
            />
          )}

          {isMine &&
            (deletingId === comment.id ? (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => onDelete(comment.id)}
                  className="text-[13px] text-red-400 hover:text-red-300"
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingId(null)}
                  className="text-[13px] text-zinc-400 hover:text-paper"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setDeletingId(comment.id)}
                className="text-[13px] text-red-400 hover:text-red-300"
              >
                Eliminar
              </button>
            ))}
        </div>

        <p className="mt-1 whitespace-pre-line break-words text-sm text-zinc-300">
          {comment.content}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {comment.reactions.map((reaction) => (
            <button
              key={reaction.key}
              type="button"
              onClick={() => onReact(comment, reaction.key)}
              aria-pressed={comment.myReaction === reaction.key}
              className={`springy rounded-full px-2.5 py-1 text-[13px] hover:scale-110 ${
                comment.myReaction === reaction.key
                  ? "bg-accent text-paper"
                  : "bg-panel-2 text-zinc-300 hover:bg-white/10"
              }`}
            >
              {glyphFor(reaction.key)} {reaction.count}
            </button>
          ))}

          <div ref={pickerRef} className="relative">
            <button
              type="button"
              aria-label="Reaccionar"
              onClick={() => setPickerOpen((value) => !value)}
              className="rounded-full bg-panel-2 px-2.5 py-1 text-[13px] text-zinc-400 hover:bg-white/10 hover:text-paper"
            >
              ☺ +
            </button>

            {pickerOpen && (
              <div className="pop-in absolute bottom-9 left-0 z-20 flex gap-1 rounded-full bg-panel-2 p-1.5">
                {REACTIONS.map(([key, glyph]) => (
                  <button
                    key={key}
                    type="button"
                    aria-label={key}
                    onClick={() => {
                      setPickerOpen(false);
                      onReact(comment, key);
                    }}
                    className="springy flex h-9 w-9 items-center justify-center rounded-full text-lg hover:scale-125 hover:bg-white/10"
                  >
                    {glyph}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => onReply(comment)}
            className="rounded-full px-2.5 py-1 text-[13px] text-zinc-400 hover:text-paper"
          >
            Responder
          </button>
        </div>

        {replyingId === comment.id && <div className="mt-3">{composer}</div>}
      </div>
    </div>
  );
};

const ReviewComments = ({ userTitleId }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadComments = useCallback(async () => {
    try {
      const res = await getCommentsRequest(userTitleId);
      setComments(res.data);
    } catch (err) {
      console.error("Error cargando comentarios:", err);
    } finally {
      setLoading(false);
    }
  }, [userTitleId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleCreate = async () => {
    if (!content.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await createCommentRequest(userTitleId, content, replyTo?.parentId);
      setContent("");
      setReplyTo(null);
      await loadComments();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCommentRequest(userTitleId, id);
      setDeletingId(null);
      await loadComments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReact = async (comment, key) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const previous = comment.myReaction;
    const next = previous === key ? null : key;

    // Respuesta inmediata: se actualiza el contador antes de que conteste el servidor.
    setComments((list) =>
      list.map((item) => {
        if (item.id !== comment.id) return item;

        const counts = new Map(item.reactions.map((r) => [r.key, r.count]));
        if (previous) counts.set(previous, (counts.get(previous) ?? 1) - 1);
        if (next) counts.set(next, (counts.get(next) ?? 0) + 1);

        return {
          ...item,
          myReaction: next,
          reactions: [...counts.entries()]
            .filter(([, count]) => count > 0)
            .map(([reactionKey, count]) => ({ key: reactionKey, count })),
        };
      }),
    );

    try {
      await reactToCommentRequest(userTitleId, comment.id, key);
    } catch (err) {
      console.error(err);
      loadComments();
    }
  };

  const handleReply = (comment) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Responder a una respuesta cuelga del comentario original.
    setReplyTo({
      commentId: comment.id,
      parentId: comment.parentCommentId ?? comment.id,
      userName: comment.userName,
    });
  };

  const roots = comments
    .filter((c) => !c.parentCommentId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const repliesOf = (id) =>
    comments
      .filter((c) => c.parentCommentId === id)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const shared = {
    user,
    deletingId,
    setDeletingId,
    composer,
    onReply: handleReply,
    onReact: handleReact,
    onDelete: handleDelete,
    onBlocked: (userId) =>
      setComments((list) => list.filter((item) => item.userId !== userId)),
    replyingId: replyTo?.commentId,
  };

  // La caja de escritura va arriba para comentar y debajo del comentario al responder.
  const composer = (
    <div>
      {replyTo && (
        <p className="mb-2 flex items-center gap-2 text-[13px] text-zinc-400">
          Respondiendo a{" "}
          <span className="font-bold text-paper">{replyTo.userName}</span>
          <button
            type="button"
            onClick={() => setReplyTo(null)}
            aria-label="Cancelar respuesta"
            className="rounded-full px-2 text-zinc-400 hover:bg-white/10 hover:text-paper"
          >
            ✕
          </button>
        </p>
      )}

      <div className="flex gap-2">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreate();
          }}
          autoFocus={Boolean(replyTo)}
          maxLength={1000}
          placeholder={
            replyTo ? "Escribí tu respuesta..." : "Escribí un comentario..."
          }
          className="min-w-0 flex-1 rounded-xl bg-panel-2 px-4 py-2 text-sm text-paper"
          disabled={isSubmitting}
        />
        <button
          type="button"
          onClick={handleCreate}
          disabled={!content.trim() || isSubmitting}
          className="rounded-full bg-accent px-5 py-2 text-sm font-bold text-paper transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          Enviar
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {isAuthenticated && !replyTo && composer}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-2xl bg-ground p-4"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-white/10" />
                <div className="space-y-2">
                  <div className="h-3 w-24 rounded bg-white/10" />
                  <div className="h-3 w-16 rounded bg-white/10" />
                </div>
              </div>
              <div className="h-3 w-full rounded bg-white/10" />
            </div>
          ))}
        </div>
      ) : roots.length === 0 ? (
        <div className="rounded-2xl bg-ground p-4 text-sm text-zinc-400">
          Todavía no hay comentarios.
        </div>
      ) : (
        <div className="space-y-4">
          {roots.map((root) => (
            <div key={root.id} className="rounded-2xl bg-ground p-4">
              <Comment comment={root} {...shared} />

              {repliesOf(root.id).length > 0 && (
                <div className="ml-4 mt-4 space-y-4 border-l-2 border-white/10 pl-4 sm:ml-12">
                  {repliesOf(root.id).map((reply) => (
                    <Comment
                      key={reply.id}
                      comment={reply}
                      isReply
                      {...shared}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewComments;
