import React, { useState } from "react";
import SearchBar from "../../components/SearchBar/SearchBar";
import TitleCard from "../../components/TitleCard/TitleCard";

const Search = () => {
  const [query, setQuery] = useState("");

  const mockTitles = [
    {
      id: 1,
      title: "Hunter x Hunter",
      image: "https://placehold.co/300x420?text=Hunter+x+Hunter",
    },
    {
      id: 2,
      title: "Attack on Titan",
      image: "https://placehold.co/300x420?text=Attack+on+Titan",
    },
    {
      id: 3,
      title: "Death Note",
      image: "https://placehold.co/300x420?text=Death+Note",
    },
    {
      id: 4,
      title: "One Piece",
      image: "https://placehold.co/300x420?text=One+Piece",
    },
  ];

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Buscar:", query);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.25em] text-violet-300">
          Explorar
        </p>
        <h1 className="mt-2 text-4xl font-black">Buscar anime o manga</h1>
        <p className="mt-3 text-zinc-400">
          Encontrá títulos y agregalos a tu lista.
        </p>
      </div>

      <SearchBar
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onSubmit={handleSubmit}
      />

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {mockTitles.map((item) => (
          <TitleCard key={item.id} title={item.title} image={item.image} />
        ))}
      </div>
    </main>
  );
};

export default Search;
