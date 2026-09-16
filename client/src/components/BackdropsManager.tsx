import React, { useState, useRef } from "react";
import { ABOUT_UNFURLING_ITEMS } from "@/pages/AqeeqSchoolAboutPage";
import { ACCREDITATIONS_PARALLAX_PRODUCTS } from "@/pages/AqeeqSchoolAccreditationsPage";
import { DEFAULT_ADMISSIONS_ITEMS } from "@/components/ui/admissions-scroll-campus-backdrop";
import MediaLibrary, { MediaAsset } from "@/components/MediaLibrary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Building2,
  Award,
  GraduationCap,
  Sparkles,
  RotateCcw,
  Save,
  ImageIcon,
  Cloud,
  Upload,
  Check,
  ExternalLink,
  Loader2,
  FolderOpen,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { directDriveImage, resolveMediaUrl, extractDriveFileId } from "@/lib/mediaUtils";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface BackdropsManagerProps {
  orchestrationForm: any;
  setOrchestrationForm: React.Dispatch<React.SetStateAction<any>>;
  onSave: () => void;
  isSaving: boolean;
  dark?: boolean;
}

export function BackdropsManager({
  orchestrationForm,
  setOrchestrationForm,
  onSave,
  isSaving,
  dark = true,
}: BackdropsManagerProps) {
  const [activeTab, setActiveTab] = useState<"about" | "accreditations" | "admissions">("about");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerDefaultTab, setPickerDefaultTab] = useState<"presets" | "uploads" | "drive">("presets");
  const [sectionDriveFolderUrl, setSectionDriveFolderUrl] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("aqeeq_last_drive_folder_url") || "";
    }
    return "";
  });
  const [autoDistributePending, setAutoDistributePending] = useState(false);
  const [driveModalOpen, setDriveModalOpen] = useState(false);
  const [driveInputUrl, setDriveInputUrl] = useState("");
  const [activeEditingKey, setActiveEditingKey] = useState<{ section: "about" | "accreditations" | "admissions"; index: number } | null>(null);
  const [directUploadLoadingIdx, setDirectUploadLoadingIdx] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const uploadMediaMutation = trpc.visualEditor.media.upload.useMutation();
  const listDriveFolderMutation = trpc.visualEditor.media.listDriveFolder.useMutation();

  // Initialize current backdrops lists or fall back to defaults
  const aboutItems = orchestrationForm.backdrops?.about || ABOUT_UNFURLING_ITEMS;
  const accreditationsItems = orchestrationForm.backdrops?.accreditations || ACCREDITATIONS_PARALLAX_PRODUCTS;
  const admissionsItems = orchestrationForm.backdrops?.admissions || DEFAULT_ADMISSIONS_ITEMS;

  const updateCardImage = (
    section: "about" | "accreditations" | "admissions",
    index: number,
    newUrl: string
  ) => {
    // Automatically normalize Google Drive links to our proxy URL
    const normalizedUrl = directDriveImage(newUrl.trim()) || newUrl.trim();

    const currentList = [
      ...(section === "about"
        ? aboutItems
        : section === "accreditations"
        ? accreditationsItems
        : admissionsItems),
    ];

    const currentItem = currentList[index];
    if (!currentItem) return;

    currentList[index] = {
      ...currentItem,
      thumbnail: normalizedUrl,
      image: normalizedUrl,
    };

    setOrchestrationForm((prev: any) => ({
      ...prev,
      backdrops: {
        ...(prev.backdrops || {}),
        [section]: currentList,
      },
    }));
  };

  const resetCardToDefault = (section: "about" | "accreditations" | "admissions", index: number) => {
    let defaultUrl = "";
    if (section === "about") defaultUrl = ABOUT_UNFURLING_ITEMS[index]?.image || "";
    else if (section === "accreditations") defaultUrl = ACCREDITATIONS_PARALLAX_PRODUCTS[index]?.thumbnail || "";
    else defaultUrl = DEFAULT_ADMISSIONS_ITEMS[index]?.image || "";

    updateCardImage(section, index, defaultUrl);
    toast.info("تمت استعادة الصورة الافتراضية للبطاقة");
  };

  const resetSectionToDefault = (section: "about" | "accreditations" | "admissions") => {
    setOrchestrationForm((prev: any) => ({
      ...prev,
      backdrops: {
        ...(prev.backdrops || {}),
        [section]: null,
      },
    }));
    toast.success("تمت استعادة كافة صور هذا القسم الافتراضية");
  };

  const openPickerFor = (section: "about" | "accreditations" | "admissions", index: number) => {
    setActiveEditingKey({ section, index });
    setPickerDefaultTab("presets");
    setPickerOpen(true);
  };

  const openDrivePickerFor = (
    section: "about" | "accreditations" | "admissions",
    index: number
  ) => {
    setActiveEditingKey({ section, index });
    setPickerDefaultTab("drive");
    setPickerOpen(true);
  };

  const handleAutoDistributeDriveFolder = async () => {
    if (!sectionDriveFolderUrl.trim()) {
      toast.error("يرجى إدخال رابط مجلد Google Drive أولاً");
      return;
    }
    setAutoDistributePending(true);
    try {
      const items = await listDriveFolderMutation.mutateAsync({
        folderUrl: sectionDriveFolderUrl.trim(),
      });
      if (!items || !items.length) {
        toast.error("لم نجد أي صور داخل مجلد Google Drive. تأكد من أن المجلد يحوي صوراً وأن الصلاحية «أي شخص لديه الرابط - مشاهد»");
        setAutoDistributePending(false);
        return;
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("aqeeq_last_drive_folder_url", sectionDriveFolderUrl.trim());
      }
      const currentList = [
        ...(activeTab === "about"
          ? aboutItems
          : activeTab === "accreditations"
          ? accreditationsItems
          : admissionsItems),
      ];

      const updated = currentList.map((cardItem: any, idx: number) => {
        const driveItem = items[idx % items.length];
        const proxyUrl = `/api/drive-proxy/${driveItem.driveFileId}`;
        return {
          ...cardItem,
          thumbnail: proxyUrl,
          image: proxyUrl,
        };
      });

      setOrchestrationForm((prev: any) => ({
        ...prev,
        backdrops: {
          ...(prev.backdrops || {}),
          [activeTab]: updated,
        },
      }));

      toast.success(`تم بنجاح توزيع ${Math.min(items.length, currentList.length)} صورة من Google Drive على جميع بطاقات هذا القسم! 🎉`);
    } catch (err: any) {
      toast.error(err.message || "تعذر قراءة صور المجلد من Google Drive");
    } finally {
      setAutoDistributePending(false);
    }
  };

  const handleApplyDrive = () => {
    if (!activeEditingKey || !driveInputUrl.trim()) return;
    const resolved = directDriveImage(driveInputUrl.trim()) || driveInputUrl.trim();
    updateCardImage(activeEditingKey.section, activeEditingKey.index, resolved);
    toast.success("تم تطبيق صورة Google Drive بنجاح! 📁");
    setDriveModalOpen(false);
    setDriveInputUrl("");
    setActiveEditingKey(null);
  };

  const handleDirectFileUpload = async (
    section: "about" | "accreditations" | "admissions",
    index: number,
    file: File
  ) => {
    const allowed = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"];
    if (!allowed.includes(file.type)) {
      toast.error("يرجى اختيار ملف صورة صالح (PNG, JPG, WebP, GIF)");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("الحد الأقصى لحجم الصورة هو 8 ميجابايت");
      return;
    }
    setDirectUploadLoadingIdx(index);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const asset = await uploadMediaMutation.mutateAsync({
          fileName: file.name,
          mimeType: file.type,
          base64: String(reader.result),
          altText: file.name.replace(/\.[^.]+$/, ""),
        });
        updateCardImage(section, index, asset.url);
        void utils.visualEditor.media.list.invalidate();
        toast.success(`تم رفع «${file.name}» وتطبيقها على البطاقة مباشرة ✓`);
      } catch (err: any) {
        toast.error(err?.message || "تعذر رفع الصورة");
      } finally {
        setDirectUploadLoadingIdx(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleMediaSelect = (asset: MediaAsset) => {
    if (activeEditingKey) {
      updateCardImage(activeEditingKey.section, activeEditingKey.index, asset.url);
      toast.success("تم اختيار وتحديث الصورة بنجاح 🖼️");
    }
    setPickerOpen(false);
    setActiveEditingKey(null);
  };

  return (
    <div className={`space-y-6 rounded-3xl border p-6 md:p-8 ${dark ? "border-white/10 bg-[#080d14]/90 text-white" : "border-black/10 bg-white text-slate-900"}`}>
      {/* Header & Actions Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-current/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-black text-amber-400 mb-2">
            <Sparkles size={13} />
            <span>إدارة خلفيات المنصة المتحركة</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black">صور الخلفيات المتحركة (مدارسنا · الاعتمادات · القبول)</h2>
          <p className="mt-1 text-xs md:text-sm opacity-70">
            يمكنك من هنا استبدال أي صورة من صور الخلفيات التي تتدفق مع السكرول في صفحات المدارس بضغطة زر واحدة.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="flex-1 md:flex-none gap-2 bg-[#f8ca14] hover:bg-[#e6bb10] text-black font-black text-xs px-6 py-2.5 rounded-xl shadow-lg transition active:scale-95"
          >
            <Save size={15} />
            <span>{isSaving ? "جاري الحفظ..." : "حفظ التعديلات ونشرها 💾"}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => resetSectionToDefault(activeTab)}
            className="gap-1.5 text-xs font-bold rounded-xl border-current/20 hover:bg-red-500/10 hover:text-red-400"
            title="استعادة الصور الافتراضية لهذا القسم"
          >
            <RotateCcw size={14} />
            <span>استعادة الافتراضي</span>
          </Button>
        </div>
      </div>

      {/* Segmented Switcher for the 3 Backdrops */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl border border-current/10 bg-current/[0.03] overflow-x-auto scrollbar-hide">
        <button
          type="button"
          onClick={() => setActiveTab("about")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition ${
            activeTab === "about"
              ? dark ? "bg-[#f8ca14] text-black shadow-md" : "bg-[#08467d] text-white shadow-md"
              : "opacity-70 hover:opacity-100"
          }`}
        >
          <Building2 size={15} />
          <span>خلفية صفحة مدارسنا (/about)</span>
          <span className="rounded-full bg-black/10 px-2 py-0.5 text-[10px]">{aboutItems.length} صورة</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("accreditations")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition ${
            activeTab === "accreditations"
              ? dark ? "bg-[#f8ca14] text-black shadow-md" : "bg-[#08467d] text-white shadow-md"
              : "opacity-70 hover:opacity-100"
          }`}
        >
          <Award size={15} />
          <span>خلفية صفحة الاعتمادات (/accreditations)</span>
          <span className="rounded-full bg-black/10 px-2 py-0.5 text-[10px]">{accreditationsItems.length} صورة</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("admissions")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition ${
            activeTab === "admissions"
              ? dark ? "bg-[#f8ca14] text-black shadow-md" : "bg-[#08467d] text-white shadow-md"
              : "opacity-70 hover:opacity-100"
          }`}
        >
          <GraduationCap size={15} />
          <span>خلفية صفحة القبول والتسجيل (/admissions)</span>
          <span className="rounded-full bg-black/10 px-2 py-0.5 text-[10px]">{admissionsItems.length} صورة</span>
        </button>
      </div>

      {/* Google Drive Folder Sync & Browse Banner */}
      <div
        className={`p-4 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition ${
          dark ? "bg-blue-950/25 border-blue-500/30" : "bg-blue-50 border-blue-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <FolderOpen size={22} />
          </div>
          <div>
            <div className="text-xs font-black text-blue-400 flex items-center gap-1.5">
              <span>ربط مجلد Google Drive كامل</span>
              <span className="rounded-md bg-blue-500/20 px-2 py-0.5 text-[10px] text-blue-300">ميزة سريعة</span>
            </div>
            <p className="text-xs opacity-75 mt-0.5 leading-relaxed">
              ارفع كل صورك على مجلد في Google Drive، والصق الرابط هنا لتصفح واختيار الصور لكل بطاقة، أو توزيعها جميعاً بنقرة واحدة!
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            value={sectionDriveFolderUrl}
            onChange={(e) => setSectionDriveFolderUrl(e.target.value)}
            placeholder="https://drive.google.com/drive/folders/..."
            dir="ltr"
            className="h-9 px-3 text-xs font-mono rounded-xl bg-black/40 border border-blue-500/30 text-white outline-none focus:border-blue-400 flex-1 md:w-64"
          />
          <Button
            type="button"
            size="sm"
            onClick={() => {
              if (sectionDriveFolderUrl.trim()) {
                localStorage.setItem("aqeeq_last_drive_folder_url", sectionDriveFolderUrl.trim());
              }
              setActiveEditingKey({ section: activeTab, index: 0 });
              setPickerDefaultTab("drive");
              setPickerOpen(true);
            }}
            className="h-9 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <FolderOpen size={14} />
            <span>تصفح واختيار الصور 🖼️</span>
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={autoDistributePending || !sectionDriveFolderUrl.trim()}
            onClick={handleAutoDistributeDriveFolder}
            className="h-9 px-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs gap-1.5 shadow-sm transition active:scale-95 disabled:opacity-40 cursor-pointer"
            title="توزيع صور المجلد على الـ 15 بطاقة لهذا القسم تلقائياً"
          >
            {autoDistributePending ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            <span>توزيع تلقائي على البطاقات ⚡</span>
          </Button>
        </div>
      </div>

      {/* Grid of Background Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {(activeTab === "about"
          ? aboutItems
          : activeTab === "accreditations"
          ? accreditationsItems
          : admissionsItems
        ).map((item: any, idx: number) => {
          const imageUrl = activeTab === "accreditations" ? item.thumbnail : item.image;
          const badgeText = item.badge || item.category || item.date || `بطاقة ${idx + 1}`;

          return (
            <div
              key={`${activeTab}-card-${item.id || idx}`}
              className={`group flex flex-col justify-between rounded-2xl border p-3.5 transition duration-300 ${
                dark ? "border-white/10 bg-[#0e141f] hover:border-amber-400/40" : "border-slate-200 bg-slate-50 hover:border-[#08467d]/40"
              }`}
            >
              {/* Preview Thumbnail */}
              <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-black/50 border border-white/5 mb-3">
                <img
                  src={resolveMediaUrl(imageUrl) || "/covers/cover-about.jpg"}
                  alt={item.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/covers/cover-about.jpg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <span className="absolute top-2 right-2 rounded-lg bg-black/75 px-2 py-0.5 text-[10px] font-black text-amber-300 border border-white/10 backdrop-blur-md">
                  {badgeText}
                </span>
                <span className="absolute bottom-2 right-2 left-2 truncate text-xs font-black text-white drop-shadow">
                  {item.title}
                </span>
              </div>

              {/* URL Input & Pick Actions */}
              <div className="space-y-2">
                <Input
                  type="text"
                  value={imageUrl || ""}
                  onChange={(e) => updateCardImage(activeTab, idx, e.target.value.trim())}
                  placeholder="رابط الصورة أو معرّف درايف..."
                  dir="ltr"
                  className="h-8 text-[11px] font-mono rounded-lg w-full bg-black/20 border-current/10"
                />

                {/* 3 Action Options: Google Drive, Media Library, Direct Local Upload */}
                <div className="flex items-center gap-1.5">
                  {/* 1. Google Drive Button */}
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => openDrivePickerFor(activeTab, idx)}
                    className="h-7 px-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold gap-1 flex-1 shadow-sm transition active:scale-95 cursor-pointer"
                    title="تصفح واختيار صورة من مجلد Google Drive"
                  >
                    <Cloud size={13} />
                    <span>درايف</span>
                  </Button>

                  {/* 2. Media Library Button */}
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => openPickerFor(activeTab, idx)}
                    className="h-7 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold gap-1 flex-1 shadow-sm transition active:scale-95 cursor-pointer"
                    title="اختيار صورة من مكتبة وسائط العقيق"
                  >
                    <ImageIcon size={13} />
                    <span>المكتبة</span>
                  </Button>

                  {/* 3. Direct Local Upload Button */}
                  <label
                    className="h-7 px-2 rounded-lg border border-current/20 hover:bg-white/10 text-[11px] font-bold gap-1 flex items-center justify-center cursor-pointer transition active:scale-95 shrink-0"
                    title="رفع صورة مباشرة من جهازك"
                  >
                    {directUploadLoadingIdx === idx ? (
                      <Loader2 size={13} className="animate-spin text-amber-400" />
                    ) : (
                      <Upload size={13} />
                    )}
                    <span className="hidden sm:inline text-[10px]">جهازي</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                      className="sr-only"
                      disabled={directUploadLoadingIdx !== null}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        e.target.value = "";
                        if (f) void handleDirectFileUpload(activeTab, idx, f);
                      }}
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => resetCardToDefault(activeTab, idx)}
                    className="text-[10px] opacity-60 hover:opacity-100 hover:text-red-400 transition cursor-pointer"
                  >
                    استعادة الأصل
                  </button>
                  <span className="text-[10px] font-mono opacity-40">#{idx + 1}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Save Trigger */}
      <div className="flex justify-end pt-4 border-t border-current/10">
        <Button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="gap-2 bg-[#f8ca14] hover:bg-[#e6bb10] text-black font-black text-sm px-8 py-3 rounded-2xl shadow-xl transition active:scale-95"
        >
          <Save size={16} />
          <span>{isSaving ? "جاري الحفظ..." : "حفظ ونشر التغييرات على الموقع فوراً 💾"}</span>
        </Button>
      </div>

      {/* Integrated Media Library Modal */}
      {pickerOpen && (
        <MediaLibrary
          open={pickerOpen}
          defaultTab={pickerDefaultTab}
          onClose={() => {
            setPickerOpen(false);
            setActiveEditingKey(null);
          }}
          onSelect={handleMediaSelect}
          accept="image"
        />
      )}

      {/* Dedicated Google Drive Picker Dialog */}
      <Dialog open={driveModalOpen} onOpenChange={setDriveModalOpen}>
        <DialogContent
          className={`max-w-xl rounded-3xl border p-6 font-['Tajawal'] ${
            dark ? "border-white/10 bg-[#0e1422] text-white" : "border-black/10 bg-white text-slate-900"
          }`}
          dir="rtl"
        >
          <DialogHeader className="border-b border-current/10 pb-4 text-right">
            <div className="flex items-center gap-2 text-xs font-black text-blue-400 mb-1">
              <Cloud size={16} />
              <span>استيراد وتعيين صورة من Google Drive</span>
            </div>
            <DialogTitle className="text-lg font-black">
              {activeEditingKey
                ? `تغيير صورة ${
                    activeEditingKey.section === "about"
                      ? "صفحة مدارسنا"
                      : activeEditingKey.section === "accreditations"
                      ? "صفحة الاعتمادات"
                      : "صفحة القبول والتسجيل"
                  } (بطاقة #${activeEditingKey.index + 1})`
                : "اختيار صورة من Google Drive"}
            </DialogTitle>
            <DialogDescription className="text-xs opacity-70">
              انسخ رابط أي صورة من Google Drive والصقه هنا وسيتم ربطها ومعاينتها فوراً.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div>
              <label className="block text-xs font-bold mb-1.5">
                رابط ملف Google Drive (أو معرّف الملف ID):
              </label>
              <Input
                type="text"
                value={driveInputUrl}
                onChange={(e) => setDriveInputUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/1A2B3C.../view?usp=sharing"
                dir="ltr"
                className="font-mono text-xs rounded-xl bg-black/40 border-blue-500/30 focus:border-blue-400"
                autoFocus
              />
            </div>

            {/* Live Drive Preview */}
            {(() => {
              const fileId = extractDriveFileId(driveInputUrl) || (/^[A-Za-z0-9_-]{20,}$/.test(driveInputUrl.trim()) ? driveInputUrl.trim() : null);
              if (!fileId) return null;
              const previewUrl = `/api/drive-proxy/${fileId}`;

              return (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.05] p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <Check size={14} />
                      <span>معرّف الملف: <code className="font-mono text-[11px] bg-black/50 px-1.5 py-0.5 rounded text-white">{fileId}</code></span>
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full">معاينة حية</span>
                  </div>

                  <div className="relative aspect-[16/10] max-h-48 w-full rounded-xl overflow-hidden bg-black/60 border border-white/10">
                    <img
                      src={previewUrl}
                      alt="Drive Preview"
                      className="h-full w-full object-contain"
                      onError={() => {
                        toast.error("تعذر تحميل الصورة من Drive. تأكد من ضبط مشاركة الملف على «أي شخص لديه الرابط»");
                      }}
                    />
                  </div>
                </div>
              );
            })()}

            <div className="rounded-xl bg-white/[0.03] p-3 text-[11px] opacity-75 space-y-1 border border-white/5">
              <div className="font-bold text-amber-300">💡 تعليمات المشاركة من Google Drive:</div>
              <div>1. اضغط كليك يمين على الصورة في Google Drive واضغط **«مشاركة» (Share)**.</div>
              <div>2. اختر **«أي شخص لديه الرابط» (Anyone with the link)** بدلاً من خاص.</div>
              <div>3. الصق الرابط هنا واضغط «تطبيق هذه الصورة من درايف».</div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-current/10">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDriveModalOpen(false);
                setDriveInputUrl("");
                setActiveEditingKey(null);
              }}
              className="text-xs rounded-xl"
            >
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={handleApplyDrive}
              disabled={!driveInputUrl.trim()}
              className="gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs px-5 py-2 rounded-xl shadow-md transition active:scale-95 disabled:opacity-40"
            >
              <Check size={14} />
              <span>تطبيق هذه الصورة من درايف ✓</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
