import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import CreateAreaWizard from "@/app/(tabs)/create";

// Mock Services Hook
const mockServices = [
  {
    name: "github",
    actions: [
      {
        name: "push",
        description: "On Push",
        params: { branch: { type: "string", required: true, label: "Branch" } }
      }
    ],
    reactions: []
  },
  {
    name: "discord",
    actions: [],
    reactions: [
      {
        name: "message",
        description: "Send Msg",
        params: { content: { type: "string", required: true, label: "Content" } }
      }
    ]
  }
];

// Mock Connections
const mockConnections = [
  { id: "conn_1", serviceName: "github" },
  { id: "conn_2", serviceName: "discord" }
];

jest.mock("@/hooks/use-services", () => ({
  useServices: () => ({
    services: mockServices,
    loading: false,
    refresh: jest.fn()
  })
}));

// Mock API Client
const mockPostArea = jest.fn();
jest.mock("@/ctx", () => ({
  useSession: () => ({
    client: {
      api: {
        connections: {
          get: jest.fn().mockResolvedValue({ data: { connections: mockConnections } })
        },
        areas: {
          post: (...args: any[]) => mockPostArea(...args)
        }
      }
    }
  })
}));

const mockNavigate = jest.fn();

jest.mock("expo-router", () => {
  const { useEffect } = require("react");
  return {
    useRouter: () => ({ navigate: mockNavigate }),
    useFocusEffect: (cb: any) => useEffect(cb, [])
  };
});

jest.mock("@/components/ui/toast", () => ({
  useToast: () => ({ success: jest.fn(), error: jest.fn() })
}));

describe("Screen: Create Area Wizard", () => {
  it("completes the full wizard flow and submits data", async () => {
    mockPostArea.mockResolvedValue({ error: null });

    const { getByText, getByPlaceholderText } = render(<CreateAreaWizard />);

    await waitFor(() => expect(getByText("Step 1: The Trigger")).toBeTruthy());

    // --- STEP 1: ACTION ---
    await waitFor(() => expect(getByText("github")).toBeTruthy());
    fireEvent.press(getByText("github"));

    await waitFor(() => expect(getByText("push")).toBeTruthy());
    fireEvent.press(getByText("push"));

    await waitFor(() => expect(getByPlaceholderText("Enter Branch")).toBeTruthy());
    fireEvent.changeText(getByPlaceholderText("Enter Branch"), "main");
    fireEvent.press(getByText("Next Step"));

    // --- STEP 2: REACTION ---
    await waitFor(() => expect(getByText("discord")).toBeTruthy());
    fireEvent.press(getByText("discord"));

    await waitFor(() => expect(getByText("message")).toBeTruthy());
    fireEvent.press(getByText("message"));

    await waitFor(() => expect(getByPlaceholderText("Enter Content")).toBeTruthy());
    fireEvent.changeText(getByPlaceholderText("Enter Content"), "Hello World");
    fireEvent.press(getByText("Next Step"));

    // --- STEP 3: REVIEW & CONNECT ---
    await waitFor(() => expect(getByText("Finalize Connection")).toBeTruthy());

    fireEvent.changeText(getByPlaceholderText("e.g. Sync Tweets to Discord"), "My Cool Area");

    fireEvent.press(getByText("Create AREA"));

    await waitFor(() => {
      expect(mockPostArea).toHaveBeenCalledWith({
        name: "My Cool Area",
        description: undefined,
        action: {
          serviceName: "github",
          actionName: "push",
          params: { branch: "main" },
          connectionId: "conn_1"
        },
        reaction: {
          serviceName: "discord",
          reactionName: "message",
          params: { content: "Hello World" },
          connectionId: "conn_2"
        }
      });
    });

    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith("/(tabs)");
      },
      { timeout: 3000 }
    );
  });
});
