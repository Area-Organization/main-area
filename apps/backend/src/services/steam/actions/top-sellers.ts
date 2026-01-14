import type { IAction, IContext } from "../../../interfaces/service"

export const topSellersAction: IAction = {
  name: "Top sellers",
  description: "Trigger when a new game reaches the top of the best sellers list",
  params: {
    maxClassement: {
      type: "number",
      label: "Max position to monitor",
      required: false,
      description: "Only check the top X games (default is 10)"
    }
  },
  variables: [
    { name: "place", description: "The rank of the game in the top sellers" },
    { name: "gameName", description: "The name of the game" },
    { name: "price", description: "The current price of the game" },
    { name: "url", description: "Link to the Steam store page" },
    { name: "imageUrl", description: "The game's thumbnail image" }
  ],

  async check(params, context: IContext): Promise<boolean> {
    const maxClassement = (params.maxClassement as number) || 10
    const { metadata } = context

    try {
      const response = await fetch(
        "https://store.steampowered.com/api/featuredcategories?cc=FR&l=french"
      )
      if (!response.ok) {
        console.error(`Steam API error: ${response.status}`)
        return false
      }
      const data = (await response.json()) as any
      const topSellers = data.top_sellers?.items

      if (!Array.isArray(topSellers) || topSellers.length === 0) {
        return false
      }
      const latestTopGame = topSellers[0]
      const lastCheckedId = metadata?.lastTopId as string | number | undefined
      if (lastCheckedId === undefined) {
        context.metadata = { lastTopId: latestTopGame.id }
        return false
      }
      if (latestTopGame.id !== lastCheckedId) {
        context.metadata = { lastTopId: latestTopGame.id }
        context.actionData = {
          place: 1,
          gameName: latestTopGame.name,
          price: latestTopGame.final_price > 0
            ? `${(latestTopGame.final_price / 100).toFixed(2)}€`
            : "Free",
          url: `https://store.steampowered.com/app/${latestTopGame.id}`,
          imageUrl: latestTopGame.large_capsule_image
        }
        return true
      }
      return false
    } catch (error) {
      console.error("Error checking Steam top sellers:", error)
      return false
    }
  },
  async setup(_params, _context: IContext): Promise<void> {
    const response = await fetch("https://store.steampowered.com/api/featuredcategories")
    if (!response.ok) {
      throw new Error("Steam Store API is currently unreachable")
    }
  }
}