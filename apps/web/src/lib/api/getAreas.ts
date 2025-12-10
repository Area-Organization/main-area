import { client } from "$lib/api";
import type { AreasListResponseType } from "@area/types";

export async function getAreas(params?: {
  limit?: number;
  offset?: number;
  enabled?: boolean;
  search?: string;
}): Promise<AreasListResponseType> {
  const { data, error } = await client.api.areas.get({
    query: params
  });

  if (error) {
    throw new Error(`Failed to fetch areas: ${error.status}`);
  }

  return data;
}
