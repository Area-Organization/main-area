import React from "react";
import { ThemedText } from "@/components/themed-text";
import { SERVICE_ICONS, getServiceInitial } from "@/lib/service-utils";

interface ServiceIconProps {
  serviceName: string;
  size?: number;
  color?: string;
}

export function ServiceIcon({ serviceName, size = 24, color = "#000" }: ServiceIconProps) {
  const normalizedName = serviceName?.toLowerCase();
  const iconConfig = SERVICE_ICONS[normalizedName];

  if (iconConfig) {
    const IconLib = iconConfig.lib;
    return <IconLib name={iconConfig.name} size={size} color={color} />;
  }

  // Fallback to text if no icon found
  return (
    <ThemedText style={{ fontSize: size * 0.8, fontWeight: "900", color: color }}>
      {getServiceInitial(serviceName)}
    </ThemedText>
  );
}
