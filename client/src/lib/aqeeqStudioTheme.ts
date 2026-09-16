import { useEffect, useState } from "react";

export type AqeeqStudioTheme = "dark" | "light";
const storageKey = "aqeeq-studio-theme";
const eventName = "aqeeq-studio-theme-change";

export function getAqeeqThemeLogoFilter(theme: AqeeqStudioTheme) {
  return theme === "dark" ? "brightness-0 invert" : "";
}

export function parseColorLuminance(color: string): number | null {
  const c = color.trim().toLowerCase();
  if (c === "black" || c === "#000" || c === "#000000") return 0;
  if (c === "white" || c === "#fff" || c === "#ffffff") return 1;
  if (c.startsWith("rgb")) {
    const parts = c.match(/[\d.]+/g);
    if (parts && parts.length >= 3) {
      const r = parseFloat(parts[0]);
      const g = parseFloat(parts[1]);
      const b = parseFloat(parts[2]);
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    }
  }
  if (c.startsWith("#")) {
    const hex = c.replace("#", "");
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    } else if (hex.length >= 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    }
  }
  return null;
}

export function isTooDarkForDarkTheme(color: string): boolean {
  const c = color.trim().toLowerCase();
  if (c === "black" || c === "#000" || c === "#000000" || c === "rgb(0, 0, 0)" || c === "rgb(0,0,0)") return true;
  if (c.startsWith("oklch(")) return true;
  const lum = parseColorLuminance(c);
  if (lum !== null && lum < 0.28) return true;
  return false;
}

export function isTooLightForLightTheme(color: string): boolean {
  const c = color.trim().toLowerCase();
  if (c === "white" || c === "#fff" || c === "#ffffff" || c === "rgb(255, 255, 255)" || c === "rgb(255,255,255)") return true;
  if (c.startsWith("oklch(")) return true;
  const lum = parseColorLuminance(c);
  if (lum !== null && lum > 0.88) return true;
  return false;
}

export function resolveThemeSafeTextColor(color: string | null | undefined, isDarkTheme: boolean): string | undefined {
  if (!color) return undefined;
  const trimmed = color.trim();
  if (!trimmed) return undefined;
  if (trimmed.toLowerCase().startsWith("oklch(")) return undefined;
  if (isDarkTheme && isTooDarkForDarkTheme(trimmed)) return undefined;
  if (!isDarkTheme && isTooLightForLightTheme(trimmed)) return undefined;
  return trimmed;
}

export function getAqeeqStudioTheme(): AqeeqStudioTheme {
  if (typeof window === "undefined") return "dark";
  const urlParam = new URLSearchParams(window.location.search).get("theme");
  if (urlParam === "light" || urlParam === "dark") return urlParam;
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
