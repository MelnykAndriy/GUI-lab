const mockToast = vi.hoisted(() => vi.fn());

vi.mock("@/components/ui/use-toast", () => ({
  toast: mockToast,
  useToast: () => ({
    toast: mockToast,
    dismiss: vi.fn(),
    toasts: [],
  }),
}));

// Mock Radix UI Select
vi.mock("@radix-ui/react-select", () => ({
  Root: ({ children, onValueChange }: any) => (
    <div data-testid="select-root" onClick={() => onValueChange?.("female")}>
      {children}
    </div>
  ),
  Trigger: ({ children }: any) => (
    <button role="combobox" data-testid="select-trigger">
      {children}
    </button>
  ),
  Value: ({ children }: any) => <span>{children}</span>,
  Portal: ({ children }: any) => <div>{children}</div>,
  Content: ({ children }: any) => (
    <div data-testid="select-content">{children}</div>
  ),
  Item: ({ children, value }: any) => (
    <div role="option" data-value={value}>
      {children}
    </div>
  ),
  ItemIndicator: ({ children }: any) => (
    <span data-testid="select-item-indicator">{children}</span>
  ),
  ItemText: ({ children }: any) => (
    <span data-testid="select-item-text">{children}</span>
  ),
  Group: ({ children }: any) => <div>{children}</div>,
  Label: ({ children }: any) => <div>{children}</div>,
  Separator: () => <div />,
  ScrollUpButton: () => <div />,
  ScrollDownButton: () => <div />,
  Viewport: ({ children }: any) => <div>{children}</div>,
  Icon: ({ children }: any) => (
    <span data-testid="select-icon">{children}</span>
  ),
}));

import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import Profile from "./Profile";
import { createMockStore } from "../test/utils";
import {
  uploadAvatar,
  getCurrentUser,
  updateUser,
} from "@/services/userService";
import { act } from "react";

// Mock the userService
vi.mock("@/services/userService", () => ({
  uploadAvatar: vi.fn(),
  getCurrentUser: vi.fn(),
  updateUser: vi.fn(),
}));

describe("Profile", () => {
  // Mock data
  const mockUser = {
    id: 1,
    email: "test@example.com",
    profile: {
      name: "Test User",
      gender: "male",
      dob: "1990-01-01",
      createdAt: "2024-01-01T00:00:00Z",
      avatarUrl: null,
      avatarColor: "bg-purple-500",
    },
  };

  beforeEach(() => {
    vi.mocked(uploadAvatar).mockReset();
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(updateUser).mockResolvedValue(mockUser);
    mockToast.mockReset();
  });

  const renderProfile = (initialState = {}) => {
    const store = createMockStore({
      user: {
        user: mockUser,
        isLoading: false,
        error: null,
        isAuthenticated: true,
        ...initialState,
      },
    });

    return render(
      <Provider store={store}>
        <BrowserRouter>
          <Profile />
        </BrowserRouter>
      </Provider>,
    );
  };

  // it("displays user information correctly", async () => {
  //   await act(async () => {
  //     renderProfile();
  //   });

  //   // Wait for loading state to finish
  //   await waitFor(() => {
  //     expect(
  //       screen.queryByText("Loading profile information..."),
  //     ).not.toBeInTheDocument();
  //   });

  //   // Check if basic information is displayed
  //   expect(screen.getByText(/my profile/i)).toBeInTheDocument();
  //   expect(screen.getByText("Test User")).toBeInTheDocument();
  //   expect(screen.getByText("test@example.com")).toBeInTheDocument();
  //   expect(screen.getByText("male")).toBeInTheDocument();
  //   expect(screen.getByText("1990-01-01")).toBeInTheDocument();
  //   expect(screen.getByText("Jan 1, 2024")).toBeInTheDocument();
  // });

  // it("shows loading state", async () => {
  //   await act(async () => {
  //     renderProfile({ isLoading: true, user: null });
  //   });
  //   expect(
  //     screen.getByText(/loading profile information/i),
  //   ).toBeInTheDocument();
  // });

  // it("shows error state", async () => {
  //   await act(async () => {
  //     renderProfile({
  //       error: "Failed to load profile",
  //       user: null,
  //       isLoading: false,
  //     });
  //   });

  //   await waitFor(() => {
  //     expect(
  //       screen.getByText(/profile error/i),
  //     ).toBeInTheDocument();
  //     expect(screen.getByText("Failed to load profile")).toBeInTheDocument();
  //     expect(
  //       screen.getByRole("button", { name: /retry/i }),
  //     ).toBeInTheDocument();
  //   });
  // });

  it("allows editing name", async () => {
    const user = userEvent.setup();
    await act(async () => {
      renderProfile();
    });

    // Wait for loading state to finish
    await waitFor(() => {
      expect(
        screen.queryByText("Loading profile information..."),
      ).not.toBeInTheDocument();
    });

    // Find and click edit button for name
    const editButton = screen.getByRole("button", { name: /edit name/i });
    await act(async () => {
      await user.click(editButton);
    });

    // Check if input appears and enter new name
    const nameInput = screen.getByRole("textbox", { name: /name/i });
    await act(async () => {
      await user.clear(nameInput);
      await user.type(nameInput, "New Name");
    });

    // Click save
    const saveButton = screen.getByRole("button", { name: /save/i });
    await act(async () => {
      await user.click(saveButton);
    });

    // Verify toast appears
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Profile Updated",
        description: "Your name has been updated.",
      }),
    );
  });

  it("allows editing gender", async () => {
    const user = userEvent.setup();
    await act(async () => {
      renderProfile();
    });

    // Wait for loading state to finish
    await waitFor(() => {
      expect(
        screen.queryByText("Loading profile information..."),
      ).not.toBeInTheDocument();
    });

    // Find and click edit button for gender
    const editButton = screen.getByRole("button", { name: /edit gender/i });
    await act(async () => {
      await user.click(editButton);
    });

    // Select new gender
    const genderSelect = screen.getByTestId("select-trigger");
    await act(async () => {
      await user.click(genderSelect);
    });

    // Click save
    const saveButton = screen.getByRole("button", { name: /save/i });
    await act(async () => {
      await user.click(saveButton);
    });

    // Verify toast appears
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Profile Updated",
        description: "Your gender has been updated.",
      }),
    );
  });

  it("allows editing date of birth", async () => {
    const user = userEvent.setup();
    await act(async () => {
      renderProfile();
    });

    // Wait for loading state to finish
    await waitFor(() => {
      expect(
        screen.queryByText("Loading profile information..."),
      ).not.toBeInTheDocument();
    });

    // Find and click edit button for DOB
    const editButton = screen.getByRole("button", {
      name: /edit date of birth/i,
    });
    await act(async () => {
      await user.click(editButton);
    });

    // Enter new date
    const dobInput = screen.getByLabelText(/date of birth/i);
    await act(async () => {
      await user.clear(dobInput);
      await user.type(dobInput, "1995-06-15");
    });

    // Click save
    const saveButton = screen.getByRole("button", { name: /save/i });
    await act(async () => {
      await user.click(saveButton);
    });

    // Verify toast appears
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Profile Updated",
        description: "Your dob has been updated.",
      }),
    );
  });

  it("handles avatar upload", async () => {
    const user = userEvent.setup();
    await act(async () => {
      renderProfile();
    });

    // Wait for loading state to finish
    await waitFor(() => {
      expect(
        screen.queryByText("Loading profile information..."),
      ).not.toBeInTheDocument();
    });

    // Mock successful avatar upload
    const mockAvatarUrl = "https://example.com/avatar.jpg";
    vi.mocked(uploadAvatar).mockResolvedValueOnce({ avatarUrl: mockAvatarUrl });

    // Click upload avatar button
    const uploadButton = screen.getByRole("button", { name: /upload avatar/i });
    await act(async () => {
      await user.click(uploadButton);
    });

    // Create a mock file and trigger upload
    const file = new File(["avatar"], "avatar.png", { type: "image/png" });
    const fileInput = screen.getByTestId("avatar-upload");
    await act(async () => {
      await user.upload(fileInput, file);
    });

    // Verify upload started
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Uploading",
        description: "Uploading your avatar...",
      }),
    );

    // Verify success message
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Avatar Updated",
          description: "Your avatar has been updated successfully.",
        }),
      );
    });
  });

  it("handles avatar upload errors", async () => {
    const user = userEvent.setup();
    await act(async () => {
      renderProfile();
    });

    // Wait for loading state to finish
    await waitFor(() => {
      expect(
        screen.queryByText("Loading profile information..."),
      ).not.toBeInTheDocument();
    });

    // Mock failed avatar upload
    vi.mocked(uploadAvatar).mockRejectedValueOnce(new Error("Upload failed"));

    // Click upload avatar button
    const uploadButton = screen.getByRole("button", { name: /upload avatar/i });
    await act(async () => {
      await user.click(uploadButton);
    });

    // Create a mock file and trigger upload
    const file = new File(["avatar"], "avatar.png", { type: "image/png" });
    const fileInput = screen.getByTestId("avatar-upload");
    await act(async () => {
      await user.upload(fileInput, file);
    });

    // Verify error message
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Upload Failed",
        description: "Could not upload avatar. Please try again.",
      }),
    );
  });

  // it("validates avatar file type", async () => {
  //   const user = userEvent.setup();
  //   await act(async () => {
  //     renderProfile();
  //   });

  //   // Wait for loading state to finish
  //   await waitFor(() => {
  //     expect(
  //       screen.queryByText("Loading profile information..."),
  //     ).not.toBeInTheDocument();
  //   });

  //   // Click upload avatar button
  //   const uploadButton = screen.getByRole("button", { name: /upload avatar/i });
  //   await act(async () => {
  //     await user.click(uploadButton);
  //   });

  //   // Create an invalid file type and trigger upload
  //   const file = new File(["text"], "text.txt", { type: "text/plain" });
  //   const fileInput = screen.getByTestId("avatar-upload");
  //   await act(async () => {
  //     await user.upload(fileInput, file);
  //   });

  //   // Verify error message
  //   expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
  //     title: "Invalid File Type",
  //     description: "Please select an image file.",
  //   }));
  // });

  it("validates avatar file size", async () => {
    const user = userEvent.setup();
    await act(async () => {
      renderProfile();
    });

    // Wait for loading state to finish
    await waitFor(() => {
      expect(
        screen.queryByText("Loading profile information..."),
      ).not.toBeInTheDocument();
    });

    // Click upload avatar button
    const uploadButton = screen.getByRole("button", { name: /upload avatar/i });
    await act(async () => {
      await user.click(uploadButton);
    });

    // Create a file larger than 2MB
    const largeFile = new File(
      [new ArrayBuffer(3 * 1024 * 1024)],
      "large.png",
      { type: "image/png" },
    );
    const fileInput = screen.getByTestId("avatar-upload");
    await act(async () => {
      await user.upload(fileInput, largeFile);
    });

    // Verify error message
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "File Too Large",
        description: "Please select an image smaller than 2MB.",
      }),
    );
  });

  it("allows changing avatar color", async () => {
    const user = userEvent.setup();
    await act(async () => {
      renderProfile();
    });

    // Wait for loading state to finish
    await waitFor(() => {
      expect(
        screen.queryByText("Loading profile information..."),
      ).not.toBeInTheDocument();
    });

    // Click change avatar color button to enable edit mode
    const changeColorButton = screen.getByRole("button", {
      name: /change avatar color/i,
    });
    await act(async () => {
      await user.click(changeColorButton);
    });

    // Now the select-trigger should be present
    const colorSelect = screen.getByTestId("select-trigger");
    await act(async () => {
      await user.click(colorSelect);
    });

    // Click save
    const saveButton = screen.getByRole("button", { name: /save/i });
    await act(async () => {
      await user.click(saveButton);
    });

    // Verify toast appears
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Profile Updated",
        description: "Your avatarColor has been updated.",
      }),
    );
  });
});
