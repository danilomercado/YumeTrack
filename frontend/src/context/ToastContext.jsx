import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

const ToastContext = createContext({ toast: () => {} });

const VISIBLE_MS = 3200;
const LEAVE_MS = 200;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((list) =>
      list.map((item) => (item.id === id ? { ...item, leaving: true } : item)),
    );
    setTimeout(
      () => setToasts((list) => list.filter((item) => item.id !== id)),
      LEAVE_MS,
    );
  }, []);

  const toast = useCallback(
    (message, kind = "success") => {
      const id = ++idRef.current;
      setToasts((list) => [...list.slice(-2), { id, message, kind }]);
      setTimeout(() => dismiss(id), VISIBLE_MS);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[120] flex flex-col items-center gap-2 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            role="status"
            className={`pointer-events-auto flex items-center gap-3 rounded-full bg-paper py-2 pl-2 pr-5 text-sm font-bold text-ground ${
              item.leaving ? "toast-out" : "toast-in"
            }`}
          >
            <span
              aria-hidden="true"
              className={`kanji flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none text-paper ${
                item.kind === "error" ? "bg-ground" : "bg-accent"
              }`}
            >
              {item.kind === "error" ? "!" : "夢"}
            </span>
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext);
