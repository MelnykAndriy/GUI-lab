import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import UserAvatar from "./UserAvatar";

describe("UserAvatar", () => {
  it("renders with user name and avatar URL", () => {
    const user = {
      profile: {
        name: "John Doe",
        avatarUrl: "https://example.com/avatar.jpg",
      },
      email: "john@example.com",
    };

    render(<UserAvatar user={user} />);
    const img = screen.getByTestId("avatar-image") as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toBe("https://example.com/avatar.jpg");
    expect(img.alt).toBe("John Doe");
  });

  it("renders initials when no avatar URL is provided", () => {
    const user = {
      profile: {
        name: "John Doe",
      },
      email: "john@example.com",
    };

    render(<UserAvatar user={user} />);
    const initials = screen.getByTestId("avatar-initials");
    expect(initials).toBeInTheDocument();
    expect(initials.textContent).toBe("JD");
    expect(screen.getByTestId("avatar-container")).toHaveClass("bg-purple-500"); // Based on email hash
  });

  it("renders user icon when no name or avatar is provided", () => {
    const user = {
      email: "john@example.com",
    };

    render(<UserAvatar user={user} />);
    const userIcon = screen.getByTestId("user-icon");
    expect(userIcon).toBeInTheDocument();
    expect(userIcon).toHaveClass("text-white", "h-1/2", "w-1/2");
  });

  it("applies different sizes correctly", () => {
    const user = { email: "test@example.com" };

    // Test small size
    const { rerender } = render(<UserAvatar user={user} size="sm" />);
    const smallContainer = screen.getByTestId("avatar-container");
    expect(smallContainer).toHaveClass("h-8", "w-8");

    // Test medium size (default)
    rerender(<UserAvatar user={user} size="md" />);
    const mediumContainer = screen.getByTestId("avatar-container");
    expect(mediumContainer).toHaveClass("h-10", "w-10");

    // Test large size
    rerender(<UserAvatar user={user} size="lg" />);
    const largeContainer = screen.getByTestId("avatar-container");
    expect(largeContainer).toHaveClass("h-16", "w-16");
  });

  it("uses custom avatar color when provided", () => {
    const user = {
      profile: {
        name: "John Doe",
        avatarColor: "bg-red-500",
      },
    };

    render(<UserAvatar user={user} />);
    const container = screen.getByTestId("avatar-container");
    expect(container).toHaveClass("bg-red-500");
  });

  it("handles image load error correctly", async () => {
    const user = {
      profile: {
        name: "John Doe",
        avatarUrl: "invalid-url.jpg",
      },
      email: "john@example.com",
    };

    render(<UserAvatar user={user} />);
    const img = screen.getByTestId("avatar-image") as HTMLImageElement;

    // Simulate image load error
    const errorEvent = new ErrorEvent("error");
    img.dispatchEvent(errorEvent);

    expect(img.style.display).toBe("none");
    expect(img.parentElement).toHaveClass("bg-purple-500"); // Based on email hash

    // Check if fallback content is rendered
    const fallbackInitials = screen.getByTestId("avatar-initials");
    expect(fallbackInitials).toBeInTheDocument();
    expect(fallbackInitials.textContent).toBe("JD");
  });

  it("applies custom className", () => {
    const user = { email: "test@example.com" };
    const customClass = "custom-avatar";

    render(<UserAvatar user={user} className={customClass} />);
    const container = screen.getByTestId("avatar-container");
    expect(container).toHaveClass(customClass);
  });

  it("generates consistent background colors based on email", () => {
    const user1 = { email: "test1@example.com" };
    const user2 = { email: "test1@example.com" }; // Same email
    const user3 = { email: "different@example.com" };

    const { rerender } = render(<UserAvatar user={user1} />);
    const firstContainer = screen.getByTestId("avatar-container");
    const firstColor = firstContainer.className;

    rerender(<UserAvatar user={user2} />);
    const secondContainer = screen.getByTestId("avatar-container");
    const secondColor = secondContainer.className;

    rerender(<UserAvatar user={user3} />);
    const thirdContainer = screen.getByTestId("avatar-container");
    const thirdColor = thirdContainer.className;

    // Same email should result in same color
    expect(firstColor).toBe(secondColor);
    // Different email should result in different color
    expect(firstColor).not.toBe(thirdColor);
  });

  it("handles empty user object gracefully", () => {
    const user = {};

    render(<UserAvatar user={user} />);
    const container = screen.getByTestId("avatar-container");
    expect(container).toHaveClass("bg-gray-400");

    const userIcon = screen.getByTestId("user-icon");
    expect(userIcon).toBeInTheDocument();
    expect(userIcon).toHaveClass("text-white");
  });
});
