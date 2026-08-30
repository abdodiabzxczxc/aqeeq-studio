type AlbumMediaForCover = { mediaUrl: string; thumbnailUrl: string | null; mediaType: "image" | "video" };

export function getAqeeqAlbumFallbackCover(media: AlbumMediaForCover[]) {
  return media.find((item) => item.mediaType === "image")?.thumbnailUrl || media[0]?.thumbnailUrl || null;
}

export function resolveAqeeqAlbumCover(currentCover: string | null, media: AlbumMediaForCover[]) {
  if (!currentCover) return getAqeeqAlbumFallbackCover(media);
  const coverStillExists = media.some((item) => item.mediaUrl === currentCover || item.thumbnailUrl === currentCover);
  return coverStillExists ? currentCover : currentCover.startsWith("/manus-storage/") ? currentCover : getAqeeqAlbumFallbackCover(media);
}
