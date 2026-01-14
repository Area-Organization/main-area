import type { IReaction, IContext } from "../../../interfaces/service"

export const uploadFileReaction: IReaction = {
  name: "Upload text file",
  description: "Create a new text file in your Dropbox",
  params: {
    filename: {
      type: "string",
      label: "File name",
      required: true,
      description: "Example: logs.txt"
    },
    content: {
      type: "string",
      label: "Content",
      required: true,
      description: "Text to put inside the file."
    }
  },
  async execute(params, context: IContext): Promise<void> {
    const { tokens } = context
    const { filename, content } = params
    const arg = {
      path: `/${filename}`,
      mode: "overwrite",
      autorename: true,
      mute: false
    }
    const response = await fetch("https://content.dropboxapi.com/2/files/upload", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${tokens?.accessToken}`,
        "Dropbox-API-Arg": JSON.stringify(arg),
        "Content-Type": "application/octet-stream"
      },
      body: content
    })
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Dropbox upload failed: ${error}`)
    }
  }
}