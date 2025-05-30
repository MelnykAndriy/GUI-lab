import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChatInterface from "./ChatInterface";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "@/features/chat/chatSlice";
import userReducer from "@/features/user/userSlice";
import * as messageService from "@/services/messageService";

// Mock messageService
vi.mock("@/services/messageService", () => ({
  getChatMessages: vi.fn(),
  sendMessage: vi.fn(),
  getRecentChats: vi.fn(),
  markMessagesAsRead: vi.fn(),
}));

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Mock the store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      chat: chatReducer,
      user: userReducer,
    },
    preloadedState: initialState,
  });
};

// Mock data
const mockCurrentUser = {
  id: 1,
  email: "current@example.com",
  profile: {
    name: "Current User",
    avatarUrl: null,
    avatarColor: "#123456",
  },
};

const mockSelectedUser = {
  id: 2,
  email: "selected@example.com",
  profile: {
    name: "Selected User",
    avatarUrl: null,
    avatarColor: "#654321",
  },
};

const mockMessages = [
  {
    id: 1,
    senderId: 1,
    receiverId: 2,
    content: "Hello!",
    timestamp: "2024-03-20T10:00:00Z",
    read: true,
  },
  {
    id: 2,
    senderId: 2,
    receiverId: 1,
    content: "Hi there!",
    timestamp: "2024-03-20T10:01:00Z",
    read: false,
  },
];

describe("ChatInterface", () => {
  const mockOnMessageSent = vi.fn();

  // Mock IntersectionObserver
  beforeEach(() => {
    vi.clearAllMocks();
    const mockIntersectionObserver = vi.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    });
    window.IntersectionObserver = mockIntersectionObserver;

    // Mock API responses
    vi.mocked(messageService.getChatMessages).mockResolvedValue({
      messages: [],
      pagination: {
        total: 0,
        pages: 1,
        page: 1,
        limit: 50,
      },
    });
    vi.mocked(messageService.sendMessage).mockResolvedValue(mockMessages[0]);
    vi.mocked(messageService.getRecentChats).mockResolvedValue([]);
    vi.mocked(messageService.markMessagesAsRead).mockResolvedValue(undefined);
  });

  it("renders welcome message when no user is selected", () => {
    const store = createMockStore({
      user: { currentUser: mockCurrentUser },
      chat: { selectedUser: null, messages: [], isLoading: false },
    });

    render(
      <Provider store={store}>
        <ChatInterface onMessageSent={mockOnMessageSent} />
      </Provider>,
    );

    expect(screen.getByText("Welcome to Msgtrik")).toBeInTheDocument();
    expect(
      screen.getByText("Select a user to start chatting"),
    ).toBeInTheDocument();
  });

  it("renders chat interface with selected user", () => {
    const store = createMockStore({
      user: { currentUser: mockCurrentUser },
      chat: {
        selectedUser: mockSelectedUser,
        messages: [],
        isLoading: false,
      },
    });

    render(
      <Provider store={store}>
        <ChatInterface onMessageSent={mockOnMessageSent} />
      </Provider>,
    );

    expect(screen.getByText(mockSelectedUser.profile.name)).toBeInTheDocument();
    expect(screen.getByText(mockSelectedUser.email)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Type your message..."),
    ).toBeInTheDocument();
    expect(screen.getByText("Send")).toBeInTheDocument();
  });

  it("displays empty chat message when no messages exist", async () => {
    const store = createMockStore({
      user: { currentUser: mockCurrentUser },
      chat: {
        selectedUser: mockSelectedUser,
        messages: [],
        isLoading: false,
      },
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ChatInterface onMessageSent={mockOnMessageSent} />
        </Provider>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("No messages yet")).toBeInTheDocument();
      expect(screen.getByText("Start chatting!")).toBeInTheDocument();
    });
  });

  it("displays messages correctly", async () => {
    // Mock the initial state with sorted messages
    const store = createMockStore({
      user: { currentUser: mockCurrentUser },
      chat: {
        selectedUser: mockSelectedUser,
        messages: [...mockMessages].sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        ),
        isLoading: false,
      },
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ChatInterface onMessageSent={mockOnMessageSent} />
        </Provider>,
      );
    });

    await waitFor(() => {
      // Verify that both messages are displayed
      expect(screen.getByText("Hello!")).toBeInTheDocument();
      expect(screen.getByText("Hi there!")).toBeInTheDocument();

      // Verify timestamps are displayed
      expect(screen.getByText("Mar 20, 2024 at 12:00 PM")).toBeInTheDocument();
      expect(screen.getByText("Mar 20, 2024 at 12:01 PM")).toBeInTheDocument();

      // Verify user avatars (including header avatar)
      const headerAvatar = screen.getAllByTestId("avatar-initials")[0];
      expect(headerAvatar).toHaveTextContent("SU"); // Header avatar

      // Find message containers by test-id
      const messageContainers = screen.getAllByTestId("message-container");
      expect(messageContainers).toHaveLength(2);

      // Find messages by their content
      const helloMessage = messageContainers.find(
        (container) => within(container).queryByText("Hello!") !== null,
      );
      const hiThereMessage = messageContainers.find(
        (container) => within(container).queryByText("Hi there!") !== null,
      );

      expect(helloMessage).toBeTruthy();
      expect(hiThereMessage).toBeTruthy();

      // Verify "Hello!" message (sent by current user)
      expect(helloMessage).toHaveClass(
        "flex items-center gap-3 flex-row-reverse",
      ); // Current user's message is right-aligned
      const helloMessageAvatar = within(helloMessage!).getByTestId(
        "avatar-initials",
      );
      expect(helloMessageAvatar).toHaveTextContent("CU"); // Current User's avatar
      expect(within(helloMessage!).getByText("• Read")).toBeInTheDocument();

      // Verify "Hi there!" message (sent by selected user)
      expect(hiThereMessage).toHaveClass("flex items-center gap-3 flex-row"); // Selected user's message is left-aligned
      const hiThereMessageAvatar = within(hiThereMessage!).getByTestId(
        "avatar-initials",
      );
      expect(hiThereMessageAvatar).toHaveTextContent("SU"); // Selected User's avatar
    });

    // Verify that messages are marked as read when viewed
    expect(messageService.markMessagesAsRead).toHaveBeenCalledWith(
      mockSelectedUser.id,
    );
  });

  it("shows loading state when fetching messages", () => {
    const store = createMockStore({
      user: { currentUser: mockCurrentUser },
      chat: {
        selectedUser: mockSelectedUser,
        messages: [],
        isLoading: true,
        hasMore: true,
      },
    });

    render(
      <Provider store={store}>
        <ChatInterface onMessageSent={mockOnMessageSent} />
      </Provider>,
    );

    expect(screen.getByText("Loading messages...")).toBeInTheDocument();
  });

  it("handles message sending", async () => {
    const store = createMockStore({
      user: { currentUser: mockCurrentUser },
      chat: {
        selectedUser: mockSelectedUser,
        messages: [],
        isLoading: false,
      },
    });

    const user = userEvent.setup();

    await act(async () => {
      render(
        <Provider store={store}>
          <ChatInterface onMessageSent={mockOnMessageSent} />
        </Provider>,
      );
    });

    const input = screen.getByPlaceholderText("Type your message...");
    const sendButton = screen.getByText("Send");

    // Initially, send button should be disabled
    expect(sendButton).toBeDisabled();

    // Type a message
    await act(async () => {
      await user.type(input, "Hello, world!");
    });

    await waitFor(() => {
      expect(input).toHaveValue("Hello, world!");
      expect(sendButton).not.toBeDisabled();
    });

    // Mock the sendMessage response
    vi.mocked(messageService.sendMessage).mockResolvedValueOnce({
      id: 3,
      senderId: mockCurrentUser.id,
      receiverId: mockSelectedUser.id,
      content: "Hello, world!",
      timestamp: "2024-03-20T10:02:00Z",
      read: false,
    });

    // Submit the form
    await act(async () => {
      await user.click(sendButton);
    });

    await waitFor(() => {
      expect(messageService.sendMessage).toHaveBeenCalledWith({
        receiverId: mockSelectedUser.id,
        content: "Hello, world!",
      });
      expect(mockOnMessageSent).toHaveBeenCalled();
      expect(input).toHaveValue("");
    });
  });
});
