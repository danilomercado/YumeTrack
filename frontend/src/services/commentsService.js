import api from "./api";

export const getCommentsRequest = (userTitleId) => {
  return api.get(`/reviews/${userTitleId}/comments`);
};

export const createCommentRequest = (
  userTitleId,
  content,
  parentCommentId = null,
) => {
  return api.post(`/reviews/${userTitleId}/comments`, {
    content,
    parentCommentId,
  });
};

export const deleteCommentRequest = (userTitleId, commentId) => {
  return api.delete(`/reviews/${userTitleId}/comments/${commentId}`);
};

export const reactToCommentRequest = async (userTitleId, commentId, key) => {
  const response = await api.put(
    `/reviews/${userTitleId}/comments/${commentId}/reaction`,
    { key },
  );
  return response.data;
};
