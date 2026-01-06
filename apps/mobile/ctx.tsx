import React, { createContext, useContext, useEffect, useState } from "react";
import { authClient } from "@/lib/auth";
import { client, type AreaClient } from "@/lib/api";
import { initApiUrl } from "@/lib/url-store";

type SessionContextType = {
  signIn: () => Promise<void>;
  signOut: () => void;
  session: typeof authClient.$Infer.Session.session | null;
  user: typeof authClient.$Infer.Session.user | null;
  isLoading: boolean;
  client: AreaClient;
};

const SessionContext = createContext<SessionContextType>({
  signIn: async () => {},
  signOut: () => null,
  session: null,
  user: null,
  isLoading: true,
  client
});

export function useSession() {
  return useContext(SessionContext);
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<typeof authClient.$Infer.Session.session | null>(null);
  const [user, setUser] = useState<typeof authClient.$Infer.Session.user | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = async () => {
    try {
      const { data } = await authClient.getSession();
      setSession(data?.session || null);
      setUser(data?.user || null);
    } catch (e) {
      console.error("Failed to fetch session", e);
    }
  };

  useEffect(() => {
    const init = async () => {
      // 1. Load URL from storage
      await initApiUrl();
      // 2. Fetch session (now using the correct URL)
      await fetchSession();
      // 3. Ready
      setIsLoading(false);
    };
    init();
  }, []);

  const signOut = async () => {
    try {
      await authClient.signOut();
      setSession(null);
      setUser(null);
    } catch (e) {
      console.error("Error signing out", e);
    }
  };

  return (
    <SessionContext.Provider
      value={{
        signIn: fetchSession,
        signOut,
        session,
        user,
        isLoading,
        client
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
