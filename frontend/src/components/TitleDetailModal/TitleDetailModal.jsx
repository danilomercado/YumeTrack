import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { getTitleReviewsRequest } from "../../services/feedService";
import { getTitleCharactersRequest } from "../../services/titleService";
import { useEffect, useState } from "react";
import { USER_TITLE_STATUS } from "../../services/userTitleService";
import { useToast } from "../../context/ToastContext";

const statusOptions = (isManga) => [
  {
    value: USER_TITLE_STATUS.PLANNED,
    label: isManga ? "Quiero leer" : "Quiero ver",
  },
  {
    value: USER_TITLE_STATUS.WATCHING,
    label: isManga ? "Leyendo" : "Viendo",
  },
  { value: USER_TITLE_STATUS.COMPLETED, label: "Completado" },
];

const TitleDetailModal = ({ isOpen, onClose, title, isLoading, onAdd }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [status, setStatus] = useState(USER_TITLE_STATUS.PLANNED);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState(null);
  const [characters, setCharacters] = useState([]);

  useEffect(() => {
    if (!isOpen) return;

    setStatus(USER_TITLE_STATUS.PLANNED);
    setIsFavorite(false);
    setSubmitError("");
  }, [isOpen, title?.id]);

  useEffect(() => {
    if (!isOpen || !title?.id) return undefined;

    let cancelled = false;
    setReviews(null);

    setCharacters([]);
    getTitleCharactersRequest(title.id, title.mediaType)
      .then((data) => {
        if (!cancelled) setCharacters(Array.isArray(data) ? data : []);
      })
      .catch(() => {});

    getTitleReviewsRequest(title.id, title.mediaType)
      .then((data) => {
        if (!cancelled) setReviews(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setReviews([]);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, title?.id, title?.mediaType]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isManga = title?.mediaType?.toLowerCase() === "manga";

  const handleAddClick = async () => {
    if (!onAdd || !title?.id) return;

    try {
      setIsSubmitting(true);
      setSubmitError("");
      await onAdd(title, { status, isFavorite });
      toast(`${title.title} está en tu lista`);
      onClose();
    } catch (error) {
      setSubmitError(error.message || "No se pudo agregar a tu lista.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const facts = [
    title?.mediaType,
    title?.status,
    title?.episodeCount ? `${title.episodeCount} episodios` : null,
    title?.chapterCount ? `${title.chapterCount} capítulos` : null,
    title?.startDate ? String(title.startDate).slice(0, 4) : null,
  ].filter(Boolean);

  return createPortal(
    <div
      className="fade-in fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-0 sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title?.title || "Detalle del título"}
        className="pop-in relative max-h-[92dvh] w-full max-w-3xl overflow-y-auto overscroll-contain rounded-t-[2rem] bg-panel sm:rounded-[2rem]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-ground/80 text-paper hover:bg-accent"
        >
          ✕
        </button>

        {isLoading ? (
          <div className="flex h-72 items-center justify-center">
            <span className="ink-pulse kanji text-7xl text-accent">夢</span>
          </div>
        ) : !title ? (
          <div className="p-8 text-zinc-400">No se pudo cargar el detalle.</div>
        ) : (
          <>
            <div className="relative h-36 overflow-hidden bg-accent sm:h-44">
              {title.posterImage && (
                <img
                  src={title.posterImage}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full scale-125 object-cover opacity-50 blur-xl"
                />
              )}
              <div className="speed-lines absolute -inset-[60%] opacity-70" />
            </div>

            <div className="relative -mt-24 grid gap-6 px-6 pb-6 sm:px-8 md:grid-cols-[200px_1fr]">
              <div className="stagger-item mx-auto w-40 md:mx-0 md:w-full">
                {title.posterImage ? (
                  <img
                    src={title.posterImage}
                    alt={title.title}
                    className="w-full rounded-2xl object-cover"
                  />
                ) : (
                  <div className="kanji flex aspect-[2/3] items-center justify-center rounded-2xl bg-panel-2 text-6xl text-zinc-600">
                    夢
                  </div>
                )}
              </div>

              <div className="flex flex-col pt-2 md:pt-24">
                <div className="mb-3 flex flex-wrap gap-2">
                  {facts.map((fact, position) => (
                    <span
                      key={fact}
                      className={`rounded-full px-3 py-1 text-[13px] font-bold ${
                        position === 0
                          ? "bg-accent text-paper"
                          : "bg-panel-2 text-zinc-300"
                      }`}
                    >
                      {fact}
                    </span>
                  ))}
                </div>

                <h2 className="text-2xl leading-[1.15] text-paper sm:text-3xl">
                  {title.title}
                </h2>

                <p className="mt-4 max-h-56 overflow-y-auto whitespace-pre-line pr-2 text-sm leading-7 text-zinc-300">
                  {title.synopsis || "Sin sinopsis disponible."}
                </p>
              </div>
            </div>

            {characters.length > 0 && (
              <div className="px-6 pb-6 sm:px-8">
                <h3 className="mb-3 text-lg text-paper">Personajes</h3>

                <ul className="rail -mx-6 flex snap-x gap-4 overflow-x-auto px-6 pb-2 sm:-mx-8 sm:px-8">
                  {characters.map((character, position) => (
                    <li
                      key={character.id}
                      style={{ "--i": Math.min(position, 9) }}
                      className="stagger-item w-20 shrink-0 snap-start text-center"
                    >
                      <img
                        src={character.imageUrl}
                        alt={character.name}
                        loading="lazy"
                        decoding="async"
                        className={`h-20 w-20 rounded-full object-cover object-top ${
                          character.role === "main"
                            ? "ring-2 ring-accent"
                            : "ring-1 ring-white/15"
                        }`}
                      />
                      <p className="mt-2 line-clamp-2 text-[13px] leading-tight text-zinc-300">
                        {character.name}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="px-6 pb-6 sm:px-8">
              <h3 className="mb-3 text-lg text-paper">Qué dice la comunidad</h3>

              {reviews === null ? (
                <div className="h-16 animate-pulse rounded-2xl bg-panel-2" />
              ) : reviews.length === 0 ? (
                <p className="rounded-2xl bg-panel-2 p-4 text-sm text-zinc-400">
                  Todavía nadie reseñó este título. Podés ser el primero.
                </p>
              ) : (
                <ul className="space-y-2">
                  {reviews.map((review) => (
                    <li key={review.userTitleId}>
                      <Link
                        to={`/reviews/${review.userTitleId}`}
                        onClick={onClose}
                        className="springy flex gap-3 rounded-2xl bg-panel-2 p-3 hover:-translate-y-0.5 hover:bg-white/10"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-paper">
                          {review.userName.charAt(0).toUpperCase()}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2 text-sm">
                            <span className="font-bold text-paper">
                              {review.userName}
                            </span>
                            {review.score !== null &&
                              review.score !== undefined && (
                                <span className="rounded-full bg-paper px-2 py-0.5 text-[13px] font-bold text-ground">
                                  ★ {review.score}/10
                                </span>
                              )}
                            <span className="ml-auto text-[13px] text-zinc-400">
                              ♥ {review.likesCount}
                            </span>
                          </span>
                          <span className="mt-1 line-clamp-2 block text-sm text-zinc-300">
                            {review.review}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-ground px-6 py-5 sm:px-8">
              <p className="mb-3 text-sm font-bold text-paper">
                Agregar a tu lista como
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {statusOptions(isManga).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setStatus(option.value)}
                    aria-pressed={status === option.value}
                    className={`springy rounded-full px-4 py-2 text-sm font-bold hover:scale-105 ${
                      status === option.value
                        ? "bg-accent text-paper"
                        : "bg-panel-2 text-zinc-300 hover:bg-white/10"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setIsFavorite((value) => !value)}
                  aria-pressed={isFavorite}
                  className={`springy ml-auto flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold hover:scale-105 ${
                    isFavorite
                      ? "bg-paper text-ground"
                      : "bg-panel-2 text-zinc-300 hover:bg-white/10"
                  }`}
                >
                  <span aria-hidden="true">{isFavorite ? "♥" : "♡"}</span>
                  Favorito
                </button>
              </div>

              {submitError && (
                <div className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-300">
                  {submitError}
                </div>
              )}

              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full bg-panel-2 px-6 py-3 text-sm font-bold text-paper hover:bg-white/10"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleAddClick}
                  disabled={isSubmitting || !onAdd}
                  className="springy shine rounded-full bg-accent px-7 py-3 text-sm font-bold text-paper hover:scale-105 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Agregando..." : "Agregar a mi lista"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default TitleDetailModal;
