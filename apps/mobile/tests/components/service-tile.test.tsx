import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { ServiceTile } from "@/components/service-tile";

jest.mock("@/components/service-icon", () => ({
  ServiceIcon: ({ serviceName }: any) => {
    const { Text } = require("react-native");
    return <Text>{serviceName}-icon</Text>;
  }
}));

describe("Component: ServiceTile", () => {
  const mockService = {
    name: "github",
    actions: [],
    reactions: [],
    authType: "oauth2" as const
  };

  it("renders correctly in disconnected state", () => {
    const { getByText } = render(
      <ServiceTile item={mockService} isConnected={false} loading={false} onPress={() => {}} />
    );

    expect(getByText("github")).toBeTruthy();
    expect(getByText("Connect")).toBeTruthy();
    expect(getByText("github-icon", { includeHiddenElements: true })).toBeTruthy();
  });

  it("renders correctly in connected state", () => {
    const { getByText } = render(
      <ServiceTile item={mockService} isConnected={true} loading={false} onPress={() => {}} />
    );

    expect(getByText("Connected")).toBeTruthy();
  });

  it("shows loading state", () => {
    const { getByText } = render(
      <ServiceTile item={mockService} isConnected={false} loading={true} onPress={() => {}} />
    );

    expect(getByText("...")).toBeTruthy();
  });

  it("handles press events", () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <ServiceTile item={mockService} isConnected={false} loading={false} onPress={onPressMock} />
    );

    fireEvent.press(getByText("github"));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
