import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import CreateAreaWizard from "@/app/(tabs)/create";

// Mock Data
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

const mockConnections = [
  { id: "conn_1", serviceName: "github" },
  { id: "conn_2", serviceName: "discord" }
];

// Mock Data Context
jest.mock("@/ctx-data", () => ({
  useData: () => ({
    services: mockServices,
    connections: mockConnections,
    isLoading: false,
    refreshData: jest.fn()
  })
}));

// Mock Session Context
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
    useFocusEffect: (cb: any) => useEffect(cb, []),
    useSegments: () => []
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
    fireEvent.press(getByText("Continue"));

    // --- STEP 2: REACTION ---
    // 1. We are now on the Reaction List screen. Click "Add Reaction".
    await waitFor(() => expect(getByText("Add Reaction")).toBeTruthy());
    fireEvent.press(getByText("Add Reaction"));

    // 2. Select Service
    await waitFor(() => expect(getByText("discord")).toBeTruthy());
    fireEvent.press(getByText("discord"));

    // 3. Select Event
    await waitFor(() => expect(getByText("message")).toBeTruthy());
    fireEvent.press(getByText("message"));

    // 4. Configure Reaction
    await waitFor(() => expect(getByPlaceholderText("Enter Content")).toBeTruthy());
    fireEvent.changeText(getByPlaceholderText("Enter Content"), "Hello World");
    fireEvent.press(getByText("Continue"));

    // 5. Back on List. Click "Next Step".
    await waitFor(() => expect(getByText("Next Step")).toBeTruthy());
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
        reactions: [
          {
            serviceName: "discord",
            reactionName: "message",
            params: { content: "Hello World" },
            connectionId: "conn_2"
          }
        ]
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
