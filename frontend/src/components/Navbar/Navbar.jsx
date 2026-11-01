import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getNotificationsRequest,
  getUnreadCountRequest,
  markAllReadRequest,
} from "../../services/notificationService";
import { formatRelativeTime } from "../../utils/formatRelativeTime";

const UNREAD_POLL_MS = 60000;

const mobileLinkClass = ({ isActive }) =>
  `block rounded-md px-4 py-3 text-sm font-medium transition ${
    isActive
      ? "bg-white/10 text-paper"
      : "text-zinc-400 hover:bg-panel-2 hover:text-paper"
  }`;

const navLinkClass = ({ isActive }) =>
  `relative text-sm font-medium transition ${
    isActive ? "text-paper" : "text-zinc-400 hover:text-paper"
  }`;

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

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

    const intervalId = setInterval(() => {
      if (!document.hidden) loadCount();
    }, UNREAD_POLL_MS);

    return () => clearInterval(intervalId);
  }, [isAuthenticated]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

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
            className={`absolute -bottom-[18px] left-0 h-[3px] w-full bg-accent transition ${
              isActive ? "opacity-100" : "opacity-0"
            }`}
          />
        </span>
      )}
    </NavLink>
  );

  return (
    <header className="sticky top-0 z-50 bg-ground">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* LOGO */}
        <Link to="/" className="group flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-md bg-accent kanji text-xl leading-none text-paper transition group-hover:bg-accent-hover"
          >
            夢
          </span>
          <span className="font-display text-xl tracking-tight text-paper">
            YumeTrack
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
                className="relative flex h-11 w-11 items-center justify-center rounded-lg bg-panel-2 text-paper transition hover:bg-white/10"
                aria-label="Abrir notificaciones"
                aria-expanded={open}
              >
                <span className="text-base">🔔</span>

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-accent px-1.5 text-[13px] font-bold text-paper">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {/* DROPDOWN */}
              {open && (
                <div className="absolute right-0 top-14 w-[min(340px,calc(100vw-2rem))] overflow-hidden rounded-lg bg-panel">
                  <div className="flex items-center justify-between   px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-paper">
                        Notificaciones
                      </p>
                      <p className="text-[13px] text-zinc-400">
                        Actividad reciente de tu cuenta
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="rounded-md bg-panel-2 px-2.5 py-1 text-[13px] text-zinc-300 transition hover:bg-white/10 hover:text-paper"
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
                            className="animate-pulse rounded-lg bg-ground p-3"
                          >
                            <div className="mb-2 h-4 w-32 rounded bg-white/10" />
                            <div className="h-3 w-24 rounded bg-white/10" />
                          </div>
                        ))}
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="rounded-lg bg-ground p-4 text-sm text-zinc-400">
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
                                : n.type === "review_comment" && n.userTitleId
                                  ? `/reviews/${n.userTitleId}`
                                  : "#"
                            }
                            onClick={() => setOpen(false)}
                            className="block rounded-lg bg-ground p-3 transition hover:bg-ground"
                          >
                            {n.type === "follow" && (
                              <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent font-bold text-paper">
                                  {n.actorUserName?.charAt(0)?.toUpperCase() ||
                                    "U"}
                                </div>

                                <div className="min-w-0">
                                  <p className="text-sm text-paper">
                                    <span className="font-semibold">
                                      {n.actorUserName}
                                    </span>
                                    {""}
                                    te siguió
                                  </p>

                                  {n.createdAt && (
                                    <p className="mt-1 text-[13px] text-zinc-400">
                                      {formatRelativeTime(n.createdAt)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                            {n.type === "review_comment" && (
                              <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent font-bold text-paper">
                                  {n.actorUserName?.charAt(0)?.toUpperCase() ||
                                    "U"}
                                </div>

                                <div className="min-w-0">
                                  <p className="text-sm text-paper">
                                    <span className="font-semibold">
                                      {n.actorUserName}
                                    </span>
                                    {""}
                                    comentó tu reseña
                                  </p>

                                  {n.createdAt && (
                                    <p className="mt-1 text-[13px] text-zinc-400">
                                      {formatRelativeTime(n.createdAt)}
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
                className="hidden rounded-lg bg-panel-2 px-4 py-2.5 text-sm font-medium text-paper transition hover:bg-white/10 sm:inline-flex"
              >
                {user?.userName || "Perfil"}
              </NavLink>

              {/* LOGOUT */}
              <button
                type="button"
                onClick={handleLogout}
                className="hidden rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-paper transition hover:bg-accent-hover md:inline-flex"
              >
                Cerrar sesión
              </button>

              {/* MENU MÓVIL */}
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex h-11 w-11 items-center justify-center rounded-lg bg-panel-2 text-paper transition hover:bg-white/10 md:hidden"
                aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={menuOpen}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  {menuOpen ? (
                    <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                  ) : (
                    <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
                  )}
                </svg>
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
                className="hidden rounded-lg bg-panel-2 px-4 py-2.5 text-sm font-medium text-paper transition hover:bg-white/10 sm:inline-flex"
              >
                Ingresar
              </NavLink>

              <NavLink
                to="/register"
                className="whitespace-nowrap rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-paper transition hover:bg-accent-hover"
              >
                Crear cuenta
              </NavLink>

              {/* MENU MÓVIL */}
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex h-11 w-11 items-center justify-center rounded-lg bg-panel-2 text-paper transition hover:bg-white/10 md:hidden"
                aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={menuOpen}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  {menuOpen ? (
                    <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                  ) : (
                    <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
                  )}
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
      {menuOpen && (
        <nav className="bg-ground px-4 py-3 md:hidden">
          <NavLink to="/" className={mobileLinkClass} end>
            Inicio
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/search" className={mobileLinkClass}>
              Buscar
            </NavLink>
          )}
          <NavLink to="/feed" className={mobileLinkClass}>
            Feed
          </NavLink>
          <NavLink to="/catalog" className={mobileLinkClass}>
            Catálogo
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/my-list" className={mobileLinkClass}>
                Mi lista
              </NavLink>
              <NavLink to="/profile" className={mobileLinkClass}>
                {user?.userName || "Perfil"}
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 w-full rounded-md bg-accent px-4 py-3 text-sm font-semibold text-paper"
              >
                Cerrar sesión
              </button>
            </>
          )}
          {!isAuthenticated && (
            <NavLink to="/login" className={mobileLinkClass}>
              Ingresar
            </NavLink>
          )}
        </nav>
      )}
    </header>
  );
};

export default Navbar;
