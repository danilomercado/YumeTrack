import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageBanner from "../../components/PageBanner/PageBanner";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { useToast } from "../../context/ToastContext";
import {
  createListRequest,
  getMyListsRequest,
} from "../../services/communityService";

const Covers = ({ covers }) => (
  <div className="grid h-36 grid-cols-4 gap-0.5 overflow-hidden rounded-xl bg-panel-2">
    {covers.length === 0 ? (
      <div className="kanji col-span-4 flex items-center justify-center text-5xl text-zinc-700">
        夢
      </div>
    ) : (
      covers.map((cover, index) => (
        <img
          key={index}
          src={cover}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-36 w-full object-cover"
        />
      ))
    )}
  </div>
);

const Lists = () => {
  useDocumentTitle("Mis listas");
  const navigate = useNavigate();
  const { toast } = useToast();

  const [lists, setLists] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    isPublic: true,
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getMyListsRequest()
      .then(setLists)
      .catch(() => setLists([]));
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) return;

    try {
      setBusy(true);
      const data = await createListRequest(form);
      toast("Lista creada");
      navigate(`/l/${data.token}`);
    } catch (error) {
      toast(error.message || "No se pudo crear la lista", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto min-h-dvh max-w-6xl px-4 py-8 text-paper sm:px-6">
      <PageBanner
        image="/art/hanami.jpg"
        title="Mis listas"
        subtitle="Armá listas temáticas y compartilas con un enlace: tus 5 de acción, lo mejor del año, lo que recomendarías a un amigo."
        kanji="集"
      >
        <button
          type="button"
          onClick={() => setCreating((value) => !value)}
          className="springy mt-5 rounded-full bg-accent px-6 py-3 text-sm font-bold text-paper hover:scale-105"
        >
          {creating ? "Cancelar" : "+ Nueva lista"}
        </button>
      </PageBanner>

      {creating && (
        <form
          onSubmit={submit}
          className="pop-in mb-8 max-w-xl space-y-3 rounded-2xl bg-panel p-6"
        >
          <input
            autoFocus
            maxLength={80}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Nombre de la lista"
            aria-label="Nombre de la lista"
            className="w-full rounded-xl bg-ground px-4 py-3 text-paper"
          />
          <textarea
            maxLength={300}
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Descripción (opcional)"
            aria-label="Descripción"
            className="w-full rounded-xl bg-ground px-4 py-3 text-sm text-paper"
          />
          <label className="flex items-center gap-3 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={form.isPublic}
              onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
              className="h-4 w-4 accent-[#e0112b]"
            />
            Pública: cualquiera con el enlace puede verla
          </label>
          <button
            type="submit"
            disabled={busy || !form.title.trim()}
            className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-paper disabled:opacity-60"
          >
            Crear lista
          </button>
        </form>
      )}

      {lists === null ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-56 animate-pulse rounded-2xl bg-panel"
            />
          ))}
        </div>
      ) : lists.length === 0 ? (
        <div className="rounded-2xl bg-panel p-8 text-center text-sm text-zinc-300">
          Todavía no armaste ninguna lista. Creá la primera con el botón de
          arriba, o agregá títulos desde su ficha.
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((list, index) => (
            <li
              key={list.token}
              style={{ "--i": Math.min(index, 9) }}
              className="stagger-item"
            >
              <Link
                to={`/l/${list.token}`}
                className="springy block rounded-2xl bg-panel p-4 hover:-translate-y-1 hover:bg-panel-2"
              >
                <Covers covers={list.covers} />
                <div className="mt-3 flex items-start justify-between gap-2">
                  <h2 className="line-clamp-2 text-lg leading-tight text-paper">
                    {list.title}
                  </h2>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[13px] font-bold ${
                      list.isPublic
                        ? "bg-paper text-ground"
                        : "bg-panel-2 text-zinc-300"
                    }`}
                  >
                    {list.isPublic ? "Pública" : "Privada"}
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-zinc-400">
                  {list.itemsCount}{" "}
                  {list.itemsCount === 1 ? "título" : "títulos"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default Lists;
