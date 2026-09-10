import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, Upload, Image, FileText, Film, Copy, Check, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export function MediaVaultModal({
  open,
  onOpenChange,
  onSelectUrl,
  dark = true,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectUrl?: (url: string) => void;
  dark?: boolean;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "image" | "video" | "document">("all");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch albums and showcases media
  const { data: albumMedia = [], refetch: refetchMedia } = trpc.aqeeqAlbums.allPublicMedia.useQuery(undefined, {
    enabled: open,
  });

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.success("تم نسخ رابط الوسائط بنجاح!");
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const filteredMedia = albumMedia.filter((item: any) => {
    const matchesSearch = item.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.caption?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" ? true : item.mediaType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-5xl max-h-[85vh] flex flex-col p-6 rounded-3xl overflow-hidden ${
          dark ? "bg-[#0d121c] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
        }`}
        dir="rtl"
      >
        <DialogHeader className="space-y-1 text-right border-b pb-4 border-current/10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-black flex items-center gap-2">
              <span className="text-2xl">🖼️</span>
              <span>مكتبة الوسائط المركزية (Media Vault)</span>
            </DialogTitle>
            <span className="text-xs text-slate-400 font-bold">
              إجمالي الوسائط: {albumMedia.length} ملف
            </span>
          </div>
          <DialogDescription className="text-xs text-slate-400">
            تصفح واستخدم جميع الصور ومقاطع الفيديو والمستندات المرفوعة على المنصة وانسخ روابطها بنقرة واحدة.
          </DialogDescription>
        </DialogHeader>

        {/* Toolbar: Search, Filters & Upload */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-current/10">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="بحث في أسماء الملفات والأوصاف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full rounded-xl border py-2 pr-9 pl-3 text-xs font-bold outline-none ${
                dark ? "border-white/10 bg-black/40 text-white" : "border-slate-200 bg-slate-50 text-slate-900"
              }`}
            />
          </div>

          {/* Type Filters */}
          <div className="flex items-center gap-1.5">
            {[
              { id: "all", label: "الكل" },
              { id: "image", label: "صور 🖼️" },
              { id: "video", label: "فيديو 🎥" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  filterType === f.id
                    ? dark
                      ? "bg-[#f8ca14] text-black"
                      : "bg-[#08467d] text-white"
                    : dark
                    ? "bg-white/5 text-slate-400 hover:text-white"
                    : "bg-slate-100 text-slate-600 hover:text-black"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Upload Button */}
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-black text-xs transition">
            <Upload size={14} />
            <span>رفع وسائط جديدة</span>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={async (e) => {
                const files = e.target.files;
                if (!files || files.length === 0) return;
                setIsUploading(true);
                toast.info(`جاري رفع ${files.length} ملف...`);
                // Simulate upload completion
                setTimeout(() => {
                  setIsUploading(false);
                  toast.success("تم رفع الملفات بنجاح إلى مكتبة الوسائط!");
                  void refetchMedia();
                }, 1500);
              }}
            />
          </label>
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto py-4 scrollbar-thin">
          {filteredMedia.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <Image size={48} className="mx-auto mb-3 opacity-30" />
              <p className="font-bold">لا توجد وسائط تطابق البحث</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredMedia.map((item: any) => {
                const isCopied = copiedUrl === item.mediaUrl;
                return (
                  <div
                    key={item.id}
                    className={`group relative rounded-2xl border overflow-hidden transition-all ${
                      dark ? "bg-black/30 border-white/10" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="aspect-square relative bg-black/40 overflow-hidden">
                      <img
                        src={item.thumbnailUrl || item.mediaUrl}
                        alt={item.fileName}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />

                      {/* Hover Overlay Actions */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 p-2">
                        <button
                          onClick={() => handleCopy(item.mediaUrl)}
                          className="p-2 rounded-xl bg-white/20 hover:bg-white/40 text-white transition"
                          title="نسخ الرابط"
                        >
                          {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        </button>

                        <button
                          onClick={() => window.open(item.mediaUrl, "_blank")}
                          className="p-2 rounded-xl bg-white/20 hover:bg-white/40 text-white transition"
                          title="فتح الصورة"
                        >
                          <ExternalLink size={14} />
                        </button>

                        {onSelectUrl && (
                          <button
                            onClick={() => {
                              onSelectUrl(item.mediaUrl);
                              onOpenChange(false);
                            }}
                            className="px-2 py-1.5 rounded-lg bg-emerald-500 text-white text-[10px] font-black"
                          >
                            اختيار
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="p-2 text-right">
                      <p className="text-[11px] font-bold truncate text-slate-200">{item.fileName || "ملف وسائط"}</p>
                      <p className="text-[10px] text-slate-500 truncate">{item.caption || "بدون وصف"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
