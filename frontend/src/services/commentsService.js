import api from "./api";

export const getCommentsRequest = (userTitleId) => {
  return api.get(`/reviews/${userTitleId}/comments`);
};

export const createCommentRequest = (userTitleId, content) => {
  return api.post(`/reviews/${userTitleId}/comments`, {
    content,
  });
};

export const deleteCommentRequest = (userTitleId, commentId) => {
  return api.delete(`/reviews/${userTitleId}/comments/${commentId}`);
};
