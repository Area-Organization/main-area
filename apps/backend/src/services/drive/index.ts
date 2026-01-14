import type { IService } from "../../interfaces/service"
import { newFileAction } from "./actions/new-file"
import { createFolderReaction } from "./reactions/create-folder"

export const googleDriveService: IService = {
  name: "google drive",
  description: "Manage your files and folders in Google Drive.",
  requiresAuth: true,
  authType: "oauth2",
  oauth: {
    authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    clientId: process.env.DRIVE_CLIENT_ID!,
    clientSecret: process.env.DRIVE_CLIENT_SECRET!,
    scopes: [
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/drive.file"
    ]
  },
  actions: [
    newFileAction
  ],
  reactions: [
    createFolderReaction
  ]
}