import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GarbagePickupRequestPage from "../GarbagePickupRequestPage";
import { recyclingService } from "@/services/recycling.service";

vi.mock("@/services/recycling.service", () => ({
  recyclingService: {
    getMyPickupRequests: vi.fn(),
    createPickupRequest: vi.fn(),
  },
}));

vi.mock("antd", async () => {
  const mod = await vi.importActual("antd");
  return {
    ...mod,
    message: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
      loading: vi.fn(),
    },
  };
});

function futureDateInput(daysAhead = 5) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split("T")[0];
}

describe("GarbagePickupRequestPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    recyclingService.getMyPickupRequests.mockResolvedValue({ data: [] });
    recyclingService.createPickupRequest.mockResolvedValue({ status: 201 });
  });

  it("loads pickup history on mount", async () => {
    render(<GarbagePickupRequestPage />);

    await waitFor(() => {
      expect(recyclingService.getMyPickupRequests).toHaveBeenCalled();
    });
    expect(
      screen.getByRole("heading", { name: /garbage pickup request/i }),
    ).toBeInTheDocument();
  });

  it("submits a pickup request with validated payload", async () => {
    const user = userEvent.setup();
    const { container } = render(<GarbagePickupRequestPage />);

    await waitFor(() => {
      expect(recyclingService.getMyPickupRequests).toHaveBeenCalled();
    });

    await user.click(screen.getByRole("button", { name: /plastic/i }));
    await user.type(screen.getByRole("spinbutton"), "5");
    const dateInput = container.querySelector("#pickup-date");
    expect(dateInput).toBeTruthy();
    await user.type(dateInput, futureDateInput(10));
    await user.type(
      screen.getByPlaceholderText("Your street address"),
      "22 River Road",
    );
    await user.type(screen.getByPlaceholderText("Your city"), "Colombo");
    await user.click(
      screen.getByRole("button", { name: /submit pickup request/i }),
    );

    await waitFor(() => {
      expect(recyclingService.createPickupRequest).toHaveBeenCalledTimes(1);
    });
    const [payload] = recyclingService.createPickupRequest.mock.calls[0];
    expect(payload).toMatchObject({
      wasteType: "plastic",
      quantityKg: 5,
      address: "22 River Road",
      city: "Colombo",
    });
    expect(payload.pickupDate).toBeTruthy();
  });
});
