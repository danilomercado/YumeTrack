import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import {
  getChatPeopleRequest,
  startConversationRequest,
} from "../../services/chatService";
import { followUserRequest } from "../../services/followService";

const SEARCH_DELAY_MS = 300;

// Elegir con quién hablar: al abrirse muestra a quienes seguís y te siguen, y
// escribiendo se busca por nombre. Si no seguís a la persona, se pregunta antes.
const NewChatPanel = ({ onClose }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [query, setQuery] = useState("");
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(
      async () => {
        try {
          const data = await getChatPeopleRequest(query.trim());
          if (!cancelled) setPeople(data);
        } catch (error) {
          if (!cancelled) toast(error.message || "No se pudo buscar.", "error");
        } finally {
          if (!cancelled) setLoading(false);
        }
      },
      query ? SEARCH_DELAY_MS : 0,
    );

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, toast]);

  const start = async (person, { follow }) => {
    if (starting) return;

    try {
      setStarting(true);

      if (follow) await followUserRequest(person.id);

      const conversation = await startConversationRequest(person.id);
      onClose();
      navigate(`/chat/${conversation.id}`, { state: { other: conversation } });
    } catch (error) {
      toast(error.message || "No se pudo abrir el chat.", "error");
      setStarting(false);
    }
  };

  const choose = (person) => {
    if (person.isFollowing) {
      start(person, { follow: false });
    } else {
      setPending(person);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 px-4 pb-2">
        <input
          autoFocus
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPending(null);
          }}
          placeholder="Buscar por nombre de usuario"
          aria-label="Buscar usuario"
          maxLength={50}
          className="min-w-0 flex-1 rounded-xl bg-panel-2 px-4 py-2 text-sm text-paper"
        />
        <button
          type="button"
          onClick={onClose}
          className="rounded-full px-3 py-2 text-[13px] text-zinc-400 hover:bg-white/10 hover:text-paper"
        >
          Cancelar
        </button>
      </div>

      {pending && (
        <div className="pop-in mx-3 mb-2 rounded-2xl bg-panel-2 p-4">
          <p className="text-sm text-paper">
            No seguís a <span className="font-bold">{pending.userName}</span>.
            ¿Querés seguirlo antes de escribirle?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={starting}
              onClick={() => start(pending, { follow: true })}
              className="rounded-full bg-accent px-4 py-2 text-[13px] font-bold text-paper hover:bg-accent-hover disabled:opacity-60"
            >
              Seguir y escribir
            </button>
            <button
              type="button"
              disabled={starting}
              onClick={() => start(pending, { follow: false })}
              className="rounded-full bg-white/10 px-4 py-2 text-[13px] font-bold text-paper hover:bg-white/15 disabled:opacity-60"
            >
              Solo escribir
            </button>
            <button
              type="button"
              disabled={starting}
              onClick={() => setPending(null)}
              className="rounded-full px-3 py-2 text-[13px] text-zinc-400 hover:text-paper"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {loading ? (
          <p className="p-4 text-sm text-zinc-400">Buscando...</p>
        ) : people.length === 0 ? (
          <p className="p-4 text-sm text-zinc-400">
            {query.trim()
              ? "No encontramos a nadie con ese nombre."
              : "Todavía no seguís a nadie ni te siguen. Buscá a alguien por su nombre de usuario."}
          </p>
        ) : (
          <>
            {!query.trim() && (
              <p className="px-2 pb-1 text-[13px] text-zinc-400">
                Tus seguidores y a quienes seguís
              </p>
            )}
            <ul className="space-y-1">
              {people.map((person) => (
                <li key={person.id}>
                  <button
                    type="button"
                    disabled={starting}
                    onClick={() => choose(person)}
                    className="flex w-full items-center gap-3 rounded-2xl p-3 text-left transition hover:bg-panel-2 disabled:opacity-60"
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-paper"
                    >
                      {person.userName.charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-bold text-paper">
                      {person.userName}
                    </span>
                    <span className="shrink-0 text-[13px] text-zinc-400">
                      {person.isFollowing
                        ? "Siguiendo"
                        : person.followsMe
                          ? "Te sigue"
                          : ""}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default NewChatPanel;
