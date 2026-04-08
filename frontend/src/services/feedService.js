import api from "./api";

export const getGlobalFeedRequest = ({ page = 1, pageSize = 10 } = {}) => {
  return api.get(`/feed/global?page=${page}&pageSize=${pageSize}`);
};

export const getFollowingFeedRequest = ({ page = 1, pageSize = 10 } = {}) => {
  return api.get(`/feed/following?page=${page}&pageSize=${pageSize}`);
};

export const toggleLikeRequest = async (userTitleId) => {
  const res = await api.post(`/review-likes/${userTitleId}`);
  return res.data;
};

export const getReviewDetailRequest = (id) => {
  return api.get(`/feed/${id}`);
};
