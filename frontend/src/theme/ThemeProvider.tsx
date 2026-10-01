import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useTenant } from "@/tenant/TenantContext";

interface ThemeContextValue {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  mode: "light" | "dark";
  setMode: (mode: "light" | "dark") => void;
}

const defaultTheme: ThemeContextValue = {
  primaryColor: "#14532d",
  secondaryColor: "#d9a441",
  accentColor: "#d9a441",
  mode: "light",
  setMode: () => undefined,
};

const ThemeContext = createContext<ThemeContextValue>(defaultTheme);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { currentTenant } = useTenant();
  const [mode, setModeState] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return window.localStorage.getItem("simba-theme-mode") === "dark" ? "dark" : "light";
  });
  const theme = {
    primaryColor: currentTenant?.primaryColor ?? defaultTheme.primaryColor,
    secondaryColor: currentTenant?.accentColor ?? defaultTheme.secondaryColor,
    accentColor: currentTenant?.accentColor ?? defaultTheme.accentColor,
    mode,
  };

  const setMode = (nextMode: "light" | "dark") => {
    setModeState(nextMode);
    window.localStorage.setItem("simba-theme-mode", nextMode);
  };

  useEffect(() => {
    const root = document.documentElement;
    const dark = theme.mode === "dark";
    const primaryColor = dark ? mixHex(theme.primaryColor, "#ffffff", 0.4) : theme.primaryColor;
    const primaryForeground = readableForeground(primaryColor);
    const secondaryForeground = readableForeground(theme.secondaryColor);

    root.classList.toggle("dark", dark);
    root.style.colorScheme = theme.mode;

    root.style.setProperty("--primary", primaryColor);
    root.style.setProperty("--primary-foreground", primaryForeground);
    root.style.setProperty("--secondary", theme.secondaryColor);
    root.style.setProperty("--secondary-foreground", secondaryForeground);
    root.style.setProperty("--accent", withAlpha(primaryColor, dark ? "24" : "1a"));
    root.style.setProperty("--accent-foreground", primaryColor);

    root.style.setProperty("--background", dark ? "#0c1510" : "#f5f8f6");
    root.style.setProperty("--foreground", dark ? "#e8f1eb" : "#18251d");
    root.style.setProperty("--card", dark ? "#111f17" : "#ffffff");
    root.style.setProperty("--card-foreground", dark ? "#e8f1eb" : "#18251d");
    root.style.setProperty("--popover", dark ? "#14231a" : "#ffffff");
    root.style.setProperty("--popover-foreground", dark ? "#e8f1eb" : "#18251d");
    root.style.setProperty("--muted", dark ? "#1a2b20" : "#edf3ef");
    root.style.setProperty("--muted-foreground", dark ? "#a8b8ad" : "#52645a");
    root.style.setProperty("--border", dark ? "#2a4032" : "#d8e4dc");
    root.style.setProperty("--input", dark ? "#17251d" : "#edf3ef");
    root.style.setProperty("--ring", primaryColor);

    root.style.setProperty("--sidebar", dark ? "#0e1a13" : "#f5f8f6");
    root.style.setProperty("--sidebar-foreground", dark ? "#e8f1eb" : "#18251d");
    root.style.setProperty("--sidebar-primary", primaryColor);
    root.style.setProperty("--sidebar-primary-foreground", primaryForeground);
    root.style.setProperty("--sidebar-accent", withAlpha(primaryColor, dark ? "24" : "14"));
    root.style.setProperty("--sidebar-accent-foreground", primaryColor);
    root.style.setProperty("--sidebar-border", dark ? "#263a2d" : "#d8e4dc");
    root.style.setProperty("--sidebar-ring", primaryColor);

    root.style.setProperty("--chart-1", primaryColor);
    root.style.setProperty("--chart-2", theme.secondaryColor);
    root.style.setProperty("--chart-3", theme.accentColor);
    root.style.setProperty("--chart-4", withAlpha(primaryColor, "b3"));
    root.style.setProperty("--chart-5", withAlpha(theme.secondaryColor, "b3"));

    root.style.setProperty("--success", dark ? "#4ade80" : "#16a34a");
    root.style.setProperty("--success-foreground", dark ? "#0c1510" : "#ffffff");
    root.style.setProperty("--warning", theme.secondaryColor);
    root.style.setProperty("--warning-foreground", secondaryForeground);
    root.style.setProperty("--info", primaryColor);
    root.style.setProperty("--info-foreground", primaryForeground);
    root.style.setProperty("--destructive", "#dc2626");
    root.style.setProperty("--destructive-foreground", "#ffffff");

    document.body.style.background = "var(--background)";
    document.body.style.backgroundImage =
      "radial-gradient(circle at top left, color-mix(in srgb, var(--primary) 10%, transparent), transparent 42%), radial-gradient(circle at top right, color-mix(in srgb, var(--secondary) 8%, transparent), transparent 34%)";
    document.body.style.color = "var(--foreground)";
    document.body.style.borderColor = "var(--border)";
    document.body.style.transition = "background-color 150ms ease, color 150ms ease";
  }, [theme.accentColor, theme.mode, theme.primaryColor, theme.secondaryColor]);

  return <ThemeContext.Provider value={{ ...theme, setMode }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

function readableForeground(hex: string) {
  const value = hex.replace("#", "");
  const normalized = value.length === 3 ? value.split("").map((part) => part + part).join("") : value;
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  const luminance = [red, green, blue]
    .map((channel) => {
      const value = channel / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    })
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
  const whiteContrast = 1.05 / (luminance + 0.05);
  const darkContrast = (luminance + 0.05) / 0.05;
  return darkContrast >= whiteContrast ? "#102017" : "#ffffff";
}

function mixHex(hex: string, mixWith: string, amount: number) {
  const color = hex.replace("#", "");
  const target = mixWith.replace("#", "");
  const normalized = color.length === 3 ? color.split("").map((part) => part + part).join("") : color;
  return `#${[0, 2, 4]
    .map((index) => {
      const channel = Number.parseInt(normalized.slice(index, index + 2), 16);
      const targetChannel = Number.parseInt(target.slice(index, index + 2), 16);
      return Math.round(channel + (targetChannel - channel) * amount).toString(16).padStart(2, "0");
    })
    .join("")}`;
}

function withAlpha(hex: string, alpha: string) {
  const normalized = hex.replace("#", "");
  const expanded = normalized.length === 3
    ? normalized.split("").map((part) => part + part).join("")
    : normalized;
  return `#${expanded}${alpha}`;
}