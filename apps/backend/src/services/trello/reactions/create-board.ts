import type { IReaction, IContext } from "../../../interfaces/service"

export const createBoardReaction: IReaction = {
  name: "Create board",
  description: "Crée un nouveau tableau Trello",
  params: {
    name: { type: "string", label: "Board Name", required: true }
  },
  async execute(params, context: IContext): Promise<void> {
    const apiKey = process.env.TRELLO_API_KEY
    const url = `https://api.trello.com/1/boards/?name=${encodeURIComponent(params.name)}&key=${apiKey}&token=${context.tokens?.accessToken}`
    await fetch(url, { method: "POST" })
  }
}