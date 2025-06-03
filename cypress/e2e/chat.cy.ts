/// <reference types="cypress" />

describe("Chat", () => {
  beforeEach(() => {
    // Set up API intercepts before login
    cy.intercept("GET", "http://localhost:8000/api/chats/", {
      statusCode: 200,
      body: {
        chats: [
          {
            user: {
              id: 2,
              email: "user1@example.com",
              profile: {
                name: "User One",
                avatarUrl: null,
                avatarColor: "bg-green-500",
              },
            },
            lastMessage: {
              content: "Hello!",
              timestamp: new Date().toISOString(),
            },
            unreadCount: 0,
          },
          {
            user: {
              id: 3,
              email: "user2@example.com",
              profile: {
                name: "User Two",
                avatarUrl: null,
                avatarColor: "bg-red-500",
              },
            },
            lastMessage: {
              content: "Hi there!",
              timestamp: new Date().toISOString(),
            },
            unreadCount: 1,
          },
        ],
      },
    }).as("getRecentChats");

    // Mock chat messages
    cy.intercept("GET", "http://localhost:8000/api/chats/messages/**", {
      statusCode: 200,
      body: {
        messages: [
          {
            id: 1,
            senderId: 2,
            receiverId: 1,
            content: "Hello!",
            timestamp: new Date().toISOString(),
            read: true,
          },
          {
            id: 2,
            senderId: 1,
            receiverId: 2,
            content: "Hi there!",
            timestamp: new Date().toISOString(),
            read: true,
          },
        ],
        pagination: {
          total: 2,
          pages: 1,
          page: 1,
          limit: 50,
        },
      },
    }).as("getMessages");

    // Mock message sending
    cy.intercept("POST", "http://localhost:8000/api/chats/messages/", (req) => {
      req.reply({
        statusCode: 201,
        body: {
          id: 3,
          senderId: 1,
          receiverId: 2,
          content: req.body.content,
          timestamp: new Date().toISOString(),
          read: false,
        },
      });
    }).as("sendMessage");

    // Mock marking messages as read
    cy.intercept(
      "POST",
      "http://localhost:8000/api/chats/messages/*/read",
      (req) => {
        req.reply({
          statusCode: 200,
          body: {
            success: true,
            message: "Messages marked as read",
          },
        });
      },
    ).as("markMessagesRead");

    // Mock user search
    cy.intercept("GET", "http://localhost:8000/api/users/search/**", {
      statusCode: 200,
      body: {
        id: 4,
        email: "search@example.com",
        profile: {
          name: "Search User",
          avatarUrl: null,
          avatarColor: "bg-purple-500",
        },
      },
    }).as("searchUser");

    // Login before each test
    cy.login("test@example.com", "testpassword");

    // Wait for initial data load
    cy.wait("@getRecentChats");

    cy.wait(1000);
  });

  it("should display recent chats", () => {
    // Check if chat list is visible
    cy.get('[data-testid="chat-list"]').should("be.visible");
    cy.get('[data-testid="chat-list"]').within(() => {
      cy.get('[data-testid="chat-item"]').should("have.length", 2);
      cy.contains("User One").should("be.visible");
      cy.contains("User Two").should("be.visible");
      cy.get('[data-testid="last-message"]')
        .contains("Hello!")
        .should("be.visible");
      cy.get('[data-testid="last-message"]')
        .contains("Hi there!")
        .should("be.visible");
    });
  });

  it("should start a chat with another user", () => {
    // Click on the first chat item
    cy.get('[data-testid="chat-item"]').first().click();

    // Wait for messages to load
    cy.wait("@getMessages");

    // Verify chat interface is loaded
    cy.get('[data-testid="message-input"]').should("be.visible");
    cy.get('[data-testid="send-message-button"]').should("be.visible");
  });

  it("should send and receive messages", () => {
    // Start chat with first user
    cy.get('[data-testid="chat-item"]').first().click();
    cy.wait("@getMessages");

    // Send a message
    const message = "Hello, this is a test message!";
    cy.get('[data-testid="message-input"]').type(message, { force: true });
    cy.get('[data-testid="send-message-button"]').click({ force: true });

    // Wait for message to be sent
    cy.wait("@sendMessage").then((interception) => {
      expect(interception.request.body).to.deep.equal({
        content: message,
        receiverId: 2,
      });
    });

    // Verify message is displayed
    cy.contains(message).should("be.visible");
  });

  it("should search for users", () => {
    // Type in search box
    cy.get('[data-testid="user-search-input"]').type("search@example.com");

    // Wait for search request
    cy.wait("@searchUser");

    // Verify search result is displayed
    cy.contains("Search User").should("be.visible");
    cy.contains("search@example.com").should("be.visible");
  });

  it("should load more messages on scroll", () => {
    // Set very high polling interval to effectively disable polling during test
    cy.window().then((win) => {
      win.POLLING_INTERVAL = 1000000;
    });

    // Mock chat messages with pagination
    cy.intercept(
      "GET",
      "http://localhost:8000/api/chats/messages/**",
      (req) => {
        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = 5; // 5 messages per page
        const totalMessages = 10;
        const totalPages = Math.ceil(totalMessages / limit);

        const generateMessage = (id, isOld = false) => ({
          id,
          senderId: id % 2 === 0 ? 1 : 2,
          receiverId: id % 2 === 0 ? 2 : 1,
          content: `Message ${id}`,
          timestamp: new Date(
            Date.now() -
              (isOld ? totalMessages - id + 1 : totalMessages - id) *
                60 *
                60 *
                1000,
          ).toISOString(),
          read: isOld,
        });

        const startId = (page - 1) * limit + 1;
        const endId = Math.min(page * limit, totalMessages);
        const messages = Array.from(
          { length: endId - startId + 1 },
          (_, index) => generateMessage(startId + index, page !== 1),
        );

        req.reply({
          statusCode: 200,
          body: {
            messages,
            pagination: {
              total: totalMessages,
              pages: totalPages,
              page,
              limit,
            },
          },
        });
      },
    ).as("getMessages");

    // Start chat with first user
    cy.get('[data-testid="chat-item"]').first().click();
    cy.wait("@getMessages");

    // Get initial message count
    cy.get('[data-testid="message"]').then(($messages) => {
      const initialCount = $messages.length;

      // Try scrolling using scrollIntoView first
      cy.get('[data-testid="message"]').first().scrollIntoView();

      // As a fallback, also try direct scrollTo with ensureScrollable disabled
      cy.get('[data-testid="messages-container"]').scrollTo("top", {
        ensureScrollable: false,
      });

      // Check if new messages are loaded
      cy.get('[data-testid="message"]').should(
        "have.length.greaterThan",
        initialCount,
      );

      // Verify content and order of messages
      cy.get('[data-testid="message"]').first().should("contain", "Message 1");
      cy.get('[data-testid="message"]').eq(1).should("contain", "Message 2");
    });
  });

  it("should mark messages as read when opening chat", () => {
    // Mock unread messages
    cy.intercept("GET", "http://localhost:8000/api/chats/messages/**", {
      statusCode: 200,
      body: {
        messages: [
          {
            id: 1,
            senderId: 3,
            receiverId: 1,
            content: "Unread message 1",
            timestamp: new Date().toISOString(),
            read: false,
          },
          {
            id: 2,
            senderId: 3,
            receiverId: 1,
            content: "Unread message 2",
            timestamp: new Date().toISOString(),
            read: false,
          },
        ],
        pagination: {
          total: 2,
          pages: 1,
          page: 1,
          limit: 50,
        },
      },
    }).as("getUnreadMessages");

    // Click on chat with unread messages (second chat item)
    cy.get('[data-testid="chat-item"]').eq(1).click();
    cy.wait("@getUnreadMessages");

    // Verify messages are loaded and visible
    cy.get('[data-testid="message"]').should("have.length", 2);
    cy.get('[data-testid="message"]')
      .first()
      .should("contain", "Unread message 1");
    cy.get('[data-testid="message"]')
      .eq(1)
      .should("contain", "Unread message 2");

    // Wait and verify that mark as read request is made with correct user ID
    cy.wait("@markMessagesRead").then((interception) => {
      expect(interception.request.url).to.include("/api/chats/messages/3/read");
      expect(interception.response?.statusCode).to.equal(200);
    });

    // Verify that unread count is updated in the chat list
    cy.get('[data-testid="chat-list"]').within(() => {
      cy.get('[data-testid="chat-item"]')
        .eq(1)
        .find('[data-testid="unread-count"]')
        .should("not.exist");
    });

    // Verify that messages show as read in the UI
    cy.get('[data-testid="message"]').each(($message) => {
      cy.wrap($message).should("have.attr", "data-read", "true");
    });
  });
});
