import { ArrowLeft } from "lucide-react";

export default function JourneyStep({ number, title, text, icon: Icon, tone, onClick }: { number: string; title: string; text: string; icon: React.ElementType; tone: "amber" | "navy" | "emerald" | "gold"; onClick: () => void }) {
  const tones = {
    amber: "border-amber-300/25 bg-amber-300/[0.055] text-amber-200",
    navy: "border-[#08467d]/40 bg-[#08467d]/[0.1] text-[#f8ca14]",
    emerald: "border-emerald-300/25 bg-emerald-300/[0.055] text-emerald-200",
    gold: "border-amber-400/25 bg-amber-400/[0.055] text-amber-200",
  };
  return <button onClick={onClick} className="group rounded-2xl border border-white/[0.08] bg-black/25 p-4 text-right transition hover:-translate-y-0.5 hover:border-amber-300/35"><div className="flex items-start justify-between"><span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-black ${tones[tone]}`}>{number}</span><Icon size={18} className={tones[tone].split(" ").pop()} /></div><div className="mt-5 text-sm font-black text-slate-100">{title}</div><p className="mt-2 min-h-10 text-xs leading-6 text-slate-500">{text}</p><div className="mt-3 inline-flex items-center gap-1 text-[11px] font-black text-amber-200 opacity-0 transition group-hover:opacity-100">فتح الخطوة <ArrowLeft size={13} /></div></button>;
}
