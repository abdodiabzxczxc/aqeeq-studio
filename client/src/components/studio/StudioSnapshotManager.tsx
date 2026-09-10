import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Camera,
  RotateCcw,
  Trash2,
  Download,
  Upload,
  Clock,
  Check,
  X,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

export type DesignSnapshot = {
  id: string;
  name: string;
  createdAt: string;
  pagePath: string;
  overridesCount: number;
  data: Record<string, unknown>;
};

const STORAGE_KEY = "aqeeq_design_snapshots";

export function loadSnapshots(): DesignSnapshot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSnapshots(snapshots: DesignSnapshot[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots));
  } catch (err) {
    console.error("Failed to persist snapshots", err);
  }
}

export function StudioSnapshotManager({
  open,
  onClose,
  pagePath,
  onRestoreSnapshot,
}: {
  open: boolean;
  onClose: () => void;
  pagePath: string;
  onRestoreSnapshot: (snapshot: DesignSnapshot) => void;
}) {
  const [snapshots, setSnapshots] = useState<DesignSnapshot[]>([]);
  const [newSnapshotName, setNewSnapshotName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (open) {
      setSnapshots(loadSnapshots());
      setNewSnapshotName(`نسخة ${new Date().toLocaleDateString("ar-SA", { hour: "2-digit", minute: "2-digit" })}`);
    }
  }, [open]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  const currentPathSnapshots = snapshots.filter(
    (s) => s.pagePath === pagePath || s.pagePath === "/"
  );

  const handleCreateSnapshot = () => {
    const name = newSnapshotName.trim() || `لقطة ${new Date().toLocaleTimeString("ar-SA")}`;
    let pageOverrides: Record<string, unknown> = {};

    try {
      const storageKey = `aqeeq-overrides-${pagePath}`;
      const raw = localStorage.getItem(storageKey);
      if (raw) pageOverrides = JSON.parse(raw);
    } catch {}

    const newSnapshot: DesignSnapshot = {
      id: `snap-${Date.now().toString(36)}`,
      name,
      createdAt: new Date().toISOString(),
      pagePath,
      overridesCount: Object.keys(pageOverrides).length,
      data: pageOverrides,
    };

    const next = [newSnapshot, ...snapshots];
    setSnapshots(next);
    saveSnapshots(next);
    setIsCreating(false);
    toast.success(`تم حفظ لقطة التصميم: «${name}» 📸`);
  };

  const handleDeleteSnapshot = (id: string, name: string) => {
    const next = snapshots.filter((s) => s.id !== id);
    setSnapshots(next);
    saveSnapshots(next);
    toast.message(`تم حذف اللقطة: ${name}`);
  };

  const handleExportJson = (snapshot: DesignSnapshot) => {
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aqeeq-snapshot-${snapshot.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("تم تصدير ملف اللقطة بنجاح");
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string) as DesignSnapshot;
        if (imported && imported.data) {
          const next = [
            {
              ...imported,
              id: `imported-${Date.now().toString(36)}`,
              name: `${imported.name || "مستوردة"} (ملف)`,
              createdAt: new Date().toISOString(),
            },
            ...snapshots,
          ];
          setSnapshots(next);
          saveSnapshots(next);
          toast.success("تم استيراد لقطة التصميم بنجاح!");
        } else {
          toast.error("ملف اللقطة غير صالح");
        }
      } catch {
        toast.error("فشل قراءة الملف");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[450] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200"
      dir="rtl"
      data-no-visual-edit="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/15 bg-[#090d14] text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-400/15 text-amber-300">
              <Camera size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">لقطات التصميم والنسخ الاحتياطية</h3>
              <p className="text-[11px] text-slate-400">احفظ حالة التصميم الحالية واسترجعها بنقرة واحدة</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </header>

        {/* Create Snapshot Bar */}
        <div className="border-b border-white/10 p-4 bg-white/[0.02]">
          {isCreating ? (
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-300">اسم اللقطة:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSnapshotName}
                  onChange={(e) => setNewSnapshotName(e.target.value)}
                  placeholder="مثلاً: قبل تعديل صور الهيرو..."
                  className="flex-1 rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleCreateSnapshot}
                  className="flex items-center gap-1 rounded-xl bg-amber-400 px-4 py-2 text-xs font-black text-amber-950 hover:bg-amber-300 transition"
                >
                  <Check size={14} />
                  <span>حفظ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="rounded-xl border border-white/15 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 transition"
                >
                  إلغاء
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2.5 text-xs font-black text-amber-950 shadow-lg hover:from-amber-300 hover:to-amber-400 transition cursor-pointer"
              >
                <Plus size={15} className="stroke-[3]" />
                <span>أخذ لقطة جديدة الآن</span>
              </button>

              <label className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer">
                <Upload size={13} />
                <span>استيراد ملف</span>
                <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
              </label>
            </div>
          )}
        </div>

        {/* Snapshots List */}
        <div className="max-h-[360px] overflow-y-auto p-4 space-y-2.5">
          {currentPathSnapshots.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Clock size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-xs font-bold text-slate-400">لا توجد لقطات محفوظة لهذه الصفحة</p>
              <p className="text-[10px] text-slate-500 mt-1">اضغط على «أخذ لقطة جديدة الآن» لحفظ حالة التصميم الحالية</p>
            </div>
          ) : (
            currentPathSnapshots.map((snap) => (
              <div
                key={snap.id}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 p-3.5 transition hover:border-amber-400/40 hover:bg-black/50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black text-white truncate">{snap.name}</h4>
                    <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[9px] font-mono text-slate-400">
                      {snap.overridesCount} عنصر
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                    <span>
                      {new Date(snap.createdAt).toLocaleDateString("ar-SA", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span>•</span>
                    <span>{snap.pagePath}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleExportJson(snap)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
                    title="تنزيل اللقطة كملف JSON"
                  >
                    <Download size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteSnapshot(snap.id, snap.name)}
                    className="rounded-lg p-2 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition"
                    title="حذف هذه اللقطة"
                  >
                    <Trash2 size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onRestoreSnapshot(snap);
                      onClose();
                    }}
                    className="flex items-center gap-1 rounded-xl bg-amber-400/15 border border-amber-400/30 px-3 py-1.5 text-xs font-black text-amber-300 hover:bg-amber-400 hover:text-amber-950 transition cursor-pointer"
                  >
                    <RotateCcw size={13} />
                    <span>استعادة</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
