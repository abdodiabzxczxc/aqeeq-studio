export type AqeeqAlbumImageSource = {
  mediaUrl: string;
  thumbnailUrl: string | null;
};

export function getAqeeqDriveFileId(mediaUrl: string): string | null {
  if (!mediaUrl) return null;
  const match = mediaUrl.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/) ||
    mediaUrl.match(/drive\.google\.com\/thumbnail\?id=([A-Za-z0-9_-]+)/) ||
    mediaUrl.match(/lh3\.googleusercontent\.com\/d\/([A-Za-z0-9_-]+)/) ||
    mediaUrl.match(/[?&]id=([A-Za-z0-9_-]+)/);
  return match?.[1] || null;
}

export function isAqeeqDriveVideo(mediaUrl: string): boolean {
  if (!mediaUrl) return false;
  return Boolean(
    mediaUrl.includes("drive.google.com/file/d/") ||
    mediaUrl.includes("drive.google.com/thumbnail") ||
    mediaUrl.includes("lh3.googleusercontent.com/d/") ||
    (mediaUrl.includes("drive.google.com") && (mediaUrl.includes("preview") || mediaUrl.includes("id="))) ||
    (mediaUrl.includes("drive.usercontent.google.com") && mediaUrl.includes("id="))
  );
}

export function getAqeeqDrivePreviewUrl(mediaUrl: string): string {
  const id = getAqeeqDriveFileId(mediaUrl);
  return id ? `https://drive.google.com/file/d/${id}/preview?rm=minimal` : mediaUrl;
}

export function getAqeeqDriveFallbackUrl(mediaUrl: string): string {
  const id = getAqeeqDriveFileId(mediaUrl);
  return id ? `https://drive.google.com/file/d/${id}/view` : mediaUrl;
}

export function getAqeeqDriveThumbnailUrl(mediaUrl: string, size = "w1600"): string | null {
  const id = getAqeeqDriveFileId(mediaUrl);
  return id ? `https://lh3.googleusercontent.com/d/${id}=${size}` : null;
}

export function getAqeeqAlbumImageSource(item: AqeeqAlbumImageSource) {
  const target = item.thumbnailUrl || item.mediaUrl;
  if (!target) return "";
  const fileId = getAqeeqDriveFileId(target) || getAqeeqDriveFileId(item.mediaUrl);
  if (fileId && (target.includes("drive.google.com") || target.includes("googleusercontent.com"))) {
    return `/api/drive-proxy/${fileId}`;
  }
  return target;
}



