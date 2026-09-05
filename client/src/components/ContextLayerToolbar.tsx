import { AlignCenter, ArrowDownToLine, ArrowUpToLine, Copy, Palette, Sparkles, Trash2 } from "lucide-react";

type ContextDraft = {
  textColor: string;
  bgColor: string;
  fontSize: string;
  borderRadius: string;
  padding: string;
  layerOpacity: number;
  layerZIndex: number;
  alignment: "start" | "center" | "end" | "stretch";
};

type LayerTag = "text" | "button" | "section" | "image" | "video" | "icon" | "section-block";

export default function ContextLayerToolbar({ label, tag, draft, onDraftChange, onOpenEffects, onDuplicate, onDelete }: {
  label: string;
  tag: LayerTag;
  draft: ContextDraft;
  onDraftChange: (patch: Partial<ContextDraft>) => void;
  onOpenEffects: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const isTextual = tag === "text" || tag === "button";
  const colors = {
    text: /^#[0-9a-f]{6}$/i.test(draft.textColor) ? draft.textColor : "#ffffff",
    background: /^#[0-9a-f]{6}$/i.test(draft.bgColor) ? draft.bgColor : "#e5b84f",
  };

  return (
    <section className="border-b border-white/[0.08] bg-black/15 px-3 pb-3 pt-2" dir="rtl" aria-label="التحكم المباشر بالطبقة">
      <header className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-black text-[#f8ca14]">٢. عدّل العنصر المحدد</div>
          <div className="mt-0.5 truncate text-[9px] font-bold text-slate-500">{label} · كل تغيير يظهر كمسودة فوراً</div>
        </div>
        <span className="rounded-full border border-white/[0.1] px-2 py-1 text-[9px] font-black text-slate-400">{isTextual ? "نص أو زر" : "وسيط أو شكل"}</span>
      </header>

      <div className="mt-2 grid grid-cols-4 gap-1.5 sm:grid-cols-8">
        {isTextual ? <label className="relative grid h-9 place-items-center rounded-xl border border-white/[0.1] bg-[#101520] text-amber-200" title="لون النص"><Palette size={14} /><input type="color" value={colors.text} onChange={(event) => onDraftChange({ textColor: event.target.value })} className="absolute inset-0 cursor-pointer opacity-0" /></label> : null}
        <label className="relative grid h-9 place-items-center rounded-xl border border-white/[0.1] bg-[#101520] text-[#f8ca14]" title="لون الخلفية"><span className="h-3.5 w-3.5 rounded border border-white/35" style={{ background: colors.background }} /><input type="color" value={colors.background} onChange={(event) => onDraftChange({ bgColor: event.target.value })} className="absolute inset-0 cursor-pointer opacity-0" /></label>
        <button onClick={() => onDraftChange({ alignment: "center" })} title="توسيط المحتوى" className={`grid h-9 place-items-center rounded-xl border ${draft.alignment === "center" ? "border-amber-300 bg-amber-300 text-amber-950" : "border-white/[0.1] bg-[#101520] text-slate-200"}`}><AlignCenter size={15} /></button>
        <button onClick={() => onDraftChange({ layerZIndex: draft.layerZIndex + 1 })} title="إلى الأمام" className="grid h-9 place-items-center rounded-xl border border-white/[0.1] bg-[#101520] text-slate-200 hover:border-[#08467d] hover:text-[#f8ca14]"><ArrowUpToLine size={15} /></button>
        <button onClick={() => onDraftChange({ layerZIndex: draft.layerZIndex - 1 })} title="إلى الخلف" className="grid h-9 place-items-center rounded-xl border border-white/[0.1] bg-[#101520] text-slate-200 hover:border-[#08467d] hover:text-[#f8ca14]"><ArrowDownToLine size={15} /></button>
        <button onClick={onOpenEffects} title="تأثيرات الطبقة" className="grid h-9 place-items-center rounded-xl border border-[#f8ca14]/35 bg-[#f8ca14]/10 text-[#f8ca14] hover:bg-[#f8ca14] hover:text-black"><Sparkles size={15} /></button>
        <button onClick={onDuplicate} title="تكرار الطبقة" className="grid h-9 place-items-center rounded-xl border border-emerald-300/35 bg-emerald-300/10 text-emerald-100 hover:bg-emerald-300 hover:text-emerald-950"><Copy size={15} /></button>
        <button onClick={onDelete} title="نقل إلى السلة" className="grid h-9 place-items-center rounded-xl border border-[#de191e]/35 bg-[#de191e]/10 text-[#de191e] hover:bg-[#de191e] hover:text-white"><Trash2 size={15} /></button>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        {isTextual ? <div className="rounded-xl border border-white/[0.08] bg-[#101520] p-1"><div className="px-2 pt-1 text-[9px] font-bold text-slate-500">حجم النص</div><div className="mt-1 grid grid-cols-3 gap-1">{[{ label: "صغير", value: "0.9rem" }, { label: "وسط", value: "1.35rem" }, { label: "كبير", value: "2.4rem" }].map((size) => <button key={size.value} onClick={() => onDraftChange({ fontSize: size.value })} className={`rounded-lg py-1.5 text-[9px] font-black ${draft.fontSize === size.value ? "bg-amber-300 text-amber-950" : "text-slate-300 hover:bg-white/[0.07]"}`}>{size.label}</button>)}</div></div> : <div className="rounded-xl border border-white/[0.08] bg-[#101520] px-3 py-2 text-[10px] font-bold text-slate-500">غيّر حجم هذه الطبقة من مقابض السحب فوق الصفحة.</div>}
        <div className="rounded-xl border border-white/[0.08] bg-[#101520] p-1"><div className="px-2 pt-1 text-[9px] font-bold text-slate-500">حواف العنصر</div><div className="mt-1 grid grid-cols-3 gap-1">{[{ label: "حاد", value: "0" }, { label: "ناعم", value: "16px" }, { label: "كبسولة", value: "999px" }].map((radius) => <button key={radius.value} onClick={() => onDraftChange({ borderRadius: radius.value })} className={`rounded-lg py-1.5 text-[9px] font-black ${draft.borderRadius === radius.value ? "bg-[#08467d] text-white" : "text-slate-300 hover:bg-white/[0.07]"}`}>{radius.label}</button>)}</div></div>
      </div>

      <label className="mt-2 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#101520] px-3 py-2 text-[10px] font-bold text-slate-400">شفافية الطبقة <input type="range" min="0" max="100" value={draft.layerOpacity} onChange={(event) => onDraftChange({ layerOpacity: Number(event.target.value) })} className="min-w-0 flex-1 accent-amber-300" /><span className="w-8 text-left text-amber-100">{draft.layerOpacity}%</span></label>
    </section>
  );
}
