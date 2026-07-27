"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

export type ThemeMode = "dark" | "light";

type ThemeContextValue = {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
};

const STORAGE_KEY = "conddo-theme-mode";

const ThemeContext = createContext<ThemeContextValue>({
  mode: "dark",
  toggle: () => {},
  setMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

/** Reads the persisted preference (or dark default) and syncs
 *  \`data-mode\` on <html> — that attribute drives the CSS variable
 *  overrides in globals.css (scoped to the .app-shell element).
 *
 *  Also stores to localStorage so the choice survives page reloads. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  // Lazy initializer — reads localStorage synchronously so the first
  // render already has the correct value. Avoids the dark→light flicker
  // that a useEffect-based read would cause.
  const [mode, setModeState] = useState<ThemeMode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark") return stored;
    } catch {
      /* localStorage unavailable */
    }
    return "dark";
  });

  // Sync the data-mode attribute to <html> whenever mode changes.
  useEffect(() => {
    document.documentElement.setAttribute("data-mode", mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* ignore quota / private-browsing errors */
    }
  }, [mode]);

  const toggle = useCallback(() => {
    setModeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, toggle, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
