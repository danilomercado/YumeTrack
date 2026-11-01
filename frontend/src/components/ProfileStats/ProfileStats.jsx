import { useEffect, useState } from "react";
import { getProfileStatsRequest } from "../../services/socialService";

const SEGMENTS = [
  ["completed", "Completados", "bg-paper"],
  ["watching", "En curso", "bg-accent"],
  ["planned", "Pendientes", "bg-zinc-500"],
  ["onHold", "En pausa", "bg-zinc-700"],
  ["dropped", "Abandonados", "bg-zinc-800"],
];

const Figure = ({ label, value }) => (
  <div className="rounded-2xl bg-panel-2 p-4">
    <p className="font-display text-3xl text-paper">{value}</p>
    <p className="mt-1 text-[13px] text-zinc-400">{label}</p>
  </div>
);

// Resumen de la lista de un usuario: cuánto vio, cómo califica, qué está haciendo.
const ProfileStats = ({ username }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!username) return undefined;

    let cancelled = false;

    getProfileStatsRequest(username)
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [username]);

  if (!stats || stats.total === 0) return null;

  return (
    <section className="rise-in mt-8 rounded-2xl bg-panel p-6">
      <h2 className="text-2xl text-paper">En números</h2>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Figure label="Títulos" value={stats.total} />
        <Figure label="Completados" value={stats.completed} />
        <Figure
          label="Nota promedio"
          value={stats.averageScore !== null ? `★ ${stats.averageScore}` : "–"}
        />
        <Figure label="Reseñas" value={stats.reviews} />
      </div>

      <div
        className="mt-6 flex h-3 overflow-hidden rounded-full bg-ground"
        role="img"
        aria-label="Estado de la lista"
      >
        {SEGMENTS.map(([key, label, tone]) =>
          stats[key] > 0 ? (
            <div
              key={key}
              title={`${label}: ${stats[key]}`}
              className={tone}
              style={{ width: `${(stats[key] / stats.total) * 100}%` }}
            />
          ) : null,
        )}
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-zinc-300">
        {SEGMENTS.filter(([key]) => stats[key] > 0).map(
          ([key, label, tone]) => (
            <li key={key} className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${tone}`} />
              {label} · {stats[key]}
            </li>
          ),
        )}
      </ul>

      <p className="mt-4 text-[13px] text-zinc-400">
        {stats.anime} anime · {stats.manga} manga
      </p>
    </section>
  );
};

export default ProfileStats;
