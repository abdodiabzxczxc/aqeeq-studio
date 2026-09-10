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
} from "lucide-react";
import { toast } from "sonner";

export type StudioInspectorDraft = {
  contentText?: string;
  textColor?: string;
  bgColor?: string;
  fontSize?: string;
  alignment?: "right" | "center" | "left";
  linkUrl?: string;
  borderRadius?: string;
  padding?: string;
  device?: "all" | "desktop" | "mobile";
  animation?: "none" | "fade" | "rise" | "slide";
  revealOnScroll?: boolean;
  buttonHover?: "none" | "lift" | "glow" | "shimmer";
  glass?: boolean;
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
          <div className="space-y-3.5">
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
