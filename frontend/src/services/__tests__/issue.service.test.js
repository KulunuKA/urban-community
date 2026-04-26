import { beforeEach, describe, expect, it, vi } from "vitest";
import axiosInstance from "../axiosInstance";
import { issueService } from "../issue.service";

vi.mock("../axiosInstance", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/utils/session", () => ({
  getSessionValue: vi.fn(() => "unit-test-access-token"),
}));

describe("issueService (Issue Reporting)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createIssue posts multipart to /api/issues/create with Authorization", async () => {
    const fd = new FormData();
    fd.append("title", "Test title long enough");
    axiosInstance.post.mockResolvedValue({ data: { success: true } });

    await issueService.createIssue(fd);

    expect(axiosInstance.post).toHaveBeenCalledTimes(1);
    const [url, body, config] = axiosInstance.post.mock.calls[0];
    expect(url).toBe("/api/issues/create");
    expect(body).toBe(fd);
    expect(config.headers.Authorization).toBe(
      "Bearer unit-test-access-token",
    );
    expect(typeof config.transformRequest).toBe("object");
  });

  it("getMyIssues GETs /api/issues/me with query params", async () => {
    axiosInstance.get.mockResolvedValue({ data: { success: true, data: [] } });

    await issueService.getMyIssues({ page: 2, status: "Pending" });

    expect(axiosInstance.get).toHaveBeenCalledWith("/api/issues/me", {
      headers: { Authorization: "Bearer unit-test-access-token" },
      params: { page: 2, status: "Pending" },
    });
  });

  it("deleteIssue sends DELETE to /api/issues/:id", async () => {
    axiosInstance.delete.mockResolvedValue({ data: { success: true } });
    const id = "507f1f77bcf86cd799439011";

    await issueService.deleteIssue(id);

    expect(axiosInstance.delete).toHaveBeenCalledWith(
      `/api/issues/${id}`,
      expect.objectContaining({
        headers: { Authorization: "Bearer unit-test-access-token" },
      }),
    );
  });
});
