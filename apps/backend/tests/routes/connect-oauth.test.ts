import { describe, expect, it, mock, beforeEach } from "bun:test"
import { app } from "../../src/app"

// Mock Auth
mock.module("../../src/database/auth", () => ({
  auth: {
    api: {
      getSession: async () => ({ user: { id: "user_123" }, session: { id: "sess_1" } })
    }
  }
}))

// Mock Prisma
const mockUpsert = mock()
mock.module("../../src/database/prisma", () => ({
  prisma: { userConnection: { upsert: mockUpsert } }
}))

// Mock Service Registry with OAuth config
mock.module("../../src/services/registry", () => ({
  serviceRegistry: {
    get: (name: string) => {
      if (name === "oauth_service") {
        return {
          name: "oauth_service",
          requiresAuth: true,
          authType: "oauth2",
          oauth: {
            authorizationUrl: "https://test.com/auth",
            tokenUrl: "https://test.com/token",
            clientId: "cid",
            clientSecret: "csec",
            scopes: ["read"]
          }
        }
      }
      return undefined
    }
  }
}))

// Mock Fetch for Token Exchange
const mockFetch = mock()
global.fetch = mockFetch as any

describe("Route: Connections (OAuth2)", () => {
  beforeEach(() => {
    mockUpsert.mockReset()
    mockFetch.mockReset()
  })

  describe("GET /oauth2/:serviceName/auth-url", () => {
    it("generates a valid auth URL with encoded state", async () => {
      const res = await app.handle(new Request("http://localhost/api/connections/oauth2/oauth_service/auth-url?callbackUrl=app://cb"))

      expect(res.status).toBe(200)
      const json = await res.json()

      expect(json.authUrl).toContain("https://test.com/auth")
      expect(json.authUrl).toContain("client_id=cid")
      expect(json.authUrl).toContain("state=")

      // Verify State Decoding
      const stateParam = new URL(json.authUrl).searchParams.get("state")!
      const decoded = JSON.parse(Buffer.from(stateParam, "base64").toString("ascii"))
      expect(decoded.serviceName).toBe("oauth_service")
      expect(decoded.userId).toBe("user_123")
      expect(decoded.callbackUrl).toBe("app://cb")
    })
  })

  describe("GET /oauth2/callback", () => {
    it("exchanges code for token and upserts connection", async () => {
      // 1. Prepare valid state
      const stateObj = { userId: "user_123", serviceName: "oauth_service", callbackUrl: "app://cb" }
      const state = Buffer.from(JSON.stringify(stateObj)).toString("base64")
      const code = "auth_code_123"

      // 2. Mock Token Response
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: "new_at",
          refresh_token: "new_rt",
          expires_in: 3600,
          token_type: "Bearer",
          scope: "read"
        })
      })

      // 3. Request
      const res = await app.handle(new Request(`http://localhost/api/connections/oauth2/callback?code=${code}&state=${state}`))

      // 4. Assertions
      expect(res.status).toBe(302) // Redirects
      expect(res.headers.get("Location")).toContain("app://cb")
      expect(res.headers.get("Location")).toContain("status=success")

      expect(mockUpsert).toHaveBeenCalled()
      const upsertArgs = mockUpsert.mock.calls[0]?.[0]
      expect(upsertArgs.create.accessToken).toBe("new_at")
      expect(upsertArgs.create.refreshToken).toBe("new_rt")
      expect(upsertArgs.where.userId_serviceName).toEqual({ userId: "user_123", serviceName: "oauth_service" })
    })

    it("handles token exchange failure", async () => {
      const stateObj = { userId: "user_123", serviceName: "oauth_service" }
      const state = Buffer.from(JSON.stringify(stateObj)).toString("base64")

      mockFetch.mockResolvedValue({
        ok: false,
        text: async () => "Mocked error body"
      })

      const res = await app.handle(new Request(`http://localhost/api/connections/oauth2/callback?code=bad&state=${state}`))

      expect(res.status).toBe(302)
      expect(res.headers.get("Location")).toContain("status=error")
      expect(mockUpsert).not.toHaveBeenCalled()
    })
  })
})
