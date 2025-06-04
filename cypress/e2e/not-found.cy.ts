/// <reference types="cypress" />

describe("NotFound Page", () => {
  it("should display 404 page when visiting non-existent route", () => {
    // Visit a non-existent route
    cy.visit("/non-existent-page", { failOnStatusCode: false });

    // Verify 404 page elements
    cy.get('[data-testid="not-found-page"]')
      .should("exist")
      .and("have.class", "min-h-screen")
      .and("have.class", "bg-gray-100");

    // Check content and styling
    cy.contains("h1", "404")
      .should("be.visible")
      .and("have.class", "text-4xl")
      .and("have.class", "font-bold");

    cy.contains("p", "Oops! Page not found")
      .should("be.visible")
      .and("have.class", "text-xl")
      .and("have.class", "text-gray-600");

    // Verify return home link exists and is styled correctly
    cy.get('[data-testid="return-home-link"]')
      .should("be.visible")
      .and("have.text", "Return to Home")
      .and("have.class", "text-blue-500")
      .and("have.attr", "href", "/");
  });

  it("should navigate back to home page when clicking the link", () => {
    // Visit a non-existent route
    cy.visit("/random-non-existent-route", { failOnStatusCode: false });

    // Click the return home link
    cy.get('[data-testid="return-home-link"]').click();

    // Verify we are redirected to home page
    cy.url().should("eq", Cypress.config().baseUrl + "/");
  });

  it("should display 404 page for invalid dynamic routes", () => {
    // Visit invalid chat route
    cy.visit("/chat/999999", { failOnStatusCode: false });

    // Verify 404 page is shown with correct elements
    cy.get('[data-testid="not-found-page"]').should("exist");
    cy.contains("h1", "404").should("be.visible");
    cy.contains("Oops! Page not found").should("be.visible");

    // Visit invalid profile route
    cy.visit("/profile/999999", { failOnStatusCode: false });

    // Verify 404 page is shown with correct elements
    cy.get('[data-testid="not-found-page"]').should("exist");
    cy.contains("h1", "404").should("be.visible");
    cy.contains("Oops! Page not found").should("be.visible");
  });

  it("should preserve navigation history when going back", () => {
    // Start from home page
    cy.visit("/");

    // Navigate to non-existent page
    cy.visit("/does-not-exist", { failOnStatusCode: false });

    // Verify 404 page is shown
    cy.get('[data-testid="not-found-page"]').should("exist");

    // Go back using browser navigation
    cy.go("back");

    // Verify we are back on home page
    cy.url().should("eq", Cypress.config().baseUrl + "/");
  });

  // Add a test to verify the effect runs on route change
  it("should log error when navigating to non-existent route", () => {
    // Start by stubbing console.error on the window object
    cy.visit("/", {
      onBeforeLoad(win) {
        cy.stub(win.console, "error").as("consoleError");
      },
    });

    // Then use router navigation instead of direct visit
    cy.window().then((win) => {
      win.history.pushState({}, "", "/another-non-existent-path");
    });

    // Force a re-render to ensure effect runs
    cy.get("body").click();

    // Verify the console.error was called
    cy.get("@consoleError")
      .should("be.called")
      .and(
        "be.calledWith",
        "404 Error: User attempted to access non-existent route:",
        "/another-non-existent-path",
      );
  });
});
