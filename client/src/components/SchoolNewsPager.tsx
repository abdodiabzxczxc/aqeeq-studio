import { Archive, ChevronLeft, ChevronRight, Download, Expand, Minimize2, Minus, Plus, Printer, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { JournalReadingMode, normalizeJournalReadingMode } from "@/lib/journalReading";
import { downloadJournalPdf, openJournalPdfForPrint } from "@/lib/journalPdf";

export type NewsPagerPage = { id: number; imageUrl: string; caption?: string | null; issueTitle?: string; issueDate?: string };
type ViewMode = "flip" | "scroll";
type Props = { title: string; kicker: string; pages: NewsPagerPage[]; onClose?: () => void; onArchive?: () => void; shareUrl?: string; coverImageUrl?: string | null; initialMode?: JournalReadingMode | string | null };

const initialView = (mode?: JournalReadingMode | string | null): ViewMode => {
  const value = normalizeJournalReadingMode(mode);
  return value === "scroll" ? "scroll" : "flip";
};

export default function SchoolNewsPager({ title, kicker, pages, onArchive, shareUrl, initialMode }: Props) {
  const [view, setView] = useState<ViewMode>(() => initialView(initialMode));
  const [index, setIndex] = useState(0);
  const [full, setFull] = useState(false);
  const [scrollZoom, setScrollZoom] = useState(1);
  const readerRef = useRef<HTMLDivElement>(null);
  const page = pages[index];
  const step = 1;

  useEffect(() => { setView(initialView(initialMode)); }, [initialMode]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (view === "scroll") return; if (event.key === "ArrowLeft") setIndex((value) => Math.min(pages.length - 1, value + step)); if (event.key === "ArrowRight") setIndex((value) => Math.max(0, value - step)); };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [pages.length, step, view]);

  if (!pages.length) return <div className="grid min-h-[55vh] place-items-center bg-[#0c1018] text-center"><div><div className="text-sm font-black text-amber-200">العدد ينتظر صفحاته</div><p className="mt-2 text-xs text-slate-500">سيظهر القارئ فور إضافة الصفحات ونشر العدد.</p></div></div>;

  const changePage = (next: number) => setIndex(Math.max(0, Math.min(pages.length - 1, next)));
  const moveScrollReader = (next: number) => { changePage(next); requestAnimationFrame(() => document.getElementById(`aq-pager-scroll-page-${next}`)?.scrollIntoView({ behavior: "smooth", block: "center" })); };
  const share = async () => { const url = shareUrl || window.location.href; try { if (navigator.share) { await navigator.share({ title, text: `اقرأ ${title} من مجلة العقيق`, url }); return; } await navigator.clipboard.writeText(url); toast.success("تم نسخ رابط العدد"); } catch { try { await navigator.clipboard.writeText(url); toast.success("تم نسخ رابط العدد"); } catch { toast.error("تعذر نسخ رابط العدد"); } } };
  const toggleFullscreen = async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await readerRef.current?.requestFullscreen(); } catch { setFull((value) => !value); } };
  const downloadCurrent = async () => { try { toast.message("يتم تجهيز ملف PDF للعدد كاملًا…"); await downloadJournalPdf(title, pages); toast.success("تم تنزيل العدد كاملًا بصيغة PDF"); } catch { toast.error("تعذر إنشاء ملف PDF للعدد"); } };
  const printIssue = async () => { try { toast.message("يتم تجهيز PDF للطباعة…"); await openJournalPdfForPrint(title, pages); } catch { toast.error("تعذر فتح ملف PDF للطباعة"); } };
  // Mouse Drag and Touch Swipe for reader (Mouse drag / Touch swipe left = next page, right = previous page)
  const dragStartX = useRef<number | null>(null);
  const dragStartY = useRef<number | null>(null);
  const isDragging = useRef<boolean>(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragStartX.current = e.clientX;
    dragStartY.current = e.clientY;
    isDragging.current = true;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current || dragStartX.current === null || dragStartY.current === null) return;
    const deltaX = e.clientX - dragStartX.current;
    const deltaY = e.clientY - dragStartY.current;
    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY) * 1.1) {
      if (deltaX < 0) {
        changePage(index + step);
      } else {
        changePage(index - step);
      }
    }
    isDragging.current = false;
    dragStartX.current = null;
    dragStartY.current = null;
  };

  const handlePointerCancel = () => {
    isDragging.current = false;
    dragStartX.current = null;
    dragStartY.current = null;
  };

  const RailButton = ({ label, children, onClick, disabled = false }: { label: string; children: React.ReactNode; onClick: () => void; disabled?: boolean }) => <button onClick={onClick} disabled={disabled} aria-label={label} title={label} className="aq-dark-reader-rail-button">{children}</button>;
  const viewerShell = full ? "fixed inset-0 z-[500] overflow-y-auto bg-[#090b11] p-3 md:p-7" : "";

  return <div ref={readerRef} dir="rtl" className={viewerShell}><aside className="aq-dark-reader-rail" aria-label="أدوات قراءة العدد"><RailButton label="كل الأعداد" onClick={() => onArchive?.()} disabled={!onArchive}><Archive size={17} /></RailButton><RailButton label="الصفحة السابقة" onClick={() => view === "scroll" ? moveScrollReader(index - 1) : changePage(index - 1)} disabled={!index}><ChevronRight size={18} /></RailButton><RailButton label="الصفحة التالية" onClick={() => view === "scroll" ? moveScrollReader(index + 1) : changePage(index + 1)} disabled={index >= pages.length - 1}><ChevronLeft size={18} /></RailButton><RailButton label="مشاركة العدد" onClick={() => void share()}><Share2 size={16} /></RailButton><RailButton label="تنزيل العدد PDF" onClick={() => void downloadCurrent()}><Download size={16} /></RailButton><RailButton label="طباعة العدد PDF" onClick={() => void printIssue()}><Printer size={16} /></RailButton><RailButton label="تكبير القراءة" onClick={() => setScrollZoom((value) => Math.min(1.4, Number((value + .1).toFixed(1))))}><Plus size={18} /></RailButton><RailButton label="تصغير القراءة" onClick={() => setScrollZoom((value) => Math.max(.7, Number((value - .1).toFixed(1))))}><Minus size={18} /></RailButton><RailButton label="ملء الشاشة" onClick={() => void toggleFullscreen()}>{full ? <Minimize2 size={17} /> : <Expand size={17} />}</RailButton></aside>
    <div className="mx-auto max-w-[1400px]">
      {view === "scroll" ? <section className="aq-reader-gold-frame mx-auto max-w-[1180px] overflow-auto p-3 pb-10 md:p-7"><div className="mx-auto space-y-8 transition-[width] duration-200" style={{ width: `${scrollZoom * 100}%`, minWidth: scrollZoom > 1 ? "820px" : undefined }}>{pages.map((item, itemIndex) => <article id={`aq-pager-scroll-page-${itemIndex}`} key={item.id} className="overflow-hidden rounded-sm bg-transparent shadow-[0_20px_60px_rgba(0,0,0,.35)]"><img src={item.imageUrl} alt={item.caption || `الصفحة ${itemIndex + 1}`} className="block h-auto w-full" /></article>)}</div></section> : <section className="aq-reader-gold-frame px-3 py-7 md:px-16 md:py-12 touch-pan-y select-none" onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerCancel={handlePointerCancel} onPointerLeave={handlePointerCancel}>
        <div className="relative mx-auto flex min-h-[480px] max-w-[590px] items-center justify-center gap-1 md:min-h-[680px] cursor-grab active:cursor-grabbing select-none">
          <button onClick={() => changePage(index - step)} disabled={!index} className="absolute left-0 z-10 grid h-12 w-12 place-items-center rounded-full border border-amber-300/25 bg-[#10141e]/95 text-amber-100 shadow-xl transition hover:bg-amber-300 hover:text-slate-950 disabled:opacity-20 md:-left-16" aria-label="الصفحة السابقة"><ChevronLeft size={22} /></button>
          <article className="relative w-full overflow-hidden rounded-md bg-transparent shadow-[0_28px_75px_rgba(0,0,0,.55)]"><img key={page.id} src={page.imageUrl} alt={page.caption || `صفحة ${index + 1}`} className="block h-auto w-full [animation:journal-in_.28s_cubic-bezier(.23,1,.32,1)]" /></article>
          <button onClick={() => changePage(index + step)} disabled={index >= pages.length - step} className="absolute right-0 z-10 grid h-12 w-12 place-items-center rounded-full border border-amber-300/25 bg-[#10141e]/95 text-amber-100 shadow-xl transition hover:bg-amber-300 hover:text-slate-950 disabled:opacity-20 md:-right-16" aria-label="الصفحة التالية"><ChevronRight size={22} /></button>
        </div>
        <div className="relative mx-auto mt-7 flex max-w-[950px] items-center justify-between gap-3 border-t border-white/[.08] pt-5"><div className="min-w-0"><div className="truncate text-xs font-bold text-slate-200">{page.caption || "نشرة مدارس العقيق"}</div><div className="mt-1 text-[10px] text-slate-600">اسحب الشاشة أو استخدم الأسهم للتنقل</div></div><div className="shrink-0 text-sm font-black text-amber-200">{String(index + 1).padStart(2, "0")} <span className="text-slate-600">/</span> {String(pages.length).padStart(2, "0")}</div></div>
        <div className="relative mx-auto mt-5 flex max-w-[950px] gap-2 overflow-x-auto pb-2">{pages.map((item, itemIndex) => <button key={item.id} onClick={() => changePage(itemIndex)} className={`h-20 w-14 shrink-0 overflow-hidden rounded-sm border transition ${itemIndex === index ? "border-amber-300 ring-2 ring-amber-300/20" : "border-white/[.12] opacity-55 hover:opacity-100"}`}><img src={item.imageUrl} alt={`صفحة ${itemIndex + 1}`} className="h-full w-full object-cover" /></button>)}</div>
      </section>}
    </div>
  </div>;
}
