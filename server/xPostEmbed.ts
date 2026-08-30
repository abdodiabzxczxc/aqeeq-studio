const X_POST_URL = /^(?:https?:\/\/)?(?:www\.)?(?:x|twitter)\.com\/[^/]+\/status\/\d+/i;

export function normalizeAqeeqXPostUrl(value: string) {
  if (!X_POST_URL.test(value.trim())) return null;
  try {
    const parsed = new URL(value.trim());
    const path = parsed.pathname.match(/^\/([^/]+)\/status\/(\d+)/i);
    if (!path) return null;
    return `https://x.com/${path[1]}/status/${path[2]}`;
  } catch {
    return null;
  }
}

export function getAqeeqXPostOembedUrl(value: string) {
  const postUrl = normalizeAqeeqXPostUrl(value);
  if (!postUrl) return null;
  const params = new URLSearchParams({ url: postUrl, theme: "dark", lang: "ar", omit_script: "1", hide_thread: "true", dnt: "true", maxwidth: "520" });
  return `https://publish.x.com/oembed?${params.toString()}`;
}

const xEmbedCache = new Map<string, { data: { html: string; authorName: string | null; authorUrl: string | null }; cachedAt: number }>();
const X_CACHE_TTL = 1000 * 60 * 60 * 12; // 12 hours

export async function getAqeeqXPostEmbed(value: string) {
  const normalized = normalizeAqeeqXPostUrl(value) || value;
  const cached = xEmbedCache.get(normalized);
  if (cached && Date.now() - cached.cachedAt < X_CACHE_TTL) {
    return cached.data;
  }

  const endpoint = getAqeeqXPostOembedUrl(value);
  if (!endpoint) throw new Error("ضع رابط منشور X صحيحًا يحتوي على status");
  const response = await fetch(endpoint, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error("تعذر جلب معاينة منشور X الآن");
  const payload = await response.json() as { html?: unknown; author_name?: unknown; author_url?: unknown };
  if (typeof payload.html !== "string" || !payload.html.includes("twitter-tweet")) throw new Error("لا تتوفر معاينة لهذا المنشور من X");
  const result = {
    html: payload.html.replace(/<script[\s\S]*?<\/script>/gi, ""),
    authorName: typeof payload.author_name === "string" ? payload.author_name : null,
    authorUrl: typeof payload.author_url === "string" ? payload.author_url : null,
  };
  xEmbedCache.set(normalized, { data: result, cachedAt: Date.now() });
  return result;
}
