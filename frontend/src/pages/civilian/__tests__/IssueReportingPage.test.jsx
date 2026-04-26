import React from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { message } from "antd";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import IssueReportingPage from "../IssueReportingPage";

const getMyIssues = vi.fn();
const createIssue = vi.fn();

vi.mock("@/services/issue.service", () => ({
  issueService: {
    getMyIssues: (...args) => getMyIssues(...args),
    createIssue: (...args) => createIssue(...args),
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

function renderPage() {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <IssueReportingPage />
    </MemoryRouter>,
  );
  return { user };
}

describe("IssueReportingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getMyIssues.mockResolvedValue({
      data: {
        success: true,
        data: [],
        total: 0,
        totalPages: 1,
        page: 1,
      },
    });
    createIssue.mockResolvedValue({ data: { success: true, data: {} } });
  });

  it("renders the Issue reporting header and loads my issues", async () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: /issue reporting/i }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(getMyIssues).toHaveBeenCalled();
    });
  });
});

describe("IssueReportingPage — tab switching", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getMyIssues.mockResolvedValue({
      data: {
        success: true,
        data: [],
        total: 0,
        totalPages: 1,
        page: 1,
      },
    });
    createIssue.mockResolvedValue({ data: { success: true, data: {} } });
  });

  it("shows My reports filters and empty state, then returns to Report issue", async () => {
    const { user } = renderPage();

    await user.click(screen.getByRole("button", { name: /^My reports$/i }));

    expect(
      screen.getByRole("searchbox", { name: /search my reports/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: /filter by status/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: /filter by category/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/no reports yet/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^Report issue$/i }));

    expect(
      screen.getByRole("button", { name: /submit report/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^title$/i)).toBeInTheDocument();
  });
});

describe("IssueReportingPage — client-side form validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getMyIssues.mockResolvedValue({
      data: {
        success: true,
        data: [],
        total: 0,
        totalPages: 1,
        page: 1,
      },
    });
    createIssue.mockResolvedValue({ data: { success: true, data: {} } });
  });

  it("warns when category is missing (submit bypasses native select validity)", async () => {
    renderPage();
    await waitFor(() => expect(getMyIssues).toHaveBeenCalled());
    const form = screen.getByRole("form", { name: /report civic issue/i });
    await act(() => {
      fireEvent.submit(form);
    });
    expect(message.warning).toHaveBeenCalledWith(
      "Please select a category",
    );
  });

  it("warns when title is shorter than 3 characters", async () => {
    const { user } = renderPage();
    await user.selectOptions(screen.getByLabelText(/^category$/i), "water");
    await user.type(screen.getByLabelText(/^title$/i), "ab");
    await user.type(
      screen.getByLabelText(/^description$/i),
      "This description is long enough.",
    );
    await user.type(
      screen.getByLabelText(/^location$/i),
      "Downtown crossing near city hall",
    );
    await user.click(screen.getByRole("button", { name: /submit report/i }));
    expect(message.warning).toHaveBeenCalledWith(
      "Title must be at least 3 characters",
    );
    expect(createIssue).not.toHaveBeenCalled();
  });

  it("warns when description is shorter than 10 characters", async () => {
    const { user } = renderPage();
    await user.selectOptions(screen.getByLabelText(/^category$/i), "waste");
    await user.type(screen.getByLabelText(/^title$/i), "Broken bin");
    await user.type(screen.getByLabelText(/^description$/i), "short");
    await user.type(
      screen.getByLabelText(/^location$/i),
      "Market lane ward two",
    );
    await user.click(screen.getByRole("button", { name: /submit report/i }));
    expect(message.warning).toHaveBeenCalledWith(
      "Description must be at least 10 characters",
    );
    expect(createIssue).not.toHaveBeenCalled();
  });

  it("warns when location is shorter than 3 characters", async () => {
    const { user } = renderPage();
    await user.selectOptions(screen.getByLabelText(/^category$/i), "safety");
    await user.type(screen.getByLabelText(/^title$/i), "Street hazard");
    await user.type(
      screen.getByLabelText(/^description$/i),
      "There is exposed wiring near the sidewalk edge.",
    );
    await user.type(screen.getByLabelText(/^location$/i), "ab");
    await user.click(screen.getByRole("button", { name: /submit report/i }));
    expect(message.warning).toHaveBeenCalledWith(
      "Location must be at least 3 characters",
    );
    expect(createIssue).not.toHaveBeenCalled();
  });

  it("submits a valid report and shows success", async () => {
    const { user } = renderPage();
    await user.selectOptions(screen.getByLabelText(/^category$/i), "water");
    await user.type(
      screen.getByLabelText(/^title$/i),
      "Burst pipe at junction",
    );
    await user.type(
      screen.getByLabelText(/^description$/i),
      "Water has been pooling since Tuesday morning; traffic is slowing.",
    );
    await user.type(
      screen.getByLabelText(/^location$/i),
      "Lake Road and 3rd Street crossing",
    );
    await user.click(screen.getByRole("button", { name: /submit report/i }));

    await waitFor(() => {
      expect(createIssue).toHaveBeenCalledTimes(1);
    });
    const fd = createIssue.mock.calls[0][0];
    expect(fd).toBeInstanceOf(FormData);
    expect(message.success).toHaveBeenCalledWith(
      "Issue reported successfully.",
    );

    await waitFor(() => {
      expect(screen.getByText(/no reports yet/i)).toBeInTheDocument();
    });
    expect(
      screen.getByRole("searchbox", { name: /search my reports/i }),
    ).toBeInTheDocument();
  });
});
