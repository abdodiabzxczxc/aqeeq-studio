import React, { useState, useRef, useEffect } from "react";
import { StudioTopBar, type DeviceMode } from "@/components/studio/StudioTopBar";
import { StudioLeftDock, type StudioDockTab, type StudioLayerItem } from "@/components/studio/StudioLeftDock";
import { StudioCanvas, type StudioCanvasHandle } from "@/components/studio/StudioCanvas";
import { StudioInspector, type StudioInspectorDraft } from "@/components/studio/StudioInspector";
import { StudioSnapshotManager, type DesignSnapshot } from "@/components/studio/StudioSnapshotManager";
import type { SchoolBlock } from "@/components/studio/StudioSchoolBlocks";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function AqeeqProStudioPage() {
  const [location] = useLocation();
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const initialPage = searchParams.get("page") || "/";

  const [currentPath, setCurrentPath] = useState<string>(initialPage);
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [zoom, setZoom] = useState<number>(100);
  const [isLivePreview, setIsLivePreview] = useState<boolean>(false);
  const [activeDockTab, setActiveDockTab] = useState<StudioDockTab>(null);
  const [snapshotsOpen, setSnapshotsOpen] = useState<boolean>(false);
  const [smartAutoDetect, setSmartAutoDetect] = useState<boolean>(false);

  const [selectedElement, setSelectedElement] = useState<{ id: string; tag: string; label: string } | null>(null);
  const [draft, setDraft] = useState<StudioInspectorDraft>({});
  const [undoCount, setUndoCount] = useState<number>(0);
  const [redoCount, setRedoCount] = useState<number>(0);
  const [dirtyCount, setDirtyCount] = useState<number>(0);
  const [layers, setLayers] = useState<StudioLayerItem[]>([]);

  const canvasRef = useRef<StudioCanvasHandle | null>(null);

  // Synchronize state when canvas sends messages
  const handleSyncState = (data: {
    selected: { id: string; tag: string; label: string } | null;
    draft: StudioInspectorDraft;
    undoCount: number;
    redoCount: number;
    dirtyCount: number;
    smartAutoDetect?: boolean;
    layers?: StudioLayerItem[];
    pagePath?: string;
  }) => {
    setSelectedElement(data.selected);
    if (data.draft) {
      setDraft(data.draft);
    }
    setUndoCount(data.undoCount);
    setRedoCount(data.redoCount);
    setDirtyCount(data.dirtyCount);
    if (data.smartAutoDetect !== undefined) {
      setSmartAutoDetect(data.smartAutoDetect);
    }
    if (data.layers) {
      setLayers(data.layers);
    }
    if (data.pagePath && data.pagePath !== currentPath) {
      setCurrentPath(data.pagePath);
    }
  };

  const handleRestoreSnapshot = (snapshot: DesignSnapshot) => {
    try {
      localStorage.setItem(`aqeeq-overrides-${snapshot.pagePath}`, JSON.stringify(snapshot.data));
      canvasRef.current?.reload();
      toast.success(`✓ تمت استعادة لقطة «${snapshot.name}» بنجاح`);
    } catch {
      toast.error("تعذر استعادة لقطة التصميم");
    }
  };

  const handleDraftChange = (patch: Partial<StudioInspectorDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    canvasRef.current?.applyPatch(patch);
  };

  const handlePublish = () => {
    canvasRef.current?.publish();
  };

  const handleUndo = () => {
    canvasRef.current?.undo();
  };

  const handleRedo = () => {
    canvasRef.current?.redo();
  };

  const handleInsertElement = (tag: string, label: string) => {
    canvasRef.current?.insertElement(tag, label);
  };

  const handleInsertSection = (type: string, title?: string) => {
    canvasRef.current?.insertSection(type, title);
  };

  const handleInsertSchoolBlock = (block: SchoolBlock) => {
    canvasRef.current?.insertSchoolBlock(block);
  };

  const handleSelectLayer = (id: string) => {
    canvasRef.current?.selectLayer(id);
  };

  const handleToggleLayerVisibility = (id: string) => {
    canvasRef.current?.toggleLayerVisibility(id);
  };

  const handleToggleLayerLock = (id: string) => {
    canvasRef.current?.toggleLayerLock(id);
  };

  const handleDeleteLayer = (id: string) => {
    canvasRef.current?.deleteLayer(id);
  };

  const handleReorderSection = (sectionId: string, direction: "up" | "down") => {
    canvasRef.current?.reorderSection(sectionId, direction);
  };

  const handleApplyAiText = (text: { headline: string; body: string; cta: string }) => {
    if (selectedElement) {
      handleDraftChange({ contentText: text.headline });
    }
  };

  const viewportWidth = device === "mobile" ? 390 : device === "tablet" ? 768 : 1440;
  const viewportHeight = device === "mobile" ? 844 : device === "tablet" ? 1024 : 900;

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#04060a] text-white select-none">
      {/* ── Studio Top Bar ────────────────────────────────────────── */}
      <StudioTopBar
        currentPath={currentPath}
        onSelectPath={(path) => {
          setCurrentPath(path);
          setSelectedElement(null);
        }}
        device={device}
        onSelectDevice={setDevice}
        viewportWidth={viewportWidth}
        viewportHeight={viewportHeight}
        zoom={zoom}
        onSelectZoom={setZoom}
        isLivePreview={isLivePreview}
        onToggleLivePreview={() => setIsLivePreview(!isLivePreview)}
        undoCount={undoCount}
        redoCount={redoCount}
        dirtyCount={dirtyCount}
        smartAutoDetect={smartAutoDetect}
        onToggleSmartAutoDetect={() => canvasRef.current?.toggleSmartAuto()}
        onOpenSnapshots={() => setSnapshotsOpen(true)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onPublish={handlePublish}
        onRefresh={() => canvasRef.current?.reload()}
      />

      {/* ── Studio Main Workspace (Dock + Canvas + Inspector) ────── */}
      <div className="relative flex flex-1 overflow-hidden" dir="rtl">
        {/* Right Dock (in RTL: at the start/right side of screen) */}
        <StudioLeftDock
          activeTab={activeDockTab}
          onSelectTab={setActiveDockTab}
          onInsertElement={handleInsertElement}
          onInsertSection={handleInsertSection}
          onInsertSchoolBlock={handleInsertSchoolBlock}
          onApplyAiText={handleApplyAiText}
          layers={layers}
          selectedLayerId={selectedElement?.id}
          onSelectLayer={handleSelectLayer}
          onToggleLayerVisibility={handleToggleLayerVisibility}
          onToggleLayerLock={handleToggleLayerLock}
          onDeleteLayer={handleDeleteLayer}
          onReorderSection={handleReorderSection}
          pagePath={currentPath}
        />

        {/* Central Viewport Canvas */}
        <StudioCanvas
          ref={canvasRef}
          currentPath={currentPath}
          device={device}
          zoom={zoom}
          isLivePreview={isLivePreview}
          onSyncState={handleSyncState}
        />

        {/* Left Inspector (in RTL: at the end/left side of screen) */}
        {!isLivePreview && (
          <StudioInspector
            selectedElement={selectedElement}
            draft={draft}
            onChangeDraft={handleDraftChange}
            onSaveDraft={() => canvasRef.current?.saveDraft()}
            onRestoreOrigin={() => canvasRef.current?.restoreOrigin()}
            onDuplicate={() => canvasRef.current?.duplicate()}
            onDelete={() => canvasRef.current?.deleteSelected()}
            onClose={() => setSelectedElement(null)}
          />
        )}
      </div>

      {/* ── Design Snapshots Manager Modal ──────────────────────── */}
      <StudioSnapshotManager
        open={snapshotsOpen}
        onClose={() => setSnapshotsOpen(false)}
        pagePath={currentPath}
        onRestoreSnapshot={handleRestoreSnapshot}
      />
    </div>
  );
}
