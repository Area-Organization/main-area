import { client } from "@/api";

export async function getStats() {
  const { data, error } = await client.api.areas.stats.overview.get();

  if (error) {
    throw new Error(`Failed to fetch areas: ${error.status}`);
  }

  return data;
}
