import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { FileUp, Link2, Loader2, Sparkles } from "lucide-react";
import { ChangeEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

type ImportedPage = { imageUrl: string; imageStorageKey?: string; caption: string };
type Props = { issueId: number; onImported: (pages: ImportedPage[]) => void };

const readAsDataUrl = (file: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export default function JournalPdfImporter({ onImported }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [percent, setPercent] = useState(0);
  const [showDriveInput, setShowDriveInput] = useState(false);
  const [driveUrl, setDriveUrl] = useState("");

  const upload = trpc.visualEditor.media.upload.useMutation();
  const fetchDrivePdf = trpc.schoolNews.fetchDrivePdf.useMutation();

  const processPdfData = async (data: Uint8Array, fileNameBase: string) => {
    try {
      setPercent(5);
      setStatus("جارٍ تحليل صفحات الـ PDF…");
      const pdfDocument = await getDocument({ data }).promise;

      if (pdfDocument.numPages > 60) {
        throw new Error("الحد الأقصى للعدد المستورد هو 60 صفحة");
      }

      const pages: ImportedPage[] = [];
      for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
        setStatus(`تحويل ورفع صفحة ${pageNumber} من ${pdfDocument.numPages}`);
        setPercent(Math.round(((pageNumber - 1) / pdfDocument.numPages) * 90) + 8);

        const page = await pdfDocument.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(viewport.width);
        canvas.height = Math.round(viewport.height);

        const context = canvas.getContext("2d");
        if (!context) throw new Error("تعذر تجهيز صفحة PDF");
        await page.render({ canvas, canvasContext: context, viewport }).promise;

        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
        if (!blob) throw new Error("تعذر تحويل صفحة PDF");

        const fileName = `${fileNameBase}-p${String(pageNumber).padStart(2, "0")}.jpg`;
        const asset = await upload.mutateAsync({
          fileName,
          mimeType: "image/jpeg",
          base64: await readAsDataUrl(blob),
          altText: `صفحة ${pageNumber} من ${fileNameBase}`,
        });

        pages.push({
          imageUrl: asset.url,
          imageStorageKey: asset.storageKey || undefined,
          caption: `صفحة ${pageNumber}`,
        });
      }

      setPercent(100);
      setStatus("اكتمل التحويل والرفع بنجاح!");
      onImported(pages);
      toast.success(`تم تحويل ${pages.length} صفحة من PDF وإضافتها للمجلة بنجاح 🎉`);
      setShowDriveInput(false);
      setDriveUrl("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر استيراد ملف PDF");
    } finally {
      window.setTimeout(() => {
        setStatus(null);
        setPercent(0);
      }, 700);
    }
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("اختر ملف PDF صالحاً");
      return;
    }
    if (file.size > 30 * 1024 * 1024) {
      toast.error("الحد الأقصى لملف PDF هو 30 ميجابايت");
      return;
    }

    const arrayBuffer = await file.arrayBuffer();
    const cleanName = file.name.replace(/\.pdf$/i, "");
    await processPdfData(new Uint8Array(arrayBuffer), cleanName);
  };

  const handleDriveImport = async () => {
    if (!driveUrl.trim()) {
      toast.error("يرجى إدخال رابط Google Drive لملف الـ PDF");
      return;
    }
    try {
      setStatus("جارٍ جلب ملف PDF من Google Drive…");
      setPercent(2);
      const res = await fetchDrivePdf.mutateAsync({ driveUrl: driveUrl.trim() });
      const bytes = base64ToUint8Array(res.base64);
      await processPdfData(bytes, res.fileName.replace(/\.pdf$/i, ""));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر استيراد ملف PDF من Google Drive");
      setStatus(null);
      setPercent(0);
    }
  };

  return (
    <div className="space-y-2.5">
      <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={handleFileUpload} />

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={Boolean(status)}
          className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-[#08467d]/40 bg-[#08467d]/10 p-2.5 text-center text-xs font-bold text-[#f8ca14] transition hover:bg-[#08467d]/20 disabled:opacity-55"
        >
          {status && !showDriveInput ? <Loader2 size={16} className="animate-spin" /> : <FileUp size={16} />}
          <span>رفع PDF من جهازك</span>
        </button>

        <button
          type="button"
          onClick={() => setShowDriveInput((prev) => !prev)}
          disabled={Boolean(status)}
          className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-center text-xs font-bold transition disabled:opacity-55 ${
            showDriveInput
              ? "border-amber-400/50 bg-amber-400/15 text-amber-200"
              : "border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"
          }`}
        >
          <Link2 size={16} />
          <span>استيراد PDF من Drive</span>
        </button>
      </div>

      {showDriveInput ? (
        <div className="space-y-2 rounded-xl border border-amber-400/30 bg-[#141824] p-3 shadow-lg">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-300">
            <Sparkles size={13} />
            <span>ضع رابط ملف PDF من Google Drive (ملف أو فولدر):</span>
          </div>
          <input
            value={driveUrl}
            onChange={(e) => setDriveUrl(e.target.value)}
            placeholder="https://drive.google.com/file/d/... أو رابط الفولدر"
            dir="ltr"
            className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleDriveImport}
            disabled={!driveUrl.trim() || Boolean(status)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-black transition hover:bg-amber-400 disabled:opacity-50"
          >
            {status ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            <span>{status || "جلب وتحويل صفحات الـ PDF"}</span>
          </button>
        </div>
      ) : null}

      {status ? (
        <div className="rounded-xl border border-[#08467d]/30 bg-[#08467d]/10 p-3">
          <div className="mb-1.5 flex justify-between text-[10px] font-bold text-amber-200">
            <span>{status}</span>
            <span>{percent}%</span>
          </div>
          <Progress value={percent} className="h-2 bg-slate-800" />
        </div>
      ) : null}
    </div>
  );
}
