import api from "./api";

export const getMyProfileRequest = async () => {
  const response = await api.get("/me");
  return response.data;
};

// El PUT reemplaza bio y avatar a la vez: siempre se mandan los dos.
export const updateMyProfileRequest = async ({ bio, avatarUrl }) => {
  const response = await api.put("/me", { bio, avatarUrl });
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
