import React from "react";

const SearchBar = ({ value, onChange }) => {
  return (
    <div className="rounded-2xl bg-panel-2 p-4">
      <input
        id="search"
        name="search"
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Ej: Hunter x Hunter"
        className="w-full rounded-xl   bg-ground px-4 py-3 text-paper  transition"
      />
    </div>
  );
};

export default SearchBar;
