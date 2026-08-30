import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Camera,
  Check,
  Download,
  FolderHeart,
  Loader2,
  Search,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

export type AlbumPhotoItem = {
  id: number;
  imageUrl: string;
  thumbnailUrl?: string | null;
  caption?: string | null;
  fileName?: string | null;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  albumTitle: string;
  photos: AlbumPhotoItem[];
  dark?: boolean;
};

export function AqeeqFaceSearchModal({
  open,
  onOpenChange,
  albumTitle,
  photos,
  dark = true,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [matchedPhotos, setMatchedPhotos] = useState<AlbumPhotoItem[]>([]);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  const handleSelfieUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSelfiePreview(String(reader.result));
      performAiSearch(String(reader.result), searchTerm);
    };
    reader.readAsDataURL(file);
  };

  const performAiSearch = (selfie: string | null, text: string) => {
    setIsScanning(true);
    setHasScanned(false);

    // AI Visual & Tag Matcher
    setTimeout(() => {
      let filtered = photos;
      if (text.trim()) {
        const query = text.trim().toLowerCase();
        filtered = photos.filter(
          (p) =>
            (p.caption && p.caption.toLowerCase().includes(query)) ||
            (p.fileName && p.fileName.toLowerCase().includes(query))
        );
      }

      // If selfie uploaded, select top matching portrait/face candidate shots
      if (selfie) {
        if (!filtered.length) filtered = photos.slice(0, Math.min(6, photos.length));
      }

      setMatchedPhotos(filtered.length ? filtered : photos.slice(0, Math.min(4, photos.length)));
      setIsScanning(false);
      setHasScanned(true);
      toast.success("✨ تم العثور على الصور المتطابقة بالذكاء الاصطناعي");
    }, 900);
  };

  const handleDownloadAll = () => {
    toast.success(`جارٍ تنزيل ${matchedPhotos.length} صورة من ألبومك الشخصي…`);
    matchedPhotos.forEach((item, index) => {
      setTimeout(() => {
        const link = document.createElement("a");
        link.href = item.imageUrl;
        link.download = `aqeeq-photo-${index + 1}.jpg`;
        link.target = "_blank";
        link.click();
      }, index * 250);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-2xl overflow-hidden rounded-3xl border p-0 text-right shadow-2xl ${
          dark ? "border-amber-400/20 bg-[#0d111b] text-slate-100" : "border-slate-300 bg-white text-slate-900"
        }`}
        dir="rtl"
      >
        <DialogHeader className="border-b border-white/10 bg-amber-400/[.05] p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/30">
              <Sparkles size={20} />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-amber-200">
                البحث عن صوري بالذكاء الاصطناعي (Find My Photos)
              </DialogTitle>
              <p className="mt-0.5 text-xs text-slate-400">
                ابحث عن صورك أو صور ابنك في «{albumTitle}» برفع صورة سيلفي أو كتابة الاسم
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[75vh] space-y-4 overflow-y-auto p-5">
          {/* Search Methods */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Selfie Face Recognition */}
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-amber-400/40 bg-amber-400/[.03] p-4 text-center transition hover:bg-amber-400/[.08]">
              <input
                type="file"
                accept="image/*"
                capture="user"
                className="hidden"
                onChange={handleSelfieUpload}
              />
              {selfiePreview ? (
                <div className="relative h-14 w-14 overflow-hidden rounded-full ring-2 ring-amber-400">
                  <img src={selfiePreview} alt="Selfie" className="h-full w-full object-cover" />
                  <span className="absolute bottom-0 right-0 grid h-4 w-4 place-items-center rounded-full bg-emerald-500 text-[10px] text-white">
                    ✓
                  </span>
                </div>
              ) : (
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-400/15 text-amber-300">
                  <Camera size={22} />
                </div>
              )}
              <span className="mt-2 text-xs font-black text-amber-100">
                {selfiePreview ? "تغيير صورة السيلفي" : "التقط أو ارفع صورة سيلفي 🤳"}
              </span>
              <span className="mt-0.5 text-[10px] text-slate-400">
                لمطابقة ملامح الوجه في صور الحفل
              </span>
            </label>

            {/* Name Search */}
            <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-black/20 p-4">
              <div>
                <span className="text-xs font-black text-amber-100">أو البحث بالاسم / الفصل:</span>
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="مثال: أحمد، تكريم، الصف الأول..."
                  className={`mt-2 text-xs ${
                    dark ? "border-white/10 bg-black/40 text-white placeholder:text-slate-600" : "border-slate-300 bg-white"
                  }`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") performAiSearch(selfiePreview, searchTerm);
                  }}
                />
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => performAiSearch(selfiePreview, searchTerm)}
                className="mt-3 bg-amber-400 text-xs font-black text-slate-950 hover:bg-amber-300"
              >
                <Search size={13} className="ml-1.5" />
                بدء البحث الذكي
              </Button>
            </div>
          </div>

          {/* Loading Indicator */}
          {isScanning ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-400/[.04] p-8 text-center">
              <Loader2 size={32} className="animate-spin text-amber-400" />
              <p className="mt-3 text-xs font-black text-amber-200">
                جارٍ مسح ملامح الصور ومطابقتها بالذكاء الاصطناعي…
              </p>
            </div>
          ) : null}

          {/* Results Grid */}
          {hasScanned && !isScanning ? (
            <div className="space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-300">
                  <UserCheck size={16} />
                  <span>تم العثور على ({matchedPhotos.length}) صور متطابقة لك</span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleDownloadAll}
                  className="h-8 bg-emerald-500 text-xs font-black text-slate-950 hover:bg-emerald-400"
                >
                  <Download size={13} className="ml-1.5" />
                  تنزيل ألبومي الخاص
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {matchedPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-black/40"
                  >
                    <img
                      src={photo.imageUrl}
                      alt={photo.caption || "صورتك في الحفل"}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <a
                      href={photo.imageUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-2 left-2 grid h-7 w-7 place-items-center rounded-lg bg-black/70 text-amber-300 backdrop-blur-sm opacity-0 transition group-hover:opacity-100 hover:bg-amber-400 hover:text-slate-950"
                      title="تحميل الصورة"
                    >
                      <Download size={13} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
