import { useState, useMemo, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
function directDriveImage(url: string | null | undefined) {
  if (!url) return null;
  const match = url.match(/\/file\/d\/([A-Za-z0-9_-]+)/);
  return match ? `/api/drive-proxy/${match[1]}` : url;
}
import {
  Search,
  X,
  BookOpen,
  Camera,
  Clapperboard,
  Sparkles,
  ArrowUpLeft,
  CornerDownLeft,
  SlidersHorizontal,
} from "lucide-react";

type SearchCategory = "all" | "journal" | "albums" | "showcase";

type SearchResultItem = {
  id: string;
  type: "journal" | "album" | "post";
  typeLabel: string;
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  targetUrl: string;
  date?: string | null;
};

const SUGGESTIONS = [
  "مجلة العقيق",
  "حفل التكريم",
  "طابور الصباح",
  "معرض الابتكار",
  "اليوم الوطني",
  "الإذاعة المدرسية",
];

export function AlaqeeqSpotlightSearch({
  open,
  onOpenChange,
  dark,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dark: boolean;
}) {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SearchCategory>("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch real data
  const { data: issues = [] } = trpc.schoolNews.publicList.useQuery(undefined, {
    enabled: open,
    refetchOnWindowFocus: false,
  });
  const { data: albums = [] } = trpc.aqeeqAlbums.publicList.useQuery(undefined, {
    enabled: open,
    refetchOnWindowFocus: false,
  });
  const { data: showcase } = trpc.aqeeqShowcases.publicShowcase.useQuery(
    { slug: "news-offers" },
    { enabled: open, refetchOnWindowFocus: false }
  );

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  // Aggregate results
  const allResults = useMemo<SearchResultItem[]>(() => {
    const list: SearchResultItem[] = [];

    // Journal Issues
    for (const item of issues) {
      list.push({
        id: "journal-" + item.id,
        type: "journal",
        typeLabel: "مجلة العقيق",
        title: item.title,
        subtitle: (item.pageCount ? item.pageCount + " صفحة" : "") + (item.seasonLabel ? " · " + item.seasonLabel : ""),
        imageUrl: item.coverUrl,
        targetUrl: "/journal/issue/" + encodeURIComponent(item.slug),
        date: item.issueDate,
      });
    }

    // Albums
    for (const item of albums) {
      list.push({
        id: "album-" + item.id,
        type: "album",
        typeLabel: "ألبوم العقيق",
        title: item.title,
        subtitle: (item.mediaCount ? item.mediaCount + " ملف" : "") + (item.albumDate ? " · " + item.albumDate : ""),
        imageUrl: directDriveImage(item.coverUrl) || item.coverUrl,
        targetUrl: "/albums/" + encodeURIComponent(item.slug),
        date: item.albumDate,
      });
    }

    // News & Showcase posts
    for (const item of showcase?.posts || []) {
      list.push({
        id: "post-" + item.id,
        type: "post",
        typeLabel: item.mediaType === "video" ? "فيديو" : "خبر وعرض",
        title: item.title || item.fileName.replace(/\.[^.]+$/, ""),
        subtitle: item.description || (item.mediaType === "video" ? "فيديو من أخبار العقيق" : "لقطة من أخبار العقيق"),
        imageUrl: directDriveImage(item.thumbnailUrl) || item.thumbnailUrl || item.mediaUrl,
        targetUrl: "/offers",
      });
    }

    return list;
  }, [issues, albums, showcase?.posts]);

  // Filter results
  const filteredResults = useMemo(() => {
    let res = allResults;

    if (category === "journal") res = res.filter((r) => r.type === "journal");
    else if (category === "albums") res = res.filter((r) => r.type === "album");
    else if (category === "showcase") res = res.filter((r) => r.type === "post");

    const q = query.trim().toLowerCase();
    if (!q) return res.slice(0, 8);

    return res.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        (item.typeLabel && item.typeLabel.toLowerCase().includes(q))
    );
  }, [allResults, category, query]);

  // Handle selection navigation
  const handleSelect = (item: SearchResultItem) => {
    onOpenChange(false);
    navigate(item.targetUrl);
  };

  // Keyboard navigation inside modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredResults.length - 1));
    } else if (e.key === "Enter" && filteredResults[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredResults[selectedIndex]);
    } else if (e.key === "Escape") {
      onOpenChange(false);
    }
  };

  if (!open) return null;

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => onOpenChange(false)}
    >
      <div
        className={"relative w-full max-w-2xl overflow-hidden rounded-3xl border shadow-2xl transition-all " + (
          dark
            ? "border-white/[0.12] bg-[#0c0c0c] text-white shadow-[0_25px_60px_rgba(0,0,0,0.8)]"
            : "border-black/[0.1] bg-white text-black shadow-[0_25px_60px_rgba(0,0,0,0.15)]"
        )}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Header Input */}
        <div className={"flex items-center gap-3 border-b px-5 py-4 " + (
          dark ? "border-white/[0.08]" : "border-black/[0.08]"
        )}>
          <Search size={22} className={dark ? "text-[#f8ca14]" : "text-[#08467d]"} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="ابحث في المجلات، الألبومات، والأخبار والعروض..."
            className="flex-1 bg-transparent text-base sm:text-lg font-bold outline-none placeholder:text-slate-400"
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              className="grid h-7 w-7 place-items-center rounded-full bg-slate-500/20 text-slate-400 hover:text-white"
            >
              <X size={15} />
            </button>
          ) : null}
          <button
            onClick={() => onOpenChange(false)}
            className={"rounded-xl border px-2.5 py-1 text-[11px] font-black transition " + (
              dark
                ? "border-white/15 bg-white/5 text-slate-300 hover:bg-white/10"
                : "border-black/10 bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            ESC
          </button>
        </div>

        {/* Categories Bar */}
        <div className={"flex items-center gap-2 border-b px-5 py-2.5 overflow-x-auto scrollbar-none " + (
          dark ? "border-white/[0.06] bg-white/[0.02]" : "border-black/[0.04] bg-slate-50"
        )}>
          <span className="text-[11px] font-black text-slate-400 shrink-0 ml-1">التصنيف:</span>
          {[
            { id: "all", label: "الكل", icon: Sparkles },
            { id: "journal", label: "المجلات", icon: BookOpen },
            { id: "albums", label: "الألبومات", icon: Camera },
            { id: "showcase", label: "الأخبار", icon: Clapperboard },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = category === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setCategory(tab.id as SearchCategory);
                  setSelectedIndex(0);
                }}
                className={"inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition " + (
                  active
                    ? dark
                      ? "bg-[#f8ca14] text-black shadow-md shadow-[#f8ca14]/20"
                      : "bg-[#08467d] text-white shadow-md shadow-[#08467d]/20"
                    : dark
                    ? "bg-white/5 text-slate-300 hover:bg-white/10"
                    : "bg-white text-slate-700 border border-black/5 hover:bg-slate-100"
                )}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-3 scrollbar-none">
          {filteredResults.length ? (
            <div className="space-y-1.5">
              {filteredResults.map((item, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={"group flex w-full items-center gap-3.5 rounded-2xl p-2.5 text-right transition duration-150 " + (
                      isSelected
                        ? dark
                          ? "bg-white/[0.08] shadow-inner"
                          : "bg-[#08467d]/[0.06] shadow-inner"
                        : "hover:bg-white/[0.03]"
                    )}
                  >
                    {/* Thumbnail */}
                    <div className={"relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-xl border shadow-sm " + (
                      dark ? "border-white/10 bg-[#161616]" : "border-black/10 bg-slate-100"
                    )}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-slate-400">
                          {item.type === "journal" ? <BookOpen size={20} /> : item.type === "album" ? <Camera size={20} /> : <Clapperboard size={20} />}
                        </div>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={"rounded-md px-1.5 py-0.5 text-[9px] font-black " + (
                          item.type === "journal"
                            ? dark ? "bg-[#f8ca14]/20 text-[#f8ca14]" : "bg-[#08467d]/15 text-[#08467d]"
                            : item.type === "album"
                            ? dark ? "bg-[#367453]/25 text-emerald-400" : "bg-[#367453]/15 text-[#367453]"
                            : dark ? "bg-[#de191e]/25 text-rose-400" : "bg-[#de191e]/15 text-[#de191e]"
                        )}>
                          {item.typeLabel}
                        </span>
                        {item.date ? (
                          <span className="text-[10px] font-bold text-slate-400">{item.date}</span>
                        ) : null}
                      </div>
                      <h4 className={"mt-1 truncate text-sm font-black transition " + (
                        dark ? "text-white group-hover:text-[#f8ca14]" : "text-black group-hover:text-[#08467d]"
                      )}>
                        {item.title}
                      </h4>
                      {item.subtitle ? (
                        <p className="truncate text-xs font-bold text-slate-400">{item.subtitle}</p>
                      ) : null}
                    </div>

                    {/* Action Hint */}
                    <div className="shrink-0 pl-2">
                      <span className={"grid h-8 w-8 place-items-center rounded-xl transition " + (
                        isSelected
                          ? dark
                            ? "bg-[#f8ca14] text-black"
                            : "bg-[#08467d] text-white"
                          : "opacity-0 group-hover:opacity-100 text-slate-400"
                      )}>
                        <ArrowUpLeft size={16} />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Search size={36} className="mx-auto text-slate-400 opacity-40" />
              <p className="mt-3 text-sm font-black text-slate-400">لا توجد نتائج مطابقة لـ «{query}»</p>
              <p className="mt-1 text-xs text-slate-500 font-bold">جرّب البحث بكلمات أخرى أو اختر أحد المقترحات أدناه</p>
            </div>
          )}
        </div>

        {/* Quick Suggestions / Footer Bar */}
        <div className={"border-t p-3 sm:px-5 flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold " + (
          dark ? "border-white/[0.08] bg-[#080808] text-slate-400" : "border-black/[0.08] bg-slate-50 text-slate-600"
        )}>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-slate-400">مقترحات:</span>
            {SUGGESTIONS.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setQuery(tag);
                  setSelectedIndex(0);
                }}
                className={"rounded-lg px-2 py-0.5 text-[10px] font-black transition " + (
                  dark
                    ? "bg-white/5 hover:bg-[#f8ca14]/20 hover:text-[#f8ca14]"
                    : "bg-white border border-black/5 hover:bg-[#08467d]/10 hover:text-[#08467d]"
                )}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[10px] text-slate-400">
            <span className="inline-flex items-center gap-1"><CornerDownLeft size={11} /> للاختيار</span>
            <span>↑↓ للتنقل</span>
          </div>
        </div>
      </div>
    </div>
  );
}
