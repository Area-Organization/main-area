import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Input } from "@/components/ui/input";

describe("Component: Input", () => {
  it("renders with placeholder", () => {
    const { getByPlaceholderText } = render(<Input placeholder="test placeholder" />);
    expect(getByPlaceholderText("test placeholder")).toBeTruthy();
  });

  it("displays error message when provided", () => {
    const { getByText } = render(<Input placeholder="email" error="Invalid email address" />);
    expect(getByText("Invalid email address")).toBeTruthy();
  });

  it("handles text changes", () => {
    const handleChange = jest.fn();
    const { getByPlaceholderText } = render(<Input placeholder="type here" onChangeText={handleChange} />);

    fireEvent.changeText(getByPlaceholderText("type here"), "hello");
    expect(handleChange).toHaveBeenCalledWith("hello");
  });
});
