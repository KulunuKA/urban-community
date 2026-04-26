import { beforeEach, describe, expect, it, vi } from "vitest";
import axiosInstance from "../axiosInstance";
import { recyclingService } from "../recycling.service";

vi.mock("../axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock("@/utils/session", () => ({
  getSessionValue: vi.fn(() => "unit-test-access-token"),
}));

describe("recyclingService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("searchCenters GETs /api/recycling/centers without query when empty", async () => {
    axiosInstance.get.mockResolvedValue({ status: 200, data: [] });

    await recyclingService.searchCenters({});

    expect(axiosInstance.get).toHaveBeenCalledWith("/api/recycling/centers");
  });

  it("searchCenters appends search, city, and wasteType query params", async () => {
    axiosInstance.get.mockResolvedValue({ status: 200, data: [] });

    await recyclingService.searchCenters({
      search: "hub",
      city: "Colombo",
      wasteType: "plastic",
    });

    expect(axiosInstance.get).toHaveBeenCalledWith(
      "/api/recycling/centers?search=hub&city=Colombo&wasteType=plastic",
    );
  });

  it("createPickupRequest POSTs JSON with Authorization", async () => {
    axiosInstance.post.mockResolvedValue({ status: 201, data: {} });
    const payload = {
      wasteType: "paper",
      quantityKg: 5,
      pickupDate: "2030-01-15",
      address: "1 Main St",
      city: "Kandy",
    };

    await recyclingService.createPickupRequest(payload);

    expect(axiosInstance.post).toHaveBeenCalledWith(
      "/api/recycling/request-pickup",
      payload,
      { headers: { Authorization: "Bearer unit-test-access-token" } },
    );
  });

  it("getMyPickupRequests GETs /api/recycling/pickups/my with Authorization", async () => {
    axiosInstance.get.mockResolvedValue({ status: 200, data: [] });

    await recyclingService.getMyPickupRequests();

    expect(axiosInstance.get).toHaveBeenCalledWith("/api/recycling/pickups/my", {
      headers: { Authorization: "Bearer unit-test-access-token" },
    });
  });
});
