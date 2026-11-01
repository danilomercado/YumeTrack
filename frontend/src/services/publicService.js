import api from "./api";

export const getPublicProfileRequest = async (username) => {
  const response = await api.get(`/public/users/${username}`);
  return response.data;
};

export const searchUsersRequest = async (query, { signal } = {}) => {
  const response = await api.get("/public/users/search", {
    params: { q: query },
    signal,
  });
  return response.data;
};
