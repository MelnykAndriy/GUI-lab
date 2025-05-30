import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import NotFound from "./NotFound";

// Mock console.error
const mockConsoleError = vi.spyOn(console, "error").mockImplementation(() => {});

describe("NotFound", () => {
  beforeEach(() => {
    mockConsoleError.mockClear();
  });

  it("renders 404 page with correct content", () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );

    // Check for main heading
    const heading = screen.getByText("404");
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe("H1");
    expect(heading).toHaveClass("text-4xl", "font-bold", "mb-4");

    // Check for error message
    const errorMessage = screen.getByText("Oops! Page not found");
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveClass("text-xl", "text-gray-600", "mb-4");

    // Check for home link
    const homeLink = screen.getByText("Return to Home");
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "/");
    expect(homeLink).toHaveClass("text-blue-500", "hover:text-blue-700", "underline");
  });

  it("logs error with correct pathname", () => {
    const testPath = "/non-existent-path";
    
    render(
      <MemoryRouter initialEntries={[testPath]}>
        <NotFound />
      </MemoryRouter>
    );

    // Verify error was logged with correct path
    expect(mockConsoleError).toHaveBeenCalledTimes(1);
    expect(mockConsoleError).toHaveBeenCalledWith(
      "404 Error: User attempted to access non-existent route:",
      testPath
    );
  });

  it("logs different pathnames for different routes", () => {
    const firstPath = "/first-path";
    render(
      <MemoryRouter initialEntries={[firstPath]}>
        <NotFound />
      </MemoryRouter>
    );

    expect(mockConsoleError).toHaveBeenCalledWith(
      "404 Error: User attempted to access non-existent route:",
      firstPath
    );

    mockConsoleError.mockClear();

    const secondPath = "/second-path";
    render(
      <MemoryRouter initialEntries={[secondPath]}>
        <NotFound />
      </MemoryRouter>
    );

    expect(mockConsoleError).toHaveBeenCalledWith(
      "404 Error: User attempted to access non-existent route:",
      secondPath
    );
  });

  it("renders in a full-screen container with proper styling", () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );

    const container = screen.getByText("404").closest("div");
    expect(container?.parentElement).toHaveClass(
      "min-h-screen",
      "flex",
      "items-center",
      "justify-center",
      "bg-gray-100"
    );
  });
}); 