import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ServicePointManager from "../ServicePointManager";

const mockServicePoints = [
  {
    id: "SP1",
    name: "Guichet 1",
    status: "active",
    currentAgent: {
      id: "A1",
      name: "Jean Martin",
      status: "busy",
    },
    currentTicket: {
      number: "A001",
      customerName: "Pierre Dupont",
      startTime: "2025-01-29T14:30:00Z",
      duration: 15,
    },
    metrics: {
      servedToday: 25,
      avgServiceTime: 12,
      efficiency: 85,
    },
  },
  {
    id: "SP2",
    name: "Guichet 2",
    status: "active",
    currentAgent: {
      id: "A2",
      name: "Marie Dubois",
      status: "available",
    },
    metrics: {
      servedToday: 18,
      avgServiceTime: 15,
      efficiency: 78,
    },
  },
];

vi.mock("../../../hooks/useServicePoints", () => ({
  useServicePoints: () => ({
    servicePoints: mockServicePoints,
    loading: false,
    error: null,
    updateServicePoint: vi.fn(),
    updateAgentStatus: vi.fn(),
  }),
}));

describe("ServicePointManager", () => {
  it("renders all service points correctly", () => {
    render(<ServicePointManager />);
    
    // Vérifier que tous les guichets sont affichés
    expect(screen.getByText("Guichet 1")).toBeInTheDocument();
    expect(screen.getByText("Guichet 2")).toBeInTheDocument();
    
    // Vérifier les statuts
    expect(screen.getByText("active")).toBeInTheDocument();
  });

  it("displays service point details when selected", () => {
    render(<ServicePointManager />);
    
    // Sélectionner un point de service
    const servicePoint = screen.getByText("Guichet 1").closest("div");
    fireEvent.click(servicePoint);
    
    // Vérifier que les détails sont affichés
    expect(screen.getByText("Contrôle - Guichet 1")).toBeInTheDocument();
    expect(screen.getByText("État du point de service")).toBeInTheDocument();
  });

  it("allows changing service point status", () => {
    render(<ServicePointManager />);
    
    // Sélectionner un point de service
    const servicePoint = screen.getByText("Guichet 1").closest("div");
    fireEvent.click(servicePoint);
    
    // Changer le statut
    const statusSelect = screen.getByRole("combobox");
    fireEvent.change(statusSelect, { target: { value: "maintenance" } });
    
    // Vérifier que le statut a changé
    expect(screen.getAllByText("maintenance")[0]).toBeInTheDocument();
  });

  it("displays current agent information", () => {
    render(<ServicePointManager />);
    
    // Vérifier les informations de l'agent
    expect(screen.getByText("Jean Martin")).toBeInTheDocument();
    expect(screen.getByText("busy")).toBeInTheDocument();
  });

  it("shows current ticket information when available", () => {
    render(<ServicePointManager />);
    
    // Vérifier les informations du ticket en cours
    expect(screen.getByText("#A001 - Pierre Dupont")).toBeInTheDocument();
    expect(screen.getByText("15min")).toBeInTheDocument();
  });

  it("handles agent status changes", () => {
    render(<ServicePointManager />);
    
    // Sélectionner un point de service
    const servicePoint = screen.getByText("Guichet 1").closest("div");
    fireEvent.click(servicePoint);
    
    // Changer le statut de l'agent
    const breakButton = screen.getByText("Pause");
    fireEvent.click(breakButton);
    
    // Vérifier que le statut a changé
    expect(screen.getAllByText("break")[0]).toBeInTheDocument();
  });

  it("displays performance metrics", () => {
    render(<ServicePointManager />);
    
    // Vérifier que les métriques sont affichées
    expect(screen.getByText("Servis aujourd'hui")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("supports calling next ticket", () => {
    render(<ServicePointManager />);
    
    // Sélectionner un point de service
    const servicePoint = screen.getByText("Guichet 1").closest("div");
    fireEvent.click(servicePoint);
    
    // Vérifier que le bouton est actif
    const nextButton = screen.getByText("Appeler prochain ticket");
    expect(nextButton).toBeEnabled();
    
    // Simuler l'appel du prochain ticket
    fireEvent.click(nextButton);
  });
});
