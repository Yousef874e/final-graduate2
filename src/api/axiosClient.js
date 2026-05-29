import axios from "axios";
import { clearAuth } from "../utils/auth";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + "/api/v1",
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
});

const publicRoutes = [
  "/Auth/login",
  "/Auth/register/parent",
  "/Auth/register/specialist",
  "/Auth/forgot-password",
  "/Auth/reset-password",
  "/Auth/refresh-token",
  "/Auth/external/google/link",
];

const isPublicRoute = (url = "") =>
  publicRoutes.some((route) => url.includes(route));

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token && !isPublicRoute(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

const logout = () => {
  clearAuth();
  window.location.href = "/login";
};

axiosClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest || isPublicRoute(originalRequest.url)) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem("refreshToken");

      console.log("401 Unauthorized");
      console.log("Refresh Token:", refreshToken);

      if (!refreshToken) {
        console.log("No Refresh Token Found");
        logout();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        console.log("Refreshing token...");

        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/Auth/refresh-token`,
          {
            refreshToken,
          },
        );

        console.log(
          "Refresh Response:",
          refreshResponse.data,
        );

        const newAccessToken =
          refreshResponse.data.accessToken;

        const newRefreshToken =
          refreshResponse.data.refreshToken;

        localStorage.setItem(
          "accessToken",
          newAccessToken,
        );

        localStorage.setItem(
          "refreshToken",
          newRefreshToken,
        );

        axiosClient.defaults.headers.common.Authorization =
          `Bearer ${newAccessToken}`;

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return axiosClient(originalRequest);
      } catch (refreshError) {
        console.log(
          "Refresh Error:",
          refreshError?.response?.data,
        );

        logout();

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
