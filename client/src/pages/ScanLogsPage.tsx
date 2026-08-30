import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, RefreshCw, XCircle, AlertTriangle, HelpCircle } from "lucide-react";
import { SCAN_RESULT_LABELS, ScanResult } from "../../../shared/types";

export default function ScanLogsPage({ ceremonyId }: { ceremonyId?: number }) {
  const { data: logs, isLoading, refetch, isFetching } = trpc.scan.logs.useQuery(
    { limit: 100, ceremonyId },
    { refetchInterval: 10000 }
  );

  const resultIcon = (r: string) => {
    if (r === "success") return <CheckCircle2 size={14} className="text-emerald-400" />;
    if (r === "duplicate") return <AlertTriangle size={14} className="text-amber-400" />;
    if (r === "not_found") return <HelpCircle size={14} className="text-slate-400" />;
    return <XCircle size={14} className="text-rose-400" />;
  };

  const resultBadge = (r: string) => {
    if (r === "success") return "badge-success";
    if (r === "duplicate") return "badge-warning";
    if (r === "not_found") return "badge-danger";
    return "badge-danger";
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-amber-100">سجل عمليات المسح</h2>
          <p className="text-xs text-slate-500 mt-0.5">آخر 100 عملية مسح لهذه الفعالية — يتحدث كل 10 ثوانٍ</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-all hover:bg-amber-400/5 text-amber-400 disabled:opacity-50"
          style={{ borderColor: "oklch(66% 0.20 70 / 0.3)" }}
        >
          <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
          تحديث
        </button>
      </div>

      <div className="card-dark rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid oklch(22% 0.02 250)", background: "oklch(11% 0.012 250)" }}>
                {["#", "رمز QR", "النتيجة", "وقت المسح"].map(h => (
                  <th key={h} className="px-4 py-3 text-right text-xs font-semibold text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="py-16 text-center text-slate-500">
                  <Loader2 size={24} className="animate-spin mx-auto mb-2 text-amber-400" />
                  جارٍ التحميل...
                </td></tr>
              ) : !logs || logs.length === 0 ? (
                <tr><td colSpan={4} className="py-16 text-center text-slate-500">
                  <div className="text-4xl mb-3">📋</div>
                  لا توجد عمليات مسح بعد
                </td></tr>
              ) : logs.map((log, i) => (
                <tr
                  key={log.id}
                  className="table-row-hover transition-colors"
                  style={{ borderBottom: "1px solid oklch(18% 0.015 250)" }}
                >
                  <td className="px-4 py-3 text-slate-600 text-xs">{i + 1}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{log.qrCode}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${resultBadge(log.result)}`}>
                      {resultIcon(log.result)}
                      {SCAN_RESULT_LABELS[log.result as ScanResult] ?? log.result}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                    {new Date(log.scannedAt).toLocaleString("ar-SA", {
                      hour: "2-digit", minute: "2-digit", second: "2-digit",
                      day: "2-digit", month: "2-digit"
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
