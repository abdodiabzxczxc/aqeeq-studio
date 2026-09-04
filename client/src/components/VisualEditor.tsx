import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { isAqeeqDriveVideo } from "@/lib/aqeeqAlbumMedia";
import { alignedLayerX, alignedLayerY, distributeLayerSpacing, type HorizontalLayerAlign, type VerticalLayerAlign } from "@/lib/layerAlignment";
import { snapToLayerGrid } from "@/lib/layerGrid";
import { snapLayerToElements } from "@/lib/layerSnap";
import { canManipulateLayer, unlockedLayerIds } from "@/lib/layerLock";
import { layerIntersectsSelection, selectionFrameFromPoints } from "@/lib/layerSelection";
import { designEffectStyle } from "@/lib/designEffects";
import { heroBackgroundSourceId, isSharedHeroBackground, sharedHeroBackgroundIds, sharedHeroElementCanonicalId, sharedHeroElementIds } from "@/lib/sharedHeroBackground";
import { usePublishedHomepage } from "@/contexts/PublishedHomepageContext";
import { fitLayerToWorkspace, resizeLayerFrame, shouldShiftFollowingLayersAfterResize, verticalStackShift, type ResizeHandle } from "@/lib/backgroundResize";
import { extractCopyableStyle, isBackgroundLikeLayer, type CopyableLayerStyle } from "@/lib/layerEditorTools";
import { backgroundSizeCss, isBackgroundLayer, isBackgroundSurface, isCoreBackgroundLayer, lowerLayerZIndex, resolveBackgroundOrigin, type BackgroundOrigin } from "@/lib/layerBackground";
import { resolveEditorToolbarSide, toggleEditorToolbarSide, type EditorToolbarSide } from "@/lib/editorToolbarSide";
import { isAqeeqStudioVisualPath, shouldOpenVisualEditorFromLocation, visualImageWrapperClassName } from "@/lib/visualEditorLayout";
import { AlignCenter, AlignLeft, AlignRight, AlignVerticalDistributeCenter, AlignVerticalJustifyCenter, AlignVerticalSpaceAround, Archive, ArrowLeftRight, Blocks, BookOpen, Calendar, Camera, Check, ChevronLeft, ChevronRight, Clapperboard, Clipboard, Copy, Download, Eye, EyeOff, ExternalLink, Grid3X3, GripHorizontal, Heart, ImageIcon, Instagram, Layers3, Link2, Lock, LogIn, LogOut, Mail, Magnet, MapPin, MapPinned, Maximize2, Menu, MessageCircle, Minimize2, Minus, Moon, Move, Palette, Phone, Plus, Printer, Redo2, RotateCcw, Rows3, Send, Settings2, Share2, ShieldCheck, SlidersHorizontal, Smartphone, Sparkles, Square, Star, Sun, Ticket, Trash2, Undo2, Users, Video, Volume2, Wand2, X } from "lucide-react";
import { createContext, type MouseEvent, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import ContextLayerToolbar from "./ContextLayerToolbar";
import { AqeeqVideoPoster } from "./AqeeqVideoPoster";
import DesignToolsPanel, { type DesignEffectsPatch } from "./DesignToolsPanel";
import EditorOperationsDrawer from "./EditorOperationsDrawer";
import LayerTrashPanel from "./LayerTrashPanel";
import MediaLibrary from "./MediaLibrary";
import PageMapDrawer from "./PageMapDrawer";
import VisualAddPanel from "./VisualAddPanel";
import VisualLayersPanel from "./VisualLayersPanel";
import SiteBuilderDrawer from "./SiteBuilderDrawer";

type VisualOverride = {
  id: number;
  pagePath: string;
  elementId: string;
  elementTag: "text" | "button" | "section" | "image" | "video" | "icon" | "section-block";
  contentText: string | null;
  mediaUrl: string | null;
  altText: string | null;
  linkUrl: string | null;
  alignment: "start" | "center" | "end" | "stretch" | null;
  textColor: string | null;
  bgColor: string | null;
  fontSize: string | null;
  padding: string | null;
  margin: string | null;
  borderRadius: string | null;
  layerX: number;
  layerY: number;
  layerWidth: number | null;
  layerHeight: number | null;
  layerZIndex: number;
  layerOpacity: number;
  backgroundSize: number;
  backgroundPositionX: number;
  backgroundPositionY: number;
  backgroundOverlay: number;
  customCss: string | null;
  isLocked: boolean;
  isHidden: boolean;
  status: "draft" | "published";
};

type ElementTag = VisualOverride["elementTag"];
type StylePatch = Omit<Partial<VisualOverride>, "id" | "pagePath" | "elementId" | "elementTag">;
type HorizontalAlign = HorizontalLayerAlign;
type VerticalAlign = VerticalLayerAlign;
type AlignmentGuides = { x?: number; y?: number };
type GroupTranslation = { ids: string[]; dx: number; dy: number } | null;

export function resolveHeroOverrideForPreview(overrideMap: Map<string, VisualOverride>, elementId: string) {
  const own = overrideMap.get(elementId);
  if (own) return own;
  const canonicalId = sharedHeroElementCanonicalId(elementId);
  const shared = overrideMap.get(canonicalId);
  if (!shared || canonicalId === elementId || !elementId.startsWith("home-mobile-")) return shared;
  return {
    ...shared,
    elementId,
    alignment: null,
    textColor: null,
    fontSize: null,
    padding: null,
    margin: null,
    borderRadius: null,
    layerX: 0,
    layerY: 0,
    layerWidth: null,
    layerHeight: null,
    layerZIndex: 0,
    layerOpacity: 100,
    backgroundSize: 100,
    backgroundPositionX: 50,
    backgroundPositionY: 50,
    backgroundOverlay: 0,
    customCss: null,
    isLocked: false,
    isHidden: false,
  };
}

export function clearLocalPreviewAfterReset(
  localOverrides: Record<string, VisualOverride>,
  pagePath: string,
  elementId: string,
) {
  const next = { ...localOverrides };
  sharedHeroElementIds(elementId).forEach((sharedElementId) => {
    delete next[`${pagePath}::${sharedElementId}`];
  });
  return next;
}

export function shouldConfirmMediaReplacement(currentMediaUrl: string, nextMediaUrl: string) {
  return Boolean(currentMediaUrl && currentMediaUrl !== nextMediaUrl);
}

type SelectionBox = { left: number; top: number; width: number; height: number } | null;
type PendingLayerDeletion = { elementId: string; elementTag: ElementTag; label: string; snapshot: string | null; previousLocalOverrides: Record<string, VisualOverride> };
type BackgroundFavorite = Pick<VisualOverride, "bgColor" | "mediaUrl" | "backgroundSize" | "backgroundPositionX" | "backgroundPositionY" | "backgroundOverlay"> & { id: string; name: string };
type ElementFavorite = { id: string; name: string; tag: ElementTag; draft: EditorDraft };
type BackgroundEditorPreferences = { aspectLocked: boolean; autoArrange: boolean };
const DEFAULT_BACKGROUND_EDITOR_PREFERENCES: BackgroundEditorPreferences = { aspectLocked: true, autoArrange: true };
type LayerBehavior = {
  device?: "all" | "mobile" | "desktop";
  animation?: "none" | "fade" | "rise" | "slide";
  revealOnScroll?: boolean;
  glass?: boolean;
  innerShadow?: boolean;
  gradientBorder?: boolean;
  texture?: boolean;
  filterPreset?: "original" | "mono" | "vivid" | "warm" | "cool" | "soft";
  blurAmount?: 0 | 2 | 5 | 9;
  shadowPreset?: "none" | "soft" | "bold" | "glow";
  blendMode?: "normal" | "screen" | "multiply" | "overlay";
  textGradient?: "none" | "gold" | "sky" | "violet";
  textShadow?: "none" | "soft" | "strong";
  textStroke?: "none" | "light" | "dark";
  letterSpacing?: "normal" | "wide" | "wider";
  lineHeight?: "normal" | "relaxed" | "loose";
  headingStyle?: "none" | "display" | "heading" | "body";
  buttonStyle?: "inherit" | "filled" | "outline" | "ghost";
  buttonHover?: "none" | "lift" | "glow" | "shimmer";
  openInNewTab?: boolean;
  backgroundOriginal?: BackgroundOrigin;
};

function parseLayerBehavior(raw?: string | null): LayerBehavior {
  try {
    const value = JSON.parse(raw || "{}") as LayerBehavior;
    return {
      ...value,
      device: ["all", "mobile", "desktop"].includes(value.device || "all") ? value.device : "all",
      animation: ["none", "fade", "rise", "slide"].includes(value.animation || "none") ? value.animation : "none",
    };
  } catch { return { device: "all", animation: "none" }; }
}

function serializeLayerBehavior(current: string, patch: Partial<LayerBehavior>) {
  return JSON.stringify({ ...parseLayerBehavior(current), ...patch });
}

type ReadyStyleTemplate = {
  id: string;
  label: string;
  hint: string;
  target: "text" | "button";
  previewClass: string;
  patch: Partial<Pick<EditorDraft, "textColor" | "bgColor" | "fontSize" | "padding" | "borderRadius">>;
  behavior?: Partial<LayerBehavior>;
};

const READY_STYLE_TEMPLATES: ReadyStyleTemplate[] = [
  { id: "text-display", label: "عنوان هوية العقيق", hint: "كبير وجريء", target: "text", previewClass: "bg-gradient-to-br from-[#085187] via-[#ab1d22] to-[#d9bd26] text-transparent bg-clip-text", patch: { fontSize: "clamp(2.3rem,6vw,5.7rem)", textColor: "#d9bd26" }, behavior: { headingStyle: "display", textGradient: "gold", textShadow: "strong" } },
  { id: "text-editorial", label: "عنوان تحريري", hint: "واضح وهادئ", target: "text", previewClass: "text-slate-100", patch: { fontSize: "clamp(1.6rem,3.5vw,3rem)", textColor: "#ffffff" }, behavior: { headingStyle: "heading", letterSpacing: "wide", textShadow: "soft" } },
  { id: "text-note", label: "ملاحظة ناعمة", hint: "وصف ومحتوى", target: "text", previewClass: "text-slate-300", patch: { fontSize: "1rem", textColor: "#cbd5e1" }, behavior: { headingStyle: "body", lineHeight: "relaxed" } },
  { id: "text-accent", label: "شارة حمراء", hint: "نص قصير بارز", target: "text", previewClass: "text-[#ab1d22]", patch: { fontSize: "0.78rem", textColor: "#ab1d22" }, behavior: { letterSpacing: "wider", textShadow: "soft" } },
  { id: "button-gold", label: "زر أصفر", hint: "الإجراء الأساسي", target: "button", previewClass: "bg-[#d9bd26] text-black", patch: { textColor: "#000000", bgColor: "#d9bd26", padding: "0.9rem 1.35rem", borderRadius: "999px" }, behavior: { buttonStyle: "filled", buttonHover: "lift" } },
  { id: "button-outline", label: "زر أزرق مخطط", hint: "إجراء ثانوي", target: "button", previewClass: "border border-[#085187] text-white", patch: { textColor: "#ffffff", bgColor: "transparent", padding: "0.85rem 1.25rem", borderRadius: "999px" }, behavior: { buttonStyle: "outline", buttonHover: "glow" } },
  { id: "button-glass", label: "زر زجاجي", hint: "رابط هادئ", target: "button", previewClass: "border border-white/20 bg-white/10 text-white", patch: { textColor: "#ffffff", bgColor: "rgba(255,255,255,.08)", padding: "0.85rem 1.25rem", borderRadius: "1rem" }, behavior: { buttonStyle: "ghost", buttonHover: "shimmer", glass: true } },
  { id: "button-square", label: "زر أخضر", hint: "مربع منظم", target: "button", previewClass: "bg-[#155439] text-white", patch: { textColor: "#ffffff", bgColor: "#155439", padding: "0.8rem 1.1rem", borderRadius: "0.85rem" }, behavior: { buttonStyle: "filled", buttonHover: "lift" } },
];

const BRAND_STYLE_PACKS = [
  { id: "alaqeeq-spectrum", label: "هوية الشعار الكاملة", preview: "linear-gradient(135deg,#085187 0 25%,#ab1d22 25% 50%,#d9bd26 50% 74%,#155439 74%)", textColor: "#d9bd26", bgColor: "linear-gradient(135deg,#000000,#085187 46%,#155439)", behavior: { textGradient: "gold", buttonStyle: "filled", buttonHover: "glow" } as Partial<LayerBehavior> },
  { id: "alaqeeq-blue", label: "أزرق العقيق", preview: "linear-gradient(135deg,#000000,#085187)", textColor: "#ffffff", bgColor: "linear-gradient(135deg,#000000,#085187)", behavior: { textGradient: "sky", buttonStyle: "filled", buttonHover: "lift" } as Partial<LayerBehavior> },
  { id: "alaqeeq-red", label: "أحمر العقيق", preview: "linear-gradient(135deg,#000000,#ab1d22)", textColor: "#ffffff", bgColor: "linear-gradient(135deg,#000000,#ab1d22)", behavior: { textGradient: "violet", buttonStyle: "ghost", buttonHover: "shimmer", glass: true } as Partial<LayerBehavior> },
  { id: "alaqeeq-green-yellow", label: "أخضر وأصفر", preview: "linear-gradient(135deg,#000000,#155439 56%,#d9bd26)", textColor: "#ffffff", bgColor: "linear-gradient(135deg,#000000,#155439)", behavior: { textShadow: "soft", buttonStyle: "filled", buttonHover: "lift" } as Partial<LayerBehavior> },
] as const;

type VisualEditorContextValue = {
  isEditing: boolean;
  isPreviewing: boolean;
  isMobilePreview: boolean;
  selectedId: string | null;
  selectedIds: string[];
  selectedLabel: string | null;
  selectedTag: ElementTag | null;
  pagePath: string | null;
  layerMode: boolean;
  gridEnabled: boolean;
  magnetEnabled: boolean;
  backgroundAspectLocked: boolean;
  backgroundAutoArrange: boolean;
  groupTranslation: GroupTranslation;
  toggleEditing: () => void;
  openHomeEditor: () => void;
  toggleLayerMode: () => void;
  toggleGrid: () => void;
  toggleMagnet: () => void;
  toggleBackgroundAspectLocked: () => void;
  toggleBackgroundAutoArrange: () => void;
  select: (elementId: string, elementTag: ElementTag, label: string, additive?: boolean) => void;
  alignSelected: (mode: HorizontalAlign) => void;
  alignSelectedVertically: (mode: VerticalAlign) => void;
  distributeSelected: (axis: "horizontal" | "vertical") => void;
  showAlignmentGuides: (guides: AlignmentGuides) => void;
  setGroupTranslation: (translation: GroupTranslation) => void;
  saveLayer: (elementId: string, patch: Pick<VisualOverride, "layerX" | "layerY" | "layerWidth" | "layerHeight" | "layerZIndex" | "isHidden"> & Partial<Pick<VisualOverride, "layerOpacity" | "isLocked">>) => void;
  deleteLayer: (elementId: string, label: string) => void;
  getOverride: (elementId: string) => VisualOverride | undefined;
  getOwnOverride: (elementId: string) => VisualOverride | undefined;
};

const VisualEditorContext = createContext<VisualEditorContextValue>({
  isEditing: false,
  isPreviewing: false,
  isMobilePreview: false,
  selectedId: null,
  selectedIds: [],
  selectedLabel: null,
  selectedTag: null,
  pagePath: null,
  layerMode: false,
  gridEnabled: true,
  magnetEnabled: true,
  backgroundAspectLocked: true,
  backgroundAutoArrange: true,
  groupTranslation: null,
  toggleEditing: () => undefined,
  openHomeEditor: () => undefined,
  toggleLayerMode: () => undefined,
  toggleGrid: () => undefined,
  toggleMagnet: () => undefined,
  toggleBackgroundAspectLocked: () => undefined,
  toggleBackgroundAutoArrange: () => undefined,
  select: () => undefined,
  alignSelected: () => undefined,
  alignSelectedVertically: () => undefined,
  distributeSelected: () => undefined,
  showAlignmentGuides: () => undefined,
  setGroupTranslation: () => undefined,
  saveLayer: () => undefined,
  deleteLayer: () => undefined,
  getOverride: () => undefined,
  getOwnOverride: () => undefined,
});

type EditorDraft = { contentText: string; mediaUrl: string; altText: string; linkUrl: string; alignment: "start" | "center" | "end" | "stretch"; textColor: string; bgColor: string; fontSize: string; padding: string; margin: string; borderRadius: string; layerX: number; layerY: number; layerWidth: number | null; layerHeight: number | null; layerZIndex: number; layerOpacity: number; backgroundSize: number; backgroundPositionX: number; backgroundPositionY: number; backgroundOverlay: number; customCss: string; isLocked: boolean; isHidden: boolean };
const EMPTY_DRAFT: EditorDraft = { contentText: "", mediaUrl: "", altText: "", linkUrl: "", alignment: "center", textColor: "", bgColor: "", fontSize: "", padding: "", margin: "", borderRadius: "", layerX: 0, layerY: 0, layerWidth: null, layerHeight: null, layerZIndex: 0, layerOpacity: 100, backgroundSize: 100, backgroundPositionX: 50, backgroundPositionY: 50, backgroundOverlay: 0, customCss: "", isLocked: false, isHidden: false };
const EMPTY_OVERRIDES: VisualOverride[] = [];

const VISUAL_ICON_OPTIONS = [
  { id: "sparkles", label: "بريق", Icon: Sparkles }, { id: "star", label: "نجمة", Icon: Star }, { id: "sun", label: "شمس", Icon: Sun }, { id: "moon", label: "قمر", Icon: Moon },
  { id: "menu", label: "قائمة", Icon: Menu }, { id: "share", label: "مشاركة", Icon: Share2 }, { id: "link", label: "رابط", Icon: Link2 }, { id: "external", label: "فتح", Icon: ExternalLink }, { id: "login", label: "تسجيل الدخول", Icon: LogIn }, { id: "logout", label: "تسجيل الخروج", Icon: LogOut },
  { id: "filter", label: "فلترة", Icon: SlidersHorizontal },
  { id: "calendar", label: "تاريخ", Icon: Calendar }, { id: "location", label: "موقع", Icon: MapPin }, { id: "guests", label: "ضيوف", Icon: Users }, { id: "heart", label: "قلب", Icon: Heart },
  { id: "ticket", label: "تذكرة", Icon: Ticket }, { id: "phone", label: "هاتف", Icon: Phone }, { id: "mail", label: "بريد", Icon: Mail }, { id: "instagram", label: "Instagram", Icon: Instagram },
  { id: "whatsapp", label: "رسالة", Icon: MessageCircle }, { id: "send", label: "إرسال", Icon: Send }, { id: "close", label: "إغلاق", Icon: X },
  { id: "archive", label: "أرشيف", Icon: Archive }, { id: "settings", label: "إعدادات", Icon: Settings2 }, { id: "download", label: "تحميل", Icon: Download }, { id: "print", label: "طباعة", Icon: Printer },
  { id: "sound", label: "صوت", Icon: Volume2 }, { id: "fullscreen", label: "ملء الشاشة", Icon: Maximize2 }, { id: "previous", label: "السابق", Icon: ChevronRight }, { id: "next", label: "التالي", Icon: ChevronLeft }, { id: "video", label: "فيديو", Icon: Video },
  { id: "book", label: "مجلة", Icon: BookOpen }, { id: "camera", label: "كاميرا", Icon: Camera }, { id: "clapperboard", label: "عروض", Icon: Clapperboard },
] as const;

const VISUAL_ICON_COMPONENTS = Object.fromEntries(VISUAL_ICON_OPTIONS.map((option) => [option.id, option.Icon])) as Record<string, typeof Sparkles>;

export function resolveVisualIconName(value: string | null | undefined, fallback = "sparkles") {
  const candidate = (value || fallback).trim().toLowerCase();
  return VISUAL_ICON_COMPONENTS[candidate] ? candidate : fallback;
}

export function hashString(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export function getElementPath(el: Element): string {
  const parts: string[] = [];
  let curr: Element | null = el;
  while (curr && curr !== document.body && parts.length < 4) {
    let name = curr.tagName.toLowerCase();
    if (curr.id) {
      name += "#" + curr.id;
      parts.unshift(name);
      break;
    }
    const idx = Array.from(curr.parentElement?.children || []).indexOf(curr);
    name += `:nth-child(${idx + 1})`;
    parts.unshift(name);
    curr = curr.parentElement;
  }
  return parts.join(">");
}

function normalizedPath(pathname: string) {
  const path = pathname.split("?")[0];
  if (path === "/" || path === "/studio") return "/";
  return isAqeeqStudioVisualPath(path) || /^\/(?:dashboard|control|scan|live|live\/ideas|news|maison)$/.test(path) || /^\/(?:event|workspace)\/\d+(?:\/(?:stage|memories|premiere|honor|portrait))?$/.test(path) || /^\/(?:guest\/[a-zA-Z0-9-]+|news\/[a-z0-9-]+|news\/month\/\d{4}-\d{2}|page\/[a-z0-9-]{3,96})$/.test(path) ? path : null;
}


export function resolveBackgroundSource(mediaUrl: string | null | undefined, bgColor: string | null | undefined, fallback?: string) {
  return mediaUrl || (bgColor ? undefined : fallback);
}

export function heroBackgroundLayerFor(elementId: string) {
  return elementId === "home-mobile-hero-section" || elementId.startsWith("home-mobile-") ? "home-mobile-hero-image" : "home-cinematic-hero-image";
}

export function shouldShowEditorChrome(isEditing: boolean, isPreviewing: boolean) {
  return isEditing && !isPreviewing;
}

export function shouldShowPropertiesPanel(isEditing: boolean, hasSelection: boolean, isPreviewing: boolean, isMobilePreview: boolean) {
  return isEditing && hasSelection && !isPreviewing && !isMobilePreview;
}

export function shouldShowWorkspacePanel(isEditing: boolean, isPreviewing: boolean, isOpen: boolean) {
  return isEditing && !isPreviewing && isOpen;
}

function toStyle(override?: VisualOverride): React.CSSProperties {
  if (!override) return {};
  const behavior = parseLayerBehavior(override.customCss);
  const safeZIndex = isBackgroundLayer(override.elementId) ? Math.max(0, override.layerZIndex) : override.layerZIndex;
  const hasGeometry = Boolean(override.layerX || override.layerY || override.layerWidth || override.layerHeight || safeZIndex);
  const isCroppedSection = Boolean(override.layerHeight && ["section", "section-block"].includes(override.elementTag));
  const usesGradient = Boolean(override.bgColor?.includes("gradient("));
  const usesBackgroundImage = Boolean(override.mediaUrl && ["section", "section-block", "text", "button"].includes(override.elementTag));
  const overlay = Math.max(0, Math.min(100, override.backgroundOverlay ?? 0)) / 100;
  const texture = behavior.texture ? "radial-gradient(rgba(255,255,255,.14) .65px,transparent .8px),radial-gradient(rgba(0,0,0,.16) .6px,transparent .8px)" : "";
  const imageBase = usesBackgroundImage ? (overlay ? `linear-gradient(rgba(0,0,0,${overlay}),rgba(0,0,0,${overlay})), url(\"${override.mediaUrl}\")` : `url(\"${override.mediaUrl}\")`) : usesGradient ? override.bgColor || "" : "";
  const textGradient = behavior.textGradient === "gold" ? "linear-gradient(135deg,#fff2bd,#e5b84f 45%,#93610d)" : behavior.textGradient === "sky" ? "linear-gradient(135deg,#e2f7ff,#55c8f1 50%,#5b83ec)" : behavior.textGradient === "violet" ? "linear-gradient(135deg,#f3e8ff,#c68aff 48%,#8e58e8)" : "";
  const textShadow = behavior.textShadow === "soft" ? "0 3px 16px rgba(0,0,0,.32)" : behavior.textShadow === "strong" ? "0 4px 0 rgba(0,0,0,.48),0 12px 30px rgba(0,0,0,.42)" : undefined;
  const textStroke = behavior.textStroke === "light" ? "1px rgba(255,255,255,.45)" : behavior.textStroke === "dark" ? "1px rgba(0,0,0,.6)" : undefined;
  const designEffects = designEffectStyle(behavior);
  const buttonStyle = override.elementTag === "button" ? behavior.buttonStyle : "inherit";
  const resolvedColor = buttonStyle === "filled" ? "#17100a" : buttonStyle === "outline" ? override.textColor || "#f5df9d" : buttonStyle === "ghost" ? override.textColor || "#fff" : textGradient ? undefined : override.textColor || undefined;
  const resolvedBackgroundColor = behavior.glass ? "rgba(18,23,33,.38)" : buttonStyle === "filled" ? "#e5b84f" : buttonStyle === "outline" ? "transparent" : buttonStyle === "ghost" ? "rgba(255,255,255,.07)" : usesGradient ? undefined : override.bgColor || undefined;
  const resolvedLetterSpacing = behavior.headingStyle === "display" ? "-.04em" : behavior.headingStyle === "heading" ? "-.02em" : behavior.letterSpacing === "wide" ? ".055em" : behavior.letterSpacing === "wider" ? ".12em" : undefined;
  const resolvedLineHeight = behavior.headingStyle === "display" ? "1" : behavior.headingStyle === "heading" ? "1.16" : behavior.headingStyle === "body" ? "1.7" : behavior.lineHeight === "relaxed" ? "1.55" : behavior.lineHeight === "loose" ? "1.8" : undefined;
  return {
    color: resolvedColor,
    backgroundColor: resolvedBackgroundColor,
    ...(imageBase || texture ? { backgroundImage: [texture, imageBase].filter(Boolean).join(","), backgroundSize: texture ? `7px 7px,${backgroundSizeCss(override.backgroundSize)}` : backgroundSizeCss(override.backgroundSize), backgroundPosition: texture ? `0 0,${override.backgroundPositionX ?? 50}% ${override.backgroundPositionY ?? 50}%` : `${override.backgroundPositionX ?? 50}% ${override.backgroundPositionY ?? 50}%`, backgroundRepeat: texture ? "repeat,no-repeat" : "no-repeat", backgroundBlendMode: texture ? "soft-light,normal" : undefined } : {}),
    fontSize: override.fontSize || undefined,
    padding: override.padding || undefined,
    margin: override.margin || undefined,
    borderRadius: override.borderRadius || undefined,
    ...(textGradient ? { backgroundImage: textGradient, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" } : {}),
    textShadow,
    WebkitTextStroke: textStroke,
    letterSpacing: resolvedLetterSpacing,
    lineHeight: resolvedLineHeight,
    ...(designEffects.filter ? { filter: designEffects.filter } : {}),
    ...(designEffects.mixBlendMode ? { mixBlendMode: designEffects.mixBlendMode } : {}),
    ...(behavior.headingStyle === "display" ? { fontWeight: 900 } : behavior.headingStyle === "heading" ? { fontWeight: 800 } : behavior.headingStyle === "body" ? { fontWeight: 500 } : {}),
    ...(behavior.glass ? { backdropFilter: "blur(16px) saturate(1.25)", WebkitBackdropFilter: "blur(16px) saturate(1.25)", border: "1px solid rgba(255,255,255,.20)" } : {}),
    ...(behavior.innerShadow || designEffects.boxShadow ? { boxShadow: [behavior.innerShadow ? "inset 0 1px 0 rgba(255,255,255,.16), inset 0 -12px 28px rgba(0,0,0,.22)" : "", designEffects.boxShadow || ""].filter(Boolean).join(",") } : {}),
    ...(behavior.gradientBorder ? { border: "1px solid transparent", borderImage: "linear-gradient(135deg,#fff2bd,#e5b84f 45%,#6e4210) 1" } : {}),
    ...(buttonStyle === "filled" ? { border: "1px solid #e5b84f" } : buttonStyle === "outline" ? { border: "1px solid rgba(229,184,79,.72)" } : buttonStyle === "ghost" ? { border: "1px solid rgba(255,255,255,.16)" } : {}),
    transform: hasGeometry ? `translate3d(${override.layerX}px, ${override.layerY}px, 0)` : undefined,
    width: override.layerWidth ? `${override.layerWidth}px` : undefined,
    height: override.layerHeight ? `${override.layerHeight}px` : undefined,
    minHeight: isCroppedSection ? 0 : undefined,
    overflow: isCroppedSection ? "hidden" : undefined,
    position: hasGeometry ? "relative" : undefined,
    zIndex: hasGeometry ? safeZIndex : undefined,
    opacity: override.layerOpacity / 100,
    display: override.isHidden ? "none" : undefined,
  };
}

export function VisualEditorProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [pathname, navigate] = useLocation();
  const pagePath = normalizedPath(pathname);
  const openEditorFromQuery = shouldOpenVisualEditorFromLocation(pathname, window.location.search);
  const isAdmin = isAuthenticated && user?.role === "admin";
  const [isEditing, setIsEditing] = useState(false);
  const [layerMode, setLayerMode] = useState(false);
  const [gridEnabled, setGridEnabled] = useState(true);
  const [magnetEnabled, setMagnetEnabled] = useState(true);
  const [backgroundPreferences, setBackgroundPreferences] = useState<Record<string, BackgroundEditorPreferences>>(() => {
    try { return JSON.parse(window.localStorage.getItem("alaqeeq-background-editor-preferences") || "{}") as Record<string, BackgroundEditorPreferences>; } catch { return {}; }
  });
  const pageBackgroundPreferences = pagePath ? backgroundPreferences[pagePath] || DEFAULT_BACKGROUND_EDITOR_PREFERENCES : DEFAULT_BACKGROUND_EDITOR_PREFERENCES;
  const backgroundAspectLocked = pageBackgroundPreferences.aspectLocked;
  const backgroundAutoArrange = pageBackgroundPreferences.autoArrange;
  const [mobilePreview, setMobilePreview] = useState(false);
  const [operationsOpen, setOperationsOpen] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [addPanelOpen, setAddPanelOpen] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const [designToolsOpen, setDesignToolsOpen] = useState(false);
  const [trashOpen, setTrashOpen] = useState(false);
  const [workspaceMediaOpen, setWorkspaceMediaOpen] = useState(false);
  const [pageMapOpen, setPageMapOpen] = useState(false);
  const [builderTab, setBuilderTab] = useState<"sections" | "pages">("sections");
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [selected, setSelected] = useState<{ id: string; tag: ElementTag; label: string } | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuides>({});
  const [groupTranslation, setGroupTranslation] = useState<GroupTranslation>(null);
  const [selectionBox, setSelectionBox] = useState<SelectionBox>(null);
  const marqueeStart = useRef<{ x: number; y: number } | null>(null);
  const editorSurfaceRef = useRef<HTMLDivElement>(null);
  const [lastSaved, setLastSaved] = useState<{ element: { id: string; tag: ElementTag }; previous?: VisualOverride } | null>(null);
  const [pendingLayerDeletion, setPendingLayerDeletion] = useState<PendingLayerDeletion | null>(null);
  const [localOverrides, setLocalOverrides] = useState<Record<string, VisualOverride>>({});
  const [undoStack, setUndoStack] = useState<Record<string, VisualOverride>[]>([]);
  const [redoStack, setRedoStack] = useState<Record<string, VisualOverride>[]>([]);
  const [styleClipboard, setStyleClipboard] = useState<CopyableLayerStyle | null>(null);
  const [groupedIds, setGroupedIds] = useState<string[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const draftPreviewEnabled = useRef(false);
  const [toolGroup, setToolGroup] = useState<"design" | "arrange" | "publish" | null>(null);
  const [showAdvancedProperties, setShowAdvancedProperties] = useState(false);
  const [sidebarsCollapsed, setSidebarsCollapsed] = useState(false);
  const [toolbarSide, setToolbarSide] = useState<EditorToolbarSide>(() => {
    try { return resolveEditorToolbarSide(window.localStorage.getItem("alaqeeq-editor-toolbar-side")); } catch { return "left"; }
  });
  const [rightNavHidden, setRightNavHidden] = useState(false);
  const [topbarHidden, setTopbarHidden] = useState(false);
  const [panelAnchorTop, setPanelAnchorTop] = useState<number | null>(null);
  const [backgroundFavorites, setBackgroundFavorites] = useState<BackgroundFavorite[]>(() => {
    try { return JSON.parse(window.localStorage.getItem("alaqeeq-background-favorites") || "[]") as BackgroundFavorite[]; } catch { return []; }
  });
  const [elementFavorites, setElementFavorites] = useState<ElementFavorite[]>(() => {
    try { return JSON.parse(window.localStorage.getItem("alaqeeq-element-favorites") || "[]") as ElementFavorite[]; } catch { return []; }
  });
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [pendingMediaAsset, setPendingMediaAsset] = useState<{ url: string; altText: string | null } | null>(null);

  const [inspectorPosition, setInspectorPosition] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = window.localStorage.getItem("alaqeeq-inspector-pos");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed.x === "number" && typeof parsed.y === "number") {
            const clampedX = Math.max(10, Math.min(window.innerWidth - 340, parsed.x));
            const clampedY = Math.max(10, Math.min(window.innerHeight - 80, parsed.y));
            return { x: clampedX, y: clampedY };
          }
        }
      } catch {}
      return { x: Math.max(16, window.innerWidth - 440), y: 76 };
    }
    return { x: 24, y: 76 };
  });

  const [inspectorSize, setInspectorSize] = useState<{ width: number; height: number }>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = window.localStorage.getItem("alaqeeq-inspector-size");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed.width === "number" && typeof parsed.height === "number") {
            return {
              width: Math.max(320, Math.min(800, parsed.width)),
              height: Math.max(260, Math.min(window.innerHeight - 60, parsed.height)),
            };
          }
        }
      } catch {}
      return { width: 400, height: Math.min(680, window.innerHeight - 100) };
    }
    return { width: 400, height: 640 };
  });

  const [inspectorDocked, setInspectorDocked] = useState<boolean>(false);
  const [inspectorMinimized, setInspectorMinimized] = useState<boolean>(false);
  const inspectorRef = useRef<HTMLElement | null>(null);

  const startInspectorDrag = (event: React.PointerEvent) => {
    if (inspectorDocked) return;
    if ((event.target as HTMLElement).closest("button, input, textarea, select, a")) return;
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const initialPos = { ...inspectorPosition };
    let currentPos = { ...initialPos };

    const onPointerMove = (e: PointerEvent) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const maxX = Math.max(10, window.innerWidth - inspectorSize.width - 10);
      const maxY = Math.max(10, window.innerHeight - 80);
      const newX = Math.max(10, Math.min(maxX, initialPos.x + dx));
      const newY = Math.max(10, Math.min(maxY, initialPos.y + dy));
      currentPos = { x: newX, y: newY };
      setInspectorPosition(currentPos);
    };

    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      try {
        window.localStorage.setItem("alaqeeq-inspector-pos", JSON.stringify(currentPos));
      } catch {}
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const startInspectorResize = (event: React.PointerEvent, direction: "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw") => {
    if (inspectorDocked) return;
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startY = event.clientY;
    const initialWidth = inspectorSize.width;
    const initialHeight = inspectorRef.current?.offsetHeight || inspectorSize.height;
    const initialPos = { ...inspectorPosition };
    let currentWidth = initialWidth;
    let currentHeight = initialHeight;
    let currentX = initialPos.x;
    let currentY = initialPos.y;

    const onPointerMove = (e: PointerEvent) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      let newWidth = initialWidth;
      let newHeight = initialHeight;
      let newX = initialPos.x;
      let newY = initialPos.y;

      if (direction.includes("w")) {
        newWidth = Math.max(320, Math.min(800, initialWidth - dx));
        newX = Math.max(10, Math.min(window.innerWidth - 320, initialPos.x + (initialWidth - newWidth)));
      } else if (direction.includes("e")) {
        newWidth = Math.max(320, Math.min(800, initialWidth + dx));
      }

      if (direction.includes("n")) {
        newHeight = Math.max(260, Math.min(window.innerHeight - 60, initialHeight - dy));
        newY = Math.max(10, Math.min(window.innerHeight - 260, initialPos.y + (initialHeight - newHeight)));
      } else if (direction.includes("s")) {
        newHeight = Math.max(260, Math.min(window.innerHeight - initialPos.y - 20, initialHeight + dy));
      }

      currentWidth = newWidth;
      currentHeight = newHeight;
      currentX = newX;
      currentY = newY;

      setInspectorSize({ width: newWidth, height: newHeight });
      if (direction.includes("w") || direction.includes("n")) {
        setInspectorPosition({ x: newX, y: newY });
      }
    };

    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      try {
        window.localStorage.setItem("alaqeeq-inspector-size", JSON.stringify({ width: currentWidth, height: currentHeight }));
        window.localStorage.setItem("alaqeeq-inspector-pos", JSON.stringify({ x: currentX, y: currentY }));
      } catch {}
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const utils = trpc.useUtils();
  const { snapshot } = usePublishedHomepage();
  useEffect(() => {
    if (openEditorFromQuery && isAdmin && pagePath) {
      setIsEditing(true);
      setSelected(null);
      setSelectedIds([]);
      setLayerMode(false);
    }
  }, [isAdmin, openEditorFromQuery, pagePath]);
  const pageCacheKey = `aqeeq-overrides-${pagePath ?? "/"}`;
  const initialCachedOverrides = useMemo(() => {
    try {
      if (typeof window === "undefined") return EMPTY_OVERRIDES;
      const raw = localStorage.getItem(pageCacheKey);
      return raw ? JSON.parse(raw) : EMPTY_OVERRIDES;
    } catch {
      return EMPTY_OVERRIDES;
    }
  }, [pageCacheKey]);

  const publicListQuery = trpc.visualEditor.publicList.useQuery({ pagePath: pagePath ?? "/" }, { enabled: Boolean(pagePath && pagePath !== "/"), staleTime: 60_000, refetchOnWindowFocus: false, refetchOnReconnect: true, refetchInterval: false });
  const fetchedPublicOverrides = publicListQuery.data ?? (initialCachedOverrides.length > 0 ? initialCachedOverrides : EMPTY_OVERRIDES);
  const publicOverrides = pagePath === "/" ? (snapshot?.overrides ?? (initialCachedOverrides.length > 0 ? initialCachedOverrides : EMPTY_OVERRIDES)) : fetchedPublicOverrides;
  const editorOverridesQuery = trpc.visualEditor.list.useQuery({ pagePath: pagePath ?? "/" }, { enabled: Boolean(pagePath && isAdmin && isEditing), staleTime: 60_000, refetchOnWindowFocus: false, refetchOnReconnect: true, refetchInterval: false });
  const editorOverrides = editorOverridesQuery.data ?? (initialCachedOverrides.length > 0 ? initialCachedOverrides : EMPTY_OVERRIDES);

  useEffect(() => {
    const dataToCache = isAdmin && isEditing ? editorOverridesQuery.data : (pagePath === "/" ? snapshot?.overrides : publicListQuery.data);
    if (dataToCache && Array.isArray(dataToCache) && dataToCache.length > 0) {
      try {
        localStorage.setItem(pageCacheKey, JSON.stringify(dataToCache));
      } catch {}
    }
  }, [pageCacheKey, isAdmin, isEditing, editorOverridesQuery.data, publicListQuery.data, snapshot?.overrides, pagePath]);

  const { data: builderSections = [] } = trpc.visualEditor.sections.list.useQuery({ pagePath: pagePath ?? "/" }, { enabled: Boolean(pagePath && isAdmin && isEditing), refetchOnWindowFocus: false });
  const { data: history = [] } = trpc.visualEditor.history.useQuery({ pagePath: pagePath ?? "/", limit: 20 }, { enabled: Boolean(pagePath && isAdmin && isEditing), refetchOnWindowFocus: false });
  const overrides = isAdmin && isEditing ? editorOverrides : publicOverrides;
  const save = trpc.visualEditor.save.useMutation({
    onSuccess: (savedData) => {
      toast.success("تم حفظ التعديل كمسودة خاصة بك");
      if (savedData) {
        try {
          const current = (initialCachedOverrides as VisualOverride[]) || [];
          const updated = [...current.filter((o) => o.elementId !== (savedData as any).elementId), savedData as VisualOverride];
          localStorage.setItem(pageCacheKey, JSON.stringify(updated));
        } catch {}
      }
      if (pagePath) { void utils.visualEditor.list.invalidate({ pagePath }); void utils.visualEditor.history.invalidate({ pagePath }); }
    },
    onError: (error) => toast.error(error.message || "تعذر حفظ التعديل"),
  });
  const moveToTrash = trpc.visualEditor.trash.move.useMutation({
    onSuccess: () => { if (pagePath) void utils.visualEditor.trash.list.invalidate({ pagePath }); },
    onError: (error) => toast.error(error.message || "تعذر نقل الطبقة إلى سلة المهملات"),
  });
  const reset = trpc.visualEditor.reset.useMutation({
    onSuccess: (_, variables) => {
      setLocalOverrides((current) => clearLocalPreviewAfterReset(current, variables.pagePath, variables.elementId));
      draftPreviewEnabled.current = false;
      setDraft(EMPTY_DRAFT);
      toast.message("تمت استعادة تصميم العنصر الأصلي");
      try {
        const current = (initialCachedOverrides as VisualOverride[]) || [];
        const filtered = current.filter((o) => o.elementId !== variables.elementId);
        localStorage.setItem(pageCacheKey, JSON.stringify(filtered));
      } catch {}
      if (pagePath) { void utils.visualEditor.list.invalidate({ pagePath }); void utils.visualEditor.publicList.invalidate({ pagePath }); void utils.visualEditor.history.invalidate({ pagePath }); }
    },
    onError: (error) => toast.error(error.message || "تعذر استعادة العنصر"),
  });
  const publish = trpc.visualEditor.publish.useMutation({
    onSuccess: () => {
      toast.success("تم نشر التعديل للزوار بنجاح");
      if (pagePath) { void utils.visualEditor.list.invalidate({ pagePath }); void utils.visualEditor.publicList.invalidate({ pagePath }); void utils.visualEditor.history.invalidate({ pagePath }); void utils.homepage.publicSnapshot.invalidate(); }
    },
    onError: (error) => toast.error(error.message || "تعذر نشر التعديل"),
  });
  const restoreHistory = trpc.visualEditor.restore.useMutation({
    onSuccess: () => {
      toast.success("تمت استعادة النسخة إلى مسودة جديدة");
      if (pagePath) { void utils.visualEditor.list.invalidate({ pagePath }); void utils.visualEditor.history.invalidate({ pagePath }); }
    },
    onError: (error) => toast.error(error.message || "تعذر استعادة النسخة"),
  });
  const saveDuplicatedSection = trpc.visualEditor.sections.save.useMutation({
    onSuccess: () => {
      if (pagePath) { void utils.visualEditor.sections.list.invalidate({ pagePath }); void utils.visualEditor.sections.publicList.invalidate({ pagePath }); }
      toast.success("تمت إضافة نسخة قابلة للتحرير في نهاية الصفحة كمسودة");
    },
    onError: (error) => toast.error(error.message || "تعذر تكرار العنصر"),
  });

  const overrideMap = useMemo(() => {
    const map = new Map((overrides as VisualOverride[]).map((item) => [item.elementId, item]));
    if (pagePath) {
      Object.entries(localOverrides).forEach(([key, override]) => {
        if (key.startsWith(`${pagePath}::`)) map.set(override.elementId, override);
      });
    }
    return map;
  }, [overrides, pagePath, localOverrides]);
  const currentOverride = selected ? overrideMap.get(selected.id) : undefined;
  const selectedHistory = selected ? history.filter((item) => item.elementId === selected.id).slice(0, 4) : [];
  const isSelectedBackground = Boolean(selected && isBackgroundSurface(selected.id, selected.label, selected.tag));

  useEffect(() => {
    if (!selected) return;
    draftPreviewEnabled.current = false;

    let defaultContent = currentOverride?.contentText ?? "";
    let defaultMedia = currentOverride?.mediaUrl ?? "";
    let defaultAlt = currentOverride?.altText ?? "";
    let defaultTextColor = currentOverride?.textColor ?? "";

    if (!currentOverride && typeof document !== "undefined") {
      const el = document.querySelector<HTMLElement>(`[data-visual-id="${CSS.escape(selected.id)}"]`);
      if (el) {
        if (selected.tag === "image" && el instanceof HTMLImageElement) {
          defaultMedia = el.src || "";
          defaultAlt = el.alt || "";
        } else if (selected.tag === "text") {
          defaultContent = el.textContent?.trim() || "";
          try {
            defaultTextColor = window.getComputedStyle(el).color || "";
          } catch {}
        }
      }
    }

    setDraft({
      contentText: defaultContent,
      mediaUrl: defaultMedia,
      altText: defaultAlt,
      linkUrl: currentOverride?.linkUrl ?? "",
      alignment: currentOverride?.alignment ?? "center",
      textColor: defaultTextColor,
      bgColor: currentOverride?.bgColor ?? "",
      fontSize: currentOverride?.fontSize ?? "",
      padding: currentOverride?.padding ?? "",
      margin: currentOverride?.margin ?? "",
      borderRadius: currentOverride?.borderRadius ?? "",
      layerX: currentOverride?.layerX ?? 0,
      layerY: currentOverride?.layerY ?? 0,
      layerWidth: currentOverride?.layerWidth ?? null,
      layerHeight: currentOverride?.layerHeight ?? null,
      layerZIndex: currentOverride?.layerZIndex ?? 0,
      layerOpacity: currentOverride?.layerOpacity ?? 100,
      backgroundSize: currentOverride?.backgroundSize ?? 100,
      backgroundPositionX: currentOverride?.backgroundPositionX ?? 50,
      backgroundPositionY: currentOverride?.backgroundPositionY ?? 50,
      backgroundOverlay: currentOverride?.backgroundOverlay ?? 0,
      customCss: currentOverride?.customCss ?? "",
      isLocked: currentOverride?.isLocked ?? false,
      isHidden: currentOverride?.isHidden ?? false,
    });
  }, [selected?.id, currentOverride?.id]);

  useEffect(() => {
    if (!selected || !pagePath) return;
    const source = overrideMap.get(selected.id);
    const preview: VisualOverride = {
      id: source?.id ?? -1,
      pagePath,
      elementId: selected.id,
      elementTag: selected.tag,
      contentText: draft.contentText || null,
      mediaUrl: draft.mediaUrl || null,
      altText: draft.altText || null,
      linkUrl: draft.linkUrl || null,
      alignment: draft.alignment || null,
      textColor: draft.textColor || null,
      bgColor: draft.bgColor || null,
      fontSize: draft.fontSize || null,
      padding: draft.padding || null,
      margin: draft.margin || null,
      borderRadius: draft.borderRadius || null,
      layerX: draft.layerX,
      layerY: draft.layerY,
      layerWidth: draft.layerWidth,
      layerHeight: draft.layerHeight,
      layerZIndex: draft.layerZIndex,
      layerOpacity: draft.layerOpacity,
      backgroundSize: draft.backgroundSize,
      backgroundPositionX: draft.backgroundPositionX,
      backgroundPositionY: draft.backgroundPositionY,
      backgroundOverlay: draft.backgroundOverlay,
      customCss: draft.customCss || null,
      isLocked: draft.isLocked,
      isHidden: draft.isHidden,
      status: "draft",
    };
    const key = `${pagePath}::${selected.id}`;
    setLocalOverrides((current) => {
      const previous = current[key];
      if (previous && JSON.stringify(previous) === JSON.stringify(preview)) return current;
      return {
        ...current,
        ...Object.fromEntries(sharedHeroElementIds(selected.id).map((elementId) => [`${pagePath}::${elementId}`, { ...preview, elementId }])),
      };
    });
  }, [draft, pagePath, selected?.id, selected?.tag]);

  useEffect(() => {
    if (!isEditing || !isSelectedBackground) return;
    setToolGroup("design");
    setShowAdvancedProperties(false);
  }, [isEditing, isSelectedBackground, selected?.id]);

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    setIsEditing(Boolean(isAdmin && (search.get("visual") === "1" || search.get("editor") === "1")));
    setLayerMode(false);
    setSelected(null);
    setSelectedIds([]);
    setMobilePreview(false);
    setOperationsOpen(false);
    setBuilderOpen(false);
    setAddPanelOpen(false);
    setLayersOpen(false);
    setWorkspaceMediaOpen(false);
    setPageMapOpen(false);
    setLocalOverrides({});
    setUndoStack([]);
    setRedoStack([]);
    setStyleClipboard(null);
    setGroupedIds([]);
    setPreviewMode(false);
    setSidebarsCollapsed(false);
    setRightNavHidden(false);
    setTopbarHidden(false);
    setPanelAnchorTop(null);
  }, [pathname, isAdmin]);

  useEffect(() => {
    if (!isEditing) return;
    setOperationsOpen(false);
    setBuilderOpen(false);
    setAddPanelOpen(false);
    setLayersOpen(false);
    setWorkspaceMediaOpen(false);
    setPageMapOpen(false);
  }, [isEditing]);

  useEffect(() => {
    if (!layersOpen && !addPanelOpen && !pageMapOpen && !workspaceMediaOpen && !operationsOpen && !builderOpen) return;
    setSelected(null);
    setDesignToolsOpen(false);
  }, [layersOpen, addPanelOpen, pageMapOpen, workspaceMediaOpen, operationsOpen, builderOpen]);

  useEffect(() => {
    if (!previewMode) return;
    document.documentElement.classList.add("aq-clean-preview");
    return () => document.documentElement.classList.remove("aq-clean-preview");
  }, [previewMode]);

  useEffect(() => {
    if (!previewMode) return;
    setOperationsOpen(false);
    setBuilderOpen(false);
    setAddPanelOpen(false);
    setLayersOpen(false);
    setWorkspaceMediaOpen(false);
    setPageMapOpen(false);
    setTrashOpen(false);
    setDesignToolsOpen(false);
    setMediaLibraryOpen(false);
  }, [previewMode]);

  useEffect(() => {
    const rememberToolbarAnchor = (event: PointerEvent) => {
      const button = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>(".aq-editor-toolbar button[title]");
      if (!button || !["الإضافة", "الطبقات", "خريطة الصفحات", "الوسائط", "الصفحات والأقسام", "تأثيرات الطبقة", "سلة الطبقات", "إدارة المنصة"].includes(button.title)) return;
      button.scrollIntoView({ block: "center", inline: "nearest", behavior: "auto" });
      setPanelAnchorTop(Math.round(button.getBoundingClientRect().top));
    };
    window.addEventListener("pointerdown", rememberToolbarAnchor, true);
    return () => window.removeEventListener("pointerdown", rememberToolbarAnchor, true);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (panelAnchorTop === null) {
      root.style.removeProperty("--aq-editor-panel-top");
      root.style.removeProperty("--aq-editor-panel-translate");
      root.style.removeProperty("--aq-editor-panel-available-height");
      return;
    }
    root.style.setProperty("--aq-editor-panel-top", `${panelAnchorTop}px`);
    root.style.setProperty("--aq-editor-panel-translate", "0%");
    root.style.setProperty("--aq-editor-panel-available-height", `min(82svh, calc(100svh - ${panelAnchorTop}px - 1rem))`);
    return () => {
      root.style.removeProperty("--aq-editor-panel-top");
      root.style.removeProperty("--aq-editor-panel-translate");
      root.style.removeProperty("--aq-editor-panel-available-height");
    };
  }, [panelAnchorTop]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("aq-editor-sidebars-collapsed", sidebarsCollapsed);
    return () => root.classList.remove("aq-editor-sidebars-collapsed");
  }, [sidebarsCollapsed]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("aq-editor-toolbar-right", toolbarSide === "right");
    try { window.localStorage.setItem("alaqeeq-editor-toolbar-side", toolbarSide); } catch { /* local storage unavailable */ }
    return () => root.classList.remove("aq-editor-toolbar-right");
  }, [toolbarSide]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("aq-editor-right-nav-hidden", rightNavHidden);
    return () => root.classList.remove("aq-editor-right-nav-hidden");
  }, [rightNavHidden]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("aq-editor-topbar-hidden", topbarHidden);
    return () => root.classList.remove("aq-editor-topbar-hidden");
  }, [topbarHidden]);



  useEffect(() => {
    window.localStorage.setItem("alaqeeq-background-favorites", JSON.stringify(backgroundFavorites.slice(0, 12)));
  }, [backgroundFavorites]);

  useEffect(() => {
    window.localStorage.setItem("alaqeeq-background-editor-preferences", JSON.stringify(backgroundPreferences));
  }, [backgroundPreferences]);

  useEffect(() => {
    if (!isEditing || !layerMode) {
      setSelectionBox(null);
      marqueeStart.current = null;
      return;
    }

    const beginSelection = (event: PointerEvent) => {
      if (!event.shiftKey || (event.target as Element | null)?.closest(".aq-editor-toolbar")) return;
      marqueeStart.current = { x: event.clientX, y: event.clientY };
      setSelectionBox({ left: event.clientX, top: event.clientY, width: 0, height: 0 });
    };
    const updateSelection = (event: PointerEvent) => {
      if (!marqueeStart.current) return;
      setSelectionBox(selectionFrameFromPoints(marqueeStart.current.x, marqueeStart.current.y, event.clientX, event.clientY));
    };
    const finishSelection = (event: PointerEvent) => {
      if (!marqueeStart.current) return;
      const frame = selectionFrameFromPoints(marqueeStart.current.x, marqueeStart.current.y, event.clientX, event.clientY);
      const intersectingNodes = Array.from(document.querySelectorAll<HTMLElement>("[data-visual-id]")).filter((node) => {
        if (!canManipulateLayer(overrideMap.get(node.dataset.visualId || "")?.isLocked)) return false;
        const rect = node.getBoundingClientRect();
        return layerIntersectsSelection({ left: rect.left, top: rect.top, width: rect.width, height: rect.height }, frame);
      });
      const selectedNodes = intersectingNodes.filter((node) => node.dataset.visualTag !== "section" || !intersectingNodes.some((other) => other !== node && node.contains(other)));
      if (selectedNodes.length) {
        const first = selectedNodes[0]!;
        const firstTag = first.dataset.visualTag as ElementTag | undefined;
        const firstId = first.dataset.visualId;
        if (firstId && firstTag) setSelected({ id: firstId, tag: firstTag, label: first.dataset.visualLabel || "طبقة" });
        setSelectedIds(selectedNodes.map((node) => node.dataset.visualId).filter((id): id is string => Boolean(id)));
        toast.message(`تم تحديد ${selectedNodes.length} طبقة`);
      }
      marqueeStart.current = null;
      setSelectionBox(null);
    };

    window.addEventListener("pointerdown", beginSelection, true);
    window.addEventListener("pointermove", updateSelection, true);
    window.addEventListener("pointerup", finishSelection, true);
    return () => {
      window.removeEventListener("pointerdown", beginSelection, true);
      window.removeEventListener("pointermove", updateSelection, true);
      window.removeEventListener("pointerup", finishSelection, true);
    };
  }, [isEditing, layerMode, overrideMap]);

  const selectElement = (elementId: string, elementTag: ElementTag, label: string, additive = false) => {
    if (!isEditing) return;
    if (!isAdmin) {
      toast.error("يرجى تسجيل الدخول بحساب المدير لتعديل وحفظ العناصر", {
        action: {
          label: "تسجيل الدخول",
          onClick: () => navigate("/login"),
        },
      });
      return;
    }
    if (!canManipulateLayer(overrideMap.get(elementId)?.isLocked)) {
      toast.info("هذا العنصر مقفل — يمكنك إلغاء القفل من لوحة الطبقات");
      return;
    }
    setSelected({ id: elementId, tag: elementTag, label });
    setSelectedIds((current) => additive ? (current.includes(elementId) ? current.filter((id) => id !== elementId) : [...current, elementId]) : [elementId]);
    setAddPanelOpen(false);
    setLayersOpen(false);
    setBuilderOpen(false);
    setWorkspaceMediaOpen(false);
    setPageMapOpen(false);
    setPanelAnchorTop(null);
  };

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.querySelectorAll("[data-visual-selected='true']").forEach((el) => {
      el.removeAttribute("data-visual-selected");
    });
    if (selected?.id) {
      const el = document.querySelector(`[data-visual-id="${CSS.escape(selected.id)}"]`);
      if (el) el.setAttribute("data-visual-selected", "true");
    }
  }, [selected?.id]);

  // ── Smart Auto-Detect Engine (المحرر الذكي الشامل) ──────────
  useEffect(() => {
    if (typeof document === "undefined") return;

    // Exclude editor chrome / drawers / modals / video players / interactive media
    const isEditorSystemUi = (node: Element | null): boolean => {
      if (!node) return false;
      return Boolean(
        node.closest(".aq-editor-toolbar") ||
        node.closest(".aq-editor-drawer") ||
        node.closest("[data-aq-editor-properties]") ||
        node.closest("[data-radix-popper-content-wrapper]") ||
        node.closest("[role='dialog']") ||
        node.closest("[role='menu']") ||
        node.closest("[role='listbox']") ||
        node.closest("[role='tooltip']") ||
        node.closest("[data-no-visual-edit]") ||
        node.closest("[data-aqeeq-video]") ||
        node.closest("[data-video-player]") ||
        node.closest(".group\\/screen") ||
        node.closest(".group\\/yt") ||
        node.closest("video") ||
        node.closest("iframe") ||
        node.closest("audio") ||
        node.closest("[data-mobile-bar]") ||
        node.closest("input, textarea, select")
      );
    };

    if (isEditing && !previewMode) {
      document.body.classList.add("aq-smart-editable-active");
    } else {
      document.body.classList.remove("aq-smart-editable-active");
    }

    const scanAndTag = () => {
      const root = document.getElementById("root") || document.body;
      if (!root) return;

      // 1. Scan Images anywhere on the page (except editor UI and video players)
      const images = Array.from(root.querySelectorAll<HTMLImageElement>("img"));
      images.forEach((img, idx) => {
        if (isEditorSystemUi(img) || img.closest("[data-no-visual-edit], [data-aqeeq-video], .group\\/screen")) return;
        if (img.dataset.visualId && img.dataset.visualAuto !== "true") return;

        let id = img.dataset.visualId;
        if (!id) {
          const srcPath = img.getAttribute("src") || "";
          const altText = img.alt || "";
          id = `auto-img-${hashString(srcPath + altText + idx)}`;
          img.dataset.visualId = id;
          img.dataset.visualTag = "image";
          img.dataset.visualLabel = altText || `صورة ${idx + 1}`;
          img.dataset.visualAuto = "true";
        }

        const override = overrideMap.get(id);
        if (override?.mediaUrl && img.src !== override.mediaUrl) {
          img.src = override.mediaUrl;
        }
        if (override?.altText && img.alt !== override.altText) {
          img.alt = override.altText;
        }
      });

      // 2. Scan Text Elements (headings, paragraphs, spans, buttons, links, labels, badges)
      const textNodes = Array.from(root.querySelectorAll<HTMLElement>(
        "h1, h2, h3, h4, h5, h6, p, blockquote, figcaption, span, a, button, label, li, td, th"
      ));
      textNodes.forEach((node, idx) => {
        if (isEditorSystemUi(node) || node.closest("[data-no-visual-edit], [data-aqeeq-video], .group\\/screen")) return;
        if (node.dataset.visualId && node.dataset.visualAuto !== "true") return;

        // Extract direct text content
        const directText = Array.from(node.childNodes)
          .filter((n) => n.nodeType === Node.TEXT_NODE)
          .map((n) => n.textContent || "")
          .join("")
          .trim();

        if (!directText || directText.length < 1 || directText.length > 500) return;

        let id = node.dataset.visualId;
        if (!id) {
          id = `auto-txt-${hashString(directText.slice(0, 30) + idx)}`;
          node.dataset.visualId = id;
          node.dataset.visualTag = "text";
          node.dataset.visualLabel = directText.slice(0, 24);
          node.dataset.visualAuto = "true";
        }

        const override = overrideMap.get(id);
        if (override?.contentText) {
          const textChild = Array.from(node.childNodes).find((n) => n.nodeType === Node.TEXT_NODE);
          if (textChild) {
            if (textChild.textContent !== override.contentText) textChild.textContent = override.contentText;
          } else {
            node.textContent = override.contentText;
          }
        }
        if (override?.textColor && node.style.color !== override.textColor) {
          node.style.color = override.textColor;
        }
        if (override?.fontSize && node.style.fontSize !== override.fontSize) {
          node.style.fontSize = override.fontSize;
        }
      });

      // 3. Scan SVG Icons anywhere on the page
      const svgs = Array.from(root.querySelectorAll<SVGElement>("svg"));
      svgs.forEach((svg, idx) => {
        if (isEditorSystemUi(svg) || svg.closest("[data-no-visual-edit], [data-aqeeq-video], .group\\/screen")) return;
        const htmlSvg = svg as unknown as HTMLElement;
        if (htmlSvg.dataset?.visualId && htmlSvg.dataset?.visualAuto !== "true") return;

        let id = htmlSvg.dataset?.visualId;
        if (!id) {
          id = `auto-icon-${hashString((svg.getAttribute("class") || "") + idx)}`;
          htmlSvg.dataset.visualId = id;
          htmlSvg.dataset.visualTag = "icon";
          htmlSvg.dataset.visualLabel = `أيقونة ${idx + 1}`;
          htmlSvg.dataset.visualAuto = "true";
        }

        const override = overrideMap.get(id);
        if (override?.textColor) {
          htmlSvg.style.color = override.textColor;
        }
      });
    };

    scanAndTag();

    const handleCaptureClick = (e: globalThis.MouseEvent) => {
      if (!isEditing || previewMode) return;
      if (e.metaKey || e.ctrlKey) return;
      const targetEl = e.target as Element | null;
      if (!targetEl || isEditorSystemUi(targetEl)) return;

      // Allow videos and media elements to receive clicks freely
      if (targetEl.closest("[data-no-visual-edit], [data-aqeeq-video], [data-video-player], .group\\/screen, .group\\/yt, video, iframe, audio")) {
        return;
      }

      // 1. First priority: explicit visual element
      const visualEl = targetEl.closest<HTMLElement>("[data-visual-id]");
      if (visualEl && !isEditorSystemUi(visualEl)) {
        e.preventDefault();
        e.stopPropagation();
        const id = visualEl.dataset.visualId!;
        const tag = (visualEl.dataset.visualTag || "text") as ElementTag;
        const label = visualEl.dataset.visualLabel || id;
        selectElement(id, tag, label);
        return;
      }

      // 2. Second priority: auto-tagged element
      const autoTarget = targetEl.closest<HTMLElement>("[data-visual-auto='true']");
      if (autoTarget && !isEditorSystemUi(autoTarget)) {
        e.preventDefault();
        e.stopPropagation();
        const autoId = autoTarget.dataset.visualId;
        const autoTag = (autoTarget.dataset.visualTag || "text") as ElementTag;
        const autoLabel = autoTarget.dataset.visualLabel || "عنصر ذكي";
        if (autoId && autoTag) {
          selectElement(autoId, autoTag, autoLabel);
          return;
        }
      }

      // 3. Third priority: direct image or svg or text click
      if (targetEl.tagName === "IMG") {
        const img = targetEl as HTMLImageElement;
        e.preventDefault();
        e.stopPropagation();
        const id = img.dataset.visualId || `auto-img-${hashString((img.src || "") + (img.alt || ""))}`;
        img.dataset.visualId = id;
        img.dataset.visualTag = "image";
        img.dataset.visualLabel = img.alt || "صورة";
        img.dataset.visualAuto = "true";
        selectElement(id, "image", img.dataset.visualLabel);
        return;
      }
      if (targetEl.tagName === "svg" || targetEl.closest("svg")) {
        const svg = (targetEl.tagName === "svg" ? targetEl : targetEl.closest("svg")) as unknown as HTMLElement;
        e.preventDefault();
        e.stopPropagation();
        const id = svg.dataset?.visualId || `auto-icon-${hashString(svg.getAttribute?.("class") || "icon")}`;
        svg.dataset.visualId = id;
        svg.dataset.visualTag = "icon";
        svg.dataset.visualLabel = "أيقونة";
        svg.dataset.visualAuto = "true";
        selectElement(id, "icon", "أيقونة");
        return;
      }
    };

    if (isEditing && !previewMode) {
      window.addEventListener("click", handleCaptureClick, true);
    }

    let scanTimer: ReturnType<typeof setTimeout> | null = null;
    const debouncedScan = () => {
      if (scanTimer) clearTimeout(scanTimer);
      scanTimer = setTimeout(() => {
        scanAndTag();
      }, 300);
    };

    const observer = new MutationObserver(() => {
      debouncedScan();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (scanTimer) clearTimeout(scanTimer);
      window.removeEventListener("click", handleCaptureClick, true);
      observer.disconnect();
      document.body.classList.remove("aq-smart-editable-active");
    };
  }, [isEditing, previewMode, overrideMap, pagePath, isAdmin]);


  const saveLayer = (elementId: string, patch: Pick<VisualOverride, "layerX" | "layerY" | "layerWidth" | "layerHeight" | "layerZIndex" | "isHidden"> & Partial<Pick<VisualOverride, "layerOpacity" | "isLocked">>) => {
    if (!pagePath) return;
    const node = document.querySelector<HTMLElement>(`[data-visual-id="${CSS.escape(elementId)}"]`);
    const elementTag = node?.dataset.visualTag as ElementTag | undefined;
    if (!elementTag) return;
    const existing = overrideMap.get(elementId);
    const payload = { pagePath, elementId: elementId as Parameters<typeof save.mutate>[0]["elementId"], elementTag, contentText: existing?.contentText ?? null, mediaUrl: existing?.mediaUrl ?? null, altText: existing?.altText ?? null, linkUrl: existing?.linkUrl ?? null, alignment: existing?.alignment ?? "center", textColor: existing?.textColor ?? null, bgColor: existing?.bgColor ?? null, fontSize: existing?.fontSize ?? null, padding: existing?.padding ?? null, margin: existing?.margin ?? null, borderRadius: existing?.borderRadius ?? null, layerOpacity: patch.layerOpacity ?? existing?.layerOpacity ?? 100, isLocked: patch.isLocked ?? existing?.isLocked ?? false, ...patch };
    const optimistic: VisualOverride = { id: existing?.id ?? -1, pagePath, elementId, elementTag, contentText: payload.contentText, mediaUrl: payload.mediaUrl, altText: payload.altText, linkUrl: payload.linkUrl, alignment: payload.alignment, textColor: payload.textColor, bgColor: payload.bgColor, fontSize: payload.fontSize, padding: payload.padding, margin: payload.margin, borderRadius: payload.borderRadius, layerX: patch.layerX, layerY: patch.layerY, layerWidth: patch.layerWidth, layerHeight: patch.layerHeight, layerZIndex: patch.layerZIndex, layerOpacity: payload.layerOpacity, backgroundSize: existing?.backgroundSize ?? 100, backgroundPositionX: existing?.backgroundPositionX ?? 50, backgroundPositionY: existing?.backgroundPositionY ?? 50, backgroundOverlay: existing?.backgroundOverlay ?? 0, customCss: existing?.customCss ?? null, isLocked: payload.isLocked, isHidden: patch.isHidden, status: "draft" };
    setUndoStack((stack) => [...stack, localOverrides].slice(-40));
    setRedoStack([]);
    setLocalOverrides((current) => ({ ...current, [`${pagePath}::${elementId}`]: optimistic }));
    if (selected?.id === elementId) setDraft((current) => ({ ...current, ...patch }));
  };

  const deleteLayer = (elementId: string, label: string) => {
    if (!pagePath) return;
    const node = document.querySelector<HTMLElement>(`[data-visual-id="${CSS.escape(elementId)}"]`);
    const elementTag = node?.dataset.visualTag as ElementTag | undefined;
    if (!elementTag) { toast.error("تعذر تحديد نوع الطبقة المراد حذفها"); return; }
    const existing = overrideMap.get(elementId);
    if (existing?.isLocked) { toast.error("افتح قفل الطبقة أولاً قبل حذفها"); return; }
    const isCoreBackground = isCoreBackgroundLayer(elementId);
    const message = isCoreBackground
      ? `هذه طبقة خلفية الغلاف الأساسية «${label}». سيؤدي حذفها إلى إخفائها فقط كمسودة، ويمكنك التراجع فوراً. هل تريد المتابعة؟`
      : `هل تريد مسح الطبقة «${label}»؟ ستختفي كمسودة فقط ويمكنك التراجع فوراً قبل الحفظ.`;
    if (!window.confirm(message)) return;
    saveLayer(elementId, {
      layerX: existing?.layerX ?? 0,
      layerY: existing?.layerY ?? 0,
      layerWidth: existing?.layerWidth ?? null,
      layerHeight: existing?.layerHeight ?? null,
      layerZIndex: existing?.layerZIndex ?? 0,
      layerOpacity: existing?.layerOpacity ?? 100,
      isLocked: false,
      isHidden: true,
    });
    const snapshot = existing ? JSON.stringify((({ id: _id, status: _status, ...value }) => value)(existing)) : null;
    setPendingLayerDeletion({ elementId, elementTag, label, snapshot, previousLocalOverrides: localOverrides });
    toast.message(`تم مسح «${label}» كمسودة`, { action: { label: "تراجع", onClick: () => setPendingLayerDeletion((pending) => { if (pending) setLocalOverrides(pending.previousLocalOverrides); return null; }) } });
  };

  const restorePendingLayerDeletion = () => {
    if (!pendingLayerDeletion) return;
    setLocalOverrides(pendingLayerDeletion.previousLocalOverrides);
    setUndoStack((stack) => stack.slice(0, -1));
    setRedoStack([]);
    toast.success(`تمت استعادة «${pendingLayerDeletion.label}» قبل الحفظ`);
    setPendingLayerDeletion(null);
  };

  const savePendingLayerDeletion = () => {
    if (!pagePath || !pendingLayerDeletion) return;
    const override = localOverrides[`${pagePath}::${pendingLayerDeletion.elementId}`] ?? overrideMap.get(pendingLayerDeletion.elementId);
    if (!override) { toast.error("تعذر تجهيز حذف الطبقة للحفظ"); return; }
    moveToTrash.mutate({ pagePath, elementId: pendingLayerDeletion.elementId, elementTag: pendingLayerDeletion.elementTag, label: pendingLayerDeletion.label, snapshot: pendingLayerDeletion.snapshot }, { onSuccess: () => save.mutate({
      pagePath,
      elementId: override.elementId as Parameters<typeof save.mutate>[0]["elementId"],
      elementTag: override.elementTag,
      contentText: override.contentText,
      mediaUrl: override.mediaUrl,
      altText: override.altText,
      linkUrl: override.linkUrl,
      alignment: override.alignment,
      textColor: override.textColor,
      bgColor: override.bgColor,
      fontSize: override.fontSize,
      padding: override.padding,
      margin: override.margin,
      borderRadius: override.borderRadius,
      layerX: override.layerX,
      layerY: override.layerY,
      layerWidth: override.layerWidth,
      layerHeight: override.layerHeight,
      layerZIndex: override.layerZIndex,
      layerOpacity: override.layerOpacity,
      backgroundSize: override.backgroundSize,
      backgroundPositionX: override.backgroundPositionX,
      backgroundPositionY: override.backgroundPositionY,
      backgroundOverlay: override.backgroundOverlay,
      customCss: override.customCss,
      isLocked: override.isLocked,
      isHidden: true,
    }, {
      onSuccess: () => {
        toast.success(`تم نقل «${pendingLayerDeletion.label}» إلى سلة المهملات لمدة 30 يوماً`);
        setPendingLayerDeletion(null);
      },
    }) });
  };

  const undoSession = () => {
    const previous = undoStack.at(-1);
    if (!previous) { toast.message("لا يوجد تعديل سابق في هذه الجلسة"); return; }
    setRedoStack((stack) => [...stack, localOverrides].slice(-40));
    setLocalOverrides(previous);
    setUndoStack((stack) => stack.slice(0, -1));
    toast.message("تم التراجع عن آخر تعديل في الجلسة");
  };

  const redoSession = () => {
    const next = redoStack.at(-1);
    if (!next) { toast.message("لا يوجد تعديل لإعادته"); return; }
    setUndoStack((stack) => [...stack, localOverrides].slice(-40));
    setLocalOverrides(next);
    setRedoStack((stack) => stack.slice(0, -1));
    toast.message("تمت إعادة التعديل");
  };

  const copySelectedStyle = () => {
    if (!selected) { toast.error("اختر طبقة أولاً لنسخ نمطها"); return; }
    setStyleClipboard(extractCopyableStyle({ textColor: draft.textColor || null, bgColor: draft.bgColor || null, fontSize: draft.fontSize || null, padding: draft.padding || null, margin: draft.margin || null, borderRadius: draft.borderRadius || null, layerOpacity: draft.layerOpacity }));
    toast.success("تم نسخ لون وحجم وشفافية ونمط الطبقة");
  };

  const pasteSelectedStyle = () => {
    if (!selected || !pagePath || !styleClipboard) { toast.error("انسخ نمط طبقة أولاً ثم اختر طبقة الهدف"); return; }
    const current = currentOverride;
    const next: VisualOverride = { id: current?.id ?? -1, pagePath, elementId: selected.id, elementTag: selected.tag, contentText: current?.contentText ?? null, mediaUrl: current?.mediaUrl ?? null, altText: current?.altText ?? null, linkUrl: current?.linkUrl ?? null, alignment: current?.alignment ?? "center", textColor: styleClipboard.textColor, bgColor: styleClipboard.bgColor, fontSize: styleClipboard.fontSize, padding: styleClipboard.padding, margin: styleClipboard.margin, borderRadius: styleClipboard.borderRadius, layerX: current?.layerX ?? 0, layerY: current?.layerY ?? 0, layerWidth: current?.layerWidth ?? null, layerHeight: current?.layerHeight ?? null, layerZIndex: current?.layerZIndex ?? 0, layerOpacity: styleClipboard.layerOpacity, backgroundSize: current?.backgroundSize ?? 100, backgroundPositionX: current?.backgroundPositionX ?? 50, backgroundPositionY: current?.backgroundPositionY ?? 50, backgroundOverlay: current?.backgroundOverlay ?? 0, customCss: current?.customCss ?? null, isLocked: current?.isLocked ?? false, isHidden: current?.isHidden ?? false, status: "draft" };
    setUndoStack((stack) => [...stack, localOverrides].slice(-40));
    setRedoStack([]);
    setLocalOverrides((overrides) => ({ ...overrides, [`${pagePath}::${selected.id}`]: next }));
    setDraft((value) => ({ ...value, textColor: styleClipboard.textColor ?? "", bgColor: styleClipboard.bgColor ?? "", fontSize: styleClipboard.fontSize ?? "", padding: styleClipboard.padding ?? "", margin: styleClipboard.margin ?? "", borderRadius: styleClipboard.borderRadius ?? "", layerOpacity: styleClipboard.layerOpacity }));
    toast.success("تم لصق نمط الطبقة كمسودة");
  };

  const groupSelected = () => {
    if (selectedIds.length < 2) { toast.error("اختر طبقتين أو أكثر لتجميعهما"); return; }
    setGroupedIds(selectedIds);
    toast.success(`تم تجميع ${selectedIds.length} طبقات لهذه الجلسة؛ حرّك أي واحدة لتحريك المجموعة`);
  };

  const lockSelected = () => {
    const ids = selectedIds.length ? selectedIds : selected ? [selected.id] : [];
    if (!ids.length) { toast.error("اختر طبقة أو أكثر أولاً"); return; }
    ids.forEach((id) => {
      const current = overrideMap.get(id);
      saveLayer(id, { layerX: current?.layerX ?? 0, layerY: current?.layerY ?? 0, layerWidth: current?.layerWidth ?? null, layerHeight: current?.layerHeight ?? null, layerZIndex: current?.layerZIndex ?? 0, layerOpacity: current?.layerOpacity ?? 100, isLocked: true, isHidden: current?.isHidden ?? false });
    });
    setSelected(null);
    setSelectedIds([]);
    toast.success("تم قفل الطبقات المختارة");
  };

  const protectBackgrounds = () => {
    const backgroundNodes = Array.from(document.querySelectorAll<HTMLElement>("[data-visual-id]")).filter((node) => isBackgroundLikeLayer(node.dataset.visualId || "", node.dataset.visualLabel || ""));
    backgroundNodes.forEach((node) => {
      const id = node.dataset.visualId || "";
      const current = overrideMap.get(id);
      saveLayer(id, { layerX: current?.layerX ?? 0, layerY: current?.layerY ?? 0, layerWidth: current?.layerWidth ?? null, layerHeight: current?.layerHeight ?? null, layerZIndex: current?.layerZIndex ?? 0, layerOpacity: current?.layerOpacity ?? 100, isLocked: true, isHidden: current?.isHidden ?? false });
    });
    toast.success(`تمت حماية ${backgroundNodes.length} طبقات خلفية`);
  };

  const alignSelected = (mode: HorizontalAlign) => {
    const ids = selectedIds.length ? selectedIds : selected ? [selected.id] : [];
    const nodes = ids.map((id) => document.querySelector<HTMLElement>(`[data-visual-id="${CSS.escape(id)}"]`)).filter((node): node is HTMLElement => node !== null && !overrideMap.get(node.dataset.visualId || "")?.isLocked);
    if (!nodes.length) return;
    const anchor = nodes[0];
    const anchorRect = anchor.getBoundingClientRect();
    const parentRect = anchor.parentElement?.getBoundingClientRect() ?? anchorRect;
    const target = nodes.length > 1
      ? mode === "left" ? anchorRect.left : mode === "right" ? anchorRect.right : anchorRect.left + anchorRect.width / 2
      : mode === "left" ? parentRect.left : mode === "right" ? parentRect.right : parentRect.left + parentRect.width / 2;
    const targets = nodes.length > 1 ? nodes.slice(1) : nodes;
    targets.forEach((node) => {
      const rect = node.getBoundingClientRect();
      const current = overrideMap.get(node.dataset.visualId || "");
      saveLayer(node.dataset.visualId || "", { layerX: alignedLayerX({ currentX: current?.layerX ?? 0, currentLeft: rect.left, width: rect.width, target, mode }), layerY: current?.layerY ?? 0, layerWidth: current?.layerWidth ?? null, layerHeight: current?.layerHeight ?? null, layerZIndex: current?.layerZIndex ?? 0, isHidden: current?.isHidden ?? false });
    });
    setAlignmentGuides({ x: target });
    window.setTimeout(() => setAlignmentGuides({}), 850);
    toast.message(nodes.length > 1 ? "تمت محاذاة الطبقات المحددة" : "تمت محاذاة الطبقة داخل حاويتها");
  };

  const alignSelectedVertically = (mode: VerticalAlign) => {
    const ids = selectedIds.length ? selectedIds : selected ? [selected.id] : [];
    const nodes = ids.map((id) => document.querySelector<HTMLElement>(`[data-visual-id="${CSS.escape(id)}"]`)).filter((node): node is HTMLElement => node !== null && !overrideMap.get(node.dataset.visualId || "")?.isLocked);
    if (!nodes.length) return;
    const anchor = nodes[0];
    const anchorRect = anchor.getBoundingClientRect();
    const parentRect = anchor.parentElement?.getBoundingClientRect() ?? anchorRect;
    const target = nodes.length > 1
      ? mode === "top" ? anchorRect.top : mode === "bottom" ? anchorRect.bottom : anchorRect.top + anchorRect.height / 2
      : mode === "top" ? parentRect.top : mode === "bottom" ? parentRect.bottom : parentRect.top + parentRect.height / 2;
    const targets = nodes.length > 1 ? nodes.slice(1) : nodes;
    targets.forEach((node) => {
      const rect = node.getBoundingClientRect();
      const current = overrideMap.get(node.dataset.visualId || "");
      saveLayer(node.dataset.visualId || "", { layerX: current?.layerX ?? 0, layerY: alignedLayerY({ currentY: current?.layerY ?? 0, currentTop: rect.top, height: rect.height, target, mode }), layerWidth: current?.layerWidth ?? null, layerHeight: current?.layerHeight ?? null, layerZIndex: current?.layerZIndex ?? 0, isHidden: current?.isHidden ?? false });
    });
    setAlignmentGuides({ y: target });
    window.setTimeout(() => setAlignmentGuides({}), 850);
    toast.message(nodes.length > 1 ? "تمت محاذاة الطبقات رأسياً" : "تمت محاذاة الطبقة داخل حاويتها");
  };

  const distributeSelected = (axis: "horizontal" | "vertical") => {
    const nodes = selectedIds.map((id) => document.querySelector<HTMLElement>(`[data-visual-id="${CSS.escape(id)}"]`)).filter((node): node is HTMLElement => node !== null && !overrideMap.get(node.dataset.visualId || "")?.isLocked);
    if (nodes.length < 3) {
      toast.error("اختر ثلاث طبقات أو أكثر لتوزيع المسافات بالتساوي");
      return;
    }
    const spacing = distributeLayerSpacing(nodes.map((node) => {
      const rect = node.getBoundingClientRect();
      const current = overrideMap.get(node.dataset.visualId || "");
      return { id: node.dataset.visualId || "", start: axis === "horizontal" ? rect.left : rect.top, size: axis === "horizontal" ? rect.width : rect.height, offset: axis === "horizontal" ? current?.layerX ?? 0 : current?.layerY ?? 0 };
    }));
    spacing.forEach((offset, elementId) => {
      const current = overrideMap.get(elementId);
      saveLayer(elementId, { layerX: axis === "horizontal" ? offset : current?.layerX ?? 0, layerY: axis === "vertical" ? offset : current?.layerY ?? 0, layerWidth: current?.layerWidth ?? null, layerHeight: current?.layerHeight ?? null, layerZIndex: current?.layerZIndex ?? 0, isHidden: current?.isHidden ?? false });
    });
    toast.message(axis === "horizontal" ? "تم توزيع المسافات الأفقية بالتساوي" : "تم توزيع المسافات الرأسية بالتساوي");
  };

  const contextValue = useMemo<VisualEditorContextValue>(() => ({
    isEditing: isEditing && !previewMode && Boolean(pagePath) && isAdmin,
    isPreviewing: previewMode,
    isMobilePreview: mobilePreview,
    selectedId: selected?.id ?? null,
    selectedIds,
    selectedLabel: selected?.label ?? null,
    selectedTag: selected?.tag ?? null,
    pagePath,
    layerMode,
    gridEnabled,
    magnetEnabled,
    backgroundAspectLocked,
    backgroundAutoArrange,
    groupTranslation,
    select: selectElement,
    toggleEditing: () => { if (pagePath && isAdmin) { setIsEditing((current) => !current); setSelected(null); setSelectedIds([]); setLayerMode(false); } },
    openHomeEditor: () => { if (isAdmin) { if (pathname.split("?")[0] !== "/") { navigate("/?visual=1"); } else { setIsEditing(true); setSelected(null); setSelectedIds([]); setLayerMode(false); } } },
    toggleLayerMode: () => setLayerMode((current) => !current),
    toggleGrid: () => setGridEnabled((current) => !current),
    toggleMagnet: () => setMagnetEnabled((current) => !current),
    toggleBackgroundAspectLocked: () => { if (pagePath) setBackgroundPreferences((current) => ({ ...current, [pagePath]: { ...(current[pagePath] || DEFAULT_BACKGROUND_EDITOR_PREFERENCES), aspectLocked: !backgroundAspectLocked } })); },
    toggleBackgroundAutoArrange: () => { if (pagePath) setBackgroundPreferences((current) => ({ ...current, [pagePath]: { ...(current[pagePath] || DEFAULT_BACKGROUND_EDITOR_PREFERENCES), autoArrange: !backgroundAutoArrange } })); },
    saveLayer,
    deleteLayer,
    alignSelected,
    alignSelectedVertically,
    distributeSelected,
    showAlignmentGuides: setAlignmentGuides,
    setGroupTranslation,
    getOverride: (elementId) => resolveHeroOverrideForPreview(overrideMap, elementId),
    getOwnOverride: (elementId) => overrideMap.get(elementId),
  }), [isEditing, previewMode, mobilePreview, isAdmin, pagePath, pathname, navigate, layerMode, gridEnabled, magnetEnabled, backgroundAspectLocked, backgroundAutoArrange, groupTranslation, selected?.id, selected?.label, selected?.tag, selectedIds, overrideMap]);

  const saveSelected = () => {
    if (!pagePath || !selected) return;
    setLastSaved({ element: { id: selected.id, tag: selected.tag }, previous: currentOverride });
    const payload = {
      pagePath,
      elementId: selected.id as Parameters<typeof save.mutate>[0]["elementId"],
      elementTag: selected.tag,
      contentText: draft.contentText || null,
      mediaUrl: draft.mediaUrl || null,
      altText: draft.altText || null,
      linkUrl: draft.linkUrl || null,
      alignment: draft.alignment || null,
      textColor: draft.textColor || null,
      bgColor: draft.bgColor || null,
      fontSize: draft.fontSize || null,
      padding: draft.padding || null,
      margin: draft.margin || null,
      borderRadius: draft.borderRadius || null,
      layerX: draft.layerX,
      layerY: draft.layerY,
      layerWidth: draft.layerWidth,
    layerHeight: draft.layerHeight,
      layerZIndex: draft.layerZIndex,
      layerOpacity: draft.layerOpacity,
      backgroundSize: draft.backgroundSize,
      backgroundPositionX: draft.backgroundPositionX,
      backgroundPositionY: draft.backgroundPositionY,
      backgroundOverlay: draft.backgroundOverlay,
      customCss: draft.customCss || null,
      isLocked: draft.isLocked,
      isHidden: draft.isHidden,
    };
    const sharedTargets = sharedHeroElementIds(selected.id);
    const optimisticOverride: VisualOverride = {
      id: currentOverride?.id ?? -1,
      pagePath,
      elementId: selected.id,
      elementTag: selected.tag,
      contentText: payload.contentText,
      mediaUrl: payload.mediaUrl,
      altText: payload.altText,
      linkUrl: payload.linkUrl,
      alignment: payload.alignment,
      textColor: payload.textColor,
      bgColor: payload.bgColor,
      fontSize: payload.fontSize,
      padding: payload.padding,
      margin: payload.margin,
      borderRadius: payload.borderRadius,
      layerX: payload.layerX,
      layerY: payload.layerY,
      layerWidth: payload.layerWidth,
      layerHeight: payload.layerHeight,
      layerZIndex: payload.layerZIndex,
      layerOpacity: payload.layerOpacity,
      backgroundSize: payload.backgroundSize,
      backgroundPositionX: payload.backgroundPositionX,
      backgroundPositionY: payload.backgroundPositionY,
      backgroundOverlay: payload.backgroundOverlay,
      customCss: draft.customCss || null,
      isLocked: payload.isLocked,
      isHidden: payload.isHidden,
      status: "published",
    };
    setLocalOverrides((current) => ({
      ...current,
      ...Object.fromEntries(sharedTargets.map((elementId) => [`${pagePath}::${elementId}`, { ...optimisticOverride, elementId }])),
    }));
    // Immediate direct DOM update for instant live responsiveness
    const domNode = document.querySelector<HTMLElement>(`[data-visual-id="${CSS.escape(selected.id)}"]`);
    if (domNode) {
      if (payload.contentText !== null && payload.contentText !== undefined) {
        const textChild = Array.from(domNode.childNodes).find((n) => n.nodeType === Node.TEXT_NODE);
        if (textChild) textChild.textContent = payload.contentText;
        else domNode.textContent = payload.contentText;
      }
      if (payload.mediaUrl && domNode.tagName === "IMG") {
        (domNode as HTMLImageElement).src = payload.mediaUrl;
      }
      if (payload.textColor) {
        domNode.style.color = payload.textColor;
      }
      if (payload.fontSize) {
        domNode.style.fontSize = payload.fontSize;
      }
    }

    let savedCount = 0;
    sharedTargets.forEach((elementId) => {
      save.mutate({ ...payload, elementId: elementId as Parameters<typeof save.mutate>[0]["elementId"] }, {
        onSuccess: () => {
          publish.mutate({ pagePath, elementId: elementId as Parameters<typeof publish.mutate>[0]["elementId"] });
          savedCount += 1;
          if (savedCount === sharedTargets.length) toast.success(isSharedHeroBackground(selected.id) ? "تم تطبيق خلفية الغلاف ونشرها للهاتف واللابتوب" : "تم حفظ التعديل ونشره فوراً على الصفحة");
        },
        onError: (err) => {
          toast.error(err.message || "تعذر حفظ التعديل");
          setLocalOverrides((current) => {
            const next = { ...current };
            sharedTargets.forEach((target) => delete next[`${pagePath}::${target}`]);
            return next;
          });
        },
      });
    });
  };


  const restoreSelectedOrigin = () => {
    if (!pagePath || !selected) return;
    draftPreviewEnabled.current = false;
    setLocalOverrides((current) => clearLocalPreviewAfterReset(current, pagePath, selected.id));
    setDraft(EMPTY_DRAFT);
    reset.mutate({ pagePath, elementId: selected.id as Parameters<typeof reset.mutate>[0]["elementId"] });
  };

  const saveElementFavorite = () => {
    if (!selected) return;
    const favorite: ElementFavorite = { id: `${selected.tag}-${Date.now().toString(36)}`, name: selected.label, tag: selected.tag, draft: { ...draft, layerX: 0, layerY: 0, layerZIndex: 0, isLocked: false, isHidden: false } };
    setElementFavorites((favorites) => {
      const next = [favorite, ...favorites.filter((item) => item.name !== favorite.name || item.tag !== favorite.tag)].slice(0, 12);
      window.localStorage.setItem("alaqeeq-element-favorites", JSON.stringify(next));
      return next;
    });
    toast.success("تم حفظ العنصر في مفضلات هذا الجهاز");
  };

  const duplicateSelected = () => {
    if (!pagePath || !selected) return;
    const sectionId = `section-custom-${Date.now().toString(36)}`;
    const isVideo = selected.tag === "video";
    const builderElement: "image" | "button" | "text" = selected.tag === "image" ? "image" : selected.tag === "button" ? "button" : "text";
    const config = isVideo
      ? { title: draft.contentText || selected.label, body: "نسخة مكررة من الفيديو", videoUrl: draft.mediaUrl, videoHref: draft.linkUrl, anchorId: "page-end" }
      : { builderElement, title: draft.contentText || selected.label, body: selected.tag === "text" ? draft.contentText || "" : "", imageUrl: draft.mediaUrl, imageAlt: draft.altText, imageHref: draft.linkUrl, buttonText: draft.contentText || selected.label, buttonHref: draft.linkUrl, anchorId: "page-end" };
    saveDuplicatedSection.mutate({ pagePath, sectionId, sectionType: isVideo ? "video" : "custom", orderIndex: builderSections.length, config });
  };

  const undoLastSave = () => {
    if (!pagePath || !lastSaved) return;
    if (!lastSaved.previous) {
      reset.mutate({ pagePath, elementId: lastSaved.element.id as Parameters<typeof reset.mutate>[0]["elementId"] });
    } else {
      const previous = lastSaved.previous;
      save.mutate({ pagePath, elementId: previous.elementId as Parameters<typeof save.mutate>[0]["elementId"], elementTag: previous.elementTag, contentText: previous.contentText, mediaUrl: previous.mediaUrl, altText: previous.altText, linkUrl: previous.linkUrl, alignment: previous.alignment, textColor: previous.textColor, bgColor: previous.bgColor, fontSize: previous.fontSize, padding: previous.padding, margin: previous.margin, borderRadius: previous.borderRadius, layerX: previous.layerX, layerY: previous.layerY, layerWidth: previous.layerWidth, layerHeight: previous.layerHeight, layerZIndex: previous.layerZIndex, layerOpacity: previous.layerOpacity, backgroundSize: previous.backgroundSize, backgroundPositionX: previous.backgroundPositionX, backgroundPositionY: previous.backgroundPositionY, backgroundOverlay: previous.backgroundOverlay, isLocked: previous.isLocked, isHidden: previous.isHidden });
    }
    setLastSaved(null);
  };

  const publishSelected = () => {
    if (!pagePath || !selected) return;
    publish.mutate({ pagePath, elementId: selected.id as Parameters<typeof publish.mutate>[0]["elementId"] });
  };

  const selectMediaForDraft = (asset: { url: string; altText: string | null }) => {
    draftPreviewEnabled.current = true;
    stageSelectedBackground({ mediaUrl: asset.url, altText: asset.altText || draft.altText });
    setMediaLibraryOpen(false);
    toast.success("تم اختيار الصورة كمعاينة مباشرة — اضغط «حفظ ونشر التعديل» لتطبيقها");
  };


  const confirmMediaReplacement = () => {
    if (!pendingMediaAsset) return;
    draftPreviewEnabled.current = true;
    stageSelectedBackground({ mediaUrl: pendingMediaAsset.url, altText: pendingMediaAsset.altText || draft.altText });
    setPendingMediaAsset(null);
    toast.message("تم تطبيق الصورة كمعاينة محلية — لن تُنشر إلا بعد الحفظ اليدوي");
  };

  const focusBackgroundBehindLogo = () => {
    if (!selected) return;
    const elementId = heroBackgroundLayerFor(selected.id);
    const node = document.querySelector<HTMLElement>(`[data-visual-id="${CSS.escape(elementId)}"]`);
    const elementTag = node?.dataset.visualTag as ElementTag | undefined;
    if (!node || !elementTag) { toast.error("تعذر العثور على طبقة الخلفية لهذا الشعار"); return; }
    setSelected({ id: elementId, tag: elementTag, label: node.dataset.visualLabel || "خلفية الغلاف" });
    setSelectedIds([elementId]);
    setToolGroup("design");
    toast.message("تم تحديد صورة الخلفية خلف الشعار — اختر صورتك الآن");
  };

  const stageSelectedBackground = (patch: Partial<Pick<VisualOverride, "bgColor" | "mediaUrl" | "altText" | "backgroundSize" | "backgroundPositionX" | "backgroundPositionY" | "backgroundOverlay">>) => {
    if (!selected || !pagePath) return;
    draftPreviewEnabled.current = true;
    const current = currentOverride;
    const next: VisualOverride = { id: current?.id ?? -1, pagePath, elementId: selected.id, elementTag: selected.tag, contentText: current?.contentText ?? null, mediaUrl: patch.mediaUrl ?? current?.mediaUrl ?? null, altText: patch.altText ?? current?.altText ?? null, linkUrl: current?.linkUrl ?? null, alignment: current?.alignment ?? "center", textColor: current?.textColor ?? null, bgColor: patch.bgColor ?? current?.bgColor ?? null, fontSize: current?.fontSize ?? null, padding: current?.padding ?? null, margin: current?.margin ?? null, borderRadius: current?.borderRadius ?? null, layerX: current?.layerX ?? draft.layerX, layerY: current?.layerY ?? draft.layerY, layerWidth: current?.layerWidth ?? draft.layerWidth, layerHeight: current?.layerHeight ?? draft.layerHeight, layerZIndex: current?.layerZIndex ?? draft.layerZIndex, layerOpacity: current?.layerOpacity ?? draft.layerOpacity, backgroundSize: patch.backgroundSize ?? current?.backgroundSize ?? draft.backgroundSize, backgroundPositionX: patch.backgroundPositionX ?? current?.backgroundPositionX ?? draft.backgroundPositionX, backgroundPositionY: patch.backgroundPositionY ?? current?.backgroundPositionY ?? draft.backgroundPositionY, backgroundOverlay: patch.backgroundOverlay ?? current?.backgroundOverlay ?? draft.backgroundOverlay, customCss: draft.customCss || current?.customCss || null, isLocked: current?.isLocked ?? draft.isLocked, isHidden: current?.isHidden ?? draft.isHidden, status: "draft" };
    setUndoStack((stack) => [...stack, localOverrides].slice(-40));
    setRedoStack([]);
    setLocalOverrides((overrides) => ({
      ...overrides,
      ...Object.fromEntries(sharedHeroBackgroundIds(selected.id).map((elementId) => [`${pagePath}::${elementId}`, { ...next, elementId }])),
    }));
    setDraft((value) => ({ ...value, bgColor: patch.bgColor ?? value.bgColor, mediaUrl: patch.mediaUrl ?? value.mediaUrl, altText: patch.altText ?? value.altText, backgroundSize: patch.backgroundSize ?? value.backgroundSize, backgroundPositionX: patch.backgroundPositionX ?? value.backgroundPositionX, backgroundPositionY: patch.backgroundPositionY ?? value.backgroundPositionY, backgroundOverlay: patch.backgroundOverlay ?? value.backgroundOverlay }));
  };

  const currentBackground = () => ({ bgColor: currentOverride?.bgColor ?? draft.bgColor ?? "", mediaUrl: currentOverride?.mediaUrl ?? draft.mediaUrl ?? "", backgroundSize: currentOverride?.backgroundSize ?? draft.backgroundSize, backgroundPositionX: currentOverride?.backgroundPositionX ?? draft.backgroundPositionX, backgroundPositionY: currentOverride?.backgroundPositionY ?? draft.backgroundPositionY, backgroundOverlay: currentOverride?.backgroundOverlay ?? draft.backgroundOverlay });

  const saveBackgroundFavorite = () => {
    const background = currentBackground();
    if (!background.bgColor && !background.mediaUrl) { toast.error("اختر لوناً أو صورة للخلفية أولاً"); return; }
    const id = `${background.mediaUrl || background.bgColor}-${background.backgroundSize}-${background.backgroundPositionX}-${background.backgroundPositionY}-${background.backgroundOverlay}`;
    setBackgroundFavorites((favorites) => [{ id, name: background.mediaUrl ? "صورة محفوظة" : "تدرّج أو لون محفوظ", ...background }, ...favorites.filter((favorite) => favorite.id !== id)].slice(0, 12));
    toast.success("تم حفظ الخلفية في المفضلة على هذا الجهاز");
  };

  const applyCurrentBackground = (scope: "selected" | "same-type") => {
    if (!selected || !pagePath) { toast.error("اختر مربعاً أو طبقة أولاً"); return; }
    const background = currentBackground();
    const ids = scope === "selected" ? (selectedIds.length > 1 ? selectedIds : [selected.id]) : Array.from(document.querySelectorAll<HTMLElement>(`[data-visual-tag="${selected.tag}"]`)).map((node) => node.dataset.visualId).filter((id): id is string => Boolean(id));
    if (!ids.length) return;
    setUndoStack((stack) => [...stack, localOverrides].slice(-40));
    setRedoStack([]);
    setLocalOverrides((overrides) => {
      const next = { ...overrides };
      ids.forEach((elementId) => {
        const node = document.querySelector<HTMLElement>(`[data-visual-id="${CSS.escape(elementId)}"]`);
        const elementTag = (node?.dataset.visualTag as ElementTag | undefined) ?? selected.tag;
        const existing = overrideMap.get(elementId);
        next[`${pagePath}::${elementId}`] = { id: existing?.id ?? -1, pagePath, elementId, elementTag, contentText: existing?.contentText ?? null, mediaUrl: background.mediaUrl || null, altText: existing?.altText ?? null, linkUrl: existing?.linkUrl ?? null, alignment: existing?.alignment ?? "center", textColor: existing?.textColor ?? null, bgColor: background.bgColor || null, fontSize: existing?.fontSize ?? null, padding: existing?.padding ?? null, margin: existing?.margin ?? null, borderRadius: existing?.borderRadius ?? null, layerX: existing?.layerX ?? 0, layerY: existing?.layerY ?? 0, layerWidth: existing?.layerWidth ?? null, layerHeight: existing?.layerHeight ?? null, layerZIndex: existing?.layerZIndex ?? 0, layerOpacity: existing?.layerOpacity ?? 100, backgroundSize: background.backgroundSize, backgroundPositionX: background.backgroundPositionX, backgroundPositionY: background.backgroundPositionY, backgroundOverlay: background.backgroundOverlay, customCss: existing?.customCss ?? null, isLocked: existing?.isLocked ?? false, isHidden: existing?.isHidden ?? false, status: "draft" };
      });
      return next;
    });
    toast.success(scope === "selected" ? `تم تطبيق الخلفية على ${ids.length} طبقات مختارة` : `تم تطبيق الخلفية على ${ids.length} طبقات من النوع نفسه`);
  };

  const layerBehavior = parseLayerBehavior(draft.customCss);
  const updateLayerBehavior = (patch: Partial<LayerBehavior>) => {
    draftPreviewEnabled.current = true;
    setDraft((current) => ({ ...current, customCss: serializeLayerBehavior(current.customCss, patch) }));
  };
  const updateDesignEffects = (patch: DesignEffectsPatch) => updateLayerBehavior(patch);
  const savedBackgroundOrigin = selected ? resolveBackgroundOrigin(selected.id, layerBehavior.backgroundOriginal) : undefined;
  const makeCurrentBackgroundOriginal = () => {
    const background = currentBackground();
    if (!background.mediaUrl && !background.bgColor) { toast.error("اختر صورة أو لوناً للخلفية أولاً"); return; }
    updateLayerBehavior({ backgroundOriginal: background });
    toast.success("تم حفظ هذه الخلفية كأصل مخصص — اضغط حفظ ونشر الآن لتثبيتها");
  };
  const restoreSavedBackgroundOrigin = () => {
    if (!savedBackgroundOrigin) { toast.error("لا يوجد أصل محفوظ لهذه الخلفية بعد"); return; }
    stageSelectedBackground(savedBackgroundOrigin);
    toast.success("عادت الخلفية إلى الأصل المحفوظ — اضغط حفظ ونشر الآن لتثبيتها");
  };
  const applyReadyStyleTemplate = (template: ReadyStyleTemplate) => {
    draftPreviewEnabled.current = true;
    setDraft((current) => ({ ...current, ...template.patch, customCss: template.behavior ? serializeLayerBehavior(current.customCss, template.behavior) : current.customCss }));
    toast.success(`تم تطبيق قالب «${template.label}» كمسودة`);
  };
  const applyBrandStylePack = (pack: (typeof BRAND_STYLE_PACKS)[number]) => {
    draftPreviewEnabled.current = true;
    setDraft((current) => ({ ...current, textColor: pack.textColor, bgColor: pack.bgColor, customCss: serializeLayerBehavior(current.customCss, pack.behavior) }));
    toast.success(`تم تطبيق حزمة «${pack.label}» كمسودة`);
  };
  const runPrePublishCheck = () => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-visual-id]"));
    const issues = nodes.flatMap((node) => {
      const elementId = node.dataset.visualId || "";
      const tag = node.dataset.visualTag as ElementTag | undefined;
      const override = overrideMap.get(elementId);
      const label = node.dataset.visualLabel || elementId;
      if (override?.isHidden) return [`${label}: مخفية`];
      if (tag === "button" && !override?.linkUrl && !node.textContent?.trim()) return [`${label}: زر بلا نص أو رابط`];
      if (tag === "image" && !override?.mediaUrl && !node.querySelector("img")) return [`${label}: صورة بلا مصدر`];
      return [];
    });
    if (issues.length) toast.warning(`فحص قبل النشر: ${issues.slice(0, 3).join(" · ")}${issues.length > 3 ? ` +${issues.length - 3}` : ""}`); else toast.success("فحص قبل النشر: لا توجد مشكلات ظاهرة في عناصر الصفحة");
  };

  const fitSelectedBackground = (axis: "width" | "height" | "fill" | "contain") => {
    if (!selected) return;
    const node = document.querySelector<HTMLElement>(`[data-visual-id="${CSS.escape(selected.id)}"]`);
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const workspace = node.parentElement?.getBoundingClientRect() ?? { width: window.innerWidth, height: window.innerHeight };
    const ratio = rect.width / Math.max(rect.height, 1);
    const fitted = axis === "fill" || axis === "contain" ? fitLayerToWorkspace({ x: currentOverride?.layerX ?? draft.layerX, y: currentOverride?.layerY ?? draft.layerY, width: rect.width, height: rect.height }, workspace, axis) : { x: currentOverride?.layerX ?? draft.layerX, y: currentOverride?.layerY ?? draft.layerY, width: Math.max(24, Math.round(axis === "width" ? workspace.width : workspace.height * ratio)), height: Math.max(24, Math.round(axis === "height" ? workspace.height : workspace.width / ratio)) };
    const { x: layerX, y: layerY, width: layerWidth, height: layerHeight } = fitted;
    saveLayer(selected.id, { layerX, layerY, layerWidth, layerHeight, layerZIndex: currentOverride?.layerZIndex ?? draft.layerZIndex, layerOpacity: currentOverride?.layerOpacity ?? draft.layerOpacity, isHidden: currentOverride?.isHidden ?? draft.isHidden });
    if (backgroundAutoArrange) {
      Array.from(document.querySelectorAll<HTMLElement>("[data-visual-id]")).filter((candidate) => candidate !== node && !node.contains(candidate) && candidate.getBoundingClientRect().top >= rect.bottom - 10).forEach((candidate) => {
        const shift = verticalStackShift(rect.height, layerHeight, candidate.getBoundingClientRect().top, rect.bottom);
        const elementId = candidate.dataset.visualId;
        if (!shift || !elementId || !canManipulateLayer(overrideMap.get(elementId)?.isLocked)) return;
        const current = overrideMap.get(elementId);
        saveLayer(elementId, { layerX: current?.layerX ?? 0, layerY: (current?.layerY ?? 0) + shift, layerWidth: current?.layerWidth ?? null, layerHeight: current?.layerHeight ?? null, layerZIndex: current?.layerZIndex ?? 0, layerOpacity: current?.layerOpacity ?? 100, isHidden: current?.isHidden ?? false });
      });
    }
    toast.success(axis === "width" ? "تمت ملاءمة الخلفية مع عرض مساحة العمل" : axis === "height" ? "تمت ملاءمة الخلفية مع ارتفاع مساحة العمل" : axis === "fill" ? "تم ملء مساحة العمل بالخلفية" : "تم احتواء الخلفية كاملة داخل مساحة العمل");
  };

  const advancedTools = null;

  const closeWorkspacePanels = () => {
    setOperationsOpen(false);
    setBuilderOpen(false);
    setAddPanelOpen(false);
    setLayersOpen(false);
    setDesignToolsOpen(false);
    setTrashOpen(false);
    setWorkspaceMediaOpen(false);
    setPageMapOpen(false);
  };
  const openWorkspacePanel = (panel: "add" | "layers" | "map" | "media" | "builder" | "operations" | "trash" | "effects", trigger?: MouseEvent<HTMLButtonElement>) => {
    const alreadyOpen = panel === "add" ? addPanelOpen : panel === "layers" ? layersOpen : panel === "map" ? pageMapOpen : panel === "media" ? workspaceMediaOpen : panel === "builder" ? builderOpen : panel === "operations" ? operationsOpen : panel === "trash" ? trashOpen : designToolsOpen;
    closeWorkspacePanels();
    if (alreadyOpen) return;
    setSidebarsCollapsed(false);
    if (trigger) setPanelAnchorTop(Math.round(trigger.currentTarget.getBoundingClientRect().top));
    if (panel === "add") setAddPanelOpen(true);
    if (panel === "layers") setLayersOpen(true);
    if (panel === "map") setPageMapOpen(true);
    if (panel === "media") setWorkspaceMediaOpen(true);
    if (panel === "builder") { setBuilderTab("sections"); setBuilderOpen(true); }
    if (panel === "operations") setOperationsOpen(true);
    if (panel === "trash") setTrashOpen(true);
    if (panel === "effects") {
      if (!selected) { toast.message("اختر طبقة أولاً لفتح أدوات التأثيرات"); return; }
      setDesignToolsOpen(true);
    }
  };

  const editorToolbar = isAdmin && pagePath && isEditing && !previewMode ? (
    <nav className="aq-editor-toolbar aq-key-toolbar" aria-label="شريط أدوات التحرير" dir="rtl">
      <div className="aq-key-toolbar-core">
        <WorkspaceButton
          active={false}
          label={toolbarSide === "left" ? "نقل الشريط إلى اليمين" : "نقل الشريط إلى اليسار"}
          icon={<ArrowLeftRight size={15} />}
          onClick={() => setToolbarSide(toggleEditorToolbarSide)}
        />
        <span className="aq-key-divider" aria-hidden="true" />
        <WorkspaceButton active={addPanelOpen} label="إضافة عنصر (+)" icon={<Plus size={18} />} onClick={() => openWorkspacePanel("add")} />
        <WorkspaceButton active={layersOpen} label="الطبقات" icon={<Layers3 size={16} />} onClick={() => openWorkspacePanel("layers")} />
        <WorkspaceButton active={workspaceMediaOpen} label="مكتبة الوسائط" icon={<ImageIcon size={16} />} onClick={() => openWorkspacePanel("media")} />
        <WorkspaceButton active={layerMode} label="تحريك حر" icon={<Move size={16} />} onClick={() => setLayerMode((current) => !current)} />
        <span className="aq-key-divider" aria-hidden="true" />
        <WorkspaceButton active={false} label="تراجع" icon={<Undo2 size={16} />} onClick={undoSession} disabled={!undoStack.length} />
        <WorkspaceButton active={false} label="إعادة" icon={<Redo2 size={16} />} onClick={redoSession} disabled={!redoStack.length} />
        <WorkspaceButton active={mobilePreview} label="معاينة الهاتف" icon={<Smartphone size={16} />} onClick={() => setMobilePreview((current) => !current)} />
        <WorkspaceButton active={false} label="معاينة كزائر" icon={<Eye size={16} />} onClick={() => setPreviewMode(true)} />
        <span className="aq-key-divider" aria-hidden="true" />
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-black pointer-events-none">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>المحرر الذكي نشط (يتعرف على كل عنصر)</span>
        </div>
        <WorkspaceButton active={false} label="حفظ ونشر" icon={<Check size={17} />} onClick={runPrePublishCheck} />
        <WorkspaceButton active={false} label="خروج" icon={<X size={17} />} onClick={() => { closeWorkspacePanels(); setIsEditing(false); setSelected(null); setSelectedIds([]); setLayerMode(false); setToolGroup(null); }} />
      </div>
    </nav>
  ) : null;
  return <VisualEditorContext.Provider value={contextValue}><div className={isEditing && mobilePreview ? "mx-auto min-h-screen max-w-[390px] overflow-hidden border-x border-amber-400/35 bg-[#090b12] shadow-[0_0_0_1px_rgba(251,191,36,.15),0_20px_80px_rgba(0,0,0,.7)]" : ""}>{isEditing && !previewMode && layerMode && gridEnabled ? <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1] opacity-40 [background-image:linear-gradient(rgba(56,189,248,.24)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,.24)_1px)] [background-size:8px_8px]" /> : null}{selectionBox && !previewMode ? <div aria-hidden="true" className="pointer-events-none fixed z-[79] border border-sky-300 bg-sky-300/10" style={{ left: selectionBox.left, top: selectionBox.top, width: selectionBox.width, height: selectionBox.height }} /> : null}{alignmentGuides.x !== undefined && !previewMode ? <div aria-hidden="true" className="pointer-events-none fixed inset-y-0 z-[79] border-l-2 border-fuchsia-300" style={{ left: alignmentGuides.x }} /> : null}{alignmentGuides.y !== undefined && !previewMode ? <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 z-[79] border-t-2 border-fuchsia-300" style={{ top: alignmentGuides.y }} /> : null}{editorToolbar}{advancedTools}{children}</div>{previewMode ? <button onClick={() => setPreviewMode(false)} className="fixed left-4 top-4 z-[320] rounded-full border border-amber-300/35 bg-[#111521]/95 px-4 py-2 text-xs font-black text-amber-100 shadow-xl backdrop-blur">عودة للتحرير</button> : null}{pendingLayerDeletion ? <div className="fixed bottom-4 left-4 right-4 z-[320] flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-300/35 bg-[#171018]/[.98] p-3 shadow-2xl backdrop-blur sm:right-auto sm:w-[min(440px,calc(100vw-32px))]" dir="rtl"><div className="min-w-0"><div className="text-xs font-black text-rose-100">تم مسح «{pendingLayerDeletion.label}» كمسودة</div><p className="mt-1 text-[10px] leading-4 text-slate-400">لن يُحفظ الحذف على الموقع إلا عند تأكيد حفظ المسودة.</p></div><div className="flex shrink-0 gap-2"><button onClick={restorePendingLayerDeletion} className="rounded-xl border border-white/15 px-3 py-2 text-xs font-black text-slate-100">تراجع</button><button onClick={savePendingLayerDeletion} disabled={save.isPending} className="rounded-xl bg-rose-300 px-3 py-2 text-xs font-black text-rose-950 disabled:opacity-50">حفظ المسودة</button></div></div> : null}{isAdmin && pagePath ? <>
    <EditorOperationsDrawer open={shouldShowWorkspacePanel(isEditing, previewMode, operationsOpen)} onClose={() => setOperationsOpen(false)} onManage={() => navigate("/control")} />
    <SiteBuilderDrawer open={shouldShowWorkspacePanel(isEditing, previewMode, builderOpen)} onClose={() => setBuilderOpen(false)} pagePath={pagePath} initialTab={builderTab} />
    <VisualAddPanel open={shouldShowWorkspacePanel(isEditing, previewMode, addPanelOpen)} onClose={() => setAddPanelOpen(false)} pagePath={pagePath} />
    <VisualLayersPanel open={shouldShowWorkspacePanel(isEditing, previewMode, layersOpen)} onClose={() => setLayersOpen(false)} onOpenTrash={() => { setTrashOpen(true); setLayersOpen(false); }} />
    <LayerTrashPanel open={shouldShowWorkspacePanel(isEditing, previewMode, trashOpen)} onClose={() => setTrashOpen(false)} pagePath={pagePath} />
    <DesignToolsPanel open={shouldShowWorkspacePanel(isEditing && Boolean(selected), previewMode, designToolsOpen)} onClose={() => setDesignToolsOpen(false)} label={selected?.label || "الطبقة"} effects={{ filterPreset: layerBehavior.filterPreset || "original", blurAmount: layerBehavior.blurAmount || 0, shadowPreset: layerBehavior.shadowPreset || "none", blendMode: layerBehavior.blendMode || "normal", glass: layerBehavior.glass, innerShadow: layerBehavior.innerShadow, gradientBorder: layerBehavior.gradientBorder, texture: layerBehavior.texture }} onPatch={updateDesignEffects} />
    <PageMapDrawer open={shouldShowWorkspacePanel(isEditing, previewMode, pageMapOpen)} onClose={() => setPageMapOpen(false)} currentLocation={`${window.location.pathname}${window.location.search}`} />
    <MediaLibrary open={shouldShowWorkspacePanel(isEditing, previewMode, workspaceMediaOpen)} onClose={() => setWorkspaceMediaOpen(false)} workspace />
    <MediaLibrary open={shouldShowWorkspacePanel(isEditing, previewMode, mediaLibraryOpen)} onClose={() => setMediaLibraryOpen(false)} accept={selected?.tag === "video" ? "video" : "image"} onSelect={selectMediaForDraft} />
    {pendingMediaAsset ? <div className="fixed inset-0 z-[430] grid place-items-center bg-black/65 p-4 backdrop-blur-sm" role="alertdialog" aria-modal="true" aria-labelledby="replace-media-title" dir="rtl"><section className="w-full max-w-md rounded-3xl border border-amber-300/35 bg-[#111521] p-5 shadow-2xl"><div className="text-[11px] font-black tracking-[.14em] text-amber-300">استبدال الصورة</div><h2 id="replace-media-title" className="mt-2 text-lg font-black text-amber-50">تطبيق الصورة الجديدة كمعاينة؟</h2><p className="mt-2 text-sm leading-6 text-slate-300">ستُستبدل الصورة داخل القماش فورًا كمسودة محلية فقط. يمكنك استعادة الأصل أو تجاهل التعديل قبل الحفظ والنشر.</p><div className="mt-5 grid grid-cols-2 gap-2"><button onClick={() => setPendingMediaAsset(null)} className="rounded-xl border border-white/15 px-3 py-3 text-xs font-black text-slate-200 transition hover:bg-white/[0.06]">إلغاء</button><button onClick={confirmMediaReplacement} className="rounded-xl bg-amber-300 px-3 py-3 text-xs font-black text-amber-950 transition hover:bg-amber-200">تطبيق كمعاينة</button></div></section></div> : null}
    {selected && shouldShowPropertiesPanel(isEditing, true, previewMode, mobilePreview) ? (
      <aside
        ref={inspectorRef}
        data-aq-editor-properties
        data-aq-background-selected={isSelectedBackground ? "true" : undefined}
        onInputCapture={() => { draftPreviewEnabled.current = true; }}
        onClickCapture={() => { draftPreviewEnabled.current = true; }}
        style={
          inspectorDocked
            ? undefined
            : {
                left: `${inspectorPosition.x}px`,
                top: `${inspectorPosition.y}px`,
                width: `${inspectorSize.width}px`,
                height: inspectorMinimized ? "auto" : `${inspectorSize.height}px`,
                maxHeight: inspectorMinimized ? "auto" : "calc(100svh - 30px)",
                position: "fixed",
                zIndex: 340,
              }
        }
        className={`fixed z-[340] flex touch-pan-y flex-col overflow-hidden border border-amber-400/35 bg-[#0a0a0a]/[0.98] text-white shadow-[0_25px_70px_rgba(0,0,0,0.85)] backdrop-blur-2xl transition-[box-shadow,border-color] ${
          inspectorDocked
            ? "inset-y-0 right-0 left-auto w-[380px] rounded-none border-y-0 border-r-0 border-l border-amber-400/25 max-h-none"
            : "rounded-2xl"
        }`}
        dir="rtl"
      >
        {/* Resize handles when floating */}
        {/* 8-Direction Resize handles when floating */}
        {!inspectorDocked && !inspectorMinimized ? (
          <>
            {/* Edges */}
            <div onPointerDown={(e) => startInspectorResize(e, "w")} className="absolute left-0 inset-y-2 w-2 cursor-ew-resize hover:bg-amber-400/30 transition z-10" title="توسيع أو تصغير العرض" />
            <div onPointerDown={(e) => startInspectorResize(e, "e")} className="absolute right-0 inset-y-2 w-2 cursor-ew-resize hover:bg-amber-400/30 transition z-10" title="توسيع أو تصغير العرض" />
            <div onPointerDown={(e) => startInspectorResize(e, "n")} className="absolute top-0 inset-x-2 h-2 cursor-ns-resize hover:bg-amber-400/30 transition z-10" title="توسيع أو تصغير الارتفاع" />
            <div onPointerDown={(e) => startInspectorResize(e, "s")} className="absolute bottom-0 inset-x-2 h-2 cursor-ns-resize hover:bg-amber-400/30 transition z-10" title="توسيع أو تصغير الارتفاع" />
            {/* Corners */}
            <div onPointerDown={(e) => startInspectorResize(e, "nw")} className="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize hover:bg-amber-400/40 rounded-tl-2xl transition z-20" title="تغيير المقاس" />
            <div onPointerDown={(e) => startInspectorResize(e, "ne")} className="absolute top-0 right-0 w-4 h-4 cursor-nesw-resize hover:bg-amber-400/40 rounded-tr-2xl transition z-20" title="تغيير المقاس" />
            <div onPointerDown={(e) => startInspectorResize(e, "sw")} className="absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize hover:bg-amber-400/40 rounded-bl-2xl transition z-20" title="تغيير المقاس" />
            <div onPointerDown={(e) => startInspectorResize(e, "se")} className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize hover:bg-amber-400/40 rounded-br-2xl transition z-20" title="تغيير المقاس" />
          </>
        ) : null}

        {/* Header - Draggable */}
        <div
          onPointerDown={startInspectorDrag}
          className={`flex items-center justify-between border-b border-white/[0.08] bg-black/60 px-4 py-3 select-none ${
            inspectorDocked ? "" : "cursor-grab active:cursor-grabbing"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {!inspectorDocked ? <GripHorizontal size={17} className="shrink-0 text-amber-400/70" /> : null}
            <div className="min-w-0">
              <div className="text-[10px] font-black tracking-wider text-amber-300">تعديل العنصر</div>
              <h2 className="mt-0.5 truncate text-sm font-black text-white">{selected.label}</h2>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setInspectorMinimized((m) => !m)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white/[0.08] hover:text-white transition"
              title={inspectorMinimized ? "توسيع" : "تصغير"}
            >
              {inspectorMinimized ? <Square size={14} /> : <Minus size={14} />}
            </button>
            <button
              type="button"
              onClick={() => setInspectorDocked((d) => !d)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white/[0.08] hover:text-white transition"
              title={inspectorDocked ? "جعل القائمة عائمة" : "تثبيت في الجانب"}
            >
              {inspectorDocked ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
            </button>
            <button type="button" onClick={() => deleteLayer(selected.id, selected.label)} className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-500/15 transition" title="مسح العنصر">
              <Trash2 size={15} />
            </button>
            <button type="button" onClick={() => setSelected(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/[0.08] hover:text-white transition" title="إغلاق">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        {!inspectorMinimized ? (
          <>
            <div className="aq-editor-properties-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="space-y-4 p-4">
          {["studio-hero-journal-image", "studio-hero-album-image", "studio-hero-showcase-image"].includes(selected.id) && (
            <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-2.5">
              <div className="text-[11px] font-black text-amber-300 mb-2">أغلفة الواجهة الرئيسية (بدّل بينها مباشرة):</div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => selectElement("studio-hero-journal-image", "image", "صورة غلاف المجلة")}
                  className={`py-1.5 px-1 rounded-xl text-[11px] font-black transition ${
                    selected.id === "studio-hero-journal-image" ? "bg-[#f8ca14] text-black shadow" : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                >
                  📘 المجلة
                </button>
                <button
                  type="button"
                  onClick={() => selectElement("studio-hero-album-image", "image", "صورة غلاف الألبومات")}
                  className={`py-1.5 px-1 rounded-xl text-[11px] font-black transition ${
                    selected.id === "studio-hero-album-image" ? "bg-[#5aba1c] text-white shadow" : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                >
                  📸 الألبومات
                </button>
                <button
                  type="button"
                  onClick={() => selectElement("studio-hero-showcase-image", "image", "صورة غلاف الأخبار")}
                  className={`py-1.5 px-1 rounded-xl text-[11px] font-black transition ${
                    selected.id === "studio-hero-showcase-image" ? "bg-[#6565e0] text-white shadow" : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                >
                  📰 الأخبار
                </button>
              </div>
            </div>
          )}
          {/* TEXT CONTROLS */}
          {!(["section", "section-block", "image", "video", "icon"] as ElementTag[]).includes(selected.tag) ? (
            <div className="space-y-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3.5">
              <label className="block text-xs font-bold text-slate-300">
                <span>محتوى النص</span>
                <textarea
                  value={draft.contentText}
                  onChange={(event) => {
                    draftPreviewEnabled.current = true;
                    setDraft((value) => ({ ...value, contentText: event.target.value }));
                  }}
                  placeholder="اكتب النص هنا..."
                  className="mt-2 min-h-20 w-full rounded-xl border border-slate-700 bg-black/40 p-3 text-sm leading-6 text-white outline-none focus:border-amber-400"
                />
              </label>
              
              <div className="grid grid-cols-2 gap-3 pt-1">
                <ColorField
                  label="لون النص"
                  value={draft.textColor}
                  onChange={(textColor) => {
                    draftPreviewEnabled.current = true;
                    setDraft((value) => ({ ...value, textColor }));
                  }}
                />
                <ColorField
                  label="الخلفية"
                  value={draft.bgColor}
                  onChange={(bgColor) => {
                    draftPreviewEnabled.current = true;
                    setDraft((value) => ({ ...value, bgColor }));
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <TokenField
                  label="حجم الخط"
                  value={draft.fontSize}
                  placeholder="مثال: 24px"
                  onChange={(fontSize) => {
                    draftPreviewEnabled.current = true;
                    setDraft((value) => ({ ...value, fontSize }));
                  }}
                />
                <label className="block text-[11px] font-bold text-slate-300">
                  <span>المحاذاة</span>
                  <select
                    value={draft.alignment || "center"}
                    onChange={(event) => {
                      draftPreviewEnabled.current = true;
                      setDraft((value) => ({ ...value, alignment: event.target.value as typeof value.alignment }));
                    }}
                    className="mt-1.5 h-9 w-full rounded-xl border border-slate-700 bg-black/40 px-2.5 text-xs text-white outline-none focus:border-amber-400"
                  >
                    <option value="start">يمين</option>
                    <option value="center">وسط</option>
                    <option value="end">يسار</option>
                  </select>
                </label>
              </div>

              <TokenField
                label="رابط ذكي عند النقر (اختياري)"
                value={draft.linkUrl}
                placeholder="https://... أو /journal أو /albums"
                onChange={(linkUrl) => {
                  draftPreviewEnabled.current = true;
                  setDraft((value) => ({ ...value, linkUrl }));
                }}
              />
            </div>
          ) : null}

          {/* IMAGE / VIDEO CONTROLS */}
          {(["image", "video"] as ElementTag[]).includes(selected.tag) ? (
            <div className="space-y-3 rounded-2xl border border-amber-400/20 bg-amber-400/[0.03] p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-100">مصدر الصورة والوسائط</span>
                <button
                  type="button"
                  onClick={() => setMediaLibraryOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-300 px-3 py-1.5 text-xs font-black text-slate-950 transition hover:bg-amber-200"
                >
                  <ImageIcon size={14} />
                  رفع أو اختيار
                </button>
              </div>
              <TokenField
                label="رابط الصورة أو الفيديو"
                value={draft.mediaUrl}
                placeholder="/uploads/... أو رابط Google Drive"
                onChange={(mediaUrl) => {
                  draftPreviewEnabled.current = true;
                  setDraft((value) => ({ ...value, mediaUrl }));
                }}
              />
              {selected.tag === "image" ? (
                <TokenField
                  label="النص البديل (الوصف)"
                  value={draft.altText}
                  placeholder="وصف الصورة للزائرين"
                  onChange={(altText) => {
                    draftPreviewEnabled.current = true;
                    setDraft((value) => ({ ...value, altText }));
                  }}
                />
              ) : null}
              
              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="block text-[11px] font-bold text-slate-300">
                  <span>المحاذاة</span>
                  <select
                    value={draft.alignment || "center"}
                    onChange={(event) => {
                      draftPreviewEnabled.current = true;
                      setDraft((value) => ({ ...value, alignment: event.target.value as typeof value.alignment }));
                    }}
                    className="mt-1.5 h-9 w-full rounded-xl border border-slate-700 bg-black/40 px-2.5 text-xs text-white outline-none focus:border-amber-400"
                  >
                    <option value="start">يمين</option>
                    <option value="center">وسط</option>
                    <option value="end">يسار</option>
                    <option value="stretch">تمديد كامل</option>
                  </select>
                </label>
                <TokenField
                  label="الرابط عند النقر"
                  value={draft.linkUrl}
                  placeholder="https://... أو /page"
                  onChange={(linkUrl) => {
                    draftPreviewEnabled.current = true;
                    setDraft((value) => ({ ...value, linkUrl }));
                  }}
                />
              </div>

              {selected.tag === "image" ? (
                <div className="space-y-2 rounded-xl border border-white/10 bg-black/25 p-3">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                    <span>تكبير الصورة</span>
                    <span className="text-amber-300">{draft.backgroundSize || 100}%</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={200}
                    value={draft.backgroundSize || 100}
                    onChange={(event) => stageSelectedBackground({ backgroundSize: Number(event.target.value) })}
                    className="h-2 w-full cursor-pointer accent-amber-300"
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {/* BUTTON CONTROLS */}
          {selected.tag === "button" ? (
            <div className="space-y-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.03] p-3.5">
              <label className="block text-xs font-bold text-slate-300">
                <span>نص الزر</span>
                <input
                  value={draft.contentText}
                  onChange={(event) => {
                    draftPreviewEnabled.current = true;
                    setDraft((value) => ({ ...value, contentText: event.target.value }));
                  }}
                  placeholder="نص الزر..."
                  className="mt-1.5 w-full rounded-xl border border-slate-700 bg-black/40 px-3 py-2 text-sm font-bold text-white outline-none focus:border-amber-400"
                />
              </label>

              <div>
                <span className="text-[11px] font-bold text-slate-300">نوع وشكل الزر</span>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {[
                    { value: "filled", label: "مملوء" },
                    { value: "outline", label: "مخطط" },
                    { value: "ghost", label: "شفاف" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateLayerBehavior({ buttonStyle: option.value as LayerBehavior["buttonStyle"] })}
                      className={`rounded-xl border py-2 text-xs font-black transition ${
                        layerBehavior.buttonStyle === option.value
                          ? "border-amber-300 bg-amber-300 text-slate-950 shadow-md"
                          : "border-white/10 bg-black/30 text-slate-300 hover:border-amber-300/40"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <TokenField
                label="رابط الزر (المسار أو الرابط)"
                value={draft.linkUrl}
                placeholder="/journal أو /albums أو https://..."
                onChange={(linkUrl) => {
                  draftPreviewEnabled.current = true;
                  setDraft((value) => ({ ...value, linkUrl }));
                }}
              />

              <div className="grid grid-cols-2 gap-3 pt-1">
                <ColorField
                  label="لون النص"
                  value={draft.textColor}
                  onChange={(textColor) => {
                    draftPreviewEnabled.current = true;
                    setDraft((value) => ({ ...value, textColor }));
                  }}
                />
                <ColorField
                  label="لون الخلفية"
                  value={draft.bgColor}
                  onChange={(bgColor) => {
                    draftPreviewEnabled.current = true;
                    setDraft((value) => ({ ...value, bgColor }));
                  }}
                />
              </div>
            </div>
          ) : null}

          {/* ICON CONTROLS */}
          {selected.tag === "icon" ? (
            <div className="space-y-3 rounded-2xl border border-amber-300/25 bg-black/20 p-3.5">
              <div className="text-xs font-black text-amber-100">اختيار الأيقونة</div>
              <div className="grid grid-cols-6 gap-2">
                {VISUAL_ICON_OPTIONS.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    title={label}
                    onClick={() => {
                      draftPreviewEnabled.current = true;
                      setDraft((current) => ({ ...current, contentText: id }));
                    }}
                    className={`grid aspect-square place-items-center rounded-xl border transition ${
                      draft.contentText === id
                        ? "border-amber-300 bg-amber-300 text-slate-950 shadow-lg"
                        : "border-white/10 bg-white/[0.03] text-slate-200 hover:border-amber-300/45 hover:text-amber-100"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="sr-only">{label}</span>
                  </button>
                ))}
              </div>
              <TokenField
                label="رابط عند النقر (اختياري)"
                value={draft.linkUrl}
                placeholder="https://... أو /page"
                onChange={(linkUrl) => {
                  draftPreviewEnabled.current = true;
                  setDraft((value) => ({ ...value, linkUrl }));
                }}
              />
            </div>
          ) : null}

          {/* SECTION / BACKGROUND CONTROLS */}
          {isSelectedBackground || (["section", "section-block"] as ElementTag[]).includes(selected.tag) ? (
            <div className="space-y-3 rounded-2xl border border-amber-300/25 bg-amber-300/[0.04] p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-100">صورة أو لون القسم</span>
                <button
                  type="button"
                  onClick={() => setMediaLibraryOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-300 px-3 py-1.5 text-xs font-black text-slate-950 transition hover:bg-amber-200"
                >
                  <ImageIcon size={14} />
                  اختيار صورة
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => stageSelectedBackground({ bgColor: "#000000", mediaUrl: "" })}
                  className="rounded-xl border border-white/15 bg-black py-2 text-[10px] font-black text-white"
                >
                  أسود خالص
                </button>
                <button
                  type="button"
                  onClick={() => stageSelectedBackground({ bgColor: "linear-gradient(135deg,#1f1f1f,#000000)", mediaUrl: "" })}
                  className="rounded-xl border border-white/15 bg-[linear-gradient(135deg,#1f1f1f,#000000)] py-2 text-[10px] font-black text-white"
                >
                  تدرج داكن
                </button>
                <button
                  type="button"
                  onClick={() => stageSelectedBackground({ bgColor: "linear-gradient(135deg,#e5b84f,#6d4010)", mediaUrl: "" })}
                  className="rounded-xl border border-white/15 bg-[linear-gradient(135deg,#e5b84f,#6d4010)] py-2 text-[10px] font-black text-white"
                >
                  ذهبي
                </button>
                <button
                  type="button"
                  onClick={() => stageSelectedBackground({ bgColor: "", mediaUrl: "" })}
                  className="rounded-xl border border-white/15 py-2 text-[10px] font-black text-slate-400"
                >
                  إزالة
                </button>
              </div>

              {isSelectedBackground ? (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                    <span>تعتيم التراكب</span>
                    <span className="text-amber-300">{draft.backgroundOverlay || 0}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={85}
                    value={draft.backgroundOverlay || 0}
                    onChange={(event) => stageSelectedBackground({ backgroundOverlay: Number(event.target.value) })}
                    className="h-2 w-full cursor-pointer accent-amber-300"
                  />
                </div>
              ) : null}
            </div>
          ) : null}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-white/[0.08] bg-black/80 p-3.5">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={isSelectedBackground ? restoreSavedBackgroundOrigin : restoreSelectedOrigin}
              disabled={isSelectedBackground ? false : reset.isPending}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/15 px-3 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-white/[0.06]"
            >
              <RotateCcw size={15} />
              استعادة الأصل
            </button>
            <button
              type="button"
              onClick={saveSelected}
              disabled={save.isPending || publish.isPending}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-400 px-3 py-2.5 text-xs font-black text-amber-950 shadow-lg shadow-amber-400/20 transition hover:bg-amber-300 disabled:opacity-50"
            >
              <Check size={16} />
              حفظ ونشر التعديل
            </button>
          </div>
        </div>
          </>
        ) : null}
      </aside>
    ) : null}
  </> : null}</VisualEditorContext.Provider>;
}

function TokenField({ label, value, placeholder, onChange }: { label: string; value: string; placeholder: string; onChange: (value: string) => void }) {
  return <label className="text-[11px] font-bold text-slate-400">{label}<input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-700 bg-black/25 px-2.5 py-2 text-xs text-white outline-none focus:border-amber-400" /></label>;
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const swatches = [
    { label: "ذهبي", color: "#e5b84f" },
    { label: "أبيض", color: "#ffffff" },
    { label: "أسود", color: "#000000" },
    { label: "رمادي داكن", color: "#18181b" },
    { label: "عاجي", color: "#ebe5d6" },
    { label: "سماوي", color: "#38bdf8" },
  ];
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-300">{label}</span>
        <div className="flex items-center gap-1">
          {swatches.map((s) => (
            <button
              key={s.color}
              type="button"
              title={s.label}
              onClick={() => onChange(s.color)}
              className={`h-4 w-4 rounded-full border border-white/20 transition hover:scale-125 ${value === s.color ? "ring-2 ring-amber-300 ring-offset-1 ring-offset-black" : ""}`}
              style={{ backgroundColor: s.color }}
            />
          ))}
        </div>
      </div>
      <div className="flex overflow-hidden rounded-xl border border-slate-700 bg-black/40">
        <input
          type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#e5b84f"}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-10 cursor-pointer border-0 bg-transparent p-1"
        />
        <input
          value={value}
          placeholder="#e5b84f"
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent px-2.5 text-xs font-mono text-white outline-none"
        />
      </div>
    </div>
  );
}

function WorkspaceButton({ active, label, icon, onClick, disabled }: { active?: boolean; label: string; icon: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`group relative grid h-9 w-9 place-items-center rounded-xl transition-all duration-200 select-none ${
        disabled
          ? "cursor-not-allowed opacity-25 text-slate-600"
          : active
          ? "bg-amber-300 text-slate-950 shadow-[0_0_14px_rgba(229,184,79,0.4)] scale-105"
          : "text-slate-300 hover:bg-white/[0.08] hover:text-amber-200 hover:scale-105 active:scale-95"
      }`}
    >
      {icon}
      <span className="pointer-events-none absolute hidden whitespace-nowrap rounded-lg border border-amber-300/30 bg-black/95 px-2.5 py-1 text-[10px] font-black text-amber-100 shadow-2xl backdrop-blur-md group-hover:block z-[400]">
        {label}
      </span>
    </button>
  );
}

function BackgroundSizingControls({ aspectLocked, autoArrange, onFit, onToggleAspect, onToggleArrange }: { aspectLocked: boolean; autoArrange: boolean; onFit: (axis: "width" | "height" | "fill" | "contain") => void; onToggleAspect: () => void; onToggleArrange: () => void }) {
  return <div className="border-b border-white/[0.08] bg-amber-300/[.045] p-3" dir="rtl"><div className="flex items-center justify-between gap-3"><div><div className="text-[11px] font-black text-amber-100">حجم وترتيب الخلفية</div><p className="mt-0.5 text-[9px] leading-4 text-slate-400">النقطتان في المنتصف تقصّان الارتفاع من الأعلى أو الأسفل؛ وعند قصّ الأسفل يتحرك ما بعده ليلتصق بالحافة الجديدة.</p></div><span className="rounded-full border border-amber-300/25 px-2 py-1 text-[9px] font-black text-amber-200">خلفية محددة</span></div><div className="mt-3 grid grid-cols-2 gap-2"><button type="button" onClick={() => onFit("width")} className="rounded-xl border border-amber-300/40 bg-amber-300/10 px-2 py-2 text-[10px] font-black text-amber-100">ملاءمة العرض</button><button type="button" onClick={() => onFit("height")} className="rounded-xl border border-amber-300/40 bg-amber-300/10 px-2 py-2 text-[10px] font-black text-amber-100">ملاءمة الارتفاع</button><button type="button" onClick={() => onFit("fill")} className="rounded-xl border border-fuchsia-300/40 bg-fuchsia-300/10 px-2 py-2 text-[10px] font-black text-fuchsia-100">ملء المساحة</button><button type="button" onClick={() => onFit("contain")} className="rounded-xl border border-emerald-300/40 bg-emerald-300/10 px-2 py-2 text-[10px] font-black text-emerald-100">احتواء كامل</button></div><div className="mt-2 grid grid-cols-2 gap-2"><button type="button" onClick={onToggleAspect} aria-pressed={aspectLocked} className={`rounded-xl border px-2 py-2 text-[10px] font-black transition ${aspectLocked ? "border-emerald-300/50 bg-emerald-300/10 text-emerald-100" : "border-white/15 text-slate-300"}`}>{aspectLocked ? "قفل النسبة: مفعّل" : "قفل النسبة: متوقف"}</button><button type="button" onClick={onToggleArrange} aria-pressed={autoArrange} className={`rounded-xl border px-2 py-2 text-[10px] font-black transition ${autoArrange ? "border-sky-300/50 bg-sky-300/10 text-sky-100" : "border-white/15 text-slate-300"}`}>{autoArrange ? "التصاق تلقائي: مفعّل" : "التصاق تلقائي: متوقف"}</button></div></div>;
}

export function VisualEditable({ id, htmlId, tag, label, defaultText, children, className = "", as: Tag = "div", onAction, onClick, title, style }: { id: string; htmlId?: string; tag: ElementTag; label: string; defaultText?: string; children?: ReactNode | ((text: string) => ReactNode); className?: string; as?: "article" | "div" | "span" | "small" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "button" | "section" | "footer" | "header" | "aside" | "nav"; onAction?: () => void; onClick?: () => void; title?: string; style?: React.CSSProperties }) {
  const { isEditing, selectedId, selectedIds, select, getOverride, layerMode, gridEnabled, magnetEnabled, backgroundAspectLocked, backgroundAutoArrange, groupTranslation, setGroupTranslation, saveLayer, showAlignmentGuides } = useContext(VisualEditorContext);
  const override = getOverride(id);
  const content = override?.contentText ?? defaultText ?? "";
  const selected = selectedIds.includes(id) || selectedId === id;
  const isLocked = override?.isLocked ?? false;
  const behavior = parseLayerBehavior(override?.customCss);
  const layerRef = useRef<HTMLElement | null>(null);
  const [isInView, setIsInView] = useState(!behavior.revealOnScroll);
  const interaction = useRef<{ mode: "move" | "resize"; resizeHandle?: ResizeHandle; startX: number; startY: number; startLeft: number; startTop: number; baseX: number; baseY: number; baseWidth: number; baseHeight: number; groupIds: string[]; translationX: number; translationY: number } | null>(null);
  const longPress = useRef<{ timer: number | null; startX: number; startY: number; selected: boolean }>({ timer: null, startX: 0, startY: 0, selected: false });
  const [liveFrame, setLiveFrame] = useState<{ x: number; y: number; width: number | null; height: number | null } | null>(null);
  useEffect(() => {
    if (!behavior.revealOnScroll || isEditing) { setIsInView(true); return; }
    const node = layerRef.current;
    if (!node || !window.IntersectionObserver) { setIsInView(true); return; }
    setIsInView(false);
    const observer = new IntersectionObserver(([entry]) => { if (entry?.isIntersecting) { setIsInView(true); observer.disconnect(); } }, { threshold: 0.16 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [behavior.revealOnScroll, isEditing]);
  const clearLongPress = () => {
    if (longPress.current.timer !== null) window.clearTimeout(longPress.current.timer);
    longPress.current.timer = null;
  };
  const isDirectBackground = tag === "image" && isBackgroundLayer(id, label);
  const selectSectionBackground = () => {
    if (tag !== "section" && tag !== "section-block") return false;
    const backgroundNode = Array.from(layerRef.current?.querySelectorAll<HTMLElement>("[data-visual-id]") ?? []).find((node) => {
      const childId = node.dataset.visualId || "";
      return childId !== id && isBackgroundLayer(childId, node.dataset.visualLabel || "");
    });
    const backgroundId = backgroundNode?.dataset.visualId;
    const backgroundTag = backgroundNode?.dataset.visualTag as ElementTag | undefined;
    const backgroundLabel = backgroundNode?.dataset.visualLabel;
    if (!backgroundId || !backgroundTag || !backgroundLabel) return false;
    select(backgroundId, backgroundTag, backgroundLabel);
    return true;
  };
  const begin = (event: React.PointerEvent<HTMLElement>, mode: "move" | "resize", resizeHandle?: ResizeHandle) => {
    if (!isEditing || (!layerMode && !(mode === "resize" && isDirectBackground)) || !canManipulateLayer(isLocked)) return;
    event.preventDefault(); event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.setPointerCapture(event.pointerId);
    const groupIds = mode === "move" && selectedIds.length > 1 && selectedIds.includes(id) ? unlockedLayerIds(selectedIds, (elementId) => getOverride(elementId)?.isLocked) : [id];
    interaction.current = { mode, resizeHandle, startX: event.clientX, startY: event.clientY, startLeft: rect.left, startTop: rect.top, baseX: override?.layerX ?? 0, baseY: override?.layerY ?? 0, baseWidth: override?.layerWidth ?? Math.round(rect.width), baseHeight: override?.layerHeight ?? Math.round(rect.height), groupIds, translationX: 0, translationY: 0 };
    if (groupIds.length === 1) select(id, tag, label);
  };
  const move = (event: React.PointerEvent<HTMLElement>) => {
    if (!interaction.current && longPress.current.timer !== null && (Math.abs(event.clientX - longPress.current.startX) > 8 || Math.abs(event.clientY - longPress.current.startY) > 8)) {
      clearLongPress();
      begin(event, "move");
    }
    const active = interaction.current;
    if (!active) return;
    const snapGrid = (value: number) => gridEnabled ? snapToLayerGrid(value) : value;
    const dx = snapGrid(event.clientX - active.startX); const dy = snapGrid(event.clientY - active.startY);
    if (active.mode === "move") {
      const gridX = snapGrid(active.baseX + dx);
      const gridY = snapGrid(active.baseY + dy);
      const snap = magnetEnabled ? snapLayerToElements(
        { left: active.startLeft + gridX - active.baseX, top: active.startTop + gridY - active.baseY, width: active.baseWidth, height: active.baseHeight },
        Array.from(document.querySelectorAll<HTMLElement>("[data-visual-id]")).filter((node) => !active.groupIds.includes(node.dataset.visualId || "")).map((node) => {
          const rect = node.getBoundingClientRect();
          return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
        }),
      ) : { deltaX: 0, deltaY: 0, guides: {} };
      showAlignmentGuides(snap.guides);
      const x = gridX + snap.deltaX;
      const y = gridY + snap.deltaY;
      active.translationX = x - active.baseX;
      active.translationY = y - active.baseY;
      if (active.groupIds.length > 1) {
        setGroupTranslation({ ids: active.groupIds, dx: active.translationX, dy: active.translationY });
      } else {
        setLiveFrame({ x, y, width: override?.layerWidth ?? null, height: override?.layerHeight ?? null });
      }
    } else {
      showAlignmentGuides({});
      const resized = resizeLayerFrame({ x: active.baseX, y: active.baseY, width: active.baseWidth, height: active.baseHeight }, dx, dy, active.resizeHandle || "se", 24, isDirectBackground && backgroundAspectLocked);
      setLiveFrame({ x: snapGrid(resized.x), y: snapGrid(resized.y), width: snapGrid(resized.width), height: snapGrid(resized.height) });
    }
  };
  const end = () => {
    clearLongPress();
    if (!interaction.current) return;
    const active = interaction.current;
    if (active.mode === "move" && active.groupIds.length > 1) {
      active.groupIds.forEach((elementId) => {
        const current = getOverride(elementId);
        saveLayer(elementId, { layerX: (current?.layerX ?? 0) + active.translationX, layerY: (current?.layerY ?? 0) + active.translationY, layerWidth: current?.layerWidth ?? null, layerHeight: current?.layerHeight ?? null, layerZIndex: current?.layerZIndex ?? 0, layerOpacity: current?.layerOpacity ?? 100, isHidden: current?.isHidden ?? false });
      });
      interaction.current = null;
      setGroupTranslation(null);
      showAlignmentGuides({});
      return;
    }
    const frame = liveFrame ?? { x: override?.layerX ?? 0, y: override?.layerY ?? 0, width: override?.layerWidth ?? null, height: override?.layerHeight ?? null };
    const isStructuralSection = tag === "section" || tag === "section-block";
    const savedFrame = active.mode === "resize" && isStructuralSection ? { ...frame, y: active.baseY } : frame;
    saveLayer(id, { layerX: savedFrame.x, layerY: savedFrame.y, layerWidth: savedFrame.width, layerHeight: savedFrame.height, layerZIndex: override?.layerZIndex ?? 0, layerOpacity: override?.layerOpacity ?? 100, isHidden: override?.isHidden ?? false });
    const containingSection = isDirectBackground ? layerRef.current?.parentElement?.closest<HTMLElement>("[data-visual-id]") : null;
    const containingSectionId = containingSection?.dataset.visualId;
    const containingSectionTag = containingSection?.dataset.visualTag as ElementTag | undefined;
    const cropContainer = Boolean(containingSectionId && containingSectionTag && ["section", "section-block"].includes(containingSectionTag));
    if (cropContainer && containingSectionId && frame.height !== null) {
      const current = getOverride(containingSectionId);
      saveLayer(containingSectionId, { layerX: current?.layerX ?? 0, layerY: current?.layerY ?? 0, layerWidth: current?.layerWidth ?? null, layerHeight: frame.height, layerZIndex: current?.layerZIndex ?? 0, layerOpacity: current?.layerOpacity ?? 100, isHidden: current?.isHidden ?? false });
    } else if (isDirectBackground && backgroundAutoArrange && active.mode === "resize" && frame.height !== null && shouldShiftFollowingLayersAfterResize(active.resizeHandle)) {
      const originalBottom = active.startTop + active.baseHeight;
      const parent = layerRef.current?.parentElement;
      Array.from(document.querySelectorAll<HTMLElement>("[data-visual-id]")).filter((node) => node !== layerRef.current && !layerRef.current?.contains(node) && node.getBoundingClientRect().top >= originalBottom - 10).forEach((node) => {
        const shift = verticalStackShift(active.baseHeight, frame.height!, node.getBoundingClientRect().top, originalBottom);
        const elementId = node.dataset.visualId;
        if (!shift || !elementId || !canManipulateLayer(getOverride(elementId)?.isLocked) || (parent && parent.contains(node))) return;
        const current = getOverride(elementId);
        saveLayer(elementId, { layerX: current?.layerX ?? 0, layerY: (current?.layerY ?? 0) + shift, layerWidth: current?.layerWidth ?? null, layerHeight: current?.layerHeight ?? null, layerZIndex: current?.layerZIndex ?? 0, layerOpacity: current?.layerOpacity ?? 100, isHidden: current?.isHidden ?? false });
      });
    }
    interaction.current = null; setLiveFrame(null); showAlignmentGuides({});
  };
  const groupOffset = groupTranslation?.ids.includes(id) ? groupTranslation : null;
  const inspectorFrame = liveFrame ?? { x: override?.layerX ?? 0, y: override?.layerY ?? 0, width: override?.layerWidth, height: override?.layerHeight };
  const customTextColor = override?.textColor;
  const customBgColor = override?.bgColor && !override.bgColor.includes("gradient(") ? override.bgColor : undefined;
  const hasCustomTextColor = Boolean(customTextColor);
  const hasCustomBgColor = Boolean(customBgColor);

  const visualStyle: React.CSSProperties = {
    ...style,
    ...toStyle(override),
    ...(customTextColor ? {
      "--aq-custom-text-color": customTextColor,
      color: customTextColor,
    } as React.CSSProperties : {}),
    ...(customBgColor ? {
      "--aq-custom-bg-color": customBgColor,
      backgroundColor: customBgColor,
    } as React.CSSProperties : {}),
    ...(groupOffset ? { transform: `translate3d(${(override?.layerX ?? 0) + groupOffset.dx}px, ${(override?.layerY ?? 0) + groupOffset.dy}px, 0)` } : liveFrame ? { transform: `translate3d(${liveFrame.x}px, ${liveFrame.y}px, 0)`, width: liveFrame.width ? `${liveFrame.width}px` : undefined, height: liveFrame.height ? `${liveFrame.height}px` : undefined } : {}),
    ...(behavior.revealOnScroll && !isEditing && !isInView ? { opacity: 0 } : {}),
    ...(style?.position ? { position: style.position } : {}),
  };

  return <Tag ref={layerRef as never} id={htmlId} title={title} data-visual-id={id} data-visual-label={label} data-visual-tag={tag} onPointerDown={(event) => {
    if (isEditing && isLocked) { event.preventDefault(); event.stopPropagation(); return; }
    if (isEditing && event.shiftKey) return;
    if (isEditing && (isDirectBackground || event.target === event.currentTarget && isBackgroundSurface(id, label, tag))) {
      event.preventDefault(); event.stopPropagation(); select(id, tag, label);
      if (layerMode) begin(event, "move");
      return;
    }
    if (isEditing && event.pointerType === "touch") {
      if (isDirectBackground) { event.preventDefault(); event.stopPropagation(); select(id, tag, label); return; }
      longPress.current = { timer: window.setTimeout(() => { longPress.current.selected = true; longPress.current.timer = null; select(id, tag, label, true); }, 520), startX: event.clientX, startY: event.clientY, selected: false };
      return;
    }
    begin(event, "move");
  }} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onClick={(event) => { if (isEditing) { event.preventDefault(); event.stopPropagation(); if (isLocked) return; if (longPress.current.selected) { longPress.current.selected = false; return; } if (event.target === event.currentTarget && selectSectionBackground()) return; select(id, tag, label, event.shiftKey); return; } if (override?.linkUrl) { event.preventDefault(); event.stopPropagation(); if (behavior.openInNewTab) window.open(override.linkUrl, "_blank", "noopener,noreferrer"); else window.location.assign(override.linkUrl); return; } onAction?.(); onClick?.(); }} style={visualStyle} className={`${className} ${hasCustomTextColor ? "aq-has-custom-text-color" : ""} ${hasCustomBgColor ? "aq-has-custom-bg-color" : ""} aq-layer-device-${behavior.device ?? "all"} aq-layer-motion-${behavior.animation ?? "none"} ${behavior.revealOnScroll && !isEditing ? `aq-layer-scroll-reveal ${isInView ? "is-visible" : ""}` : ""} ${behavior.buttonHover ? `aq-layer-hover-${behavior.buttonHover}` : ""} ${override?.linkUrl && !isEditing ? "cursor-pointer" : ""} ${isEditing ? "group relative cursor-pointer transition hover:outline hover:outline-2 hover:outline-dashed hover:outline-amber-400/80" : ""} ${layerMode && !isLocked ? "touch-none cursor-grab active:cursor-grab" : ""} ${selected ? "z-[81] !outline !outline-2 !outline-amber-300 shadow-[0_0_0_5px_rgba(251,191,36,.12)]" : ""} ${isEditing && isLocked ? "cursor-not-allowed hover:outline hover:outline-1 hover:outline-dashed hover:outline-slate-500/50" : ""}`}>
    {isEditing ? <span className={`pointer-events-none absolute -top-5 right-0 z-[82] inline-flex items-center gap-1 rounded-t-lg bg-amber-400 px-2 py-0.5 text-[10px] font-black text-amber-950 transition-opacity duration-200 ${selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>{isLocked ? <Lock size={10} /> : null}{label}</span> : null}
    {isEditing && layerMode && selected ? <span className="pointer-events-none absolute -bottom-6 right-0 z-[82] rounded-lg bg-sky-400 px-2 py-1 text-[10px] font-black text-slate-950 shadow-lg">X {Math.round(inspectorFrame.x)} · Y {Math.round(inspectorFrame.y)} · {inspectorFrame.width ? `${Math.round(inspectorFrame.width)}×${Math.round(inspectorFrame.height ?? 0)}` : "حجم تلقائي"}</span> : null}
    {isEditing && selected && isDirectBackground && liveFrame ? <><span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 z-[82] border-t border-dashed border-fuchsia-300/90" /><span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-1/2 z-[82] border-l border-dashed border-fuchsia-300/90" /><span className="pointer-events-none absolute left-1/2 top-1/2 z-[83] -translate-x-1/2 -translate-y-1/2 rounded-full border border-fuchsia-200/60 bg-[#111521]/95 px-2.5 py-1 text-[10px] font-black text-fuchsia-100 shadow-xl">{Math.round(liveFrame.width ?? 0)} × {Math.round(liveFrame.height ?? 0)} بكسل</span><span className="pointer-events-none absolute -top-7 left-1/2 z-[83] -translate-x-1/2 whitespace-nowrap rounded-lg border border-fuchsia-300/45 bg-[#111521]/95 px-2 py-1 text-[9px] font-black text-fuchsia-100">منتصف الخلفية · {backgroundAspectLocked ? "النسبة مقفلة" : "نسبة حرة"}</span></> : null}
    {isEditing && selected && !isLocked && isDirectBackground ? ([
      { handle: "nw", label: "تكبير أو تصغير الخلفية من أعلى اليمين", className: "-top-2 -right-2 cursor-nwse-resize" },
      { handle: "ne", label: "تكبير أو تصغير الخلفية من أعلى اليسار", className: "-top-2 -left-2 cursor-nesw-resize" },
      { handle: "sw", label: "تكبير أو تصغير الخلفية من أسفل اليمين", className: "-bottom-2 -right-2 cursor-nesw-resize" },
      { handle: "se", label: "تكبير أو تصغير الخلفية من أسفل اليسار", className: "-bottom-2 -left-2 cursor-nwse-resize" },
      { handle: "n", label: "قص الخلفية من الأعلى مع تثبيت الحافة السفلية", className: "-top-2 left-1/2 -translate-x-1/2 cursor-ns-resize" },
      { handle: "s", label: "قص الخلفية من الأسفل مع التصاق القسم التالي", className: "-bottom-2 left-1/2 -translate-x-1/2 cursor-ns-resize" },
    ] as const).map(({ handle, label: handleLabel, className: handleClass }) => <button key={handle} type="button" aria-label={handleLabel} title={handleLabel} onPointerDown={(event) => { event.stopPropagation(); begin(event, "resize", handle); }} className={`absolute z-[83] grid h-5 w-5 place-items-center rounded-full border-2 border-white bg-amber-300 shadow-[0_0_0_3px_rgba(7,9,13,.45)] ${handleClass}`}><span className="h-1.5 w-1.5 rounded-full bg-amber-950" /></button>) : isEditing && layerMode && selected && !isLocked ? <button type="button" aria-label="تغيير حجم الطبقة" onPointerDown={(event) => { event.stopPropagation(); begin(event, "resize"); }} className="absolute -bottom-2 -left-2 z-[83] grid h-5 w-5 place-items-center rounded-md border-2 border-white bg-sky-400 text-slate-950 shadow-lg"><Move size={11} /></button> : null}
    {isEditing && layerMode && selected && !isLocked && !isDirectBackground ? ([
      { handle: "nw", label: "تغيير حجم العنصر من أعلى اليمين", className: "-top-2 -right-2 cursor-nwse-resize" },
      { handle: "ne", label: "تغيير حجم العنصر من أعلى اليسار", className: "-top-2 -left-2 cursor-nesw-resize" },
      { handle: "sw", label: "تغيير حجم العنصر من أسفل اليمين", className: "-bottom-2 -right-2 cursor-nesw-resize" },
      { handle: "se", label: "تغيير حجم العنصر من أسفل اليسار", className: "-bottom-2 -left-2 cursor-nwse-resize" },
      ...(tag === "section" || tag === "section-block" ? [
        { handle: "n" as const, label: "قص القسم من الأعلى", className: "-top-2 left-1/2 -translate-x-1/2 cursor-ns-resize" },
        { handle: "s" as const, label: "قص القسم من الأسفل مع التصاق القسم التالي", className: "-bottom-2 left-1/2 -translate-x-1/2 cursor-ns-resize" },
      ] : []),
    ] as const).map(({ handle, label: handleLabel, className: handleClass }) => <button key={handle} type="button" aria-label={handleLabel} title={handleLabel} onPointerDown={(event) => { event.stopPropagation(); begin(event, "resize", handle); }} className={`absolute z-[83] grid h-5 w-5 place-items-center rounded-full border-2 border-white bg-sky-400 shadow-[0_0_0_3px_rgba(7,9,13,.45)] ${handleClass}`}><span className="h-1.5 w-1.5 rounded-full bg-slate-950" /></button>) : null}
    {typeof children === "function" ? children(content) : children ?? content}
  </Tag>;
}

export function VisualImage({ id, label, src, alt, className = "", linkUrl, style }: { id: string; label: string; src: string; alt: string; className?: string; linkUrl?: string; style?: React.CSSProperties }) {
  const { getOverride } = useContext(VisualEditorContext);
  const override = getOverride(id);
  const cachedOverride = useMemo(() => {
    if (override?.mediaUrl) return override;
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("aqeeq-overrides-/");
        if (raw) {
          const list = JSON.parse(raw);
          const found = list.find((item: any) => item.elementId === id);
          if (found) return found;
        }
      }
    } catch {}
    return null;
  }, [override, id]);

  const activeOverride = override || cachedOverride;
  const resolvedSrc = activeOverride?.mediaUrl || src;
  const resolvedAlt = activeOverride?.altText || alt;
  const resolvedLink = activeOverride?.linkUrl || linkUrl;
  const opensInNewTab = parseLayerBehavior(activeOverride?.customCss).openInNewTab;
  const alignmentClass = activeOverride?.alignment === "start" ? "mr-0 ml-auto" : activeOverride?.alignment === "end" ? "ml-0 mr-auto" : activeOverride?.alignment === "stretch" ? "w-full" : "mx-auto";
  const isBrandMark = /(?:logo|شعار|brand)/i.test(`${id} ${label}`);
  const imageTransform = !isBrandMark && activeOverride?.backgroundSize && activeOverride.backgroundSize !== 100 ? `scale(${activeOverride.backgroundSize / 100})` : undefined;
  const fillHeight = /(?:^|\s)h-full(?:\s|$)/.test(className);
  const fillWidth = /(?:^|\s)w-full(?:\s|$)/.test(className);
  const image = <img src={resolvedSrc} alt={resolvedAlt} referrerPolicy="no-referrer" className={`${className} ${alignmentClass} ${isBrandMark ? "" : "block"}`} style={isBrandMark ? style : { ...style, objectPosition: `${activeOverride?.backgroundPositionX ?? 50}% ${activeOverride?.backgroundPositionY ?? 50}%`, transform: imageTransform, transformOrigin: `${activeOverride?.backgroundPositionX ?? 50}% ${activeOverride?.backgroundPositionY ?? 50}%` }} />;
  return <VisualEditable id={id} tag="image" label={label} as="div" className={visualImageWrapperClassName(className, isBrandMark)}>{resolvedLink ? <a href={resolvedLink} target={opensInNewTab ? "_blank" : undefined} rel={opensInNewTab ? "noopener noreferrer" : undefined} className={`${fillHeight ? "block h-full" : ""} ${fillWidth ? "w-full" : ""}`}>{image}</a> : image}</VisualEditable>;
}


export function VisualIcon({ id, label, icon = "sparkles", className = "", size = 20 }: { id: string; label: string; icon?: string; className?: string; size?: number }) {
  const { getOverride } = useContext(VisualEditorContext);
  const override = getOverride(id);
  const Icon = VISUAL_ICON_COMPONENTS[resolveVisualIconName(override?.contentText, icon)] || Sparkles;
  return <VisualEditable id={id} tag="icon" label={label} defaultText={icon} as="span" className={`inline-flex items-center justify-center ${className}`}><Icon size={size} aria-hidden="true" /></VisualEditable>;
}

export function VisualBackground({ id, label, src, alt, className = "", style }: { id: string; label: string; src?: string; alt: string; className?: string; style?: React.CSSProperties }) {
  const { getOverride, getOwnOverride } = useContext(VisualEditorContext);
  const ownOverride = getOwnOverride(id);
  const sharedSourceOverride = isSharedHeroBackground(id) ? getOverride(heroBackgroundSourceId(id)) : undefined;
  const sourceOverride = sharedSourceOverride ?? ownOverride ?? getOverride(id);
  const presentationOverride = ownOverride ?? sourceOverride;
  const resolvedSrc = resolveBackgroundSource(sourceOverride?.mediaUrl, sourceOverride?.bgColor, src);
  const overlay = Math.max(0, Math.min(100, presentationOverride?.backgroundOverlay ?? 0)) / 100;
  const backgroundStyle: React.CSSProperties = resolvedSrc
    ? { position: "absolute", ...style, backgroundImage: overlay ? `linear-gradient(rgba(0,0,0,${overlay}),rgba(0,0,0,${overlay})), url("${resolvedSrc}")` : `url("${resolvedSrc}")`, backgroundSize: backgroundSizeCss(presentationOverride?.backgroundSize), backgroundPosition: `${presentationOverride?.backgroundPositionX ?? 50}% ${presentationOverride?.backgroundPositionY ?? 50}%`, backgroundRepeat: "no-repeat" }
    : { position: "absolute", ...style };
  return <VisualEditable id={id} tag="image" label={label} as="div" style={backgroundStyle} className={className}><span className="sr-only">{alt}</span></VisualEditable>;
}

function toEmbedUrl(url: string) {
  const youtube = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{6,})/i);
  if (youtube?.[1]) return `https://www.youtube.com/embed/${youtube[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/i);
  if (vimeo?.[1]) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return "";
}

export function VisualVideo({ id, label, src, title, className = "", linkUrl }: { id: string; label: string; src?: string; title: string; className?: string; linkUrl?: string }) {
  const { getOverride } = useContext(VisualEditorContext);
  const override = getOverride(id);
  const resolvedSrc = override?.mediaUrl || src || "";
  const resolvedLink = override?.linkUrl || linkUrl;
  const opensInNewTab = parseLayerBehavior(override?.customCss).openInNewTab;
  const embed = toEmbedUrl(resolvedSrc);
  const video = resolvedSrc ? isAqeeqDriveVideo(resolvedSrc) ? <AqeeqVideoPoster sourceUrl={resolvedSrc} posterUrl={null} title={title} className="h-full w-full" /> : embed ? <iframe src={embed} title={title} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> : <video src={resolvedSrc} title={title} controls className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm text-slate-600">اختر فيديو من مكتبة الوسائط</div>;
  return <VisualEditable id={id} tag="video" label={label} as="div" className={className}>{resolvedLink ? <a href={resolvedLink} target={opensInNewTab ? "_blank" : undefined} rel={opensInNewTab ? "noopener noreferrer" : undefined} className="block h-full w-full">{video}</a> : video}</VisualEditable>;
}

export function useVisualText(id: string, fallback: string) {
  const { getOverride } = useContext(VisualEditorContext);
  return getOverride(id)?.contentText ?? fallback;
}

export function useVisualStyle(id: string) {
  const { getOverride } = useContext(VisualEditorContext);
  return toStyle(getOverride(id));
}

export function useVisualEditorState() {
  return useContext(VisualEditorContext);
}
