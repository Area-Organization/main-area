import { getServiceInitial, BRAND_COLORS, useServiceColor } from "@/lib/service-utils";
import { renderHook } from "@testing-library/react-native";

jest.mock("@/hooks/use-theme-color", () => ({
  useThemeColor: () => "#DEFAULT_PRIMARY"
}));

describe("Lib: Service Utils", () => {
  describe("getServiceInitial", () => {
    it("returns uppercase first letter", () => {
      expect(getServiceInitial("github")).toBe("G");
      expect(getServiceInitial("discord")).toBe("D");
    });

    it("returns ? for empty values", () => {
      expect(getServiceInitial("")).toBe("?");
      expect(getServiceInitial(undefined)).toBe("?");
    });
  });

  describe("useServiceColor", () => {
    it("returns brand color for known service", () => {
      const { result } = renderHook(() => useServiceColor("discord"));
      expect(result.current).toBe(BRAND_COLORS.discord);
    });

    it("returns primary theme color for unknown service", () => {
      const { result } = renderHook(() => useServiceColor("unknown-service"));
      expect(result.current).toBe("#DEFAULT_PRIMARY");
    });

    it("is case insensitive", () => {
      const { result } = renderHook(() => useServiceColor("GiThUb"));
      expect(result.current).toBe(BRAND_COLORS.github);
    });
  });
});
