import { useAuth } from "@/_core/hooks/useAuth";
import { usePublishedHomepage } from "@/contexts/PublishedHomepageContext";
import { AqeeqUnifiedVideoFrame, AqeeqVideoPoster } from "@/components/AqeeqVideoPoster";
import AqeeqAlbumSocialEmbed from "@/components/AqeeqAlbumSocialEmbed";
import { AlaqeeqStudioSiteHeader } from "@/components/AlaqeeqStudioSiteHeader";
import SchoolNewsFlipbook from "@/components/SchoolNewsFlipbook";
import { VisualEditable, VisualIcon, VisualImage } from "@/components/VisualEditor";
import { AqeeqReaderAudioController } from "@/components/AqeeqReaderAudioController";
import { AqeeqFaceSearchModal } from "@/components/AqeeqFaceSearchModal";
import { AqeeqAlbumTvMode } from "@/components/AqeeqAlbumTvMode";
import { getAqeeqDefaultBackgroundAudio } from "@/lib/aqeeqAudioPresets";
import { getAqeeqAlbumImageSource } from "@/lib/aqeeqAlbumMedia";
import { getAqeeqAlbumSpreadWatermark } from "@/lib/aqeeqAlbumReaderTheme";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { getAqeeqViewerKey } from "@/lib/aqeeqViewTracking";
import { trpc } from "@/lib/trpc";
import { Archive, BookOpen, ChevronLeft, ChevronRight, Download, ImageIcon, LayoutGrid, Loader2, Maximize2, MonitorPlay, Moon, Printer, RotateCcw, ScanFace, Settings2, Share2, Sparkles, Sun, Video, Volume2, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";

type AlbumMode = "spread" | "scroll" | "gallery";
type AlbumItem = {
  id: number;
  mediaUrl: string;
  thumbnailUrl: string | null;
  fileName: string;
  mimeType: string;
  mediaType: "image" | "video";
  sourceType?: "drive" | "manual" | "x" | "instagram" | "youtube";
  externalUrl?: string | null;
  caption: string | null;
};

function AlbumMedia({ item }: { item: AlbumItem }) {
  if (item.sourceType === "x" || item.sourceType === "instagram" || item.sourceType === "youtube") {
    return <AqeeqAlbumSocialEmbed source={item.sourceType} url={item.externalUrl || item.mediaUrl} title={item.caption || item.fileName} />;
  }
  if (item.mediaType === "video") {
    return (
      <AqeeqUnifiedVideoFrame
        sourceUrl={item.mediaUrl}
        posterUrl={getAqeeqAlbumImageSource(item)}
        title={item.caption || item.fileName}
      />
    );
  }
  return <VisualImage id={`album-reader-media-${item.id}`} label="صورة داخل الألبوم" src={getAqeeqAlbumImageSource(item)} alt={item.caption || item.fileName} className="h-full w-full object-contain" />;
}

export default function AqeeqAlbumReaderPage({ slug }: { slug: string }) {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { snapshot } = usePublishedHomepage();
  const isAdmin = isAuthenticated && user?.role === "admin";
  const isPreview = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("preview") === "1";
  const { data: publicAlbum, isLoading: isPublicLoading } = trpc.aqeeqAlbums.publicAlbum.useQuery({ slug }, { enabled: !isPreview });
  const { data: draftAlbum, isLoading: isDraftLoading } = trpc.aqeeqAlbums.album.useQuery({ slug }, { enabled: isPreview && isAdmin });
  const recordView = trpc.aqeeqAlbums.recordView.useMutation();
  const [storedPreview] = useState(() => { if (!isPreview) return null; try { return JSON.parse(localStorage.getItem(`aqeeq-album-preview:${slug}`) || "null") as Record<string, unknown> | null; } catch { return null; } });
  const album = isPreview && isAdmin && draftAlbum ? { ...draftAlbum, ...(storedPreview || {}) } : publicAlbum;
  const isLoading = isPreview ? isDraftLoading || !isAuthenticated : isPublicLoading;
  const { data: journalIssues = [] } = trpc.schoolNews.publicList.useQuery(undefined, { refetchOnWindowFocus: false });
  const [mode, setMode] = useState<AlbumMode>("spread");
  const { theme, toggleTheme } = useAqeeqStudioTheme();
  const [index, setIndex] = useState(0);
  const [faceSearchOpen, setFaceSearchOpen] = useState(false);
  const [isTvMode, setIsTvMode] = useState(false);

  useEffect(() => {
    if (!album) return;
    setMode(album.media.some((item) => item.sourceType === "x" || item.sourceType === "instagram" || item.sourceType === "youtube") ? "scroll" : album.readingMode === "gallery" || album.readingMode === "scroll" ? album.readingMode : "spread");
    setIndex(0);
  }, [album?.id, album?.readingMode]);

  useEffect(() => {
    if (!album?.id || isPreview) return;
    void recordView.mutateAsync({ id: album.id, viewerKey: getAqeeqViewerKey() }).catch(() => undefined);
  }, [album?.id, isPreview]);

  // Interactive Zoom and Pan System (Pinch to zoom on mobile, double click on desktop)
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const isPanning = useRef<boolean>(false);
  const panStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialPan = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastTouchDistance = useRef<number | null>(null);
  const lastTapTime = useRef<number>(0);

  // Mouse Drag and Touch Swipe navigation
  const dragStartX = useRef<number | null>(null);
  const dragStartY = useRef<number | null>(null);
  const isDragging = useRef<boolean>(false);

  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleDoubleClick = (e?: React.MouseEvent) => {
    if (zoom > 1.05) {
      resetZoom();
    } else {
      setZoom(2.2);
      setPan({ x: 0, y: 0 });
    }
  };

  const adjustZoom = (delta: number) => {
    setZoom((prev) => {
      const nextZoom = Math.min(3.5, Math.max(1, Number((prev + delta).toFixed(2))));
      if (nextZoom <= 1.05) setPan({ x: 0, y: 0 });
      return nextZoom;
    });
  };

  // Keyboard navigation for album photos (ArrowRight = Next/Forward, ArrowLeft = Previous/Back)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (mode === "spread") {
        if (e.key === "ArrowRight") {
          const items = album?.media || [];
          setIndex((prev) => Math.min(items.length - 1, prev + 1));
          resetZoom();
        } else if (e.key === "ArrowLeft") {
          setIndex((prev) => Math.max(0, prev - 1));
          resetZoom();
        } else if (e.key === "Escape") {
          resetZoom();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [mode, album?.media]);

  // Touch handlers for mobile Pinch to zoom and Swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastTouchDistance.current = dist;
    } else if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTapTime.current < 300) {
        handleDoubleClick();
        lastTapTime.current = 0;
        return;
      }
      lastTapTime.current = now;

      if (zoom > 1.05) {
        isPanning.current = true;
        panStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        initialPan.current = { ...pan };
      } else {
        dragStartX.current = e.touches[0].clientX;
        dragStartY.current = e.touches[0].clientY;
        isDragging.current = true;
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDistance.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / lastTouchDistance.current;
      setZoom((prev) => Math.min(3.5, Math.max(1, prev * factor)));
      lastTouchDistance.current = dist;
    } else if (e.touches.length === 1 && isPanning.current && zoom > 1.05) {
      const dx = e.touches[0].clientX - panStart.current.x;
      const dy = e.touches[0].clientY - panStart.current.y;
      setPan({
        x: initialPan.current.x + dx,
        y: initialPan.current.y + dy,
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      lastTouchDistance.current = null;
    }
    if (e.touches.length === 0) {
      if (isPanning.current) {
        isPanning.current = false;
      }
      if (isDragging.current && dragStartX.current !== null && dragStartY.current !== null && zoom <= 1.05) {
        const deltaX = (e.changedTouches[0]?.clientX || 0) - dragStartX.current;
        const deltaY = (e.changedTouches[0]?.clientY || 0) - dragStartY.current;
        if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY) * 1.1) {
          if (deltaX < 0) {
            moveThroughAlbum("next");
            resetZoom();
          } else {
            moveThroughAlbum("previous");
            resetZoom();
          }
        }
      }
      isDragging.current = false;
      dragStartX.current = null;
      dragStartY.current = null;
    }
  };

  // Pointer handlers for desktop mouse drag & pan
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (zoom > 1.05) {
      isPanning.current = true;
      panStart.current = { x: e.clientX, y: e.clientY };
      initialPan.current = { ...pan };
      return;
    }
    dragStartX.current = e.clientX;
    dragStartY.current = e.clientY;
    isDragging.current = true;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPanning.current && zoom > 1.05) {
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setPan({
        x: initialPan.current.x + dx,
        y: initialPan.current.y + dy,
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isPanning.current) {
      isPanning.current = false;
      return;
    }
    if (!isDragging.current || dragStartX.current === null || dragStartY.current === null) return;
    const deltaX = e.clientX - dragStartX.current;
    const deltaY = e.clientY - dragStartY.current;
    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY) * 1.1 && zoom <= 1.05) {
      if (deltaX < 0) {
        moveThroughAlbum("next");
        resetZoom();
      } else {
        moveThroughAlbum("previous");
        resetZoom();
      }
    }
    isDragging.current = false;
    dragStartX.current = null;
    dragStartY.current = null;
  };

  const handlePointerCancel = () => {
    isPanning.current = false;
    isDragging.current = false;
    dragStartX.current = null;
    dragStartY.current = null;
  };

  // Keep thumbnail strip synchronized with current image position
  useEffect(() => {
    if (mode === "spread") {
      const activeThumb = document.getElementById(`aq-album-thumb-${index}`);
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [index, mode]);

  const brandLogo = album?.headerLogoUrl || journalIssues[0]?.headerLogoUrl || snapshot?.settings.school_logo || null;
  const watermark = album?.watermarkUrl || brandLogo;
  const active = album?.media[index] as AlbumItem | undefined;
  const next = album?.media[Math.min(index + 1, Math.max((album?.media.length || 1) - 1, 0))] as AlbumItem | undefined;
  const dark = theme === "dark";
  const watermarkStyle = useMemo(() => ({
    width: `${Math.min(90, Math.max(20, album?.watermarkScale || 42))}%`,
    opacity: (album?.watermarkOpacity || 12) / 100,
  }), [album?.watermarkOpacity, album?.watermarkScale]);
  const spreadWatermark = getAqeeqAlbumSpreadWatermark({ url: watermark, opacity: album?.watermarkOpacity, tint: album?.watermarkTint, theme });
  const downloadPath = (mediaId?: number) => mediaId ? `/api/albums/${encodeURIComponent(album?.slug || slug)}/media/${mediaId}/download` : `/api/albums/${encodeURIComponent(album?.slug || slug)}/download.zip`;
  const download = (mediaId?: number) => {
    const external = mediaId ? (album?.media as AlbumItem[]).find((item) => item.id === mediaId) : undefined;
    if (external?.sourceType === "x" || external?.sourceType === "instagram" || external?.sourceType === "youtube") { window.open(external.externalUrl || external.mediaUrl, "_blank", "noopener,noreferrer"); return; }
    const anchor = document.createElement("a");
    anchor.href = downloadPath(mediaId);
    anchor.download = "";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };
  const shareAlbum = async () => {
    if (isPreview) return;
    const url = `${window.location.origin}/albums/${album?.slug || slug}`;
    try {
      if (navigator.share) { await navigator.share({ title: album?.title || "ألبوم العقيق", text: "شاهد ألبوم العقيق", url }); return; }
      await navigator.clipboard.writeText(url);
    } catch { /* تجاهل إلغاء المشاركة أو تعذر النسخ */ }
  };
  const moveThroughAlbum = (direction: "next" | "previous") => {
    const items = album?.media || [];
    const target = Math.max(0, Math.min(items.length - 1, index + (direction === "next" ? 1 : -1)));
    setIndex(target);
    if (mode !== "spread") requestAnimationFrame(() => document.getElementById(`aq-album-media-${target}`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
  };
  const toggleReaderFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch { /* المتصفح قد يمنع ملء الشاشة */ }
  };

  if (isLoading) return <div className="grid min-h-screen place-items-center bg-[#080b12]"><Loader2 className="animate-spin text-amber-300" /></div>;
  if (!album) return <main dir="rtl" className="grid min-h-screen place-items-center bg-[#080b12] p-6 text-center text-slate-400"><div><ImageIcon className="mx-auto text-amber-300" size={38} /><h1 className="mt-4 text-2xl font-black text-amber-50">هذا الألبوم غير متاح</h1><p className="mt-2 text-sm">قد يكون مسودة لم تُنشر بعد أو أن الرابط غير صحيح.</p></div></main>;

  const watermarkPlacement = album.watermarkPosition === "top-right" ? "right-[-10%] top-0" : album.watermarkPosition === "bottom-left" ? "bottom-[-8%] left-[-10%]" : album.watermarkPosition === "bottom-right" ? "bottom-[-8%] right-[-10%]" : "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2";

  return <main dir="rtl" className={`aq-album-reader-theme aq-album-reader-theme-${theme} min-h-screen transition-colors ${dark ? "bg-[#080b12] text-slate-100" : "bg-[#f5f1e7] text-slate-800"}`}><AlaqeeqStudioSiteHeader title="ألبوم العقيق" active="albums" logoUrl={brandLogo} />
    <div className="mx-auto max-w-[1500px] px-3 py-3 md:px-6 md:py-6">
      <header className={`flex flex-col gap-3 rounded-[1.65rem] border p-3 md:flex-row md:items-center md:justify-between md:p-4 ${dark ? "border-white/[.1] bg-[#10141f]" : "border-slate-900/10 bg-white shadow-sm"}`}>
        <div className="flex min-w-0 items-center gap-3">
          <div className="min-w-0"><VisualEditable id="album-reader-kicker" tag="text" label="شارة قارئ الألبوم" defaultText={`${isPreview ? "معاينة قبل النشر · " : ""}ألبوم العقيق · ${album.albumDate}`} as="div" className="text-[10px] font-black tracking-[.1em] text-amber-300" /><VisualEditable id="album-reader-title" tag="text" label="عنوان الألبوم في القارئ" defaultText={album.title} as="h1" className="truncate text-lg font-black md:text-2xl" /></div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 justify-end w-full md:w-auto">
          {mode === "spread" ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => adjustZoom(0.3)}
                aria-label="تكبير الصورة"
                title="تكبير الصورة (+)"
                className={`grid h-9 w-9 place-items-center rounded-xl border transition hover:border-amber-300 hover:text-amber-200 active:scale-95 ${
                  dark ? "border-white/10 text-slate-300" : "border-slate-900/10 text-slate-600"
                }`}
              >
                <ZoomIn size={16} />
              </button>
              <button
                type="button"
                onClick={() => adjustZoom(-0.3)}
                aria-label="تصغير الصورة"
                title="تصغير الصورة (-)"
                className={`grid h-9 w-9 place-items-center rounded-xl border transition hover:border-amber-300 hover:text-amber-200 active:scale-95 ${
                  dark ? "border-white/10 text-slate-300" : "border-slate-900/10 text-slate-600"
                }`}
              >
                <ZoomOut size={16} />
              </button>
            </div>
          ) : null}
          <AqeeqReaderAudioController
            audioUrl={album.backgroundAudioUrl || getAqeeqDefaultBackgroundAudio()}
            trackTitle={album.title}
            dark={dark}
          />
          <button
            type="button"
            onClick={() => setFaceSearchOpen(true)}
            className={`grid h-9 w-9 place-items-center rounded-xl border transition active:scale-95 touch-manipulation ${
              dark
                ? "border-amber-400/40 bg-amber-400/15 text-amber-300 hover:bg-amber-400/25 ring-1 ring-amber-400/20"
                : "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 shadow-sm"
            }`}
            title="البحث عن صوري بالذكاء الاصطناعي"
            aria-label="البحث عن صوري بالذكاء الاصطناعي"
          >
            <ScanFace size={18} className="text-amber-400" />
          </button>
          
          <button
            onClick={() => setIsTvMode(true)}
            className={`grid h-9 w-9 place-items-center rounded-xl border transition active:scale-95 touch-manipulation ${
              dark
                ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-300 hover:bg-emerald-400/25 ring-1 ring-emerald-400/20"
                : "border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 shadow-sm"
            }`}
            title="تشغيل كشاشة عرض سينمائية 📺"
            aria-label="تشغيل كشاشة عرض"
          >
            <MonitorPlay size={18} className="text-emerald-400" />
          </button>
          <VisualEditable id="album-reader-theme-action" tag="button" label="زر مظهر قارئ الألبوم" defaultText={dark ? "وايت مود" : "دارك مود"} as="button" onAction={toggleTheme} className={`grid h-9 w-9 place-items-center rounded-xl border ${dark ? "border-white/10 text-amber-200" : "border-slate-900/10 text-slate-600"}`}><VisualIcon id="album-reader-theme-icon" label="أيقونة مظهر قارئ الألبوم" icon={dark ? "sun" : "moon"} size={16} /></VisualEditable>
          <VisualEditable id="album-reader-archive-action" tag="button" label="زر كل الألبومات" defaultText="كل الألبومات" as="button" onAction={() => navigate("/albums")} className={`grid h-9 w-9 place-items-center rounded-xl border ${dark ? "border-white/10 text-amber-200" : "border-slate-900/10 text-slate-600"}`}><VisualIcon id="album-reader-archive-icon" label="أيقونة أرشيف الألبومات" icon="archive" size={16} /></VisualEditable>
          {isAdmin ? <VisualEditable id="album-reader-manage-action" tag="button" label="زر إدارة الألبوم" defaultText="إدارة الألبوم" as="button" onAction={() => navigate(`/albums/manage?album=${album.slug}`)} className={`grid h-9 w-9 place-items-center rounded-xl border ${dark ? "border-white/10 text-amber-200" : "border-slate-900/10 text-slate-600"}`}><VisualIcon id="album-reader-manage-icon" label="أيقونة إدارة الألبوم" icon="settings" size={16} /></VisualEditable> : null}
        </div>
      </header>
      <div className="mt-3 flex justify-end"><nav className={`inline-flex rounded-xl border p-1 ${dark ? "border-white/10 bg-[#10141f]" : "border-slate-900/10 bg-white"}`}>{([ ["spread", "الألبوم"], ["scroll", "قراءة طولية"], ["gallery", "كل الصور"] ] as const).map(([id, label]) => <VisualEditable key={id} id={`album-reader-mode-${id}`} tag="button" label={`زر وضع قراءة ${label}`} defaultText={label} as="button" onAction={() => setMode(id)} className={`rounded-lg px-3 py-2 text-[11px] font-black transition ${mode === id ? "bg-amber-300 text-slate-950" : dark ? "text-slate-400" : "text-slate-500"}`} />)}</nav></div>
      {album.description ? <VisualEditable id="album-reader-description" tag="text" label="وصف الألبوم في القارئ" defaultText={album.description} as="p" className={`mx-auto mt-4 max-w-4xl text-center text-sm leading-7 ${dark ? "text-slate-400" : "text-slate-600"}`} /> : null}
      <section className={`relative mt-5 overflow-hidden rounded-[1.9rem] border ${dark ? "border-amber-300/20 bg-[#0d111b]" : "border-amber-700/15 bg-white"}`}>
        {watermark ? <VisualImage id="album-reader-watermark" label="العلامة المائية للألبوم" src={watermark} alt="" className={`pointer-events-none absolute z-0 ${watermarkPlacement} ${dark ? "brightness-0 invert" : ""}`} style={watermarkStyle} /> : null}

        {mode === "gallery" ? (
          <div className="relative z-10 space-y-4 p-4 md:p-6">
            {/* Gallery Stats & Action Bar */}
            <div className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-3.5 ${dark ? "border-white/10 bg-[#111522]/90" : "border-slate-900/10 bg-white/90 shadow-sm"}`}>
              <div className="flex items-center gap-2">
                <LayoutGrid size={18} className="text-amber-400" />
                <span className={`text-xs font-black ${dark ? "text-amber-100" : "text-slate-900"}`}>معرض كل صور الألبوم</span>
                <span className="rounded-lg border border-amber-300/30 bg-amber-300/10 px-2 py-0.5 text-[11px] font-bold text-amber-300">{album.media.length} عنصر</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setIndex(0); setMode("spread"); }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300/40 bg-amber-300/[.08] px-3 py-1.5 text-xs font-black text-amber-200 transition hover:bg-amber-300 hover:text-black active:scale-95"
                >
                  <BookOpen size={14} />
                  <span>فتح في الألبوم المجسم</span>
                </button>
                <button
                  type="button"
                  onClick={() => download()}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-black transition active:scale-95 ${
                    dark ? "border-white/10 text-slate-300 hover:border-amber-300 hover:text-amber-200" : "border-slate-900/10 text-slate-700 hover:bg-amber-50"
                  }`}
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">تحميل الكل</span>
                </button>
              </div>
            </div>

            {/* Luxury Masonry Flow Grid (True Dimensions / Natural Aspect Ratio) */}
            <div className="columns-1 gap-3.5 sm:columns-2 md:columns-3 lg:columns-4 [column-fill:_balance]">
              {(album.media as AlbumItem[]).map((item, mediaIndex) => (
                <div
                  id={`aq-album-media-${mediaIndex}`}
                  key={item.id}
                  className={`break-inside-avoid group relative mb-3.5 w-full overflow-hidden rounded-2xl border text-right transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                    index === mediaIndex
                      ? "border-amber-300 ring-2 ring-amber-300/50 shadow-amber-300/20 shadow-lg"
                      : dark
                        ? "border-white/10 bg-[#0e121d] hover:border-amber-300/40"
                        : "border-slate-900/10 bg-white hover:border-amber-500/40 shadow-sm"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIndex(mediaIndex);
                      setMode(item.mediaType === "video" ? "scroll" : "spread");
                      resetZoom();
                    }}
                    className="block w-full text-right"
                  >
                    {item.mediaType === "video" ? (
                      <div className="relative aspect-video w-full overflow-hidden bg-black">
                        <VisualImage
                          id={`album-gallery-poster-${item.id}`}
                          label="صورة معاينة فيديو الألبوم"
                          src={getAqeeqAlbumImageSource(item)}
                          alt=""
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                        <span className="absolute inset-0 grid place-items-center bg-black/30 backdrop-blur-[1px] transition group-hover:bg-black/15">
                          <span className="grid h-12 w-12 place-items-center rounded-full border border-white/30 bg-black/60 text-white shadow-xl backdrop-blur-md transition group-hover:scale-110 group-hover:bg-amber-300 group-hover:text-black">
                            <Video size={20} />
                          </span>
                        </span>
                      </div>
                    ) : (
                      <div className="relative w-full overflow-hidden bg-black/[.02] dark:bg-black/30">
                        <VisualImage
                          id={`album-gallery-image-${item.id}`}
                          label="صورة معرض الألبوم"
                          src={getAqeeqAlbumImageSource(item)}
                          alt={item.caption || item.fileName}
                          className="block h-auto w-full object-contain transition duration-500 group-hover:scale-[1.02]"
                        />
                      </div>
                    )}
                    {/* Index Badge */}
                    <span className="absolute right-2.5 top-2.5 z-10 rounded-lg border border-black/40 bg-black/65 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-200 backdrop-blur-sm shadow-md">
                      #{String(mediaIndex + 1).padStart(2, "0")}
                    </span>
                    {/* Caption Overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent p-3 pt-8 text-[11px] font-bold text-white opacity-90 transition duration-300 group-hover:opacity-100 group-hover:from-black/95">
                      <div className="truncate drop-shadow-sm">{item.caption || item.fileName}</div>
                      <div className="mt-0.5 text-[9px] text-amber-300/90 font-medium">انقر للعرض في الألبوم</div>
                    </div>
                  </button>
                  {/* Direct Download Button */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); download(item.id); }}
                    className="absolute left-2.5 top-2.5 z-20 grid h-8 w-8 place-items-center rounded-xl border border-white/20 bg-black/60 text-white shadow-lg backdrop-blur-md transition hover:scale-110 hover:border-amber-300 hover:bg-amber-300 hover:text-black active:scale-95"
                    title="تحميل هذه الصورة"
                    aria-label="تحميل الصورة"
                  >
                    <Download size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {mode === "scroll" ? (
          <div className="relative z-10 mx-auto max-w-4xl space-y-5 p-4 md:p-8">
            {(album.media as AlbumItem[]).map((item, mediaIndex) => (
              <figure id={`aq-album-media-${mediaIndex}`} key={item.id} className={`relative overflow-hidden rounded-[1.8rem] border ${dark ? "border-indigo-500/30 bg-[#090b14]/80" : "border-slate-900/10 bg-white"}`}>
                <button type="button" onClick={() => download(item.id)} className="absolute left-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-xl border border-white/25 bg-black/55 text-white shadow-lg transition hover:border-amber-300 hover:bg-amber-300 hover:text-slate-950" title="تحميل الصورة" aria-label="تحميل الصورة"><Download size={16} /></button>
                <div className={item.mediaType === "video" ? "relative w-full h-[320px] sm:h-[440px] bg-black overflow-hidden" : "max-h-[88vh] bg-black"}>
                  <AlbumMedia item={item} />
                </div>
                {item.caption ? <figcaption className={`px-4 py-3 text-xs ${dark ? "text-slate-300" : "text-slate-600"}`}>{item.caption}</figcaption> : null}
              </figure>
            ))}
          </div>
        ) : null}

        {mode === "spread" ? (
          <div
            className="relative z-10 p-2 sm:p-4 space-y-4 touch-pan-y select-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onPointerLeave={handlePointerCancel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {active?.mediaType === "video" ? (
              <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-indigo-500/40 bg-gradient-to-b from-[#100d28] via-[#090b14] to-[#04060c] p-4 sm:p-6 shadow-[0_16px_45px_rgba(99,102,241,0.25)]">
                <div className="relative w-full h-[320px] sm:h-[480px] rounded-2xl overflow-hidden bg-black border border-indigo-500/30">
                  <AqeeqUnifiedVideoFrame
                    sourceUrl={active.mediaUrl}
                    posterUrl={getAqeeqAlbumImageSource(active)}
                    title={active.caption || active.fileName}
                  />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <h3 className="text-lg font-black text-white">{active.caption || active.fileName}</h3>
                  <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-black text-indigo-300 border border-indigo-500/30">
                    🎬 تغطية مرئية 4K
                  </span>
                </div>
              </div>
            ) : (
              <div className={`aq-album-3d-book-stage aq-reader-gold-frame overflow-hidden rounded-[1.8rem] border shadow-2xl transition-colors ${
                zoom > 1.05 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"
              } ${
                dark ? "border-amber-300/30 bg-[#070a11]/90" : "border-amber-700/20 bg-white/90 shadow-slate-300/50"
              }`}>
                <div className="aq-stacked-reader relative mx-auto py-1 sm:py-3 select-none">
                  {/* Previous 3D shadow stack (Left side) */}
                  <div className="aq-stacked-reader-zone aq-stacked-reader-zone-previous" aria-hidden="true">
                    {(album.media as AlbumItem[]).slice(Math.max(0, index - 1), index).reverse().map((item, pIndex) => (
                      <article key={item.id} className="aq-stacked-reader-shadow" style={{ "--aq-stack-order": String(pIndex + 1) } as React.CSSProperties}>
                        <img
                          src={getAqeeqAlbumImageSource(item)}
                          alt=""
                          referrerPolicy="no-referrer"
                          draggable={false}
                          className="rounded-xl object-contain"
                        />
                      </article>
                    ))}
                  </div>

                  {/* Active front 3D page with Pinch / Double-click Zoom */}
                  {active ? (
                    <article
                      key={active.id}
                      className="aq-stacked-reader-front relative select-none"
                      onDoubleClick={handleDoubleClick}
                      style={{
                        transform: zoom > 1.05 ? `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)` : undefined,
                        transition: isPanning.current ? "none" : "transform 0.2s cubic-bezier(0.2, 0, 0, 1)",
                        zIndex: zoom > 1.05 ? 60 : undefined,
                      }}
                    >
                      <img
                        src={getAqeeqAlbumImageSource(active)}
                        alt={active.caption || active.fileName}
                        referrerPolicy="no-referrer"
                        draggable={false}
                        className="rounded-xl object-contain shadow-2xl pointer-events-none"
                      />
                      {/* Download button on photo */}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); download(active.id); }}
                        className="absolute left-3 top-3 sm:left-4 sm:top-4 z-20 grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl border border-white/25 bg-black/60 text-white shadow-xl backdrop-blur-md transition hover:border-amber-300 hover:bg-amber-300 hover:text-black active:scale-95"
                        title="تحميل هذه الصورة"
                        aria-label="تحميل الصورة"
                      >
                        <Download size={17} />
                      </button>
                      {/* Floating Zoom Indicator & Reset Button */}
                      {zoom > 1.05 ? (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); resetZoom(); }}
                          className="absolute right-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-xl border border-amber-300/40 bg-black/75 px-2.5 py-1.5 text-xs font-black text-amber-200 shadow-xl backdrop-blur-md transition hover:bg-amber-300 hover:text-black"
                          title="إعادة الحجم الطبيعي 1x"
                        >
                          <RotateCcw size={13} />
                          <span>{Math.round(zoom * 100)}%</span>
                        </button>
                      ) : (
                        <div className={`aq-stacked-reader-number font-mono font-bold ${dark ? "text-amber-200" : "text-amber-900/80"}`}>
                          {String(index + 1).padStart(2, "0")}
                        </div>
                      )}
                    </article>
                  ) : null}

                  {/* Next 3D shadow stack (Right side) */}
                  <div className="aq-stacked-reader-zone aq-stacked-reader-zone-next" aria-hidden="true">
                    {(album.media as AlbumItem[]).slice(index + 1, index + 2).map((item, nIndex) => (
                      <article key={item.id} className="aq-stacked-reader-shadow" style={{ "--aq-stack-order": String(nIndex + 1) } as React.CSSProperties}>
                        <img
                          src={getAqeeqAlbumImageSource(item)}
                          alt=""
                          referrerPolicy="no-referrer"
                          draggable={false}
                          className="rounded-xl object-contain"
                        />
                      </article>
                    ))}
                  </div>

                  {/* 3D Round Flip Buttons (Right = Next, Left = Previous) */}
                  <button
                    type="button"
                    onClick={() => { moveThroughAlbum("previous"); resetZoom(); }}
                    disabled={index === 0}
                    className="aq-reference-flip-previous absolute left-2 z-30 grid h-11 w-11 sm:h-12 sm:w-12 place-items-center rounded-full border border-amber-300/35 bg-[#0a0d14]/90 text-amber-100 shadow-xl transition hover:scale-110 hover:bg-amber-300 hover:text-slate-950 disabled:opacity-0 md:left-4"
                    aria-label="الصورة السابقة"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    type="button"
                    onClick={() => { moveThroughAlbum("next"); resetZoom(); }}
                    disabled={index >= album.media.length - 1}
                    className="aq-reference-flip-next absolute right-2 z-30 grid h-11 w-11 sm:h-12 sm:w-12 place-items-center rounded-full border border-amber-300/35 bg-[#0a0d14]/90 text-amber-100 shadow-xl transition hover:scale-110 hover:bg-amber-300 hover:text-slate-950 disabled:opacity-0 md:right-4"
                    aria-label="الصورة التالية"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
              </div>
            )}

            {/* Magazine-style Footer Bar with centered Flip Controls and Page Counter */}
            <div className={`aq-dark-reader-footer relative mx-auto mt-3 flex max-w-5xl flex-col gap-4 rounded-2xl border p-3 md:flex-row md:items-center md:justify-between transition-colors ${
              dark ? "border-white/10 bg-[#0d1019]/95" : "border-slate-900/10 bg-white/95 shadow-sm"
            }`}>
              <div className="min-w-0 text-center md:text-right">
                <div className={`truncate text-xs font-bold ${dark ? "text-slate-100" : "text-slate-800"}`}>
                  {active?.caption || active?.fileName || album.title}
                </div>
                <div className={`mt-0.5 text-[10px] ${dark ? "text-slate-400" : "text-slate-500"}`}>
                  اسحب الصورة للتقليب أو استخدم الأسهم
                </div>
              </div>
              <div dir="ltr" className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => moveThroughAlbum("previous")}
                  disabled={index === 0}
                  aria-label="الصورة السابقة"
                  className={`grid h-9 w-9 place-items-center rounded-xl border transition hover:border-amber-300/50 hover:text-amber-200 disabled:opacity-25 active:scale-95 ${
                    dark ? "border-white/10 text-slate-300" : "border-slate-900/10 text-slate-700 hover:bg-amber-50"
                  }`}
                >
                  <ChevronLeft size={19} />
                </button>
                <span className={`min-w-24 text-center text-xs font-black font-mono ${dark ? "text-amber-200" : "text-amber-700"}`}>
                  {String(index + 1).padStart(2, "0")} <span className="text-slate-500">/</span> {String(album.media.length).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  onClick={() => moveThroughAlbum("next")}
                  disabled={index >= album.media.length - 1}
                  aria-label="الصورة التالية"
                  className={`grid h-9 w-9 place-items-center rounded-xl border transition hover:border-amber-300/50 hover:text-amber-200 disabled:opacity-25 active:scale-95 ${
                    dark ? "border-white/10 text-slate-300" : "border-slate-900/10 text-slate-700 hover:bg-amber-50"
                  }`}
                >
                  <ChevronRight size={19} />
                </button>
              </div>
              <div className={`hidden text-left text-[10px] font-bold md:block ${dark ? "text-slate-500" : "text-slate-400"}`}>
                ألبوم العقيق
              </div>
            </div>

            {/* Seamless Thumbnails Ribbon with LTR Movement Synchronization */}
            {album.media.length > 1 ? (
              <div
                dir="ltr"
                className={`mx-auto flex max-w-5xl gap-2 overflow-x-auto rounded-2xl border p-2.5 scrollbar-none ${
                  dark ? "border-white/10 bg-black/30" : "border-slate-900/10 bg-white/70 shadow-sm"
                }`}
              >
                {(album.media as AlbumItem[]).map((item, mediaIndex) => (
                  <button
                    id={`aq-album-thumb-${mediaIndex}`}
                    key={item.id}
                    type="button"
                    onClick={() => setIndex(mediaIndex)}
                    className={`relative h-14 w-20 sm:h-16 sm:w-24 shrink-0 overflow-hidden rounded-xl border-2 transition active:scale-95 ${
                      index === mediaIndex
                        ? "border-amber-300 ring-2 ring-amber-300/40 scale-105 z-10"
                        : dark ? "border-transparent opacity-60 hover:opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                    title={item.caption || item.fileName}
                  >
                    {item.mediaType === "video" ? (
                      <>
                        <img src={getAqeeqAlbumImageSource(item)} alt="" className="h-full w-full object-cover" />
                        <span className="absolute inset-0 grid place-items-center bg-black/30">
                          <Video size={15} className="text-white" />
                        </span>
                      </>
                    ) : (
                      <img src={getAqeeqAlbumImageSource(item)} alt={item.caption || item.fileName} className="h-full w-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      {/* Side Tool Rail */}
      <aside className="aq-dark-reader-rail" aria-label="أدوات ألبوم العقيق">
        <VisualEditable id="album-rail-archive-action" tag="button" label="أيقونة كل الألبومات الجانبية" defaultText="كل الألبومات" as="button" onAction={() => navigate("/albums")} className="aq-dark-reader-rail-button"><VisualIcon id="album-rail-archive-icon" label="أيقونة أرشيف الألبوم الجانبية" icon="archive" size={17} /></VisualEditable>
        <VisualEditable id="album-rail-previous-action" tag="button" label="أيقونة السابق الجانبية" defaultText="السابق" as="button" onAction={() => moveThroughAlbum("previous")} className="aq-dark-reader-rail-button" ><VisualIcon id="album-rail-previous-icon" label="أيقونة السابق في الألبوم" icon="previous" size={18} /></VisualEditable>
        <VisualEditable id="album-rail-next-action" tag="button" label="أيقونة التالي الجانبية" defaultText="التالي" as="button" onAction={() => moveThroughAlbum("next")} className="aq-dark-reader-rail-button"><VisualIcon id="album-rail-next-icon" label="أيقونة التالي في الألبوم" icon="next" size={18} /></VisualEditable>
        {!isPreview ? <VisualEditable id="album-rail-share-action" tag="button" label="أيقونة مشاركة الألبوم" defaultText="مشاركة الألبوم" as="button" onAction={() => void shareAlbum()} className="aq-dark-reader-rail-button"><VisualIcon id="album-rail-share-icon" label="أيقونة مشاركة الألبوم الجانبية" icon="share" size={16} /></VisualEditable> : null}
        <VisualEditable id="album-rail-download-action" tag="button" label="أيقونة تحميل صور الألبوم" defaultText="تحميل كل الصور" as="button" onAction={() => download()} className="aq-dark-reader-rail-button"><VisualIcon id="album-rail-download-icon" label="أيقونة تحميل الألبوم الجانبية" icon="download" size={16} /></VisualEditable>
        <VisualEditable id="album-rail-print-action" tag="button" label="أيقونة طباعة الألبوم" defaultText="طباعة الألبوم" as="button" onAction={() => window.print()} className="aq-dark-reader-rail-button"><VisualIcon id="album-rail-print-icon" label="أيقونة طباعة الألبوم الجانبية" icon="print" size={16} /></VisualEditable>
        <VisualEditable id="album-rail-theme-action" tag="button" label="أيقونة مظهر الألبوم الجانبية" defaultText={dark ? "وايت مود" : "دارك مود"} as="button" onAction={toggleTheme} className="aq-dark-reader-rail-button"><VisualIcon id="album-rail-theme-icon" label="أيقونة مظهر الألبوم الجانبية" icon={dark ? "sun" : "moon"} size={16} /></VisualEditable>
        <VisualEditable id="album-rail-fullscreen-action" tag="button" label="أيقونة ملء الشاشة للألبوم" defaultText="ملء الشاشة" as="button" onAction={() => void toggleReaderFullscreen()} className="aq-dark-reader-rail-button"><VisualIcon id="album-rail-fullscreen-icon" label="أيقونة ملء الشاشة الجانبية" icon="fullscreen" size={16} /></VisualEditable>
      </aside>

      {album ? (
        <AqeeqFaceSearchModal
          open={faceSearchOpen}
          onOpenChange={setFaceSearchOpen}
          albumTitle={album.title}
          photos={album.media.map((m) => ({
            id: m.id,
            imageUrl: getAqeeqAlbumImageSource(m),
            caption: m.caption,
            fileName: m.fileName,
          }))}
          dark={dark}
        />
      ) : null}

      {isTvMode && album && (
        <AqeeqAlbumTvMode 
          albumTitle={album.title}
          images={(album.media || []).filter((m: any) => m.mediaType === "image").map((m: any) => ({
            id: m.id,
            url: getAqeeqAlbumImageSource(m),
            caption: m.caption
          }))}
          onClose={() => setIsTvMode(false)}
        />
      )}
    </div>
  </main>;
}
