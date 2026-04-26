import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CivilianEvents from "../CivilianEvents";

const ctx = vi.hoisted(() => ({
  events: [],
  getEvents: vi.fn(),
  sendEventRequest: vi.fn(),
}));

vi.mock("@/contexts/CivilianProvider", () => ({
  useCivilian: () => ctx,
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

describe("CivilianEvents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ctx.events = [];
    ctx.getEvents.mockResolvedValue(undefined);
    ctx.sendEventRequest.mockResolvedValue({});
  });

  it("fetches events and shows empty state when there are none", async () => {
    render(<CivilianEvents />);

    await waitFor(() => expect(ctx.getEvents).toHaveBeenCalled());
    expect(
      screen.getByRole("heading", { name: /community events/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/no events available right now/i)).toBeInTheDocument();
  });

  it("lists events and sends a join request from the card action", async () => {
    const user = userEvent.setup();
    ctx.events = [
      {
        _id: "64a1b2c3d4e5f6789012345",
        title: "Park Cleanup",
        description:
          "Help tidy the river walk area on Saturday morning with the team.",
        date: new Date(Date.now() + 86400000).toISOString(),
        location: "Riverside",
        organization: "Eco Org",
        membershipStatus: null,
      },
    ];

    render(<CivilianEvents />);

    await waitFor(() => expect(ctx.getEvents).toHaveBeenCalled());
    expect(screen.getByText("Park Cleanup")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^send request$/i }));

    await waitFor(() => {
      expect(ctx.sendEventRequest).toHaveBeenCalledWith("64a1b2c3d4e5f6789012345");
    });
  });
});
