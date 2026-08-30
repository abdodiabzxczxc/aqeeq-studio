import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { FileUp, Loader2 } from "lucide-react";
import { ChangeEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
type ImportedAlbumPage = { mediaUrl: string; thumbnailUrl: string; fileName: string; mimeType: string; mediaType: "image"; caption: string };
type Props = { onImported: (pages: ImportedAlbumPage[]) => void };
const readAsDataUrl = (file: Blob) => new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });

export default function AlbumPdfImporter({ onImported }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [percent, setPercent] = useState(0);
  const upload = trpc.visualEditor.media.upload.useMutation();
  const importPdf = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; event.target.value = "";
    if (!file) return;
    if (file.type !== "application/pdf") { toast.error("اختر ملف PDF صالحًا"); return; }
    if (file.size > 20 * 1024 * 1024) { toast.error("الحد الأقصى لملف PDF هو 20 ميجابايت"); return; }
    try {
      setPercent(4); setStatus("جارٍ قراءة ملف PDF…");
      const pdfDocument = await getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      if (pdfDocument.numPages > 40) throw new Error("الحد الأقصى للملف المستورد هو 40 صفحة");
      const pages: ImportedAlbumPage[] = [];
      for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
        setStatus(`تحويل ورفع الصفحة ${pageNumber} من ${pdfDocument.numPages}`); setPercent(Math.round(((pageNumber - 1) / pdfDocument.numPages) * 92) + 6);
        const page = await pdfDocument.getPage(pageNumber); const viewport = page.getViewport({ scale: 1.45 }); const canvas = document.createElement("canvas"); canvas.width = Math.round(viewport.width); canvas.height = Math.round(viewport.height);
        const context = canvas.getContext("2d"); if (!context) throw new Error("تعذر تجهيز صفحة PDF"); await page.render({ canvas, canvasContext: context, viewport }).promise;
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88)); if (!blob) throw new Error("تعذر تحويل صفحة PDF");
        const fileName = `${file.name.replace(/\.pdf$/i, "")}-page-${String(pageNumber).padStart(2, "0")}.jpg`;
        const asset = await upload.mutateAsync({ fileName, mimeType: "image/jpeg", base64: await readAsDataUrl(blob), altText: `صفحة ${pageNumber} من ${file.name}` });
        pages.push({ mediaUrl: asset.url, thumbnailUrl: asset.url, fileName, mimeType: "image/jpeg", mediaType: "image", caption: `صفحة ${pageNumber} من ${file.name}` });
      }
      setPercent(100); setStatus("اكتمل التحويل والرفع"); onImported(pages); toast.success(`تم تحويل ${pages.length} صفحة من PDF وإضافتها للألبوم`);
    } catch (error) { toast.error(error instanceof Error ? error.message : "تعذر استيراد ملف PDF"); } finally { window.setTimeout(() => { setStatus(null); setPercent(0); }, 550); }
  };
  return <div className="space-y-2"><input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={importPdf} /><button type="button" onClick={() => inputRef.current?.click()} disabled={Boolean(status)} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-sky-300/35 bg-sky-300/[.08] px-3 py-2.5 text-xs font-black text-sky-100 transition hover:bg-sky-300/[.15] disabled:opacity-55">{status ? <Loader2 size={15} className="animate-spin" /> : <FileUp size={15} />}{status || "رفع PDF وتحويله لصور"}</button>{status ? <div className="rounded-lg border border-sky-300/15 bg-sky-300/[.04] p-2"><div className="mb-1 flex justify-between text-[9px] text-sky-100"><span>{status}</span><span>{percent}%</span></div><Progress value={percent} className="h-1.5 bg-slate-800" /></div> : null}</div>;
}
