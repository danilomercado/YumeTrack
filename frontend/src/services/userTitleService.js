const API_URL = import.meta.env.VITE_API_URL;

const USER_TITLE_STATUS = {
  PLANNED: 0,
  WATCHING: 1,
  COMPLETED: 2,
  ON_HOLD: 3,
  DROPPED: 4,
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Sesión no encontrada. Iniciá sesión de nuevo.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const handleJsonResponse = async (response, fallbackMessage) => {
  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || data?.title || fallbackMessage);
  }

  return data;
};

export const createUserTitleRequest = async ({
  kitsuId,
  status = USER_TITLE_STATUS.PLANNED,
  isFavorite = false,
}) => {
  const response = await fetch(`${API_URL}/UserTitles`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      kitsuId,
      status,
      isFavorite,
    }),
  });

  return handleJsonResponse(
    response,
    "No se pudo agregar el título a tu lista.",
  );
};

export const getUserTitlesRequest = async () => {
  const response = await fetch(`${API_URL}/UserTitles`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleJsonResponse(response, "No se pudo obtener tu lista.");
};

export const updateUserTitleRequest = async (
  id,
  { status, progress, score, isFavorite },
) => {
  const response = await fetch(`${API_URL}/UserTitles/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      status,
      progress,
      score,
      isFavorite,
    }),
  });

  return handleJsonResponse(response, "No se pudo actualizar el título.");
};

export const deleteUserTitleRequest = async (id) => {
  const response = await fetch(`${API_URL}/UserTitles/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return handleJsonResponse(response, "No se pudo eliminar el título.");
};

export { USER_TITLE_STATUS };
