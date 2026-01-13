import type { IAction, IContext } from "../../../interfaces/service"

type DriveFile = {
  id: string
  name: string
  mimeType: string
  webViewLink: string
  size?: string
}

type DriveFileListResponse = {
  files: DriveFile[]
}

export const newFileAction: IAction = {
  name: "New file in folder",
  description: "Triggered when a new file is added to a specific folder (or anywhere in My Drive).",
  params: {
    folderId: {
      type: "string",
      label: "Folder ID (Optional)",
      required: false,
      description: "The ID of the folder to watch. Leave blank to watch your entire 'My Drive'."
    }
  },
  variables: [
    { name: "fileId", description: "The ID of the new file" },
    { name: "fileName", description: "The name of the new file" },
    { name: "mimeType", description: "The MIME type of the file" },
    { name: "fileUrl", description: "A link to view the file in the browser" },
    { name: "fileSize", description: "The size of the file in bytes" }
  ],

  async check(params, context: IContext): Promise<boolean> {
    const { folderId } = params
    const accessToken = context.tokens?.accessToken

    if (!accessToken) {
      throw new Error("Google Drive access token not found.")
    }

    try {
      const url = new URL("https://www.googleapis.com/drive/v3/files")
      let query = "trashed = false"
      if (folderId) {
        query += ` and '${folderId}' in parents`
      }

      url.searchParams.set("q", query)
      url.searchParams.set("orderBy", "createdTime desc")
      url.searchParams.set("pageSize", "1")
      url.searchParams.set("fields", "files(id, name, mimeType, webViewLink, size)")

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` }
      })

      if (!response.ok) {
        console.error(`Google Drive API Error: ${response.status}`)
        return false
      }

      const data = (await response.json()) as DriveFileListResponse
      const latestFile = data.files[0]

      if (!latestFile) {
        return false
      }

      const lastCheckedId = context.metadata?.lastFileId as string | undefined

      if (lastCheckedId === undefined) {
        context.metadata = { lastFileId: latestFile.id }
        return false
      }

      if (latestFile.id !== lastCheckedId) {
        context.metadata = { lastFileId: latestFile.id }
        context.actionData = {
          fileId: latestFile.id,
          fileName: latestFile.name,
          mimeType: latestFile.mimeType,
          fileUrl: latestFile.webViewLink,
          fileSize: latestFile.size || "0"
        }
        return true
      }

      return false
    } catch (error) {
      console.error("Error checking Google Drive files:", error)
      return false
    }
  }
}