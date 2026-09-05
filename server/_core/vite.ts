import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";
import { getAqeeqAlbumBySlug, getAqeeqShowcaseBySlug, getSiteOrchestration } from "../db";
import { streamAqeeqAlbumMedia, streamAqeeqAlbumVideo, streamAqeeqAlbumZip, streamAqeeqDriveVideo } from "../aqeeqAlbumDownloads";
import { serveDynamicSocialPreview } from "../dynamicSocialPreview";

async function serveOgImage(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const config = await getSiteOrchestration();
    const rawImage = config?.marketingPixels?.ogImageUrl?.trim();
    if (rawImage && rawImage.startsWith("data:image/")) {
      const commaIndex = rawImage.indexOf(",");
      const meta = rawImage.slice(0, commaIndex);
      const mime = meta.match(/data:([^;]+);/)?.[1] || "image/png";
      const buffer = Buffer.from(rawImage.slice(commaIndex + 1), "base64");
      res.status(200).set({
        "Content-Type": mime,
        "Content-Length": String(buffer.length),
        "Cache-Control": "public, max-age=86400",
      }).end(buffer);
      return;
    }
    const publicDir = process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../../client/public")
      : path.resolve(import.meta.dirname, "public");
    const previewPath = path.join(publicDir, "og-preview.png");
    if (fs.existsSync(previewPath)) {
      res.sendFile(previewPath);
    } else {
      res.redirect("/alaqeeq-logo.png");
    }
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
  app.get("/api/og-image.png", serveOgImage);
  app.use(serveDynamicSocialPreview);
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
  app.get("/api/og-image.png", serveOgImage);
  app.use(serveDynamicSocialPreview);
  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist (with no-cache so Chrome always loads fresh bundle)
  app.use("*", (_req, res) => {
    res.set({ "Cache-Control": "no-cache, no-store, must-revalidate" }).sendFile(path.resolve(distPath, "index.html"));
  });
}
