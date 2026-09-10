import React, { useState } from "react";
import { Plus, Trash2, Save, Building2, UserCheck, Compass, Award } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface AboutPageContentManagerProps {
  dark?: boolean;
  orchestration: any;
  onSave: (updatedOrchestration: any) => Promise<void>;
  isSaving: boolean;
}

export function AboutPageContentManager({
  dark = true,
  orchestration,
  onSave,
  isSaving,
}: AboutPageContentManagerProps) {
  const currentCfg = orchestration?.aboutPageConfig || {};

  // Form states
  const [statYears, setStatYears] = useState(currentCfg.statYears || "منذ 1994");
  const [statCampuses, setStatCampuses] = useState(currentCfg.statCampuses || "مجمعين للبنين والبنات");
  const [statAccreditation, setStatAccreditation] = useState(currentCfg.statAccreditation || "Cognia أمريكي");
  const [statGrades, setStatGrades] = useState(currentCfg.statGrades || "KG - 12 كافة المراحل");

  const [visionTitle, setVisionTitle] = useState(currentCfg.visionTitle || "رؤيتنا 2030");
  const [visionText, setVisionText] = useState(
    currentCfg.visionText ||
      "الريادة في تقديم تعليم استثنائي يجمع بين أصالة القيم والتقنيات الرقمية المتقدمة لبناء جيل يقود المستقبل."
  );

  const [missionTitle, setMissionTitle] = useState(currentCfg.missionTitle || "رسالتنا التربوية");
  const [missionText, setMissionText] = useState(
    currentCfg.missionText ||
      "توفير بيئة تعليمية محفزة ومبتكرة تُمكّن الطالب من استكشاف شغفه وصقل مهاراته الأكاديمية والقيادية بأعلى المعايير العالمية."
  );

  const [leadership, setLeadership] = useState<any[]>(
    currentCfg.leadership && currentCfg.leadership.length > 0
      ? currentCfg.leadership
      : [
          {
            id: "leader-1",
            name: "أ. عبد الله الساعدي",
            role: "المشرف العام على مدارس العقيق",
            speech: "نؤمن في مدارس العقيق بأن التعليم ليس مجرد تلقين، بل صناعة هوية وبناء جيل ملهم يقود المستقبل بالمعرفة والقيم.",
            photoUrl: "/covers/cover-about.jpg",
          },
        ]
  );

  // New Leader form
  const [newLeaderName, setNewLeaderName] = useState("");
  const [newLeaderRole, setNewLeaderRole] = useState("");
  const [newLeaderSpeech, setNewLeaderSpeech] = useState("");
  const [newLeaderPhoto, setNewLeaderPhoto] = useState("/covers/cover-about.jpg");
  const [isAddingLeader, setIsAddingLeader] = useState(false);

  // Save changes
  const handleSaveAbout = async () => {
    try {
      const updatedConfig = {
        ...currentCfg,
        statYears,
        statCampuses,
        statAccreditation,
        statGrades,
        visionTitle,
        visionText,
        missionTitle,
        missionText,
        leadership,
      };

      await onSave({
        ...orchestration,
        aboutPageConfig: updatedConfig,
      });
      toast.success("✅ تم حفظ وتحديث محتوى صفحة مدارسنا بنجاح");
    } catch {
      toast.error("حدث خطأ أثناء حفظ التعديلات");
    }
  };

  const handleAddLeader = () => {
    if (!newLeaderName.trim() || !newLeaderRole.trim()) {
      toast.error("يرجى ملء اسم القائد والمنصب");
      return;
    }
    const newLeader = {
      id: "leader-" + Date.now(),
      name: newLeaderName.trim(),
      role: newLeaderRole.trim(),
      speech: newLeaderSpeech.trim(),
      photoUrl: newLeaderPhoto.trim(),
    };
    setLeadership([...leadership, newLeader]);
    setNewLeaderName("");
    setNewLeaderRole("");
    setNewLeaderSpeech("");
    setIsAddingLeader(false);
    toast.info("تمت إضافة القائد. اضغط 'حفظ وتثبيت التعديلات' لنشره.");
  };

  const handleDeleteLeader = (id: string) => {
    setLeadership(leadership.filter((l) => l.id !== id));
    toast.info("تم حذف القائد. اضغط 'حفظ وتثبيت التعديلات' لتطبيق الحذف.");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4 border-current/10">
        <div>
          <h3 className="text-lg font-black flex items-center gap-2">
            <Building2 size={20} className="text-[#f8ca14]" />
            <span>إدارة محتوى صفحة مدارسنا (About Page Engine)</span>
          </h3>
          <p className="text-xs font-bold text-slate-400 mt-1">
            التحكم في الرؤية والرسالة، كلمات القيادات المدرسية، والإحصائيات البارزة
          </p>
        </div>

        <Button
          type="button"
          onClick={handleSaveAbout}
          disabled={isSaving}
          className="rounded-2xl bg-[#f8ca14] hover:bg-yellow-400 text-black font-black text-xs px-6 py-2.5 shadow-lg shadow-[#f8ca14]/20 gap-2 cursor-pointer"
        >
          <Save size={16} />
          <span>{isSaving ? "جاري الحفظ..." : "حفظ وتثبيت التعديلات"}</span>
        </Button>
      </div>

      {/* SECTION 1: ABOUT STATS */}
      <div className={`rounded-3xl border p-6 space-y-4 ${dark ? "bg-black/30 border-white/10" : "bg-white border-black/10 shadow-sm"}`}>
        <div className="flex items-center gap-2 border-b pb-3 border-current/10">
          <Award size={18} className="text-amber-400" />
          <h4 className="text-sm font-black">الشارات والإحصائيات الأربعة في أعلى الصفحة</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">السنوات والريادة</label>
            <input
              type="text"
              value={statYears}
              onChange={(e) => setStatYears(e.target.value)}
              className="w-full rounded-xl border border-current/15 bg-transparent p-2.5 text-xs font-bold outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">المجمعات</label>
            <input
              type="text"
              value={statCampuses}
              onChange={(e) => setStatCampuses(e.target.value)}
              className="w-full rounded-xl border border-current/15 bg-transparent p-2.5 text-xs font-bold outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">الاعتماد الدولي</label>
            <input
              type="text"
              value={statAccreditation}
              onChange={(e) => setStatAccreditation(e.target.value)}
              className="w-full rounded-xl border border-current/15 bg-transparent p-2.5 text-xs font-bold outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">المراحل التعليمية</label>
            <input
              type="text"
              value={statGrades}
              onChange={(e) => setStatGrades(e.target.value)}
              className="w-full rounded-xl border border-current/15 bg-transparent p-2.5 text-xs font-bold outline-none"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: VISION & MISSION */}
      <div className={`rounded-3xl border p-6 space-y-4 ${dark ? "bg-black/30 border-white/10" : "bg-white border-black/10 shadow-sm"}`}>
        <div className="flex items-center gap-2 border-b pb-3 border-current/10">
          <Compass size={18} className="text-blue-400" />
          <h4 className="text-sm font-black">الرؤية والرسالة المؤسسية 2030</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">عنوان الرؤية</label>
              <input
                type="text"
                value={visionTitle}
                onChange={(e) => setVisionTitle(e.target.value)}
                className="w-full rounded-xl border border-current/15 bg-transparent p-2 text-xs font-bold outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">نص الرؤية</label>
              <textarea
                rows={3}
                value={visionText}
                onChange={(e) => setVisionText(e.target.value)}
                className="w-full rounded-xl border border-current/15 bg-transparent p-2.5 text-xs font-bold outline-none resize-none leading-relaxed"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">عنوان الرسالة</label>
              <input
                type="text"
                value={missionTitle}
                onChange={(e) => setMissionTitle(e.target.value)}
                className="w-full rounded-xl border border-current/15 bg-transparent p-2 text-xs font-bold outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">نص الرسالة التربوية</label>
              <textarea
                rows={3}
                value={missionText}
                onChange={(e) => setMissionText(e.target.value)}
                className="w-full rounded-xl border border-current/15 bg-transparent p-2.5 text-xs font-bold outline-none resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: LEADERSHIP TEAM */}
      <div className={`rounded-3xl border p-6 space-y-5 ${dark ? "bg-black/30 border-white/10" : "bg-white border-black/10 shadow-sm"}`}>
        <div className="flex items-center justify-between border-b pb-3 border-current/10">
          <div className="flex items-center gap-2">
            <UserCheck size={18} className="text-emerald-400" />
            <div>
              <h4 className="text-sm font-black">فريق القيادة التربوية وكلمات الإدارة</h4>
              <p className="text-[11px] text-slate-400">إدارة كلمة المشرف العام وقيادات المجمعات الظاهرة في الصفحة</p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAddingLeader(!isAddingLeader)}
            className="text-xs font-black gap-1.5 rounded-xl border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10"
          >
            <Plus size={14} />
            <span>إضافة كلمة قيادية جديدة</span>
          </Button>
        </div>

        {/* Add Leader Form */}
        {isAddingLeader && (
          <div className={`p-4 rounded-2xl border space-y-3 ${dark ? "bg-white/5 border-white/10" : "bg-slate-50 border-black/10"}`}>
            <h5 className="text-xs font-black text-emerald-400">إضافة قائد مدرسي جديد</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">الاسم الكريم *</label>
                <input
                  type="text"
                  value={newLeaderName}
                  onChange={(e) => setNewLeaderName(e.target.value)}
                  placeholder="أ. عبد الله الساعدي"
                  className="w-full rounded-xl border border-current/15 bg-transparent p-2 text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">المنصب الإداري / القيادي *</label>
                <input
                  type="text"
                  value={newLeaderRole}
                  onChange={(e) => setNewLeaderRole(e.target.value)}
                  placeholder="المشرف العام على مدارس العقيق"
                  className="w-full rounded-xl border border-current/15 bg-transparent p-2 text-xs font-bold outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 block mb-1">الكلمة التربوية أو المقولة</label>
                <textarea
                  rows={2}
                  value={newLeaderSpeech}
                  onChange={(e) => setNewLeaderSpeech(e.target.value)}
                  placeholder="اكتب كلمة القائد التربوية..."
                  className="w-full rounded-xl border border-current/15 bg-transparent p-2 text-xs font-bold outline-none resize-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 block mb-1">رابط الصورة الشخصية</label>
                <input
                  type="text"
                  value={newLeaderPhoto}
                  onChange={(e) => setNewLeaderPhoto(e.target.value)}
                  className="w-full rounded-xl border border-current/15 bg-transparent p-2 text-xs font-bold outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddingLeader(false)} className="text-xs">
                إلغاء
              </Button>
              <Button type="button" size="sm" onClick={handleAddLeader} className="bg-emerald-500 hover:bg-emerald-600 text-black font-black text-xs">
                تأكيد الإضافة
              </Button>
            </div>
          </div>
        )}

        {/* Leaders List */}
        <div className="space-y-3">
          {leadership.map((leader) => (
            <div
              key={leader.id}
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                dark ? "bg-white/[0.02] border-white/10" : "bg-slate-50 border-black/5"
              }`}
            >
              <div className="flex items-start sm:items-center gap-3">
                <div className="h-12 w-12 shrink-0 rounded-2xl overflow-hidden bg-black/40 border border-white/10">
                  <img src={leader.photoUrl || "/covers/cover-about.jpg"} alt="" className="h-full w-full object-cover" />
                </div>
                <div>
                  <h5 className="text-xs font-black">{leader.name}</h5>
                  <span className="text-[10px] text-amber-400 font-bold block">{leader.role}</span>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 max-w-xl font-medium">"{leader.speech}"</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteLeader(leader.id)}
                className="p-2 rounded-xl text-red-400 hover:bg-red-400/10 transition cursor-pointer self-end sm:self-center"
                title="حذف القائد"
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
