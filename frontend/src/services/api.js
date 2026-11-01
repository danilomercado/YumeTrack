import axios from "axios";

// Token vencido o inválido: se limpia la sesión y se vuelve al login.
export const handleSessionExpired = () => {
  if (!localStorage.getItem("token")) return;

  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.assign("/login");
};

// Los hosts gratuitos duermen el backend; el primer request puede tardar ~30s.
const REQUEST_TIMEOUT_MS = 45000;
const SLOW_REQUEST_MS = 4000;
const MAX_RETRIES = 2;
const RETRY_STATUS = [502, 503, 504];

// Store mínimo para avisar a la UI que el servidor está "despertando".
let slowRequests = 0;
const listeners = new Set();

const notify = () => listeners.forEach((listener) => listener());

export const subscribeServerWaking = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getServerWakingSnapshot = () => slowRequests > 0;

const finishRequest = (config) => {
  if (!config?.slowTimer) return;

  clearTimeout(config.slowTimer);
  config.slowTimer = null;

  if (config.markedSlow) {
    config.markedSlow = false;
    slowRequests = Math.max(0, slowRequests - 1);
    notify();
  }
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.slowTimer = setTimeout(() => {
    config.markedSlow = true;
    slowRequests += 1;
    notify();
  }, SLOW_REQUEST_MS);

  return config;
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

api.interceptors.response.use(
  (response) => {
    finishRequest(response.config);
    return response;
  },
  async (error) => {
    const config = error.config;
    finishRequest(config);

    const status = error.response?.status;
    const isGet = config?.method?.toLowerCase() === "get";
    const isTransient = !error.response || RETRY_STATUS.includes(status);

    // Solo se reintentan GET: son idempotentes y es lo que cubre el cold start.
    if (config && isGet && isTransient) {
      config.retryCount = (config.retryCount ?? 0) + 1;

      if (config.retryCount <= MAX_RETRIES) {
        await wait(config.retryCount * 2000);
        return api(config);
      }
    }

    const isAuthRequest = /\/auth\//i.test(config?.url ?? "");

    if (status === 401 && !isAuthRequest) {
      handleSessionExpired();
    }

    // Se expone el mensaje del backend en error.message para que la UI lo muestre.
    const data = error.response?.data;
    const backendMessage =
      typeof data?.message === "string"
        ? data.message
        : typeof data?.title === "string"
          ? data.title
          : null;

    if (backendMessage) {
      error.message = backendMessage;
    } else if (!error.response) {
      error.message =
        "No se pudo conectar con el servidor. Probá de nuevo en unos segundos.";
    }

    return Promise.reject(error);
  },
);

export default api;
