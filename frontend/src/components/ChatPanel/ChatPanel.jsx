import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import NewChatPanel from "../NewChatPanel/NewChatPanel";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { useToast } from "../../context/ToastContext";
import {
  getConversationsRequest,
  getMessagesRequest,
  markConversationReadRequest,
  sendMessageRequest,
} from "../../services/chatService";
import { formatRelativeTime } from "../../utils/formatRelativeTime";

const formatTime = (value) =>
  new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const Avatar = ({ name, size = "h-10 w-10" }) => (
  <span
    aria-hidden="true"
    className={`flex shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-paper ${size}`}
  >
    {(name || "?").charAt(0).toUpperCase()}
  </span>
);

const iconButton =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-panel-2 text-paper hover:bg-white/10";

const ConversationList = ({ conversations, loading, onSelect }) => {
  if (loading) {
    return (
      <div className="space-y-2 p-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-16 animate-pulse rounded-2xl bg-panel-2"
          />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-6 text-sm text-zinc-400">
        Todavía no tenés conversaciones. Tocá{" "}
        <span className="font-bold text-paper">Nuevo</span> para escribirle a
        alguien.
      </div>
    );
  }

  return (
    <ul className="space-y-1 p-2">
      {conversations.map((conversation) => (
        <li key={conversation.id}>
          <button
            type="button"
            onClick={() => onSelect(conversation)}
            className="flex w-full items-center gap-3 rounded-2xl p-3 text-left transition hover:bg-panel-2"
          >
            <Avatar name={conversation.otherUserName} />

            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-bold text-paper">
                  {conversation.otherUserName}
                </span>
                {conversation.lastMessageAt && (
                  <span className="shrink-0 text-[13px] text-zinc-400">
                    {formatRelativeTime(conversation.lastMessageAt)}
                  </span>
                )}
              </span>

              <span className="flex items-center justify-between gap-2">
                <span className="truncate text-[13px] text-zinc-300">
                  {conversation.lastMessageIsMine && "Vos: "}
                  {conversation.lastMessage}
                </span>
                {conversation.unreadCount > 0 && (
                  <span className="flex min-h-[20px] min-w-[20px] shrink-0 items-center justify-center rounded-full bg-accent px-1.5 text-[13px] font-bold text-paper">
                    {conversation.unreadCount}
                  </span>
                )}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
};

// Ventana de chat: lista de conversaciones y, al elegir una, el hilo de mensajes.
// En el celular ocupa toda la pantalla; en la compu flota sobre el botón.
const ChatPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    subscribe,
    setActiveConversation,
    refreshUnread,
    panelTarget,
    closeChat,
  } = useChat();

  const [activeId, setActiveId] = useState(panelTarget?.id ?? null);
  const [hint, setHint] = useState(panelTarget?.other ?? null);
  const [conversations, setConversations] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [newChatOpen, setNewChatOpen] = useState(false);

  const scrollRef = useRef(null);
  const scrollMode = useRef("bottom");
  const previousHeight = useRef(0);

  // Abrir el chat desde una notificación o un perfil lleva directo a esa conversación.
  useEffect(() => {
    setActiveId(panelTarget?.id ?? null);
    setHint(panelTarget?.other ?? null);
    setNewChatOpen(false);
  }, [panelTarget]);

  const isMine = useCallback(
    (message) =>
      message.senderId === user?.id || message.senderUserName === user?.userName,
    [user],
  );

  const loadConversations = useCallback(async () => {
    try {
      setConversations(await getConversationsRequest());
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const conversationsRef = useRef([]);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  // Sube la conversación al tope con su último mensaje; si es nueva, recarga la lista.
  const bumpConversation = useCallback(
    (message, mine) => {
      if (!conversationsRef.current.some((item) => item.id === message.conversationId)) {
        loadConversations();
        return;
      }

      setConversations((list) => {
        const existing = list.find((item) => item.id === message.conversationId);
        if (!existing) return list;

        return [
          {
            ...existing,
            lastMessage: message.content,
            lastMessageAt: message.createdAt,
            lastMessageIsMine: mine,
            unreadCount:
              mine || message.conversationId === activeId
                ? existing.unreadCount
                : existing.unreadCount + 1,
          },
          ...list.filter((item) => item !== existing),
        ];
      });
    },
    [activeId, loadConversations],
  );

  const markRead = useCallback(
    async (id) => {
      try {
        await markConversationReadRequest(id);
        setConversations((list) =>
          list.map((item) =>
            item.id === id ? { ...item, unreadCount: 0 } : item,
          ),
        );
        refreshUnread();
      } catch (error) {
        console.error(error);
      }
    },
    [refreshUnread],
  );

  // Abrir una conversación: carga los últimos mensajes y los marca como leídos.
  useEffect(() => {
    setMessages([]);
    setHasMore(false);
    setText("");

    if (!activeId) return undefined;

    let cancelled = false;
    setActiveConversation(activeId);
    setLoadingMessages(true);
    scrollMode.current = "bottom";

    getMessagesRequest(activeId)
      .then((data) => {
        if (cancelled) return;
        setMessages(data.items);
        setHasMore(data.hasMore);
        markRead(activeId);
      })
      .catch((error) => {
        if (cancelled) return;
        toast(error.message || "No se pudo abrir la conversación.", "error");
        setActiveId(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingMessages(false);
      });

    return () => {
      cancelled = true;
      setActiveConversation(null);
    };
  }, [activeId, markRead, setActiveConversation, toast]);

  // Mensajes en vivo: se agregan al hilo abierto y actualizan la lista.
  useEffect(
    () =>
      subscribe((message) => {
        if (message.conversationId === activeId) {
          scrollMode.current = "bottom";
          setMessages((list) =>
            list.some((item) => item.id === message.id)
              ? list
              : [...list, message],
          );
          if (!isMine(message)) markRead(activeId);
        }

        bumpConversation(message, isMine(message));
      }),
    [activeId, bumpConversation, isMine, markRead, subscribe],
  );

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    if (scrollMode.current === "bottom") {
      element.scrollTop = element.scrollHeight;
    } else {
      // Al sumar mensajes viejos arriba se conserva lo que se estaba leyendo.
      element.scrollTop = element.scrollHeight - previousHeight.current;
    }
  }, [messages]);

  const loadOlder = async () => {
    if (!messages.length || loadingOlder) return;

    try {
      setLoadingOlder(true);
      previousHeight.current = scrollRef.current?.scrollHeight ?? 0;
      scrollMode.current = "keep";

      const data = await getMessagesRequest(activeId, messages[0].id);
      setMessages((list) => [...data.items, ...list]);
      setHasMore(data.hasMore);
    } catch (error) {
      toast(error.message || "No se pudieron cargar más mensajes.", "error");
    } finally {
      setLoadingOlder(false);
    }
  };

  const handleSend = async () => {
    const content = text.trim();
    if (!content || sending) return;

    try {
      setSending(true);
      const message = await sendMessageRequest(activeId, content);
      scrollMode.current = "bottom";
      setText("");
      // El aviso en vivo puede llegar antes o después: se evita duplicarlo.
      setMessages((list) =>
        list.some((item) => item.id === message.id) ? list : [...list, message],
      );
      bumpConversation(message, true);
    } catch (error) {
      toast(error.message || "No se pudo enviar el mensaje.", "error");
    } finally {
      setSending(false);
    }
  };

  const selectConversation = (conversation) => {
    setHint(conversation);
    setActiveId(conversation.id);
  };

  const startConversation = (conversation) => {
    setHint(conversation);
    setActiveId(conversation.id);
    setNewChatOpen(false);
    loadConversations();
  };

  const current =
    conversations.find((item) => item.id === activeId) ??
    (hint?.id === activeId ? hint : null);

  return (
    <div
      role="dialog"
      aria-label="Chat"
      className="fixed inset-x-0 top-0 z-[60] flex h-dvh flex-col bg-panel pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] sm:inset-x-auto sm:bottom-24 sm:right-6 sm:top-auto sm:h-[min(36rem,calc(100dvh-8rem))] sm:w-[26rem] sm:rounded-3xl sm:py-0 sm:shadow-2xl sm:ring-1 sm:ring-white/10"
    >
      <header className="flex items-center gap-3 border-b border-white/10 px-3 py-3">
        {activeId ? (
          <>
            <button
              type="button"
              onClick={() => setActiveId(null)}
              aria-label="Volver a las conversaciones"
              className={iconButton}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 5l-7 7 7 7" />
              </svg>
            </button>

            {current ? (
              <Link
                to={`/profile/${current.otherUserName}`}
                onClick={closeChat}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <Avatar name={current.otherUserName} size="h-9 w-9" />
                <span className="truncate font-bold text-paper">
                  {current.otherUserName}
                </span>
              </Link>
            ) : (
              <span className="flex-1 font-bold text-paper">Conversación</span>
            )}
          </>
        ) : (
          <>
            <h2 className="flex-1 pl-2 text-xl">Chat</h2>
            {!newChatOpen && (
              <button
                type="button"
                onClick={() => setNewChatOpen(true)}
                className="springy rounded-full bg-accent px-4 py-2 text-[13px] font-bold text-paper hover:scale-105 hover:bg-accent-hover"
              >
                + Nuevo
              </button>
            )}
          </>
        )}

        <button
          type="button"
          onClick={closeChat}
          aria-label="Cerrar chat"
          className={iconButton}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </header>

      {!activeId ? (
        newChatOpen ? (
          <div className="flex min-h-0 flex-1 flex-col pt-3">
            <NewChatPanel
              onClose={() => setNewChatOpen(false)}
              onStart={startConversation}
            />
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <ConversationList
              conversations={conversations}
              loading={loadingList}
              onSelect={selectConversation}
            />
          </div>
        )
      ) : (
        <>
          <div
            ref={scrollRef}
            className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-4"
          >
            {hasMore && (
              <div className="pb-2 text-center">
                <button
                  type="button"
                  onClick={loadOlder}
                  disabled={loadingOlder}
                  className="rounded-full bg-panel-2 px-4 py-1.5 text-[13px] text-zinc-300 hover:bg-white/10 disabled:opacity-60"
                >
                  {loadingOlder ? "Cargando..." : "Ver mensajes anteriores"}
                </button>
              </div>
            )}

            {loadingMessages ? (
              <p className="py-10 text-center text-sm text-zinc-400">
                Cargando mensajes...
              </p>
            ) : messages.length === 0 ? (
              <p className="py-10 text-center text-sm text-zinc-400">
                Todavía no hay mensajes. Escribí el primero.
              </p>
            ) : (
              messages.map((message) => {
                const mine = isMine(message);

                return (
                  <div
                    key={message.id}
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                        mine
                          ? "rounded-br-md bg-accent text-paper"
                          : "rounded-bl-md bg-panel-2 text-paper"
                      }`}
                    >
                      <p className="whitespace-pre-line break-words text-sm">
                        {message.content}
                      </p>
                      <p className="mt-1 text-right text-[13px] text-paper/60">
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSend();
            }}
            className="flex items-end gap-2 border-t border-white/10 p-2"
          >
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              maxLength={2000}
              placeholder="Escribí un mensaje..."
              aria-label="Mensaje"
              className="max-h-32 min-h-[44px] min-w-0 flex-1 resize-none rounded-2xl bg-panel-2 px-4 py-3 text-sm text-paper"
            />
            <button
              type="submit"
              disabled={!text.trim() || sending}
              className="h-11 rounded-full bg-accent px-5 text-sm font-bold text-paper transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              Enviar
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ChatPanel;
