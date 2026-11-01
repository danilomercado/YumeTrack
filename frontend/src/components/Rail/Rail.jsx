import { useRef } from "react";

// Fila horizontal con scroll-snap: se arrastra con el dedo y en escritorio
// tiene flechas. Los hijos deben traer su propio ancho (w-40 shrink-0 ...).
const Rail = ({ children }) => {
  const trackRef = useRef(null);

  const scrollBy = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({
      left: direction * track.clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  const arrowClass =
    "springy absolute top-[38%] hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-paper text-2xl font-bold text-ground hover:scale-110 md:flex";

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="rail scroll-pl-4 sm:scroll-pl-6 lg:scroll-pl-8 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
      >
        {children}
      </div>

      <button
        type="button"
        aria-label="Anterior"
        onClick={() => scrollBy(-1)}
        className={`${arrowClass} -left-4`}
      >
        ‹
      </button>
      <button
        type="button"
        aria-label="Siguiente"
        onClick={() => scrollBy(1)}
        className={`${arrowClass} -right-4`}
      >
        ›
      </button>
    </div>
  );
};

export default Rail;
