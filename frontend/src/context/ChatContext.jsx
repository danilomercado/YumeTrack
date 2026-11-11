import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { useAuth } from "./AuthContext";
import { getChatUnreadCountRequest } from "../services/chatService";

const ChatContext = createContext({
  unreadCount: 0,
  refreshUnread: () => {},
  subscribe: () => () => {},
  setActiveConversation: () => {},
});

// La API vive en /api; el hub de SignalR cuelga de la raíz del servidor.
const hubUrl = () =>
  `${(import.meta.env.VITE_API_URL ?? "").replace(/\/api\/?$/, "")}/hubs/chat`;

export const ChatProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const listeners = useRef(new Set());
  const activeConversation = useRef(null);
  const userRef = useRef(user);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const refreshUnread = useCallback(async () => {
    try {
      setUnreadCount(await getChatUnreadCountRequest());
    } catch (error) {
      console.error(error);
    }
  }, []);

  const subscribe = useCallback((listener) => {
    listeners.current.add(listener);
    return () => listeners.current.delete(listener);
  }, []);

  const setActiveConversation = useCallback((id) => {
    activeConversation.current = id;
  }, []);

  useEffect(() => {
    if (!token) {
      setUnreadCount(0);
      return undefined;
    }

    refreshUnread();

    const connection = new HubConnectionBuilder()
      .withUrl(hubUrl(), {
        accessTokenFactory: () => localStorage.getItem("token") ?? "",
        // El CORS del backend no usa credenciales: las cookies sobran.
        withCredentials: false,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.None)
      .build();

    connection.on("MessageReceived", (message) => {
      listeners.current.forEach((listener) => listener(message));

      const me = userRef.current;
      const isMine =
        message.senderId === me?.id || message.senderUserName === me?.userName;

      if (!isMine && activeConversation.current !== message.conversationId) {
        setUnreadCount((count) => count + 1);
      }
    });

    // Al reconectar pudieron llegar mensajes que no se vieron.
    connection.onreconnected(refreshUnread);

    connection.start().catch((error) => console.error(error));

    return () => {
      connection.stop();
    };
  }, [token, refreshUnread]);

  const value = useMemo(
    () => ({ unreadCount, refreshUnread, subscribe, setActiveConversation }),
    [unreadCount, refreshUnread, subscribe, setActiveConversation],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => useContext(ChatContext);
