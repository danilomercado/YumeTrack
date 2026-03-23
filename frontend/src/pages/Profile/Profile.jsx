import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getUserTitlesRequest } from "../../services/userTitleService";
import {
  getMyProfileRequest,
  updateMyProfileRequest,
} from "../../services/userService";

const STATUS_LABELS = {
  0: "Planificados",
  1: "En progreso",
  2: "Completados",
  3: "En pausa",
  4: "Abandonados",
};

const Profile = () => {
  const { user } = useAuth();

  const [titles, setTitles] = useState([]);
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState("");
  const [originalBio, setOriginalBio] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const [titlesData, profileData] = await Promise.all([
          getUserTitlesRequest(),
          getMyProfileRequest(),
        ]);

        setTitles(Array.isArray(titlesData) ? titlesData : []);
        setProfile(profileData);
        setBio(profileData?.bio ?? "");
        setOriginalBio(profileData?.bio ?? "");
      } catch (error) {
        setErrorMessage(error.message || "No se pudo cargar el perfil.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  useEffect(() => {
    if (!successMessage && !errorMessage) return;

    const timeoutId = setTimeout(() => {
      setSuccessMessage("");
      setErrorMessage("");
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [successMessage, errorMessage]);

  const total = titles.length;
  const favorites = titles.filter((t) => t.isFavorite).length;

  const statusCount = titles.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  const favoriteTitles = titles.filter((t) => t.isFavorite).slice(0, 6);

  const safeCreatedAt = useMemo(() => {
    if (!profile?.createdAt) return null;
    const date = new Date(profile.createdAt);
    return Number.isNaN(date.getTime()) ? null : date;
  }, [profile]);

  const hasBioChanges = bio.trim() !== originalBio.trim();

  const handleSaveBio = async () => {
    try {
      setIsSavingBio(true);
      setErrorMessage("");
      setSuccessMessage("");

      const payload = {
        bio: bio.trim().length > 0 ? bio.trim() : null,
      };

      const response = await updateMyProfileRequest(payload);

      const updatedBio = response?.bio ?? "";
      setBio(updatedBio);
      setOriginalBio(updatedBio);
      setSuccessMessage("Biografía actualizada correctamente.");
    } catch (error) {
      setErrorMessage(error.message || "No se pudo actualizar la biografía.");
    } finally {
      setIsSavingBio(false);
    }
  };

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 text-white">
        <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-8">
          Cargando perfil...
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 text-white">
      {successMessage && (
        <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {errorMessage}
        </div>
      )}

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/80 shadow-[0_0_40px_rgba(168,85,247,0.08)] backdrop-blur">
        <div className="h-28 bg-gradient-to-r from-violet-600/25 via-fuchsia-500/20 to-pink-500/25" />

        <div className="relative bg-gradient-to-b from-transparent to-zinc-950/40 px-6 pb-8">
          <div className="-mt-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500 to-pink-500 text-3xl font-black shadow-lg shadow-violet-900/30">
                {(
                  profile?.userName?.charAt(0) ||
                  user?.userName?.charAt(0) ||
                  "U"
                ).toUpperCase()}
              </div>

              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-violet-300">
                  Mi perfil
                </p>
                <h1 className="mt-1 text-3xl font-black md:text-4xl">
                  {profile?.userName || user?.userName || "Usuario"}
                </h1>

                <p className="mt-1 text-sm text-zinc-400">
                  {safeCreatedAt
                    ? `Miembro desde ${safeCreatedAt.toLocaleDateString()}`
                    : profile?.email || user?.email || "Perfil de YumeTrack"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <ProfileStat label="Títulos" value={total} />
              <ProfileStat label="Favoritos" value={favorites} />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {/* <Link
              to={`/profile/${profile?.userName || user?.userName}`}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Ver perfil público
            </Link> */}

            <Link
              to="/my-list"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Ir a mi lista
            </Link>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.16em] text-violet-300">
                  Biografía
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  Esta bio se muestra en tu perfil público.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveBio}
                disabled={isSavingBio || !hasBioChanges}
                className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingBio
                  ? "Guardando..."
                  : hasBioChanges
                    ? "Guardar bio"
                    : "Sin cambios"}
              </button>
            </div>

            <textarea
              rows={4}
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              maxLength={300}
              placeholder="Contá algo de vos, tus gustos o qué tipo de anime/manga te gusta..."
              className="w-full rounded-2xl border border-white/10 bg-zinc-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500"
            />

            <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
              <span>Máximo 300 caracteres</span>
              <span>{bio.length}/300</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
            <p className="text-sm uppercase tracking-[0.16em] text-violet-300">
              Resumen
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <SmallStat label="Total" value={total} />
              <SmallStat label="Favoritos" value={favorites} />

              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <SmallStat
                  key={key}
                  label={label}
                  value={statusCount[key] || 0}
                />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm uppercase tracking-[0.16em] text-violet-300">
                Favoritos
              </p>
              <span className="text-xs text-zinc-500">
                {favoriteTitles.length}
              </span>
            </div>

            {favoriteTitles.length === 0 ? (
              <p className="text-sm text-zinc-400">
                Todavía no tenés favoritos.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {favoriteTitles.map((title) => (
                  <div
                    key={title.id}
                    className="overflow-hidden rounded-xl border border-white/10 bg-black/20"
                  >
                    <img
                      src={title.posterImageUrl}
                      alt={title.canonicalTitle}
                      className="h-32 w-full object-cover"
                    />
                    <div className="p-2">
                      <p className="line-clamp-2 text-sm font-medium">
                        {title.canonicalTitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.16em] text-violet-300">
                Vista previa pública
              </p>
              <h2 className="mt-1 text-2xl font-black">Lo que otros ven</h2>
            </div>
            <span className="text-sm text-zinc-400">
              {titles.length} títulos
            </span>
          </div>

          {titles.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-zinc-400">
              Todavía no tenés títulos en tu lista.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {titles.slice(0, 6).map((title) => (
                <article
                  key={title.id}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-black/20"
                >
                  <img
                    src={title.posterImageUrl}
                    alt={title.canonicalTitle}
                    className="h-52 w-full object-cover"
                  />

                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="line-clamp-2 text-sm font-bold">
                        {title.canonicalTitle}
                      </h3>

                      {title.score !== null && title.score !== undefined && (
                        <div className="rounded-xl bg-yellow-400/15 px-2.5 py-1 text-xs font-bold text-yellow-300">
                          ★ {title.score}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge>{title.mediaType}</Badge>
                      <Badge>
                        {STATUS_LABELS[title.status] || "Sin estado"}
                      </Badge>
                      {title.isFavorite && <Badge strong>Favorito</Badge>}
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
          )}
        </div>
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

const SmallStat = ({ label, value }) => (
  <div className="rounded-xl border border-white/10 bg-black/20 p-3">
    <p className="text-lg font-bold text-white">{value}</p>
    <p className="text-xs text-zinc-400">{label}</p>
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

export default Profile;
