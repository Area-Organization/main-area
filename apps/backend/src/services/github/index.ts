import type { IService } from "../../interfaces/service"
import { newIssueAction } from "./actions/new-issue"
import { newStarAction } from "./actions/new-star"
import { createIssueReaction } from "./reactions/create-issue"

export const githubService: IService = {
  name: "github",
  description: "GitHub repository management and notifications",
  requiresAuth: true,
  authType: "oauth2",
  oauth: {
    authorizationUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    scopes: ["repo", "user", "notifications"]
  },
  actions: [
    newIssueAction,
    newStarAction
  ],
  reactions: [
    createIssueReaction
  ]
}