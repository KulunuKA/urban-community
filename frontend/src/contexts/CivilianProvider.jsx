import React, { createContext, useContext, useState } from "react";
import { ROUTES } from "@/constants/routes";
import { civilianService } from "@/services/civilian.service";
import { setSession } from "@/utils/session";
import { Navigate } from "react-router-dom";

const CivilianContext = createContext();

export function CivilianProvider({ children }) {
  const [civilian, setCivilian] = useState(null);
  const [events, setEvents] = useState([]);

  const register = async (formData) => {
    try {
      const res = await civilianService.register(formData);
      const data = res.data.data;

      if (res.status === 201) {
        setSession("accessToken", data.token);
        setSession("user", JSON.stringify(data.user));
        Navigate(ROUTES.DASHBOARD);
      }
      return res.data;
    } catch (error) {
      throw (
        error.response?.data?.message || error.message || "Registration failed"
      );
    }
  };

  const getProfile = async () => {
    try {
      const res = await civilianService.profile();
      if (res.status === 200) {
        setCivilian(res.data.data);
      }
    } catch (error) {
      throw (
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch profile"
      );
    }
  };

  const updateProfile = async (formData) => {
    try {
      const res = await civilianService.updateProfile(formData);
      if (res.status === 200) {
        setCivilian(res.data.data);
      }
      return res.data;
    } catch (error) {
      throw (
        error.response?.data?.message ||
        error.message ||
        "Failed to update profile"
      );
    }
  };

  const getEvents = async () => {
    try {
      const res = await civilianService.getEvents();
      if (res.status === 200) {
        setEvents(res.data.data);
      }
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch events";
    }
  };

  const sendEventRequest = async (eventId) => {
    try {
      const res = await civilianService.sendEventRequest(eventId);
      return res.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to send request";
    }
  };

  return (
    <CivilianContext.Provider
      value={{
        register,
        getProfile,
        updateProfile,
        civilian,
        events,
        getEvents,
        sendEventRequest,
      }}
    >
      {children}
    </CivilianContext.Provider>
  );
}

export const useCivilian = () => {
  const context = useContext(CivilianContext);
  if (!context) {
    throw new Error("useCivilian must be used within a CivilianProvider");
  }
  return context;
};
