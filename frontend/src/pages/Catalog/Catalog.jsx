import { useEffect, useState } from "react";
import SectionHeader from "../../components/SectionHeader/SectionHeader";
import TitleGrid from "../../components/TitleGrid/TitleGrid";
import TitleDetailModal from "../../components/TitleDetailModal/TitleDetailModal";
import {
  getCatalogTitlesRequest,
  getCatalogMangaRequest,
  getTitleDetailRequest,
} from "../../services/titleService";
import {
  createUserTitleRequest,
  USER_TITLE_STATUS,
} from "../../services/userTitleService";
import TitleGridSkeleton from "../../components/TitleGridSkeleton/TitleGirdSkeleton";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 20;

const Catalog = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("anime");
  const [titles, setTitles] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const [selectedTitle, setSelectedTitle] = useState(null);
  const [titleDetail, setTitleDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setIsLoadingInitial(true);
        setError("");
        setTitles([]);
        setOffset(0);
        setHasMore(true);

        const data =
          activeTab === "manga"
            ? await getCatalogMangaRequest(PAGE_SIZE, 0)
            : await getCatalogTitlesRequest(PAGE_SIZE, 0);

        setTitles(data);
        setOffset(data.length);

        if (data.length < PAGE_SIZE) {
          setHasMore(false);
        }
      } catch (err) {
        console.error("Error cargando catálogo:", err);
        setError(
          activeTab === "manga"
            ? "No se pudo cargar el catálogo de manga."
            : "No se pudo cargar el catálogo de anime.",
        );
      } finally {
        setIsLoadingInitial(false);
      }
    };

    fetchCatalog();
  }, [activeTab]);

  const handleLoadMore = async () => {
    try {
      setIsLoadingMore(true);
      setError("");

      const data =
        activeTab === "manga"
          ? await getCatalogMangaRequest(PAGE_SIZE, offset)
          : await getCatalogTitlesRequest(PAGE_SIZE, offset);

      setTitles((prev) => [...prev, ...data]);
      setOffset((prev) => prev + data.length);

      if (data.length < PAGE_SIZE) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error cargando más títulos:", err);
      setError("No se pudieron cargar más títulos.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleSelectTitle = async (title) => {
    try {
      setSelectedTitle(title);
      setTitleDetail(null);
      setIsLoadingDetail(true);

      const detail = await getTitleDetailRequest(title.id, title.mediaType);
      setTitleDetail(detail);
    } catch (err) {
      console.error("Error cargando detalle:", err);
      setTitleDetail(null);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedTitle(null);
    setTitleDetail(null);
  };

  const handleAddToList = async (title) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    await createUserTitleRequest({
      kitsuId: title.id,
      mediaType: title.mediaType?.toLowerCase() || "anime",
      status: USER_TITLE_STATUS.PLANNED,
      isFavorite: false,
    });
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8">
          <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6">
            <p className="mb-2 text-sm uppercase tracking-[0.2em] text-violet-400">
              Catálogo
            </p>
            <h1 className="text-3xl font-bold sm:text-4xl">
              Explorá anime y manga
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-zinc-400 sm:text-base">
              Elegí el tipo de contenido y descubrí títulos populares.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeader
            title={activeTab === "manga" ? "Catálogo Manga" : "Catálogo Anime"}
            subtitle="Listado paginado desde Kitsu pasando por tu backend."
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setActiveTab("anime")}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                activeTab === "anime"
                  ? "bg-violet-600 text-white"
                  : "border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
              }`}
            >
              Anime
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("manga")}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                activeTab === "manga"
                  ? "bg-violet-600 text-white"
                  : "border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
              }`}
            >
              Manga
            </button>
          </div>

          {isLoadingInitial ? (
            <TitleGridSkeleton count={10} />
          ) : error && titles.length === 0 ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          ) : (
            <>
              <TitleGrid titles={titles} onSelectTitle={handleSelectTitle} />

              {error && titles.length > 0 && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                  {error}
                </div>
              )}

              {hasMore ? (
                <div className="flex justify-center pt-4">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoadingMore ? "Cargando..." : "Cargar más"}
                  </button>
                </div>
              ) : (
                <p className="pt-4 text-center text-sm text-zinc-500">
                  No hay más títulos para cargar.
                </p>
              )}
            </>
          )}
        </section>
      </div>

      <TitleDetailModal
        isOpen={!!selectedTitle}
        onClose={handleCloseModal}
        title={titleDetail || selectedTitle}
        isLoading={isLoadingDetail}
        onAdd={handleAddToList}
      />
    </main>
  );
};

export default Catalog;
