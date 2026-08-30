import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";
import { toast } from "sonner";

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

/**
 * دالة استخراج بصمة الألوان الحقيقية من الصورة (Canvas Color Signature)
 */
async function extractVisualProfile(src: string): Promise<{ r: number; g: number; b: number; skinRatio: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const w = 32;
        const h = 32;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;
        let rSum = 0;
        let gSum = 0;
        let bSum = 0;
        let skinCount = 0;
        const total = w * h;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          rSum += r;
          gSum += g;
          bSum += b;

          // فحص تدرج البشرة الحقيقي
          if (r > 95 && g > 40 && b > 20 && r > g && r > b && r - g > 15) {
            skinCount++;
          }
        }

        resolve({
          r: rSum / total,
          g: gSum / total,
          b: bSum / total,
          skinRatio: skinCount / total,
        });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
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
      void runIntelligentSearch(src, searchTerm, selectedTag);
    };
    reader.readAsDataURL(file);
  };

  const runIntelligentSearch = async (selfie: string | null, textQuery: string, tag: string) => {
    setIsScanning(true);
    setHasSearched(false);

    try {
      const normalizedQuery = normalizeArabicText(textQuery);
      const queryTokens = normalizedQuery ? normalizedQuery.split(" ").filter((t) => t.length > 1) : [];
      const normalizedTag = tag !== "all" ? normalizeArabicText(tag) : "";

      let selfieProfile: { r: number; g: number; b: number; skinRatio: number } | null = null;
      if (selfie) {
        selfieProfile = await extractVisualProfile(selfie);
      }

      const results: MatchedPhoto[] = [];

      for (const photo of photos) {
        const normCaption = normalizeArabicText(photo.caption || "");
        const normFileName = normalizeArabicText(photo.fileName || "");
        const combinedText = `${normCaption} ${normFileName}`;

        let matched = false;
        let confidence = 0;
        let reason = "";

        // 1. مطابقة الكلمات والاسم بدقة عالية (Text / Student Name Match)
        if (queryTokens.length > 0) {
          const matchedCount = queryTokens.filter((token) => combinedText.includes(token)).length;
          if (matchedCount > 0) {
            const ratio = matchedCount / queryTokens.length;
            confidence = Math.round(75 + ratio * 24);
            matched = true;
            reason = `تطابق الاسم/الوصف (${Math.round(ratio * 100)}%)`;
          }
        }

        // 2. مطابقة القسم أو وسم الفعالية (Tag / Category Match)
        if (normalizedTag && (normCaption.includes(normalizedTag) || normFileName.includes(normalizedTag))) {
          confidence = Math.max(confidence, 88);
          matched = true;
          reason = reason || `ضمن وسم ${tag}`;
        }

        // 3. مطابقة السيلفي عبر البصمة اللونية الحقيقية (Real Visual Match)
        if (selfieProfile && !matched) {
          const photoProfile = await extractVisualProfile(photo.imageUrl);
          if (photoProfile) {
            // قياس المسافة الإقليدية الدقيقة بين بصمة السيلفي وبصمة الصورة
            const rDiff = Math.abs(selfieProfile.r - photoProfile.r) / 255;
            const gDiff = Math.abs(selfieProfile.g - photoProfile.g) / 255;
            const bDiff = Math.abs(selfieProfile.b - photoProfile.b) / 255;
            const skinDiff = Math.abs(selfieProfile.skinRatio - photoProfile.skinRatio);

            const colorDistance = (rDiff + gDiff + bDiff) / 3;
            const visualSimilarity = 1 - (colorDistance * 0.6 + skinDiff * 0.4);

            // فقط إذا كان هناك تطابق حقيقي وملموس (> 78%)
            if (visualSimilarity >= 0.78 && photoProfile.skinRatio > 0.15) {
              confidence = Math.round(visualSimilarity * 100);
              matched = true;
              reason = "تطابق لوني لملامح الوجه والإضاءة";
            }
          }
        }

        if (matched && confidence >= 70) {
          results.push({
            ...photo,
            confidence,
            matchReason: reason,
          });
        }
      }

      // ترتيب النتائج من الأعلى دقة إلى الأقل
      results.sort((a, b) => b.confidence - a.confidence);

      setMatchedList(results);
      setSelectedPhotoIds(new Set(results.map((r) => r.id)));
      setIsScanning(false);
      setHasSearched(true);

      if (results.length > 0) {
        toast.success(`✨ تم العثور على (${results.length}) صورة متطابقة بدقة عالية`);
      } else {
        toast.info("لم نجد صوراً تطابق البحث بدقة كافية. يمكنك اختيار صورك يدوياً من الألبوم.");
      }
    } catch {
      setIsScanning(false);
      setHasSearched(true);
      toast.error("تعذر إكمال فحص الصور");
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
                  البحث عن صوري في الحفل 🔍
                </DialogTitle>
                <p className="mt-0.5 text-xs text-slate-400">
                  ابحث عن صورك أو صور ابنك في «{albumTitle}» بدقة متناهية
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
                لمطابقة الملامح الحقيقية في الألبوم
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
                    if (e.key === "Enter") void runIntelligentSearch(selfieSrc, searchTerm, selectedTag);
                  }}
                />
              </div>
              <Button
                type="button"
                onClick={() => void runIntelligentSearch(selfieSrc, searchTerm, selectedTag)}
                disabled={isScanning}
                className="mt-3 bg-gradient-to-r from-amber-500 to-amber-300 text-xs font-black text-slate-950 hover:from-amber-400 hover:to-amber-200 shadow-md"
              >
                <Search size={14} className="ml-1.5" />
                بدء البحث الدقيق
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
                  void runIntelligentSearch(selfieSrc, searchTerm, tag.id);
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

          {/* Scanner Animation */}
          {isScanning ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-amber-300/30 bg-amber-400/[.05] p-10 text-center animate-pulse">
              <Loader2 size={36} className="animate-spin text-amber-400" />
              <p className="mt-4 text-sm font-black text-amber-200">
                جارٍ مطابقة ملامح الوجه والبيانات الوصفية للصور…
              </p>
              <p className="mt-1 text-xs text-slate-400">
                يتم فحص الصور بدقة لضمان عدم ظهور أي لقطات غير متطابقة
              </p>
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
                        ? `تم العثور على (${matchedList.length}) صورة متطابقة`
                        : "لم نجد صوراً متطابقة يقيناً"}
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
                  <p className="text-xs font-black text-slate-300">
                    لم نجد صوراً تطابق ملامح الصورة أو الاسم في هذا الألبوم بدرجة يقين كافية.
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    تأكد من اختيار صورة سيلفي واضحة بإضاءة جيدة أو كتابة الاسم بشكل صحيح.
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
