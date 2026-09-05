import { trpc } from "@/lib/trpc";
import { LAYER_TRASH_RETENTION_DAYS, layerTrashRemainingLabel } from "@/lib/layerTrash";
import { CalendarClock, Loader2, RotateCcw, Trash2, X } from "lucide-react";
import { toast } from "sonner";

type TrashedLayer = {
  id: number;
  label: string;
  elementTag: string;
  deletedAt: Date;
  expiresAt: Date;
};

export default function LayerTrashPanel({ open, onClose, pagePath }: { open: boolean; onClose: () => void; pagePath: string }) {
  const utils = trpc.useUtils();
  const { data: layers = [], isLoading } = trpc.visualEditor.trash.list.useQuery({ pagePath }, { enabled: open, refetchOnWindowFocus: false });
  const restore = trpc.visualEditor.trash.restore.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.visualEditor.trash.list.invalidate({ pagePath }), utils.visualEditor.list.invalidate({ pagePath }), utils.visualEditor.history.invalidate({ pagePath })]);
      toast.success("تمت استعادة الطبقة كمسودة قابلة للمراجعة");
    },
    onError: (error) => toast.error(error.message || "تعذر استعادة الطبقة"),
  });
  const remove = trpc.visualEditor.trash.remove.useMutation({
    onSuccess: () => { toast.message("حُذفت الطبقة نهائياً من السلة"); void utils.visualEditor.trash.list.invalidate({ pagePath }); },
    onError: (error) => toast.error(error.message || "تعذر الحذف النهائي"),
  });

  if (!open) return null;
  return <aside data-aq-editor-panel="trash" onPointerDown={(event) => event.stopPropagation()} className="fixed inset-x-3 bottom-3 z-[360] flex max-h-[74svh] flex-col overflow-hidden rounded-3xl border border-[#de191e]/35 bg-[#15101a]/[.98] shadow-2xl backdrop-blur-xl md:inset-y-0 md:left-0 md:right-auto md:max-h-none md:w-[min(430px,100vw)] md:rounded-none md:border-y-0 md:border-l-0 md:border-r" dir="rtl">
    <header className="flex items-start justify-between border-b border-white/[0.08] p-4"><div><div className="flex items-center gap-2 text-xs font-black text-[#de191e]"><Trash2 size={15} />سلة مهملات الطبقات</div><p className="mt-1 text-[10px] leading-5 text-slate-400">تُحفظ الطبقات لمدة {LAYER_TRASH_RETENTION_DAYS} يوماً ثم تُزال تلقائياً.</p></div><button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-white/[0.07] hover:text-white" aria-label="إغلاق سلة الطبقات"><X size={17} /></button></header>
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">{isLoading ? <div className="grid h-36 place-items-center text-slate-500"><Loader2 size={22} className="animate-spin" /></div> : (layers as TrashedLayer[]).length ? <div className="space-y-2">{(layers as TrashedLayer[]).map((layer) => <article key={layer.id} className="rounded-2xl border border-white/[0.09] bg-black/20 p-3"><div className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#de191e]/10 text-[#de191e]"><Trash2 size={15} /></span><div className="min-w-0 flex-1"><h3 className="truncate text-xs font-black text-slate-100">{layer.label}</h3><p className="mt-1 text-[10px] text-slate-500">{layer.elementTag} · حُذفت {new Date(layer.deletedAt).toLocaleDateString("ar-EG")}</p><p className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-amber-200"><CalendarClock size={12} />متبقي {layerTrashRemainingLabel(layer.expiresAt)}</p></div></div><div className="mt-3 grid grid-cols-2 gap-2"><button onClick={() => restore.mutate({ id: layer.id })} disabled={restore.isPending} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-300 px-3 py-2 text-[11px] font-black text-emerald-950 disabled:opacity-50"><RotateCcw size={13} />استعادة</button><button onClick={() => { if (window.confirm(`حذف «${layer.label}» نهائياً من السلة؟`)) remove.mutate({ id: layer.id }); }} disabled={remove.isPending} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#de191e]/30 px-3 py-2 text-[11px] font-black text-[#de191e] disabled:opacity-50"><Trash2 size={13} />حذف نهائي</button></div></article>)}</div> : <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center text-xs leading-6 text-slate-500">السلة فارغة حالياً. ستظهر هنا الطبقات التي تحفظها بعد حذفها.</div>}</div>
  </aside>;
}
