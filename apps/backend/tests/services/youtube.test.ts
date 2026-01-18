import { describe, expect, it, mock, beforeEach, afterEach } from "bun:test"
import { newVideoAction } from "../../src/services/youtube/actions/new-video"
import { addToPlaylistReaction } from "../../src/services/youtube/reactions/add-to-playlist"
import type { IContext } from "../../src/interfaces/service"

const originalFetch = global.fetch
const mockFetch = mock()

describe("YouTube Service", () => {
  beforeEach(() => {
    global.fetch = mockFetch as any
    mockFetch.mockReset()
  })
  afterEach(() => {
    global.fetch = originalFetch
  })

  describe("Action: new_video", () => {
    const context: IContext = {
      userId: "u1",
      tokens: { accessToken: "yt_token" },
      metadata: { lastVideoId: "v1" }
    }

    it("chains channel lookup and playlist items lookup", async () => {
      // 1. Channel Lookup
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [{ contentDetails: { relatedPlaylists: { uploads: "UU123" } } }]
        })
      })

      // 2. Playlist Items Lookup
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              snippet: {
                title: "New Vid",
                description: "Desc",
                thumbnails: { default: { url: "img" } },
                resourceId: { videoId: "v2" }
              }
            }
          ]
        })
      })

      const result = await newVideoAction.check({ channelId: "UC123" }, context)

      expect(result).toBe(true)
      expect(context.metadata?.lastVideoId).toBe("v2")
      // First call should use channel ID
      expect(mockFetch.mock.calls[0][0]).toContain("id=UC123")
      // Second call should use Uploads Playlist ID
      expect(mockFetch.mock.calls[1][0]).toContain("playlistId=UU123")
    })
  })

  describe("Reaction: add_to_playlist", () => {
    it("searches video then inserts to playlist", async () => {
      // 1. Search
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [{ id: { videoId: "v123" } }] })
      })

      // 2. Insert
      mockFetch.mockResolvedValueOnce({ ok: true })

      const context: IContext = { userId: "u1", tokens: { accessToken: "yt_token" } }
      await addToPlaylistReaction.execute({ playlistId: "PL1", videoQuery: "Cats" }, context)

      const insertCall = mockFetch.mock.calls[1]
      expect(insertCall[0]).toContain("playlistItems")
      expect(JSON.parse(insertCall[1].body).snippet.resourceId.videoId).toBe("v123")
    })
  })
})
