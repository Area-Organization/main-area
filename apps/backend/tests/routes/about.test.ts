import { describe, expect, it } from "bun:test"
import { app } from "../../src/app"

describe("About Route", () => {
  it("returns correct structure and status 200", async () => {
    const response = await app.handle(new Request("http://localhost:8080/about.json"))

    expect(response.status).toBe(200)

    const json = await response.json()
    expect(json).toHaveProperty("client")
    expect(json).toHaveProperty("server")
    expect(json.server).toHaveProperty("current_time")
    expect(json.server).toHaveProperty("services")
    expect(Array.isArray(json.server.services)).toBe(true)
  })
})
