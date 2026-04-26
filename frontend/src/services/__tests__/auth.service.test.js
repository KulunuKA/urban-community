import { beforeEach, describe, expect, it, vi } from "vitest";
import axiosInstance from "../axiosInstance";
import { authService } from "../auth.service";

vi.mock("../axiosInstance", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("login posts email and password to /api/users/login", async () => {
    axiosInstance.post.mockResolvedValue({ status: 200, data: {} });

    await authService.login("u@test.com", "secret12");

    expect(axiosInstance.post).toHaveBeenCalledWith("/api/users/login", {
      email: "u@test.com",
      password: "secret12",
    });
  });
});
