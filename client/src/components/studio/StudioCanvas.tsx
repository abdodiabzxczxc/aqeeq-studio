import React, { useRef, useEffect, useState } from "react";
import type { DeviceMode } from "./StudioTopBar";
import type { StudioInspectorDraft } from "./StudioInspector";
import type { StudioLayerItem } from "./StudioLeftDock";
import type { SchoolBlock } from "./StudioSchoolBlocks";

export interface StudioCanvasHandle {
  reload: () => void;
  applyPatch: (patch: Partial<StudioInspectorDraft>) => void;
  undo: () => void;
  redo: () => void;
  publish: () => void;
  saveDraft: () => void;
  duplicate: () => void;
  deleteSelected: () => void;
  restoreOrigin: () => void;
  insertElement: (tag: string, label: string) => void;
  insertSection: (sectionType: string, title?: string) => void;
  insertSchoolBlock: (block: SchoolBlock) => void;
  selectLayer: (id: string) => void;
  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;
  deleteLayer: (id: string) => void;
  reorderSection: (sectionId: string, direction: "up" | "down") => void;
  toggleSmartAuto: () => void;
}

export const StudioCanvas = React.forwardRef<
  StudioCanvasHandle,
  {
    currentPath: string;
    device: DeviceMode;
    zoom: number;
    isLivePreview: boolean;
    onSyncState?: (data: {
      selected: { id: string; tag: string; label: string } | null;
      draft: StudioInspectorDraft;
      undoCount: number;
      redoCount: number;
      dirtyCount: number;
      smartAutoDetect?: boolean;
      layers?: StudioLayerItem[];
      pagePath?: string;
    }) => void;
  }
>(function StudioCanvas(
  { currentPath, device, zoom, isLivePreview, onSyncState },
  ref
) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(1200);
  const [fluidWidth, setFluidWidth] = useState<number>(1440);
  const [isDraggingHandle, setIsDraggingHandle] = useState<"left" | "right" | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateSize = () => {
      if (el.clientWidth > 0) {
        setContainerWidth(el.clientWidth);
      }
    };
    updateSize();
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Compute actual frame width based on device mode
  const targetWidth =
    device === "mobile"
      ? 390
      : device === "tablet"
      ? 768
      : device === "fluid"
      ? fluidWidth
      : 1440;

  const targetHeight =
    device === "mobile" ? 844 : device === "tablet" ? 1024 : undefined;

  // Auto-fit scale for desktop to preserve authentic 1440px desktop breakpoints
  const autoFitScale =
    device === "desktop" && containerWidth < 1480
      ? Math.max(0.35, Math.min(1, (containerWidth - 48) / 1440))
      : 1;

  const effectiveScale = (zoom / 100) * autoFitScale;

  // Build iframe URL
  const iframeSrc = `${currentPath}${currentPath.includes("?") ? "&" : "?"}visual=1&studiomode=1${
    isLivePreview ? "&visitor=1" : ""
  }`;

  // Forward ref methods to control iframe from Studio
  React.useImperativeHandle(ref, () => ({
    reload: () => {
      if (iframeRef.current) {
        iframeRef.current.src = iframeSrc;
      }
    },
    applyPatch: (patch) => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "AQEEQ_STUDIO_APPLY_DRAFT", patch },
        "*"
      );
    },
    undo: () => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "AQEEQ_STUDIO_UNDO" },
        "*"
      );
    },
    redo: () => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "AQEEQ_STUDIO_REDO" },
        "*"
      );
    },
    publish: () => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "AQEEQ_STUDIO_PUBLISH" },
        "*"
      );
    },
    saveDraft: () => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "AQEEQ_STUDIO_SAVE_DRAFT" },
        "*"
      );
    },
    duplicate: () => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "AQEEQ_STUDIO_DUPLICATE_SELECTED" },
        "*"
      );
    },
    deleteSelected: () => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "AQEEQ_STUDIO_DELETE_SELECTED" },
        "*"
      );
    },
    restoreOrigin: () => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "AQEEQ_STUDIO_RESTORE_ORIGIN" },
        "*"
      );
    },
    insertElement: (tag, label) => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "AQEEQ_STUDIO_INSERT_ELEMENT", tag, label },
        "*"
      );
    },
    insertSection: (sectionType, title) => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "AQEEQ_STUDIO_INSERT_SECTION", sectionType, title },
        "*"
      );
    },
    insertSchoolBlock: (block) => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "AQEEQ_STUDIO_INSERT_SCHOOL_BLOCK", block },
        "*"
      );
    },
    selectLayer: (id) => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "AQEEQ_STUDIO_SELECT_LAYER", id },
        "*"
      );
    },
    toggleLayerVisibility: (id) => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "AQEEQ_STUDIO_TOGGLE_LAYER_VISIBILITY", id },
        "*"
      );
    },
    toggleLayerLock: (id) => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "AQEEQ_STUDIO_TOGGLE_LAYER_LOCK", id },
        "*"
      );
    },
    deleteLayer: (id) => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "AQEEQ_STUDIO_DELETE_LAYER", id },
        "*"
      );
    },
    reorderSection: (sectionId, direction) => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "AQEEQ_STUDIO_REORDER_SECTION", sectionId, direction },
        "*"
      );
    },
    toggleSmartAuto: () => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "AQEEQ_STUDIO_TOGGLE_SMART_AUTO" },
        "*"
      );
    },
  }));

  // Listen to iframe postMessages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== "object") return;
      if (data.type === "AQEEQ_STUDIO_SYNC") {
        onSyncState?.({
          selected: data.selected,
          draft: data.draft,
          undoCount: data.undoCount || 0,
          redoCount: data.redoCount || 0,
          dirtyCount: data.dirtyCount || 0,
          smartAutoDetect: data.smartAutoDetect,
          layers: data.layers || [],
          pagePath: data.pagePath,
        });
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onSyncState]);

  // Fluid drag resizer logic
  useEffect(() => {
    if (!isDraggingHandle) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (isDraggingHandle === "right" || isDraggingHandle === "left") {
        const center = window.innerWidth / 2;
        const distFromCenter = Math.abs(e.clientX - center);
        const newWidth = Math.max(360, Math.min(1920, Math.round(distFromCenter * 2)));
        setFluidWidth(newWidth);
      }
    };

    const handlePointerUp = () => {
      setIsDraggingHandle(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDraggingHandle]);

  const scale = zoom / 100;

  return (
    <main
      ref={containerRef}
      data-aq-studio-canvas
      className="relative flex-1 overflow-auto bg-[#06080e] p-4 sm:p-8 flex items-start justify-center"
      style={{
        backgroundImage: `radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
      }}
    >
      {/* ── Outer Layout Dimension Shell (prevents canvas horizontal overflow) ── */}
      <div
        className="relative flex items-start justify-center shrink-0"
        style={{
          width: `${targetWidth * effectiveScale}px`,
          height: targetHeight
            ? `${targetHeight * effectiveScale}px`
            : "calc(100vh - 120px)",
        }}
      >
        {/* ── Viewport Scaling Container ─────────────────────────── */}
        <div
          className="relative transition-all duration-200 origin-top flex items-center justify-center shrink-0"
          style={{
            transform: `scale(${effectiveScale})`,
            transformOrigin: "top center",
            width: `${targetWidth}px`,
            maxWidth: "none",
            height: targetHeight
              ? `${targetHeight}px`
              : `calc((100vh - 120px) / ${effectiveScale})`,
          }}
        >
          {/* Mobile / Tablet Bezel Shell */}
          <div
            className={`relative flex flex-col w-full h-full shadow-2xl transition-all duration-300 ${
              device === "mobile"
                ? "rounded-[3rem] border-[10px] border-[#181d28] ring-1 ring-white/10 bg-[#000000] p-2 shadow-[0_25px_80px_rgba(0,0,0,0.9)]"
                : device === "tablet"
                ? "rounded-[2.5rem] border-[12px] border-[#181d28] ring-1 ring-white/10 bg-[#000000] p-2 shadow-[0_25px_80px_rgba(0,0,0,0.9)]"
                : "rounded-2xl border border-white/10 bg-[#0b0e14] shadow-2xl overflow-hidden"
            }`}
          >
            {/* Dynamic Island for Mobile */}
            {device === "mobile" && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-5 rounded-full bg-black z-30 flex items-center justify-end px-2 shadow-inner pointer-events-none">
                <span className="h-2.5 w-2.5 rounded-full bg-[#111] border border-white/10" />
              </div>
            )}

            {/* Canvas iFrame */}
            <iframe
              ref={iframeRef}
              src={iframeSrc}
              title="Aqeeq Pro Studio Canvas"
              style={{ pointerEvents: "auto" }}
              className={`w-full h-full border-0 bg-white transition duration-150 ${
                device === "mobile"
                  ? "rounded-[2.25rem]"
                  : device === "tablet"
                  ? "rounded-[1.75rem]"
                  : "rounded-none"
              }`}
            />
          </div>

          {/* Drag Handles for Fluid Device Mode */}
          {device === "fluid" && (
            <>
              <button
                type="button"
                onPointerDown={() => setIsDraggingHandle("right")}
                className="absolute -right-3 top-1/2 -translate-y-1/2 w-2.5 h-16 rounded-full bg-amber-400 hover:bg-amber-300 shadow cursor-ew-resize transition active:scale-110"
                title="اسحب لتغيير عرض الشاشة"
              />
              <button
                type="button"
                onPointerDown={() => setIsDraggingHandle("left")}
                className="absolute -left-3 top-1/2 -translate-y-1/2 w-2.5 h-16 rounded-full bg-amber-400 hover:bg-amber-300 shadow cursor-ew-resize transition active:scale-110"
                title="اسحب لتغيير عرض الشاشة"
              />
            </>
          )}
        </div>
      </div>
    </main>
  );
});
