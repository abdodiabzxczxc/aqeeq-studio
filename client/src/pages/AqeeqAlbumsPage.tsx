import { useAuth } from "@/_core/hooks/useAuth";
import { AqeeqArchiveControls } from "@/components/AqeeqArchiveControls";
import { AlaqeeqStudioSiteHeader } from "@/components/AlaqeeqStudioSiteHeader";
import { AlaqeeqStudioSiteFooter } from "@/components/AlaqeeqStudioSiteFooter";
import { VisualEditable, VisualImage } from "@/components/VisualEditor";
import { searchAndSortAqeeqContent, type AqeeqSortOption } from "@/lib/aqeeqArchiveControls";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { trpc } from "@/lib/trpc";
import { ArrowUpLeft, Camera, Eye, ImageIcon, Loader2, Settings2, Sparkles, Video, MonitorPlay, Layers, FolderCheck } from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { AqeeqAlbumTvMode } from "@/components/AqeeqAlbumTvMode";
import { AqeeqAiYearbookGenerator } from "@/components/AqeeqAiYearbookGenerator";
import { getAqeeqAlbumImageSource } from "@/lib/aqeeqAlbumMedia";
import { useSiteTheme } from "@/lib/useSiteTheme";
import { AqeeqLuxuryPageShell } from "@/components/AqeeqLuxuryPageShell";
import { AqeeqGrandFinaleCta } from "@/components/AqeeqGrandFinaleCta";
import { useMagneticTilt, staggerContainer, fadeUpSpring } from "@/lib/motionPresets";
import { motion } from "framer-motion";
import { HeroParallax, HeroParallaxBackdrop, type ParallaxProduct } from "@/components/ui/hero-parallax";

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
    <motion.article
      variants={fadeUpSpring}
      className={`group relative overflow-hidden rounded-[2.2rem] border p-4 transition-all duration-300 hover:-translate-y-1 md:p-6 backdrop-blur-md ${
        isNationalDay
          ? dark
            ? "snd-bento-card-dark text-white hover:border-emerald-500/50 hover:shadow-[0_25px_60px_rgba(0,90,54,0.35)]"
            : "snd-bento-card-light text-slate-900 hover:border-emerald-500/40 hover:shadow-[0_20px_50px_rgba(0,90,54,0.18)]"
          : dark
          ? "border-white/[0.08] bg-[#0c1017]/85 text-white shadow-[0_24px_60px_rgba(0,0,0,0.6)] hover:border-[#f8ca14]/60 hover:shadow-[0_24px_70px_rgba(248,202,20,0.22)]"
          : "border-black/[0.06] bg-white/90 text-black shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:border-[#08467d]/40 hover:shadow-[0_20px_50px_rgba(8,70,125,0.15)]"
      }`}
    >
      <div className="relative flex h-full flex-col gap-5 sm:flex-row">
        <button onClick={onOpen} className={`relative min-h-[160px] sm:min-h-[220px] w-full overflow-hidden rounded-[1.5rem] border text-right sm:w-[45%] transition duration-500 group-hover:scale-[1.02] ${
          isNationalDay
            ? dark ? "border-emerald-500/20 bg-[#001c10]" : "border-emerald-500/15 bg-emerald-50/50"
            : dark ? "border-white/[0.08] bg-[#0c0c0c]" : "border-black/[0.06] bg-[#f8f8f8]"
        }`} aria-label={`فتح ${album.title}`}>
          {/* Back tilted image — hidden on mobile */}
          <div className={`absolute bottom-[9%] left-[8%] top-[9%] w-[46%] overflow-hidden rounded-[1rem] border opacity-55 hidden sm:block transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-105 ${
            isNationalDay
              ? dark ? "border-emerald-500/20 bg-[#002617]" : "border-emerald-500/20 bg-emerald-100/60"
              : dark ? "border-white/[0.1] bg-[#141414]" : "border-black/[0.08] bg-[#ebebeb]"
          }`} style={{ transform: "rotate(-7deg)" }}>
            {cover ? <VisualImage id={`albums-card-back-cover-${album.id}`} label="صورة خلفية بطاقة الألبوم" src={cover} alt="" className="h-full w-full object-cover" /> : null}
          </div>
          {/* Front cover — full on mobile, partial on sm+ */}
          <div className={`absolute inset-1 sm:bottom-[6%] sm:right-[10%] sm:top-[6%] sm:w-[54%] sm:inset-auto overflow-hidden rounded-[1rem] border p-0 sm:p-1.5 shadow-xl transition-transform duration-500 group-hover:rotate-3 group-hover:scale-105 ${
            isNationalDay
              ? dark ? "border-[#f8ca14] bg-[#001f13] shadow-[0_12px_30px_rgba(0,90,54,0.5)]" : "border-emerald-600/50 bg-white"
              : dark ? "border-[#f8ca14]/60 bg-[#141414]" : "border-[#08467d]/40 bg-white"
          }`} style={{ transform: "rotate(0deg)" }}>
            {cover ? <VisualImage id={`albums-card-cover-${album.id}`} label="غلاف بطاقة الألبوم" src={cover} alt={`غلاف ${album.title}`} className="h-full w-full rounded-[.7rem] object-cover" /> : <div className={`grid h-full place-items-center ${isNationalDay ? (dark ? "text-[#f8ca14]" : "text-[#005A36]") : dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}><Camera size={34} /></div>}
          </div>
        </button>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300 ${
              isNationalDay
                ? dark ? "border-[#f8ca14]/40 bg-[#f8ca14]/15 text-[#f8ca14]" : "border-emerald-600/30 bg-emerald-50 text-[#005A36]"
                : dark ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14] group-hover:border-[#f8ca14] group-hover:bg-[#f8ca14]/20" : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d] group-hover:border-[#08467d] group-hover:bg-[#08467d]/20"
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
              <span className={`text-[9px] font-black tracking-[.16em] ${isNationalDay ? (dark ? "text-[#5aba1c]" : "text-emerald-700") : dark ? "text-slate-500" : "text-slate-600"}`}>FILES</span>
            </div>
            <span className={`inline-flex items-center gap-1 text-[10px] font-black ${dark ? "text-slate-400" : isNationalDay ? "text-emerald-800/80" : "text-slate-500"}`}><Eye size={13} />{album.viewCount || 0}</span>
            <button onClick={onOpen} className={`inline-flex items-center gap-2 text-xs font-black transition ${
              isNationalDay ? (dark ? "text-[#f8ca14] hover:text-[#5aba1c]" : "text-[#005A36] hover:text-[#003822]") : dark ? "text-[#f8ca14] hover:opacity-80" : "text-[#08467d] hover:opacity-80"
            }`}>استكشف الآن <ArrowUpLeft size={15} /></button>
          </div>
        </div>
      </div>
    </motion.article>
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

const CURATED_PARALLAX_ITEMS: ParallaxProduct[] = [
  {
    title: "أبطال الروبوت والذكاء الاصطناعي — التميز والابتكار التقني",
    link: "/albums",
    thumbnail: "https://drive.google.com/thumbnail?id=1n7IK4RwKG85QDzG8b7ozSKBiEqWK3t_G&sz=w1600",
    category: "روبوت وابتكار",
    mediaCount: 28,
    date: "2025/2026",
  },
  {
    title: "احتفال اليوم الوطني السعودي 94 — مسيرة نحلم ونحقق",
    link: "/albums",
    thumbnail: "/uploads/site-media/1/1788028485125-edf9bbb7--2025-page-01_eb27e4f5.jpg",
    category: "اليوم الوطني",
    mediaCount: 36,
    date: "سبتمبر 2024",
  },
  {
    title: "معرض ستيم السنوي والابتكارات العلمية لطلاب العقيق",
    link: "/albums",
    thumbnail: "https://drive.google.com/thumbnail?id=1cGIKn1u0nlxBozaX26MvWZIP7aDOv-yI&sz=w1600",
    category: "معارض STEM",
    mediaCount: 24,
    date: "2025/2026",
  },
  {
    title: "ملتقى الفصاحة والخطابة والشعر العربي والإلقاء المتميز",
    link: "/albums",
    thumbnail: "https://drive.google.com/thumbnail?id=1t_wSQ5MqaWu286wV_yNzvhIX6aFOQYUQ&sz=w1600",
    category: "أنشطة أدبية",
    mediaCount: 18,
    date: "2025/2026",
  },
  {
    title: "حفل تكريم المتفوقين السنوي وأوسمة التميز الأكاديمي",
    link: "/albums",
    thumbnail: "/uploads/site-media/1/1788028485234-2ee12973--2025-page-02_185bab67.jpg",
    category: "تكريم وتفوق",
    mediaCount: 42,
    date: "دفعة 2025",
  },
  {
    title: "دوري العقيق الرياضي ومنافسات السباحة الأولمبية وكرة السلة",
    link: "/albums",
    thumbnail: "https://drive.google.com/thumbnail?id=1ogXiJnGPXNdftXlv_pCEA42YM4ahSCP7&sz=w1600",
    category: "رياضة وأولمبياد",
    mediaCount: 30,
    date: "2025/2026",
  },
  {
    title: "معرض الفنون التشكيلية والخط العربي الأصيل وإبداعات الطلاب",
    link: "/albums",
    thumbnail: "https://drive.google.com/thumbnail?id=1Rr4yp5mhuHND2aUiP3AJ6x-19aJhibwT&sz=w1600",
    category: "فنون وثقافة",
    mediaCount: 22,
    date: "2025/2026",
  },
  {
    title: "يوم التأسيس — ثلاثة قرون من العز والفخر والأصالة",
    link: "/albums",
    thumbnail: "/uploads/site-media/1/1788028485315-4a271a51--2025-page-03_2cbd33bd.jpg",
    category: "يوم التأسيس",
    mediaCount: 32,
    date: "فبراير 2025",
  },
  {
    title: "ملتقى الفضاء والعلوم الفلكية المتقدمة وأكاديمية الموهبة",
    link: "/albums",
    thumbnail: "https://drive.google.com/thumbnail?id=13YwNiK8b5C2d2Qjj2TkOoNQg2HDENzZ5&sz=w1600",
    category: "علوم الفضاء",
    mediaCount: 19,
    date: "2025/2026",
  },
  {
    title: "برامج القيادة وبناء الشخصية والقيم المدرسية الواعدة",
    link: "/albums",
    thumbnail: "https://drive.google.com/thumbnail?id=1Pb_coq0S-ppxBt3D9GBHF2mwGYNbAD8E&sz=w1600",
    category: "تربية وقيادة",
    mediaCount: 25,
    date: "2025/2026",
  },
  {
    title: "ملتقى اللغات الحية والمسار الدولي والدبلوماسية الطلابية",
    link: "/albums",
    thumbnail: "/uploads/site-media/1/1788029593077-c5897a5b-drive-1B3LhIXBI_l4gw0RQgAI92qeuufkowJWJ-p02_ef5b7537.jpg",
    category: "المسار الدولي",
    mediaCount: 27,
    date: "2025/2026",
  },
  {
    title: "مسابقة فرسان القرآن الكريم السنوية والتلاوة الندية",
    link: "/albums",
    thumbnail: "https://drive.google.com/thumbnail?id=1SUrEyn0qafbmPA_OOB0z89EnoZppuTi5&sz=w1600",
    category: "القرآن الكريم",
    mediaCount: 21,
    date: "رمضان 1446",
  },
  {
    title: "رحلات الاستكشاف البيئي والميداني للمحميات الطبيعية",
    link: "/albums",
    thumbnail: "/uploads/site-media/1/1788029593225-581e8411-drive-1B3LhIXBI_l4gw0RQgAI92qeuufkowJWJ-p03_990fb4a8.jpg",
    category: "رحلات ميدانية",
    mediaCount: 16,
    date: "2025/2026",
  },
  {
    title: "معرض التجارب المخبرية والكيمياء التطبيقية والبحث العلمي",
    link: "/albums",
    thumbnail: "https://drive.google.com/thumbnail?id=1WcPwj9a3KhDkuMzOOVIKURijTpDSn4Ly&sz=w1600",
    category: "مختبرات العلوم",
    mediaCount: 20,
    date: "2025/2026",
  },
  {
    title: "ملتقى خريجي مدارس العقيق وشبكة الخريجين الرائدة عبر الأجيال",
    link: "/albums",
    thumbnail: "/uploads/site-media/1/1788029593680-741ef4e8-drive-1B3LhIXBI_l4gw0RQgAI92qeuufkowJWJ-p04_1cc9a98b.jpg",
    category: "رابطة الخريجين",
    mediaCount: 35,
    date: "2025/2026",
  },
];

export default function AqeeqAlbumsPage() {
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";
  const { isNationalDay } = useSiteTheme();
  const { user, isAuthenticated } = useAuth();

  const [, navigate] = useLocation();
  const albumsHeroRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<AqeeqSortOption>("newest");
  const [isTvMode, setIsTvMode] = useState(false);
  const [isWrappedOpen, setIsWrappedOpen] = useState(false);
  const isAdmin = isAuthenticated && user?.role === "admin";
  const { data: albums = [], isLoading } = trpc.aqeeqAlbums.publicList.useQuery(undefined, { refetchOnWindowFocus: false });
  const { data: journalIssues = [] } = trpc.schoolNews.publicList.useQuery(undefined, { refetchOnWindowFocus: false });
  const { data: orchestration } = trpc.executiveAdmin.getSiteOrchestration.useQuery(undefined, { refetchOnMount: true, staleTime: 0 });
  const visibleAlbums = useMemo(() => searchAndSortAqeeqContent(albums, searchQuery, sort), [albums, searchQuery, sort]) as PublicAlbum[];

  // ─── FEAT-3: Client-side pagination for albums ──────────────────────────────
  const ALBUMS_PER_PAGE = 6;
  const [albumPage, setAlbumPage] = useState(1);
  const totalAlbumPages = Math.max(1, Math.ceil(visibleAlbums.length / ALBUMS_PER_PAGE));
  const paginatedAlbums = useMemo(
    () => visibleAlbums.slice((albumPage - 1) * ALBUMS_PER_PAGE, albumPage * ALBUMS_PER_PAGE),
    [visibleAlbums, albumPage],
  );
  useEffect(() => { setAlbumPage(1); }, [searchQuery, sort]);
  // ────────────────────────────────────────────────────────────────────────────


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
    { refetchOnWindowFocus: false }
  );

  const parallaxProducts = useMemo<ParallaxProduct[]>(() => {
    // If we have photos from inside the albums, display them so each card is a different authentic moment!
    if (allMediaDetails && allMediaDetails.length > 0) {
      return allMediaDetails.map((media) => ({
        title: media.caption || media.albumTitle || "فعالية العقيق",
        link: `/albums/${media.albumSlug}`,
        thumbnail: media.imageUrl || media.thumbnailUrl || "/uploads/site-media/1/1788029592790-9f51a02b-drive-1B3LhIXBI_l4gw0RQgAI92qeuufkowJWJ-p01_f952eff9.jpg",
        category: media.albumTitle || "ألبوم العقيق",
        date: "موسم العقيق",
      }));
    }

    const liveItems: ParallaxProduct[] = albums.map((album) => ({
      title: album.title,
      link: `/albums/${album.slug}`,
      thumbnail: directDriveImage(album.coverUrl) || album.coverUrl || "/uploads/site-media/1/1788029592790-9f51a02b-drive-1B3LhIXBI_l4gw0RQgAI92qeuufkowJWJ-p01_f952eff9.jpg",
      category: "ألبوم العقيق",
      mediaCount: album.mediaCount || 12,
      date: "موسم العقيق",
    }));

    const fallbackSlug = albums[0]?.slug ? `/albums/${albums[0].slug}` : "#albums-grid-section";
    const mappedCurated = CURATED_PARALLAX_ITEMS.map((item, idx) => ({
      ...item,
      link: albums[idx % (albums.length || 1)]?.slug ? `/albums/${albums[idx % (albums.length || 1)].slug}` : fallbackSlug,
    }));

    return [...liveItems, ...mappedCurated].slice(0, 15);
  }, [albums, allMediaDetails]);

  const totalMediaCount = useMemo(() => {
    if (allMediaDetails && allMediaDetails.length > 0) return allMediaDetails.length;
    return albums.reduce((acc, a) => acc + (a.mediaCount || 0), 0);
  }, [albums, allMediaDetails]);

  if (isLoading) {
    return (
      <AqeeqLuxuryPageShell
        header={<AlaqeeqStudioSiteHeader title="ألبوم العقيق" active="albums" logoUrl={journalIssues[0]?.headerLogoUrl} />}
      >
        <section className="mx-auto max-w-[1380px] 2xl:max-w-[1560px] px-4 sm:px-6 md:px-8 py-12 md:py-16">
          <div className="grid gap-6 lg:grid-cols-2">
            {[1, 2, 3, 4].map(i => <AlbumCardSkeleton key={i} dark={dark} />)}
          </div>
        </section>
      </AqeeqLuxuryPageShell>
    );
  }

  return (
    <AqeeqLuxuryPageShell
      header={<AlaqeeqStudioSiteHeader title="ألبوم العقيق" active="albums" logoUrl={journalIssues[0]?.headerLogoUrl} />}
      footer={<AlaqeeqStudioSiteFooter />}
      useCurtain={false}
      hero={
        <section
          ref={albumsHeroRef}
          className="relative isolate overflow-hidden flex flex-col justify-between pb-6 sm:pb-8 transition-colors duration-500 bg-transparent border-0 text-slate-900 dark:text-white"
        >
          {/* 3D Gliding Parallax Backdrop (Zero layout shift, unified height) */}
          <HeroParallaxBackdrop products={parallaxProducts} containerRef={albumsHeroRef} dark={dark} />



          <div className="relative mx-auto grid w-full max-w-[1380px] 2xl:max-w-[1560px] items-center gap-8 px-4 sm:px-6 md:px-8 py-6 sm:py-10 md:grid-cols-[1.1fr_1fr] lg:gap-16">
              {/* Right Column: Exact original text, colors, badges and buttons */}
              <div className="text-right relative z-10">
                {/* Ambient soft dark contrast scrim behind text for 100% clarity */}
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute -inset-6 -z-10 rounded-3xl blur-2xl ${
                    dark ? "bg-gradient-to-l from-black/85 via-black/50 to-transparent opacity-95" : "bg-gradient-to-l from-white/90 via-white/60 to-transparent opacity-90"
                  }`}
                />
                {isNationalDay ? (
                  <div
                    className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 mb-3 text-xs font-black shadow-md backdrop-blur-md ${
                      dark
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                        : "bg-emerald-50 border-emerald-500/30 text-[#005A36]"
                    }`}
                  >
                    <span className="text-sm">🇸🇦</span>
                    <span className="font-black">ألبوم العقيق · توثيق فعاليات الوطن</span>
                  </div>
                ) : (
                  <VisualEditable
                    id="albums-hero-kicker"
                    tag="text"
                    label="شارة غلاف الألبومات"
                    defaultText={orchestration?.heroCovers?.albumsCustomTag || "موسم العقيق · أرشيف الفعاليات"}
                    as="div"
                    className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-black ${
                      dark
                        ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]"
                        : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"
                    }`}
                  >
                    <Sparkles size={14} />
                    {orchestration?.heroCovers?.albumsCustomTag || "موسم العقيق · أرشيف الفعاليات"}
                  </VisualEditable>
                )}

                <VisualEditable
                  id="albums-hero-title"
                  tag="text"
                  label="عنوان غلاف الألبومات"
                  defaultText={orchestration?.heroCovers?.albumsCustomTitle || "كل فعالية تخلّد أثمن اللحظات."}
                  as="h1"
                  className={`mt-5 text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.12] ${
                    dark ? "text-white" : isNationalDay ? "text-[#003822]" : "text-black"
                  }`}
                >
                  {(text) => {
                    const raw = text || "كل فعالية تخلّد أثمن اللحظات.";
                    const match = raw.match(/^(.*?)(تخلّد أثمن اللحظات\.?|تحفظ أثمن اللحظات\.?|لحظتها\.?)$/);
                    if (match) {
                      return (
                        <>
                          <span className="block">{match[1].trim()}</span>
                          <span className={`block ${isNationalDay ? "snd-text-gradient" : dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>
                            {match[2].trim()}
                          </span>
                        </>
                      );
                    }
                    const words = raw.trim().split(/\s+/);
                    if (words.length >= 4) {
                      return (
                        <>
                          <span className="block">{words.slice(0, 2).join(" ")}</span>
                          <span className={`block ${isNationalDay ? "snd-text-gradient" : dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>
                            {words.slice(2).join(" ")}
                          </span>
                        </>
                      );
                    }
                    return raw;
                  }}
                </VisualEditable>

                <VisualEditable
                  id="albums-hero-intro"
                  tag="text"
                  label="مقدمة غلاف الألبومات"
                  defaultText={
                    orchestration?.heroCovers?.albumsCustomDesc ||
                    "رفوف رقمية تجمع صور وفيديوهات أنشطة مدارس العقيق، وكل ألبوم يفتح بطريقته المناسبة للذكرى."
                  }
                  as="p"
                  className={`mt-4 sm:mt-5 max-w-xl text-xs sm:text-sm leading-7 sm:leading-8 ${
                    dark ? "text-slate-300" : isNationalDay ? "text-slate-700 font-medium" : "text-slate-600 font-medium"
                  }`}
                />

                {/* 3 Unified Meta Statistics Pills */}
                <div
                  className="mt-6 flex flex-wrap gap-2 text-[10px] sm:text-[11px] font-bold"
                >
                  <span
                    className={`rounded-full border px-3.5 py-2 ${
                      isNationalDay
                        ? dark
                          ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]"
                          : "border-[#08467d]/20 bg-[#08467d]/5 text-[#08467d]"
                        : dark
                        ? "border-white/[0.1] bg-white/[0.03] text-slate-300"
                        : "border-[#08467d]/15 bg-white text-slate-700 shadow-sm"
                    }`}
                  >
                    <ImageIcon
                      className={`ml-1 inline ${
                        isNationalDay ? "text-[#f8ca14]" : dark ? "text-[#f8ca14]" : "text-[#08467d]"
                      }`}
                      size={13}
                    />
                    {albums.length} ألبوم
                  </span>

                  <span
                    className={`rounded-full border px-3.5 py-2 ${
                      isNationalDay
                        ? dark
                          ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]"
                          : "border-[#08467d]/20 bg-[#08467d]/5 text-[#08467d]"
                        : dark
                        ? "border-white/[0.1] bg-white/[0.03] text-slate-300"
                        : "border-[#08467d]/15 bg-white text-slate-700 shadow-sm"
                    }`}
                  >
                    <Layers
                      className={`ml-1 inline ${
                        isNationalDay ? "text-[#f8ca14]" : dark ? "text-[#f8ca14]" : "text-[#08467d]"
                      }`}
                      size={13}
                    />
                    {totalMediaCount} صورة وملف
                  </span>

                  <span
                    className={`rounded-full border px-3.5 py-2 ${
                      isNationalDay
                        ? dark
                          ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]"
                          : "border-[#08467d]/20 bg-[#08467d]/5 text-[#08467d]"
                        : dark
                        ? "border-white/[0.1] bg-white/[0.03] text-slate-300"
                        : "border-[#08467d]/15 bg-white text-slate-700 shadow-sm"
                    }`}
                  >
                    <FolderCheck
                      className={`ml-1 inline ${
                        isNationalDay ? "text-[#f8ca14]" : dark ? "text-[#f8ca14]" : "text-[#08467d]"
                      }`}
                      size={13}
                    />
                    أرشيف رقمي موثق
                  </span>
                </div>

                {/* Harmonized Single Row Action Buttons Bar */}
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <VisualEditable
                    id="albums-hero-action"
                    tag="button"
                    label="زر فتح الألبوم الحالي"
                    defaultText="ابدأ بالألبوم الحالي"
                    as="button"
                    onAction={() =>
                      navigate(`/albums/${featuredAlbum?.slug || albums[0]?.slug || ""}`)
                    }
                    className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-black shadow-lg transition active:scale-95 hover:opacity-90 ${
                      dark
                        ? "!bg-[#f8ca14] !text-black shadow-[0_0_20px_rgba(248,202,20,0.3)]"
                        : isNationalDay
                        ? "!bg-[#005A36] !text-white shadow-[0_0_20px_rgba(0,90,54,0.25)] hover:bg-[#003822]"
                        : "!bg-[#08467d] !text-white shadow-[0_0_20px_rgba(8,70,125,0.2)]"
                    }`}
                  >
                    <ArrowUpLeft size={16} />
                    ابدأ بالألبوم الحالي
                  </VisualEditable>

                  <button
                    onClick={() => setIsWrappedOpen(true)}
                    className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-xs font-black transition active:scale-95 ${
                      dark
                        ? "border-amber-400/40 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20"
                        : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d] hover:bg-[#08467d]/20"
                    }`}
                  >
                    <Sparkles size={16} className="text-amber-500 dark:text-amber-400" />
                    <span>حصاد العقيق الذكي</span>
                    <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-black ${
                      dark ? "bg-amber-400/20 text-amber-300" : "bg-[#08467d]/15 text-[#08467d]"
                    }`}>
                      AI VIDEO
                    </span>
                  </button>

                  <button
                    onClick={() => setIsTvMode(true)}
                    className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-xs font-black transition active:scale-95 ${
                      dark
                        ? "border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
                        : "border-slate-300/80 bg-slate-100/90 text-slate-700 hover:bg-slate-200/90"
                    }`}
                  >
                    <MonitorPlay size={16} />
                    <span>شاشة العرض المباشر</span>
                  </button>

                  {isAdmin ? (
                    <button
                      onClick={() => navigate("/albums/manage")}
                      className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-xs font-black transition active:scale-95 ${
                        dark
                          ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14] hover:bg-[#f8ca14]/20"
                          : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d] hover:bg-[#08467d]/20"
                      }`}
                    >
                      <Settings2 size={16} />
                      <span>دخول استوديو الألبومات</span>
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Left Column: 2 tilted cards */}
              <div className="relative mx-auto h-[340px] sm:h-[360px] w-full max-w-[560px] md:h-[460px]">
                {secondAlbum ? (
                  <button
                    onClick={() => navigate(`/albums/${secondAlbum.slug}`)}
                    className={`absolute left-[4%] top-[5%] h-[77%] w-[62%] overflow-hidden rounded-[1.7rem] border p-2 opacity-65 shadow-2xl transition hover:opacity-90 ${
                      isNationalDay
                        ? dark ? "border-emerald-500/20 bg-[#001c10]" : "border-emerald-500/20 bg-white"
                        : dark ? "border-white/[0.1] bg-[#111111]" : "border-black/[0.08] bg-[#f0f0f0]"
                    }`}
                    style={{ transform: "rotate(-7deg)" }}
                  >
                    <VisualImage
                      id={`albums-hero-previous-cover-${secondAlbum.id}`}
                      label="غلاف الألبوم السابق"
                      src={directDriveImage(secondAlbum.coverUrl) || secondAlbum.coverUrl || ""}
                      alt=""
                      className="h-full w-full rounded-[1.2rem] object-cover"
                    />
                  </button>
                ) : null}

                {featuredAlbum ? (
                  <button
                    onClick={() => navigate(`/albums/${featuredAlbum.slug}`)}
                    className={`group absolute bottom-1 right-[5%] h-[88%] w-[70%] overflow-hidden rounded-[1.85rem] border p-2 shadow-2xl transition hover:scale-[1.02] ${
                      isNationalDay
                        ? dark
                          ? "border-[#f8ca14]/70 bg-[#001f13] shadow-[0_20px_50px_rgba(0,90,54,0.4)]"
                          : "border-emerald-500/50 bg-white shadow-[0_20px_50px_rgba(0,90,54,0.15)]"
                        : dark
                        ? "border-[#f8ca14]/50 bg-[#111111]"
                        : "border-[#08467d]/30 bg-white"
                    }`}
                    style={{ transform: "rotate(3deg)" }}
                  >
                    <div className="relative h-full overflow-hidden rounded-[1.35rem]">
                      {featuredAlbum.coverUrl ? (
                        <VisualImage
                          id={`albums-hero-current-cover-${featuredAlbum.id}`}
                          label="غلاف الألبوم الحالي"
                          src={directDriveImage(featuredAlbum.coverUrl) || featuredAlbum.coverUrl}
                          alt={`غلاف ${featuredAlbum.title}`}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div
                          className={`grid h-full place-items-center ${
                            dark
                              ? "bg-[#181818] text-[#f8ca14]"
                              : isNationalDay
                              ? "bg-emerald-50 text-[#005A36]"
                              : "bg-slate-100 text-[#08467d]"
                          }`}
                        >
                          <Camera size={42} />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent px-5 pb-5 pt-20 text-right">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f8ca14] px-2.5 py-0.5 text-[10px] font-black text-black shadow-md">
                            <Sparkles size={11} />
                            ألبوم معتمد
                          </span>
                          <span className="text-[10px] font-bold text-[#f8ca14]/90">
                            {featuredAlbum.mediaCount} صورة وملف
                          </span>
                        </div>
                        <VisualEditable
                          id="albums-hero-featured-title"
                          tag="text"
                          label="عنوان غلاف الألبوم الحالي"
                          defaultText={featuredAlbum.title}
                          as="p"
                          className="mt-1 text-base sm:text-lg font-black text-white leading-snug line-clamp-2 drop-shadow-md"
                        />
                      </div>
                    </div>
                  </button>
                ) : null}
              </div>
            </div>
          </section>
        }
      >
      <section id="albums-grid-section" className="mx-auto max-w-[1380px] 2xl:max-w-[1560px] px-4 sm:px-6 md:px-8 pt-8 sm:pt-10 pb-28 sm:pb-32">
        <div className="mb-10 sm:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="max-w-2xl text-right">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full border mb-3 text-[10px] font-black tracking-widest uppercase ${
              dark ? "bg-[#f8ca14]/10 border-[#f8ca14]/30 text-[#f8ca14]" : "bg-[#08467d]/10 border-[#08467d]/20 text-[#08467d]"
            }`}>
              <Camera size={13} />
              <VisualEditable id="albums-archive-kicker" tag="text" label="شارة أرشيف الألبومات" defaultText="THE MEMORY WALL · الأرشيف المصور" as="span" />
            </div>

            <VisualEditable
              id="albums-archive-title"
              tag="text"
              label="عنوان أرشيف الألبومات"
              defaultText="ألبومات وذاكرة العقيق المصورة"
              as="h2"
              className={`text-2xl sm:text-4xl lg:text-5xl font-black font-cairo leading-tight ${dark ? "text-white" : "text-black"}`}
            />

            {/* Glowing Golden Accent Line */}
            <div
              className={`h-1 sm:h-[3.5px] w-40 rounded-full my-3.5 ${
                dark
                  ? "bg-gradient-to-l from-[#f8ca14] via-[#f8ca14]/80 to-transparent shadow-[0_0_15px_rgba(248,202,20,0.6)]"
                  : "bg-gradient-to-l from-[#08467d] via-[#08467d]/80 to-transparent shadow-[0_0_12px_rgba(8,70,125,0.4)]"
              }`}
            />

            <VisualEditable
              id="albums-archive-desc"
              tag="text"
              label="وصف أرشيف الألبومات"
              defaultText="سجل فوتوغرافي ومرئي متكامل يوثق أبرز فعاليات ومحطات مدارس العقيق بالمدينة المنورة، متاح للمشاهدة والتنزيل بجودة عالية."
              as="p"
              className={`mt-2 max-w-xl text-xs sm:text-sm leading-relaxed ${dark ? "text-slate-300 font-medium" : "text-slate-600 font-medium"}`}
            />
          </div>

          <span className={`self-start md:self-end rounded-full border px-3.5 py-1.5 text-xs font-black shrink-0 ${
            dark ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]" : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"
          }`}>
            {visibleAlbums.length} من {albums.length} ألبوم
          </span>
        </div>
            <AqeeqArchiveControls id="albums-archive-controls" label="البحث وترتيب الألبومات" query={searchQuery} onQueryChange={setSearchQuery} sort={sort} onSortChange={setSort} />
            {visibleAlbums.length ? (
              <>
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-40px" }}
                  className="grid gap-6 lg:grid-cols-2"
                >
                  {paginatedAlbums.map((album, index) => <AlbumCard key={album.id} album={album} index={index} dark={dark} onOpen={() => navigate(`/albums/${album.slug}`)} />)}
                </motion.div>

                {/* Pagination Controls */}
                {totalAlbumPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8" dir="rtl">
                    <button
                      type="button"
                      aria-label="الصفحة السابقة"
                      onClick={() => { setAlbumPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      disabled={albumPage === 1}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-black transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${
                        dark ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10" : "border-black/10 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >›</button>
                    {Array.from({ length: totalAlbumPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        type="button"
                        aria-label={`الصفحة ${page}`}
                        aria-current={albumPage === page ? "page" : undefined}
                        onClick={() => { setAlbumPage(page); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-black transition cursor-pointer ${
                          albumPage === page
                            ? dark ? "border-[#f8ca14] bg-[#f8ca14] text-black" : "border-[#08467d] bg-[#08467d] text-white"
                            : dark ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10" : "border-black/10 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >{page}</button>
                    ))}
                    <button
                      type="button"
                      aria-label="الصفحة التالية"
                      onClick={() => { setAlbumPage((p) => Math.min(totalAlbumPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      disabled={albumPage === totalAlbumPages}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-black transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${
                        dark ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10" : "border-black/10 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >‹</button>
                  </div>
                )}
              </>
            ) : (
              <VisualEditable id="albums-search-empty" tag="text" label="رسالة عدم وجود نتائج للألبومات" defaultText="لا توجد ألبومات مطابقة للبحث." as="p" className={`rounded-2xl border border-dashed p-8 text-center text-sm font-black ${
                dark ? "border-[#f8ca14]/30 text-[#f8ca14]" : "border-[#08467d]/30 text-[#08467d]"
              }`} />
            )}
          </section>

          {albums.length === 0 && (
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

      {/* Stage 5: Grand Interactive Finale & Action */}
      <AqeeqGrandFinaleCta
        badge="✦ استوديو التوثيق والإنتاج ✦"
        title="وثّق لحظات التميز وشارك في صناعة المحتوى البصري لمدارس العقيق"
        subtitle="فريق العقيق الإعلامي يوثق كافة الأنشطة والمناسبات المدرسية بأحدث تقنيات التصوير السينمائي."
        primaryActionText="استكشف الفيديوهات والعروض"
        primaryActionHref="/offers"
        onPrimaryAction={() => navigate("/offers")}
        secondaryActionText="استمع لبودكاست أثير"
        secondaryActionHref="/atheer"
        onSecondaryAction={() => navigate("/atheer")}
      />

      <AqeeqAiYearbookGenerator open={isWrappedOpen} onOpenChange={setIsWrappedOpen} />
    </AqeeqLuxuryPageShell>
  );
}
