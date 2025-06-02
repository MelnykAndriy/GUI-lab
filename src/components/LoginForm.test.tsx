import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import userEvent from "@testing-library/user-event";
import LoginForm from "./LoginForm";
import { LoginData } from "@/services/authService";

describe("LoginForm", () => {
  const mockOnSubmit = vi.fn();
  const validLoginData: LoginData = {
    email: "test@example.com",
    password: "password123",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders login form with correct fields and initial state", async () => {
    await act(async () => {
      render(<LoginForm onSubmit={mockOnSubmit} />);
    });

    // Check title and description
    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
    expect(
      screen.getByText("Enter your credentials to access your account"),
    ).toBeInTheDocument();

    // Check form fields
    const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;

    // Check initial state
    expect(emailInput).toBeInTheDocument();
    expect(emailInput.value).toBe("");
    expect(emailInput.type).toBe("email");
    expect(emailInput.required).toBe(true);

    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput.value).toBe("");
    expect(passwordInput.type).toBe("password");
    expect(passwordInput.required).toBe(true);

    // Check submit button
    const submitButton = screen.getByRole("button", { name: "Login" });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();

    // Check registration link
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    const registerLink = screen.getByRole("link", { name: "Register" });
    expect(registerLink).toHaveAttribute("href", "/register");
    expect(registerLink).toHaveClass("text-primary", "hover:underline");
  });

  it("handles form submission with correct data", async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<LoginForm onSubmit={mockOnSubmit} />);
    });

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: "Login" });

    await act(async () => {
      await user.type(emailInput, validLoginData.email);
      await user.type(passwordInput, validLoginData.password);
      await user.click(submitButton);
    });

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith(validLoginData);
    });
  });

  it("shows loading state correctly", async () => {
    await act(async () => {
      render(<LoginForm onSubmit={mockOnSubmit} isLoading={true} />);
    });

    // Check if inputs are disabled
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button");

    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();

    // Check loading indicators
    expect(screen.getByText("Logging in...")).toBeInTheDocument();
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  describe("Form Validation", () => {
    it("requires email and password fields", async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<LoginForm onSubmit={mockOnSubmit} />);
      });

      const submitButton = screen.getByRole("button", { name: "Login" });

      await act(async () => {
        await user.click(submitButton);
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();

      // Check validation messages
      const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
      const passwordInput = screen.getByLabelText(
        "Password",
      ) as HTMLInputElement;

      expect(emailInput.validity.valid).toBe(false);
      expect(passwordInput.validity.valid).toBe(false);
    });

    it("validates email format", async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<LoginForm onSubmit={mockOnSubmit} />);
      });

      const emailInput = screen.getByLabelText("Email") as HTMLInputElement;

      await act(async () => {
        await user.type(emailInput, "invalid-email");
      });

      expect(emailInput.validity.valid).toBe(false);
      expect(emailInput.validity.typeMismatch).toBe(true);

      // Clear and type valid email
      await act(async () => {
        await user.clear(emailInput);
        await user.type(emailInput, validLoginData.email);
      });

      expect(emailInput.validity.valid).toBe(true);
    });

    it("preserves form data during input", async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<LoginForm onSubmit={mockOnSubmit} />);
      });

      const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
      const passwordInput = screen.getByLabelText(
        "Password",
      ) as HTMLInputElement;

      // Type partial data
      await act(async () => {
        await user.type(emailInput, "test@");
        await user.type(passwordInput, "pass");
      });

      // Check intermediate state
      expect(emailInput.value).toBe("test@");
      expect(passwordInput.value).toBe("pass");

      // Complete the input
      await act(async () => {
        await user.type(emailInput, "example.com");
        await user.type(passwordInput, "word123");
      });

      // Check final state
      expect(emailInput.value).toBe(validLoginData.email);
      expect(passwordInput.value).toBe(validLoginData.password);
    });
  });
});
