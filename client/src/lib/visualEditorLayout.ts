export function shouldOpenVisualEditorFromLocation(location: string, browserSearch = "") {
  const query = location.split("?")[1] || browserSearch.replace(/^\?/, "");
  return new URLSearchParams(query).get("visual") === "1";
}

export function isAqeeqStudioVisualPath(path: string) {
  return /^\/(?:|studio|journal|albums|offers|showcase|articles|atheer|podcast)$/.test(path)
    || /^\/(?:news|albums|offers|articles|atheer|podcast|journal)\/manage$/.test(path)
    || /^\/journal\/(?:issue\/[a-z0-9-]+|month\/\d{4}-\d{2}|archive|[a-z0-9-]+)$/.test(path)
    || /^\/albums\/[a-z0-9-]+$/.test(path)
    || /^\/articles\/[a-z0-9-]+$/.test(path);
}

export function visualImageWrapperClassName(className: string, isBrandMark: boolean) {
  const fillsHeight = /(?:^|\s)h-full(?:\s|$)/.test(className);
  const fillsWidth = /(?:^|\s)w-full(?:\s|$)/.test(className);
  const fillsContainer = fillsHeight || fillsWidth;
  return [
    fillsContainer ? "block" : "inline-block",
    "max-w-full",
    fillsHeight ? "h-full" : "",
    fillsWidth ? "w-full" : "",
    isBrandMark ? "" : "overflow-hidden",
  ].filter(Boolean).join(" ");
}
