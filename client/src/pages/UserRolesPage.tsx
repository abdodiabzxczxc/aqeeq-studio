import { ShieldCheck, UserCog, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "../lib/trpc";
import { VisualEditable } from "../components/VisualEditor";

const roles = [
  { value: "admin", label: "مدير النظام", description: "إدارة كاملة للمنصة والفعاليات والصلاحيات" },
  { value: "receptionist", label: "موظف استقبال", description: "تشغيل بوابة المسح والتحقق من الدعوات" },
  { value: "coordinator", label: "منسق الفعالية", description: "متابعة الضيوف والإحصائيات والتجهيزات" },
  { value: "auditor", label: "مراجع", description: "قراءة سجل النشاط والتقارير دون تعديل البيانات" },
  { value: "user", label: "مستخدم عادي", description: "وصول عام محدود حسب الصفحة" },
] as const;

type Role = typeof roles[number]["value"];

export default function UserRolesPage() {
  const users = trpc.users.list.useQuery();
  const utils = trpc.useUtils();
  const updateRole = trpc.users.updateRole.useMutation({
    onSuccess: () => { toast.success("تم تحديث صلاحية المستخدم"); utils.users.list.invalidate(); },
    onError: (error) => toast.error(error.message),
  });

  return (
    <div className="space-y-5">
      <VisualEditable id="roles-header-section" tag="section" label="ترويسة الفريق والصلاحيات" as="section">
        <VisualEditable id="roles-title" tag="text" label="عنوان الفريق والصلاحيات" as="h2" defaultText="المستخدمون والصلاحيات" className="text-xl font-black text-amber-100" />
        <VisualEditable id="roles-subtitle" tag="text" label="وصف الفريق والصلاحيات" as="p" defaultText="حدد مستوى الوصول لكل عضو من فريق تشغيل الفعالية مع تسجيل كل تغيير في سجل النشاط." className="mt-1 text-sm text-slate-400" />
      </VisualEditable>
      <div className="grid gap-3">
        {users.isLoading ? (
          <div className="card-dark rounded-2xl p-10 text-center text-slate-400"><Loader2 className="animate-spin mx-auto" /></div>
        ) : users.data?.length ? (
          users.data.map((person) => (
            <div key={person.id} className="card-dark rounded-2xl border p-4 flex flex-col lg:flex-row lg:items-center gap-4" style={{ borderColor: "oklch(25% 0.02 250)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-amber-300" style={{ background: "oklch(66% 0.20 70 / 0.12)" }}><UserCog size={19} /></div>
              <div className="flex-1 min-w-0"><div className="font-bold text-slate-100 truncate">{person.name || "مستخدم بلا اسم"}</div><div className="text-xs text-slate-500 mt-1">{person.email || "بدون بريد إلكتروني"} · آخر دخول: {person.lastSignedIn ? new Date(person.lastSignedIn).toLocaleString("ar-SA") : "غير متوفر"}</div></div>
              <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-amber-400" /><select value={person.role} disabled={updateRole.isPending} onChange={(e) => updateRole.mutate({ id: person.id, role: e.target.value as Role })} className="bg-black/40 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200">{roles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select></div>
              <div className="text-xs text-slate-500 lg:w-64">{roles.find((role) => role.value === person.role)?.description}</div>
            </div>
          ))
        ) : (
          <div className="card-dark rounded-2xl p-8 text-center text-slate-500">لا يوجد مستخدمون مضافون بعد.</div>
        )}
      </div>
    </div>
  );
}
