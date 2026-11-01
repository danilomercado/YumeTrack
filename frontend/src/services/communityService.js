import api from "./api";

// ---------- Listas compartibles ----------
export const getMyListsRequest = async () =>
  (await api.get("/lists/mine")).data;

export const createListRequest = async ({ title, description, isPublic }) =>
  (await api.post("/lists", { title, description, isPublic })).data;

export const getListRequest = async (token) =>
  (await api.get(`/lists/${token}`)).data;

export const updateListRequest = async (
  token,
  { title, description, isPublic },
) => (await api.put(`/lists/${token}`, { title, description, isPublic })).data;

export const deleteListRequest = async (token) => {
  await api.delete(`/lists/${token}`);
};

export const addListItemRequest = async (token, { kitsuId, mediaType, note }) =>
  (await api.post(`/lists/${token}/items`, { kitsuId, mediaType, note })).data;

export const removeListItemRequest = async (token, itemId) => {
  await api.delete(`/lists/${token}/items/${itemId}`);
};

// ---------- Hilos por episodio ----------
export const getEpisodeCommentsRequest = async (
  kitsuId,
  episode,
  mediaType = "anime",
) =>
  (await api.get(`/episodes/${kitsuId}/${episode}`, { params: { mediaType } }))
    .data;

export const createEpisodeCommentRequest = async (
  kitsuId,
  episode,
  content,
  mediaType = "anime",
) =>
  (
    await api.post(
      `/episodes/${kitsuId}/${episode}`,
      { content },
      { params: { mediaType } },
    )
  ).data;

export const deleteEpisodeCommentRequest = async (id) => {
  await api.delete(`/episodes/comments/${id}`);
};

// ---------- Administración ----------
export const getAdminReportsRequest = async () =>
  (await api.get("/admin/reports")).data;

export const dismissReportRequest = async (id) =>
  (await api.post(`/admin/reports/${id}/dismiss`)).data;

export const removeReportedContentRequest = async (id) =>
  (await api.post(`/admin/reports/${id}/remove-content`)).data;
