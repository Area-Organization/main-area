import type { IReaction, IContext } from "../../../interfaces/service"

export const uploadFileReaction: IReaction = {
  name: "Upload file",
  description: "Upload any file (video, image, text) to Dropbox",
  params: {
    filename: {
      type: "string",
      label: "File name with extension",
      required: true
    },
    fileSource: {
      type: "string",
      label: "File Source (URL)",
      required: true,
      description: "The URL of the video or file to upload"
    }
  },
  async execute(params, context: IContext): Promise<void> {
    const { tokens } = context
    const { filename, fileSource } = params
    const fileResponse = await fetch(fileSource)
    if (!fileResponse.ok)
        throw new Error("Could not fetch the source file")
    const blob = await fileResponse.arrayBuffer()
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
      body: blob
    })
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Dropbox upload failed: ${error}`)
    }
  }
}