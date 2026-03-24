import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getNotificationsRequest,
  getUnreadCountRequest,
  markAllReadRequest,
} from "../../services/notificationService";

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition ${
    isActive ? "text-white" : "text-zinc-400 hover:text-white"
  }`;

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadCount = async () => {
      try {
        const count = await getUnreadCountRequest();
        setUnreadCount(count);
      } catch (e) {
        console.error(e);
      }
    };

    loadCount();
  }, [isAuthenticated]);

  const toggleNotifications = async () => {
    if (open) {
      setOpen(false);
      return;
    }

    try {
      setOpen(true);
      setLoading(true);

      const data = await getNotificationsRequest();
      setNotifications(data || []);

      await markAllReadRequest();
      setUnreadCount(0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* LOGO */}
        <Link to="/" className="text-2xl font-black tracking-tight text-white">
          <span className="bg-gradient-to-r from-violet-400 to-pink-500 bg-clip-text text-transparent">
            YumeTrack
          </span>
        </Link>

        {isAuthenticated ? (
          <>
            {/* NAV */}
            <nav className="hidden items-center gap-8 md:flex">
              <NavLink to="/" className={navLinkClass}>
                Inicio
              </NavLink>
              <NavLink to="/search" className={navLinkClass}>
                Buscar
              </NavLink>
              <NavLink to="/feed" className={navLinkClass}>
                Feed
              </NavLink>

              <NavLink to="/catalog" className={navLinkClass}>
                Catálogo
              </NavLink>
              <NavLink to="/my-list" className={navLinkClass}>
                Mi lista
              </NavLink>
            </nav>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-3 relative">
              {/* 🔔 CAMPANA */}
              <button
                onClick={toggleNotifications}
                className="relative rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white hover:bg-white/10"
              >
                🔔
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-xs px-2 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* DROPDOWN */}
              {open && (
                <div className="absolute right-0 top-12 w-80 rounded-2xl border border-white/10 bg-zinc-900 p-4 shadow-xl">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-semibold text-white">Notificaciones</p>

                    <button
                      onClick={() => setOpen(false)}
                      className="text-zinc-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  {loading ? (
                    <p className="text-zinc-400 text-sm">Cargando...</p>
                  ) : notifications.length === 0 ? (
                    <p className="text-zinc-400 text-sm">
                      No tenés notificaciones.
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {notifications.map((n) => (
                        <Link
                          key={n.id}
                          to={
                            n.type === "follow"
                              ? `/profile/${n.actorUserName}`
                              : "#"
                          }
                          onClick={() => setOpen(false)}
                          className="block rounded-xl border border-white/10 bg-black/20 p-3 transition hover:border-violet-500/40 hover:bg-black/30"
                        >
                          {n.type === "follow" && (
                            <p className="text-sm text-white">
                              <span className="font-semibold">
                                {n.actorUserName}
                              </span>{" "}
                              te siguió
                            </p>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PERFIL */}
              <NavLink
                to="/profile"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              >
                {user?.userName || "Perfil"}
              </NavLink>

              {/* LOGOUT */}
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
