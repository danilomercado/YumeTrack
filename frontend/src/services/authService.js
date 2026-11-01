import api from "./api";

export const registerRequest = async (payload) => {
  const response = await api.post("/auth/register", payload);
  return response.data;
};

export const loginRequest = async (payload) => {
  const response = await api.post("/auth/login", payload);
  return response.data;
};

export const loginMfaRequest = async ({ mfaToken, code }) => {
  const response = await api.post("/auth/login/mfa", { mfaToken, code });
  return response.data;
};

export const forgotPasswordRequest = async (email) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

export const resetPasswordRequest = async ({ email, token, newPassword }) => {
  const response = await api.post("/auth/reset-password", {
    email,
    token,
    newPassword,
  });
  return response.data;
};
