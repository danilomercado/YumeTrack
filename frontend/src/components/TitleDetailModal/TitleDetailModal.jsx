import { createPortal } from "react-dom";
import { useState } from "react";

const TitleDetailModal = ({ isOpen, onClose, title, isLoading, onAdd }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  if (!isOpen) return null;

  const handleAddClick = async () => {
    if (!onAdd || !title?.id) return;

    try {
      setIsSubmitting(true);
      setSubmitError("");
      await onAdd(title);
      onClose();
    } catch (error) {
      setSubmitError(error.message || "No se pudo agregar a tu lista.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/20"
        >
          ✕
        </button>

        {isLoading ? (
          <div className="p-8 text-zinc-400">Cargando detalle...</div>
        ) : !title ? (
          <div className="p-8 text-zinc-400">No se pudo cargar el detalle.</div>
        ) : (
          <div className="grid gap-6 p-6 md:grid-cols-[220px_1fr]">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
              {title.posterImage ? (
                <img
                  src={title.posterImage}
                  alt={title.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[2/3] items-center justify-center text-zinc-500">
                  Sin imagen
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                  {title.mediaType}
                </span>

                {title.episodeCount ? (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                    Episodios: {title.episodeCount}
                  </span>
                ) : null}

                {title.chapterCount ? (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                    Capítulos: {title.chapterCount}
                  </span>
                ) : null}
              </div>

              <h2 className="text-2xl font-bold text-white">{title.title}</h2>

              <div className="mt-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
                  Sinopsis
                </p>
                <p className="max-h-[280px] overflow-y-auto whitespace-pre-line pr-2 text-sm leading-7 text-zinc-300">
                  {title.synopsis || "Sin sinopsis disponible."}
                </p>
              </div>

              {submitError && (
                <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                  {submitError}
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleAddClick}
                  disabled={isSubmitting || !onAdd}
                  className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Agregando..." : "Agregar a lista"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default TitleDetailModal;
