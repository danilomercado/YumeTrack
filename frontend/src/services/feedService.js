import api from "./api";

export const getGlobalFeedRequest = () => {
  return api.get("/feed/global");
};

export const getFollowingFeedRequest = () => {
  return api.get("/feed/following");
};
