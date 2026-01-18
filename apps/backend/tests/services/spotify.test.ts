import { describe, expect, it, mock, beforeEach, afterEach } from "bun:test"
import { newSavedTrackAction } from "../../src/services/spotify/actions/new-saved-track"
import { addToPlaylistReaction } from "../../src/services/spotify/reactions/add-to-playlist"
import type { IContext } from "../../src/interfaces/service"

const originalFetch = global.fetch
const mockFetch = mock()

describe("Spotify Service", () => {
  beforeEach(() => {
    global.fetch = mockFetch as any
    mockFetch.mockReset()
  })
  afterEach(() => {
    global.fetch = originalFetch
  })

  describe("Action: new_saved_track", () => {
    it("returns true when track ID changes", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          items: [
            {
              track: {
                id: "t2",
                name: "Song",
                artists: [{ name: "Artist" }],
                album: { name: "Album" },
                external_urls: { spotify: "url" }
              }
            }
          ]
        })
      })

      const context: IContext = {
        userId: "u1",
        tokens: { accessToken: "tok" },
        metadata: { lastTrackId: "t1" }
      }

      const result = await newSavedTrackAction.check({}, context)
      expect(result).toBe(true)
      expect(context.metadata?.lastTrackId).toBe("t2")
    })
  })

  describe("Reaction: add_to_playlist", () => {
    it("searches for track then adds it", async () => {
      // 1. Search Request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tracks: { items: [{ uri: "spotify:track:123" }] } })
      })

      // 2. Add Request
      mockFetch.mockResolvedValueOnce({ ok: true })

      const context: IContext = { userId: "u1", tokens: { accessToken: "tok" } }
      await addToPlaylistReaction.execute({ playlistId: "pl_1", trackQuery: "Song" }, context)

      expect(mockFetch).toHaveBeenCalledTimes(2)

      const addCall = mockFetch.mock.calls[1]
      expect(addCall[0]).toContain("/playlists/pl_1/tracks")
      expect(JSON.parse(addCall[1].body)).toEqual({ uris: ["spotify:track:123"] })
    })

    it("does nothing if search returns no results", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tracks: { items: [] } })
      })

      const context: IContext = { userId: "u1", tokens: { accessToken: "tok" } }
      await addToPlaylistReaction.execute({ playlistId: "pl_1", trackQuery: "Unknown" }, context)

      expect(mockFetch).toHaveBeenCalledTimes(1) // Search only
    })
  })
})
