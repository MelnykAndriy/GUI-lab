import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./features/user/userSlice";
import App from "./App";
import { MemoryRouter } from "react-router-dom";

// Mock components to simplify testing
vi.mock("./pages/Index", () => ({
  default: () => <div data-testid="index-page">Index Page</div>,
}));
vi.mock("./pages/Login", () => ({
  default: () => <div data-testid="login-page">Login Page</div>,
}));
vi.mock("./pages/Register", () => ({
  default: () => <div data-testid="register-page">Register Page</div>,
}));
vi.mock("./pages/Profile", () => ({
  default: () => <div data-testid="profile-page">Profile Page</div>,
}));
vi.mock("./pages/Chat", () => ({
  default: () => <div data-testid="chat-page">Chat Page</div>,
}));
vi.mock("./pages/About", () => ({
  default: () => <div data-testid="about-page">About Page</div>,
}));
vi.mock("./pages/NotFound", () => ({
  default: () => <div data-testid="not-found-page">Not Found Page</div>,
}));

// Mock window.location
const mockLocation = {
  href: "/",
};
Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

// Create a mock store
const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      user: userReducer,
    },
    preloadedState,
  });
};

describe("App", () => {
  let store: ReturnType<typeof createTestStore>;
  const mockUser = {
    id: 1,
    name: "Test User",
    email: "test@example.com",
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset location
    window.location.href = "/";
    // Create a fresh store
    store = createTestStore();
    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
    vi.clearAllMocks();
    // Clean up any mounted components
    cleanup();
  });

  const renderApp = (initialRoute = "/") => {
    cleanup(); // Clean up before each render
    const MemoryRouterWithInitialEntries = ({
      children,
    }: {
      children: React.ReactNode;
    }) => (
      <MemoryRouter initialEntries={[initialRoute]} initialIndex={0}>
        {children}
      </MemoryRouter>
    );

    return render(
      <Provider store={store}>
        <App RouterComponent={MemoryRouterWithInitialEntries} />
      </Provider>,
    );
  };

  it("renders index page for unauthenticated users", () => {
    renderApp();
    expect(screen.getByTestId("index-page")).toBeInTheDocument();
  });

  it("redirects to chat for authenticated users on root path", async () => {
    // Set up authenticated state
    store = createTestStore({
      user: {
        isAuthenticated: true,
        currentUser: mockUser,
        loading: false,
        error: null,
      },
    });

    renderApp();
    await waitFor(() => {
      expect(screen.queryByTestId("chat-page")).toBeInTheDocument();
    });
  });

  it("protects private routes and redirects to login", async () => {
    renderApp("/profile");
    await waitFor(() => {
      expect(screen.queryByTestId("login-page")).toBeInTheDocument();
    });

    cleanup();
    renderApp("/chat");
    await waitFor(() => {
      expect(screen.queryByTestId("login-page")).toBeInTheDocument();
    });
  });

  it("allows access to public routes when not authenticated", async () => {
    renderApp("/about");
    await waitFor(() => {
      expect(screen.queryByTestId("about-page")).toBeInTheDocument();
    });

    cleanup();
    renderApp("/login");
    await waitFor(() => {
      expect(screen.queryByTestId("login-page")).toBeInTheDocument();
    });

    cleanup();
    renderApp("/register");
    await waitFor(() => {
      expect(screen.queryByTestId("register-page")).toBeInTheDocument();
    });
  });

  it("redirects to chat from public routes when authenticated", async () => {
    // Set up authenticated state
    store = createTestStore({
      user: {
        isAuthenticated: true,
        currentUser: mockUser,
        loading: false,
        error: null,
      },
    });

    renderApp("/login");
    await waitFor(() => {
      expect(screen.queryByTestId("chat-page")).toBeInTheDocument();
    });

    cleanup();
    renderApp("/register");
    await waitFor(() => {
      expect(screen.queryByTestId("chat-page")).toBeInTheDocument();
    });
  });

  it("handles logout correctly", async () => {
    const user = userEvent.setup();

    // Set up authenticated state
    store = createTestStore({
      user: {
        isAuthenticated: true,
        currentUser: mockUser,
        loading: false,
        error: null,
      },
    });

    renderApp();

    // Find and click logout button
    const logoutButton = screen.getByTestId("logout-button");
    await act(async () => {
      await user.click(logoutButton);
    });

    // Check if user is logged out
    await waitFor(() => {
      expect(localStorage.getItem("currentUser")).toBeNull();
      expect(window.location.href).toBe("/");
      expect(store.getState().user.isAuthenticated).toBe(false);
      expect(store.getState().user.currentUser).toBeNull();
    });
  });

  it("shows not found page for invalid routes", async () => {
    renderApp("/invalid-route");
    await waitFor(() => {
      expect(screen.queryByTestId("not-found-page")).toBeInTheDocument();
    });
  });

  it("loads user data from localStorage on mount", async () => {
    // Set up localStorage
    const storedUser = {
      id: 1,
      name: "Test User",
      email: "test@example.com",
    };
    localStorage.setItem("currentUser", JSON.stringify(storedUser));

    renderApp();

    await waitFor(() => {
      const state = store.getState().user;
      expect(state.isAuthenticated).toBe(true);
      expect(state.currentUser).toEqual(storedUser);
    });
  });

  it("renders navbar with correct authentication state", async () => {
    // Test unauthenticated state
    renderApp();
    expect(screen.queryByTestId("login-link")).toBeInTheDocument();
    expect(screen.queryByTestId("register-link")).toBeInTheDocument();
    expect(screen.queryByTestId("logout-button")).not.toBeInTheDocument();

    cleanup();

    // Test authenticated state
    store = createTestStore({
      user: {
        isAuthenticated: true,
        currentUser: mockUser,
        loading: false,
        error: null,
      },
    });

    renderApp();
    await waitFor(() => {
      expect(screen.queryByTestId("login-link")).not.toBeInTheDocument();
      expect(screen.queryByTestId("register-link")).not.toBeInTheDocument();
      expect(screen.queryByTestId("logout-button")).toBeInTheDocument();
    });
  });
});
