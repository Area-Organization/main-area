import { describe, expect, it, mock, beforeEach, afterEach } from "bun:test"
import { newEmailWithAttachmentAction } from "../../src/services/gmail/actions/new-attach"
import type { IContext } from "../../src/interfaces/service"

const originalFetch = global.fetch
const mockFetch = mock()

describe("Gmail Service: Attachments", () => {
  beforeEach(() => {
    global.fetch = mockFetch as any
    mockFetch.mockReset()
  })
  afterEach(() => {
    global.fetch = originalFetch
  })

  const context: IContext = {
    userId: "u1",
    tokens: { accessToken: "t1" },
    metadata: { lastAttachmentEmailId: "msg_old" }
  }

  it("returns true only if email has valid attachments", async () => {
    // 1. List
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: [{ id: "msg_new" }] })
    })

    // 2. Details
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: "msg_new",
        snippet: "File attached",
        payload: {
          headers: [{ name: "From", value: "sender" }],
          parts: [
            { mimeType: "text/plain", body: {} }, // Not an attachment
            {
              filename: "report.pdf",
              mimeType: "application/pdf",
              body: { attachmentId: "att_1", size: 100 }
            }
          ]
        }
      })
    })

    const result = await newEmailWithAttachmentAction.check({}, context)

    expect(result).toBe(true)
    expect(context.actionData?.attachmentCount).toBe(1)
    expect(context.actionData?.firstAttachmentName).toBe("report.pdf")
  })

  it("filters by file extension", async () => {
    // 1. List
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: [{ id: "msg_new" }] })
    })

    // 2. Details
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ messages: [] })
    })

    await newEmailWithAttachmentAction.check({ fileExtension: "pdf" }, context)

    const url = mockFetch.mock.calls[0]?.[0]

    expect(url).toContain(encodeURIComponent("filename:pdf"))
  })
})
