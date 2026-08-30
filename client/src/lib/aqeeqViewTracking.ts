const VIEWER_KEY_STORAGE = "aqeeq-content-viewer-key";

function createViewerKey() {
  const random = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 18)}`;
  return `aqv-${random}`.slice(0, 64);
}

export function getAqeeqViewerKey() {
  if (typeof window === "undefined") return "aqv-server-render";
  const existing = window.localStorage.getItem(VIEWER_KEY_STORAGE);
  if (existing && existing.length >= 12) return existing;
  const viewerKey = createViewerKey();
  window.localStorage.setItem(VIEWER_KEY_STORAGE, viewerKey);
  return viewerKey;
}
