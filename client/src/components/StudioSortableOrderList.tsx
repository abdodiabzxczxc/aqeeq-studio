import { DndContext, DragEndEvent, DragOverlay, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { ReactNode, useEffect, useMemo, useState } from "react";

export type StudioSortableItem = { id: number; label: string; imageUrl: string; note?: string };

function SortableRow({ item, selected, onSelect, renderActions }: { item: StudioSortableItem; selected?: boolean; onSelect?: (id: number) => void; renderActions?: (item: StudioSortableItem) => ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  return <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`flex items-center gap-2 rounded-xl border p-2 transition ${isDragging ? "opacity-30" : ""} ${selected ? "border-amber-300/65 bg-amber-300/[.08]" : "border-white/[.08] bg-black/15"}`}>
    <button ref={setActivatorNodeRef} {...attributes} {...listeners} type="button" aria-label={`اسحب لترتيب ${item.label}`} title="اسحب لإعادة الترتيب" className="touch-none cursor-grab rounded-lg border border-slate-700 bg-black/20 p-1.5 text-slate-400 active:cursor-grabbing"><GripVertical size={15} /></button>
    <button type="button" onClick={() => onSelect?.(item.id)} className="flex min-w-0 flex-1 items-center gap-2 text-right"><img src={item.imageUrl} alt="" className="h-10 w-10 rounded-lg border border-white/10 object-cover" /><span className="min-w-0"><span className="block truncate text-[10px] font-black text-slate-100">{item.label}</span>{item.note ? <span className="mt-0.5 block truncate text-[9px] text-slate-500">{item.note}</span> : null}</span></button>
    {renderActions ? <div className="shrink-0">{renderActions(item)}</div> : null}
  </div>;
}

function DragCard({ item }: { item: StudioSortableItem }) {
  return <div className="flex w-[min(340px,82vw)] items-center gap-2 rounded-xl border border-amber-300 bg-[#151923] p-2 shadow-2xl" dir="rtl"><GripVertical size={16} className="text-amber-300" /><img src={item.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" /><span className="truncate text-xs font-black text-amber-50">{item.label}</span></div>;
}

export default function StudioSortableOrderList({ items, selectedId, onSelect, onReorder, renderActions }: { items: StudioSortableItem[]; selectedId?: number | null; onSelect?: (id: number) => void; onReorder: (ids: number[]) => void; renderActions?: (item: StudioSortableItem) => ReactNode }) {
  const [orderedIds, setOrderedIds] = useState<number[]>(items.map((item) => item.id));
  const [activeId, setActiveId] = useState<number | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 7 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const fingerprint = items.map((item) => item.id).join(":");
  useEffect(() => { setOrderedIds(items.map((item) => item.id)); }, [fingerprint]);
  const orderedItems = useMemo(() => { const records = new Map(items.map((item) => [item.id, item])); return orderedIds.map((id) => records.get(id)).filter((item): item is StudioSortableItem => Boolean(item)); }, [items, orderedIds]);
  const activeItem = orderedItems.find((item) => item.id === activeId) ?? null;
  const onDragEnd = (event: DragEndEvent) => { const active = Number(event.active.id); const over = event.over ? Number(event.over.id) : null; setActiveId(null); if (!over || active === over) return; const oldIndex = orderedIds.indexOf(active); const newIndex = orderedIds.indexOf(over); if (oldIndex < 0 || newIndex < 0) return; const next = arrayMove(orderedIds, oldIndex, newIndex); setOrderedIds(next); onReorder(next); };
  if (!items.length) return <p className="rounded-xl border border-dashed border-slate-700 p-4 text-center text-[10px] leading-5 text-slate-500">أضف محتوى أولاً، ثم اسحبه من المقبض لترتيبه.</p>;
  return <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={(event) => setActiveId(Number(event.active.id))} onDragCancel={() => setActiveId(null)} onDragEnd={onDragEnd}><SortableContext items={orderedIds} strategy={verticalListSortingStrategy}><div className="space-y-2">{orderedItems.map((item) => <SortableRow key={item.id} item={item} selected={selectedId === item.id} onSelect={onSelect} renderActions={renderActions} />)}</div></SortableContext><DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }}>{activeItem ? <DragCard item={activeItem} /> : null}</DragOverlay></DndContext>;
}
