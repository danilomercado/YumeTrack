import api from "./api";

export const searchTitlesRequest = async (query) => {
  const response = await api.get("/titles/search", {
    params: {
      query,
    },
  });

  return response.data;
};
