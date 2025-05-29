import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterForm from "./RegisterForm";
import { RegisterData } from "@/services/authService";

// Mock the hasPointerCapture function
beforeEach(() => {
  HTMLElement.prototype.hasPointerCapture = () => false;
});

describe("RegisterForm", () => {
  const mockOnSubmit = vi.fn();
  const validRegisterData: RegisterData = {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    gender: "male",
    dob: "1990-01-01",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders register form with correct fields and initial state", async () => {
    await act(async () => {
      render(<RegisterForm onSubmit={mockOnSubmit} />);
    });

    // Check title and description
    expect(screen.getByTestId("register-form")).toBeInTheDocument();
    expect(
      screen.getByText("Create an account to start chatting"),
    ).toBeInTheDocument();

    // Check form fields and their initial states
    const nameInput = screen.getByTestId("name-input") as HTMLInputElement;
    const genderSelect = screen.getByTestId("gender-trigger") as HTMLElement;
    const dobInput = screen.getByTestId("dob-input") as HTMLInputElement;
    const emailInput = screen.getByTestId("email-input") as HTMLInputElement;
    const passwordInput = screen.getByTestId(
      "password-input",
    ) as HTMLInputElement;

    // Name input
    expect(nameInput).toBeInTheDocument();
    expect(nameInput.value).toBe("");
    expect(nameInput.required).toBe(true);

    // Gender select
    expect(genderSelect).toBeInTheDocument();
    expect(screen.getByText("Select gender")).toBeInTheDocument();

    // Date of Birth input
    expect(dobInput).toBeInTheDocument();
    expect(dobInput.value).toBe("");
    expect(dobInput.type).toBe("date");
    expect(dobInput.required).toBe(true);

    // Email input
    expect(emailInput).toBeInTheDocument();
    expect(emailInput.value).toBe("");
    expect(emailInput.type).toBe("email");
    expect(emailInput.required).toBe(true);

    // Password input
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput.value).toBe("");
    expect(passwordInput.type).toBe("password");
    expect(passwordInput.required).toBe(true);

    // Check submit button
    const submitButton = screen.getByTestId("submit-button");
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).not.toBeDisabled();

    // Check login link
    expect(screen.getByText("Already have an account?")).toBeInTheDocument();
    expect(screen.getByText("Login")).toHaveAttribute("href", "/login");
    expect(screen.getByText("Login")).toHaveClass(
      "text-primary",
      "hover:underline",
    );
  });

  it("handles form submission with correct data", async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<RegisterForm onSubmit={mockOnSubmit} />);
    });

    // Fill in the form
    await act(async () => {
      await user.type(screen.getByTestId("name-input"), validRegisterData.name);
      await user.type(
        screen.getByTestId("email-input"),
        validRegisterData.email,
      );
      await user.type(
        screen.getByTestId("password-input"),
        validRegisterData.password,
      );
    });

    // Handle gender select
    await act(async () => {
      const hiddenSelect = document.querySelector(
        'select[name="gender"]',
      ) as HTMLSelectElement;
      await user.selectOptions(hiddenSelect, validRegisterData.gender);
    });

    // Fill date
    await act(async () => {
      const dobInput = screen.getByTestId("dob-input") as HTMLInputElement;
      await user.clear(dobInput);
      await user.type(dobInput, validRegisterData.dob);
    });

    // Submit the form
    await act(async () => {
      await user.click(screen.getByTestId("submit-button"));
    });

    // Wait for form submission and verify
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith(validRegisterData);
    });
  });

  it("shows loading state correctly", async () => {
    await act(async () => {
      render(<RegisterForm onSubmit={mockOnSubmit} isLoading={true} />);
    });

    // Check if all inputs are disabled
    const nameInput = screen.getByTestId("name-input");
    const genderSelect = screen.getByTestId("gender-trigger");
    const dobInput = screen.getByTestId("dob-input");
    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const submitButton = screen.getByTestId("submit-button");

    expect(nameInput).toBeDisabled();
    expect(genderSelect).toBeDisabled();
    expect(dobInput).toBeDisabled();
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();

    // Check loading indicators
    expect(screen.getByText("Registering...")).toBeInTheDocument();
    const spinner = screen.getByTestId("loading-spinner");
    expect(spinner).toHaveClass("animate-spin");
  });

  describe("Form Validation", () => {
    it("requires all fields", async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<RegisterForm onSubmit={mockOnSubmit} />);
      });

      // Try to submit empty form
      await act(async () => {
        await user.click(screen.getByTestId("submit-button"));
      });

      // Form should not be submitted
      expect(mockOnSubmit).not.toHaveBeenCalled();

      // Check validation messages for each required field
      const nameInput = screen.getByTestId("name-input") as HTMLInputElement;
      const dobInput = screen.getByTestId("dob-input") as HTMLInputElement;
      const emailInput = screen.getByTestId("email-input") as HTMLInputElement;
      const passwordInput = screen.getByTestId(
        "password-input",
      ) as HTMLInputElement;

      expect(nameInput.validity.valid).toBe(false);
      expect(dobInput.validity.valid).toBe(false);
      expect(emailInput.validity.valid).toBe(false);
      expect(passwordInput.validity.valid).toBe(false);
    });

    it("validates email format", async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<RegisterForm onSubmit={mockOnSubmit} />);
      });

      const emailInput = screen.getByTestId("email-input") as HTMLInputElement;

      await act(async () => {
        await user.type(emailInput, "invalid-email");
      });

      expect(emailInput.validity.valid).toBe(false);
      expect(emailInput.validity.typeMismatch).toBe(true);

      // Clear and type valid email
      await act(async () => {
        await user.clear(emailInput);
        await user.type(emailInput, validRegisterData.email);
      });

      expect(emailInput.validity.valid).toBe(true);
    });

    it("handles gender selection", async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<RegisterForm onSubmit={mockOnSubmit} />);
      });

      // Test selection by directly manipulating the hidden select
      const hiddenSelect = document.querySelector(
        'select[name="gender"]',
      ) as HTMLSelectElement;

      // Check initial state
      expect(screen.getByTestId("gender-trigger")).toHaveTextContent(
        "Select gender",
      );

      // Change value to male
      await act(async () => {
        await user.selectOptions(hiddenSelect, "male");
      });

      await waitFor(() => {
        expect(screen.getByTestId("gender-trigger")).toHaveTextContent("Male");
      });
    });

    it("handles date input correctly", async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<RegisterForm onSubmit={mockOnSubmit} />);
      });

      const dobInput = screen.getByTestId("dob-input") as HTMLInputElement;

      // Set date
      await act(async () => {
        await user.clear(dobInput);
        await user.type(dobInput, validRegisterData.dob);
      });

      // Wait for state update
      await waitFor(() => {
        expect(dobInput.value).toBe(validRegisterData.dob);
      });

      expect(dobInput.validity.valid).toBe(true);

      // Test invalid date
      await act(async () => {
        await user.clear(dobInput);
        await user.type(dobInput, "invalid-date");
      });

      expect(dobInput.validity.valid).toBe(false);
    });
  });
});
