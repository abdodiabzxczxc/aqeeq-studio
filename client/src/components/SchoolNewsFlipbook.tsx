import HTMLFlipBook from "react-pageflip";
import { Archive, BookOpen, ChevronLeft, ChevronRight, Clipboard, Download, FileText, List, Maximize2, Minimize2, Minus, Plus, Printer, RotateCcw, Share2, X, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AqeeqReaderAudioController } from "@/components/AqeeqReaderAudioController";
import { getFlipbookTarget, isFlipbookTargetAvailable } from "@/lib/journalFlipEngine";
import { downloadJournalPdf, openJournalPdfForPrint } from "@/lib/journalPdf";

export type FlipbookPage = { id: number; imageUrl: string; caption?: string | null; issueTitle?: string; issueDate?: string };
type ReadingMode = "flip" | "scroll";
type FlipbookProps = { title: string; kicker: string; pages: FlipbookPage[]; onClose?: () => void; onArchive?: () => void; shareUrl?: string; coverImageUrl?: string | null; brandLogoUrl?: string | null; watermark?: { url?: string | null; scale?: number; opacity?: number; position?: string; tint?: string; cropLeft?: boolean }; compact?: boolean; collectionLabel?: string; archiveLabel?: string; downloadLabel?: string; backgroundAudioUrl?: string | null; onDownloadAll?: () => void; onDownloadPage?: (page: FlipbookPage) => void };
export default function SchoolNewsFlipbook({ title, kicker, pages, onClose, onArchive, shareUrl, brandLogoUrl, watermark, compact = false, collectionLabel = "مجلة العقيق", archiveLabel = "كل الأعداد", downloadLabel = "تنزيل العدد PDF", backgroundAudioUrl, onDownloadAll, onDownloadPage }: FlipbookProps) {
  const [page, setPage] = useState(0);
  const [full, setFull] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [scrollZoom, setScrollZoom] = useState(1);
  const [mode, setMode] = useState<ReadingMode>("flip");
  const viewerRef = useRef<HTMLDivElement>(null);
  const current = pages[Math.min(page, Math.max(0, pages.length - 1))];
  const previousPages = pages.slice(Math.max(0, page - 1), page).reverse();
  const nextPages = pages.slice(page + 1, page + 2);
  const canGoPrevious = isFlipbookTargetAvailable(page, pages.length, "previous");
  const canGoNext = isFlipbookTargetAvailable(page, pages.length, "next");

  const flip = (direction: "next" | "previous") => {
    if (!isFlipbookTargetAvailable(page, pages.length, direction)) return;
    setPage((currentPage) => direction === "next" ? currentPage + 1 : currentPage - 1);
  };
  const choosePage = (target: number) => {
    if (target < 0 || target >= pages.length || target === page) return;
    setPage(target);
  };
  const share = async () => {
    const url = shareUrl || window.location.href;
    try {
      if (navigator.share) { await navigator.share({ title, text: `شاهد ${title} من ${collectionLabel}`, url }); return; }
      await navigator.clipboard.writeText(url);
      toast.success("تم نسخ رابط المشاركة العام");
    } catch (error) { if ((error as Error).name !== "AbortError") toast.error("تعذر نسخ رابط المشاركة"); }
  };
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await viewerRef.current?.requestFullscreen();
    } catch { setFull((value) => !value); }
  };
  const downloadCurrent = async () => {
    try { toast.message("يتم تجهيز ملف PDF للعدد كاملًا…"); await downloadJournalPdf(title, pages); toast.success("تم تنزيل العدد كاملًا بصيغة PDF"); }
    catch { toast.error("تعذر إنشاء ملف PDF للعدد"); }
  };
  const printIssue = async () => {
    try { toast.message("يتم تجهيز PDF للطباعة…"); await openJournalPdfForPrint(title, pages); }
    catch { toast.error("تعذر فتح ملف PDF للطباعة"); }
  };
  const adjustZoom = (amount: number) => {
    const updateZoom = (value: number) => Math.min(1.4, Math.max(.7, Number((value + amount).toFixed(2))));
    if (mode === "flip") setZoom((value) => Math.min(1.15, Math.max(.85, updateZoom(value))));
    else setScrollZoom(updateZoom);
  };
  const moveScrollReader = (direction: "next" | "previous") => {
    const target = direction === "next" ? page + 1 : page - 1;
    if (target < 0 || target >= pages.length) return;
    choosePage(target);
    requestAnimationFrame(() => document.getElementById(`aq-scroll-page-${target}`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
  };

  // Interactive Zoom, Pan, Drag and Touch Swipe system for book reading
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const isPanning = useRef<boolean>(false);
  const panStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialPan = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastTouchDistance = useRef<number | null>(null);
  const lastTapTime = useRef<number>(0);

  const dragStartX = useRef<number | null>(null);
  const dragStartY = useRef<number | null>(null);
  const isDragging = useRef<boolean>(false);

  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleDoubleClick = () => {
    if (zoom > 1.05) {
      resetZoom();
    } else {
      setZoom(2.2);
      setPan({ x: 0, y: 0 });
    }
  };

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
            flip("next");
            resetZoom();
          } else {
            flip("previous");
            resetZoom();
          }
        }
      }
      isDragging.current = false;
      dragStartX.current = null;
      dragStartY.current = null;
    }
  };

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
        flip("next");
        resetZoom();
      } else {
        flip("previous");
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

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (mode !== "flip") return;
      if (event.key === "ArrowLeft") flip("next");
      if (event.key === "ArrowRight") flip("previous");
      if (event.key === "Escape" && full) setFull(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, page, pages.length, full]);

  if (!pages.length) return <div className="flex min-h-[440px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-amber-300/25 bg-[#111521] p-8 text-center"><FileText size={38} className="text-amber-300" /><h2 className="mt-4 text-xl font-black text-amber-50">هذا العدد ينتظر صفحاته</h2><p className="mt-2 max-w-sm text-sm leading-7 text-slate-500">سيظهر العدد هنا ككتاب ورقي فور رفع الصفحات ونشره.</p></div>;

  const ToolButton = ({ label, children, onClick, disabled = false }: { label: string; children: React.ReactNode; onClick: () => void; disabled?: boolean }) => <button onClick={onClick} disabled={disabled} aria-label={label} className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-slate-300 transition hover:border-amber-300/50 hover:text-amber-100 disabled:opacity-25">{children}</button>;
  const RailButton = ({ label, children, onClick, disabled = false }: { label: string; children: React.ReactNode; onClick: () => void; disabled?: boolean }) => <button onClick={onClick} disabled={disabled} aria-label={label} title={label} className="aq-dark-reader-rail-button">{children}</button>;
  const shellClass = full ? "fixed inset-0 z-[500] overflow-y-auto bg-[#050609] p-3 md:p-6" : "";
  const watermarkSource = watermark?.url || brandLogoUrl;
  const watermarkStyle = { "--aq-watermark-scale": `${watermark?.scale ?? 42}%`, "--aq-watermark-opacity": `${(watermark?.opacity ?? 12) / 100}`, "--aq-watermark-tint": watermark?.tint ?? "#d6b96a" } as React.CSSProperties;

  return <div ref={viewerRef} dir="rtl" className={`${shellClass} ${mode === "flip" ? "aq-dark-reader-shell" : ""} ${compact ? "aq-album-flipbook" : ""}`}>
    <div className={full ? "mx-auto max-w-[1500px]" : ""}>
      <aside className="aq-dark-reader-rail" aria-label="أدوات قراءة العدد"><RailButton label={archiveLabel} onClick={() => onArchive?.()} disabled={!onArchive}><Archive size={17} /></RailButton><RailButton label="الصفحة السابقة" onClick={() => mode === "flip" ? flip("previous") : moveScrollReader("previous")} disabled={!canGoPrevious}><ChevronRight size={18} /></RailButton><RailButton label="الصفحة التالية" onClick={() => mode === "flip" ? flip("next") : moveScrollReader("next")} disabled={!canGoNext}><ChevronLeft size={18} /></RailButton><RailButton label="مشاركة العدد" onClick={() => void share()}><Share2 size={16} /></RailButton><RailButton label={downloadLabel} onClick={() => onDownloadAll ? onDownloadAll() : void downloadCurrent()}><Download size={16} /></RailButton><RailButton label="طباعة العدد PDF" onClick={() => void printIssue()}><Printer size={16} /></RailButton><RailButton label="تكبير القراءة" onClick={() => adjustZoom(.05)}><Plus size={18} /></RailButton><RailButton label="تصغير القراءة" onClick={() => adjustZoom(-.05)}><Minus size={18} /></RailButton><RailButton label="ملء الشاشة" onClick={() => void toggleFullscreen()}>{full ? <Minimize2 size={17} /> : <Maximize2 size={17} />}</RailButton></aside>
      <header className={`mb-4 flex flex-col gap-3 rounded-[1.65rem] border p-3 md:flex-row md:items-center md:justify-between md:p-4 border-white/[.1] bg-[#10141f] shadow-sm ${mode === "flip" ? "aq-dark-reader-chrome" : ""}`}>
        <div className="flex min-w-0 items-center gap-3">
          {brandLogoUrl ? (
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-amber-300/20 bg-black/20 p-1.5">
              <img src={brandLogoUrl} alt="شعار العقيق" className="h-full w-full object-contain" />
            </div>
          ) : null}
          <div className="min-w-0">
            <div className="truncate text-[10px] font-black tracking-[.12em] text-amber-300">{kicker}</div>
            <h1 className="mt-0.5 truncate text-lg font-black text-amber-50 md:text-2xl">{title}</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 justify-end w-full md:w-auto">
          {/* Zoom In & Zoom Out Buttons matching Album Reader */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => adjustZoom(0.3)}
              aria-label="تكبير الصفحة"
              title="تكبير الصفحة (+)"
              className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-slate-300 transition hover:border-amber-300 hover:text-amber-200 active:scale-95"
            >
              <ZoomIn size={16} />
            </button>
            <button
              type="button"
              onClick={() => adjustZoom(-0.3)}
              aria-label="تصغير الصفحة"
              title="تصغير الصفحة (-)"
              className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-slate-300 transition hover:border-amber-300 hover:text-amber-200 active:scale-95"
            >
              <ZoomOut size={16} />
            </button>
          </div>

          {/* Reading Mode Toggle (كتاب / قراءة) */}
          <div className="hidden rounded-xl border border-white/10 bg-black/20 p-1 sm:flex">
            <button
              onClick={() => setMode("flip")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-black transition ${
                mode === "flip" ? "bg-amber-300 text-slate-950" : "text-slate-400 hover:text-amber-100"
              }`}
            >
              <BookOpen size={14} />كتاب
            </button>
            <button
              onClick={() => setMode("scroll")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-black transition ${
                mode === "scroll" ? "bg-amber-300 text-slate-950" : "text-slate-400 hover:text-amber-100"
              }`}
            >
              <List size={14} />قراءة
            </button>
          </div>

          {/* Audio Controller */}
          {backgroundAudioUrl ? (
            <AqeeqReaderAudioController
              audioUrl={backgroundAudioUrl}
              trackTitle={title}
              dark={true}
            />
          ) : null}

          {/* Share Button */}
          <button
            onClick={() => void share()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300/30 bg-amber-300/[.07] px-2.5 py-2 text-amber-200 transition hover:bg-amber-300 hover:text-slate-950"
          >
            <Share2 size={16} />
            <span className="hidden text-[11px] font-black md:inline">مشاركة</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={() => void toggleFullscreen()}
            title={full ? "إلغاء ملء الشاشة" : "ملء الشاشة"}
            className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-slate-300 transition hover:border-amber-300 hover:text-amber-200 active:scale-95"
          >
            {full ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          {/* Archive Button */}
          {onArchive ? (
            <button
              onClick={onArchive}
              title="كل الأعداد"
              className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-slate-300 transition hover:border-amber-300 hover:text-amber-200 active:scale-95"
            >
              <Archive size={16} />
            </button>
          ) : null}

          {/* Close Button */}
          {onClose ? (
            <button
              onClick={onClose}
              title="إغلاق"
              className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-slate-300 transition hover:border-amber-300 hover:text-amber-200 active:scale-95"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>
      </header>

      {mode === "scroll" ? <section className="aq-reader-gold-frame overflow-auto p-3 md:p-7"><div className="mx-auto max-w-[760px] space-y-5 transition-[width] duration-200" style={{ width: `${scrollZoom * 100}%`, minWidth: scrollZoom > 1 ? "760px" : undefined }}>{pages.map((item, index) => <article id={`aq-scroll-page-${index}`} key={item.id} className="overflow-hidden rounded-2xl bg-transparent shadow-[0_18px_45px_rgba(0,0,0,.28)]"><img src={item.imageUrl} alt={item.caption || `الصفحة ${index + 1} من ${title}`} referrerPolicy="no-referrer" className="block h-auto w-full" /></article>)}</div></section> : <section className="aq-flipbook-stage aq-dark-reader-stage p-0 touch-pan-y select-none" style={watermarkStyle} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerCancel} onPointerLeave={handlePointerCancel} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        <div className="relative w-full p-1 md:p-2"><div className="aq-reader-gold-frame aq-flipbook-book-frame p-1 md:p-2">{watermarkSource ? <span aria-hidden="true" className={`aq-dark-reader-watermark aq-dark-reader-watermark-${watermark?.position || "center"} ${watermark?.cropLeft ? "aq-dark-reader-watermark-crop-left" : ""} pointer-events-none absolute`} style={{ "--aq-watermark-image": `url("${watermarkSource}")` } as React.CSSProperties} /> : null}<div className="aq-stacked-reader relative mx-auto py-0 select-none">
          <div className="aq-stacked-reader-zone aq-stacked-reader-zone-previous" aria-hidden="true">{previousPages.map((item, index) => <article key={item.id} className="aq-stacked-reader-shadow" style={{ "--aq-stack-order": String(index + 1) } as React.CSSProperties}><img src={item.imageUrl} alt="" referrerPolicy="no-referrer" draggable={false} /></article>)}</div>
          <article
            key={current.id}
            className={`aq-stacked-reader-front relative select-none ${zoom > 1.05 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"}`}
            onDoubleClick={handleDoubleClick}
            style={{
              transform: zoom > 1.05 ? `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)` : undefined,
              transition: isPanning.current ? "none" : "transform 0.2s cubic-bezier(0.2, 0, 0, 1)",
              zIndex: zoom > 1.05 ? 60 : undefined,
            }}
          >
            <img src={current.imageUrl} alt={current.caption || `الصفحة ${page + 1} من ${title}`} referrerPolicy="no-referrer" draggable={false} className="pointer-events-none" />
            {onDownloadPage ? <button type="button" onClick={(e) => { e.stopPropagation(); onDownloadPage(current); }} className="absolute left-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-xl border border-white/25 bg-black/55 text-white shadow-lg transition hover:border-amber-300 hover:bg-amber-300 hover:text-slate-950" title="تحميل الصورة الحالية" aria-label="تحميل الصورة الحالية"><Download size={16} /></button> : null}
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
              <div className="aq-stacked-reader-number">{String(page + 1).padStart(2, "0")}</div>
            )}
          </article>
          <div className="aq-stacked-reader-zone aq-stacked-reader-zone-next" aria-hidden="true">{nextPages.map((item, index) => <article key={item.id} className="aq-stacked-reader-shadow" style={{ "--aq-stack-order": String(index + 1) } as React.CSSProperties}><img src={item.imageUrl} alt="" referrerPolicy="no-referrer" draggable={false} /></article>)}</div>
          <button onClick={() => { flip("previous"); resetZoom(); }} disabled={!canGoPrevious} className="aq-reference-flip-previous absolute left-2 z-30 grid h-12 w-12 place-items-center rounded-full border border-amber-300/30 bg-[#0a0d14]/90 text-amber-100 shadow-xl transition hover:bg-amber-300 hover:text-slate-950 disabled:opacity-0 md:left-5" aria-label="الصفحة السابقة"><ChevronLeft size={24} /></button>
          <button onClick={() => { flip("next"); resetZoom(); }} disabled={!canGoNext} className="aq-reference-flip-next absolute right-2 z-30 grid h-12 w-12 place-items-center rounded-full border border-amber-300/30 bg-[#0a0d14]/90 text-amber-100 shadow-xl transition hover:bg-amber-300 hover:text-slate-950 disabled:opacity-0 md:right-5" aria-label="الصفحة التالية"><ChevronRight size={24} /></button>
        </div></div></div>
        <div className="aq-dark-reader-footer relative mx-auto mt-3 flex max-w-[1160px] flex-col gap-4 px-3 pt-3 md:flex-row md:items-center md:justify-between"><div className="min-w-0 text-center md:text-right"><div className="truncate text-xs font-bold text-slate-100">{current?.caption || "نشرة أخبار مدارس العقيق"}</div><div className="mt-1 text-[10px] text-slate-500">اسحب الحافة للتقليب أو استخدم الأسهم</div></div><div dir="ltr" className="flex items-center justify-center gap-2"><ToolButton label="الصفحة السابقة" onClick={() => flip("previous")} disabled={!canGoPrevious}><ChevronLeft size={19} /></ToolButton><span className="min-w-24 text-center text-xs font-black text-amber-200">{String(page + 1).padStart(2, "0")} <span className="text-slate-500">/</span> {String(pages.length).padStart(2, "0")}</span><ToolButton label="الصفحة التالية" onClick={() => flip("next")} disabled={!canGoNext}><ChevronRight size={19} /></ToolButton></div><div className="hidden text-left text-[10px] text-slate-500 md:block">قارئ العقيق</div></div>
        <div className="aq-dark-reader-thumbs relative mx-auto mt-3 flex max-w-[1160px] gap-2 overflow-x-auto px-3 pb-3">{pages.map((item, index) => <button key={item.id} onClick={() => choosePage(index)} className={`relative h-20 w-[58px] shrink-0 overflow-hidden rounded-md border transition ${index === page ? "border-amber-300 ring-2 ring-amber-300/20" : "border-white/10 opacity-55 hover:opacity-100"}`}><img src={item.imageUrl} alt={`صفحة ${index + 1}`} referrerPolicy="no-referrer" draggable={false} className="h-full w-full object-cover" /><span className="absolute inset-x-0 bottom-0 bg-black/70 py-1 text-[9px] font-black text-white">{index + 1}</span></button>)}</div>
      </section>}
      <div className="mt-3 flex justify-center"><button onClick={() => void share()} className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 transition hover:text-amber-200"><Clipboard size={14} />رابط عام للمجلة</button></div>
    </div>
  </div>;
}
