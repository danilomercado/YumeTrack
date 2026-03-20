import React from "react";

const TitleDetailModal = ({ title, isLoading, onClose, onAdd }) => {
  if (!title && !isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
      <div className="w-full max-w-4xl rounded-3xl border border-white/10 bg-zinc-900 p-6 text-white shadow-2xl">
        {isLoading ? (
          <div className="py-16 text-center text-zinc-300">
            Cargando detalle...
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-[260px_1fr]">
            <div>
              <img
                src={
                  title?.posterImage ||
                  "https://placehold.co/300x420?text=Sin+imagen"
                }
                alt={title?.title || "Sin título"}
                className="h-full w-full rounded-2xl object-cover"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black">
                    {title?.title || "Sin título"}
                  </h2>

                  <div className="mt-3 flex flex-wrap gap-2 text-sm text-zinc-300">
                    {title?.mediaType && (
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                        {title.mediaType}
                      </span>
                    )}

                    {title?.episodeCount != null && (
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                        Episodios: {title.episodeCount}
                      </span>
                    )}

                    {title?.chapterCount != null && (
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                        Capítulos: {title.chapterCount}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/5"
                >
                  Cerrar
                </button>
              </div>

              <div className="mt-6">
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">
                  Sinopsis
                </h3>

                <p className="max-h-[280px] overflow-y-auto pr-2 leading-7 text-zinc-300">
                  {title?.synopsis || "Sin sinopsis disponible."}
                </p>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm text-zinc-300 transition hover:bg-white/5"
                >
                  Cancelar
                </button>

                <button
                  onClick={() => onAdd(title)}
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.02]"
                >
                  Agregar a lista
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TitleDetailModal;
