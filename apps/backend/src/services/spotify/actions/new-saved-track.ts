import type { IAction, IContext } from "../../../interfaces/service";

type SpotifyArtist = { name: string };
type SpotifyAlbum = { name: string; external_urls: { spotify: string } };
type SpotifyTrack = {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  external_urls: { spotify: string };
};
type SpotifySavedTrackResponse = {
  items: { added_at: string; track: SpotifyTrack }[];
};

export const newSavedTrackAction: IAction = {
  name: "New saved track",
  description: "Triggered when you 'like' a new song and add it to your library.",
  params: {},
  variables: [
    { name: "trackName", description: "The name of the track" },
    { name: "artistName", description: "The name of the primary artist" },
    { name: "albumName", description: "The name of the album" },
    { name: "trackUrl", description: "The URL to the track on Spotify" }
  ],

  async check(params, context: IContext): Promise<boolean> {
    const accessToken = context.tokens?.accessToken;

    if (!accessToken) {
      throw new Error("Spotify access token is missing.");
    }

    try {
      const response = await fetch("https://api.spotify.com/v1/me/tracks?limit=1", {
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        console.error(`Spotify API error: ${response.statusText}`);
        return false;
      }

      const data = await response.json() as SpotifySavedTrackResponse;
      const latestItem = data?.items?.[0];

      if (!latestItem) {
        return false;
      }
      
      const latestTrack = latestItem.track;
      const lastCheckedId = context.metadata?.lastTrackId as string | undefined;

      if (lastCheckedId === undefined) {
        context.metadata = { lastTrackId: latestTrack.id };
        return false;
      }
      
      if (latestTrack.id !== lastCheckedId) {
        context.metadata = { lastTrackId: latestTrack.id };
        context.actionData = {
          trackName: latestTrack.name,
          artistName: latestTrack.artists[0]?.name || "Unknown Artist",
          albumName: latestTrack.album.name,
          trackUrl: latestTrack.external_urls.spotify
        };
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }
};