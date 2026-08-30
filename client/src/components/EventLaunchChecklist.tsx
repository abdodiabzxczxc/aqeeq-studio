import { CalendarCheck2, CheckCircle2, DoorOpen, UsersRound } from "lucide-react";
import { getEventLaunchReadiness, type EventLaunchEssentials } from "@/lib/eventLaunch";

export default function EventLaunchChecklist({ event, guestCount, brandColor, onOpenSettings, onOpenGuests, onOpenCommand }: {
  event: EventLaunchEssentials;
  guestCount: number;
  brandColor: string;
  onOpenSettings: () => void;
  onOpenGuests: () => void;
  onOpenCommand: () => void;
}) {
  const readiness = getEventLaunchReadiness(event, guestCount);
  const hasDetails = readiness.items[0].done;
  const hasGates = readiness.items[2].done;
  const checks = [
    { label: "الموعد والمكان", hint: hasDetails ? "بيانات الوصول جاهزة للضيوف." : "أضف الموعد والمكان قبل مشاركة الدعوة.", done: hasDetails, icon: CalendarCheck2, action: onOpenSettings },
    { label: "قائمة الضيوف", hint: guestCount ? `${guestCount} ضيفاً في قائمة الفعالية.` : "أضف أول ضيف أو استورد القائمة.", done: guestCount > 0, icon: UsersRound, action: onOpenGuests },
    { label: "بوابات الاستقبال", hint: hasGates ? "مسارات الوصول جاهزة للتشغيل." : "حدد البوابات قبل يوم الفعالية.", done: hasGates, icon: DoorOpen, action: onOpenCommand },
  ];
  const ready = readiness.readyCount;

  return <section className="mt-6 rounded-3xl border border-white/[.08] bg-white/[.025] p-4 md:p-5" dir="rtl"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><div className="text-[11px] font-black" style={{ color: brandColor }}>فحص قبل الانطلاق</div><h2 className="mt-1 text-lg font-black text-amber-100">ماذا يحتاج الفريق قبل الخطوة التالية؟</h2></div><div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/[.1] bg-black/20 px-3 py-1.5 text-[11px] font-black text-slate-300"><CheckCircle2 size={14} style={{ color: brandColor }} />{ready} من {checks.length} جاهزة</div></div><div className="mt-4 grid gap-2 md:grid-cols-3">{checks.map((item) => { const Icon = item.icon; return <button key={item.label} onClick={item.action} className="group rounded-2xl border border-white/[.07] bg-black/15 p-3 text-right transition hover:border-amber-300/35 hover:bg-black/25"><div className="flex items-center justify-between"><Icon size={17} className={item.done ? "text-emerald-300" : "text-amber-300"} /><span className={`h-2 w-2 rounded-full ${item.done ? "bg-emerald-300" : "bg-amber-300"}`} /></div><div className="mt-3 text-sm font-black text-slate-100">{item.label}</div><div className="mt-1 text-[11px] leading-5 text-slate-500">{item.hint}</div></button>; })}</div></section>;
}
