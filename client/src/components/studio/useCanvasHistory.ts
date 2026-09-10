import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { VisualOverride } from "../VisualEditor";

interface CanvasHistoryProps {
  overrides: Record<string, VisualOverride>;
  isEditing: boolean;
  onRestore: (snapshot: Record<string, VisualOverride>) => void;
}

export function useCanvasHistory({ overrides, isEditing, onRestore }: CanvasHistoryProps) {
  const history = useRef<Record<string, VisualOverride>[]>([]);
  const future = useRef<Record<string, VisualOverride>[]>([]);
  const isInternalUpdate = useRef(false);

  // Push new state onto history
  useEffect(() => {
    if (!isEditing) return;
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }

    // Limit history stack to 30 steps
    history.current = [...history.current.slice(-29), overrides];
    future.current = [];
  }, [overrides, isEditing]);

  // Keyboard shortcut listener
  useEffect(() => {
    if (!isEditing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger undo/redo if user is actively typing in an input or contentEditable
      const target = e.target as HTMLElement;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (!cmdOrCtrl) return;

      // Undo: Cmd+Z
      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        if (history.current.length > 1) {
          const current = history.current.pop()!;
          future.current.push(current);
          const previous = history.current[history.current.length - 1];
          if (previous) {
            isInternalUpdate.current = true;
            onRestore(previous);
            toast.info("↺ تم التراجع عن الخطوة الأخيرة");
          }
        } else {
          toast.info("لا توجد خطوات سابقة للتراجع عنها");
        }
      }

      // Redo: Cmd+Shift+Z or Cmd+Y
      if ((e.key === "z" && e.shiftKey) || e.key === "y") {
        e.preventDefault();
        if (future.current.length > 0) {
          const next = future.current.pop()!;
          history.current.push(next);
          isInternalUpdate.current = true;
          onRestore(next);
          toast.info("↻ تم إعادة تطبيق الخطوة");
        } else {
          toast.info("لا توجد خطوات لإعادة تطبيقها");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditing, onRestore]);
}
