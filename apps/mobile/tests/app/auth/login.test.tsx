import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import LoginScreen from "@/app/(auth)/login";

// 1. Mock Router
const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockReplace })
}));

// 2. Mock Auth Client
const mockSignInEmail = jest.fn();
const mockSignInSocial = jest.fn();

jest.mock("@/lib/auth", () => ({
  authClient: {
    signIn: {
      email: (...args: any[]) => mockSignInEmail(...args),
      social: (...args: any[]) => mockSignInSocial(...args)
    }
  }
}));

// 3. Mock Session Context
const mockCtxSignIn = jest.fn();
jest.mock("@/ctx", () => ({
  useSession: () => ({
    signIn: mockCtxSignIn
  })
}));

// 4. Mock Toast
jest.mock("@/components/ui/toast", () => ({
  useToast: () => ({ error: jest.fn(), success: jest.fn() })
}));

describe("Screen: Login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows validation errors for empty fields", () => {
    const { getByText } = render(<LoginScreen />);

    const signInBtn = getByText("Sign In");
    fireEvent.press(signInBtn);

    expect(getByText("Email is required")).toBeTruthy();
  });

  it("calls authClient and navigates on successful login", async () => {
    mockSignInEmail.mockResolvedValue({ error: null });

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText("Email address"), "test@user.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "password123");
    fireEvent.press(getByText("Sign In"));

    await waitFor(() => {
      expect(mockSignInEmail).toHaveBeenCalledWith({
        email: "test@user.com",
        password: "password123"
      });
    });

    expect(mockCtxSignIn).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("/(tabs)");
  });

  it("displays error message on failed login", async () => {
    mockSignInEmail.mockResolvedValue({
      error: { message: "Invalid credentials" }
    });

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText("Email address"), "test@user.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "wrong");
    fireEvent.press(getByText("Sign In"));

    await waitFor(() => {
      expect(getByText("Invalid credentials")).toBeTruthy();
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });
});
