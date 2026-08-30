import { useRef, useState } from "react";
import { BellRing, DatabaseBackup, Download, FileUp, Loader2, Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "../lib/trpc";
import { VisualEditable } from "../components/VisualEditor";

export default function OperationsPage({ ceremonyId, showBackup = true }: { ceremonyId?: number; showBackup?: boolean }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<"all" | "unpaid" | "absent" | "attended">("all");
  const channel = "in_app" as const;
  const backupInputRef = useRef<HTMLInputElement>(null);
  const notifications = trpc.notifications.list.useQuery({ limit: 100, ceremonyId });
  const backup = trpc.backup.export.useQuery(undefined, { enabled: false });
  const utils = trpc.useUtils();
  const createNotification = trpc.notifications.create.useMutation({ onSuccess: () => { toast.success("تم حفظ حملة الإشعار في قائمة الإرسال"); setTitle(""); setMessage(""); utils.notifications.list.invalidate(); }, onError: (error) => toast.error(error.message) });
  const publishNotification = trpc.notifications.publish.useMutation({ onSuccess: () => { toast.success("تم نشر الإشعار داخل النظام"); utils.notifications.list.invalidate(); }, onError: (error) => toast.error(error.message) });
  const restore = trpc.backup.restore.useMutation({ onSuccess: (result) => toast.success(`تمت استعادة ${result.attendeesInserted} ضيف و${result.ceremoniesInserted} فعالية و${result.settingsRestored} إعداد و${result.notificationsRestored} إشعار`), onError: (error) => toast.error(error.message) });

  const exportBackup = async () => {
    const snapshot = await backup.refetch();
    if (!snapshot.data) return;
    const blob = new Blob([JSON.stringify(snapshot.data, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = `نسخة_احتياطية_المنصة_${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(url);
    toast.success("تم تنزيل النسخة الاحتياطية");
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const snapshot = JSON.parse(String(reader.result));
        if (!snapshot?.version || !Array.isArray(snapshot.attendees)) throw new Error("صيغة النسخة غير صحيحة");
        if (window.confirm("سيتم إضافة العناصر غير الموجودة فقط ولن يتم حذف بيانات حالية. هل تريد المتابعة؟")) restore.mutate({ snapshot, confirm: true });
      } catch (error) { toast.error(error instanceof Error ? error.message : "تعذر قراءة النسخة الاحتياطية"); }
      finally { if (backupInputRef.current) backupInputRef.current.value = ""; }
    };
    reader.readAsText(file);
  };

  return <div className="space-y-5"><div><VisualEditable id="operations-page-title" tag="text" label="عنوان صفحة التشغيل" as="h2" defaultText={showBackup ? "الإشعارات والنسخ الاحتياطي" : "إشعارات الفعالية"} className="text-xl font-black text-amber-100" /><VisualEditable id="operations-page-subtitle" tag="text" label="وصف صفحة التشغيل" as="p" defaultText={showBackup ? "أنشئ رسائل تشغيلية واحفظ نسخة JSON قابلة للاسترجاع دون حذف البيانات الحالية." : "أنشئ رسائل تشغيلية لهذه الفعالية فقط وتابع حملاتها من مكان واحد."} className="mt-1 text-sm text-slate-400" /></div><div className={showBackup ? "grid lg:grid-cols-2 gap-5" : "grid gap-5"}><VisualEditable id="operations-notification-section" tag="section" label="قسم إنشاء الإشعار" as="section" className="card-dark rounded-2xl border p-5" style={{ borderColor: "oklch(25% 0.02 250)" }}><div className="flex items-center gap-2 text-amber-200 mb-4"><BellRing size={18} /><VisualEditable id="operations-notification-title" tag="text" label="عنوان إنشاء الإشعار" as="h3" defaultText="حملة تواصل جديدة" className="font-bold" /></div><div className="space-y-3"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان الرسالة" className="w-full rounded-xl bg-black/40 border border-slate-700 px-3 py-2.5 text-slate-100" /><textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="اكتب محتوى الرسالة..." rows={4} className="w-full rounded-xl bg-black/40 border border-slate-700 px-3 py-2.5 text-slate-100" /><div className="grid grid-cols-2 gap-3"><select value={audience} onChange={(e) => setAudience(e.target.value as typeof audience)} className="rounded-xl bg-black/40 border border-slate-700 px-3 py-2 text-xs text-slate-300"><option value="all">كل الضيوف</option><option value="unpaid">غير المدفوعين</option><option value="absent">غير الحاضرين</option><option value="attended">الحاضرين</option></select><div className="rounded-xl bg-emerald-400/10 border border-emerald-400/20 px-3 py-2 text-xs text-emerald-300 flex items-center">داخل النظام فقط</div></div><button disabled={createNotification.isPending || !title.trim() || !message.trim()} onClick={() => createNotification.mutate({ ceremonyId, title, message, audience, channel })} className="w-full rounded-xl py-2.5 font-bold text-amber-950 disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: "var(--gold-gradient)" }}>{createNotification.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} حفظ وإضافة لقائمة الإرسال</button></div></VisualEditable>{showBackup && <VisualEditable id="operations-backup-section" tag="section" label="قسم النسخ الاحتياطي" as="section" className="card-dark rounded-2xl border p-5" style={{ borderColor: "oklch(25% 0.02 250)" }}><div className="flex items-center gap-2 text-amber-200 mb-4"><DatabaseBackup size={18} /><VisualEditable id="operations-backup-title" tag="text" label="عنوان النسخ الاحتياطي" as="h3" defaultText="النسخ الاحتياطي والاسترجاع" className="font-bold" /></div><p className="text-xs text-slate-500 leading-6 mb-4">يحتوي الملف على بيانات الفعاليات والضيوف والإعدادات وحملات الإشعارات. الاسترجاع يضيف العناصر غير الموجودة فقط ولا يحذف السجلات الحالية.</p><div className="grid grid-cols-2 gap-3"><button onClick={exportBackup} className="rounded-xl py-3 border border-slate-700 text-sm text-slate-200 flex items-center justify-center gap-2 hover:bg-slate-800"><Download size={16} /> تنزيل نسخة</button><input ref={backupInputRef} onChange={handleRestore} type="file" accept="application/json,.json" className="hidden" /><button onClick={() => backupInputRef.current?.click()} disabled={restore.isPending} className="rounded-xl py-3 border border-slate-700 text-sm text-slate-200 flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50"><FileUp size={16} /> استرجاع نسخة</button></div><div className="mt-4 rounded-xl bg-emerald-400/10 border border-emerald-400/20 p-3 text-xs text-emerald-300 flex gap-2"><ShieldCheck size={15} className="shrink-0" />الاسترجاع غير مدمر ويُسجل تلقائياً في سجل النشاط.</div></VisualEditable>}</div><VisualEditable id="operations-history-section" tag="section" label="قسم سجل حملات التواصل" as="section" className="card-dark rounded-2xl border overflow-hidden" style={{ borderColor: "oklch(25% 0.02 250)" }}><div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between"><VisualEditable id="operations-history-title" tag="text" label="عنوان سجل حملات التواصل" as="h3" defaultText="سجل حملات التواصل" className="font-bold text-amber-100" /><span className="text-xs text-slate-500">{notifications.data?.length ?? 0} حملة</span></div>{notifications.isLoading ? <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-amber-300" /></div> : notifications.data?.length ? <div className="divide-y divide-slate-800/70">{notifications.data.map((item) => <div key={item.id} className="p-4 flex flex-wrap gap-3 items-center"><div className="flex-1 min-w-[220px]"><div className="font-bold text-slate-100">{item.title}</div><div className="text-xs text-slate-500 mt-1">{item.message}</div></div><span className="text-xs text-amber-300">{item.recipientCount} مستلم</span><span className="text-xs text-slate-500">{item.channel} · {item.status}</span>{item.status !== "sent" && <button onClick={() => publishNotification.mutate({ id: item.id })} disabled={publishNotification.isPending} className="text-xs rounded-lg border border-emerald-400/30 px-2.5 py-1 text-emerald-300 hover:bg-emerald-400/10">نشر داخل النظام</button>}</div>)}</div> : <div className="p-8 text-center text-slate-500 text-sm">لا توجد حملات محفوظة.</div>}</VisualEditable></div>;
}
