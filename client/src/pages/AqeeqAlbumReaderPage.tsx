import { useAuth } from "@/_core/hooks/useAuth";
import { usePublishedHomepage } from "@/contexts/PublishedHomepageContext";
import { AqeeqVideoPoster } from "@/components/AqeeqVideoPoster";
import AqeeqAlbumSocialEmbed from "@/components/AqeeqAlbumSocialEmbed";
import { AlaqeeqStudioSiteHeader } from "@/components/AlaqeeqStudioSiteHeader";
import SchoolNewsFlipbook from "@/components/SchoolNewsFlipbook";
import { VisualEditable, VisualIcon, VisualImage } from "@/components/VisualEditor";
import { getAqeeqAlbumImageSource } from "@/lib/aqeeqAlbumMedia";
import { getAqeeqAlbumSpreadWatermark } from "@/lib/aqeeqAlbumReaderTheme";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { getAqeeqViewerKey } from "@/lib/aqeeqViewTracking";
import { trpc } from "@/lib/trpc";
import { Archive, ChevronLeft, ChevronRight, Download, ImageIcon, Loader2, Maximize2, Moon, Printer, Settings2, Share2, Sun, Video, Volume2 } from "lucide-react";
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
  if (item.sourceType === "x" || item.sourceType === "instagram" || item.sourceType === "youtube") return <AqeeqAlbumSocialEmbed source={item.sourceType} url={item.externalUrl || item.mediaUrl} title={item.caption || item.fileName} />;
  if (item.mediaType === "video") {
    return <AqeeqVideoPoster sourceUrl={item.mediaUrl} posterUrl={getAqeeqAlbumImageSource(item)} title={item.caption || item.fileName} playSize="large" />;
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
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!album) return;
    setMode(album.media.some((item) => item.sourceType === "x" || item.sourceType === "instagram" || item.sourceType === "youtube") ? "scroll" : album.readingMode === "gallery" || album.readingMode === "scroll" ? album.readingMode : "spread");
    setIndex(0);
  }, [album?.id, album?.readingMode]);

  useEffect(() => {
    if (!album?.id || isPreview) return;
    void recordView.mutateAsync({ id: album.id, viewerKey: getAqeeqViewerKey() }).catch(() => undefined);
  }, [album?.id, isPreview]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !album?.backgroundAudioUrl) return;
    audio.volume = .38;
    void audio.play().then(() => setSoundEnabled(true)).catch(() => setSoundEnabled(false));
  }, [album?.id, album?.backgroundAudioUrl]);

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
  const toggleSound = async () => {
    const audio = audioRef.current;
    if (!audio || !album?.backgroundAudioUrl) return;
    if (audio.paused) { try { await audio.play(); setSoundEnabled(true); } catch { setSoundEnabled(false); } }
    else { audio.pause(); setSoundEnabled(false); }
  };
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
        <div className="flex items-center gap-2 self-end md:self-auto">
          <VisualEditable id="album-reader-theme-action" tag="button" label="زر مظهر قارئ الألبوم" defaultText={dark ? "وايت مود" : "دارك مود"} as="button" onAction={toggleTheme} className={`grid h-9 w-9 place-items-center rounded-xl border ${dark ? "border-white/10 text-amber-200" : "border-slate-900/10 text-slate-600"}`}><VisualIcon id="album-reader-theme-icon" label="أيقونة مظهر قارئ الألبوم" icon={dark ? "sun" : "moon"} size={16} /></VisualEditable>
          <VisualEditable id="album-reader-archive-action" tag="button" label="زر كل الألبومات" defaultText="كل الألبومات" as="button" onAction={() => navigate("/albums")} className={`grid h-9 w-9 place-items-center rounded-xl border ${dark ? "border-white/10 text-amber-200" : "border-slate-900/10 text-slate-600"}`}><VisualIcon id="album-reader-archive-icon" label="أيقونة أرشيف الألبومات" icon="archive" size={16} /></VisualEditable>
          {isAdmin ? <VisualEditable id="album-reader-manage-action" tag="button" label="زر إدارة الألبوم" defaultText="إدارة الألبوم" as="button" onAction={() => navigate(`/albums/manage?album=${album.slug}`)} className={`grid h-9 w-9 place-items-center rounded-xl border ${dark ? "border-white/10 text-amber-200" : "border-slate-900/10 text-slate-600"}`}><VisualIcon id="album-reader-manage-icon" label="أيقونة إدارة الألبوم" icon="settings" size={16} /></VisualEditable> : null}
          {album.backgroundAudioUrl ? <VisualEditable id="album-reader-sound-action" tag="button" label="زر موسيقى الألبوم" defaultText={soundEnabled ? "إيقاف الموسيقى" : "تشغيل الموسيقى"} as="button" onAction={() => void toggleSound()} className={`grid h-9 w-9 place-items-center rounded-xl border ${soundEnabled ? "border-amber-300/50 bg-amber-300/10 text-amber-200" : dark ? "border-white/10 text-amber-200" : "border-slate-900/10 text-slate-600"}`}><VisualIcon id="album-reader-sound-icon" label="أيقونة موسيقى الألبوم" icon="sound" size={16} /></VisualEditable> : null}
        </div>
      </header>
      <div className="mt-3 flex justify-end"><nav className={`inline-flex rounded-xl border p-1 ${dark ? "border-white/10 bg-[#10141f]" : "border-slate-900/10 bg-white"}`}>{([ ["spread", "الألبوم"], ["scroll", "قراءة طولية"], ["gallery", "كل الصور"] ] as const).map(([id, label]) => <VisualEditable key={id} id={`album-reader-mode-${id}`} tag="button" label={`زر وضع قراءة ${label}`} defaultText={label} as="button" onAction={() => setMode(id)} className={`rounded-lg px-3 py-2 text-[11px] font-black transition ${mode === id ? "bg-amber-300 text-slate-950" : dark ? "text-slate-400" : "text-slate-500"}`} />)}</nav></div>
      {album.description ? <VisualEditable id="album-reader-description" tag="text" label="وصف الألبوم في القارئ" defaultText={album.description} as="p" className={`mx-auto mt-4 max-w-4xl text-center text-sm leading-7 ${dark ? "text-slate-400" : "text-slate-600"}`} /> : null}
      {album.backgroundAudioUrl ? <audio ref={audioRef} src={album.backgroundAudioUrl} loop autoPlay preload="auto" onEnded={() => setSoundEnabled(false)} /> : null}
      <section className={`relative mt-5 overflow-hidden rounded-[1.9rem] border ${dark ? "border-amber-300/20 bg-[#0d111b]" : "border-amber-700/15 bg-white"}`}>
        {watermark ? <VisualImage id="album-reader-watermark" label="العلامة المائية للألبوم" src={watermark} alt="" className={`pointer-events-none absolute z-0 ${watermarkPlacement} ${dark ? "brightness-0 invert" : ""}`} style={watermarkStyle} /> : null}
        {mode === "gallery" ? <div className="relative z-10 grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{(album.media as AlbumItem[]).map((item, mediaIndex) => <div id={`aq-album-media-${mediaIndex}`} key={item.id} className={`group relative aspect-[4/5] overflow-hidden rounded-2xl border text-right ${index === mediaIndex ? "ring-2 ring-amber-300/35" : ""} ${dark ? "border-white/10 bg-black/20" : "border-slate-900/10 bg-slate-100"}`}><button type="button" onClick={() => { setIndex(mediaIndex); setMode(item.mediaType === "video" ? "scroll" : "spread"); }} className="block h-full w-full">{item.mediaType === "video" ? <><VisualImage id={`album-gallery-poster-${item.id}`} label="صورة معاينة فيديو الألبوم" src={getAqeeqAlbumImageSource(item)} alt="" className="h-full w-full object-cover transition group-hover:scale-105" /><span className="absolute inset-0 grid place-items-center bg-black/20"><Video className="text-white drop-shadow" /></span></> : <VisualImage id={`album-gallery-image-${item.id}`} label="صورة معرض الألبوم" src={getAqeeqAlbumImageSource(item)} alt={item.caption || item.fileName} className="h-full w-full object-cover transition group-hover:scale-105" />}<span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pb-3 pt-8 text-[10px] font-bold text-white">{item.caption || item.fileName}</span></button><button type="button" onClick={() => download(item.id)} className="absolute left-2 top-2 z-10 grid h-9 w-9 place-items-center rounded-xl border border-white/25 bg-black/55 text-white shadow-lg transition hover:border-amber-300 hover:bg-amber-300 hover:text-slate-950" title="تحميل الصورة" aria-label="تحميل الصورة"><Download size={16} /></button></div>)}</div> : null}
        {mode === "scroll" ? <div className="relative z-10 mx-auto max-w-4xl space-y-5 p-4 md:p-8">{(album.media as AlbumItem[]).map((item, mediaIndex) => <figure id={`aq-album-media-${mediaIndex}`} key={item.id} className={`relative overflow-hidden rounded-[1.2rem] border ${dark ? "border-white/10 bg-black/20" : "border-slate-900/10 bg-white"}`}><button type="button" onClick={() => download(item.id)} className="absolute left-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-xl border border-white/25 bg-black/55 text-white shadow-lg transition hover:border-amber-300 hover:bg-amber-300 hover:text-slate-950" title="تحميل الصورة" aria-label="تحميل الصورة"><Download size={16} /></button><div className={item.mediaType === "video" ? "aspect-video w-full bg-black" : "max-h-[88vh] bg-black"}><AlbumMedia item={item} /></div>{item.caption ? <figcaption className={`px-4 py-3 text-xs ${dark ? "text-slate-300" : "text-slate-600"}`}>{item.caption}</figcaption> : null}</figure>)}</div> : null}
        {mode === "spread" ? <div className="relative z-10 p-2 md:p-4">{active?.mediaType === "video" ? <div className="mx-auto max-w-5xl overflow-hidden rounded-[1.4rem] border border-amber-300/25 bg-black"><div className="aspect-video w-full"><AlbumMedia item={active} /></div><div className="flex items-center justify-between gap-3 p-3"><button onClick={() => moveThroughAlbum("previous")} disabled={index === 0} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-amber-100 disabled:opacity-30">السابق</button><span className="text-xs font-black text-amber-100">{active.caption || active.fileName}</span><button onClick={() => moveThroughAlbum("next")} disabled={index >= album.media.length - 1} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-amber-100 disabled:opacity-30">التالي</button></div></div> : <SchoolNewsFlipbook compact collectionLabel="ألبوم العقيق" archiveLabel="كل الألبومات" downloadLabel="تحميل كل الصور ZIP" onDownloadAll={() => download()} onDownloadPage={(page) => download(page.id)} title={album.title} kicker={`${isPreview ? "معاينة قبل النشر · " : ""}ألبوم العقيق · ${album.albumDate}`} pages={(album.media as AlbumItem[]).map((item) => ({ id: item.id, imageUrl: getAqeeqAlbumImageSource(item), caption: item.caption || item.fileName }))} watermark={spreadWatermark} shareUrl={isPreview ? undefined : `${window.location.origin}/albums/${album.slug}`} onArchive={() => navigate("/albums")} />}</div> : null}
        {mode === "spread" && album.media.length > 1 ? <div className={`relative z-10 mx-auto flex max-w-5xl gap-2 overflow-x-auto px-3 pb-4 pt-1 ${dark ? "bg-black/10" : "bg-slate-50/50"}`}>{(album.media as AlbumItem[]).map((item, mediaIndex) => <button key={item.id} type="button" onClick={() => setIndex(mediaIndex)} className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border transition ${index === mediaIndex ? "border-amber-300 ring-2 ring-amber-300/35" : dark ? "border-white/15 opacity-70 hover:opacity-100" : "border-slate-900/10 opacity-75 hover:opacity-100"}`} title={item.caption || item.fileName}>{item.mediaType === "video" ? <><img src={getAqeeqAlbumImageSource(item)} alt="" className="h-full w-full object-cover" /><span className="absolute inset-0 grid place-items-center bg-black/25"><Video size={15} className="text-white" /></span></> : <img src={getAqeeqAlbumImageSource(item)} alt={item.caption || item.fileName} className="h-full w-full object-cover" />}</button>)}</div> : null}
      </section>
      {mode !== "spread" || active?.mediaType === "video" ? <aside className="aq-dark-reader-rail" aria-label="أدوات ألبوم العقيق"><VisualEditable id="album-rail-archive-action" tag="button" label="أيقونة كل الألبومات الجانبية" defaultText="كل الألبومات" as="button" onAction={() => navigate("/albums")} className="aq-dark-reader-rail-button"><VisualIcon id="album-rail-archive-icon" label="أيقونة أرشيف الألبوم الجانبية" icon="archive" size={17} /></VisualEditable><VisualEditable id="album-rail-previous-action" tag="button" label="أيقونة السابق الجانبية" defaultText="السابق" as="button" onAction={() => moveThroughAlbum("previous")} className="aq-dark-reader-rail-button" ><VisualIcon id="album-rail-previous-icon" label="أيقونة السابق في الألبوم" icon="previous" size={18} /></VisualEditable><VisualEditable id="album-rail-next-action" tag="button" label="أيقونة التالي الجانبية" defaultText="التالي" as="button" onAction={() => moveThroughAlbum("next")} className="aq-dark-reader-rail-button"><VisualIcon id="album-rail-next-icon" label="أيقونة التالي في الألبوم" icon="next" size={18} /></VisualEditable>{!isPreview ? <VisualEditable id="album-rail-share-action" tag="button" label="أيقونة مشاركة الألبوم" defaultText="مشاركة الألبوم" as="button" onAction={() => void shareAlbum()} className="aq-dark-reader-rail-button"><VisualIcon id="album-rail-share-icon" label="أيقونة مشاركة الألبوم الجانبية" icon="share" size={16} /></VisualEditable> : null}<VisualEditable id="album-rail-download-action" tag="button" label="أيقونة تحميل صور الألبوم" defaultText="تحميل كل الصور" as="button" onAction={() => download()} className="aq-dark-reader-rail-button"><VisualIcon id="album-rail-download-icon" label="أيقونة تحميل الألبوم الجانبية" icon="download" size={16} /></VisualEditable><VisualEditable id="album-rail-print-action" tag="button" label="أيقونة طباعة الألبوم" defaultText="طباعة الألبوم" as="button" onAction={() => window.print()} className="aq-dark-reader-rail-button"><VisualIcon id="album-rail-print-icon" label="أيقونة طباعة الألبوم الجانبية" icon="print" size={16} /></VisualEditable><VisualEditable id="album-rail-theme-action" tag="button" label="أيقونة مظهر الألبوم الجانبية" defaultText={dark ? "وايت مود" : "دارك مود"} as="button" onAction={toggleTheme} className="aq-dark-reader-rail-button"><VisualIcon id="album-rail-theme-icon" label="أيقونة مظهر الألبوم الجانبية" icon={dark ? "sun" : "moon"} size={16} /></VisualEditable>{album.backgroundAudioUrl ? <VisualEditable id="album-rail-sound-action" tag="button" label="أيقونة موسيقى الألبوم الجانبية" defaultText={soundEnabled ? "إيقاف الموسيقى" : "تشغيل الموسيقى"} as="button" onAction={() => void toggleSound()} className="aq-dark-reader-rail-button"><VisualIcon id="album-rail-sound-icon" label="أيقونة موسيقى الألبوم الجانبية" icon="sound" size={16} /></VisualEditable> : null}<VisualEditable id="album-rail-fullscreen-action" tag="button" label="أيقونة ملء الشاشة للألبوم" defaultText="ملء الشاشة" as="button" onAction={() => void toggleReaderFullscreen()} className="aq-dark-reader-rail-button"><VisualIcon id="album-rail-fullscreen-icon" label="أيقونة ملء الشاشة الجانبية" icon="fullscreen" size={16} /></VisualEditable></aside> : null}
    </div>
  </main>;
}
