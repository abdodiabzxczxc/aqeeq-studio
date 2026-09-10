import React, { useState } from "react";
import {
  X,
  Copy,
  Trash2,
  RotateCcw,
  Check,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  Zap,
  Monitor,
  Smartphone,
  Sparkles,
  Link2,
  Type,
  Palette,
  Image as ImageIcon,
  Pin,
  Sliders,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";

export type StudioInspectorDraft = {
  contentText?: string;
  mediaUrl?: string;
  altText?: string;
  textColor?: string;
  bgColor?: string;
  fontSize?: string;
  alignment?: "right" | "center" | "left";
  linkUrl?: string;
  borderRadius?: string;
  padding?: string;
  margin?: string;
  layerOpacity?: number;
  layerZIndex?: number;
  device?: "all" | "desktop" | "mobile";
  animation?: "none" | "fade" | "rise" | "slide";
  revealOnScroll?: boolean;
  buttonHover?: "none" | "lift" | "glow" | "shimmer";
  glass?: boolean;
  isFloating?: boolean;
  floatingPin?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
};

export function StudioInspector({
  selectedElement,
  draft,
  onChangeDraft,
  onSaveDraft,
  onRestoreOrigin,
  onDuplicate,
  onDelete,
  onClose,
}: {
  selectedElement: { id: string; tag: string; label: string } | null;
  draft: StudioInspectorDraft;
  onChangeDraft: (patch: Partial<StudioInspectorDraft>) => void;
  onSaveDraft?: () => void;
  onRestoreOrigin?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const [activeSubTab, setActiveSubTab] = useState<"content" | "design" | "motion" | "responsive">("content");

  if (!selectedElement) {
    return (
      <aside
        data-aq-studio-inspector
        className="flex w-72 sm:w-80 flex-col border-r border-white/10 bg-[#07090e]/98 text-white shadow-2xl backdrop-blur-2xl p-6 items-center justify-center text-center select-none"
        dir="rtl"
      >
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/5 border border-white/10 text-slate-500 mb-3">
          <Sparkles size={20} />
        </div>
        <h4 className="text-xs font-black text-slate-300">لم يتم تحديد أي عنصر</h4>
        <p className="mt-1 text-[11px] leading-5 text-slate-500">
          انقر على أي نص أو صورة أو زر داخل الشاشة لتعديل خصائصه ومظهره هنا مباشرة.
        </p>
      </aside>
    );
  }

  return (
    <aside
      data-aq-studio-inspector
      className="flex w-80 sm:w-88 flex-col border-r border-white/10 bg-[#07090e]/98 text-white shadow-2xl backdrop-blur-2xl select-none"
      dir="rtl"
    >
      {/* ── Header: Element Label, Duplicate, Delete, Close ──────── */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-black/40">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[9px] font-black text-amber-300">
              {selectedElement.tag}
            </span>
            <span className="truncate text-xs font-black text-white">{selectedElement.label}</span>
          </div>
          <div className="text-[9px] font-mono text-slate-500 truncate mt-0.5">{selectedElement.id}</div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onDuplicate}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-sky-300 transition"
            title="تكرار العنصر (Duplicate)"
          >
            <Copy size={15} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-500/20 transition"
            title="حذف العنصر (Delete)"
          >
            <Trash2 size={15} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
            title="إلغاء التحديد"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* ── Subtabs Navigation ──────────────────────────────────── */}
      <div className="grid grid-cols-4 border-b border-white/10 bg-black/20 p-1 text-[10px] font-black">
        {[
          { id: "content" as const, label: "محتوى", icon: Type },
          { id: "design" as const, label: "مظهر", icon: Palette },
          { id: "motion" as const, label: "حركة", icon: Zap },
          { id: "responsive" as const, label: "تجاوب", icon: Monitor },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex flex-col items-center gap-1 rounded-xl py-2 transition ${
                isActive
                  ? "bg-amber-400 text-black font-black shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Scrollable Tab Content ──────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: CONTENT */}
        {activeSubTab === "content" && (
          <div className="space-y-3.5">
            {/* Image Media Controls */}
            {selectedElement.tag === "image" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                    <ImageIcon size={13} className="text-amber-400" />
                    <span>رابط الصورة (Image URL):</span>
                  </label>
                  <input
                    type="text"
                    value={draft.mediaUrl ?? ""}
                    onChange={(e) => onChangeDraft({ mediaUrl: e.target.value })}
                    placeholder="https://... أو /manus-storage/..."
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-amber-400 font-mono"
                    dir="ltr"
                  />
                </div>
                {draft.mediaUrl && (
                  <div className="rounded-xl border border-white/10 overflow-hidden bg-black/30 p-2 flex items-center justify-center">
                    <img src={draft.mediaUrl} alt="معاينة الصورة" className="max-h-28 rounded-lg object-contain" />
                  </div>
                )}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1.5">النص البديل (Alt text):</label>
                  <input
                    type="text"
                    value={draft.altText ?? ""}
                    onChange={(e) => onChangeDraft({ altText: e.target.value })}
                    placeholder="وصف محتوى الصورة..."
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            )}

            {/* Text Content */}
            {selectedElement.tag !== "image" && selectedElement.tag !== "video" && (
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5">محتوى النص:</label>
                <textarea
                  value={draft.contentText ?? ""}
                  onChange={(e) => onChangeDraft({ contentText: e.target.value })}
                  placeholder="اكتب النص هنا..."
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-xs leading-5 text-white outline-none focus:border-amber-400 min-h-[90px]"
                />
              </div>
            )}

            {/* Link URL */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                <Link2 size={13} className="text-amber-400" />
                <span>رابط التوجيه (URL):</span>
              </label>
              <input
                type="text"
                value={draft.linkUrl ?? ""}
                onChange={(e) => onChangeDraft({ linkUrl: e.target.value })}
                placeholder="https://... أو /admissions"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
                dir="ltr"
              />
            </div>

            {/* Alignment */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1.5">محاذاة النص:</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { value: "right" as const, label: "يمين", icon: AlignRight },
                  { value: "center" as const, label: "وسط", icon: AlignCenter },
                  { value: "left" as const, label: "يسار", icon: AlignLeft },
                ].map((al) => {
                  const Icon = al.icon;
                  return (
                    <button
                      key={al.value}
                      type="button"
                      onClick={() => onChangeDraft({ alignment: al.value })}
                      className={`flex items-center justify-center gap-1 rounded-xl border p-2 text-xs font-bold transition ${
                        (draft.alignment ?? "right") === al.value
                          ? "border-amber-400 bg-amber-400/15 text-amber-300 shadow"
                          : "border-white/10 bg-black/30 text-slate-400 hover:text-white"
                      }`}
                    >
                      <Icon size={14} />
                      <span>{al.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DESIGN */}
        {activeSubTab === "design" && (
          <div className="space-y-3.5">
            {/* Font Size Preset Buttons */}
            {selectedElement.tag !== "image" && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5">حجم الخط (Font Size):</label>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { label: "صغير", size: "13px" },
                    { label: "عادي", size: "16px" },
                    { label: "متوسط", size: "20px" },
                    { label: "كبير", size: "28px" },
                    { label: "ضخم", size: "38px" },
                    { label: "عملاق", size: "52px" },
                  ].map((fs) => (
                    <button
                      key={fs.size}
                      type="button"
                      onClick={() => onChangeDraft({ fontSize: fs.size })}
                      className={`rounded-lg border px-2 py-1 text-[10px] font-bold transition ${
                        draft.fontSize === fs.size
                          ? "border-amber-400 bg-amber-400/20 text-amber-300"
                          : "border-white/10 bg-black/30 text-slate-400 hover:text-white"
                      }`}
                    >
                      {fs.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Border Radius */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1.5">استدارة الحواف (Border Radius):</label>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { label: "حادة", rad: "0px" },
                  { label: "خفيفة", rad: "8px" },
                  { label: "دائرية", rad: "16px" },
                  { label: "كبسولة", rad: "9999px" },
                ].map((b) => (
                  <button
                    key={b.rad}
                    type="button"
                    onClick={() => onChangeDraft({ borderRadius: b.rad })}
                    className={`rounded-lg border px-2 py-1 text-[10px] font-bold transition ${
                      draft.borderRadius === b.rad
                        ? "border-amber-400 bg-amber-400/20 text-amber-300"
                        : "border-white/10 bg-black/30 text-slate-400 hover:text-white"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Box Model Diagram */}
            <div className="rounded-2xl border border-white/10 bg-black/40 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-amber-300">مخطط المسافات (Box Model)</span>
                <span className="text-[9px] text-slate-500 font-mono">Margin · Padding</span>
              </div>
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-2 text-center text-[9px] text-amber-400 font-mono">
                <div className="flex justify-between items-center px-1 mb-1">
                  <span>MARGIN</span>
                  <input
                    type="text"
                    placeholder="0px"
                    value={draft.margin ?? ""}
                    onChange={(e) => onChangeDraft({ margin: e.target.value })}
                    className="w-24 rounded bg-black/50 border border-white/10 px-1.5 py-0.5 text-center text-[10px] text-white outline-none focus:border-amber-400"
                    dir="ltr"
                  />
                </div>
                <div className="rounded-lg border border-sky-500/30 bg-sky-500/5 p-2 text-sky-400">
                  <div className="flex justify-between items-center px-1 mb-1">
                    <span>PADDING</span>
                    <input
                      type="text"
                      placeholder="0px"
                      value={draft.padding ?? ""}
                      onChange={(e) => onChangeDraft({ padding: e.target.value })}
                      className="w-24 rounded bg-black/50 border border-white/10 px-1.5 py-0.5 text-center text-[10px] text-white outline-none focus:border-sky-400"
                      dir="ltr"
                    />
                  </div>
                  <div className="rounded border border-dashed border-white/20 bg-white/5 py-2 text-center text-[10px] text-white font-bold truncate">
                    {selectedElement.label} ({selectedElement.tag})
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-1 pt-1">
                {[
                  { label: "بدون", val: "0px" },
                  { label: "خفيف", val: "8px 14px" },
                  { label: "متوسط", val: "16px 24px" },
                  { label: "كبير", val: "28px 36px" },
                ].map((pad) => (
                  <button
                    key={pad.label}
                    type="button"
                    onClick={() => onChangeDraft({ padding: pad.val })}
                    className={`rounded-lg border px-1.5 py-1 text-[9px] font-bold transition ${
                      draft.padding === pad.val
                        ? "border-sky-400 bg-sky-400/20 text-sky-300"
                        : "border-white/10 bg-black/30 text-slate-400 hover:text-white"
                    }`}
                  >
                    {pad.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">لون النص:</label>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 p-1.5">
                  <input
                    type="color"
                    value={draft.textColor ?? "#ffffff"}
                    onChange={(e) => onChangeDraft({ textColor: e.target.value })}
                    className="h-6 w-6 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                  />
                  <span className="text-[10px] font-mono text-slate-300">{draft.textColor || "#ffffff"}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">لون الخلفية:</label>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 p-1.5">
                  <input
                    type="color"
                    value={draft.bgColor ?? "#000000"}
                    onChange={(e) => onChangeDraft({ bgColor: e.target.value })}
                    className="h-6 w-6 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                  />
                  <span className="text-[10px] font-mono text-slate-300">{draft.bgColor || "شفاف"}</span>
                </div>
              </div>
            </div>

            {/* Quick Palette Swatches */}
            <div>
              <div className="text-[10px] font-bold text-slate-400 mb-1.5">ألوان هوية العقيق السريعة:</div>
              <div className="flex items-center gap-2">
                {[
                  { color: "#085187", name: "أزرق ملكي" },
                  { color: "#ab1d22", name: "أحمر العقيق" },
                  { color: "#d9bd26", name: "ذهبي" },
                  { color: "#155439", name: "أخضر" },
                  { color: "#ffffff", name: "أبيض" },
                  { color: "#000000", name: "أسود" },
                ].map((s) => (
                  <button
                    key={s.color}
                    type="button"
                    onClick={() => onChangeDraft({ textColor: s.color })}
                    className="h-6 w-6 rounded-full border border-white/20 transition hover:scale-110"
                    style={{ backgroundColor: s.color }}
                    title={s.name}
                  />
                ))}
              </div>
            </div>

            {/* Glassmorphism Toggle */}
            <button
              type="button"
              onClick={() => onChangeDraft({ glass: !draft.glass })}
              className={`flex w-full items-center justify-between rounded-xl border p-3 transition ${
                draft.glass
                  ? "border-amber-400/50 bg-amber-400/10 text-amber-200"
                  : "border-white/10 bg-white/[0.02] text-slate-400 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-amber-400" />
                <span className="text-xs font-black">تأثير زجاجي فاخر (Glassmorphism)</span>
              </div>
              <span className={`h-4 w-7 rounded-full transition-colors ${draft.glass ? "bg-amber-400" : "bg-slate-700"}`}>
                <span className={`mt-0.5 block h-3 w-3 rounded-full bg-white transition-transform ${draft.glass ? "translate-x-3.5 ms-0.5" : "translate-x-0.5"}`} />
              </span>
            </button>
          </div>
        )}

        {/* TAB 3: MOTION */}
        {activeSubTab === "motion" && (
          <div className="space-y-3.5">
            {/* Scroll Reveal */}
            <button
              type="button"
              onClick={() => onChangeDraft({ revealOnScroll: !draft.revealOnScroll })}
              className={`flex w-full items-center justify-between rounded-xl border p-3 transition ${
                draft.revealOnScroll
                  ? "border-violet-400/50 bg-violet-400/10 text-violet-200"
                  : "border-white/10 bg-white/[0.02] text-slate-400 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <Eye size={14} className="text-violet-400" />
                <span className="text-xs font-black">ظهور عند التمرير (Scroll Reveal)</span>
              </div>
              <span className={`h-4 w-7 rounded-full transition-colors ${draft.revealOnScroll ? "bg-violet-400" : "bg-slate-700"}`}>
                <span className={`mt-0.5 block h-3 w-3 rounded-full bg-white transition-transform ${draft.revealOnScroll ? "translate-x-3.5 ms-0.5" : "translate-x-0.5"}`} />
              </span>
            </button>

            {/* Entrance Animation */}
            <div>
              <div className="text-[10px] font-bold text-slate-400 mb-1.5">نوع حركة الدخول:</div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { value: "none" as const, label: "بدون", emoji: "⏹️" },
                  { value: "fade" as const, label: "تلاشي", emoji: "🌫️" },
                  { value: "rise" as const, label: "صعود", emoji: "⬆️" },
                  { value: "slide" as const, label: "انزلاق", emoji: "➡️" },
                ].map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => onChangeDraft({ animation: m.value })}
                    className={`flex flex-col items-center gap-0.5 rounded-xl border py-2 text-[10px] font-bold transition ${
                      (draft.animation ?? "none") === m.value
                        ? "border-violet-400 bg-violet-400/15 text-violet-200 shadow"
                        : "border-white/10 bg-black/30 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>{m.emoji}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Hover Effects */}
            <div>
              <div className="text-[10px] font-bold text-slate-400 mb-1.5">تأثير عند التمرير بالماوس (Hover):</div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { value: "none" as const, label: "بدون", emoji: "–" },
                  { value: "lift" as const, label: "ارتفاع", emoji: "🚀" },
                  { value: "glow" as const, label: "توهج", emoji: "✨" },
                  { value: "shimmer" as const, label: "بريق", emoji: "💫" },
                ].map((h) => (
                  <button
                    key={h.value}
                    type="button"
                    onClick={() => onChangeDraft({ buttonHover: h.value })}
                    className={`flex flex-col items-center gap-0.5 rounded-xl border py-2 text-[10px] font-bold transition ${
                      (draft.buttonHover ?? "none") === h.value
                        ? "border-violet-400 bg-violet-400/15 text-violet-200 shadow"
                        : "border-white/10 bg-black/30 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>{h.emoji}</span>
                    <span>{h.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RESPONSIVE */}
        {activeSubTab === "responsive" && (
          <div className="space-y-4">
            {/* Layout Mode: Smart Flow vs Floating Pin */}
            <div className="rounded-2xl border border-white/10 bg-black/40 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-amber-300 flex items-center gap-1.5">
                  <Sliders size={12} />
                  <span>نمط التموضع والتنسيق</span>
                </span>
                <span
                  className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                    draft.isFloating
                      ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                      : "bg-sky-400/20 text-sky-300 border border-sky-400/30"
                  }`}
                >
                  {draft.isFloating ? "عنصر عائم حر" : "تدفق متجاوب ذكي"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => onChangeDraft({ isFloating: false })}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-black transition ${
                    !draft.isFloating
                      ? "border-sky-400 bg-sky-400/20 text-sky-200 shadow"
                      : "border-white/10 bg-black/30 text-slate-400 hover:text-white"
                  }`}
                >
                  <span>تدفق متجاوب</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChangeDraft({ isFloating: true })}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-black transition ${
                    draft.isFloating
                      ? "border-amber-400 bg-amber-400/20 text-amber-300 shadow"
                      : "border-white/10 bg-black/30 text-slate-400 hover:text-white"
                  }`}
                >
                  <Pin size={12} className="rotate-45" />
                  <span>عائم حر (Pin)</span>
                </button>
              </div>
              <p className="text-[9px] leading-4 text-slate-400">
                {!draft.isFloating
                  ? "✓ التدفق الذكي يضمن تناسق العنصر تلقائياً على كل الشاشات دون تداخل أو خروج عن الإطار."
                  : "⚡ الوضع العائم يسمح بتحريك العنصر بحرية كاملة بالبكسل مع طبقة z-index عليا (مناسب للشارات والملصقات)."}
              </p>
            </div>

            <div className="text-[10px] font-bold text-slate-400 mb-1.5">الظهور بحسب نوع الجهاز:</div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { value: "all" as const, label: "الكل", icon: Monitor, sub: "كمبيوتر + هاتف" },
                { value: "desktop" as const, label: "كمبيوتر فقط", icon: Monitor, sub: "يُخفى على الهاتف" },
                { value: "mobile" as const, label: "هاتف فقط", icon: Smartphone, sub: "يُخفى على الكمبيوتر" },
              ].map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChangeDraft({ device: opt.value })}
                    className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-center text-[10px] font-bold transition ${
                      (draft.device ?? "all") === opt.value
                        ? "border-sky-400 bg-sky-400/15 text-sky-200 shadow"
                        : "border-white/10 bg-black/30 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Icon size={14} />
                    <span className="leading-tight">{opt.label}</span>
                  </button>
                );
              })}
            </div>
            {(draft.device ?? "all") !== "all" && (
              <p className="rounded-xl bg-sky-400/10 border border-sky-400/20 p-2.5 text-[10px] leading-4 text-sky-300">
                {draft.device === "desktop"
                  ? "🖥️ سيظهر هذا العنصر على شاشات الكمبيوتر فقط وسيُخفى تلقائياً على شاشات الهواتف."
                  : "📱 سيظهر هذا العنصر على شاشات الهواتف الذكية فقط وسيُخفى تلقائياً على شاشات الكمبيوتر."}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Footer Actions ──────────────────────────────────────── */}
      <div className="border-t border-white/10 bg-black/40 p-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onRestoreOrigin}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 transition"
          >
            <RotateCcw size={14} />
            <span>استعادة الأصل</span>
          </button>
          <button
            type="button"
            onClick={onSaveDraft}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-400 py-2 text-xs font-black text-amber-950 hover:bg-amber-300 transition shadow"
          >
            <Check size={15} />
            <span>حفظ كمسودة</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
