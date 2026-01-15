import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ServicesScreen from "@/app/(tabs)/services";

const mockServices = [
  {
    name: "openai",
    authType: "api_key",
    authFields: [{ key: "accessToken", label: "API Key", required: true, type: "password" }]
  }
];

jest.mock("@/hooks/use-services", () => ({
  useServices: () => ({
    services: mockServices,
    loading: false,
    refresh: jest.fn()
  })
}));

const mockPostConnection = jest.fn();
jest.mock("@/ctx", () => ({
  useSession: () => ({
    client: {
      api: {
        connections: {
          get: jest.fn().mockResolvedValue({ data: { connections: [] } }),
          post: (...args: any[]) => mockPostConnection(...args)
        }
      }
    }
  })
}));

const mockToastSuccess = jest.fn();
jest.mock("@/components/ui/toast", () => ({
  useToast: () => ({ success: mockToastSuccess, error: jest.fn() })
}));

describe("Screen: Services", () => {
  it("opens modal and connects service with API key", async () => {
    mockPostConnection.mockResolvedValue({ error: null });

    const { getByText, getByPlaceholderText } = render(<ServicesScreen />);

    await waitFor(() => expect(getByText("openai")).toBeTruthy());
    fireEvent.press(getByText("openai"));

    await waitFor(() => expect(getByText("Connect openai")).toBeTruthy());

    const input = getByPlaceholderText("Enter API Key");
    fireEvent.changeText(input, "sk-12345");

    fireEvent.press(getByText("Connect Service"));

    await waitFor(() => {
      expect(mockPostConnection).toHaveBeenCalledWith({
        serviceName: "openai",
        accessToken: "sk-12345",
        metadata: { accessToken: "sk-12345" }
      });
    });

    expect(mockToastSuccess).toHaveBeenCalledWith("Connected to openai");
  });
});
