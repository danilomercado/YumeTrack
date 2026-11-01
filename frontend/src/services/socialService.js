import api from "./api";

export const getBlocksRequest = async () => {
  const response = await api.get("/social/blocks");
  return response.data;
};

export const blockUserRequest = async (userId) => {
  const response = await api.post(`/social/blocks/${userId}`);
  return response.data;
};

export const unblockUserRequest = async (userId) => {
  const response = await api.delete(`/social/blocks/${userId}`);
  return response.data;
};

export const reportRequest = async ({
  targetType,
  targetId,
  reason,
  details,
}) => {
  const response = await api.post("/social/reports", {
    targetType,
    targetId,
    reason,
    details: details?.trim() || null,
  });
  return response.data;
};

export const getActivityRequest = async ({ page = 1, pageSize = 20 } = {}) => {
  const response = await api.get("/social/activity", {
    params: { page, pageSize },
  });
  return response.data;
};

export const getSuggestionsRequest = async () => {
  const response = await api.get("/social/suggestions");
  return response.data;
};

export const getProfileStatsRequest = async (username) => {
  const response = await api.get(
    `/social/stats/${encodeURIComponent(username)}`,
  );
  return response.data;
};
