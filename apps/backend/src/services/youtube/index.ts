import type { IService } from "../../interfaces/service"
import { newVideoAction } from "./actions/new-video"
import { addToPlaylistReaction } from "./reactions/add-to-playlist"

export const youtubeService: IService = {
  name: "youtube",
  description: "Automate your YouTube channel and playlists.",
  requiresAuth: true,
  authType: "oauth2",
  oauth: {
    authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    clientId: process.env.YOUTUBE_CLIENT_ID!,
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET!,
    scopes: [
      "https://www.googleapis.com/auth/youtube.readonly",
      "https://www.googleapis.com/auth/youtube.force-ssl"
    ]
  },
  actions: [
    newVideoAction
  ],
  reactions: [
    addToPlaylistReaction
  ]
}