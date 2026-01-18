import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import ServicesScreen from "@/app/(tabs)/services";
import * as WebBrowser from "expo-web-browser";
import { Alert } from "react-native";
import { useSession } from "@/ctx";

// Mocks
jest.mock("expo-web-browser", () => ({
  openAuthSessionAsync: jest.fn()
}));

jest.mock("expo-linking", () => ({
  createURL: jest.fn(() => "area://oauth-callback")
}));

// Mock Alert
jest.spyOn(Alert, "alert");

const mockServices = [
  {
    name: "openai",
    authType: "api_key",
    authFields: [{ key: "accessToken", label: "API Key", required: true, type: "password" }]
  },
  {
    name: "github",
    authType: "oauth2"
  },
  {
    name: "timer",
    authType: "none"
  }
];

const mockConnections = [
  { id: "conn_1", serviceName: "github" } // Github is already connected
];

// Mock Hooks
jest.mock("@/hooks/use-services", () => ({
  useServices: () => ({
    services: mockServices,
    loading: false,
    refresh: jest.fn()
  })
}));

jest.mock("@/ctx", () => ({
  useSession: jest.fn()
}));

const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();

jest.mock("@/components/ui/toast", () => ({
  useToast: () => ({ success: mockToastSuccess, error: mockToastError })
}));

describe("Screen: Services", () => {
  const mockPostConnection = jest.fn();
  const mockDeleteConnection = jest.fn();
  const mockGetAuthUrl = jest.fn();
  const mockGetConnections = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    const connectionsFn = jest.fn((params: any) => ({
      delete: () => mockDeleteConnection(params)
    }));
    (connectionsFn as any).get = mockGetConnections;
    (connectionsFn as any).post = mockPostConnection;
    (connectionsFn as any).oauth2 = () => ({ "auth-url": { get: mockGetAuthUrl } });

    const mockClient = {
      api: {
        connections: connectionsFn
      }
    };

    (useSession as jest.Mock).mockReturnValue({
      client: mockClient
    });

    mockGetConnections.mockResolvedValue({ data: { connections: mockConnections } });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const renderScreen = async () => {
    const result = render(<ServicesScreen />);
    await act(async () => {
      jest.runAllTimers();
    });
    return result;
  };

  it("connects service with API key (openai)", async () => {
    mockPostConnection.mockResolvedValue({ error: null });
    const { getByText, getByPlaceholderText } = await renderScreen();

    fireEvent.press(getByText("openai"));
    await waitFor(() => expect(getByText("Connect openai")).toBeTruthy());

    fireEvent.changeText(getByPlaceholderText("Enter API Key"), "sk-123");
    fireEvent.press(getByText("Connect Service"));

    await waitFor(() => {
      expect(mockPostConnection).toHaveBeenCalledWith(
        expect.objectContaining({
          serviceName: "openai",
          accessToken: "sk-123"
        })
      );
    });
  });

  it("connects service with 'none' auth type (timer)", async () => {
    mockPostConnection.mockResolvedValue({ error: null });
    const { getByText } = await renderScreen();

    fireEvent.press(getByText("timer"));

    await waitFor(() => {
      expect(mockPostConnection).toHaveBeenCalledWith({
        serviceName: "timer",
        metadata: { activated: true }
      });
      expect(mockToastSuccess).toHaveBeenCalledWith("timer enabled");
    });
  });

  it("handles OAuth2 connection flow (github)", async () => {
    // Override connections to make github disconnected for this test
    mockGetConnections.mockImplementation(async () => ({ data: { connections: [] } }));

    mockGetAuthUrl.mockResolvedValue({ data: { authUrl: "http://auth.com" }, error: null });
    (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({
      type: "success",
      url: "area://oauth-callback?status=success"
    });

    const { getByText, getAllByText } = await renderScreen();

    await waitFor(() => {
      expect(getAllByText("Connect").length).toBe(3);
    });

    fireEvent.press(getByText("github"));

    await waitFor(() => {
      expect(mockGetAuthUrl).toHaveBeenCalled();
      expect(WebBrowser.openAuthSessionAsync).toHaveBeenCalled();
      expect(mockToastSuccess).toHaveBeenCalledWith("Connected to github");
    });
  });

  it("disconnects a connected service (github)", async () => {
    mockDeleteConnection.mockResolvedValue({ error: null });

    mockGetConnections.mockResolvedValue({ data: { connections: mockConnections } });

    const { getByText } = await renderScreen();

    const githubTile = getByText("github");
    fireEvent.press(githubTile);

    expect(Alert.alert).toHaveBeenCalled();

    const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
    const disconnectBtn = alertButtons.find((b: any) => b.text === "Disconnect");

    await act(async () => {
      await disconnectBtn.onPress();
    });

    expect(mockDeleteConnection).toHaveBeenCalledWith({ id: "conn_1" });
    expect(mockToastSuccess).toHaveBeenCalledWith("github disconnected");
  });
});
