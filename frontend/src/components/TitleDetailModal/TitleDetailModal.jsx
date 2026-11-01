import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

const TitleDetailModal = ({ isOpen, onClose, title, isLoading, onAdd }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title?.title || "Detalle del título"}
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-ground"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 z-10 rounded-full bg-white/10 px-3 py-2 text-sm text-paper transition hover:bg-white/20"
        >
          ✕
        </button>
        {isLoading ? (
          <div className="p-8 text-zinc-400">Cargando detalle...</div>
        ) : !title ? (
          <div className="p-8 text-zinc-400">No se pudo cargar el detalle.</div>
        ) : (
          <div className="grid gap-6 p-6 md:grid-cols-[220px_1fr]">
            <div className="overflow-hidden rounded-lg bg-panel">
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
                <span className="rounded-full bg-panel-2 px-3 py-1 text-[13px] text-zinc-300">
                  {title.mediaType}
                </span>

                {title.episodeCount ? (
                  <span className="rounded-full bg-panel-2 px-3 py-1 text-[13px] text-zinc-300">
                    Episodios: {title.episodeCount}
                  </span>
                ) : null}

                {title.chapterCount ? (
                  <span className="rounded-full bg-panel-2 px-3 py-1 text-[13px] text-zinc-300">
                    Capítulos: {title.chapterCount}
                  </span>
                ) : null}
              </div>

              <h2 className="text-2xl text-paper">{title.title}</h2>

              <div className="mt-6">
                <p className="mb-3 text-[13px] font-semibold text-accent-soft">
                  Sinopsis
                </p>
                <p className="max-h-[280px] overflow-y-auto whitespace-pre-line pr-2 text-sm leading-7 text-zinc-300">
                  {title.synopsis || "Sin sinopsis disponible."}
                </p>
              </div>

              {submitError && (
                <div className="mt-4 rounded-md bg-red-500/10 p-3 text-sm text-red-300">
                  {submitError}
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md bg-panel-2 px-5 py-3 text-sm font-medium text-paper transition hover:bg-white/10"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleAddClick}
                  disabled={isSubmitting || !onAdd}
                  className="rounded-md bg-accent px-5 py-3 text-sm font-medium text-paper transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
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
