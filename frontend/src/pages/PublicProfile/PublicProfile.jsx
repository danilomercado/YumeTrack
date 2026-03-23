import { useEffect, useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getPublicProfileRequest } from "../../services/publicService";

const STATUS_LABELS = {
  0: "Planificado",
  1: "En progreso",
  2: "Completado",
  3: "En pausa",
  4: "Abandonado",
};

const PublicProfile = () => {
  const { username } = useParams();
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const isOwnPublicProfile =
    username?.trim().toLowerCase() === user?.userName?.trim().toLowerCase();

  useEffect(() => {
    if (isOwnPublicProfile) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await getPublicProfileRequest(username);
        setProfile(data);
      } catch (error) {
        console.error(error.message);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, isOwnPublicProfile]);

  const favoriteTitles = useMemo(() => {
    if (!profile?.titles) return [];
    return profile.titles.filter((t) => t.isFavorite).slice(0, 3);
  }, [profile]);

  const safeCreatedAt = useMemo(() => {
    if (!profile?.createdAt) return null;

    const date = new Date(profile.createdAt);
    return Number.isNaN(date.getTime()) ? null : date;
  }, [profile]);

  if (isOwnPublicProfile) {
    return <Navigate to="/profile" replace />;
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 text-white">
        <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-8">
          Cargando perfil...
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 text-white">
        <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-8">
          Usuario no encontrado.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 text-white">
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/80 shadow-[0_0_40px_rgba(168,85,247,0.08)] backdrop-blur">
        <div className="h-28 bg-gradient-to-r from-violet-600/25 via-fuchsia-500/20 to-pink-500/25" />

        <div className="relative bg-gradient-to-b from-transparent to-zinc-950/40 px-6 pb-8">
          <div className="-mt-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500 to-pink-500 text-3xl font-black shadow-lg shadow-violet-900/30">
                {profile.userName?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-violet-300">
                  Perfil público
                </p>
                <h1 className="mt-1 text-3xl font-black md:text-4xl">
                  {profile.userName}
                </h1>

                <p className="mt-1 text-sm text-zinc-400">
                  {safeCreatedAt
                    ? `Miembro desde ${safeCreatedAt.toLocaleDateString()}`
                    : "Miembro de YumeTrack"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <ProfileStat label="Títulos" value={profile.totalTitles} />
              <ProfileStat label="Favoritos" value={profile.favoritesCount} />
            </div>
          </div>

          <div className="mt-6 max-w-2xl rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
            {profile.bio?.trim()
              ? profile.bio
              : "Lista pública de anime y manga con puntuaciones, favoritos y reviews."}
          </div>
        </div>
      </section>

      {favoriteTitles.length > 0 && (
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-violet-300">
                Destacados
              </p>
              <h2 className="mt-1 text-2xl font-black">Favoritos</h2>
            </div>
            <span className="text-sm text-zinc-400">
              {favoriteTitles.length} destacados
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {favoriteTitles.map((title) => (
              <article
                key={title.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/80"
              >
                <div className="relative">
                  <img
                    src={title.posterImageUrl}
                    alt={title.canonicalTitle}
                    className="h-60 w-full object-cover"
                  />

                  <div className="absolute left-3 top-3 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-black">
                    ★ Favorito
                  </div>

                  {title.score !== null && title.score !== undefined && (
                    <div className="absolute right-3 top-3 rounded-full bg-black/75 px-3 py-1 text-xs font-bold text-yellow-300 backdrop-blur">
                      ★ {title.score}/10
                    </div>
                  )}
                </div>

                <div className="space-y-2 p-4">
                  <h3 className="line-clamp-1 text-lg font-bold">
                    {title.canonicalTitle}
                  </h3>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge>{title.mediaType}</Badge>
                    <Badge>{STATUS_LABELS[title.status] || "Sin estado"}</Badge>
                  </div>

                  {title.notes && (
                    <p className="line-clamp-3 text-sm text-zinc-400">
                      {title.notes}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-violet-300">
              Colección
            </p>
            <h2 className="mt-1 text-2xl font-black">Lista pública</h2>
          </div>
          <span className="text-sm text-zinc-400">
            {profile.titles?.length || 0} resultados
          </span>
        </div>

        {profile.titles?.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 text-zinc-400">
            Este usuario todavía no tiene títulos en su lista pública.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profile.titles.map((title) => (
              <article
                key={title.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/80 transition hover:-translate-y-1 hover:border-violet-500/40"
              >
                <img
                  src={title.posterImageUrl}
                  alt={title.canonicalTitle}
                  className="h-56 w-full object-cover"
                />

                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="line-clamp-2 text-base font-bold">
                      {title.canonicalTitle}
                    </h3>

                    {title.score !== null && title.score !== undefined && (
                      <div className="shrink-0 rounded-xl bg-yellow-400/15 px-2.5 py-1 text-sm font-bold text-yellow-300">
                        ★ {title.score}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge>{title.mediaType}</Badge>
                    <Badge>{STATUS_LABELS[title.status] || "Sin estado"}</Badge>
                    {title.isFavorite && <Badge strong>Favorito</Badge>}
                  </div>

                  <div className="text-sm text-zinc-400">
                    <p>
                      Progreso:{" "}
                      <span className="font-medium text-zinc-200">
                        {title.progress ?? 0}
                      </span>
                    </p>
                  </div>

                  {title.notes && (
                    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <p className="mb-1 text-xs uppercase tracking-[0.18em] text-zinc-500">
                        Review
                      </p>
                      <p className="line-clamp-4 text-sm text-zinc-300">
                        {title.notes}
                      </p>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

const ProfileStat = ({ label, value }) => (
  <div className="min-w-[120px] rounded-2xl border border-white/10 bg-zinc-950/70 px-4 py-3 shadow-inner">
    <p className="text-2xl font-black text-white">{value}</p>
    <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">{label}</p>
  </div>
);

const Badge = ({ children, strong = false }) => (
  <span
    className={`rounded-full px-2.5 py-1 ${
      strong ? "bg-violet-500/20 text-violet-200" : "bg-white/5 text-zinc-300"
    }`}
  >
    {children}
  </span>
);

export default PublicProfile;
