import { trpc } from "@/lib/trpc";
import { VisualEditable } from "@/components/VisualEditor";
import { Crown, Loader2, LockKeyhole, Maximize2, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

const WORLDS: Record<string, { title: string; accent: string }> = {
  "future-city": { title: "مدينة المستقبل", accent: "#67e8f9" }, spotlight: { title: "مسرح النجوم", accent: "#fbbf24" }, heritage: { title: "وطن من نور", accent: "#22c55e" }, "golden-stage": { title: "رحلة الجيل", accent: "#eab308" }, library: { title: "مكتبة الأسرار", accent: "#c084fc" }, "honor-garden": { title: "حديقة الإنجاز", accent: "#fb7185" },
};

const getScenes = (value?: string | null) => {
  try { const data = JSON.parse(value || "[]"); return Array.isArray(data) && data.length ? data.map(String) : ["افتتاح عالم الفعالية", "اللحظة الكبرى", "ختام الستارة"]; } catch { return ["افتتاح عالم الفعالية", "اللحظة الكبرى", "ختام الستارة"]; }
};

export default function EventStagePage({ id }: { id: string }) {
  const eventId = Number(id);
  const { data: event, isLoading } = trpc.ceremonies.public.useQuery({ id: eventId }, { refetchInterval: 5000 });
  const { data: maison } = trpc.ceremonies.maison.public.useQuery({ ceremonyId: eventId }, { refetchInterval: 2000 });
  const [scene, setScene] = useState(0);
  const scenes = useMemo(() => getScenes(event?.stageScenes), [event?.stageScenes]);

  if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-[#050609]"><Loader2 className="animate-spin text-amber-300" /></div>;
  if (!event) return <div className="flex min-h-screen items-center justify-center bg-[#050609] text-slate-400">الفعالية غير متاحة.</div>;

  const world = WORLDS[event.experienceWorld || "golden-stage"] || WORLDS["golden-stage"];
  const currentScene = scenes[Math.min(scene, scenes.length - 1)];
  const curtainState = maison?.curtainState || "closed";
  const curtainActive = curtainState !== "revealed";
  const isLive = maison?.launchPhase === "live";

  return <VisualEditable id="stage-page" tag="section" label="صفحة شاشة المسرح" as="section" className="block"><main dir="rtl" className="min-h-screen overflow-hidden bg-[#050609] text-white">
    <VisualEditable id="stage-ambient-light" tag="section" label="إضاءة خلفية المسرح" as="div" className="pointer-events-none fixed inset-0 opacity-60" style={{ background: `radial-gradient(circle at 78% 18%, ${world.accent}38, transparent 27%), radial-gradient(circle at 18% 82%, ${event.brandColor || "#c9a84c"}25, transparent 28%)` }} />
    <VisualEditable id="stage-shell" tag="section" label="حاوية شاشة المسرح" as="div" className="relative flex min-h-screen flex-col p-5 md:p-10">
      <VisualEditable id="stage-header" tag="section" label="ترويسة شاشة المسرح" as="div" className="flex items-center justify-between"><div><VisualEditable id="stage-kicker" tag="text" label="شارة شاشة المسرح" as="div" defaultText={isLive ? "ليلة العقيق · بث حي" : "AL AQEEQ LIVE · شاشة العرض"} className="text-xs font-black" style={{ color: world.accent }} /><VisualEditable id="stage-event-title" tag="text" label="اسم الفعالية على المسرح" as="div" defaultText={event.title} className="mt-2 text-sm font-bold text-slate-300" /></div><VisualEditable id="stage-hall-badge" tag="text" label="شارة وضع القاعة" as="div" defaultText={curtainActive ? "الستارة الرقمية" : "وضع القاعة"} className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-[11px] font-bold text-slate-300">{(text) => <><Maximize2 size={14} style={{ color: world.accent }} />{text}</>}</VisualEditable></VisualEditable>

      <VisualEditable id="stage-main-scene" tag="section" label="منطقة المشهد الرئيسي" as="section" className="flex flex-1 flex-col items-center justify-center text-center"><VisualEditable id="stage-world-name" tag="text" label="اسم عالم النشاط" as="div" defaultText={world.title} className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black" style={{ color: world.accent, borderColor: `${world.accent}55`, background: `${world.accent}12` }}>{(text) => <><Sparkles size={14} />{text}</>}</VisualEditable><VisualEditable id="stage-scene-title" tag="text" label="عنوان مشهد المسرح" as="h1" defaultText={currentScene} className="mt-8 max-w-5xl text-5xl font-black leading-tight md:text-8xl" /><VisualEditable id="stage-storyline" tag="text" label="وصف مشهد المسرح" as="p" defaultText={event.storyLine || "مدارس العقيق تقدم لحظة مميزة من موسمها المدرسي."} className="mt-8 max-w-2xl text-lg leading-9 text-slate-300" /><VisualEditable id="stage-scene-indicators" tag="section" label="مؤشرات مشاهد المسرح" as="div" className="mt-14 flex items-center gap-2">{scenes.map((item, index) => <VisualEditable key={`${item}-${index}`} id={`stage-scene-indicator-${index + 1}`} tag="button" label={`مؤشر المشهد ${index + 1}`} as="button" onAction={() => setScene(index)} className="h-2.5 rounded-full transition-all" style={{ width: index === scene ? 42 : 10, background: index === scene ? world.accent : "rgba(255,255,255,.2)" }} />)}</VisualEditable></VisualEditable>

      <VisualEditable id="stage-footer" tag="section" label="تذييل شاشة المسرح" as="div" className="flex items-center justify-between text-xs text-slate-500"><VisualEditable id="stage-footer-brand" tag="text" label="اسم المدرسة في تذييل المسرح" as="span" defaultText="مدارس العقيق" /><span>{String(scene + 1).padStart(2, "0")} / {String(scenes.length).padStart(2, "0")}</span></VisualEditable>
    </VisualEditable>

    {curtainActive && <VisualEditable id="stage-curtain" tag="section" label="الستارة الرقمية" as="section" className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#050609] text-center"><VisualEditable id="stage-curtain-light" tag="section" label="إضاءة الستارة الرقمية" as="div" className="pointer-events-none absolute inset-0 opacity-70" style={{ background: `radial-gradient(circle at 50% 45%, ${event.brandColor || "#c9a84c"}29, transparent 25%), radial-gradient(circle at 50% 105%, ${world.accent}18, transparent 35%)` }} /><VisualEditable id="stage-curtain-right-panel" tag="section" label="الستارة اليمنى" as="div" className={`absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-[#15100c] via-[#0d0a09] to-[#050609] transition-transform duration-[1800ms] ${curtainState === "opening" ? "translate-x-[82%]" : "translate-x-0"}`} /><VisualEditable id="stage-curtain-left-panel" tag="section" label="الستارة اليسرى" as="div" className={`absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#15100c] via-[#0d0a09] to-[#050609] transition-transform duration-[1800ms] ${curtainState === "opening" ? "-translate-x-[82%]" : "translate-x-0"}`} />
      <div className={`relative z-10 max-w-4xl px-6 transition-all duration-700 ${curtainState === "opening" ? "scale-95 opacity-0" : "scale-100 opacity-100"}`}><div className="mx-auto inline-flex items-center gap-2 rounded-full border border-amber-200/25 bg-black/20 px-4 py-2 text-xs font-black text-amber-100"><Crown size={15} /><VisualEditable id="stage-curtain-seal" tag="text" label="ختم الستارة الرقمية" as="span" defaultText={maison?.sealLabel || "دار العقيق"} /></div><VisualEditable id="stage-curtain-title" tag="text" label="عنوان كشف الستار" as="h1" defaultText={maison?.curtainTitle || "لحظة كشف الستار"} className="mt-7 text-5xl font-black leading-tight text-amber-50 md:text-8xl" /><VisualEditable id="stage-curtain-subtitle" tag="text" label="وصف كشف الستار" as="p" defaultText={maison?.curtainSubtitle || "مدارس العقيق تقدّم لحظة من موسمها."} className="mx-auto mt-6 max-w-2xl text-lg leading-9 text-slate-300 md:text-xl" /><div className="mt-10 inline-flex items-center gap-2 text-xs font-black text-amber-200/80"><LockKeyhole size={15} />{curtainState === "opening" ? "الستارة تُفتح الآن" : "بانتظار إشارة المخرج"}</div></div>
    </VisualEditable>}
  </main></VisualEditable>;
}
