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
  `block rounded-xl px-4 py-3 text-sm font-medium transition ${
    isActive
      ? "bg-white/10 text-paper"
      : "text-zinc-400 hover:bg-panel-2 hover:text-paper"
  }`;

const NAV_KANJI = {
  "/": "家",
  "/search": "探",
  "/feed": "声",
  "/catalog": "図",
  "/my-list": "記",
};

const navLinkClass = ({ isActive }) =>
  `springy relative rounded-full px-3.5 py-2 text-sm font-bold hover:-translate-y-0.5 ${
    isActive
      ? "bg-accent text-paper"
      : "text-zinc-300 hover:bg-panel-2 hover:text-paper"
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    <NavLink to={to} end={to === "/"} className={navLinkClass}>
      <span className="flex items-center gap-1.5">
        <span aria-hidden="true" className="kanji text-[15px]">
          {NAV_KANJI[to]}
        </span>
        {label}
      </span>
    </NavLink>
  );

  return (
    <header className="sticky top-0 z-50 px-3 pt-[calc(0.75rem+env(safe-area-inset-top))] sm:px-6">
      <div
        className={`header-bar mx-auto flex max-w-7xl items-center justify-between rounded-full bg-panel px-3 sm:px-5 ${
          scrolled ? "h-14" : "h-16"
        }`}
      >
        {/* LOGO */}
        <Link to="/" className="group flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent kanji text-xl leading-none text-paper stamp-in transition duration-200 group-hover:-rotate-12 group-hover:bg-accent-hover"
          >
            夢
          </span>
          <span
            aria-label="YumeTrack"
            className="wave flex font-display text-xl text-paper max-[420px]:hidden"
          >
            {"YumeTrack".split("").map((letter, position) => (
              <span
                key={position}
                aria-hidden="true"
                style={{ "--i": position }}
              >
                {letter}
              </span>
            ))}
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
                className="relative flex h-11 w-11 items-center justify-center rounded-full bg-panel-2 text-paper transition hover:bg-white/10"
                aria-label="Abrir notificaciones"
                aria-expanded={open}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className={`h-5 w-5 ${unreadCount > 0 ? "bell-ring" : ""}`}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                  />
                </svg>

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-accent px-1.5 text-[13px] font-bold text-paper">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {/* DROPDOWN */}
              {open && (
                <div className="pop-in pop-in-origin-tr absolute right-0 top-14 w-[min(340px,calc(100vw-2rem))] overflow-hidden rounded-2xl bg-panel">
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
                      className="rounded-xl bg-panel-2 px-2.5 py-1 text-[13px] text-zinc-300 transition hover:bg-white/10 hover:text-paper"
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
                            className="animate-pulse rounded-2xl bg-ground p-3"
                          >
                            <div className="mb-2 h-4 w-32 rounded bg-white/10" />
                            <div className="h-3 w-24 rounded bg-white/10" />
                          </div>
                        ))}
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="rounded-2xl bg-ground p-4 text-sm text-zinc-400">
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
                            className="block rounded-2xl bg-ground p-3 transition hover:bg-ground"
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
                className="springy hidden items-center gap-2 rounded-full bg-panel-2 py-1.5 pl-1.5 pr-4 text-sm font-bold text-paper hover:scale-105 hover:bg-white/10 sm:inline-flex"
              >
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-[13px] text-paper"
                >
                  {(user?.userName || "P").charAt(0).toUpperCase()}
                </span>
                {user?.userName || "Perfil"}
              </NavLink>

              {/* LOGOUT */}
              <button
                type="button"
                onClick={handleLogout}
                className="hidden rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-paper transition hover:bg-accent-hover md:inline-flex"
              >
                Cerrar sesión
              </button>

              {/* MENU MÓVIL */}
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-panel-2 text-paper transition hover:bg-white/10 md:hidden"
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
                className="hidden rounded-full bg-panel-2 px-4 py-2.5 text-sm font-medium text-paper transition hover:bg-white/10 sm:inline-flex"
              >
                Ingresar
              </NavLink>

              <NavLink
                to="/register"
                className="whitespace-nowrap rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-paper transition hover:bg-accent-hover"
              >
                Crear cuenta
              </NavLink>

              {/* MENU MÓVIL */}
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-panel-2 text-paper transition hover:bg-white/10 md:hidden"
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
        <nav className="menu-in mx-auto mt-2 max-w-7xl rounded-3xl bg-panel px-4 py-3 md:hidden">
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
              <NavLink to="/settings/security" className={mobileLinkClass}>
                Seguridad
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-paper"
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
