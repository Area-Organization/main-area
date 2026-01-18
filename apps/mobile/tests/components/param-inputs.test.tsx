import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { ParamInputs } from "@/components/param-inputs";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0 })
}));

describe("Component: ParamInputs", () => {
  const mockOnChange = jest.fn();
  const paramsSchema = {
    message: { type: "string", label: "Message", required: true },
    isPrivate: { type: "boolean", label: "Private", required: false }
  };
  const availableVars = [{ name: "author", description: "The author name" }];

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("renders correct input types", () => {
    const { getByPlaceholderText, getByRole } = render(
      <ParamInputs params={paramsSchema} values={{}} onChange={mockOnChange} />
    );
    expect(getByPlaceholderText("Enter Message")).toBeTruthy();
    expect(getByRole("switch")).toBeTruthy();
  });

  it("calls onChange when text is entered", () => {
    const { getByPlaceholderText } = render(
      <ParamInputs params={paramsSchema} values={{ message: "" }} onChange={mockOnChange} />
    );

    const input = getByPlaceholderText("Enter Message");
    fireEvent.changeText(input, "hello");

    expect(mockOnChange).toHaveBeenCalledWith("message", "hello");
  });

  it("opens modal and inserts variable", () => {
    const { getByTestId, getByText } = render(
      <ParamInputs
        params={paramsSchema}
        values={{ message: "Hello " }}
        onChange={mockOnChange}
        availableVariables={availableVars}
      />
    );

    // Open Modal
    fireEvent.press(getByTestId("var-btn-message"));

    // Check modal visibility
    expect(getByText("Insert Variable")).toBeTruthy();

    // Click variable
    fireEvent.press(getByText("{{author}}"));

    // Expect inserted variable
    expect(mockOnChange).toHaveBeenCalledWith("message", expect.stringContaining("{{author}}"));
  });
});
