import { render, screen, act, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import SystemHealthMonitor from "../SystemHealthMonitor";

const mockServices = [
  {
    id: "api",
    name: "API REST",
    status: "operational",
    latency: 45,
    uptime: 99.99,
  },
  {
    id: "websocket",
    name: "WebSocket",
    status: "degraded",
    latency: 150,
    uptime: 99.5,
  },
  {
    id: "database",
    name: "Base de données",
    status: "operational",
    latency: 25,
    uptime: 99.99,
  },
];

vi.mock("../../../hooks/useSystemHealth", () => ({
  useSystemHealth: () => ({
    services: mockServices,
    loading: false,
    error: null,
    lastUpdate: new Date("2025-01-29T15:34:28Z").toISOString(),
  }),
}));

describe("SystemHealthMonitor", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders all service statuses correctly", () => {
    render(<SystemHealthMonitor />);
    
    // Vérifier que tous les services sont affichés
    expect(screen.getByText("API REST")).toBeInTheDocument();
    expect(screen.getByText("WebSocket")).toBeInTheDocument();
    expect(screen.getByText("Base de données")).toBeInTheDocument();
  });

  it("shows correct status indicators", () => {
    render(<SystemHealthMonitor />);
    
    // Vérifier les indicateurs de statut
    const operationalServices = screen.getAllByText("operational");
    const degradedServices = screen.getAllByText("degraded");
    
    expect(operationalServices).toHaveLength(2);
    expect(degradedServices).toHaveLength(1);
  });

  it("displays latency information", () => {
    render(<SystemHealthMonitor />);
    
    // Vérifier que les informations de latence sont affichées
    expect(screen.getByText("45ms")).toBeInTheDocument();
    expect(screen.getByText("150ms")).toBeInTheDocument();
  });

  it("shows uptime percentages", () => {
    render(<SystemHealthMonitor />);
    
    // Vérifier les pourcentages d'uptime
    expect(screen.getByText("99.99%")).toBeInTheDocument();
    expect(screen.getByText("99.5%")).toBeInTheDocument();
  });

  it("updates metrics periodically", () => {
    const { rerender } = render(<SystemHealthMonitor />);
    
    // Vérifier la mise à jour des métriques
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    
    rerender(<SystemHealthMonitor />);
    
    // Les valeurs devraient être mises à jour
    expect(screen.getByText(/ms/)).toBeInTheDocument();
  });

  it("shows last update timestamp", () => {
    render(<SystemHealthMonitor />);
    
    // Vérifier que l'horodatage est affiché
    expect(screen.getByText(/Dernière mise à jour/)).toBeInTheDocument();
  });

  it("handles service tooltips", async () => {
    render(<SystemHealthMonitor />);
    
    // Simuler le survol d'un service
    const service = screen.getByText("API REST").closest("div");
    fireEvent.mouseEnter(service);
    
    // Vérifier que le tooltip s'affiche
    expect(await screen.findByRole("tooltip")).toBeInTheDocument();
  });

  it("displays performance graphs", () => {
    render(<SystemHealthMonitor />);
    
    // Vérifier que les graphiques sont présents
    expect(screen.getByText("Latence API")).toBeInTheDocument();
    expect(screen.getByText("Requêtes/sec")).toBeInTheDocument();
  });
});
