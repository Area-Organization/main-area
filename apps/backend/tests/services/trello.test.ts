import { describe, expect, it, mock, beforeEach, afterEach } from "bun:test"
import { newCardAction } from "../../src/services/trello/actions/new-card"
import { createCardReaction } from "../../src/services/trello/reactions/create-card"
import type { IContext } from "../../src/interfaces/service"

const originalFetch = global.fetch
const mockFetch = mock()
const originalEnv = process.env

describe("Trello Service", () => {
  beforeEach(() => {
    global.fetch = mockFetch as any
    mockFetch.mockReset()
    process.env.TRELLO_API_KEY = "mock_api_key"
  })
  afterEach(() => {
    global.fetch = originalFetch
    process.env = originalEnv
  })

  describe("Action: new_card", () => {
    const context: IContext = {
      userId: "u1",
      tokens: { accessToken: "user_token" },
      metadata: { lastCardId: "c1" }
    }

    it("fetches list and board details on trigger", async () => {
      // 1. Get Cards
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: "c2", name: "New Card", desc: "Desc", shortUrl: "url" }]
      })
      // 2. Get List
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ name: "Todo List", idBoard: "b1" })
      })
      // 3. Get Board
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ name: "My Board" })
      })

      const result = await newCardAction.check({ listId: "l1" }, context)

      expect(result).toBe(true)
      expect(context.actionData?.listName).toBe("Todo List")
      expect(context.actionData?.boardName).toBe("My Board")
    })
  })

  describe("Reaction: create_card", () => {
    it("passes parameters as query string", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ shortUrl: "url" })
      })

      const context: IContext = { userId: "u1", tokens: { accessToken: "user_token" } }
      await createCardReaction.execute({ listId: "l1", name: "Card", desc: "Desc" }, context)

      const [url] = mockFetch.mock.calls[0]
      expect(url).toContain("idList=l1")
      expect(url).toContain("name=Card")
      expect(url).toContain("key=mock_api_key")
      expect(url).toContain("token=user_token")
    })
  })
})
