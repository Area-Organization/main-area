import type { IService } from "../../interfaces/service"
import { newPageInDbAction } from "./actions/new-page"
import { createPageInDbReaction } from "./reactions/create-page"

export const notionService: IService = {
  name: "notion",
  description: "Connect your Notion workspace to automate databases and pages.",
  requiresAuth: true,
  authType: "oauth2",
  oauth: {
    authorizationUrl: "https://api.notion.com/v1/oauth/authorize",
    tokenUrl: "https://api.notion.com/v1/oauth/token",
    clientId: process.env.NOTION_CLIENT_ID!,
    clientSecret: process.env.NOTION_CLIENT_SECRET!,
    scopes: [] 
  },
  actions: [
    newPageInDbAction
  ],
  reactions: [
    createPageInDbReaction
  ]
}