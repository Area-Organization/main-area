import { getServices } from "$lib/api/getServices";
import { getServiceConnections } from "$lib/api/getServiceConnections";

export async function load() {
  return {
    servicesPromise: getServices(),
    serviceConnectionPromise: getServiceConnections()
  };
}