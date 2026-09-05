import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { ArrowRight, BookOpen, Clapperboard, Crown, FileText, Flag, GalleryVerticalEnd, GraduationCap, Loader2, Map, Medal, MonitorPlay, Sparkles, Star, Trophy, WandSparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

type Blueprint = { id: string; number: number; title: string; tagline: string; world: string; icon: React.ElementType; color: string; story: string; scenes: string[] };
const BLUEPRINTS: Blueprint[] = [
  { id: "trailer", number: 1, title: "تريلر الفعالية", tagline: "الانتظار يصبح تشويقاً", world: "spotlight", icon: Clapperboard, color: "#fbbf24", story: "هناك لحظة يترقبها مجتمع العقيق… قريباً نفتح الستارة.", scenes: ["إشارة تشويق", "العد التنازلي", "كشف عالم الفعالية"] },
  { id: "season", number: 2, title: "فصل من موسم العقيق", tagline: "النشاط جزء من قصة العام", world: "golden-stage", icon: BookOpen, color: "#eab308", story: "هذا الفصل يضيف صفحة جديدة إلى موسم العقيق 2026.", scenes: ["افتتاح الفصل", "رحلة الإنجاز", "ختم الموسم"] },
  { id: "portal", number: 3, title: "بوابة العالم", tagline: "صفحة تدخل منها إلى الحكاية", world: "library", icon: WandSparkles, color: "#c084fc", story: "ادخل عالم الفعالية واكتشف القصة التي صنعها طلاب العقيق.", scenes: ["النداء الأول", "فتح البوابة", "ابدأ الاكتشاف"] },
  { id: "projects", number: 4, title: "مدينة المشاريع", tagline: "معرض علمي كعالم قابل للاكتشاف", world: "future-city", icon: Map, color: "#67e8f9", story: "هنا تتحول أفكار طلاب العقيق إلى مدينة من المستقبل.", scenes: ["تضيء المدينة", "افتتاح الأجنحة", "شارع الشرف"] },
  { id: "spotlight", number: 5, title: "Alaqeeq Spotlight", tagline: "مهرجان المواهب المدرسية", world: "spotlight", icon: Star, color: "#fbbf24", story: "هنا يصبح كل صوت وموهبة لحظة تستحق الضوء.", scenes: ["ستارة النجوم", "العرض المباشر", "وسام الجمهور"] },
  { id: "league", number: 6, title: "دوري التحديات", tagline: "فرق تتقدم في سباق بصري", world: "honor-garden", icon: Trophy, color: "#fb7185", story: "كل إنجاز يضيف لوناً جديداً إلى راية فريقه في دوري العقيق.", scenes: ["رفع الرايات", "جولة التحدي", "لوحة الشرف"] },
  { id: "national", number: 7, title: "حكاية وطن", tagline: "يوم وطني يعيش كقصة", world: "heritage", icon: Flag, color: "#22c55e", story: "هنا الوطن يُروى بعين جيل العقيق وصوته.", scenes: ["نداء الوطن", "محطات الحكاية", "لوحة من نور"] },
  { id: "art", number: 8, title: "معرض الفن بلا جدران", tagline: "الأعمال تصبح قصة قابلة للزيارة", world: "library", icon: GalleryVerticalEnd, color: "#c084fc", story: "كل عمل فني هنا يفتح نافذة على خيال صاحبه.", scenes: ["فتح المعرض", "جولة الألوان", "لوحة الموسم"] },
  { id: "curtain", number: 9, title: "الستارة الرقمية", tagline: "لكل فقرة افتتاحها الخاص", world: "spotlight", icon: Clapperboard, color: "#fbbf24", story: "قبل كل فقرة، تتوقف القاعة لتسمع ما سيبدأ الآن.", scenes: ["الستارة مغلقة", "ثلاثة… اثنان… واحد", "انطلاق الفقرة"] },
  { id: "unity", number: 10, title: "لحظة التوحّد", tagline: "ختام يجمع الجمهور في لقطة واحدة", world: "golden-stage", icon: Sparkles, color: "#eab308", story: "في هذه اللحظة، تتجمع أصوات ومشاعر الحضور لتصنع رسالة العقيق.", scenes: ["دعوة المشاركة", "تجمع النجوم", "نفخر بكم"] },
  { id: "secret-message", number: 11, title: "رسالة تُفتح في وقتها", tagline: "مفاجأة صغيرة تؤثر كثيراً", world: "honor-garden", icon: FileText, color: "#fb7185", story: "هناك كلمة خاصة ستصل في اللحظة التي تستحقها.", scenes: ["رسالة مغلقة", "حان وقتها", "لحظة امتنان"] },
  { id: "world-closet", number: 12, title: "خزانة العوالم", tagline: "هوية كاملة بضغطة واحدة", world: "future-city", icon: Crown, color: "#67e8f9", story: "العالم المختار يغير نبرة النشاط وشاشته وذكرياته.", scenes: ["اختيار العالم", "تشكّل الهوية", "العالم جاهز"] },
  { id: "director", number: 13, title: "مخرج الفعالية", tagline: "البرنامج يتحول إلى مشاهد", world: "spotlight", icon: MonitorPlay, color: "#fbbf24", story: "كل مشهد له وقته وصورته وكلمته التي تبقى في الذاكرة.", scenes: ["المشهد الأول", "اللحظة الكبرى", "إغلاق الستارة"] },
  { id: "mirror", number: 14, title: "مرآة الحدث", tagline: "الشاشة تعكس روح النشاط", world: "heritage", icon: Sparkles, color: "#22c55e", story: "ما يحدث الآن يظهر كجزء من المشهد، لا كرقم بارد على لوحة.", scenes: ["نبض الحدث", "اللحظة الحالية", "أثرٌ يبقى"] },
  { id: "memory", number: 15, title: "استوديو الذكرى", tagline: "كل نشاط يترك صفحة رسمية", world: "golden-stage", icon: GraduationCap, color: "#eab308", story: "نغلق الستارة، لكن تبقى القصة في ذاكرة العقيق.", scenes: ["اختيار اللحظات", "صفحة الختام", "أرشفة الأثر"] },
];

import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";

export default function ActivityBlueprintsPage() {
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const hasAccess = isAuthenticated && user?.role === "admin";
  const { data: events = [], isLoading } = trpc.ceremonies.list.useQuery(undefined, { enabled: hasAccess, refetchOnWindowFocus: false });
  const utils = trpc.useUtils();
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [selectedBlueprint, setSelectedBlueprint] = useState<string | null>(null);
  const activeEvent = useMemo(() => events.find((event) => event.id === selectedEvent) || events[0], [events, selectedEvent]);
  const activeBlueprint = useMemo(() => BLUEPRINTS.find((item) => item.id === selectedBlueprint) || null, [selectedBlueprint]);
  const update = trpc.ceremonies.update.useMutation({
    onSuccess: () => { toast.success("تم تطبيق تجربة النشاط على الفعالية"); void utils.ceremonies.list.invalidate(); },
    onError: (error) => toast.error(error.message || "تعذر تطبيق التجربة")
  });

  if (loading || isLoading) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${dark ? "bg-[#080a10]" : "bg-[#f8fafc]"}`}>
        <Loader2 className={`animate-spin ${dark ? "text-amber-300" : "text-[#08467d]"}`} size={28} />
      </div>
    );
  }

  if (!hasAccess) {
    navigate("/");
    return null;
  }

  const apply = () => {
    if (!activeEvent || !activeBlueprint) return;
    update.mutate({
      id: activeEvent.id,
      experienceWorld: activeBlueprint.world,
      storyLine: activeBlueprint.story,
      stageScenes: JSON.stringify(activeBlueprint.scenes)
    });
  };

  return (
    <main dir="rtl" className={`min-h-screen transition-colors ${dark ? "bg-[#080a10] text-slate-100" : "bg-[#f8fafc] text-slate-900"}`}>
      <header className={`sticky top-0 z-30 border-b backdrop-blur-xl ${dark ? "border-white/[.08] bg-[#080a10]/90" : "border-slate-200 bg-white/90 shadow-sm"}`}>
        <div className="container flex h-16 items-center justify-between">
          <button onClick={() => navigate("/live")} className={`inline-flex items-center gap-2 text-xs font-bold transition ${dark ? "text-slate-400 hover:text-amber-200" : "text-slate-600 hover:text-[#08467d]"}`}>
            <ArrowRight size={16} />
            استوديو Alaqeeq Live
          </button>
          <div className={`text-sm font-black ${dark ? "text-amber-50" : "text-slate-900"}`}>خزانة التجارب المدرسية</div>
        </div>
      </header>

      <div className="container py-8 md:py-10">
        <section className={`rounded-[2rem] border p-6 md:p-9 shadow-xl ${dark ? "border-amber-300/20 bg-[#111521]" : "border-slate-200 bg-white"}`}>
          <div className="max-w-3xl">
            <div className={`text-[11px] font-black ${dark ? "text-amber-300" : "text-[#08467d]"}`}>15 تجربة قابلة للتطبيق</div>
            <h1 className={`mt-2 text-4xl font-black leading-tight md:text-6xl ${dark ? "text-amber-50" : "text-slate-900"}`}>
              اختر فكرة.<br />وحولها إلى عالم فعلي.
            </h1>
            <p className={`mt-5 text-sm leading-8 ${dark ? "text-slate-300" : "text-slate-600"}`}>
              هذه ليست قائمة اقتراحات؛ كل بطاقة تطبق عالم الفعالية، قصتها، ومشاهد شاشتها مباشرة على الفعالية التي تختارها.
            </p>
          </div>

          <div className="mt-7 grid gap-3 md:grid-cols-[minmax(0,1fr)_280px]">
            <select
              value={activeEvent?.id || ""}
              onChange={(event) => setSelectedEvent(Number(event.target.value))}
              className={`rounded-xl border px-3 py-3 text-sm font-bold outline-none ${
                dark ? "border-slate-700 bg-black/20 text-slate-100 focus:border-amber-300" : "border-slate-300 bg-slate-50 text-slate-800 focus:border-[#08467d]"
              }`}
            >
              <option value="" disabled>اختر فعالية لتطبيق التجربة</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>{event.title}</option>
              ))}
            </select>
            <button
              onClick={apply}
              disabled={!activeEvent || !activeBlueprint || update.isPending}
              className={`rounded-xl px-4 py-3 text-sm font-black disabled:opacity-40 shadow-md ${
                dark ? "bg-amber-300 text-amber-950 hover:bg-amber-400" : "bg-[#08467d] text-white hover:bg-[#063560]"
              }`}
            >
              {update.isPending ? "جارٍ التطبيق…" : "تطبيق على الفعالية"}
            </button>
          </div>
        </section>

        <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {BLUEPRINTS.map((blueprint) => {
            const Icon = blueprint.icon;
            const active = activeBlueprint?.id === blueprint.id;
            return (
              <button
                key={blueprint.id}
                onClick={() => setSelectedBlueprint(blueprint.id)}
                className={`group rounded-3xl border p-5 text-right transition hover:-translate-y-1 shadow-sm ${
                  active
                    ? dark ? "border-amber-300/70 bg-amber-300/[.08]" : "border-[#08467d] bg-[#08467d]/10 ring-2 ring-[#08467d]/20"
                    : dark ? "border-white/[.08] bg-[#111521] hover:border-white/20" : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black ${dark ? "bg-black/20" : "bg-slate-100"}`} style={{ color: blueprint.color }}>
                    {String(blueprint.number).padStart(2, "0")}
                  </div>
                  <Icon size={20} style={{ color: blueprint.color }} />
                </div>
                <h2 className={`mt-6 text-lg font-black ${dark ? "text-amber-50" : "text-slate-900"}`}>{blueprint.title}</h2>
                <p className="mt-1 text-xs text-slate-500">{blueprint.tagline}</p>
                <div className={`mt-5 border-t pt-3 text-[10px] font-bold ${dark ? "border-white/[.07]" : "border-slate-200"}`} style={{ color: blueprint.color }}>
                  تطبيق العالم والمشاهد <span className="mr-1">←</span>
                </div>
              </button>
            );
          })}
        </section>

        {activeBlueprint ? (
          <section className={`mt-7 rounded-3xl border p-6 shadow-lg ${dark ? "border-amber-300/20 bg-[#111521]" : "border-slate-200 bg-white"}`}>
            <div className="flex items-start gap-4">
              <div className={`rounded-2xl p-3 ${dark ? "bg-amber-300/10 text-amber-200" : "bg-amber-100 text-amber-800"}`}>
                <Medal size={22} />
              </div>
              <div>
                <div className={`text-[11px] font-black ${dark ? "text-amber-300" : "text-[#08467d]"}`}>معاينة التجربة المختارة</div>
                <h2 className={`mt-1 text-2xl font-black ${dark ? "text-amber-50" : "text-slate-900"}`}>{activeBlueprint.title}</h2>
                <p className={`mt-3 max-w-3xl text-sm leading-8 ${dark ? "text-slate-300" : "text-slate-600"}`}>{activeBlueprint.story}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {activeBlueprint.scenes.map((scene, index) => (
                    <span
                      key={scene}
                      className={`rounded-full border px-3 py-1.5 text-[11px] font-bold ${
                        dark ? "border-white/10 bg-black/20 text-slate-300" : "border-slate-200 bg-slate-100 text-slate-700"
                      }`}
                    >
                      {index + 1}. {scene}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
