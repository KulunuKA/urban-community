import { beforeEach, describe, expect, it, vi } from "vitest";
import axiosInstance from "../axiosInstance";
import { civilianService } from "../civilian.service";

vi.mock("../axiosInstance", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
  },
}));

vi.mock("@/utils/session", () => ({
  getSessionValue: vi.fn(() => "test-token"),
}));

describe("civilianService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("register posts to /api/civilian/register with JSON body", async () => {
    axiosInstance.post.mockResolvedValue({ status: 201, data: {} });
    const form = {
      name: "Jane",
      email: "jane@test.com",
      password: "secret12",
    };

    await civilianService.register(form);

    expect(axiosInstance.post).toHaveBeenCalledWith("/api/civilian/register", {
      name: "Jane",
      email: "jane@test.com",
      password: "secret12",
    });
  });

  it("profile GETs /api/civilian/me", async () => {
    axiosInstance.get.mockResolvedValue({ status: 200, data: {} });
    await civilianService.profile();
    expect(axiosInstance.get).toHaveBeenCalledWith("/api/civilian/me");
  });
});
