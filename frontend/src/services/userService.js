import api from "./api";

export const getMyProfileRequest = async () => {
  const response = await api.get("/me");
  return response.data;
};

export const updateMyProfileRequest = async ({ bio }) => {
  const response = await api.put("/me", { bio });
  return response.data;
};
