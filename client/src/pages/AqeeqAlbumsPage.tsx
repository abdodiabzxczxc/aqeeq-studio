import { useAuth } from "@/_core/hooks/useAuth";
import { AqeeqArchiveControls } from "@/components/AqeeqArchiveControls";
import { AlaqeeqStudioSiteHeader } from "@/components/AlaqeeqStudioSiteHeader";
import { AlaqeeqStudioSiteFooter } from "@/components/AlaqeeqStudioSiteFooter";
import { VisualEditable, VisualImage } from "@/components/VisualEditor";
import { searchAndSortAqeeqContent, type AqeeqSortOption } from "@/lib/aqeeqArchiveControls";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { trpc } from "@/lib/trpc";
import { ArrowUpLeft, Camera, Eye, ImageIcon, Loader2, Settings2, Sparkles, Video, MonitorPlay } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { AqeeqAlbumTvMode } from "@/components/AqeeqAlbumTvMode";
import { AqeeqAiYearbookGenerator } from "@/components/AqeeqAiYearbookGenerator";
import { getAqeeqAlbumImageSource } from "@/lib/aqeeqAlbumMedia";
import { useSiteTheme } from "@/lib/useSiteTheme";
import { AqeeqPageHeroShowcase } from "@/components/AqeeqPageHeroShowcase";
import { AqeeqSectionHeader } from "@/components/AqeeqSectionHeader";

type PublicAlbum = { id: number; slug: string; title: string; description: string | null; coverUrl: string | null; mediaCount: number; viewCount: number };

function directDriveImage(url: string | null) {
  if (!url) return null;
  const id =
    url.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/)?.[1] ||
    url.match(/[?&]id=([^&]+)/)?.[1] ||
    url.match(/lh3\.googleusercontent\.com\/d\/([A-Za-z0-9_-]+)/)?.[1];
  return id ? `/api/drive-proxy/${id}` : url;
}

function AlbumCard({ album, index, onOpen, dark }: { album: PublicAlbum; index: number; onOpen: () => void; dark: boolean }) {
  const { isNationalDay } = useSiteTheme();
  const cover = directDriveImage(album.coverUrl) || album.coverUrl;
  return (
    <article className={`group relative overflow-hidden rounded-[2rem] border p-4 transition duration-300 hover:-translate-y-1 md:p-5 ${
      isNationalDay
        ? dark ? "snd-bento-card-dark text-white" : "snd-bento-card-light text-slate-900"
        : dark
        ? "border-[#f8ca14]/30 bg-[#080808] text-white shadow-[0_24px_60px_rgba(0,0,0,0.5)] hover:border-[#f8ca14]/60"
        : "border-[#08467d]/20 bg-white text-black shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:border-[#08467d]/50"
    }`}>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,transparent_45%,rgba(255,255,255,0.03)_46%,transparent_47%)]" />
      <div className="relative flex h-full flex-col gap-5 sm:flex-row">
        <button onClick={onOpen} className={`relative min-h-[160px] sm:min-h-[220px] w-full overflow-hidden rounded-[1.5rem] border text-right sm:w-[45%] ${
          isNationalDay
            ? dark ? "border-emerald-500/20 bg-[#001c10]" : "border-emerald-500/15 bg-emerald-50/50"
            : dark ? "border-white/[0.08] bg-[#0c0c0c]" : "border-black/[0.06] bg-[#f8f8f8]"
        }`} aria-label={`فتح ${album.title}`}>
          {/* Back tilted image — hidden on mobile */}
          <div className={`absolute bottom-[9%] left-[8%] top-[9%] w-[46%] overflow-hidden rounded-[1rem] border opacity-55 hidden sm:block ${
            isNationalDay
              ? dark ? "border-emerald-500/20 bg-[#002617]" : "border-emerald-500/20 bg-emerald-100/60"
              : dark ? "border-white/[0.1] bg-[#141414]" : "border-black/[0.08] bg-[#ebebeb]"
          }`} style={{ transform: "rotate(-7deg)" }}>
            {cover ? <VisualImage id={`albums-card-back-cover-${album.id}`} label="صورة خلفية بطاقة الألبوم" src={cover} alt="" className="h-full w-full object-cover" /> : null}
          </div>
          {/* Front cover — full on mobile, partial on sm+ */}
          <div className={`absolute inset-1 sm:bottom-[6%] sm:right-[10%] sm:top-[6%] sm:w-[54%] sm:inset-auto overflow-hidden rounded-[1rem] border p-0 sm:p-1.5 shadow-xl ${
            isNationalDay
              ? dark ? "border-[#f8ca14] bg-[#001f13] shadow-[0_12px_30px_rgba(0,90,54,0.5)]" : "border-emerald-600/50 bg-white"
              : dark ? "border-[#f8ca14]/60 bg-[#141414]" : "border-[#08467d]/40 bg-white"
          }`} style={{ transform: "rotate(0deg)" }}>
            {cover ? <VisualImage id={`albums-card-cover-${album.id}`} label="غلاف بطاقة الألبوم" src={cover} alt={`غلاف ${album.title}`} className="h-full w-full rounded-[.7rem] object-cover" /> : <div className={`grid h-full place-items-center ${isNationalDay ? (dark ? "text-[#f8ca14]" : "text-[#005A36]") : dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}><Camera size={34} /></div>}
          </div>
        </button>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
              isNationalDay
                ? dark ? "border-[#f8ca14]/40 bg-[#f8ca14]/15 text-[#f8ca14]" : "border-emerald-600/30 bg-emerald-50 text-[#005A36]"
                : dark ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]" : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"
            }`}>
              <Camera size={18} />
            </div>
            <p className={`pt-1 text-left text-[9px] font-black tracking-[.18em] ${
              isNationalDay ? (dark ? "text-[#f8ca14]" : "text-[#005A36]") : dark ? "text-[#f8ca14]" : "text-[#08467d]"
            }`}>
              {isNationalDay ? "NATIONAL ARCHIVE" : "EVENT ARCHIVE"} · {String(index + 1).padStart(2, "0")}
            </p>
          </div>
          <VisualEditable id={`albums-card-title-${album.id}`} tag="text" label="اسم الألبوم" defaultText={album.title} as="h3" className={`mt-4 text-2xl font-black ${dark ? "text-white" : isNationalDay ? "text-[#003822]" : "text-black"}`} />
          <VisualEditable id={`albums-card-description-${album.id}`} tag="text" label="وصف الألبوم" defaultText={album.description || "ألبوم من ذاكرة فعاليات مدارس العقيق، يجمع الصور والفيديوهات في تجربة قراءة واحدة."} as="p" className={`mt-3 text-sm leading-7 ${dark ? "text-slate-400" : isNationalDay ? "text-emerald-950/80" : "text-slate-600"}`} />
          <div className={`mt-auto flex items-end justify-between gap-3 border-t pt-4 ${isNationalDay ? (dark ? "border-[#5aba1c]/20" : "border-emerald-500/15") : dark ? "border-white/[0.08]" : "border-black/[0.08]"}`}>
            <div>
              <b className={`block text-xl font-black ${dark ? "text-white" : isNationalDay ? "text-[#003822]" : "text-black"}`}>{String(album.mediaCount || 0).padStart(2, "0")}</b>
              <span className={`text-[9px] font-black tracking-[.16em] ${isNationalDay ? (dark ? "text-[#5aba1c]" : "text-emerald-700") : dark ? "text-slate-500" : "text-slate-400"}`}>FILES</span>
            </div>
            <span className={`inline-flex items-center gap-1 text-[10px] font-black ${dark ? "text-slate-400" : isNationalDay ? "text-emerald-800/80" : "text-slate-500"}`}><Eye size={13} />{album.viewCount || 0}</span>
            <button onClick={onOpen} className={`inline-flex items-center gap-2 text-xs font-black transition ${
              isNationalDay ? (dark ? "text-[#f8ca14] hover:text-[#5aba1c]" : "text-[#005A36] hover:text-[#003822]") : dark ? "text-[#f8ca14] hover:opacity-80" : "text-[#08467d] hover:opacity-80"
            }`}>استكشف الآن <ArrowUpLeft size={15} /></button>
          </div>
        </div>
      </div>
    </article>
  );
}


function AlbumCardSkeleton({ dark }: { dark: boolean }) {
  return (
    <div className={`rounded-[2rem] border p-4 md:p-5 animate-pulse ${
      dark ? 'border-white/10 bg-[#0c0c0c]' : 'border-black/10 bg-gray-50'
    }`}>
      <div className="flex flex-col sm:flex-row gap-5">
        <div className={`min-h-[160px] sm:min-h-[220px] w-full sm:w-[45%] rounded-[1.5rem] ${
          dark ? 'bg-white/5' : 'bg-gray-200'
        }`} />
        <div className="flex-1 space-y-4">
          <div className={`h-4 rounded-full w-1/3 ${ dark ? 'bg-white/5' : 'bg-gray-200' }`} />
          <div className={`h-8 rounded-xl w-2/3 ${ dark ? 'bg-white/5' : 'bg-gray-200' }`} />
          <div className={`h-4 rounded-full w-full ${ dark ? 'bg-white/5' : 'bg-gray-200' }`} />
          <div className={`h-4 rounded-full w-3/4 ${ dark ? 'bg-white/5' : 'bg-gray-200' }`} />
        </div>
      </div>
    </div>
  );
}

export default function AqeeqAlbumsPage() {


  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";
  const { isNationalDay } = useSiteTheme();
  const { user, isAuthenticated } = useAuth();

  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<AqeeqSortOption>("newest");
  const [isTvMode, setIsTvMode] = useState(false);
  const [isWrappedOpen, setIsWrappedOpen] = useState(false);
  const isAdmin = isAuthenticated && user?.role === "admin";
  const { data: albums = [], isLoading } = trpc.aqeeqAlbums.publicList.useQuery(undefined, { refetchOnWindowFocus: false });
  const { data: journalIssues = [] } = trpc.schoolNews.publicList.useQuery(undefined, { refetchOnWindowFocus: false });
  const { data: orchestration } = trpc.executiveAdmin.getSiteOrchestration.useQuery(undefined, { refetchOnMount: true, staleTime: 0 });
  const visibleAlbums = useMemo(() => searchAndSortAqeeqContent(albums, searchQuery, sort), [albums, searchQuery, sort]) as PublicAlbum[];

  const featuredAlbum = useMemo(() => {
    if (orchestration?.heroCovers?.albumsMode === "custom" && orchestration?.heroCovers?.customAlbumId) {
      const found = albums.find((a) => a.id === orchestration.heroCovers.customAlbumId);
      if (found) return found as PublicAlbum;
    }
    return albums[0] as PublicAlbum | undefined;
  }, [albums, orchestration?.heroCovers]);

  const secondAlbum = useMemo(() => {
    if (!featuredAlbum) return undefined;
    if (orchestration?.heroCovers?.albumsSecondaryAlbumId) {
      const found = albums.find((a) => a.id === orchestration.heroCovers.albumsSecondaryAlbumId);
      if (found) return found as PublicAlbum;
    }
    return albums.find((a) => a.id !== featuredAlbum.id) as PublicAlbum | undefined;
  }, [albums, featuredAlbum, orchestration?.heroCovers?.albumsSecondaryAlbumId]);

  const { data: allMediaDetails, isLoading: isAllMediaLoading } = trpc.aqeeqAlbums.allPublicMedia.useQuery(
    undefined,
    { enabled: isTvMode }
  );

  if (isLoading) {
    return (
      <main dir="rtl" className={`min-h-screen aq-public-shell ${dark ? "bg-black text-white" : "bg-white text-black"}`}>
        <AlaqeeqStudioSiteHeader title="ألبوم العقيق" active="albums" logoUrl={journalIssues[0]?.headerLogoUrl} />
        <section className="mx-auto max-w-[1380px] px-4 sm:px-6 md:px-8 py-12 md:py-16">
          <div className="grid gap-6 lg:grid-cols-2">
            {[1, 2, 3, 4].map(i => <AlbumCardSkeleton key={i} dark={dark} />)}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main dir="rtl" className={`min-h-screen aq-public-shell ${
      isNationalDay
        ? dark ? "bg-[#01140c] text-white" : "bg-[#f8faf9] text-slate-900"
        : dark ? "bg-black text-white" : "bg-white text-black"
    }`}>
      <AlaqeeqStudioSiteHeader title="ألبوم العقيق" active="albums" logoUrl={journalIssues[0]?.headerLogoUrl} />
      {featuredAlbum ? (
        <>
          <section
            className={`relative isolate overflow-hidden border-b py-12 md:py-16 ${
              isNationalDay
                ? dark ? "snd-hero-dark border-emerald-500/25 text-white" : "snd-hero-light border-emerald-200/80 text-slate-900"
                : dark ? "border-white/[0.08] bg-black text-white" : "border-black/[0.06] bg-white text-black"
            }`}
          >
            <div className="relative mx-auto max-w-[1380px] px-4 sm:px-6 md:px-8">
              {/* Header Row: Title & Action Buttons */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <AqeeqSectionHeader
                  badge={isNationalDay ? "🇸🇦 أرشيف ألبومات العقيق · اليوم الوطني" : "PHOTO ALBUMS · معارض وألبومات العقيق"}
                  badgeIcon={<Camera size={13} />}
                  title="كل فعالية تحفظ لحظتها"
                  subtitle="رفوف رقمية تجمع صور وفيديوهات أنشطة مدارس العقيق، مصفوفة بتجربة سينمائية توثق أجمل اللحظات المدرسية."
                  dark={dark}
                  className="!mb-0"
                />

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Aqeeq Wrapped Button */}
                  <button
                    onClick={() => setIsWrappedOpen(true)}
                    className={`inline-flex items-center gap-2 rounded-2xl border px-6 py-3.5 text-xs font-black shadow-lg transition-all hover:scale-105 ${
                      dark
                        ? "border-amber-400/50 bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent text-amber-300 hover:border-amber-400 hover:shadow-[0_0_25px_rgba(248,202,20,0.3)] ring-1 ring-amber-400/20"
                        : "border-amber-500/40 bg-gradient-to-r from-amber-100 via-amber-50 to-white text-amber-950 hover:border-amber-500 shadow-md"
                    }`}
                  >
                    <Sparkles size={15} className="animate-pulse text-amber-400" />
                    <span>حصاد العقيق الذكي 🎬</span>
                    <span className="rounded-md bg-amber-400 px-1.5 py-0.5 text-[9px] font-black text-slate-950">AI VIDEO</span>
                  </button>

                  {isAdmin && (
                    <>
                      <button
                        onClick={() => navigate("/albums/manage")}
                        className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3.5 text-xs font-black transition-all hover:scale-105 shadow-md ${
                          dark ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14] hover:bg-[#f8ca14]/20" : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d] hover:bg-[#08467d]/20"
                        }`}
                      >
                        <Settings2 size={15} />
                        <span>إدارة الألبومات</span>
                      </button>
                      <button onClick={() => setIsTvMode(true)} className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3.5 text-xs font-black transition-all hover:scale-105 shadow-md ${
                        dark ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20" : "border-emerald-600/20 bg-emerald-600/10 text-emerald-700 hover:bg-emerald-600/20"
                      }`}>
                        <MonitorPlay size={16} />
                        <span>تشغيل كشاشة عرض 📺</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* 🌟 The Exact 7-col Hero + 3-stacked Cards Showcase */}
              <AqeeqPageHeroShowcase
                dark={dark}
                hero={{
                  id: featuredAlbum.id,
                  title: featuredAlbum.title,
                  coverUrl: directDriveImage(featuredAlbum.coverUrl) || featuredAlbum.coverUrl,
                  badge: `${featuredAlbum.mediaCount} لقطة موثقة`,
                  dateOrMeta: "ألبوم مميز",
                  href: `/albums/${featuredAlbum.slug}`,
                  excerpt: featuredAlbum.description || "معرض فوتوغرافي متكامل يوثق أبرز المحطات والفعاليات التعليمية في المدارس.",
                  ctaText: "استعراض الألبوم بالكامل",
                }}
                stack={visibleAlbums.filter((a) => a.id !== featuredAlbum.id).slice(0, 3).map((a) => ({
                  id: a.id,
                  title: a.title,
                  coverUrl: directDriveImage(a.coverUrl) || a.coverUrl,
                  badge: `${a.mediaCount} صورة وفيديو`,
                  href: `/albums/${a.slug}`,
                }))}
              />
            </div>
          </section>
          <section className="mx-auto max-w-[1380px] px-4 sm:px-6 md:px-8 py-12 md:py-16">
            <div className={`mb-8 flex items-end justify-between gap-4 border-b pb-5 ${dark ? "border-white/[0.08]" : "border-black/[0.08]"}`}>
              <div>
                <VisualEditable id="albums-archive-kicker" tag="text" label="شارة أرشيف الألبومات" defaultText="THE MEMORY WALL" as="p" className={`text-[10px] font-black tracking-[0.18em] ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`} />
                <VisualEditable id="albums-archive-title" tag="text" label="عنوان أرشيف الألبومات" defaultText="ألبومات العقيق" as="h2" className={`mt-2 text-2xl font-black ${dark ? "text-white" : "text-black"}`} />
              </div>
              <span className={`text-xs ${dark ? "text-slate-500" : "text-slate-400"}`}>{visibleAlbums.length} من {albums.length} ألبوم</span>
            </div>
            <AqeeqArchiveControls id="albums-archive-controls" label="البحث وترتيب الألبومات" query={searchQuery} onQueryChange={setSearchQuery} sort={sort} onSortChange={setSort} />
            {visibleAlbums.length ? (
              <div className="grid gap-6 lg:grid-cols-2">
                {visibleAlbums.map((album, index) => <AlbumCard key={album.id} album={album} index={index} dark={dark} onOpen={() => navigate(`/albums/${album.slug}`)} />)}
              </div>
            ) : (
              <VisualEditable id="albums-search-empty" tag="text" label="رسالة عدم وجود نتائج للألبومات" defaultText="لا توجد ألبومات مطابقة للبحث." as="p" className={`rounded-2xl border border-dashed p-8 text-center text-sm font-black ${
                dark ? "border-[#f8ca14]/30 text-[#f8ca14]" : "border-[#08467d]/30 text-[#08467d]"
              }`} />
            )}
          </section>
        </>
      ) : (
        <section className="mx-auto max-w-[900px] px-5 py-28 text-center">
          <Camera className={`mx-auto ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`} size={48} />
          <h1 className={`mt-6 text-3xl font-black ${dark ? "text-white" : "text-black"}`}>أول ألبوم في الطريق</h1>
          <p className={`mx-auto mt-3 max-w-md text-sm leading-7 ${dark ? "text-slate-400" : "text-slate-600"}`}>بعد نشر أول ألبوم، ستظهر هنا فعاليات وذكريات مدارس العقيق.</p>
          {isAdmin ? <button onClick={() => navigate("/albums/manage")} className={`mt-6 rounded-xl px-4 py-3 text-xs font-black ${dark ? "bg-[#f8ca14] text-black" : "bg-[#08467d] text-white"}`}>إنشاء أول ألبوم</button> : null}
        </section>
      )}

      {isTvMode && isAllMediaLoading && (
        <div className="fixed inset-0 z-[100] bg-black text-white flex items-center justify-center">
          <Loader2 className="animate-spin text-[#f8ca14]" size={48} />
        </div>
      )}

      {isTvMode && allMediaDetails && (
        <AqeeqAlbumTvMode 
          albumTitle="حصاد العقيق الشامل"
          images={(allMediaDetails || []).map((m: any) => ({
            id: m.id,
            url: m.imageUrl,
            caption: m.caption || m.albumTitle
          }))}
          onClose={() => setIsTvMode(false)}
        />
      )}

      <AqeeqAiYearbookGenerator open={isWrappedOpen} onOpenChange={setIsWrappedOpen} />

      {/* Unified Luxury Site Footer */}
      <AlaqeeqStudioSiteFooter />
    </main>
  );
}
