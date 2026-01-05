import type { IReaction, IContext } from "../../../interfaces/service"

export const sendMessageReaction: IReaction = {
  name: "send_message",
  description: "Sends a message to a specific Discord channel",
  params: {
    channelId: {
      type: "string",
      label: "Channel ID",
      required: true,
      description: "The ID of the channel to send the message to"
    },
    content: {
      type: "string",
      label: "Message Content",
      required: true,
      description: "The content of the message to send (supports templates)"
    }
  },

  async execute(params, context: IContext): Promise<void> {
    const { channelId, content } = params
    const botToken = context.tokens?.accessToken

    if (!botToken) {
      throw new Error("Discord Bot Token not found in user connection.")
    }

    try {
      const response = await fetch(
        `https://discord.com/api/v10/channels/${channelId}/messages`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bot ${botToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            content: content
          })
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Failed to send Discord message: ${error || response.statusText}`)
      }
      console.log(`✓ Discord message sent to channel ${channelId}`)
    } catch (error) {
      console.error("Error sending Discord message:", error)
      throw error
    }
  }
}