import { renderHook } from "@testing-library/react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useColorScheme as useRNColorScheme } from "react-native";

// Mock React Native's hook
jest.mock("react-native", () => ({
  useColorScheme: jest.fn()
}));

describe("Hook: useColorScheme", () => {
  it("returns light by default or when specified", () => {
    (useRNColorScheme as jest.Mock).mockReturnValue("light");
    const { result } = renderHook(() => useColorScheme());
    expect(result.current).toBe("light");
  });

  it("returns dark when system is dark", () => {
    (useRNColorScheme as jest.Mock).mockReturnValue("dark");
    const { result } = renderHook(() => useColorScheme());
    expect(result.current).toBe("dark");
  });
});
