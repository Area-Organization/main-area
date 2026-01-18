import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { CustomSwitch } from "@/components/ui/custom-switch";

// Mock Haptics
jest.mock("@/lib/haptics", () => ({
  feedback: { impact: jest.fn() }
}));

describe("Component: CustomSwitch", () => {
  it("renders with correct accessibility state", () => {
    const { getByRole } = render(<CustomSwitch value={true} onValueChange={jest.fn()} primaryColor="blue" />);

    const switchEl = getByRole("switch");
    expect(switchEl.props.accessibilityState.checked).toBe(true);
  });

  it("triggers callback and haptics on press", () => {
    const mockChange = jest.fn();
    const { getByRole } = render(<CustomSwitch value={false} onValueChange={mockChange} primaryColor="blue" />);

    fireEvent.press(getByRole("switch"));

    expect(mockChange).toHaveBeenCalledWith(true);
  });
});
