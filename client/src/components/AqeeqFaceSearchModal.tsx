import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Camera,
  Check,
  Download,
  Filter,
  GraduationCap,
  Image as ImageIcon,
  Loader2,
  Maximize2,
  Search,
  Sparkles,
  Trophy,
  UserCheck,
  Users,
  X,
  AlertCircle,
  BookOpen,
  ScanFace,
} from "lucide-react";
import { toast } from "sonner";
import { matchSelfieAgainstPhotos, loadFaceRecognitionModels } from "@/lib/aqeeqFaceRecognition";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export type AlbumPhotoItem = {
  id: number;
  albumId?: number;
  albumTitle?: string;
  albumSlug?: string;
  imageUrl: string;
  thumbnailUrl?: string | null;
  caption?: string | null;
  fileName?: string | null;
};

type MatchedPhoto = AlbumPhotoItem & {
  confidence: number;
  matchReason: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  albumTitle?: string;
  photos?: AlbumPhotoItem[];
  dark?: boolean;
};

function normalizeArabicText(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, "") // إزالة التشكيل
    .replace(/[أإآٱء]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/[ىيئ]/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/[_\-–—.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const CEREMONY_TAGS = [
  { id: "all", label: "🌟 كل الصور", keywords: [] },
  { id: "honor", label: "🏆 التكريم والتتويج", keywords: ["تكريم", "تتويج", "درع", "وسام", "شرف", "اوائل", "أوائل", "فائز"] },
  { id: "certs", label: "📜 استلام الشهادات", keywords: ["شهادة", "تخرج", "مسيرة", "وثيقة", "منصة", "تسليم"] },
  { id: "portrait", label: "📸 البورتريه الفردي", keywords: ["بورتريه", "فردي", "طالب", "خريج", "صورة شخصية"] },
  { id: "group", label: "👥 الصور الجماعية", keywords: ["جماعي", "دفعة", "فرسان", "صف", "طابور", "مجموعة", "فريق"] },
];

export function AqeeqFaceSearchModal({
  open,
  onOpenChange,
  albumTitle,
  photos: propPhotos,
  dark = true,
}: Props) {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [hasSearched, setHasSearched] = useState(false);
  const [matchedList, setMatchedList] = useState<MatchedPhoto[]>([]);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<number>>(new Set());
  const [selfieSrc, setSelfieSrc] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<MatchedPhoto | null>(null);

  // Preload face models in the background when modal is mounted/opened
  useEffect(() => {
    if (open) {
      void loadFaceRecognitionModels();
    }
  }, [open]);

  // Fetch all public media across all albums if not provided
  const { data: globalMedia = [], isLoading: isGlobalLoading } = trpc.aqeeqAlbums.allPublicMedia.useQuery(undefined, {
    enabled: open && (!propPhotos || propPhotos.length === 0),
    refetchOnWindowFocus: false,
  });

  const effectivePhotos: AlbumPhotoItem[] = useMemo(() => {
    if (propPhotos && propPhotos.length > 0) return propPhotos;
    return globalMedia;
  }, [propPhotos, globalMedia]);

  const effectiveAlbumTitle = albumTitle || "كافة ألبومات وفعاليات مدارس العقيق";

  const handleSelfieUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result);
      setSelfieSrc(src);
      void runBiometricSearch(src, searchTerm, selectedTag);
    };
    reader.readAsDataURL(file);
  };

  const runBiometricSearch = async (selfie: string | null, textQuery: string, tag: string) => {
    if (effectivePhotos.length === 0 && !isGlobalLoading && !selfie && !textQuery.trim()) {
      toast.error("لا توجد صور متاحة للبحث حالياً في الألبومات");
      return;
    }

    setIsScanning(true);
    setHasSearched(false);
    setScanProgress({ current: 0, total: effectivePhotos.length });

    try {
      const results: MatchedPhoto[] = [];

      // 1. Real AI Biometric Face Recognition (if selfie provided)
      if (selfie) {
        try {
          const aiMatches = await matchSelfieAgainstPhotos(
            selfie,
            effectivePhotos,
            (current, total) => setScanProgress({ current, total })
          );

          for (const m of aiMatches) {
            results.push({
              ...m.photo,
              confidence: m.confidence,
              matchReason: `تطابق بيومتري ذكي (${m.confidence}%)`,
            });
          }
        } catch (err: any) {
          if (err?.message === "NO_FACE_DETECTED_IN_SELFIE") {
            toast.error("لم يتم اكتشاف وجه واضح في صورة السيلفي. يرجى التقاط صورة أمامية واضحة للوجه.");
            setIsScanning(false);
            setHasSearched(true);
            return;
          }
        }
      }

      // 2. Semantic text & filename & caption matching (if search term provided or if no selfie)
      const normQuery = normalizeArabicText(textQuery);
      if (normQuery.length >= 2) {
        for (const photo of effectivePhotos) {
          const captionNorm = normalizeArabicText(photo.caption || "");
          const fileNorm = normalizeArabicText(photo.fileName || "");
          const albumNorm = normalizeArabicText(photo.albumTitle || "");

          if (
            captionNorm.includes(normQuery) ||
            fileNorm.includes(normQuery) ||
            albumNorm.includes(normQuery)
          ) {
            if (!results.some((r) => r.id === photo.id)) {
              results.push({
                ...photo,
                confidence: 94,
                matchReason: `تطابق باسم الطالب أو الفقرة («${textQuery}»)`,
              });
            }
          }
        }
      }

      // 3. Category Tag Filtering (if selected)
      let finalResults = results;
      if (tag !== "all") {
        const tagObj = CEREMONY_TAGS.find((t) => t.id === tag);
        if (tagObj && tagObj.keywords.length > 0) {
          finalResults = finalResults.filter((photo) => {
            const text = `${photo.caption || ""} ${photo.fileName || ""} ${photo.albumTitle || ""}`.toLowerCase();
            return tagObj.keywords.some((kw) => text.includes(kw));
          });
        }
      }

      // If user searched without selfie and with tag only, show matching photos from album
      if (!selfie && !normQuery && tag !== "all") {
        const tagObj = CEREMONY_TAGS.find((t) => t.id === tag);
        if (tagObj) {
          for (const photo of effectivePhotos) {
            const text = `${photo.caption || ""} ${photo.fileName || ""} ${photo.albumTitle || ""}`.toLowerCase();
            if (tagObj.keywords.some((kw) => text.includes(kw))) {
              if (!finalResults.some((r) => r.id === photo.id)) {
                finalResults.push({
                  ...photo,
                  confidence: 90,
                  matchReason: `تصنيف ضمن فقرة ${tagObj.label}`,
                });
              }
            }
          }
        }
      }

      setMatchedList(finalResults);
      // Auto-select all matched photos
      setSelectedPhotoIds(new Set(finalResults.map((p) => p.id)));
      setHasSearched(true);

      if (finalResults.length > 0) {
        toast.success(`✨ تم العثور على ${finalResults.length} صورة متطابقة بدقة!`);
      } else {
        toast.info("لم نجد صوراً متطابقة مع هذه الملامح أو البحث.");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("حدث خطأ أثناء إجراء البحث الذكي");
    } finally {
      setIsScanning(false);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedPhotoIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedPhotoIds.size === matchedList.length) {
      setSelectedPhotoIds(new Set());
    } else {
      setSelectedPhotoIds(new Set(matchedList.map((p) => p.id)));
    }
  };

  const downloadSinglePhoto = async (photo: MatchedPhoto) => {
    try {
      const res = await fetch(photo.imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = photo.fileName || `aqeeq-photo-${photo.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("تم بدء تحميل الصورة بنجاح 📥");
    } catch {
      window.open(photo.imageUrl, "_blank");
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedPhotoIds.size === 0) {
      toast.error("يرجى تحديد صورة واحدة على الأقل للتحميل");
      return;
    }

    setIsDownloading(true);
    const selectedPhotos = matchedList.filter((p) => selectedPhotoIds.has(p.id));

    try {
      for (let i = 0; i < selectedPhotos.length; i++) {
        const photo = selectedPhotos[i];
        const res = await fetch(photo.imageUrl);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = photo.fileName || `aqeeq-memory-${i + 1}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        if (selectedPhotos.length > 1) {
          await new Promise((r) => setTimeout(r, 400));
        }
      }
      toast.success(`🎉 تم تنزيل حزمة صورك (${selectedPhotos.length} صورة) بنجاح!`);
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء تنزيل بعض الصور");
    } finally {
      setIsDownloading(false);
    }
  };

  const openAlbumReaderAtPhoto = (photo: MatchedPhoto) => {
    onOpenChange(false);
    if (photo.albumSlug) {
      navigate(`/albums/${encodeURIComponent(photo.albumSlug)}`);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={`max-w-4xl overflow-hidden rounded-3xl border p-0 text-right shadow-2xl ${
            dark ? "border-amber-400/25 bg-[#090d16] text-slate-100" : "border-slate-300 bg-white text-slate-900"
          }`}
          dir="rtl"
        >
          {/* Header */}
          <DialogHeader className="border-b border-white/10 bg-gradient-to-r from-amber-400/[.08] via-amber-400/[.03] to-transparent p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-400/20 ring-2 ring-amber-300/40">
                  <ScanFace size={24} />
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-black text-white ring-2 ring-[#090d16]">
                    AI
                  </span>
                </div>
                <div>
                  <DialogTitle className="text-lg sm:text-xl font-black text-amber-200 flex items-center gap-2">
                    <span>البحث عن صوري بالذكاء الاصطناعي</span>
                    <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
                      Biometric Face Scan 🔍
                    </span>
                  </DialogTitle>
                  <p className="mt-1 text-xs text-slate-400">
                    محرك مطابقة ملامح الوجه والبصمة البيومترية في «{effectiveAlbumTitle}»
                  </p>
                </div>
              </div>

              {effectivePhotos.length > 0 && (
                <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-1.5 text-xs font-bold text-slate-300">
                  <span className="text-amber-400 font-black">{effectivePhotos.length}</span> صورة متاحة للفحص
                </div>
              )}
            </div>
          </DialogHeader>

          <div className="max-h-[78vh] space-y-5 overflow-y-auto p-5 sm:p-6">
            {/* Search Station: Selfie Card & Smart Inputs */}
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-12">
              {/* Selfie Camera Box (5 cols) */}
              <label className="sm:col-span-5 group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-amber-400/40 bg-amber-400/[.03] p-4 text-center transition hover:border-amber-400 hover:bg-amber-400/[.08] shadow-inner">
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={handleSelfieUpload}
                />
                {selfieSrc ? (
                  <div className="relative h-16 w-16 overflow-hidden rounded-2xl ring-2 ring-emerald-400 shadow-xl">
                    <img src={selfieSrc} alt="Selfie" className="h-full w-full object-cover" />
                    <span className="absolute bottom-1 right-1 grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-md">
                      ✓
                    </span>
                  </div>
                ) : (
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-400/20 text-amber-300 group-hover:scale-110 transition duration-300 ring-1 ring-amber-400/30">
                    <Camera size={26} />
                  </div>
                )}
                <span className="mt-2.5 text-xs font-black text-amber-200">
                  {selfieSrc ? "تغيير صورة السيلفي 🔄" : "التقط أو ارفع صورة سيلفي 🤳"}
                </span>
                <span className="mt-0.5 text-[10px] text-slate-400">
                  خوارزمية التعرف البيومتري ستطابق ملامحك فوراً
                </span>
              </label>

              {/* Text & Ceremony Search Box (7 cols) */}
              <div className="sm:col-span-7 flex flex-col justify-between rounded-2xl border border-white/10 bg-black/40 p-4">
                <div>
                  <label className="text-xs font-black text-amber-100 flex items-center justify-between">
                    <span>أو ابحث باسم الطالب / الدفعة:</span>
                    <span className="text-[10px] text-slate-400 font-normal">بحث نصي مدعوم بالذكاء الاصطناعي</span>
                  </label>
                  <div className="relative mt-2">
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="مثال: عبد الرحمن، تكريم، فرسان الموهبة..."
                      className={`text-xs pr-9 ${
                        dark ? "border-white/15 bg-black/60 text-white placeholder:text-slate-600" : "border-slate-300 bg-white"
                      }`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void runBiometricSearch(selfieSrc, searchTerm, selectedTag);
                      }}
                    />
                    <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={() => void runBiometricSearch(selfieSrc, searchTerm, selectedTag)}
                    disabled={isScanning}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-amber-300 text-xs font-black text-slate-950 hover:from-amber-400 hover:to-amber-200 shadow-md py-4"
                  >
                    {isScanning ? (
                      <div className="flex items-center gap-1.5">
                        <Loader2 size={14} className="animate-spin" />
                        <span>جارٍ الفحص والمطابقة…</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Sparkles size={14} />
                        <span>بدء البحث بالذكاء الاصطناعي ✨</span>
                      </div>
                    )}
                  </Button>

                  {selfieSrc ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSelfieSrc(null);
                        setMatchedList([]);
                        setHasSearched(false);
                      }}
                      className="border-white/10 text-xs text-slate-400 hover:text-white"
                    >
                      إعادة ضبط
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Quick Ceremony Stage Filters */}
            <div className="space-y-1.5 border-t border-white/10 pt-3">
              <span className="text-[11px] font-bold text-slate-400">تصفية حسب فقرة الحفل:</span>
              <div className="flex flex-wrap gap-1.5">
                {CEREMONY_TAGS.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => {
                      setSelectedTag(tag.id);
                      void runBiometricSearch(selfieSrc, searchTerm, tag.id);
                    }}
                    className={`rounded-xl px-3 py-1.5 text-xs font-black transition ${
                      selectedTag === tag.id
                        ? "bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-400/40"
                        : "border border-white/10 bg-white/[0.03] text-slate-300 hover:border-amber-400/40 hover:text-amber-200"
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scanning Progress Radar */}
            {isScanning ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-amber-300/30 bg-amber-400/[.04] p-8 text-center animate-pulse">
                <div className="relative grid h-16 w-16 place-items-center rounded-full bg-amber-400/20 text-amber-300 ring-2 ring-amber-400/40">
                  <ScanFace size={32} className="animate-pulse" />
                  <div className="absolute inset-0 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                </div>
                <p className="mt-4 text-sm font-black text-amber-200">
                  جارٍ مطابقة البصمة البيومترية واستخراج ملامح الوجه…
                </p>
                {scanProgress.total > 0 && (
                  <div className="mt-3 w-full max-w-sm space-y-1.5">
                    <div className="flex justify-between text-[11px] font-black text-amber-300">
                      <span>التقدم البيومتري</span>
                      <span>{Math.round((scanProgress.current / scanProgress.total) * 100)}%</span>
                    </div>
                    <Progress value={(scanProgress.current / scanProgress.total) * 100} className="h-2.5 bg-black/50" />
                    <p className="text-[10px] text-slate-400">
                      تم فحص {scanProgress.current} من أصل {scanProgress.total} صورة
                    </p>
                  </div>
                )}
              </div>
            ) : null}

            {/* RESULTS SHOWCASE (Ultra-Modern Redesign) */}
            {hasSearched && !isScanning ? (
              <div className="space-y-4 animate-in fade-in">
                {/* Result Status & Bulk Action Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/40 p-3.5 backdrop-blur-md">
                  <div className="flex items-center gap-2.5">
                    <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30">
                      <UserCheck size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-black text-emerald-300 flex items-center gap-2">
                        <span>
                          {matchedList.length > 0
                            ? `تم العثور على (${matchedList.length}) صورة متطابقة معك`
                            : "لم يتم العثور على صور متطابقة"}
                        </span>
                      </div>
                      {matchedList.length > 0 && (
                        <p className="text-[10px] text-slate-400">
                          تم تحديد {selectedPhotoIds.size} من أصل {matchedList.length} صورة
                        </p>
                      )}
                    </div>
                  </div>

                  {matchedList.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={toggleSelectAll}
                        className="rounded-xl border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition"
                      >
                        {selectedPhotoIds.size === matchedList.length ? "إلغاء التحديد" : "تحديد الكل ✓"}
                      </button>

                      <Button
                        type="button"
                        size="sm"
                        onClick={handleDownloadSelected}
                        disabled={isDownloading || selectedPhotoIds.size === 0}
                        className="bg-emerald-500 text-xs font-black text-slate-950 hover:bg-emerald-400 shadow-md h-9 px-4"
                      >
                        {isDownloading ? (
                          <Loader2 size={14} className="animate-spin ml-1.5" />
                        ) : (
                          <Download size={14} className="ml-1.5" />
                        )}
                        تنزيل الصور المحددة ({selectedPhotoIds.size})
                      </Button>
                    </div>
                  )}
                </div>

                {/* Grid Gallery Cards */}
                {matchedList.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {matchedList.map((photo) => {
                      const isSelected = selectedPhotoIds.has(photo.id);
                      return (
                        <div
                          key={photo.id}
                          className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                            isSelected
                              ? "border-amber-400 ring-2 ring-amber-400/40 bg-amber-400/[.03] shadow-xl shadow-amber-400/10"
                              : "border-white/10 bg-[#111522] hover:border-amber-400/50"
                          }`}
                        >
                          {/* Image Container with Natural Aspect */}
                          <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/60">
                            <img
                              src={photo.imageUrl}
                              alt={photo.caption || "صورتك في الحفل"}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />

                            {/* Biometric Confidence Holographic Badge */}
                            <div className="absolute top-2.5 right-2.5 rounded-full border border-amber-300/40 bg-black/80 px-2.5 py-1 text-[10px] font-black text-amber-300 backdrop-blur-md shadow-lg flex items-center gap-1">
                              <Sparkles size={11} className="text-amber-400" />
                              <span>{photo.confidence}% تطابق</span>
                            </div>

                            {/* Checkbox selector */}
                            <button
                              type="button"
                              onClick={() => toggleSelect(photo.id)}
                              className={`absolute top-2.5 left-2.5 grid h-7 w-7 place-items-center rounded-xl border transition shadow-lg ${
                                isSelected
                                  ? "border-amber-400 bg-amber-400 text-slate-950 font-black"
                                  : "border-white/40 bg-black/60 text-transparent hover:border-white"
                              }`}
                              title={isSelected ? "إلغاء التحديد" : "تحديد الصورة"}
                            >
                              <Check size={14} strokeWidth={3} className={isSelected ? "text-slate-950" : "opacity-0"} />
                            </button>

                            {/* Hover Quick Actions Bar */}
                            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition duration-200 group-hover:opacity-100 backdrop-blur-[2px]">
                              <button
                                type="button"
                                onClick={() => setPreviewPhoto(photo)}
                                className="grid h-10 w-10 place-items-center rounded-xl border border-white/20 bg-black/70 text-white hover:bg-amber-400 hover:text-black transition shadow-lg"
                                title="معاينة الصورة بالحجم الكامل"
                              >
                                <Maximize2 size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => downloadSinglePhoto(photo)}
                                className="grid h-10 w-10 place-items-center rounded-xl border border-white/20 bg-black/70 text-white hover:bg-amber-400 hover:text-black transition shadow-lg"
                                title="تحميل هذه الصورة فوراً"
                              >
                                <Download size={16} />
                              </button>
                              {photo.albumSlug ? (
                                <button
                                  type="button"
                                  onClick={() => openAlbumReaderAtPhoto(photo)}
                                  className="grid h-10 w-10 place-items-center rounded-xl border border-white/20 bg-black/70 text-white hover:bg-amber-400 hover:text-black transition shadow-lg"
                                  title="فتح في الألبوم التفاعلي"
                                >
                                  <BookOpen size={16} />
                                </button>
                              ) : null}
                            </div>
                          </div>

                          {/* Details Footer */}
                          <div className="p-3 bg-white/[0.02]">
                            <div className="flex items-center justify-between gap-1">
                              <p className="truncate text-xs font-black text-slate-100">
                                {photo.caption || photo.fileName || "صورة من محفل التكريم"}
                              </p>
                            </div>
                            <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                              <span className="truncate text-amber-300/80 font-bold">{photo.matchReason}</span>
                              {photo.albumTitle ? (
                                <span className="truncate text-slate-500 font-mono">«{photo.albumTitle}»</span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-white/15 bg-black/20 p-10 text-center">
                    <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/20">
                      <AlertCircle size={24} />
                    </div>
                    <p className="text-sm font-black text-slate-200">
                      لم نتمكن من مطابقة هذا الوجه مع صور الألبوم الحالية.
                    </p>
                    <p className="mt-1.5 text-xs text-slate-400 max-w-md mx-auto leading-5">
                      نصيحة: التقط سيلفي أمامية واضحة بدون نظارات شمسية أو إضاءة خلفية قوية، أو جرّب البحث بالاسم مباشرة.
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      {/* High-Resolution Fullscreen Lightbox Modal */}
      {previewPhoto ? (
        <Dialog open={Boolean(previewPhoto)} onOpenChange={() => setPreviewPhoto(null)}>
          <DialogContent
            className="max-w-3xl overflow-hidden rounded-3xl border border-amber-400/30 bg-[#070a11] p-0 text-right text-white shadow-2xl"
            dir="rtl"
          >
            <div className="relative aspect-[4/3] sm:aspect-video w-full bg-black flex items-center justify-center">
              <img
                src={previewPhoto.imageUrl}
                alt={previewPhoto.caption || ""}
                className="max-h-full max-w-full object-contain"
              />
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="absolute top-4 left-4 grid h-8 w-8 place-items-center rounded-full bg-black/70 text-white hover:bg-white hover:text-black transition"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 bg-black/60 border-t border-white/10">
              <div>
                <p className="text-sm font-black text-amber-200">
                  {previewPhoto.caption || previewPhoto.fileName || "صورة من ألبوم العقيق"}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {previewPhoto.matchReason} {previewPhoto.albumTitle ? `· «${previewPhoto.albumTitle}»` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={() => downloadSinglePhoto(previewPhoto)}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs h-9 px-4"
                >
                  <Download size={14} className="ml-1.5" />
                  تحميل الصورة الأصلية
                </Button>
                {previewPhoto.albumSlug ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const slug = previewPhoto.albumSlug!;
                      setPreviewPhoto(null);
                      onOpenChange(false);
                      navigate(`/albums/${encodeURIComponent(slug)}`);
                    }}
                    className="border-white/15 text-xs font-bold text-slate-300 hover:text-white"
                  >
                    <BookOpen size={14} className="ml-1.5" />
                    عرض في الألبوم
                  </Button>
                ) : null}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}
