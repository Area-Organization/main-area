import { describe, expect, it, mock, beforeEach } from "bun:test"
import { hookManager } from "../../src/hooks/manager"
import { prisma } from "../../src/database/prisma"
import { serviceRegistry } from "../../src/services/registry"

// Mock Prisma
mock.module("../../src/database/prisma", () => ({
  prisma: {
    area: {
      findMany: mock(),
      update: mock()
    },
    userConnection: {
      findUnique: mock()
    },
    areaAction: {
      update: mock()
    }
  }
}))

// Mock Service Registry
mock.module("../../src/services/registry", () => ({
  serviceRegistry: {
    get: mock()
  }
}))

const mockActionCheck = mock()
const mockReactionExecute = mock()

const createMockService = (name: string, actionName?: string, reactionName?: string) => ({
  name,
  actions: actionName ? [{ name: actionName, check: mockActionCheck }] : [],
  reactions: reactionName ? [{ name: reactionName, execute: mockReactionExecute }] : []
})

const mockArea = {
  id: "area_1",
  name: "Test Area",
  userId: "user_1",
  enabled: true,
  action: {
    id: "act_1",
    serviceName: "mockServiceA",
    actionName: "mockAction",
    connectionId: "conn_A",
    params: { someParam: "abc", metadata: { lastId: 100 } }
  },
  reactions: [
    {
      id: "react_1",
      serviceName: "mockServiceB",
      reactionName: "mockReaction",
      connectionId: "conn_B",
      params: { message: "Hello {{value}}" }
    }
  ]
}

const mockConnectionA = { id: "conn_A", accessToken: "token_A", expiresAt: new Date(Date.now() + 10000) }
const mockConnectionB = { id: "conn_B", accessToken: "token_B", expiresAt: new Date(Date.now() + 10000) }

describe("Automation Engine (HookManager)", () => {
  beforeEach(() => {
    mockActionCheck.mockReset()
    mockReactionExecute.mockReset()

    // Reset Prisma mocks
    ;(prisma.area.findMany as any).mockReset()
    ;(prisma.area.update as any).mockReset()
    ;(prisma.areaAction.update as any).mockReset()
    ;(prisma.userConnection.findUnique as any).mockReset()

    // Reset Registry mocks
    ;(serviceRegistry.get as any).mockReset()
  })

  it("checkAllAreas retrieves enabled areas and processes them", async () => {
    ;(prisma.area.findMany as any).mockResolvedValue([mockArea])
    ;(prisma.userConnection.findUnique as any).mockResolvedValueOnce(mockConnectionA).mockResolvedValueOnce(mockConnectionB)
    ;(serviceRegistry.get as any).mockImplementation((name: string) => {
      if (name === "mockServiceA") return createMockService("mockServiceA", "mockAction")
      if (name === "mockServiceB") return createMockService("mockServiceB", undefined, "mockReaction")
      return undefined
    })

    mockActionCheck.mockResolvedValue(true)

    // Run
    await hookManager.checkAllAreas()

    // Assertions
    expect(prisma.area.findMany).toHaveBeenCalledWith({
      where: { enabled: true },
      include: { action: true, reactions: true, user: true }
    })
    expect(mockActionCheck).toHaveBeenCalled()
    expect(mockReactionExecute).toHaveBeenCalled()
  })

  it("aborts if Action or Reaction service is missing", async () => {
    ;(prisma.area.findMany as any).mockResolvedValue([mockArea])
    ;(serviceRegistry.get as any).mockReturnValue(undefined)

    await hookManager.checkAllAreas()

    expect(mockActionCheck).not.toHaveBeenCalled()
    expect(mockReactionExecute).not.toHaveBeenCalled()
  })

  it("aborts if Connection is missing", async () => {
    ;(prisma.area.findMany as any).mockResolvedValue([mockArea])
    ;(serviceRegistry.get as any).mockImplementation((name: string) => {
      if (name === "mockServiceA") return createMockService("mockServiceA", "mockAction")
      if (name === "mockServiceB") return createMockService("mockServiceB", undefined, "mockReaction")
    })
    ;(prisma.userConnection.findUnique as any).mockResolvedValue(null)

    await hookManager.checkAllAreas()

    expect(mockActionCheck).not.toHaveBeenCalled()
  })

  it("updates metadata when action context changes", async () => {
    ;(prisma.area.findMany as any).mockResolvedValue([mockArea])
    ;(prisma.userConnection.findUnique as any).mockResolvedValueOnce(mockConnectionA).mockResolvedValueOnce(mockConnectionB)
    ;(serviceRegistry.get as any).mockImplementation((name: string) => {
      if (name === "mockServiceA") return createMockService("mockServiceA", "mockAction")
      if (name === "mockServiceB") return createMockService("mockServiceB", undefined, "mockReaction")
    })

    mockActionCheck.mockImplementation(async (params, context) => {
      context.metadata = { lastId: 101 }
      return false
    })

    await hookManager.checkAllAreas()

    expect(prisma.areaAction.update).toHaveBeenCalledWith({
      where: { id: mockArea.action.id },
      data: {
        params: {
          someParam: "abc",
          metadata: { lastId: 101 }
        }
      }
    })

    expect(mockReactionExecute).not.toHaveBeenCalled()
  })

  it("executes reaction with interpolated parameters when action triggers", async () => {
    ;(prisma.area.findMany as any).mockResolvedValue([mockArea])
    ;(prisma.userConnection.findUnique as any).mockResolvedValueOnce(mockConnectionA).mockResolvedValueOnce(mockConnectionB)
    ;(serviceRegistry.get as any).mockImplementation((name: string) => {
      if (name === "mockServiceA") return createMockService("mockServiceA", "mockAction")
      if (name === "mockServiceB") return createMockService("mockServiceB", undefined, "mockReaction")
    })

    mockActionCheck.mockImplementation(async (_params, context) => {
      context.actionData = { value: "World" } // Variable for interpolation
      return true
    })

    await hookManager.checkAllAreas()

    // 1. Reaction should be called
    expect(mockReactionExecute).toHaveBeenCalled()

    // 2. Parameters should be interpolated ({{value}} -> World)
    const [params, context] = mockReactionExecute.mock.calls[0]!
    expect(params).toEqual({ message: "Hello World" })

    // 3. Reaction context should have tokens
    expect(context.tokens.accessToken).toBe("token_B")

    // 4. Statistics should be updated
    expect(prisma.area.update).toHaveBeenCalledWith({
      where: { id: mockArea.id },
      data: {
        lastTriggered: expect.any(Date),
        triggerCount: { increment: 1 }
      }
    })
  })

  it("handles reaction execution errors gracefully", async () => {
    ;(prisma.area.findMany as any).mockResolvedValue([mockArea])
    ;(prisma.userConnection.findUnique as any).mockResolvedValueOnce(mockConnectionA).mockResolvedValueOnce(mockConnectionB)
    ;(serviceRegistry.get as any).mockImplementation((name: string) => {
      if (name === "mockServiceA") return createMockService("mockServiceA", "mockAction")
      if (name === "mockServiceB") return createMockService("mockServiceB", undefined, "mockReaction")
    })

    mockActionCheck.mockResolvedValue(true)
    mockReactionExecute.mockRejectedValue(new Error("API Down"))

    await hookManager.checkAllAreas()

    expect(mockReactionExecute).toHaveBeenCalled()
    expect(prisma.area.update).not.toHaveBeenCalled()
  })
})
