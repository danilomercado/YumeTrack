import { useCallback, useEffect, useState } from "react";
import ReportMenu from "../ReportMenu/ReportMenu";
import {
  getCommentsRequest,
  createCommentRequest,
  deleteCommentRequest,
} from "../../services/commentsService";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { formatRelativeTime } from "../../utils/formatRelativeTime";

const ReviewComments = ({ userTitleId }) => {
  const { user, isAuthenticated } = useAuth();

  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadComments = useCallback(async () => {
    setLoading(true);
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
      await createCommentRequest(userTitleId, content);
      setContent("");
      loadComments();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(true);
    }
  };

  const handleDelete = async (userTitleId, id) => {
    try {
      await deleteCommentRequest(userTitleId, id);
      setDeletingId(null);
      loadComments();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-5">
      {/* FORM */}
      {isAuthenticated && (
        <div className="flex gap-2">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
            placeholder="Escribí un comentario..."
            className="flex-1 rounded-xl bg-panel-2 px-4 py-2 text-sm text-paper"
            disabled={isSubmitting}
          />
          <button
            onClick={handleCreate}
            disabled={!content.trim() || isSubmitting}
            className="rounded-xl bg-accent px-4 py-2 text-sm text-paper transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            Enviar
          </button>
        </div>
      )}

      {/* LISTA */}
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
      ) : comments.length === 0 ? (
        <div className="rounded-2xl bg-ground p-4 text-sm text-zinc-400">
          Todavía no hay comentarios.
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3 rounded-2xl bg-ground p-4">
              {/* Avatar */}
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-paper">
                {c.userName.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <Link
                      to={`/profile/${c.userName}`}
                      className="text-sm font-semibold text-paper transition hover:text-accent-soft"
                    >
                      {c.userName}
                    </Link>

                    {c.createdAt && (
                      <span className="ml-2 text-[13px] text-zinc-500">
                        {formatRelativeTime(c.createdAt)}
                      </span>
                    )}
                  </div>

                  {user?.userName !== c.userName && (
                    <ReportMenu
                      targetType="comment"
                      targetId={c.id}
                      userId={c.userId}
                      userName={c.userName}
                      onBlocked={() =>
                        setComments((prev) =>
                          prev.filter((item) => item.userId !== c.userId),
                        )
                      }
                    />
                  )}

                  {/* Delete */}
                  {user?.userName === c.userName && (
                    <>
                      {deletingId === c.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(userTitleId, c.id)}
                            className="text-[13px] text-red-400 hover:text-red-300"
                          >
                            Confirmar
                          </button>

                          <button
                            onClick={() => setDeletingId(null)}
                            className="text-[13px] text-zinc-400 hover:text-paper"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingId(c.id)}
                          className="text-[13px] text-red-400 hover:text-red-300"
                        >
                          Eliminar
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Content */}
                <p className="mt-1 text-sm text-zinc-300">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewComments;
