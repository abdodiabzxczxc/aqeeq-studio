import { ChevronDown, ChevronUp, History, RotateCcw, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useVisualEditorState } from "./VisualEditor";

function timeAgo(dateInput: string | Date): string {
  const now = Date.now();
  const then = new Date(dateInput).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "الآن";
  if (diff < 3600) return `${Math.floor(diff / 60)} دقيقة`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ساعة`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} يوم`;
  return new Date(dateInput).toLocaleDateString("ar-SA", { day: "numeric", month: "short" });
}

type ParsedSnapshot = {
  elementTag?: string;
  contentText?: string | null;
  mediaUrl?: string | null;
  textColor?: string | null;
  bgColor?: string | null;
};

function parseSnapshot(raw: string): ParsedSnapshot {
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export default function VisualHistoryDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { selectedId, selectedLabel, pagePath, isEditing } = useVisualEditorState();
  const [expanded, setExpanded] = useState<number | null>(null);
  const utils = trpc.useUtils();

  const { data: history = [], isLoading } = trpc.visualEditor.history.useQuery(
    { pagePath: pagePath ?? "/", limit: 20 },
    { enabled: Boolean(open && pagePath && isEditing), refetchOnWindowFocus: false }
  );

  const restore = trpc.visualEditor.restore.useMutation({
    onSuccess: () => {
      toast.success("✓ تمت استعادة النسخة كمسودة");
      if (pagePath) {
        void utils.visualEditor.list.invalidate({ pagePath });
        void utils.visualEditor.history.invalidate({ pagePath });
      }
      onClose();
    },
    onError: (e) => toast.error(e.message || "تعذر استعادة النسخة"),
  });

  const elementHistory = selectedId
    ? history.filter((h) => h.elementId === selectedId)
    : history;

  if (!open) return null;

  return (
    <aside
      data-aq-editor-panel="history"
      onPointerDown={(e) => e.stopPropagation()}
      className="fixed inset-x-0 bottom-0 z-[340] flex h-[76svh] flex-col rounded-t-[1.75rem] border-t border-amber-400/25 bg-[#080808]/[0.98] text-white shadow-[0_25px_70px_rgba(0,0,0,0.85)] backdrop-blur-2xl md:inset-y-0 md:left-0 md:right-auto md:h-auto md:w-[min(400px,100vw)] md:rounded-none md:border-r"
      dir="rtl"
    >
      <header className="flex items-center justify-between border-b border-white/[0.08] px-5 pb-4 pt-5">
        <div>
          <div className="text-[10px] font-black tracking-widest text-amber-300">سجل التعديلات</div>
          <h2 className="mt-0.5 text-base font-black text-white">
            {selectedLabel ? `تاريخ: ${selectedLabel}` : "كل التعديلات"}
          </h2>
          <p className="mt-0.5 text-[10px] text-slate-500">آخر {elementHistory.length} نسخة محفوظة</p>
        </div>
        <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 transition hover:bg-white/[0.08] hover:text-white">
          <X size={18} />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-sm text-slate-500">
            <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
            جارٍ التحميل...
          </div>
        ) : elementHistory.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-xs leading-6 text-slate-500">
            <History size={28} className="mx-auto mb-3 text-slate-600" />
            لا توجد تعديلات محفوظة بعد.
            <br />
            كل مرة تحفظ تعديلاً يُضاف هنا تلقائياً.
          </div>
        ) : (
          <div className="relative">
            <div className="absolute inset-y-0 end-[1.35rem] w-px bg-gradient-to-b from-amber-400/40 via-amber-400/10 to-transparent" />
            <div className="space-y-3">
              {elementHistory.map((entry, idx) => {
                const isFirst = idx === 0;
                const isOpen = expanded === entry.id;
                const snap = parseSnapshot(entry.snapshot);

                return (
                  <div key={entry.id} className="relative flex gap-3">
                    <div className={`relative z-10 mt-2.5 h-3 w-3 shrink-0 rounded-full border-2 transition-all ${isFirst ? "border-amber-400 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,.6)]" : "border-slate-600 bg-slate-800"}`} />
                    <div className={`min-w-0 flex-1 rounded-2xl border transition-all duration-200 ${isFirst ? "border-amber-400/30 bg-amber-400/[0.06]" : "border-white/[0.08] bg-white/[0.02]"}`}>
                      <button type="button" onClick={() => setExpanded(isOpen ? null : entry.id)} className="flex w-full items-start justify-between gap-2 p-3 text-right">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            {isFirst && <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-black text-amber-950">الحالية</span>}
                            <span className="text-[10px] text-slate-400">{timeAgo(entry.createdAt)}</span>
                          </div>
                          {snap.contentText && (
                            <p className="mt-1 truncate text-xs font-bold text-slate-200">"{snap.contentText.slice(0, 60)}{snap.contentText.length > 60 ? "…" : ""}"</p>
                          )}
                          {snap.mediaUrl && !snap.contentText && (
                            <p className="mt-1 truncate text-xs text-slate-400">📷 {snap.mediaUrl.split("/").pop()}</p>
                          )}
                          <p className="mt-0.5 text-[10px] text-slate-600">{snap.elementTag || "عنصر"} · {entry.elementId.slice(0, 24)}…</p>
                        </div>
                        <span className="mt-1 shrink-0 text-slate-500">{isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
                      </button>
                      {isOpen && !isFirst && (
                        <div className="border-t border-white/[0.06] p-3">
                          {snap.mediaUrl && (
                            <img src={snap.mediaUrl} alt="معاينة" className="mb-2 h-24 w-full rounded-xl object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          )}
                          <button
                            type="button"
                            onClick={() => restore.mutate({ id: entry.id })}
                            disabled={restore.isPending}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400/90 py-2 text-xs font-black text-amber-950 transition hover:bg-amber-300 disabled:opacity-50"
                          >
                            <RotateCcw size={13} />
                            استعادة هذه النسخة
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
