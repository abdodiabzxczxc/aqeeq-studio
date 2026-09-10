import { trpc } from "@/lib/trpc";
import { Progress } from "@/components/ui/progress";
import {
  Check,
  Film,
  FolderOpen,
  ImageIcon,
  Link2,
  Loader2,
  Music2,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

export type MediaAsset = {
  id: number;
  url: string;
  kind: "image" | "video" | "audio" | "embed";
  mimeType: string | null;
  fileName: string;
  fileSize: number | null;
  altText: string | null;
};

export const MEDIA_LIBRARY_Z_INDEX = 600;

export const PRESET_SCHOOL_MEDIA: Array<MediaAsset & { category?: string }> = [
  // ── الصروح والأغلفة ──────────────────────────────────────
  {
    id: 9001,
    url: "/covers/cover-about.jpg",
    kind: "image",
    mimeType: "image/jpeg",
    fileName: "غلاف مدارسنا — الصروح والمباني الأكاديمية",
    fileSize: null,
    altText: "مدارس العقيق الأهلية والدولية",
    category: "covers",
  },
  {
    id: 9002,
    url: "/covers/cover-admissions.jpg",
    kind: "image",
    mimeType: "image/jpeg",
    fileName: "غلاف القبول والتسجيل — رحلة الطالب المستقبلية",
    fileSize: null,
    altText: "القبول والتسجيل مدارس العقيق",
    category: "covers",
  },
  {
    id: 9003,
    url: "/covers/cover-accreditations.jpg",
    kind: "image",
    mimeType: "image/jpeg",
    fileName: "غلاف الاعتمادات والجوائز العالمية كوجنيا وكامبريدج",
    fileSize: null,
    altText: "الاعتمادات الدولية",
    category: "covers",
  },
  {
    id: 9008,
    url: "/covers/aqeeq-anthems-royal-cover.jpg",
    kind: "image",
    mimeType: "image/jpeg",
    fileName: "غلاف أثير العقيق والإنتاج الصوتي الملكي",
    fileSize: null,
    altText: "أثير وبودكاست العقيق",
    category: "covers",
  },

  // ── الطلاب والابتكار ──────────────────────────────────────
  {
    id: 9004,
    url: "/covers/student-lab-admissions.jpg",
    kind: "image",
    mimeType: "image/jpeg",
    fileName: "مختبرات العلوم والتقنية والابتكار الحديثة",
    fileSize: null,
    altText: "مختبر العلوم والتقنية",
    category: "tech",
  },
  {
    id: 9005,
    url: "/covers/first-lego-champions.png",
    kind: "image",
    mimeType: "image/png",
    fileName: "أبطال الروبوتات والذكاء الاصطناعي FLL",
    fileSize: null,
    altText: "أبطال الروبوتات",
    category: "tech",
  },
  {
    id: 9006,
    url: "/covers/student-excellence-about.jpg",
    kind: "image",
    mimeType: "image/jpeg",
    fileName: "طلاب العقيق — ريادة وتميز دراسي عالمي",
    fileSize: null,
    altText: "تفوق وريادة طلاب العقيق",
    category: "students",
  },
  {
    id: 9007,
    url: "/covers/student-robotics-accreditations.jpg",
    kind: "image",
    mimeType: "image/jpeg",
    fileName: "أولمبياد الروبوت الدولي WRO والبطولات العالمية",
    fileSize: null,
    altText: "مسابقة الروبوت الدولية",
    category: "tech",
  },

  // ── المقالات والأنشطة ──────────────────────────────────────
  {
    id: 9009,
    url: "/articles/ai-in-education-comprehensive-research.jpg",
    kind: "image",
    mimeType: "image/jpeg",
    fileName: "الذكاء الاصطناعي في التعليم والبحث العلمي",
    fileSize: null,
    altText: "الذكاء الاصطناعي في التعليم",
    category: "tech",
  },
  {
    id: 9010,
    url: "/articles/morning-radio-student-personality-development.jpg",
    kind: "image",
    mimeType: "image/jpeg",
    fileName: "الإذاعة المدرسية وبناء شخصية الطالب",
    fileSize: null,
    altText: "الإذاعة المدرسية",
    category: "students",
  },
  {
    id: 9011,
    url: "/articles/words-to-wonders-primary-english-journey.jpg",
    kind: "image",
    mimeType: "image/jpeg",
    fileName: "مسارات اللغة الإنجليزية والبرامج الدولية",
    fileSize: null,
    altText: "مسار اللغة الإنجليزية",
    category: "students",
  },
  {
    id: 9013,
    url: "/articles/arabic-language-and-technology-internet.jpg",
    kind: "image",
    mimeType: "image/jpeg",
    fileName: "اللغة العربية والتقنيات الرقمية الحديثة",
    fileSize: null,
    altText: "اللغة العربية والتقنية",
    category: "students",
  },
  {
    id: 9014,
    url: "/articles/is-quality-important-school-accreditation.jpg",
    kind: "image",
    mimeType: "image/jpeg",
    fileName: "معايير الجودة والاعتماد المدرسي الوطني",
    fileSize: null,
    altText: "الجودة والاعتماد",
    category: "covers",
  },

  // ── الهوية والشعارات ──────────────────────────────────────
  {
    id: 9012,
    url: "/alaqeeq-logo.png",
    kind: "image",
    mimeType: "image/png",
    fileName: "شعار مدارس العقيق الرسمي الأصلي",
    fileSize: null,
    altText: "شعار مدارس العقيق",
    category: "branding",
  },
  {
    id: 9015,
    url: "/alaqeeq-logo-national-dark.png",
    kind: "image",
    mimeType: "image/png",
    fileName: "شعار اليوم الوطني — الخلفية الداكنة",
    fileSize: null,
    altText: "شعار العقيق الوطني داكن",
    category: "branding",
  },
  {
    id: 9016,
    url: "/alaqeeq-logo-national-light.png",
    kind: "image",
    mimeType: "image/png",
    fileName: "شعار اليوم الوطني — الخلفية الفاتحة",
    fileSize: null,
    altText: "شعار العقيق الوطني فاتح",
    category: "branding",
  },
];

const PRESET_CATEGORIES = [
  { id: "all", label: "جميع الصور" },
  { id: "covers", label: "الصروح والأغلفة" },
  { id: "tech", label: "الروبوت والمختبرات" },
  { id: "students", label: "الطلاب والأنشطة" },
  { id: "branding", label: "الهوية والشعارات" },
] as const;

export default function MediaLibrary({
  open,
  onClose,
  onSelect,
  accept = "all",
  workspace = false,
}: {
  open: boolean;
  onClose: () => void;
  onSelect?: (asset: MediaAsset) => void;
  accept?: "all" | "image" | "video" | "audio";
  workspace?: boolean;
}) {
  const utils = trpc.useUtils();
  const { data: assets = [], isLoading } = trpc.visualEditor.media.list.useQuery(undefined, {
    enabled: open,
    refetchOnWindowFocus: false,
  });

  const [activeTab, setActiveTab] = useState<"presets" | "uploads" | "embed">("presets");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [embedTitle, setEmbedTitle] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close modal on Escape
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const upload = trpc.visualEditor.media.upload.useMutation({
    onSuccess: () => {
      setUploadProgress(100);
      setUploadStatus("اكتمل الرفع بنجاح ✓");
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

  const addEmbed = trpc.visualEditor.media.addEmbed.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ رابط الفيديو في المكتبة");
      setEmbedUrl("");
      setEmbedTitle("");
      void utils.visualEditor.media.list.invalidate();
      setActiveTab("uploads");
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

  const processUploadFile = (file: File) => {
    const allowed = [
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "audio/mpeg",
      "audio/mp4",
      "audio/ogg",
      "audio/wav",
      "audio/webm",
    ];
    if (!allowed.includes(file.type)) {
      toast.error("يرجى اختيار صورة مدعومة (PNG, JPG, WebP, SVG) أو فيديو أو ملف صوتي");
      return;
    }
    const isLargeMedia = file.type.startsWith("video/") || file.type.startsWith("audio/");
    const maxBytes = isLargeMedia ? 25 * 1024 * 1024 : 8 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error(isLargeMedia ? "الحد الأقصى للفيديو أو الصوت 25 ميجابايت" : "الحد الأقصى للصورة 8 ميجابايت");
      return;
    }

    const reader = new FileReader();
    setUploadProgress(15);
    setUploadStatus("جارٍ قراءة الملف…");
    reader.onload = () => {
      setUploadProgress(50);
      setUploadStatus("جارٍ معالجة ورفع الملف…");
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

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setActiveTab("uploads");
    processUploadFile(file);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setActiveTab("uploads");
      processUploadFile(file);
    }
  };

  const handleSelectAsset = (asset: MediaAsset) => {
    if (onSelect) {
      onSelect(asset);
      onClose();
    } else {
      void navigator.clipboard.writeText(asset.url);
      toast.success("تم نسخ رابط الوسائط إلى الحافظة!");
    }
  };

  // Filtered preset images
  const filteredPresets = useMemo(() => {
    if (accept !== "all" && accept !== "image") return [];
    return PRESET_SCHOOL_MEDIA.filter((item) => {
      const matchCat = selectedCategory === "all" || item.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.altText || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [accept, selectedCategory, searchQuery]);

  // Filtered uploaded assets
  const visibleUploadedAssets = useMemo(() => {
    return (assets as MediaAsset[]).filter((asset) => {
      const kindMatch = accept === "all" || asset.kind === accept || (accept === "video" && asset.kind === "embed");
      const searchMatch =
        !searchQuery.trim() ||
        asset.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (asset.altText || "").toLowerCase().includes(searchQuery.toLowerCase());
      return kindMatch && searchMatch;
    });
  }, [assets, accept, searchQuery]);

  if (!open) return null;

  const modalBody = (
    <div
      data-no-visual-edit="true"
      data-aq-editor-panel={workspace ? "media" : undefined}
      role="dialog"
      aria-modal="true"
      aria-label="مكتبة وسائط العقيق"
      className={
        workspace
          ? "fixed inset-x-3 bottom-3 z-[340] flex max-h-[85svh] flex-col overflow-hidden rounded-3xl border border-amber-400/30 bg-[#0e121a] shadow-2xl md:inset-y-0 md:left-0 md:right-auto md:max-h-none md:w-[min(540px,100vw)] md:rounded-none md:border-y-0 md:border-l-0 md:border-r"
          : "fixed inset-0 z-[600] flex items-center justify-center bg-black/85 p-3 sm:p-6 backdrop-blur-md animate-in fade-in duration-200 select-none"
      }
      style={workspace ? undefined : { zIndex: MEDIA_LIBRARY_Z_INDEX }}
      dir="rtl"
      onMouseDown={workspace ? undefined : (e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Hidden Global File Input */}
      <input
        ref={fileInputRef}
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
        className="hidden"
        onChange={handleFileInputChange}
        disabled={upload.isPending}
      />

      <section
        className={
          workspace
            ? "flex min-h-0 flex-1 flex-col overflow-hidden"
            : "flex flex-col w-full max-w-5xl h-[88vh] max-h-[820px] rounded-3xl border border-amber-400/30 bg-[#0c1017] shadow-2xl overflow-hidden min-w-0"
        }
        onMouseDown={(e) => e.stopPropagation()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* ── 1. Header ────────────────────────────────────────────── */}
        <header className="flex items-center justify-between border-b border-white/[0.08] px-5 sm:px-6 py-3.5 sm:py-4 bg-[#111622] shrink-0">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-300">
              <Sparkles size={19} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-300">مكتبة وسائط العقيق الرقمية</span>
                {onSelect && (
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-black text-emerald-300 flex items-center gap-1">
                    <Check size={11} />
                    <span>وضع الاستبدال المباشر نشط</span>
                  </span>
                )}
              </div>
              <h2 className="mt-0.5 text-sm sm:text-base font-black text-white">
                {onSelect ? "انقر على أي صورة لتطبيقها واستبدالها فوراً" : "تصفح الصور الرسمية أو ارفع ملفاتك الخاصة"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Upload Button directly in Header */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={upload.isPending}
              className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 px-3.5 py-2 text-xs font-black text-slate-950 shadow-md transition"
            >
              {upload.isPending ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
              <span>رفع صورة من جهازك</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
              aria-label="إغلاق النافذة"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* ── 2. Tab Bar & Search ───────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-5 sm:px-6 py-3 bg-[#0a0e14] shrink-0">
          {/* Main Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/40 border border-white/10">
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
              <span>صور العقيق الرسمية ({PRESET_SCHOOL_MEDIA.length})</span>
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
              <FolderOpen size={13} />
              <span>ملفاتي المرفوعة ({assets.length})</span>
            </button>

            {accept !== "image" && (
              <button
                type="button"
                onClick={() => setActiveTab("embed")}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-black transition ${
                  activeTab === "embed"
                    ? "bg-amber-400 text-slate-950 shadow-md"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Film size={13} />
                <span>فيديو مضمّن</span>
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px] flex-1 max-w-xs">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في الصور والملفات…"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] pr-9 pl-8 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* ── 3. Subheader: Category Chips for Presets or Dropzone for Uploads ── */}
        {activeTab === "presets" && (
          <div className="flex items-center gap-1.5 px-5 sm:px-6 py-2.5 border-b border-white/[0.06] bg-[#0d121c] overflow-x-auto scrollbar-hide shrink-0">
            <span className="text-[11px] font-bold text-slate-400 ml-2 shrink-0">التصنيف:</span>
            {PRESET_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-xl px-3 py-1 text-[11px] font-bold transition shrink-0 ${
                  selectedCategory === cat.id
                    ? "bg-white/15 text-amber-300 border border-amber-400/40"
                    : "text-slate-400 hover:text-slate-200 border border-transparent"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Upload Progress Bar if active */}
        {uploadStatus && (
          <div className="border-b border-amber-400/30 bg-amber-400/10 px-5 sm:px-6 py-2.5 shrink-0 animate-in fade-in">
            <div className="mb-1.5 flex justify-between text-xs font-black text-amber-200">
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={13} />
                <span>{uploadStatus}</span>
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-1.5 bg-slate-900" />
          </div>
        )}

        {/* ── 4. Main Content Scroll Area ────────────────────────────── */}
        <div className="flex-1 min-h-0 overflow-y-auto min-w-0 p-4 sm:p-6">
          {/* TAB 1: PRESET SCHOOL MEDIA */}
          {activeTab === "presets" && (
            <div>
              {filteredPresets.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 min-w-0">
                  {/* First Card in Presets: Direct Upload Shortcut */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-amber-400/30 bg-amber-400/[0.02] hover:border-amber-400 hover:bg-amber-400/[0.07] p-4 text-center cursor-pointer transition min-h-[190px]"
                  >
                    <div className="rounded-2xl bg-amber-400/15 p-3 text-amber-300 group-hover:scale-110 transition-transform">
                      <Plus size={22} />
                    </div>
                    <span className="mt-3 text-xs font-black text-white">رفع صورة خاصة</span>
                    <span className="mt-1 text-[10px] text-slate-400">من جهازك مباشرة</span>
                  </div>

                  {filteredPresets.map((asset) => (
                    <article
                      key={asset.id}
                      onClick={() => handleSelectAsset(asset)}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#121722]/90 hover:border-amber-400 hover:shadow-[0_12px_32px_rgba(248,202,20,0.18)] transition-all duration-200 cursor-pointer p-2.5 min-w-0"
                    >
                      {/* Image Preview Container */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-950 border border-white/5">
                        <img
                          src={asset.url}
                          alt={asset.altText || asset.fileName}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                          <span className="text-[10px] font-black text-amber-300 bg-black/70 backdrop-blur px-2 py-0.5 rounded-md border border-white/10">
                            صورة معتمدة ✓
                          </span>
                        </div>
                      </div>

                      {/* Card Details */}
                      <div className="mt-2.5 text-right min-w-0 px-1">
                        <h4 className="text-xs font-bold text-slate-100 truncate" title={asset.fileName}>
                          {asset.fileName}
                        </h4>
                        <p className="text-[10px] text-amber-300/75 truncate mt-0.5" title={asset.altText || undefined}>
                          {asset.altText || "من ألبوم مدارس العقيق"}
                        </p>
                      </div>

                      {/* Action Button */}
                      <div className="mt-3 pt-2 border-t border-white/[0.06]">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectAsset(asset);
                          }}
                          className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 py-1.5 px-3 text-xs font-black text-slate-950 shadow-md transition active:scale-95"
                        >
                          <Check size={13} />
                          <span>{onSelect ? "اختيار وتطبيق" : "نسخ الرابط"}</span>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                  <ImageIcon size={36} className="text-slate-600 mb-2" />
                  <p className="font-bold text-sm text-slate-300">لم يتم العثور على أي صور مطابقة</p>
                  <p className="text-xs text-slate-500 mt-1">جرّب البحث بكلمات أخرى أو اختر تصنيفاً مختلفاً</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                    }}
                    className="mt-4 rounded-xl border border-white/10 px-3.5 py-1.5 text-xs text-amber-300 hover:bg-white/5"
                  >
                    مسح التصفية
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: USER UPLOADED MEDIA */}
          {activeTab === "uploads" && (
            <div className="space-y-5">
              {/* Dropzone Banner */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition ${
                  isDragging
                    ? "border-amber-400 bg-amber-400/10 scale-[0.99]"
                    : "border-amber-400/35 bg-amber-400/[0.03] hover:border-amber-400 hover:bg-amber-400/[0.08]"
                }`}
              >
                <div className="rounded-2xl bg-amber-400/15 p-3 text-amber-300">
                  <Upload size={24} />
                </div>
                <h3 className="mt-3 text-sm font-black text-white">
                  اسحب الملفات وأفلتها هنا، أو اضغط للتصفح من جهازك
                </h3>
                <p className="mt-1 text-[11px] text-slate-400">
                  يدعم صور PNG, JPG, WebP, SVG حتى 8MB، والفيديو والصوت حتى 25MB
                </p>
              </div>

              {/* Uploaded Assets Grid */}
              {isLoading ? (
                <div className="flex h-48 items-center justify-center text-slate-500">
                  <Loader2 className="animate-spin text-amber-400" size={28} />
                </div>
              ) : visibleUploadedAssets.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 min-w-0">
                  {visibleUploadedAssets.map((asset) => (
                    <article
                      key={asset.id}
                      onClick={() => handleSelectAsset(asset)}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#121722]/90 hover:border-amber-400 hover:shadow-[0_12px_32px_rgba(248,202,20,0.18)] transition-all duration-200 cursor-pointer p-2.5 min-w-0"
                    >
                      {/* Media Preview Box */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-950 border border-white/5">
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
                          <div className="flex h-full flex-col items-center justify-center gap-1.5 text-amber-200">
                            <Music2 size={26} />
                            <span className="text-[10px] font-bold">ملف صوتي</span>
                          </div>
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center gap-1.5 text-amber-300">
                            <Link2 size={22} />
                            <span className="text-[10px] font-bold">فيديو مضمّن</span>
                          </div>
                        )}

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`هل تريد حذف ملف «${asset.fileName}» نهائياً من المكتبة؟`)) {
                              remove.mutate({ id: asset.id });
                            }
                          }}
                          disabled={remove.isPending}
                          title="حذف الملف"
                          className="absolute top-2 left-2 p-1.5 rounded-lg bg-black/75 text-red-400 hover:bg-red-500 hover:text-white transition opacity-0 group-hover:opacity-100 shadow-md"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      {/* Info */}
                      <div className="mt-2.5 text-right min-w-0 px-1">
                        <h4 className="text-xs font-bold text-slate-100 truncate" title={asset.fileName}>
                          {asset.fileName}
                        </h4>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {asset.mimeType || (asset.kind === "image" ? "صورة" : "ملف وسائط")}
                        </p>
                      </div>

                      {/* Button */}
                      <div className="mt-3 pt-2 border-t border-white/[0.06]">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectAsset(asset);
                          }}
                          className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 py-1.5 px-3 text-xs font-black text-slate-950 shadow-md transition active:scale-95"
                        >
                          <Check size={13} />
                          <span>{onSelect ? "اختيار وتطبيق" : "نسخ الرابط"}</span>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-slate-400">
                  <FolderOpen size={36} className="mx-auto text-slate-600 mb-2" />
                  <p className="font-bold text-sm text-slate-200">لا توجد ملفات مرفوعة حتى الآن</p>
                  <p className="text-xs text-slate-500 mt-1">
                    اضغط على مربع الرفع بالأعلى لاختيار صور من جهازك وحفظها في مكتبتك الخاصة.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-4 py-2 text-xs font-black text-slate-950 shadow-md transition"
                  >
                    <Upload size={14} />
                    <span>رفع أول صورة الآن</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EMBED VIDEO */}
          {activeTab === "embed" && (
            <div className="max-w-xl mx-auto py-6">
              <div className="rounded-2xl border border-white/10 bg-[#121722] p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm font-black text-amber-300">
                  <Film size={18} />
                  <span>تضمين فيديو من YouTube أو Vimeo</span>
                </div>
                <p className="text-xs text-slate-400">
                  ضع رابط الفيديو وعنوانه ليتم حفظه في مكتبة وسائط المدرسة واستخدامه في أي قسم أو مقال.
                </p>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">عنوان الفيديو</label>
                    <input
                      value={embedTitle}
                      onChange={(e) => setEmbedTitle(e.target.value)}
                      placeholder="مثال: احتفال مدارس العقيق باليوم الوطني"
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">رابط الفيديو (URL)</label>
                    <input
                      value={embedUrl}
                      onChange={(e) => setEmbedUrl(e.target.value)}
                      dir="ltr"
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => addEmbed.mutate({ title: embedTitle.trim(), url: embedUrl.trim() })}
                    disabled={!embedTitle.trim() || !embedUrl.trim() || addEmbed.isPending}
                    className="mt-3 w-full rounded-xl bg-amber-400 hover:bg-amber-300 py-2.5 px-4 text-xs font-black text-slate-950 shadow-md transition disabled:opacity-40"
                  >
                    {addEmbed.isPending ? "جارٍ الحفظ في المكتبة…" : "حفظ الفيديو في المكتبة"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── 5. Footer Status Bar ──────────────────────────────────── */}
        <footer className="flex items-center justify-between border-t border-white/[0.08] px-5 sm:px-6 py-3 bg-[#0a0e14] shrink-0 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>💡</span>
            <span className="text-[11px]">
              {onSelect
                ? "اضغط على زر «اختيار وتطبيق» لأي صورة لاستبدالها مباشرة وبدقة فائقة."
                : "يمكنك رفع صور جديدة في أي وقت لاستخدامها عبر كامل صفحات الموقع."}
            </span>
          </div>
          <div className="text-[11px] font-bold text-amber-300/80">
            {activeTab === "presets"
              ? `${filteredPresets.length} صورة رسمية`
              : `${visibleUploadedAssets.length} ملف خاص`}
          </div>
        </footer>
      </section>
    </div>
  );

  // If workspace mode (docked sidebar), render directly.
  // If modal mode (!workspace), portal directly into document.body to avoid parent containing blocks!
  if (workspace || typeof document === "undefined") {
    return modalBody;
  }

  return createPortal(modalBody, document.body);
}
