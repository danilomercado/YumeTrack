import React from "react";
import TitleCard from "../../components/TitleCard/TitleCard";

const MyList = () => {
  const mockList = [
    {
      id: 1,
      title: "One Piece",
      image: "https://via.placeholder.com/300x420?text=One+Piece",
    },
    {
      id: 2,
      title: "Death Note",
      image: "https://via.placeholder.com/300x420?text=Death+Note",
    },
    {
      id: 3,
      title: "Naruto",
      image: "https://via.placeholder.com/300x420?text=Naruto",
    },
    {
      id: 4,
      title: "Bleach",
      image: "https://via.placeholder.com/300x420?text=Bleach",
    },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.25em] text-pink-300">
          Colección
        </p>
        <h1 className="mt-2 text-4xl font-black">Mi lista</h1>
        <p className="mt-3 text-zinc-400">Tus títulos guardados y favoritos.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {mockList.map((item) => (
          <TitleCard key={item.id} title={item.title} image={item.image} />
        ))}
      </div>
    </main>
  );
};

export default MyList;
