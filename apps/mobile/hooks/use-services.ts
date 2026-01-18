import { useState, useEffect } from "react";
import { useSession } from "@/ctx";
import type { ServiceDTO } from "@area/types";

export type Service = ServiceDTO;
export type Action = ServiceDTO["actions"][0];
export type Reaction = ServiceDTO["reactions"][0];

let CACHED_SERVICES: Service[] = [];
let TIMESTAMP = 0;
const CACHE_DURATION = 1000 * 60 * 5;

// Exported for testing purposes
export const resetServiceCache = () => {
  CACHED_SERVICES = [];
  TIMESTAMP = 0;
};

export function useServices() {
  const { client } = useSession();
  // Initialize state with cache if available
  const [services, setServices] = useState<Service[]>(CACHED_SERVICES);
  const [loading, setLoading] = useState(services.length === 0);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async (force = false) => {
    // Only show loading if we don't have data, or if explicitly forced
    if (services.length === 0 || force) {
      setLoading(true);
    }
    setError(null);

    if (!client) {
      setLoading(false);
      return;
    }

    // Check cache validity
    const now = Date.now();
    if (!force && CACHED_SERVICES.length > 0 && now - TIMESTAMP < CACHE_DURATION) {
      setServices(CACHED_SERVICES);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await client["about.json"].get();

      if (error) {
        setError(error.status ? `Error: ${error.status}` : "Network Error");
      } else if (data && data.server) {
        const newServices = data.server.services as Service[];
        CACHED_SERVICES = newServices;
        TIMESTAMP = Date.now();
        setServices(newServices);
      }
    } catch (err) {
      setError("Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [client]);

  return { services, loading, error, refresh: () => fetchServices(true) };
}
