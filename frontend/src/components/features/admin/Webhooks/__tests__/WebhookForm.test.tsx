import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WebhookForm from "../WebhookForm";
import type { WebhookEndpoint } from "@/types/webhook";
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock des composants Dialog
vi.mock("@/components/common/Dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) => open ? children : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock des autres composants
vi.mock("@/components/common/Button", () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

vi.mock("@/components/common/Input", () => ({
  Input: ({ id, value, onChange, error, ...props }: any) => (
    <input id={id} value={value} onChange={onChange} aria-label={props["aria-label"]} {...props} />
  ),
}));

vi.mock("@/components/common/Textarea", () => ({
  Textarea: ({ id, value, onChange, error, ...props }: any) => (
    <textarea id={id} value={value} onChange={onChange} aria-label={props["aria-label"]} {...props} />
  ),
}));

vi.mock("@/components/common/Select", () => ({
  Select: ({ id, value, onChange, children, ...props }: any) => (
    <select id={id} value={value} onChange={onChange} {...props}>
      {children}
    </select>
  ),
}));

vi.mock("@/components/common/Badge", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

const mockWebhook: WebhookEndpoint = {
  id: "1",
  organizationId: "org1",
  name: "Test Webhook",
  url: "https://test.com/webhook",
  description: "Test description",
  events: ["user.created", "user.updated"],
  active: true,
  secret: "secret123",
  createdAt: "2025-01-29T12:00:00Z",
  createdBy: {
    id: "user1",
    name: "Test User",
  },
  metadata: {
    environment: "production",
    retryPolicy: {
      maxAttempts: 3,
      backoffRate: 2,
    },
    timeout: 5000,
    headers: {
      "X-Custom-Header": "test",
    },
  },
  stats: {
    totalDeliveries: 0,
    successfulDeliveries: 0,
    failedDeliveries: 0,
    averageLatency: 0,
  },
};

vi.setConfig({ testTimeout: 15000 });

describe("WebhookForm", () => {
  const mockHandlers = {
    onClose: vi.fn(),
    onSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders create form correctly", () => {
    render(
      <WebhookForm
        open={true}
        {...mockHandlers}
      />
    );

    expect(screen.getByText("Nouveau Webhook")).toBeInTheDocument();
    expect(screen.getByLabelText(/Nom/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/URL/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
  });

  it("renders edit form with webhook data", () => {
    render(
      <WebhookForm
        webhook={mockWebhook}
        open={true}
        {...mockHandlers}
      />
    );

    expect(screen.getByText("Modifier le Webhook")).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockWebhook.name)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockWebhook.url)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockWebhook.description!)).toBeInTheDocument();
  });

  it("validates required fields", async () => {
    render(
      <WebhookForm
        open={true}
        {...mockHandlers}
      />
    );

    const submitButton = screen.getByText("Créer");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Le nom est requis")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("L'URL doit être valide")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("Au moins un événement est requis")).toBeInTheDocument();
    });

    expect(mockHandlers.onSubmit).not.toHaveBeenCalled();
  });

  it("submits form with valid data", async () => {
    render(
      <WebhookForm
        open={true}
        {...mockHandlers}
      />
    );

    // Remplir le formulaire
    await userEvent.type(screen.getByLabelText("Nom"), "Test Webhook");
    await userEvent.type(screen.getByLabelText("URL"), "https://test.com/webhook");

    // Sélectionner des événements
    const userCreatedEvent = screen.getByTestId("event-user.created");
    await userEvent.click(userCreatedEvent);

    // Soumettre le formulaire
    const submitButton = screen.getByText("Créer");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockHandlers.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Test Webhook",
          url: "https://test.com/webhook",
          events: ["user.created"],
          metadata: expect.objectContaining({
            environment: "production",
            retryPolicy: expect.objectContaining({
              maxAttempts: 3,
              backoffRate: 2,
            }),
            timeout: 5000,
          }),
        })
      );
    }, { timeout: 10000 });
  });

  it("handles custom headers correctly", async () => {
    render(
      <WebhookForm
        webhook={mockWebhook}
        open={true}
        {...mockHandlers}
      />
    );

    // Vérifier que les en-têtes existants sont affichés
    expect(screen.getByDisplayValue("X-Custom-Header")).toBeInTheDocument();
    expect(screen.getByDisplayValue("test")).toBeInTheDocument();

    // Ajouter un nouvel en-tête
    const addButton = screen.getByText("Ajouter");
    await userEvent.click(addButton);

    const headerInputs = screen.getAllByPlaceholderText("Nom");
    const valueInputs = screen.getAllByPlaceholderText("Valeur");
    const lastHeaderInput = headerInputs[headerInputs.length - 1];
    const lastValueInput = valueInputs[valueInputs.length - 1];

    await userEvent.type(lastHeaderInput, "X-New-Header");
    await userEvent.type(lastValueInput, "new-value");

    // Soumettre le formulaire
    const submitButton = screen.getByText("Mettre à jour");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockHandlers.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            headers: expect.objectContaining({
              "X-Custom-Header": "test",
              "X-New-Header": "new-value",
            }),
          }),
        })
      );
    }, { timeout: 10000 });
  });

  it("closes form when cancel is clicked", () => {
    render(
      <WebhookForm
        open={true}
        {...mockHandlers}
      />
    );

    const cancelButton = screen.getByText("Annuler");
    fireEvent.click(cancelButton);

    expect(mockHandlers.onClose).toHaveBeenCalled();
  });
});
