describe("Admin Monitoring", () => {
  beforeEach(() => {
    // Se connecter en tant qu'admin
    cy.login("admin@example.com", "password");
    cy.visit("/admin/monitoring");
  });

  it("should display system health overview", () => {
    // Vérifier les composants du tableau de bord
    cy.get("[data-testid=health-overview]").should("be.visible");
    cy.get("[data-testid=service-card]").should("have.length.gt", 0);

    // Vérifier les statuts des services
    cy.get("[data-testid=service-status]")
      .should("contain", "operational")
      .and("contain", "degraded");

    // Vérifier les métriques
    cy.get("[data-testid=service-metrics]").within(() => {
      cy.get("[data-testid=latency]").should("be.visible");
      cy.get("[data-testid=uptime]").should("be.visible");
    });
  });

  it("should show real-time updates", () => {
    // Observer les mises à jour en temps réel
    cy.get("[data-testid=last-update]").invoke("text").as("initialTime");

    // Attendre la mise à jour
    cy.wait(5000);

    cy.get("[data-testid=last-update]")
      .invoke("text")
      .should("not.eq", "@initialTime");

    // Vérifier que les métriques sont mises à jour
    cy.get("[data-testid=latency-value]")
      .invoke("text")
      .should("not.eq", "@initialLatency");
  });

  it("should handle performance metrics visualization", () => {
    // Aller à l'onglet performance
    cy.get("[data-testid=performance-tab]").click();

    // Vérifier les graphiques
    cy.get("[data-testid=performance-charts]").within(() => {
      cy.get("[data-testid=cpu-chart]").should("be.visible");
      cy.get("[data-testid=memory-chart]").should("be.visible");
      cy.get("[data-testid=requests-chart]").should("be.visible");
    });

    // Changer la période
    cy.get("[data-testid=time-range]").click();
    cy.get("[data-testid=range-24h]").click();

    // Vérifier la mise à jour des graphiques
    cy.get("[data-testid=chart-loading]").should("be.visible");
    cy.get("[data-testid=chart-loading]").should("not.exist");
  });

  it("should manage alerts and notifications", () => {
    // Simuler une alerte
    cy.intercept("GET", "/api/alerts", {
      statusCode: 200,
      body: {
        alerts: [
          {
            id: "1",
            severity: "high",
            message: "High CPU usage detected",
            timestamp: new Date().toISOString()
          }
        ]
      }
    });

    // Vérifier l'affichage de l'alerte
    cy.get("[data-testid=alerts-panel]").should("be.visible");
    cy.get("[data-testid=alert-card]")
      .should("contain", "High CPU usage detected");

    // Gérer l'alerte
    cy.get("[data-testid=alert-actions]").click();
    cy.get("[data-testid=acknowledge-alert]").click();

    // Vérifier la mise à jour du statut
    cy.get("[data-testid=alert-status]")
      .should("contain", "acknowledged");
  });

  it("should export monitoring data", () => {
    // Ouvrir les options d'export
    cy.get("[data-testid=export-btn]").click();

    // Configurer l'export
    cy.get("[data-testid=export-options]").within(() => {
      cy.get("[data-testid=date-range]").click();
      cy.get("[data-testid=last-7-days]").click();
      
      cy.get("[data-testid=metrics-select]").click();
      cy.get("[data-testid=cpu-usage]").click();
      cy.get("[data-testid=memory-usage]").click();
    });

    // Lancer l'export
    cy.get("[data-testid=start-export]").click();

    // Vérifier le téléchargement
    cy.readFile("cypress/downloads/monitoring-report.csv")
      .should("exist");
  });

  it("should configure monitoring settings", () => {
    // Accéder aux paramètres
    cy.get("[data-testid=settings-btn]").click();

    // Modifier les seuils d'alerte
    cy.get("[data-testid=alert-thresholds]").within(() => {
      cy.get("[data-testid=cpu-threshold]")
        .clear()
        .type("90");
      
      cy.get("[data-testid=memory-threshold]")
        .clear()
        .type("85");
    });

    // Sauvegarder les changements
    cy.get("[data-testid=save-settings]").click();

    // Vérifier la confirmation
    cy.get("[data-testid=settings-saved]")
      .should("be.visible");

    // Vérifier l'application des nouveaux seuils
    cy.get("[data-testid=cpu-alert]")
      .should("have.attr", "data-threshold", "90");
  });
});
