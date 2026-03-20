import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SectionHeader from "../../components/SectionHeader/SectionHeader";
import TitleGrid from "../../components/TitleGrid/TitleGrid";
import TitleDetailModal from "../../components/TitleDetailModal/TitleDetailModal";
import {
  getTrendingMangaRequest,
  getTrendingTitlesRequest,
  getTitleDetailRequest,
} from "../../services/titleService";
import {
  createUserTitleRequest,
  USER_TITLE_STATUS,
} from "../../services/userTitleService";
import TitleGridSkeleton from "../../components/TitleGridSkeleton/TitleGirdSkeleton";
import { useAuth } from "../../context/AuthContext";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [trendingAnime, setTrendingAnime] = useState([]);
  const [trendingManga, setTrendingManga] = useState([]);

  const [isLoadingAnime, setIsLoadingAnime] = useState(true);
  const [isLoadingManga, setIsLoadingManga] = useState(true);

  const [animeError, setAnimeError] = useState("");
  const [mangaError, setMangaError] = useState("");

  const [selectedTitle, setSelectedTitle] = useState(null);
  const [titleDetail, setTitleDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    const fetchTrendingAnime = async () => {
      try {
        setIsLoadingAnime(true);
        setAnimeError("");

        const data = await getTrendingTitlesRequest(10);
        setTrendingAnime(data);
      } catch (error) {
        console.error("Error cargando trending anime:", error);
        setAnimeError("No se pudieron cargar los animes.");
      } finally {
        setIsLoadingAnime(false);
      }
    };

    const fetchTrendingManga = async () => {
      try {
        setIsLoadingManga(true);
        setMangaError("");

        const data = await getTrendingMangaRequest(10);
        setTrendingManga(data);
      } catch (error) {
        console.error("Error cargando trending manga:", error);
        setMangaError("No se pudieron cargar los mangas.");
      } finally {
        setIsLoadingManga(false);
      }
    };

    fetchTrendingAnime();
    fetchTrendingManga();
  }, []);

  const handleSelectTitle = async (title) => {
    try {
      setSelectedTitle(title);
      setTitleDetail(null);
      setIsLoadingDetail(true);

      const detail = await getTitleDetailRequest(title.id, title.mediaType);
      setTitleDetail(detail);
    } catch (error) {
      console.error("Error cargando detalle:", error);
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
        <section className="mb-10">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] sm:p-8">
            <p className="mb-2 text-sm uppercase tracking-[0.2em] text-violet-400">
              YumeTrack
            </p>

            <h1 className="max-w-4xl text-3xl font-bold leading-tight sm:text-5xl">
              Descubrí anime y manga, guardá tus títulos y seguí tu progreso.
            </h1>

            <p className="mt-4 max-w-2xl text-sm text-zinc-400 sm:text-base">
              Explorá títulos populares, mirá detalles y armá tu lista personal.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("/catalog")}
                className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-500"
              >
                Explorar catálogo
              </button>

              <button
                type="button"
                onClick={() => navigate("/search")}
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Buscar títulos
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeader
            title="Trending Anime"
            subtitle="Los animes más populares para arrancar."
            actionLabel="Ver catálogo"
            onAction={() => navigate("/catalog")}
          />

          {isLoadingAnime ? (
            <TitleGridSkeleton count={10} />
          ) : animeError ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              {animeError}
            </div>
          ) : (
            <TitleGrid
              titles={trendingAnime}
              onSelectTitle={handleSelectTitle}
            />
          )}
        </section>

        <section className="mt-12 space-y-4 border-t border-white/5 pt-8">
          <SectionHeader
            title="Trending Manga"
            subtitle="Los mangas más populares del momento."
          />

          {isLoadingManga ? (
            <TitleGridSkeleton count={10} />
          ) : mangaError ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              {mangaError}
            </div>
          ) : (
            <TitleGrid
              titles={trendingManga}
              onSelectTitle={handleSelectTitle}
            />
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

export default Home;
