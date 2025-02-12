describe("Kiosk Ticket Flow", () => {
  beforeEach(() => {
    cy.visit("/kiosk");
  });

  it("should complete a full ticket creation flow", () => {
    // Vérifier la page d'accueil
    cy.get("[data-testid=welcome-screen]").should("be.visible");
    cy.get("[data-testid=service-buttons]").should("have.length", 4);

    // Sélectionner "Prendre un ticket"
    cy.get("[data-testid=new-ticket-btn]").click();

    // Sélectionner un service
    cy.get("[data-testid=service-list]").should("be.visible");
    cy.get("[data-testid=service-card]").first().click();

    // Vérifier les informations du service
    cy.get("[data-testid=service-details]").should("be.visible");
    cy.get("[data-testid=wait-time]").should("be.visible");
    cy.get("[data-testid=queue-length]").should("be.visible");

    // Confirmer la sélection
    cy.get("[data-testid=confirm-service]").click();

    // Options de notification
    cy.get("[data-testid=notification-options]").should("be.visible");

    // Activer les notifications par email
    cy.get("[data-testid=email-checkbox]").click();
    cy.get("[data-testid=email-input]")
      .type("test@example.com");

    // Imprimer le ticket
    cy.get("[data-testid=print-ticket]").click();

    // Vérifier le ticket imprimé
    cy.get("[data-testid=ticket-preview]").should("be.visible");
    cy.get("[data-testid=ticket-number]").should("be.visible");
    cy.get("[data-testid=ticket-qr]").should("be.visible");

    // Confirmation finale
    cy.get("[data-testid=success-screen]").should("be.visible");
    cy.get("[data-testid=estimated-wait]").should("be.visible");
  });

  it("should handle QR code scanning", () => {
    // Sélectionner l'option Scanner QR
    cy.get("[data-testid=scan-qr-btn]").click();

    // Vérifier l'activation de la caméra
    cy.get("[data-testid=qr-scanner]").should("be.visible");

    // Simuler un scan réussi
    cy.window().then((win) => {
      win.postMessage({ type: "qr-result", data: "TICKET-123" }, "*");
    });

    // Vérifier le résultat du scan
    cy.get("[data-testid=scan-result]").should("be.visible");
    cy.get("[data-testid=ticket-status]").should("be.visible");
  });

  it("should support accessibility features", () => {
    // Activer le mode haute visibilité
    cy.get("[data-testid=accessibility-btn]").click();
    cy.get("[data-testid=high-contrast]").click();

    // Vérifier les changements visuels
    cy.get("body").should("have.class", "high-contrast");

    // Tester la navigation au clavier
    cy.get("[data-testid=new-ticket-btn]").focus();
    cy.realPress("Enter");
    cy.get("[data-testid=service-list]").should("be.visible");

    // Activer l'aide vocale
    cy.get("[data-testid=voice-assist]").click();
    cy.get("[data-testid=voice-controls]").should("be.visible");
  });

  it("should handle system status changes", () => {
    // Simuler une maintenance
    cy.intercept("GET", "/api/system/status", {
      statusCode: 200,
      body: { status: "maintenance" }
    });

    cy.reload();

    // Vérifier le message de maintenance
    cy.get("[data-testid=maintenance-screen]").should("be.visible");
    cy.get("[data-testid=maintenance-message]")
      .should("contain", "maintenance");

    // Vérifier la désactivation des boutons
    cy.get("[data-testid=new-ticket-btn]").should("be.disabled");
  });

  it("should support multiple languages", () => {
    // Changer la langue
    cy.get("[data-testid=language-btn]").click();
    cy.get("[data-testid=lang-fr]").click();

    // Vérifier la traduction
    cy.get("[data-testid=welcome-text]")
      .should("contain", "Bienvenue");

    // Parcourir le flux en français
    cy.get("[data-testid=new-ticket-btn]")
      .should("contain", "Prendre un ticket")
      .click();

    cy.get("[data-testid=service-list]")
      .should("contain", "Choisir un service");
  });
});
