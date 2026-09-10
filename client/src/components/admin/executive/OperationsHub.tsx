import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  MessageCircle,
  Phone,
  Trash2,
  FileSpreadsheet,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  Sliders,
  AlertCircle,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TuitionFeesContentManager } from "@/components/admin/content/TuitionFeesContentManager";

interface LeadItem {
  id: number;
  studentName: string;
  guardianName: string;
  phone: string;
  email?: string | null;
  gradeLevel: string;
  track?: string | null;
  gender?: string | null;
  status?: string | null;
  notes?: string | null;
  createdAt?: any;
}

interface OperationsHubProps {
  dark: boolean;
  leads: LeadItem[];
  isLoadingLeads: boolean;
  onUpdateLeadStatus?: (id: number, status: string) => Promise<void> | void;
  onDeleteLead?: (id: number) => Promise<void> | void;
  orchestration: any;
  onSaveOrchestration: (updated: any) => Promise<void>;
  isSaving: boolean;
}

export function OperationsHub({
  dark,
  leads = [],
  isLoadingLeads,
  onUpdateLeadStatus,
  onDeleteLead,
  orchestration,
  onSaveOrchestration,
  isSaving,
}: OperationsHubProps) {
  const [subTab, setSubTab] = useState<"inbox" | "fees" | "settings">("inbox");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [trackFilter, setTrackFilter] = useState<string>("all");

  // Registration switch states
  const currentAdm = orchestration?.admissionsSettings || {};
  const [isOpen, setIsOpen] = useState(currentAdm.isOpen !== undefined ? currentAdm.isOpen : true);
  const [closedNoticeText, setClosedNoticeText] = useState(
    currentAdm.closedNoticeText || "تم اكتمال المقاعد للعام الدراسي الحالي. بإمكانكم تسجيل بياناتكم في قائمة الانتظار."
  );

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        lead.studentName.toLowerCase().includes(q) ||
        lead.guardianName.toLowerCase().includes(q) ||
        lead.phone.includes(q);

      const matchesStatus =
        statusFilter === "all" || (lead.status || "new") === statusFilter;

      const matchesTrack =
        trackFilter === "all" || (lead.track || "national") === trackFilter;

      return matchesSearch && matchesStatus && matchesTrack;
    });
  }, [leads, searchQuery, statusFilter, trackFilter]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredLeads.length === 0) {
      toast.error("لا توجد طلبات لتصديرها");
      return;
    }
    const headers = ["رقم الطلب", "اسم الطالب", "ولي الأمر", "الجوال", "المرحلة", "المسار", "الحالة", "تاريخ التقديم"];
    const rows = filteredLeads.map((l) => [
      l.id,
      l.studentName,
      l.guardianName,
      l.phone,
      l.gradeLevel,
      l.track === "international" ? "المسار الدولي" : "المسار الأهلي",
      l.status || "جديد",
      l.createdAt ? new Date(l.createdAt).toLocaleDateString("ar-SA") : "",
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `طلبات_تسجيل_مدارس_العقيق_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("تم تصدير كشف الطلبات بنجاح");
  };

  return (
    <div className="space-y-6">
      {/* Hub Top Bar & Navigation */}
      <div className={`p-4 sm:p-5 rounded-3xl border flex flex-wrap items-center justify-between gap-4 ${
        dark ? "border-white/10 bg-[#0c1015]" : "border-black/10 bg-white shadow-xs"
      }`}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <GraduationCap size={20} />
          </div>
          <div>
            <h2 className="text-base font-black">شؤون القبول والتسجيل (Admissions CRM) 📥</h2>
            <p className="text-xs text-slate-400 font-bold">
              متابعة وفرز طلبات أولياء الأمور، التواصل الفوري عبر واتساب، وضوابط استقبال الطلبات
            </p>
          </div>
        </div>

        {/* Sub-tab Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-current/10">
          <button
            type="button"
            onClick={() => setSubTab("inbox")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              subTab === "inbox"
                ? dark ? "bg-[#f8ca14] text-black shadow" : "bg-[#08467d] text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>طلبات التسجيل الواردة 📥</span>
            <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">{leads.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab("settings")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              subTab === "settings"
                ? dark ? "bg-[#f8ca14] text-black shadow" : "bg-[#08467d] text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            ضوابط القبول والمقاعد ⚙️
          </button>
        </div>
      </div>

      {/* SUBTAB 1: LEADS INBOX */}
      {subTab === "inbox" && (
        <div className="space-y-4">
          {/* Controls & Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Search */}
            <div className={`flex items-center gap-2 rounded-2xl border px-3.5 py-2 w-full sm:w-72 ${
              dark ? "border-white/10 bg-white/[0.03]" : "border-black/10 bg-white"
            }`}>
              <Search size={14} className="text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث باسم الطالب أو ولي الأمر..."
                className="bg-transparent text-xs font-bold outline-none w-full placeholder:text-slate-500"
              />
            </div>

            {/* Filter buttons & Export */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Track filter */}
              <select
                value={trackFilter}
                onChange={(e) => setTrackFilter(e.target.value)}
                className={`rounded-xl border px-3 py-2 text-xs font-bold outline-none ${
                  dark ? "border-white/10 bg-[#12161f] text-white" : "border-black/10 bg-white text-slate-800"
                }`}
              >
                <option value="all">كافة المسارات</option>
                <option value="national">المسار الأهلي</option>
                <option value="international">المسار الدولي</option>
              </select>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`rounded-xl border px-3 py-2 text-xs font-bold outline-none ${
                  dark ? "border-white/10 bg-[#12161f] text-white" : "border-black/10 bg-white text-slate-800"
                }`}
              >
                <option value="all">جميع الحالات</option>
                <option value="new">جديد ⚡</option>
                <option value="contacted">تم التواصل 📞</option>
                <option value="interview">موعد مقابلة 🗓️</option>
                <option value="accepted">مقبول ومسدد 🎓</option>
                <option value="archived">مؤرشف 📁</option>
              </select>

              <Button
                type="button"
                onClick={handleExportCSV}
                className="rounded-xl font-black text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <Download size={13} />
                <span>تصدير Excel/CSV</span>
              </Button>
            </div>
          </div>

          {/* Leads Grid/List */}
          {isLoadingLeads ? (
            <div className="p-12 text-center text-slate-400 font-bold text-xs animate-pulse">
              جاري تحميل طلبات التسجيل...
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className={`p-12 rounded-3xl border text-center ${dark ? "border-white/10 bg-white/[0.02]" : "border-black/10 bg-slate-50"}`}>
              <Users size={32} className="mx-auto text-slate-500 mb-2 opacity-50" />
              <h4 className="text-sm font-black">لا توجد طلبات تسجيل مطابقة</h4>
              <p className="text-xs text-slate-400 font-bold mt-1">جرب تغيير معايير البحث أو الفلترة</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredLeads.map((lead) => {
                const isInter = lead.track === "international";
                const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
                const waNumber = cleanPhone.startsWith("0") ? "966" + cleanPhone.substring(1) : cleanPhone;
                const waText = encodeURIComponent(
                  `السلام عليكم ورحمة الله وبركاته،
نرحب بكم من إدارة القبول والتسجيل بمدارس العقيق الأهلية والدولية بشأن طلب تسجيل الطالب/ـة (${lead.studentName}) في (${lead.gradeLevel}).`
                );

                return (
                  <div
                    key={lead.id}
                    className={`p-4 rounded-2xl border transition-all duration-200 ${
                      dark
                        ? "border-white/10 bg-[#0d1218] hover:border-amber-500/30"
                        : "border-black/10 bg-white hover:border-blue-500/30 shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div>
                        <h4 className="text-sm font-black text-white">{lead.studentName}</h4>
                        <p className="text-xs text-slate-400 font-bold mt-0.5">ولي الأمر: {lead.guardianName}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${
                        isInter
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}>
                        {isInter ? "مسار دولي" : "مسار أهلي"}
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] font-bold text-slate-400 mb-3.5 border-y border-current/5 py-2">
                      <div className="flex items-center justify-between">
                        <span>المرحلة:</span>
                        <span className="text-white">{lead.gradeLevel}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>الجوال:</span>
                        <span className="font-mono text-white" dir="ltr">{lead.phone}</span>
                      </div>
                      {lead.createdAt && (
                        <div className="flex items-center justify-between text-[10px]">
                          <span>تاريخ التقديم:</span>
                          <span>{new Date(lead.createdAt).toLocaleDateString("ar-SA")}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-2">
                      {/* WhatsApp One Click */}
                      <a
                        href={`https://wa.me/${waNumber}?text=${waText}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] py-1.5 transition"
                      >
                        <MessageCircle size={13} />
                        <span>مراسلة واتساب</span>
                      </a>

                      {/* Direct Call */}
                      <a
                        href={`tel:${lead.phone}`}
                        className={`p-2 rounded-xl border transition ${
                          dark ? "border-white/10 hover:bg-white/10 text-slate-300" : "border-black/10 hover:bg-slate-100 text-slate-700"
                        }`}
                        title="اتصال هاتفي"
                      >
                        <Phone size={13} />
                      </a>

                      {/* Delete */}
                      {onDeleteLead && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`هل أنت متأكد من حذف طلب الطالب (${lead.studentName})؟`)) {
                              onDeleteLead(lead.id);
                            }
                          }}
                          className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                          title="حذف الطلب"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: TUITION FEES MATRIX */}
      {subTab === "fees" && (
        <TuitionFeesContentManager
          dark={dark}
          orchestration={orchestration}
          onSave={onSaveOrchestration}
          isSaving={isSaving}
        />
      )}

      {/* SUBTAB 3: ADMISSIONS SETTINGS & CAPACITY */}
      {subTab === "settings" && (
        <div className={`p-6 rounded-3xl border space-y-6 ${
          dark ? "border-white/10 bg-[#0d1218]" : "border-black/10 bg-white shadow-xs"
        }`}>
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-current/10">
            <div>
              <h3 className="text-base font-black">ضوابط وحالة استقبال طلبات التسجيل الإلكتروني</h3>
              <p className="text-xs text-slate-400 font-bold mt-0.5">
                التحكم المباشر في إتاحة نموذج التقديم لأولياء الأمور أو إغلاقه مع رسالة الاعتذار الرسمية
              </p>
            </div>

            <Button
              type="button"
              onClick={async () => {
                await onSaveOrchestration({
                  admissionsSettings: {
                    ...currentAdm,
                    isOpen,
                    closedNoticeText,
                  },
                });
                toast.success("تم تحديث ضوابط القبول بنجاح");
              }}
              disabled={isSaving}
              className="rounded-xl font-black text-xs px-5 bg-amber-500 hover:bg-amber-400 text-black"
            >
              {isSaving ? "جاري الحفظ..." : "حفظ الضوابط 💾"}
            </Button>
          </div>

          {/* Switch */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-current/10">
            <div>
              <h4 className="text-sm font-black">استقبال طلبات التسجيل الآن</h4>
              <p className="text-xs text-slate-400 font-bold mt-0.5">
                {isOpen ? "النموذج متاح حالياً ويستقبل بيانات الطلاب" : "التسجيل مغلق وتظهر رسالة الاعتذار للزوار"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                isOpen ? "bg-emerald-500" : "bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow transition ease-in-out duration-200 ${
                  isOpen ? "translate-x-0" : "-translate-x-5"
                }`}
              />
            </button>
          </div>

          {/* Notice text */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-300 block">
              رسالة التنبيه التي تظهر لأولياء الأمور عند إغلاق التسجيل أو اكتمال المقاعد:
            </label>
            <textarea
              rows={3}
              value={closedNoticeText}
              onChange={(e) => setClosedNoticeText(e.target.value)}
              className={`w-full rounded-2xl border p-4 text-xs font-bold outline-none leading-relaxed ${
                dark ? "border-white/10 bg-white/5 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
