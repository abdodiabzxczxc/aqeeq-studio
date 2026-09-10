import React from "react";
import { ArrowUp, ArrowDown, GripVertical, Layers, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface SectionCommanderBarProps {
  sectionId: string;
  title: string;
  icon?: React.ReactNode;
  isEditing?: boolean;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export function SectionCommanderBar({
  sectionId,
  title,
  icon,
  isEditing = false,
  canMoveUp = true,
  canMoveDown = true,
  onMoveUp,
  onMoveDown,
}: SectionCommanderBarProps) {
  if (!isEditing) return null;

  const handleMove = (direction: "up" | "down") => {
    if (direction === "up" && onMoveUp) {
      onMoveUp();
      return;
    }
    if (direction === "down" && onMoveDown) {
      onMoveDown();
      return;
    }
    // Universal message dispatch to trigger page-level section reorder
    window.postMessage(
      {
        type: "AQEEQ_STUDIO_REORDER_SECTION_BY_ID",
        sectionId,
        direction,
      },
      "*"
    );
    toast.success(direction === "up" ? `جاري رفع «${title}» للأعلى في الصفحة` : `جاري خفض «${title}» للأسفل في الصفحة`);
  };

  return (
    <div
      data-aq-section-commander
      className="pointer-events-auto absolute top-2 right-4 z-[85] flex items-center gap-1.5 rounded-2xl border border-amber-400/40 bg-[#070b12]/95 px-3 py-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-all hover:border-amber-400 animate-in fade-in select-none"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-1.5 pl-2 border-l border-white/15">
        <span className="grid h-6 w-6 place-items-center rounded-lg bg-amber-400/15 text-amber-300 text-xs">
          {icon || <Layers size={13} />}
        </span>
        <span className="text-[11px] font-black text-white tracking-wide">
          {title}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          title="نقل القسم كاملاً للأعلى"
          disabled={!canMoveUp}
          onClick={() => handleMove("up")}
          className="flex items-center gap-1 rounded-xl bg-white/5 px-2 py-1 text-[10px] font-bold text-slate-200 hover:bg-white/15 hover:text-white disabled:opacity-25 transition"
        >
          <ArrowUp size={12} className="text-amber-300" />
          <span className="hidden sm:inline">أعلى</span>
        </button>

        <button
          type="button"
          title="نقل القسم كاملاً للأسفل"
          disabled={!canMoveDown}
          onClick={() => handleMove("down")}
          className="flex items-center gap-1 rounded-xl bg-white/5 px-2 py-1 text-[10px] font-bold text-slate-200 hover:bg-white/15 hover:text-white disabled:opacity-25 transition"
        >
          <ArrowDown size={12} className="text-amber-300" />
          <span className="hidden sm:inline">أسفل</span>
        </button>

        <div
          title="مقبض قسم هيكلي — اضغط وحرّك للتنظيم السلس"
          className="grid h-7 w-7 place-items-center rounded-xl bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 cursor-grab transition"
        >
          <GripVertical size={13} />
        </div>
      </div>
    </div>
  );
}
