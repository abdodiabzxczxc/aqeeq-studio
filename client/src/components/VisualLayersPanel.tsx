import { ArrowDownToLine, ArrowUpToLine, Eye, EyeOff, Layers3, Lock, Search, Trash2, Unlock, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { isBackgroundLayer } from "@/lib/layerBackground";
import { orderVisualLayerTree } from "@/lib/visualLayerTree";
import { useVisualEditorState } from "./VisualEditor";

type Layer = { id: string; label: string; tag: "text" | "button" | "section" | "image" | "video" | "section-block"; parentId?: string; depth: number };

const typeLabel: Record<Layer["tag"], string> = { text: "نص", button: "زر", section: "قسم", image: "صورة", video: "فيديو", "section-block": "قسم" };

export default function VisualLayersPanel({ open, onClose, onOpenTrash }: { open: boolean; onClose: () => void; onOpenTrash: () => void }) {
  const { isEditing, selectedId, select, getOverride, saveLayer, deleteLayer } = useVisualEditorState();
  const [layers, setLayers] = useState<Layer[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | Layer["tag"]>("all");

  useEffect(() => {
    if (!open || !isEditing) return;
    const collect = () => {
      const unique = new Map<string, Layer>();
      document.querySelectorAll<HTMLElement>("[data-visual-id]").forEach((node) => {
        const id = node.dataset.visualId;
        const label = node.dataset.visualLabel;
        const tag = node.dataset.visualTag as Layer["tag"] | undefined;
        const parentId = node.parentElement?.closest<HTMLElement>("[data-visual-id]")?.dataset.visualId;
        if (id && label && tag && !unique.has(id)) {
          unique.set(id, { id, label, tag, parentId: parentId && parentId !== id ? parentId : undefined, depth: 0 });
        }
      });
      setLayers(orderVisualLayerTree(Array.from(unique.values())));
    };
    collect();
    const observer = new MutationObserver(collect);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-visual-id", "data-visual-label", "data-visual-tag"] });
    return () => observer.disconnect();
  }, [open, isEditing]);

  const visibleLayers = useMemo(
    () =>
      layers.filter(
        (layer) =>
          (category === "all" || layer.tag === category) &&
          `${layer.label} ${layer.id}`.toLowerCase().includes(query.trim().toLowerCase())
      ),
    [layers, query, category]
  );

  const patchLayer = (layer: Layer, patch: Partial<Parameters<typeof saveLayer>[1]>) => {
    const current = getOverride(layer.id);
    const requestedZIndex = patch.layerZIndex ?? current?.layerZIndex ?? 0;
    const layerZIndex = isBackgroundLayer(layer.id, layer.label) ? Math.max(0, requestedZIndex) : requestedZIndex;
    saveLayer(layer.id, {
      layerX: current?.layerX ?? 0,
      layerY: current?.layerY ?? 0,
      layerWidth: current?.layerWidth ?? null,
      layerHeight: current?.layerHeight ?? null,
      layerOpacity: current?.layerOpacity ?? 100,
      isLocked: current?.isLocked ?? false,
      isHidden: current?.isHidden ?? false,
      ...patch,
      layerZIndex,
    });
  };

  if (!open) return null;

  return (
    <aside
      data-aq-editor-panel="layers"
      onPointerDown={(event) => event.stopPropagation()}
      className="fixed inset-x-0 bottom-0 z-[340] flex h-[76svh] flex-col rounded-t-[1.75rem] border-t border-amber-400/25 bg-[#080808]/[0.98] text-white shadow-[0_25px_70px_rgba(0,0,0,0.85)] backdrop-blur-2xl md:inset-y-0 md:left-0 md:right-auto md:h-auto md:w-[min(400px,100vw)] md:rounded-none md:border-r"
      dir="rtl"
    >
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/[0.08] px-5 pb-4 pt-5">
        <div>
          <div className="text-[10px] font-black tracking-widest text-amber-300">طبقات الصفحة</div>
          <h2 className="mt-0.5 text-base font-black text-white">ترتيب وتنظيم العناصر</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
            title="إغلاق"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* Search & Filter */}
      <div className="border-b border-white/[0.08] p-4 space-y-3">
        <label className="flex items-center gap-2.5 rounded-xl border border-white/[0.12] bg-white/[0.03] px-3.5 py-2.5 text-slate-400 focus-within:border-amber-400/60 focus-within:bg-black/40">
          <Search size={15} className="text-amber-400/70 shrink-0" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث في الطبقات..."
            className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-slate-500"
          />
        </label>

        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {(["all", "text", "image", "button", "section", "video"] as const).map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-black transition duration-200 ${
                category === item
                  ? "bg-amber-300 text-slate-950 shadow-[0_0_10px_rgba(229,184,79,0.3)]"
                  : "border border-white/[0.08] bg-white/[0.02] text-slate-400 hover:text-slate-200"
              }`}
            >
              {item === "all" ? "الكل" : typeLabel[item]}
            </button>
          ))}
        </div>
      </div>

      {/* Layer List */}
      <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-2">
        <div className="flex items-center justify-between px-1 text-[10px] font-bold text-slate-500">
          <span>{visibleLayers.length} عنصر</span>
          <span>{category === "all" ? "شجرة الصفحة الكاملة" : typeLabel[category]}</span>
        </div>

        {visibleLayers.length ? (
          <div className="space-y-2">
            {visibleLayers.map((layer) => {
              const override = getOverride(layer.id);
              const isSelected = selectedId === layer.id;
              return (
                <div
                  key={layer.id}
                  style={{ marginInlineStart: `${Math.min(layer.depth, 4) * 12}px` }}
                  className={`group rounded-xl border transition-all duration-200 ${
                    isSelected
                      ? "border-amber-400/60 bg-amber-400/[0.08] shadow-[0_0_16px_rgba(229,184,79,0.12)]"
                      : "border-white/[0.08] bg-white/[0.02] hover:border-amber-400/30 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center justify-between p-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (!override?.isLocked) {
                          select(layer.id, layer.tag, layer.label);
                          document.querySelector(`[data-visual-id="${CSS.escape(layer.id)}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                        }
                      }}
                      className={`flex min-w-0 flex-1 items-center gap-2.5 text-right ${
                        override?.isLocked ? "cursor-not-allowed opacity-60" : ""
                      }`}
                    >
                      <span
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${
                          isSelected ? "bg-amber-300 text-slate-950" : "bg-white/[0.06] text-amber-300"
                        }`}
                      >
                        {override?.isLocked ? <Lock size={13} /> : <Layers3 size={13} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-black text-slate-100">{layer.label}</span>
                        <span className="block text-[10px] text-slate-500">
                          {typeLabel[layer.tag]} · مستوى {override?.layerZIndex ?? 0}
                        </span>
                      </div>
                    </button>

                    {/* Quick controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => patchLayer(layer, { isLocked: !(override?.isLocked ?? false) })}
                        className={`grid h-7 w-7 place-items-center rounded-lg transition ${
                          override?.isLocked ? "bg-rose-500/20 text-rose-300" : "text-slate-400 hover:bg-white/[0.08] hover:text-white"
                        }`}
                        title={override?.isLocked ? "إلغاء القفل" : "قفل"}
                      >
                        {override?.isLocked ? <Unlock size={12} /> : <Lock size={12} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => patchLayer(layer, { isHidden: !(override?.isHidden ?? false) })}
                        className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
                        title="إظهار / إخفاء"
                      >
                        {override?.isHidden ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => patchLayer(layer, { layerZIndex: (override?.layerZIndex ?? 0) + 1 })}
                        className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
                        title="تقديم للأمام"
                      >
                        <ArrowUpToLine size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => patchLayer(layer, { layerZIndex: (override?.layerZIndex ?? 0) - 1 })}
                        className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
                        title="تأخير للخلف"
                      >
                        <ArrowDownToLine size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteLayer(layer.id, layer.label)}
                        disabled={Boolean(override?.isLocked)}
                        className="grid h-7 w-7 place-items-center rounded-lg text-rose-400 transition hover:bg-rose-500/20 hover:text-rose-200 disabled:opacity-30"
                        title="حذف"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-xs leading-6 text-slate-500">
            لا توجد عناصر مطابقة لبحثك.
          </div>
        )}
      </div>
    </aside>
  );
}
