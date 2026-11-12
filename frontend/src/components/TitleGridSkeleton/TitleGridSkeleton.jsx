const TitleGridSkeleton = ({ count = 10 }) => {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="aspect-[2/3] w-full rounded-2xl bg-panel" />
          <div className="mt-3 space-y-2 px-0.5">
            <div className="h-4 w-3/4 rounded bg-panel" />
            <div className="h-3 w-1/2 rounded bg-panel" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TitleGridSkeleton;
