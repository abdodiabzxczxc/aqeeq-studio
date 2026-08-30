import { useMemo, useState } from "react";
import { Activity, Clock3, Filter, Loader2, RefreshCw, UserRound } from "lucide-react";
import { trpc } from "../lib/trpc";
import { VisualEditable } from "../components/VisualEditor";

const actionLabels: Record<string, string> = {
  "attendee.delete": "حذف ضيف",
  "attendee.bulk_import": "استيراد ضيوف بالجملة",
  "ceremony.create": "إنشاء فعالية",
  "ceremony.update": "تعديل بيانات فعالية",
  "ceremony.activate": "تفعيل فعالية",
  "user.role_update": "تغيير صلاحية مستخدم",
  "notification.create": "إنشاء حملة إشعار",
  "notification.publish": "نشر حملة إشعار",
  "backup.restore": "استرجاع نسخة احتياطية",
};

export default function AuditLogsPage({ ceremonyId }: { ceremonyId?: number }) {
  const [filter, setFilter] = useState("all");
  const logs = trpc.audit.list.useQuery({ limit: 250, ceremonyId }, { refetchInterval: 15000 });
  const filtered = useMemo(() => {
    if (filter === "all") return logs.data ?? [];
    return (logs.data ?? []).filter((log) => log.action.startsWith(filter));
  }, [filter, logs.data]);

  return (
    <div className="space-y-5">
      <VisualEditable id="audit-header-section" tag="section" label="ترويسة سجل النشاط" as="section" className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <VisualEditable id="audit-title" tag="text" label="عنوان سجل النشاط" as="h2" defaultText="سجل النشاط الإداري" className="text-xl font-black text-amber-100" />
          <VisualEditable id="audit-subtitle" tag="text" label="وصف سجل النشاط" as="p" defaultText="مراجعة التغييرات الحساسة التي تمت داخل المنصة مع وقت التنفيذ واسم المنفذ." className="mt-1 text-sm text-slate-400" />
        </div>
        <div className="flex items-center gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-black/40 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300">
            <option value="all">كل العمليات</option>
            <option value="attendee">الضيوف</option>
            <option value="ceremony">الفعاليات</option>
          </select>
          <button type="button" onClick={() => logs.refetch()} className="p-2 rounded-xl border border-slate-700 text-slate-300 hover:text-amber-200" aria-label="تحديث السجل"><RefreshCw size={16} /></button>
        </div>
      </VisualEditable>

      <div className="card-dark rounded-2xl border overflow-hidden" style={{ borderColor: "oklch(25% 0.02 250)" }}>
        {logs.isLoading ? <div className="p-10 text-center text-slate-400"><Loader2 className="animate-spin mx-auto" /></div> : filtered.length ? (
          <div className="divide-y divide-slate-800/70">
            {filtered.map((log) => (
              <div key={log.id} className="p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-amber-300" style={{ background: "oklch(66% 0.20 70 / 0.12)" }}><Activity size={17} /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><span className="font-bold text-slate-100 text-sm">{actionLabels[log.action] ?? log.action}</span><span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">#{log.id}</span></div>
                  {log.details && <p className="text-xs text-slate-500 mt-1 break-all">{log.details}</p>}
                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 mt-2"><span className="flex items-center gap-1"><UserRound size={12} />{log.userName || "مستخدم النظام"}</span>{log.ceremonyId && <span>الفعالية #{log.ceremonyId}</span>}<span className="flex items-center gap-1"><Clock3 size={12} />{new Date(log.createdAt).toLocaleString("ar-SA")}</span></div>
                </div>
              </div>
            ))}
          </div>
        ) : <div className="p-10 text-center text-slate-500"><Filter size={26} className="mx-auto mb-2 opacity-60" /><p className="text-sm">لا توجد عمليات مطابقة حتى الآن.</p></div>}
      </div>
    </div>
  );
}
