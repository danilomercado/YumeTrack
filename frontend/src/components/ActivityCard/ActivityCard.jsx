import { Link } from "react-router-dom";
import { formatRelativeTime } from "../../utils/formatRelativeTime";

const VERBS = {
  started: ["empezó a", "ver", "leer"],
  completed: ["terminó de", "ver", "leer"],
  planned: ["quiere", "ver", "leer"],
};

const describe = (type, isManga) => {
  const [lead, watch, read] = VERBS[type] ?? ["agregó", "", ""];
  return `${lead} ${isManga ? read : watch}`.trim();
};

const badge = (type, isManga) => {
  if (type === "completed") return "Terminado";
  if (type === "started") return isManga ? "Leyendo" : "Viendo";
  return "En lista";
};

const ActivityCard = ({ item, index = 0 }) => {
  const isManga = item.mediaType?.toLowerCase() === "manga";

  return (
    <article
      style={{ "--i": Math.min(index, 9) }}
      className="stagger-item flex items-center gap-3 rounded-2xl bg-panel p-3"
    >
      {item.posterImageUrl ? (
        <img
          src={item.posterImageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-16 w-11 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="kanji flex h-16 w-11 shrink-0 items-center justify-center rounded-lg bg-panel-2 text-xl text-zinc-600">
          夢
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-sm text-zinc-300">
          <Link
            to={`/profile/${item.userName}`}
            className="font-bold text-paper hover:text-accent-soft"
          >
            {item.userName}
          </Link>{" "}
          {describe(item.type, isManga)}{" "}
          <span className="font-bold text-paper">{item.titleName}</span>
        </p>
        <p className="mt-1 text-[13px] text-zinc-500">
          {formatRelativeTime(item.createdAt)}
        </p>
      </div>

      <span
        className={`shrink-0 rounded-full px-3 py-1 text-[13px] font-bold ${
          item.type === "completed"
            ? "bg-paper text-ground"
            : item.type === "started"
              ? "bg-accent text-paper"
              : "bg-panel-2 text-zinc-300"
        }`}
      >
        {badge(item.type, isManga)}
      </span>
    </article>
  );
};

export default ActivityCard;
