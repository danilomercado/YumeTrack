import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getUserTitlesRequest } from "../../services/userTitleService";
import { useNavigate } from "react-router-dom";

const STATUS_LABELS = {
  0: "Planificados",
  1: "En progreso",
  2: "Completados",
  3: "En pausa",
  4: "Abandonados",
};

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [titles, setTitles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTitles = async () => {
      try {
        const data = await getUserTitlesRequest();
        setTitles(data);
      } catch (error) {
        console.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTitles();
  }, []);

  const total = titles.length;
  const favorites = titles.filter((t) => t.isFavorite).length;

  const statusCount = titles.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  const favoriteTitles = titles.filter((t) => t.isFavorite).slice(0, 6);

  if (isLoading) {
    return (
      <div className="text-center mt-10 text-white">Cargando perfil...</div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 text-white">
      <div className="grid md:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="md:col-span-1 space-y-6">
          {/* PROFILE CARD */}
          <div className="bg-gradient-to-br from-violet-600/20 to-pink-600/20 border border-white/10 rounded-xl p-6 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 flex items-center justify-center text-2xl font-bold">
              {(user?.userName?.charAt(0) || "?").toUpperCase()}
            </div>

            <h1 className="text-xl font-bold">{user?.userName || "Usuario"}</h1>

            <p className="text-sm text-gray-400">
              {user?.email || "Sin email disponible"}
            </p>
          </div>

          {/* STATS */}
          <div className="bg-zinc-900 border border-white/10 rounded-xl p-4 grid grid-cols-2 gap-4">
            <Stat label="Total" value={total} />
            <Stat label="Favoritos" value={favorites} />

            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <Stat key={key} label={label} value={statusCount[key] || 0} />
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="md:col-span-2 space-y-6">
          {/* FAVORITOS */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Favoritos</h2>

            {favoriteTitles.length === 0 ? (
              <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 text-center text-gray-400">
                No tenés favoritos todavía.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
                {favoriteTitles.map((t) => (
                  <div
                    key={t.id}
                    className="group relative rounded-lg overflow-hidden border border-white/10"
                  >
                    <img
                      src={t.posterImageUrl}
                      alt={t.canonicalTitle}
                      className="w-full h-48 object-cover group-hover:scale-105 transition"
                    />

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-end">
                      <p className="p-2 text-sm">{t.canonicalTitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="flex justify-end">
            <button
              onClick={() => navigate("/my-list")}
              className="bg-gradient-to-r from-violet-600 to-pink-600 px-5 py-2 rounded-lg font-semibold hover:scale-[1.02] transition"
            >
              Ir a mi lista
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div className="bg-black/30 rounded-lg p-3 text-center">
    <p className="text-xl font-bold">{value}</p>
    <p className="text-xs text-gray-400">{label}</p>
  </div>
);

export default Profile;
