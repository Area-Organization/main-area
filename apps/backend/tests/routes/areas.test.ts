import { describe, expect, it, mock, beforeEach } from "bun:test"
import { app } from "../../src/app"

// 1. Mock Auth (authenticated for these tests)
mock.module("../../src/database/auth", () => ({
  auth: {
    api: {
      getSession: async () => ({
        user: { id: "user_123", email: "test@test.com" },
        session: { id: "sess_123" }
      })
    }
  }
}))

// 2. Mock Prisma
const mockCreate = mock()
const mockFindUnique = mock()
const mockFindMany = mock()
const mockCount = mock()

mock.module("../../src/database/prisma", () => ({
  prisma: {
    area: {
      create: mockCreate,
      findMany: mockFindMany,
      count: mockCount
    },
    userConnection: {
      findUnique: mockFindUnique
    }
  }
}))

// 3. Mock Service Registry & Action Setup
const mockActionSetup = mock()
mock.module("../../src/services/registry", () => ({
  serviceRegistry: {
    get: (name: string) => {
      if (name === "valid_service") {
        return {
          name: "valid_service",
          description: "Valid Service Desc",
          requiresAuth: true,
          actions: [{ name: "valid_action", description: "Valid Action", setup: mockActionSetup }],
          reactions: [{ name: "valid_reaction", description: "Valid Reaction" }]
        }
      }
      return undefined
    }
  }
}))

describe("Route: Areas Controller", () => {
  beforeEach(() => {
    mockCreate.mockReset()
    mockFindUnique.mockReset()
    mockActionSetup.mockReset()
  })

  const validPayload = {
    name: "New Area",
    action: {
      serviceName: "valid_service",
      actionName: "valid_action",
      params: { repo: "test" },
      connectionId: "conn_1"
    },
    reaction: {
      serviceName: "valid_service",
      reactionName: "valid_reaction",
      params: { msg: "hi" },
      connectionId: "conn_2"
    }
  }

  describe("POST /api/areas (Create)", () => {
    it("returns 400 if service or action/reaction is invalid", async () => {
      const payload = {
        ...validPayload,
        action: { ...validPayload.action, serviceName: "invalid_service" }
      }

      const response = await app.handle(
        new Request("http://localhost/api/areas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
      )

      expect(response.status).toBe(400)
      const json = await response.json()
      expect(json.message).toContain("Service 'invalid_service' not found")
    })

    it("returns 404 if connection does not exist", async () => {
      mockFindUnique.mockResolvedValue(null)

      const response = await app.handle(
        new Request("http://localhost/api/areas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validPayload)
        })
      )

      expect(response.status).toBe(404)
      const json = await response.json()
      expect(json.message).toBe("Action connection not found")
    })

    it("successfully creates area and calls action.setup()", async () => {
      mockFindUnique.mockResolvedValueOnce({ id: "conn_1", accessToken: "token_a" }).mockResolvedValueOnce({ id: "conn_2" })

      mockCreate.mockResolvedValue({
        id: "area_new",
        name: "New Area",
        enabled: true,
        triggerCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        action: { ...validPayload.action, id: "act_1" },
        reaction: { ...validPayload.reaction, id: "react_1" }
      })

      const response = await app.handle(
        new Request("http://localhost/api/areas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validPayload)
        })
      )

      expect(response.status).toBe(201)

      expect(mockActionSetup).toHaveBeenCalled()
      const call = mockActionSetup.mock.calls[0]
      expect(call).toBeDefined()
      const [params, context] = call as [any, any]
      expect(params).toEqual({ repo: "test" })
      expect(context.tokens.accessToken).toBe("token_a")

      expect(mockCreate).toHaveBeenCalled()
    })
  })

  describe("GET /api/areas (List)", () => {
    it("returns a list of areas", async () => {
      mockFindMany.mockResolvedValue([])
      mockCount.mockResolvedValue(0)

      const response = await app.handle(
        new Request("http://localhost/api/areas?limit=10", {
          method: "GET"
        })
      )

      expect(response.status).toBe(200)
      const json = await response.json()
      expect(json.areas).toEqual([])
      expect(json.total).toBe(0)
    })
  })
})
