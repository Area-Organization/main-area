import type { IService } from "../../interfaces/service"
import { newEmailAction } from "./actions/new-email"
import { newEmailWithAttachmentAction } from "./actions/new-attach"
import { sendEmailReaction } from "./reactions/send-email"

export const gmailService: IService = {
  name: "gmail",
  description: "Gmail email management and automation",
  requiresAuth: true,
  authType: "oauth2",
  oauth: {
    authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    clientId: process.env.GMAIL_CLIENT_ID!,
    clientSecret: process.env.GMAIL_CLIENT_SECRET!,
    scopes: [
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.modify"
    ]
  },
  actions: [
    newEmailAction,
    newEmailWithAttachmentAction
  ],
  reactions: [
    sendEmailReaction
  ]
}