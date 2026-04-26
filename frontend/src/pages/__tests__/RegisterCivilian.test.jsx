import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RegisterCivilian from "../RegisterCivilian";
import { ROUTES } from "@/constants/routes";

const { navigateMock, registerHookMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  registerHookMock: vi.fn(),
}));

vi.mock("@/contexts/CivilianProvider", () => ({
  CivilianProvider: ({ children }) => children,
  useCivilian: () => ({
    register: registerHookMock,
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    getEvents: vi.fn(),
    sendEventRequest: vi.fn(),
    civilian: null,
    events: [],
  }),
}));

vi.mock("react-router-dom", async () => {
  const mod = await vi.importActual("react-router-dom");
  return {
    ...mod,
    useNavigate: () => navigateMock,
  };
});

function renderRegister() {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <RegisterCivilian />
    </MemoryRouter>,
  );
  return { user };
}

describe("RegisterCivilian", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    registerHookMock.mockResolvedValue({ success: true });
  });

  it("shows client-side validation errors when fields are empty", async () => {
    const { user } = renderRegister();
    await user.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    expect(registerHookMock).not.toHaveBeenCalled();
  });

  it("submits valid data and navigates to the civilian dashboard", async () => {
    const { user } = renderRegister();
    await user.type(screen.getByPlaceholderText("Jane Doe"), "Jane Citizen");
    await user.type(screen.getByPlaceholderText("jane@example.com"), "jane@example.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "secret12");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(registerHookMock).toHaveBeenCalledWith({
        name: "Jane Citizen",
        email: "jane@example.com",
        password: "secret12",
      });
    });
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith(ROUTES.DASHBOARD);
    });
  });
});
