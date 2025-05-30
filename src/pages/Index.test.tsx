import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Index from "./Index";

const renderIndex = () => {
  render(
    <BrowserRouter>
      <Index />
    </BrowserRouter>
  );
};

describe("Index", () => {
  it("renders main content with correct text and styling", () => {
    renderIndex();

    // Check main heading
    const heading = screen.getByText("Welcome to Msgtrik");
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass(
      "text-4xl",
      "md:text-6xl",
      "font-bold",
      "bg-gradient-to-r",
      "from-primary",
      "to-accent",
      "bg-clip-text",
      "text-transparent"
    );

    // Check subtitle
    const subtitle = screen.getByText(
      "Connect with friends and family with our simple, modern chat application. Register now to start chatting!"
    );
    expect(subtitle).toBeInTheDocument();
    expect(subtitle).toHaveClass("text-xl", "mb-8", "text-muted-foreground");
  });

  it("renders navigation buttons with correct links", () => {
    renderIndex();

    // Check "Get Started" button
    const getStartedLink = screen.getByText("Get Started").closest("a");
    expect(getStartedLink).toHaveAttribute("href", "/register");
    const getStartedButton = screen.getByText("Get Started").closest("button");
    expect(getStartedButton).toHaveClass("w-full", "sm:w-auto");

    // Check "Learn More" button
    const learnMoreLink = screen.getByText("Learn More").closest("a");
    expect(learnMoreLink).toHaveAttribute("href", "/about");
    const learnMoreButton = screen.getByText("Learn More").closest("button");
    expect(learnMoreButton).toHaveClass("w-full", "sm:w-auto");
  });

  it("renders all feature cards with correct content", () => {
    renderIndex();

    // Feature 1: Simple & Clean
    const simpleCard = screen.getByText("Simple & Clean").closest("div");
    expect(simpleCard).toHaveClass("bg-card", "p-6", "rounded-lg", "shadow-sm", "border");
    expect(screen.getByText("Simple & Clean")).toHaveClass("text-xl", "font-semibold", "mb-3");
    expect(screen.getByText("Enjoy a distraction-free chat experience with our minimalist design."))
      .toHaveClass("text-muted-foreground");

    // Feature 2: Mobile Friendly
    const mobileCard = screen.getByText("Mobile Friendly").closest("div");
    expect(mobileCard).toHaveClass("bg-card", "p-6", "rounded-lg", "shadow-sm", "border");
    expect(screen.getByText("Mobile Friendly")).toHaveClass("text-xl", "font-semibold", "mb-3");
    expect(screen.getByText("Chat on the go with our fully responsive mobile design."))
      .toHaveClass("text-muted-foreground");

    // Feature 3: Fast & Secure
    const secureCard = screen.getByText("Fast & Secure").closest("div");
    expect(secureCard).toHaveClass("bg-card", "p-6", "rounded-lg", "shadow-sm", "border");
    expect(screen.getByText("Fast & Secure")).toHaveClass("text-xl", "font-semibold", "mb-3");
    expect(screen.getByText("Experience fast messaging with privacy and security built in."))
      .toHaveClass("text-muted-foreground");
  });

  it("renders with responsive layout classes", () => {
    renderIndex();

    // Check main container
    const mainContainer = screen.getByText("Welcome to Msgtrik").closest("div").parentElement;
    expect(mainContainer).toHaveClass(
      "min-h-[calc(100vh-4rem)]",
      "flex",
      "flex-col",
      "items-center",
      "justify-center"
    );

    // Check feature cards container
    const featureContainer = screen.getByText("Simple & Clean").closest("div").parentElement;
    expect(featureContainer).toHaveClass(
      "grid",
      "grid-cols-1",
      "md:grid-cols-3",
      "gap-8",
      "w-full",
      "max-w-5xl"
    );

    // Check buttons container
    const buttonsContainer = screen.getByText("Get Started").closest("div");
    expect(buttonsContainer).toHaveClass(
      "flex",
      "flex-col",
      "sm:flex-row",
      "justify-center",
      "gap-4"
    );
  });

  it("displays all expected text content", () => {
    renderIndex();

    // Check all text content is present
    const expectedTexts = [
      "Welcome to Msgtrik",
      "Connect with friends and family with our simple, modern chat application. Register now to start chatting!",
      "Get Started",
      "Learn More",
      "Simple & Clean",
      "Enjoy a distraction-free chat experience with our minimalist design.",
      "Mobile Friendly",
      "Chat on the go with our fully responsive mobile design.",
      "Fast & Secure",
      "Experience fast messaging with privacy and security built in."
    ];

    expectedTexts.forEach(text => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  });
}); 