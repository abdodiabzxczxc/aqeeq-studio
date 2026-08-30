export type JournalSocialPreviewIssue = {
  title: string;
  slug: string;
  issueDate: string;
  seasonLabel?: string | null;
  description?: string | null;
  coverUrl?: string | null;
  pages?: Array<{ imageUrl: string }>;
};

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "'": "&#39;",
  "\"": "&quot;",
})[character] || character);

const absoluteUrl = (value: string, origin: string) => new URL(value, origin).toString();

export const isJournalSocialCrawler = (userAgent: string) => /facebookexternalhit|facebot|twitterbot|whatsapp|telegrambot|linkedinbot|slackbot|discordbot|googlebot/i.test(userAgent);

export function createJournalSocialPreviewHtml(issue: JournalSocialPreviewIssue, origin: string) {
  const canonicalUrl = absoluteUrl(`/journal/issue/${encodeURIComponent(issue.slug)}`, origin);
  const imageSource = issue.coverUrl || issue.pages?.[0]?.imageUrl;
  const imageUrl = imageSource ? absoluteUrl(imageSource, origin) : undefined;
  const description = issue.description?.trim() || `${issue.seasonLabel || "مجلة العقيق"} · ${issue.issueDate}`;
  const title = issue.title.trim() || "مجلة العقيق";
  const imageTags = imageUrl ? `<meta property="og:image" content="${escapeHtml(imageUrl)}" /><meta name="twitter:image" content="${escapeHtml(imageUrl)}" />` : "";

  return `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:site_name" content="مجلة العقيق" />
    ${imageTags}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
  </head>
  <body><a href="${escapeHtml(canonicalUrl)}">${escapeHtml(title)}</a></body>
</html>`;
}
