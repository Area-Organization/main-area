import { client } from "$lib/api";
import type { ServiceDTO } from "@area/types";

export async function getServices(): Promise<ServiceDTO[]> {
  const { data, error } = await client["about.json"].get();

  if (error) {
    throw new Error(`Failed to fetch services: ${error.status}`);
  }

  return data?.server?.services ?? [];
}
