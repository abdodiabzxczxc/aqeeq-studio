import React, { useState } from "react";
import { Layers, Eye, EyeOff, Edit3, ArrowUp, ArrowDown, ExternalLink, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";

interface BentoCardConfig {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  route: string;
  span: string; // Tailwind grid span
  color: string;
  enabled: boolean;
  icon: string;
}

export function BentoGridManager({ dark = true }: { dark?: boolean }) {
  const [cards, setCards] = useState<BentoCardConfig[]>([
    {
      id: "albums",
      title: "استوديو الذكريات والألبومات الحية",
      subtitle: "أكثر من 500 صورة موثقة لأنشطة ومسيرات طلاب مدارس العقيق",
      badge: "توثيق حي 📸",
      route: "/albums",
      span: "col-span-1 md:col-span-2",
      color: "#10b981",
      enabled: true,
      icon: "📸",
    },
    {
      id: "journal",
      title: "الأعداد الدورية لمجلة العقيق 3D",
      subtitle: "تصفح أعداد المجلة المدرسية بتقنية التقليب الثلاثي الأبعاد التفاعلي",
      badge: "العدد الأخير 📖",
      route: "/journal",
      span: "col-span-1",
      color: "#eab308",
      enabled: true,
      icon: "📖",
    },
    {
      id: "podcast",
      title: "بودكاست وأثير العقيق الصوتي",
      subtitle: "حوارات قيادية، إذاعة الصباح، وإبداعات طلابية مسموعة",
      badge: "جديد الحلقات 🎙️",
      route: "/podcast",
      span: "col-span-1",
      color: "#a855f7",
      enabled: true,
      icon: "🎙️",
    },
    {
      id: "admissions",
      title: "حاسبة الأقساط وبوابة القبول والتسجيل",
      subtitle: "احسب قسطك السنوي فوراً بخصومات الأشقاء والتسجيل المبكر",
      badge: "تقديم فوري 🎓",
      route: "/admissions",
      span: "col-span-1 md:col-span-2",
      color: "#06b6d4",
      enabled: true,
      icon: "🎓",
    },
    {
      id: "accreditations",
      title: "الاعتماد الأكاديمي الدولي Cognia",
      subtitle: "مدارس معتمدة بأعلى معايير الجودة والتميز المؤسسي",
      badge: "اعتماد رسمي 🏆",
      route: "/accreditations",
      span: "col-span-1",
      color: "#f59e0b",
      enabled: true,
      icon: "🏆",
    },
    {
      id: "showcase",
      title: "منصة الأخبار والأنشطة الإثرائية",
      subtitle: "تغطيات مصورة ومنشورات X الرسمية لفعاليات المدارس",
      badge: "تحديثات مستمرة 📢",
      route: "/showcase",
      span: "col-span-1",
      color: "#ec4899",
      enabled: true,
      icon: "📢",
    },
  ]);

  const toggleCard = (id: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
    toast.success("تم تحديث حالة ظهور الكارت في الصفحة الرئيسية!");
  };

  const moveCard = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= cards.length) return;
    const newCards = [...cards];
    const temp = newCards[index];
    newCards[index] = newCards[targetIdx];
    newCards[targetIdx] = temp;
    setCards(newCards);
    toast.success("تم تعديل ترتيب كروت البنتو!");
  };

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
            <span className="text-xl">🍱</span>
            <h3 className="text-xl font-black">شبكة البنتو التفاعلية بالرئيسية (Bento Grid Manager)</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            تحكم كامل في ترتيب وظهور كروت البنتو الرئيسية، تخصيص شاراتها، وتوجيه روابطها لخدمة أهداف المنصة.
          </p>
        </div>

        <button
          onClick={() => {
            window.open("/", "_blank");
          }}
          className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-black font-black text-xs transition flex items-center gap-2"
        >
          <span>معاينة الرئيسية لايف</span>
          <ExternalLink size={14} />
        </button>
      </div>

      {/* Bento Cards List */}
      <div className="space-y-3">
        {cards.map((card, idx) => (
          <div
            key={card.id}
            className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
              card.enabled
                ? dark
                  ? "bg-black/40 border-white/10"
                  : "bg-slate-50 border-slate-200"
                : "opacity-50 bg-black/20 border-white/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md shrink-0"
                style={{ background: `${card.color}22`, color: card.color, border: `1px solid ${card.color}44` }}
              >
                {card.icon}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-white">{card.title}</h4>
                  <span
                    className="text-[10px] font-black px-2 py-0.5 rounded-full"
                    style={{ background: `${card.color}25`, color: card.color }}
                  >
                    {card.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">{card.subtitle}</p>
              </div>
            </div>

            {/* Actions: Reorder, Toggle Visibility & Edit */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                disabled={idx === 0}
                onClick={() => moveCard(idx, "up")}
                className="p-2 rounded-xl border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition disabled:opacity-30"
                title="تحريك لأعلى"
              >
                <ArrowUp size={14} />
              </button>

              <button
                disabled={idx === cards.length - 1}
                onClick={() => moveCard(idx, "down")}
                className="p-2 rounded-xl border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition disabled:opacity-30"
                title="تحريك لأسفل"
              >
                <ArrowDown size={14} />
              </button>

              <button
                onClick={() => toggleCard(card.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  card.enabled
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-white/5 text-slate-400 border border-white/10"
                }`}
              >
                {card.enabled ? <Eye size={13} /> : <EyeOff size={13} />}
                <span>{card.enabled ? "ظاهر" : "مخفي"}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
