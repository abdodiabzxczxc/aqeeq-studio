import { trpc } from "@/lib/trpc";
import { Progress } from "@/components/ui/progress";
import { Check, CheckCircle2, Cloud, Copy, Film, FolderOpen, ImageIcon, Layers, Link2, Loader2, Music2, RefreshCw, Search, Sparkles, Trash2, Upload, X } from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { extractDriveFileId, directDriveImage } from "@/lib/mediaUtils";

export type MediaAsset = {
  id: number;
  url: string;
  kind: "image" | "video" | "audio" | "embed";
  mimeType: string | null;
  fileName: string;
  fileSize: number | null;
  altText: string | null;
};

export const MEDIA_LIBRARY_Z_INDEX = 400;

export const PRESET_SCHOOL_MEDIA: MediaAsset[] = [
  { id: 9001, url: "/covers/cover-about.jpg", kind: "image", mimeType: "image/jpeg", fileName: "غلاف مدارسنا — الصروح والمباني الأكاديمية", fileSize: null, altText: "مدارس العقيق الأهلية والدولية" },
  { id: 9002, url: "/covers/cover-admissions.jpg", kind: "image", mimeType: "image/jpeg", fileName: "غلاف القبول والتسجيل — رحلة الطالب المستقبلية", fileSize: null, altText: "القبول والتسجيل مدارس العقيق" },
  { id: 9003, url: "/covers/cover-accreditations.jpg", kind: "image", mimeType: "image/jpeg", fileName: "غلاف الاعتمادات والجوائز العالمية كوجنيا وكامبريدج", fileSize: null, altText: "الاعتمادات الدولية" },
  { id: 9004, url: "/covers/student-lab-admissions.jpg", kind: "image", mimeType: "image/jpeg", fileName: "مختبرات العلوم والتقنية والابتكار الحديثة", fileSize: null, altText: "مختبر العلوم والتقنية" },
  { id: 9005, url: "/covers/first-lego-champions.png", kind: "image", mimeType: "image/png", fileName: "أبطال الروبوتات والذكاء الاصطناعي FLL", fileSize: null, altText: "أبطال الروبوتات" },
  { id: 9006, url: "/covers/student-excellence-about.jpg", kind: "image", mimeType: "image/jpeg", fileName: "طلاب العقيق — ريادة وتميز دراسي عالمي", fileSize: null, altText: "تفوق وريادة طلاب العقيق" },
  { id: 9007, url: "/covers/student-robotics-accreditations.jpg", kind: "image", mimeType: "image/jpeg", fileName: "أولمبياد الروبوت الدولي WRO والبطولات العالمية", fileSize: null, altText: "مسابقة الروبوت الدولية" },
  { id: 9008, url: "/covers/aqeeq-anthems-royal-cover.jpg", kind: "image", mimeType: "image/jpeg", fileName: "غلاف أثير العقيق والإنتاج الصوتي الملكي", fileSize: null, altText: "أثير وبودكاست العقيق" },
  { id: 9009, url: "/articles/ai-in-education-comprehensive-research.jpg", kind: "image", mimeType: "image/jpeg", fileName: "الذكاء الاصطناعي في التعليم والبحث العلمي", fileSize: null, altText: "الذكاء الاصطناعي في التعليم" },
  { id: 9010, url: "/articles/morning-radio-student-personality-development.jpg", kind: "image", mimeType: "image/jpeg", fileName: "الإذاعة المدرسية وبناء شخصية الطالب", fileSize: null, altText: "الإذاعة المدرسية" },
  { id: 9011, url: "/articles/words-to-wonders-primary-english-journey.jpg", kind: "image", mimeType: "image/jpeg", fileName: "مسارات اللغة الإنجليزية والبرامج الدولية", fileSize: null, altText: "مسار اللغة الإنجليزية" },
  { id: 9012, url: "/alaqeeq-logo.png", kind: "image", mimeType: "image/png", fileName: "شعار مدارس العقيق الرسمي الأصلي", fileSize: null, altText: "شعار مدارس العقيق" },
  { id: 9013, url: "/api/drive-proxy/1ulrpYsDrV7xbDdysqTsNoLNUvblw14p5", kind: "image", mimeType: "image/png", fileName: "محطة 1994 الأرشيفية — غراس البدايات وتأسيس أول مجمع", fileSize: null, altText: "وثيقة تأسيس مدارس العقيق 1994" },
  { id: 9014, url: "/api/drive-proxy/1IkefgGSvnqfdhLiMHYd25-lz3AuBH5n1", kind: "image", mimeType: "image/png", fileName: "محطة 2010 الأرشيفية — المجمعات الكبرى والمسابح الأولمبية", fileSize: null, altText: "مجمعات العقيق والمسابح 2010" },
  { id: 9015, url: "/api/drive-proxy/1qifbHFSgFaBQH1g63qvK2WmQtls0l4AR", kind: "image", mimeType: "image/png", fileName: "محطة 2018 الأرشيفية — اعتماد كوجنيا الأمريكي الدولي", fileSize: null, altText: "اعتماد كوجنيا الأمريكي 2018" },
  { id: 9016, url: "/api/drive-proxy/16IxreFp6eRLCuLDZyIWEoU9eWHzOCJuC", kind: "image", mimeType: "image/png", fileName: "محطة 2026 الأرشيفية — مراكز الاختبارات والذكاء الاصطناعي", fileSize: null, altText: "مراكز الاختبارات والذكاء الاصطناعي 2026" },
];

export default function MediaLibrary({
  open,
  onClose,
  onSelect,
  accept = "all",
  workspace = false,
  defaultTab = "presets",
}: {
  open: boolean;
  onClose: () => void;
  onSelect?: (asset: MediaAsset) => void;
  accept?: "all" | "image" | "video" | "audio";
  workspace?: boolean;
  defaultTab?: "presets" | "uploads" | "drive";
}) {
  const utils = trpc.useUtils();
  const { data: assets = [], isLoading } = trpc.visualEditor.media.list.useQuery(undefined, { enabled: open, refetchOnWindowFocus: false });
  const [activeTab, setActiveTab] = useState<"presets" | "uploads" | "drive">(defaultTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [embedTitle, setEmbedTitle] = useState("");
  const [driveUrl, setDriveUrl] = useState("");
  const [driveTitle, setDriveTitle] = useState("");
  const [driveSubTab, setDriveSubTab] = useState<"folder" | "single">("folder");
  const [driveFolderUrl, setDriveFolderUrl] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("aqeeq_last_drive_folder_url") || "";
    }
    return "";
  });
  const [driveFolderItems, setDriveFolderItems] = useState<Array<{
    driveFileId: string;
    mediaUrl: string;
    thumbnailUrl: string;
    fileName: string;
    mimeType: string;
    mediaType: "image";
  }>>([]);
  const [driveFolderSearch, setDriveFolderSearch] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  useEffect(() => {
    if (open && defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [open, defaultTab]);

  const listDriveFolder = trpc.visualEditor.media.listDriveFolder.useMutation({
    onSuccess: (items) => {
      setDriveFolderItems(items as any);
      if (items.length > 0) {
        toast.success(`تم استخراج ${items.length} صورة من مجلد Google Drive بنجاح! 📁`);
      } else {
        toast.info("تم فتح المجلد لكن لم يُعثر على صور ظاهرة. تأكد أن الصلاحية «أي شخص لديه الرابط - مشاهد» وأن الملفات صور.");
      }
      if (typeof window !== "undefined" && driveFolderUrl.trim()) {
        localStorage.setItem("aqeeq_last_drive_folder_url", driveFolderUrl.trim());
      }
    },
    onError: (error) => {
      toast.error(error.message || "تعذر قراءة مجلد Google Drive. تأكد من أن الرابط صحيح والصلاحية عامة.");
    },
  });

  const importDriveFolder = trpc.visualEditor.media.importDriveFolder.useMutation({
    onSuccess: (res) => {
      toast.success(`تم استيراد ${res.count} صورة بنجاح وحفظها في مكتبتك! 💾✨`);
      void utils.visualEditor.media.list.invalidate();
      setActiveTab("uploads");
    },
    onError: (error) => {
      toast.error(error.message || "تعذر استيراد صور المجلد");
    },
  });

  const upload = trpc.visualEditor.media.upload.useMutation({
    onSuccess: () => {
      setUploadProgress(100);
      setUploadStatus("اكتمل الرفع");
      toast.success("تمت إضافة الملف إلى مكتبة الوسائط بنجاح");
      void utils.visualEditor.media.list.invalidate();
      window.setTimeout(() => {
        setUploadProgress(0);
        setUploadStatus(null);
      }, 700);
    },
    onError: (error) => {
      setUploadProgress(0);
      setUploadStatus(null);
      toast.error(error.message || "تعذر رفع الملف");
    },
  });

  const addDriveMedia = trpc.visualEditor.media.addDriveMedia.useMutation({
    onSuccess: (asset) => {
      toast.success("تم استيراد الصورة من Google Drive بنجاح! 📁");
      setDriveUrl("");
      setDriveTitle("");
      void utils.visualEditor.media.list.invalidate();
      if (onSelect && asset) {
        onSelect(asset as MediaAsset);
        onClose();
      } else {
        setActiveTab("uploads");
      }
    },
    onError: (error) => toast.error(error.message || "تعذر استيراد الصورة من Google Drive"),
  });

  const addEmbed = trpc.visualEditor.media.addEmbed.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ رابط الفيديو في المكتبة");
      setEmbedUrl("");
      setEmbedTitle("");
      void utils.visualEditor.media.list.invalidate();
    },
    onError: (error) => toast.error(error.message || "تعذر إضافة رابط الفيديو"),
  });

  const remove = trpc.visualEditor.media.delete.useMutation({
    onSuccess: () => {
      toast.message("تمت إزالة الملف من مكتبة الوسائط");
      void utils.visualEditor.media.list.invalidate();
    },
    onError: (error) => toast.error(error.message || "تعذر إزالة الملف"),
  });

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const allowed = [
      "image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml",
      "video/mp4", "video/webm", "video/quicktime",
      "audio/mpeg", "audio/mp4", "audio/ogg", "audio/wav", "audio/webm"
    ];
    if (!allowed.includes(file.type)) {
      toast.error("اختر صورة أو فيديو، أو ملف MP3 أو M4A أو OGG أو WAV صوتي");
      return;
    }
    const isLargeMedia = file.type.startsWith("video/") || file.type.startsWith("audio/");
    const maxBytes = isLargeMedia ? 25 * 1024 * 1024 : 8 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error(isLargeMedia ? "الحد الأقصى للفيديو أو الصوت 25 ميجابايت" : "الحد الأقصى للصورة 8 ميجابايت");
      return;
    }
    const reader = new FileReader();
    setUploadProgress(8);
    setUploadStatus("جارٍ تجهيز الملف…");
    reader.onload = () => {
      setUploadProgress(48);
      setUploadStatus("جارٍ رفع الملف…");
      upload.mutate({
        fileName: file.name,
        mimeType: file.type,
        base64: String(reader.result),
        altText: file.name.replace(/\.[^.]+$/, ""),
      });
    };
    reader.onerror = () => {
      setUploadProgress(0);
      setUploadStatus(null);
      toast.error("تعذر قراءة الملف المحدد");
    };
    reader.readAsDataURL(file);
  };

  const handleSelectAsset = (asset: MediaAsset) => {
    if (onSelect) {
      onSelect(asset);
      onClose();
      toast.success(`تم اختيار «${asset.fileName}» بنجاح!`);
    } else {
      void navigator.clipboard.writeText(asset.url);
      toast.success("تم نسخ رابط الصورة إلى الحافظة!");
    }
  };

  // Filtered lists
  const filteredPresets = useMemo(() => {
    if (accept !== "all" && accept !== "image") return [];
    return PRESET_SCHOOL_MEDIA.filter((item) =>
      !searchQuery.trim() || item.fileName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [accept, searchQuery]);

  const visibleUploadedAssets = useMemo(() => {
    return (assets as MediaAsset[]).filter((asset) => {
      const kindMatch = accept === "all" || asset.kind === accept || (accept === "video" && asset.kind === "embed");
      const searchMatch = !searchQuery.trim() || asset.fileName.toLowerCase().includes(searchQuery.toLowerCase());
      return kindMatch && searchMatch;
    });
  }, [assets, accept, searchQuery]);

  if (!open) return null;

  return (
    <div
      data-aq-editor-panel="media"
      data-no-visual-edit="true"
      role="dialog"
      aria-modal="true"
      className={`aq-media-library-modal ${
        workspace
          ? "fixed inset-x-3 bottom-3 z-[340] flex max-h-[82svh] flex-col overflow-hidden rounded-3xl border border-amber-400/25 bg-[#0e121a] shadow-2xl md:inset-y-0 md:left-0 md:right-auto md:max-h-none md:w-[min(480px,100vw)] md:rounded-none md:border-y-0 md:border-l-0 md:border-r"
          : "fixed inset-0 z-[400] flex items-end justify-center bg-black/75 p-3 backdrop-blur-md sm:items-center"
      }`}
      style={workspace ? undefined : { zIndex: MEDIA_LIBRARY_Z_INDEX }}
      dir="rtl"
      onMouseDown={workspace ? undefined : onClose}
    >
      <section
        data-no-visual-edit="true"
        className={
          workspace
            ? "flex min-h-0 flex-1 flex-col overflow-hidden"
            : "max-h-[88vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-amber-400/30 bg-[#0c1017] shadow-2xl flex flex-col"
        }
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4 bg-[#111622]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-300">مكتبة وسائط العقيق</span>
              {onSelect && (
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-black text-emerald-300">
                  وضع الاختيار والاستبدال نشط ✓
                </span>
              )}
            </div>
            <h2 className="mt-1 text-base sm:text-lg font-black text-white">
              {onSelect ? "اضغط على أي صورة لتطبيقها فوراً على العنصر المختار" : "تصفح الصور وخلفيات المدرسة والملفات المرفوعة"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-white/[0.07] hover:text-white"
            aria-label="إغلاق"
          >
            <X size={20} />
          </button>
        </header>

        {/* Tab switcher & Search bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-3 bg-[#0a0e14]">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab("presets")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-black transition ${
                activeTab === "presets"
                  ? "bg-amber-400 text-slate-950 shadow-md"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Sparkles size={13} />
              <span>صور العقيق الجاهزة ({PRESET_SCHOOL_MEDIA.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("uploads")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-black transition ${
                activeTab === "uploads"
                  ? "bg-amber-400 text-slate-950 shadow-md"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <ImageIcon size={13} />
              <span>الملفات المرفوعة ({assets.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("drive")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-black transition ${
                activeTab === "drive"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Cloud size={13} />
              <span>Google Drive 📁</span>
            </button>
          </div>

          <div className="min-w-[200px] flex-1 max-w-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في الصور..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div
          className={`grid min-h-0 flex-1 overflow-y-auto ${
            workspace ? "grid-cols-1" : "max-h-[calc(88vh-130px)] lg:grid-cols-[1fr_280px]"
          }`}
        >
          {/* Gallery Grid or Drive Importer */}
          <div className="min-h-72 p-4">
            {activeTab === "drive" ? (
              <div className="space-y-4">
                {/* Drive Mode Switcher */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDriveSubTab("folder")}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                        driveSubTab === "folder"
                          ? "bg-blue-600 text-white shadow-md"
                          : "text-slate-400 hover:text-white bg-white/5"
                      }`}
                    >
                      <FolderOpen size={14} />
                      <span>قائمة صور مجلد Google Drive {driveFolderItems.length > 0 ? `(${driveFolderItems.length})` : ""}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDriveSubTab("single")}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                        driveSubTab === "single"
                          ? "bg-blue-600 text-white shadow-md"
                          : "text-slate-400 hover:text-white bg-white/5"
                      }`}
                    >
                      <Cloud size={14} />
                      <span>رابط صورة مفردة</span>
                    </button>
                  </div>

                  {driveSubTab === "folder" && driveFolderItems.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => importDriveFolder.mutate({ folderUrl: driveFolderUrl.trim() })}
                        disabled={importDriveFolder.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer disabled:opacity-50 shadow"
                        title="حفظ جميع صور هذا المجلد في مكتبة الوسائط المرفوعة"
                      >
                        {importDriveFolder.isPending ? <Loader2 size={13} className="animate-spin" /> : <Layers size={13} />}
                        <span>حفظ الكل في مكتبتي ({driveFolderItems.length})</span>
                      </button>
                    </div>
                  )}
                </div>

                {driveSubTab === "folder" ? (
                  <div className="space-y-4">
                    {/* Folder Input Bar */}
                    <div className="rounded-2xl border border-blue-500/30 bg-[#0e1422] p-3.5 space-y-2">
                      <label className="block text-xs font-bold text-slate-200">
                        رابط مجلد Google Drive (يجب ضبط مشاركة المجلد: «أي شخص لديه الرابط - مشاهد»):
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={driveFolderUrl}
                          onChange={(e) => setDriveFolderUrl(e.target.value)}
                          placeholder="https://drive.google.com/drive/folders/1ABCxyz... أو معرف الفولدر"
                          dir="ltr"
                          className="flex-1 rounded-xl border border-blue-500/40 bg-black/50 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-400 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!driveFolderUrl.trim()) {
                              toast.error("يرجى إدخال رابط مجلد Google Drive أولاً");
                              return;
                            }
                            listDriveFolder.mutate({ folderUrl: driveFolderUrl.trim() });
                          }}
                          disabled={!driveFolderUrl.trim() || listDriveFolder.isPending}
                          className="rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2 text-xs font-black text-white disabled:opacity-40 transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                        >
                          {listDriveFolder.isPending ? <Loader2 className="animate-spin" size={14} /> : <FolderOpen size={14} />}
                          <span>{listDriveFolder.isPending ? "جارٍ فحص المجلد..." : "استعراض صور المجلد 📂"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Folder Results */}
                    {listDriveFolder.isPending ? (
                      <div className="flex h-56 flex-col items-center justify-center gap-3 text-slate-400">
                        <Loader2 className="animate-spin text-blue-400" size={32} />
                        <span className="text-xs font-bold">جارٍ استخراج وتجهيز صور المجلد من Google Drive...</span>
                      </div>
                    ) : driveFolderItems.length > 0 ? (
                      <div className="space-y-3">
                        {/* Search & Stats Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                          <div className="flex items-center gap-2 text-xs text-blue-300 font-bold">
                            <CheckCircle2 size={14} className="text-emerald-400" />
                            <span>تم العثور على {driveFolderItems.length} صورة في هذا المجلد — اضغط على أي صورة لتطبيقها فوراً</span>
                          </div>
                          <input
                            type="text"
                            value={driveFolderSearch}
                            onChange={(e) => setDriveFolderSearch(e.target.value)}
                            placeholder="تصفية بالاسم..."
                            className="h-7 rounded-lg border border-white/10 bg-black/40 px-2.5 text-[11px] text-white outline-none focus:border-blue-400 w-44"
                          />
                        </div>

                        {/* Images Grid */}
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
                          {driveFolderItems
                            .filter((item) => !driveFolderSearch.trim() || item.fileName.toLowerCase().includes(driveFolderSearch.toLowerCase().trim()))
                            .map((item) => (
                              <article
                                key={item.driveFileId}
                                onClick={() => {
                                  const asset: MediaAsset = {
                                    id: -Math.floor(Math.random() * 1000000) - 1,
                                    url: `/api/drive-proxy/${item.driveFileId}`,
                                    kind: "image",
                                    mimeType: item.mimeType || "image/jpeg",
                                    fileName: item.fileName,
                                    fileSize: null,
                                    altText: item.fileName,
                                  };
                                  addDriveMedia.mutate({
                                    url: `/api/drive-proxy/${item.driveFileId}`,
                                    title: item.fileName,
                                  });
                                  if (onSelect) {
                                    onSelect(asset);
                                    onClose();
                                    toast.success(`تم اختيار وتطبيق: ${item.fileName} 🖼️`);
                                  }
                                }}
                                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-blue-500/20 bg-[#101624] hover:border-blue-400 hover:shadow-[0_10px_30px_rgba(59,130,246,0.2)] transition duration-200 cursor-pointer p-2"
                              >
                                <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-slate-950 border border-white/5">
                                  <img
                                    src={`/api/drive-proxy/${item.driveFileId}`}
                                    alt={item.fileName}
                                    loading="lazy"
                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                  />
                                  <span className="absolute top-1.5 left-1.5 rounded-md bg-black/75 px-1.5 py-0.5 font-mono text-[9px] text-blue-300 uppercase">
                                    {item.fileName.split(".").pop() || "IMG"}
                                  </span>
                                </div>

                                <div className="mt-2 text-right">
                                  <h4 className="text-xs font-bold text-slate-100 line-clamp-1 leading-snug" title={item.fileName}>
                                    {item.fileName}
                                  </h4>
                                </div>

                                <div className="mt-2 pt-1 border-t border-white/[0.06]">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const asset: MediaAsset = {
                                        id: -Math.floor(Math.random() * 1000000) - 1,
                                        url: `/api/drive-proxy/${item.driveFileId}`,
                                        kind: "image",
                                        mimeType: item.mimeType || "image/jpeg",
                                        fileName: item.fileName,
                                        fileSize: null,
                                        altText: item.fileName,
                                      };
                                      addDriveMedia.mutate({
                                        url: `/api/drive-proxy/${item.driveFileId}`,
                                        title: item.fileName,
                                      });
                                      if (onSelect) {
                                        onSelect(asset);
                                        onClose();
                                        toast.success(`تم اختيار وتطبيق: ${item.fileName} 🖼️`);
                                      }
                                    }}
                                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 py-1.5 px-3 text-xs font-black text-white shadow-md transition cursor-pointer"
                                  >
                                    <Check size={13} />
                                    <span>{onSelect ? "اختيار وتطبيق هذه الصورة ✓" : "اختيار الصورة"}</span>
                                  </button>
                                </div>
                              </article>
                            ))}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-blue-500/30 bg-blue-500/[0.02] p-8 text-center space-y-3">
                        <div className="grid h-12 w-12 mx-auto place-items-center rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                          <FolderOpen size={24} />
                        </div>
                        <h4 className="text-sm font-black text-white">ارفع كل صورك على مجلد في Google Drive وافرزها هنا بنقرة زر</h4>
                        <div className="max-w-md mx-auto text-xs text-slate-400 leading-relaxed space-y-1.5 text-right bg-black/40 p-3.5 rounded-xl border border-white/5">
                          <div className="font-bold text-amber-300">كيف تستخدم هذه الميزة؟</div>
                          <div>1. أنشئ مجلداً على Google Drive وارفع فيه كل صور الصفحة التي تريدها.</div>
                          <div>2. اضغط كليك يمين على المجلد ثم <strong className="text-white">«مشاركة» (Share)</strong> واختر <strong className="text-white">«أي شخص لديه الرابط - مشاهد»</strong>.</div>
                          <div>3. انسخ رابط المجلد والصقه في الخانة بالأعلى واضغط <strong className="text-blue-300">«استعراض صور المجلد»</strong> لتظهر لك جميع الصور في شبكة وتختار منها لأي بطاقة بسهولة!</div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Single File Direct Import View */
                  <div className="max-w-xl mx-auto space-y-4 p-5 rounded-3xl border border-blue-500/20 bg-[#0e1422]">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600/20 text-blue-400">
                        <Cloud size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white">استيراد صورة واحدة برابط مباشر</h4>
                        <p className="text-xs text-slate-400">الصق رابط أي صورة من Drive مباشرة</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          رابط ملف Google Drive (أو معرّف الملف):
                        </label>
                        <input
                          type="text"
                          value={driveUrl}
                          onChange={(e) => setDriveUrl(e.target.value)}
                          placeholder="https://drive.google.com/file/d/1A2B3C.../view?usp=sharing"
                          dir="ltr"
                          className="w-full rounded-xl border border-blue-500/40 bg-black/50 p-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-400 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          اسم توضيحي للصورة (اختياري):
                        </label>
                        <input
                          type="text"
                          value={driveTitle}
                          onChange={(e) => setDriveTitle(e.target.value)}
                          placeholder="مثال: غلاف فعاليات مدارس العقيق 2026"
                          className="w-full rounded-xl border border-white/10 bg-black/30 p-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400"
                        />
                      </div>

                      {/* Real-time Drive Preview */}
                      {(() => {
                        const match = driveUrl.match(/\/file\/d\/([A-Za-z0-9_-]+)/) ||
                                      driveUrl.match(/[?&]id=([A-Za-z0-9_-]+)/) ||
                                      driveUrl.match(/\/d\/([A-Za-z0-9_-]+)/);
                        const fileId = match ? match[1] : (/^[A-Za-z0-9_-]{20,}$/.test(driveUrl.trim()) ? driveUrl.trim() : null);

                        if (!fileId) return null;
                        const previewUrl = `/api/drive-proxy/${fileId}`;

                        return (
                          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.05] p-3 space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                              <span className="flex items-center gap-1.5">
                                <Check size={14} />
                                تم التعرف على معرّف Drive: <code className="font-mono text-[11px] bg-black/40 px-1.5 py-0.5 rounded">{fileId}</code>
                              </span>
                              <span className="text-[10px] opacity-80">معاينة حية</span>
                            </div>

                            <div className="relative aspect-[16/9] max-h-48 w-full rounded-xl overflow-hidden bg-black/60 border border-white/10">
                              <img
                                src={previewUrl}
                                alt="Drive Preview"
                                className="h-full w-full object-contain"
                                onError={() => {
                                  toast.error("تأكد أن إذن المشاركة في Drive: «أي شخص لديه الرابط يمكنه العرض»");
                                }}
                              />
                            </div>
                          </div>
                        );
                      })()}

                      <div className="pt-2 flex gap-3">
                        <button
                          type="button"
                          onClick={() => addDriveMedia.mutate({ url: driveUrl.trim(), title: driveTitle.trim() || undefined })}
                          disabled={!driveUrl.trim() || addDriveMedia.isPending}
                          className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg transition active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {addDriveMedia.isPending ? <Loader2 className="animate-spin" size={16} /> : <Cloud size={16} />}
                          <span>{onSelect ? "استيراد وتطبيق هذه الصورة فوراً ✓" : "استيراد وحفظ في المكتبة 💾"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : activeTab === "presets" ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
                {filteredPresets.map((asset) => (
                  <article
                    key={asset.id}
                    onClick={() => handleSelectAsset(asset)}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-amber-400/20 bg-[#121722] hover:border-amber-400 hover:shadow-[0_10px_30px_rgba(248,202,20,0.2)] transition duration-200 cursor-pointer p-2"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-slate-900 border border-white/5">
                      <img
                        src={asset.url}
                        alt={asset.altText || asset.fileName}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="mt-2 text-right">
                      <h4 className="text-xs font-black text-slate-100 line-clamp-1 leading-snug">
                        {asset.fileName}
                      </h4>
                      <p className="text-[10px] text-amber-300/80 mt-0.5 truncate">
                        {asset.altText || "صورة من صروح العقيق"}
                      </p>
                    </div>

                    <div className="mt-2 pt-1 border-t border-white/[0.06]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectAsset(asset);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 py-1.5 px-3 text-xs font-black text-slate-950 shadow-md transition"
                      >
                        <Check size={13} />
                        <span>اختيار هذه الصورة</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
                {isLoading ? (
                  <div className="col-span-full flex h-48 items-center justify-center text-slate-500">
                    <Loader2 className="animate-spin" size={24} />
                  </div>
                ) : visibleUploadedAssets.length ? (
                  visibleUploadedAssets.map((asset) => (
                    <article
                      key={asset.id}
                      onClick={() => handleSelectAsset(asset)}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#121722] hover:border-amber-400 hover:shadow-xl transition duration-200 cursor-pointer p-2"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-slate-900 border border-white/5">
                        {asset.kind === "image" ? (
                          <img
                            src={asset.url}
                            alt={asset.altText || asset.fileName}
                            loading="lazy"
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        ) : asset.kind === "video" ? (
                          <video src={asset.url} className="h-full w-full object-cover" muted />
                        ) : asset.kind === "audio" ? (
                          <div className="flex h-full flex-col items-center justify-center gap-2 text-amber-200">
                            <Music2 size={28} />
                            <span className="text-[10px] font-bold">ملف صوتي</span>
                          </div>
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center gap-2 text-amber-300">
                            <Link2 size={24} />
                            <span className="text-[10px] font-bold">فيديو مضمّن</span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("هل تريد حذف هذا الملف نهائياً من المكتبة؟")) {
                              remove.mutate({ id: asset.id });
                            }
                          }}
                          disabled={remove.isPending}
                          title="حذف الملف"
                          className="absolute top-2 left-2 p-1.5 rounded-lg bg-black/70 text-red-400 hover:bg-red-500 hover:text-white transition opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      <div className="mt-2 text-right">
                        <h4 className="text-xs font-black text-slate-100 truncate">
                          {asset.fileName}
                        </h4>
                      </div>

                      <div className="mt-2 pt-1 border-t border-white/[0.06]">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectAsset(asset);
                          }}
                          className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 py-1.5 px-3 text-xs font-black text-slate-950 shadow-md transition"
                        >
                          <Check size={13} />
                          <span>اختيار وتطبيق</span>
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="col-span-full rounded-2xl border border-dashed border-slate-700 p-10 text-center text-sm text-slate-400">
                    <p className="font-bold">لا توجد ملفات مرفوعة بعد.</p>
                    <p className="text-xs text-slate-500 mt-1">
                      يمكنك رفع صور أو فيديوهات جديدة من اللوحة الجانبية، أو التبديل لتبويب «صور العقيق الجاهزة» بالأعلى.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right/Bottom Sidebar for Uploading */}
          <aside className="border-t border-white/[0.08] bg-[#090d14] p-4 lg:border-r lg:border-t-0 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="text-xs font-black text-amber-200 flex items-center gap-1.5">
                <Upload size={14} />
                <span>رفع صورة من جهازك</span>
              </div>

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-amber-400/35 bg-amber-400/[0.03] px-4 py-6 text-center transition hover:border-amber-400 hover:bg-amber-400/[0.08]">
                <input
                  type="file"
                  accept={
                    accept === "image"
                      ? "image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                      : accept === "video"
                      ? "video/mp4,video/webm,video/quicktime"
                      : accept === "audio"
                      ? "audio/mpeg,audio/mp4,audio/ogg,audio/wav,audio/webm"
                      : "image/png,image/jpeg,image/webp,image/gif,image/svg+xml,video/mp4,video/webm,video/quicktime,audio/mpeg,audio/mp4,audio/ogg,audio/wav,audio/webm"
                  }
                  className="sr-only"
                  onChange={handleFile}
                  disabled={upload.isPending}
                />
                <div className="rounded-xl bg-amber-400/15 p-2.5 text-amber-300">
                  {upload.isPending ? <Loader2 className="animate-spin" size={22} /> : <Upload size={22} />}
                </div>
                <span className="mt-2.5 text-xs font-black text-white">اضغط لاختيار ملف من جهازك</span>
                <span className="mt-1 text-[10px] text-slate-400">الصور حتى 8MB، والفيديو حتى 25MB</span>
              </label>

              {uploadStatus && (
                <div className="rounded-xl border border-amber-400/20 bg-amber-400/[.05] p-3">
                  <div className="mb-1 flex justify-between text-[10px] font-bold text-amber-200">
                    <span>{uploadStatus}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-1.5 bg-slate-800" />
                </div>
              )}

              {/* Quick Google Drive Import */}
              <div className="rounded-2xl border border-blue-500/30 bg-blue-500/[0.04] p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-blue-300">
                  <Cloud size={14} />
                  <span>استيراد من Google Drive</span>
                </div>
                <input
                  value={driveUrl}
                  onChange={(e) => setDriveUrl(e.target.value)}
                  dir="ltr"
                  placeholder="رابط ملف Drive..."
                  className="w-full rounded-lg border border-blue-500/30 bg-black/50 px-2.5 py-1.5 text-xs text-white outline-none focus:border-blue-400 font-mono"
                />
                <button
                  type="button"
                  onClick={() => addDriveMedia.mutate({ url: driveUrl.trim(), title: driveTitle.trim() || undefined })}
                  disabled={!driveUrl.trim() || addDriveMedia.isPending}
                  className="w-full rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-black text-white disabled:opacity-40 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  {addDriveMedia.isPending ? <Loader2 className="animate-spin" size={13} /> : <Cloud size={13} />}
                  <span>استيراد الصورة للمكتبة</span>
                </button>
              </div>

              {accept !== "image" && (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-200">
                    <Film size={14} />
                    <span>فيديو من YouTube أو Vimeo</span>
                  </div>
                  <input
                    value={embedTitle}
                    onChange={(e) => setEmbedTitle(e.target.value)}
                    placeholder="عنوان الفيديو"
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-black/40 px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-400"
                  />
                  <input
                    value={embedUrl}
                    onChange={(e) => setEmbedUrl(e.target.value)}
                    dir="ltr"
                    placeholder="https://youtube.com/..."
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-black/40 px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => addEmbed.mutate({ title: embedTitle.trim(), url: embedUrl.trim() })}
                    disabled={!embedTitle.trim() || !embedUrl.trim() || addEmbed.isPending}
                    className="mt-2 w-full rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-black text-slate-950 disabled:opacity-40"
                  >
                    {addEmbed.isPending ? "جارٍ الحفظ…" : "إضافة الرابط للمكتبة"}
                  </button>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.06] text-[10px] leading-5 text-slate-400">
              💡 يمكنك اختيار أي صورة بالنقر المباشر على زر «اختيار هذه الصورة» لتطبيقها واستبدالها في صفحتك فوراً.
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
