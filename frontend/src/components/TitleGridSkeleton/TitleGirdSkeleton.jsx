const TitleGridSkeleton = ({ count = 10 }) => {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-zinc-900"
        >
          <div className="aspect-[2/3] w-full bg-zinc-800" />
          <div className="space-y-2 p-3">
            <div className="h-4 w-3/4 rounded bg-zinc-800" />
            <div className="h-3 w-1/2 rounded bg-zinc-800" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TitleGridSkeleton;
