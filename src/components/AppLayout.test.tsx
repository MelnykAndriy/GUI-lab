import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AppLayout from "./AppLayout";
import userEvent from "@testing-library/user-event";

// Mock the entire react-redux module
vi.mock("react-redux", async () => {
  const actual = await vi.importActual("react-redux");
  return {
    ...actual,
    useSelector: vi.fn(),
    useDispatch: vi.fn(),
  };
});

// Import after mocks
import { useSelector } from "react-redux";

describe("AppLayout", () => {
  const mockUserData = {
    id: 1,
    name: "Test User",
    email: "test@example.com",
    avatarUrl: "https://example.com/avatar.jpg",
  };

  const mockLogout = vi.fn();

  // Helper function to render AppLayout with router
  const renderAppLayout = (isAuthenticated = true) => {
    // Update the mock return value for useSelector
    vi.mocked(useSelector).mockReturnValue(isAuthenticated);

    return render(
      <MemoryRouter>
        <Routes>
          <Route
            path="/"
            element={
              <AppLayout
                onLogout={mockLogout}
                userData={isAuthenticated ? mockUserData : null}
              />
            }
          >
            <Route index element={<div>Main Content</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to login when user is not authenticated", () => {
    renderAppLayout(false);
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("renders main layout when user is authenticated", () => {
    renderAppLayout();
    expect(screen.getByText("Main Content")).toBeInTheDocument();
  });

  it("renders navbar with user data", () => {
    renderAppLayout();
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("handles logout", async () => {
    renderAppLayout();
    const logoutButton = screen.getByRole("button", { name: /logout/i });

    await userEvent.click(logoutButton);
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it("renders with correct layout structure", () => {
    renderAppLayout();

    // Check main structural elements
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("navigation")).toBeInTheDocument();

    // Check layout classes
    const mainContainer = screen.getByRole("main").parentElement;
    expect(mainContainer).toHaveClass("container", "flex-1", "flex");
  });
});
