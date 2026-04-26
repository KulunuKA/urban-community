import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "../LoginPage";

const { navigateMock, loginMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  loginMock: vi.fn(),
}));

vi.mock("@/contexts/AuthProvider", () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    login: loginMock,
    isAuthenticated: false,
    isAuthReady: true,
    logout: vi.fn(),
  }),
}));

vi.mock("react-router-dom", async () => {
  const mod = await vi.importActual("react-router-dom");
  return {
    ...mod,
    useNavigate: () => navigateMock,
  };
});

function renderLogin() {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
  return { user };
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loginMock.mockResolvedValue({
      data: { user: { role: "citizen" } },
    });
  });

  it("shows validation errors for empty email or password", async () => {
    renderLogin();
    const submitBtn = screen.getByRole("button", {
      name: /sign in to dashboard/i,
    });
    const formEl = submitBtn.closest("form");
    expect(formEl).toBeTruthy();
    fireEvent.submit(formEl);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("calls login and navigates to civilian dashboard on success", async () => {
    const { user } = renderLogin();
    await user.type(screen.getByLabelText(/email address/i), "user@test.com");
    await user.type(screen.getByLabelText(/^password$/i), "secret12");
    await user.click(screen.getByRole("button", { name: /sign in to dashboard/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith("user@test.com", "secret12");
    });
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("navigates to organization dashboard when login returns organization role", async () => {
    loginMock.mockResolvedValueOnce({
      data: { user: { role: "organization" } },
    });
    const { user } = renderLogin();
    await user.type(screen.getByLabelText(/email address/i), "org@test.com");
    await user.type(screen.getByLabelText(/^password$/i), "secret12");
    await user.click(screen.getByRole("button", { name: /sign in to dashboard/i }));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/organization/dashboard");
    });
  });
});
