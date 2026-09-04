import express, { type Express } from "express";
import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

// Lightweight ephemeral RAM cache (0 bytes disk storage)
const ephemeralMemoryCache = new Map<string, { buffer: Buffer; contentType: string; etag: string }>();
const MAX_RAM_ITEMS = 200; // increased from 60

/** Evict oldest entry when cache is full */
function evictOldest() {
  const oldest = ephemeralMemoryCache.keys().next().value;
  if (oldest) ephemeralMemoryCache.delete(oldest);
}

/** Fetch with timeout support */
async function fetchWithTimeout(url: string, options: RequestInit & { timeoutMs?: number } = {}) {
  const { timeoutMs = 8000, ...fetchOptions } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...fetchOptions, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

export function registerStorageProxy(app: Express) {
  ensureUploadsDir();

  // Serve static uploads for both /uploads and legacy /manus-storage paths
  app.use("/uploads", express.static(UPLOADS_DIR, { maxAge: "30d" }));
  app.use("/manus-storage", express.static(UPLOADS_DIR, { maxAge: "30d" }));

  // Zero-Disk-Space High-Speed Google Drive Image Streamer & Browser Edge Cacher with full CORS support
  app.get("/api/drive-proxy/:fileId", async (req, res) => {
    const { fileId } = req.params;
    if (!fileId || !/^[a-zA-Z0-9_-]+$/.test(fileId)) {
      return res.status(400).send("Invalid file ID");
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

    // 1. Check RAM memory cache (0ms, 0 disk space)
    const memCached = ephemeralMemoryCache.get(fileId);
    if (memCached) {
      // Support conditional GET (304 Not Modified)
      if (req.headers["if-none-match"] === memCached.etag) {
        return res.status(304).end();
      }
      res.setHeader("Content-Type", memCached.contentType);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.setHeader("ETag", memCached.etag);
      return res.send(memCached.buffer);
    }

    try {
      const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

      // 2. Fetch from Google CDN Edge — w800 is enough for thumbnails and faster than w1200
      const cdnUrl = `https://lh3.googleusercontent.com/d/${fileId}=w800`;
      let driveRes = await fetchWithTimeout(cdnUrl, {
        headers: { "User-Agent": UA },
        timeoutMs: 8000,
      });

      // Fallback 1: thumbnail URL
      if (!driveRes.ok) {
        const thumbUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
        driveRes = await fetchWithTimeout(thumbUrl, {
          headers: { "User-Agent": UA },
          timeoutMs: 6000,
        });
      }

      // Fallback 2: download URL
      if (!driveRes.ok) {
        const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
        driveRes = await fetchWithTimeout(downloadUrl, {
          headers: { "User-Agent": UA },
          timeoutMs: 6000,
        });
      }

      if (!driveRes.ok) {
        return res.status(404).send("Image not found");
      }

      const contentType = driveRes.headers.get("content-type") || "image/jpeg";
      // Only cache actual images (not HTML error pages from Drive)
      if (contentType.includes("text/html")) {
        return res.status(404).send("Image not found");
      }

      const arrayBuf = await driveRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);
      const etag = `"${fileId}-${buffer.length}"`;

      // Keep only in temporary RAM, 0 disk space used
      if (ephemeralMemoryCache.size >= MAX_RAM_ITEMS) evictOldest();
      ephemeralMemoryCache.set(fileId, { buffer, contentType, etag });

      // Tell the browser to cache it on the user device for 1 year (0 server space)
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.setHeader("ETag", etag);
      return res.send(buffer);
    } catch (err) {
      console.warn("[DriveProxy] Streaming image fallback error:", err);
      return res.status(504).send("Timeout or error fetching image");
    }
  });

// Lightweight ephemeral audio RAM cache (0ms instant playback, seek & resume)
const audioMemoryCache = new Map<string, { buffer: Buffer; contentType: string; etag: string }>();
// Tracks files currently being fetched so concurrent requests wait instead of double-fetching
const audioFetchingPromise = new Map<string, Promise<{ buffer: Buffer; contentType: string } | null>>();
const MAX_AUDIO_RAM_ITEMS = 40;

function evictOldestAudio() {
  const oldest = audioMemoryCache.keys().next().value;
  if (oldest) audioMemoryCache.delete(oldest);
}

  // High-Speed Google Drive Audio Proxy — Stream-first with background caching
  app.get("/api/drive-audio-proxy/:fileId", async (req, res) => {
    const { fileId } = req.params;
    if (!fileId || !/^[a-zA-Z0-9_-]+$/.test(fileId)) {
      return res.status(400).send("Invalid file ID");
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

    const requestedExt = (req.query.ext as string)?.toLowerCase();
    const mimeMap: Record<string, string> = {
      mp3: "audio/mpeg", m4a: "audio/mp4", wav: "audio/wav",
      aac: "audio/aac", ogg: "audio/ogg", oga: "audio/ogg",
      opus: "audio/opus", flac: "audio/flac", weba: "audio/webm",
      webm: "audio/webm", wma: "audio/x-ms-wma", aiff: "audio/aiff",
      aif: "audio/aiff", mid: "audio/midi", midi: "audio/midi",
    };

    const serveBuffer = (buffer: Buffer, contentType: string, etag: string) => {
      res.setHeader("Content-Type", contentType);
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.setHeader("ETag", etag);
      const rangeHeader = req.headers.range;
      if (rangeHeader) {
        const parts = rangeHeader.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10) || 0;
        const end = parts[1] ? parseInt(parts[1], 10) : buffer.length - 1;
        if (start >= buffer.length || end >= buffer.length) {
          res.setHeader("Content-Range", `bytes */${buffer.length}`);
          return res.status(416).send("Requested Range Not Satisfiable");
        }
        const chunksize = end - start + 1;
        res.status(206);
        res.setHeader("Content-Range", `bytes ${start}-${end}/${buffer.length}`);
        res.setHeader("Content-Length", String(chunksize));
        return res.end(buffer.subarray(start, end + 1));
      }
      res.status(200);
      res.setHeader("Content-Length", String(buffer.length));
      return res.end(buffer);
    };

    // ✅ 1. Cached → instant response (0ms)
    const cached = audioMemoryCache.get(fileId);
    if (cached) {
      if (req.headers["if-none-match"] === cached.etag && !req.headers.range) {
        return res.status(304).end();
      }
      return serveBuffer(cached.buffer, cached.contentType, cached.etag);
    }

    const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
    const downloadUrls = [
      `https://drive.usercontent.google.com/download?id=${encodeURIComponent(fileId)}&export=download&confirm=t`,
      `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}&confirm=t`,
    ];

    // ✅ 2. Another request is already fetching — wait for it then serve from cache
    const existing = audioFetchingPromise.get(fileId);
    if (existing) {
      const result = await existing;
      if (result) {
        const etag = `"${fileId}-${result.buffer.length}"`;
        return serveBuffer(result.buffer, result.contentType, etag);
      }
      return res.status(502).send("Failed to stream audio from Google Drive");
    }

    // ✅ 3. First request for this file — STREAM immediately to client, CACHE in parallel
    let driveRes: Response | null = null;
    for (const u of downloadUrls) {
      try {
        const r = await fetchWithTimeout(u, { headers: { "User-Agent": UA }, timeoutMs: 12000 });
        if (r.ok || r.status === 206) { driveRes = r; break; }
      } catch {}
    }

    if (!driveRes || !driveRes.body) {
      return res.status(502).send("Failed to stream audio from Google Drive");
    }

    const rawContentType = driveRes.headers.get("content-type") || "";
    let finalContentType = (requestedExt && mimeMap[requestedExt]) || rawContentType;
    if (!finalContentType || !finalContentType.includes("audio")) finalContentType = "audio/mpeg";

    const contentLength = driveRes.headers.get("content-length");

    // Is this a range request? If cached, handle above. If not cached yet, do full download so we can cache.
    // For initial (non-range) request: stream immediately while collecting chunks for cache.
    const rangeHeader = req.headers.range;

    if (!rangeHeader) {
      // ── Non-range: pipe and cache simultaneously ──
      res.status(200);
      res.setHeader("Content-Type", finalContentType);
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      if (contentLength) res.setHeader("Content-Length", contentLength);

      const chunks: Buffer[] = [];

      const fetchPromise = (async () => {
        try {
          const reader = driveRes!.body!.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = Buffer.from(value);
            chunks.push(chunk);
            if (!res.writableEnded) res.write(chunk);
          }
          if (!res.writableEnded) res.end();
          const buffer = Buffer.concat(chunks);
          const etag = `"${fileId}-${buffer.length}"`;
          if (audioMemoryCache.size >= MAX_AUDIO_RAM_ITEMS) evictOldestAudio();
          audioMemoryCache.set(fileId, { buffer, contentType: finalContentType, etag });
          audioFetchingPromise.delete(fileId);
          return { buffer, contentType: finalContentType };
        } catch {
          if (!res.writableEnded) res.end();
          audioFetchingPromise.delete(fileId);
          return null;
        }
      })();

      audioFetchingPromise.set(fileId, fetchPromise);
      await fetchPromise;

    } else {
      // ── Range request but not cached yet — download full file, cache, then serve range ──
      try {
        const fetchPromise = (async () => {
          const arrBuf = await driveRes!.arrayBuffer();
          const buffer = Buffer.from(arrBuf);
          const etag = `"${fileId}-${buffer.length}"`;
          if (audioMemoryCache.size >= MAX_AUDIO_RAM_ITEMS) evictOldestAudio();
          audioMemoryCache.set(fileId, { buffer, contentType: finalContentType, etag });
          audioFetchingPromise.delete(fileId);
          return { buffer, contentType: finalContentType };
        })();
        audioFetchingPromise.set(fileId, fetchPromise);
        const result = await fetchPromise;
        if (result) {
          const etag = `"${fileId}-${result.buffer.length}"`;
          return serveBuffer(result.buffer, result.contentType, etag);
        }
      } catch {
        return res.status(500).send("Error fetching audio");
      }
    }
  });


  // Zero-Disk-Space High-Speed Google Drive Video Streamer with Range & All-Format Support
  app.get("/api/drive-video-proxy/:fileId", async (req, res) => {
    const { fileId } = req.params;
    if (!fileId || !/^[a-zA-Z0-9_-]+$/.test(fileId)) {
      return res.status(400).send("Invalid file ID");
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

    try {
      const googleDownloadUrl = `https://drive.usercontent.google.com/download?id=${encodeURIComponent(fileId)}&export=download&confirm=t`;
      const rangeHeader = req.headers.range;

      const fetchHeaders: Record<string, string> = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      };
      if (rangeHeader) {
        fetchHeaders.Range = rangeHeader;
      }

      let driveRes = await fetch(googleDownloadUrl, { headers: fetchHeaders, redirect: "follow" });

      // Fallback to uc?export=download if needed
      if (!driveRes.ok && driveRes.status !== 206) {
        const altUrl = `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}&confirm=t`;
        driveRes = await fetch(altUrl, { headers: fetchHeaders, redirect: "follow" });
      }

      let finalRes = driveRes;
      let contentType = finalRes.headers.get("content-type") || "";

      // If Google returns HTML (virus warning page for large files), follow the confirmation link to get real video
      if (contentType.includes("text/html")) {
        const html = await driveRes.text();
        const actionMatch = html.match(/action="([^"]+)"/);
        const confirmMatch = html.match(/name="confirm" value="([^"]+)"/) || html.match(/confirm=([^&"]+)/);
        const uuidMatch = html.match(/name="uuid" value="([^"]+)"/) || html.match(/uuid=([^&"]+)/);

        let finalDownloadUrl = "";
        if (actionMatch && actionMatch[1]) {
          const actionUrl = actionMatch[1].replace(/&amp;/g, "&");
          const confirmParam = confirmMatch ? `&confirm=${encodeURIComponent(confirmMatch[1])}` : "";
          const uuidParam = uuidMatch ? `&uuid=${encodeURIComponent(uuidMatch[1])}` : "";
          finalDownloadUrl = `${actionUrl}${actionUrl.includes("?") ? "" : "?"}${confirmParam}${uuidParam}`;
        } else if (confirmMatch && confirmMatch[1]) {
          finalDownloadUrl = `https://drive.usercontent.google.com/download?id=${encodeURIComponent(fileId)}&export=download&confirm=${encodeURIComponent(confirmMatch[1])}`;
        }

        if (finalDownloadUrl) {
          const cookies = driveRes.headers.get("set-cookie") || "";
          const confirmHeaders: Record<string, string> = { ...fetchHeaders };
          if (cookies) confirmHeaders.Cookie = cookies;

          finalRes = await fetch(finalDownloadUrl, { headers: confirmHeaders, redirect: "follow" });
          contentType = finalRes.headers.get("content-type") || "video/mp4";
        }
      }

      if (!finalRes.ok && finalRes.status !== 206) {
        return res.redirect(`https://drive.google.com/file/d/${encodeURIComponent(fileId)}/preview`);
      }

      const contentLength = finalRes.headers.get("content-length");
      const contentRange = finalRes.headers.get("content-range");
      const acceptRanges = finalRes.headers.get("accept-ranges") || "bytes";
      let finalContentType = contentType.includes("video") ? contentType : "video/mp4";

      res.status(finalRes.status === 206 ? 206 : 200);
      res.setHeader("Content-Type", finalContentType);
      res.setHeader("Accept-Ranges", acceptRanges);
      res.setHeader("Cache-Control", "public, max-age=86400");
      if (contentLength) res.setHeader("Content-Length", contentLength);
      if (contentRange) res.setHeader("Content-Range", contentRange);

      if (finalRes.body) {
        const stream = Readable.fromWeb(finalRes.body as any);
        req.on("close", () => {
          stream.destroy();
        });
        stream.pipe(res);
      } else {
        res.status(502).send("No video body returned");
      }

    } catch (err) {
      console.warn("[DriveVideoProxy] Video streaming error:", err);
      res.redirect(`https://drive.google.com/file/d/${encodeURIComponent(fileId)}/preview`);
    }
  });
}
