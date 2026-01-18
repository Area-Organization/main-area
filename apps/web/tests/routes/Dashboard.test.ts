import { render, screen } from "@testing-library/svelte";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Page from "../../src/routes/+page.svelte";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

const IntersectionObserverMock = class IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];

  constructor() {}

  disconnect = vi.fn();
  observe = vi.fn();
  takeRecords = vi.fn(() => []);
  unobserve = vi.fn();
};

vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal("ResizeObserver", ResizeObserverMock);

describe("Dashboard Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders dashboard stats and recent triggers", async () => {
    const mockPageData = {
      stats: {
        totalAreas: 10,
        activeAreas: 5,
        inactiveAreas: 5,
        totalTriggers: 100,
        recentlyTriggered: [
          {
            name: "GitHub -> Discord",
            triggeredAt: new Date("2024-01-01T12:00:00").toISOString()
          }
        ]
      }
    };

    render(Page, { data: mockPageData });

    expect(screen.getByText("Total Areas")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();

    expect(screen.getByText("Active Areas")).toBeInTheDocument();
    expect(screen.getAllByText("5").length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText("Inactive Areas")).toBeInTheDocument();
    expect(screen.getAllByText("5").length).toBeGreaterThanOrEqual(2);

    expect(screen.getByText("Total Triggers")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();

    expect(screen.getByText("Last Triggers")).toBeInTheDocument();
    expect(screen.getByText("GitHub -> Discord")).toBeInTheDocument();

    expect(screen.getByText("Manage Areas")).toBeInTheDocument();
  });

  it("renders empty state when no recent triggers exist", async () => {
    const mockEmptyData = {
      stats: {
        totalAreas: 0,
        activeAreas: 0,
        inactiveAreas: 0,
        totalTriggers: 0,
        recentlyTriggered: []
      }
    };

    render(Page, { data: mockEmptyData });

    expect(screen.getByText("No Area Triggered Yet")).toBeInTheDocument();

    const createLink = screen.getByRole("link", { name: /Create a New Area/i });
    expect(createLink).toHaveAttribute("href", "/areas/create");
  });

  it("renders error state when stats are missing", async () => {
    render(Page, { data: {} as any });

    expect(screen.getByText(/No Area Triggered Yet|No AREAs Created Yet/i)).toBeInTheDocument();
  });

  it("renders error state when recentlyTriggered is undefined", async () => {
    render(Page, {
      data: {
        stats: {
          totalAreas: 0,
          activeAreas: 0,
          inactiveAreas: 0,
          totalTriggers: 0,
          recentlyTriggered: undefined
        }
      }
    });

    expect(screen.getByText("No Area Triggered Yet")).toBeInTheDocument();
  });
});
