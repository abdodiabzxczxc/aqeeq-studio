import express, { type Express } from "express";
import fs from "node:fs";
import path from "node:path";

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

// Lightweight ephemeral RAM cache (0 bytes disk storage)
const ephemeralMemoryCache = new Map<string, { buffer: Buffer; contentType: string }>();
const MAX_RAM_ITEMS = 60;

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
      res.setHeader("Content-Type", memCached.contentType);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      return res.send(memCached.buffer);
    }

    try {
      // 2. Fetch from Google CDN Edge
      const cdnUrl = `https://lh3.googleusercontent.com/d/${fileId}=w1200`;
      let driveRes = await fetch(cdnUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      });

      // Fallback 1: download URL
      if (!driveRes.ok) {
        const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
        driveRes = await fetch(downloadUrl, {
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
        });
      }

      // Fallback 2: thumbnail URL
      if (!driveRes.ok) {
        const thumbUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;
        driveRes = await fetch(thumbUrl, {
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
        });
      }

      if (!driveRes.ok) {
        return res.status(404).send("Image not found");
      }

      const contentType = driveRes.headers.get("content-type") || "image/jpeg";
      const arrayBuf = await driveRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);

      // Keep only in temporary RAM, 0 disk space used
      if (ephemeralMemoryCache.size >= MAX_RAM_ITEMS) {
        const oldestKey = ephemeralMemoryCache.keys().next().value;
        if (oldestKey) ephemeralMemoryCache.delete(oldestKey);
      }
      ephemeralMemoryCache.set(fileId, { buffer, contentType });

      // Tell the browser to cache it on the user device for 1 year (0 server space)
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      return res.send(buffer);
    } catch (err) {
      console.warn("[DriveProxy] Streaming image fallback error:", err);
      return res.status(500).send("Error streaming image");
    }
  });

  // Zero-Disk-Space High-Speed Google Drive Audio Streamer with Range & All-Format Support
  app.get("/api/drive-audio-proxy/:fileId", async (req, res) => {
    const { fileId } = req.params;
    if (!fileId || !/^[a-zA-Z0-9_-]+$/.test(fileId)) {
      return res.status(400).send("Invalid file ID");
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

    try {
      const googleDownloadUrl = `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}&confirm=t`;
      const rangeHeader = req.headers.range;

      const fetchHeaders: Record<string, string> = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      };
      if (rangeHeader) {
        fetchHeaders.Range = rangeHeader;
      }

      const driveRes = await fetch(googleDownloadUrl, { headers: fetchHeaders });

      if (!driveRes.ok && driveRes.status !== 206) {
        return res.status(driveRes.status).send("Failed to stream audio from Google Drive");
      }

      const rawContentType = driveRes.headers.get("content-type") || "";
      const contentLength = driveRes.headers.get("content-length");
      const contentRange = driveRes.headers.get("content-range");
      const acceptRanges = driveRes.headers.get("accept-ranges") || "bytes";

      const requestedExt = (req.query.ext as string)?.toLowerCase();
      const mimeMap: Record<string, string> = {
        mp3: "audio/mpeg",
        m4a: "audio/mp4",
        wav: "audio/wav",
        aac: "audio/aac",
        ogg: "audio/ogg",
        oga: "audio/ogg",
        opus: "audio/opus",
        flac: "audio/flac",
        weba: "audio/webm",
        webm: "audio/webm",
        wma: "audio/x-ms-wma",
        aiff: "audio/aiff",
        aif: "audio/aiff",
        mid: "audio/midi",
        midi: "audio/midi",
        amr: "audio/amr",
        ac3: "audio/ac3",
        mka: "audio/x-matroska",
        caf: "audio/x-caf",
      };

      let finalContentType = (requestedExt && mimeMap[requestedExt]) || rawContentType;
      if (!finalContentType || !finalContentType.includes("audio")) {
        finalContentType = "audio/mpeg";
      }

      res.status(driveRes.status);
      res.setHeader("Content-Type", finalContentType);
      res.setHeader("Accept-Ranges", acceptRanges);
      res.setHeader("Cache-Control", "public, max-age=86400");
      if (contentLength) res.setHeader("Content-Length", contentLength);
      if (contentRange) res.setHeader("Content-Range", contentRange);

      if (driveRes.body) {
        const reader = driveRes.body.getReader();
        const pump = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                res.end();
                break;
              }
              res.write(value);
            }
          } catch {
            res.end();
          }
        };
        await pump();
      } else {
        const buf = Buffer.from(await driveRes.arrayBuffer());
        res.send(buf);
      }
    } catch (err) {
      console.warn("[DriveAudioProxy] Audio streaming error:", err);
      res.status(500).send("Error streaming audio");
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
      const googleDownloadUrl = `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}&confirm=t`;
      const rangeHeader = req.headers.range;

      const fetchHeaders: Record<string, string> = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      };
      if (rangeHeader) {
        fetchHeaders.Range = rangeHeader;
      }

      const driveRes = await fetch(googleDownloadUrl, { headers: fetchHeaders });

      if (!driveRes.ok && driveRes.status !== 206) {
        return res.redirect(`https://drive.google.com/file/d/${encodeURIComponent(fileId)}/preview`);
      }

      const rawContentType = driveRes.headers.get("content-type") || "video/mp4";
      const contentLength = driveRes.headers.get("content-length");
      const contentRange = driveRes.headers.get("content-range");
      const acceptRanges = driveRes.headers.get("accept-ranges") || "bytes";

      let finalContentType = rawContentType.includes("video") ? rawContentType : "video/mp4";

      res.status(driveRes.status);
      res.setHeader("Content-Type", finalContentType);
      res.setHeader("Accept-Ranges", acceptRanges);
      res.setHeader("Cache-Control", "public, max-age=86400");
      if (contentLength) res.setHeader("Content-Length", contentLength);
      if (contentRange) res.setHeader("Content-Range", contentRange);

      if (driveRes.body) {
        const reader = driveRes.body.getReader();
        const pump = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                res.end();
                break;
              }
              res.write(value);
            }
          } catch {
            res.end();
          }
        };
        await pump();
      } else {
        const buf = Buffer.from(await driveRes.arrayBuffer());
        res.send(buf);
      }
    } catch (err) {
      console.warn("[DriveVideoProxy] Video streaming error:", err);
      res.redirect(`https://drive.google.com/file/d/${encodeURIComponent(fileId)}/preview`);
    }
  });
}
