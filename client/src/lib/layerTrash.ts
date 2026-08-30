export const LAYER_TRASH_RETENTION_DAYS = 30;

export function layerTrashRemainingHours(expiresAt: Date, now = new Date()) {
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - now.getTime()) / 3_600_000));
}

export function layerTrashRemainingLabel(expiresAt: Date, now = new Date()) {
  const hours = layerTrashRemainingHours(expiresAt, now);
  return hours >= 48 ? `${Math.ceil(hours / 24)} يوم` : `${hours} ساعة`;
}
