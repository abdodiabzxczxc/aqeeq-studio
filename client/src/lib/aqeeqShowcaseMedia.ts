import { getAqeeqDriveFileId } from "./aqeeqAlbumMedia";

export type AqeeqShowcaseMedia = {
  mediaType: "image" | "video";
  mediaUrl: string;
  thumbnailUrl?: string | null;
};

const SOCIAL_PAGE_REGEX = /^(?:https?:\/\/)?(?:www\.)?(?:x\.com|twitter\.com|instagram\.com|youtube\.com|youtu\.be)\//i;

/** يستخدم رابط بروكسي Drive للصور — يضمن التحميل السريع بدون CORS أو انتهاء صلاحية الرابط */
export function getAqeeqShowcaseDisplaySource(media: AqeeqShowcaseMedia): string {
  // If thumbnailUrl is available, prioritize it
  if (media.thumbnailUrl) {
    const fileId = getAqeeqDriveFileId(media.thumbnailUrl);
    if (fileId) return `/api/drive-proxy/${fileId}`;
    return media.thumbnailUrl;
  }

  // If only mediaUrl is available, ensure it's not a social media webpage
  if (media.mediaUrl) {
    if (SOCIAL_PAGE_REGEX.test(media.mediaUrl)) {
      return "";
    }
    const fileId = getAqeeqDriveFileId(media.mediaUrl);
    if (fileId) return `/api/drive-proxy/${fileId}`;
    return media.mediaUrl;
  }

  return "";
}

export function getAqeeqShowcaseVideoStreamPath(slug: string, postId: number) {
  return `/api/showcases/${encodeURIComponent(slug)}/posts/${postId}/stream`;
}
