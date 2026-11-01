const SectionHeader = ({
  title,
  subtitle,
  kanji,
  live,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="reveal relative mb-4 flex items-end justify-between gap-4">
      {kanji && (
        <span
          aria-hidden="true"
          className="kanji pointer-events-none absolute -top-6 right-0 select-none text-8xl leading-none text-white/[0.04]"
        >
          {kanji}
        </span>
      )}

      <div className="relative flex gap-3">
        <span
          aria-hidden="true"
          className="w-1 shrink-0 rounded-sm bg-accent"
        />
        <div>
          <h2 className="flex items-center gap-3 text-2xl text-paper sm:text-3xl">
            {live && (
              <span
                aria-hidden="true"
                className="relative flex h-3 w-3 shrink-0"
              >
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-accent" />
              </span>
            )}
            {title}
          </h2>
          {subtitle && <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>}
        </div>
      </div>

      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="whitespace-nowrap text-sm font-bold text-accent-soft transition hover:text-paper"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default SectionHeader;
