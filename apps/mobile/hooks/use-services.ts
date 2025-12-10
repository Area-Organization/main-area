import { useState, useEffect } from "react";
import { useSession } from "@/ctx";
import type { ServiceDTO } from "@area/types";

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

    if (!client) {
      setError("Client not initialized");
      setLoading(false);
      return;
    }

    try {
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
