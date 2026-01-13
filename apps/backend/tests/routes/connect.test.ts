import { describe, expect, it, mock, beforeEach } from "bun:test"
import { app } from "../../src/app"

// 1. Mock Auth
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

// 2. Mock Prisma
const mockFindUnique = mock()
const mockFindFirst = mock()
const mockCount = mock()
const mockDelete = mock()

mock.module("../../src/database/prisma", () => ({
  prisma: {
    userConnection: {
      findFirst: mockFindFirst,
      delete: mockDelete
    },
    area: {
      count: mockCount
    }
  }
}))

// 3. Mock Registry
mock.module("../../src/services/registry", () => ({
  serviceRegistry: { get: () => ({}) }
}))

describe("Route: Connections Controller", () => {
  beforeEach(() => {
    mockFindFirst.mockReset()
    mockCount.mockReset()
    mockDelete.mockReset()
  })

  describe("DELETE /api/connections/:id", () => {
    it("returns 404 if connection does not exist", async () => {
      mockFindFirst.mockResolvedValue(null)

      const response = await app.handle(
        new Request("http://localhost/api/connections/missing_id", {
          method: "DELETE"
        })
      )

      expect(response.status).toBe(404)
    })

    it("returns 409 Conflict if connection is used by an AREA", async () => {
      mockFindFirst.mockResolvedValue({ id: "conn_1", userId: "user_123" })

      mockCount.mockResolvedValue(2)

      const response = await app.handle(
        new Request("http://localhost/api/connections/conn_1", {
          method: "DELETE"
        })
      )

      expect(response.status).toBe(409)
      const json = await response.json()
      expect(json.message).toContain("used by 2 AREA(s)")

      expect(mockDelete).not.toHaveBeenCalled()
    })

    it("deletes connection if not in use", async () => {
      // 1. Connection exists
      mockFindFirst.mockResolvedValue({ id: "conn_1", userId: "user_123" })

      // 2. Area usage count == 0
      mockCount.mockResolvedValue(0)

      const response = await app.handle(
        new Request("http://localhost/api/connections/conn_1", {
          method: "DELETE"
        })
      )

      expect(response.status).toBe(200)
      expect(mockDelete).toHaveBeenCalledWith({ where: { id: "conn_1" } })
    })
  })
})
