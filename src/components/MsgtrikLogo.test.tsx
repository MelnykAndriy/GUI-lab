import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MsgtrikLogo from "./MsgtrikLogo";

// First, let's modify the MsgtrikLogo component to add test IDs
const modifiedComponent = `import React from "react";
import { Zap } from "lucide-react";

interface MsgtrikLogoProps {
  size?: number;
  className?: string;
}

const MsgtrikLogo: React.FC<MsgtrikLogoProps> = ({
  size = 24,
  className = "",
}) => {
  return (
    <div data-testid="msgtrik-logo" className={\`flex items-center \${className}\`}>
      <div data-testid="msgtrik-logo-icon-container" className="mr-2 p-1 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-md">
        <Zap data-testid="msgtrik-logo-icon" size={size} className="text-white" />
      </div>
      <span data-testid="msgtrik-logo-text" className="font-bold text-xl">Msgtrik</span>
    </div>
  );
};

export default MsgtrikLogo;`;

describe("MsgtrikLogo", () => {
  it("renders with default props", () => {
    render(<MsgtrikLogo />);

    const logo = screen.getByTestId("msgtrik-logo");
    const iconContainer = screen.getByTestId("msgtrik-logo-icon-container");
    const icon = screen.getByTestId("msgtrik-logo-icon");
    const text = screen.getByTestId("msgtrik-logo-text");

    expect(logo).toBeInTheDocument();
    expect(logo.className).toContain("flex items-center");

    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer.className).toContain("bg-gradient-to-tr");
    expect(iconContainer.className).toContain("from-blue-500");
    expect(iconContainer.className).toContain("to-purple-500");

    expect(icon).toBeInTheDocument();
    expect(icon.parentElement).toBe(iconContainer);

    expect(text).toBeInTheDocument();
    expect(text.textContent).toBe("Msgtrik");
    expect(text.className).toContain("font-bold");
    expect(text.className).toContain("text-xl");
  });

  it("applies custom size", () => {
    const customSize = 32;
    render(<MsgtrikLogo size={customSize} />);

    const icon = screen.getByTestId("msgtrik-logo-icon");
    expect(icon).toHaveAttribute("width", customSize.toString());
    expect(icon).toHaveAttribute("height", customSize.toString());
  });

  it("applies custom className", () => {
    const customClass = "test-class";
    render(<MsgtrikLogo className={customClass} />);

    const logo = screen.getByTestId("msgtrik-logo");
    expect(logo.className).toContain(customClass);
    expect(logo.className).toContain("flex items-center");
  });

  it("combines default and custom classes correctly", () => {
    const customClass = "custom-padding custom-margin";
    render(<MsgtrikLogo className={customClass} />);

    const logo = screen.getByTestId("msgtrik-logo");
    expect(logo.className).toContain("flex items-center");
    expect(logo.className).toContain("custom-padding");
    expect(logo.className).toContain("custom-margin");
  });
});
