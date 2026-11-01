import { useEffect, useState } from "react";
import PageBanner from "../../components/PageBanner/PageBanner";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getGlobalFeedRequest,
  getFollowingFeedRequest,
} from "../../services/feedService";
import FeedCard from "../../components/FeedCard/FeedCard";
import ActivityCard from "../../components/ActivityCard/ActivityCard";
import SuggestedUsers from "../../components/SuggestedUsers/SuggestedUsers";
import { getActivityRequest } from "../../services/socialService";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const PAGE_SIZE = 10;

const Feed = () => {
  useDocumentTitle("Feed");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("global");
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const fetchFeed = async ({ selectedTab, nextPage = 1, append = false }) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      setError("");

      if (
        (selectedTab === "following" || selectedTab === "activity") &&
        !isAuthenticated
      ) {
        setItems([]);
        setHasMore(false);
        return;
      }

      if (selectedTab === "activity") {
        const data = await getActivityRequest({
          page: nextPage,
          pageSize: PAGE_SIZE,
        });

        setItems((prev) =>
          append ? [...prev, ...(data.items ?? [])] : (data.items ?? []),
        );
        setHasMore(Boolean(data.hasMore));
        setPage(nextPage);
        return;
      }

      const response =
        selectedTab === "global"
          ? await getGlobalFeedRequest({
              page: nextPage,
              pageSize: PAGE_SIZE,
            })
          : await getFollowingFeedRequest({
              page: nextPage,
              pageSize: PAGE_SIZE,
            });

      const payload = response?.data;

      // Soporta backend paginado: { items, hasMore }
      if (payload && Array.isArray(payload.items)) {
        const newItems = payload.items;

        setItems((prev) => (append ? [...prev, ...newItems] : newItems));
        setHasMore(Boolean(payload.hasMore));
        setPage(nextPage);
        return;
      }

      // Fallback por si el backend todavía devuelve array plano
      const fallbackItems = Array.isArray(payload) ? payload : [];

      setItems((prev) =>
        append ? [...prev, ...fallbackItems] : fallbackItems,
      );

      // Como fallback, asumimos que si vino menos que PAGE_SIZE, no hay más
      setHasMore(fallbackItems.length === PAGE_SIZE);
      setPage(nextPage);
    } catch (err) {
      console.error("Error cargando feed:", err);
      setError("No se pudo cargar el feed.");

      if (!append) {
        setItems([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    fetchFeed({ selectedTab: activeTab, nextPage: 1, append: false });
  }, [activeTab, isAuthenticated]);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;

    await fetchFeed({
      selectedTab: activeTab,
      nextPage: page + 1,
      append: true,
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
            ? "bg-accent text-paper"
            : "bg-panel-2 text-zinc-300 hover:bg-white/10"
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <main className="min-h-dvh text-paper">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <PageBanner
          image="/art/hanami.jpg"
          title="Feed de reseñas"
          subtitle="Descubrí lo que está viendo y reseñando la comunidad de YumeTrack."
          kanji="声"
        />

        <section className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {renderTabButton("global", "Global")}
            {renderTabButton("following", "Siguiendo")}
            {renderTabButton("activity", "Actividad")}
          </div>

          {loading ? (
            <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-2xl bg-panel p-4"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white/10" />
                    <div className="space-y-2">
                      <div className="h-4 w-24 rounded bg-white/10" />
                      <div className="h-3 w-16 rounded bg-white/10" />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="h-20 w-14 rounded bg-white/10" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 rounded bg-white/10" />
                      <div className="h-3 w-14 rounded bg-white/10" />
                      <div className="h-3 w-full rounded bg-white/10" />
                      <div className="h-3 w-10/12 rounded bg-white/10" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          ) : (activeTab === "following" || activeTab === "activity") &&
            !isAuthenticated ? (
            <div className="rounded-2xl bg-panel p-6 text-center">
              <p className="text-sm text-zinc-300">
                Iniciá sesión para ver el feed de usuarios que seguís.
              </p>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="mt-4 rounded-xl bg-accent px-5 py-3 text-sm font-medium text-paper transition hover:bg-accent-hover"
              >
                Ir a login
              </button>
            </div>
          ) : items.length > 0 ? (
            <>
              {activeTab === "activity" ? (
                <div className="mx-auto grid max-w-3xl gap-3">
                  {items.map((item, index) => (
                    <ActivityCard key={item.id} item={item} index={index} />
                  ))}
                </div>
              ) : (
                <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 xl:grid-cols-2">
                  {items.map((item, index) => (
                    <FeedCard
                      key={`${item.userTitleId}-${item.reviewUpdatedAt || ""}`}
                      item={item}
                      index={index}
                    />
                  ))}
                </div>
              )}

              {hasMore && (
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="rounded-xl bg-panel-2 px-5 py-3 text-sm font-medium text-paper transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loadingMore ? "Cargando..." : "Cargar más"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-6 rounded-2xl bg-panel p-6">
              <p className="text-sm text-zinc-300">
                {activeTab === "global"
                  ? "No hay reseñas para mostrar."
                  : activeTab === "activity"
                    ? "Todavía no hay actividad de la gente que seguís."
                    : "Todavía no hay reseñas de la gente que seguís."}
              </p>

              {activeTab !== "global" && <SuggestedUsers />}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Feed;
