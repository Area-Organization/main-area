import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { ParamInputs } from "@/components/param-inputs";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0 })
}));

describe("Component: ParamInputs", () => {
  const mockOnChange = jest.fn();
  const paramsSchema = {
    repoName: { type: "string", label: "Repository Name", required: true },
    isPrivate: { type: "boolean", label: "Private Repo", required: false }
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("renders correct input types based on schema", () => {
    const { getByPlaceholderText, getByRole } = render(
      <ParamInputs params={paramsSchema} values={{}} onChange={mockOnChange} />
    );

    expect(getByPlaceholderText("Enter Repository Name")).toBeTruthy();
    expect(getByRole("switch")).toBeTruthy();
  });

  it("calls onChange when text is entered", () => {
    const { getByPlaceholderText } = render(
      <ParamInputs params={paramsSchema} values={{ repoName: "" }} onChange={mockOnChange} />
    );

    const input = getByPlaceholderText("Enter Repository Name");
    fireEvent.changeText(input, "my-new-repo");

    expect(mockOnChange).toHaveBeenCalledWith("repoName", "my-new-repo");
  });

  it("calls onChange when switch is toggled", () => {
    const { getByRole } = render(
      <ParamInputs params={paramsSchema} values={{ isPrivate: false }} onChange={mockOnChange} />
    );

    const switchEl = getByRole("switch");
    fireEvent(switchEl, "onValueChange", true);

    expect(mockOnChange).toHaveBeenCalledWith("isPrivate", true);
  });
});
