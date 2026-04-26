import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RegisterOrganization from "../RegisterOrganization";

const { navigateMock, registerHookMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  registerHookMock: vi.fn(),
}));

vi.mock("@/contexts/OrganizationProvider", () => ({
  OrganizationProvider: ({ children }) => children,
  useOrganization: () => ({
    register: registerHookMock,
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    organization: null,
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
  const view = render(
    <MemoryRouter>
      <RegisterOrganization />
    </MemoryRouter>,
  );
  return { user, container: view.container };
}

describe("RegisterOrganization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    registerHookMock.mockResolvedValue({ statusCode: 201 });
  });

  it("shows validation when required fields are empty", async () => {
    const { user } = renderRegister();
    await user.click(
      screen.getByRole("button", { name: /create organization account/i }),
    );
    expect(screen.getAllByText(/^required$/i).length).toBeGreaterThanOrEqual(1);
    expect(registerHookMock).not.toHaveBeenCalled();
  });

  it("submits valid organization data and navigates to org dashboard", async () => {
    const { user, container } = renderRegister();
    await user.type(screen.getByPlaceholderText("Eco Team"), "Eco Collective");
    await user.type(screen.getByPlaceholderText("+94..."), "0771234567");
    await user.type(
      screen.getByPlaceholderText("Our mission is..."),
      "We run weekly recycling drives.",
    );
    await user.type(screen.getByPlaceholderText("Street address"), "1 Lake Road");
    await user.type(screen.getByPlaceholderText("org@example.com"), "org@test.com");
    const pwd = container.querySelector('input[type="password"]');
    expect(pwd).toBeTruthy();
    await user.type(pwd, "secret12");
    await user.click(
      screen.getByRole("button", { name: /create organization account/i }),
    );

    await waitFor(() => {
      expect(registerHookMock).toHaveBeenCalledWith({
        name: "Eco Collective",
        description: "We run weekly recycling drives.",
        address: "1 Lake Road",
        phone: "0771234567",
        email: "org@test.com",
        password: "secret12",
      });
    });
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/organization/dashboard");
    });
  });
});
