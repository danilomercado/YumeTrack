import { Link } from "react-router-dom";
import { Sun, Torii } from "../../components/Art/Art";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const NotFound = () => {
  useDocumentTitle("Página no encontrada");

  return (
    <main className="relative mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <img
        src="/art/red-fuji.jpg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full rounded-[2rem] object-cover opacity-15 grayscale"
      />
      <div aria-hidden="true" className="relative h-44 w-56">
        <Sun className="sun-rise absolute left-1/2 top-0 h-32 -translate-x-1/2" />
        <Torii className="torii-in absolute bottom-0 left-1/2 h-32 -translate-x-1/2 text-paper" />
      </div>
      <h1 className="rise-in mt-2 text-4xl text-paper">
        Esta página no existe
      </h1>
      <p className="rise-in mt-3 text-sm text-zinc-400 [animation-delay:90ms]">
        El enlace puede estar roto o la página fue movida.
      </p>
      <Link
        to="/"
        className="springy shine rise-in mt-6 rounded-full bg-accent px-7 py-3.5 text-sm font-bold text-paper hover:-rotate-2 hover:scale-105 hover:bg-accent-hover [animation-delay:180ms]"
      >
        Volver al inicio
      </Link>
    </main>
  );
};

export default NotFound;
