import axiosInstance from "./axiosInstance";
import { getSessionValue } from "@/utils/session";

const API_BASE_URL = "/api/issues";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${getSessionValue("accessToken")}`,
});

/**
 * Create issue — multipart: fields title, description, category, location; optional file field "image".
 * Strips default JSON Content-Type so the browser can set multipart boundaries.
 */
export const issueService = {
  createIssue: async (formData) => {
    return await axiosInstance.post(`${API_BASE_URL}/create`, formData, {
      headers: getAuthHeaders(),
      transformRequest: [
        (data, headers) => {
          if (data instanceof FormData) {
            delete headers["Content-Type"];
          }
          return data;
        },
      ],
    });
  },

  /**
   * My issues — GET /api/issues/me
   * @param {{ page?: number, limit?: number, status?: string, category?: string, search?: string }} params
   */
  getMyIssues: async (params = {}) => {
    const clean = Object.fromEntries(
      Object.entries(params).filter(
        ([, v]) => v !== undefined && v !== null && v !== "",
      ),
    );
    return await axiosInstance.get(`${API_BASE_URL}/me`, {
      headers: getAuthHeaders(),
      params: clean,
    });
  },

  getIssuesByUser: async (userId) => {
    return await axiosInstance.get(`${API_BASE_URL}/user/${userId}`, {
      headers: getAuthHeaders(),
    });
  },

  getIssueById: async (issueId) => {
    return await axiosInstance.get(`${API_BASE_URL}/${issueId}`, {
      headers: getAuthHeaders(),
    });
  },

  deleteIssue: async (issueId) => {
    return await axiosInstance.delete(`${API_BASE_URL}/${issueId}`, {
      headers: getAuthHeaders(),
    });
  },
};
