import type { IService } from "../../interfaces/service";
import { newSavedTrackAction } from "./actions/new-saved-track";
import { addToPlaylistReaction } from "./reactions/add-to-playlist";

export const spotifyService: IService = {
  name: "spotify",
  description: "Automate your music library and playlists on Spotify.",
  requiresAuth: true,
  authType: "oauth2",
  oauth: {
    authorizationUrl: "https://accounts.spotify.com/authorize",
    tokenUrl: "https://accounts.spotify.com/api/token",
    clientId: process.env.SPOTIFY_CLIENT_ID!,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
    scopes: [
      "user-library-read",
      "playlist-modify-public",
      "playlist-modify-private"
    ]
  },
  actions: [
    newSavedTrackAction
  ],
  reactions: [
    addToPlaylistReaction
  ]
};