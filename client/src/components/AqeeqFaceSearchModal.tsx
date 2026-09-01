import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Camera,
  Check,
  Download,
  Image as ImageIcon,
  Loader2,
  Maximize2,
  Search,
  Sparkles,
  UserCheck,
  X,
  ScanFace,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { matchSelfieAgainstPhotos, loadFaceRecognitionModels } from "@/lib/aqeeqFaceRecognition";
import { getAqeeqAlbumImageSource } from "@/lib/aqeeqAlbumMedia";
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
  { id: "all", label: "🌟 الكل", keywords: [] },
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
  const [activeTab, setActiveTab] = useState<"selfie" | "text">("selfie");
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

  useEffect(() => {
    if (open) {
      void loadFaceRecognitionModels();
    }
  }, [open]);

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
              matchReason: `تطابق بيومتري (${m.confidence}%)`,
            });
          }
        } catch (err: any) {
          if (err?.message === "NO_FACE_DETECTED_IN_SELFIE") {
            toast.error("لم يتم اكتشاف وجه واضح في الصورة.");
            setIsScanning(false);
            setHasSearched(true);
            return;
          }
        }
      }

      const normQuery = normalizeArabicText(textQuery);
      if (normQuery.length >= 2) {
        for (const photo of effectivePhotos) {
          const captionNorm = normalizeArabicText(photo.caption || "");
          const fileNorm = normalizeArabicText(photo.fileName || "");
          const albumNorm = normalizeArabicText(photo.albumTitle || "");

          if (captionNorm.includes(normQuery) || fileNorm.includes(normQuery) || albumNorm.includes(normQuery)) {
            if (!results.some((r) => r.id === photo.id)) {
              results.push({
                ...photo,
                confidence: 94,
                matchReason: `تطابق نصي («${textQuery}»)`,
              });
            }
          }
        }
      }

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

      if (!selfie && !normQuery && tag !== "all") {
        const tagObj = CEREMONY_TAGS.find((t) => t.id === tag);
        if (tagObj) {
          for (const photo of effectivePhotos) {
            const text = `${photo.caption || ""} ${photo.fileName || ""}`.toLowerCase();
            if (tagObj.keywords.some((kw) => text.includes(kw))) {
              if (!finalResults.some((r) => r.id === photo.id)) {
                finalResults.push({
                  ...photo,
                  confidence: 90,
                  matchReason: `تصنيف: ${tagObj.label}`,
                });
              }
            }
          }
        }
      }

      setMatchedList(finalResults);
      setSelectedPhotoIds(new Set(finalResults.map((p) => p.id)));
      setHasSearched(true);

      if (finalResults.length > 0) {
        toast.success(`✨ تم العثور على ${finalResults.length} صورة متطابقة!`);
      } else {
        toast.info("لم نجد صوراً متطابقة.");
      }
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ أثناء البحث");
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

  const downloadSelectedPhotos = async () => {
    const selectedPhotos = matchedList.filter((p) => selectedPhotoIds.has(p.id));
    if (selectedPhotos.length === 0) {
      toast.error("يرجى اختيار صورة واحدة على الأقل للتنزيل");
      return;
    }

    setIsDownloading(true);
    toast.info(`جارٍ تجهيز وتحميل ${selectedPhotos.length} صورة…`);

    try {
      for (let i = 0; i < selectedPhotos.length; i++) {
        const photo = selectedPhotos[i];
        const res = await fetch(photo.imageUrl);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = photo.fileName || `aqeeq-${i + 1}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        await new Promise((r) => setTimeout(r, 400));
      }
      toast.success("تم التنزيل بنجاح!");
    } catch {
      toast.error("خطأ أثناء التنزيل");
    } finally {
      setIsDownloading(false);
    }
  };

  const resetAll = () => {
    setSelfieSrc(null);
    setSearchTerm("");
    setSelectedTag("all");
    setMatchedList([]);
    setHasSearched(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={`w-[calc(100vw-1.5rem)] sm:w-[calc(100vw-3rem)] max-w-4xl max-h-[90vh] overflow-hidden rounded-[2rem] border p-0 text-right shadow-2xl backdrop-blur-2xl transition-all ${
            dark
              ? "border-amber-400/25 bg-[#090d16]/95 text-slate-100 shadow-[0_24px_80px_rgba(0,0,0,0.8)]"
              : "border-slate-200 bg-white/95 text-slate-900 shadow-[0_24px_80px_rgba(0,0,0,0.15)]"
          }`}
          dir="rtl"
        >
          <DialogHeader
            className={`border-b p-5 sm:p-6 transition-colors ${
              dark
                ? "border-white/10 bg-gradient-to-r from-amber-400/[.08] via-amber-400/[.02] to-transparent"
                : "border-slate-100 bg-gradient-to-r from-amber-100/60 via-amber-50/30 to-transparent"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300/40">
                  <ScanFace size={22} />
                  <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-black text-white ring-2 ring-[#090d16]">
                    AI
                  </span>
                </div>
                <div>
                  <DialogTitle className={`text-base sm:text-lg font-black flex items-center gap-2 ${dark ? "text-amber-200" : "text-amber-950"}`}>
                    <span>البحث الذكي عن صوري بالوجه</span>
                    <span className="hidden sm:inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[9px] font-black text-amber-500">
                      AI Biometric Scanner
                    </span>
                  </DialogTitle>
                  <p className={`mt-0.5 text-xs truncate max-w-sm sm:max-w-md ${dark ? "text-slate-400" : "text-slate-600"}`}>
                    فحص ومطابقة ملامح الوجه في «{effectiveAlbumTitle}»
                  </p>
                </div>
              </div>

              {effectivePhotos.length > 0 && (
                <div
                  className={`rounded-xl border px-3 py-1 text-xs font-bold ${
                    dark ? "border-white/10 bg-black/40 text-slate-300" : "border-slate-200 bg-slate-100 text-slate-700"
                  }`}
                >
                  <span className="text-amber-500 font-black">{effectivePhotos.length}</span> صورة مفهرسة
                </div>
              )}
            </div>

            <div className="mt-4 flex rounded-xl border p-1 max-w-md bg-black/10 border-black/5 dark:bg-white/5 dark:border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab("selfie")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-black transition ${
                  activeTab === "selfie"
                    ? dark
                      ? "bg-amber-400 text-slate-950 shadow-sm"
                      : "bg-[#08467d] text-white shadow-sm"
                    : dark
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-600 hover:text-black"
                }`}
              >
                <ScanFace size={14} />
                <span>المسح بالصورة (سيلفي)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("text")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-black transition ${
                  activeTab === "text"
                    ? dark
                      ? "bg-amber-400 text-slate-950 shadow-sm"
                      : "bg-[#08467d] text-white shadow-sm"
                    : dark
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-600 hover:text-black"
                }`}
              >
                <Search size={14} />
                <span>البحث بالاسم / الدفعة</span>
              </button>
            </div>
          </DialogHeader>

          <div className="max-h-[68vh] overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-none">
            {activeTab === "selfie" && !hasSearched && !isScanning && (
              <div className="space-y-4">
                <input
                  type="file"
                  id="face-search-gallery-input"
                  accept="image/*"
                  className="hidden"
                  onChange={handleSelfieUpload}
                />
                <input
                  type="file"
                  id="face-search-camera-input"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={handleSelfieUpload}
                />

                {selfieSrc ? (
                  <div
                    className={`rounded-2xl border p-6 text-center flex flex-col items-center justify-center gap-3 ${
                      dark
                        ? "border-emerald-500/30 bg-emerald-500/[0.05]"
                        : "border-emerald-300 bg-emerald-50/70"
                    }`}
                  >
                    <div className="relative h-24 w-24 overflow-hidden rounded-2xl ring-4 ring-emerald-500 shadow-xl">
                      <img src={selfieSrc} alt="Uploaded Face" className="h-full w-full object-cover" />
                      <span className="absolute bottom-1 right-1 grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-white font-black text-xs shadow-md">
                        ✓
                      </span>
                    </div>
                    <div>
                      <h4 className={`text-sm font-black ${dark ? "text-emerald-300" : "text-emerald-900"}`}>
                        تم التقاط وتجهيز ملامح الوجه بنجاح ✨
                      </h4>
                      <p className={`text-xs mt-1 ${dark ? "text-slate-400" : "text-slate-600"}`}>
                        جاهز للمطابقة البيومترية في كل الألبومات
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2.5 mt-2">
                      <Button
                        type="button"
                        onClick={() => void runBiometricSearch(selfieSrc, searchTerm, selectedTag)}
                        className="bg-emerald-500 text-white font-black text-xs px-6 py-2 rounded-xl shadow-md hover:bg-emerald-600 active:scale-95"
                      >
                        <Sparkles size={14} className="ml-1.5" /> بدء الفحص الآن
                      </Button>
                      <label
                        htmlFor="face-search-gallery-input"
                        className={`cursor-pointer rounded-xl border px-4 py-2 text-xs font-black transition ${
                          dark
                            ? "border-white/15 bg-white/5 text-slate-300 hover:bg-white/10"
                            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        تغيير الصورة
                      </label>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`rounded-2xl border p-6 sm:p-8 text-center transition-all ${
                      dark
                        ? "border-amber-400/30 bg-amber-400/[0.03] hover:border-amber-400/60"
                        : "border-amber-400/40 bg-amber-50/50 hover:border-amber-500"
                    }`}
                  >
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-400/20 text-amber-500 ring-1 ring-amber-400/40 mb-3">
                      <ScanFace size={28} />
                    </div>
                    <h3 className={`text-base font-black ${dark ? "text-white" : "text-slate-900"}`}>
                      ارفع صورتك لمطابقة ملامحك بالذكاء الاصطناعي
                    </h3>
                    <p className={`text-xs mt-1.5 max-w-md mx-auto ${dark ? "text-slate-400" : "text-slate-600"}`}>
                      اختر صورة واضحة لوجهك من هاتفك أو التقط سيلفي، وسيقوم الذكاء الاصطناعي باستخراج كافة صورك في الفعاليات فوراً.
                    </p>

                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                      <label
                        htmlFor="face-search-gallery-input"
                        className="w-full sm:flex-1 flex items-center justify-center gap-2 cursor-pointer rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 py-3 px-4 text-xs font-black text-slate-950 shadow-md transition hover:scale-[1.02] active:scale-95"
                      >
                        <ImageIcon size={16} />
                        <span>اختيار من استوديو الصور</span>
                      </label>

                      <label
                        htmlFor="face-search-camera-input"
                        className={`w-full sm:flex-1 flex items-center justify-center gap-2 cursor-pointer rounded-xl border py-3 px-4 text-xs font-black transition active:scale-95 shadow-sm ${
                          dark
                            ? "border-amber-400/40 bg-black/40 text-amber-300 hover:bg-amber-400/10"
                            : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        <Camera size={16} />
                        <span>التقاط سيلفي 🤳</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "text" && !hasSearched && !isScanning && (
              <div className="space-y-4">
                <div
                  className={`rounded-2xl border p-5 sm:p-6 ${
                    dark ? "border-white/10 bg-black/30" : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <label className={`text-xs font-black block mb-2 ${dark ? "text-amber-200" : "text-slate-900"}`}>
                    ابحث باسم الطالب، الدفعة، أو عنوان الفقرة:
                  </label>
                  <div className="relative">
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="مثال: عبد الرحمن، تكريم الأوائل، فرسان الموهبة..."
                      className={`text-xs pr-9 h-11 rounded-xl ${
                        dark
                          ? "border-white/15 bg-black/50 text-white placeholder:text-slate-500"
                          : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
                      }`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void runBiometricSearch(selfieSrc, searchTerm, selectedTag);
                      }}
                    />
                    <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>

                  <div className="mt-4">
                    <span className={`text-[11px] font-bold block mb-2 ${dark ? "text-slate-400" : "text-slate-600"}`}>
                      أو تصفح حسب فقرة الحفل:
                    </span>
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
                              ? dark
                                ? "bg-amber-400 text-slate-950 shadow-sm"
                                : "bg-[#08467d] text-white shadow-sm"
                              : dark
                              ? "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {tag.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => void runBiometricSearch(selfieSrc, searchTerm, selectedTag)}
                    disabled={isScanning || (!searchTerm.trim() && selectedTag === "all")}
                    className="w-full mt-4 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-xs py-2.5 rounded-xl shadow-md"
                  >
                    <Search size={14} className="ml-1.5" />
                    عرض الصور المطابقة
                  </Button>
                </div>
              </div>
            )}

            {isScanning && (
              <div
                className={`rounded-2xl border p-8 text-center flex flex-col items-center justify-center ${
                  dark ? "border-amber-400/30 bg-amber-400/[0.04]" : "border-amber-300 bg-amber-50/80"
                }`}
              >
                <div className="relative grid h-20 w-20 place-items-center rounded-full bg-amber-400/20 text-amber-500 ring-4 ring-amber-400/30 mb-4">
                  <ScanFace size={36} className="animate-pulse" />
                  <div className="absolute inset-0 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                </div>
                <h4 className={`text-base font-black ${dark ? "text-amber-200" : "text-amber-950"}`}>
                  جارٍ فحص ومطابقة ملامح الوجه بيومترياً…
                </h4>
                <p className={`text-xs mt-1 ${dark ? "text-slate-400" : "text-slate-600"}`}>
                  يتم مقارنة تفاصيل الملامح مع كافة ألبومات المدارس
                </p>

                {scanProgress.total > 0 && (
                  <div className="mt-4 w-full max-w-xs space-y-2">
                    <div className={`flex justify-between text-xs font-black ${dark ? "text-amber-300" : "text-amber-900"}`}>
                      <span>نسبة الفحص</span>
                      <span>{Math.round((scanProgress.current / scanProgress.total) * 100)}%</span>
                    </div>
                    <Progress
                      value={(scanProgress.current / scanProgress.total) * 100}
                      className={`h-2 rounded-full ${dark ? "bg-black/50" : "bg-slate-200"}`}
                    />
                    <span className={`text-[10px] block ${dark ? "text-slate-400" : "text-slate-500"}`}>
                      تمت معالجة {scanProgress.current} من {scanProgress.total} صورة
                    </span>
                  </div>
                )}
              </div>
            )}

            {hasSearched && !isScanning && (
              <div className="space-y-4">
                <div
                  className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-3.5 ${
                    dark ? "border-white/10 bg-black/40" : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-amber-500">
                      ✨ وجدنا لك {matchedList.length} صورة مطابقة
                    </span>
                    {matchedList.length > 0 && (
                      <span className={`text-[11px] ${dark ? "text-slate-400" : "text-slate-500"}`}>
                        ({selectedPhotoIds.size} محددة)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {matchedList.length > 0 && (
                      <button
                        type="button"
                        onClick={toggleSelectAll}
                        className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                          dark
                            ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {selectedPhotoIds.size === matchedList.length ? "إلغاء تحديد الكل" : "تحديد الكل"}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={resetAll}
                      className={`inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                        dark
                          ? "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:text-black"
                      }`}
                    >
                      <RotateCcw size={12} />
                      <span>بحث جديد</span>
                    </button>
                  </div>
                </div>

                {matchedList.length === 0 ? (
                  <div
                    className={`rounded-2xl border p-8 text-center ${
                      dark ? "border-white/10 bg-black/20 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    <ScanFace size={32} className="mx-auto mb-2 opacity-40 text-amber-400" />
                    <p className="text-sm font-black">لم يتم العثور على صور متطابقة مع هذه الملامح</p>
                    <p className="text-xs mt-1 opacity-70">
                      جرب التقاط صورة أمامية بإضاءة واضحة أو البحث باسم الطالب
                    </p>
                    <Button
                      type="button"
                      onClick={resetAll}
                      className="mt-4 bg-amber-400 text-slate-950 font-black text-xs px-5 py-2 rounded-xl"
                    >
                      إعادة المحاولة
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {matchedList.map((photo) => {
                      const isSelected = selectedPhotoIds.has(photo.id);
                      return (
                        <div
                          key={photo.id}
                          onClick={() => toggleSelect(photo.id)}
                          className={`group relative aspect-[4/3] rounded-2xl overflow-hidden border-2 cursor-pointer transition-all hover:scale-[1.02] shadow-sm ${
                            isSelected
                              ? "border-amber-400 ring-2 ring-amber-400/40"
                              : dark
                              ? "border-white/10 hover:border-white/30"
                              : "border-slate-200 hover:border-slate-400"
                          }`}
                        >
                          <img
                            src={photo.imageUrl}
                            alt={photo.caption || photo.fileName || "صورة مطابقة"}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-90" />

                          <div className="absolute top-2 right-2">
                            <span
                              className={`grid h-6 w-6 place-items-center rounded-lg border text-xs font-black shadow-md transition ${
                                isSelected
                                  ? "bg-amber-400 border-amber-400 text-slate-950 scale-105"
                                  : "bg-black/50 border-white/30 text-transparent"
                              }`}
                            >
                              <Check size={14} />
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewPhoto(photo);
                            }}
                            className="absolute top-2 left-2 grid h-6 w-6 place-items-center rounded-lg bg-black/60 border border-white/20 text-white opacity-0 group-hover:opacity-100 transition"
                            title="معاينة بالحجم الكامل"
                          >
                            <Maximize2 size={12} />
                          </button>

                          <div className="absolute bottom-2 inset-x-2 text-right">
                            <span className="inline-block rounded-md bg-amber-400/90 text-slate-950 font-black text-[9px] px-1.5 py-0.5 shadow-sm">
                              ✨ تطابق {photo.confidence}%
                            </span>
                            {photo.caption && (
                              <p className="text-[10px] text-white font-bold truncate mt-0.5">
                                {photo.caption}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {hasSearched && matchedList.length > 0 && !isScanning && (
            <div
              className={`border-t p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 ${
                dark ? "border-white/10 bg-[#090d16]" : "border-slate-100 bg-slate-50"
              }`}
            >
              <div className="text-xs">
                <span className={`font-bold ${dark ? "text-slate-300" : "text-slate-700"}`}>
                  تم تحديد <span className="text-amber-500 font-black">{selectedPhotoIds.size}</span> من {matchedList.length} صورة
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={downloadSelectedPhotos}
                  disabled={isDownloading || selectedPhotoIds.size === 0}
                  className="bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-md hover:from-amber-400 hover:to-amber-300 active:scale-95"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 size={14} className="ml-1.5 animate-spin" />
                      جارٍ التنزيل…
                    </>
                  ) : (
                    <>
                      <Download size={14} className="ml-1.5" />
                      تحميل الصور المحددة ({selectedPhotoIds.size})
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {previewPhoto && (
        <Dialog open={Boolean(previewPhoto)} onOpenChange={(o) => { if (!o) setPreviewPhoto(null); }}>
          <DialogContent
            className="max-w-4xl border border-white/20 bg-black/95 p-3 text-right rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl"
            dir="rtl"
          >
            <div className="relative flex flex-col items-center justify-center max-h-[85vh]">
              <img
                src={previewPhoto.imageUrl}
                alt={previewPhoto.caption || "معاينة الصورة"}
                className="max-h-[72vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
              />

              <div className="w-full mt-3 flex flex-wrap items-center justify-between gap-3 px-2">
                <div>
                  <span className="text-xs font-black text-amber-400 block">
                    ✨ تطابق بيومتري {previewPhoto.confidence}%
                  </span>
                  {previewPhoto.caption && (
                    <span className="text-xs text-white/80 font-bold block">{previewPhoto.caption}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={previewPhoto.imageUrl}
                    download={previewPhoto.fileName || "aqeeq-photo.jpg"}
                    className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-xs font-black text-slate-950 shadow-md hover:bg-amber-300 transition"
                  >
                    <Download size={14} />
                    <span>تحميل HD</span>
                  </a>
                  {previewPhoto.albumSlug && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const slug = previewPhoto.albumSlug!;
                        setPreviewPhoto(null);
                        onOpenChange(false);
                        navigate(`/albums/${encodeURIComponent(slug)}`);
                      }}
                      className="border-white/20 bg-white/5 text-xs font-bold text-slate-200 hover:bg-white/10"
                    >
                      <BookOpen size={14} className="ml-1.5" />
                      عرض في الألبوم
                    </Button>
                  )}
                  <button
                    type="button"
                    onClick={() => setPreviewPhoto(null)}
                    className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/20 transition"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
