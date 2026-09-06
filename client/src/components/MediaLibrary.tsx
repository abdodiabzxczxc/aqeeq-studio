import { trpc } from "@/lib/trpc";
import { Progress } from "@/components/ui/progress";
import { Check, Copy, Film, ImageIcon, Link2, Loader2, Music2, Sparkles, Trash2, Upload, X } from "lucide-react";
import { ChangeEvent, useMemo, useState } from "react";
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
];

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
  const { data: assets = [], isLoading } = trpc.visualEditor.media.list.useQuery(undefined, { enabled: open, refetchOnWindowFocus: false });
  const [activeTab, setActiveTab] = useState<"presets" | "uploads">("presets");
  const [searchQuery, setSearchQuery] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [embedTitle, setEmbedTitle] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

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
      data-aq-editor-panel={workspace ? "media" : undefined}
      className={
        workspace
          ? "fixed inset-x-3 bottom-3 z-[340] flex max-h-[82svh] flex-col overflow-hidden rounded-3xl border border-amber-400/25 bg-[#0e121a] shadow-2xl md:inset-y-0 md:left-0 md:right-auto md:max-h-none md:w-[min(480px,100vw)] md:rounded-none md:border-y-0 md:border-l-0 md:border-r"
          : "fixed inset-0 z-[400] flex items-end justify-center bg-black/75 p-3 backdrop-blur-md sm:items-center"
      }
      style={workspace ? undefined : { zIndex: MEDIA_LIBRARY_Z_INDEX }}
      dir="rtl"
      onMouseDown={workspace ? undefined : onClose}
    >
      <section
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
          {/* Gallery Grid */}
          <div className="min-h-72 p-4">
            {activeTab === "presets" ? (
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
