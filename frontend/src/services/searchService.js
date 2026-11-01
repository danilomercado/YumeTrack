import api from "./api";
import { normalizeTitle } from "./titleService";

export const searchTitlesRequest = async (query, { signal } = {}) => {
  const response = await api.get("/Titles/search", {
    params: { query },
    signal,
  });

  const data = response.data;
  return Array.isArray(data) ? data.map(normalizeTitle) : [];
};
