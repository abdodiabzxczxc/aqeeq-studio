import { useEffect, useState } from "react";

export type AqeeqStudioTheme = "dark" | "light";
const storageKey = "aqeeq-studio-theme";
const eventName = "aqeeq-studio-theme-change";

export function getAqeeqThemeLogoFilter(theme: AqeeqStudioTheme) {
  return theme === "dark" ? "brightness-0 invert" : "";
}

export function getAqeeqStudioTheme(): AqeeqStudioTheme {
  if (typeof window === "undefined") return "dark";
  return window.localStorage.getItem(storageKey) === "light" ? "light" : "dark";
}

export function setAqeeqStudioTheme(theme: AqeeqStudioTheme) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey, theme);
  document.documentElement.dataset.aqeeqTheme = theme;
  window.dispatchEvent(new Event(eventName));
}

export function useAqeeqStudioTheme() {
  const [theme, setTheme] = useState<AqeeqStudioTheme>(() => getAqeeqStudioTheme());
  useEffect(() => {
    const sync = () => {
      const next = getAqeeqStudioTheme();
      document.documentElement.dataset.aqeeqTheme = next;
      setTheme(next);
    };
    sync();
    window.addEventListener(eventName, sync);
    return () => window.removeEventListener(eventName, sync);
  }, []);
  return { theme, setTheme: (next: AqeeqStudioTheme) => setAqeeqStudioTheme(next), toggleTheme: () => setAqeeqStudioTheme(theme === "dark" ? "light" : "dark") };
}
