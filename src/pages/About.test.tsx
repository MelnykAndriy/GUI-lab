import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import About from "./About";

// Mock MsgtrikLogo component
vi.mock("@/components/MsgtrikLogo", () => ({
  default: () => <div data-testid="msgtrik-logo">Mocked Logo</div>,
}));

describe("About Page", () => {
  const renderAbout = () => {
    return render(
      <BrowserRouter>
        <About />
      </BrowserRouter>,
    );
  };

  it("renders the logo", () => {
    renderAbout();
    expect(screen.getByTestId("msgtrik-logo")).toBeInTheDocument();
  });

  it("displays the main tagline", () => {
    renderAbout();
    expect(
      screen.getByText("A simple, modern chat application"),
    ).toBeInTheDocument();
  });

  it("displays the main description sections", () => {
    renderAbout();
    
    // First paragraph
    expect(
      screen.getByText(
        /Msgtrik is a modern web application that provides simple and intuitive messaging capabilities/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /connect with friends, family, and colleagues in a clean, distraction-free environment/i,
      ),
    ).toBeInTheDocument();

    // Second paragraph
    expect(
      screen.getByText(
        /Built with the latest web technologies, Msgtrik offers a responsive design that works on all your devices/i,
      ),
    ).toBeInTheDocument();
  });

  it("has a working registration link", () => {
    renderAbout();
    const registerLink = screen.getByText("Join us today!");
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute("href", "/register");
    expect(registerLink).toHaveClass("text-primary", "hover:underline");
  });

  it("renders in a card layout", () => {
    renderAbout();
    
    // Check for card structure
    const card = screen.getByRole("article");
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass("rounded-lg", "border", "bg-card");

    // Check for card header
    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass("text-center");

    // Check for card content
    const content = screen.getByRole("region");
    expect(content).toBeInTheDocument();
    expect(content).toHaveClass("text-center");
  });

  it("has proper responsive layout classes", () => {
    renderAbout();
    
    // Container
    const container = screen.getByTestId("about-container");
    expect(container).toHaveClass("container", "py-12");

    // Content wrapper
    const wrapper = screen.getByTestId("about-wrapper");
    expect(wrapper).toHaveClass("max-w-2xl", "mx-auto");

    // Logo container
    const logoContainer = screen.getByTestId("logo-container");
    expect(logoContainer).toHaveClass(
      "w-24",
      "h-24",
      "mx-auto",
      "flex",
      "items-center",
      "justify-center",
      "mb-4",
    );
  });

  it("maintains consistent text styling", () => {
    renderAbout();
    
    // Tagline
    const tagline = screen.getByText("A simple, modern chat application");
    expect(tagline).toHaveClass("text-xl", "text-muted-foreground");

    // Description paragraphs
    const paragraphs = screen.getAllByText(/^(Msgtrik|Built)/);
    paragraphs.forEach(paragraph => {
      expect(paragraph).toHaveClass("mb-4");
    });

    // Register link
    const registerLink = screen.getByText("Join us today!");
    expect(registerLink).toHaveClass("text-primary", "hover:underline");
  });
}); 