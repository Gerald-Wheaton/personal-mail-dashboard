"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_THEME, type ThemeId } from "@/lib/themes";

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);

  // On mount, restore theme from localStorage and apply to <html>
  useEffect(() => {
    const stored = localStorage.getItem("color-theme") as ThemeId | null;
    const active = stored ?? DEFAULT_THEME;
    setThemeState(active);
    document.documentElement.setAttribute("data-theme", active);
  }, []);

  function setTheme(next: ThemeId) {
    setThemeState(next);
    localStorage.setItem("color-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
