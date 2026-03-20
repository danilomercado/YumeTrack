import api from "./api";

export const searchTitlesRequest = async (query) => {
  const response = await api.get("/Titles/search", {
    params: { query },
  });

  return response.data;
};

export const getTitleDetailRequest = async (id) => {
  const response = await api.get(`/Titles/anime/${id}`);
  return response.data;
};
