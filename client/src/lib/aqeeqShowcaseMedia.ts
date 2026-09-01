import { getAqeeqDriveFileId } from "./aqeeqAlbumMedia";

export type AqeeqShowcaseMedia = {
  mediaType: "image" | "video";
  mediaUrl: string;
  thumbnailUrl?: string | null;
};

/** يستخدم رابط بروكسي Drive للصور — يضمن التحميل السريع بدون CORS أو انتهاء صلاحية الرابط */
export function getAqeeqShowcaseDisplaySource(media: AqeeqShowcaseMedia): string {
  // Try thumbnailUrl first, then mediaUrl — extract Drive File ID from either
  const sources = [media.thumbnailUrl, media.mediaUrl].filter(Boolean) as string[];

  for (const src of sources) {
    const fileId = getAqeeqDriveFileId(src);
    if (fileId) {
      // Always route Drive files through our fast in-memory proxy
      return `/api/drive-proxy/${fileId}`;
    }
  }

  // Non-Drive URL (Unsplash, CDN, direct): use as-is
  return sources[0] || "";
}

export function getAqeeqShowcaseVideoStreamPath(slug: string, postId: number) {
  return `/api/showcases/${encodeURIComponent(slug)}/posts/${postId}/stream`;
}
