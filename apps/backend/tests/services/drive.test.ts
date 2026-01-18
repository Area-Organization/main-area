import { describe, expect, it, mock, beforeEach, afterEach } from "bun:test"
import { newFileAction } from "../../src/services/drive/actions/new-file"
import { createFolderReaction } from "../../src/services/drive/reactions/create-folder"
import type { IContext } from "../../src/interfaces/service"

const originalFetch = global.fetch
const mockFetch = mock()

describe("Google Drive Service", () => {
  beforeEach(() => {
    global.fetch = mockFetch as any
    mockFetch.mockReset()
  })
  afterEach(() => {
    global.fetch = originalFetch
  })

  describe("Action: new_file", () => {
    const context: IContext = {
      userId: "u1",
      tokens: { accessToken: "drive_token" },
      metadata: { lastFileId: "old_id" }
    }

    it("detects new file and populates actionData", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          files: [
            {
              id: "new_id",
              name: "Report.pdf",
              mimeType: "application/pdf",
              webViewLink: "http://drive/file",
              size: "1024"
            }
          ]
        })
      })

      const result = await newFileAction.check({}, context)

      expect(result).toBe(true)
      expect(context.metadata?.lastFileId).toBe("new_id")
      expect(context.actionData).toMatchObject({
        fileName: "Report.pdf",
        mimeType: "application/pdf"
      })
    })

    it("filters by folderId if provided", async () => {
      mockFetch.mockResolvedValue({ ok: true, json: async () => ({ files: [] }) })

      await newFileAction.check({ folderId: "folder_123" }, context)

      const [urlString] = mockFetch.mock.calls[0]
      const url = new URL(urlString)
      const qParam = url.searchParams.get("q")

      // Check that the query parameter contains our folder condition
      // "trashed = false and 'folder_123' in parents"
      expect(qParam).toContain("'folder_123' in parents")
    })
  })

  describe("Reaction: create_folder", () => {
    it("creates a folder with correct MIME type", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: "folder_new", name: "New Folder" })
      })

      const context: IContext = { userId: "u1", tokens: { accessToken: "drive_token" } }
      await createFolderReaction.execute({ folderName: "New Folder" }, context)

      const [_, options] = mockFetch.mock.calls[0]
      const body = JSON.parse(options.body)

      expect(body.mimeType).toBe("application/vnd.google-apps.folder")
      expect(body.name).toBe("New Folder")
    })
  })
})
