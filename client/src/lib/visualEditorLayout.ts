export function shouldOpenVisualEditorFromLocation(location: string, browserSearch = "") {
  const query = location.split("?")[1] || browserSearch.replace(/^\?/, "");
  return new URLSearchParams(query).get("visual") === "1";
}

export function isAqeeqStudioVisualPath(path: string) {
  return /^\/(?:|journal|albums|offers|showcase|articles|atheer|podcast|about|admissions|accreditations)$/.test(path)
    || /^\/(?:news|albums|offers|articles|atheer|podcast|journal)\/manage$/.test(path)
    || /^\/journal\/(?:issue\/[a-z0-9-]+|month\/\d{4}-\d{2}|archive|[a-z0-9-]+)$/.test(path)
    || /^\/albums\/[a-z0-9-]+$/.test(path)
    || /^\/articles\/[a-z0-9-]+$/.test(path);
}

export function visualImageWrapperClassName(className: string, isBrandMark: boolean) {
  const isAbsolute = /(?:^|\s)absolute(?:\s|$)/.test(className);
  const hasInset0 = /(?:^|\s)inset-0(?:\s|$)/.test(className);
  const fillsHeight = /(?:^|\s)h-full(?:\s|$)/.test(className);
  const fillsWidth = /(?:^|\s)w-full(?:\s|$)/.test(className);
  const pointerEventsNone = /(?:^|\s)pointer-events-none(?:\s|$)/.test(className);
  const zMatch = className.match(/(?:^|\s)(z-(?:0|10|20|30|40|50|\[\d+\]))(?:\s|$)/);
  const zClass = zMatch ? zMatch[1] : "";
  const fillsContainer = fillsHeight || fillsWidth;
  return [
    isAbsolute ? "absolute" : "",
    hasInset0 ? "inset-0" : "",
    zClass,
    pointerEventsNone ? "pointer-events-none" : "",
    fillsContainer ? "block" : "inline-block",
    "max-w-full",
    fillsHeight ? "h-full" : "",
    fillsWidth ? "w-full" : "",
    isBrandMark ? "" : "overflow-hidden",
  ].filter(Boolean).join(" ");
}
