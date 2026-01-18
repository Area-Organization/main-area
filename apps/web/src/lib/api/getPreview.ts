import { client } from "$lib/api";
import type { AreaReactionType } from "@area/types";

export async function getAreaPreview(
  reactions: {
    serviceName: string;
    reactionName: string;
    params: Record<string, string>;
    connectionId: string;
  }[]
) {
  try {
    await Promise.all(
      reactions.map(async (reaction) => {
        const { data, error } = await client.api.areas["test-reaction"].post({
          connectionId: reaction.connectionId,
          params: reaction.params,
          reactionName: reaction.reactionName,
          serviceName: reaction.serviceName
        });

        if (error) {
          const errorValue = error.value;
          let message = "Unknown error";

          if (typeof errorValue === "string") {
            message = errorValue;
          } else if (typeof errorValue === "object" && errorValue !== null) {
            message = errorValue.message || JSON.stringify(errorValue);
          }
          throw new Error(message);
        }

        return data;
      })
    );
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to preview Area: ${error}`);
  }
}
