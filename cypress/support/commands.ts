import "@testing-library/cypress/add-commands";

// Custom command to login
Cypress.Commands.add("login", (email: string, password: string) => {
  cy.visit("/login");
  cy.findByLabelText(/email/i).type(email);
  cy.findByLabelText(/password/i).type(password);
  cy.findByRole("button", { name: /sign in/i }).click();
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
    }
  }
}
