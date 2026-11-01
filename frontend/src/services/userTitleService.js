import api from "./api";

const USER_TITLE_STATUS = {
  PLANNED: 0,
  WATCHING: 1,
  COMPLETED: 2,
  ON_HOLD: 3,
  DROPPED: 4,
};

export const createUserTitleRequest = async ({
  kitsuId,
  mediaType = "anime",
  status = USER_TITLE_STATUS.PLANNED,
  progress = 0,
  score = null,
  isFavorite = false,
  notes = null,
}) => {
  const response = await api.post("/UserTitles", {
    kitsuId,
    mediaType,
    status,
    progress,
    score,
    isFavorite,
    notes,
  });

  return response.data;
};

export const getUserTitlesRequest = async () => {
  const response = await api.get("/UserTitles");
  return response.data;
};

export const updateUserTitleRequest = async (
  id,
  { status, progress, score, isFavorite, notes },
) => {
  const response = await api.put(`/UserTitles/${id}`, {
    status,
    progress,
    score,
    isFavorite,
    notes,
  });

  return response.data;
};

export const deleteUserTitleRequest = async (id) => {
  const response = await api.delete(`/UserTitles/${id}`);
  return response.data;
};

export { USER_TITLE_STATUS };
