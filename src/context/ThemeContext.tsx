import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Theme, ThemeDensity } from "../types";

interface ThemeContextValue {
  theme: Theme;
  setDensity: (density: ThemeDensity) => void;
  setAccent: (accent: string) => void;
}

const defaultTheme: Theme = {
  mode: "dark",
  density: "normal",
  accent: "#6366f1",
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const DENSITY_VARS: Record<ThemeDensity, Record<string, string>> = {
  compact: {
    "--widget-padding": "0.625rem",
    "--widget-gap": "0.5rem",
    "--grid-gap": "0.75rem",
    "--font-scale": "0.9",
  },
  normal: {
    "--widget-padding": "1rem",
    "--widget-gap": "0.75rem",
    "--grid-gap": "1rem",
    "--font-scale": "1",
  },
  spaced: {
    "--widget-padding": "1.5rem",
    "--widget-gap": "1rem",
    "--grid-gap": "1.5rem",
    "--font-scale": "1.05",
  },
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("orbitdash-theme");
    const parsed = stored ? JSON.parse(stored) : defaultTheme;
    return { ...defaultTheme, ...parsed, mode: "dark" };
  });

  useEffect(() => {
    localStorage.setItem("orbitdash-theme", JSON.stringify(theme));

    const root = document.documentElement;
    root.setAttribute("data-theme", theme.mode);
    root.setAttribute("data-density", theme.density);
    root.style.setProperty("--accent", theme.accent);
    root.style.setProperty("--accent-rgb", hexToRgb(theme.accent));

    const densityVars = DENSITY_VARS[theme.density];
    Object.entries(densityVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [theme]);

  const setDensity = (density: ThemeDensity) => setTheme((t) => ({ ...t, density }));
  const setAccent = (accent: string) => setTheme((t) => ({ ...t, accent }));

  return (
    <ThemeContext.Provider value={{ theme, setDensity, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "99, 102, 241";
}
