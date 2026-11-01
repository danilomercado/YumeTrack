import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { useToast } from "../../context/ToastContext";
import {
  deleteListRequest,
  getListRequest,
  removeListItemRequest,
  updateListRequest,
} from "../../services/communityService";

const ListDetail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [list, setList] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    isPublic: true,
  });
  const [confirmDelete, setConfirmDelete] = useState(false);

  useDocumentTitle(list?.title ?? "Lista");

  useEffect(() => {
    getListRequest(token)
      .then((data) => {
        setList(data);
        setForm({
          title: data.title,
          description: data.description ?? "",
          isPublic: data.isPublic,
        });
      })
      .catch((err) => setError(err.message || "No se pudo cargar la lista."));
  }, [token]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast("Enlace copiado");
    } catch {
      toast("Copiá el enlace desde la barra del navegador", "error");
    }
  };

  const save = async (event) => {
    event.preventDefault();

    try {
      await updateListRequest(token, form);
      setList((prev) => ({ ...prev, ...form }));
      setEditing(false);
      toast("Lista actualizada");
    } catch (err) {
      toast(err.message || "No se pudo guardar", "error");
    }
  };

  const removeItem = async (itemId) => {
    try {
      await removeListItemRequest(token, itemId);
      setList((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== itemId),
      }));
    } catch (err) {
      toast(err.message || "No se pudo quitar", "error");
    }
  };

  const remove = async () => {
    try {
      await deleteListRequest(token);
      toast("Lista eliminada");
      navigate("/lists");
    } catch (err) {
      toast(err.message || "No se pudo eliminar", "error");
    }
  };

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center text-paper">
        <p className="rounded-2xl bg-panel p-8 text-zinc-300">{error}</p>
        <Link to="/" className="mt-6 inline-block font-bold text-accent-soft">
          Volver al inicio
        </Link>
      </main>
    );
  }

  if (!list) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="h-48 animate-pulse rounded-[2rem] bg-panel" />
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-dvh max-w-6xl px-4 py-8 text-paper sm:px-6">
      <section className="rise-in relative mb-8 overflow-hidden rounded-[2rem] bg-panel p-6 sm:p-10">
        {editing ? (
          <form onSubmit={save} className="max-w-xl space-y-3">
            <input
              maxLength={80}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              aria-label="Nombre de la lista"
              className="w-full rounded-xl bg-ground px-4 py-3 text-paper"
            />
            <textarea
              maxLength={300}
              rows={2}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              aria-label="Descripción"
              className="w-full rounded-xl bg-ground px-4 py-3 text-sm text-paper"
            />
            <label className="flex items-center gap-3 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={form.isPublic}
                onChange={(e) =>
                  setForm({ ...form, isPublic: e.target.checked })
                }
                className="h-4 w-4 accent-[#e0112b]"
              />
              Pública
            </label>
            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-paper"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-full bg-panel-2 px-6 py-2.5 text-sm font-bold text-paper"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <>
            <p className="text-sm text-zinc-400">
              Lista de{" "}
              <Link
                to={`/profile/${list.ownerName}`}
                className="font-bold text-paper hover:text-accent-soft"
              >
                {list.ownerName}
              </Link>
              {!list.isPublic && " · privada"}
            </p>
            <h1 className="mt-2 text-3xl leading-[1.1] sm:text-5xl">
              {list.title}
            </h1>
            {list.description && (
              <p className="mt-3 max-w-2xl text-zinc-300">{list.description}</p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {list.isPublic && (
                <button
                  type="button"
                  onClick={copyLink}
                  className="springy shine rounded-full bg-accent px-6 py-3 text-sm font-bold text-paper hover:scale-105"
                >
                  Copiar enlace
                </button>
              )}

              {list.isOwner && (
                <>
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="rounded-full bg-panel-2 px-6 py-3 text-sm font-bold text-paper hover:bg-white/10"
                  >
                    Editar
                  </button>

                  {confirmDelete ? (
                    <>
                      <button
                        type="button"
                        onClick={remove}
                        className="rounded-full bg-red-500/20 px-6 py-3 text-sm font-bold text-red-300"
                      >
                        Sí, eliminar
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="rounded-full bg-panel-2 px-6 py-3 text-sm font-bold text-paper"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="rounded-full px-6 py-3 text-sm font-bold text-red-300 hover:bg-red-500/10"
                    >
                      Eliminar
                    </button>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </section>

      {list.items.length === 0 ? (
        <div className="rounded-2xl bg-panel p-8 text-center text-sm text-zinc-300">
          {list.isOwner
            ? "La lista está vacía. Abrí la ficha de cualquier anime o manga y agregalo desde ahí."
            : "Esta lista todavía no tiene títulos."}
        </div>
      ) : (
        <ol className="grid gap-4 sm:grid-cols-2">
          {list.items.map((item, index) => (
            <li
              key={item.id}
              style={{ "--i": Math.min(index, 9) }}
              className="stagger-item flex gap-4 rounded-2xl bg-panel p-4"
            >
              <span className="font-display text-3xl text-accent">
                {index + 1}
              </span>

              {item.posterImageUrl ? (
                <img
                  src={item.posterImageUrl}
                  alt={item.canonicalTitle}
                  loading="lazy"
                  decoding="async"
                  className="h-28 w-[4.5rem] shrink-0 rounded-xl object-cover"
                />
              ) : (
                <div className="kanji flex h-28 w-[4.5rem] shrink-0 items-center justify-center rounded-xl bg-panel-2 text-3xl text-zinc-600">
                  夢
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h2 className="line-clamp-2 text-base leading-tight text-paper">
                  {item.canonicalTitle}
                </h2>
                <span className="mt-2 inline-block rounded-full bg-panel-2 px-2.5 py-0.5 text-[13px] text-zinc-300">
                  {item.mediaType}
                </span>
                {item.note && (
                  <p className="mt-2 text-sm text-zinc-300">{item.note}</p>
                )}
              </div>

              {list.isOwner && (
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Quitar ${item.canonicalTitle}`}
                  className="h-8 w-8 shrink-0 rounded-full text-zinc-400 hover:bg-white/10 hover:text-paper"
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ol>
      )}
    </main>
  );
};

export default ListDetail;
