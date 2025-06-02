import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import userEvent from "@testing-library/user-event";
import UserList from "./UserList";
import { getUserByEmail } from "@/services/userService";
import * as redux from "react-redux";
import { formatRecentChatTimestamp } from "@/utils/dateUtils";

// Mock the userService
vi.mock("@/services/userService");

// Mock redux hooks
vi.mock("react-redux", async () => {
  const actual = await vi.importActual("react-redux");
  return {
    ...actual,
    useSelector: vi.fn(),
  };
});

// Mock the date utils
vi.mock("@/utils/dateUtils", () => ({
  formatRecentChatTimestamp: vi.fn(),
}));

describe("UserList", () => {
  const mockOnSelectUser = vi.fn();
  const currentUserId = 1;

  const mockRecentChats = [
    {
      id: 2,
      email: "john@example.com",
      profile: { name: "John Doe" },
      lastMessage: {
        content: "Hello there!",
        timestamp: "2024-03-19T10:00:00Z",
      },
      unreadCount: 3,
    },
    {
      id: 3,
      email: "jane@example.com",
      profile: { name: "Jane Smith" },
      lastMessage: null,
      unreadCount: 0,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (getUserByEmail as jest.Mock).mockReset();
    (redux.useSelector as jest.Mock).mockReturnValue(mockRecentChats);
    (formatRecentChatTimestamp as jest.Mock).mockReturnValue("2 hours ago");
  });

  it("displays search input with correct placeholder", async () => {
    await act(async () => {
      render(
        <UserList
          onSelectUser={mockOnSelectUser}
          currentUserId={currentUserId}
        />,
      );
    });

    const searchInput = screen.getByPlaceholderText("Search users ...");
    expect(searchInput).toBeInTheDocument();
  });

  it("shows recent chats with correct information", async () => {
    await act(async () => {
      render(
        <UserList
          onSelectUser={mockOnSelectUser}
          currentUserId={currentUserId}
        />,
      );
    });

    // Check section title
    expect(screen.getByText("Recent Chats")).toBeInTheDocument();

    // Check first chat details
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Hello there!")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument(); // unread count

    // Check second chat details
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("shows empty state when no recent chats", async () => {
    (redux.useSelector as jest.Mock).mockReturnValue([]);

    await act(async () => {
      render(
        <UserList
          onSelectUser={mockOnSelectUser}
          currentUserId={currentUserId}
        />,
      );
    });

    expect(screen.getByText("No recent chats")).toBeInTheDocument();
    expect(
      screen.getByText("Search for a user to start chatting"),
    ).toBeInTheDocument();
  });

  it("filters users when searching by name", async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(
        <UserList
          onSelectUser={mockOnSelectUser}
          currentUserId={currentUserId}
        />,
      );
    });

    const searchInput = screen.getByPlaceholderText("Search users ...");

    await act(async () => {
      await user.type(searchInput, "John");
    });

    await waitFor(() => {
      expect(screen.getByText("Search Results")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
    });
  });

  it("searches by email when input contains @", async () => {
    const user = userEvent.setup();
    const mockUser = {
      id: 4,
      email: "test@example.com",
      profile: { name: "Test User" },
    };

    (getUserByEmail as jest.Mock).mockResolvedValueOnce(mockUser);

    await act(async () => {
      render(
        <UserList
          onSelectUser={mockOnSelectUser}
          currentUserId={currentUserId}
        />,
      );
    });

    const searchInput = screen.getByPlaceholderText("Search users ...");

    await act(async () => {
      await user.type(searchInput, "test@example.com");
    });

    await waitFor(() => {
      expect(screen.getByText("Search Results")).toBeInTheDocument();
      expect(screen.getByText("Test User")).toBeInTheDocument();
    });

    expect(getUserByEmail).toHaveBeenCalledWith("test@example.com");
  });

  it("shows loading state while searching", async () => {
    const user = userEvent.setup();
    let resolvePromise: (value: any) => void;
    const searchPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    (getUserByEmail as jest.Mock).mockImplementationOnce(() => searchPromise);

    await act(async () => {
      render(
        <UserList
          onSelectUser={mockOnSelectUser}
          currentUserId={currentUserId}
        />,
      );
    });

    const searchInput = screen.getByPlaceholderText("Search users ...");

    await act(async () => {
      await user.type(searchInput, "test@example.com");
    });

    await waitFor(() => {
      expect(screen.getByText("Searching...")).toBeInTheDocument();
    });

    await act(async () => {
      resolvePromise!({
        id: 4,
        email: "test@example.com",
        profile: { name: "Test User" },
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Test User")).toBeInTheDocument();
    });
  });

  it("shows 'No users found' when search returns no results", async () => {
    const user = userEvent.setup();
    (getUserByEmail as jest.Mock).mockResolvedValueOnce(null);

    await act(async () => {
      render(
        <UserList
          onSelectUser={mockOnSelectUser}
          currentUserId={currentUserId}
        />,
      );
    });

    const searchInput = screen.getByPlaceholderText("Search users ...");

    await act(async () => {
      await user.type(searchInput, "nonexistent@example.com");
    });

    await waitFor(() => {
      expect(screen.getByText("No users found")).toBeInTheDocument();
    });
  });

  it("calls onSelectUser when a user is clicked", async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(
        <UserList
          onSelectUser={mockOnSelectUser}
          currentUserId={currentUserId}
        />,
      );
    });

    const userButton = screen.getByText("John Doe").closest("button");
    expect(userButton).toBeInTheDocument();

    await act(async () => {
      await user.click(userButton!);
    });

    expect(mockOnSelectUser).toHaveBeenCalledWith(mockRecentChats[0]);
  });

  it("displays timestamp for last message", async () => {
    await act(async () => {
      render(
        <UserList
          onSelectUser={mockOnSelectUser}
          currentUserId={currentUserId}
        />,
      );
    });

    expect(formatRecentChatTimestamp).toHaveBeenCalledWith(
      "2024-03-19T10:00:00Z",
    );
    expect(screen.getByText("2 hours ago")).toBeInTheDocument();
  });
});
