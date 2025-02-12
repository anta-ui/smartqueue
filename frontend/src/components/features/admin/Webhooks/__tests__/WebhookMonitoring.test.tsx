import { render, screen } from "@testing-library/react";
import { WebhookMonitoring } from "../WebhookMonitoring";
import { useCache } from "@/hooks/cache/useCache";
import type { WebhookEndpoint } from "@/types/webhook";

// Mock du hook useCache
jest.mock("@/hooks/cache/useCache");
const mockUseCache = useCache as jest.MockedFunction<typeof useCache>;

const mockWebhook: WebhookEndpoint = {
  id: "1",
  organizationId: "org1",
  name: "Test Webhook",
  url: "https://test.com/webhook",
  description: "Test description",
  events: ["user.created"],
  active: true,
  secret: "secret123",
  createdAt: "2025-01-29T12:00:00Z",
  createdBy: {
    id: "user1",
    name: "Test User",
  },
  metadata: {
    environment: "production",
  },
  stats: {
    totalDeliveries: 1000,
    successfulDeliveries: 950,
    failedDeliveries: 50,
    averageLatency: 200,
    lastDelivery: {
      timestamp: "2025-01-29T12:00:00Z",
      status: "success",
      statusCode: 200,
    },
  },
};

const mockMetrics = {
  totalDeliveries: 1200,
  successRate: 96.5,
  averageLatency: 180,
  errorRate: 3.5,
  deliveriesByHour: Array.from({ length: 24 }, (_, i) => ({
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    total: 50,
    success: 48,
    failure: 2,
  })),
  topErrors: [
    {
      error: "Connection timeout",
      count: 25,
      percentage: 50,
    },
    {
      error: "Internal Server Error",
      count: 15,
      percentage: 30,
    },
    {
      error: "Bad Gateway",
      count: 10,
      percentage: 20,
    },
  ],
};

describe("WebhookMonitoring", () => {
  const defaultProps = {
    organizationId: "org1",
    webhookId: "webhook1",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock des deux appels à useCache
    mockUseCache
      .mockReturnValueOnce({ data: mockWebhook, loading: false })
      .mockReturnValueOnce({ data: mockMetrics, loading: false });
  });

  it("renders loading state correctly", () => {
    mockUseCache
      .mockReturnValueOnce({ data: undefined, loading: true })
      .mockReturnValueOnce({ data: undefined, loading: true });

    render(<WebhookMonitoring {...defaultProps} />);
    expect(screen.queryByText("Taux de Succès")).not.toBeInTheDocument();
  });

  it("renders metrics cards correctly", () => {
    render(<WebhookMonitoring {...defaultProps} />);

    // Vérifier les titres des cartes
    expect(screen.getByText("Taux de Succès")).toBeInTheDocument();
    expect(screen.getByText("Latence Moyenne")).toBeInTheDocument();
    expect(screen.getByText("Livraisons (24h)")).toBeInTheDocument();
    expect(screen.getByText("Taux d'Erreur")).toBeInTheDocument();

    // Vérifier les valeurs
    expect(screen.getByText("96.5%")).toBeInTheDocument();
    expect(screen.getByText("180ms")).toBeInTheDocument();
    expect(screen.getByText("1,200")).toBeInTheDocument();
    expect(screen.getByText("3.5%")).toBeInTheDocument();
  });

  it("displays success rate with correct color", () => {
    render(<WebhookMonitoring {...defaultProps} />);

    const successCard = screen.getByText("Taux de Succès").closest("[data-testid='metrics-card']");
    expect(successCard).toHaveClass("bg-green-50");
  });

  it("displays latency with correct color", () => {
    render(<WebhookMonitoring {...defaultProps} />);

    const latencyCard = screen.getByText("Latence Moyenne").closest("[data-testid='metrics-card']");
    expect(latencyCard).toHaveClass("bg-green-50");
  });

  it("displays error rate with correct color", () => {
    render(<WebhookMonitoring {...defaultProps} />);

    const errorCard = screen.getByText("Taux d'Erreur").closest("[data-testid='metrics-card']");
    expect(errorCard).toHaveClass("bg-green-50");
  });

  it("renders top errors section correctly", () => {
    render(<WebhookMonitoring {...defaultProps} />);

    expect(screen.getByText("Erreurs Fréquentes")).toBeInTheDocument();

    mockMetrics.topErrors.forEach((error) => {
      expect(screen.getByText(error.error)).toBeInTheDocument();
      expect(
        screen.getByText(
          `${error.count} occurrences (${error.percentage.toFixed(1)}%)`
        )
      ).toBeInTheDocument();
    });
  });

  it("calculates metric changes correctly", () => {
    render(<WebhookMonitoring {...defaultProps} />);

    // Taux de succès : 96.5% - 95% = 1.5%
    expect(screen.getByText("+1.5%")).toBeInTheDocument();

    // Latence : 180ms - 200ms = -20ms
    expect(screen.getByText("-20ms")).toBeInTheDocument();

    // Livraisons : 1200 - 1000 = 200
    expect(screen.getByText("+200")).toBeInTheDocument();

    // Taux d'erreur : 3.5% - 5% = -1.5%
    expect(screen.getByText("-1.5%")).toBeInTheDocument();
  });

  it("handles missing data gracefully", () => {
    mockUseCache
      .mockReturnValueOnce({ data: mockWebhook, loading: false })
      .mockReturnValueOnce({ data: undefined, loading: false });

    render(<WebhookMonitoring {...defaultProps} />);
    expect(screen.queryByText("Taux de Succès")).not.toBeInTheDocument();
  });
});
