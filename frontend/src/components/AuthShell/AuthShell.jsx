import { Link } from "react-router-dom";
import { Sun, Torii } from "../Art/Art";

const PETALS = [
  { left: "12%", size: 12, dur: "9s", delay: "0.6s", sway: "40px" },
  { left: "34%", size: 9, dur: "11s", delay: "3s", sway: "-30px" },
  { left: "58%", size: 13, dur: "10s", delay: "1.4s", sway: "45px" },
  { left: "80%", size: 10, dur: "12s", delay: "5s", sway: "-40px" },
];

// Marco compartido de Login y Registro: formulario a la izquierda y un panel
// rojo vivo con personajes a la derecha (solo en pantallas grandes).
const AuthShell = ({
  title,
  subtitle,
  tagline,
  altText,
  altLabel,
  altTo,
  characters,
  children,
}) => (
  <main className="relative flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-10 text-paper">
    <div className="rise-in relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-panel lg:grid-cols-[1fr_1.05fr]">
      <div
        aria-hidden="true"
        className="relative h-24 overflow-hidden bg-accent lg:hidden"
      >
        <div className="speed-lines spin-slow absolute -inset-[60%]" />
        <div className="seigaiha absolute inset-0" />
        <span className="kanji float absolute inset-0 flex select-none items-center justify-center text-7xl leading-none text-paper">
          夢
        </span>
      </div>

      <div className="relative z-10 p-6 sm:p-10 lg:p-12">
        <h1 className="text-3xl leading-[1.1] text-paper sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm text-zinc-300 sm:text-base">{subtitle}</p>

        {children}

        <p className="mt-6 text-sm text-zinc-400">
          {altText}{" "}
          <Link
            to={altTo}
            className="font-bold text-accent-soft transition hover:text-paper"
          >
            {altLabel}
          </Link>
        </p>
      </div>

      <div
        aria-hidden="true"
        className="panel-wipe relative hidden min-h-[560px] overflow-hidden bg-accent lg:-ml-16 lg:block"
      >
        <div className="speed-lines spin-slow absolute -inset-[60%]" />
        <div className="seigaiha absolute inset-0" />

        <span className="ink-in kanji absolute -right-4 -top-8 select-none text-[20rem] leading-none text-ground/20">
          夢
        </span>

        <p className="rise-in kanji absolute right-8 top-10 select-none text-2xl text-paper [animation-delay:500ms]">
          {tagline}
        </p>

        <Sun
          tone="white"
          className="sun-rise absolute left-1/2 top-[10%] h-[50%] -translate-x-1/2"
        />
        <Torii className="torii-in absolute bottom-0 left-1/2 h-[58%] -translate-x-1/2 text-ground" />

        {PETALS.map((petal) => (
          <span
            key={petal.left}
            className="petal"
            style={{
              left: petal.left,
              width: petal.size,
              height: petal.size * 0.8,
              "--dur": petal.dur,
              "--delay": petal.delay,
              "--sway": petal.sway,
            }}
          />
        ))}

        <div className="absolute bottom-0 left-16 h-[78%]">
          <div className="float h-full">
            <img
              src={characters[0]}
              alt=""
              loading="lazy"
              decoding="async"
              className="rise-in h-full object-contain object-bottom [animation-delay:600ms]"
            />
          </div>
        </div>

        <div className="absolute bottom-0 right-6 h-[70%]">
          <div className="float h-full [animation-delay:-2.4s]">
            <img
              src={characters[1]}
              alt=""
              loading="lazy"
              decoding="async"
              className="rise-in h-full object-contain object-bottom [animation-delay:760ms]"
            />
          </div>
        </div>
      </div>
    </div>
  </main>
);

export default AuthShell;
