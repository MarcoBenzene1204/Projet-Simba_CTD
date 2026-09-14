import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useTenant } from "@/tenant/TenantContext";

interface ThemeContextValue {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

const defaultTheme: ThemeContextValue = {
  primaryColor: "#14532d",
  secondaryColor: "#d9a441",
  accentColor: "#d9a441",
};

const ThemeContext = createContext<ThemeContextValue>(defaultTheme);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { currentTenant } = useTenant();
  const theme = {
    primaryColor: currentTenant?.primaryColor ?? defaultTheme.primaryColor,
    secondaryColor: currentTenant?.accentColor ?? defaultTheme.secondaryColor,
    accentColor: currentTenant?.accentColor ?? defaultTheme.accentColor,
  };

  useEffect(() => {
    const root = document.documentElement;
    const primaryForeground = readableForeground(theme.primaryColor);
    const secondaryForeground = readableForeground(theme.secondaryColor);

    root.style.setProperty("--primary", theme.primaryColor);
    root.style.setProperty("--primary-foreground", primaryForeground);
    root.style.setProperty("--secondary", theme.secondaryColor);
    root.style.setProperty("--secondary-foreground", secondaryForeground);
    root.style.setProperty("--accent", withAlpha(theme.primaryColor, "1a"));
    root.style.setProperty("--accent-foreground", theme.primaryColor);

    root.style.setProperty("--background", "#f8fafc");
    root.style.setProperty("--foreground", "#111827");
    root.style.setProperty("--card", "#ffffff");
    root.style.setProperty("--card-foreground", "#111827");
    root.style.setProperty("--muted", "#f3f4f6");
    root.style.setProperty("--muted-foreground", "#4b5563");
    root.style.setProperty("--border", withAlpha(theme.primaryColor, "22"));
    root.style.setProperty("--input", "#f3f4f6");
    root.style.setProperty("--ring", theme.primaryColor);

    root.style.setProperty("--sidebar", "#f8fafc");
    root.style.setProperty("--sidebar-foreground", "#111827");
    root.style.setProperty("--sidebar-primary", theme.primaryColor);
    root.style.setProperty("--sidebar-primary-foreground", primaryForeground);
    root.style.setProperty("--sidebar-accent", withAlpha(theme.primaryColor, "14"));
    root.style.setProperty("--sidebar-accent-foreground", theme.primaryColor);
    root.style.setProperty("--sidebar-border", withAlpha(theme.primaryColor, "22"));
    root.style.setProperty("--sidebar-ring", theme.primaryColor);

    root.style.setProperty("--chart-1", theme.primaryColor);
    root.style.setProperty("--chart-2", theme.secondaryColor);
    root.style.setProperty("--chart-3", theme.accentColor);
    root.style.setProperty("--chart-4", withAlpha(theme.primaryColor, "b3"));
    root.style.setProperty("--chart-5", withAlpha(theme.secondaryColor, "b3"));

    root.style.setProperty("--success", "#16a34a");
    root.style.setProperty("--success-foreground", "#ffffff");
    root.style.setProperty("--warning", theme.secondaryColor);
    root.style.setProperty("--warning-foreground", secondaryForeground);
    root.style.setProperty("--info", theme.primaryColor);
    root.style.setProperty("--info-foreground", primaryForeground);
    root.style.setProperty("--destructive", "#dc2626");
    root.style.setProperty("--destructive-foreground", "#ffffff");

    document.body.style.background = "var(--background)";
    document.body.style.color = "var(--foreground)";
    document.body.style.borderColor = "var(--border)";
    document.body.style.transition = "background-color 150ms ease, color 150ms ease";
  }, [theme.accentColor, theme.primaryColor, theme.secondaryColor]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
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
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
  return luminance > 0.62 ? "#172016" : "#ffffff";
}

function withAlpha(hex: string, alpha: string) {
  const normalized = hex.replace("#", "");
  const expanded = normalized.length === 3
    ? normalized.split("").map((part) => part + part).join("")
    : normalized;
  return `#${expanded}${alpha}`;
}