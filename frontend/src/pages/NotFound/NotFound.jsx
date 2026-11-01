import { Link } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const NotFound = () => {
  useDocumentTitle("Página no encontrada");

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <h1 className="mt-2 text-4xl text-paper">Esta página no existe</h1>
      <p className="mt-3 text-sm text-zinc-400">
        El enlace puede estar roto o la página fue movida.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-md bg-accent px-5 py-3 text-sm font-medium text-paper transition hover:bg-accent-hover"
      >
        Volver al inicio
      </Link>
    </main>
  );
};

export default NotFound;
