import type { Config } from "tailwindcss";
// @ts-expect-error - NativeWind types are currently not fully compatible with strict ESM import
import nativewindPreset from "nativewind/preset";

const config: Config = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [nativewindPreset],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)"
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)"
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)"
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)"
        },
        border: "var(--border)",
        input: "var(--input)"
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      }
    }
  },
  plugins: []
} satisfies Config;

export default config;
