import api from "./api";

export const getPublicProfileRequest = async (username) => {
  const response = await api.get(`/public/users/${username}`);
  return response.data;
};

export const searchUsersRequest = async (query) => {
  const response = await api.get(
    `/public/users/search?q=${encodeURIComponent(query)}`,
  );
  return response.data;
};
