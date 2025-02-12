import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ServiceConsole from "../ServiceConsole";

const mockCustomers = [
  {
    id: "1",
    name: "Jean Dupont",
    ticketNumber: "A001",
    service: "Information",
    waitTime: 15,
  },
];

vi.mock("../../../hooks/useQueue", () => ({
  useQueue: () => ({
    customers: mockCustomers,
    loading: false,
    error: null,
  }),
}));

describe("ServiceConsole", () => {
  it("renders the initial state correctly", () => {
    render(<ServiceConsole />);
    
    // Vérifier que la liste des clients est affichée
    expect(screen.getByText("File d'attente")).toBeInTheDocument();
    
    // Vérifier que le statut par défaut est "Disponible"
    expect(screen.getByRole("combobox")).toHaveValue("available");
    
    // Vérifier que la zone d'attente est affichée
    expect(
      screen.getByText("Sélectionnez un client dans la file d'attente pour commencer")
    ).toBeInTheDocument();
  });

  it("allows selecting a customer from the queue", async () => {
    render(<ServiceConsole />);
    
    // Trouver et cliquer sur un client dans la file
    const customerCard = screen.getByText("Jean Dupont").closest("div");
    fireEvent.click(customerCard);
    
    // Vérifier que les détails du client sont affichés
    expect(screen.getByText("Jean Dupont")).toBeInTheDocument();
    expect(screen.getByText("Ticket #A001")).toBeInTheDocument();
    
    // Vérifier que les boutons d'action sont activés
    expect(screen.getByText("Terminer")).toBeEnabled();
  });

  it("handles agent status changes", () => {
    render(<ServiceConsole />);
    
    // Changer le statut de l'agent
    const statusSelect = screen.getByRole("combobox");
    fireEvent.change(statusSelect, { target: { value: "break" } });
    
    // Vérifier que le statut a changé
    expect(statusSelect).toHaveValue("break");
    
    // Vérifier que la console est désactivée en pause
    expect(
      screen.getByText("En attente d'un client")
    ).toBeInTheDocument();
  });

  it("supports chat functionality when customer is selected", () => {
    render(<ServiceConsole />);
    
    // Sélectionner un client
    const customerCard = screen.getByText("Jean Dupont").closest("div");
    fireEvent.click(customerCard);
    
    // Vérifier que la zone de chat est active
    const messageInput = screen.getByPlaceholderText("Tapez votre message...");
    expect(messageInput).toBeEnabled();
    
    // Tester l'envoi d'un message
    fireEvent.change(messageInput, { target: { value: "Bonjour" } });
    const sendButton = screen.getByText("Envoyer");
    fireEvent.click(sendButton);
    
    // Vérifier que le message apparaît dans le chat
    expect(screen.getByText("Bonjour")).toBeInTheDocument();
  });

  it("handles customer service completion", () => {
    render(<ServiceConsole />);
    
    // Sélectionner un client
    const customerCard = screen.getByText("Jean Dupont").closest("div");
    fireEvent.click(customerCard);
    
    // Terminer le service
    const endButton = screen.getByText("Terminer");
    fireEvent.click(endButton);
    
    // Vérifier que la console revient à l'état initial
    expect(
      screen.getByText("En attente d'un client")
    ).toBeInTheDocument();
  });
});
