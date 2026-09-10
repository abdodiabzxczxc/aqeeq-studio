import React, { useState } from "react";
import {
  Plus,
  LayoutTemplate,
  GraduationCap,
  Layers3,
  Palette,
  History,
  X,
  Type,
  Square,
  ImageIcon,
  Video,
  Smile,
  Minus,
  Check,
  RotateCcw,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Search,
  ChevronUp,
  ChevronDown,
  GripVertical,
} from "lucide-react";
import { StudioSchoolBlocks, type SchoolBlock } from "./StudioSchoolBlocks";
import VisualDesignTokensPanel from "../VisualDesignTokensPanel";
import VisualHistoryDrawer from "../VisualHistoryDrawer";
import { toast } from "sonner";

export type StudioDockTab = "elements" | "sections" | "schoolCms" | "layers" | "tokens" | "history" | null;

export type StudioLayerItem = {
  id: string;
  tag: string;
  label: string;
  type?: string;
  isHidden?: boolean;
  isLocked?: boolean;
};

const BASIC_ELEMENTS = [
  { tag: "text", label: "عنوان رئيسي", icon: Type, preview: "H1", hint: "عنوان بخط عريض يلفت الانتباه" },
  { tag: "text", label: "نص فقرة", icon: Type, preview: "P", hint: "وصف أو محتوى توضيحي" },
  { tag: "button", label: "زر إجراء (CTA)", icon: Square, preview: "BTN", hint: "زر تفاعلي يقود لصفحة أو واتساب" },
  { tag: "image", label: "صورة", icon: ImageIcon, preview: "IMG", hint: "صورة من المكتبة أو الجهاز" },
  { tag: "video", label: "مقطع فيديو", icon: Video, preview: "VID", hint: "فيديو مرفوع أو رابط YouTube" },
  { tag: "icon", label: "أيقونة أو شارة", icon: Smile, preview: "ICO", hint: "رمز توضيحي أو شارة تميز" },
  { tag: "divider", label: "خط فاصل زخرفي", icon: Minus, preview: "HR", hint: "فاصل أنيق بين الأقسام" },
];

const SECTION_TEMPLATES = [
  { type: "hero", title: "واجهة افتتاحية (Hero)", hint: "عنوان كبير، وصف، أزرار وصورة غلاف رئيسية", emoji: "🎯" },
  { type: "features", title: "بطاقات المزايا والخدمات", hint: "شبكة كروت لعرض مميزات التعليم أو الأنشطة", emoji: "⭐" },
  { type: "gallery", title: "معرض الصور التفاعلي", hint: "ألبوم صور منظم ومتجاوب لتوثيق الفعاليات", emoji: "📸" },
  { type: "video", title: "قسم الفيديو الإعلاني", hint: "مساحة لعرض فيديو المدرسة الترويجي أو التوثيقي", emoji: "🎬" },
  { type: "cta", title: "دعوة للتسجيل والاتصال", hint: "قسم ختامي بارز بروابط التسجيل والتواصل الفوري", emoji: "📞" },
  { type: "custom", title: "مساحة حرة مخصصة", hint: "قسم مرن لإضافة محتوى خاص بحرية تامة", emoji: "✨" },
];

export function StudioLeftDock({
  activeTab,
  onSelectTab,
  onInsertElement,
  onInsertSection,
  onInsertSchoolBlock,
  onApplyAiText,
  layers = [],
  selectedLayerId,
  onSelectLayer,
  onToggleLayerVisibility,
  onToggleLayerLock,
  onDeleteLayer,
  onReorderSection,
  pagePath,
}: {
  activeTab: StudioDockTab;
  onSelectTab: (tab: StudioDockTab) => void;
  onInsertElement?: (tag: string, label: string) => void;
  onInsertSection?: (type: string, title?: string) => void;
  onInsertSchoolBlock?: (block: SchoolBlock) => void;
  onApplyAiText?: (text: { headline: string; body: string; cta: string }) => void;
  layers?: StudioLayerItem[];
  selectedLayerId?: string | null;
  onSelectLayer?: (id: string) => void;
  onToggleLayerVisibility?: (id: string) => void;
  onToggleLayerLock?: (id: string) => void;
  onDeleteLayer?: (id: string) => void;
  onReorderSection?: (id: string, direction: "up" | "down") => void;
  pagePath: string;
}) {
  const [layerSearch, setLayerSearch] = useState("");
  const [layerFilter, setLayerFilter] = useState<"all" | "section" | "text" | "image" | "button">("all");

  const [personalTemplates] = useState<Array<{ id: string; name: string; type: string }>>(() => {
    try {
      return JSON.parse(window.localStorage.getItem("alaqeeq-personal-section-templates") || "[]");
    } catch {
      return [];
    }
  });

  const TABS = [
    { id: "elements" as const, label: "عناصر", icon: Plus, tooltip: "إضافة عنصر جديد" },
    { id: "sections" as const, label: "أقسام", icon: LayoutTemplate, tooltip: "منشئ الأقسام والقوالب" },
    { id: "schoolCms" as const, label: "بيانات حية", icon: GraduationCap, tooltip: "كتل المدرسة الحية (CMS)" },
    { id: "layers" as const, label: "الطبقات", icon: Layers3, tooltip: "شجرة طبقات الصفحة وعناصرها" },
    { id: "tokens" as const, label: "الهوية", icon: Palette, tooltip: "ألوان الموقع وثيمات المناسبات" },
    { id: "history" as const, label: "التاريخ", icon: History, tooltip: "سجل النسخ السابقة" },
  ];

  const filteredLayers = layers.filter((layer) => {
    if (layerFilter === "section" && !layer.tag.includes("section") && layer.type !== "section") return false;
    if (layerFilter === "text" && layer.tag !== "text") return false;
    if (layerFilter === "image" && layer.tag !== "image") return false;
    if (layerFilter === "button" && layer.tag !== "button") return false;
    if (layerSearch.trim()) {
      const q = layerSearch.toLowerCase();
      return (
        layer.label.toLowerCase().includes(q) ||
        layer.id.toLowerCase().includes(q) ||
        layer.tag.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="relative flex z-40 h-full select-none" dir="rtl">
      {/* ── Icon Command Rail (Always visible) ──────────────────── */}
      <aside className="flex w-16 flex-col items-center justify-between border-l border-white/10 bg-[#07090e]/98 py-3 text-white shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col items-center gap-1.5 w-full px-1.5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(isActive ? null : tab.id)}
                className={`group relative flex flex-col items-center justify-center gap-1 w-full rounded-2xl py-2.5 transition cursor-pointer ${
                  isActive
                    ? "bg-amber-400 text-black font-black shadow-[0_0_15px_rgba(251,191,36,0.35)]"
                    : "text-slate-400 hover:bg-white/10 hover:text-white"
                }`}
                title={tab.tooltip}
              >
                <Icon size={18} />
                <span className="text-[9px] font-bold tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── Expandable Flyout Panel ─────────────────────────────── */}
      {activeTab && (
        <div
          data-aq-studio-flyout
          className="flex w-80 sm:w-96 flex-col border-l border-white/10 bg-[#0c1018]/98 text-white shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-right-3 duration-200"
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5">
            <h3 className="text-xs font-black text-amber-300">
              {activeTab === "elements" && "إضافة عنصر جديد (+)"}
              {activeTab === "sections" && "الأقسام والقوالب الجاهزة"}
              {activeTab === "schoolCms" && "كتل المدرسة الحية"}
              {activeTab === "layers" && "شجرة الطبقات والعناصر"}
              {activeTab === "tokens" && "هوية الموقع والألوان"}
              {activeTab === "history" && "سجل التعديلات الزمني"}
            </h3>
            <button
              type="button"
              onClick={() => onSelectTab(null)}
              className="rounded-xl p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {/* Panel Content Scrollable */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* 1. ELEMENTS TAB */}
            {activeTab === "elements" && (
              <div className="space-y-2">
                <div className="text-[10px] font-black text-slate-400 mb-2">اختر عنصراً للإدراج في الصفحة:</div>
                <div className="grid grid-cols-2 gap-2">
                  {BASIC_ELEMENTS.map((el) => {
                    const Icon = el.icon;
                    return (
                      <button
                        key={el.label}
                        type="button"
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData(
                            "application/x-site-builder-block",
                            JSON.stringify({
                              id: el.tag,
                              title: el.label,
                              sectionType: "custom",
                              config: { builderElement: el.tag, title: el.label },
                            })
                          );
                        }}
                        onClick={() => {
                          onInsertElement?.(el.tag, el.label);
                          toast.success(`✓ تمت إضافة «${el.label}»`);
                        }}
                        className="flex flex-col items-start rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-right transition hover:border-amber-400/50 hover:bg-amber-400/10 cursor-grab active:cursor-grabbing"
                      >
                        <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-400/15 text-amber-300 mb-2">
                          <Icon size={16} />
                        </span>
                        <div className="text-xs font-black text-white">{el.label}</div>
                        <div className="mt-1 text-[10px] text-slate-400 leading-tight">{el.hint}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. SECTIONS TAB */}
            {activeTab === "sections" && (
              <div className="space-y-4">
                {/* Saved Blocks */}
                {personalTemplates.length > 0 && (
                  <div>
                    <div className="text-[10px] font-black text-amber-300 mb-2">قوالبي المحفوظة (Saved Blocks):</div>
                    <div className="space-y-2">
                      {personalTemplates.map((pt) => (
                        <button
                          key={pt.id}
                          type="button"
                          onClick={() => {
                            onInsertSection?.(pt.type);
                            toast.success(`✓ تم إدراج القالب «${pt.name}»`);
                          }}
                          className="flex w-full items-center justify-between rounded-xl border border-amber-400/30 bg-amber-400/[0.06] p-3 text-right transition hover:border-amber-400 hover:bg-amber-400/15"
                        >
                          <div>
                            <div className="text-xs font-black text-white">{pt.name}</div>
                            <div className="text-[10px] text-amber-300">قالب مخصص محفوظ</div>
                          </div>
                          <Plus size={14} className="text-amber-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Templates List */}
                <div>
                  <div className="text-[10px] font-black text-slate-400 mb-2">قوالب الأقسام الجاهزة:</div>
                  <div className="space-y-2">
                    {SECTION_TEMPLATES.map((tmpl) => (
                      <button
                        key={tmpl.type}
                        type="button"
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData(
                            "application/x-site-builder-block",
                            JSON.stringify({
                              id: tmpl.type,
                              title: tmpl.title,
                              sectionType: tmpl.type,
                              config: { title: tmpl.title, subtitle: tmpl.hint },
                            })
                          );
                        }}
                        onClick={() => {
                          onInsertSection?.(tmpl.type);
                          toast.success(`✓ تمت إضافة قسم «${tmpl.title}»`);
                        }}
                        className="flex w-full items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-3.5 text-right transition hover:border-amber-400/40 hover:bg-amber-400/5 cursor-grab active:cursor-grabbing"
                      >
                        <span className="text-2xl">{tmpl.emoji}</span>
                        <div>
                          <div className="text-xs font-black text-white">{tmpl.title}</div>
                          <div className="mt-1 text-[10px] text-slate-400 leading-4">{tmpl.hint}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. SCHOOL CMS TAB */}
            {activeTab === "schoolCms" && (
              <StudioSchoolBlocks onInsertBlock={onInsertSchoolBlock} />
            )}

            {/* 4. LAYERS TREE TAB */}
            {activeTab === "layers" && (
              <div className="space-y-3">
                {/* Search Bar & Counter */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={layerSearch}
                      onChange={(e) => setLayerSearch(e.target.value)}
                      placeholder="ابحث في طبقات الصفحة..."
                      className="w-full rounded-xl border border-white/10 bg-black/40 py-2 pr-8 pl-3 text-xs text-white placeholder:text-slate-500 outline-none focus:border-amber-400/60"
                    />
                    {layerSearch && (
                      <button
                        type="button"
                        onClick={() => setLayerSearch("")}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                  <span className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-[10px] font-black text-amber-300 whitespace-nowrap">
                    {filteredLayers.length} عنصر
                  </span>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[10px]">
                  {[
                    { id: "all", label: "الكل" },
                    { id: "section", label: "الأقسام" },
                    { id: "text", label: "النصوص" },
                    { id: "image", label: "الصور" },
                    { id: "button", label: "الأزرار" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setLayerFilter(f.id as any)}
                      className={`rounded-lg px-2.5 py-1 font-bold transition whitespace-nowrap ${
                        layerFilter === f.id
                          ? "bg-amber-400 text-black shadow-sm font-black"
                          : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Layers Tree List */}
                {filteredLayers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                    <Layers3 size={32} className="mb-2 opacity-30" />
                    <p className="text-xs font-bold">لا توجد طبقات تطابق البحث</p>
                    <p className="text-[10px] text-slate-600 mt-1">تأكد من فتح صفحة تحتوي على عناصر ممسوحة</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-[calc(100vh-250px)] overflow-y-auto pr-0.5">
                    {filteredLayers.map((layer) => {
                      const isSelected = selectedLayerId === layer.id;
                      const Icon = layer.tag.includes("section")
                        ? LayoutTemplate
                        : layer.tag === "image"
                        ? ImageIcon
                        : layer.tag === "button"
                        ? Square
                        : layer.tag === "video"
                        ? Video
                        : layer.tag === "icon"
                        ? Smile
                        : Type;

                      const tagBadge = layer.tag.includes("section")
                        ? "قسم"
                        : layer.tag === "image"
                        ? "صورة"
                        : layer.tag === "button"
                        ? "زر"
                        : layer.tag === "video"
                        ? "فيديو"
                        : layer.tag === "icon"
                        ? "أيقونة"
                        : "نص";

                      return (
                        <div
                          key={layer.id}
                          onClick={() => onSelectLayer?.(layer.id)}
                          className={`group flex items-center justify-between gap-2 rounded-xl border p-2 text-right transition cursor-pointer ${
                            isSelected
                              ? "border-amber-400 bg-amber-400/15 shadow-[0_0_12px_rgba(251,191,36,0.15)] ring-1 ring-amber-400/40"
                              : "border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.05]"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span
                              className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg ${
                                isSelected
                                  ? "bg-amber-400 text-black font-black"
                                  : "bg-white/10 text-slate-300 group-hover:text-amber-300"
                              }`}
                            >
                              <Icon size={12} />
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`truncate text-xs font-bold ${
                                    isSelected ? "text-amber-200 font-black" : "text-slate-200"
                                  } ${layer.isHidden ? "line-through opacity-50" : ""}`}
                                >
                                  {layer.label || layer.id}
                                </span>
                                <span className="rounded bg-white/10 px-1 py-0.2 text-[8px] font-mono text-slate-400 shrink-0">
                                  {tagBadge}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action icons: Reorder Up/Down, Eye, Lock, Trash */}
                          <div
                            className="flex items-center gap-1 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Reorder section up / down if section */}
                            {(layer.tag.includes("section") || layer.id.startsWith("section-")) ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => onReorderSection?.(layer.id, "up")}
                                  title="تحريك القسم للأعلى"
                                  className="grid h-6 w-6 place-items-center rounded-lg text-slate-500 hover:bg-white/10 hover:text-amber-300 transition"
                                >
                                  <ChevronUp size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onReorderSection?.(layer.id, "down")}
                                  title="تحريك القسم للأسفل"
                                  className="grid h-6 w-6 place-items-center rounded-lg text-slate-500 hover:bg-white/10 hover:text-amber-300 transition"
                                >
                                  <ChevronDown size={12} />
                                </button>
                              </>
                            ) : null}

                            {/* Toggle visibility */}
                            <button
                              type="button"
                              onClick={() => onToggleLayerVisibility?.(layer.id)}
                              title={layer.isHidden ? "إظهار العنصر" : "إخفاء العنصر"}
                              className={`grid h-6 w-6 place-items-center rounded-lg transition ${
                                layer.isHidden
                                  ? "bg-amber-400/20 text-amber-300"
                                  : "text-slate-500 hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              {layer.isHidden ? <EyeOff size={12} /> : <Eye size={12} />}
                            </button>

                            {/* Toggle lock */}
                            <button
                              type="button"
                              onClick={() => onToggleLayerLock?.(layer.id)}
                              title={layer.isLocked ? "فتح قفل العنصر" : "قفل العنصر لمنع التحريك"}
                              className={`grid h-6 w-6 place-items-center rounded-lg transition ${
                                layer.isLocked
                                  ? "bg-amber-400/20 text-amber-300"
                                  : "text-slate-500 hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              {layer.isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                            </button>

                            {/* Delete layer */}
                            <button
                              type="button"
                              onClick={() => onDeleteLayer?.(layer.id)}
                              title="حذف هذا العنصر"
                              className="grid h-6 w-6 place-items-center rounded-lg text-slate-500 hover:bg-red-500/20 hover:text-red-400 transition"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 4. DESIGN TOKENS TAB */}
            {activeTab === "tokens" && (
              <VisualDesignTokensPanel open={true} onClose={() => onSelectTab(null)} />
            )}

            {/* 5. HISTORY TAB */}
            {activeTab === "history" && (
              <VisualHistoryDrawer open={true} onClose={() => onSelectTab(null)} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
