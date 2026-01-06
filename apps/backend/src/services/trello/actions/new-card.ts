import type { IAction, IContext } from "../../../interfaces/service";

type TrelloCard = {
  id: string;
  name: string;
  desc: string;
  shortUrl: string;
};

type TrelloList = {
  name: string;
  idBoard: string;
};

type TrelloBoard = {
  name: string;
};

export const newCardAction: IAction = {
  name: "New card in list",
  description: "Triggered when a new card is added to a specific list.",
  params: {
    listId: {
      type: "string",
      label: "List ID",
      required: true,
      description: "The ID of the Trello list to monitor."
    }
  },
  variables: [
    { name: "cardName", description: "The name of the new card" },
    { name: "cardDescription", description: "The description of the card" },
    { name: "cardUrl", description: "The URL of the new card" },
    { name: "listName", description: "The name of the list" },
    { name: "boardName", description: "The name of the board" }
  ],

  async check(params, context: IContext): Promise<boolean> {
    const { listId } = params;
    const userToken = context.tokens?.accessToken;
    const apiKey = process.env.TRELLO_API_KEY;

    if (!apiKey || !userToken) {
      throw new Error("Trello API Key or User Token is missing.");
    }
    
    try {
      const response = await fetch(
        `https://api.trello.com/1/lists/${listId}/cards?key=${apiKey}&token=${userToken}&limit=1`, 
        {
          headers: { "Accept": "application/json" }
        }
      );

      if (!response.ok) {
        console.error(`Trello API error: ${response.statusText}`);
        return false;
      }

      const cards = await response.json() as TrelloCard[];
      if (!Array.isArray(cards) || cards.length === 0) {
        return false;
      }

      const latestCard = cards[0];
      
      if (!latestCard) {
        return false
      }
      const lastCheckedId = context.metadata?.lastCardId as string | undefined;

      if (lastCheckedId === undefined) {
        context.metadata = { lastCardId: latestCard.id };
        return false;
      }

      if (latestCard.id !== lastCheckedId) {
        context.metadata = { lastCardId: latestCard.id };
        const listResponse = await fetch(`https://api.trello.com/1/lists/${listId}?key=${apiKey}&token=${userToken}`);
        const listData = await listResponse.json() as TrelloList;
        
        const boardResponse = await fetch(`https://api.trello.com/1/boards/${listData.idBoard}?key=${apiKey}&token=${userToken}`);
        const boardData = await boardResponse.json() as TrelloBoard;

        context.actionData = {
          cardName: latestCard.name,
          cardDescription: latestCard.desc,
          cardUrl: latestCard.shortUrl,
          listName: listData.name,
          boardName: boardData.name
        };
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking Trello cards:", error);
      return false;
    }
  }
};