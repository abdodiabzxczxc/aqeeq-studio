import React, { useState } from "react";
import { Plus, Trash2, Save, ShieldCheck, Trophy, Award, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface AccreditationsContentManagerProps {
  dark?: boolean;
  orchestration: any;
  onSave: (updatedOrchestration: any) => Promise<void>;
  isSaving: boolean;
}

export function AccreditationsContentManager({
  dark = true,
  orchestration,
  onSave,
  isSaving,
}: AccreditationsContentManagerProps) {
  const currentCfg = orchestration?.accreditationsConfig || {};

  // Form state
  const [cogniaScore, setCogniaScore] = useState(currentCfg.cogniaScore || "99.2%");
  const [cogniaValidUntil, setCogniaValidUntil] = useState(currentCfg.cogniaValidUntil || "2028");
  const [ieltsVenueCode, setIeltsVenueCode] = useState(currentCfg.ieltsVenueCode || "IDP Venue Madinah");
  const [satCenterCode, setSatCenterCode] = useState(currentCfg.satCenterCode || "#68412");

  const [accreditationsList, setAccreditationsList] = useState<any[]>(
    currentCfg.accreditationsList && currentCfg.accreditationsList.length > 0
      ? currentCfg.accreditationsList
      : [
          {
            id: "acc-cognia",
            title: "اعتماد كوجنيا الأمريكية Cognia",
            org: "Cognia Global Commission - USA",
            badge: "تقييم امتياز 99.2%",
            desc: "أعلى اعتماد أمريكي لجودة التعليم ومخرجات المناهج الدولية المعتمدة عالمياً.",
          },
          {
            id: "acc-ielts",
            title: "مركز اختبارات آيلتس IELTS المعتمد",
            org: "IDP Education Australia",
            badge: "مقر رسمي وحاسوبي",
            desc: "المركز الرسمي المعتمد بالمدينة المنورة لإجراء اختبارات IELTS الحاسوبية والورقية.",
          },
          {
            id: "acc-sat",
            title: "مركز اختبارات السات SAT و ACT",
            org: "College Board USA",
            badge: "كود رسمي #68412",
            desc: "مركز معتمد لاختبارات القبول الجامعي الدولي والمسارات الأكاديمية الأمريكية.",
          },
        ]
  );

  const [awardsList, setAwardsList] = useState<any[]>(
    currentCfg.awardsList && currentCfg.awardsList.length > 0
      ? currentCfg.awardsList
      : [
          {
            id: "award-fll",
            title: "كأس بطولة فيرست ليجو للروبوت بالمملكة",
            rank: "المركز الأول وبطل المملكة 🥇",
            year: "2025 - 2026",
            awardingBody: "الاتحاد السعودي للأمن السيبراني والبرمجة والروبوت",
          },
          {
            id: "award-wro",
            title: "أولمبياد الروبوت العالمي WRO",
            rank: "المركز الخامس على مستوى العالم 🌐",
            year: "2024",
            awardingBody: "World Robot Olympiad International",
          },
        ]
  );

  // New Accreditation Form
  const [newAccTitle, setNewAccTitle] = useState("");
  const [newAccOrg, setNewAccOrg] = useState("");
  const [newAccBadge, setNewAccBadge] = useState("");
  const [newAccDesc, setNewAccDesc] = useState("");
  const [isAddingAcc, setIsAddingAcc] = useState(false);

  // New Award Form
  const [newAwardTitle, setNewAwardTitle] = useState("");
  const [newAwardRank, setNewAwardRank] = useState("");
  const [newAwardYear, setNewAwardYear] = useState("2026");
  const [newAwardBody, setNewAwardBody] = useState("");
  const [isAddingAward, setIsAddingAward] = useState(false);

  // Save handler
  const handleSaveAccreditations = async () => {
    try {
      const updatedConfig = {
        ...currentCfg,
        cogniaScore,
        cogniaValidUntil,
        ieltsVenueCode,
        satCenterCode,
        accreditationsList,
        awardsList,
      };

      await onSave({
        ...orchestration,
        accreditationsConfig: updatedConfig,
      });
      toast.success("✅ تم حفظ وتحديث محتوى الاعتمادات والجوائز بنجاح");
    } catch {
      toast.error("حدث خطأ أثناء حفظ التعديلات");
    }
  };

  const handleAddAcc = () => {
    if (!newAccTitle.trim() || !newAccOrg.trim()) {
      toast.error("يرجى ملء عنوان الاعتماد والجهة المانحة");
      return;
    }
    const item = {
      id: "acc-" + Date.now(),
      title: newAccTitle.trim(),
      org: newAccOrg.trim(),
      badge: newAccBadge.trim() || "معتمد رسمياً",
      desc: newAccDesc.trim() || "شهادة اعتماد وتفوق أكاديمي معتمدة.",
    };
    setAccreditationsList([...accreditationsList, item]);
    setNewAccTitle("");
    setNewAccOrg("");
    setNewAccBadge("");
    setNewAccDesc("");
    setIsAddingAcc(false);
    toast.info("تمت إضافة الاعتماد. اضغط 'حفظ وتثبيت التعديلات' لنشره.");
  };

  const handleDeleteAcc = (id: string) => {
    setAccreditationsList(accreditationsList.filter((a) => a.id !== id));
    toast.info("تم حذف الاعتماد. اضغط 'حفظ وتثبيت التعديلات' لتطبيق الحذف.");
  };

  const handleAddAward = () => {
    if (!newAwardTitle.trim() || !newAwardRank.trim()) {
      toast.error("يرجى ملء اسم الجائزة والمركز المحقق");
      return;
    }
    const item = {
      id: "award-" + Date.now(),
      title: newAwardTitle.trim(),
      rank: newAwardRank.trim(),
      year: newAwardYear.trim(),
      awardingBody: newAwardBody.trim() || "وزارة التعليم",
    };
    setAwardsList([...awardsList, item]);
    setNewAwardTitle("");
    setNewAwardRank("");
    setNewAwardBody("");
    setIsAddingAward(false);
    toast.info("تمت إضافة الجائزة. اضغط 'حفظ وتثبيت التعديلات' لنشرها.");
  };

  const handleDeleteAward = (id: string) => {
    setAwardsList(awardsList.filter((a) => a.id !== id));
    toast.info("تم حذف الجائزة. اضغط 'حفظ وتثبيت التعديلات' لتطبيق الحذف.");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4 border-current/10">
        <div>
          <h3 className="text-lg font-black flex items-center gap-2">
            <ShieldCheck size={20} className="text-[#f8ca14]" />
            <span>إدارة الاعتمادات الرسمية وجوائز التميز (Accreditations Engine)</span>
          </h3>
          <p className="text-xs font-bold text-slate-400 mt-1">
            التحكم في شهادات كوجنيا، مراكز الآيلتس والسات، ودروع وجوائز التكريم والبطولات
          </p>
        </div>

        <Button
          type="button"
          onClick={handleSaveAccreditations}
          disabled={isSaving}
          className="rounded-2xl bg-[#f8ca14] hover:bg-yellow-400 text-black font-black text-xs px-6 py-2.5 shadow-lg shadow-[#f8ca14]/20 gap-2 cursor-pointer"
        >
          <Save size={16} />
          <span>{isSaving ? "جاري الحفظ..." : "حفظ وتثبيت التعديلات"}</span>
        </Button>
      </div>

      {/* SECTION 1: KEY METRICS & CODES */}
      <div className={`rounded-3xl border p-6 space-y-4 ${dark ? "bg-black/30 border-white/10" : "bg-white border-black/10 shadow-sm"}`}>
        <div className="flex items-center gap-2 border-b pb-3 border-current/10">
          <Award size={18} className="text-amber-400" />
          <h4 className="text-sm font-black">أكواد ودرجات الاعتماد البارزة</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">درجة تقييم كوجنيا (Cognia)</label>
            <input
              type="text"
              value={cogniaScore}
              onChange={(e) => setCogniaScore(e.target.value)}
              className="w-full rounded-xl border border-current/15 bg-transparent p-2.5 text-xs font-bold outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">سنة سريان الاعتماد</label>
            <input
              type="text"
              value={cogniaValidUntil}
              onChange={(e) => setCogniaValidUntil(e.target.value)}
              className="w-full rounded-xl border border-current/15 bg-transparent p-2.5 text-xs font-bold outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">رمز مركز آيلتس IELTS</label>
            <input
              type="text"
              value={ieltsVenueCode}
              onChange={(e) => setIeltsVenueCode(e.target.value)}
              className="w-full rounded-xl border border-current/15 bg-transparent p-2.5 text-xs font-bold outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">كود مركز السات SAT الرسمي</label>
            <input
              type="text"
              value={satCenterCode}
              onChange={(e) => setSatCenterCode(e.target.value)}
              className="w-full rounded-xl border border-current/15 bg-transparent p-2.5 text-xs font-bold outline-none"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: ACCREDITATIONS LIST */}
      <div className={`rounded-3xl border p-6 space-y-5 ${dark ? "bg-black/30 border-white/10" : "bg-white border-black/10 shadow-sm"}`}>
        <div className="flex items-center justify-between border-b pb-3 border-current/10">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-blue-400" />
            <h4 className="text-sm font-black">قائمة شهادات وجهات الاعتماد الدولية والمحلية</h4>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAddingAcc(!isAddingAcc)}
            className="text-xs font-black gap-1.5 rounded-xl border-blue-400/30 text-blue-400 hover:bg-blue-400/10"
          >
            <Plus size={14} />
            <span>إضافة اعتماد جديد</span>
          </Button>
        </div>

        {isAddingAcc && (
          <div className={`p-4 rounded-2xl border space-y-3 ${dark ? "bg-white/5 border-white/10" : "bg-slate-50 border-black/10"}`}>
            <h5 className="text-xs font-black text-blue-400">إضافة شهادة اعتماد جديدة</h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">عنوان الاعتماد *</label>
                <input
                  type="text"
                  value={newAccTitle}
                  onChange={(e) => setNewAccTitle(e.target.value)}
                  placeholder="اعتماد كامبريدج الدولي"
                  className="w-full rounded-xl border border-current/15 bg-transparent p-2 text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">الجهة المانحة *</label>
                <input
                  type="text"
                  value={newAccOrg}
                  onChange={(e) => setNewAccOrg(e.target.value)}
                  placeholder="Cambridge Assessment English"
                  className="w-full rounded-xl border border-current/15 bg-transparent p-2 text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">الشارة أو الدرجة</label>
                <input
                  type="text"
                  value={newAccBadge}
                  onChange={(e) => setNewAccBadge(e.target.value)}
                  placeholder="معتمد رسمياً 2026"
                  className="w-full rounded-xl border border-current/15 bg-transparent p-2 text-xs font-bold outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-[10px] font-bold text-slate-400 block mb-1">وصف موجز عن الاعتماد</label>
                <input
                  type="text"
                  value={newAccDesc}
                  onChange={(e) => setNewAccDesc(e.target.value)}
                  placeholder="اكتب نبذة عن المعايير التي حققتها المدارس..."
                  className="w-full rounded-xl border border-current/15 bg-transparent p-2 text-xs font-bold outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddingAcc(false)} className="text-xs">
                إلغاء
              </Button>
              <Button type="button" size="sm" onClick={handleAddAcc} className="bg-blue-500 hover:bg-blue-600 text-white font-black text-xs">
                تأكيد الإضافة
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {accreditationsList.map((acc) => (
            <div
              key={acc.id}
              className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                dark ? "bg-white/[0.02] border-white/10" : "bg-slate-50 border-black/5"
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h5 className="text-xs font-black">{acc.title}</h5>
                  <span className="rounded-full bg-blue-500/15 text-blue-400 px-2 py-0.5 text-[10px] font-bold border border-blue-500/30">
                    {acc.badge}
                  </span>
                </div>
                <span className="text-[11px] text-amber-400 font-medium block mt-0.5">{acc.org}</span>
                <p className="text-[11px] text-slate-400 mt-1 font-medium">{acc.desc}</p>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteAcc(acc.id)}
                className="p-2 rounded-xl text-red-400 hover:bg-red-400/10 transition cursor-pointer shrink-0"
                title="حذف"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: AWARDS & TROPHIES */}
      <div className={`rounded-3xl border p-6 space-y-5 ${dark ? "bg-black/30 border-white/10" : "bg-white border-black/10 shadow-sm"}`}>
        <div className="flex items-center justify-between border-b pb-3 border-current/10">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-amber-400" />
            <h4 className="text-sm font-black">جوائز التميز والبطولات الوطنية والدولية</h4>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAddingAward(!isAddingAward)}
            className="text-xs font-black gap-1.5 rounded-xl border-amber-400/30 text-amber-400 hover:bg-amber-400/10"
          >
            <Plus size={14} />
            <span>إضافة بطولة أو جائزة</span>
          </Button>
        </div>

        {isAddingAward && (
          <div className={`p-4 rounded-2xl border space-y-3 ${dark ? "bg-white/5 border-white/10" : "bg-slate-50 border-black/10"}`}>
            <h5 className="text-xs font-black text-amber-400">إضافة إنجاز أو بطولة جديدة</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">اسم البطولة أو الجائزة *</label>
                <input
                  type="text"
                  value={newAwardTitle}
                  onChange={(e) => setNewAwardTitle(e.target.value)}
                  placeholder="أولمبياد الرياضيات الوطني"
                  className="w-full rounded-xl border border-current/15 bg-transparent p-2 text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">المركز أو الترتيب *</label>
                <input
                  type="text"
                  value={newAwardRank}
                  onChange={(e) => setNewAwardRank(e.target.value)}
                  placeholder="المركز الأول والميدالية الذهبية 🥇"
                  className="w-full rounded-xl border border-current/15 bg-transparent p-2 text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">السنة</label>
                <input
                  type="text"
                  value={newAwardYear}
                  onChange={(e) => setNewAwardYear(e.target.value)}
                  placeholder="2026"
                  className="w-full rounded-xl border border-current/15 bg-transparent p-2 text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">الجهة المنظمة</label>
                <input
                  type="text"
                  value={newAwardBody}
                  onChange={(e) => setNewAwardBody(e.target.value)}
                  placeholder="مؤسسة موهبة"
                  className="w-full rounded-xl border border-current/15 bg-transparent p-2 text-xs font-bold outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddingAward(false)} className="text-xs">
                إلغاء
              </Button>
              <Button type="button" size="sm" onClick={handleAddAward} className="bg-amber-500 hover:bg-amber-600 text-black font-black text-xs">
                تأكيد الإضافة
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {awardsList.map((award) => (
            <div
              key={award.id}
              className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                dark ? "bg-white/[0.02] border-white/10" : "bg-slate-50 border-black/5"
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h5 className="text-xs font-black">{award.title}</h5>
                  <span className="rounded-full bg-amber-400/15 text-amber-400 px-2 py-0.5 text-[10px] font-bold border border-amber-400/30">
                    {award.year}
                  </span>
                </div>
                <span className="text-[11px] text-emerald-400 font-bold block mt-0.5">{award.rank}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">{award.awardingBody}</span>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteAward(award.id)}
                className="p-2 rounded-xl text-red-400 hover:bg-red-400/10 transition cursor-pointer shrink-0"
                title="حذف"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
