import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "skillflow-theme";

function readTheme(): Theme {
  if (typeof document !== "undefined" && document.documentElement.dataset.theme === "dark") {
    return "dark";
  }

  if (typeof window !== "undefined" && window.localStorage.getItem(THEME_STORAGE_KEY) === "dark") {
    return "dark";
  }

  return "light";
}

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark")),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}
