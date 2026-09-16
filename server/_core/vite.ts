import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";
import { getAqeeqAlbumBySlug, getAqeeqShowcaseBySlug, getSiteOrchestration, listAllVisualElementOverrides } from "../db";
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

const STATIC_MEDIA_REPLACEMENTS: Record<string, string> = {
  "/covers/student-excellence-about.jpg": "/api/drive-proxy/1ulrpYsDrV7xbDdysqTsNoLNUvblw14p5",
  "/covers/student-lab-admissions.jpg": "/api/drive-proxy/1IkefgGSvnqfdhLiMHYd25-lz3AuBH5n1",
  "/covers/cover-accreditations.jpg": "/api/drive-proxy/1qifbHFSgFaBQH1g63qvK2WmQtls0l4AR",
  "/covers/first-lego-champions.png": "/api/drive-proxy/16IxreFp6eRLCuLDZyIWEoU9eWHzOCJuC",
};

async function serveMediaRewrite(req: express.Request, res: express.Response, next: express.NextFunction) {
  const reqPath = req.path;
  if (STATIC_MEDIA_REPLACEMENTS[reqPath]) {
    return res.redirect(302, STATIC_MEDIA_REPLACEMENTS[reqPath]);
  }

  try {
    const overrides = await listAllVisualElementOverrides("all");
    for (const ov of overrides as any[]) {
      if (!ov?.mediaUrl) continue;
      if (reqPath === "/covers/student-excellence-about.jpg" && (ov.elementId === "about-timeline-era-1994" || ov.elementId === "auto-img-fscsr")) {
        return res.redirect(302, ov.mediaUrl);
      }
      if (reqPath === "/covers/student-lab-admissions.jpg" && (ov.elementId === "about-timeline-era-2010" || ov.elementId === "auto-img-87oz7u")) {
        return res.redirect(302, ov.mediaUrl);
      }
      if (reqPath === "/covers/cover-accreditations.jpg" && (ov.elementId === "about-timeline-era-2018" || ov.elementId === "auto-img-a5wup0")) {
        return res.redirect(302, ov.mediaUrl);
      }
      if (reqPath === "/covers/first-lego-champions.png" && (ov.elementId === "about-timeline-era-2026" || ov.elementId === "auto-img-q64as")) {
        return res.redirect(302, ov.mediaUrl);
      }
      if (ov.customCss) {
        try {
          const parsed = JSON.parse(ov.customCss);
          if (parsed?.originalSrc && typeof parsed.originalSrc === "string" && parsed.originalSrc.trim() === reqPath) {
            return res.redirect(302, ov.mediaUrl);
          }
        } catch {}
      }
    }
  } catch {}
  next();
}

async function injectServerStateIntoHtml(html: string): Promise<string> {
  try {
    const [overrides, orchestration] = await Promise.all([
      listAllVisualElementOverrides("all").catch(() => []),
      getSiteOrchestration().catch(() => null),
    ]);

    const replacements: Record<string, string> = {
      ...STATIC_MEDIA_REPLACEMENTS,
    };

    if (Array.isArray(overrides)) {
      for (const ov of overrides as any[]) {
        if (ov?.mediaUrl) {
          if (ov.elementId === "about-timeline-era-1994" || ov.elementId === "auto-img-fscsr") {
            replacements["/covers/student-excellence-about.jpg"] = ov.mediaUrl;
          } else if (ov.elementId === "about-timeline-era-2010" || ov.elementId === "auto-img-87oz7u") {
            replacements["/covers/student-lab-admissions.jpg"] = ov.mediaUrl;
          } else if (ov.elementId === "about-timeline-era-2018" || ov.elementId === "auto-img-a5wup0") {
            replacements["/covers/cover-accreditations.jpg"] = ov.mediaUrl;
          } else if (ov.elementId === "about-timeline-era-2026" || ov.elementId === "auto-img-q64as") {
            replacements["/covers/first-lego-champions.png"] = ov.mediaUrl;
          }
          if (ov.customCss) {
            try {
              const parsed = JSON.parse(ov.customCss);
              if (parsed?.originalSrc && typeof parsed.originalSrc === "string") {
                replacements[parsed.originalSrc.trim()] = ov.mediaUrl;
              }
            } catch {}
          }
        }
      }
    }

    const safeOverrides = JSON.stringify(overrides || []).replace(/</g, "\\u003c");
    const safeOrchestration = JSON.stringify(orchestration || {}).replace(/</g, "\\u003c");
    const safeReplacements = JSON.stringify(replacements).replace(/</g, "\\u003c");

    const scriptTag = `<script id="aqeeq-server-state">
  window.__AQEEQ_SERVER_OVERRIDES__ = ${safeOverrides};
  window.__AQEEQ_SERVER_ORCHESTRATION__ = ${safeOrchestration};
  window.__AQEEQ_SERVER_REPLACEMENTS__ = ${safeReplacements};
</script>`;

    if (html.includes("</head>")) {
      return html.replace("</head>", `${scriptTag}\n</head>`);
    }
    return `${scriptTag}\n${html}`;
  } catch (err) {
    console.error("Failed to inject server state into HTML:", err);
    return html;
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

  app.use(serveMediaRewrite);
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
      template = await injectServerStateIntoHtml(template);
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

  app.use(serveMediaRewrite);
  app.get("/api/albums/:slug/download.zip", serveAqeeqAlbumZip);
  app.get("/api/albums/:slug/media/:mediaId/download", serveAqeeqAlbumMedia);
  app.get("/api/albums/:slug/media/:mediaId/stream", serveAqeeqAlbumVideo);
  app.get("/api/showcases/:slug/posts/:postId/stream", serveAqeeqShowcaseVideo);
  app.get("/api/og-image.png", serveOgImage);
  app.use(serveDynamicSocialPreview);

  // Serve pre-injected index.html for root and direct index requests
  app.get(["/", "/index.html"], async (_req, res, next) => {
    try {
      const indexPath = path.resolve(distPath, "index.html");
      if (!fs.existsSync(indexPath)) return next();
      const rawHtml = await fs.promises.readFile(indexPath, "utf-8");
      const page = await injectServerStateIntoHtml(rawHtml);
      res.status(200).set({
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      }).send(page);
    } catch (e) {
      next(e);
    }
  });

  // Rewrite replaced media before static serving
  app.use(serveMediaRewrite);

  // ⚡ High-speed immutable caching for hashed production assets (/assets/*)
  app.use(
    express.static(distPath, {
      maxAge: "1y",
      immutable: true,
      setHeaders(res, filePath) {
        // Ensure index.html never gets cached indefinitely
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        } else if (/\.(?:webp|png|jpe?g|gif|svg|ico|avif|woff2?|ttf|eot|mp3|wav|ogg|mp4|webm)$/i.test(filePath)) {
          // ⚡ High-performance browser caching for static images, previews, covers, fonts & media
          res.setHeader("Cache-Control", "public, max-age=604800, stale-while-revalidate=86400");
        } else if (!filePath.includes("/assets/")) {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        }
      },
    })
  );

  // fall through to index.html with server state pre-injected
  app.use("*", async (_req, res, next) => {
    try {
      const indexPath = path.resolve(distPath, "index.html");
      if (!fs.existsSync(indexPath)) {
        return res.status(404).send("Build directory or index.html not found. Run npm run build.");
      }
      const rawHtml = await fs.promises.readFile(indexPath, "utf-8");
      const page = await injectServerStateIntoHtml(rawHtml);
      res.status(200).set({
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      }).send(page);
    } catch (e) {
      next(e);
    }
  });
}
