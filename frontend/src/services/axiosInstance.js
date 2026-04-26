import { getSessionValue, removeSession } from "@/utils/session";
import axios from "axios";
import { message } from "antd";

/*
    @TODO: Change to the local API URL after testing
*/
// export const API_BASE_URL = "http://localhost:3000";

export const API_BASE_URL = 'https://urban-community-backend.onrender.com'

let refreshFlag = true;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

const getAccessToken = () => {
  return getSessionValue("accessToken");
};

const requestHandler = (request) => {
  if (request.headers && !request.headers["Authorization"]) {
    const token = getAccessToken();
    if (token) {
      request.headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return request;
};

const responseHandler = (response) => {
  return response;
};

const errorHandler = async (error) => {
  const originalConfig = error.config;

  // Log detailed error information
  if (error.code === "ECONNABORTED") {
    console.error("❌ Request timeout:", {
      url: originalConfig?.url,
      timeout: originalConfig?.timeout,
    });
    message.error("Request timeout. Please check your internet connection.");
  } else if (
    error.code === "ERR_NETWORK" ||
    error.message === "Network Error"
  ) {
    console.error("❌ Network Error:", {
      message: error.message,
      url: originalConfig?.url,
      baseURL: originalConfig?.baseURL,
      fullURL: originalConfig?.baseURL + originalConfig?.url,
    });
    message.error(
      "Cannot connect to server. Please check your internet connection.",
    );
  } else if (error.response) {
    // Server responded with error status
    console.error("❌ API Error Response:", {
      status: error.response.status,
      statusText: error.response.statusText,
      url: originalConfig?.url,
      data: error.response.data,
      message: error.response?.data?.message,
    });

    // Handle session expired (401) errors
    if (
      error.response.status === 401 &&
      !originalConfig._retry &&
      refreshFlag
    ) {
      originalConfig._retry = true;
      refreshFlag = false;

      // Show error message to user
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Session expired. Please login again.";
      message.error(errorMessage);
      console.log(
        "🔒 Session expired, clearing preferences and redirecting to login...",
      );

      // Clear preferences FIRST before redirecting
      try {
        await removeSession("accessToken");
        await removeSession("user");
        await removeSession("userProfile");
        console.log("✅ Preferences cleared successfully");
      } catch (clearError) {
        console.error("❌ Error clearing preferences:", clearError);
      }

      // Redirect to login page
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);

      // Reset refreshFlag after a delay to allow future 401 handling
      setTimeout(() => {
        refreshFlag = true;
      }, 3000);
    }
  } else {
    // Request never made it to server
    console.error("❌ Request Error:", {
      message: error.message,
      code: error.code,
      url: originalConfig?.url,
    });
  }

  return Promise.reject(error);
};

axiosInstance.interceptors.request.use(
  (request) => requestHandler(request),
  (error) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => responseHandler(response),
  (error) => errorHandler(error),
);

export default axiosInstance;
