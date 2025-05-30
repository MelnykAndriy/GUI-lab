import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StartChat from "./StartChat";
import { getUserByEmail } from "@/services/userService";
import * as toastHooks from "@/hooks/use-toast";

// Mock the userService
vi.mock("@/services/userService");

// Mock the toast hook
vi.mock("@/hooks/use-toast", () => ({
  useToast: vi.fn(),
}));

describe("StartChat", () => {
  const mockOnStartChat = vi.fn();
  const mockToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (getUserByEmail as jest.Mock).mockReset();
    (toastHooks.useToast as jest.Mock).mockReturnValue({ toast: mockToast });
  });

  it("renders the start chat form correctly", async () => {
    await act(async () => {
      render(<StartChat onStartChat={mockOnStartChat} />);
    });

    const emailInput = screen.getByPlaceholderText("Enter user email...");
    const submitButton = screen.getByRole("button", { name: /start chat/i });

    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toBeRequired();
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it("enables submit button when email is entered", async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<StartChat onStartChat={mockOnStartChat} />);
    });

    const emailInput = screen.getByPlaceholderText("Enter user email...");
    const submitButton = screen.getByRole("button", { name: /start chat/i });

    await act(async () => {
      await user.type(emailInput, "test@example.com");
    });

    expect(submitButton).toBeEnabled();
  });

  it("successfully starts a chat when user is found", async () => {
    const user = userEvent.setup();
    const mockUser = {
      id: 1,
      email: "test@example.com",
      profile: { name: "Test User" },
    };

    (getUserByEmail as jest.Mock).mockResolvedValueOnce(mockUser);

    await act(async () => {
      render(<StartChat onStartChat={mockOnStartChat} />);
    });

    const emailInput = screen.getByPlaceholderText("Enter user email...");
    const submitButton = screen.getByRole("button", { name: /start chat/i });

    await act(async () => {
      await user.type(emailInput, "test@example.com");
      await user.click(submitButton);
    });

    await waitFor(() => {
      expect(getUserByEmail).toHaveBeenCalledWith("test@example.com");
      expect(mockOnStartChat).toHaveBeenCalledWith(mockUser);
      expect(mockToast).toHaveBeenCalledWith({
        title: "Success",
        description: `Started a chat with ${mockUser.profile.name}`,
      });
      expect(emailInput).toHaveValue("");
    });
  });

  it("shows error toast when user is not found", async () => {
    const user = userEvent.setup();
    const errorMessage = "User not found";

    (getUserByEmail as jest.Mock).mockRejectedValueOnce(
      new Error(errorMessage),
    );

    await act(async () => {
      render(<StartChat onStartChat={mockOnStartChat} />);
    });

    const emailInput = screen.getByPlaceholderText("Enter user email...");
    const submitButton = screen.getByRole("button", { name: /start chat/i });

    await act(async () => {
      await user.type(emailInput, "nonexistent@example.com");
      await user.click(submitButton);
    });

    await waitFor(() => {
      expect(getUserByEmail).toHaveBeenCalledWith("nonexistent@example.com");
      expect(mockOnStartChat).not.toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "User not found",
        description: errorMessage,
      });
    });
  });

  it("shows loading state while searching for user", async () => {
    const user = userEvent.setup();
    let resolvePromise: (value: any) => void;
    const searchPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    (getUserByEmail as jest.Mock).mockImplementationOnce(() => searchPromise);

    await act(async () => {
      render(<StartChat onStartChat={mockOnStartChat} />);
    });

    const emailInput = screen.getByPlaceholderText("Enter user email...");

    await act(async () => {
      await user.type(emailInput, "test@example.com");
    });

    const submitButton = screen.getByRole("button");

    await act(async () => {
      await user.click(submitButton);
    });

    expect(submitButton).toBeDisabled();
    expect(screen.getByText("Searching...")).toBeInTheDocument();

    // Resolve the promise to complete the test
    await act(async () => {
      resolvePromise!({
        id: 1,
        email: "test@example.com",
        profile: { name: "Test User" },
      });
    });
  });

  it("prevents form submission with empty email", async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<StartChat onStartChat={mockOnStartChat} />);
    });

    const submitButton = screen.getByRole("button", { name: /start chat/i });

    await act(async () => {
      await user.click(submitButton);
    });

    expect(getUserByEmail).not.toHaveBeenCalled();
    expect(mockOnStartChat).not.toHaveBeenCalled();
  });
});
