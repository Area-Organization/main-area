import type { IAction, IContext } from "../../../interfaces/service"

export const newFileAction: IAction = {
  name: "New file",
  description: "Triggered when a new file is uploaded to a folder",
  params: {
    path: {
      type: "string",
      label: "Folder Path",
      required: true,
      description: "Path to monitor, empty for root."
    }
  },
  variables: [
    { name: "fileName", description: "The name of the file" },
    { name: "filePath", description: "The full path of the file" },
    { name: "fileSize", description: "Size of the file in bytes" }
  ],

  async check(params, context: IContext): Promise<boolean> {
    const { tokens, metadata } = context
    const path = params.path === "/" ? "" : params.path

    try {
      const response = await fetch("https://api.dropboxapi.com/2/files/list_folder", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${tokens?.accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          path: path || "",
          recursive: false,
          include_media_info: false
        })
      })

      if (!response.ok) return false

      const data = (await response.json()) as any
      const files = data.entries.filter((e: any) => e[".tag"] === "file")

      if (files.length === 0) return false

      const latestFile = files[files.length - 1]
      const lastId = metadata?.lastFileId

      if (lastId === undefined) {
        context.metadata = { lastFileId: latestFile.id }
        return false
      }

      if (latestFile.id !== lastId) {
        context.metadata = { lastFileId: latestFile.id }
        context.actionData = {
          fileName: latestFile.name,
          filePath: latestFile.path_display,
          fileSize: latestFile.size
        }
        return true
      }
      return false
    } catch (error) {
      return false
    }
  }
}