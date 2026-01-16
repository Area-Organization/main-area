import type { IService } from "../../interfaces/service"
import { newFileAction } from "./actions/new-file"
import { uploadFileReaction } from "./reactions/upload-file"

export const dropboxService: IService = {
  name: "dropbox",
  description: "Cloud storage management and file notifications",
  requiresAuth: true,
  authType: "oauth2",
  oauth: {
    authorizationUrl: "https://www.dropbox.com/oauth2/authorize",
    tokenUrl: "https://www.dropbox.com/oauth2/token",
    clientId: process.env.DROPBOX_CLIENT_ID!,
    clientSecret: process.env.DROPBOX_CLIENT_SECRET!,
    scopes: ["files.metadata.read", "files.content.write", "files.content.read", "account_info.read"]
  },
  actions: [
    newFileAction
  ],
  reactions: [
    uploadFileReaction
  ]
}