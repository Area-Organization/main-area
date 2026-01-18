import type { IService } from "../../interfaces/service"
import { onMessageAction } from "./actions/on-message"
import { createChannelReaction } from "./reactions/create-channel"
import { sendMessageReaction } from "./reactions/send-message"

export const discordService: IService = {
  name: "discord",
  description: "Connect your Discord server for notifications and actions",
  requiresAuth: true,
  authType: "api_key",
  authFields: [
    {
      key: "accessToken",
      label: "Bot Token",
      type: "password",
      required: true,
      description: "Create a bot in the Discord Developer Portal to get its token"
    }
  ],
  actions: [
    onMessageAction
  ],
  reactions: [
    sendMessageReaction,
    createChannelReaction
  ]
}