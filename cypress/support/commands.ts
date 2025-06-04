import "@testing-library/cypress/add-commands";

// Custom command to login
Cypress.Commands.add("login", (email: string, password: string) => {
  // Intercept login request
  cy.intercept("POST", "http://localhost:8000/api/users/login/", {
    statusCode: 200,
    delay: 300,
    body: {
      access: "fake-jwt-token",
      refresh: "fake-refresh-token",
    },
  }).as("loginRequest");

  // Intercept user profile request
  cy.intercept("GET", "http://localhost:8000/api/users/me/", {
    statusCode: 200,
    body: {
      id: 1,
      email: email,
      profile: {
        name: "Test User",
        gender: "male",
        dob: "1990-01-01",
        createdAt: "2024-01-01T00:00:00Z",
        avatarUrl: null,
        avatarColor: "bg-blue-500",
      },
    },
  }).as("getCurrentUser");

  cy.visit("/login");
  cy.get("#email").type(email);
  cy.get("#password").type(password);
  cy.get('button[type="submit"]').click();

  // Wait for requests to complete
  cy.wait("@loginRequest");
  cy.wait("@getCurrentUser");

  // Verify we're redirected to chat
  cy.url().should("include", "/chat");
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
    }
  }
}
