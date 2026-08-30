export type VisualLayerTreeNode = { id: string; parentId?: string };

export function orderVisualLayerTree<T extends VisualLayerTreeNode>(layers: readonly T[]) {
  const ids = new Set(layers.map((layer) => layer.id));
  const childrenByParent = new Map<string | undefined, T[]>();
  layers.forEach((layer) => {
    const parentId = layer.parentId && ids.has(layer.parentId) ? layer.parentId : undefined;
    const children = childrenByParent.get(parentId) ?? [];
    children.push({ ...layer, parentId });
    childrenByParent.set(parentId, children);
  });
  const ordered: Array<T & { depth: number }> = [];
  const visit = (parentId: string | undefined, depth: number) => {
    (childrenByParent.get(parentId) ?? []).forEach((layer) => {
      ordered.push({ ...layer, depth });
      visit(layer.id, depth + 1);
    });
  };
  visit(undefined, 0);
  return ordered;
}
