describe("Chat", () => {
  beforeEach(() => {
    // Login before each test
    cy.login("test@example.com", "testpassword");
  });

  it("should display user list", () => {
    // Check if user list is visible
    cy.findByTestId("user-list").should("be.visible");
    cy.findByTestId("user-list").within(() => {
      cy.findAllByTestId("user-item").should("have.length.at.least", 1);
    });
  });

  it("should start a chat with another user", () => {
    // Click on the first user in the list
    cy.findAllByTestId("user-item").first().click();

    // Verify chat interface is loaded
    cy.findByPlaceholderText(/type your message/i).should("be.visible");
    cy.findByRole("button", { name: /send/i }).should("be.visible");
  });

  it("should send and receive messages", () => {
    // Start chat with first user
    cy.findAllByTestId("user-item").first().click();

    // Send a message
    const message = "Hello, this is a test message!";
    cy.findByPlaceholderText(/type your message/i).type(message);
    cy.findByRole("button", { name: /send/i }).click();

    // Verify message is displayed
    cy.findByText(message).should("be.visible");

    // Verify message status
    cy.findByText(/sent/i).should("be.visible");
  });

  it("should load more messages on scroll", () => {
    // Start chat with first user
    cy.findAllByTestId("user-item").first().click();

    // Get initial message count
    cy.findAllByTestId("message-container").then(($messages) => {
      const initialCount = $messages.length;

      // Scroll to top of messages
      cy.findAllByTestId("message-container").first().scrollIntoView();

      // Wait for more messages to load
      cy.findAllByTestId("message-container").should(
        "have.length.greaterThan",
        initialCount,
      );
    });
  });
});
