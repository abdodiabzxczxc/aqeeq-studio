export type AqeeqSocialPostSource = "instagram" | "youtube";

export type AqeeqSocialPost = {
  source: AqeeqSocialPostSource;
  sourceId: string;
  url: string;
  label: string;
  mimeType: string;
  mediaType: "image" | "video";
};

export function parseAqeeqSocialPostUrl(source: AqeeqSocialPostSource, value: string): AqeeqSocialPost | null {
  try {
    const parsed = new URL(value.trim());
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
    if (source === "instagram") {
      if (hostname !== "instagram.com") return null;
      const match = parsed.pathname.match(/^\/(p|reel|tv)\/([A-Za-z0-9_-]+)\/?/i);
      if (!match) return null;
      const kind = match[1].toLowerCase();
      const shortCode = match[2];
      return { source, sourceId: `instagram-${shortCode}`, url: `https://www.instagram.com/${kind}/${shortCode}/`, label: "منشور Instagram", mimeType: "application/x-instagram-post", mediaType: kind === "reel" ? "video" : "image" };
    }
    let videoId: string | null = null;
    if (hostname === "youtu.be") videoId = parsed.pathname.split("/").filter(Boolean)[0] || null;
    if (["youtube.com", "m.youtube.com", "music.youtube.com"].includes(hostname)) {
      videoId = parsed.searchParams.get("v") || parsed.pathname.match(/^\/(?:shorts|embed|live)\/([A-Za-z0-9_-]+)/i)?.[1] || null;
    }
    if (!videoId || !/^[A-Za-z0-9_-]{6,}$/.test(videoId)) return null;
    return { source, sourceId: `youtube-${videoId}`, url: `https://www.youtube.com/watch?v=${videoId}`, label: "فيديو YouTube", mimeType: "application/x-youtube-video", mediaType: "video" };
  } catch {
    return null;
  }
}

export function getAqeeqYouTubeEmbedUrl(value: string) {
  const post = parseAqeeqSocialPostUrl("youtube", value);
  if (!post) return null;
  return `https://www.youtube-nocookie.com/embed/${post.sourceId.replace("youtube-", "")}?rel=0&playsinline=1`;
}
