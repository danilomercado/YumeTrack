const API_URL = import.meta.env.VITE_API_URL;

const handleResponse = async (response, errorMessage) => {
  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || data?.title || errorMessage);
  }

  return data;
};

export const getTrendingTitlesRequest = async (limit = 12) => {
  const response = await fetch(`${API_URL}/Titles/trending?limit=${limit}`);
  return handleResponse(
    response,
    "No se pudieron cargar los títulos trending.",
  );
};

export const getTrendingMangaRequest = async (limit = 12) => {
  const response = await fetch(
    `${API_URL}/Titles/trending-manga?limit=${limit}`,
  );
  return handleResponse(response, "No se pudieron cargar los mangas.");
};

export const getCatalogTitlesRequest = async (limit = 20, offset = 0) => {
  const response = await fetch(
    `${API_URL}/Titles/catalog?limit=${limit}&offset=${offset}`,
  );

  return handleResponse(response, "No se pudo cargar el catálogo.");
};

export const getTitleDetailRequest = async (id, mediaType = "Anime") => {
  const endpoint =
    mediaType?.toLowerCase() === "manga"
      ? `${API_URL}/Titles/manga/${id}`
      : `${API_URL}/Titles/anime/${id}`;

  const response = await fetch(endpoint);
  return handleResponse(response, "No se pudo cargar el detalle.");
};

export const getCatalogMangaRequest = async (limit = 20, offset = 0) => {
  const response = await fetch(
    `${API_URL}/Titles/catalog-manga?limit=${limit}&offset=${offset}`,
  );

  return handleResponse(response, "No se pudo cargar el catálogo de manga.");
};
