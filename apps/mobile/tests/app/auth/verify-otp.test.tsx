import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import VerifyOtpScreen from "@/app/(auth)/verify-otp";

// Mocks
const mockReplace = jest.fn();
const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockReplace, back: mockBack }),
  useLocalSearchParams: () => ({ email: "test@example.com" })
}));

const mockVerifyEmail = jest.fn();
const mockSendVerificationOtp = jest.fn();

jest.mock("@/lib/auth", () => ({
  authClient: {
    emailOtp: {
      verifyEmail: (...args: any[]) => mockVerifyEmail(...args),
      sendVerificationOtp: (...args: any[]) => mockSendVerificationOtp(...args)
    }
  }
}));

const mockSignIn = jest.fn();
jest.mock("@/ctx", () => ({
  useSession: () => ({
    signIn: mockSignIn
  })
}));

const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();
jest.mock("@/components/ui/toast", () => ({
  useToast: () => ({ success: mockToastSuccess, error: mockToastError })
}));

describe("Screen: Verify OTP", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with email from params", () => {
    const { getByText } = render(<VerifyOtpScreen />);
    expect(getByText("test@example.com")).toBeTruthy();
    expect(getByText("Check your email")).toBeTruthy();
  });

  it("validates empty OTP", () => {
    const { getByText } = render(<VerifyOtpScreen />);
    fireEvent.press(getByText("Verify Email"));
    expect(mockToastError).toHaveBeenCalledWith("Please enter a valid code");
  });

  it("calls verify API and navigates on success", async () => {
    mockVerifyEmail.mockResolvedValue({ error: null });

    const { getByPlaceholderText, getByText } = render(<VerifyOtpScreen />);

    fireEvent.changeText(getByPlaceholderText("Enter 6-digit code"), "123456");
    fireEvent.press(getByText("Verify Email"));

    await waitFor(() => {
      expect(mockVerifyEmail).toHaveBeenCalledWith({
        email: "test@example.com",
        otp: "123456",
        type: "email-verification"
      });
    });

    expect(mockSignIn).toHaveBeenCalled();
    expect(mockToastSuccess).toHaveBeenCalledWith("Email verified!");
    expect(mockReplace).toHaveBeenCalledWith("/(tabs)");
  });

  it("handles verification failure", async () => {
    mockVerifyEmail.mockResolvedValue({
      error: { message: "Invalid code" }
    });

    const { getByPlaceholderText, getByText } = render(<VerifyOtpScreen />);

    fireEvent.changeText(getByPlaceholderText("Enter 6-digit code"), "000000");
    fireEvent.press(getByText("Verify Email"));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Invalid code");
    });

    expect(mockSignIn).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("resends OTP code", async () => {
    mockSendVerificationOtp.mockResolvedValue({ error: null });

    const { getByText } = render(<VerifyOtpScreen />);

    fireEvent.press(getByText("Didn't receive code? Resend"));

    await waitFor(() => {
      expect(mockSendVerificationOtp).toHaveBeenCalledWith({
        email: "test@example.com",
        type: "email-verification"
      });
    });

    expect(mockToastSuccess).toHaveBeenCalledWith("Code sent!");
  });
});
