import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import HomeScreen from "@/app/(tabs)/index";

// Mock API Client functions
const mockGetAreas = jest.fn();
const mockGetStats = jest.fn();
const mockDeleteArea = jest.fn();
const mockToggleArea = jest.fn();

const mockAreas = jest.fn((params: any) => ({
  delete: () => mockDeleteArea(params),
  toggle: { post: () => mockToggleArea(params) }
}));

(mockAreas as any).get = mockGetAreas;
(mockAreas as any).stats = { overview: { get: mockGetStats } };

jest.mock("@/ctx", () => ({
  useSession: () => ({
    client: {
      api: {
        areas: mockAreas
      }
    },
    user: { name: "Test User" },
    signOut: jest.fn()
  })
}));

const mockPush = jest.fn();
jest.mock("expo-router", () => {
  const { useEffect } = require("react");
  return {
    useRouter: () => ({ push: mockPush }),
    useFocusEffect: (cb: any) => useEffect(cb, []),
    useSegments: () => []
  };
});

jest.mock("@/components/ui/toast", () => ({
  useToast: () => ({ success: jest.fn(), error: jest.fn() })
}));

const mockAreasData = {
  areas: [
    {
      id: "area_1",
      name: "Github to Discord",
      enabled: true,
      action: { serviceName: "github", actionName: "push" },
      reactions: [{ serviceName: "discord", reactionName: "message" }]
    }
  ]
};

const mockStatsData = {
  activeAreas: 1,
  totalTriggers: 5,
  totalAreas: 1
};

describe("Screen: Home (Dashboard)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAreas.mockResolvedValue({ data: mockAreasData });
    mockGetStats.mockResolvedValue({ data: mockStatsData });
  });

  it("renders user name and fetches data on mount", async () => {
    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText("Welcome back,")).toBeTruthy();
      expect(getByText("Test User")).toBeTruthy();
    });

    expect(mockGetAreas).toHaveBeenCalled();
    expect(mockGetStats).toHaveBeenCalled();
  });

  it("displays stats cards when data is available", async () => {
    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText("5")).toBeTruthy();
      expect(getByText("Triggers")).toBeTruthy();
    });
  });

  it("renders automation cards", async () => {
    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText("Github to Discord")).toBeTruthy();
      expect(getByText("push")).toBeTruthy();
      expect(getByText("message")).toBeTruthy();
    });
  });

  it("handles empty state", async () => {
    mockGetAreas.mockResolvedValueOnce({ data: { areas: [] } });

    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText("No AREAs Created Yet")).toBeTruthy();
      expect(getByText("Create your first AREA")).toBeTruthy();
    });
  });

  it("toggles area switch", async () => {
    mockToggleArea.mockResolvedValue({ error: null });

    const { getAllByRole } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getAllByRole("switch", { includeHiddenElements: true }).length).toBeGreaterThan(0);
    });

    const switchEl = getAllByRole("switch", { includeHiddenElements: true })[0];
    fireEvent.press(switchEl);

    await waitFor(() => {
      expect(mockToggleArea).toHaveBeenCalled();
    });
  });
});
