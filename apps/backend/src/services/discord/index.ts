import type { IService } from "../../interfaces/service"
import { onMessageAction } from "./actions/on-message"
import { sendMessageReaction } from "./reactions/send-message"

export const discordService: IService = {
  name: "discord",
  description: "Connect your Discord server for notifications and actions",
  requiresAuth: true,
  authType: "api_key",
  actions: [
    onMessageAction
  ],
  reactions: [
    sendMessageReaction
  ]
}