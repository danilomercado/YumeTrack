import React, { useEffect, useState } from "react";
import SearchBar from "../../components/SearchBar/SearchBar";
import TitleCard from "../../components/TitleCard/TitleCard";
import TitleDetailModal from "../../components/TitleDetailModal/TitleDetailModal";
import {
  getTitleDetailRequest,
  searchTitlesRequest,
} from "../../services/searchService";

const Search = () => {
  const [query, setQuery] = useState("");
  const [titles, setTitles] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
        setTitles(data);
      } catch (error) {
        const backendMessage =
          error.response?.data?.message ||
          error.response?.data ||
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

  const handleOpenDetail = async (item) => {
    try {
      setIsDetailLoading(true);
      const detail = await getTitleDetailRequest(item.id);
      setSelectedTitle(detail);
    } catch (error) {
      console.error("Error al obtener detalle:", error);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedTitle(null);
  };

  const handleAddToList = (item) => {
    console.log("Agregar a lista:", item);
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
              buttonText="Agregar"
              onCardClick={() => handleOpenDetail(item)}
              onClickButton={() => handleAddToList(item)}
            />
          ))}
        </div>
      )}

      {isDetailLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="rounded-2xl border border-white/10 bg-zinc-900 px-6 py-4 text-white">
            Cargando detalle...
          </div>
        </div>
      )}

      <TitleDetailModal
        title={selectedTitle}
        onClose={handleCloseDetail}
        onAdd={handleAddToList}
      />
    </main>
  );
};

export default Search;
