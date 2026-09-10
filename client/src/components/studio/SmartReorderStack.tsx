import React, { useState, useEffect, useMemo } from "react";
import { Reorder, motion } from "framer-motion";
import { ArrowUp, ArrowDown, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { useVisualEditorState } from "../VisualEditor";

export interface StackItem {
  id: string;
  content: React.ReactNode;
  label?: string;
}

interface SmartReorderStackProps {
  stackId: string;
  items: StackItem[];
  className?: string;
  isEditing?: boolean;
}

const STORAGE_KEY_PREFIX = "aqeeq_stack_order_";

export function SmartReorderStack({
  stackId,
  items,
  className = "",
  isEditing = false,
}: SmartReorderStackProps) {
  const { getOverride, updateElementOverride } = useVisualEditorState();

  const overrideKey = `stack-order-${stackId}`;
  const savedOverrideOrder = getOverride?.(overrideKey)?.customCss;
  
  const initialOrder = useMemo(() => {
    try {
      if (savedOverrideOrder) {
        const parsed = JSON.parse(savedOverrideOrder);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = items.map((i) => i.id);
          const validSaved = parsed.filter((id: string) => existingIds.includes(id));
          const missing = existingIds.filter((id) => !validSaved.includes(id));
          return [...validSaved, ...missing];
        }
      }
      const local = window.localStorage.getItem(STORAGE_KEY_PREFIX + stackId);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          const existingIds = items.map((i) => i.id);
          const validSaved = parsed.filter((id: string) => existingIds.includes(id));
          const missing = existingIds.filter((id) => !validSaved.includes(id));
          return [...validSaved, ...missing];
        }
      }
    } catch {
      // ignore
    }
    return items.map((i) => i.id);
  }, [items, savedOverrideOrder, stackId]);

  const [order, setOrder] = useState<string[]>(initialOrder);
  const [activeDraggingId, setActiveDraggingId] = useState<string | null>(null);

  useEffect(() => {
    const existingIds = items.map((i) => i.id);
    setOrder((current) => {
      const filtered = current.filter((id) => existingIds.includes(id));
      const missing = existingIds.filter((id) => !filtered.includes(id));
      return [...filtered, ...missing];
    });
  }, [items]);

  const sortedItems = useMemo(() => {
    const map = new Map(items.map((i) => [i.id, i]));
    const result: StackItem[] = [];
    for (const id of order) {
      const itm = map.get(id);
      if (itm) result.push(itm);
    }
    for (const itm of items) {
      if (!order.includes(itm.id)) result.push(itm);
    }
    return result;
  }, [items, order]);

  const saveOrder = (newOrder: string[]) => {
    setOrder(newOrder);
    try {
      window.localStorage.setItem(STORAGE_KEY_PREFIX + stackId, JSON.stringify(newOrder));
      updateElementOverride?.(overrideKey, {
        customCss: JSON.stringify(newOrder),
        elementTag: "section" as any,
      });
    } catch {
      // ignore
    }
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= order.length) return;
    const next = [...order];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    saveOrder(next);
    toast.success(direction === "up" ? "تم تقديم العنصر للأعلى بسلاسة" : "تم تأخير العنصر للأسفل بسلاسة");
  };

  if (!isEditing) {
    return (
      <div className={`flex flex-col ${className}`}>
        {sortedItems.map((item) => (
          <div key={item.id}>{item.content}</div>
        ))}
      </div>
    );
  }

  return (
    <Reorder.Group
      axis="y"
      values={order}
      onReorder={saveOrder}
      className={`flex flex-col relative ${className}`}
    >
      {sortedItems.map((item, index) => {
        const isDraggingThis = activeDraggingId === item.id;
        return (
          <Reorder.Item
            key={item.id}
            value={item.id}
            onDragStart={() => setActiveDraggingId(item.id)}
            onDragEnd={() => setActiveDraggingId(null)}
            layout
            transition={{
              type: "spring",
              stiffness: 420,
              damping: 32,
              mass: 0.8,
            }}
            className={`group/stack relative transition-shadow duration-200 ${
              isDraggingThis
                ? "z-[99] ring-2 ring-amber-400 bg-[#0c121e]/90 backdrop-blur-xl rounded-2xl shadow-[0_24px_50px_rgba(0,0,0,0.65)] scale-[1.015]"
                : "hover:ring-1 hover:ring-amber-400/40 rounded-xl"
            }`}
          >
            {isDraggingThis && (
              <motion.div
                initial={{ opacity: 0, scaleX: 0.8 }}
                animate={{ opacity: 1, scaleX: 1 }}
                className="pointer-events-none absolute -top-1 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_#f8ca14]"
              />
            )}

            <div className="pointer-events-auto absolute -top-3.5 left-3 z-[85] hidden group-hover/stack:flex items-center gap-1 rounded-full border border-amber-400/40 bg-[#0a0f18]/95 px-2 py-0.5 shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95">
              <span className="text-[9px] font-black text-amber-300 px-1 border-l border-white/15">
                {item.label || "بلوك"}
              </span>
              <button
                type="button"
                title="تحريك العنصر للأعلى"
                disabled={index === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  moveItem(index, "up");
                }}
                className="grid h-5 w-5 place-items-center rounded-full text-slate-300 hover:bg-white/15 hover:text-white disabled:opacity-20 transition"
              >
                <ArrowUp size={11} />
              </button>
              <button
                type="button"
                title="تحريك العنصر للأسفل"
                disabled={index === order.length - 1}
                onClick={(e) => {
                  e.stopPropagation();
                  moveItem(index, "down");
                }}
                className="grid h-5 w-5 place-items-center rounded-full text-slate-300 hover:bg-white/15 hover:text-white disabled:opacity-20 transition"
              >
                <ArrowDown size={11} />
              </button>
              <div
                title="اضغط واسحب لإعادة الترتيب فيزيائياً"
                className="cursor-grab active:cursor-grabbing grid h-5 w-5 place-items-center text-amber-400 hover:text-amber-200"
              >
                <GripVertical size={12} />
              </div>
            </div>

            <div className="relative">
              {item.content}
            </div>

            {isDraggingThis && (
              <motion.div
                initial={{ opacity: 0, scaleX: 0.8 }}
                animate={{ opacity: 1, scaleX: 1 }}
                className="pointer-events-none absolute -bottom-1 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_#f8ca14]"
              />
            )}
          </Reorder.Item>
        );
      })}
    </Reorder.Group>
  );
}
