import { useThemeColor } from "@/hooks/use-theme-color";

export const BRAND_COLORS: Record<string, string> = {
  discord: "#5865F2",
  spotify: "#1DB954",
  github: "#181717",
  twitch: "#9146FF",
  gmail: "#e94538",
  slack: "#4A154B",
  notion: "#000000",
  trello: "#0079BF"
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
