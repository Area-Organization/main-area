import { describe, expect, it, mock, beforeEach, afterEach } from "bun:test"
import { newEmailAction } from "../../src/services/gmail/actions/new-email"
import { sendEmailReaction } from "../../src/services/gmail/reactions/send-email"
import type { IContext } from "../../src/interfaces/service"

// Mock global fetch
const originalFetch = global.fetch
const mockFetch = mock()

describe("Gmail Service", () => {
  beforeEach(() => {
    global.fetch = mockFetch as any
    mockFetch.mockReset()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  describe("Action: new_email", () => {
    const context: IContext = {
      userId: "user_123",
      tokens: { accessToken: "gmail_token" },
      metadata: {}
    }
    const params = { from: "boss@work.com", subject: "Urgent", label: "INBOX" }

    it("constructs the correct query URL", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ messages: [] })
      })

      await newEmailAction.check(params, context)

      const [url] = mockFetch.mock.calls[0]!

      expect(url).toContain("gmail.googleapis.com/gmail/v1/users/me/messages")
      expect(url).toContain(encodeURIComponent("is:unread from:boss@work.com subject:Urgent label:INBOX"))
    })

    it("returns false if no messages found", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ resultSizeEstimate: 0 })
      })

      const result = await newEmailAction.check(params, context)
      expect(result).toBe(false)
    })

    it("fetches message details and returns true if new ID found", async () => {
      // Mock List Call (First fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messages: [{ id: "msg_999", threadId: "t_999" }] })
      })

      // Mock Detail Call (Second fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "msg_999",
          snippet: "This is the email content...",
          payload: {
            headers: [
              { name: "From", value: "boss@work.com" },
              { name: "Subject", value: "Urgent Task" },
              { name: "Date", value: "2023-01-01" }
            ],
            parts: []
          }
        })
      })

      const ctx: IContext = { ...context, metadata: { lastEmailId: "msg_888" } }
      const result = await newEmailAction.check(params, ctx)

      expect(result).toBe(true)
      expect(ctx.metadata?.lastEmailId).toBe("msg_999")
      expect(ctx.actionData).toMatchObject({
        messageId: "msg_999",
        from: "boss@work.com",
        subject: "Urgent Task",
        snippet: "This is the email content..."
      })

      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it("returns false if message ID matches last check", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ messages: [{ id: "msg_999" }] })
      })

      const ctx: IContext = { ...context, metadata: { lastEmailId: "msg_999" } }
      const result = await newEmailAction.check(params, ctx)

      expect(result).toBe(false)
      expect(mockFetch).toHaveBeenCalledTimes(1) // Should not fetch details
    })
  })

  describe("Reaction: send_email", () => {
    const context: IContext = {
      userId: "user_123",
      tokens: { accessToken: "gmail_token" }
    }
    const params = {
      to: "client@example.com",
      subject: "Hello",
      body: "This is a test email.",
      replyTo: "support@me.com"
    }

    it("encodes the email body correctly (Base64 URL Safe)", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: "sent_123" })
      })

      await sendEmailReaction.execute(params, context)

      expect(mockFetch).toHaveBeenCalledTimes(1)
      const [url, options] = mockFetch.mock.calls[0]!

      expect(url).toBe("https://gmail.googleapis.com/gmail/v1/users/me/messages/send")
      expect(options.method).toBe("POST")

      const body = JSON.parse(options.body)
      expect(body).toHaveProperty("raw")

      const rawBase64 = body.raw.replace(/-/g, "+").replace(/_/g, "/")
      const decoded = Buffer.from(rawBase64, "base64").toString("utf-8")

      expect(decoded).toContain("To: client@example.com")
      expect(decoded).toContain("Subject: Hello")
      expect(decoded).toContain("Reply-To: support@me.com")
      expect(decoded).toContain("This is a test email.")
    })

    it("handles API errors", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: "Forbidden",
        json: async () => ({ error: { message: "Scope not allowed" } })
      })

      expect(sendEmailReaction.execute(params, context)).rejects.toThrow("Failed to send email")
    })
  })
})
