const SectionHeader = ({ title, subtitle, actionLabel, onAction }) => {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl text-paper sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>}
      </div>

      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="text-sm font-bold text-accent-soft transition hover:text-paper"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default SectionHeader;
