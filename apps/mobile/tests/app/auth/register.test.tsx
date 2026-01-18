import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import RegisterScreen from "@/app/(auth)/register";

// Mocks
const mockReplace = jest.fn();
const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush })
}));

const mockSignUpEmail = jest.fn();
jest.mock("@/lib/auth", () => ({
  authClient: {
    signUp: {
      email: (...args: any[]) => mockSignUpEmail(...args)
    }
  }
}));

describe("Screen: Register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows validation errors for empty fields", () => {
    const { getByText } = render(<RegisterScreen />);

    const btn = getByText("Sign Up");
    fireEvent.press(btn);

    expect(getByText("Name is required")).toBeTruthy();
  });

  it("calls authClient and navigates to verify-otp on successful registration", async () => {
    mockSignUpEmail.mockResolvedValue({ error: null });

    const { getByPlaceholderText, getByText } = render(<RegisterScreen />);

    fireEvent.changeText(getByPlaceholderText("Full Name"), "John Doe");
    fireEvent.changeText(getByPlaceholderText("Email"), "john@test.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "securepass");
    fireEvent.press(getByText("Sign Up"));

    await waitFor(() => {
      expect(mockSignUpEmail).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@test.com",
        password: "securepass"
      });
    });

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(auth)/verify-otp",
      params: { email: "john@test.com" }
    });
  });

  it("displays backend error message on failure", async () => {
    mockSignUpEmail.mockResolvedValue({
      error: { message: "Email already in use" }
    });

    const { getByPlaceholderText, getByText } = render(<RegisterScreen />);

    fireEvent.changeText(getByPlaceholderText("Full Name"), "John Doe");
    fireEvent.changeText(getByPlaceholderText("Email"), "john@test.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "securepass");
    fireEvent.press(getByText("Sign Up"));

    await waitFor(() => {
      expect(getByText("Email already in use")).toBeTruthy();
    });

    expect(mockPush).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
