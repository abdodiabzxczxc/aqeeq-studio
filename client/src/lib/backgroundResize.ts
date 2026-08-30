export type ResizeHandle = "n" | "nw" | "ne" | "s" | "sw" | "se";

export type LayerFrame = { x: number; y: number; width: number; height: number };
export type WorkspaceSize = { width: number; height: number };

export function resizeLayerFrame(frame: LayerFrame, deltaX: number, deltaY: number, handle: ResizeHandle, minimum = 24, lockAspectRatio = false): LayerFrame {
  const verticalOnly = handle === "n" || handle === "s";
  const growsFromLeft = handle === "nw" || handle === "sw";
  const growsFromTop = handle === "n" || handle === "nw" || handle === "ne";
  let nextWidth = verticalOnly ? frame.width : Math.max(minimum, growsFromLeft ? frame.width - deltaX : frame.width + deltaX);
  let nextHeight = Math.max(minimum, growsFromTop ? frame.height - deltaY : frame.height + deltaY);
  if (lockAspectRatio && !verticalOnly) {
    const ratio = frame.width / Math.max(frame.height, 1);
    if (Math.abs(deltaX / Math.max(frame.width, 1)) >= Math.abs(deltaY / Math.max(frame.height, 1))) nextHeight = Math.max(minimum, nextWidth / ratio);
    else nextWidth = Math.max(minimum, nextHeight * ratio);
  }
  return {
    x: !verticalOnly && growsFromLeft ? frame.x + frame.width - nextWidth : frame.x,
    y: growsFromTop ? frame.y + frame.height - nextHeight : frame.y,
    width: nextWidth,
    height: nextHeight,
  };
}

export function shouldShiftFollowingLayersAfterResize(handle: ResizeHandle | undefined) {
  return !["n", "nw", "ne"].includes(handle ?? "se");
}

export function verticalStackShift(previousHeight: number, nextHeight: number, layerTop: number, previousBottom: number, tolerance = 10) {
  if (layerTop < previousBottom - tolerance) return 0;
  return nextHeight - previousHeight;
}

export function fitLayerToWorkspace(frame: LayerFrame, workspace: WorkspaceSize, mode: "fill" | "contain", minimum = 24): LayerFrame {
  const scale = mode === "fill" ? Math.max(workspace.width / frame.width, workspace.height / frame.height) : Math.min(workspace.width / frame.width, workspace.height / frame.height);
  const width = Math.max(minimum, Math.round(frame.width * scale));
  const height = Math.max(minimum, Math.round(frame.height * scale));
  return { x: Math.round((workspace.width - width) / 2), y: Math.round((workspace.height - height) / 2), width, height };
}
