import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSession } from "@/ctx";
import type { ServiceDTO } from "@area/types";

// Define the shape of our global data
type DataContextType = {
  services: ServiceDTO[];
  connections: any[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
};

const DataContext = createContext<DataContextType>({
  services: [],
  connections: [],
  isLoading: true,
  refreshData: async () => {}
});

export function useData() {
  return useContext(DataContext);
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { client, session } = useSession();
  const [services, setServices] = useState<ServiceDTO[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = useCallback(async () => {
    if (!session) return;

    try {
      // Fetch both in parallel for speed
      const [servicesReq, connectionsReq] = await Promise.all([
        client["about.json"].get(),
        client.api.connections.get()
      ]);

      if (servicesReq.data?.server?.services) {
        setServices(servicesReq.data.server.services as ServiceDTO[]);
      }

      if (connectionsReq.data?.connections) {
        setConnections(connectionsReq.data.connections);
      }
    } catch (e) {
      console.error("Failed to refresh global data", e);
    } finally {
      setIsLoading(false);
    }
  }, [client, session]);

  // Initial fetch when session becomes available
  useEffect(() => {
    if (session) {
      refreshData();
    }
  }, [session, refreshData]);

  return (
    <DataContext.Provider
      value={{
        services,
        connections,
        isLoading,
        refreshData
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
