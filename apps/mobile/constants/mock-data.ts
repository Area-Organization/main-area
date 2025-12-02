export const MOCK_ABOUT_DATA = {
  client: {
    host: "127.0.0.1"
  },
  server: {
    current_time: Math.floor(Date.now() / 1000),
    services: [
      {
        name: "github",
        description: "Development platform",
        requiresAuth: true,
        actions: [
          {
            name: "new_commit",
            description: "Triggers when a new commit is pushed",
            params: {
              repository: { type: "string", required: true, label: "Repository Name" }
            }
          },
          {
            name: "new_issue",
            description: "Triggers when a new issue is created",
            params: {
              repository: { type: "string", required: true, label: "Repository Name" }
            }
          }
        ],
        reactions: [
          {
            name: "create_issue",
            description: "Creates a new issue",
            params: {
              title: { type: "string", required: true, label: "Issue Title" },
              body: { type: "string", required: true, label: "Issue Body" }
            }
          }
        ]
      },
      {
        name: "spotify",
        description: "Music streaming service",
        requiresAuth: true,
        actions: [
          {
            name: "new_track_saved",
            description: "Triggers when you save a track",
            params: {}
          }
        ],
        reactions: [
          {
            name: "pause_playback",
            description: "Pauses the music",
            params: {}
          },
          {
            name: "skip_to_next",
            description: "Skips to the next song",
            params: {}
          }
        ]
      },
      {
        name: "timer",
        description: "Time based scheduler",
        requiresAuth: false,
        actions: [
          {
            name: "every_day_at",
            description: "Triggers every day at a specific time",
            params: {
              time: { type: "string", required: true, label: "Time (HH:MM)" }
            }
          }
        ],
        reactions: []
      },
      {
        name: "discord",
        description: "Chat for gamers",
        requiresAuth: true,
        actions: [],
        reactions: [
          {
            name: "post_message",
            description: "Post a message to a channel",
            params: {
              channel_id: { type: "string", required: true, label: "Channel ID" },
              content: { type: "string", required: true, label: "Message" }
            }
          }
        ]
      }
    ]
  }
};
