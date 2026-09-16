import type { Express, Request, Response } from "express";
import {
  listAqeeqAlbums,
  listSchoolNewsIssues,
  listAqeeqShowcases,
} from "./db";
import { getPublishedArticles } from "./articlesDb";
import { getPodcasts } from "./podcastDb";

/**
 * Escapes characters for valid XML output
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function registerSeoRoutes(app: Express) {
  // 1. Robots.txt
  app.get("/robots.txt", (req: Request, res: Response) => {
    const origin = `${req.protocol}://${req.get("host") || "alaqeeq.edu.sa"}`;
    const robotsTxt = [
      "User-agent: *",
      "Allow: /",
      "",
      "# Protect Admin & Internal endpoints from web crawlers",
      "Disallow: /admin",
      "Disallow: /api/trpc",
      "Disallow: /api/sync",
      "",
      `Sitemap: ${origin}/sitemap.xml`,
    ].join("\n");

    res.header("Content-Type", "text/plain; charset=utf-8");
    res.header("Cache-Control", "public, max-age=86400, stale-while-revalidate=43200");
    res.status(200).send(robotsTxt);
  });

  // 2. Dynamic XML Sitemap
  app.get("/sitemap.xml", async (req: Request, res: Response) => {
    try {
      const origin = `${req.protocol}://${req.get("host") || "alaqeeq.edu.sa"}`;
      const nowIso = new Date().toISOString();

      // Static high-priority pages
      const urls: Array<{
        loc: string;
        lastmod?: string;
        changefreq: string;
        priority: string;
      }> = [
        { loc: `${origin}/`, lastmod: nowIso, changefreq: "daily", priority: "1.0" },
        { loc: `${origin}/admissions`, lastmod: nowIso, changefreq: "weekly", priority: "0.95" },
        { loc: `${origin}/articles`, lastmod: nowIso, changefreq: "daily", priority: "0.85" },
        { loc: `${origin}/albums`, lastmod: nowIso, changefreq: "weekly", priority: "0.85" },
        { loc: `${origin}/news`, lastmod: nowIso, changefreq: "weekly", priority: "0.85" },
        { loc: `${origin}/podcasts`, lastmod: nowIso, changefreq: "weekly", priority: "0.80" },
        { loc: `${origin}/showcase`, lastmod: nowIso, changefreq: "weekly", priority: "0.80" },
        { loc: `${origin}/about`, lastmod: nowIso, changefreq: "monthly", priority: "0.75" },
        { loc: `${origin}/accreditations`, lastmod: nowIso, changefreq: "monthly", priority: "0.75" },
      ];

      // Fetch dynamic content safely
      const [albums, issues, showcases, articles, podcasts] = await Promise.all([
        listAqeeqAlbums("published").catch(() => []),
        listSchoolNewsIssues("published").catch(() => []),
        listAqeeqShowcases("published").catch(() => []),
        getPublishedArticles().catch(() => []),
        getPodcasts().catch(() => []),
      ]);

      // Articles
      for (const article of articles) {
        if (article.slug) {
          urls.push({
            loc: `${origin}/articles/${encodeURIComponent(article.slug)}`,
            lastmod: article.updatedAt ? new Date(article.updatedAt).toISOString() : nowIso,
            changefreq: "weekly",
            priority: "0.80",
          });
        }
      }

      // Albums
      for (const album of albums) {
        if (album.slug) {
          urls.push({
            loc: `${origin}/albums/${encodeURIComponent(album.slug)}`,
            lastmod: album.updatedAt ? new Date(album.updatedAt).toISOString() : nowIso,
            changefreq: "weekly",
            priority: "0.80",
          });
        }
      }

      // School News Issues
      for (const issue of issues) {
        if (issue.slug) {
          urls.push({
            loc: `${origin}/news/${encodeURIComponent(issue.slug)}`,
            lastmod: issue.updatedAt ? new Date(issue.updatedAt).toISOString() : nowIso,
            changefreq: "monthly",
            priority: "0.75",
          });
        }
      }

      // Showcases
      for (const showcase of showcases) {
        if (showcase.slug) {
          urls.push({
            loc: `${origin}/showcases/${encodeURIComponent(showcase.slug)}`,
            lastmod: showcase.updatedAt ? new Date(showcase.updatedAt).toISOString() : nowIso,
            changefreq: "monthly",
            priority: "0.70",
          });
        }
      }

      // Podcasts
      for (const pod of podcasts) {
        if (pod.slug) {
          urls.push({
            loc: `${origin}/podcasts/${encodeURIComponent(pod.slug)}`,
            lastmod: pod.createdAt ? new Date(pod.createdAt).toISOString() : nowIso,
            changefreq: "monthly",
            priority: "0.70",
          });
        }
      }

      // Construct XML
      const xmlItems = urls
        .map((u) => {
          return [
            "  <url>",
            `    <loc>${escapeXml(u.loc)}</loc>`,
            u.lastmod ? `    <lastmod>${escapeXml(u.lastmod)}</lastmod>` : "",
            `    <changefreq>${u.changefreq}</changefreq>`,
            `    <priority>${u.priority}</priority>`,
            "  </url>",
          ]
            .filter(Boolean)
            .join("\n");
        })
        .join("\n");

      const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        xmlItems,
        "</urlset>",
      ].join("\n");

      res.header("Content-Type", "application/xml; charset=utf-8");
      res.header("Cache-Control", "public, max-age=3600, stale-while-revalidate=1800");
      res.status(200).send(xml);
    } catch (error) {
      console.error("[Sitemap Generator] Error:", error);
      res.status(500).send("Error generating sitemap");
    }
  });
}
