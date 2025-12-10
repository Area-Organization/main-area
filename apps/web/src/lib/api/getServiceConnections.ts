import { client } from "$lib/api";
import type { UserConnectionSchemaType } from "@area/types";

export async function getServiceConnections(): Promise<{
  connections: UserConnectionSchemaType[];
  total: number;
}> {
  const { data, error } = await client.api.connections.get();

  if (error) throw new Error(`Failed to fetch connected services: ${error}`);

  return data;
}
