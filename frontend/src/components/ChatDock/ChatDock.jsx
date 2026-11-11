import { useEffect } from "react";
import ChatPanel from "../ChatPanel/ChatPanel";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";

// Botón flotante abajo a la derecha que abre y cierra la ventana de chat.
const ChatDock = () => {
  const { isAuthenticated } = useAuth();
  const { unreadCount, panelOpen, openChat, closeChat } = useChat();

  useEffect(() => {
    if (!panelOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") closeChat();
    };

    // En el celular la ventana tapa toda la pantalla: la página de atrás no debe moverse.
    const fullScreen = window.matchMedia("(max-width: 639px)").matches;
    const previousOverflow = document.body.style.overflow;
    if (fullScreen) document.body.style.overflow = "hidden";

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [panelOpen, closeChat]);

  if (!isAuthenticated) return null;

  return (
    <>
      {panelOpen && <ChatPanel />}

      <button
        type="button"
        onClick={() => (panelOpen ? closeChat() : openChat())}
        aria-label={
          panelOpen
            ? "Cerrar chat"
            : unreadCount > 0
              ? `Abrir chat (${unreadCount} sin leer)`
              : "Abrir chat"
        }
        aria-expanded={panelOpen}
        className="springy fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-paper shadow-lg hover:scale-110 hover:bg-accent-hover sm:right-6"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-6 w-6"
          aria-hidden="true"
        >
          {panelOpen ? (
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
            />
          )}
        </svg>

        {!panelOpen && unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-[22px] min-w-[22px] items-center justify-center rounded-full bg-paper px-1.5 text-[13px] font-bold text-ground">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
    </>
  );
};

export default ChatDock;
