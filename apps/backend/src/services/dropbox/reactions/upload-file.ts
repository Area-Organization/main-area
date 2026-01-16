import type { IAction, IContext } from "../../../interfaces/service"

export const topSellersAction: IAction = {
  name: "Top sellers",
  description: "Trigger when a new game enters the top sellers list",
  params: {
    maxClassement: {
      type: "number",
      label: "Max position to monitor",
      required: false,
      description: "Only trigger if a new game enters the top X (default 10)"
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
    const max = (params.maxClassement as number) || 10
    const { metadata } = context
    try {
      const response = await fetch(
        "https://store.steampowered.com/api/featuredcategories?cc=FR&l=french"
      )
      if (!response.ok) return false
      const data = (await response.json()) as any
      let topSellers = data.top_sellers?.items
      if (!Array.isArray(topSellers) || topSellers.length === 0) return false
      const monitoredGames = topSellers.slice(0, max)
      const lastTopIds = metadata?.lastTopIds as (string | number)[] | undefined
      if (lastTopIds === undefined) {
        context.metadata = { lastTopIds: monitoredGames.map((g: any) => g.id) }
        return false
      }
      const newEntry = monitoredGames.find((game: any) => !lastTopIds.includes(game.id))
      if (newEntry) {
        context.metadata = { lastTopIds: monitoredGames.map((g: any) => g.id) }
        context.actionData = {
          place: monitoredGames.indexOf(newEntry) + 1,
          gameName: newEntry.name,
          price: newEntry.final_price > 0
            ? `${(newEntry.final_price / 100).toFixed(2)}€`
            : "Free",
          url: `https://store.steampowered.com/app/${newEntry.id}`,
          imageUrl: newEntry.large_capsule_image
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
    if (!response.ok) throw new Error("Steam Store API unreachable")
  }
}