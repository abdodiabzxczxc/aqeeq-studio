import { trpc } from "@/lib/trpc";
import {
  AlignCenter,
  Badge,
  Circle,
  CirclePlay,
  Diamond,
  Frame,
  ImageIcon,
  Layers3,
  LayoutPanelTop,
  MapPin,
  Minus,
  Plus,
  Quote,
  RectangleHorizontal,
  Search,
  Sparkles,
  Star,
  Type,
  Video,
  WandSparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import MediaLibrary from "./MediaLibrary";

type SectionType = "hero" | "features" | "gallery" | "video" | "cta" | "custom";
type Category = "نصوص" | "أشكال" | "صور وفيديو" | "أزرار وروابط" | "رموز وزخارف";
type BlockTemplate = {
  id: string;
  title: string;
  hint: string;
  category: Category;
  icon: LucideIcon;
  sectionType: SectionType;
  config: Record<string, unknown>;
  media?: "imageUrl" | "videoUrl";
  repeatable?: boolean;
};
type MediaTarget = {
  sectionId: string;
  sectionType: SectionType;
  orderIndex: number;
  config: Record<string, unknown>;
  field: "imageUrl" | "videoUrl";
};

const categories: Category[] = ["نصوص", "أشكال", "صور وفيديو", "أزرار وروابط", "رموز وزخارف"];

const blocks: BlockTemplate[] = [
  {
    id: "design-title",
    title: "عنوان كبير",
    hint: "عنوان رئيسي واضح وجذاب",
    category: "نصوص",
    icon: Type,
    sectionType: "custom",
    repeatable: true,
    config: { builderElement: "text", title: "عنوان يلفت الانتباه", body: "أضف وصفاً مختصراً أو اترك المساحة للعنوان فقط." },
  },
  {
    id: "design-subtitle",
    title: "عنوان فرعي",
    hint: "نص مساعد ومنظم للأفكار",
    category: "نصوص",
    icon: AlignCenter,
    sectionType: "custom",
    repeatable: true,
    config: { builderElement: "text", title: "عنوان فرعي", body: "سطر يوضح الفكرة أو يكمل العنوان الرئيسي." },
  },
  {
    id: "design-paragraph",
    title: "فقرة نصية",
    hint: "محتوى قابل للتنسيق الكامل",
    category: "نصوص",
    icon: Layers3,
    sectionType: "custom",
    repeatable: true,
    config: { builderElement: "text", title: "مساحة كتابة", body: "اكتب المحتوى الذي تريد عرضه هنا، ثم عدّل اللون والخط من الخصائص." },
  },
  {
    id: "design-quote",
    title: "اقتباس مميز",
    hint: "رسالة بارزة أو جملة ملهمة",
    category: "نصوص",
    icon: Quote,
    sectionType: "custom",
    repeatable: true,
    config: { builderElement: "text", title: "«كل فكرة عظيمة تبدأ بخطوة»", body: "استخدمها كرسالة قصيرة أو اقتباس ملهم." },
  },
  {
    id: "shape-rectangle",
    title: "مستطيل",
    hint: "بطاقة أو مساحة خلفية ملونة",
    category: "أشكال",
    icon: RectangleHorizontal,
    sectionType: "custom",
    repeatable: true,
    config: { builderElement: "shape", shapeType: "rectangle", shapeColor: "linear-gradient(135deg,#e5b84f,#8e5c16)", shapeLabel: "مستطيل" },
  },
  {
    id: "shape-rounded",
    title: "بطاقة مستديرة",
    hint: "بطاقة بزوايا ناعمة حديثة",
    category: "أشكال",
    icon: Frame,
    sectionType: "custom",
    repeatable: true,
    config: { builderElement: "shape", shapeType: "rounded", shapeColor: "linear-gradient(135deg,#1f1f1f,#0a0a0a)", shapeLabel: "بطاقة مستديرة" },
  },
  {
    id: "shape-circle",
    title: "دائرة",
    hint: "نقطة تركيز أو خلفية هندسية",
    category: "أشكال",
    icon: Circle,
    sectionType: "custom",
    repeatable: true,
    config: { builderElement: "shape", shapeType: "circle", shapeColor: "radial-gradient(circle at 30% 30%,#f5df9d,#b97820)", shapeLabel: "دائرة" },
  },
  {
    id: "shape-pill",
    title: "شارة كبسولة",
    hint: "وسم أو شارة تصنيف أنيقة",
    category: "أشكال",
    icon: Badge,
    sectionType: "custom",
    repeatable: true,
    config: { builderElement: "shape", shapeType: "pill", shapeColor: "linear-gradient(90deg,#27272a,#18181b)", shapeLabel: "شارة" },
  },
  {
    id: "shape-line",
    title: "خط فاصل",
    hint: "فصل ذهبي أنيق بين الأقسام",
    category: "أشكال",
    icon: Minus,
    sectionType: "custom",
    repeatable: true,
    config: { builderElement: "shape", shapeType: "line", shapeColor: "linear-gradient(90deg,transparent,#e5b84f,transparent)", shapeLabel: "فاصل" },
  },
  {
    id: "shape-arch",
    title: "قوس فني",
    hint: "إطار جمالي للصور والعناوين",
    category: "أشكال",
    icon: LayoutPanelTop,
    sectionType: "custom",
    repeatable: true,
    config: { builderElement: "shape", shapeType: "arch", shapeColor: "linear-gradient(135deg,#1c1917,#292524)", shapeLabel: "قوس" },
  },
  {
    id: "shape-diamond",
    title: "ماسة ذهبية",
    hint: "زخرفة هندسية فاخرة",
    category: "أشكال",
    icon: Diamond,
    sectionType: "custom",
    repeatable: true,
    config: { builderElement: "shape", shapeType: "diamond", shapeColor: "linear-gradient(135deg,#f5df9d,#be7920)", shapeLabel: "ماسة" },
  },
  {
    id: "media-image",
    title: "صورة حرة",
    hint: "صورة أو شعار مع روابط تفاعلية",
    category: "صور وفيديو",
    icon: ImageIcon,
    sectionType: "custom",
    repeatable: true,
    config: { builderElement: "image", title: "صورة جديدة", imageUrl: "", imageAlt: "صورة مضافة" },
    media: "imageUrl",
  },
  {
    id: "media-frame",
    title: "صورة بإطار",
    hint: "صورة داخل إطار جمالي محدد",
    category: "صور وفيديو",
    icon: Frame,
    sectionType: "custom",
    repeatable: true,
    config: { builderElement: "image", title: "صورة بإطار", imageUrl: "", imageAlt: "صورة بإطار" },
    media: "imageUrl",
  },
  {
    id: "media-gallery",
    title: "معرض صور",
    hint: "معرض تفاعلي متعدد الصور",
    category: "صور وفيديو",
    icon: Layers3,
    sectionType: "gallery",
    repeatable: true,
    config: {
      title: "معرض صور",
      subtitle: "اختر الصور من المكتبة ثم عدّل ترتيبها.",
      items: [{ title: "الصورة الأولى" }, { title: "الصورة الثانية" }, { title: "الصورة الثالثة" }],
    },
  },
  {
    id: "media-video",
    title: "فيديو",
    hint: "مقطع فيديو مرفوع أو YouTube",
    category: "صور وفيديو",
    icon: Video,
    sectionType: "video",
    repeatable: true,
    config: { title: "فيديو جديد", body: "أضف رابطاً أو اختر فيديو من المكتبة.", videoUrl: "" },
    media: "videoUrl",
  },
  {
    id: "button-primary",
    title: "زر أساسي ذهبي",
    hint: "زر بارز مع رابط مباشر",
    category: "أزرار وروابط",
    icon: Plus,
    sectionType: "custom",
    repeatable: true,
    config: { builderElement: "button", title: "زر أساسي", buttonText: "ابدأ الآن", buttonHref: "#" },
  },
  {
    id: "button-secondary",
    title: "زر ثانوي هادئ",
    hint: "زر شفاف مع إطار أنيق",
    category: "أزرار وروابط",
    icon: CirclePlay,
    sectionType: "custom",
    repeatable: true,
    config: { builderElement: "button", title: "زر ثانوي", buttonText: "اعرف المزيد", buttonHref: "#" },
  },
  {
    id: "button-location",
    title: "زر موقع وخريطة",
    hint: "رابط سريع للعنوان أو المكان",
    category: "أزرار وروابط",
    icon: MapPin,
    sectionType: "custom",
    repeatable: true,
    config: { builderElement: "button", title: "زر موقع", buttonText: "افتح الموقع", buttonHref: "#" },
  },
  {
    id: "cta-banner",
    title: "شريط تفاعلي كامل",
    hint: "رسالة وزر بعرض الصفحة",
    category: "أزرار وروابط",
    icon: WandSparkles,
    sectionType: "cta",
    repeatable: true,
    config: { title: "هل أنت مستعد للخطوة التالية؟", subtitle: "أضف رابطاً أو وسيلة تواصل.", buttonText: "تنفيذ الإجراء", buttonHref: "#" },
  },
  {
    id: "icon-sparkles",
    title: "بريق ونجوم",
    hint: "أيقونة جمالية للمحتوى",
    category: "رموز وزخارف",
    icon: Sparkles,
    sectionType: "custom",
    repeatable: true,
    config: { builderElement: "icon", iconName: "sparkles", title: "لمسة مميزة" },
  },
  {
    id: "icon-star",
    title: "نجمة تمييز",
    hint: "تمييز بطاقة أو عنصر هام",
    category: "رموز وزخارف",
    icon: Star,
    sectionType: "custom",
    repeatable: true,
    config: { builderElement: "icon", iconName: "star", title: "نقطة مميزة" },
  },
  {
    id: "icon-ornament",
    title: "زخرفة فاخرة",
    hint: "عنصر بصري هادئ ومتناسق",
    category: "رموز وزخارف",
    icon: WandSparkles,
    sectionType: "custom",
    repeatable: true,
    config: { builderElement: "icon", iconName: "heart", title: "زخرفة" },
  },
];

function asPayload(block: BlockTemplate) {
  return { id: block.id, title: block.title, sectionType: block.sectionType, config: block.config, media: block.media };
}

export default function VisualAddPanel({ open, onClose, pagePath }: { open: boolean; onClose: () => void; pagePath: string }) {
  const utils = trpc.useUtils();
  const { data: sections = [] } = trpc.visualEditor.sections.list.useQuery({ pagePath }, { enabled: open, refetchOnWindowFocus: false });
  const [category, setCategory] = useState<Category | "الكل">("الكل");
  const [query, setQuery] = useState("");
  const [mediaTarget, setMediaTarget] = useState<MediaTarget | null>(null);

  const invalidate = () => {
    void utils.visualEditor.sections.list.invalidate({ pagePath });
    void utils.visualEditor.sections.publicList.invalidate({ pagePath });
    void utils.visualEditor.sections.history.invalidate({ pagePath });
  };

  const save = trpc.visualEditor.sections.save.useMutation({
    onSuccess: invalidate,
    onError: (error) => toast.error(error.message || "تعذر إضافة عنصر التصميم"),
  });

  const visibleBlocks = useMemo(
    () =>
      blocks.filter(
        (block) =>
          (category === "الكل" || block.category === category) &&
          `${block.title} ${block.hint} ${block.category}`.toLowerCase().includes(query.trim().toLowerCase())
      ),
    [category, query]
  );

  const insertAtEnd = (block: BlockTemplate) => {
    const sectionId = `section-${block.sectionType}-${Date.now().toString(36)}`;
    const orderIndex = sections.length;
    save.mutate(
      { pagePath, sectionId, sectionType: block.sectionType, orderIndex, config: block.config },
      {
        onSuccess: () => {
          toast.success(`تمت إضافة «${block.title}»`);
          if (block.media) setMediaTarget({ sectionId, sectionType: block.sectionType, orderIndex, config: block.config, field: block.media });
        },
      }
    );
  };

  const pickMedia = (asset: { url: string; altText: string | null }) => {
    if (!mediaTarget) return;
    const config = {
      ...mediaTarget.config,
      [mediaTarget.field]: asset.url,
      ...(mediaTarget.field === "imageUrl" ? { imageAlt: asset.altText || "" } : {})
    };
    save.mutate(
      { pagePath, sectionId: mediaTarget.sectionId, sectionType: mediaTarget.sectionType, orderIndex: mediaTarget.orderIndex, config },
      {
        onSuccess: () => {
          toast.success("تم اختيار الوسيط بنجاح");
          setMediaTarget(null);
        },
      }
    );
  };

  const groups = categories
    .map((group) => ({ group, items: visibleBlocks.filter((block) => block.category === group) }))
    .filter(({ items }) => items.length);

  if (!open) return null;

  return (
    <>
      <aside
        data-aq-editor-panel="add"
        onPointerDown={(event) => event.stopPropagation()}
        className="fixed inset-x-0 bottom-0 z-[340] flex h-[82svh] flex-col rounded-t-[1.75rem] border-t border-amber-400/25 bg-[#080808]/[0.98] text-white shadow-[0_25px_70px_rgba(0,0,0,0.85)] backdrop-blur-2xl md:inset-y-0 md:left-0 md:right-auto md:h-auto md:w-[min(420px,100vw)] md:rounded-none md:border-r"
        dir="rtl"
      >
        {/* Header */}
        <header className="border-b border-white/[0.08] px-5 pb-4 pt-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-black tracking-widest text-amber-300">إضافة عنصر جديد</div>
              <h2 className="mt-0.5 text-base font-black text-white">اختر العنصر المطلوب</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
              title="إغلاق"
            >
              <X size={18} />
            </button>
          </div>

          {/* Search bar */}
          <label className="mt-4 flex items-center gap-2.5 rounded-xl border border-white/[0.12] bg-white/[0.03] px-3.5 py-2.5 text-slate-400 transition focus-within:border-amber-400/60 focus-within:bg-black/40">
            <Search size={15} className="text-amber-400/70 shrink-0" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحث: نص، صورة، زر، شكل، فيديو..."
              className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-slate-500"
            />
          </label>
        </header>

        {/* Categories Bar */}
        <div className="flex gap-2 overflow-x-auto border-b border-white/[0.08] px-4 py-2.5 scrollbar-none">
          {(["الكل", ...categories] as const).map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setCategory(item)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-black transition duration-200 ${
                category === item
                  ? "bg-amber-300 text-slate-950 shadow-[0_0_12px_rgba(229,184,79,0.3)]"
                  : "border border-white/[0.1] bg-white/[0.02] text-slate-400 hover:border-amber-400/30 hover:text-slate-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Content Cards */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-6">
          {groups.map(({ group, items }) => (
            <section key={group}>
              <div className="mb-2.5 flex items-center justify-between px-1">
                <h3 className="text-xs font-black text-amber-200/90">{group}</h3>
                <span className="text-[10px] font-bold text-slate-500">{items.length} عنصر</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {items.map((block) => {
                  const Icon = block.icon;
                  return (
                    <article
                      key={block.id}
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = "copy";
                        event.dataTransfer.setData("application/x-site-builder-block", JSON.stringify(asPayload(block)));
                      }}
                      className="group flex flex-col justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 text-right transition duration-200 hover:-translate-y-0.5 hover:border-amber-400/40 hover:bg-amber-400/[0.04] active:cursor-grabbing"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-400/10 text-amber-300 transition group-hover:bg-amber-300 group-hover:text-slate-950">
                          <Icon size={16} />
                        </span>
                        <button
                          type="button"
                          onClick={() => insertAtEnd(block)}
                          disabled={save.isPending}
                          title={`إضافة ${block.title}`}
                          className="grid h-7 w-7 place-items-center rounded-lg border border-white/[0.1] text-slate-300 transition hover:border-amber-300 hover:bg-amber-300 hover:text-slate-950 disabled:opacity-50"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="mt-3">
                        <div className="text-xs font-black text-slate-100 group-hover:text-amber-200 transition">{block.title}</div>
                        <div className="mt-1 text-[10px] leading-4 text-slate-500 line-clamp-2">{block.hint}</div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}

          {!visibleBlocks.length ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-xs leading-6 text-slate-500">
              لا توجد عناصر مطابقة لبحثك.
            </div>
          ) : null}
        </div>
      </aside>

      <MediaLibrary
        open={Boolean(mediaTarget)}
        onClose={() => setMediaTarget(null)}
        onSelect={pickMedia}
        accept={mediaTarget?.field === "videoUrl" ? "video" : "image"}
      />
    </>
  );
}
