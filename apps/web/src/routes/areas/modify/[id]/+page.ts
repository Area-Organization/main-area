import { getServices } from "@/api/getServices";
import type { PageLoad } from "./$types";
import { getAreaById } from "@/api/getAreas";
import { getServiceConnections } from "@/api/getServiceConnections";

export const ssr = false;

export const load: PageLoad = async ({ params }) => {
  return {
    curArea: await getAreaById(params.id),
    services: await getServices(),
    connections: await getServiceConnections()
  };
};
