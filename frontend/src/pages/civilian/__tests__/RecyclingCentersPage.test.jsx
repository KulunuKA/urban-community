import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RecyclingCentersPage from "../RecyclingCentersPage";
import { recyclingService } from "@/services/recycling.service";

vi.mock("@/services/recycling.service", () => ({
  recyclingService: {
    searchCenters: vi.fn(),
  },
}));

describe("RecyclingCentersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    recyclingService.searchCenters.mockResolvedValue({ data: [] });
  });

  it("loads centers after debounce and shows empty copy", async () => {
    render(<RecyclingCentersPage />);

    await waitFor(
      () => {
        expect(recyclingService.searchCenters).toHaveBeenCalledWith({});
      },
      { timeout: 3000 },
    );

    expect(
      screen.getByRole("heading", { name: /recycling centers/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/no recycling centers found/i)).toBeInTheDocument();
  });

  it("renders returned centers", async () => {
    recyclingService.searchCenters.mockResolvedValue({
      data: [
        {
          _id: "64a1b2c3d4e5f6789012345",
          name: "Green Lane Hub",
          address: "12 Station Road",
          city: "Colombo",
          wasteTypes: ["plastic", "glass"],
        },
      ],
    });

    render(<RecyclingCentersPage />);

    await waitFor(() => {
      expect(screen.getByText("Green Lane Hub")).toBeInTheDocument();
    });
    expect(screen.getByText(/12 Station Road, Colombo/)).toBeInTheDocument();
  });
});
