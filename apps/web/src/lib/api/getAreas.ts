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

export async function getAreaById(id: number | string) {
  const { data, error } = await client.api.areas({ id }).get();

  if (error) {
    throw new Error(`Failed to fetch area with id ${id}: ${error.status}`);
  }

  return data;
}
