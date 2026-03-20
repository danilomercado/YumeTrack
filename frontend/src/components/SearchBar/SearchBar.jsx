import React from "react";

const SearchBar = ({ value, onChange }) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <input
        id="search"
        name="search"
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Ej: Hunter x Hunter"
        className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-violet-500"
      />
    </div>
  );
};

export default SearchBar;
