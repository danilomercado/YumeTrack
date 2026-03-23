import api from "./api";

export const getMyProfileRequest = async () => {
  const response = await api.get("/me");
  return response.data;
};

export const updateMyProfileRequest = async ({ bio }) => {
  const response = await api.put("/me", { bio });
  return response.data;
};

export const getFollowersRequest = async () => {
  const res = await api.get("/follows/followers");
  return res.data;
};

export const getFollowingRequest = async () => {
  const res = await api.get("/follows/following");
  return res.data;
};
