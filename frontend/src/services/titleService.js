import api from "./api";

export const normalizeTitle = (item) => ({
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

export const getTrendingTitlesRequest = async (limit = 12) => {
  const response = await api.get("/Titles/trending", { params: { limit } });
  return response.data;
};

export const getTrendingMangaRequest = async (limit = 12) => {
  const response = await api.get("/Titles/trending-manga", {
    params: { limit },
  });
  return response.data;
};

export const getCatalogTitlesRequest = async (limit = 20, offset = 0) => {
  const response = await api.get("/Titles/catalog", {
    params: { limit, offset },
  });
  return response.data;
};

export const getCatalogMangaRequest = async (limit = 20, offset = 0) => {
  const response = await api.get("/Titles/catalog-manga", {
    params: { limit, offset },
  });
  return response.data;
};

export const getTitleDetailRequest = async (id, mediaType = "Anime") => {
  const kind = mediaType?.toLowerCase() === "manga" ? "manga" : "anime";
  const response = await api.get(`/Titles/${kind}/${id}`);
  return normalizeTitle(response.data);
};

export const getTitleCharactersRequest = async (id, mediaType = "anime") => {
  const kind = mediaType?.toLowerCase() === "manga" ? "manga" : "anime";
  const response = await api.get(`/Titles/${kind}/${id}/characters`);
  return response.data;
};
