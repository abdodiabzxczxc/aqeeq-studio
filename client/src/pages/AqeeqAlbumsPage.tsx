import { useAuth } from "@/_core/hooks/useAuth";
import { AqeeqArchiveControls } from "@/components/AqeeqArchiveControls";
import { AlaqeeqStudioSiteHeader } from "@/components/AlaqeeqStudioSiteHeader";
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
        ? "heritage-card-frame border-[#5aba1c]/40 text-white shadow-[0_20px_50px_rgba(0,50,25,0.4)] hover:border-[#f8ca14]"
        : dark
        ? "border-[#f8ca14]/30 bg-[#080808] text-white shadow-[0_24px_60px_rgba(0,0,0,0.5)] hover:border-[#f8ca14]/60"
        : "border-[#08467d]/20 bg-white text-black shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:border-[#08467d]/50"
    }`}>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,transparent_45%,rgba(255,255,255,0.03)_46%,transparent_47%)]" />
      <div className="relative flex h-full flex-col gap-5 sm:flex-row">
        <button onClick={onOpen} className={`relative min-h-[160px] sm:min-h-[220px] w-full overflow-hidden rounded-[1.5rem] border text-right sm:w-[45%] ${
          isNationalDay
            ? "border-[#5aba1c]/20 bg-[#001c10]"
            : dark ? "border-white/[0.08] bg-[#0c0c0c]" : "border-black/[0.06] bg-[#f8f8f8]"
        }`} aria-label={`فتح ${album.title}`}>
          {/* Back tilted image — hidden on mobile */}
          <div className={`absolute bottom-[9%] left-[8%] top-[9%] w-[46%] overflow-hidden rounded-[1rem] border opacity-55 hidden sm:block ${
            isNationalDay
              ? "border-[#5aba1c]/20 bg-[#002617]"
              : dark ? "border-white/[0.1] bg-[#141414]" : "border-black/[0.08] bg-[#ebebeb]"
          }`} style={{ transform: "rotate(-7deg)" }}>
            {cover ? <VisualImage id={`albums-card-back-cover-${album.id}`} label="صورة خلفية بطاقة الألبوم" src={cover} alt="" className="h-full w-full object-cover" /> : null}
          </div>
          {/* Front cover — full on mobile, partial on sm+ */}
          <div className={`absolute inset-1 sm:bottom-[6%] sm:right-[10%] sm:top-[6%] sm:w-[54%] sm:inset-auto overflow-hidden rounded-[1rem] border p-0 sm:p-1.5 shadow-xl ${
            isNationalDay
              ? "border-[#f8ca14] bg-[#001f13] shadow-[0_12px_30px_rgba(0,90,54,0.5)]"
              : dark ? "border-[#f8ca14]/60 bg-[#141414]" : "border-[#08467d]/40 bg-white"
          }`} style={{ transform: "rotate(0deg)" }}>
            {cover ? <VisualImage id={`albums-card-cover-${album.id}`} label="غلاف بطاقة الألبوم" src={cover} alt={`غلاف ${album.title}`} className="h-full w-full rounded-[.7rem] object-cover" /> : <div className={`grid h-full place-items-center ${isNationalDay ? "text-[#f8ca14]" : dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}><Camera size={34} /></div>}
          </div>
        </button>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
              isNationalDay
                ? "border-[#f8ca14]/40 bg-[#f8ca14]/15 text-[#f8ca14]"
                : dark ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]" : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"
            }`}>
              <Camera size={18} />
            </div>
            <p className={`pt-1 text-left text-[9px] font-black tracking-[.18em] ${isNationalDay ? "text-[#f8ca14]" : dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>
              {isNationalDay ? "NATIONAL ARCHIVE" : "EVENT ARCHIVE"} · {String(index + 1).padStart(2, "0")}
            </p>
          </div>
          <VisualEditable id={`albums-card-title-${album.id}`} tag="text" label="اسم الألبوم" defaultText={album.title} as="h3" className={`mt-4 text-2xl font-black ${dark ? "text-white" : "text-black"}`} />
          <VisualEditable id={`albums-card-description-${album.id}`} tag="text" label="وصف الألبوم" defaultText={album.description || "ألبوم من ذاكرة فعاليات مدارس العقيق، يجمع الصور والفيديوهات في تجربة قراءة واحدة."} as="p" className={`mt-3 text-sm leading-7 ${dark ? "text-slate-400" : "text-slate-600"}`} />
          <div className={`mt-auto flex items-end justify-between gap-3 border-t pt-4 ${isNationalDay ? "border-[#5aba1c]/20" : dark ? "border-white/[0.08]" : "border-black/[0.08]"}`}>
            <div>
              <b className={`block text-xl font-black ${dark ? "text-white" : "text-black"}`}>{String(album.mediaCount || 0).padStart(2, "0")}</b>
              <span className={`text-[9px] font-black tracking-[.16em] ${isNationalDay ? "text-[#5aba1c]" : dark ? "text-slate-500" : "text-slate-400"}`}>FILES</span>
            </div>
            <span className={`inline-flex items-center gap-1 text-[10px] font-black ${dark ? "text-slate-400" : "text-slate-500"}`}><Eye size={13} />{album.viewCount || 0}</span>
            <button onClick={onOpen} className={`inline-flex items-center gap-2 text-xs font-black transition ${isNationalDay ? "text-[#f8ca14] hover:text-[#5aba1c]" : dark ? "text-[#f8ca14] hover:opacity-80" : "text-[#08467d] hover:opacity-80"}`}>استكشف الآن <ArrowUpLeft size={15} /></button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function AqeeqAlbumsPage() {


  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";
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

  if (isLoading) return <div className={`grid min-h-screen place-items-center ${dark ? "bg-black text-white" : "bg-white text-black"}`}><Loader2 className="animate-spin text-[#f8ca14]" /></div>;

  return (
    <main dir="rtl" className={`min-h-screen aq-public-shell ${dark ? "bg-black text-white" : "bg-white text-black"}`}>
      <AlaqeeqStudioSiteHeader title="ألبوم العقيق" active="albums" logoUrl={journalIssues[0]?.headerLogoUrl} />
      {featuredAlbum ? (
        <>
          <section className={`relative isolate overflow-hidden border-b ${
            dark ? "border-white/[0.08] bg-black text-white" : "border-black/[0.06] bg-white text-black"
          }`}>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_86%_18%,rgba(248,202,20,0.12),transparent_25%)]" />
            <div className="relative mx-auto grid max-w-[1380px] items-center gap-8 px-4 sm:px-6 md:px-8 py-12 md:grid-cols-[minmax(390px,.9fr)_minmax(0,1.1fr)] md:py-16 lg:gap-16">
              <div className="relative order-2 mx-auto h-[360px] w-full max-w-[580px] md:order-1 md:h-[470px]">
                {secondAlbum ? (
                  <button onClick={() => navigate(`/albums/${secondAlbum.slug}`)} className={`absolute left-[4%] top-[5%] h-[77%] w-[62%] overflow-hidden rounded-[1.7rem] border p-2 opacity-65 shadow-2xl ${
                    dark ? "border-white/[0.1] bg-[#111111]" : "border-black/[0.08] bg-[#f0f0f0]"
                  }`} style={{ transform: "rotate(-7deg)" }}>
                    <VisualImage id={`albums-hero-previous-cover-${secondAlbum.id}`} label="غلاف الألبوم السابق" src={directDriveImage(secondAlbum.coverUrl) || secondAlbum.coverUrl || ""} alt="" className="h-full w-full rounded-[1.2rem] object-cover" />
                  </button>
                ) : null}
                <button onClick={() => navigate(`/albums/${featuredAlbum.slug}`)} className={`group absolute bottom-1 right-[5%] h-[88%] w-[70%] overflow-hidden rounded-[1.85rem] border p-2 shadow-2xl ${
                  dark ? "border-[#f8ca14]/50 bg-[#111111]" : "border-[#08467d]/30 bg-white"
                }`} style={{ transform: "rotate(3deg)" }}>
                  <div className="relative h-full overflow-hidden rounded-[1.35rem]">
                    {featuredAlbum.coverUrl ? (
                      <VisualImage id={`albums-hero-current-cover-${featuredAlbum.id}`} label="غلاف الألبوم الحالي" src={directDriveImage(featuredAlbum.coverUrl) || featuredAlbum.coverUrl} alt={`غلاف ${featuredAlbum.title}`} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
                    ) : (
                      <div className={`grid h-full place-items-center ${dark ? "bg-[#181818] text-[#f8ca14]" : "bg-slate-100 text-[#08467d]"}`}><Camera size={42} /></div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/50 to-transparent px-4 pb-4 pt-16">
                      <span className="text-[10px] font-black text-[#f8ca14]">{featuredAlbum.mediaCount} ملف</span>
                      <VisualEditable id="albums-hero-featured-title" tag="text" label="عنوان غلاف الألبوم الحالي" defaultText={featuredAlbum.title} as="h2" className="mt-1 text-lg font-black text-white" />
                    </div>
                  </div>
                </button>
              </div>
              <div className="order-1 md:order-2">
                <VisualEditable id="albums-hero-kicker" tag="text" label="شارة غلاف الألبومات" defaultText={orchestration?.heroCovers?.albumsCustomTag || "موسم العقيق · أرشيف الفعاليات"} as="div" className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black ${
                  dark ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]" : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"
                }`}>
                  <Sparkles size={14} />{orchestration?.heroCovers?.albumsCustomTag || "موسم العقيق · أرشيف الفعاليات"}
                </VisualEditable>
                <VisualEditable id="albums-hero-title" tag="text" label="عنوان غلاف الألبومات" defaultText={orchestration?.heroCovers?.albumsCustomTitle || "كل فعالية تحفظ لحظتها."} as="h1" className={`mt-5 text-4xl font-black leading-[1.12] md:text-6xl ${dark ? "text-white" : "text-black"}`} />
                <VisualEditable id="albums-hero-intro" tag="text" label="مقدمة غلاف الألبومات" defaultText={orchestration?.heroCovers?.albumsCustomDesc || "رفوف رقمية تجمع صور وفيديوهات أنشطة مدارس العقيق، وكل ألبوم يفتح بطريقته المناسبة للذكرى."} as="p" className={`mt-5 max-w-xl text-sm leading-8 ${dark ? "text-slate-300" : "text-slate-600"}`} />
                <div className="mt-6 flex flex-wrap gap-2 text-[10px] font-bold">
                  <span className={`rounded-full border px-3 py-2 ${
                    dark ? "border-white/[0.1] bg-white/[0.03] text-slate-300" : "border-black/[0.08] bg-slate-50 text-slate-700"
                  }`}>
                    <ImageIcon className={`ml-1 inline ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`} size={13} />{albums.length} ألبوم منشور
                  </span>
                  <span className={`rounded-full border px-3 py-2 ${
                    dark ? "border-white/[0.1] bg-white/[0.03] text-slate-300" : "border-black/[0.08] bg-slate-50 text-slate-700"
                  }`}>
                    <Video className={`ml-1 inline ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`} size={13} />صور وفيديوهات
                  </span>
                </div>
                <div className="mt-7 flex flex-wrap gap-3">
                  <VisualEditable id="albums-hero-action" tag="button" label="زر فتح الألبوم الحالي" defaultText="ابدأ بالألبوم الحالي" as="button" onAction={() => navigate(`/albums/${featuredAlbum.slug}`)} className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-black shadow-lg transition active:scale-95 hover:opacity-90 ${
                    dark ? "!bg-[#f8ca14] !text-black shadow-[0_0_20px_rgba(248,202,20,0.3)]" : "!bg-[#08467d] !text-white shadow-[0_0_20px_rgba(8,70,125,0.2)]"
                  }`}>
                    <ArrowUpLeft size={16} />ابدأ بالألبوم الحالي
                  </VisualEditable>
                  
                  {/* Aqeeq Wrapped Button (For everyone) */}
                  <button onClick={() => setIsWrappedOpen(true)} className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-xs font-black shadow-lg transition active:scale-95 hover:scale-105 ${
                    dark
                      ? "border-amber-400/50 bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent text-amber-300 hover:border-amber-400 hover:shadow-[0_0_25px_rgba(248,202,20,0.3)] ring-1 ring-amber-400/20"
                      : "border-amber-500/40 bg-gradient-to-r from-amber-100 via-amber-50 to-white text-amber-950 hover:border-amber-500 shadow-md"
                  }`}>
                    <Sparkles size={16} className="animate-pulse text-amber-400" />
                    <span>حصاد العقيق الذكي 🎬</span>
                    <span className="rounded-md bg-amber-400 px-1.5 py-0.5 text-[9px] font-black text-slate-950">AI VIDEO</span>
                  </button>
                  
                  {isAdmin ? (
                    <>
                      <button onClick={() => navigate("/albums/manage")} className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-xs font-black transition ${
                        dark ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14] hover:bg-[#f8ca14]/20" : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d] hover:bg-[#08467d]/20"
                      }`}>
                        <Settings2 size={16} />دخول استوديو الألبومات
                      </button>
                      <button onClick={() => setIsTvMode(true)} className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-xs font-black transition ${
                        dark ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20" : "border-emerald-600/20 bg-emerald-600/10 text-emerald-700 hover:bg-emerald-600/20"
                      }`}>
                        <MonitorPlay size={16} />تشغيل كشاشة عرض 📺
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
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
          <p className={`mx-auto mt-3 max-w-md text-sm leading-7 ${dark ? "text-slate-400" : "text-slate-600"}`}>بعد نشر أول ألبوم من الاستوديو، ستظهر هنا ذاكرة الفعالية.</p>
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
    </main>
  );
}
