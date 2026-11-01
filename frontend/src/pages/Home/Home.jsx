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
import TitleGridSkeleton from "../../components/TitleGridSkeleton/TitleGridSkeleton";
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
        const res = await getGlobalFeedRequest({ page: 1, pageSize: 3 });
        const payload = res?.data;

        const items = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.items)
            ? payload.items
            : [];

        setFeedPreview(items.slice(0, 3));
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
    <main className="min-h-screen bg-ground text-paper">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-14">
          <div className="relative grid overflow-hidden rounded-lg bg-panel lg:grid-cols-[1.15fr_1fr]">
            <div className="relative z-10 flex flex-col justify-center px-6 py-12 sm:px-10 lg:py-20">
              <h1 className="text-4xl leading-[1.1] text-paper sm:text-6xl">
                Tu anime y manga, al día.
              </h1>

              <p className="mt-6 max-w-md text-base leading-relaxed text-zinc-300 sm:text-lg">
                Descubrí títulos, llevá tu progreso al día y compartí reseñas
                con otros fans.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/catalog")}
                  className="rounded-md bg-accent px-6 py-3 text-sm font-bold text-paper transition hover:bg-accent-hover active:translate-y-px"
                >
                  Explorar catálogo
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/search")}
                  className="rounded-md bg-panel-2 px-6 py-3 text-sm font-bold text-paper transition hover:bg-white/10 active:translate-y-px"
                >
                  Buscar títulos
                </button>
              </div>
            </div>

            <div
              aria-hidden="true"
              className="relative hidden min-h-[460px] overflow-hidden bg-accent lg:block"
            >
              <span className="absolute -right-6 -top-10 kanji select-none text-[22rem] leading-none text-ground/20">
                夢
              </span>

              <img
                src="/characters/gon.webp"
                alt=""
                loading="lazy"
                decoding="async"
                className="rise-in absolute bottom-0 left-4 h-[88%] object-contain object-bottom"
              />
              <img
                src="/characters/narutito.webp"
                alt=""
                loading="lazy"
                decoding="async"
                className="rise-in absolute bottom-0 right-4 h-[78%] object-contain object-bottom [animation-delay:120ms]"
              />
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
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-lg bg-panel p-4"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white/10" />
                    <div className="space-y-2">
                      <div className="h-4 w-24 rounded bg-white/10" />
                      <div className="h-3 w-16 rounded bg-white/10" />
                    </div>
                  </div>
                  <div className="h-20 w-full rounded bg-white/10" />
                </div>
              ))}
            </div>
          ) : feedPreview.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {feedPreview.map((item) => (
                <FeedCard key={item.userTitleId} item={item} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-panel p-5 text-sm text-zinc-400">
              Todavía no hay actividad para mostrar.
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
            <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-300">
              {animeError}
            </div>
          ) : (
            <TitleGrid
              titles={trendingAnime}
              onSelectTitle={handleSelectTitle}
            />
          )}
        </section>

        <section className="mt-12 space-y-4 pt-8">
          <SectionHeader
            title="Trending Manga"
            subtitle="Los mangas más populares del momento."
          />

          {isLoadingManga ? (
            <TitleGridSkeleton count={10} />
          ) : mangaError ? (
            <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-300">
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
