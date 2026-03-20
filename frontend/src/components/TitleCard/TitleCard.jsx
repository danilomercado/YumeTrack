import React from "react";

const TitleCard = ({ title, image }) => {
  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/80 shadow-lg shadow-black/20 transition hover:-translate-y-1 hover:border-violet-500/60">
      <div className="overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-72 w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-white">
          {title}
        </h3>

        <button
          type="button"
          className="mt-4 w-full rounded-xl bg-white/5 px-4 py-2 text-sm font-medium text-violet-300 transition hover:bg-violet-500/10"
        >
          Ver más
        </button>
      </div>
    </article>
  );
};

export default TitleCard;
