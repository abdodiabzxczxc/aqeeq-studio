import type { Request, Response, NextFunction } from "express";
import {
  getAqeeqAlbumBySlug,
  listAqeeqAlbums,
  getSchoolNewsIssueBySlug,
  listSchoolNewsIssues,
  getSchoolNewsMonthlyBook,
  getAqeeqShowcaseBySlug,
  listAqeeqShowcases,
  getCustomPageBySlug,
  listVisualElementOverrides,
  getSiteOrchestration,
} from "./db";
import { getArticleBySlug, getPublishedArticles } from "./articlesDb";
import { getPodcastBySlug, getPodcasts } from "./podcastDb";

export const isSocialCrawler = (userAgent: string): boolean => {
  if (!userAgent) return false;
  return /whatsapp|facebookexternalhit|facebot|twitterbot|telegrambot|linkedinbot|slackbot|discordbot|googlebot|bingbot|applebot|skypeuripreview|embedly|quora link preview|showyoubot|outbrain|pinterest|vkshare|w3c_validator/i.test(
    userAgent
  );
};

export function toDriveProxyUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("/api/drive-proxy/")) return url;
  const match = url.match(/\/file\/d\/([A-Za-z0-9_-]+)/) || url.match(/[?&]id=([A-Za-z0-9_-]+)/);
  return match ? `/api/drive-proxy/${match[1]}` : url;
}

export function resolveSocialImageUrl(source: string | null | undefined, origin: string): string {
  if (!source || !source.trim()) {
    return new URL("/api/og-image.png", origin).toString();
  }
  const clean = source.trim();
  if (clean.startsWith("data:")) {
    return new URL("/api/og-image.png", origin).toString();
  }
  const proxied = toDriveProxyUrl(clean);
  try {
    return new URL(proxied, origin).toString();
  } catch {
    return new URL("/og-preview.png", origin).toString();
  }
}

async function getVisualImageOverride(pagePath: string): Promise<string | undefined> {
  try {
    const overrides = await listVisualElementOverrides(pagePath, "published");
    const img = overrides.find(
      (r: any) => r.mediaUrl && typeof r.mediaUrl === "string" && r.mediaUrl.trim() && !r.isHidden
    );
    return img ? (img as any).mediaUrl.trim() : undefined;
  } catch {
    return undefined;
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] || character);
}

export type SocialPreviewData = {
  title: string;
  description: string;
  imageUrl: string;
  canonicalUrl: string;
  ogType?: "website" | "article" | "music.song" | "video.other";
};

export function renderSocialHtml(data: SocialPreviewData, origin: string): string {
  const { title, description, imageUrl, canonicalUrl, ogType = "website" } = data;
  const siteName = "مدارس العقيق الأهلية والدولية بالمدينة المنورة";
  const faviconUrl = new URL("/favicon.png", origin).toString();

  return `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="icon" type="image/png" href="${escapeHtml(faviconUrl)}" />
    <link rel="image_src" href="${escapeHtml(imageUrl)}" />
    
    <!-- Open Graph (WhatsApp, Facebook, LinkedIn, Discord) -->
    <meta property="og:type" content="${escapeHtml(ogType)}" />
    <meta property="og:site_name" content="${escapeHtml(siteName)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:image" content="${escapeHtml(imageUrl)}" />
    <meta property="og:image:secure_url" content="${escapeHtml(imageUrl)}" />
    <meta property="og:image:alt" content="${escapeHtml(title)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    
    <!-- Twitter / X -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@alaqeeqschools" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
    <meta name="twitter:image:alt" content="${escapeHtml(title)}" />
  </head>
  <body>
    <article>
      <h1><a href="${escapeHtml(canonicalUrl)}">${escapeHtml(title)}</a></h1>
      <p>${escapeHtml(description)}</p>
      <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title)}" />
    </article>
  </body>
</html>`;
}

export async function resolveSocialPreviewForPath(
  pathname: string,
  origin: string
): Promise<SocialPreviewData> {
  const cleanPath = pathname.split("?")[0].replace(/\/+$/, "") || "/";

  // 1. Single Album (/albums/:slug)
  const albumMatch = cleanPath.match(/^\/albums\/([^/]+)$/);
  if (albumMatch && albumMatch[1] !== "manage") {
    const slug = decodeURIComponent(albumMatch[1]);
    try {
      const album = await getAqeeqAlbumBySlug(slug);
      if (album) {
        const coverSource =
          album.coverUrl ||
          album.media?.[0]?.thumbnailUrl ||
          album.media?.[0]?.mediaUrl;
        const count = album.media?.length || 0;
        return {
          title: `${album.title.trim()} | ألبومات مدارس العقيق`,
          description:
            album.description?.trim() ||
            `تغطية مصورة لـ (${album.title.trim()}) بمدارس العقيق · تاريخ: ${album.albumDate} · يضم ${count} صورة وفيديو بجودة عالية.`,
          imageUrl: resolveSocialImageUrl(coverSource, origin),
          canonicalUrl: new URL(`/albums/${encodeURIComponent(album.slug)}`, origin).toString(),
          ogType: "article",
        };
      }
    } catch {}
  }

  // 2. Albums List (/albums) -> Dynamically fetches the latest published album from DB
  if (cleanPath === "/albums") {
    let latestAlbumCover: string | undefined;
    let latestAlbumTitle = "معارض وأنشطة العقيق";
    try {
      const albums = await listAqeeqAlbums("published");
      if (albums.length > 0) {
        const latest = albums[0];
        latestAlbumCover = latest.coverUrl || undefined;
        latestAlbumTitle = latest.title;
      }
    } catch {}

    return {
      title: "معارض وألبومات العقيق 📸 | ذكريات وإنجازات مصورة",
      description: `شاهد أحدث التغطيات المصورة والمعارض التفاعلية لفعاليات وإنجازات طلاب ومعلمي مدارس العقيق بالمدينة المنورة (أحدث ألبوم: ${latestAlbumTitle}).`,
      imageUrl: resolveSocialImageUrl(
        latestAlbumCover || "/themes/saudi-national-day/opt/cover_album_national.webp",
        origin
      ),
      canonicalUrl: new URL("/albums", origin).toString(),
      ogType: "website",
    };
  }

  // 3. Single Magazine Issue (/journal/issue/:slug or /journal/:slug)
  const journalIssueMatch =
    cleanPath.match(/^\/journal\/issue\/([^/]+)$/) ||
    cleanPath.match(/^\/journal\/([^/]+)$/);
  if (
    journalIssueMatch &&
    journalIssueMatch[1] !== "manage" &&
    journalIssueMatch[1] !== "archive" &&
    journalIssueMatch[1] !== "month"
  ) {
    const slug = decodeURIComponent(journalIssueMatch[1]);
    try {
      const issue = await getSchoolNewsIssueBySlug(slug);
      if (issue) {
        const coverSource = issue.coverUrl || issue.pages?.[0]?.imageUrl;
        return {
          title: `${issue.title.trim()} | مجلة العقيق المدرسية 📖`,
          description:
            issue.description?.trim() ||
            `${issue.seasonLabel || "مجلة العقيق"} · تاريخ الإصدار: ${issue.issueDate} · تصفح وقراءة إلكترونية تفاعلية لكافة صفحات العدد.`,
          imageUrl: resolveSocialImageUrl(coverSource, origin),
          canonicalUrl: new URL(`/journal/issue/${encodeURIComponent(issue.slug)}`, origin).toString(),
          ogType: "article",
        };
      }
    } catch {}
  }

  // 4. Monthly Magazine Book (/journal/month/:monthKey)
  const monthMatch = cleanPath.match(/^\/journal\/month\/([^/]+)$/);
  if (monthMatch) {
    const monthKey = decodeURIComponent(monthMatch[1]);
    try {
      const book = await getSchoolNewsMonthlyBook(monthKey);
      const coverSource = book?.issues?.[0]?.coverUrl;
      const count = book?.issues?.length || 0;
      return {
        title: `حصاد وإصدارات شهر ${monthKey} | مجلة العقيق`,
        description: `تصفح حصاد وتغطيات مدارس العقيق لشهر ${monthKey}، يضم ${count} إصداراً وتقريراً مصوراً.`,
        imageUrl: resolveSocialImageUrl(coverSource, origin),
        canonicalUrl: new URL(`/journal/month/${encodeURIComponent(monthKey)}`, origin).toString(),
        ogType: "article",
      };
    } catch {}
  }

  // 5. Journal Index & Archive (/journal, /journal/archive) -> Dynamically fetches the latest published magazine issue from DB
  if (cleanPath === "/journal" || cleanPath === "/journal/archive") {
    let latestIssueCover: string | undefined;
    let latestIssueTitle = "إصدارات العقيق";
    try {
      const issues = await listSchoolNewsIssues("published");
      if (issues.length > 0) {
        const latest = issues[0];
        latestIssueCover = latest.coverUrl || undefined;
        latestIssueTitle = latest.title;
      }
    } catch {}

    return {
      title: "مجلة العقيق المدرسية 📖 | صدى الإبداع والريادة",
      description: `تصفح أحدث وأرشيف أعداد مجلة العقيق الصادرة عن مدارس العقيق الأهلية والدولية بالمدينة المنورة بتجربة تصفح تفاعلية ومميزة (أحدث عدد: ${latestIssueTitle}).`,
      imageUrl: resolveSocialImageUrl(
        latestIssueCover || "/uploads/site-media/1/1788029592790-9f51a02b-drive-1B3LhIXBI_l4gw0RQgAI92qeuufkowJWJ-p01_f952eff9.jpg",
        origin
      ),
      canonicalUrl: new URL("/journal", origin).toString(),
      ogType: "website",
    };
  }

  // 6. Single Article (/articles/:slug)
  const articleMatch = cleanPath.match(/^\/articles\/([^/]+)$/);
  if (articleMatch && articleMatch[1] !== "manage") {
    const slug = decodeURIComponent(articleMatch[1]);
    try {
      const article = await getArticleBySlug(slug);
      if (article) {
        const cleanDesc = (article.excerpt || article.content || "")
          .replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 180);
        return {
          title: `${article.title.trim()} | مقالات العقيق ✍️`,
          description: cleanDesc
            ? `${cleanDesc}...`
            : `مقال تربوي متميز بقلم ${article.authorName} (${article.authorRole || "مدارس العقيق"}).`,
          imageUrl: resolveSocialImageUrl(article.coverUrl, origin),
          canonicalUrl: new URL(`/articles/${encodeURIComponent(article.slug)}`, origin).toString(),
          ogType: "article",
        };
      }
    } catch {}
  }

  // 7. Articles Index (/articles) -> Dynamically fetches the latest published article from DB
  if (cleanPath === "/articles") {
    let latestArticleCover: string | undefined;
    let latestArticleTitle = "رؤى وبحوث العقيق";
    try {
      const articles = await getPublishedArticles();
      if (articles.length > 0) {
        const latest = articles[0];
        latestArticleCover = latest.coverUrl || undefined;
        latestArticleTitle = latest.title;
      }
    } catch {}

    return {
      title: "مقالات ورؤى العقيق التربوية ✍️ | مدارس العقيق",
      description: `مقالات وبحوث تربوية وعلمية وثقافية لنخبة من المعلمين والقيادات والطلاب بمدارس العقيق (أحدث مقال: ${latestArticleTitle}).`,
      imageUrl: resolveSocialImageUrl(
        latestArticleCover || "/articles/is-quality-important-school-accreditation.jpg",
        origin
      ),
      canonicalUrl: new URL("/articles", origin).toString(),
      ogType: "website",
    };
  }

  // 8. Single Podcast (/atheer/:slug or /podcast/:slug)
  const podcastMatch =
    cleanPath.match(/^\/atheer\/([^/]+)$/) ||
    cleanPath.match(/^\/podcast\/([^/]+)$/);
  if (podcastMatch && podcastMatch[1] !== "manage") {
    const slug = decodeURIComponent(podcastMatch[1]);
    try {
      const podcast = await getPodcastBySlug(slug);
      if (podcast) {
        return {
          title: `${podcast.title.trim()} | أثير العقيق 🎙️`,
          description:
            podcast.description?.trim() ||
            `حلقة جديدة من بودكاست أثير العقيق المدرسي - تقديم: ${podcast.hostName || "مدارس العقيق"}.`,
          imageUrl: resolveSocialImageUrl(
            podcast.thumbnailUrl || podcast.coverUrl,
            origin
          ),
          canonicalUrl: new URL("/podcast", origin).toString(),
          ogType: "article",
        };
      }
    } catch {}
  }

  // 9. Podcast Hub (/atheer, /podcast) -> Dynamically fetches the latest podcast episode from DB
  if (cleanPath === "/atheer" || cleanPath === "/podcast") {
    let latestPodcastCover: string | undefined;
    let latestPodcastTitle = "صوت الإبداع المدرسي";
    try {
      const podcasts = await getPodcasts();
      if (podcasts.length > 0) {
        const latest = podcasts[0];
        latestPodcastCover = latest.thumbnailUrl || latest.coverUrl || undefined;
        latestPodcastTitle = latest.title;
      }
    } catch {}

    return {
      title: "أثير العقيق 🎙️ | البودكاست والإذاعة المدرسية",
      description: `صوت الإبداع والإلهام، حوارات ونشرات إذاعية يقدمها طلاب ومعلمو مدارس العقيق (أحدث حلقة: ${latestPodcastTitle}).`,
      imageUrl: resolveSocialImageUrl(
        latestPodcastCover || "/covers/cover-about.jpg",
        origin
      ),
      canonicalUrl: new URL("/podcast", origin).toString(),
      ogType: "website",
    };
  }

  // 10. Single Showcase / News (/showcase/:slug or /news/:slug)
  const showcaseMatch =
    cleanPath.match(/^\/showcase\/([^/]+)$/) ||
    cleanPath.match(/^\/news\/([^/]+)$/) ||
    cleanPath.match(/^\/offers\/([^/]+)$/);
  if (
    showcaseMatch &&
    showcaseMatch[1] !== "manage" &&
    showcaseMatch[1] !== "month"
  ) {
    const slug = decodeURIComponent(showcaseMatch[1]);
    try {
      const showcase = await getAqeeqShowcaseBySlug(slug);
      if (showcase) {
        const coverSource =
          showcase.posts?.[0]?.thumbnailUrl ||
          showcase.posts?.[0]?.mediaUrl ||
          showcase.headerLogoUrl;
        return {
          title: `${showcase.title.trim()} | أخبار وفعاليات العقيق 📢`,
          description:
            showcase.intro?.trim() ||
            showcase.posts?.[0]?.description?.trim() ||
            "تغطية خبرية خاصة من مدارس العقيق الأهلية والدولية بالمدينة المنورة.",
          imageUrl: resolveSocialImageUrl(coverSource, origin),
          canonicalUrl: new URL("/showcase", origin).toString(),
          ogType: "article",
        };
      }
    } catch {}
  }

  // 11. Showcase / News Hub (/showcase, /news, /offers) -> Dynamically fetches the latest showcase from DB
  if (
    cleanPath === "/showcase" ||
    cleanPath === "/news" ||
    cleanPath === "/offers"
  ) {
    let latestShowcaseCover: string | undefined;
    let latestShowcaseTitle = "فعاليات وإنجازات العقيق";
    try {
      const showcases = await listAqeeqShowcases("published");
      if (showcases.length > 0) {
        const latest = showcases[0];
        latestShowcaseCover = latest.coverUrl || undefined;
        latestShowcaseTitle = latest.title;
      }
    } catch {}

    return {
      title: "معرض الأخبار والفعاليات 📢 | مدارس العقيق الأهلية والدولية",
      description: `متابعة حية وشاملة لكافة فعاليات وبطولات ومعارض وإنجازات مدارس العقيق بالمدينة المنورة (أحدث تغطية: ${latestShowcaseTitle}).`,
      imageUrl: resolveSocialImageUrl(
        latestShowcaseCover || "/themes/saudi-national-day/opt/cover_showcase_national.webp",
        origin
      ),
      canonicalUrl: new URL("/showcase", origin).toString(),
      ogType: "website",
    };
  }

  // 12. Admissions & Fees (/admissions, /admission, /fees, /prices) -> Dynamically reads Visual Editor & Admin settings
  if (
    cleanPath === "/admissions" ||
    cleanPath === "/admission" ||
    cleanPath === "/fees" ||
    cleanPath === "/prices"
  ) {
    const visualOverride = await getVisualImageOverride("/admissions");

    return {
      title: "بوابة القبول والتسجيل والرسوم الدراسية 🎓 | مدارس العقيق",
      description:
        "سجل الآن في مدارس العقيق الأهلية والدولية بالمدينة المنورة للعام الدراسي الجديد. اكتشف المراحل والمسارات التعليمية وحاسبة الأقساط والخصومات الحصرية.",
      imageUrl: resolveSocialImageUrl(
        visualOverride || "/covers/cover-admissions.jpg",
        origin
      ),
      canonicalUrl: new URL("/admissions", origin).toString(),
      ogType: "website",
    };
  }

  // 13. About Us (/about) -> Dynamically reads Visual Editor & Admin Campus settings
  if (cleanPath === "/about") {
    const visualOverride = await getVisualImageOverride("/about");

    return {
      title: "عن مدارس العقيق الأهلية والدولية 🏫 | الريادة والتميز منذ 1994",
      description:
        "تعرف على مسيرة مدارس العقيق بالمدينة المنورة، رؤيتنا التعليمية، مجمعات البنين والبنات، وكوادرنا التدريسية المؤهلة.",
      imageUrl: resolveSocialImageUrl(
        visualOverride || "/covers/cover-about.jpg",
        origin
      ),
      canonicalUrl: new URL("/about", origin).toString(),
      ogType: "website",
    };
  }

  // 14. Accreditations (/accreditations, /quality) -> Dynamically reads Visual Editor & Admin settings
  if (cleanPath === "/accreditations" || cleanPath === "/quality") {
    const visualOverride = await getVisualImageOverride("/accreditations");

    return {
      title: "الاعتمادات والجودة والجوائز 🏅 | مدارس العقيق الأهلية والدولية",
      description:
        "سجل حافل من الاعتمادات الوطنية والدولية وجوائز التميز المؤسسي والأكاديمي لمدارس العقيق بالمدينة المنورة.",
      imageUrl: resolveSocialImageUrl(
        visualOverride || "/covers/cover-accreditations.jpg",
        origin
      ),
      canonicalUrl: new URL("/accreditations", origin).toString(),
      ogType: "website",
    };
  }

  // 15. Custom Pages (/page/:slug) -> Dynamically reads from customPages DB table
  const customPageMatch = cleanPath.match(/^\/page\/([^/]+)$/);
  if (customPageMatch) {
    const slug = decodeURIComponent(customPageMatch[1]);
    try {
      const customPage = await getCustomPageBySlug(slug, "public");
      if (customPage) {
        return {
          title: `${customPage.title.trim()} | مدارس العقيق`,
          description: `${customPage.title} - مدارس العقيق الأهلية والدولية بالمدينة المنورة.`,
          imageUrl: resolveSocialImageUrl("/covers/cover-about.jpg", origin),
          canonicalUrl: new URL(`/page/${encodeURIComponent(slug)}`, origin).toString(),
          ogType: "article",
        };
      }
    } catch {}
  }

  // 16. Default / Homepage -> Dynamically reads from Site Orchestration & Marketing Pixels in DB
  try {
    const config = await getSiteOrchestration();
    const title =
      config?.marketingPixels?.ogTitle?.trim() ||
      "مدارس العقيق الأهلية والدولية بالمدينة المنورة";
    const description =
      config?.marketingPixels?.ogDescription?.trim() ||
      "الريادة في التعليم وصناعة المستقبل منذ عام 1994 - برامج تعليمية معتمدة ورعاية للموهبة والإبداع";
    const rawImage =
      config?.marketingPixels?.ogImageUrl?.trim() ||
      "/api/og-image.png";

    return {
      title,
      description,
      imageUrl: resolveSocialImageUrl(rawImage, origin),
      canonicalUrl: new URL(cleanPath, origin).toString(),
      ogType: "website",
    };
  } catch {
    return {
      title: "مدارس العقيق الأهلية والدولية بالمدينة المنورة",
      description:
        "الريادة في التعليم وصناعة المستقبل منذ عام 1994 - برامج تعليمية معتمدة ورعاية للموهبة والإبداع",
      imageUrl: resolveSocialImageUrl("/api/og-image.png", origin),
      canonicalUrl: new URL(cleanPath, origin).toString(),
      ogType: "website",
    };
  }
}

export async function serveDynamicSocialPreview(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Ignore static assets and API requests
  if (
    req.path.startsWith("/api/") ||
    /\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|map|json|woff|woff2|ttf|mp3|mp4|zip)$/i.test(
      req.path
    )
  ) {
    return next();
  }

  // Only intercept social media crawlers
  const userAgent = req.get("user-agent") || "";
  if (!isSocialCrawler(userAgent)) {
    return next();
  }

  try {
    const protocol =
      String(req.get("x-forwarded-proto") || req.protocol).split(",")[0]?.trim() ||
      "https";
    const origin = `${protocol}://${req.get("host")}`;
    const previewData = await resolveSocialPreviewForPath(req.path, origin);
    const html = renderSocialHtml(previewData, origin);

    res
      .status(200)
      .set({
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      })
      .end(html);
  } catch (error) {
    next(error);
  }
}
