import { beforeEach, describe, expect, it, vi } from "vitest";
import axiosInstance from "../axiosInstance";
import { organizationService } from "../organization.service";

vi.mock("../axiosInstance", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
  },
}));

describe("organizationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("register posts organization fields to /api/organization/register", async () => {
    axiosInstance.post.mockResolvedValue({ status: 201, data: {} });
    const form = {
      name: "Eco Org",
      description: "We coordinate recycling.",
      address: "1 Main St",
      phone: "0771234567",
      email: "org@test.com",
      password: "secret12",
    };

    await organizationService.register(form);

    expect(axiosInstance.post).toHaveBeenCalledWith(
      "/api/organization/register",
      {
        name: "Eco Org",
        description: "We coordinate recycling.",
        address: "1 Main St",
        phone: "0771234567",
        email: "org@test.com",
        password: "secret12",
      },
    );
  });

  it("profile GETs /api/organization/me", async () => {
    axiosInstance.get.mockResolvedValue({ status: 200, data: {} });
    await organizationService.profile();
    expect(axiosInstance.get).toHaveBeenCalledWith("/api/organization/me");
  });
});
