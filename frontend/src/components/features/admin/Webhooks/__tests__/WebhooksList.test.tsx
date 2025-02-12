import { render, screen, fireEvent } from "@testing-library/react";
import { WebhooksList } from "../WebhooksList";
import type { WebhookEndpoint } from "@/types/webhook";

const mockWebhooks: WebhookEndpoint[] = [
  {
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
    },
    stats: {
      totalDeliveries: 100,
      successfulDeliveries: 95,
      failedDeliveries: 5,
      averageLatency: 250,
      lastDelivery: {
        timestamp: "2025-01-29T12:00:00Z",
        status: "success",
        statusCode: 200,
      },
    },
  },
];

describe("WebhooksList", () => {
  const mockHandlers = {
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onToggle: jest.fn(),
    onViewDeliveries: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders webhook list correctly", () => {
    render(<WebhooksList webhooks={mockWebhooks} {...mockHandlers} />);

    // Vérifier que le titre est affiché
    expect(screen.getByText("Webhooks Configurés")).toBeInTheDocument();

    // Vérifier que les informations du webhook sont affichées
    expect(screen.getByText("Test Webhook")).toBeInTheDocument();
    expect(screen.getByText("https://test.com/webhook")).toBeInTheDocument();
    expect(screen.getByText("Test description")).toBeInTheDocument();
  });

  it("displays webhook events correctly", () => {
    render(<WebhooksList webhooks={mockWebhooks} {...mockHandlers} />);

    mockWebhooks[0].events.forEach((event) => {
      expect(screen.getByText(event)).toBeInTheDocument();
    });
  });

  it("displays webhook statistics correctly", () => {
    render(<WebhooksList webhooks={mockWebhooks} {...mockHandlers} />);

    const successRate = (95 / 100) * 100;
    expect(screen.getByText(`${successRate.toFixed(1)}%`)).toBeInTheDocument();
  });

  it("calls onEdit when edit button is clicked", () => {
    render(<WebhooksList webhooks={mockWebhooks} {...mockHandlers} />);

    const editButton = screen.getByText("Modifier");
    fireEvent.click(editButton);

    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockWebhooks[0]);
  });

  it("calls onDelete when delete button is clicked", () => {
    render(<WebhooksList webhooks={mockWebhooks} {...mockHandlers} />);

    const deleteButton = screen.getByText("Supprimer");
    fireEvent.click(deleteButton);

    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockWebhooks[0]);
  });

  it("calls onToggle when switch is clicked", () => {
    render(<WebhooksList webhooks={mockWebhooks} {...mockHandlers} />);

    const switchElement = screen.getByRole("switch");
    fireEvent.click(switchElement);

    expect(mockHandlers.onToggle).toHaveBeenCalledWith(mockWebhooks[0], false);
  });

  it("calls onViewDeliveries when view deliveries button is clicked", () => {
    render(<WebhooksList webhooks={mockWebhooks} {...mockHandlers} />);

    const viewDeliveriesButton = screen.getByText("Voir les livraisons");
    fireEvent.click(viewDeliveriesButton);

    expect(mockHandlers.onViewDeliveries).toHaveBeenCalledWith(mockWebhooks[0]);
  });

  it("renders empty state when no webhooks are provided", () => {
    render(<WebhooksList webhooks={[]} {...mockHandlers} />);

    expect(screen.queryByText("Test Webhook")).not.toBeInTheDocument();
  });

  it("displays correct status for last delivery", () => {
    render(<WebhooksList webhooks={mockWebhooks} {...mockHandlers} />);

    expect(screen.getByText("Succès")).toBeInTheDocument();
    expect(screen.getByText(/29\/01\/2025/)).toBeInTheDocument();
  });
});
