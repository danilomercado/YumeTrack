import api from "./api";

export const getConversationsRequest = async () => {
  const res = await api.get("/chat/conversations");
  return res.data;
};

export const startConversationRequest = async (userId) => {
  const res = await api.post("/chat/conversations", { userId });
  return res.data;
};

export const getMessagesRequest = async (conversationId, before) => {
  const res = await api.get(`/chat/conversations/${conversationId}/messages`, {
    params: before ? { before } : undefined,
  });
  return res.data;
};

export const sendMessageRequest = async (conversationId, content) => {
  const res = await api.post(`/chat/conversations/${conversationId}/messages`, {
    content,
  });
  return res.data;
};

export const markConversationReadRequest = async (conversationId) => {
  await api.post(`/chat/conversations/${conversationId}/read`);
};

export const getChatPeopleRequest = async (query) => {
  const res = await api.get("/chat/people", {
    params: query ? { q: query } : undefined,
  });
  return res.data;
};

export const getChatUnreadCountRequest = async () => {
  const res = await api.get("/chat/unread-count");
  return res.data;
};
