export type CopyableLayerStyle = {
  textColor: string | null;
  bgColor: string | null;
  fontSize: string | null;
  padding: string | null;
  margin: string | null;
  borderRadius: string | null;
  layerOpacity: number;
};

export function extractCopyableStyle(style: CopyableLayerStyle): CopyableLayerStyle {
  return { ...style };
}

export function isBackgroundLikeLayer(id: string, label: string) {
  return /(background|backdrop|overlay|glow|خلفية|تدرج|إضاءة)/i.test(`${id} ${label}`);
}
