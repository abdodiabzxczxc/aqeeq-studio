export type LayerSnapRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type LayerSnapGuides = {
  x?: number;
  y?: number;
};

function pointsForRect(rect: LayerSnapRect) {
  return {
    x: [rect.left, rect.left + rect.width / 2, rect.left + rect.width],
    y: [rect.top, rect.top + rect.height / 2, rect.top + rect.height],
  };
}

function closestMatch(ownPoints: number[], targets: number[], threshold: number) {
  return ownPoints
    .flatMap((point) => targets.map((target) => ({ delta: target - point, target })))
    .filter((match) => Math.abs(match.delta) <= threshold)
    .sort((first, second) => Math.abs(first.delta) - Math.abs(second.delta))[0];
}

/**
 * يلتقط حواف ومنتصف الطبقة المتحركة إلى حواف ومنتصف الطبقات الأخرى القريبة.
 * الإزاحة الناتجة بوحدة البكسل حتى لا تفقد المحاذاة الدقيقة بسبب شبكة 8px.
 */
export function snapLayerToElements(moving: LayerSnapRect, candidates: readonly LayerSnapRect[], threshold = 10) {
  const own = pointsForRect(moving);
  const targetX = candidates.flatMap((candidate) => pointsForRect(candidate).x);
  const targetY = candidates.flatMap((candidate) => pointsForRect(candidate).y);
  const matchX = closestMatch(own.x, targetX, threshold);
  const matchY = closestMatch(own.y, targetY, threshold);

  return {
    deltaX: matchX?.delta ?? 0,
    deltaY: matchY?.delta ?? 0,
    guides: {
      ...(matchX ? { x: matchX.target } : {}),
      ...(matchY ? { y: matchY.target } : {}),
    } satisfies LayerSnapGuides,
  };
}
