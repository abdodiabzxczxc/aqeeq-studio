export function canManipulateLayer(isLocked: boolean | null | undefined) {
  return !isLocked;
}

export function unlockedLayerIds(ids: readonly string[], isLocked: (id: string) => boolean | null | undefined) {
  return ids.filter((id) => canManipulateLayer(isLocked(id)));
}
