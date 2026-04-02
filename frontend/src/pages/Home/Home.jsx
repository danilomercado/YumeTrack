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
import { getGlobalFeedRequest } from "../../services/feedService";
import FeedCard from "../../components/FeedCard/FeedCard";

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
  const [feedPreview, setFeedPreview] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);

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

  useEffect(() => {
    const loadFeed = async () => {
      try {
        const res = await getGlobalFeedRequest();
        setFeedPreview(res.data.slice(0, 3));
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingFeed(false);
      }
    };

    loadFeed();
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
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] sm:p-8">
            {/* Glow decorativo izquierda */}
            <div className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />

            {/* Glow decorativo derecha */}
            <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-pink-500/10 blur-3xl" />

            {/* Personaje izquierda */}
            <img
              src="/characters/gon.png"
              alt="Personaje anime izquierda"
              className="pointer-events-none absolute left-0 -bottom-20 hidden h-[380px] object-contain opacity-70 drop-shadow-[0_0_30px_rgba(168,85,247,0.25)] animate-float lg:block xl:h-[430px]"
            />

            {/* Personaje derecha */}
            <img
              src="/characters/narutito.png"
              alt="Personaje anime derecha"
              className="pointer-events-none absolute right-6 -bottom-20 hidden h-[380px] object-contain opacity-70 drop-shadow-[0_0_30px_rgba(236,72,153,0.18)] animate-float lg:block xl:h-[430px]"
            />

            {/* Contenido hero */}
            <div className="relative z-10 mx-auto max-w-4xl text-center lg:text-left">
              <p className="mb-2 text-sm uppercase tracking-[0.2em] text-violet-400">
                YumeTrack
              </p>

              <h1 className="max-w-4xl text-3xl font-bold leading-tight sm:text-5xl">
                Descubrí anime y manga, guardá tus títulos y seguí tu progreso.
              </h1>

              <p className="mt-4 max-w-2xl text-sm text-zinc-400 sm:text-base">
                Explorá títulos populares, mirá detalles y armá tu lista
                personal.
              </p>

              <div className="mt-6 flex flex-wrap gap-3 justify-center lg:justify-start">
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
          </div>
        </section>

        <section className="mb-12 space-y-4">
          <SectionHeader
            title="Actividad de la comunidad"
            subtitle="Últimas reseñas de usuarios"
            actionLabel="Ver feed"
            onAction={() => navigate("/feed")}
          />

          {loadingFeed ? (
            <p>Cargando...</p>
          ) : (
            <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2">
              {feedPreview.map((item) => (
                <FeedCard key={item.userTitleId} item={item} />
              ))}
            </div>
          )}
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
