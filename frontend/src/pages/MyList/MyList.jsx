import React, { useEffect, useMemo, useState } from "react";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import {
  deleteUserTitleRequest,
  getUserTitlesRequest,
  updateUserTitleRequest,
  USER_TITLE_STATUS,
} from "../../services/userTitleService";

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

const getStatusBadgeClass = (status) => {
  switch (Number(status)) {
    case USER_TITLE_STATUS.PLANNED:
      return "bg-zinc-700/70 text-zinc-200";
    case USER_TITLE_STATUS.WATCHING:
      return "bg-blue-500/20 text-blue-300";
    case USER_TITLE_STATUS.COMPLETED:
      return "bg-green-500/20 text-green-300";
    case USER_TITLE_STATUS.ON_HOLD:
      return "bg-yellow-500/20 text-yellow-300";
    case USER_TITLE_STATUS.DROPPED:
      return "bg-red-500/20 text-red-300";
    default:
      return "bg-zinc-700/70 text-zinc-200";
  }
};

const normalizeItemForCompare = (item) => ({
  id: item.id,
  status: Number(item.status),
  progress: Number(item.progress ?? 0),
  score: item.score === "" || item.score === null ? null : Number(item.score),
  isFavorite: Boolean(item.isFavorite),
});

const MyList = () => {
  const [items, setItems] = useState([]);
  const [originalItems, setOriginalItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [savingMap, setSavingMap] = useState({});
  const [deletingMap, setDeletingMap] = useState({});
  const [statusFilter, setStatusFilter] = useState("all");
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
      currentNormalized.isFavorite !== originalNormalized.isFavorite
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
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.25em] text-violet-300">
            Biblioteca
          </p>
          <h1 className="mt-2 text-4xl font-black">Mi Lista</h1>
          <p className="mt-3 text-zinc-400">
            Gestioná tus animes y mangas guardados.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              statusFilter === "all"
                ? "bg-violet-600 text-white"
                : "border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
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
                  ? "bg-violet-600 text-white"
                  : "border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
              }`}
            >
              {option.label}
            </button>
          ))}

          <button
            type="button"
            onClick={loadUserTitles}
            className="ml-auto rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
          >
            Recargar
          </button>
        </div>

        {successMessage && (
          <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        {isLoading && (
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
            Cargando tu lista...
          </div>
        )}

        {!isLoading && filteredItems.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-400">
            No tenés títulos en esta vista.
          </div>
        )}

        {!isLoading && filteredItems.length > 0 && (
          <div className="grid gap-4">
            {filteredItems.map((item) => {
              const isSaving = !!savingMap[item.id];
              const isDeleting = !!deletingMap[item.id];
              const hasChanges = hasItemChanged(item);
              const maxProgress =
                item.episodeCount || item.chapterCount || null;

              return (
                <article
                  key={item.id}
                  className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[120px_1fr]"
                >
                  <div>
                    <img
                      src={item.posterImageUrl}
                      alt={item.canonicalTitle}
                      className="h-40 w-full rounded-xl object-cover md:h-full"
                    />
                  </div>

                  <div>
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          {item.canonicalTitle}
                        </h2>

                        {hasChanges && (
                          <span className="mt-2 inline-block rounded-full bg-orange-500/20 px-2 py-1 text-xs font-semibold text-orange-300">
                            Cambios sin guardar
                          </span>
                        )}

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="text-sm text-zinc-400">
                            {item.mediaType}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                              item.status,
                            )}`}
                          >
                            {statusLabels[item.status] ?? "Sin definir"}
                          </span>
                        </div>
                      </div>

                      <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
                        <input
                          type="checkbox"
                          checked={item.isFavorite}
                          onChange={(event) =>
                            handleFieldChange(
                              item.id,
                              "isFavorite",
                              event.target.checked,
                            )
                          }
                          className="h-4 w-4 rounded border-white/20 bg-zinc-900 text-violet-600 focus:ring-violet-500"
                        />
                        Favorito
                      </label>
                    </div>

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
                          className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white outline-none"
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
                          className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white outline-none"
                        />

                        <p className="mt-1 text-xs text-zinc-500">
                          {item.episodeCount
                            ? `Total episodios: ${item.episodeCount}`
                            : item.chapterCount
                              ? `Total capítulos: ${item.chapterCount}`
                              : "Total no disponible"}
                        </p>
                      </div>

                      <div>
                        <label className="mb-1 block text-sm text-zinc-400">
                          Score
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
                          className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white outline-none"
                        />

                        <p className="mt-1 text-xs text-zinc-500">
                          Puntaje de 0 a 10
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handleSave(item)}
                        disabled={isSaving || isDeleting || !hasChanges}
                        className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
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
                        className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isDeleting ? "Eliminando..." : "Eliminar"}
                      </button>
                    </div>
                  </div>
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

export default MyList;
