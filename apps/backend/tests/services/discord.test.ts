import { describe, expect, it, mock, beforeEach, afterEach } from "bun:test"
import { onMessageAction } from "../../src/services/discord/actions/on-message"
import { sendMessageReaction } from "../../src/services/discord/reactions/send-message"
import type { IContext } from "../../src/interfaces/service"

const originalFetch = global.fetch
const mockFetch = mock()

describe("Discord Service", () => {
  beforeEach(() => {
    global.fetch = mockFetch as any
    mockFetch.mockReset()
  })
  afterEach(() => {
    global.fetch = originalFetch
  })

  describe("Action: on_message", () => {
    const context: IContext = {
      userId: "u1",
      tokens: { accessToken: "bot_token" },
      metadata: {}
    }
    const params = { channelId: "123456" }

    it("returns false if no messages are returned", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => []
      })
      const result = await onMessageAction.check(params, context)
      expect(result).toBe(false)
    })

    it("updates metadata and returns true on new message", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [
          {
            id: "msg_2",
            content: "Hello",
            author: { username: "User" }
          }
        ]
      })

      const ctx = { ...context, metadata: { lastMessageId: "msg_1" } }
      const result = await onMessageAction.check(params, ctx)

      expect(result).toBe(true)
      expect(ctx.metadata?.lastMessageId).toBe("msg_2")
      expect(ctx.actionData).toMatchObject({
        author: "User",
        content: "Hello"
      })
    })

    it("verifies channel access during setup", async () => {
      mockFetch.mockResolvedValue({ ok: true })
      await expect(onMessageAction.setup!(params, context)).resolves.toBeUndefined()
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("channels/123456"),
        expect.objectContaining({ headers: { Authorization: "Bot bot_token" } })
      )
    })
  })

  describe("Reaction: send_message", () => {
    it("sends a POST request to the correct channel", async () => {
      mockFetch.mockResolvedValue({ ok: true })

      const context: IContext = { userId: "u1", tokens: { accessToken: "bot_token" } }
      const params = { channelId: "123", content: "Hello World" }

      await sendMessageReaction.execute(params, context)

      const [url, options] = mockFetch.mock.calls[0]
      expect(url).toBe("https://discord.com/api/v10/channels/123/messages")
      expect(options.method).toBe("POST")
      expect(JSON.parse(options.body)).toEqual({ content: "Hello World" })
    })
  })
})
