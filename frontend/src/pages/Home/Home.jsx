import { currentSeasonLabel } from "../../utils/currentSeason";
import { useEffect, useRef, useState } from "react";
import { Sun, Torii } from "../../components/Art/Art";
import { useNavigate } from "react-router-dom";
import SectionHeader from "../../components/SectionHeader/SectionHeader";
import Rail from "../../components/Rail/Rail";
import Spotlight from "../../components/Spotlight/Spotlight";
import TitleCard from "../../components/TitleCard/TitleCard";
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

const PETALS = [
  { left: "8%", size: 12, dur: "9s", delay: "1.2s", sway: "40px" },
  { left: "22%", size: 9, dur: "11s", delay: "3.5s", sway: "-30px" },
  { left: "38%", size: 14, dur: "10s", delay: "0.8s", sway: "50px" },
  { left: "55%", size: 10, dur: "12s", delay: "5s", sway: "-45px" },
  { left: "70%", size: 13, dur: "9.5s", delay: "2.4s", sway: "35px" },
  { left: "86%", size: 9, dur: "11.5s", delay: "6.5s", sway: "-35px" },
];

const TAPE = ["アニメ", "マンガ", "夢", "レビュー", "推し", "今期"];

const Home = () => {
  const gonRef = useRef(null);
  const narutoRef = useRef(null);

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

    const intervalId = setInterval(() => {
      if (!document.hidden) loadFeed();
    }, 30000);

    return () => clearInterval(intervalId);
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

  const handleAddToList = async (title, options = {}) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    await createUserTitleRequest({
      kitsuId: title.id,
      mediaType: title.mediaType?.toLowerCase() || "anime",
      status: options.status ?? USER_TITLE_STATUS.PLANNED,
      isFavorite: options.isFavorite ?? false,
    });
  };

  // Parallax del hero: solo con mouse y sin "reducir movimiento".
  const handleHeroMove = (event) => {
    if (event.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    if (gonRef.current)
      gonRef.current.style.transform = `translate3d(${x * -26}px, ${y * -14}px, 0)`;
    if (narutoRef.current)
      narutoRef.current.style.transform = `translate3d(${x * 36}px, ${y * -18}px, 0)`;
  };

  const resetHero = () => {
    if (gonRef.current) gonRef.current.style.transform = "";
    if (narutoRef.current) narutoRef.current.style.transform = "";
  };

  return (
    <main className="min-h-dvh text-paper">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-6">
          <div
            onPointerMove={handleHeroMove}
            onPointerLeave={resetHero}
            className="relative grid overflow-hidden rounded-[2rem] bg-panel lg:grid-cols-[1.15fr_1fr]"
          >
            <div className="relative z-10 flex flex-col justify-center px-6 py-12 sm:px-10 lg:py-20">
              <h1 className="rise-in text-4xl leading-[1.1] text-paper sm:text-6xl">
                Tu anime y manga, al día.
              </h1>

              <p className="rise-in mt-6 max-w-md text-base leading-relaxed text-zinc-300 [animation-delay:90ms] sm:text-lg">
                Descubrí títulos, llevá tu progreso al día y compartí reseñas
                con otros fans.
              </p>

              <div className="rise-in mt-8 flex flex-wrap gap-3 [animation-delay:180ms]">
                <button
                  type="button"
                  onClick={() => navigate("/catalog")}
                  className="springy shine rounded-full bg-accent px-7 py-3.5 text-sm font-bold text-paper hover:-rotate-2 hover:scale-105 hover:bg-accent-hover"
                >
                  Explorar catálogo
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/search")}
                  className="springy rounded-full bg-panel-2 px-7 py-3.5 text-sm font-bold text-paper hover:rotate-2 hover:scale-105 hover:bg-white/10"
                >
                  Buscar títulos
                </button>
              </div>
            </div>

            <div
              aria-hidden="true"
              className="panel-wipe relative hidden min-h-[480px] overflow-hidden bg-accent lg:-ml-16 lg:block"
            >
              <div className="speed-lines spin-slow absolute -inset-[60%]" />
              <div className="seigaiha absolute inset-0" />

              <span className="ink-in kanji absolute -right-6 -top-10 select-none text-[22rem] leading-none text-ground/20">
                夢
              </span>

              <Sun
                tone="white"
                className="sun-rise absolute left-1/2 top-[6%] h-[58%] -translate-x-1/2"
              />
              <Torii className="torii-in absolute bottom-0 left-1/2 h-[64%] -translate-x-1/2 text-ground" />

              {PETALS.map((petal) => (
                <span
                  key={petal.left}
                  className="petal"
                  style={{
                    left: petal.left,
                    width: petal.size,
                    height: petal.size * 0.8,
                    "--dur": petal.dur,
                    "--delay": petal.delay,
                    "--sway": petal.sway,
                  }}
                />
              ))}

              <div
                ref={gonRef}
                className="parallax absolute bottom-0 left-12 h-[88%]"
              >
                <div className="float h-full">
                  <img
                    src="/characters/gon.webp"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="rise-in h-full object-contain object-bottom [animation-delay:700ms]"
                  />
                </div>
              </div>

              <div
                ref={narutoRef}
                className="parallax absolute bottom-0 right-4 h-[78%]"
              >
                <div className="float h-full [animation-delay:-2.2s]">
                  <img
                    src="/characters/narutito.webp"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="rise-in h-full object-contain object-bottom [animation-delay:820ms]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div
          aria-hidden="true"
          className="relative left-1/2 mb-10 w-screen -translate-x-1/2 overflow-hidden py-6"
        >
          <div className="-rotate-1 scale-105 bg-paper py-3">
            <div className="marquee-track flex whitespace-nowrap">
              {Array.from({ length: 6 }).flatMap((_, round) =>
                TAPE.map((word) => (
                  <span
                    key={`${round}-${word}`}
                    className="kanji flex items-center gap-8 pr-8 text-2xl text-ground"
                  >
                    {word}
                    <span className="h-3 w-3 rotate-45 bg-accent" />
                  </span>
                )),
              )}
            </div>
          </div>
        </div>

        {!isLoadingAnime && !animeError && (
          <Spotlight titles={trendingAnime} onOpen={handleSelectTitle} />
        )}

        <section className="mb-12 space-y-4">
          <SectionHeader
            title="Actividad de la comunidad"
            live
            kanji="声"
            subtitle="Últimas reseñas de usuarios, se actualiza sola"
            actionLabel="Ver feed"
            onAction={() => navigate("/feed")}
          />

          {loadingFeed ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, index) => (
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
                  <div className="h-20 w-full rounded bg-white/10" />
                </div>
              ))}
            </div>
          ) : feedPreview.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {feedPreview.map((item, index) => (
                <FeedCard key={item.userTitleId} item={item} index={index} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-panel p-5 text-sm text-zinc-400">
              Todavía no hay actividad para mostrar.
            </div>
          )}
        </section>

        <section className="space-y-4">
          <SectionHeader
            title={`En emisión · ${currentSeasonLabel()}`}
            kanji="動"
            subtitle="Los animes de la temporada que se están emitiendo ahora, los más vistos primero."
            actionLabel="Ver catálogo"
            onAction={() => navigate("/catalog")}
          />

          {isLoadingAnime ? (
            <TitleGridSkeleton count={10} />
          ) : animeError ? (
            <div className="rounded-2xl bg-red-500/10 p-4 text-sm text-red-300">
              {animeError}
            </div>
          ) : (
            <Rail>
              {trendingAnime.map((title, index) => (
                <div
                  key={`${title.mediaType}-${title.id}`}
                  className="w-40 shrink-0 snap-start sm:w-48"
                >
                  <TitleCard
                    title={title}
                    index={index}
                    onClick={() => handleSelectTitle(title)}
                  />
                </div>
              ))}
            </Rail>
          )}
        </section>

        <section className="mt-12 space-y-4 pt-8">
          <SectionHeader
            title="Manga en publicación"
            kanji="漫"
            subtitle="Los mangas que siguen publicando capítulos nuevos."
          />

          {isLoadingManga ? (
            <TitleGridSkeleton count={10} />
          ) : mangaError ? (
            <div className="rounded-2xl bg-red-500/10 p-4 text-sm text-red-300">
              {mangaError}
            </div>
          ) : (
            <Rail>
              {trendingManga.map((title, index) => (
                <div
                  key={`${title.mediaType}-${title.id}`}
                  className="w-40 shrink-0 snap-start sm:w-48"
                >
                  <TitleCard
                    title={title}
                    index={index}
                    onClick={() => handleSelectTitle(title)}
                  />
                </div>
              ))}
            </Rail>
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
