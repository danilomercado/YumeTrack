import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getNotificationsRequest,
  getUnreadCountRequest,
  markAllReadRequest,
} from "../../services/notificationService";

const navLinkClass = ({ isActive }) =>
  `relative text-sm font-medium transition ${
    isActive ? "text-white" : "text-zinc-400 hover:text-white"
  }`;

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const notificationsRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadCount = async () => {
      try {
        const count = await getUnreadCountRequest();
        setUnreadCount(count);
      } catch (error) {
        console.error(error);
      }
    };

    loadCount();
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const renderNavItem = (to, label) => (
    <NavLink to={to} className={navLinkClass}>
      {({ isActive }) => (
        <span className="relative inline-flex items-center py-1">
          {label}
          <span
            className={`absolute -bottom-[18px] left-0 h-[2px] w-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500 transition ${
              isActive ? "opacity-100" : "opacity-0"
            }`}
          />
        </span>
      )}
    </NavLink>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* LOGO */}
        <Link to="/" className="group flex items-center gap-2">
          <span className="text-2xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-500 bg-clip-text text-transparent transition group-hover:opacity-90">
              YumeTrack
            </span>
          </span>
        </Link>

        {isAuthenticated ? (
          <>
            {/* NAV DESKTOP */}
            <nav className="hidden items-center gap-8 md:flex">
              {renderNavItem("/", "Inicio")}
              {renderNavItem("/search", "Buscar")}
              {renderNavItem("/feed", "Feed")}
              {renderNavItem("/catalog", "Catálogo")}
              {renderNavItem("/my-list", "Mi lista")}
            </nav>

            {/* RIGHT SIDE */}
            <div
              className="relative flex items-center gap-3"
              ref={notificationsRef}
            >
              {/* NOTIFICATIONS */}
              <button
                type="button"
                onClick={toggleNotifications}
                className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:border-violet-500/30 hover:bg-white/10"
                aria-label="Abrir notificaciones"
              >
                <span className="text-base">🔔</span>

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-1.5 text-[10px] font-bold text-white shadow-lg">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {/* DROPDOWN */}
              {open && (
                <div className="absolute right-0 top-14 w-[340px] overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/95 shadow-2xl backdrop-blur-xl">
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Notificaciones
                      </p>
                      <p className="text-xs text-zinc-400">
                        Actividad reciente de tu cuenta
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300 transition hover:bg-white/10 hover:text-white"
                    >
                      Cerrar
                    </button>
                  </div>

                  <div className="max-h-96 overflow-y-auto p-3">
                    {loading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <div
                            key={index}
                            className="animate-pulse rounded-2xl border border-white/10 bg-black/20 p-3"
                          >
                            <div className="mb-2 h-4 w-32 rounded bg-white/10" />
                            <div className="h-3 w-24 rounded bg-white/10" />
                          </div>
                        ))}
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-400">
                        No tenés notificaciones por ahora.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {notifications.map((n) => (
                          <Link
                            key={n.id}
                            to={
                              n.type === "follow"
                                ? `/profile/${n.actorUserName}`
                                : "#"
                            }
                            onClick={() => setOpen(false)}
                            className="block rounded-2xl border border-white/10 bg-black/20 p-3 transition hover:border-violet-500/30 hover:bg-black/30"
                          >
                            {n.type === "follow" && (
                              <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 font-bold text-white">
                                  {n.actorUserName?.charAt(0)?.toUpperCase() ||
                                    "U"}
                                </div>

                                <div className="min-w-0">
                                  <p className="text-sm text-white">
                                    <span className="font-semibold">
                                      {n.actorUserName}
                                    </span>{" "}
                                    te siguió
                                  </p>

                                  {n.createdAt && (
                                    <p className="mt-1 text-xs text-zinc-400">
                                      {new Date(
                                        n.createdAt,
                                      ).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PROFILE */}
              <NavLink
                to="/profile"
                className="hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10 sm:inline-flex"
              >
                {user?.userName || "Perfil"}
              </NavLink>

              {/* LOGOUT */}
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:scale-[1.02] hover:opacity-95"
              >
                Cerrar sesión
              </button>
            </div>
          </>
        ) : (
          <>
            <nav className="hidden items-center gap-8 md:flex">
              {renderNavItem("/", "Inicio")}
              {renderNavItem("/feed", "Feed")}
              {renderNavItem("/catalog", "Catálogo")}
            </nav>

            <div className="flex items-center gap-3">
              <NavLink
                to="/login"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Ingresar
              </NavLink>

              <NavLink
                to="/register"
                className="rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:scale-[1.02] hover:opacity-95"
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
