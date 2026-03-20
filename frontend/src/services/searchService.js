const API_URL = import.meta.env.VITE_API_URL;

const normalizeTitle = (item) => ({
  id: item.id,
  title: item.title ?? item.canonicalTitle ?? "Sin título",
  synopsis: item.synopsis ?? null,
  posterImage: item.posterImage ?? item.posterImageUrl ?? null,
  mediaType: item.mediaType ?? "Anime",
  status: item.status ?? null,
  startDate: item.startDate ?? null,
  episodeCount: item.episodeCount ?? null,
  chapterCount: item.chapterCount ?? null,
});

export const searchTitlesRequest = async (query) => {
  const response = await fetch(
    `${API_URL}/Titles/search?query=${encodeURIComponent(query)}`,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo buscar títulos.");
  }

  return Array.isArray(data) ? data.map(normalizeTitle) : [];
};

export const getTitleDetailRequest = async (id, mediaType = "Anime") => {
  const endpoint =
    mediaType?.toLowerCase() === "manga"
      ? `${API_URL}/Titles/manga/${id}`
      : `${API_URL}/Titles/anime/${id}`;

  const response = await fetch(endpoint);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo obtener el detalle.");
  }

  return normalizeTitle(data);
};
