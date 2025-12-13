import { client } from "$lib/api";
import type { OAuth2AuthUrlResponseType } from "@area/types";

export async function getServiceAuthUrl(serviceName: string, callbackUrl?: string): Promise<OAuth2AuthUrlResponseType> {
  const { data, error } = await client.api.connections.oauth2({ serviceName })['auth-url'].get({
    query: {
      callbackUrl
    }
  });

  if (error) {
    throw new Error(`Failed to fetch service auth url: ${error.status}`);
  }

  return data!;
}
