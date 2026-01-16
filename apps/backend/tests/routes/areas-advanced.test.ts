import { describe, expect, it, mock, beforeEach } from "bun:test"
import { app } from "../../src/app"

// Mock Auth
mock.module("../../src/database/auth", () => ({
  auth: {
    api: {
      getSession: async () => ({
        user: { id: "user_123" },
        session: { id: "sess_123" }
      })
    }
  }
}))

// Mock Prisma
const mockFindFirst = mock()
const mockUpdate = mock()
const mockDelete = mock()
const mockAggregate = mock()
const mockCount = mock()
const mockFindMany = mock()

mock.module("../../src/database/prisma", () => ({
  prisma: {
    area: {
      findFirst: mockFindFirst,
      update: mockUpdate,
      delete: mockDelete,
      count: mockCount,
      findMany: mockFindMany,
      aggregate: mockAggregate
    }
  }
}))

// Mock Registry (needed for Update validation)
mock.module("../../src/services/registry", () => ({
  serviceRegistry: {
    get: (name: string) =>
      name === "valid_service"
        ? {
            name: "valid_service",
            actions: [{ name: "valid_action" }],
            reactions: [{ name: "valid_reaction" }]
          }
        : undefined
  }
}))

describe("Route: Areas (Advanced Operations)", () => {
  beforeEach(() => {
    mockFindFirst.mockReset()
    mockUpdate.mockReset()
    mockDelete.mockReset()
    mockAggregate.mockReset()
  })

  const mockArea = {
    id: "area_1",
    userId: "user_123",
    name: "Test Area",
    description: "Test description",
    enabled: true,
    triggerCount: 5,
    lastTriggered: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    action: {
      id: "act_1",
      serviceName: "valid_service",
      actionName: "valid_action",
      params: {},
      connectionId: "conn_1",
      posX: 100,
      posY: 200
    },
    reactions: []
  }

  describe("GET /api/areas/:id", () => {
    it("returns 404 if area not found", async () => {
      mockFindFirst.mockResolvedValue(null)
      const res = await app.handle(new Request("http://localhost/api/areas/area_999"))
      expect(res.status).toBe(404)
    })

    it("returns area details if found", async () => {
      mockFindFirst.mockResolvedValue(mockArea)
      const res = await app.handle(new Request("http://localhost/api/areas/area_1"))
      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.area.id).toBe("area_1")
    })
  })

  describe("POST /api/areas/:id/toggle", () => {
    it("toggles enabled state", async () => {
      mockFindFirst.mockResolvedValue(mockArea)
      mockUpdate.mockResolvedValue({ ...mockArea, enabled: false })

      const res = await app.handle(new Request("http://localhost/api/areas/area_1/toggle", { method: "POST" }))

      expect(res.status).toBe(200)
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: "area_1" },
        data: { enabled: false }
      })
      const json = await res.json()
      expect(json.enabled).toBe(false)
    })
  })

  describe("DELETE /api/areas/:id", () => {
    it("deletes the area", async () => {
      mockFindFirst.mockResolvedValue(mockArea)
      mockDelete.mockResolvedValue(mockArea)

      const res = await app.handle(new Request("http://localhost/api/areas/area_1", { method: "DELETE" }))

      expect(res.status).toBe(200)
      expect(mockDelete).toHaveBeenCalledWith({ where: { id: "area_1" } })
    })
  })

  describe("GET /api/areas/stats/overview", () => {
    it("aggregates statistics correctly", async () => {
      mockCount
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(5) // active
        .mockResolvedValueOnce(5) // inactive

      mockFindMany.mockResolvedValue([mockArea]) // recent
      mockAggregate.mockResolvedValue({ _sum: { triggerCount: 100 } })

      const res = await app.handle(new Request("http://localhost/api/areas/stats/overview"))

      expect(res.status).toBe(200)
      const json = await res.json()

      expect(json.totalAreas).toBe(10)
      expect(json.activeAreas).toBe(5)
      expect(json.totalTriggers).toBe(100)
      expect(json.recentlyTriggered).toHaveLength(1)
    })
  })
})
