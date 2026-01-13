import type { IAction, IContext } from "../../../interfaces/service"

export const newSpecialsAction: IAction = {
  name: "New specials",
  description: "Triggered when a new game is on sale on Steam",
  params: {
    minDiscount: {
      type: "number",
      label: "Minimum Discount (%)",
      required: false,
      description: "Only trigger if the discount is higher than this percentage (ex: 50)"
    }
  },
  variables: [
    { name: "gameName", description: "The name of the game" },
    { name: "discount", description: "The discount percentage" },
    { name: "oldPrice", description: "Original price before discount" },
    { name: "newPrice", description: "Current price with discount" },
    { name: "url", description: "Link to the Steam store page" },
    { name: "imageUrl", description: "The game's thumbnail image" }
  ],

  async check(params, context: IContext): Promise<boolean> {
    const { minDiscount } = params
    const { metadata } = context

    try {
      const response = await fetch(
        "https://store.steampowered.com/api/featuredcategories?cc=FR&l=french"
      )
      if (!response.ok) {
        console.error(`Steam API error: ${response.status}`)
        return false
      }
      const data = await response.json() as any
      const specials = data.specials?.items

      if (!Array.isArray(specials) || specials.length === 0) {
        return false
      }
      const latestGame = specials[0]
      const lastCheckedId = metadata?.lastGameId as string | undefined
      if (lastCheckedId === undefined) {
        context.metadata = { lastGameId: latestGame.id }
        return false
      }
      if (latestGame.id !== lastCheckedId) {
        const discountValue = latestGame.discount_percent || 0
        if (minDiscount && discountValue < (minDiscount as number)) {
          context.metadata = { lastGameId: latestGame.id }
          return false
        }
        context.metadata = { lastGameId: latestGame.id }
        context.actionData = {
          gameName: latestGame.name,
          discount: `${discountValue}%`,
          oldPrice: `${(latestGame.original_price / 100).toFixed(2)}€`,
          newPrice: `${(latestGame.final_price / 100).toFixed(2)}€`,
          url: `https://store.steampowered.com/app/${latestGame.id}`,
          imageUrl: latestGame.large_capsule_image
        }
        return true
      }

      return false
    } catch (error) {
      console.error("Error checking Steam specials:", error)
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