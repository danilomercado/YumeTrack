import React from "react";

const TitleCard = ({
  title,
  image,
  buttonText,
  onCardClick,
  onClickButton,
  buttonDisabled = false,
}) => {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <button
        type="button"
        onClick={onCardClick}
        className="block w-full text-left"
      >
        <img src={image} alt={title} className="h-72 w-full object-cover" />
      </button>

      <div className="p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-white">
          {title}
        </h3>

        <button
          type="button"
          onClick={onClickButton}
          disabled={buttonDisabled}
          className="mt-4 w-full rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {buttonText}
        </button>
      </div>
    </article>
  );
};

export default TitleCard;
