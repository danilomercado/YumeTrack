const SectionHeader = ({ title, subtitle, actionLabel, onAction }) => {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>}
      </div>

      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="text-sm font-medium text-violet-400 transition hover:text-violet-300"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default SectionHeader;
