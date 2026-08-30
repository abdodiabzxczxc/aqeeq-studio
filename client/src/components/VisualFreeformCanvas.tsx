import {
  CalendarDays,
  Check,
  Copy,
  Grid2X2,
  Heart,
  ImageIcon,
  Link2,
  Mail,
  MapPin,
  Maximize2,
  MousePointer2,
  Move,
  Phone,
  PlayCircle,
  Plus,
  Sparkles,
  Star,
  Ticket,
  Trash2,
  Users,
  Video,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { isAqeeqDriveVideo } from "@/lib/aqeeqAlbumMedia";
import { AqeeqVideoPoster } from "./AqeeqVideoPoster";
import MediaLibrary from "./MediaLibrary";
import { useVisualEditorState } from "./VisualEditor";

type ElementType = "text" | "image" | "video" | "icon" | "button";
type IconName = "sparkles" | "star" | "calendar" | "location" | "guests" | "heart" | "ticket" | "phone" | "mail" | "instagram" | "whatsapp";
type TextAlign = "start" | "center" | "end";
type Content = {
  text?: string;
  mediaUrl?: string;
  altText?: string;
  linkUrl?: string;
  tooltip?: string;
  iconName?: IconName;
  textAlign?: TextAlign;
  objectFit?: "cover" | "contain";
  autoplay?: boolean;
  muted?: boolean;
};
type CanvasItem = {
  id: number;
  elementId: string;
  elementType: ElementType;
  preset: string;
  content: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  zIndex: number;
  status: "draft" | "published";
};
type PaletteItem = {
  label: string;
  hint: string;
  category: "نص" | "وسائط" | "تفاعل";
  type: ElementType;
  preset: string;
  width: number;
  height: number;
  content: Content;
  icon: typeof Sparkles;
};
type ResizeCorner = "nw" | "ne" | "sw" | "se";
type Interaction = {
  mode: "move" | "resize";
  elementId: string;
  startClientX: number;
  startClientY: number;
  initial: CanvasItem;
  corner?: ResizeCorner;
};
type Guides = { x?: number; y?: number };
type DropPreview = { x: number; y: number; width: number; height: number; label: string } | null;

const TypeIcon = Sparkles;
const palette: PaletteItem[] = [
  { label: "عنوان افتتاحي", hint: "عنوان بطولي كبير", category: "نص", type: "text", preset: "display", width: 700, height: 130, content: { text: "اكتب قصتك بأسلوب استثنائي", textAlign: "center" }, icon: TypeIcon },
  { label: "عنوان قسم", hint: "لتقسيم الصفحة", category: "نص", type: "text", preset: "heading", width: 520, height: 90, content: { text: "عنوان القسم", textAlign: "start" }, icon: TypeIcon },
  { label: "فقرة تعريفية", hint: "نص وشرح", category: "نص", type: "text", preset: "paragraph", width: 560, height: 145, content: { text: "اكتب وصفاً موجزاً يوضح الفكرة التي تريد أن يصل إليها الزائر.", textAlign: "start" }, icon: TypeIcon },
  { label: "صورة غلاف", hint: "بهوية عريضة", category: "وسائط", type: "image", preset: "cover", width: 720, height: 400, content: { altText: "صورة غلاف", objectFit: "cover" }, icon: ImageIcon },
  { label: "صورة دائرية", hint: "شعار أو بورتريه", category: "وسائط", type: "image", preset: "circle", width: 250, height: 250, content: { altText: "صورة دائرية", objectFit: "cover" }, icon: ImageIcon },
  { label: "فيديو", hint: "YouTube أو ملف", category: "وسائط", type: "video", preset: "landscape", width: 670, height: 377, content: { autoplay: false, muted: true }, icon: Video },
  { label: "زر رئيسي", hint: "دعوة واضحة للفعل", category: "تفاعل", type: "button", preset: "solid", width: 255, height: 64, content: { text: "احجز مكانك", linkUrl: "/" }, icon: Link2 },
  { label: "زر ثانوي", hint: "خيار إضافي", category: "تفاعل", type: "button", preset: "outline", width: 255, height: 64, content: { text: "اعرف المزيد", linkUrl: "/" }, icon: Link2 },
];
const iconLibrary: Array<{ name: IconName; label: string; Icon: typeof Sparkles }> = [
  { name: "sparkles", label: "احتفال", Icon: Sparkles },
  { name: "star", label: "نجمة", Icon: Star },
  { name: "calendar", label: "موعد", Icon: CalendarDays },
  { name: "location", label: "موقع", Icon: MapPin },
  { name: "guests", label: "ضيوف", Icon: Users },
  { name: "heart", label: "قلب", Icon: Heart },
  { name: "ticket", label: "تذكرة", Icon: Ticket },
  { name: "phone", label: "هاتف", Icon: Phone },
  { name: "mail", label: "بريد", Icon: Mail },
];
const iconMap = Object.fromEntries(iconLibrary.map((item) => [item.name, item.Icon])) as Record<IconName, typeof Sparkles>;
const MIN_SIZE = { text: { width: 180, height: 50 }, image: { width: 120, height: 100 }, video: { width: 220, height: 124 }, icon: { width: 64, height: 64 }, button: { width: 120, height: 42 } } satisfies Record<ElementType, { width: number; height: number }>;

function parseContent(raw: string): Content {
  try {
    return JSON.parse(raw) as Content;
  } catch {
    return {};
  }
}

function makeContent(content: Content) {
  return JSON.stringify(content);
}

function embedUrl(url: string) {
  const youtube = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{6,})/i);
  if (youtube?.[1]) return `https://www.youtube.com/embed/${youtube[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/i);
  return vimeo?.[1] ? `https://player.vimeo.com/video/${vimeo[1]}` : url;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function itemYScale(rect: DOMRect) {
  return rect.width / rect.height;
}

function clampItem(item: CanvasItem, rect: DOMRect): CanvasItem {
  const yScale = itemYScale(rect);
  const halfWidth = item.width / 2;
  const halfHeight = (item.height * yScale) / 2;
  return {
    ...item,
    width: clamp(Math.round(item.width), MIN_SIZE[item.elementType].width, 920),
    height: clamp(Math.round(item.height), MIN_SIZE[item.elementType].height, 820),
    positionX: clamp(Math.round(item.positionX), halfWidth, 1000 - halfWidth),
    positionY: clamp(Math.round(item.positionY), halfHeight, 1000 - halfHeight),
  };
}

function elementPoints(item: CanvasItem, rect: DOMRect) {
  const yScale = itemYScale(rect);
  return {
    x: [item.positionX - item.width / 2, item.positionX, item.positionX + item.width / 2],
    y: [item.positionY - (item.height * yScale) / 2, item.positionY, item.positionY + (item.height * yScale) / 2],
  };
}

function snapItem(item: CanvasItem, allItems: CanvasItem[], rect: DOMRect, enabled: boolean): { item: CanvasItem; guides: Guides } {
  if (!enabled) return { item: clampItem(item, rect), guides: {} };
  const threshold = 11;
  let next = clampItem(item, rect);
  const guides: Guides = {};
  const own = elementPoints(next, rect);
  const targetX = [80, 500, 920];
  const targetY = [80, 500, 920];
  allItems.filter((entry) => entry.elementId !== item.elementId).forEach((entry) => {
    const points = elementPoints(entry, rect);
    targetX.push(...points.x);
    targetY.push(...points.y);
  });
  const closestX = own.x.flatMap((point) => targetX.map((target) => ({ delta: target - point, target }))).filter((match) => Math.abs(match.delta) <= threshold).sort((first, second) => Math.abs(first.delta) - Math.abs(second.delta))[0];
  const closestY = own.y.flatMap((point) => targetY.map((target) => ({ delta: target - point, target }))).filter((match) => Math.abs(match.delta) <= threshold).sort((first, second) => Math.abs(first.delta) - Math.abs(second.delta))[0];
  if (closestX) {
    next = { ...next, positionX: next.positionX + closestX.delta };
    guides.x = closestX.target;
  }
  if (closestY) {
    next = { ...next, positionY: next.positionY + closestY.delta };
    guides.y = closestY.target;
  }
  return { item: clampItem(next, rect), guides };
}

function PalettePreview({ item }: { item: PaletteItem }) {
  if (item.type === "image" || item.type === "video") return <div className={`mb-2 flex h-10 items-center justify-center rounded-lg ${item.type === "video" ? "bg-sky-400/10 text-sky-300" : "bg-amber-400/10 text-amber-300"}`}>{item.type === "video" ? <PlayCircle size={19} /> : <ImageIcon size={19} />}</div>;
  if (item.type === "button") return <div className={`mb-2 flex h-9 items-center justify-center rounded-lg text-[10px] font-black ${item.preset === "solid" ? "bg-amber-400 text-amber-950" : "border border-amber-300/40 text-amber-100"}`}>{item.content.text}</div>;
  return <div className="mb-2 space-y-1.5"><span className="block h-2.5 w-4/5 rounded-full bg-amber-200/80" /><span className="block h-1.5 w-3/5 rounded-full bg-slate-600" /></div>;
}

export default function VisualFreeformCanvas({ pagePath }: { pagePath: string }) {
  const { isEditing } = useVisualEditorState();
  const { data: draftData = [] } = trpc.visualEditor.freeform.list.useQuery({ pagePath }, { enabled: isEditing, refetchOnWindowFocus: false });
  const { data: publicData = [] } = trpc.visualEditor.freeform.publicList.useQuery({ pagePath }, { enabled: !isEditing, refetchOnWindowFocus: false });
  const persisted = (isEditing ? draftData : publicData) as CanvasItem[];
  const utils = trpc.useUtils();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [workingItems, setWorkingItems] = useState<Record<string, CanvasItem>>({});
  const [mediaTarget, setMediaTarget] = useState<CanvasItem | null>(null);
  const [interaction, setInteraction] = useState<Interaction | null>(null);
  const [guides, setGuides] = useState<Guides>({});
  const [dropPreview, setDropPreview] = useState<DropPreview>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const displayItems = useMemo(() => {
    const itemMap = new Map(persisted.map((item) => [item.elementId, workingItems[item.elementId] ?? item]));
    Object.values(workingItems).forEach((item) => itemMap.set(item.elementId, item));
    return Array.from(itemMap.values()).sort((first, second) => first.zIndex - second.zIndex);
  }, [persisted, workingItems]);
  const selected = useMemo(() => displayItems.find((item) => item.elementId === selectedId) ?? null, [displayItems, selectedId]);
  const [contentDraft, setContentDraft] = useState<Content>({});

  const refresh = () => {
    void utils.visualEditor.freeform.list.invalidate({ pagePath });
    void utils.visualEditor.freeform.publicList.invalidate({ pagePath });
  };
  const save = trpc.visualEditor.freeform.save.useMutation({
    onSuccess: refresh,
    onError: (error) => toast.error(error.message || "تعذر حفظ العنصر"),
  });
  const publish = trpc.visualEditor.freeform.publish.useMutation({
    onSuccess: () => {
      refresh();
      toast.success("تم نشر العنصر للزوار");
    },
    onError: (error) => toast.error(error.message || "تعذر النشر"),
  });
  const remove = trpc.visualEditor.freeform.delete.useMutation({
    onSuccess: () => {
      setSelectedId(null);
      refresh();
    },
    onError: (error) => toast.error(error.message || "تعذر حذف العنصر"),
  });

  useEffect(() => {
    if (!selected) {
      setContentDraft({});
      return;
    }
    setContentDraft(parseContent(selected.content));
  }, [selected?.elementId, selected?.content]);

  const updateWorking = (item: CanvasItem) => {
    setWorkingItems((current) => ({ ...current, [item.elementId]: item }));
  };

  const saveItem = (item: CanvasItem) => {
    save.mutate({
      pagePath,
      elementId: item.elementId,
      elementType: item.elementType,
      preset: item.preset,
      content: parseContent(item.content),
      positionX: item.positionX,
      positionY: item.positionY,
      width: item.width,
      height: item.height,
      zIndex: item.zIndex,
    });
  };

  const patchSelected = (patch: Partial<CanvasItem>) => {
    if (!selected) return;
    updateWorking({ ...selected, ...patch });
  };

  const commitSelected = (patch: Partial<CanvasItem> = {}) => {
    if (!selected) return;
    const next = { ...selected, ...patch };
    updateWorking(next);
    saveItem(next);
  };

  const canvasPosition = (clientX: number, clientY: number) => {
    const box = canvasRef.current?.getBoundingClientRect();
    if (!box) return { x: 500, y: 500 };
    return {
      x: clamp(Math.round(((clientX - box.left) / box.width) * 1000), 0, 1000),
      y: clamp(Math.round(((clientY - box.top) / box.height) * 1000), 0, 1000),
    };
  };

  const placeNew = (item: PaletteItem | { type: "icon"; name: IconName }, x = 500, y = 500) => {
    const isIcon = "name" in item;
    const newItem = isIcon
      ? { type: "icon" as ElementType, preset: "icon-button", width: 112, height: 112, content: { iconName: item.name, tooltip: iconLibrary.find((entry) => entry.name === item.name)?.label, linkUrl: "" } }
      : { type: item.type, preset: item.preset, width: item.width, height: item.height, content: item.content };
    const elementId = `free-${newItem.type}-${Date.now().toString(36)}`;
    const box = canvasRef.current?.getBoundingClientRect();
    const initial: CanvasItem = {
      id: -Date.now(),
      elementId,
      elementType: newItem.type,
      preset: newItem.preset,
      content: makeContent(newItem.content),
      positionX: x,
      positionY: y,
      width: newItem.width,
      height: newItem.height,
      zIndex: Math.max(1, ...displayItems.map((entry) => entry.zIndex)) + 1,
      status: "draft",
    };
    const normalized = box ? clampItem(initial, box) : initial;
    updateWorking(normalized);
    setSelectedId(elementId);
    save.mutate({
      pagePath,
      elementId,
      elementType: normalized.elementType,
      preset: normalized.preset,
      content: parseContent(normalized.content),
      positionX: normalized.positionX,
      positionY: normalized.positionY,
      width: normalized.width,
      height: normalized.height,
      zIndex: normalized.zIndex,
    }, {
      onSuccess: () => toast.success("تمت إضافة العنصر — حرّكه أو غيّر حجمه مباشرة"),
    });
  };

  const startInteraction = (event: React.PointerEvent, item: CanvasItem, mode: Interaction["mode"], corner?: ResizeCorner) => {
    if (!isEditing) return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedId(item.elementId);
    event.currentTarget.setPointerCapture(event.pointerId);
    setInteraction({ mode, elementId: item.elementId, startClientX: event.clientX, startClientY: event.clientY, initial: item, corner });
  };

  const onCanvasPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!interaction || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const current = displayItems.find((item) => item.elementId === interaction.elementId);
    if (!current) return;
    const deltaX = ((event.clientX - interaction.startClientX) / rect.width) * 1000;
    const deltaY = ((event.clientY - interaction.startClientY) / rect.height) * 1000;
    const deltaYSize = ((event.clientY - interaction.startClientY) / rect.width) * 1000;
    let next: CanvasItem;
    if (interaction.mode === "move") {
      next = { ...interaction.initial, positionX: interaction.initial.positionX + deltaX, positionY: interaction.initial.positionY + deltaY };
    } else {
      const corner = interaction.corner ?? "se";
      const horizontalDirection = corner.includes("e") ? 1 : -1;
      const verticalDirection = corner.includes("s") ? 1 : -1;
      let width = interaction.initial.width + deltaX * horizontalDirection;
      let height = interaction.initial.height + deltaYSize * verticalDirection;
      const lockAspect = ["image", "video"].includes(interaction.initial.elementType) && !event.shiftKey;
      if (lockAspect) {
        const ratio = interaction.initial.width / interaction.initial.height;
        height = width / ratio;
      }
      const actualWidthChange = width - interaction.initial.width;
      const actualHeightChange = height - interaction.initial.height;
      const yShift = (actualHeightChange * itemYScale(rect)) / 2;
      next = {
        ...interaction.initial,
        width,
        height,
        positionX: interaction.initial.positionX + (horizontalDirection * actualWidthChange) / 2,
        positionY: interaction.initial.positionY + verticalDirection * yShift,
      };
    }
    const snapped = snapItem(next, displayItems, rect, snapEnabled);
    updateWorking(snapped.item);
    setGuides(snapped.guides);
  };

  const onCanvasPointerUp = () => {
    if (!interaction) return;
    const item = displayItems.find((entry) => entry.elementId === interaction.elementId) ?? workingItems[interaction.elementId];
    if (item) saveItem(item);
    setInteraction(null);
    setGuides({});
  };

  const onCanvasDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isEditing) return;
    const raw = event.dataTransfer.getData("application/x-visual-freeform");
    if (!raw) return;
    try {
      const payload = JSON.parse(raw) as { mode: "new"; item: PaletteItem } | { mode: "icon"; name: IconName };
      const point = canvasPosition(event.clientX, event.clientY);
      const size = payload.mode === "icon" ? { width: 112, height: 112, label: "أيقونة" } : { width: payload.item.width, height: payload.item.height, label: payload.item.label };
      setDropPreview({ x: point.x, y: point.y, ...size });
    } catch {
      setDropPreview(null);
    }
  };

  const onCanvasDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const raw = event.dataTransfer.getData("application/x-visual-freeform");
    setDropPreview(null);
    if (!raw) return;
    try {
      const payload = JSON.parse(raw) as { mode: "new"; item: PaletteItem } | { mode: "icon"; name: IconName };
      const point = canvasPosition(event.clientX, event.clientY);
      placeNew(payload.mode === "icon" ? { type: "icon", name: payload.name } : payload.item, point.x, point.y);
    } catch {
      toast.error("تعذر قراءة العنصر المسحوب");
    }
  };

  const dragPayload = (event: React.DragEvent, data: unknown) => {
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("application/x-visual-freeform", JSON.stringify(data));
  };

  const applyContent = (patch: Partial<Content>, saveNow = false) => {
    if (!selected) return;
    const nextContent = { ...contentDraft, ...patch };
    setContentDraft(nextContent);
    const next = { ...selected, content: makeContent(nextContent) };
    updateWorking(next);
    if (saveNow) saveItem(next);
  };

  const duplicateSelected = () => {
    if (!selected) return;
    const clone = { ...selected, elementId: `free-${selected.elementType}-${Date.now().toString(36)}`, positionX: clamp(selected.positionX + 28, 0, 1000), positionY: clamp(selected.positionY + 28, 0, 1000), zIndex: selected.zIndex + 1 };
    updateWorking(clone);
    setSelectedId(clone.elementId);
    saveItem(clone);
    toast.success("تم تكرار العنصر");
  };

  const renderElementBody = (item: CanvasItem) => {
    const content = parseContent(item.content);
    if (item.elementType === "text") {
      return <div className="flex h-full w-full items-center"><p className={`${item.preset === "display" ? "text-4xl md:text-6xl" : item.preset === "heading" ? "text-2xl md:text-4xl" : "text-base leading-8"} w-full font-black text-amber-50`} style={{ textAlign: content.textAlign || "start" }}>{content.text || "نص جديد"}</p></div>;
    }
    if (item.elementType === "image") {
      return content.mediaUrl ? <img src={content.mediaUrl} alt={content.altText || "صورة"} draggable={false} className={`h-full w-full shadow-2xl ${item.preset === "circle" ? "rounded-full" : "rounded-2xl"}`} style={{ objectFit: content.objectFit || "cover" }} /> : <div className={`flex h-full w-full items-center justify-center border border-dashed border-amber-300/55 bg-amber-400/[0.08] text-amber-200 ${item.preset === "circle" ? "rounded-full" : "rounded-2xl"}`}><span className="text-center"><ImageIcon className="mx-auto" size={30} /><span className="mt-2 block text-xs font-black">اختر صورة</span></span></div>;
    }
    if (item.elementType === "video") {
      return content.mediaUrl ? isAqeeqDriveVideo(content.mediaUrl) ? <AqeeqVideoPoster sourceUrl={content.mediaUrl} posterUrl={null} title="فيديو" className="h-full w-full rounded-2xl border border-sky-400/25 shadow-2xl" /> : <iframe src={embedUrl(content.mediaUrl)} title="فيديو" className="h-full w-full rounded-2xl border border-sky-400/25 bg-black shadow-2xl" allow="autoplay; encrypted-media" allowFullScreen /> : <div className="flex h-full w-full items-center justify-center rounded-2xl border border-dashed border-sky-400/45 bg-sky-400/[0.06] text-sky-200"><span className="text-center"><PlayCircle className="mx-auto" size={36} /><span className="mt-2 block text-xs font-black">اختر فيديو</span></span></div>;
    }
    if (item.elementType === "icon") {
      const Icon = iconMap[content.iconName || "sparkles"] || Sparkles;
      return <span title={content.tooltip} className="grid h-full w-full place-items-center rounded-2xl border border-amber-400/35 bg-amber-400/10 text-amber-300 shadow-lg"><Icon size={Math.max(24, Math.min(item.width / 3, 52))} /></span>;
    }
    return <span className={`${item.preset === "outline" ? "border border-amber-300/60 bg-black/20 text-amber-100" : "bg-amber-400 text-amber-950 shadow-[0_10px_30px_rgba(251,191,36,.2)]"} flex h-full w-full items-center justify-center rounded-xl px-5 text-center text-sm font-black`}>{content.text || "زر"}</span>;
  };

  const renderItem = (item: CanvasItem) => {
    const isSelected = item.elementId === selectedId;
    const heightPercent = (item.height / 6.25);
    const style = { left: `${item.positionX / 10}%`, top: `${item.positionY / 10}%`, width: `${item.width / 10}%`, height: `${heightPercent}%`, zIndex: item.zIndex } as React.CSSProperties;
    return <div key={item.elementId} data-freeform-id={item.elementId} style={style} onPointerDown={(event) => startInteraction(event, item, "move")} onClick={(event) => { event.stopPropagation(); if (isEditing) setSelectedId(item.elementId); }} className={`absolute -translate-x-1/2 -translate-y-1/2 select-none ${isEditing ? "touch-none cursor-grab active:cursor-grabbing" : ""} ${interaction?.elementId === item.elementId ? "opacity-90" : ""}`}>
      <div className={`h-full w-full ${isEditing ? "pointer-events-none" : ""}`}>{renderElementBody(item)}</div>
      {isEditing && isSelected ? <>
        <div className="pointer-events-none absolute -inset-1 rounded-[18px] border-2 border-sky-300 shadow-[0_0_0_4px_rgba(56,189,248,.13)]" />
        <div className="pointer-events-none absolute -top-8 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-lg bg-sky-400 px-2 py-1 text-[10px] font-black text-slate-950 shadow-lg"><Move size={11} />اسحب للتحريك</div>
        {(["nw", "ne", "sw", "se"] as ResizeCorner[]).map((corner) => <button key={corner} type="button" aria-label="تغيير حجم العنصر" onPointerDown={(event) => startInteraction(event, item, "resize", corner)} className={`absolute z-20 h-3.5 w-3.5 rounded-[4px] border-2 border-white bg-sky-400 shadow ${corner === "nw" ? "-left-2 -top-2 cursor-nwse-resize" : corner === "ne" ? "-right-2 -top-2 cursor-nesw-resize" : corner === "sw" ? "-bottom-2 -left-2 cursor-nesw-resize" : "-bottom-2 -right-2 cursor-nwse-resize"}`} />)}
      </> : null}
    </div>;
  };

  if (!isEditing && !displayItems.length) return null;

  const categories = ["نص", "وسائط", "تفاعل"] as const;
  return <section className="relative border-y border-amber-400/15 bg-[#090d15] py-10" dir="rtl">
    <div className="container">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-black tracking-[0.16em] text-amber-300">WIX-STYLE CANVAS</div>
          <h2 className="mt-1 text-2xl font-black text-amber-50">مساحة تصميم حرة</h2>
          <p className="mt-1 text-sm text-slate-400">اختر عنصراً، اسحبه مباشرة، ثم غيّر حجمه من المقابض الزرقاء.</p>
        </div>
        {isEditing ? <div className="flex items-center gap-2"><button type="button" onClick={() => setShowGrid((value) => !value)} className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black transition ${showGrid ? "border-sky-300/60 bg-sky-400/15 text-sky-100" : "border-slate-700 text-slate-400"}`}><Grid2X2 size={15} />شبكة</button><button type="button" onClick={() => setSnapEnabled((value) => !value)} className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black transition ${snapEnabled ? "border-amber-300/60 bg-amber-400/15 text-amber-100" : "border-slate-700 text-slate-400"}`}><MousePointer2 size={15} />محاذاة ذكية</button></div> : null}
      </div>

      <div className={`grid gap-4 ${isEditing ? "xl:grid-cols-[246px_minmax(0,1fr)_292px]" : "grid-cols-1"}`}>
        {isEditing ? <aside className="order-2 max-h-[760px] overflow-y-auto rounded-3xl border border-white/[0.09] bg-[#101722] p-3 xl:order-1">
          <div className="mb-3 flex items-center justify-between"><div><div className="text-xs font-black text-amber-100">أضف إلى الصفحة</div><p className="mt-0.5 text-[10px] text-slate-500">اسحب القالب أو اضغط زر الإضافة</p></div><Plus size={17} className="text-amber-300" /></div>
          {categories.map((category) => <div key={category} className="mb-4"><div className="mb-2 text-[10px] font-black text-slate-400">{category}</div><div className="grid grid-cols-2 gap-2">{palette.filter((entry) => entry.category === category).map((item) => <div key={`${item.type}-${item.preset}`} draggable onDragStart={(event) => dragPayload(event, { mode: "new", item })} className="group cursor-grab rounded-xl border border-white/[0.08] bg-black/20 p-2 transition hover:-translate-y-0.5 hover:border-amber-300/55 hover:bg-amber-400/[0.045] active:cursor-grabbing"><PalettePreview item={item} /><div className="truncate text-[11px] font-black text-slate-100">{item.label}</div><div className="mt-0.5 truncate text-[9px] text-slate-500">{item.hint}</div><button type="button" onClick={() => placeNew(item, 500, 480)} className="mt-2 w-full rounded-lg border border-white/[0.1] py-1 text-[9px] font-black text-amber-200 transition hover:border-amber-300 hover:bg-amber-400/10">إضافة</button></div>)}</div></div>)}
          <div className="mt-2 border-t border-white/[0.08] pt-3"><div className="mb-2 text-[10px] font-black text-slate-400">الأيقونات المرتبطة</div><div className="grid grid-cols-3 gap-2">{iconLibrary.map(({ name, label, Icon }) => <button key={name} type="button" draggable onDragStart={(event) => dragPayload(event, { mode: "icon", name })} onClick={() => placeNew({ type: "icon", name }, 500, 500)} title={`إضافة ${label}`} className="grid cursor-grab place-items-center rounded-xl border border-white/[0.08] bg-black/20 p-2 text-amber-300 transition hover:border-amber-300/60 hover:bg-amber-400/[0.06] active:cursor-grabbing"><Icon size={18} /><span className="mt-1 text-[8px] font-bold text-slate-400">{label}</span></button>)}</div></div>
        </aside> : null}

        <div className="order-1 min-w-0 xl:order-2">
          <div className="mb-3 flex items-center justify-between rounded-2xl border border-white/[0.08] bg-[#101722] px-3 py-2.5"><div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-lg bg-sky-400/15 text-sky-300"><MousePointer2 size={15} /></span><span className="text-xs font-black text-slate-200">سطح المكتب</span></div><div className="flex items-center gap-2 text-[10px] font-bold text-slate-500"><span className="rounded-full bg-amber-400/10 px-2 py-1 text-amber-200">{displayItems.length} عنصر</span>{isEditing ? <span>{interaction ? "جارٍ التحريك…" : "اضغط واسحب"}</span> : null}</div></div>
          <div ref={canvasRef} onPointerMove={onCanvasPointerMove} onPointerUp={onCanvasPointerUp} onPointerCancel={onCanvasPointerUp} onPointerLeave={(event) => { if (event.buttons === 0) onCanvasPointerUp(); }} onClick={() => isEditing && setSelectedId(null)} onDragOver={onCanvasDragOver} onDragLeave={() => setDropPreview(null)} onDrop={onCanvasDrop} className={`relative aspect-[16/10] min-h-[570px] overflow-hidden rounded-[28px] border bg-[#0a0e16] shadow-[0_24px_80px_rgba(0,0,0,.38)] ${isEditing ? "border-sky-300/35" : "border-amber-300/20"} ${showGrid && isEditing ? "[background-image:linear-gradient(rgba(148,163,184,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,.08)_1px,transparent_1px),radial-gradient(circle_at_50%_40%,rgba(251,191,36,.09),transparent_48%)] [background-size:32px_32px,32px_32px,auto]" : "bg-[radial-gradient(circle_at_50%_40%,rgba(251,191,36,.09),transparent_48%)]"}`}>
            {isEditing ? <><div className="pointer-events-none absolute inset-y-0 left-[8%] border-l border-dashed border-amber-200/15" /><div className="pointer-events-none absolute inset-y-0 left-1/2 border-l border-dashed border-sky-200/20" /><div className="pointer-events-none absolute inset-y-0 right-[8%] border-l border-dashed border-amber-200/15" /><div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-sky-200/20" /></> : null}
            {guides.x !== undefined ? <div className="pointer-events-none absolute inset-y-0 z-40 border-l-2 border-fuchsia-400" style={{ left: `${guides.x / 10}%` }} /> : null}
            {guides.y !== undefined ? <div className="pointer-events-none absolute inset-x-0 z-40 border-t-2 border-fuchsia-400" style={{ top: `${guides.y / 10}%` }} /> : null}
            {dropPreview ? <div className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-300/10" style={{ left: `${dropPreview.x / 10}%`, top: `${dropPreview.y / 10}%`, width: `${dropPreview.width / 10}%`, height: `${dropPreview.height / 6.25}%` }}><span className="absolute -top-7 right-0 rounded-md bg-amber-300 px-2 py-1 text-[10px] font-black text-amber-950">إفلات: {dropPreview.label}</span></div> : null}
            {isEditing && !displayItems.length ? <div className="pointer-events-none absolute inset-0 grid place-items-center text-center"><div className="rounded-3xl border border-dashed border-amber-300/35 bg-[#101722]/90 p-7 shadow-xl"><Maximize2 className="mx-auto text-amber-300" size={38} /><p className="mt-3 text-sm font-black text-amber-50">هذه صفحتك — ضع فيها أي عنصر</p><p className="mt-1 max-w-[300px] text-xs leading-6 text-slate-400">اسحب صورة أو فيديو أو نصاً من المكتبة. ستظهر مساحة الإفلات قبل أن تترك الماوس.</p></div></div> : null}
            {displayItems.map(renderItem)}
          </div>
          {isEditing ? <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-[10px] text-slate-500"><span>الخط البنفسجي = محاذاة ذكية. اضغط <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-slate-300">Shift</kbd> أثناء تحجيم الوسائط للتحجيم الحر.</span><span>المسودة لا تظهر للزوار قبل النشر.</span></div> : null}
        </div>

        {isEditing ? <aside className="order-3 max-h-[760px] overflow-y-auto rounded-3xl border border-white/[0.09] bg-[#101722] p-4">
          {selected ? <>
            <div className="flex items-start justify-between border-b border-white/[0.08] pb-3"><div><div className="text-[10px] font-black text-sky-300">المفتش الذكي</div><h3 className="mt-1 text-sm font-black text-white">{selected.elementType === "text" ? "نص" : selected.elementType === "image" ? "صورة" : selected.elementType === "video" ? "فيديو" : selected.elementType === "icon" ? "أيقونة" : "زر"} · {selected.preset}</h3></div><button type="button" onClick={() => setSelectedId(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/[0.08] hover:text-white"><X size={16} /></button></div>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-2"><NumberField label="X" value={selected.positionX} onChange={(positionX) => patchSelected({ positionX })} onCommit={() => commitSelected()} /><NumberField label="Y" value={selected.positionY} onChange={(positionY) => patchSelected({ positionY })} onCommit={() => commitSelected()} /><NumberField label="العرض" value={selected.width} onChange={(width) => patchSelected({ width })} onCommit={() => commitSelected()} /><NumberField label="الارتفاع" value={selected.height} onChange={(height) => patchSelected({ height })} onCommit={() => commitSelected()} /></div>
              {selected.elementType === "text" || selected.elementType === "button" ? <><label className="block text-[11px] font-bold text-slate-400">المحتوى<textarea value={contentDraft.text || ""} onChange={(event) => applyContent({ text: event.target.value })} onBlur={() => applyContent({}, true)} className="mt-1.5 min-h-24 w-full rounded-xl border border-slate-700 bg-black/20 p-2.5 text-sm leading-6 text-white outline-none focus:border-sky-300" /></label>{selected.elementType === "text" ? <label className="block text-[11px] font-bold text-slate-400">محاذاة النص<select value={contentDraft.textAlign || "start"} onChange={(event) => applyContent({ textAlign: event.target.value as TextAlign }, true)} className="mt-1.5 w-full rounded-xl border border-slate-700 bg-black/20 px-2.5 py-2 text-xs text-white outline-none focus:border-sky-300"><option value="start">يمين</option><option value="center">وسط</option><option value="end">يسار</option></select></label> : null}</> : null}
              {["image", "video"].includes(selected.elementType) ? <button type="button" onClick={() => setMediaTarget(selected)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-sky-300/35 bg-sky-400/[0.08] px-3 py-3 text-xs font-black text-sky-100 transition hover:bg-sky-400/15"><ImageIcon size={15} />اختيار أو رفع {selected.elementType === "image" ? "صورة" : "فيديو"}</button> : null}
              {selected.elementType === "icon" ? <div><label className="text-[11px] font-bold text-slate-400">اختر الأيقونة</label><div className="mt-2 grid grid-cols-5 gap-1.5">{iconLibrary.map(({ name, Icon, label }) => <button key={name} type="button" title={label} onClick={() => applyContent({ iconName: name }, true)} className={`grid h-9 place-items-center rounded-lg border transition ${contentDraft.iconName === name ? "border-amber-300 bg-amber-400/15 text-amber-200" : "border-slate-700 text-slate-400 hover:border-slate-500"}`}><Icon size={16} /></button>)}</div></div> : null}
              <label className="block text-[11px] font-bold text-slate-400"><span className="flex items-center gap-1"><Link2 size={12} />الرابط أو وجهة النقر</span><input value={contentDraft.linkUrl || ""} onChange={(event) => applyContent({ linkUrl: event.target.value })} onBlur={() => applyContent({}, true)} placeholder="https://... أو /page/..." className="mt-1.5 w-full rounded-xl border border-slate-700 bg-black/20 px-2.5 py-2.5 text-xs text-white outline-none focus:border-sky-300" /></label>
              <div className="grid grid-cols-2 gap-2"><button type="button" onClick={duplicateSelected} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-600 px-2 py-2.5 text-[11px] font-black text-slate-200 transition hover:border-slate-400"><Copy size={14} />تكرار</button><button type="button" onClick={() => remove.mutate({ pagePath, elementId: selected.elementId })} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-400/30 px-2 py-2.5 text-[11px] font-black text-rose-300 transition hover:bg-rose-400/10"><Trash2 size={14} />حذف</button></div>
              <button type="button" onClick={() => publish.mutate({ pagePath, elementId: selected.elementId })} disabled={publish.isPending} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-3 py-3 text-xs font-black text-emerald-950 transition hover:bg-emerald-300 disabled:opacity-50"><Check size={15} />نشر هذا العنصر</button>
            </div>
          </> : <div className="grid min-h-[310px] place-items-center text-center"><div><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-sky-400/10 text-sky-300"><Move size={22} /></span><h3 className="mt-3 text-sm font-black text-slate-100">اختر عنصراً من القماش</h3><p className="mx-auto mt-1 max-w-[210px] text-xs leading-6 text-slate-500">ستظهر أدوات الحجم، المكان، الرابط والوسائط هنا.</p></div></div>}
        </aside> : null}
      </div>
    </div>
    <MediaLibrary open={Boolean(mediaTarget)} onClose={() => setMediaTarget(null)} accept={mediaTarget?.elementType === "video" ? "video" : "image"} onSelect={(asset) => { if (!mediaTarget) return; const next = { ...mediaTarget, content: makeContent({ ...parseContent(mediaTarget.content), mediaUrl: asset.url, altText: asset.altText || "" }) }; updateWorking(next); saveItem(next); setMediaTarget(null); }} />
  </section>;
}

function NumberField({ label, value, onChange, onCommit }: { label: string; value: number; onChange: (value: number) => void; onCommit: () => void }) {
  return <label className="text-[10px] font-bold text-slate-400">{label}<input type="number" value={value} min={0} max={1000} onChange={(event) => onChange(Number(event.target.value) || 0)} onBlur={onCommit} className="mt-1 block w-full rounded-lg border border-slate-700 bg-black/20 px-2 py-1.5 text-xs font-black text-slate-100 outline-none focus:border-sky-300" /></label>;
}
