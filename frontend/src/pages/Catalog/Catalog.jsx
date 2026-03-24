import { useEffect, useMemo, useState } from "react";
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
import {
  getGlobalFeedRequest,
  getFollowingFeedRequest,
} from "../../services/feedService";
import TitleGridSkeleton from "../../components/TitleGridSkeleton/TitleGirdSkeleton";
import FeedCard from "../../components/FeedCard/FeedCard";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 20;

const TAB_CONFIG = {
  anime: {
    heroSubtitle: "Explorá títulos populares de anime y descubrí algo nuevo.",
    sectionTitle: "Catálogo Anime",
    sectionSubtitle: "Listado paginado desde Kitsu pasando por tu backend.",
    emptyMessage: "No hay títulos de anime para mostrar.",
    loadError: "No se pudo cargar el catálogo de anime.",
  },
  manga: {
    heroSubtitle: "Explorá mangas populares y agregalos a tu lista.",
    sectionTitle: "Catálogo Manga",
    sectionSubtitle: "Listado paginado desde Kitsu pasando por tu backend.",
    emptyMessage: "No hay mangas para mostrar.",
    loadError: "No se pudo cargar el catálogo de manga.",
  },
  global: {
    heroSubtitle: "Reseñas recientes de toda la comunidad.",
    sectionTitle: "Feed global",
    sectionSubtitle:
      "Opiniones, scores y reviews públicas de todos los usuarios.",
    emptyMessage: "Todavía no hay reseñas públicas para mostrar.",
    loadError: "No se pudo cargar el feed global.",
  },
  following: {
    heroSubtitle: "Lo último de la gente que seguís.",
    sectionTitle: "Siguiendo",
    sectionSubtitle: "Reseñas recientes de usuarios que seguís.",
    emptyMessage: "Todavía no hay reseñas de usuarios que seguís.",
    loadError: "No se pudo cargar el feed de seguidos.",
  },
};

const Catalog = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("anime");

  const [titles, setTitles] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [feedItems, setFeedItems] = useState([]);

  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const [selectedTitle, setSelectedTitle] = useState(null);
  const [titleDetail, setTitleDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const isCatalogTab = activeTab === "anime" || activeTab === "manga";
  const isFeedTab = activeTab === "global" || activeTab === "following";

  const currentTabConfig = useMemo(() => {
    return TAB_CONFIG[activeTab];
  }, [activeTab]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoadingInitial(true);
        setError("");

        if (isCatalogTab) {
          setTitles([]);
          setOffset(0);
          setHasMore(true);
          setFeedItems([]);

          const data =
            activeTab === "manga"
              ? await getCatalogMangaRequest(PAGE_SIZE, 0)
              : await getCatalogTitlesRequest(PAGE_SIZE, 0);

          setTitles(data);
          setOffset(data.length);
          setHasMore(data.length >= PAGE_SIZE);
          return;
        }

        if (isFeedTab) {
          setFeedItems([]);
          setTitles([]);
          setOffset(0);
          setHasMore(false);

          if (activeTab === "following" && !isAuthenticated) {
            setFeedItems([]);
            return;
          }

          const response =
            activeTab === "global"
              ? await getGlobalFeedRequest()
              : await getFollowingFeedRequest();

          const data = response?.data ?? [];
          setFeedItems(data);
        }
      } catch (err) {
        console.error("Error cargando vista de catálogo/feed:", err);
        setError(currentTabConfig.loadError);
      } finally {
        setIsLoadingInitial(false);
      }
    };

    fetchInitialData();
  }, [
    activeTab,
    isAuthenticated,
    isCatalogTab,
    isFeedTab,
    currentTabConfig.loadError,
  ]);

  const handleLoadMore = async () => {
    if (!isCatalogTab) return;

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

  const renderTabButton = (tabKey, label) => {
    const isActive = activeTab === tabKey;

    return (
      <button
        type="button"
        onClick={() => setActiveTab(tabKey)}
        className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
          isActive
            ? "bg-violet-600 text-white shadow-lg shadow-violet-900/30"
            : "border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8">
          <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6">
            <p className="mb-2 text-sm uppercase tracking-[0.2em] text-violet-400">
              Descubrir
            </p>

            <h1 className="text-3xl font-bold sm:text-4xl">
              Anime, manga y comunidad
            </h1>

            <p className="mt-3 max-w-2xl text-sm text-zinc-400 sm:text-base">
              {currentTabConfig.heroSubtitle}
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeader
            title={currentTabConfig.sectionTitle}
            subtitle={currentTabConfig.sectionSubtitle}
          />

          <div className="flex flex-wrap gap-3">
            {renderTabButton("anime", "Anime")}
            {renderTabButton("manga", "Manga")}
            {renderTabButton("global", "Feed global")}
            {renderTabButton("following", "Siguiendo")}
          </div>

          {isLoadingInitial ? (
            isCatalogTab ? (
              <TitleGridSkeleton count={10} />
            ) : (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse rounded-2xl border border-white/10 bg-zinc-900/60 p-4"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-white/10" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 rounded bg-white/10" />
                        <div className="h-3 w-20 rounded bg-white/10" />
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="h-24 w-16 rounded bg-white/10" />
                      <div className="flex-1 space-y-3">
                        <div className="h-4 w-40 rounded bg-white/10" />
                        <div className="h-3 w-16 rounded bg-white/10" />
                        <div className="h-3 w-full rounded bg-white/10" />
                        <div className="h-3 w-11/12 rounded bg-white/10" />
                        <div className="h-3 w-8/12 rounded bg-white/10" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : error ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          ) : isCatalogTab ? (
            <>
              {titles.length > 0 ? (
                <TitleGrid titles={titles} onSelectTitle={handleSelectTitle} />
              ) : (
                <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 text-sm text-zinc-400">
                  {currentTabConfig.emptyMessage}
                </div>
              )}

              {hasMore && titles.length > 0 ? (
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
              ) : titles.length > 0 ? (
                <p className="pt-4 text-center text-sm text-zinc-500">
                  No hay más títulos para cargar.
                </p>
              ) : null}
            </>
          ) : activeTab === "following" && !isAuthenticated ? (
            <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 text-center">
              <p className="text-sm text-zinc-300">
                Iniciá sesión para ver el feed de usuarios que seguís.
              </p>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="mt-4 rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-500"
              >
                Ir a login
              </button>
            </div>
          ) : feedItems.length > 0 ? (
            <div className="mx-auto flex max-w-3xl flex-col gap-4">
              {feedItems.map((item) => (
                <FeedCard key={item.userTitleId} item={item} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 text-sm text-zinc-400">
              {currentTabConfig.emptyMessage}
            </div>
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
