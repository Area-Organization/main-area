import type { IAction, IContext } from "../../../interfaces/service"

export const onMessageAction: IAction = {
  name: "On message",
  description: "Triggered when a new message is posted in a specific channel",
  params: {
    channelId: {
      type: "string",
      label: "Channel ID",
      required: true,
      description: "The ID of the Discord channel to monitor"
    }
  },
  variables: [
    { name: "author", description: "Username of the message author" },
    { name: "content", description: "The content of the message" },
    { name: "url", description: "Link to the message" }
  ],

  async check(params, context: IContext): Promise<boolean> {
    const { channelId } = params
    const botToken = context.tokens?.accessToken

    if (!botToken) {
      throw new Error("Discord Bot Token not found in user connection.")
    }

    try {
      const response = await fetch(
        `https://discord.com/api/v10/channels/${channelId}/messages?limit=1`,
        {
          headers: {
            "Authorization": `Bot ${botToken}`
          }
        }
      )

      if (!response.ok) {
        console.error(`Discord API error: ${response.status}`)
        return false
      }

      const messages = await response.json()
      if (!Array.isArray(messages) || messages.length === 0) {
        return false
      }

      const latestMessage = messages[0]
      const lastCheckedId = context.metadata?.lastMessageId as string | undefined

      if (lastCheckedId === undefined) {
        context.metadata = { lastMessageId: latestMessage.id }
        return false
      }

      if (latestMessage.id !== lastCheckedId) {
        context.metadata = { lastMessageId: latestMessage.id }
        context.actionData = {
          author: latestMessage.author.username,
          content: latestMessage.content,
          url: `https://discord.com/channels/@me/${channelId}/${latestMessage.id}`
        }
        return true
      }

      return false
    } catch (error) {
      console.error("Error checking Discord messages:", error)
      return false
    }
  },
  
  async setup(params, context: IContext): Promise<void> {
    const { channelId } = params
    const botToken = context.tokens?.accessToken
    if (!botToken) {
      throw new Error("Discord Bot Token not found for setup validation.")
    }
    const response = await fetch(
      `https://discord.com/api/v10/channels/${channelId}`,
      {
        headers: {
          "Authorization": `Bot ${botToken}`
        }
      }
    )
    if (!response.ok) {
      throw new Error(`Cannot access Discord channel ${channelId}. Make sure the bot has access.`)
    }
  }
}