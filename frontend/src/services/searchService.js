const API_URL = import.meta.env.VITE_API_URL;

export const searchTitlesRequest = async (query) => {
  const response = await fetch(
    `${API_URL}/Titles/search?query=${encodeURIComponent(query)}`,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo buscar títulos.");
  }

  return data;
};

export const getTitleDetailRequest = async (id) => {
  const response = await fetch(`${API_URL}/Titles/anime/${id}`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo obtener el detalle.");
  }

  return data;
};
