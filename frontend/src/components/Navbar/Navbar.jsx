import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition ${
    isActive ? "text-white" : "text-zinc-400 hover:text-white"
  }`;

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-2xl font-black tracking-tight text-white">
          <span className="bg-gradient-to-r from-violet-400 to-pink-500 bg-clip-text text-transparent">
            YumeTrack
          </span>
        </Link>

        {isAuthenticated ? (
          <>
            <nav className="hidden items-center gap-8 md:flex">
              <NavLink to="/" className={navLinkClass}>
                Inicio
              </NavLink>
              <NavLink to="/search" className={navLinkClass}>
                Buscar
              </NavLink>
              <NavLink to="/catalog" className={navLinkClass}>
                Catálogo
              </NavLink>
              <NavLink to="/my-list" className={navLinkClass}>
                Mi lista
              </NavLink>
            </nav>

            <div className="flex items-center gap-3">
              <NavLink
                to="/profile"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              >
                {user?.userName || "Perfil"}
              </NavLink>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Cerrar sesión
              </button>
            </div>
          </>
        ) : (
          <>
            <nav className="hidden items-center gap-8 md:flex">
              <NavLink to="/" className={navLinkClass}>
                Inicio
              </NavLink>
              <NavLink to="/catalog" className={navLinkClass}>
                Catálogo
              </NavLink>
            </nav>

            <div className="flex items-center gap-3">
              <NavLink
                to="/login"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Ingresar
              </NavLink>

              <NavLink
                to="/register"
                className="rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Crear cuenta
              </NavLink>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
