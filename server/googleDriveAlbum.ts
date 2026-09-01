export type AqeeqAlbumMediaType = "image" | "video";

export type DriveAlbumMedia = {
  driveFileId: string;
  mediaUrl: string;
  thumbnailUrl: string;
  fileName: string;
  mimeType: string;
  mediaType: AqeeqAlbumMediaType;
};

type DriveListResponse = {
  files?: Array<{ id?: string; name?: string; mimeType?: string; thumbnailLink?: string | null }>;
  nextPageToken?: string;
};

const DRIVE_HOSTS = new Set(["drive.google.com", "docs.google.com"]);
const MAX_IMPORTED_MEDIA = 250;

export function extractGoogleDriveFileId(urlStr: string): string | null {
  try {
    const url = new URL(urlStr.trim());
    const fileMatch = url.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch) return fileMatch[1];
    const folderMatch = url.pathname.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (folderMatch) return folderMatch[1];
    const idParam = url.searchParams.get("id");
    if (idParam) return idParam;
    const docMatch = url.pathname.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (docMatch) return docMatch[1];
    return null;
  } catch {
    return null;
  }
}

export async function getDrivePdfFileId(urlStr: string, request: typeof fetch = fetch): Promise<string> {
  const directId = extractGoogleDriveFileId(urlStr);
  if (urlStr.includes("/folders/")) {
    const folderId = directId;
    if (folderId) {
      try {
        const response = await request(`https://drive.google.com/drive/folders/${encodeURIComponent(folderId)}?usp=sharing`, {
          headers: { "User-Agent": "AlaqeeqStudio/1.0" },
        });
        if (response.ok) {
          const html = await response.text();
          const entry = /aria-label="([^"]+\.pdf[^"]*)"[^>]*\bssk=['"][^'"]*?:([A-Za-z0-9_-]{20,})-0-\d+['"]/gi;
          const match = entry.exec(html);
          if (match && match[2]) {
            return match[2];
          }
          const anyEntry = /aria-label="([^"]+)"[^>]*\bssk=['"][^'"]*?:([A-Za-z0-9_-]{20,})-0-\d+['"]/g;
          const anyMatch = anyEntry.exec(html);
          if (anyMatch && anyMatch[2]) {
            return anyMatch[2];
          }
        }
      } catch (err) {
        console.warn("[Drive] Failed to scan folder for PDF:", err);
      }
    }
  }
  if (!directId) throw new Error("تعذر استخراج معرّف ملف Drive من الرابط");
  return directId;
}

export function getGoogleDriveFolderId(folderUrl: string) {
  let url: URL;
  try {
    url = new URL(folderUrl.trim());
  } catch {
    throw new Error("رابط Google Drive غير صحيح");
  }
  if (!DRIVE_HOSTS.has(url.hostname)) throw new Error("استخدم رابط فولدر من Google Drive فقط");
  const pathId = url.pathname.match(/\/folders\/([a-zA-Z0-9_-]+)/)?.[1];
  const queryId = url.searchParams.get("id") || undefined;
  const fileId = url.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1];
  const folderId = pathId || queryId || fileId;
  if (!folderId || !/^[a-zA-Z0-9_-]+$/.test(folderId)) throw new Error("تعذر العثور على معرّف فولدر Drive في الرابط");
  return folderId;
}

export function getDriveMediaType(mimeType: string): AqeeqAlbumMediaType | null {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return null;
}

function getMediaTypeFromFileName(fileName: string): AqeeqAlbumMediaType | null {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "jpe", "png", "webp", "gif", "avif", "heic", "heif", "bmp", "tif", "tiff", "svg", "ico"].includes(extension)) return "image";
  if (["mp4", "webm", "mov", "m4v", "ogg", "ogv", "avi", "mkv", "3gp", "3g2", "flv", "wmv", "mpg", "mpeg", "m2ts", "mts"].includes(extension)) return "video";
  return null;
}

function mimeTypeFromFileName(fileName: string, mediaType: AqeeqAlbumMediaType) {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";
  const known: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", jpe: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif", avif: "image/avif", heic: "image/heic", heif: "image/heif", bmp: "image/bmp", tif: "image/tiff", tiff: "image/tiff", svg: "image/svg+xml", ico: "image/x-icon", mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime", m4v: "video/x-m4v", ogg: "video/ogg", ogv: "video/ogg", avi: "video/x-msvideo", mkv: "video/x-matroska", "3gp": "video/3gpp", "3g2": "video/3gpp2", flv: "video/x-flv", wmv: "video/x-ms-wmv", mpg: "video/mpeg", mpeg: "video/mpeg", m2ts: "video/mp2t", mts: "video/mp2t" };
  return known[extension] || `${mediaType}/*`;
}

function decodeDriveText(value: string) {
  return value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}

export function mapDriveFileToAlbumMedia(file: NonNullable<DriveListResponse["files"]>[number]): DriveAlbumMedia | null {
  if (!file.id || !file.name || !file.mimeType) return null;
  const mediaType = getDriveMediaType(file.mimeType);
  if (!mediaType) return null;
  const id = encodeURIComponent(file.id);
  return {
    driveFileId: file.id,
    mediaUrl: mediaType === "video" ? `https://drive.google.com/file/d/${id}/preview` : `/api/drive-proxy/${id}`,
    thumbnailUrl: `/api/drive-proxy/${id}`,
    fileName: file.name,
    mimeType: file.mimeType,
    mediaType,
  };
}

export function parsePublicDriveFolderHtml(html: string): DriveAlbumMedia[] {
  const results: DriveAlbumMedia[] = [];
  const seen = new Set<string>();
  const entry = /aria-label="([^"]+)"[^>]*\bssk=['"][^'"]*?:([A-Za-z0-9_-]{20,})-0-\d+['"]/g;
  for (const match of Array.from(html.matchAll(entry))) {
    const label = decodeDriveText(match[1] || "");
    const driveFileId = match[2] || "";
    const fileName = label.replace(/\s+(?:Image|Video)\s+(?:Shared|not shared)$/i, "");
    const mediaType = getMediaTypeFromFileName(fileName);
    if (!driveFileId || !mediaType || seen.has(driveFileId)) continue;
    seen.add(driveFileId);
    const id = encodeURIComponent(driveFileId);
    results.push({
      driveFileId,
      mediaUrl: mediaType === "video" ? `https://drive.google.com/file/d/${id}/preview` : `/api/drive-proxy/${id}`,
      thumbnailUrl: `/api/drive-proxy/${id}`,
      fileName,
      mimeType: mimeTypeFromFileName(fileName, mediaType),
      mediaType,
    });
  }
  return results;
}

export async function readGoogleDriveAlbum(folderUrl: string, request: typeof fetch = fetch): Promise<DriveAlbumMedia[]> {
  const folderId = getGoogleDriveFolderId(folderUrl);
  const response = await request(`https://drive.google.com/drive/folders/${encodeURIComponent(folderId)}?usp=sharing`, { headers: { "User-Agent": "AlaqeeqAlbum/1.0" } });
  if (!response.ok) throw new Error("تعذر قراءة فولدر Drive. تأكد أن الصلاحية «أي شخص لديه الرابط — مشاهد» وأن الرابط صحيح.");
  const media = parsePublicDriveFolderHtml(await response.text());
  if (!media.length) throw new Error("لم نجد صورًا أو فيديوهات ظاهرة في الفولدر. تأكد من أن الملفات داخل الفولدر نفسه ومفتوحة للمشاهدة.");
  return media.slice(0, MAX_IMPORTED_MEDIA);
}

export const SUPPORTED_AUDIO_EXTENSIONS = new Set([
  "mp3",
  "m4a",
  "wav",
  "aac",
  "ogg",
  "oga",
  "opus",
  "flac",
  "weba",
  "webm",
  "wma",
  "aiff",
  "aif",
  "mid",
  "midi",
  "amr",
  "ac3",
  "mka",
  "caf",
]);

export type DriveAudioTrack = {
  driveFileId: string;
  fileName: string;
  title: string;
  artist: string;
  category: string;
  mediaUrl: string;
  coverUrl: string;
  extension: string;
  mimeType: string;
};

export function getAudioMimeType(fileNameOrExt: string): string {
  const ext = fileNameOrExt.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, string> = {
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
  return map[ext] || "audio/mpeg";
}

export function formatSongMetadata(fileName: string): {
  title: string;
  artist: string;
  category: string;
  coverUrl: string;
} {
  // Remove file extension
  let clean = fileName.replace(/\.[^/.]+$/, "").trim();

  // Replace underscores and multiple dashes/spaces
  clean = clean.replace(/[_]+/g, " ").replace(/\s+/g, " ");

  // Strip leading track numbers like "01 - ", "01. ", "1 - ", "(1) "
  clean = clean.replace(/^(\(?\d+[\).\-\s]+)+/g, "").trim();

  let title = clean;
  let artist = "مدارس العقيق الأهلية";

  // Check if there is an artist separator: "Artist - Title" or "Title - Artist"
  if (clean.includes(" - ") || clean.includes(" — ") || clean.includes(" | ")) {
    const delimiter = clean.includes(" — ") ? " — " : clean.includes(" | ") ? " | " : " - ";
    const parts = clean.split(delimiter).map((p) => p.trim());
    if (parts.length >= 2) {
      const part0 = parts[0];
      const part1 = parts[1];
      const isArtist0 = /كورال|منشد|إنشاد|فرقة|أداء|صوت|طلاب|طالبات/i.test(part0);
      const isArtist1 = /كورال|منشد|إنشاد|فرقة|أداء|صوت|طلاب|طالبات/i.test(part1);

      if (isArtist0) {
        artist = part0;
        title = part1;
      } else if (isArtist1) {
        title = part0;
        artist = part1;
      } else {
        title = part0;
        artist = part1 || "مدارس العقيق الأهلية";
      }
    }
  }

  // Detect category based on title & clean name
  const text = (title + " " + clean).toLowerCase();
  let category = "النشيد المدرسي";

  if (text.includes("تخرج") || text.includes("نجاح") || text.includes("وداع")) {
    category = "حفل تخرج";
  } else if (text.includes("وطن") || text.includes("سعودي") || text.includes("المملكة") || text.includes("فخر")) {
    category = "أغنية وطنية";
  } else if (text.includes("بيانو") || text.includes("موسيقى") || text.includes("هدوء") || text.includes("عزف")) {
    category = "بيانو وهدوء";
  } else if (text.includes("صباح") || text.includes("طابور") || text.includes("إذاعة")) {
    category = "طابور الصباح";
  } else if (text.includes("احتفال") || text.includes("فرح") || text.includes("مهرجان") || text.includes("بهجة")) {
    category = "احتفالي";
  }

  return { title: title || fileName, artist, category, coverUrl: "" };
}

export function parsePublicDriveFolderAudioHtml(html: string): DriveAudioTrack[] {
  const results: DriveAudioTrack[] = [];
  const seen = new Set<string>();

  const processCandidate = (rawLabel: string, driveFileId: string) => {
    if (!driveFileId || seen.has(driveFileId)) return;
    const label = decodeDriveText(rawLabel || "");
    const cleanedName = label
      .replace(/\s+(?:Audio|Video|Image)?\s*(?:Shared|not shared)$/i, "")
      .trim();

    const ext = cleanedName.split(".").pop()?.toLowerCase() || "";
    if (!SUPPORTED_AUDIO_EXTENSIONS.has(ext)) return;

    seen.add(driveFileId);

    const { title, artist, category, coverUrl } = formatSongMetadata(cleanedName);
    const id = encodeURIComponent(driveFileId);

    results.push({
      driveFileId,
      fileName: cleanedName,
      title,
      artist,
      category,
      mediaUrl: `/api/drive-audio-proxy/${id}?ext=${ext}`,
      coverUrl,
      extension: ext,
      mimeType: getAudioMimeType(cleanedName),
    });
  };

  // Pattern 1: aria-label with ssk
  const sskEntry = /aria-label="([^"]+)"[^>]*\bssk=['"][^'"]*?:([A-Za-z0-9_-]{20,})-0-\d+['"]/g;
  for (const match of Array.from(html.matchAll(sskEntry))) {
    processCandidate(match[1], match[2]);
  }

  // Pattern 2: reverse ssk then aria-label
  const sskReverse = /ssk=['"][^'"]*?:([A-Za-z0-9_-]{20,})-0-\d+['"][^>]*aria-label="([^"]+)"/g;
  for (const match of Array.from(html.matchAll(sskReverse))) {
    processCandidate(match[2], match[1]);
  }

  // Pattern 3: data-id with aria-label
  const dataIdEntry = /data-id="([A-Za-z0-9_-]{20,})"[^>]*aria-label="([^"]+)"/g;
  for (const match of Array.from(html.matchAll(dataIdEntry))) {
    processCandidate(match[2], match[1]);
  }

  const ariaDataId = /aria-label="([^"]+)"[^>]*data-id="([A-Za-z0-9_-]{20,})"/g;
  for (const match of Array.from(html.matchAll(ariaDataId))) {
    processCandidate(match[1], match[2]);
  }

  // Pattern 4: embedded JSON array items
  const jsonRegex = /\["([A-Za-z0-9_-]{25,})",\s*(?:\[\s*)?"([^"]+\.(?:mp3|m4a|wav|aac|ogg|oga|opus|flac|weba|webm|wma|aiff|aif|mid|midi|amr|ac3|mka|caf))"/gi;
  for (const match of Array.from(html.matchAll(jsonRegex))) {
    processCandidate(match[2], match[1]);
  }

  return results;
}

export async function readGoogleDriveAudioFolder(folderUrl: string, request: typeof fetch = fetch): Promise<DriveAudioTrack[]> {
  const folderId = getGoogleDriveFolderId(folderUrl);
  const response = await request(`https://drive.google.com/drive/folders/${encodeURIComponent(folderId)}?usp=sharing`, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
  });
  if (!response.ok) {
    throw new Error("تعذر قراءة مجلد Google Drive. تأكد أن مشاركة الرابط مضبوطة على «أي شخص لديه الرابط - مشاهد» (Anyone with link - Viewer).");
  }

  const html = await response.text();
  const tracks = parsePublicDriveFolderAudioHtml(html);

  if (!tracks.length) {
    throw new Error("لم نتمكن من العثور على ملفات صوتية داخل هذا المجلد. تأكد من وجود ملفات صوتية (MP3, WAV, M4A, FLAC, AAC, OGG...) داخل المجلد نفسه وأن الصلاحية عامة.");
  }

  return tracks.slice(0, MAX_IMPORTED_MEDIA);
}
