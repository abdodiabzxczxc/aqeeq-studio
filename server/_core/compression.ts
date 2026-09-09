import zlib from "zlib";
import { type Request, type Response, type NextFunction } from "express";

/**
 * High-performance, zero-dependency Gzip / Deflate compression middleware.
 * Intercepts res.write and res.end so it works seamlessly with tRPC, Express, and Vite!
 * Compresses JSON API responses (tRPC), HTML, JS bundles, CSS, and SVG by 70-85%.
 */
export function nativeCompressionMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.method === "HEAD") {
    return next();
  }

  const acceptEncoding = req.headers["accept-encoding"] || "";
  if (typeof acceptEncoding !== "string" || (!acceptEncoding.includes("gzip") && !acceptEncoding.includes("deflate"))) {
    return next();
  }

  // Skip already compressed media assets, streams, and zip downloads
  const url = req.url.toLowerCase();
  if (
    url.endsWith(".png") ||
    url.endsWith(".jpg") ||
    url.endsWith(".jpeg") ||
    url.endsWith(".webp") ||
    url.endsWith(".gif") ||
    url.endsWith(".zip") ||
    url.endsWith(".mp4") ||
    url.endsWith(".mp3") ||
    url.endsWith(".woff2") ||
    url.includes("/stream") ||
    url.includes("/download")
  ) {
    return next();
  }

  const useGzip = acceptEncoding.includes("gzip");
  const originalWrite = res.write;
  const originalEnd = res.end;

  let chunks: Buffer[] = [];
  let isIntercepting = true;

  res.write = function (chunk: any, encoding?: any, callback?: any): boolean {
    if (!isIntercepting || res.getHeader("content-encoding") || res.headersSent) {
      return originalWrite.call(res, chunk, encoding, callback);
    }
    if (chunk) {
      chunks.push(
        Buffer.isBuffer(chunk)
          ? chunk
          : Buffer.from(chunk, typeof encoding === "string" ? (encoding as BufferEncoding) : "utf-8")
      );
    }
    if (typeof encoding === "function") encoding();
    if (typeof callback === "function") callback();
    return true;
  } as any;

  res.end = function (chunk?: any, encoding?: any, callback?: any): Response {
    if (!isIntercepting || res.getHeader("content-encoding") || res.headersSent) {
      return originalEnd.call(res, chunk, encoding, callback);
    }

    if (chunk && typeof chunk !== "function") {
      chunks.push(
        Buffer.isBuffer(chunk)
          ? chunk
          : Buffer.from(chunk, typeof encoding === "string" ? (encoding as BufferEncoding) : "utf-8")
      );
    }

    const cb = typeof chunk === "function" ? chunk : typeof encoding === "function" ? encoding : callback;
    const totalBuffer = Buffer.concat(chunks);
    const contentType = String(res.getHeader("content-type") || "").toLowerCase();

    const shouldCompress =
      !contentType ||
      contentType.includes("text") ||
      contentType.includes("json") ||
      contentType.includes("javascript") ||
      contentType.includes("css") ||
      contentType.includes("svg") ||
      contentType.includes("xml");

    if (!shouldCompress || totalBuffer.length < 1024) {
      isIntercepting = false;
      return originalEnd.call(res, totalBuffer, cb);
    }

    isIntercepting = false;
    const compressFn = useGzip ? zlib.gzip : zlib.deflate;
    compressFn(totalBuffer, (err, compressed) => {
      if (err) {
        return originalEnd.call(res, totalBuffer, cb);
      }
      res.setHeader("Content-Encoding", useGzip ? "gzip" : "deflate");
      res.setHeader("Vary", "Accept-Encoding");
      res.removeHeader("Content-Length");
      res.setHeader("Content-Length", String(compressed.length));
      originalEnd.call(res, compressed, cb);
    });

    return res;
  } as any;

  next();
}
