import React, { useState } from "react";
import { Save, DollarSign, Percent, Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface TuitionFeesContentManagerProps {
  dark?: boolean;
  orchestration: any;
  onSave: (updatedOrchestration: any) => Promise<void>;
  isSaving: boolean;
}

export function TuitionFeesContentManager({
  dark = true,
  orchestration,
  onSave,
  isSaving,
}: TuitionFeesContentManagerProps) {
  const currentAdm = orchestration?.admissionsSettings || {};

  // States
  const [isOpen, setIsOpen] = useState(currentAdm.isOpen !== undefined ? currentAdm.isOpen : true);
  const [closedNoticeText, setClosedNoticeText] = useState(
    currentAdm.closedNoticeText || "تم اكتمال المقاعد للعام الدراسي الحالي. بإمكانكم تسجيل بياناتكم في قائمة الانتظار."
  );
  const [siblingDiscountFirst, setSiblingDiscountFirst] = useState(currentAdm.siblingDiscountFirst ?? 10);
  const [siblingDiscountSecond, setSiblingDiscountSecond] = useState(currentAdm.siblingDiscountSecond ?? 15);
  const [earlyPaymentDiscount, setEarlyPaymentDiscount] = useState(currentAdm.earlyPaymentDiscount ?? 5);

  const [tuitionFees, setTuitionFees] = useState<any[]>(
    currentAdm.tuitionFees && currentAdm.tuitionFees.length > 0
      ? currentAdm.tuitionFees
      : [
          { gradeLevel: "رياض الأطفال (KG1 - KG3)", nationalAnnual: 14500, internationalAnnual: 18500 },
          { gradeLevel: "المرحلة الابتدائية (صفوف 1 - 3)", nationalAnnual: 16800, internationalAnnual: 21500 },
          { gradeLevel: "المرحلة الابتدائية العليا (صفوف 4 - 6)", nationalAnnual: 17500, internationalAnnual: 22500 },
          { gradeLevel: "المرحلة المتوسطة (صفوف 7 - 9)", nationalAnnual: 19500, internationalAnnual: 24500 },
          { gradeLevel: "المرحلة الثانوية مسارات (صفوف 10 - 12)", nationalAnnual: 22000, internationalAnnual: 27500 },
        ]
  );

  const handleSaveFees = async () => {
    try {
      const updatedAdmissionsSettings = {
        ...currentAdm,
        isOpen,
        closedNoticeText,
        siblingDiscountFirst: Number(siblingDiscountFirst) || 0,
        siblingDiscountSecond: Number(siblingDiscountSecond) || 0,
        earlyPaymentDiscount: Number(earlyPaymentDiscount) || 0,
        tuitionFees,
      };

      await onSave({
        ...orchestration,
        admissionsSettings: updatedAdmissionsSettings,
      });
      toast.success("✅ تم حفظ وتحديث مصفوفة الرسوم وقواعد الخصومات بنجاح");
    } catch {
      toast.error("حدث خطأ أثناء حفظ التعديلات");
    }
  };

  const handleUpdateFee = (idx: number, field: "nationalAnnual" | "internationalAnnual", val: number) => {
    const updated = [...tuitionFees];
    updated[idx] = { ...updated[idx], [field]: val };
    setTuitionFees(updated);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4 border-current/10">
        <div>
          <h3 className="text-lg font-black flex items-center gap-2">
            <DollarSign size={20} className="text-[#f8ca14]" />
            <span>مصفوفة الرسوم المدرسية وقواعد الخصومات (Tuition & Fees Engine)</span>
          </h3>
          <p className="text-xs font-bold text-slate-400 mt-1">
            التحكم في رسوم المسارين الوطني والدولي لكل مرحلة، ونسب الخصم التلقائية في حاسبة الرسوم
          </p>
        </div>

        <Button
          type="button"
          onClick={handleSaveFees}
          disabled={isSaving}
          className="rounded-2xl bg-[#f8ca14] hover:bg-yellow-400 text-black font-black text-xs px-6 py-2.5 shadow-lg shadow-[#f8ca14]/20 gap-2 cursor-pointer"
        >
          <Save size={16} />
          <span>{isSaving ? "جاري الحفظ..." : "حفظ وتثبيت التعديلات"}</span>
        </Button>
      </div>

      {/* SECTION 1: ADMISSIONS STATUS & DISCOUNTS */}
      <div className={`rounded-3xl border p-6 space-y-6 ${dark ? "bg-black/30 border-white/10" : "bg-white border-black/10 shadow-sm"}`}>
        <div className="flex items-center justify-between border-b pb-3 border-current/10">
          <div className="flex items-center gap-2">
            <Percent size={18} className="text-emerald-400" />
            <h4 className="text-sm font-black">حالة التسجيل ونسب الخصم المعتمدة</h4>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              isOpen ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-red-500/15 text-red-400 border border-red-500/30"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${isOpen ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
            <span>{isOpen ? "باب القبول والتسجيل متاح الآن" : "التسجيل مغلق حالياً"}</span>
          </button>
        </div>

        {!isOpen && (
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">رسالة التنبيه عند إغلاق التسجيل</label>
            <input
              type="text"
              value={closedNoticeText}
              onChange={(e) => setClosedNoticeText(e.target.value)}
              className="w-full rounded-xl border border-current/15 bg-transparent p-2.5 text-xs font-bold outline-none"
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">خصم الشقيق الأول (%)</label>
            <input
              type="number"
              value={siblingDiscountFirst}
              onChange={(e) => setSiblingDiscountFirst(Number(e.target.value))}
              className="w-full rounded-xl border border-current/15 bg-transparent p-2.5 text-xs font-black outline-none"
            />
            <span className="text-[10px] text-slate-500 block mt-1">يُطبق تلقائياً على الطالب الثاني</span>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">خصم الشقيق الثاني فأكثر (%)</label>
            <input
              type="number"
              value={siblingDiscountSecond}
              onChange={(e) => setSiblingDiscountSecond(Number(e.target.value))}
              className="w-full rounded-xl border border-current/15 bg-transparent p-2.5 text-xs font-black outline-none"
            />
            <span className="text-[10px] text-slate-500 block mt-1">يُطبق على الابن الثالث فما فوق</span>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">خصم السداد المبكر / الكاش (%)</label>
            <input
              type="number"
              value={earlyPaymentDiscount}
              onChange={(e) => setEarlyPaymentDiscount(Number(e.target.value))}
              className="w-full rounded-xl border border-current/15 bg-transparent p-2.5 text-xs font-black outline-none"
            />
            <span className="text-[10px] text-slate-500 block mt-1">يُخصم عند سداد الرسوم دفعة واحدة</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: TUITION FEES MATRIX */}
      <div className={`rounded-3xl border p-6 space-y-4 ${dark ? "bg-black/30 border-white/10" : "bg-white border-black/10 shadow-sm"}`}>
        <div className="flex items-center gap-2 border-b pb-3 border-current/10">
          <DollarSign size={18} className="text-[#f8ca14]" />
          <div>
            <h4 className="text-sm font-black">جدول الرسوم السنوية المعتمدة لكل مرحلة (ريال سعودي)</h4>
            <p className="text-[11px] text-slate-400">أي تعديل هنا ينعكس فوراً على جداول صفحة القبول وحاسبة الأقساط</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-current/10 text-slate-400 text-[11px] font-black">
                <th className="py-3 px-2">المرحلة الدراسية</th>
                <th className="py-3 px-2">المسار الوطني (سنوي)</th>
                <th className="py-3 px-2">المسار الدولي (سنوي)</th>
                <th className="py-3 px-2 text-left">قسط الفصل (وطني)</th>
                <th className="py-3 px-2 text-left">قسط الفصل (دولي)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-current/5">
              {tuitionFees.map((tier, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition">
                  <td className="py-3 px-2 font-black text-slate-200">
                    {tier.gradeLevel}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={tier.nationalAnnual}
                        onChange={(e) => handleUpdateFee(idx, "nationalAnnual", Number(e.target.value) || 0)}
                        className="w-28 rounded-xl border border-current/15 bg-transparent p-2 text-xs font-black outline-none text-emerald-400"
                      />
                      <span className="text-[10px] text-slate-400">ر.س</span>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={tier.internationalAnnual}
                        onChange={(e) => handleUpdateFee(idx, "internationalAnnual", Number(e.target.value) || 0)}
                        className="w-28 rounded-xl border border-current/15 bg-transparent p-2 text-xs font-black outline-none text-blue-400"
                      />
                      <span className="text-[10px] text-slate-400">ر.س</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-left font-bold text-slate-400">
                    {Math.round((tier.nationalAnnual || 0) / 3).toLocaleString()} ر.س
                  </td>
                  <td className="py-3 px-2 text-left font-bold text-slate-400">
                    {Math.round((tier.internationalAnnual || 0) / 3).toLocaleString()} ر.س
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
