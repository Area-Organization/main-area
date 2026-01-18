import type { IReaction, IContext } from "../../../interfaces/service"

type YouTubeSearchResponse = {
  items: Array<{
    id: {
      videoId: string
    }
  }>
}

export const addToPlaylistReaction: IReaction = {
  name: "Add video to playlist",
  description: "Finds a video by search query and adds it to one of your playlists.",
  params: {
    playlistId: {
      type: "string",
      label: "Playlist ID",
      required: true,
      description: "The ID of the playlist to add the video to."
    },
    videoQuery: {
      type: "string",
      label: "Video Search Query",
      required: true,
      description: "The search term to find a video (e.g., 'Funny Cats' or '{{title}}')."
    }
  },

  async execute(params, context: IContext): Promise<void> {
    const { playlistId, videoQuery } = params
    const accessToken = context.tokens?.accessToken

    if (!accessToken) {
      throw new Error("YouTube access token not found.")
    }

    try {
      const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search")
      searchUrl.searchParams.set("part", "snippet")
      searchUrl.searchParams.set("q", videoQuery)
      searchUrl.searchParams.set("type", "video")
      searchUrl.searchParams.set("maxResults", "1")

      const searchResponse = await fetch(searchUrl.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      if (!searchResponse.ok) {
        throw new Error(`Failed to search for video: ${await searchResponse.text()}`)
      }

      const searchData = (await searchResponse.json()) as YouTubeSearchResponse
      const videoId = searchData.items[0]?.id.videoId

      if (!videoId) {
        console.warn(`No YouTube video found for query: "${videoQuery}"`)
        return
      }

      const response = await fetch("https://www.googleapis.com/youtube/v3/playlistItems?part=snippet", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          snippet: {
            playlistId: playlistId,
            resourceId: {
              kind: "youtube#video",
              videoId: videoId
            }
          }
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Failed to add video to playlist: ${response.statusText}`)
      }

      console.log(`✓ Video '${videoQuery}' added to YouTube playlist ${playlistId}`)
    } catch (error) {
      console.error("Error executing YouTube addToPlaylist reaction:", error)
      throw error
    }
  }
}