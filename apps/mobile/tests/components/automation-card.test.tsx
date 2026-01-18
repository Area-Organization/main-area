import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { AutomationCard } from "@/components/automation-card";

jest.mock("@/components/service-icon", () => ({
  ServiceIcon: ({ serviceName }: any) => {
    const { Text } = require("react-native");
    return <Text>{serviceName}</Text>;
  }
}));

jest.mock("@/lib/haptics", () => ({
  feedback: { selection: jest.fn(), impact: jest.fn() }
}));

const mockArea = {
  id: "1",
  name: "Sync Tasks",
  description: "Syncs Trello to Slack",
  enabled: true,
  action: {
    serviceName: "trello",
    actionName: "card_created",
    params: {}
  },
  reactions: [
    {
      serviceName: "slack",
      reactionName: "send_message",
      params: {}
    }
  ]
};

describe("Component: AutomationCard", () => {
  const mockOnDelete = jest.fn();
  const mockOnToggle = jest.fn();
  const mockOnEdit = jest.fn();

  it("renders area details correctly", () => {
    const { getByText, getAllByText } = render(
      <AutomationCard
        item={mockArea}
        index={0}
        onDelete={mockOnDelete}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        primaryColor="#000"
      />
    );

    expect(getByText("Sync Tasks")).toBeTruthy();
    expect(getByText("Syncs Trello to Slack")).toBeTruthy();
    expect(getAllByText("trello")).toBeTruthy();
    expect(getAllByText("slack")).toBeTruthy();
    expect(getByText("card_created")).toBeTruthy();
    expect(getByText("send_message")).toBeTruthy();
  });

  it("handles toggle switch", () => {
    const { getByRole } = render(
      <AutomationCard
        item={mockArea}
        index={0}
        onDelete={mockOnDelete}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        primaryColor="#000"
      />
    );

    const switchEl = getByRole("switch");
    expect(switchEl).toBeTruthy();

    fireEvent.press(switchEl);
    expect(mockOnToggle).toHaveBeenCalledWith("1", true);
  });
});
