import { useThemeColor } from "@/hooks/use-theme-color";
import { MaterialCommunityIcons, FontAwesome5, FontAwesome } from "@expo/vector-icons";

export const BRAND_COLORS: Record<string, string> = {
  discord: "#5865F2",
  spotify: "#1DB954",
  github: "#181717",
  twitch: "#9146FF",
  gmail: "#EA4335",
  slack: "#4A154B",
  notion: "#000000",
  trello: "#0079BF",
  youtube: "#FF0000",
  "google drive": "#1FA463",
  dropbox: "#0061FE",
  steam: "#171a21"
};

export const SERVICE_ICONS: Record<string, { lib: any; name: string }> = {
  github: { lib: FontAwesome, name: "github" },
  gmail: { lib: MaterialCommunityIcons, name: "gmail" },
  discord: { lib: FontAwesome5, name: "discord" },
  trello: { lib: FontAwesome5, name: "trello" },
  spotify: { lib: FontAwesome5, name: "spotify" },
  youtube: { lib: FontAwesome5, name: "youtube" },
  "google drive": { lib: MaterialCommunityIcons, name: "google-drive" },
  notion: { lib: MaterialCommunityIcons, name: "notebook-edit-outline" },
  dropbox: { lib: FontAwesome, name: "dropbox" },
  steam: { lib: FontAwesome5, name: "steam" }
};

/**
 * Returns the brand color for a service, or the primary theme color if unknown.
 * Must be used within a React component or hook.
 */
export function useServiceColor(serviceName: string) {
  const primaryColor = useThemeColor({}, "primary");
  if (!serviceName) return primaryColor;
  return BRAND_COLORS[serviceName.toLowerCase()] || primaryColor;
}

/**
 * Helper to get the first letter of a service name safely.
 */
export function getServiceInitial(name?: string) {
  return name ? name[0].toUpperCase() : "?";
}
