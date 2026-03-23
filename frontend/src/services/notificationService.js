import api from "./api";

export const getNotificationsRequest = async () => {
  const res = await api.get("/notifications");
  return res.data;
};

export const getUnreadCountRequest = async () => {
  const res = await api.get("/notifications/unread-count");
  return res.data;
};

export const markAllReadRequest = async () => {
  await api.put("/notifications/read-all");
};
