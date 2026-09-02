import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BookOpen, Camera, Clapperboard, Link as LinkIcon, Search, CheckCircle2, Image as ImageIcon } from "lucide-react";

function directDriveImage(url: string | null | undefined) {
  if (!url) return null;
  const match = url.match(/\/file\/d\/([A-Za-z0-9_-]+)/);
  return match ? `/api/drive-proxy/${match[1]}` : url;
}

export type MediaPickerItem = {
  id: string;
  url: string;
  title: string;
  type: "journal" | "album" | "post";
  typeLabel: string;
  rawId: number;
};

type AqeeqUniversalMediaPickerModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  currentSelectedUrl?: string | null;
  onSelect: (item: MediaPickerItem) => void;
  dark?: boolean;
};

export function AqeeqUniversalMediaPickerModal({
  open,
  onOpenChange,
  title = "اختيار صورة أو غلاف من مكتبة وسائط المدارس",
  currentSelectedUrl,
  onSelect,
  dark = true,
}: AqeeqUniversalMediaPickerModalProps) {
  const [activeCategory, setActiveCategory] = useState<"all" | "journal" | "album" | "post" | "url">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [customDirectUrl, setCustomDirectUrl] = useState("");

  const { data: issuesList = [] } = trpc.schoolNews.publicList.useQuery(undefined, { enabled: open });
  const { data: albumsList = [] } = trpc.aqeeqAlbums.publicList.useQuery(undefined, { enabled: open });
  const { data: showcaseData } = trpc.aqeeqShowcases.publicShowcase.useQuery(
    { slug: "news-offers" },
    { enabled: open }
  );

  const allMediaItems: MediaPickerItem[] = useMemo(() => {
    const list: MediaPickerItem[] = [];

    // 1. Magazine Covers
    for (const iss of issuesList) {
      if (iss.coverUrl) {
        list.push({
          id: `journal-${iss.id}`,
          url: iss.coverUrl,
          title: `${iss.title} (${iss.seasonLabel || iss.issueDate || "مجلة"})`,
          type: "journal",
          typeLabel: "مجلة دورية",
          rawId: iss.id,
        });
      }
    }

    // 2. Albums Covers & Photos
    for (const alb of albumsList) {
      const cover = directDriveImage(alb.coverUrl) || alb.coverUrl;
      if (cover) {
        list.push({
          id: `album-${alb.id}`,
          url: cover,
          title: `${alb.title} (${alb.albumDate || "ألبوم"})`,
          type: "album",
          typeLabel: "ألبوم فعاليات",
          rawId: alb.id,
        });
      }
    }

    // 3. Showcase & Social Posts
    for (const post of showcaseData?.posts || []) {
      const url = directDriveImage(post.thumbnailUrl) || post.thumbnailUrl || post.mediaUrl;
      if (url && !url.includes("youtube.com") && !url.includes("x.com")) {
        list.push({
          id: `post-${post.id}`,
          url,
          title: post.title || post.fileName.replace(/\.[^.]+$/, ""),
          type: "post",
          typeLabel: post.sourceType === "instagram" ? "Instagram" : post.mediaType === "video" ? "فيديو" : "خبر وعرض",
          rawId: post.id,
        });
      }
    }

    return list;
  }, [issuesList, albumsList, showcaseData]);

  const filteredItems = useMemo(() => {
    return allMediaItems.filter((item) => {
      if (activeCategory !== "all" && item.type !== activeCategory) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return item.title.toLowerCase().includes(q) || item.typeLabel.toLowerCase().includes(q);
    });
  }, [allMediaItems, activeCategory, searchQuery]);

  const handleSelect = (item: MediaPickerItem) => {
    onSelect(item);
    onOpenChange(false);
  };

  const handleCustomUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDirectUrl.trim()) return;
    onSelect({
      id: "custom-" + Date.now(),
      url: customDirectUrl.trim(),
      title: "رابط مخصص",
      type: "post",
      typeLabel: "رابط مباشر",
      rawId: 0,
    });
    setCustomDirectUrl("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-4xl rounded-3xl border p-0 overflow-hidden font-['Tajawal'] ${
          dark ? "border-white/10 bg-[#121212] text-white" : "border-black/10 bg-white text-black"
        }`}
      >
        <DialogHeader className="p-6 pb-4 border-b border-current/10">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#f8ca14] text-black">
              <ImageIcon size={20} />
            </div>
            <div>
              <DialogTitle className="text-lg font-black">{title}</DialogTitle>
              <DialogDescription className="text-xs font-bold text-slate-400 mt-0.5">
                تصفح واختر من صور المجلات، ألبومات الفعاليات، الأخبار، أو أدخل رابط مباشر
              </DialogDescription>
            </div>
          </div>

          {/* Navigation Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-4">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-black transition ${
                activeCategory === "all"
                  ? "bg-[#f8ca14] text-black"
                  : dark ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              الكل ({allMediaItems.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory("journal")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-black transition ${
                activeCategory === "journal"
                  ? "bg-[#f8ca14] text-black"
                  : dark ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <BookOpen size={13} />
              <span>المجلات ({allMediaItems.filter((i) => i.type === "journal").length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory("album")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-black transition ${
                activeCategory === "album"
                  ? "bg-[#f8ca14] text-black"
                  : dark ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Camera size={13} />
              <span>الألبومات ({allMediaItems.filter((i) => i.type === "album").length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory("post")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-black transition ${
                activeCategory === "post"
                  ? "bg-[#f8ca14] text-black"
                  : dark ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Clapperboard size={13} />
              <span>الأخبار والعروض ({allMediaItems.filter((i) => i.type === "post").length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory("url")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-black transition ${
                activeCategory === "url"
                  ? "bg-[#f8ca14] text-black"
                  : dark ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <LinkIcon size={13} />
              <span>رابط مخصص</span>
            </button>
          </div>

          {activeCategory !== "url" && (
            <div className="relative mt-2">
              <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم أو الفئة..."
                className={`w-full rounded-xl border py-2 pr-9 pl-3 text-xs font-bold outline-none ${
                  dark ? "border-white/10 bg-black/50 text-white" : "border-black/10 bg-slate-50"
                }`}
              />
            </div>
          )}
        </DialogHeader>

        {/* Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeCategory === "url" ? (
            <form onSubmit={handleCustomUrlSubmit} className="space-y-4 py-4 max-w-lg mx-auto">
              <label className="block text-xs font-black text-slate-300">
                أدخل رابط مباشر للصورة (Google Drive, CDN, أو رابط خارجي):
              </label>
              <input
                type="url"
                required
                value={customDirectUrl}
                onChange={(e) => setCustomDirectUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/... أو https://example.com/image.jpg"
                className={`w-full rounded-xl border p-3 text-xs font-bold outline-none font-mono ${
                  dark ? "border-white/10 bg-black/50 text-white" : "border-black/10 bg-slate-50"
                }`}
              />
              <button
                type="submit"
                className="w-full rounded-2xl bg-[#f8ca14] py-3 text-xs font-black text-black hover:bg-yellow-400 transition shadow-lg shadow-[#f8ca14]/20"
              >
                تأكيد واستخدام هذا الرابط
              </button>
            </form>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-2">
              <ImageIcon size={36} className="mx-auto opacity-40" />
              <p className="text-sm font-black">لا توجد وسائط تطابق هذا البحث</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredItems.map((item) => {
                const isSelected = currentSelectedUrl === item.url;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={`group relative flex flex-col overflow-hidden rounded-2xl border text-right transition duration-200 hover:scale-[1.02] ${
                      isSelected
                        ? "border-[#f8ca14] ring-2 ring-[#f8ca14]/50 shadow-lg"
                        : dark
                        ? "border-white/10 bg-[#161616] hover:border-white/30"
                        : "border-black/10 bg-white hover:border-black/30 shadow-sm"
                    }`}
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/20">
                      <img
                        src={item.url}
                        alt={item.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      <span
                        className={`absolute top-2 right-2 rounded-md px-2 py-0.5 text-[9px] font-black backdrop-blur-md ${
                          item.type === "journal"
                            ? "bg-[#f8ca14] text-black"
                            : item.type === "album"
                            ? "bg-[#08467d] text-white"
                            : "bg-emerald-600 text-white"
                        }`}
                      >
                        {item.typeLabel}
                      </span>
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#f8ca14]/20 flex items-center justify-center">
                          <CheckCircle2 size={32} className="text-[#f8ca14] drop-shadow-md" />
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="truncate text-xs font-black">{item.title}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
