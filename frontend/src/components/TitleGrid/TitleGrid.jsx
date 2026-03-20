import TitleCard from "../TitleCard/TitleCard";

const TitleGrid = ({ titles = [], onSelectTitle }) => {
  if (!titles.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 text-center text-zinc-400">
        No hay títulos para mostrar.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
      {titles.map((title) => (
        <TitleCard
          key={`${title.mediaType}-${title.id}`}
          title={title}
          onClick={() => onSelectTitle(title)}
        />
      ))}
    </div>
  );
};

export default TitleGrid;
