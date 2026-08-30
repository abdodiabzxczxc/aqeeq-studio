export const PROJECT_PALETTE = [
  { label: "ذهبي", value: "#e5b84f" },
  { label: "أسود", value: "#000000" },
  { label: "عاجي", value: "#ebe5d6" },
  { label: "أبيض", value: "#ffffff" },
] as const;

export function suggestedTextColor(background?: string | null) {
  const value = (background || "").toLowerCase();
  const isLight = /#(?:fff(?:fff)?|e5b84f|ebe5d6|f[0-9a-f]{5}|d[0-9a-f]{5})\b/.test(value);
  return isLight ? "#000000" : "#ffffff";
}
