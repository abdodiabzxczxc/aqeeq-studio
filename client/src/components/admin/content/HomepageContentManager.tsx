import React, { useState } from "react";
import { Plus, Trash2, Eye, EyeOff, Save, Sparkles, Layers, BarChart3, Pin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface HomepageContentManagerProps {
  dark?: boolean;
  orchestration: any;
  onSave: (updatedOrchestration: any) => Promise<void>;
  isSaving: boolean;
}

export function HomepageContentManager({
  dark = true,
  orchestration,
  onSave,
  isSaving,
}: HomepageContentManagerProps) {
  // 1. Stories State
  const [stories, setStories] = useState<any[]>(
    orchestration?.siteStories && orchestration.siteStories.length > 0
      ? orchestration.siteStories
      : [
          {
            id: "story-welcome-2026",
            title: "فتح باب القبول والتسجيل للعام الدراسي الجديد",
            category: "إعلان هام 📢",
            imageUrl: "/covers/cover-admissions.jpg",
            targetUrl: "/admissions",
            buttonLabel: "سجّل مقعدك الآن",
            active: true,
            isPinned: true,
          },
          {
            id: "story-stem-robotics",
            title: "أبطال العقيق في أولمبياد الروبوت WRO",
            category: "إنجاز عالمي 🌐",
            imageUrl: "/covers/student-robotics-accreditations.jpg",
            targetUrl: "/accreditations",
            buttonLabel: "تفاصيل الإنجاز",
            active: true,
            isPinned: false,
          },
        ]
  );

  // New Story Form
  const [newStoryTitle, setNewStoryTitle] = useState("");
  const [newStoryCategory, setNewStoryCategory] = useState("إعلان هام 📢");
  const [newStoryImage, setNewStoryImage] = useState("");
  const [newStoryUrl, setNewStoryUrl] = useState("/admissions");
  const [newStoryButtonLabel, setNewStoryButtonLabel] = useState("تفاصيل أكثر");
  const [isAddingStory, setIsAddingStory] = useState(false);

  // 2. Bento Cards State
  const [bentoCards, setBentoCards] = useState<any[]>(
    orchestration?.bentoCards && orchestration.bentoCards.length > 0
      ? orchestration.bentoCards
      : [
          { id: "albums", title: "ألبوم فعاليات العقيق", subtitle: "أكثر من 500 صورة موثقة للأنشطة والمسيرات", badge: "توثيق حي 📸", route: "/albums", enabled: true },
          { id: "journal", title: "مجلة العقيق الدورية 3D", subtitle: "تصفح الأعداد الدورية بتقنية التقليب ثلاثي الأبعاد", badge: "العدد الدوري 📖", route: "/journal", enabled: true },
          { id: "podcast", title: "أثير العقيق الصوتي", subtitle: "حوارات تربوية ملهمة وتجارب طلابية رائدة", badge: "بودكاست 🎙️", route: "/podcast", enabled: true },
          { id: "articles", title: "مقالات ومدونة العقيق", subtitle: "كتابات إثرائية وفكرية بأقلام المعلمين والطلاب", badge: "مدونة ✍️", route: "/articles", enabled: true },
        ]
  );

  // 3. School Metrics State
  const [metrics, setMetrics] = useState({
    studentsCount: orchestration?.schoolMetrics?.studentsCount ?? 1500,
    teachersCount: orchestration?.schoolMetrics?.teachersCount ?? 180,
    successRate: orchestration?.schoolMetrics?.successRate ?? 100,
    graduatesCount: orchestration?.schoolMetrics?.graduatesCount ?? 8500,
    campusesCount: orchestration?.schoolMetrics?.campusesCount ?? 2,
    experienceYears: orchestration?.schoolMetrics?.experienceYears ?? 30,
  });

  // Save All Homepage Content
  const handleSaveHomepage = async () => {
    try {
      await onSave({
        ...orchestration,
        siteStories: stories,
        bentoCards: bentoCards,
        schoolMetrics: metrics,
      });
      toast.success("✅ تم حفظ وتحديث محتوى الصفحة الرئيسية بنجاح");
    } catch {
      toast.error("حدث خطأ أثناء حفظ التعديلات");
    }
  };

  // Add new story
  const handleAddStory = () => {
    if (!newStoryTitle.trim() || !newStoryImage.trim()) {
      toast.error("يرجى كتابة عنوان الستوري ورابط الصورة");
      return;
    }
    const newStory = {
      id: "story-" + Date.now(),
      title: newStoryTitle.trim(),
      category: newStoryCategory.trim(),
      imageUrl: newStoryImage.trim(),
      targetUrl: newStoryUrl.trim() || undefined,
      buttonLabel: newStoryButtonLabel.trim() || undefined,
      active: true,
      isPinned: false,
      createdAt: new Date().toISOString(),
    };
    setStories([newStory, ...stories]);
    setNewStoryTitle("");
    setNewStoryImage("");
    setIsAddingStory(false);
    toast.info("تمت إضافة الستوري. اضغط 'حفظ وتثبيت التعديلات' لنشره.");
  };

  // Delete story
  const handleDeleteStory = (id: string) => {
    setStories(stories.filter((s) => s.id !== id));
    toast.info("تم حذف الستوري. اضغط 'حفظ وتثبيت التعديلات' لتطبيق الحذف.");
  };

  // Toggle story status
  const handleToggleStory = (id: string) => {
    setStories(
      stories.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  // Toggle story pin
  const handleTogglePin = (id: string) => {
    setStories(
      stories.map((s) => (s.id === id ? { ...s, isPinned: !s.isPinned } : s))
    );
  };

  // Toggle Bento Card
  const handleToggleBento = (id: string) => {
    setBentoCards(
      bentoCards.map((b) => (b.id === id ? { ...b, enabled: !b.enabled } : b))
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4 border-current/10">
        <div>
          <h3 className="text-lg font-black flex items-center gap-2">
            <Sparkles size={20} className="text-[#f8ca14]" />
            <span>إدارة محتوى الصفحة الرئيسية (Homepage Engine)</span>
          </h3>
          <p className="text-xs font-bold text-slate-400 mt-1">
            التحكم في ستوريات الـ 24H العلوية، بطاقات شبكة البنتو الأربعة، وعدادات أرقام المدارس
          </p>
        </div>

        <Button
          type="button"
          onClick={handleSaveHomepage}
          disabled={isSaving}
          className="rounded-2xl bg-[#f8ca14] hover:bg-yellow-400 text-black font-black text-xs px-6 py-2.5 shadow-lg shadow-[#f8ca14]/20 gap-2 cursor-pointer"
        >
          <Save size={16} />
          <span>{isSaving ? "جاري الحفظ..." : "حفظ وتثبيت التعديلات"}</span>
        </Button>
      </div>

      {/* SECTION 1: 24H STORIES MANAGER */}
      <div className={`rounded-3xl border p-6 space-y-6 ${dark ? "bg-black/30 border-white/10" : "bg-white border-black/10 shadow-sm"}`}>
        <div className="flex items-center justify-between border-b pb-3 border-current/10">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-400/10 text-amber-500 font-black text-xs">
              24h
            </div>
            <div>
              <h4 className="text-sm font-black">شريط ستوريات العقيق (Top Stories Bar)</h4>
              <p className="text-[11px] text-slate-400">إضافة إعلانات سريعة أو ستوريات مصورة تظهر لزوار الصفحة الرئيسية أعلى الهيرو</p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAddingStory(!isAddingStory)}
            className="text-xs font-black gap-1.5 rounded-xl border-amber-400/30 text-amber-500 hover:bg-amber-400/10"
          >
            <Plus size={14} />
            <span>إضافة ستوري جديد</span>
          </Button>
        </div>

        {/* Add Story Dropdown Form */}
        {isAddingStory && (
          <div className={`p-4 rounded-2xl border space-y-3 ${dark ? "bg-white/5 border-white/10" : "bg-slate-50 border-black/10"}`}>
            <h5 className="text-xs font-black text-amber-400">بيانات الستوري الجديد</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">عنوان الستوري *</label>
                <input
                  type="text"
                  value={newStoryTitle}
                  onChange={(e) => setNewStoryTitle(e.target.value)}
                  placeholder="مثال: حفل تكريم المتفوقين السنوي"
                  className="w-full rounded-xl border border-current/15 bg-transparent p-2.5 text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">الشارة أو التصنيف</label>
                <input
                  type="text"
                  value={newStoryCategory}
                  onChange={(e) => setNewStoryCategory(e.target.value)}
                  placeholder="إعلان هام 📢 أو إنجاز 🏆"
                  className="w-full rounded-xl border border-current/15 bg-transparent p-2.5 text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">رابط صورة الغلاف *</label>
                <input
                  type="text"
                  value={newStoryImage}
                  onChange={(e) => setNewStoryImage(e.target.value)}
                  placeholder="/covers/cover-admissions.jpg أو رابط مباشر"
                  className="w-full rounded-xl border border-current/15 bg-transparent p-2.5 text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">الرابط التوجيهي عند النقر</label>
                <input
                  type="text"
                  value={newStoryUrl}
                  onChange={(e) => setNewStoryUrl(e.target.value)}
                  placeholder="/admissions أو رابط صفحة"
                  className="w-full rounded-xl border border-current/15 bg-transparent p-2.5 text-xs font-bold outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddingStory(false)} className="text-xs">
                إلغاء
              </Button>
              <Button type="button" size="sm" onClick={handleAddStory} className="bg-amber-500 hover:bg-amber-600 text-black font-black text-xs">
                تأكيد الإضافة
              </Button>
            </div>
          </div>
        )}

        {/* Stories List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {stories.map((story) => (
            <div
              key={story.id}
              className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition ${
                story.active
                  ? dark ? "bg-white/[0.03] border-white/10" : "bg-slate-50 border-black/5"
                  : "opacity-50 border-dashed border-current/20"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative h-12 w-12 shrink-0 rounded-xl overflow-hidden bg-black/40 border border-white/10">
                  <img loading="lazy" src={story.imageUrl} alt="" className="h-full w-full object-cover" />
                  {story.isPinned && (
                    <span className="absolute top-1 right-1 grid h-4 w-4 place-items-center rounded-full bg-amber-400 text-black text-[9px]">
                      <Pin size={9} />
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-amber-400 block truncate">{story.category}</span>
                  <h5 className="text-xs font-black truncate">{story.title}</h5>
                  <span className="text-[10px] text-slate-400 block">{story.active ? "نشط ويظهر بالموقع" : "معطل ومخفي"}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleTogglePin(story.id)}
                  className={`p-1.5 rounded-lg transition ${story.isPinned ? "text-amber-400 bg-amber-400/10" : "text-slate-400 hover:text-white"}`}
                  title={story.isPinned ? "إلغاء التثبيت" : "تثبيت في المقدمة"}
                >
                  <Pin size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleStory(story.id)}
                  className={`p-1.5 rounded-lg transition ${story.active ? "text-emerald-400" : "text-slate-400"}`}
                  title={story.active ? "إخفاء" : "إظهار"}
                >
                  {story.active ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteStory(story.id)}
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition cursor-pointer"
                  title="حذف"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: BENTO CARDS TOGGLE & LABELS */}
      <div className={`rounded-3xl border p-6 space-y-4 ${dark ? "bg-black/30 border-white/10" : "bg-white border-black/10 shadow-sm"}`}>
        <div className="flex items-center gap-2.5 border-b pb-3 border-current/10">
          <Layers size={18} className="text-blue-400" />
          <div>
            <h4 className="text-sm font-black">شبكة البنتو الرئيسية (Homepage Bento Cards)</h4>
            <p className="text-[11px] text-slate-400">التحكم في إظهار أو إخفاء أي كارت وتعديل عنوانه وشاراته</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {bentoCards.map((card, idx) => (
            <div
              key={card.id}
              className={`p-4 rounded-2xl border space-y-3 transition ${
                card.enabled
                  ? dark ? "bg-white/[0.02] border-white/10" : "bg-slate-50 border-black/5"
                  : "opacity-50 border-dashed"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-400">كارت #{idx + 1} ({card.id})</span>
                <button
                  type="button"
                  onClick={() => handleToggleBento(card.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                    card.enabled ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-500/10 text-slate-400"
                  }`}
                >
                  {card.enabled ? <Eye size={12} /> : <EyeOff size={12} />}
                  <span>{card.enabled ? "مفعّل" : "معطّل"}</span>
                </button>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">عنوان الكارت</label>
                <input
                  type="text"
                  value={card.title}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBentoCards(bentoCards.map((c) => (c.id === card.id ? { ...c, title: val } : c)));
                  }}
                  className="w-full rounded-xl border border-current/15 bg-transparent p-2 text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">الوصف الفرعي</label>
                <input
                  type="text"
                  value={card.subtitle}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBentoCards(bentoCards.map((c) => (c.id === card.id ? { ...c, subtitle: val } : c)));
                  }}
                  className="w-full rounded-xl border border-current/15 bg-transparent p-2 text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">الشارة (Badge)</label>
                <input
                  type="text"
                  value={card.badge}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBentoCards(bentoCards.map((c) => (c.id === card.id ? { ...c, badge: val } : c)));
                  }}
                  className="w-full rounded-xl border border-current/15 bg-transparent p-2 text-xs font-bold outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: LIVE SCHOOL METRICS COUNTERS */}
      <div className={`rounded-3xl border p-6 space-y-4 ${dark ? "bg-black/30 border-white/10" : "bg-white border-black/10 shadow-sm"}`}>
        <div className="flex items-center gap-2.5 border-b pb-3 border-current/10">
          <BarChart3 size={18} className="text-emerald-400" />
          <div>
            <h4 className="text-sm font-black">شريط الإحصائيات والأرقام المعتمدة (School Metrics)</h4>
            <p className="text-[11px] text-slate-400">تعديل العدادات الرقمية التي يراها زوار الموقع وأولياء الأمور</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">عدد الطلاب 🎓</label>
            <input
              type="number"
              value={metrics.studentsCount}
              onChange={(e) => setMetrics({ ...metrics, studentsCount: Number(e.target.value) || 0 })}
              className="w-full rounded-xl border border-current/15 bg-transparent p-2.5 text-xs font-black outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">عدد المعلمين 👨‍🏫</label>
            <input
              type="number"
              value={metrics.teachersCount}
              onChange={(e) => setMetrics({ ...metrics, teachersCount: Number(e.target.value) || 0 })}
              className="w-full rounded-xl border border-current/15 bg-transparent p-2.5 text-xs font-black outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">نسبة النجاح % 🎯</label>
            <input
              type="number"
              value={metrics.successRate}
              onChange={(e) => setMetrics({ ...metrics, successRate: Number(e.target.value) || 0 })}
              className="w-full rounded-xl border border-current/15 bg-transparent p-2.5 text-xs font-black outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">عدد الخريجين 📜</label>
            <input
              type="number"
              value={metrics.graduatesCount}
              onChange={(e) => setMetrics({ ...metrics, graduatesCount: Number(e.target.value) || 0 })}
              className="w-full rounded-xl border border-current/15 bg-transparent p-2.5 text-xs font-black outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">عدد المجمعات 🏫</label>
            <input
              type="number"
              value={metrics.campusesCount}
              onChange={(e) => setMetrics({ ...metrics, campusesCount: Number(e.target.value) || 0 })}
              className="w-full rounded-xl border border-current/15 bg-transparent p-2.5 text-xs font-black outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">سنوات الخبرة ⭐</label>
            <input
              type="number"
              value={metrics.experienceYears}
              onChange={(e) => setMetrics({ ...metrics, experienceYears: Number(e.target.value) || 0 })}
              className="w-full rounded-xl border border-current/15 bg-transparent p-2.5 text-xs font-black outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
