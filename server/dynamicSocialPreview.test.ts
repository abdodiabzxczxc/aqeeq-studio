import { describe, expect, it } from "vitest";
import {
  isSocialCrawler,
  resolveSocialImageUrl,
  toDriveProxyUrl,
  renderSocialHtml,
  resolveSocialPreviewForPath,
} from "./dynamicSocialPreview";

describe("Dynamic Social Preview Engine", () => {
  const origin = "https://aqeeq-studio.onrender.com";

  describe("Crawler Detection", () => {
    it("recognizes WhatsApp, Twitter, Facebook, Telegram, LinkedIn, Discord and Googlebot", () => {
      expect(isSocialCrawler("WhatsApp/2.23.20.0 i")).toBe(true);
      expect(isSocialCrawler("facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)")).toBe(true);
      expect(isSocialCrawler("Twitterbot/1.0")).toBe(true);
      expect(isSocialCrawler("TelegramBot (like TwitterBot)")).toBe(true);
      expect(isSocialCrawler("LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)")).toBe(true);
      expect(isSocialCrawler("Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)")).toBe(true);
      expect(isSocialCrawler("Googlebot/2.1 (+http://www.google.com/bot.html)")).toBe(true);
    });

    it("ignores regular desktop and mobile browsers", () => {
      expect(isSocialCrawler("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")).toBe(false);
      expect(isSocialCrawler("Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1")).toBe(false);
    });
  });

  describe("Image URL Resolution", () => {
    it("converts Google Drive share and view URLs to internal proxy URLs", () => {
      expect(toDriveProxyUrl("https://drive.google.com/file/d/163I5oHY_SbDcS_IARmfgJxjXiNIhRuV7/view")).toBe("/api/drive-proxy/163I5oHY_SbDcS_IARmfgJxjXiNIhRuV7");
      expect(toDriveProxyUrl("https://drive.google.com/thumbnail?id=163I5oHY_SbDcS_IARmfgJxjXiNIhRuV7")).toBe("/api/drive-proxy/163I5oHY_SbDcS_IARmfgJxjXiNIhRuV7");
      expect(toDriveProxyUrl("/api/drive-proxy/existing_id")).toBe("/api/drive-proxy/existing_id");
    });

    it("turns relative paths and drive proxies into absolute HTTPS URLs", () => {
      expect(resolveSocialImageUrl("/articles/cover.jpg", origin)).toBe("https://aqeeq-studio.onrender.com/articles/cover.jpg");
      expect(resolveSocialImageUrl("https://drive.google.com/file/d/file123/view", origin)).toBe("https://aqeeq-studio.onrender.com/api/drive-proxy/file123");
    });

    it("replaces base64 data URIs with the dynamic binary endpoint /api/og-image.png", () => {
      expect(resolveSocialImageUrl("data:image/png;base64,iVBORw0KGgoAAA...", origin)).toBe("https://aqeeq-studio.onrender.com/api/og-image.png");
    });

    it("provides fallback image when source is null or empty", () => {
      expect(resolveSocialImageUrl("", origin)).toBe("https://aqeeq-studio.onrender.com/api/og-image.png");
      expect(resolveSocialImageUrl(null, origin)).toBe("https://aqeeq-studio.onrender.com/api/og-image.png");
    });
  });

  describe("HTML Open Graph Rendering", () => {
    it("renders valid Open Graph and Twitter Card tags with absolute URLs", () => {
      const html = renderSocialHtml({
        title: "حفل تكريم المتفوقين",
        description: "تغطية كاملة لحفل تكريم أوائل الطلاب",
        imageUrl: "https://aqeeq-studio.onrender.com/albums/cover.jpg",
        canonicalUrl: "https://aqeeq-studio.onrender.com/albums/honors-2026",
        ogType: "article",
      }, origin);

      expect(html).toContain('<meta property="og:title" content="حفل تكريم المتفوقين" />');
      expect(html).toContain('<meta property="og:description" content="تغطية كاملة لحفل تكريم أوائل الطلاب" />');
      expect(html).toContain('<meta property="og:image" content="https://aqeeq-studio.onrender.com/albums/cover.jpg" />');
      expect(html).toContain('<meta property="og:url" content="https://aqeeq-studio.onrender.com/albums/honors-2026" />');
      expect(html).toContain('<meta name="twitter:card" content="summary_large_image" />');
      expect(html).toContain('<meta name="twitter:title" content="حفل تكريم المتفوقين" />');
    });
  });

  describe("Route-Specific Social Previews", () => {
    it("resolves social preview for admissions and fees", async () => {
      const preview = await resolveSocialPreviewForPath("/admissions", origin);
      expect(preview.title).toContain("القبول والتسجيل");
      expect(preview.canonicalUrl).toBe("https://aqeeq-studio.onrender.com/admissions");

      const feesPreview = await resolveSocialPreviewForPath("/fees", origin);
      expect(feesPreview.title).toContain("الرسوم");
    });

    it("resolves social preview for articles hub", async () => {
      const preview = await resolveSocialPreviewForPath("/articles", origin);
      expect(preview.title).toContain("مقالات");
      expect(preview.canonicalUrl).toBe("https://aqeeq-studio.onrender.com/articles");
    });

    it("resolves social preview for podcast hub", async () => {
      const preview = await resolveSocialPreviewForPath("/atheer", origin);
      expect(preview.title).toContain("أثير العقيق");
      expect(preview.canonicalUrl).toBe("https://aqeeq-studio.onrender.com/podcast");
    });

    it("resolves social preview for albums hub", async () => {
      const preview = await resolveSocialPreviewForPath("/albums", origin);
      expect(preview.title).toContain("ألبومات");
      expect(preview.canonicalUrl).toBe("https://aqeeq-studio.onrender.com/albums");
    });

    it("resolves social preview for about and accreditations", async () => {
      const aboutPreview = await resolveSocialPreviewForPath("/about", origin);
      expect(aboutPreview.title).toContain("عن مدارس العقيق");

      const qualityPreview = await resolveSocialPreviewForPath("/accreditations", origin);
      expect(qualityPreview.title).toContain("الاعتمادات");
    });

    it("resolves default homepage preview for root /", async () => {
      const preview = await resolveSocialPreviewForPath("/", origin);
      expect(preview.title).toBeTruthy();
      expect(preview.canonicalUrl).toBe("https://aqeeq-studio.onrender.com/");
    });
  });
});
