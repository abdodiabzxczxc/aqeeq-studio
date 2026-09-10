import React, { useState } from "react";
import { Search, RotateCcw, Edit3, Check, Sparkles, Filter } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface OverrideItem {
  id: string;
  page: string;
  label: string;
  type: "text" | "image" | "section";
  currentValue: string;
  defaultValue: string;
  updatedAt?: string;
}

export function VisualOverridesInspector({ dark = true }: { dark?: boolean }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPage, setSelectedPage] = useState<string>("all");
  const [editingItem, setEditingItem] = useState<OverrideItem | null>(null);
  const [editText, setEditText] = useState("");

  // Sample items representing active visual overrides across the site
  const [overrides, setOverrides] = useState<OverrideItem[]>([
    {
      id: "home-hero-title",
      page: "الرئيسية",
      label: "عنوان الهيرو الرئيسي",
      type: "text",
      currentValue: "صرح تعليمي يبني جيل الغد بأحدث المعايير العالمية",
      defaultValue: "مدارس العقيق الأهلية والدولية بالمدينة المنورة",
      updatedAt: "منذ ساعتين",
    },
    {
      id: "about-mission-statement",
      page: "مدارسنا",
      label: "رسالة مدارس العقيق",
      type: "text",
      currentValue: "تقديم تعليم استثنائي يعزز القيم الوطنية والابتكار الأكاديمي",
      defaultValue: "رسالتنا هي ريادة التعليم المتميز في منطقة المدينة المنورة",
      updatedAt: "منذ يومين",
    },
    {
      id: "admissions-banner-note",
      page: "القبول والتسجيل",
      label: "تنبيه التسجيل المبكر",
      type: "text",
      currentValue: "خصم 10% للتسجيل المبكر مستمر حتى نهاية الشهر الجاري",
      defaultValue: "التسجيل متاح لجميع المراحل الدراسية بنين وبنات",
      updatedAt: "منذ 3 أيام",
    },
    {
      id: "accreditations-cognia-score",
      page: "الاعتمادات",
      label: "درجة تقييم كوجنيا",
      type: "text",
      currentValue: "تقييم امتياز بمعدل 348 من 400 نقطة",
      defaultValue: "معتمدة دولياً من منظمة Cognia الأمريكية",
      updatedAt: "منذ أسبوع",
    },
  ]);

  const handleReset = (id: string, defVal: string) => {
    setOverrides((prev) =>
      prev.map((item) => (item.id === id ? { ...item, currentValue: defVal } : item))
    );
    toast.success("تمت استعادة النص الأصلي بنجاح!");
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    setOverrides((prev) =>
      prev.map((item) => (item.id === editingItem.id ? { ...item, currentValue: editText } : item))
    );
    toast.success("تم حفظ التعديل بنجاح وربطه بالموقع!");
    setEditingItem(null);
  };

  const filtered = overrides.filter((item) => {
    const matchesSearch =
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.currentValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPage = selectedPage === "all" ? true : item.page === selectedPage;
    return matchesSearch && matchesPage;
  });

  return (
    <div
      className={`rounded-3xl border p-6 shadow-2xl transition-all ${
        dark ? "bg-[#0b0f19] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
      }`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-current/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🔍</span>
            <h3 className="text-xl font-black">مفتش التعديلات البصرية المركزي (Visual Overrides)</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            سجل موحد وشامل لكل كلمة وصورة تم تعديلها عبر المحرر البصري في كامل الموقع، مع إمكانية التعديل السريع أو استعادة الأصل.
          </p>
        </div>

        <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-400/10 text-amber-400 border border-amber-400/25">
          {overrides.length} تعديل نشط
        </span>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="بحث في أسماء العناصر والنصوص المعدلة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full rounded-xl border py-2 pr-9 pl-3 text-xs font-bold outline-none ${
              dark ? "border-white/10 bg-black/40 text-white" : "border-slate-200 bg-slate-50 text-slate-900"
            }`}
          />
        </div>

        {/* Page Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {["all", "الرئيسية", "مدارسنا", "القبول والتسجيل", "الاعتمادات"].map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPage(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedPage === p
                  ? dark
                    ? "bg-[#f8ca14] text-black"
                    : "bg-[#08467d] text-white"
                  : dark
                  ? "bg-white/5 text-slate-400 hover:text-white"
                  : "bg-slate-100 text-slate-600 hover:text-black"
              }`}
            >
              {p === "all" ? "جميع الصفحات" : p}
            </button>
          ))}
        </div>
      </div>

      {/* Overrides Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className={`border-b ${dark ? "border-white/10 text-slate-400" : "border-slate-200 text-slate-500"}`}>
              <th className="py-3 px-4 font-black">الصفحة والعنصر</th>
              <th className="py-3 px-4 font-black">النص المعدل حالياً (Active Override)</th>
              <th className="py-3 px-4 font-black">النص الافتراضي الأصلي (Default)</th>
              <th className="py-3 px-4 font-black">آخر تحديث</th>
              <th className="py-3 px-4 font-black text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-current/5">
            {filtered.map((item) => (
              <tr
                key={item.id}
                className={`transition ${
                  dark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50"
                }`}
              >
                <td className="py-3.5 px-4">
                  <div className="font-black text-sm">{item.label}</div>
                  <div className="font-mono text-[10px] text-slate-400 mt-0.5">{item.id}</div>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/10">
                    {item.page}
                  </span>
                </td>

                <td className="py-3.5 px-4 max-w-xs">
                  <p className="font-bold text-amber-200 line-clamp-2">{item.currentValue}</p>
                </td>

                <td className="py-3.5 px-4 max-w-xs text-slate-400">
                  <p className="line-clamp-2 opacity-75">{item.defaultValue}</p>
                </td>

                <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">{item.updatedAt}</td>

                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setEditText(item.currentValue);
                      }}
                      className="p-2 rounded-xl bg-amber-400/15 hover:bg-amber-400/30 text-amber-400 transition"
                      title="تعديل فوري للنص"
                    >
                      <Edit3 size={14} />
                    </button>

                    <button
                      onClick={() => handleReset(item.id, item.defaultValue)}
                      className="p-2 rounded-xl bg-red-400/10 hover:bg-red-400/25 text-red-400 transition"
                      title="استعادة النص الأصلي"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Inline Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div
            className={`max-w-lg w-full p-6 rounded-3xl border shadow-2xl ${
              dark ? "bg-[#111622] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <h4 className="text-lg font-black mb-1">تعديل النص: {editingItem.label}</h4>
            <p className="text-xs text-slate-400 mb-4">في صفحة {editingItem.page} ({editingItem.id})</p>

            <textarea
              rows={4}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className={`w-full rounded-2xl border p-3 text-xs font-bold outline-none leading-relaxed ${
                dark ? "border-white/10 bg-black/40 text-white" : "border-slate-200 bg-slate-50 text-slate-900"
              }`}
            />

            <div className="flex gap-2 justify-end mt-4">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl border border-current/20 text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-amber-400 text-black font-black text-xs hover:bg-amber-500 transition"
              >
                حفظ التعديل الآن 💾
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
