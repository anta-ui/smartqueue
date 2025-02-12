describe("Agent Service Workflow", () => {
  beforeEach(() => {
    // Se connecter en tant qu'agent
    cy.login("agent@example.com", "password");
    cy.visit("/agent/console");
  });

  it("should handle a complete service workflow", () => {
    // Vérifier l'état initial
    cy.get("[data-testid=agent-status]").should("have.text", "Disponible");
    cy.get("[data-testid=queue-list]").should("be.visible");

    // Sélectionner un client
    cy.get("[data-testid=customer-card]").first().click();
    cy.get("[data-testid=customer-details]").should("be.visible");

    // Envoyer un message
    cy.get("[data-testid=chat-input]")
      .type("Bonjour, comment puis-je vous aider ?");
    cy.get("[data-testid=send-message]").click();
    cy.get("[data-testid=chat-messages]")
      .should("contain", "Bonjour, comment puis-je vous aider ?");

    // Terminer le service
    cy.get("[data-testid=end-service]").click();
    cy.get("[data-testid=service-summary]").should("be.visible");
    cy.get("[data-testid=confirm-end]").click();

    // Vérifier le retour à l'état initial
    cy.get("[data-testid=agent-status]").should("have.text", "Disponible");
  });

  it("should handle agent status changes", () => {
    // Changer le statut en pause
    cy.get("[data-testid=status-select]").click();
    cy.get("[data-testid=status-break]").click();
    cy.get("[data-testid=agent-status]").should("have.text", "En pause");

    // Vérifier que la file est désactivée
    cy.get("[data-testid=queue-list]").should("be.disabled");

    // Revenir disponible
    cy.get("[data-testid=status-select]").click();
    cy.get("[data-testid=status-available]").click();
    cy.get("[data-testid=agent-status]").should("have.text", "Disponible");
  });

  it("should manage service point operations", () => {
    // Aller à la gestion des points de service
    cy.get("[data-testid=service-point-tab]").click();

    // Sélectionner un guichet
    cy.get("[data-testid=service-point]").first().click();
    cy.get("[data-testid=point-controls]").should("be.visible");

    // Changer l'état du guichet
    cy.get("[data-testid=point-status]").click();
    cy.get("[data-testid=status-maintenance]").click();
    cy.get("[data-testid=service-point]")
      .first()
      .should("contain", "maintenance");

    // Appeler le prochain ticket
    cy.get("[data-testid=next-ticket]").click();
    cy.get("[data-testid=current-ticket]").should("be.visible");
  });

  it("should track customer interactions", () => {
    // Aller à l'historique
    cy.get("[data-testid=history-tab]").click();

    // Vérifier les interactions
    cy.get("[data-testid=interaction-list]").should("be.visible");
    cy.get("[data-testid=interaction-card]").should("have.length.gt", 0);

    // Filtrer les interactions
    cy.get("[data-testid=status-filter]").click();
    cy.get("[data-testid=filter-resolved]").click();
    cy.get("[data-testid=interaction-card]")
      .should("have.length.gt", 0)
      .and("contain", "resolved");

    // Ajouter une note
    cy.get("[data-testid=interaction-card]").first().click();
    cy.get("[data-testid=add-note]")
      .type("Note de test pour l'interaction");
    cy.get("[data-testid=save-note]").click();
    cy.get("[data-testid=notes-list]")
      .should("contain", "Note de test pour l'interaction");
  });
});
