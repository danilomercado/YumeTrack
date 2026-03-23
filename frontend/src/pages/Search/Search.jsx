import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "../../components/SearchBar/SearchBar";
import TitleGrid from "../../components/TitleGrid/TitleGrid";
import TitleDetailModal from "../../components/TitleDetailModal/TitleDetailModal";
import {
  searchTitlesRequest,
  getTitleDetailRequest,
} from "../../services/searchService";
import {
  createUserTitleRequest,
  USER_TITLE_STATUS,
} from "../../services/userTitleService";
import { useAuth } from "../../context/AuthContext";
import { searchUsersRequest } from "../../services/publicService";

const Search = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [titles, setTitles] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState(null);
  const [titleDetail, setTitleDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [addingMap, setAddingMap] = useState({});

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setTitles([]);
      setUsers([]);
      setErrorMessage("");
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const [titlesData, usersData] = await Promise.all([
          searchTitlesRequest(trimmedQuery),
          searchUsersRequest(trimmedQuery),
        ]);

        setTitles(Array.isArray(titlesData) ? titlesData : []);
        setUsers(Array.isArray(usersData) ? usersData : []);
      } catch (error) {
        const backendMessage =
          error.message || "No se pudo realizar la búsqueda.";

        setErrorMessage(
          typeof backendMessage === "string"
            ? backendMessage
            : "No se pudo realizar la búsqueda.",
        );

        setTitles([]);
        setUsers([]);
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
      setSelectedTitle(item);
      setTitleDetail(null);
      setIsDetailLoading(true);
      setErrorMessage("");

      const detail = await getTitleDetailRequest(item.id, item.mediaType);
      setTitleDetail(detail);
    } catch (error) {
      console.error("Error al obtener detalle:", error);
      setErrorMessage("No se pudo cargar el detalle del título.");
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedTitle(null);
    setTitleDetail(null);
  };

  const handleAddToList = async (item, options = {}) => {
    const kitsuId = Number(item?.id);

    if (!kitsuId) {
      throw new Error("No se pudo obtener el id del título.");
    }

    if (!isAuthenticated) {
      navigate("/login");
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
        mediaType: item.mediaType?.toLowerCase() || "anime",
        status: options.status ?? USER_TITLE_STATUS.PLANNED,
        isFavorite: options.isFavorite ?? false,
      });

      setSuccessMessage(response?.message || "Título agregado correctamente.");
      return response;
    } catch (error) {
      const message =
        error.message || "No se pudo agregar el título a tu lista.";

      if (
        message.toLowerCase().includes("already") ||
        message.toLowerCase().includes("existe") ||
        message.toLowerCase().includes("duplic")
      ) {
        setErrorMessage("Ese título ya está en tu lista.");
        throw new Error("Ese título ya está en tu lista.");
      } else {
        setErrorMessage(message);
        throw new Error(message);
      }
    } finally {
      setAddingMap((prev) => ({
        ...prev,
        [kitsuId]: false,
      }));
    }
  };

  const showEmptyState =
    !isLoading &&
    !errorMessage &&
    query.trim() &&
    titles.length === 0 &&
    users.length === 0;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.25em] text-violet-300">
          Explorar
        </p>
        <h1 className="mt-2 text-4xl font-black">
          Buscar anime, manga o usuarios
        </h1>
        <p className="mt-3 text-zinc-400">
          Encontrá personas y títulos para descubrir más dentro de YumeTrack.
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
          Buscando usuarios y títulos...
        </div>
      )}

      {showEmptyState && (
        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-400">
          No se encontraron resultados.
        </div>
      )}

      {!query.trim() && (
        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-400">
          Escribí el nombre de un anime, manga o usuario para buscar.
        </div>
      )}

      {users.length > 0 && (
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Usuarios</h2>
            <span className="text-sm text-zinc-400">
              {users.length} resultados
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {users.map((user) => (
              <Link
                key={user.userName}
                to={`/profile/${user.userName}`}
                className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4 transition hover:-translate-y-1 hover:border-violet-500/40"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-pink-500 text-lg font-bold text-white">
                    {user.userName?.charAt(0)?.toUpperCase() || "U"}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">
                      {user.userName}
                    </p>
                    <p className="text-sm text-zinc-400">
                      {user.totalTitles} títulos en su lista
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {titles.length > 0 && (
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Anime y manga</h2>
            <span className="text-sm text-zinc-400">
              {titles.length} resultados
            </span>
          </div>

          <TitleGrid titles={titles} onSelectTitle={handleOpenDetail} />
        </section>
      )}

      <TitleDetailModal
        isOpen={!!selectedTitle}
        title={titleDetail || selectedTitle}
        isLoading={isDetailLoading}
        onClose={handleCloseDetail}
        onAdd={handleAddToList}
        isAdding={!!addingMap[Number((titleDetail || selectedTitle)?.id)]}
      />
    </main>
  );
};

export default Search;
