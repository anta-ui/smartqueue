import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WebhookLogs } from "../WebhookLogs";
import { useCache } from "@/hooks/cache/useCache";
import { vi, describe, it, expect } from 'vitest';

// Mock du hook useCache
vi.mock("@/hooks/cache/useCache");
const mockUseCache = useCache as ReturnType<typeof vi.fn>;

const mockLogs = [
  {
    id: "1",
    endpointId: "webhook1",
    event: "user.created",
    payload: { userId: "123", email: "test@example.com" },
    timestamp: "2025-01-29T12:00:00Z",
    status: "success",
    statusCode: 200,
    duration: 150,
    attempts: [
      {
        timestamp: "2025-01-29T12:00:00Z",
        status: "success",
        statusCode: 200,
        duration: 150,
      },
    ],
    request: {
      url: "https://test.com/webhook",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "123", email: "test@example.com" }),
    },
    response: {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true }),
    },
  },
  {
    id: "2",
    endpointId: "webhook1",
    event: "user.updated",
    payload: { userId: "123", name: "Updated Name" },
    timestamp: "2025-01-29T12:05:00Z",
    status: "failure",
    statusCode: 500,
    error: "Internal Server Error",
    duration: 2000,
    attempts: [
      {
        timestamp: "2025-01-29T12:04:00Z",
        status: "failure",
        statusCode: 500,
        error: "Internal Server Error",
        duration: 1000,
      },
      {
        timestamp: "2025-01-29T12:05:00Z",
        status: "failure",
        statusCode: 500,
        error: "Internal Server Error",
        duration: 1000,
      },
    ],
    request: {
      url: "https://test.com/webhook",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "123", name: "Updated Name" }),
    },
  },
];

describe("WebhookLogs", () => {
  const defaultProps = {
    organizationId: "org1",
    webhookId: "webhook1",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCache.mockReturnValue({
      data: mockLogs,
      loading: false,
      refresh: vi.fn(),
    });
  });

  it("renders loading state correctly", () => {
    mockUseCache.mockReturnValue({
      data: undefined,
      loading: true,
      refresh: vi.fn(),
    });

    render(<WebhookLogs {...defaultProps} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders logs table correctly", () => {
    render(<WebhookLogs {...defaultProps} />);

    expect(screen.getByText("Logs des Webhooks")).toBeInTheDocument();
    expect(screen.getByText("user.created")).toBeInTheDocument();
    expect(screen.getByText("user.updated")).toBeInTheDocument();
  });

  it("displays status badges correctly", () => {
    render(<WebhookLogs {...defaultProps} />);

    const successBadge = screen.getByText("success");
    const failureBadge = screen.getByText("failure");

    expect(successBadge).toHaveClass("bg-green-500");
    expect(failureBadge).toHaveClass("bg-red-500");
  });

  it("formats duration correctly", () => {
    render(<WebhookLogs {...defaultProps} />);

    expect(screen.getByText("150ms")).toBeInTheDocument();
    expect(screen.getByText("2000ms")).toBeInTheDocument();
  });

  it("shows number of attempts", () => {
    render(<WebhookLogs {...defaultProps} />);

    const attempts = screen.getAllByText(/[12]/);
    expect(attempts).toHaveLength(2);
  });

  it("filters by status", async () => {
    render(<WebhookLogs {...defaultProps} />);

    const statusSelect = screen.getByRole('combobox', { name: /statut/i });
    fireEvent.click(statusSelect);
    fireEvent.click(screen.getByRole('option', { name: /succès/i }));

    await waitFor(() => {
      expect(mockUseCache).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            status: "success",
          }),
        })
      );
    });
  });

  it("filters by event type", async () => {
    render(<WebhookLogs {...defaultProps} />);

    const eventSelect = screen.getByRole('combobox', { name: /type d'événement/i });
    fireEvent.click(eventSelect);
    fireEvent.click(screen.getByRole('option', { name: /user.created/i }));

    await waitFor(() => {
      expect(mockUseCache).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            event: "user.created",
          }),
        })
      );
    });
  });

  it("filters by date range", async () => {
    render(<WebhookLogs {...defaultProps} />);

    const startDateButton = screen.getByRole('button', { name: /date de début/i });
    const endDateButton = screen.getByRole('button', { name: /date de fin/i });

    fireEvent.click(startDateButton);
    const startDateInput = screen.getByRole('textbox', { name: /date de début/i });
    await userEvent.type(startDateInput, "2025-01-29T00:00");

    fireEvent.click(endDateButton);
    const endDateInput = screen.getByRole('textbox', { name: /date de fin/i });
    await userEvent.type(endDateInput, "2025-01-29T23:59");

    await waitFor(() => {
      expect(mockUseCache).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            from: expect.stringContaining("2025-01-29"),
            to: expect.stringContaining("2025-01-29"),
          }),
        })
      );
    });
  });

  it("handles search input", async () => {
    render(<WebhookLogs {...defaultProps} />);

    const searchInput = screen.getByRole('textbox', { name: /rechercher/i });
    await userEvent.type(searchInput, "test");

    await waitFor(() => {
      expect(mockUseCache).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            search: "test",
          }),
        })
      );
    });
  });

  it("resets filters", async () => {
    render(<WebhookLogs {...defaultProps} />);

    // Définir quelques filtres
    const searchInput = screen.getByRole('textbox', { name: /rechercher/i });
    await userEvent.type(searchInput, "test");

    const statusSelect = screen.getByRole('combobox', { name: /statut/i });
    fireEvent.click(statusSelect);
    fireEvent.click(screen.getByRole('option', { name: /succès/i }));

    // Réinitialiser les filtres
    const resetButton = screen.getByRole('button', { name: /réinitialiser/i });
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(mockUseCache).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            status: "",
            event: "",
            from: "",
            to: "",
            search: "",
          }),
        })
      );
    });
  });
});
