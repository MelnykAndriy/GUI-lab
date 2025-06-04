import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReloadIcon } from "@radix-ui/react-icons";
import { RegisterData } from "@/services/authService";

enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

interface RegisterFormProps {
  onSubmit: (formData: RegisterData) => void;
  isLoading?: boolean;
}

interface FormFieldProps {
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ children }) => (
  <div className="space-y-2">{children}</div>
);

const validateForm = (formData: RegisterData): boolean => {
  if (
    !formData.name ||
    !formData.email ||
    !formData.password ||
    !formData.dob
  ) {
    return false;
  }

  if (!formData.gender) {
    return false;
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    return false;
  }

  // Ensure date is valid
  const dobDate = new Date(formData.dob);
  if (isNaN(dobDate.getTime())) {
    return false;
  }

  return true;
};

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  } catch (error) {
    return dateString;
  }
};

const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
    gender: "",
    dob: "",
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm(formData)) {
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "dob" && value) {
        return { ...prev, [name]: formatDate(value) };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleGenderChange = (value: string) => {
    setFormData((prev) => ({ ...prev, gender: value }));
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>Create an account to start chatting</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          data-testid="register-form"
        >
          <FormField>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
              data-testid="name-input"
            />
          </FormField>
          <FormField>
            <Label htmlFor="gender">Gender</Label>
            <Select
              name="gender"
              value={formData.gender}
              onValueChange={handleGenderChange}
              disabled={isLoading}
              required
              data-testid="gender-select"
            >
              <SelectTrigger aria-label="Gender" data-testid="gender-trigger">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value={Gender.MALE}
                  data-testid="gender-option-male"
                >
                  Male
                </SelectItem>
                <SelectItem
                  value={Gender.FEMALE}
                  data-testid="gender-option-female"
                >
                  Female
                </SelectItem>
                <SelectItem
                  value={Gender.OTHER}
                  data-testid="gender-option-other"
                >
                  Other
                </SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField>
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleChange}
              required
              disabled={isLoading}
              data-testid="dob-input"
            />
          </FormField>
          <FormField>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john.doe@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
              data-testid="email-input"
            />
          </FormField>
          <FormField>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              data-testid="password-input"
            />
          </FormField>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            data-testid="submit-button"
          >
            {isLoading ? (
              <>
                <ReloadIcon
                  data-testid="loading-spinner"
                  className="mr-2 h-4 w-4 animate-spin"
                />
                Registering...
              </>
            ) : (
              "Register"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="items-center flex justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <a href="/login" className="text-primary hover:underline">
            Login
          </a>
        </p>
      </CardFooter>
    </Card>
  );
};

export default RegisterForm;
