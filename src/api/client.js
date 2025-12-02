import axios from "axios";

export const client = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 10000,
  withCredentials: true,
});

let refreshPromise = null;

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const message = error.response?.data?.message;

    const isTokenExpired = status === 401 && message === "token_expired";
    if (isTokenExpired && !originalRequest?._retry) {
      originalRequest._retry = true;
      if (!refreshPromise) {
        refreshPromise = axios
          .post("http://localhost:8080/auth/refresh", {}, { withCredentials: true })
          .then(() => {})
          .catch((refreshError) => {
            window.location.href = "/login";
            throw refreshError;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      await refreshPromise;
      return client(originalRequest);
    }

    return Promise.reject(error);
  }
);
