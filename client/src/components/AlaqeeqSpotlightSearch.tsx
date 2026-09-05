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
  FileText,
  ScanFace,
} from "lucide-react";
import { AqeeqFaceSearchModal } from "@/components/AqeeqFaceSearchModal";

type SearchCategory = "all" | "journal" | "albums" | "showcase" | "articles";

type SearchResultItem = {
  id: string;
  type: "journal" | "album" | "post" | "article" | "portal";
  typeLabel: string;
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  targetUrl: string;
  date?: string | null;
};

const SUGGESTIONS = [
  "مجلة العقيق",
  "القبول والتسجيل",
  "حفل التكريم",
  "أثير العقيق",
  "الاعتمادات الدولية",
  "طابور الصباح",
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
  const [faceSearchOpen, setFaceSearchOpen] = useState(false);
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
  const { data: articles = [] } = trpc.articles.listPublished.useQuery(undefined, {
    enabled: open,
    refetchOnWindowFocus: false,
  });

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

    // Official School Portals
    const PORTALS: SearchResultItem[] = [
      { id: "p-home", type: "portal", typeLabel: "بوابة رئيسية", title: "الصفحة الرئيسية لمدارس العقيق", subtitle: "بوابة المدارس والصروح والخدمات", targetUrl: "/" },
      { id: "p-about", type: "portal", typeLabel: "بوابة رئيسية", title: "عن مدارس العقيق الأهلية والدولية", subtitle: "الرؤية والرسالة والصروح التعليمية", targetUrl: "/about" },
      { id: "p-accreditations", type: "portal", typeLabel: "اعتمادات", title: "الاعتمادات وضمان الجودة الدولية Cognia", subtitle: "المعايير الدولية وضمان جودة التعليم", targetUrl: "/accreditations" },
      { id: "p-admissions", type: "portal", typeLabel: "القبول والتسجيل", title: "القبول والتسجيل والرسوم وحاسبة الأقساط", subtitle: "حجز المقاعد وجدول الرسوم وحاسبة الخصومات", targetUrl: "/admissions" },
      { id: "p-podcast", type: "portal", typeLabel: "إعلام وبودكاست", title: "أثير العقيق — بودكاست المدارس الحي", subtitle: "حوارات ملهمة وإبداعات من صميم المدارس", targetUrl: "/podcast" },
      { id: "p-jobs", type: "portal", typeLabel: "توظيف", title: "بوابة التوظيف والانضمام لكادر العقيق", subtitle: "فرص وظيفية تعليمية وإدارية متميزة", targetUrl: "https://live.aqeeq.edu.sa/jobs" },
    ];
    for (const p of PORTALS) {
      list.push(p);
    }

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

    // Articles
    for (const item of articles) {
      list.push({
        id: "article-" + item.id,
        type: "article",
        typeLabel: "مقال تربوي",
        title: item.title,
        subtitle: item.authorName ? `بقلم: ${item.authorName}` : item.category || "مقالات العقيق التربوية",
        imageUrl: directDriveImage(item.coverUrl) || item.coverUrl,
        targetUrl: "/articles/" + encodeURIComponent(item.slug),
        date: item.publishedAt,
      });
    }

    return list;
  }, [issues, albums, showcase?.posts, articles]);

  // Filter results
  const filteredResults = useMemo(() => {
    let res = allResults;

    if (category === "journal") res = res.filter((r) => r.type === "journal");
    else if (category === "albums") res = res.filter((r) => r.type === "album");
    else if (category === "showcase") res = res.filter((r) => r.type === "post");
    else if (category === "articles") res = res.filter((r) => r.type === "article");

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

  if (!open && !faceSearchOpen) return null;

  return (
    <>
      {open ? (
        <>
          {/* Invisible Click-Outside Dismiss Layer (Zero Blur, Site stays 100% visible & crisp) */}
          <div
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-[140] bg-transparent cursor-default"
            aria-label="إغلاق البحث"
          />

          {/* Anchored Spotlight Search Cockpit Popover — Attached directly below Left Island */}
          <div
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
            className={`absolute top-full mt-2.5 left-0 z-[150] w-[min(540px,calc(100vw-24px))] max-h-[85vh] flex flex-col rounded-[2rem] border shadow-2xl backdrop-blur-2xl backdrop-saturate-[180%] overflow-hidden animate-in zoom-in-95 fade-in slide-in-from-top-3 duration-250 ease-out origin-top-left pointer-events-auto ${
              dark
                ? "bg-[#070c14]/94 text-white border-white/15 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.08)]"
                : "bg-white/94 text-slate-900 border-black/10 shadow-[0_25px_60px_-15px_rgba(8,70,125,0.25),0_0_0_1px_rgba(0,0,0,0.05)]"
            }`}
          >
            {/* Search Header Input Bar */}
            <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-black/[0.08] dark:border-white/10 shrink-0 bg-white/40 dark:bg-black/30 backdrop-blur-md">
              <div className="flex items-center gap-2.5 flex-1">
                <Search size={18} className={dark ? "text-[#f8ca14]" : "text-[#08467d]"} />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  placeholder="ابحث في صروح العقيق، المجلات، الألبومات، والأخبار..."
                  className="flex-1 bg-transparent text-sm sm:text-base font-black outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="grid h-6 w-6 place-items-center rounded-full bg-slate-500/20 text-slate-400 hover:text-white"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <kbd className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono font-bold text-slate-500">
                  ESC
                </kbd>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="grid h-8 w-8 place-items-center rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-[#de191e]/15 hover:text-[#de191e] hover:border-[#de191e]/30 active:scale-90 transition cursor-pointer"
                  aria-label="إغلاق البحث"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Categories Bar */}
            <div className={`flex items-center gap-1.5 sm:gap-2 border-b px-4 sm:px-5 py-2 overflow-x-auto scrollbar-hide shrink-0 ${
              dark ? "border-white/[0.06] bg-white/[0.02]" : "border-black/[0.04] bg-slate-50/70"
            }`}>
              <span className="text-[10px] font-black text-slate-400 shrink-0">التصنيف:</span>
              {[
                { id: "all", label: "الكل", icon: Sparkles },
                { id: "journal", label: "المجلات", icon: BookOpen },
                { id: "albums", label: "الألبومات", icon: Camera },
                { id: "showcase", label: "الأخبار", icon: Clapperboard },
                { id: "articles", label: "المقالات", icon: FileText },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = category === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setCategory(tab.id as SearchCategory);
                      setSelectedIndex(0);
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-black transition cursor-pointer ${
                      active
                        ? dark
                          ? "bg-[#f8ca14] text-black shadow-md shadow-[#f8ca14]/20"
                          : "bg-[#08467d] text-white shadow-md shadow-[#08467d]/20"
                        : dark
                        ? "bg-white/5 text-slate-300 hover:bg-white/10"
                        : "bg-white text-slate-700 border border-black/5 hover:bg-slate-100"
                    }`}
                  >
                    <Icon size={12} />
                    {tab.label}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  setFaceSearchOpen(true);
                }}
                className={`mr-auto inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-black transition active:scale-95 shadow-xs cursor-pointer ${
                  dark
                    ? "border-amber-400/40 bg-amber-400/15 text-amber-300 hover:bg-amber-400 hover:text-black"
                    : "border-amber-500/40 bg-amber-100 text-amber-950 hover:bg-amber-400 hover:text-black"
                }`}
              >
                <ScanFace size={13} className={dark ? "text-amber-400" : "text-amber-700"} />
                <span>البحث بالوجه 🤳</span>
              </button>
            </div>

            {/* Results List Area */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4 space-y-1.5 scrollbar-hide">
              {/* AI Face Recognition Suggestion Banner */}
              {!query ? (
                <div
                  onClick={() => {
                    onOpenChange(false);
                    setFaceSearchOpen(true);
                  }}
                  className={`cursor-pointer rounded-2xl border p-3 mb-2 transition flex items-center justify-between gap-3 ${
                    dark
                      ? "border-amber-400/30 bg-gradient-to-r from-amber-400/[0.12] via-amber-400/[0.04] to-transparent hover:border-amber-400/60"
                      : "border-amber-400/40 bg-gradient-to-r from-amber-100/70 via-amber-50/40 to-transparent hover:border-amber-500 shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-400 text-slate-950 shadow-md shrink-0">
                      <ScanFace size={18} />
                    </div>
                    <div>
                      <span className={`text-xs font-black ${dark ? "text-amber-300" : "text-amber-950"}`}>
                        هل تبحث عن صورك أو صور ابنك في الحفلات؟ 🤳
                      </span>
                      <p className={`text-[10px] mt-0.5 ${dark ? "text-slate-400" : "text-slate-600"}`}>
                        استخدم تقنية التعرف البيومتري على ملامح الوجه للبحث الفوري في كافة ألبومات المدارس
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-xl bg-amber-400 px-2.5 py-1 text-xs font-black text-slate-950 shadow-md shrink-0">
                    <span>فحص السيلفي</span>
                    <ArrowUpLeft size={13} />
                  </span>
                </div>
              ) : null}

              {filteredResults.length ? (
                <div className="space-y-1.5">
                  {filteredResults.map((item, index) => {
                    const isSelected = index === selectedIndex;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`group flex w-full items-center gap-3 rounded-2xl p-2.5 text-right transition duration-150 cursor-pointer ${
                          isSelected
                            ? dark
                              ? "bg-white/[0.08] shadow-inner"
                              : "bg-[#08467d]/[0.06] shadow-inner"
                            : "hover:bg-white/[0.03]"
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className={`relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-xl border shadow-xs ${
                          dark ? "border-white/10 bg-[#161616]" : "border-black/10 bg-slate-100"
                        }`}>
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-slate-400">
                              {item.type === "journal" ? (
                                <BookOpen size={18} />
                              ) : item.type === "album" ? (
                                <Camera size={18} />
                              ) : item.type === "article" ? (
                                <FileText size={18} />
                              ) : item.type === "portal" ? (
                                <Sparkles size={18} className="text-[#f8ca14]" />
                              ) : (
                                <Clapperboard size={18} />
                              )}
                            </div>
                          )}
                        </div>

                        {/* Meta */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`rounded-md px-1.5 py-0.2 text-[9px] font-black ${
                              item.type === "journal"
                                ? dark ? "bg-[#f8ca14]/20 text-[#f8ca14]" : "bg-[#08467d]/15 text-[#08467d]"
                                : item.type === "album"
                                ? dark ? "bg-[#367453]/25 text-emerald-400" : "bg-[#367453]/15 text-[#367453]"
                                : item.type === "article"
                                ? dark ? "bg-amber-400/20 text-amber-300" : "bg-amber-500/15 text-amber-700"
                                : item.type === "portal"
                                ? dark ? "bg-blue-400/20 text-blue-300" : "bg-blue-600/15 text-blue-800"
                                : dark ? "bg-[#de191e]/25 text-[#de191e]" : "bg-[#de191e]/15 text-[#de191e]"
                            }`}>
                              {item.typeLabel}
                            </span>
                            {item.date ? (
                              <span className="text-[9px] font-bold text-slate-400">{item.date}</span>
                            ) : null}
                          </div>
                          <h4 className={`mt-0.5 truncate text-xs sm:text-sm font-black transition ${
                            dark ? "text-white group-hover:text-[#f8ca14]" : "text-black group-hover:text-[#08467d]"
                          }`}>
                            {item.title}
                          </h4>
                          {item.subtitle ? (
                            <p className="truncate text-[10px] sm:text-xs font-bold text-slate-400 mt-0.5">{item.subtitle}</p>
                          ) : null}
                        </div>

                        {/* Action Hint */}
                        <div className="shrink-0 pl-1">
                          <span className={`grid h-7 w-7 place-items-center rounded-xl transition ${
                            isSelected
                              ? dark
                                ? "bg-[#f8ca14] text-black"
                                : "bg-[#08467d] text-white"
                              : "opacity-0 group-hover:opacity-100 text-slate-400"
                          }`}>
                            <ArrowUpLeft size={14} />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <Search size={32} className="mx-auto text-slate-400 opacity-40" />
                  <p className="mt-2 text-xs sm:text-sm font-black text-slate-400">لا توجد نتائج مطابقة لـ «{query}»</p>
                  <p className="mt-1 text-[11px] text-slate-500 font-bold">جرّب البحث بكلمات أخرى أو اختر أحد المقترحات أدناه</p>
                </div>
              )}
            </div>

            {/* Quick Suggestions / Footer Bar */}
            <div className={`border-t px-4 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold shrink-0 ${
              dark ? "border-white/[0.08] bg-black/30 text-slate-400" : "border-black/[0.06] bg-slate-50 text-slate-600"
            }`}>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-black">مقترحات:</span>
                {SUGGESTIONS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setQuery(tag);
                      setSelectedIndex(0);
                    }}
                    className={`rounded-lg px-2 py-0.5 text-[10px] font-black transition cursor-pointer ${
                      dark
                        ? "bg-white/5 hover:bg-[#f8ca14]/20 hover:text-[#f8ca14] border border-white/10"
                        : "bg-white border border-black/5 hover:bg-[#08467d]/10 hover:text-[#08467d] shadow-2xs"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-400">
                <span className="inline-flex items-center gap-1"><CornerDownLeft size={10} /> للاختيار</span>
                <span>·</span>
                <span>↑↓ للتنقل</span>
              </div>
            </div>
          </div>
        </>
      ) : null}

      <AqeeqFaceSearchModal open={faceSearchOpen} onOpenChange={setFaceSearchOpen} dark={dark} />
    </>
  );
}
