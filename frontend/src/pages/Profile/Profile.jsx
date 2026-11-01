import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getUserTitlesRequest } from "../../services/userTitleService";
import {
  getFollowersRequest,
  getFollowingRequest,
  getMyProfileRequest,
  updateMyProfileRequest,
} from "../../services/userService";
import {
  followUserRequest,
  unfollowUserRequest,
} from "../../services/followService";
import FeedCard from "../../components/FeedCard/FeedCard";
import useDocumentTitle from "../../hooks/useDocumentTitle";
const STATUS_LABELS = {
  0: "Planificados",
  1: "En progreso",
  2: "Completados",
  3: "En pausa",
  4: "Abandonados",
};

const Profile = () => {
  useDocumentTitle("Mi perfil");
  const { user } = useAuth();

  const [titles, setTitles] = useState([]);
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState("");
  const [originalBio, setOriginalBio] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [followModalOpen, setFollowModalOpen] = useState(false);
  const [followModalTitle, setFollowModalTitle] = useState("");
  const [followUsers, setFollowUsers] = useState([]);
  const [followModalLoading, setFollowModalLoading] = useState(false);
  const [followActionLoadingId, setFollowActionLoadingId] = useState(null);

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

  const reviewItems = titles
    .filter((t) => t.notes && t.notes.trim() !== "")
    .slice(0, 6)
    .map((t) => ({
      userTitleId: t.id,
      userName: profile?.userName || user?.userName,
      canonicalTitle: t.canonicalTitle,
      mediaType: t.mediaType,
      review: t.notes,
      posterImageUrl: t.posterImageUrl,
      score: t.score,
      reviewUpdatedAt: null, // no lo tenés en DTO aún
      likesCount: 0,
      isLikedByCurrentUser: false,
    }));

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
  const loadFollowers = async () => {
    try {
      setFollowModalTitle("Seguidores");
      setFollowModalOpen(true);
      setFollowModalLoading(true);

      const data = await getFollowersRequest();
      setFollowUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMessage(error.message || "No se pudieron cargar los seguidores.");
      setFollowUsers([]);
    } finally {
      setFollowModalLoading(false);
    }
  };

  const loadFollowing = async () => {
    try {
      setFollowModalTitle("Siguiendo");
      setFollowModalOpen(true);
      setFollowModalLoading(true);

      const data = await getFollowingRequest();
      setFollowUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMessage(
        error.message || "No se pudieron cargar los usuarios seguidos.",
      );
      setFollowUsers([]);
    } finally {
      setFollowModalLoading(false);
    }
  };

  const handleToggleFollowUser = async (targetUserId) => {
    if (!targetUserId || followActionLoadingId) return;

    const targetUser = followUsers.find((u) => u.id === targetUserId);
    if (!targetUser) return;

    try {
      setFollowActionLoadingId(targetUserId);
      setErrorMessage("");

      if (targetUser.isFollowing) {
        await unfollowUserRequest(targetUserId);

        setFollowUsers((prev) =>
          prev.map((u) =>
            u.id === targetUserId ? { ...u, isFollowing: false } : u,
          ),
        );

        setProfile((prev) =>
          prev
            ? {
                ...prev,
                followingCount: Math.max(0, (prev.followingCount || 0) - 1),
              }
            : prev,
        );
      } else {
        await followUserRequest(targetUserId);

        setFollowUsers((prev) =>
          prev.map((u) =>
            u.id === targetUserId ? { ...u, isFollowing: true } : u,
          ),
        );

        setProfile((prev) =>
          prev
            ? {
                ...prev,
                followingCount: (prev.followingCount || 0) + 1,
              }
            : prev,
        );
      }
    } catch (error) {
      const message = error.message || "No se pudo actualizar el follow.";

      // Si el backend dice que ya lo seguís, corregimos el estado local
      if (message.toLowerCase().includes("ya estás siguiendo")) {
        setFollowUsers((prev) =>
          prev.map((u) =>
            u.id === targetUserId ? { ...u, isFollowing: true } : u,
          ),
        );

        setErrorMessage("");
      }
      // Si el backend dice que no existe el follow al dejar de seguir,
      // también corregimos el estado local
      else if (
        message.toLowerCase().includes("no encontrado") ||
        message.toLowerCase().includes("no existe")
      ) {
        setFollowUsers((prev) =>
          prev.map((u) =>
            u.id === targetUserId ? { ...u, isFollowing: false } : u,
          ),
        );

        setErrorMessage("");
      } else {
        setErrorMessage(message);
      }
    } finally {
      setFollowActionLoadingId(null);
    }
  };

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 text-paper">
        <div className="animate-pulse rounded-lg bg-panel p-8">
          <div className="mb-3 h-4 w-36 rounded bg-white/10" />
          <div className="h-3 w-24 rounded bg-white/10" />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 text-paper">
      {successMessage && (
        <div className="mb-6 rounded-md bg-green-500/10 px-4 py-3 text-sm text-green-300">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {errorMessage}
        </div>
      )}

      <section className="overflow-hidden rounded-lg bg-panel">
        <div className="h-28 bg-accent/25" />
        <div className="relative px-6 pb-8">
          <div className="-mt-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-accent text-3xl font-black">
                {(
                  profile?.userName?.charAt(0) ||
                  user?.userName?.charAt(0) ||
                  "U"
                ).toUpperCase()}
              </div>

              <div>
                <h1 className="mt-1 text-3xl md:text-4xl">
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
              <ProfileStat
                label="Seguidores"
                value={profile?.followersCount || 0}
                onClick={loadFollowers}
              />
              <ProfileStat
                label="Siguiendo"
                value={profile?.followingCount || 0}
                onClick={loadFollowing}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {/* <Link
              to={`/profile/${profile?.userName || user?.userName}`}
              className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-paper transition hover:opacity-90"
            >
              Ver perfil público
            </Link> */}

            <Link
              to="/my-list"
              className="rounded-md bg-panel-2 px-4 py-2 text-sm font-medium text-paper transition hover:bg-white/10"
            >
              Ir a mi lista
            </Link>
          </div>

          <div className="mt-6 rounded-lg bg-panel-2 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="mt-1 text-sm text-zinc-400">
                  Esta bio se muestra en tu perfil público.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveBio}
                disabled={isSavingBio || !hasBioChanges}
                className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-paper transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
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
              className="w-full rounded-lg bg-ground px-4 py-3 text-sm text-paper placeholder:text-zinc-500"
            />

            <div className="mt-2 flex items-center justify-between text-[13px] text-zinc-500">
              <span>Máximo 300 caracteres</span>
              <span>{bio.length}/300</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          <div className="rounded-lg bg-panel p-4">
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

          <div className="rounded-lg bg-panel p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[13px] text-zinc-500">
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
                    className="overflow-hidden rounded-md bg-ground"
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

        <div className="rounded-lg bg-panel p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="mt-1 text-2xl">Lo que otros ven</h2>
            </div>
            <span className="text-sm text-zinc-400">
              {titles.length} títulos
            </span>
          </div>

          {titles.length === 0 ? (
            <div className="rounded-md bg-ground p-4 text-zinc-400">
              Todavía no tenés títulos en tu lista.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {titles.slice(0, 6).map((title) => (
                <article
                  key={title.id}
                  className="overflow-hidden rounded-lg bg-ground"
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
                        <div className="rounded-md bg-gold/15 px-2.5 py-1 text-[13px] font-bold text-gold">
                          ★ {title.score}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 text-[13px]">
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
      <section className="mt-8 rounded-lg bg-panel p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="mt-1 text-2xl">Últimas reseñas</h2>
          </div>
        </div>

        {reviewItems.length === 0 ? (
          <div className="rounded-md bg-ground p-4 text-zinc-400">
            Todavía no escribiste ninguna reseña.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {reviewItems.map((item) => (
              <FeedCard key={item.userTitleId} item={item} />
            ))}
          </div>
        )}
      </section>
      {followModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="max-h-[80vh] w-full max-w-md overflow-hidden rounded-lg bg-panel">
            <div className="flex items-center justify-between   px-5 py-4">
              <h3 className="text-lg font-bold text-paper">
                {followModalTitle}
              </h3>
              <button
                onClick={() => setFollowModalOpen(false)}
                className="text-zinc-400 hover:text-paper"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[65vh] overflow-y-auto p-4">
              {followModalLoading ? (
                <p className="text-zinc-400 text-sm">Cargando...</p>
              ) : followUsers.length === 0 ? (
                <p className="text-zinc-400 text-sm">No hay usuarios.</p>
              ) : (
                <div className="space-y-3">
                  {followUsers.map((followUser) => {
                    const isOwnUser =
                      followUser.userName?.trim().toLowerCase() ===
                      user?.userName?.trim().toLowerCase();

                    const isLoadingButton =
                      followActionLoadingId === followUser.id;

                    return (
                      <div
                        key={followUser.id}
                        className="flex items-center justify-between gap-3 rounded-lg bg-ground p-4"
                      >
                        <Link
                          to={`/profile/${followUser.userName}`}
                          onClick={() => setFollowModalOpen(false)}
                          className="min-w-0 flex-1"
                        >
                          <p className="truncate font-semibold text-paper">
                            {followUser.userName}
                          </p>
                          <p className="mt-1 text-sm text-zinc-400">
                            {followUser.bio || "Sin biografía"}
                          </p>
                        </Link>

                        {!isOwnUser && (
                          <button
                            onClick={() =>
                              handleToggleFollowUser(followUser.id)
                            }
                            disabled={isLoadingButton}
                            className={`shrink-0 rounded-md px-4 py-2 text-sm font-semibold ${
                              followUser.isFollowing
                                ? "  bg-panel-2 text-paper"
                                : "bg-accent   text-paper"
                            }`}
                          >
                            {isLoadingButton
                              ? "..."
                              : followUser.isFollowing
                                ? "Siguiendo"
                                : "Seguir"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

const ProfileStat = ({ label, value, onClick }) => {
  const isClickable = typeof onClick === "function";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isClickable}
      className={`min-w-[120px] rounded-lg   bg-ground px-4 py-3 text-left  transition ${
        isClickable ? "cursor-pointer  hover:bg-panel" : "cursor-default"
      }`}
    >
      <p className="text-2xl font-black text-paper">{value}</p>
      <p className="text-[13px] text-zinc-400">{label}</p>
    </button>
  );
};

const SmallStat = ({ label, value }) => (
  <div className="rounded-md bg-ground p-3">
    <p className="text-lg font-bold text-paper">{value}</p>
    <p className="text-[13px] text-zinc-400">{label}</p>
  </div>
);

const Badge = ({ children, strong = false }) => (
  <span
    className={`rounded-full px-2.5 py-1 ${
      strong ? "bg-accent/20 text-accent-soft" : "bg-panel-2 text-zinc-300"
    }`}
  >
    {children}
  </span>
);

export default Profile;
