import axiosInstance from "./axiosInstance";

const API_BASE_URL = "/api/notifications";

export const notificationService = {
  getNotifications: async () => {
    return await axiosInstance.get(`${API_BASE_URL}`);
  },
  markAsRead: async (notificationId) => {
    return await axiosInstance.patch(`${API_BASE_URL}/${notificationId}/read`);
  },
};
