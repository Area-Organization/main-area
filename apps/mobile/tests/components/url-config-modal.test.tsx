import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { UrlConfigModal } from "@/components/url-config-modal";
import { setApiUrl } from "@/lib/url-store";
import { Alert } from "react-native";

// Mock the store
jest.mock("@/lib/url-store", () => ({
  setApiUrl: jest.fn(),
  getApiUrl: jest.fn().mockReturnValue("http://localhost:8080")
}));

// Mock Alert
jest.spyOn(Alert, "alert");

describe("Component: UrlConfigModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly when visible", () => {
    const { getByText, getByPlaceholderText } = render(<UrlConfigModal visible={true} onClose={jest.fn()} />);

    expect(getByText("Backend Configuration")).toBeTruthy();
    expect(getByPlaceholderText("e.g. http://192.168.1.5:8080")).toBeTruthy();
  });

  it("loads current URL on mount", () => {
    const { getByDisplayValue } = render(<UrlConfigModal visible={true} onClose={jest.fn()} />);
    expect(getByDisplayValue("http://localhost:8080")).toBeTruthy();
  });

  it("saves URL and auto-appends http protocol", async () => {
    const mockOnClose = jest.fn();
    const { getByPlaceholderText, getByText } = render(<UrlConfigModal visible={true} onClose={mockOnClose} />);

    const input = getByPlaceholderText("e.g. http://192.168.1.5:8080");
    fireEvent.changeText(input, "192.168.1.10:3000"); // No http

    fireEvent.press(getByText("Save"));

    await waitFor(() => {
      expect(setApiUrl).toHaveBeenCalledWith("http://192.168.1.10:3000");
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("validates empty input", () => {
    const { getByPlaceholderText, getByText } = render(<UrlConfigModal visible={true} onClose={jest.fn()} />);

    fireEvent.changeText(getByPlaceholderText("e.g. http://192.168.1.5:8080"), "");
    fireEvent.press(getByText("Save"));

    expect(Alert.alert).toHaveBeenCalledWith("Invalid URL", "Please enter a valid URL.");
    expect(setApiUrl).not.toHaveBeenCalled();
  });
});
