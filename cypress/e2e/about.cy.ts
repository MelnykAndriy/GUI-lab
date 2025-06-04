describe("About Page", () => {
  beforeEach(() => {
    cy.visit("/about");
  });

  it("displays the logo with correct size and styling", () => {
    cy.get('[data-testid="logo-container"]')
      .should("be.visible")
      .should("have.class", "w-24")
      .should("have.class", "h-24")
      .should("have.class", "mx-auto")
      .should("have.class", "flex")
      .should("have.class", "items-center")
      .should("have.class", "justify-center")
      .should("have.class", "mb-4");

    cy.get('[data-testid="msgtrik-logo"]')
      .should("exist")
      .should("have.class", "scale-150");
  });

  it("displays the tagline with correct styling", () => {
    cy.get('[data-testid="tagline-container"]')
      .should("have.class", "max-w-3xl")
      .should("have.class", "mx-auto")
      .should("have.class", "text-center")
      .should("have.class", "mb-12");

    cy.get('[data-testid="tagline"]')
      .should("contain", "A simple, modern chat application")
      .should("have.class", "text-xl")
      .should("have.class", "text-muted-foreground");
  });

  it("displays the main description sections with proper styling", () => {
    // First description paragraph
    cy.get('[data-testid="description-1"]')
      .should("be.visible")
      .should("have.class", "mb-4")
      .should("contain", "Msgtrik is a modern web application")
      .should("contain", "connect with friends, family, and colleagues");

    // Second description paragraph
    cy.get('[data-testid="description-2"]')
      .should("be.visible")
      .should("have.class", "mb-4")
      .should("contain", "Built with the latest web technologies")
      .should("contain", "responsive design");
  });

  it("has a properly styled registration link", () => {
    cy.get('[data-testid="register-link"]')
      .should("have.attr", "href", "/register")
      .should("have.class", "text-primary")
      .should("have.class", "hover:underline")
      .should("contain", "Join us today!");
  });

  it("has proper card layout structure", () => {
    // Container and wrapper
    cy.get('[data-testid="about-container"]')
      .should("have.class", "container")
      .should("have.class", "py-12");

    cy.get('[data-testid="about-wrapper"]')
      .should("have.class", "max-w-2xl")
      .should("have.class", "mx-auto");

    // Card structure with proper roles
    cy.get('[role="article"]').should("exist");
    cy.get('[role="banner"]')
      .should("exist")
      .should("have.class", "text-center");
    cy.get('[role="region"]')
      .should("exist")
      .should("have.class", "text-center");
  });

  it("is accessible via navigation", () => {
    cy.visit("/");
    cy.get('[data-testid="about-link"]').should("be.visible").click();

    cy.url().should("include", "/about");
    cy.get('[data-testid="about-container"]').should("be.visible");
  });

  it("maintains responsive design across different viewports", () => {
    const testViewport = (size: string) => {
      cy.viewport(size as any);

      // Check main containers
      cy.get('[data-testid="about-container"]').should("be.visible");
      cy.get('[data-testid="about-wrapper"]').should("be.visible");

      // Check content visibility
      cy.get('[data-testid="logo-container"]').should("be.visible");
      cy.get('[data-testid="tagline"]').should("be.visible");
      cy.get('[data-testid="description-1"]').should("be.visible");
      cy.get('[data-testid="description-2"]').should("be.visible");
      cy.get('[data-testid="register-link"]').should("be.visible");
    };

    // Test different viewport sizes
    ["iphone-6", "ipad-2", "macbook-15"].forEach(testViewport);
  });
});
