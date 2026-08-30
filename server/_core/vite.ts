import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";
import { getAqeeqAlbumBySlug, getAqeeqShowcaseBySlug, getSchoolNewsIssueBySlug } from "../db";
import { streamAqeeqAlbumMedia, streamAqeeqAlbumVideo, streamAqeeqAlbumZip, streamAqeeqDriveVideo } from "../aqeeqAlbumDownloads";
import { createAlbumSocialPreviewHtml, createSiteSocialPreviewHtml } from "../albumSocialPreview";
import { createJournalSocialPreviewHtml, isJournalSocialCrawler } from "../journalSocialPreview";

async function serveUniversalSiteSocialPreview(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!isJournalSocialCrawler(req.get("user-agent") || "")) return next();
  const protocol = String(req.get("x-forwarded-proto") || req.protocol).split(",")[0]?.trim() || "https";
  const origin = `${protocol}://${req.get("host")}`;
  res.status(200).set({ "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" }).end(createSiteSocialPreviewHtml(origin, req.originalUrl || "/"));
}

async function serveJournalSocialPreview(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!isJournalSocialCrawler(req.get("user-agent") || "")) return next();

  try {
    const issue = await getSchoolNewsIssueBySlug(req.params.slug);
    if (!issue) return next();
    const protocol = String(req.get("x-forwarded-proto") || req.protocol).split(",")[0]?.trim() || "https";
    const origin = `${protocol}://${req.get("host")}`;
    res.status(200).set({ "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" }).end(createJournalSocialPreviewHtml(issue, origin));
  } catch (error) {
    next(error);
  }
}

async function serveAlbumSocialPreview(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!isJournalSocialCrawler(req.get("user-agent") || "")) return next();
  try {
    const album = await getAqeeqAlbumBySlug(req.params.slug);
    if (!album) return next();
    const protocol = String(req.get("x-forwarded-proto") || req.protocol).split(",")[0]?.trim() || "https";
    const origin = `${protocol}://${req.get("host")}`;
    res.status(200).set({ "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" }).end(createAlbumSocialPreviewHtml(album, origin));
  } catch (error) {
    next(error);
  }
}

async function serveAqeeqAlbumZip(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const album = await getAqeeqAlbumBySlug(req.params.slug);
    if (!album?.media.length) return res.status(404).json({ message: "الألبوم غير متاح للتنزيل" });
    await streamAqeeqAlbumZip(res, album);
  } catch (error) {
    next(error);
  }
}

async function serveAqeeqAlbumMedia(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const album = await getAqeeqAlbumBySlug(req.params.slug);
    const media = album?.media.find((item) => item.id === Number(req.params.mediaId));
    if (!media) return res.status(404).json({ message: "الصورة غير متاحة للتنزيل" });
    await streamAqeeqAlbumMedia(res, media);
  } catch (error) {
    next(error);
  }
}

async function serveAqeeqAlbumVideo(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const album = await getAqeeqAlbumBySlug(req.params.slug);
    const media = album?.media.find((item) => item.id === Number(req.params.mediaId));
    if (!media || media.mediaType !== "video") return res.status(404).json({ message: "الفيديو غير متاح للتشغيل" });
    await streamAqeeqAlbumVideo(res, media, req.get("range") || undefined);
  } catch (error) {
    next(error);
  }
}

async function serveAqeeqShowcaseVideo(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const showcase = await getAqeeqShowcaseBySlug(req.params.slug);
    const post = showcase?.posts.find((item) => item.id === Number(req.params.postId));
    if (!post || post.mediaType !== "video") return res.status(404).json({ message: "الفيديو غير متاح للتشغيل" });
    await streamAqeeqDriveVideo(res, post.mediaUrl, post.mimeType, req.get("range") || undefined);
  } catch (error) {
    next(error);
  }
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.get("/api/albums/:slug/download.zip", serveAqeeqAlbumZip);
  app.get("/api/albums/:slug/media/:mediaId/download", serveAqeeqAlbumMedia);
  app.get("/api/albums/:slug/media/:mediaId/stream", serveAqeeqAlbumVideo);
  app.get("/api/showcases/:slug/posts/:postId/stream", serveAqeeqShowcaseVideo);
  app.use(vite.middlewares);
  app.get("/journal/issue/:slug", serveJournalSocialPreview);
  app.get("/albums/:slug", serveAlbumSocialPreview);
  app.get("*", serveUniversalSiteSocialPreview);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache, no-store, must-revalidate" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.get("/api/albums/:slug/download.zip", serveAqeeqAlbumZip);
  app.get("/api/albums/:slug/media/:mediaId/download", serveAqeeqAlbumMedia);
  app.get("/api/albums/:slug/media/:mediaId/stream", serveAqeeqAlbumVideo);
  app.get("/api/showcases/:slug/posts/:postId/stream", serveAqeeqShowcaseVideo);
  app.get("/journal/issue/:slug", serveJournalSocialPreview);
  app.get("/albums/:slug", serveAlbumSocialPreview);
  app.get("*", serveUniversalSiteSocialPreview);
  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist (with no-cache so Chrome always loads fresh bundle)
  app.use("*", (_req, res) => {
    res.set({ "Cache-Control": "no-cache, no-store, must-revalidate" }).sendFile(path.resolve(distPath, "index.html"));
  });
}
