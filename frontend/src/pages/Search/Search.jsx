import React, { useEffect, useState } from "react";
import SearchBar from "../../components/SearchBar/SearchBar";
import TitleCard from "../../components/TitleCard/TitleCard";
import TitleDetailModal from "../../components/TitleDetailModal/TitleDetailModal";
import {
  searchTitlesRequest,
  getTitleDetailRequest,
} from "../../services/searchService";
import {
  createUserTitleRequest,
  USER_TITLE_STATUS,
} from "../../services/userTitleService";

const Search = () => {
  const [query, setQuery] = useState("");
  const [titles, setTitles] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [addingMap, setAddingMap] = useState({});

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setTitles([]);
      setErrorMessage("");
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await searchTitlesRequest(trimmedQuery);
        setTitles(Array.isArray(data) ? data : []);
      } catch (error) {
        const backendMessage =
          error.response?.data?.message ||
          error.response?.data ||
          error.message ||
          "No se pudo realizar la búsqueda.";

        setErrorMessage(
          typeof backendMessage === "string"
            ? backendMessage
            : "No se pudo realizar la búsqueda.",
        );

        setTitles([]);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    if (!successMessage && !errorMessage) return;

    const timeoutId = setTimeout(() => {
      setSuccessMessage("");
      setErrorMessage("");
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [successMessage, errorMessage]);

  const handleOpenDetail = async (item) => {
    try {
      setIsDetailLoading(true);
      setErrorMessage("");
      const detail = await getTitleDetailRequest(item.id);
      setSelectedTitle(detail);
    } catch (error) {
      console.error("Error al obtener detalle:", error);
      setErrorMessage("No se pudo cargar el detalle del título.");
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedTitle(null);
  };

  const handleAddToList = async (item, options = {}) => {
    const kitsuId = Number(item?.id);

    if (!kitsuId) {
      setErrorMessage("No se pudo obtener el id del título.");
      return;
    }

    try {
      setErrorMessage("");
      setSuccessMessage("");

      setAddingMap((prev) => ({
        ...prev,
        [kitsuId]: true,
      }));

      const response = await createUserTitleRequest({
        kitsuId,
        status: options.status ?? USER_TITLE_STATUS.PLANNED,
        isFavorite: options.isFavorite ?? false,
      });

      setSuccessMessage(response?.message || "Título agregado correctamente.");
    } catch (error) {
      const message =
        error.message || "No se pudo agregar el título a tu lista.";

      if (
        message.toLowerCase().includes("already") ||
        message.toLowerCase().includes("existe") ||
        message.toLowerCase().includes("duplic")
      ) {
        setErrorMessage("Ese título ya está en tu lista.");
      } else {
        setErrorMessage(message);
      }
    } finally {
      setAddingMap((prev) => ({
        ...prev,
        [kitsuId]: false,
      }));
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.25em] text-violet-300">
          Explorar
        </p>
        <h1 className="mt-2 text-4xl font-black">Buscar anime o manga</h1>
        <p className="mt-3 text-zinc-400">
          Encontrá títulos y agregalos a tu lista.
        </p>
      </div>

      <SearchBar
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      {successMessage && (
        <div className="mt-6 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {errorMessage}
        </div>
      )}

      {isLoading && (
        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
          Buscando títulos...
        </div>
      )}

      {!isLoading && !errorMessage && query.trim() && titles.length === 0 && (
        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-400">
          No se encontraron resultados.
        </div>
      )}

      {!query.trim() && (
        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-400">
          Escribí el nombre de un anime o manga para buscar.
        </div>
      )}

      {titles.length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {titles.map((item) => (
            <TitleCard
              key={item.id}
              title={item.title}
              image={item.posterImage}
              buttonText={
                addingMap[Number(item.id)] ? "Agregando..." : "Agregar"
              }
              onCardClick={() => handleOpenDetail(item)}
              onClickButton={() => handleAddToList(item)}
              buttonDisabled={!!addingMap[Number(item.id)]}
            />
          ))}
        </div>
      )}

      <TitleDetailModal
        title={selectedTitle}
        isLoading={isDetailLoading}
        onClose={handleCloseDetail}
        onAdd={handleAddToList}
        isAdding={!!addingMap[Number(selectedTitle?.id)]}
      />
    </main>
  );
};

export default Search;
