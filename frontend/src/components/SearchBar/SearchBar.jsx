import React from "react";

const SearchBar = ({ value, onChange, onSubmit }) => {
  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:flex-row"
    >
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Ej: Hunter x Hunter"
        className="flex-1 rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-violet-500"
      />

      <button
        type="submit"
        className="rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 px-6 py-3 font-semibold text-white transition hover:scale-[1.01]"
      >
        Buscar
      </button>
    </form>
  );
};

export default SearchBar;
