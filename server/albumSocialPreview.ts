export type AlbumSocialPreview = {
  title: string;
  slug: string;
  albumDate: string;
  description?: string | null;
  coverUrl?: string | null;
  media?: Array<{ thumbnailUrl?: string | null; mediaUrl?: string }>;
};

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;" })[character] || character);
const absoluteUrl = (value: string, origin: string) => new URL(value, origin).toString();

export function createAlbumSocialPreviewHtml(album: AlbumSocialPreview, origin: string) {
  const canonicalUrl = absoluteUrl(`/albums/${encodeURIComponent(album.slug)}`, origin);
  const imageSource = album.coverUrl || album.media?.[0]?.thumbnailUrl || album.media?.[0]?.mediaUrl;
  const imageUrl = imageSource ? absoluteUrl(imageSource, origin) : undefined;
  const title = album.title.trim() || "ألبوم العقيق";
  const description = album.description?.trim() || `ألبوم العقيق · ${album.albumDate}`;
  const imageTags = imageUrl ? `<meta property="og:image" content="${escapeHtml(imageUrl)}" /><meta name="twitter:image" content="${escapeHtml(imageUrl)}" />` : "";
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="UTF-8" /><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}" /><meta property="og:type" content="website" /><meta property="og:title" content="${escapeHtml(title)}" /><meta property="og:description" content="${escapeHtml(description)}" /><meta property="og:url" content="${escapeHtml(canonicalUrl)}" /><meta property="og:site_name" content="ألبوم العقيق" />${imageTags}<meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content="${escapeHtml(title)}" /><meta name="twitter:description" content="${escapeHtml(description)}" /></head><body><a href="${escapeHtml(canonicalUrl)}">${escapeHtml(title)}</a></body></html>`;
}
