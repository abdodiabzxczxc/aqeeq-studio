import type { AqeeqStudioTheme } from "./aqeeqStudioTheme";

export function getAqeeqAlbumSpreadWatermark(input: { url: string | null; opacity: number | null | undefined; tint: string | null | undefined; theme: AqeeqStudioTheme }) {
  return {
    url: input.url,
    scale: 140,
    opacity: Math.max(10, input.opacity || 12),
    position: "bottom-left",
    cropLeft: true,
    tint: input.theme === "dark" ? "#ffffff" : input.tint || "#d6b96a",
  };
}
