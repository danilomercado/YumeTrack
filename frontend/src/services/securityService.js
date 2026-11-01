import api from "./api";

export const getMfaStatusRequest = async () => {
  const response = await api.get("/security/mfa");
  return response.data;
};

export const setupMfaRequest = async () => {
  const response = await api.post("/security/mfa/setup");
  return response.data;
};

export const enableMfaRequest = async (code) => {
  const response = await api.post("/security/mfa/enable", { code });
  return response.data;
};

export const disableMfaRequest = async ({ password, code }) => {
  const response = await api.post("/security/mfa/disable", { password, code });
  return response.data;
};

export const changePasswordRequest = async ({
  currentPassword,
  newPassword,
}) => {
  const response = await api.post("/security/change-password", {
    currentPassword,
    newPassword,
  });
  return response.data;
};
