import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import WebhookDeliveries from "../WebhookDeliveries";
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useCache } from "@/hooks/cache/useCache";

// Mock useCache hook
vi.mock("@/hooks/cache/useCache");
const mockUseCache = vi.mocked(useCache);

const mockDeliveries: WebhookDelivery[] = [
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
    response: {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Internal Server Error" }),
    },
  },
];

describe("WebhookDeliveries", () => {
  const defaultProps = {
    organizationId: "org1",
    webhookId: "webhook1",
    open: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCache.mockReturnValue({
      data: mockDeliveries,
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

    render(<WebhookDeliveries {...defaultProps} />);
    expect(screen.getByText(/chargement/i)).toBeInTheDocument();
  });

  it("renders deliveries list correctly", () => {
    render(<WebhookDeliveries {...defaultProps} />);
    expect(screen.getByText(mockDeliveries[0].event)).toBeInTheDocument();
    expect(screen.getByRole("status", { name: /success/i })).toBeInTheDocument();
  });

  it("displays delivery status correctly", () => {
    render(<WebhookDeliveries {...defaultProps} />);
    expect(screen.getByRole("status", { name: /success/i })).toBeInTheDocument();
  });

  it("shows delivery details when clicking on details button", async () => {
    render(<WebhookDeliveries {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /détails/i }));
    await waitFor(() => {
      expect(screen.getByText(/détails de la livraison/i)).toBeInTheDocument();
    });
  });

  it("displays multiple attempts correctly", () => {
    render(<WebhookDeliveries {...defaultProps} />);
    const attemptsBadge = screen.getByText("2 tentatives");
    expect(attemptsBadge).toBeInTheDocument();

    // Cliquer sur le bouton détails pour la livraison avec plusieurs tentatives
    const detailsButtons = screen.getAllByText("Détails");
    fireEvent.click(detailsButtons[1]);

    // Vérifier que les tentatives sont affichées
    expect(screen.getByText("Tentatives (2)")).toBeInTheDocument();
  });

  it("formats timestamps correctly", () => {
    render(<WebhookDeliveries {...defaultProps} />);
    expect(screen.getByText(/29 janvier 2025/)).toBeInTheDocument();
  });

  it("displays request and response data correctly", async () => {
    render(<WebhookDeliveries {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /détails/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /détails de la livraison/i })).toBeInTheDocument();
    });

    // Vérifier que les détails de la requête sont affichés
    expect(screen.getByRole("heading", { name: /requête/i })).toBeInTheDocument();
    expect(screen.getByText("https://test.com/webhook")).toBeInTheDocument();
  });

  it("closes delivery details when close button is clicked", () => {
    render(<WebhookDeliveries {...defaultProps} />);
    
    // Ouvrir les détails
    fireEvent.click(screen.getByRole("button", { name: /détails/i }));
    expect(screen.getByText(/détails de la livraison/i)).toBeInTheDocument();
    
    // Fermer les détails
    fireEvent.click(screen.getByRole("button", { name: /fermer/i }));
    expect(screen.queryByText(/détails de la livraison/i)).not.toBeInTheDocument();
  });
});
