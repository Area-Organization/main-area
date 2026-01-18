import { waitFor, renderHook } from "@testing-library/react-native";
import { useServices, resetServiceCache } from "@/hooks/use-services";

// Mock the Session Context
const mockClient = {
  "about.json": {
    get: jest.fn()
  }
};

jest.mock("@/ctx", () => ({
  useSession: () => ({
    client: mockClient
  })
}));

describe("Hook: useServices", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetServiceCache(); // Reset global cache to ensure tests are isolated
  });

  it("initializes with default states", async () => {
    mockClient["about.json"].get.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useServices());

    expect(result.current.services).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("populates services on successful fetch", async () => {
    const mockData = {
      server: {
        services: [{ name: "github", actions: [], reactions: [] }]
      }
    };

    mockClient["about.json"].get.mockResolvedValue({ data: mockData, error: null });

    const { result } = renderHook(() => useServices());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.services).toHaveLength(1);
    expect(result.current.services[0].name).toBe("github");
  });

  it("handles API errors gracefully", async () => {
    mockClient["about.json"].get.mockResolvedValue({
      data: null,
      error: { status: 500 }
    });

    const { result } = renderHook(() => useServices());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.services).toEqual([]);
    expect(result.current.error).toContain("Error: 500");
  });
});
