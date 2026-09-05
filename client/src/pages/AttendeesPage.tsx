import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ChevronDown,
  Download,
  Edit2,
  Loader2,
  Plus,
  QrCode,
  Search,
  Trash2,
  XCircle,
  Printer,
  X,
  AlertTriangle,
  FileText,
  Eye,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import {
  TICKET_TYPE_LABELS,
  PAYMENT_STATUS_LABELS,
  TicketType,
  PaymentStatus,
} from "../../../shared/types";
import { trpc } from "../lib/trpc";
import { toast } from "sonner";
import BulkInvitationPreview from "../components/BulkInvitationPreview";
import InvitationPngPreview from "../components/InvitationPngPreview";
import { createInvitationPngBlob } from "../lib/invitationPng";
import { VisualEditable } from "../components/VisualEditor";

// ===== Invitation Preview Modal =====

function InvitationPreviewModal({
  attendee,
  ceremonyTitle,
  ceremonySubtitle,
  templateId,
  brandColor,
  logoUrl,
  invitationBackgroundUrl,
  invitationDate,
  invitationVenue,
  invitationDressCode,
  invitationLayout,
  onClose,
}: {
  attendee: { id: number; fullName: string; idNumber: string; qrCode: string; ticketType: string; seatNumber?: string | null };
  ceremonyTitle: string;
  ceremonySubtitle: string;
  templateId?: string | null;
  brandColor?: string | null;
  logoUrl?: string | null;
  invitationBackgroundUrl?: string | null;
  invitationDate?: string | null;
  invitationVenue?: string | null;
  invitationDressCode?: string | null;
  invitationLayout?: string | null;
  onClose: () => void;
}) {
  const [loadingPng, setLoadingPng] = useState(false);
  const invitationInput = { fullName: attendee.fullName, idNumber: attendee.idNumber, qrCode: attendee.qrCode, ticketType: attendee.ticketType, seatNumber: attendee.seatNumber, ceremonyTitle, ceremonySubtitle, templateId, brandColor, logoUrl, invitationBackgroundUrl, invitationDate, invitationVenue, invitationDressCode, invitationLayout };

  const handleDownloadPng = async () => {
    setLoadingPng(true);
    try {
      const blob = await createInvitationPngBlob(invitationInput);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${attendee.fullName.trim() || "ضيف"}-دعوة.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("تم تحميل بطاقة الدعوة PNG بنجاح");
    } catch (error) {
      console.error("Error generating invitation PNG:", error);
      toast.error("تعذر تحميل PNG. افتح المعاينة وانتظر اكتمال رمز QR ثم أعد المحاولة");
    } finally {
      setLoadingPng(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl z-10"
        style={{ background: "oklch(12% 0.015 250)", border: "1px solid oklch(66% 0.20 70 / 0.4)" }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "oklch(22% 0.02 250)", background: "oklch(10% 0.015 250)" }}>
          <div className="flex items-center gap-2 text-amber-300">
            <FileText size={18} />
            <h3 className="font-bold text-sm">معاينة بطاقة الدعوة الرقمية</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-amber-200 transition-colors"><X size={18} /></button>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-5 text-center">
          <InvitationPngPreview input={invitationInput} alt={`المعاينة النهائية لدعوة ${attendee.fullName}`} className="mx-auto aspect-[4/5] w-full max-w-[360px] rounded-2xl border border-amber-400/35 shadow-xl" />

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              onClick={handleDownloadPng}
              disabled={loadingPng}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-amber-950 transition-all hover:opacity-90 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              style={{ background: "var(--gold-gradient)" }}
            >
              {loadingPng ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              تحميل الدعوة PNG
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ===== QR Modal =====
function QrModal({
  attendee,
  onClose,
}: {
  attendee: { fullName: string; idNumber: string; qrCode: string; ticketType: string };
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, attendee.qrCode, {
        width: 240,
        margin: 2,
        color: { dark: "#1a1a2e", light: "#f5f0e8" },
      });
    }
  }, [attendee.qrCode]);

  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html dir="rtl"><head><title>بطاقة الدخول - ${attendee.fullName}</title>
      <style>
        body { font-family: 'Tajawal', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f0e8; }
        .card { background: #1a1a2e; color: #f5f0e8; border-radius: 16px; padding: 32px; text-align: center; max-width: 320px; border: 2px solid #c9a84c; }
        h2 { color: #c9a84c; font-size: 20px; margin: 0 0 4px; }
        p { color: #a0a0b0; font-size: 13px; margin: 4px 0; }
        img { margin: 16px auto; display: block; border-radius: 8px; }
        .badge { display: inline-block; background: rgba(201,168,76,0.15); color: #c9a84c; border: 1px solid rgba(201,168,76,0.4); border-radius: 8px; padding: 4px 12px; font-size: 12px; margin-top: 8px; }
        .code { font-family: monospace; font-size: 11px; color: #6b7280; margin-top: 8px; }
      </style>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet" />
      </head><body>
      <div class="card">
        <h2>مدارس العقيق</h2>
        <p>الفعالية الحالية</p>
        <img src="${dataUrl}" width="200" height="200" />
        <div style="font-size:18px;font-weight:bold;color:#f5f0e8;margin-top:8px">${attendee.fullName}</div>
        <p>رقم الهوية: ${attendee.idNumber}</p>
        <div class="badge">${TICKET_TYPE_LABELS[attendee.ticketType as TicketType] ?? attendee.ticketType}</div>
        <div class="code">${attendee.qrCode}</div>
      </div>
      </body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-sm rounded-2xl p-6 text-center shadow-2xl z-10"
        style={{ background: "oklch(13% 0.015 250)", border: "1px solid oklch(66% 0.20 70 / 0.4)" }}
      >
        <button onClick={onClose} className="absolute top-4 left-4 text-slate-400 hover:text-amber-200 transition-colors"><X size={18} /></button>
        <h3 className="font-bold text-amber-100 text-base mb-1">رمز الاستجابة السريع (QR)</h3>
        <p className="text-xs text-slate-400 mb-4">{attendee.fullName}</p>
        <div className="bg-[#f5f0e8] p-4 rounded-xl inline-block shadow-inner mx-auto mb-4">
          <canvas ref={canvasRef} className="block mx-auto" />
        </div>
        <div className="text-xs font-mono text-slate-400 mb-6 bg-black/40 py-1.5 px-3 rounded-lg">{attendee.qrCode}</div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border text-slate-300 hover:bg-slate-800 transition-all" style={{ borderColor: "oklch(28% 0.025 250)" }}>إغلاق</button>
          <button onClick={handlePrint} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-amber-950 transition-all hover:opacity-90 flex items-center justify-center gap-2" style={{ background: "var(--gold-gradient)" }}>
            <Printer size={15} />
            طباعة البطاقة
          </button>
          <button onClick={() => window.open(`/guest/${encodeURIComponent(attendee.qrCode)}`, "_blank", "noopener,noreferrer")} className="col-span-2 rounded-xl border border-[#f8ca14]/35 bg-[#f8ca14]/10 py-2.5 text-sm font-bold text-[#f8ca14] transition hover:bg-[#f8ca14]/20">فتح بطاقة الضيف الحيّة</button>
        </div>
      </motion.div>
    </div>
  );
}

// ===== Add/Edit Attendee Modal =====
function AttendeeModal({
  initial,
  ceremonyId,
  onClose,
  onSuccess,
}: {
  initial?: any;
  ceremonyId?: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    fullName: initial?.fullName ?? "",
    idNumber: initial?.idNumber ?? "",
    ticketType: initial?.ticketType ?? "student",
    paymentStatus: initial?.paymentStatus ?? "paid",
    seatNumber: initial?.seatNumber ?? "",
    notes: initial?.notes ?? "",
    ceremonyId: initial?.ceremonyId ?? ceremonyId,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const utils = trpc.useUtils();
  const createMutation = trpc.attendees.create.useMutation({
    onSuccess: () => {
      utils.attendees.list.invalidate();
      utils.attendees.stats.invalidate();
      toast.success("تم إضافة الضيف بنجاح");
      onSuccess();
    },
    onError: (err) => { setErrors({ submit: err.message }); toast.error(err.message || "تعذر إضافة الضيف"); },
  });

  const updateMutation = trpc.attendees.update.useMutation({
    onSuccess: () => {
      utils.attendees.list.invalidate();
      utils.attendees.stats.invalidate();
      toast.success("تم تحديث بيانات الضيف بنجاح");
      onSuccess();
    },
    onError: (err) => { setErrors({ submit: err.message }); toast.error(err.message || "تعذر تحديث بيانات الضيف"); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.fullName.trim()) newErrors.fullName = "الاسم مطلوب";
    if (!form.idNumber.trim()) newErrors.idNumber = "رقم الهوية مطلوب";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (initial) {
      updateMutation.mutate({ id: initial.id, ...form });
    } else {
      createMutation.mutate(form);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const inputClass = "w-full bg-black/50 border rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none transition-all";
  const inputStyle = { borderColor: "oklch(28% 0.025 250)" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl z-10"
        style={{ background: "oklch(12% 0.015 250)", border: "1px solid oklch(66% 0.20 70 / 0.4)" }}
      >
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "oklch(22% 0.02 250)", background: "oklch(10% 0.015 250)" }}>
          <h3 className="font-bold text-amber-100">{initial ? "تعديل بيانات الضيف" : "إضافة ضيف جديد"}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-amber-200 transition-colors"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.submit && (
            <div className="flex items-center gap-2 p-3 rounded-xl text-sm" style={{ background: "oklch(55% 0.22 25 / 0.1)", color: "oklch(65% 0.22 25)", border: "1px solid oklch(55% 0.22 25 / 0.2)" }}>
              <AlertTriangle size={15} />
              {errors.submit}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">الاسم الكامل *</label>
              <input className={inputClass} style={inputStyle} value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} placeholder="أدخل الاسم الكامل" />
              {errors.fullName && <p className="text-xs text-[#de191e] mt-1">{errors.fullName}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">رقم الهوية *</label>
              <input className={inputClass} style={inputStyle} value={form.idNumber} onChange={e => setForm(f => ({ ...f, idNumber: e.target.value }))} placeholder="رقم الهوية" />
              {errors.idNumber && <p className="text-xs text-[#de191e] mt-1">{errors.idNumber}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">رقم المقعد</label>
              <input className={inputClass} style={inputStyle} value={form.seatNumber} onChange={e => setForm(f => ({ ...f, seatNumber: e.target.value }))} placeholder="اختياري" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">نوع التذكرة</label>
              <select className={inputClass} style={inputStyle} value={form.ticketType} onChange={e => setForm(f => ({ ...f, ticketType: e.target.value as TicketType }))}>
                {Object.entries(TICKET_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">حالة الدفع</label>
              <select className={inputClass} style={inputStyle} value={form.paymentStatus} onChange={e => setForm(f => ({ ...f, paymentStatus: e.target.value as PaymentStatus }))}>
                {Object.entries(PAYMENT_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">ملاحظات</label>
              <textarea className={inputClass} style={inputStyle} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="ملاحظات إضافية (اختياري)" rows={2} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-slate-800 text-slate-300" style={{ borderColor: "oklch(28% 0.025 250)" }}>
              إلغاء
            </button>
            <button type="submit" disabled={isLoading} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-amber-950 transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: "var(--gold-gradient)" }}>
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
              {initial ? "حفظ التعديلات" : "إضافة الضيف"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ===== Delete Confirm =====
function DeleteConfirm({ name, onConfirm, onCancel, loading }: { name: string; onConfirm: () => void; onCancel: () => void; loading: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-sm rounded-2xl p-6 text-center shadow-2xl"
        style={{ background: "oklch(13% 0.015 250)", border: "1px solid oklch(55% 0.22 25 / 0.3)" }}
      >
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "oklch(55% 0.22 25 / 0.1)" }}>
          <Trash2 size={22} className="text-[#de191e]" />
        </div>
        <h3 className="font-bold text-amber-100 mb-2">تأكيد الحذف</h3>
        <p className="text-sm text-slate-400 mb-6">هل أنت متأكد من حذف <span className="text-amber-200 font-semibold">{name}</span>؟ لا يمكن التراجع عن هذا الإجراء.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border text-slate-300 hover:bg-slate-800 transition-all" style={{ borderColor: "oklch(28% 0.025 250)" }}>إلغاء</button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: "oklch(55% 0.22 25)" }}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
            حذف
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ===== Main Component =====
export default function AttendeesPage({ ceremonyId, invitationTool, onStatsChange }: { ceremonyId?: number; invitationTool?: string; onStatsChange?: () => void }) {
  const [search, setSearch] = useState("");
  const [ticketFilter, setTicketFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [attendedFilter, setAttendedFilter] = useState<"all" | "true" | "false">("all");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [qrTarget, setQrTarget] = useState<any>(null);
  const [previewAttendee, setPreviewAttendee] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkInvitationLoading, setBulkInvitationLoading] = useState(false);
  const [bulkPreviewOpen, setBulkPreviewOpen] = useState(false);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  const utils = trpc.useUtils();
  const ceremoniesQuery = trpc.ceremonies.list.useQuery();
  const publicSettings = trpc.settings.getPublicLogos.useQuery(undefined, { refetchOnWindowFocus: false });
  const activeCeremony = ceremoniesQuery.data?.find((ceremony) => ceremony.isActive);
  const selectedCeremony = ceremoniesQuery.data?.find((ceremony) => ceremony.id === ceremonyId) || activeCeremony;

  const { data, isLoading, refetch } = trpc.attendees.list.useQuery({
    search: search || undefined,
    ticketType: ticketFilter !== "all" ? ticketFilter : undefined,
    paymentStatus: paymentFilter !== "all" ? paymentFilter : undefined,
    attended: attendedFilter !== "all" ? attendedFilter === "true" : undefined,
    ceremonyId,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  }, { refetchInterval: 15000 });

  const deleteMutation = trpc.attendees.delete.useMutation({
    onSuccess: () => {
      refetch();
      onStatsChange?.();
      setDeleteTarget(null);
      toast.success("تم حذف الضيف بنجاح");
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkMutation = trpc.attendees.bulkCreate.useMutation();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const sourceRows: any[] = XLSX.utils.sheet_to_json(worksheet);
        if (!sourceRows.length) {
          toast.error("الملف فارغ أو غير صالح");
          return;
        }

        const rows = sourceRows.map((r) => {
          const ticketValue = String(r["نوع التذكرة"] || r["التذكرة"] || r.ticketType || "guest");
          const paymentValue = String(r["حالة الدفع"] || r["الدفع"] || r.paymentStatus || "unpaid");
          return {
            fullName: String(r["الاسم الكامل"] || r["الاسم"] || r.name || r["Full Name"] || "").trim(),
            idNumber: String(r["رقم الهوية"] || r["الهوية"] || r.id || r.ID || "").trim(),
            ticketType: ticketValue.includes("طالب") || ticketValue === "student" ? "student" as const : ticketValue.includes("ولي") || ticketValue === "guardian" ? "guardian" as const : ticketValue.toUpperCase().includes("VIP") || ticketValue === "vip" ? "vip" as const : "guest" as const,
            paymentStatus: paymentValue.includes("غير") || paymentValue === "unpaid" ? "unpaid" as const : paymentValue.includes("معفي") || paymentValue === "exempt" ? "exempt" as const : "paid" as const,
            notes: String(r["ملاحظات"] || r.notes || "مستورد من Excel"),
            seatNumber: String(r["رقم المقعد"] || r.seatNumber || ""),
            section: String(r["القطاع"] || r.section || ""),
            gate: String(r["البوابة"] || r.gate || ""),
            ceremonyId,
          };
        });

        const result = await bulkMutation.mutateAsync({ rows });
        const details = [`تم إدخال ${result.inserted} ضيف`];
        if (result.duplicates.length) details.push(`تجاهل ${result.duplicates.length} مكرر`);
        if (result.invalid.length) details.push(`تجاهل ${result.invalid.length} صف غير صالح`);
        toast.success(details.join(" — "));
        refetch();
        onStatsChange?.();
      } catch (err) {
        console.error("Error importing Excel:", err);
        toast.error("فشل استيراد الملف. تأكد من وجود الاسم ورقم الهوية وعدم تجاوز 2000 صف.");
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const createInvitationArchive = async (recipients: Array<{ fullName: string; idNumber: string; qrCode: string; ticketType: string; seatNumber?: string | null }>, clearSelection = false) => {
    if (!recipients.length) {
      toast.error("لا توجد دعوات متاحة للتنزيل");
      return;
    }
    setBulkInvitationLoading(true);
    try {
      const zip = new JSZip();
      const ceremonyTitle = selectedCeremony?.invitationTitle || selectedCeremony?.title || publicSettings.data?.event_title || "الفعالية";
      const ceremonySubtitle = selectedCeremony?.invitationSubtitle || selectedCeremony?.subtitle || publicSettings.data?.event_subtitle || "بطاقة دعوة رسمية";
      for (const attendee of recipients) {
        const blob = await createInvitationPngBlob({
          fullName: attendee.fullName,
          idNumber: attendee.idNumber,
          qrCode: attendee.qrCode,
          ticketType: attendee.ticketType,
          seatNumber: attendee.seatNumber,
          ceremonyTitle,
          ceremonySubtitle,
          templateId: selectedCeremony?.templateId,
          brandColor: selectedCeremony?.brandColor,
          logoUrl: selectedCeremony?.logoUrl,
          invitationBackgroundUrl: selectedCeremony?.invitationBackgroundUrl,
          invitationDate: selectedCeremony?.invitationDate,
          invitationVenue: selectedCeremony?.invitationVenue,
          invitationDressCode: selectedCeremony?.invitationDressCode,
          invitationLayout: selectedCeremony?.invitationLayout,
        });
        zip.file(`${attendee.fullName.trim() || "ضيف"}-دعوة.png`, blob);
      }
      const archive = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(archive);
      const link = document.createElement("a");
      link.href = url;
      link.download = `دعوات_الفعالية_${new Date().toISOString().slice(0, 10)}.zip`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(`تم تجهيز ${recipients.length} دعوة داخل ملف ZIP`);
      if (clearSelection) setSelectedIds(new Set());
    } catch (error) {
      console.error("Bulk invitation export failed", error);
      toast.error("تعذر إنشاء ملف الدعوات الجماعي");
    } finally {
      setBulkInvitationLoading(false);
    }
  };
  const handleBulkInvitationDownload = () => createInvitationArchive(items.filter((item) => selectedIds.has(item.id)), true);
  const handleAllInvitationsDownload = async () => {
    const allGuests = await utils.attendees.export.fetch(ceremonyId ? { ceremonyId } : undefined);
    if (!allGuests?.length) { toast.error("لا يوجد ضيوف في هذه الفعالية بعد"); return; }
    if (!window.confirm(`سيتم تجهيز ${allGuests.length} دعوة داخل ملف ZIP واحد. هل تريد المتابعة؟`)) return;
    await createInvitationArchive(allGuests);
  };

  const handleExport = async () => {
    const result = await utils.attendees.export.fetch(ceremonyId ? { ceremonyId } : undefined);
    if (!result) return;
    const rows = result.map((a) => ({
      "الاسم الكامل": a.fullName,
      "رقم الهوية": a.idNumber,
      "نوع التذكرة": TICKET_TYPE_LABELS[a.ticketType as TicketType] ?? a.ticketType,
      "حالة الدفع": PAYMENT_STATUS_LABELS[a.paymentStatus as PaymentStatus] ?? a.paymentStatus,
      "الحضور": a.attended ? "حاضر" : "غائب",
      "وقت الدخول": a.checkedInAt ? new Date(a.checkedInAt).toLocaleString("ar-SA") : "-",
      "رقم المقعد": a.seatNumber ?? "-",
      "ملاحظات": a.notes ?? "-",
      "رمز QR": a.qrCode,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الضيوف");
    XLSX.writeFile(wb, `الفعالية_${new Date().toLocaleDateString("ar-SA").replace(/\//g, "-")}.xlsx`);
    toast.success("تم تصدير ملف Excel بنجاح");
  };

  const handleBulkPrintQr = async () => {
    const result = await utils.attendees.export.fetch(ceremonyId ? { ceremonyId } : undefined);
    if (!result) return;

    const canvases = await Promise.all(
      result.map(async (a) => {
        const canvas = document.createElement("canvas");
        await QRCode.toCanvas(canvas, a.qrCode, { width: 200, margin: 1, color: { dark: "#1a1a2e", light: "#f5f0e8" } });
        return { canvas, name: a.fullName, id: a.idNumber, ticket: a.ticketType, qr: a.qrCode };
      })
    );

    const win = window.open("", "_blank");
    if (!win) return;
    const cards = canvases.map(({ canvas, name, id, ticket, qr }) => `
      <div class="card">
        <div class="school">مدارس العقيق - الفعالية الحالية</div>
        <img src="${canvas.toDataURL()}" width="160" height="160" />
        <div class="name">${name}</div>
        <div class="info">${id}</div>
        <div class="badge">${TICKET_TYPE_LABELS[ticket as TicketType] ?? ticket}</div>
        <div class="code">${qr}</div>
      </div>
    `).join("");

    win.document.write(`<html dir="rtl"><head><title>طباعة بطاقات QR</title>
      <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet" />
      <style>
        body { font-family: 'Tajawal', sans-serif; background: #f0ebe0; padding: 20px; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .card { background: #1a1a2e; color: #f5f0e8; border-radius: 12px; padding: 16px; text-align: center; border: 1.5px solid #c9a84c; page-break-inside: avoid; }
        .school { font-size: 10px; color: #c9a84c; margin-bottom: 8px; }
        img { border-radius: 6px; margin: 0 auto; display: block; }
        .name { font-size: 14px; font-weight: bold; margin-top: 8px; }
        .info { font-size: 11px; color: #a0a0b0; margin-top: 2px; }
        .badge { display: inline-block; background: rgba(201,168,76,0.15); color: #c9a84c; border: 1px solid rgba(201,168,76,0.4); border-radius: 6px; padding: 2px 8px; font-size: 10px; margin-top: 4px; }
        .code { font-family: monospace; font-size: 9px; color: #6b7280; margin-top: 4px; }
        @media print { body { padding: 0; } }
      </style></head>
      <body><div class="grid">${cards}</div></body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 800);
  };

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const invitationToolCopy: Record<string, { title: string; body: string }> = {
    invitation: { title: "معاينة دعوة رقمية", body: "اختر ضيفاً من الجدول، ثم اضغط أيقونة العين لفتح دعوته قبل التنزيل." },
    png: { title: "تنزيل دعوة PNG", body: "اختر ضيفاً من الجدول وافتح معاينته؛ زر تحميل PNG موجود داخل البطاقة." },
    bulk: { title: "الدعوات الجماعية ZIP", body: "حدد ضيفاً واحداً أو أكثر ثم اضغط زر «دعوات ZIP» لتجهيز ملف واحد." },
    qr: { title: "طباعة بطاقات QR", body: "استخدم زر «طباعة البطاقات» لإنشاء بطاقات الدخول القابلة للطباعة للفعالية." },
  };
  const activeInvitationTool = invitationTool ? invitationToolCopy[invitationTool] : undefined;

  const ticketBadge = (t: string) => {
    const map: Record<string, string> = { student: "badge-gold", guardian: "badge-warning", guest: "badge-success", vip: "badge-danger" };
    return map[t] ?? "badge-gold";
  };
  const paymentBadge = (p: string) => {
    if (p === "paid") return "badge-success";
    if (p === "unpaid") return "badge-danger";
    return "badge-warning";
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
      {/* Modals */}
      <AnimatePresence>
        {showForm && (
          <AttendeeModal
            ceremonyId={ceremonyId}
            onClose={() => setShowForm(false)}
            onSuccess={() => { setShowForm(false); refetch(); onStatsChange?.(); }}
          />
        )}
        {editTarget && (
          <AttendeeModal
            initial={editTarget}
            ceremonyId={ceremonyId}
            onClose={() => setEditTarget(null)}
            onSuccess={() => { setEditTarget(null); refetch(); onStatsChange?.(); }}
          />
        )}
        {deleteTarget && (
          <DeleteConfirm
            name={deleteTarget.fullName}
            loading={deleteMutation.isPending}
            onConfirm={() => deleteMutation.mutate({ id: deleteTarget.id })}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
        {qrTarget && (
          <QrModal
            attendee={qrTarget}
            onClose={() => setQrTarget(null)}
          />
        )}
        {previewAttendee && (
          <InvitationPreviewModal
            attendee={previewAttendee}
            ceremonyTitle={selectedCeremony?.invitationTitle || selectedCeremony?.title || publicSettings.data?.event_title || "الفعالية"}
            ceremonySubtitle={selectedCeremony?.invitationSubtitle || selectedCeremony?.subtitle || publicSettings.data?.event_subtitle || "بطاقة دعوة رسمية"}
            templateId={selectedCeremony?.templateId}
            brandColor={selectedCeremony?.brandColor}
            logoUrl={selectedCeremony?.logoUrl}
            invitationBackgroundUrl={selectedCeremony?.invitationBackgroundUrl}
            invitationDate={selectedCeremony?.invitationDate}
            invitationVenue={selectedCeremony?.invitationVenue}
            invitationDressCode={selectedCeremony?.invitationDressCode}
            invitationLayout={selectedCeremony?.invitationLayout}
            onClose={() => setPreviewAttendee(null)}
          />
        )}
        {bulkPreviewOpen && (
          <BulkInvitationPreview
            attendees={items.filter((item) => selectedIds.has(item.id))}
            ceremonyTitle={selectedCeremony?.invitationTitle || selectedCeremony?.title || publicSettings.data?.event_title || "الفعالية"}
            ceremonySubtitle={selectedCeremony?.invitationSubtitle || selectedCeremony?.subtitle || publicSettings.data?.event_subtitle || "بطاقة دعوة رسمية"}
            templateId={selectedCeremony?.templateId}
            brandColor={selectedCeremony?.brandColor}
            logoUrl={selectedCeremony?.logoUrl}
            invitationBackgroundUrl={selectedCeremony?.invitationBackgroundUrl}
            invitationDate={selectedCeremony?.invitationDate}
            invitationVenue={selectedCeremony?.invitationVenue}
            invitationDressCode={selectedCeremony?.invitationDressCode}
            invitationLayout={selectedCeremony?.invitationLayout}
            onClose={() => setBulkPreviewOpen(false)}
            onDownload={async () => { setBulkPreviewOpen(false); await handleBulkInvitationDownload(); }}
          />
        )}
      </AnimatePresence>

      <VisualEditable id="attendees-header-section" tag="section" label="ترويسة إدارة الضيوف" as="section" className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.045] p-4">
        <VisualEditable id="attendees-title" tag="text" label="عنوان إدارة الضيوف" as="h2" defaultText="الضيوف والدعوات" className="text-xl font-black text-amber-100" />
        <VisualEditable id="attendees-subtitle" tag="text" label="وصف إدارة الضيوف" as="p" defaultText="ابحث عن ضيوف فعاليتك، أضفهم، استوردهم، وأنشئ دعواتهم الرقمية من مساحة واحدة." className="mt-1 text-sm leading-6 text-slate-400" />
      </VisualEditable>
      {activeInvitationTool ? <section className="rounded-2xl border border-amber-400/35 bg-amber-400/[0.08] p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2 text-sm font-black text-amber-100"><FileText size={17} className="text-amber-300" />{activeInvitationTool.title}</div><p className="mt-1 text-xs leading-6 text-slate-300">{activeInvitationTool.body}</p></div><button onClick={() => document.getElementById("attendees-table")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="shrink-0 rounded-xl bg-amber-400 px-4 py-2 text-xs font-black text-amber-950">عرض الضيوف</button></div></section> : null}

      {/* Toolbar */}
      <div className="card-dark rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 border" style={{ borderColor: "oklch(22% 0.02 250)" }}>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-72">
            <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="البحث بالاسم أو رقم الهوية..."
              className="w-full bg-black/40 border rounded-xl pr-10 pl-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none transition-all"
              style={{ borderColor: "oklch(28% 0.025 250)" }}
            />
          </div>

          {/* Ticket Filter */}
          <select
            value={ticketFilter}
            onChange={(e) => setTicketFilter(e.target.value)}
            className="bg-black/40 border rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
            style={{ borderColor: "oklch(28% 0.025 250)" }}
          >
            <option value="all">جميع التذاكر</option>
            {Object.entries(TICKET_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>

          {/* Payment Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-black/40 border rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
            style={{ borderColor: "oklch(28% 0.025 250)" }}
          >
            <option value="all">حالة الدفع</option>
            {Object.entries(PAYMENT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>

          {/* Attended Filter */}
          <select
            value={attendedFilter}
            onChange={(e) => setAttendedFilter(e.target.value as any)}
            className="bg-black/40 border rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
            style={{ borderColor: "oklch(28% 0.025 250)" }}
          >
            <option value="all">حالة الحضور</option>
            <option value="true">حاضر</option>
            <option value="false">غائب</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls, .csv" className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border text-slate-300 hover:bg-slate-800 transition-all"
            style={{ borderColor: "oklch(28% 0.025 250)" }}
          >
            <Download size={14} className="rotate-180 text-amber-300" />
            استيراد Excel
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border text-slate-300 hover:bg-slate-800 transition-all"
            style={{ borderColor: "oklch(28% 0.025 250)" }}
          >
            <Download size={14} className="text-emerald-400" />
            تصدير Excel
          </button>
          <button
            onClick={handleBulkPrintQr}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border text-slate-300 hover:bg-slate-800 transition-all"
            style={{ borderColor: "oklch(28% 0.025 250)" }}
          >
            <Printer size={14} className="text-amber-400" />
            طباعة البطاقات
          </button>
          <button
            onClick={() => selectedIds.size ? setBulkPreviewOpen(true) : toast.error("حدد ضيفاً واحداً على الأقل لتنزيل الدعوات")}
            disabled={bulkInvitationLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border text-slate-300 hover:bg-slate-800 transition-all disabled:opacity-50"
            style={{ borderColor: "oklch(28% 0.025 250)" }}
          >
            {bulkInvitationLoading ? <Loader2 size={14} className="animate-spin text-[#f8ca14]" /> : <FileText size={14} className="text-[#f8ca14]" />}
            دعوات ZIP ({selectedIds.size})
          </button>
          <button
            onClick={() => void handleAllInvitationsDownload()}
            disabled={bulkInvitationLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black border border-amber-400/45 bg-amber-400/[.08] text-amber-100 hover:bg-amber-400/15 transition-all disabled:opacity-50"
          >
            {bulkInvitationLoading ? <Loader2 size={14} className="animate-spin text-amber-300" /> : <Download size={14} className="text-amber-300" />}
            كل دعوات الفعالية ZIP
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-amber-950 transition-all hover:opacity-90 shadow-lg shadow-amber-500/10"
            style={{ background: "var(--gold-gradient)" }}
          >
            <Plus size={15} />
            إضافة ضيف
          </button>
        </div>
      </div>

      {/* Table */}
      <div id="attendees-table" className="card-dark rounded-2xl overflow-hidden border" style={{ borderColor: "oklch(22% 0.02 250)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b text-xs text-slate-400 font-semibold" style={{ borderColor: "oklch(22% 0.02 250)", background: "oklch(10% 0.015 250)" }}>
                <th className="py-3.5 px-4 w-10"><input type="checkbox" aria-label="تحديد الكل" checked={items.length > 0 && items.every((item) => selectedIds.has(item.id))} onChange={(e) => setSelectedIds(e.target.checked ? new Set(items.map((item) => item.id)) : new Set())} /></th>
                <th className="py-3.5 px-4">الاسم الكامل</th>
                <th className="py-3.5 px-4">رقم الهوية</th>
                <th className="py-3.5 px-4">نوع التذكرة</th>
                <th className="py-3.5 px-4">حالة الدفع</th>
                <th className="py-3.5 px-4">حالة الحضور</th>
                <th className="py-3.5 px-4">وقت الدخول</th>
                <th className="py-3.5 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Loader2 className="animate-spin text-amber-400 mx-auto mb-2" size={24} />
                    جارٍ تحميل البيانات...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-500">
                    <QrCode size={36} className="mx-auto mb-2 opacity-30" />
                    لا توجد ضيوف مطابقة للبحث أو الفلتر
                  </td>
                </tr>
              ) : (
                items.map((attendee) => (
                  <tr key={attendee.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="py-3 px-4"><input type="checkbox" aria-label={`تحديد ${attendee.fullName}`} checked={selectedIds.has(attendee.id)} onChange={(e) => setSelectedIds((current) => { const next = new Set(current); if (e.target.checked) next.add(attendee.id); else next.delete(attendee.id); return next; })} /></td>
                    <td className="py-3 px-4 font-bold text-slate-100">
                      <div>{attendee.fullName}</div>
                      {attendee.seatNumber && <div className="text-[11px] text-slate-400 font-normal">المقعد: {attendee.seatNumber}</div>}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono text-xs">{attendee.idNumber}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${ticketBadge(attendee.ticketType)}`}>
                        {TICKET_TYPE_LABELS[attendee.ticketType as TicketType] ?? attendee.ticketType}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${paymentBadge(attendee.paymentStatus)}`}>
                        {PAYMENT_STATUS_LABELS[attendee.paymentStatus as PaymentStatus] ?? attendee.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {attendee.attended ? (
                        <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                          <CheckCircle2 size={15} />
                          حاضر
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                          <XCircle size={15} />
                          غائب
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-xs">
                      {attendee.checkedInAt ? new Date(attendee.checkedInAt).toLocaleTimeString("ar-SA") : "-"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setPreviewAttendee(attendee)}
                          title="معاينة وتحميل بطاقة الدعوة PNG"
                          className="p-2 rounded-lg bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 transition-all"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => setQrTarget(attendee)}
                          title="عرض رمز QR للطباعة السريعة"
                          className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"
                        >
                          <QrCode size={15} />
                        </button>
                        <button
                          onClick={() => setEditTarget(attendee)}
                          title="تعديل البيانات"
                          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(attendee)}
                          title="حذف الضيف"
                          className="p-2 rounded-lg bg-[#de191e]/10 text-[#de191e] hover:bg-[#de191e]/20 transition-all"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="px-6 py-3 border-t flex items-center justify-between text-xs text-slate-400" style={{ borderColor: "oklch(22% 0.02 250)", background: "oklch(10% 0.015 250)" }}>
          <div>إجمالي الضيوف: <span className="text-amber-200 font-bold">{total}</span></div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 rounded-lg border border-slate-700 disabled:opacity-30 hover:bg-slate-800"
            >
              السابق
            </button>
            <span>صفحة {page + 1}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={(page + 1) * PAGE_SIZE >= total}
              className="px-3 py-1.5 rounded-lg border border-slate-700 disabled:opacity-30 hover:bg-slate-800"
            >
              التالي
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
