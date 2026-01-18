import type { IReaction, IContext } from "../../../interfaces/service"

type DriveFileResponse = {
  id: string
  name: string
}

export const createFolderReaction: IReaction = {
  name: "Create folder",
  description: "Creates a new, empty folder in Google Drive.",
  params: {
    folderName: {
      type: "string",
      label: "Folder Name",
      required: true,
      description: "The name for the new folder (e.g., 'Project Reports' or 'Invoices for {{month}}')."
    },
    parentFolderId: {
      type: "string",
      label: "Parent Folder ID (Optional)",
      required: false,
      description: "The ID of the folder where this new folder should be created. If blank, it's created in 'My Drive'."
    }
  },

  async execute(params, context: IContext): Promise<void> {
    const { folderName, parentFolderId } = params
    const accessToken = context.tokens?.accessToken

    if (!accessToken) {
      throw new Error("Google Drive access token not found.")
    }

    try {
      const metadata: {
        name: string
        mimeType: string
        parents?: string[]
      } = {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder"
      }

      if (parentFolderId) {
        metadata.parents = [parentFolderId]
      }

      const response = await fetch("https://www.googleapis.com/drive/v3/files", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(metadata)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Failed to create folder: ${response.statusText}`)
      }
      
      const createdFolder = (await response.json()) as DriveFileResponse
      console.log(`✓ Google Drive folder '${folderName}' created with ID: ${createdFolder.id}`)
    } catch (error) {
      console.error("Error creating Google Drive folder:", error)
      throw error
    }
  }
}