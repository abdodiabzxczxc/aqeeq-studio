/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║          Aqeeq Studio — Unified Media Utilities                     ║
 * ║  Single source of truth for Drive, YouTube, and Social media URLs   ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

// ─── Google Drive ────────────────────────────────────────────────────────────

/**
 * Extracts a Drive file ID from any known Google Drive URL format.
 */
export function extractDriveFileId(url: string | null | undefined): string | null {
  if (!url) return null;
  return (
    url.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/)?.[1] ||
    url.match(/[?&]id=([A-Za-z0-9_-]+)/)?.[1] ||
    url.match(/lh3\.googleusercontent\.com\/d\/([A-Za-z0-9_-]+)/)?.[1] ||
    url.match(/drive\.usercontent\.google\.com\/download\?id=([A-Za-z0-9_-]+)/)?.[1] ||
    null
  );
}

/**
 * Converts any Google Drive URL → our local proxy URL (fast, cached, CORS-safe).
 * Returns null if no file ID can be extracted (pass-through for non-Drive URLs).
 */
export function directDriveImage(url: string | null | undefined): string | null {
  const id = extractDriveFileId(url);
  if (!id) return null;
  return `/api/drive-proxy/${id}`;
}

/**
 * Converts a Drive URL to a video proxy URL (supports range requests).
 */
export function directDriveVideo(url: string | null | undefined): string | null {
  const id = extractDriveFileId(url);
  if (!id) return null;
  return `/api/drive-video-proxy/${id}`;
}

/**
 * Converts a Drive URL to an audio proxy URL.
 */
export function directDriveAudio(url: string | null | undefined): string | null {
  const id = extractDriveFileId(url);
  if (!id) return null;
  return `/api/drive-audio-proxy/${id}`;
}

// ─── YouTube ─────────────────────────────────────────────────────────────────

/**
 * Extracts a YouTube video ID from any YouTube URL format.
 */
export function extractYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const m =
    url.match(/(?:youtu\.be\/)([A-Za-z0-9_-]{11})/) ||
    url.match(/[?&]v=([A-Za-z0-9_-]{11})/) ||
    url.match(/\/(?:embed|shorts|live|v)\/([A-Za-z0-9_-]{11})/);
  return m?.[1] || null;
}

/**
 * Returns the best available YouTube thumbnail URL.
 * Tries maxresdefault (HD) → sddefault → hqdefault (fallback).
 * Uses an <img> onError chain client-side via `ytThumbSrc()`.
 */
export function ytThumbUrl(
  url: string | null | undefined,
  quality: "maxres" | "sd" | "hq" = "maxres"
): string | null {
  const id = extractYouTubeId(url);
  if (!id) return null;
  const qualityMap = {
    maxres: "maxresdefault",
    sd: "sddefault",
    hq: "hqdefault",
  };
  return `https://img.youtube.com/vi/${id}/${qualityMap[quality]}.jpg`;
}

/**
 * Returns a YouTube nocookie embed URL.
 */
export function ytEmbedUrl(url: string | null | undefined): string | null {
  const id = extractYouTubeId(url);
  if (!id) return null;
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1&modestbranding=1`;
}

// ─── Smart Image Component Helper ─────────────────────────────────────────────

/**
 * Resolves any media URL intelligently:
 * - Drive URL → proxy
 * - YouTube URL → HD thumbnail
 * - Other → as-is
 */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const driveUrl = directDriveImage(url);
  if (driveUrl) return driveUrl;
  const ytId = extractYouTubeId(url);
  if (ytId) return `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
  return url;
}

// ─── YouTube Thumbnail with Fallback (React hook pattern) ─────────────────────

/**
 * Returns [src, onError] for a YouTube thumbnail <img> tag.
 * Falls back through maxres → sd → hq automatically.
 */
export function useYtThumb(url: string | null | undefined): {
  src: string | null;
  onError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
} {
  const id = extractYouTubeId(url);
  if (!id) return { src: null, onError: () => {} };

  const chain = [
    `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
    `https://img.youtube.com/vi/${id}/sddefault.jpg`,
    `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
  ];

  // Track which URL is failing via data attribute
  const onError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const currentIndex = chain.indexOf(img.src);
    const next = chain[currentIndex + 1];
    if (next) img.src = next;
  };

  return { src: chain[0], onError };
}
