import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import RegisterScreen from "@/app/(auth)/register";

// Mocks
const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockReplace })
}));

const mockSignUpEmail = jest.fn();
jest.mock("@/lib/auth", () => ({
  authClient: {
    signUp: {
      email: (...args: any[]) => mockSignUpEmail(...args)
    }
  }
}));

const mockCtxSignIn = jest.fn();
jest.mock("@/ctx", () => ({
  useSession: () => ({
    signIn: mockCtxSignIn
  })
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

  it("calls authClient and navigates on successful registration", async () => {
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

    expect(mockCtxSignIn).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("/(tabs)");
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

    expect(mockReplace).not.toHaveBeenCalled();
  });
});
