import { useEffect, useState } from "react";
import {
  getTitleCharactersRequest,
  getTrendingTitlesRequest,
} from "../../services/titleService";
import { searchTitlesRequest } from "../../services/searchService";

// Elegir foto de perfil: primero un anime o manga, después su portada o la
// cara de uno de sus personajes. No se suben archivos.
const AvatarPicker = ({
  isOpen,
  currentAvatar,
  isSaving,
  onSelect,
  onClose,
}) => {
  const [query, setQuery] = useState("");
  const [titles, setTitles] = useState([]);
  const [loadingTitles, setLoadingTitles] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [loadingCharacters, setLoadingCharacters] = useState(false);
  const [candidate, setCandidate] = useState(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isSaving) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSaving, onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const controller = new AbortController();
    const trimmed = query.trim();
    setLoadingTitles(true);

    const timeoutId = setTimeout(
      async () => {
        try {
          const data =
            trimmed.length >= 2
              ? await searchTitlesRequest(trimmed, {
                  signal: controller.signal,
                })
              : await getTrendingTitlesRequest(18);
          setTitles(Array.isArray(data) ? data : []);
        } catch {
          if (!controller.signal.aborted) setTitles([]);
        } finally {
          if (!controller.signal.aborted) setLoadingTitles(false);
        }
      },
      trimmed.length >= 2 ? 300 : 0,
    );

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [isOpen, query]);

  useEffect(() => {
    if (!selectedTitle) return undefined;

    let cancelled = false;
    setCharacters([]);
    setLoadingCharacters(true);

    getTitleCharactersRequest(selectedTitle.id, selectedTitle.mediaType)
      .then((data) => {
        if (!cancelled) setCharacters(Array.isArray(data) ? data : []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingCharacters(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedTitle]);

  if (!isOpen) return null;

  const posterOf = (title) => title.posterImage || title.posterImageUrl || null;

  const chooseTitle = (title) => {
    setSelectedTitle(title);
    setCandidate(null);
  };

  const backToTitles = () => {
    setSelectedTitle(null);
    setCandidate(null);
  };

  const option = (url, label) => {
    const isSelected = candidate === url;
    return (
      <li key={`${label}-${url}`}>
        <button
          type="button"
          onClick={() => setCandidate(url)}
          aria-pressed={isSelected}
          aria-label={label}
          className={`block w-full rounded-full p-0.5 transition-colors duration-200 ${
            isSelected ? "bg-accent" : "bg-transparent hover:bg-white/20"
          }`}
        >
          <img
            src={url}
            alt=""
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="aspect-square w-full rounded-full object-cover object-top"
          />
        </button>
        <p className="mt-1 line-clamp-1 text-center text-[12px] text-zinc-400">
          {label}
        </p>
      </li>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Elegir foto de perfil"
        className="flex max-h-[88dvh] w-full max-w-2xl flex-col rounded-t-3xl bg-panel sm:rounded-3xl"
      >
        <div className="flex items-center justify-between gap-3 px-5 pt-5 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            {selectedTitle && (
              <button
                type="button"
                onClick={backToTitles}
                aria-label="Volver a los títulos"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-panel-2 text-paper hover:bg-white/10"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M15 5l-7 7 7 7" />
                </svg>
              </button>
            )}
            <h2 className="truncate text-xl text-paper">
              {selectedTitle ? selectedTitle.title : "Elegí tu foto de perfil"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Cerrar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-panel-2 text-paper hover:bg-white/10 disabled:opacity-50"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4 pt-4 sm:px-6">
          {!selectedTitle ? (
            <>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscá un anime o manga..."
                aria-label="Buscar anime o manga"
                className="w-full rounded-xl bg-panel-2 px-4 py-3 text-sm text-paper"
              />

              <p className="mb-3 mt-4 text-sm text-zinc-400">
                {query.trim().length >= 2
                  ? "Resultados"
                  : "Populares de la temporada. Tocá uno para ver su portada y sus personajes."}
              </p>

              {loadingTitles ? (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div
                      key={index}
                      className="aspect-[2/3] animate-pulse rounded-xl bg-panel-2"
                    />
                  ))}
                </div>
              ) : titles.length === 0 ? (
                <p className="rounded-xl bg-panel-2 px-4 py-3 text-sm text-zinc-400">
                  No encontramos títulos con esa búsqueda.
                </p>
              ) : (
                <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                  {titles.map((title) => (
                    <li key={`${title.mediaType}-${title.id}`}>
                      <button
                        type="button"
                        onClick={() => chooseTitle(title)}
                        className="poster-card block w-full text-left"
                      >
                        <div className="poster aspect-[2/3] bg-panel-2">
                          {posterOf(title) && (
                            <img
                              src={posterOf(title)}
                              alt=""
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <p className="poster-title mt-1.5 line-clamp-2 text-[13px] font-semibold leading-snug text-paper transition-colors duration-200">
                          {title.title}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <>
              <p className="mb-3 text-sm text-zinc-400">
                Elegí la portada o la cara de un personaje.
              </p>

              <ul className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6">
                {posterOf(selectedTitle) &&
                  option(posterOf(selectedTitle), "Portada")}

                {characters
                  .filter((character) => character.imageUrl)
                  .map((character) =>
                    option(character.imageUrl, character.name),
                  )}
              </ul>

              {loadingCharacters && (
                <p className="mt-4 text-sm text-zinc-400">
                  Cargando personajes...
                </p>
              )}

              {!loadingCharacters && characters.length === 0 && (
                <p className="mt-4 text-sm text-zinc-400">
                  Este título no tiene personajes cargados.
                </p>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 px-5 pb-5 pt-2 sm:px-6">
          <button
            type="button"
            onClick={() => onSelect(null)}
            disabled={isSaving || !currentAvatar}
            className="rounded-xl px-3 py-2 text-sm text-zinc-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Quitar foto
          </button>

          <button
            type="button"
            onClick={() => onSelect(candidate)}
            disabled={isSaving || !candidate}
            className="rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-paper hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Guardando..." : "Usar esta foto"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarPicker;
