import api from "./api";

export const followUserRequest = async (userId) => {
  const response = await api.post(`/follows/${userId}`);
  return response.data;
};

export const unfollowUserRequest = async (userId) => {
  const response = await api.delete(`/follows/${userId}`);
  return response.data;
};
