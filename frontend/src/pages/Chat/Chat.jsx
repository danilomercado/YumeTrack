import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import NewChatPanel from "../../components/NewChatPanel/NewChatPanel";
import useDocumentTitle from "../../hooks/useDocumentTitle";
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

const ConversationList = ({ conversations, loading, activeId }) => {
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
          <Link
            to={`/chat/${conversation.id}`}
            aria-current={conversation.id === activeId ? "page" : undefined}
            className={`flex items-center gap-3 rounded-2xl p-3 transition ${
              conversation.id === activeId
                ? "bg-accent"
                : "hover:bg-panel-2"
            }`}
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
                  <span className="flex min-h-[20px] min-w-[20px] shrink-0 items-center justify-center rounded-full bg-paper px-1.5 text-[13px] font-bold text-ground">
                    {conversation.unreadCount}
                  </span>
                )}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
};

const Chat = () => {
  useDocumentTitle("Chat");

  const { conversationId } = useParams();
  const activeId = conversationId ? Number(conversationId) : null;
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { subscribe, setActiveConversation, refreshUnread } = useChat();

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
        navigate("/chat", { replace: true });
      })
      .finally(() => {
        if (!cancelled) setLoadingMessages(false);
      });

    return () => {
      cancelled = true;
      setActiveConversation(null);
    };
  }, [activeId, markRead, navigate, setActiveConversation, toast]);

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

  const current =
    conversations.find((item) => item.id === activeId) ??
    (location.state?.other?.id === activeId ? location.state.other : null);
  return (
    <main className="mx-auto max-w-6xl px-2 py-2 text-paper sm:px-6 md:py-6">
      <div className="grid h-[calc(100dvh-6.75rem-env(safe-area-inset-top))] grid-rows-[minmax(0,1fr)] overflow-hidden rounded-3xl bg-panel md:h-[calc(100dvh-8.5rem)] md:min-h-[28rem] md:grid-cols-[320px_1fr] md:rounded-[2rem]">
        <aside
          className={`min-h-0 flex-col overflow-y-auto border-white/10 md:flex md:border-r ${
            activeId ? "hidden" : "flex"
          }`}
        >
          <div className="flex items-center justify-between px-5 pb-2 pt-5">
            <h1 className="text-2xl">Chat</h1>
            {!newChatOpen && (
              <button
                type="button"
                onClick={() => setNewChatOpen(true)}
                className="springy rounded-full bg-accent px-4 py-2 text-[13px] font-bold text-paper hover:scale-105 hover:bg-accent-hover"
              >
                + Nuevo
              </button>
            )}
          </div>

          {newChatOpen ? (
            <NewChatPanel onClose={() => setNewChatOpen(false)} />
          ) : (
            <ConversationList
              conversations={conversations}
              loading={loadingList}
              activeId={activeId}
            />
          )}
        </aside>

        <section
          className={`min-h-0 flex-col md:flex ${activeId ? "flex" : "hidden"}`}
        >
          {!activeId ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
              <span aria-hidden="true" className="kanji text-7xl text-zinc-700">
                話
              </span>
              <p className="max-w-xs text-sm text-zinc-400">
                Elegí una conversación o escribile a alguien desde su perfil.
              </p>
            </div>
          ) : (
            <>
              <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
                <Link
                  to="/chat"
                  aria-label="Volver a las conversaciones"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-panel-2 hover:bg-white/10 md:hidden"
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
                </Link>

                {current ? (
                  <Link
                    to={`/profile/${current.otherUserName}`}
                    className="flex min-w-0 items-center gap-3"
                  >
                    <Avatar name={current.otherUserName} />
                    <span className="truncate font-bold text-paper">
                      {current.otherUserName}
                    </span>
                  </Link>
                ) : (
                  <span className="font-bold text-paper">Conversación</span>
                )}
              </header>

              <div
                ref={scrollRef}
                className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-4"
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
                          className={`max-w-[85%] rounded-2xl px-4 py-2 md:max-w-[80%] ${
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
                className="flex items-end gap-2 border-t border-white/10 p-2 md:p-3"
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
        </section>
      </div>
    </main>
  );
};

export default Chat;
