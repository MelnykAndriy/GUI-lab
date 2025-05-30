import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import Chat from "./Chat";
import chatReducer, {
  setSelectedUser,
  fetchRecentChats,
} from "@/features/chat/chatSlice";
import userReducer from "@/features/user/userSlice";

// Increase test timeout
vi.setConfig({ testTimeout: 15000 });

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock API calls
vi.mock("@/services/messageService", () => ({
  getRecentChats: vi.fn().mockResolvedValue([]),
  getChatMessages: vi
    .fn()
    .mockResolvedValue({ messages: [], pagination: { pages: 1 } }),
  markMessagesAsRead: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/services/api", () => ({
  apiRequest: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/services/userService", () => ({
  getUserByEmail: vi.fn().mockResolvedValue({
    id: 3,
    email: "new@example.com",
    profile: { name: "New User" },
  }),
}));

// Mock components
vi.mock("@/components/UserList", () => ({
  default: ({ onSelectUser, currentUserId }: any) => (
    <div>
      <button
        onClick={() =>
          onSelectUser({
            id: 2,
            email: "test@example.com",
            profile: { name: "Test User" },
          })
        }
      >
        Select User
      </button>
    </div>
  ),
}));

vi.mock("@/components/ChatInterface", () => ({
  default: ({ onMessageSent }: any) => (
    <div data-testid="chat-interface">
      <button onClick={onMessageSent}>Send Message</button>
    </div>
  ),
}));

vi.mock("@/components/StartChat", () => ({
  default: ({ onStartChat }: any) => (
    <div data-testid="start-chat">
      <button
        onClick={() =>
          onStartChat({
            id: 3,
            email: "new@example.com",
            profile: { name: "New User" },
          })
        }
      >
        Start New Chat
      </button>
    </div>
  ),
}));

// Mock window resize
const mockResizeEvent = () => {
  const resizeEvent = new Event("resize");
  window.dispatchEvent(resizeEvent);
};

describe("Chat Page", () => {
  const mockStore = configureStore({
    reducer: {
      chat: chatReducer,
      user: userReducer,
    },
    preloadedState: {
      user: {
        currentUser: {
          id: 1,
          email: "current@example.com",
          profile: { name: "Current User" },
        },
        isAuthenticated: true,
        loading: false,
        error: null,
      },
      chat: {
        selectedUser: null,
        messages: [],
        recentChats: [],
        page: 1,
        hasMore: true,
        isLoading: false,
        error: null,
      },
    },
  });

  const renderChat = async () => {
    let rendered;
    await act(async () => {
      rendered = render(
        <Provider store={mockStore}>
          <Chat />
        </Provider>,
      );
      // Wait for any initial async operations
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    return rendered;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window width to desktop view
    Object.defineProperty(window, "innerWidth", {
      value: 1024,
      writable: true,
    });
    // Setup fake timers
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("renders chat components in desktop view", async () => {
    await act(async () => {
      await renderChat();
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Check for sidebar elements
    expect(screen.getByText("Chats")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /new/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /select user/i })).toBeInTheDocument();
  });

  it("toggles start chat section", async () => {
    const user = userEvent.setup({ delay: null });
    await act(async () => {
      await renderChat();
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await user.click(screen.getByRole("button", { name: /new/i }));
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(screen.getByTestId("start-chat")).toBeInTheDocument();

    // Close button should be visible - using aria-label
    const closeButton = screen.getByRole("button", { name: "" }); // Empty name for icon button
    await act(async () => {
      await user.click(closeButton);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(screen.queryByTestId("start-chat")).not.toBeInTheDocument();
  });

  it("handles new chat start", async () => {
    const user = userEvent.setup({ delay: null });
    await act(async () => {
      await renderChat();
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await user.click(screen.getByRole("button", { name: /new/i }));
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await user.click(screen.getByRole("button", { name: /start new chat/i }));
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const state = mockStore.getState();
    expect(state.chat.selectedUser).toEqual({
      id: 3,
      email: "new@example.com",
      profile: { name: "New User" },
    });
  });

  it("switches to mobile view", async () => {
    await act(async () => {
      await renderChat();
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      Object.defineProperty(window, "innerWidth", { value: 600 });
      mockResizeEvent();
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Find the sidebar container
    const sidebar = screen.getByText("Chats").closest('div[class*="flex-shrink-0"]');
    expect(sidebar).toBeInTheDocument();
    expect(sidebar).toHaveClass("w-full", "md:w-80", "flex-shrink-0");
  });

  it("shows back button in mobile view when user selected", async () => {
    const user = userEvent.setup({ delay: null });
    await act(async () => {
      await renderChat();
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      Object.defineProperty(window, "innerWidth", { value: 600 });
      mockResizeEvent();
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await user.click(screen.getByRole("button", { name: /select user/i }));
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const backButton = screen.getByRole("button", { name: "" }); // ChevronLeft icon button
    expect(backButton).toBeInTheDocument();

    await act(async () => {
      await user.click(backButton);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const state = mockStore.getState();
    expect(state.chat.selectedUser).toBeNull();
  });

  it("refreshes recent chats after message sent", async () => {
    const user = userEvent.setup({ delay: null });
    const dispatchSpy = vi.spyOn(mockStore, "dispatch");
    await act(async () => {
      await renderChat();
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await user.click(screen.getByRole("button", { name: /select user/i }));
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await user.click(screen.getByRole("button", { name: /send message/i }));
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(Function));
  });

  it("handles user selection", async () => {
    const user = userEvent.setup({ delay: null });
    await act(async () => {
      await renderChat();
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await user.click(screen.getByRole("button", { name: /select user/i }));
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const state = mockStore.getState();
    expect(state.chat.selectedUser).toEqual({
      id: 2,
      email: "test@example.com",
      profile: { name: "Test User" },
    });
  });

  it("shows loading state when user data is not available", async () => {
    const emptyStore = configureStore({
      reducer: {
        chat: chatReducer,
        user: userReducer,
      },
      preloadedState: {
        user: {
          currentUser: null,
          isAuthenticated: true,
          loading: false,
          error: null,
        },
        chat: {
          selectedUser: null,
          messages: [],
          recentChats: [],
          page: 1,
          hasMore: true,
          isLoading: false,
          error: null,
        },
      },
    });

    await act(async () => {
      render(
        <Provider store={emptyStore}>
          <Chat />
        </Provider>,
      );
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await waitFor(() => {
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  it("starts polling for recent chats", async () => {
    const dispatchSpy = vi.spyOn(mockStore, "dispatch");
    await act(async () => {
      await renderChat();
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith(expect.any(Function));
    });

    await act(async () => {
      vi.advanceTimersByTime(10000);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(dispatchSpy).toHaveBeenCalledTimes(2);
  });
});
