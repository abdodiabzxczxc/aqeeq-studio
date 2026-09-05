import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { AnimatePresence, motion } from "framer-motion";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  DoorOpen,
  GraduationCap,
  HelpCircle,
  LogOut,
  Scan,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { TICKET_TYPE_LABELS, TicketType } from "../../../shared/types";
import { enqueueOfflineScan, listOfflineScans, removeOfflineScan } from "../lib/offlineScanQueue";
import { toast } from "sonner";
import { VisualEditable } from "../components/VisualEditor";

type ScanState =
  | { status: "idle" }
  | { status: "scanning" }
  | { status: "success"; attendee: any }
  | { status: "duplicate"; attendee: any }
  | { status: "not_found" }
  | { status: "offline_pending" }
  | { status: "error"; message: string };

function ResultCard({ state, onReset }: { state: ScanState; onReset: () => void }) {
  if (state.status === "idle" || state.status === "scanning") return null;

  const configs = {
    success: {
      bg: "oklch(60% 0.18 145 / 0.12)",
      border: "oklch(60% 0.18 145 / 0.4)",
      icon: <CheckCircle2 size={48} className="text-emerald-400" />,
      title: "دخول مسموح ✓",
      titleColor: "text-emerald-400",
      pulse: "oklch(60% 0.18 145 / 0.3)",
    },
    duplicate: {
      bg: "oklch(72% 0.18 60 / 0.12)",
      border: "oklch(72% 0.18 60 / 0.4)",
      icon: <AlertTriangle size={48} className="text-amber-400" />,
      title: "دخول مكرر ⚠",
      titleColor: "text-amber-400",
      pulse: "oklch(72% 0.18 60 / 0.3)",
    },
    not_found: {
      bg: "oklch(55% 0.22 25 / 0.12)",
      border: "oklch(55% 0.22 25 / 0.4)",
      icon: <HelpCircle size={48} className="text-[#de191e]" />,
      title: "رمز غير موجود ✗",
      titleColor: "text-[#de191e]",
      pulse: "oklch(55% 0.22 25 / 0.3)",
    },
    error: {
      bg: "oklch(55% 0.22 25 / 0.12)",
      border: "oklch(55% 0.22 25 / 0.4)",
      icon: <XCircle size={48} className="text-[#de191e]" />,
      title: "خطأ في المعالجة",
      titleColor: "text-[#de191e]",
      pulse: "oklch(55% 0.22 25 / 0.3)",
    },
    offline_pending: {
      bg: "oklch(70% 0.14 220 / 0.12)",
      border: "oklch(70% 0.14 220 / 0.45)",
      icon: <Clock size={48} className="text-[#f8ca14]" />,
      title: "تم الحفظ دون اتصال",
      titleColor: "text-[#f8ca14]",
      pulse: "oklch(70% 0.14 220 / 0.3)",
    },
  };

  const cfg = configs[state.status as keyof typeof configs];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className="rounded-2xl p-8 text-center"
      style={{ background: cfg.bg, border: `2px solid ${cfg.border}` }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="flex justify-center mb-4"
      >
        {cfg.icon}
      </motion.div>

      <h2 className={`text-2xl font-black mb-3 ${cfg.titleColor}`}>{cfg.title}</h2>

      {(state.status === "success" || state.status === "duplicate") && state.attendee && (
        <div className="space-y-2 mb-6">
          <p className="text-xl font-bold text-amber-100">{state.attendee.fullName}</p>
          <p className="text-sm text-slate-400">رقم الهوية: {state.attendee.idNumber}</p>
          <div className="flex justify-center gap-2 mt-3">
            <span className="badge-gold px-3 py-1 rounded-lg text-xs font-semibold">
              {TICKET_TYPE_LABELS[state.attendee.ticketType as TicketType] ?? state.attendee.ticketType}
            </span>
            {state.status === "duplicate" && state.attendee.checkedInAt && (
              <span className="badge-warning px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                <Clock size={11} />
                دخل في {new Date(state.attendee.checkedInAt).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
          {state.status === "duplicate" && (
            <p className="text-sm text-amber-400/80 mt-2 font-medium">
              هذا الشخص قد دخل مسبقاً — الدخول المكرر غير مسموح
            </p>
          )}
        </div>
      )}

      {state.status === "not_found" && (
        <p className="text-slate-400 text-sm mb-6">لم يتم العثور على هذا الرمز في قاعدة البيانات</p>
      )}

      {state.status === "error" && (
        <p className="text-slate-400 text-sm mb-6">{(state as any).message}</p>
      )}
      {state.status === "offline_pending" && (
        <p className="text-slate-400 text-sm mb-6">تم حفظ الرمز على هذا الجهاز وسيتم التحقق منه ومزامنته تلقائياً عند عودة الإنترنت.</p>
      )}

      <button
        onClick={onReset}
        className="px-8 py-3 rounded-xl font-bold text-amber-900 transition-all hover:opacity-90"
        style={{ background: "var(--gold-gradient)" }}
      >
        مسح رمز جديد
      </button>
    </motion.div>
  );
}

export default function ScanGate() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [, navigate] = useLocation();
  const ceremonyId = typeof window !== "undefined" ? Number(new URLSearchParams(window.location.search).get("ceremonyId")) || undefined : undefined;
  const [scanState, setScanState] = useState<ScanState>({ status: "idle" });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOnline, setIsOnline] = useState(() => typeof navigator === "undefined" ? true : navigator.onLine);
  const [offlinePending, setOfflinePending] = useState(0);
  const [syncState, setSyncState] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [selectedGate, setSelectedGate] = useState("");
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScannedRef = useRef<string>("");
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);

  const { data: stats } = trpc.attendees.stats.useQuery(ceremonyId ? { ceremonyId } : undefined, { refetchInterval: 15000 });
  const { data: ceremony } = trpc.ceremonies.public.useQuery(ceremonyId ? { id: ceremonyId } : undefined);
  const { data: settings } = trpc.settings.getPublicLogos.useQuery(undefined, { refetchOnWindowFocus: false });
  const schoolLogo = settings?.school_logo || "/manus-storage/logo_school_b7348eaa.png";
  const scanMutation = trpc.scan.process.useMutation();
  const availableGates = String(ceremony?.gates || "").split(/[,،\n]/).map((gate) => gate.trim()).filter(Boolean);

  useEffect(() => {
    if (!selectedGate && availableGates.length) setSelectedGate(availableGates[0]);
  }, [availableGates.join("|")]);

  const playFeedback = (kind: "success" | "warning" | "error" | "offline") => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const context = new AudioContextClass();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = kind === "success" ? 880 : kind === "warning" ? 520 : kind === "offline" ? 660 : 220;
      oscillator.type = "sine";
      gain.gain.setValueAtTime(0.06, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.18);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.18);
    } catch { /* Audio may be blocked until user interaction. */ }
    if ("vibrate" in navigator) navigator.vibrate(kind === "success" ? 80 : kind === "warning" ? [60, 50, 60] : [140, 60, 140]);
  };

  const flushOfflineScans = async () => {
    if (!navigator.onLine) return;
    const queued = (await listOfflineScans().catch(() => [])).filter((item) => item.ceremonyId === ceremonyId);
    setOfflinePending(queued.length);
    if (!queued.length) return;
    setSyncState("syncing");
    let synced = 0;
    let failed = 0;
    for (const item of queued) {
      try {
        await scanMutation.mutateAsync({ qrCode: item.qrCode, deviceInfo: `${item.deviceInfo ?? navigator.userAgent} · offline`, ceremonyId, gate: item.gate });
        await removeOfflineScan(item.id);
        synced++;
      } catch {
        failed++;
      }
    }
    const remaining = (await listOfflineScans().catch(() => [])).filter((item) => item.ceremonyId === ceremonyId);
    setOfflinePending(remaining.length);
    if (failed) {
      setSyncState("error");
      toast.error(`تعذر مزامنة ${failed} عملية مسح، وستبقى محفوظة للمحاولة التالية`);
    } else {
      setSyncState("success");
      toast.success(`تمت مزامنة ${synced} عملية مسح محفوظة دون اتصال`);
    }
  };

  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); void flushOfflineScans(); };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    if (navigator.onLine) void flushOfflineScans();
    else void listOfflineScans().then((items) => setOfflinePending(items.filter((item) => item.ceremonyId === ceremonyId).length)).catch(() => {});
    return () => { window.removeEventListener("online", handleOnline); window.removeEventListener("offline", handleOffline); };
  }, [ceremonyId]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/");
    }
    if (!loading && isAuthenticated && user?.role === "user") {
      navigate("/");
    }
  }, [loading, isAuthenticated, user]);

  useEffect(() => {
    if (!isAuthenticated || loading) return;

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 260, height: 260 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        rememberLastUsedCamera: true,
        showTorchButtonIfSupported: true,
      },
      false
    );

    scanner.render(
      async (decodedText) => {
        if (isProcessing || decodedText === lastScannedRef.current) return;
        if (cooldownRef.current) return;

        lastScannedRef.current = decodedText;
        setIsProcessing(true);
        setScanState({ status: "scanning" });

        cooldownRef.current = setTimeout(() => {
          lastScannedRef.current = "";
          cooldownRef.current = null;
        }, 3000);

        try {
          if (!navigator.onLine) {
            await enqueueOfflineScan({ qrCode: decodedText, deviceInfo: navigator.userAgent, ceremonyId, gate: selectedGate || undefined });
            setOfflinePending((count) => count + 1);
            setScanState({ status: "offline_pending" });
            playFeedback("offline");
            return;
          }

          const result = await scanMutation.mutateAsync({
            qrCode: decodedText,
            deviceInfo: navigator.userAgent,
            ceremonyId,
            gate: selectedGate || undefined,
          });

          if (result.result === "success") {
            setScanState({ status: "success", attendee: result.attendee });
            playFeedback("success");
          } else if (result.result === "duplicate") {
            setScanState({ status: "duplicate", attendee: result.attendee });
            playFeedback("warning");
          } else {
            setScanState({ status: "not_found" });
            playFeedback("error");
          }
        } catch (err: any) {
          if (!navigator.onLine) {
            await enqueueOfflineScan({ qrCode: decodedText, deviceInfo: navigator.userAgent, ceremonyId, gate: selectedGate || undefined });
            setOfflinePending((count) => count + 1);
            setScanState({ status: "offline_pending" });
            playFeedback("offline");
          } else {
            setScanState({ status: "error", message: err.message ?? "حدث خطأ غير متوقع" });
            playFeedback("error");
          }
        } finally {
          setIsProcessing(false);
        }
      },
      (error) => {
        // Ignore scan errors (camera noise)
      }
    );

    scannerRef.current = scanner;

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [isAuthenticated, loading, ceremonyId, selectedGate]);

  const handleReset = () => {
    setScanState({ status: "idle" });
    lastScannedRef.current = "";
    if (cooldownRef.current) {
      clearTimeout(cooldownRef.current);
      cooldownRef.current = null;
    }
  };

  const attendanceRate =
    stats && stats.total > 0 ? Math.round((stats.attended / stats.total) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--dark-gradient)" }}>
        <div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--dark-gradient)" }}>
        <div className="card-gold-border rounded-2xl p-8 text-center max-w-sm w-full">
          <Scan size={40} className="text-amber-400 mx-auto mb-4" />
          <h2 className="font-bold text-amber-100 text-xl mb-2">بوابة المسح</h2>
          <p className="text-slate-400 text-sm mb-6">يجب تسجيل الدخول للوصول إلى بوابة المسح</p>
          <a
            href={getLoginUrl()}
            className="block w-full py-3 rounded-xl font-bold text-amber-900 text-center transition-all hover:opacity-90"
            style={{ background: "var(--gold-gradient)" }}
          >
            تسجيل الدخول
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(180deg, oklch(9% 0.01 250) 0%, oklch(11% 0.012 250) 100%)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-30 border-b"
        style={{
          background: "oklch(9% 0.01 250 / 0.95)",
          borderColor: "oklch(22% 0.02 250)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src={schoolLogo} alt="شعار المنصة" className="h-9 w-auto object-contain" />
            <div className="hidden sm:block">
              <VisualEditable id="scan-brand-title" tag="text" label="عنوان بوابة المسح" as="div" defaultText={ceremony?.title || "بوابة الدخول"} className="text-sm font-bold text-amber-100" />
              <VisualEditable id="scan-brand-subtitle" tag="text" label="وصف بوابة المسح" as="div" defaultText={ceremony ? "بوابة مسح هذه الفعالية" : "بوابة دخول الفعالية"} className="text-xs text-slate-500" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {["admin", "coordinator"].includes(user?.role ?? "") && (
              <button
                onClick={() => navigate(ceremonyId ? `/workspace/${ceremonyId}` : "/dashboard")}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all hover:bg-amber-400/5 text-amber-400"
                style={{ borderColor: "oklch(66% 0.20 70 / 0.3)" }}
              >
                <ArrowRight size={14} />
                {ceremonyId ? "مساحة الفعالية" : "لوحة التحكم"}
              </button>
            )}
            <button
              onClick={() => logout()}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all hover:bg-[#de191e]/5 text-slate-400 hover:text-[#de191e]"
              style={{ borderColor: "oklch(28% 0.025 250)" }}
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6 max-w-2xl">
        {!isOnline && (
          <div className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-center text-xs text-amber-200">
            الوضع دون اتصال: سيتم حفظ عمليات المسح محلياً والتحقق منها عند عودة الإنترنت.
          </div>
        )}
        {isOnline && offlinePending > 0 && (
          <div className={`mb-4 rounded-xl border px-4 py-3 text-center text-xs ${syncState === "error" ? "border-[#de191e]/30 bg-[#de191e]/10 text-red-200" : "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-amber-200"}`}>
            {syncState === "syncing" ? `تتم مزامنة ${offlinePending} عملية مسح محفوظة محلياً...` : syncState === "error" ? `تعذر مزامنة بعض العمليات. المتبقي: ${offlinePending}` : `عمليات مسح محفوظة محلياً: ${offlinePending}`}
          </div>
        )}
        {isOnline && syncState === "success" && offlinePending === 0 && (
          <div className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-center text-xs text-emerald-200">تمت مزامنة طابور المسح المحلي بنجاح.</div>
        )}
        {/* Live Stats Bar */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: Users, label: "الضيوف", value: stats?.total ?? 0, color: "text-amber-400" },
            { icon: CheckCircle2, label: "الحاضرون", value: stats?.attended ?? 0, color: "text-emerald-400" },
            { icon: Scan, label: "نسبة الحضور", value: `${attendanceRate}%`, color: "text-[#f8ca14]" },
          ].map((s, i) => (
            <div key={i} className="card-gold-border rounded-xl p-3 flex flex-col items-center gap-1 text-center">
              <s.icon size={18} className={s.color} />
              <div className={`text-lg font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>

        <VisualEditable id="scan-gate-section" tag="section" label="قسم نقطة الاستقبال" as="section" className="mb-6 rounded-2xl border border-amber-400/20 bg-amber-400/[0.045] p-4">
          <VisualEditable id="scan-gate-title" tag="text" label="عنوان نقطة الاستقبال" as="div" defaultText="نقطة الاستقبال الحالية" className="flex items-center gap-2 text-sm font-black text-amber-100">{(text) => <><DoorOpen size={17} className="text-amber-400" />{text}</>}</VisualEditable>
          {availableGates.length ? <div className="mt-3 flex flex-wrap gap-2">{availableGates.map((gate) => <button key={gate} onClick={() => setSelectedGate(gate)} className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${selectedGate === gate ? "text-amber-950" : "border-slate-700 bg-black/20 text-slate-300 hover:border-amber-400/40"}`} style={selectedGate === gate ? { background: "var(--gold-gradient)", borderColor: "transparent" } : undefined}>{gate}</button>)}</div> : <p className="mt-2 text-xs leading-6 text-slate-400">لم تُضف بوابات لهذه الفعالية بعد. ستُسجل عمليات المسح كنقطة استقبال عامة.</p>}
        </VisualEditable>

        {/* Scanner / Result */}
        <AnimatePresence mode="wait">
          {scanState.status === "idle" || scanState.status === "scanning" ? (
            <motion.div
              key="scanner"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card-gold-border rounded-2xl overflow-hidden">
                {/* Scanner Header */}
                <div
                  className="px-5 py-4 border-b flex items-center justify-between"
                  style={{ borderColor: "oklch(28% 0.025 250)" }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-sm font-semibold text-amber-100">الكاميرا نشطة</span>
                  </div>
                  {isProcessing && (
                    <div className="flex items-center gap-2 text-xs text-amber-400">
                      <div className="w-3 h-3 rounded-full border border-amber-400 border-t-transparent animate-spin" />
                      جارٍ التحقق...
                    </div>
                  )}
                </div>

                {/* QR Reader Container */}
                <div className="p-4">
                  <div
                    id="qr-reader"
                    ref={containerRef}
                    className="rounded-xl overflow-hidden"
                    style={{ minHeight: 320 }}
                  />
                </div>

                <div className="px-5 pb-5 text-center">
                  <p className="text-xs text-slate-500">
                    وجّه الكاميرا نحو رمز QR الموجود على بطاقة الدخول
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="result">
              <ResultCard state={scanState} onReset={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        <div className="mt-6 card-dark rounded-2xl p-5">
          <h3 className="font-bold text-amber-100 mb-3 text-sm">تعليمات الاستخدام</h3>
          <div className="space-y-2">
            {[
              { icon: "🟢", text: "دخول مسموح: الضيف مضاف ولم يدخل بعد" },
              { icon: "🟡", text: "دخول مكرر: الشخص دخل مسبقاً — لا يُسمح بالدخول مجدداً" },
              { icon: "🔴", text: "غير موجود: الرمز غير موجود في النظام" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center border-t" style={{ borderColor: "oklch(22% 0.02 250)" }}>
        <p className="text-xs text-slate-600 flex items-center justify-center gap-1">
          <GraduationCap size={12} />
          حفل تخرج مدارس العقيق 2026
        </p>
      </footer>

      {/* Custom QR Scanner Styles */}
      <style>{`
        #qr-reader { background: transparent !important; border: none !important; }
        #qr-reader video { border-radius: 12px !important; }
        #qr-reader__scan_region { background: transparent !important; border: none !important; }
        #qr-reader__scan_region img { display: none !important; }
        #qr-reader__dashboard { padding: 8px 0 0 !important; }
        #qr-reader__dashboard_section_csr button {
          background: var(--gold-gradient) !important;
          color: oklch(15% 0.02 70) !important;
          border: none !important;
          border-radius: 12px !important;
          padding: 10px 20px !important;
          font-family: 'Tajawal', sans-serif !important;
          font-weight: 700 !important;
          font-size: 14px !important;
          cursor: pointer !important;
          transition: opacity 0.2s !important;
        }
        #qr-reader__dashboard_section_csr button:hover { opacity: 0.9 !important; }
        #qr-reader__dashboard_section_swaplink { display: none !important; }
        #qr-reader__status_span {
          color: oklch(60% 0.02 250) !important;
          font-family: 'Tajawal', sans-serif !important;
          font-size: 12px !important;
        }
        #qr-reader select {
          background: oklch(16% 0.018 250) !important;
          color: oklch(80% 0.05 250) !important;
          border: 1px solid oklch(28% 0.025 250) !important;
          border-radius: 8px !important;
          padding: 6px 10px !important;
          font-family: 'Tajawal', sans-serif !important;
          font-size: 13px !important;
        }
        #qr-reader__camera_permission_button {
          background: var(--gold-gradient) !important;
          color: oklch(15% 0.02 70) !important;
          border: none !important;
          border-radius: 12px !important;
          padding: 10px 24px !important;
          font-family: 'Tajawal', sans-serif !important;
          font-weight: 700 !important;
          cursor: pointer !important;
        }
      `}</style>
    </div>
  );
}
