import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link
          to="/"
          className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-2xl font-extrabold text-transparent"
        >
          YumeTrack
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/"
            className="rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-violet-300"
          >
            Inicio
          </Link>

          {!isAuthenticated && (
            <>
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-violet-300"
              >
                Ingresar
              </Link>

              <Link
                to="/register"
                className="rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-violet-300"
              >
                Registrarse
              </Link>
            </>
          )}

          {isAuthenticated && (
            <>
              <Link
                to="/search"
                className="rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-violet-300"
              >
                Buscar
              </Link>

              <Link
                to="/my-list"
                className="rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-violet-300"
              >
                Mi lista
              </Link>

              <Link
                to="/profile"
                className="rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-violet-300"
              >
                Perfil
              </Link>

              {user?.userName && (
                <span className="hidden rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 md:inline-block">
                  {user.userName}
                </span>
              )}

              <button
                onClick={handleLogout}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.02]"
              >
                Cerrar sesión
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
