import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useAreaWizard } from "@/hooks/use-area-wizard";
import { useData } from "@/ctx-data";
import { useSession } from "@/ctx";

// --- Mocks ---

const mockNavigate = jest.fn();
const mockBack = jest.fn();

jest.mock("expo-router", () => {
  const React = require("react");
  return {
    useRouter: () => ({ navigate: mockNavigate, back: mockBack }),
    useFocusEffect: (cb: any) => React.useEffect(cb, [])
  };
});

const mockToastError = jest.fn();
const mockToastSuccess = jest.fn();

jest.mock("@/components/ui/toast", () => ({
  useToast: () => ({ error: mockToastError, success: mockToastSuccess })
}));

const mockServices = [
  {
    name: "github",
    actions: [
      {
        name: "push",
        params: { branch: { required: true, type: "string" } }
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
        params: { content: { required: true, type: "string" } }
      }
    ]
  }
];

jest.mock("@/ctx-data", () => ({
  useData: jest.fn()
}));

jest.mock("@/ctx", () => ({
  useSession: jest.fn()
}));

jest.mock("@/lib/haptics", () => ({
  feedback: { selection: jest.fn(), impact: jest.fn(), notification: jest.fn() }
}));

// --- Tests ---

describe("Hook: useAreaWizard", () => {
  const mockUseData = useData as jest.Mock;
  const mockUseSession = useSession as jest.Mock;

  // define API mocks
  const mockPostArea = jest.fn();
  const mockGetArea = jest.fn();
  const mockPatchArea = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup stable client object
    const mockClient = {
      api: {
        areas: Object.assign(
          (params: any) => ({
            get: mockGetArea,
            patch: mockPatchArea
          }),
          { post: mockPostArea }
        )
      }
    };

    mockUseSession.mockReturnValue({
      client: mockClient
    });

    // Default Data: Github connected, Discord NOT connected
    mockUseData.mockReturnValue({
      services: mockServices,
      connections: [{ id: "conn_1", serviceName: "github" }],
      refreshData: jest.fn(),
      isLoading: false
    });
  });

  it("initializes at Step 1", () => {
    const { result } = renderHook(() => useAreaWizard());
    expect(result.current.wizardStep).toBe(1);
    expect(result.current.subStep).toBe("SERVICE");
  });

  it("advances step when a connected action service is selected", async () => {
    const { result } = renderHook(() => useAreaWizard());
    const githubService = mockServices[0];

    await act(async () => {
      result.current.handleServiceSelect(githubService, "action");
    });

    expect(result.current.actionService).toBe(githubService);
    expect(result.current.subStep).toBe("EVENT");
  });

  it("blocks selection if service is not connected", async () => {
    const { result } = renderHook(() => useAreaWizard());
    // Discord is not in connections by default
    const discordService = mockServices[1];

    await act(async () => {
      result.current.handleServiceSelect(discordService, "action");
    });

    expect(mockToastError).toHaveBeenCalledWith(expect.stringContaining("Please connect discord"));
    expect(result.current.actionService?.name).toBeUndefined();
  });

  it("validates parameters before adding a reaction", async () => {
    // Override mock for this test to make Discord connected
    mockUseData.mockReturnValue({
      services: mockServices,
      connections: [
        { id: "conn_1", serviceName: "github" },
        { id: "conn_2", serviceName: "discord" }
      ],
      refreshData: jest.fn(),
      isLoading: false
    });

    const { result } = renderHook(() => useAreaWizard());

    const discordService = mockServices[1];
    const messageReaction = discordService.reactions[0];

    // 1. Select Service
    await act(async () => {
      result.current.handleServiceSelect(discordService, "reaction");
    });

    // 2. Select Event
    await act(async () => {
      result.current.handleEventSelect(messageReaction, "reaction");
    });

    // 3. Ensure we are in config step
    expect(result.current.subStep).toBe("CONFIG");

    // 4. Try adding reaction with empty params
    await act(async () => {
      result.current.handleAddReaction();
    });

    expect(mockToastError).toHaveBeenCalledWith(expect.stringContaining("is required"));
    expect(result.current.configuredReactions).toHaveLength(0);

    // 5. Provide valid params
    await act(async () => {
      result.current.setTempReactionParams({ content: "Hello" });
    });

    // 6. Add reaction
    await act(async () => {
      result.current.handleAddReaction();
    });

    expect(result.current.configuredReactions).toHaveLength(1);
  });

  it("initializes in edit mode and populates data", async () => {
    // 1. Mock GET area response
    const mockArea = {
      id: "123",
      name: "Existing Area",
      description: "Desc",
      action: {
        serviceName: "github",
        actionName: "push",
        params: { branch: "main" }
      },
      reactions: [
        {
          id: "r1",
          serviceName: "discord",
          reactionName: "message",
          params: { content: "hi" }
        }
      ]
    };

    mockGetArea.mockResolvedValue({ data: { area: mockArea }, error: null });

    mockUseData.mockReturnValue({
      services: mockServices,
      connections: [
        { id: "conn_1", serviceName: "github" },
        { id: "conn_2", serviceName: "discord" }
      ],
      refreshData: jest.fn(),
      isLoading: false
    });

    const { result } = renderHook(() => useAreaWizard("123"));

    expect(result.current.isFetchingInitialData).toBe(true);

    await waitFor(() => {
      expect(result.current.isFetchingInitialData).toBe(false);
    });

    expect(result.current.areaName).toBe("Existing Area");
    expect(result.current.actionService?.name).toBe("github");
    expect(result.current.configuredReactions).toHaveLength(1);
    expect(result.current.configuredReactions[0].service.name).toBe("discord");

    expect(result.current.wizardStep).toBe(3);
  });
});
