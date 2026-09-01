import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Sparkles, Mic, Newspaper, ImageIcon, BookOpen } from "lucide-react";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { useMemo } from "react";
import { VisualEditable } from "@/components/VisualEditor";

export function AqeeqNewsMarquee({
  badgeOverride,
}: {
  badgeOverride?: string;
} = {}) {
  const { data: articles } = trpc.articles.listPublished.useQuery({});
  const { data: podcasts } = trpc.podcasts.list.useQuery({});
  const { data: albums } = trpc.aqeeqAlbums.publicList.useQuery(undefined);
  const { data: issues } = trpc.schoolNews.publicList.useQuery(undefined);
  const [, navigate] = useLocation();
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";

  const rawItems = useMemo(() => {
    const list: { id: string; title: string; icon: "article" | "podcast" | "album" | "journal"; url: string }[] = [];

    articles?.slice(0, 5).forEach((a) => {
      list.push({ id: `art-${a.id}`, title: a.title, icon: "article", url: `/articles/${a.slug}` });
    });
    podcasts?.slice(0, 3).forEach((p) => {
      list.push({ id: `pod-${p.id}`, title: p.title, icon: "podcast", url: "/podcast" });
    });
    albums?.slice(0, 3).forEach((a) => {
      list.push({ id: `alb-${a.id}`, title: a.title, icon: "album", url: `/albums/${a.slug}` });
    });
    issues?.slice(0, 3).forEach((i) => {
      list.push({ id: `iss-${i.id}`, title: i.title, icon: "journal", url: `/journal/issue/${i.slug}` });
    });

    return list;
  }, [articles, podcasts, albums, issues]);

  // Duplicate once for seamless -50% to 0% infinite loop
  const marqueeTrack = useMemo(() => {
    if (rawItems.length === 0) return [];
    return [...rawItems, ...rawItems];
  }, [rawItems]);

  if (rawItems.length === 0) return null;

  const iconMap = {
    article: <Newspaper size={13} className={dark ? "text-rose-400" : "text-rose-600"} />,
    podcast: <Mic size={13} className={dark ? "text-indigo-400" : "text-indigo-600"} />,
    album: <ImageIcon size={13} className={dark ? "text-emerald-400" : "text-emerald-600"} />,
    journal: <BookOpen size={13} className={dark ? "text-amber-400" : "text-amber-600"} />,
  };

  return (
    <VisualEditable
      id="studio-marquee-section"
      tag="section"
      label="شريط الأخبار المتحرك"
      as="div"
      className={`w-full overflow-hidden border-y py-2 sm:py-2.5 relative flex items-center select-none ${
        dark ? "bg-[#0a0a0a] border-white/[0.08]" : "bg-slate-50 border-black/[0.06]"
      }`}
    >
      {/* 1. Fixed Non-Overlapping Badge on the Right */}
      <div
        className={`shrink-0 z-20 flex items-center gap-2 px-4 sm:px-6 py-1 font-black text-xs sm:text-sm border-l ${
          dark
            ? "bg-[#0a0a0a] text-[#f8ca14] border-white/[0.08] shadow-[12px_0_20px_rgba(0,0,0,0.7)]"
            : "bg-slate-50 text-[#08467d] border-black/[0.06] shadow-[12px_0_20px_rgba(0,0,0,0.04)]"
        }`}
      >
        <Sparkles size={14} className="animate-pulse text-[#f8ca14]" />
        <VisualEditable
          id="studio-marquee-badge-text"
          tag="text"
          label="شارة شريط الأخبار"
          defaultText={badgeOverride || "آخر الأخبار"}
          as="span"
          className="whitespace-nowrap tracking-wide"
        />
      </div>

      {/* 2. Scrolling Viewport with Soft Fade Gradients */}
      <div className="relative flex-1 overflow-hidden">
        {/* Soft edge gradient masks */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-8 sm:w-16 z-10 pointer-events-none bg-gradient-to-l ${
            dark ? "from-[#0a0a0a] to-transparent" : "from-slate-50 to-transparent"
          }`}
        />
        <div
          className={`absolute left-0 top-0 bottom-0 w-8 sm:w-16 z-10 pointer-events-none bg-gradient-to-r ${
            dark ? "from-[#0a0a0a] to-transparent" : "from-slate-50 to-transparent"
          }`}
        />

        {/* 3. Pure CSS RTL Seamless Marquee Track */}
        <div className="animate-marquee-rtl flex items-center">
          {marqueeTrack.map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="flex items-center shrink-0">
              <button
                type="button"
                onClick={() => navigate(item.url)}
                className={`flex items-center gap-2 px-3 py-1 rounded-full shrink-0 whitespace-nowrap text-xs sm:text-sm font-bold transition-colors ${
                  dark
                    ? "text-slate-300 hover:text-white hover:bg-white/[0.06]"
                    : "text-slate-700 hover:text-[#08467d] hover:bg-black/[0.04]"
                }`}
              >
                <span className="shrink-0">{iconMap[item.icon]}</span>
                <span className="shrink-0">{item.title}</span>
              </button>

              <span
                className={`mx-3 sm:mx-5 text-[11px] shrink-0 ${
                  dark ? "text-[#f8ca14]/40" : "text-[#08467d]/30"
                }`}
              >
                ✦
              </span>
            </div>
          ))}
        </div>
      </div>
    </VisualEditable>
  );
}
