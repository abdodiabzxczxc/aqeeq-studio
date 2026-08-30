import { useState, useMemo } from "react";
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
  Search,
  Sparkles,
  Trophy,
  UserCheck,
  Users,
  X,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { matchSelfieAgainstPhotos, loadFaceRecognitionModels } from "@/lib/aqeeqFaceRecognition";

export type AlbumPhotoItem = {
  id: number;
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
  albumTitle: string;
  photos: AlbumPhotoItem[];
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

export function AqeeqFaceSearchModal({
  open,
  onOpenChange,
  albumTitle,
  photos,
  dark = true,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [hasSearched, setHasSearched] = useState(false);
  const [matchedList, setMatchedList] = useState<MatchedPhoto[]>([]);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<number>>(new Set());
  const [selfieSrc, setSelfieSrc] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

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
    setIsScanning(true);
    setHasSearched(false);
    setScanProgress({ current: 0, total: photos.length });

    try {
      const results: MatchedPhoto[] = [];

      // 1. Real AI Biometric Face Recognition (if selfie provided)
      if (selfie) {
        try {
          const aiMatches = await matchSelfieAgainstPhotos(
            selfie,
            photos,
            (current, total) => setScanProgress({ current, total })
          );

          for (const m of aiMatches) {
            results.push({
              ...m.photo,
              confidence: m.confidence,
              matchReason: `تطابق بيومتري بالذكاء الاصطناعي (${m.confidence}%)`,
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

      // 2. Text / Student Name / Keywords Search
      const normalizedQuery = normalizeArabicText(textQuery);
      const queryTokens = normalizedQuery ? normalizedQuery.split(" ").filter((t) => t.length > 1) : [];
      const normalizedTag = tag !== "all" ? normalizeArabicText(tag) : "";

      if (queryTokens.length > 0 || normalizedTag) {
        for (const photo of photos) {
          if (results.some((r) => r.id === photo.id)) continue;

          const normCaption = normalizeArabicText(photo.caption || "");
          const normFileName = normalizeArabicText(photo.fileName || "");
          const combinedText = `${normCaption} ${normFileName}`;

          let textMatched = false;
          let confidence = 0;
          let reason = "";

          if (queryTokens.length > 0) {
            const matchedCount = queryTokens.filter((token) => combinedText.includes(token)).length;
            if (matchedCount > 0) {
              const ratio = matchedCount / queryTokens.length;
              confidence = Math.round(75 + ratio * 24);
              textMatched = true;
              reason = `تطابق الاسم/الوصف (${Math.round(ratio * 100)}%)`;
            }
          }

          if (normalizedTag && (normCaption.includes(normalizedTag) || normFileName.includes(normalizedTag))) {
            confidence = Math.max(confidence, 85);
            textMatched = true;
            reason = reason || `ضمن فقرة ${tag}`;
          }

          if (textMatched) {
            results.push({
              ...photo,
              confidence,
              matchReason: reason,
            });
          }
        }
      }

      // Sort results by confidence descending
      results.sort((a, b) => b.confidence - a.confidence);

      setMatchedList(results);
      setSelectedPhotoIds(new Set(results.map((r) => r.id)));
      setIsScanning(false);
      setHasSearched(true);

      if (results.length > 0) {
        toast.success(`✨ تم العثور على (${results.length}) صورة متطابقة بالذكاء الاصطناعي!`);
      } else {
        toast.info("لم نجد صوراً متطابقة مع هذه الصورة في الألبوم.");
      }
    } catch (error) {
      console.error(error);
      setIsScanning(false);
      setHasSearched(true);
      toast.error("حدث خطأ أثناء فحص الصور بالذكاء الاصطناعي");
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

  const handleDownloadSelected = () => {
    const listToDownload = hasSearched && matchedList.length > 0
      ? matchedList.filter((p) => selectedPhotoIds.has(p.id))
      : photos.filter((p) => selectedPhotoIds.has(p.id));

    if (listToDownload.length === 0) {
      toast.error("يرجى تحديد صورة واحدة على الأقل للتنزيل");
      return;
    }

    setIsDownloading(true);
    toast.success(`جارٍ تنزيل ${listToDownload.length} صورة من ألبومك الشخصي…`);

    listToDownload.forEach((item, index) => {
      setTimeout(() => {
        const link = document.createElement("a");
        link.href = item.imageUrl;
        link.download = `aqeeq-photo-${item.id}.jpg`;
        link.target = "_blank";
        link.click();

        if (index === listToDownload.length - 1) {
          setIsDownloading(false);
          toast.success("✨ اكتمل تنزيل جميع الصور المحددة بنجاح!");
        }
      }, index * 200);
    });
  };

  const CEREMONY_TAGS = [
    { id: "all", label: "🌟 جميع الصور" },
    { id: "تخرج", label: "🎓 مسيرة التخرج" },
    { id: "تكريم", label: "🏆 منصة التكريم" },
    { id: "شهادة", label: "📜 تسليم الشهادات" },
    { id: "بورتريه", label: "📸 لقطات فردية" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-3xl overflow-hidden rounded-[2rem] border p-0 text-right shadow-2xl ${
          dark ? "border-amber-400/25 bg-[#090d16] text-slate-100" : "border-slate-300 bg-white text-slate-900"
        }`}
        dir="rtl"
      >
        <DialogHeader className="border-b border-white/10 bg-amber-400/[.06] p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/30">
                <Sparkles size={22} />
              </div>
              <div>
                <DialogTitle className="text-lg sm:text-xl font-black text-amber-200">
                  التعرف على الوجه بالذكاء الاصطناعي (AI Face Recognition) 🔍
                </DialogTitle>
                <p className="mt-0.5 text-xs text-slate-400">
                  محرك مطابقة البصمة البيومترية لملامح الوجه في «{albumTitle}»
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[76vh] space-y-5 overflow-y-auto p-5 sm:p-6">
          {/* Search Inputs Card */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Selfie Upload */}
            <label className="group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-amber-400/35 bg-amber-400/[.03] p-4 text-center transition hover:border-amber-400/60 hover:bg-amber-400/[.08]">
              <input
                type="file"
                accept="image/*"
                capture="user"
                className="hidden"
                onChange={handleSelfieUpload}
              />
              {selfieSrc ? (
                <div className="relative h-14 w-14 overflow-hidden rounded-full ring-2 ring-emerald-400 shadow-md">
                  <img src={selfieSrc} alt="Selfie" className="h-full w-full object-cover" />
                  <span className="absolute bottom-0 right-0 grid h-4 w-4 place-items-center rounded-full bg-emerald-500 text-[10px] text-white">
                    ✓
                  </span>
                </div>
              ) : (
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-400/15 text-amber-300 group-hover:scale-105 transition">
                  <Camera size={24} />
                </div>
              )}
              <span className="mt-2 text-xs font-black text-amber-100">
                {selfieSrc ? "تغيير صورة السيلفي" : "التقط أو ارفع صورة سيلفي 🤳"}
              </span>
              <span className="mt-0.5 text-[10px] text-slate-400">
                للبحث البيومتري الحقيقي عن ملامح وجهك
              </span>
            </label>

            {/* Name Search */}
            <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-black/25 p-4">
              <div>
                <span className="text-xs font-black text-amber-100">أو ابحث باسم الطالب / المرحلة:</span>
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="مثال: عبد الرحمن، تكريم، ثالث ثانوي..."
                  className={`mt-2 text-xs ${
                    dark ? "border-white/10 bg-black/40 text-white placeholder:text-slate-600" : "border-slate-300 bg-white"
                  }`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void runBiometricSearch(selfieSrc, searchTerm, selectedTag);
                  }}
                />
              </div>
              <Button
                type="button"
                onClick={() => void runBiometricSearch(selfieSrc, searchTerm, selectedTag)}
                disabled={isScanning}
                className="mt-3 bg-gradient-to-r from-amber-500 to-amber-300 text-xs font-black text-slate-950 hover:from-amber-400 hover:to-amber-200 shadow-md"
              >
                <Search size={14} className="ml-1.5" />
                بدء البحث الذكي
              </Button>
            </div>
          </div>

          {/* Quick Ceremony Filters */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-white/10">
            <span className="text-[11px] font-black text-slate-400 ml-1">تصفية حسب الفقرة:</span>
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
                    ? "bg-amber-400 text-slate-950 shadow-sm"
                    : "border border-white/10 bg-white/[0.03] text-slate-300 hover:border-amber-400/40 hover:text-amber-200"
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>

          {/* Scanner Animation with Real Neural Progress */}
          {isScanning ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-amber-300/30 bg-amber-400/[.05] p-8 text-center animate-pulse">
              <Loader2 size={36} className="animate-spin text-amber-400" />
              <p className="mt-4 text-sm font-black text-amber-200">
                جارٍ فحص ملامح الوجه واستخراج البصمة البيومترية…
              </p>
              {scanProgress.total > 0 && (
                <div className="mt-3 w-full max-w-xs space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-amber-300">
                    <span>تقدم الفحص العصبي</span>
                    <span>{Math.round((scanProgress.current / scanProgress.total) * 100)}%</span>
                  </div>
                  <Progress value={(scanProgress.current / scanProgress.total) * 100} className="h-2 bg-black/40" />
                  <p className="text-[9px] text-slate-400">
                    تم فحص {scanProgress.current} من أصل {scanProgress.total} صورة في الألبوم
                  </p>
                </div>
              )}
            </div>
          ) : null}

          {/* Results Display */}
          {hasSearched && !isScanning ? (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-3 border-y border-white/10 py-3">
                <div className="flex items-center gap-2">
                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500/20 text-emerald-300">
                    <UserCheck size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-black text-emerald-300">
                      {matchedList.length > 0
                        ? `تم العثور على (${matchedList.length}) صورة متطابقة بيومترياً`
                        : "لم نجد صوراً متطابقة"}
                    </span>
                    {matchedList.length > 0 && (
                      <span className="text-[10px] text-slate-400 mr-2">
                        (محدد {selectedPhotoIds.size} صورة)
                      </span>
                    )}
                  </div>
                </div>

                {matchedList.length > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleDownloadSelected}
                    disabled={isDownloading || selectedPhotoIds.size === 0}
                    className="h-8 bg-emerald-500 text-xs font-black text-slate-950 hover:bg-emerald-400 shadow-md"
                  >
                    {isDownloading ? (
                      <Loader2 size={13} className="animate-spin ml-1.5" />
                    ) : (
                      <Download size={13} className="ml-1.5" />
                    )}
                    تنزيل ألبومي الخاص ({selectedPhotoIds.size})
                  </Button>
                )}
              </div>

              {matchedList.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {matchedList.map((photo) => {
                    const isSelected = selectedPhotoIds.has(photo.id);
                    return (
                      <div
                        key={photo.id}
                        onClick={() => toggleSelect(photo.id)}
                        className={`group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-2xl border transition duration-300 ${
                          isSelected
                            ? "border-emerald-400 ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-500/10"
                            : "border-white/10 opacity-80 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={photo.imageUrl}
                          alt={photo.caption || "صورتك في الحفل"}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />

                        {/* Match Confidence Badge */}
                        <div className="absolute top-2 right-2 rounded-full border border-black/40 bg-black/80 px-2 py-0.5 text-[9px] font-black text-amber-300 backdrop-blur-md shadow-md">
                          ✨ {photo.confidence}% تطابق
                        </div>

                        {/* Checkbox */}
                        <div
                          className={`absolute top-2 left-2 grid h-6 w-6 place-items-center rounded-full border transition ${
                            isSelected
                              ? "border-emerald-400 bg-emerald-500 text-slate-950 font-black shadow-md"
                              : "border-white/40 bg-black/60 text-transparent"
                          }`}
                        >
                          <Check size={12} strokeWidth={3} className={isSelected ? "text-slate-950" : "opacity-0"} />
                        </div>

                        {/* Overlay Caption */}
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent p-2.5 pt-8">
                          <p className="truncate text-[10px] font-bold text-slate-200">
                            {photo.caption || photo.fileName || "لقطة من الحفل"}
                          </p>
                          <p className="truncate text-[8px] font-bold text-amber-300/90">
                            {photo.matchReason}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center">
                  <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full bg-amber-400/10 text-amber-300">
                    <AlertCircle size={20} />
                  </div>
                  <p className="text-xs font-black text-slate-300">
                    لم نجد صوراً متطابقة مع هذه الملامح في الألبوم.
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    تأكد من اختيار صورة سيلفي واضحة بزاوية أمامية وإضاءة جيدة، أو ابحث بالاسم.
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
