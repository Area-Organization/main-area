import type { IReaction, IContext } from "../../../interfaces/service"

export const createChannelReaction: IReaction = {
  name: "Create channel",
  description: "Crée un nouveau salon textuel sur un serveur",
  params: {
    guildId: { type: "string", label: "Server (Guild) ID", required: true },
    name: { type: "string", label: "Channel Name", required: true }
  },
  async execute(params, context: IContext): Promise<void> {
    await fetch(`https://discord.com/api/v10/guilds/${params.guildId}/channels`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${context.tokens?.accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name: params.name, type: 0 })
    })
  }
}