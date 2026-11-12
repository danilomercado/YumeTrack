import React, { useEffect, useMemo, useState } from "react";
import PageBanner from "../../components/PageBanner/PageBanner";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import {
  deleteUserTitleRequest,
  getUserTitlesRequest,
  updateUserTitleRequest,
  USER_TITLE_STATUS,
} from "../../services/userTitleService";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const statusOptions = [
  { label: "Planeado", value: USER_TITLE_STATUS.PLANNED },
  { label: "Viendo", value: USER_TITLE_STATUS.WATCHING },
  { label: "Completado", value: USER_TITLE_STATUS.COMPLETED },
  { label: "En pausa", value: USER_TITLE_STATUS.ON_HOLD },
  { label: "Abandonado", value: USER_TITLE_STATUS.DROPPED },
];

const statusLabels = {
  [USER_TITLE_STATUS.PLANNED]: "Planeado",
  [USER_TITLE_STATUS.WATCHING]: "Viendo",
  [USER_TITLE_STATUS.COMPLETED]: "Completado",
  [USER_TITLE_STATUS.ON_HOLD]: "En pausa",
  [USER_TITLE_STATUS.DROPPED]: "Abandonado",
};

const normalizeItemForCompare = (item) => ({
  id: item.id,
  status: Number(item.status),
  progress: Number(item.progress ?? 0),
  score: item.score === "" || item.score === null ? null : Number(item.score),
  isFavorite: Boolean(item.isFavorite),
  notes: (item.notes ?? "").trim(),
});

const MyList = () => {
  useDocumentTitle("Mi lista");
  const [items, setItems] = useState([]);
  const [originalItems, setOriginalItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [savingMap, setSavingMap] = useState({});
  const [deletingMap, setDeletingMap] = useState({});
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    id: null,
  });

  const loadUserTitles = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const data = await getUserTitlesRequest();
      const normalizedData = Array.isArray(data) ? data : [];

      setItems(normalizedData);
      setOriginalItems(normalizedData);
    } catch (error) {
      setErrorMessage(error.message || "No se pudo cargar tu lista.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserTitles();
  }, []);

  useEffect(() => {
    if (!successMessage && !errorMessage) return;

    const timeoutId = setTimeout(() => {
      setSuccessMessage("");
      setErrorMessage("");
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [successMessage, errorMessage]);

  const filteredItems = useMemo(() => {
    if (statusFilter === "all") return items;
    return items.filter((item) => String(item.status) === String(statusFilter));
  }, [items, statusFilter]);

  const handleFieldChange = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  const hasItemChanged = (item) => {
    const originalItem = originalItems.find(
      (original) => original.id === item.id,
    );

    if (!originalItem) return false;

    const currentNormalized = normalizeItemForCompare(item);
    const originalNormalized = normalizeItemForCompare(originalItem);

    return (
      currentNormalized.status !== originalNormalized.status ||
      currentNormalized.progress !== originalNormalized.progress ||
      currentNormalized.score !== originalNormalized.score ||
      currentNormalized.isFavorite !== originalNormalized.isFavorite ||
      currentNormalized.notes !== originalNormalized.notes
    );
  };

  const handleSave = async (item) => {
    try {
      setSavingMap((prev) => ({ ...prev, [item.id]: true }));
      setErrorMessage("");
      setSuccessMessage("");

      const payload = {
        status: Number(item.status),
        progress: Number(item.progress) || 0,
        score:
          item.score === "" || item.score === null ? null : Number(item.score),
        isFavorite: Boolean(item.isFavorite),
        notes:
          item.notes && item.notes.trim().length > 0 ? item.notes.trim() : null,
      };

      await updateUserTitleRequest(item.id, payload);

      setOriginalItems((prev) =>
        prev.map((original) =>
          original.id === item.id
            ? {
                ...original,
                ...payload,
              }
            : original,
        ),
      );

      setSuccessMessage("Título actualizado correctamente.");
    } catch (error) {
      setErrorMessage(error.message || "No se pudo actualizar el título.");
    } finally {
      setSavingMap((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  const openDeleteModal = (id) => {
    setConfirmModal({
      isOpen: true,
      id,
    });
  };

  const closeDeleteModal = () => {
    setConfirmModal({
      isOpen: false,
      id: null,
    });
  };

  const handleConfirmDelete = async () => {
    const id = confirmModal.id;

    if (!id) return;

    try {
      setDeletingMap((prev) => ({ ...prev, [id]: true }));
      setErrorMessage("");
      setSuccessMessage("");

      await deleteUserTitleRequest(id);

      setItems((prev) => prev.filter((item) => item.id !== id));
      setOriginalItems((prev) => prev.filter((item) => item.id !== id));
      setSuccessMessage("Título eliminado correctamente.");
    } catch (error) {
      setErrorMessage(error.message || "No se pudo eliminar el título.");
    } finally {
      setDeletingMap((prev) => ({ ...prev, [id]: false }));
      closeDeleteModal();
    }
  };

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 py-10">
        <PageBanner
          image="/art/hanami.jpg"
          title="Mi lista"
          subtitle="Gestioná tus animes y mangas guardados."
          kanji="記"
        />

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              statusFilter === "all"
                ? "bg-accent text-paper"
                : "  bg-panel-2 text-zinc-300 hover:bg-white/10"
            }`}
          >
            Todos
          </button>

          {statusOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatusFilter(String(option.value))}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                String(statusFilter) === String(option.value)
                  ? "bg-accent text-paper"
                  : "  bg-panel-2 text-zinc-300 hover:bg-white/10"
              }`}
            >
              {option.label}
            </button>
          ))}

          <button
            type="button"
            onClick={loadUserTitles}
            className="ml-auto rounded-xl bg-panel-2 px-4 py-2 text-sm text-paper transition hover:bg-white/10"
          >
            Recargar
          </button>
        </div>

        {successMessage && (
          <div className="mb-6 rounded-xl bg-green-500/10 px-4 py-3 text-sm text-green-300">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        {isLoading && (
          <div className="rounded-xl bg-panel-2 px-4 py-3 text-sm text-zinc-300">
            Cargando tu lista...
          </div>
        )}

        {!isLoading && filteredItems.length === 0 && (
          <div className="rounded-xl bg-panel-2 px-4 py-3 text-sm text-zinc-400">
            No tenés títulos en esta vista.
          </div>
        )}

        {!isLoading && filteredItems.length > 0 && (
          <div className="grid gap-3">
            {filteredItems.map((item, index) => {
              const isSaving = !!savingMap[item.id];
              const isDeleting = !!deletingMap[item.id];
              const hasChanges = hasItemChanged(item);
              const isOpen = expandedId === item.id;
              const maxProgress =
                item.episodeCount || item.chapterCount || null;
              const progressPct = maxProgress
                ? Math.min(
                    100,
                    ((Number(item.progress) || 0) / maxProgress) * 100,
                  )
                : 0;
              const unit =
                item.chapterCount && !item.episodeCount ? "cap" : "ep";
              const hasScore =
                item.score !== null &&
                item.score !== undefined &&
                item.score !== "";

              return (
                <article
                  key={item.id}
                  style={{ "--i": Math.min(index, 9) }}
                  className="stagger-item rounded-2xl bg-panel p-3 sm:p-4"
                >
                  <div className="flex gap-4">
                    <img
                      src={item.posterImageUrl}
                      alt=""
                      loading="lazy"
                      className="h-28 w-[76px] shrink-0 rounded-xl bg-panel-2 object-cover sm:h-32 sm:w-[88px]"
                    />

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="line-clamp-2 text-base text-paper sm:text-lg">
                            {item.canonicalTitle}
                          </h2>
                          <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${getStatusBadgeClass(
                                item.status,
                              )}`}
                            >
                              {statusLabels[item.status] ?? "Sin definir"}
                            </span>
                            <span className="text-[13px] capitalize text-zinc-400">
                              {item.mediaType}
                            </span>
                            {hasChanges && (
                              <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[12px] font-semibold text-accent-soft">
                                Sin guardar
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          aria-pressed={!!item.isFavorite}
                          aria-label={
                            item.isFavorite
                              ? "Quitar de favoritos"
                              : "Marcar como favorito"
                          }
                          onClick={() =>
                            handleFieldChange(
                              item.id,
                              "isFavorite",
                              !item.isFavorite,
                            )
                          }
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-panel-2 transition-colors duration-200 hover:bg-white/10 active:scale-95"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className={`h-5 w-5 ${item.isFavorite ? "fill-accent stroke-accent" : "fill-none stroke-zinc-400"}`}
                            strokeWidth="2"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M12 20.5s-7.5-4.6-9.2-9.3C1.7 8 3.6 5 6.7 5c1.9 0 3.3 1 4.3 2.6h2C14 6 15.4 5 17.3 5c3.1 0 5 3 3.9 6.2-1.7 4.7-9.2 9.3-9.2 9.3z" />
                          </svg>
                        </button>
                      </div>

                      <div className="mt-auto pt-3">
                        <div className="flex items-baseline justify-between text-[13px] text-zinc-400">
                          <span>
                            {item.progress || 0}
                            {maxProgress ? ` / ${maxProgress}` : ""} {unit}
                          </span>
                          <span className="font-semibold text-paper">
                            {hasScore ? `${item.score} / 10` : "Sin puntaje"}
                          </span>
                        </div>
                        <div
                          className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-panel-2"
                          role="progressbar"
                          aria-valuemin={0}
                          aria-valuemax={maxProgress || 100}
                          aria-valuenow={Number(item.progress) || 0}
                          aria-label="Progreso"
                        >
                          <div
                            className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setExpandedId(isOpen ? null : item.id)}
                    className="mt-3 w-full rounded-xl bg-panel-2 py-2 text-sm font-semibold text-zinc-200 transition-colors duration-200 hover:bg-white/10"
                  >
                    {isOpen ? "Cerrar edición" : "Editar"}
                  </button>

                  {isOpen && (
                    <div className="fade-in mt-4">
                      <div className="grid gap-3 md:grid-cols-3">
                        <div>
                          <label className="mb-1 block text-sm text-zinc-400">
                            Estado
                          </label>
                          <select
                            value={item.status}
                            onChange={(event) =>
                              handleFieldChange(
                                item.id,
                                "status",
                                Number(event.target.value),
                              )
                            }
                            className="w-full rounded-xl bg-panel-2 px-3 py-2 text-sm text-paper"
                          >
                            {statusOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-1 block text-sm text-zinc-400">
                            Progreso
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={maxProgress || undefined}
                            value={item.progress ?? 0}
                            onChange={(event) => {
                              let nextValue = event.target.value;

                              if (nextValue === "") {
                                handleFieldChange(item.id, "progress", "");
                                return;
                              }

                              nextValue = Number(nextValue);

                              if (nextValue < 0) nextValue = 0;
                              if (maxProgress && nextValue > maxProgress) {
                                nextValue = maxProgress;
                              }

                              handleFieldChange(item.id, "progress", nextValue);
                            }}
                            className="w-full rounded-xl bg-panel-2 px-3 py-2 text-sm text-paper"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-sm text-zinc-400">
                            Puntaje (0 a 10)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="1"
                            value={item.score ?? ""}
                            onChange={(event) => {
                              let nextValue = event.target.value;

                              if (nextValue === "") {
                                handleFieldChange(item.id, "score", "");
                                return;
                              }

                              nextValue = Number(nextValue);

                              if (nextValue < 0) nextValue = 0;
                              if (nextValue > 10) nextValue = 10;

                              handleFieldChange(item.id, "score", nextValue);
                            }}
                            className="w-full rounded-xl bg-panel-2 px-3 py-2 text-sm text-paper"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="mb-1 block text-sm text-zinc-400">
                          Review
                        </label>
                        <textarea
                          rows={3}
                          value={item.notes ?? ""}
                          onChange={(event) =>
                            handleFieldChange(
                              item.id,
                              "notes",
                              event.target.value,
                            )
                          }
                          maxLength={2000}
                          placeholder="Escribí tu opinión sobre este título..."
                          className="w-full rounded-xl bg-panel-2 px-3 py-2 text-sm text-paper"
                        />
                        <p className="mt-1 text-[13px] text-zinc-400">
                          {(item.notes ?? "").length}/2000
                        </p>
                      </div>
                    </div>
                  )}

                  {(isOpen || hasChanges) && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handleSave(item)}
                        disabled={isSaving || isDeleting || !hasChanges}
                        className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-paper transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSaving
                          ? "Guardando..."
                          : hasChanges
                            ? "Guardar cambios"
                            : "Sin cambios"}
                      </button>

                      <button
                        type="button"
                        onClick={() => openDeleteModal(item.id)}
                        disabled={isDeleting || isSaving}
                        className="rounded-xl bg-panel-2 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-accent-soft disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isDeleting ? "Eliminando..." : "Eliminar"}
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Eliminar título"
        message="¿Seguro que querés eliminar este título de tu lista?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteModal}
        isLoading={!!deletingMap[confirmModal.id]}
      />
    </>
  );
};

const getStatusBadgeClass = (status) => {
  switch (Number(status)) {
    case USER_TITLE_STATUS.WATCHING:
      return "bg-accent text-paper";
    case USER_TITLE_STATUS.COMPLETED:
      return "bg-paper text-ground";
    case USER_TITLE_STATUS.ON_HOLD:
      return "bg-white/15 text-paper";
    case USER_TITLE_STATUS.DROPPED:
      return "bg-panel-2 text-zinc-400 line-through";
    default:
      return "bg-panel-2 text-zinc-300";
  }
};

export default MyList;
