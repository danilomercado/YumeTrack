import { useState } from "react";

const SLIDES = 6;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Destacado rotativo: el avance lo marca la barra de progreso (al terminar su
// animación pasa al siguiente), así pausar la barra pausa también el avance.
const Spotlight = ({ titles, onOpen }) => {
  const items = titles.slice(0, SLIDES);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion] = useState(prefersReducedMotion);

  if (!items.length) return null;

  const current = items[index];
  const isManga = current.mediaType?.toLowerCase() === "manga";

  const next = () => setIndex((value) => (value + 1) % items.length);

  return (
    <section
      aria-label="Destacados"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="relative mb-12 overflow-hidden rounded-[2rem] bg-panel"
    >
      {current.posterImage && (
        <img
          key={`bg-${current.id}`}
          src={current.posterImage}
          alt=""
          aria-hidden="true"
          className="fade-in absolute inset-0 h-full w-full scale-125 object-cover opacity-25 blur-2xl"
        />
      )}

      <div
        key={current.id}
        className="relative grid items-center gap-6 p-6 sm:p-10 md:grid-cols-[210px_1fr]"
      >
        {current.posterImage ? (
          <img
            src={current.posterImage}
            alt={current.title}
            className="stagger-item mx-auto w-40 rounded-2xl object-cover md:w-full"
          />
        ) : (
          <div className="kanji mx-auto flex aspect-[2/3] w-40 items-center justify-center rounded-2xl bg-panel-2 text-6xl text-zinc-600 md:w-full">
            夢
          </div>
        )}

        <div className="stagger-item [animation-delay:120ms]">
          <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-[13px] font-bold text-paper">
            #{index + 1} de la temporada
          </span>

          <h2 className="mt-3 line-clamp-2 text-3xl leading-[1.1] text-paper sm:text-5xl">
            {current.title}
          </h2>

          <p className="mt-3 line-clamp-3 max-w-2xl text-sm leading-relaxed text-zinc-300 sm:text-base">
            {current.synopsis || "Sin sinopsis disponible."}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onOpen(current)}
              className="springy shine rounded-full bg-accent px-7 py-3.5 text-sm font-bold text-paper hover:-rotate-2 hover:scale-105 hover:bg-accent-hover"
            >
              {isManga ? "Ver ficha del manga" : "Ver ficha del anime"}
            </button>

            <span className="text-[13px] text-zinc-400">
              {[
                current.status,
                current.episodeCount && `${current.episodeCount} eps`,
                current.chapterCount && `${current.chapterCount} caps`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </div>
        </div>
      </div>

      <div className="relative flex gap-2 px-6 pb-6 sm:px-10">
        {items.map((item, position) => (
          <button
            key={item.id}
            type="button"
            aria-label={`Ver ${item.title}`}
            title={item.title}
            onClick={() => setIndex(position)}
            className="h-6 flex-1"
          >
            <span className="block h-1.5 overflow-hidden rounded-full bg-white/15">
              {position < index || (position === index && reduceMotion) ? (
                <span className="block h-full w-full bg-accent" />
              ) : position === index ? (
                <span
                  key={`bar-${index}`}
                  onAnimationEnd={next}
                  style={{ animationPlayState: paused ? "paused" : "running" }}
                  className="spot-progress block h-full w-full bg-accent"
                />
              ) : null}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default Spotlight;
