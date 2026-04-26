import { beforeEach, describe, expect, it, vi } from "vitest";
import axiosInstance from "../axiosInstance";
import { civilianService } from "../civilian.service";

vi.mock("../axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("civilianService — events", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getEvents GETs /api/events", async () => {
    axiosInstance.get.mockResolvedValue({
      status: 200,
      data: { success: true, data: [] },
    });

    await civilianService.getEvents();

    expect(axiosInstance.get).toHaveBeenCalledWith("/api/events");
  });

  it("sendEventRequest POSTs eventId to member endpoint", async () => {
    axiosInstance.post.mockResolvedValue({ status: 200, data: {} });

    await civilianService.sendEventRequest("64a1b2c3d4e5f6789012345");

    expect(axiosInstance.post).toHaveBeenCalledWith("/api/member/send-request", {
      eventId: "64a1b2c3d4e5f6789012345",
    });
  });
});
