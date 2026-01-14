import type { IAction, IContext } from "../../../interfaces/service"

type YouTubePlaylistItem = {
  snippet: {
    publishedAt: string
    title: string
    description: string
    thumbnails: {
      default: { url: string }
    }
    resourceId: {
      videoId: string
    }
  }
}

type ChannelDetails = {
  items: Array<{
    contentDetails: {
      relatedPlaylists: {
        uploads: string
      }
    }
  }>
}

type PlaylistItemsResponse = {
  items: YouTubePlaylistItem[]
}

export const newVideoAction: IAction = {
  name: "New video from channel",
  description: "Triggered when a new video is uploaded to a specific YouTube channel.",
  params: {
    channelId: {
      type: "string",
      label: "Channel ID",
      required: true,
      description: "The ID of the YouTube channel to monitor (e.g., UCX6OQ3DkcsbYNE6H8uQQuVA)."
    }
  },
  variables: [
    { name: "videoId", description: "The ID of the new video" },
    { name: "title", description: "The title of the new video" },
    { name: "description", description: "The description of the new video" },
    { name: "videoUrl", description: "The URL to the new video" },
    { name: "thumbnailUrl", description: "The URL of the video's thumbnail" }
  ],

  async check(params, context: IContext): Promise<boolean> {
    const { channelId } = params
    const accessToken = context.tokens?.accessToken

    if (!accessToken) {
      throw new Error("YouTube access token not found.")
    }

    try {
      const channelResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      )
      if (!channelResponse.ok) {
        console.error(`YouTube API Error (Channels): ${channelResponse.status}`)
        return false
      }
      const channelData = (await channelResponse.json()) as ChannelDetails
      const uploadsPlaylistId = channelData.items[0]?.contentDetails.relatedPlaylists.uploads
      if (!uploadsPlaylistId) {
        throw new Error(`Could not find uploads playlist for channel ${channelId}`)
      }

      const playlistResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=1`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      )
      if (!playlistResponse.ok) {
        console.error(`YouTube API Error (PlaylistItems): ${playlistResponse.status}`)
        return false
      }
      const playlistData = (await playlistResponse.json()) as PlaylistItemsResponse
      const latestVideo = playlistData.items[0]

      if (!latestVideo) {
        return false
      }

      const latestVideoId = latestVideo.snippet.resourceId.videoId
      const lastCheckedId = context.metadata?.lastVideoId as string | undefined

      if (lastCheckedId === undefined) {
        context.metadata = { lastVideoId: latestVideoId }
        return false
      }

      if (latestVideoId !== lastCheckedId) {
        context.metadata = { lastVideoId: latestVideoId }
        context.actionData = {
          videoId: latestVideoId,
          title: latestVideo.snippet.title,
          description: latestVideo.snippet.description,
          videoUrl: `https://www.youtube.com/watch?v=${latestVideoId}`,
          thumbnailUrl: latestVideo.snippet.thumbnails.default.url
        }
        return true
      }

      return false
    } catch (error) {
      console.error("Error checking YouTube videos:", error)
      return false
    }
  }
}