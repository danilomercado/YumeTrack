import api from "./api";

export const searchTitlesRequest = async (query) => {
  const response = await api.get("/titles/search", {
    params: { query },
  });

  return response.data;
};

export const getTitleDetailRequest = async (id) => {
  const response = await api.get(`/titles/${id}`);
  return response.data;
};
