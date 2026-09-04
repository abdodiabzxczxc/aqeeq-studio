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

function applyThemeClasses(theme: AqeeqStudioTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.aqeeqTheme = theme;
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
    document.body.classList.add("dark");
    document.body.classList.remove("light");
  } else {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
    document.body.classList.remove("dark");
    document.body.classList.add("light");
  }
}

export function setAqeeqStudioTheme(theme: AqeeqStudioTheme) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey, theme);
  applyThemeClasses(theme);
  window.dispatchEvent(new Event(eventName));
}

export function useAqeeqStudioTheme() {
  const [theme, setTheme] = useState<AqeeqStudioTheme>(() => getAqeeqStudioTheme());
  useEffect(() => {
    const sync = () => {
      const next = getAqeeqStudioTheme();
      applyThemeClasses(next);
      setTheme(next);
    };
    sync();
    window.addEventListener(eventName, sync);
    return () => window.removeEventListener(eventName, sync);
  }, []);
  return { theme, setTheme: (next: AqeeqStudioTheme) => setAqeeqStudioTheme(next), toggleTheme: () => setAqeeqStudioTheme(theme === "dark" ? "light" : "dark") };
}
