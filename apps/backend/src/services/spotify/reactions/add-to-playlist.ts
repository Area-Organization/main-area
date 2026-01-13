import type { IReaction, IContext } from "../../../interfaces/service";

type SpotifyTrack = {
  uri: string;
};

type SpotifySearchResponse = {
  tracks: {
    items: SpotifyTrack[];
  };
};

export const addToPlaylistReaction: IReaction = {
  name: "Add track to playlist",
  description: "Searches for a track and adds the first result to a specified playlist.",
  params: {
    playlistId: {
      type: "string",
      label: "Playlist ID",
      required: true,
      description: "The ID of the playlist to add the track to."
    },
    trackQuery: {
      type: "string",
      label: "Track Name/Query",
      required: true,
      description: "The name of the track to search for (supports templates)."
    }
  },

  async execute(params, context: IContext): Promise<void> {
    const { playlistId, trackQuery } = params;
    const accessToken = context.tokens?.accessToken;

    if (!accessToken) {
      throw new Error("Spotify access token is missing.");
    }

    const searchParams = new URLSearchParams({
      q: trackQuery,
      type: 'track',
      limit: '1'
    });

    const searchResponse = await fetch(`https://api.spotify.com/v1/search?${searchParams.toString()}`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });

    if (!searchResponse.ok) {
      throw new Error(`Failed to search for track: ${searchResponse.statusText}`);
    }

    const searchResult = await searchResponse.json() as SpotifySearchResponse;
    const track = searchResult.tracks.items[0];

    if (!track) {
      console.warn(`No track found for query: "${trackQuery}"`);
      return;
    }

    const addTrackResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        uris: [track.uri]
      })
    });

    if (!addTrackResponse.ok) {
      const error = await addTrackResponse.json();
      throw new Error(`Failed to add track to playlist: ${error || addTrackResponse.statusText}`);
    }
  }
};