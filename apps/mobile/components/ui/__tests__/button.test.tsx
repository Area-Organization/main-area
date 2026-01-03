import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Button } from "../button";

describe("Button", () => {
  it("renders correctly with title", () => {
    const { getByText } = render(<Button title="Press Me" onPress={() => {}} />);
    expect(getByText("Press Me")).toBeTruthy();
  });

  it("handles onPress events", () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button title="Press Me" onPress={onPressMock} />);

    fireEvent.press(getByText("Press Me"));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
