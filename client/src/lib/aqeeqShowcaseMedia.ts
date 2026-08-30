import { getAqeeqDriveFileId } from "./aqeeqAlbumMedia";

export type AqeeqShowcaseMedia = {
  mediaType: "image" | "video";
  mediaUrl: string;
  thumbnailUrl?: string | null;
};

/** يستخدم رابط بروكسي أو مصغر Drive للصور حتى لا يتعطل العرض داخل المتصفح. */
export function getAqeeqShowcaseDisplaySource(media: AqeeqShowcaseMedia) {
  const target = media.thumbnailUrl || media.mediaUrl;
  if (!target) return "";
  const fileId = getAqeeqDriveFileId(target) || getAqeeqDriveFileId(media.mediaUrl);
  if (fileId && (target.includes("drive.google.com") || target.includes("googleusercontent.com"))) {
    return `/api/drive-proxy/${fileId}`;
  }
  return target;
}

export function getAqeeqShowcaseVideoStreamPath(slug: string, postId: number) {
  return `/api/showcases/${encodeURIComponent(slug)}/posts/${postId}/stream`;
}
