import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { blockUserRequest, reportRequest } from "../../services/socialService";

const REASONS = [
  ["spam", "Spam o publicidad"],
  ["acoso", "Acoso o insultos"],
  ["inapropiado", "Contenido inapropiado"],
  ["spoilers", "Spoilers sin aviso"],
  ["otro", "Otro motivo"],
];

// Menú "⋯" para denunciar contenido o bloquear a su autor.
// targetType: "review" | "comment" | "user"
const ReportMenu = ({
  targetType,
  targetId,
  userId,
  userName,
  onBlocked,
  className = "",
}) => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [confirmBlock, setConfirmBlock] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState("spam");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointer = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
        setConfirmBlock(false);
      }
    };
    const handleKey = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        setConfirmBlock(false);
      }
    };

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  if (user?.id && userId && user.id === userId) return null;

  const requireLogin = () => {
    if (isAuthenticated) return false;
    navigate("/login");
    return true;
  };

  const stop = (event) => event.stopPropagation();

  const submitReport = async (event) => {
    event.preventDefault();

    try {
      setBusy(true);
      const data = await reportRequest({
        targetType,
        targetId,
        reason,
        details,
      });
      toast(data?.message || "Gracias por avisarnos");
      setReporting(false);
      setDetails("");
    } catch (error) {
      toast(error.message || "No se pudo enviar la denuncia", "error");
    } finally {
      setBusy(false);
    }
  };

  const block = async () => {
    try {
      setBusy(true);
      await blockUserRequest(userId);
      toast(`Bloqueaste a ${userName}`);
      setOpen(false);
      setConfirmBlock(false);
      onBlocked?.();
    } catch (error) {
      toast(error.message || "No se pudo bloquear", "error");
    } finally {
      setBusy(false);
    }
  };

  const itemClass =
    "block w-full rounded-xl px-3 py-2 text-left text-sm text-zinc-200 hover:bg-white/10";

  return (
    <div
      ref={rootRef}
      className={`relative ${className}`}
      onClick={stop}
      onKeyDown={stop}
    >
      <button
        type="button"
        aria-label="Más opciones"
        aria-expanded={open}
        onClick={() => {
          if (requireLogin()) return;
          setOpen((value) => !value);
          setConfirmBlock(false);
        }}
        className="flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none text-zinc-400 hover:bg-white/10 hover:text-paper"
      >
        <span aria-hidden="true">⋯</span>
      </button>

      {open && (
        <div className="pop-in pop-in-origin-tr absolute right-0 top-9 z-30 w-56 rounded-2xl bg-panel-2 p-2">
          {confirmBlock ? (
            <div className="p-2">
              <p className="text-sm text-zinc-200">
                ¿Bloquear a {userName}? No van a ver el contenido del otro y se
                corta el seguimiento.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={block}
                  className="rounded-full bg-accent px-4 py-1.5 text-sm font-bold text-paper disabled:opacity-60"
                >
                  Bloquear
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmBlock(false)}
                  className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold text-paper"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                className={itemClass}
                onClick={() => {
                  setOpen(false);
                  setReporting(true);
                }}
              >
                Denunciar
              </button>
              {userId && (
                <button
                  type="button"
                  className={itemClass}
                  onClick={() => setConfirmBlock(true)}
                >
                  Bloquear a {userName}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {reporting &&
        createPortal(
          <div
            className="fade-in fixed inset-0 z-[110] flex items-end justify-center bg-black/75 sm:items-center sm:p-4"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setReporting(false);
            }}
            onClick={stop}
          >
            <form
              role="dialog"
              aria-modal="true"
              aria-label="Denunciar"
              onSubmit={submitReport}
              className="pop-in w-full max-w-md rounded-t-[2rem] bg-panel p-6 sm:rounded-[2rem]"
            >
              <h3 className="text-xl text-paper">Denunciar</h3>
              <p className="mt-1 text-sm text-zinc-400">
                Elegí el motivo. Lo revisamos y el otro usuario no se entera de
                quién avisó.
              </p>

              <div className="mt-4 space-y-1">
                {REASONS.map(([value, label]) => (
                  <label
                    key={value}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm ${
                      reason === value
                        ? "bg-accent text-paper"
                        : "bg-panel-2 text-zinc-200 hover:bg-white/10"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={value}
                      checked={reason === value}
                      onChange={() => setReason(value)}
                      className="sr-only"
                    />
                    {label}
                  </label>
                ))}
              </div>

              <textarea
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Detalles (opcional)"
                aria-label="Detalles de la denuncia"
                className="mt-4 w-full rounded-xl bg-ground px-4 py-3 text-sm text-paper"
              />

              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReporting(false)}
                  className="rounded-full bg-panel-2 px-5 py-2.5 text-sm font-bold text-paper"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-paper disabled:opacity-60"
                >
                  {busy ? "Enviando..." : "Enviar denuncia"}
                </button>
              </div>
            </form>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default ReportMenu;
