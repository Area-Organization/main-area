import { useState, useEffect } from "react";
import { useSession } from "@/ctx";
import { MOCK_ABOUT_DATA } from "@/constants/mock-data";

// Toggle this to switch between Real Backend and Mock Data
const USE_MOCK = true;

// Infer types from the mock data for now
export type Service = (typeof MOCK_ABOUT_DATA.server.services)[0];
export type Action = (typeof MOCK_ABOUT_DATA.server.services)[0]["actions"][0];
export type Reaction = (typeof MOCK_ABOUT_DATA.server.services)[0]["reactions"][0];

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
        setServices(MOCK_ABOUT_DATA.server.services as Service[]);
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
        setServices(data.server.services as any[]);
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
