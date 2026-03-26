import api from "./api";

export const getGlobalFeedRequest = () => {
  return api.get("/feed/global");
};

export const getFollowingFeedRequest = () => {
  return api.get("/feed/following");
};

export const toggleLikeRequest = async (userTitleId) => {
  const res = await api.post(`/review-likes/${userTitleId}`);
  return res.data;
};
