import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getGlobalFeedRequest,
  getFollowingFeedRequest,
} from "../../services/feedService";
import FeedCard from "../../components/FeedCard/FeedCard";

const Feed = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("global");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFeed = async () => {
      try {
        setLoading(true);
        setError("");

        if (activeTab === "following" && !isAuthenticated) {
          setItems([]);
          return;
        }

        const response =
          activeTab === "global"
            ? await getGlobalFeedRequest()
            : await getFollowingFeedRequest();

        setItems(response?.data ?? []);
      } catch (err) {
        console.error("Error cargando feed:", err);
        setError("No se pudo cargar el feed.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadFeed();
  }, [activeTab, isAuthenticated]);

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
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8">
          <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6">
            <p className="mb-2 text-sm uppercase tracking-[0.2em] text-violet-400">
              Comunidad
            </p>

            <h1 className="text-3xl font-bold sm:text-4xl">Feed de reseñas</h1>

            <p className="mt-3 max-w-2xl text-sm text-zinc-400 sm:text-base">
              Descubrí lo que está viendo y reseñando la comunidad de YumeTrack.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {renderTabButton("global", "Global")}
            {renderTabButton("following", "Siguiendo")}
          </div>

          {loading ? (
            <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-2xl border border-white/10 bg-zinc-900/60 p-4"
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
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
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
          ) : items.length > 0 ? (
            <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 xl:grid-cols-2">
              {items.map((item) => (
                <FeedCard key={item.userTitleId} item={item} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 text-sm text-zinc-400">
              No hay reseñas para mostrar.
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Feed;
