import React from "react";

const TitleCard = ({
  title,
  image,
  onCardClick,
  onClickButton,
  buttonText = "Ver más",
}) => {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/80 shadow-lg shadow-black/20 transition hover:-translate-y-1 hover:border-violet-500/60">
      <button
        type="button"
        onClick={onCardClick}
        className="group block w-full cursor-pointer text-left"
      >
        <div className="overflow-hidden">
          <img
            src={image || "https://placehold.co/300x420?text=Sin+imagen"}
            alt={title}
            className="h-72 w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </div>

        <div className="p-4">
          <h3 className="line-clamp-2 text-sm font-semibold text-white">
            {title}
          </h3>
        </div>
      </button>

      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={onClickButton}
          className="w-full cursor-pointer rounded-xl bg-white/5 px-4 py-2 text-sm font-medium text-violet-300 transition hover:bg-violet-500/10"
        >
          {buttonText}
        </button>
      </div>
    </article>
  );
};

export default TitleCard;
