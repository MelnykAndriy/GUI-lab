import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Navbar from "./Navbar";

// Wrapper component to provide router context
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("Navbar", () => {
  it("renders correctly when logged out", () => {
    renderWithRouter(<Navbar />);

    // Check main navbar element
    expect(screen.getByTestId("navbar")).toBeInTheDocument();

    // Check logo presence
    expect(screen.getByTestId("logo-link")).toHaveAttribute("href", "/");

    // Check navigation links
    expect(screen.getByTestId("about-link")).toHaveAttribute("href", "/about");

    // Check auth buttons container
    const authButtons = screen.getByTestId("auth-buttons");
    expect(authButtons).toBeInTheDocument();

    // Check auth buttons
    expect(screen.getByTestId("login-link")).toHaveAttribute("href", "/login");
    expect(screen.getByTestId("register-link")).toHaveAttribute("href", "/register");

    // Verify logged-out state specific elements are not present
    expect(screen.queryByTestId("profile-link")).not.toBeInTheDocument();
    expect(screen.queryByTestId("logout-button")).not.toBeInTheDocument();
  });

  it("renders correctly when logged in", () => {
    renderWithRouter(<Navbar isLoggedIn={true} />);

    // Check presence of logged-in state elements
    expect(screen.getByTestId("profile-link")).toHaveAttribute("href", "/profile");
    expect(screen.getByTestId("logout-button")).toBeInTheDocument();

    // Verify logged-out state elements are not present
    expect(screen.queryByTestId("auth-buttons")).not.toBeInTheDocument();
    expect(screen.queryByTestId("login-link")).not.toBeInTheDocument();
    expect(screen.queryByTestId("register-link")).not.toBeInTheDocument();
  });

  it("calls onLogout when logout button is clicked", async () => {
    const mockOnLogout = vi.fn();
    const user = userEvent.setup();

    renderWithRouter(<Navbar isLoggedIn={true} onLogout={mockOnLogout} />);

    // Click logout button
    const logoutButton = screen.getByTestId("logout-button");
    await user.click(logoutButton);

    // Verify onLogout was called
    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });

  it("contains all navigation links with correct hrefs", () => {
    renderWithRouter(<Navbar />);

    // Check all navigation links
    expect(screen.getByTestId("logo-link")).toHaveAttribute("href", "/");
    expect(screen.getByTestId("about-link")).toHaveAttribute("href", "/about");
    expect(screen.getByTestId("login-link")).toHaveAttribute("href", "/login");
    expect(screen.getByTestId("register-link")).toHaveAttribute("href", "/register");
  });
}); 