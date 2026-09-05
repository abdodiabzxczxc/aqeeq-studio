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
  const imageSource = album.coverUrl || album.media?.[0]?.thumbnailUrl || album.media?.[0]?.mediaUrl || "/og-preview.png";
  const imageUrl = absoluteUrl(imageSource, origin);
  const title = album.title.trim() ? `${album.title.trim()} | مدارس العقيق` : "ألبوم العقيق";
  const description = album.description?.trim() || `ألبوم العقيق · ${album.albumDate}`;
  
  return `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="icon" type="image/png" href="${escapeHtml(absoluteUrl("/favicon.png", origin))}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="مدارس العقيق الأهلية والدولية" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:image" content="${escapeHtml(imageUrl)}" />
    <meta property="og:image:secure_url" content="${escapeHtml(imageUrl)}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
  </head>
  <body><a href="${escapeHtml(canonicalUrl)}">${escapeHtml(title)}</a></body>
</html>`;
}

export function createSiteSocialPreviewHtml(
  origin: string,
  targetPath: string = "/",
  customConfig?: { ogTitle?: string; ogDescription?: string; ogImageUrl?: string }
) {
  const canonicalUrl = absoluteUrl(targetPath, origin);
  const rawImage = customConfig?.ogImageUrl?.trim() || "/og-preview.png";
  const imageUrl = rawImage.startsWith("data:")
    ? absoluteUrl("/api/og-image.png", origin)
    : absoluteUrl(rawImage, origin);
  const title = customConfig?.ogTitle?.trim() || "مدارس العقيق الأهلية والدولية بالمدينة المنورة";
  const description = customConfig?.ogDescription?.trim() || "الريادة في التعليم وصناعة المستقبل منذ عام 1994";

  return `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="icon" type="image/png" href="${escapeHtml(absoluteUrl("/favicon.png", origin))}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="مدارس العقيق الأهلية والدولية" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:image" content="${escapeHtml(imageUrl)}" />
    <meta property="og:image:secure_url" content="${escapeHtml(imageUrl)}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
  </head>
  <body><a href="${escapeHtml(canonicalUrl)}">${escapeHtml(title)}</a></body>
</html>`;
}
