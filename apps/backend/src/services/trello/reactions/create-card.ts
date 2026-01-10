import type { IReaction, IContext } from "../../../interfaces/service";

type TrelloCard = {
  id: string;
  name: string;
  desc: string;
  shortUrl: string;
};


export const createCardReaction: IReaction = {
  name: "Create card",
  description: "Creates a new card in a specified Trello list.",
  params: {
    listId: {
      type: "string",
      label: "List ID",
      required: true,
      description: "The ID of the list where the card will be created."
    },
    name: {
      type: "string",
      label: "Card Name",
      required: true,
      description: "The title of the new card (supports templates)."
    },
    desc: {
      type: "string",
      label: "Card Description",
      required: false,
      description: "The description for the card (supports templates)."
    }
  },

  async execute(params, context: IContext): Promise<void> {
    const { listId, name, desc } = params;
    const userToken = context.tokens?.accessToken;
    const apiKey = process.env.TRELLO_API_KEY;

    if (!apiKey || !userToken) {
      throw new Error("Trello API Key or User Token is missing.");
    }

    const queryParams = new URLSearchParams({
      idList: listId,
      name: name,
      key: apiKey,
      token: userToken
    });
    if (desc) {
      queryParams.append("desc", desc);
    }

    try {
      const response = await fetch(`https://api.trello.com/1/cards?${queryParams.toString()}`, {
        method: "POST",
        headers: {
          "Accept": "application/json"
        }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to create Trello card: ${error || response.statusText}`);
      }

      const createdCard = await response.json() as TrelloCard
      console.log(`✓ Trello card created successfully: ${createdCard.shortUrl}`);
    } catch (error) {
      console.error("Error creating Trello card:", error);
      throw error;
    }
  }
};