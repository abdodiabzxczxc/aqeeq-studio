import { Readable } from "node:stream";
import type { Response } from "express";
import { ZipArchive } from "archiver";

type DownloadableAlbumMedia = { id: number; mediaUrl: string; thumbnailUrl: string | null; fileName: string; mimeType: string; mediaType: "image" | "video" };
type DownloadableAlbum = { slug: string; title: string; media: DownloadableAlbumMedia[] };

function safeFileName(value: string, fallback: string) {
  const cleaned = value.replace(/[\\/:*?"<>|]+/g, "-").trim();
  return cleaned || fallback;
}

function isTrustedDriveMediaUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "drive.google.com" || url.hostname === "drive.usercontent.google.com");
  } catch {
    return false;
  }
}

function getDriveFileId(value: string) {
  const match = value.match(/^https:\/\/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)\//);
  return match?.[1] || null;
}

function getHiddenField(html: string, name: string) {
  const match = html.match(new RegExp(`name="${name}" value="([^"]+)"`));
  return match?.[1] || null;
}

async function fetchDriveVideoStream(mediaUrl: string, range?: string) {
  const fileId = getDriveFileId(mediaUrl);
  if (!fileId) throw new Error("رابط فيديو Drive غير صالح للتشغيل");
  const requestHeaders = { Accept: "video/*,application/octet-stream;q=0.9,*/*;q=0.1", ...(range ? { Range: range } : {}) };
  const initialUrl = new URL("https://drive.usercontent.google.com/download");
  initialUrl.searchParams.set("id", fileId);
  initialUrl.searchParams.set("export", "download");
  const initial = await fetch(initialUrl, { redirect: "follow", headers: requestHeaders });
  if (isDriveVideoResponse(initial)) return initial;
  const html = await initial.text();
  const confirm = getHiddenField(html, "confirm");
  const uuid = getHiddenField(html, "uuid");
  if (!confirm || !uuid) throw new Error("تعذر تجهيز فيديو Drive للتشغيل");
  const streamUrl = new URL("https://drive.usercontent.google.com/download");
  streamUrl.searchParams.set("id", fileId);
  streamUrl.searchParams.set("export", "download");
  streamUrl.searchParams.set("confirm", confirm);
  streamUrl.searchParams.set("uuid", uuid);
  const stream = await fetch(streamUrl, { redirect: "follow", headers: requestHeaders });
  if (!isDriveVideoResponse(stream)) throw new Error("تعذر تشغيل فيديو Drive");
  return stream;
}

function isDriveVideoResponse(response: globalThis.Response) {
  if (!response.ok || !response.body) return false;
  const contentType = response.headers.get("content-type") || "";
  const contentDisposition = response.headers.get("content-disposition") || "";
  return contentType.startsWith("video/") || Boolean(response.headers.get("content-range")) || (contentType.includes("application/octet-stream") && /\.mp4|video/i.test(contentDisposition));
}

function archiveFileName(item: DownloadableAlbumMedia, index: number, usedNames: Set<string>) {
  const extension = item.fileName.includes(".") ? "" : item.mediaType === "image" ? ".jpg" : ".mp4";
  const base = `${String(index + 1).padStart(2, "0")}-${safeFileName(item.fileName, `album-media-${item.id}${extension}`)}`;
  let candidate = base;
  let suffix = 2;
  while (usedNames.has(candidate)) candidate = `${base.replace(/(\.[^.]*)?$/, "")}-${suffix++}${base.match(/\.[^.]*$/)?.[0] || ""}`;
  usedNames.add(candidate);
  return candidate;
}

async function fetchAlbumMedia(url: string) {
  if (!isTrustedDriveMediaUrl(url)) throw new Error("رابط الملف غير مدعوم للتنزيل");
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok || !response.body) throw new Error("تعذر تنزيل أحد ملفات الألبوم من Drive");
  return response;
}

export async function streamAqeeqAlbumZip(res: Response, album: DownloadableAlbum) {
  const archive = new ZipArchive({ zlib: { level: 6 } });
  const fileName = `${safeFileName(album.title, album.slug)}-photos.zip`;
  res.status(200).set({ "Content-Type": "application/zip", "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`, "Cache-Control": "no-store" });
  archive.on("error", (error: Error) => res.destroy(error));
  archive.pipe(res);
  const usedNames = new Set<string>();
  for (let index = 0; index < album.media.length; index += 1) {
    const item = album.media[index];
    const response = await fetchAlbumMedia(item.thumbnailUrl || item.mediaUrl);
    archive.append(Readable.fromWeb(response.body as never), { name: archiveFileName(item, index, usedNames) });
  }
  await archive.finalize();
}

export async function streamAqeeqAlbumMedia(res: Response, item: DownloadableAlbumMedia) {
  const response = await fetchAlbumMedia(item.mediaUrl);
  const fileName = safeFileName(item.fileName, `album-media-${item.id}`);
  res.status(200).set({ "Content-Type": response.headers.get("content-type") || item.mimeType || "application/octet-stream", "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`, "Cache-Control": "no-store" });
  Readable.fromWeb(response.body as never).pipe(res);
}

export async function streamAqeeqDriveVideo(res: Response, mediaUrl: string, mimeType: string, range?: string) {
  const response = await fetchDriveVideoStream(mediaUrl, range);
  const hasRangeResponse = Boolean(response.headers.get("content-range"));
  const headers: Record<string, string> = {
    "Content-Type": mimeType?.startsWith("video/") ? mimeType : "video/mp4",
    "Content-Disposition": "inline; filename=video.mp4",
    "Cache-Control": "no-store",
    "Vary": "Range",
  };
  const contentLength = response.headers.get("content-length");
  const contentRange = response.headers.get("content-range");
  if (contentLength) headers["Content-Length"] = contentLength;
  if (contentRange) headers["Content-Range"] = contentRange;
  if (hasRangeResponse) headers["Accept-Ranges"] = "bytes";
  res.status(response.status === 206 && hasRangeResponse ? 206 : 200).set(headers);
  Readable.fromWeb(response.body as never).pipe(res);
}

export async function streamAqeeqAlbumVideo(res: Response, item: DownloadableAlbumMedia, range?: string) {
  if (item.mediaType !== "video") throw new Error("الوسيط ليس فيديو");
  await streamAqeeqDriveVideo(res, item.mediaUrl, item.mimeType, range);
}
