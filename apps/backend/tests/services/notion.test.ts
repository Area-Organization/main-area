import { describe, expect, it, mock, beforeEach, afterEach } from "bun:test"
import { newPageInDbAction } from "../../src/services/notion/actions/new-page"
import { createPageInDbReaction } from "../../src/services/notion/reactions/create-page"
import type { IContext } from "../../src/interfaces/service"

const originalFetch = global.fetch
const mockFetch = mock()

describe("Notion Service", () => {
  beforeEach(() => {
    global.fetch = mockFetch as any
    mockFetch.mockReset()
  })
  afterEach(() => {
    global.fetch = originalFetch
  })

  describe("Action: new_page_in_db", () => {
    const context: IContext = {
      userId: "u1",
      tokens: { accessToken: "notion_token" },
      metadata: { lastPageId: "pg_1" }
    }

    it("parses Notion page properties correctly", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [
            {
              id: "pg_2",
              url: "http://notion/pg_2",
              properties: {
                Name: {
                  type: "title",
                  title: [{ plain_text: "Meeting Notes" }]
                }
              }
            }
          ]
        })
      })

      const result = await newPageInDbAction.check({ databaseId: "db_1" }, context)

      expect(result).toBe(true)
      expect(context.actionData?.title).toBe("Meeting Notes")
    })
  })

  describe("Reaction: create_page", () => {
    it("constructs complex Notion block structure", async () => {
      mockFetch.mockResolvedValue({ ok: true })

      const context: IContext = { userId: "u1", tokens: { accessToken: "notion_token" } }
      await createPageInDbReaction.execute(
        {
          databaseId: "db_1",
          title: "New Task",
          content: "Do this"
        },
        context
      )

      const [_, options] = mockFetch.mock.calls[0]
      const body = JSON.parse(options.body)

      expect(body.parent.database_id).toBe("db_1")
      expect(body.properties.title.title[0].text.content).toBe("New Task")
      expect(body.children[0].paragraph.rich_text[0].text.content).toBe("Do this")
    })
  })
})
