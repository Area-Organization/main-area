import { useState, useEffect } from "react";
import { useSession } from "@/ctx";
import { MOCK_ABOUT_DATA } from "@/constants/mock-data";
import type { ServiceDTO } from "@area/types";

// Toggle this to switch between Real Backend and Mock Data
const USE_MOCK = true;

export type Service = ServiceDTO;
// Helper types extracted from the ServiceDTO
export type Action = ServiceDTO["actions"][0];
export type Reaction = ServiceDTO["reactions"][0];

export function useServices() {
  const { client } = useSession();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);

    if (USE_MOCK) {
      // Simulate network delay
      setTimeout(() => {
        // Cast mock data to compatible DTO type
        setServices(MOCK_ABOUT_DATA.server.services as unknown as Service[]);
        setLoading(false);
      }, 500);
      return;
    }

    if (!client) {
      setError("Client not initialized");
      setLoading(false);
      return;
    }

    try {
      // @ts-ignore - dynamic access to treaty client might have type mismatch in early dev
      const { data, error } = await client["about.json"].get();

      if (error) {
        setError(error.status ? `Error: ${error.status}` : "Network Error");
      } else if (data && data.server) {
        setServices(data.server.services as Service[]);
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

  return { services, loading, error, refresh: fetchServices };
}
