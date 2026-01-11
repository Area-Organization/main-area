import { describe, expect, it, mock } from "bun:test"
import { app } from "../../src/app"

// Mock Service Registry with complete Schema compliance
mock.module("../../src/services/registry", () => ({
  serviceRegistry: {
    getAll: () => [
      {
        name: "test_service",
        description: "A mock service for testing",
        requiresAuth: false,
        actions: [
          {
            name: "test_action",
            description: "A test action"
          }
        ],
        reactions: [
          {
            name: "test_reaction",
            description: "A test reaction"
          }
        ]
      }
    ]
  }
}))

describe("Route: GET /about.json", () => {
  it("returns the correct structure with client IP and server time", async () => {
    const response = await app.handle(
      new Request("http://localhost/about.json", {
        headers: { "x-forwarded-for": "127.0.0.1" }
      })
    )

    expect(response.status).toBe(200)

    const json = await response.json()

    // Check Client
    expect(json.client.host).toBe("127.0.0.1")

    // Check Server
    expect(json.server.current_time).toBeTypeOf("number")

    // Check Services (Dynamic population)
    expect(json.server.services).toHaveLength(1)
    expect(json.server.services[0].name).toBe("test_service")
    expect(json.server.services[0].description).toBe("A mock service for testing")
  })
})
