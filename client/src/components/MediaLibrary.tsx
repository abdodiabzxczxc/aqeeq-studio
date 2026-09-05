import { trpc } from "@/lib/trpc";
import { Progress } from "@/components/ui/progress";
import { Film, ImageIcon, Link2, Loader2, Music2, Trash2, Upload, X } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { toast } from "sonner";

type MediaAsset = {
  id: number;
  url: string;
  kind: "image" | "video" | "audio" | "embed";
  mimeType: string | null;
  fileName: string;
  fileSize: number | null;
  altText: string | null;
};

export const MEDIA_LIBRARY_Z_INDEX = 400;

export default function MediaLibrary({ open, onClose, onSelect, accept = "all", workspace = false }: { open: boolean; onClose: () => void; onSelect?: (asset: MediaAsset) => void; accept?: "all" | "image" | "video" | "audio"; workspace?: boolean }) {
  const utils = trpc.useUtils();
  const { data: assets = [], isLoading } = trpc.visualEditor.media.list.useQuery(undefined, { enabled: open, refetchOnWindowFocus: false });
  const [embedUrl, setEmbedUrl] = useState("");
  const [embedTitle, setEmbedTitle] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const upload = trpc.visualEditor.media.upload.useMutation({
    onSuccess: () => { setUploadProgress(100); setUploadStatus("اكتمل الرفع"); toast.success("تمت إضافة الملف إلى مكتبة الوسائط"); void utils.visualEditor.media.list.invalidate(); window.setTimeout(() => { setUploadProgress(0); setUploadStatus(null); }, 700); },
    onError: (error) => { setUploadProgress(0); setUploadStatus(null); toast.error(error.message || "تعذر رفع الملف"); },
  });
  const addEmbed = trpc.visualEditor.media.addEmbed.useMutation({
    onSuccess: () => { toast.success("تم حفظ رابط الفيديو في المكتبة"); setEmbedUrl(""); setEmbedTitle(""); void utils.visualEditor.media.list.invalidate(); },
    onError: (error) => toast.error(error.message || "تعذر إضافة رابط الفيديو"),
  });
  const remove = trpc.visualEditor.media.delete.useMutation({
    onSuccess: () => { toast.message("تمت إزالة الملف من مكتبة الوسائط"); void utils.visualEditor.media.list.invalidate(); },
    onError: (error) => toast.error(error.message || "تعذر إزالة الملف"),
  });

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const allowed = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml", "video/mp4", "video/webm", "video/quicktime", "audio/mpeg", "audio/mp4", "audio/ogg", "audio/wav", "audio/webm"];
    if (!allowed.includes(file.type)) { toast.error("اختر صورة أو فيديو، أو ملف MP3 أو M4A أو OGG أو WAV صوتي"); return; }
    const isLargeMedia = file.type.startsWith("video/") || file.type.startsWith("audio/");
    const maxBytes = isLargeMedia ? 25 * 1024 * 1024 : 8 * 1024 * 1024;
    if (file.size > maxBytes) { toast.error(isLargeMedia ? "الحد الأقصى للفيديو أو الصوت 25 ميجابايت" : "الحد الأقصى للصورة 8 ميجابايت"); return; }
    const reader = new FileReader();
    setUploadProgress(8); setUploadStatus("جارٍ تجهيز الملف…");
    reader.onload = () => { setUploadProgress(48); setUploadStatus("جارٍ رفع الملف…"); upload.mutate({ fileName: file.name, mimeType: file.type, base64: String(reader.result), altText: file.name.replace(/\.[^.]+$/, "") }); };
    reader.onerror = () => { setUploadProgress(0); setUploadStatus(null); toast.error("تعذر قراءة الملف المحدد"); };
    reader.readAsDataURL(file);
  };

  if (!open) return null;
  const visibleAssets = (assets as MediaAsset[]).filter((asset) => accept === "all" || asset.kind === accept || (accept === "video" && asset.kind === "embed"));
  return <div data-aq-editor-panel={workspace ? "media" : undefined} className={workspace ? "fixed inset-x-3 bottom-3 z-[340] flex max-h-[78svh] flex-col overflow-hidden rounded-3xl border border-amber-400/25 bg-[#111521] shadow-2xl md:inset-y-0 md:left-0 md:right-auto md:max-h-none md:w-[min(430px,100vw)] md:rounded-none md:border-y-0 md:border-l-0 md:border-r" : "fixed inset-0 z-[400] flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center"} style={workspace ? undefined : { zIndex: MEDIA_LIBRARY_Z_INDEX }} dir="rtl" onMouseDown={workspace ? undefined : onClose}>
    <section className={workspace ? "flex min-h-0 flex-1 flex-col overflow-hidden" : "max-h-[88vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-amber-400/25 bg-[#111521] shadow-2xl"} onMouseDown={(event) => event.stopPropagation()}>
      <header className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4"><div><div className="text-xs font-black text-amber-300">مكتبة الوسائط</div><h2 className="mt-1 text-lg font-black text-amber-50">ارفع واختر الصور والفيديو والصوت</h2></div><button onClick={onClose} className="rounded-xl p-2 text-slate-400 transition hover:bg-white/[0.07] hover:text-white" aria-label="إغلاق"><X size={18} /></button></header>
      <div className={`grid min-h-0 flex-1 overflow-y-auto ${workspace ? "grid-cols-1" : "max-h-[calc(88vh-80px)] lg:grid-cols-[1fr_280px]"}`}>
        <div className="min-h-72 p-4"><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{isLoading ? <div className="col-span-full flex h-48 items-center justify-center text-slate-500"><Loader2 className="animate-spin" size={22} /></div> : visibleAssets.length ? visibleAssets.map((asset) => <article key={asset.id} className="group overflow-hidden rounded-2xl border border-slate-800 bg-black/20"><button onClick={() => { if (onSelect) { onSelect(asset); onClose(); } }} className="block w-full text-right disabled:cursor-default" disabled={!onSelect}><div className="aspect-[4/3] bg-slate-900">{asset.kind === "image" ? <img src={asset.url} alt={asset.altText || asset.fileName} className="h-full w-full object-cover" /> : asset.kind === "video" ? <video src={asset.url} className="h-full w-full object-cover" muted /> : asset.kind === "audio" ? <div className="flex h-full flex-col items-center justify-center gap-3 text-amber-200"><Music2 size={30} /><span className="max-w-[80%] truncate text-[10px] font-bold">ملف صوت</span></div> : <div className="flex h-full flex-col items-center justify-center gap-2 text-amber-300"><Link2 size={26} /><span className="text-[10px] font-bold">فيديو مضمّن</span></div>}</div><div className="truncate px-3 py-2 text-xs font-bold text-slate-200">{asset.fileName}</div></button>{onSelect ? <div className="px-3 pb-1 text-[10px] font-bold text-amber-300">اضغط للاختيار</div> : null}<button onClick={() => { if (confirm("هل تريد إزالة هذا الملف من المكتبة؟")) remove.mutate({ id: asset.id }); }} disabled={remove.isPending} className="m-2 inline-flex items-center gap-1 rounded-lg border border-[#de191e]/40 px-2 py-1 text-[10px] font-bold text-[#de191e] opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100"><Trash2 size={11} />حذف</button></article>) : <div className="col-span-full rounded-2xl border border-dashed border-slate-700 p-10 text-center text-sm text-slate-500">لا توجد وسائط مناسبة بعد. ارفع أول صورة أو فيديو أو ملف صوت ليظهر هنا.</div>}</div></div>
        <aside className="border-t border-white/[0.08] bg-black/15 p-4 lg:border-r lg:border-t-0"><label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-amber-400/35 bg-amber-400/[0.04] px-4 py-7 text-center transition hover:bg-amber-400/[0.08]"><input type="file" accept={accept === "image" ? "image/png,image/jpeg,image/webp,image/gif,image/svg+xml" : accept === "video" ? "video/mp4,video/webm,video/quicktime" : accept === "audio" ? "audio/mpeg,audio/mp4,audio/ogg,audio/wav,audio/webm" : "image/png,image/jpeg,image/webp,image/gif,image/svg+xml,video/mp4,video/webm,video/quicktime,audio/mpeg,audio/mp4,audio/ogg,audio/wav,audio/webm"} className="sr-only" onChange={handleFile} disabled={upload.isPending} /><div className="rounded-xl bg-amber-400/15 p-2 text-amber-300">{upload.isPending ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}</div><span className="mt-3 text-xs font-black text-amber-100">رفع ملف جديد</span><span className="mt-1 text-[10px] leading-5 text-slate-500">الصور حتى 8MB، والفيديو والصوت حتى 25MB</span></label>{uploadStatus ? <div className="mt-3 rounded-xl border border-amber-400/15 bg-amber-400/[.04] p-3"><div className="mb-1 flex justify-between text-[10px] text-amber-100"><span>{uploadStatus}</span><span>{uploadProgress}%</span></div><Progress value={uploadProgress} className="h-1.5 bg-slate-800" /></div> : null}
          {accept !== "image" && <div className="mt-4 rounded-2xl border border-slate-800 bg-black/20 p-3"><div className="flex items-center gap-2 text-xs font-black text-amber-200"><Film size={15} />رابط فيديو YouTube أو Vimeo</div><input value={embedTitle} onChange={(event) => setEmbedTitle(event.target.value)} placeholder="عنوان الفيديو" className="mt-3 w-full rounded-lg border border-slate-700 bg-black/25 px-3 py-2 text-xs text-white outline-none focus:border-amber-400" /><input value={embedUrl} onChange={(event) => setEmbedUrl(event.target.value)} dir="ltr" placeholder="https://youtube.com/..." className="mt-2 w-full rounded-lg border border-slate-700 bg-black/25 px-3 py-2 text-xs text-white outline-none focus:border-amber-400" /><button onClick={() => addEmbed.mutate({ title: embedTitle.trim(), url: embedUrl.trim() })} disabled={!embedTitle.trim() || !embedUrl.trim() || addEmbed.isPending} className="mt-2 w-full rounded-lg bg-amber-400 px-3 py-2 text-xs font-black text-amber-950 disabled:opacity-40">{addEmbed.isPending ? "جارٍ الحفظ…" : "إضافة الرابط"}</button></div>}
          <div className="mt-4 flex items-center gap-2 text-[10px] leading-5 text-slate-500"><ImageIcon size={14} className="shrink-0 text-amber-300" />لا تُخزن الملفات داخل قاعدة البيانات؛ تحفظ المكتبة رابطاً آمناً للملف فقط.</div>
        </aside>
      </div>
    </section>
  </div>;
}
