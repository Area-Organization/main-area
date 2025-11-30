import React, {createContext, useContext, useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {treaty} from "@elysiajs/eden";
import type {App} from "@area/backend";

/**
 * Custom fetcher to handle React Native's strict GET request body policy.
 * React Native's fetch implementation throws an error if a body is present in GET/HEAD requests,
 * even if it's undefined or null.
 */
const fetcher = async (url: RequestInfo | URL, config?: RequestInit) => {
    if (config?.method === "GET" || config?.method === "HEAD") {
        const {body, ...rest} = config || {};
        return fetch(url, rest);
    }
    return fetch(url, config);
};

interface SessionContextType {
    signIn: (token: string) => void;
    signOut: () => void;
    setServerUrl: (url: string) => void;
    session: string | null;
    apiUrl: string | null;
    isLoading: boolean;
    client: ReturnType<typeof treaty<App>> | null;
}

const SessionContext = createContext<SessionContextType>({
    signIn: () => null,
    signOut: () => null,
    setServerUrl: () => null,
    session: null,
    apiUrl: null,
    isLoading: true,
    client: null
});

export function useSession() {
    return useContext(SessionContext);
}

export function SessionProvider({children}: {children: React.ReactNode}) {
    const [session, setSession] = useState<string | null>(null);
    const [apiUrl, setApiUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [client, setClient] = useState<ReturnType<typeof treaty<App>> | null>(null);

    useEffect(() => {
        const loadStorage = async () => {
            try {
                const storedUrl = await AsyncStorage.getItem("server_url");
                const storedSession = await AsyncStorage.getItem("user_session");

                if (storedUrl) {
                    setApiUrl(storedUrl);
                    setClient(() => treaty<App>(storedUrl, {fetch: fetcher as any}));
                }
                if (storedSession) {
                    setSession(storedSession);
                }
            } catch (e) {
                // Silent error handling
            } finally {
                setIsLoading(false);
            }
        };

        loadStorage();
    }, []);

    const setServerUrl = async (url: string) => {
        let formattedUrl = url.trim();
        if (!formattedUrl.startsWith("http")) {
            formattedUrl = `http://${formattedUrl}`;
        }
        if (formattedUrl.endsWith("/")) {
            formattedUrl = formattedUrl.slice(0, -1);
        }

        setApiUrl(formattedUrl);
        setClient(() => treaty<App>(formattedUrl, {fetch: fetcher as any}));
        await AsyncStorage.setItem("server_url", formattedUrl);
    };

    const signIn = (token: string) => {
        setSession(token);
        AsyncStorage.setItem("user_session", token);
    };

    const signOut = () => {
        setSession(null);
        AsyncStorage.removeItem("user_session");
    };

    return (
        <SessionContext.Provider
            value={{
                signIn,
                signOut,
                setServerUrl,
                session,
                apiUrl,
                isLoading,
                client
            }}
        >
            {children}
        </SessionContext.Provider>
    );
}
