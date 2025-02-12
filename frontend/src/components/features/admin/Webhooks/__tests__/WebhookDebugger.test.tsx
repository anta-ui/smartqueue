import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import WebhookDebugger from "../WebhookDebugger";
import type { WebhookDelivery } from "@/types/webhook";
import { vi, describe, it, expect } from 'vitest';

// Mock navigator.clipboard.writeText
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

const mockDelivery: WebhookDelivery = {
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
    {
      timestamp: "2025-01-29T11:59:00Z",
      status: "failure",
      statusCode: 500,
      error: "Internal Server Error",
      duration: 200,
    },
  ],
  request: {
    url: "https://test.com/webhook",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Custom-Header": "test",
    },
    body: JSON.stringify({ userId: "123", email: "test@example.com" }),
  },
  response: {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ success: true }),
  },
};

describe("WebhookDebugger", () => {
  const defaultProps = {
    delivery: mockDelivery,
    open: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders delivery details correctly", () => {
    render(<WebhookDebugger {...defaultProps} />);

    // Vérifier les informations de base
    expect(screen.getByText(mockDelivery.id)).toBeInTheDocument();
    expect(screen.getByText(mockDelivery.event)).toBeInTheDocument();
    expect(screen.getByRole("status", { name: /success/i })).toBeInTheDocument();
    expect(screen.getByText("200")).toBeInTheDocument();
    expect(screen.getByText("150ms")).toBeInTheDocument();
  });

  it("displays attempts correctly", () => {
    render(<WebhookDebugger {...defaultProps} />);

    // Ouvrir l'accordéon des tentatives
    fireEvent.click(screen.getByRole("button", { name: /tentatives/i }));

    // Vérifier que toutes les tentatives sont affichées
    mockDelivery.attempts.forEach((attempt) => {
      expect(screen.getByRole("status", { name: attempt.status })).toBeInTheDocument();
      expect(screen.getByText(`${attempt.duration}ms`)).toBeInTheDocument();
      expect(screen.getByText(attempt.statusCode.toString())).toBeInTheDocument();
    });
  });

  it("displays request details correctly", () => {
    render(<WebhookDebugger {...defaultProps} />);

    // Ouvrir l'accordéon de la requête
    fireEvent.click(screen.getByRole("button", { name: /requête/i }));

    // Vérifier les détails de la requête
    expect(screen.getByText(mockDelivery.request.url)).toBeInTheDocument();
    expect(screen.getByText(mockDelivery.request.method)).toBeInTheDocument();
    
    // Vérifier les en-têtes
    Object.entries(mockDelivery.request.headers).forEach(([key, value]) => {
      expect(screen.getByText(new RegExp(`${key}:.*${value}`))).toBeInTheDocument();
    });

    // Vérifier le corps de la requête
    const requestBody = JSON.parse(mockDelivery.request.body);
    expect(screen.getByText(new RegExp(requestBody.userId))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(requestBody.email))).toBeInTheDocument();
  });

  it("displays response details correctly", () => {
    render(<WebhookDebugger {...defaultProps} />);

    // Ouvrir l'accordéon de la réponse
    fireEvent.click(screen.getByRole("button", { name: /réponse/i }));

    // Vérifier le code de statut
    expect(screen.getByText(mockDelivery.response!.statusCode.toString())).toBeInTheDocument();

    // Vérifier les en-têtes
    Object.entries(mockDelivery.response!.headers).forEach(([key, value]) => {
      expect(screen.getByText(new RegExp(`${key}:.*${value}`))).toBeInTheDocument();
    });

    // Vérifier le corps de la réponse
    expect(screen.getByText(/success": true/)).toBeInTheDocument();
  });

  it("toggles JSON formatting", () => {
    render(<WebhookDebugger {...defaultProps} />);

    // Par défaut, le JSON est compressé
    const toggleButton = screen.getByRole("button", { name: /étendre json/i });
    fireEvent.click(toggleButton);

    // Après le clic, le bouton devrait afficher "Compresser JSON"
    expect(screen.getByRole("button", { name: /compresser json/i })).toBeInTheDocument();
  });

  it("copies content to clipboard", async () => {
    render(<WebhookDebugger {...defaultProps} />);

    // Ouvrir l'accordéon de la requête
    fireEvent.click(screen.getByRole("button", { name: /requête/i }));

    // Cliquer sur le bouton de copie des en-têtes
    const copyButtons = screen.getAllByRole("button", { name: /copier/i });
    fireEvent.click(copyButtons[0]);

    // Vérifier que writeText a été appelé avec les en-têtes formatés
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining("Content-Type: application/json")
      );
    });
  });

  it("handles malformed JSON gracefully", () => {
    const malformedDelivery = {
      ...mockDelivery,
      request: {
        ...mockDelivery.request,
        body: "malformed json",
      },
    };

    render(<WebhookDebugger delivery={malformedDelivery} open={true} onClose={vi.fn()} />);

    // Ouvrir l'accordéon de la requête
    fireEvent.click(screen.getByRole("button", { name: /requête/i }));

    // Le JSON malformé devrait être affiché tel quel
    expect(screen.getByText("malformed json")).toBeInTheDocument();
  });

  it("calls onClose when dialog is closed", () => {
    const onClose = vi.fn();
    render(<WebhookDebugger {...defaultProps} onClose={onClose} />);

    // Simuler la fermeture de la boîte de dialogue
    fireEvent.click(screen.getByRole("button", { name: /fermer/i }));

    expect(onClose).toHaveBeenCalled();
  });
});
