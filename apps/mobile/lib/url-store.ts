import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "area_api_url";
const DEFAULT_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080";

export let currentApiUrl = DEFAULT_URL;

const listeners = new Set<(url: string) => void>();

export const getApiUrl = () => currentApiUrl;

export const setApiUrl = async (url: string) => {
  let cleanUrl = url.trim();
  // Remove trailing slash if present to avoid // issues
  if (cleanUrl.endsWith("/")) cleanUrl = cleanUrl.slice(0, -1);
  if (!cleanUrl.startsWith("http")) cleanUrl = `http://${cleanUrl}`;

  currentApiUrl = cleanUrl;

  try {
    await AsyncStorage.setItem(STORAGE_KEY, cleanUrl);
    listeners.forEach((cb) => cb(cleanUrl));
  } catch (e) {
    console.error("Failed to save API URL", e);
  }
};

export const initApiUrl = async () => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      currentApiUrl = stored;
    }
  } catch (e) {
    console.error("Failed to load API URL", e);
  }
  return currentApiUrl;
};

export const onUrlChange = (cb: (url: string) => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
