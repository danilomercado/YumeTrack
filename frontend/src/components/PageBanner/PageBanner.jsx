// Cabecera de página: título a la izquierda y una esquina roja en diagonal
// con un kanji flotante, como la portada de un tomo.
const PageBanner = ({ title, subtitle, kanji, image, children }) => (
  <section className="rise-in relative mb-8 overflow-hidden rounded-[2rem] bg-panel">
    {image && (
      <img
        src={image}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="absolute inset-y-0 left-0 h-full w-3/5 object-cover opacity-25 grayscale [mask-image:linear-gradient(to_right,black,transparent)]"
      />
    )}

    <div className="relative z-10 max-w-2xl px-6 py-8 sm:px-10 sm:py-10">
      <h1 className="text-3xl leading-[1.1] text-paper sm:text-5xl">{title}</h1>

      {subtitle && (
        <p className="mt-3 max-w-xl text-sm text-zinc-300 sm:text-base">
          {subtitle}
        </p>
      )}

      {children}
    </div>

    <div
      aria-hidden="true"
      className="banner-slant absolute inset-y-0 right-0 hidden w-2/5 overflow-hidden bg-accent md:block"
    >
      <div className="speed-lines spin-slow absolute -inset-[60%]" />
      <div className="seigaiha absolute inset-0" />
      <span className="kanji float absolute inset-0 flex select-none items-center justify-center pl-8 text-[9rem] leading-none text-paper">
        {kanji}
      </span>
    </div>
  </section>
);

export default PageBanner;
