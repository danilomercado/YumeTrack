import { Link } from "react-router-dom";
import { Sun, Torii } from "../Art/Art";
import { useAuth } from "../../context/AuthContext";

const linkClass =
  "inline-block text-sm text-zinc-400 transition hover:translate-x-1 hover:text-paper";

const Footer = () => {
  const { isAuthenticated } = useAuth();

  return (
    <footer className="relative mt-16 overflow-hidden bg-panel">
      <div
        aria-hidden="true"
        className="relative h-44 overflow-hidden bg-ground sm:h-60"
      >
        <img
          src="/art/great-wave.jpg"
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover opacity-50 grayscale contrast-125 [mask-image:linear-gradient(to_bottom,transparent,black_45%)]"
        />
        <Sun className="sun-rise absolute right-[16%] top-6 h-24 sm:h-36" />
        <Torii className="absolute bottom-0 right-[11%] h-24 text-paper sm:h-36" />
        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-accent" />
      </div>

      <span
        aria-hidden="true"
        className="kanji float pointer-events-none absolute -bottom-10 right-4 select-none text-[16rem] leading-none text-white/[0.04]"
      >
        夢
      </span>

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <Link to="/" className="group inline-flex items-center gap-3">
            <span
              aria-hidden="true"
              className="kanji flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-2xl leading-none text-paper transition duration-200 group-hover:-rotate-6"
            >
              夢
            </span>
            <span className="font-display text-xl text-paper">YumeTrack</span>
          </Link>

          <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-400">
            Llevá la cuenta de tu anime y manga, y compartí reseñas con otros
            fans.
          </p>
        </div>

        <nav aria-label="Explorar" className="flex flex-col gap-2">
          <p className="mb-1 text-sm font-bold text-paper">Explorar</p>
          <Link to="/" className={linkClass}>
            Inicio
          </Link>
          <Link to="/catalog" className={linkClass}>
            Catálogo
          </Link>
          <Link to="/feed" className={linkClass}>
            Feed de reseñas
          </Link>
          {isAuthenticated && (
            <Link to="/search" className={linkClass}>
              Buscar
            </Link>
          )}
        </nav>

        <nav aria-label="Tu cuenta" className="flex flex-col gap-2">
          <p className="mb-1 text-sm font-bold text-paper">Tu cuenta</p>
          {isAuthenticated ? (
            <>
              <Link to="/my-list" className={linkClass}>
                Mi lista
              </Link>
              <Link to="/profile" className={linkClass}>
                Mi perfil
              </Link>
              <Link to="/settings/security" className={linkClass}>
                Seguridad
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className={linkClass}>
                Ingresar
              </Link>
              <Link to="/register" className={linkClass}>
                Crear cuenta
              </Link>
            </>
          )}
        </nav>
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 pb-8 text-[13px] text-zinc-500 sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} YumeTrack</p>
        <p>
          Datos de anime y manga: Kitsu · Estampas de Hokusai y Utamaro (dominio
          público, Wikimedia Commons)
        </p>
      </div>
    </footer>
  );
};

export default Footer;
