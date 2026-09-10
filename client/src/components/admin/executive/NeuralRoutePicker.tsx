import React, { useState } from "react";
import {
  Link2,
  ExternalLink,
  MessageCircle,
  Phone,
  CheckCircle2,
  AlertCircle,
  Building2,
  GraduationCap,
  Sparkles,
} from "lucide-react";

interface NeuralRoutePickerProps {
  value: string;
  onChange: (route: string) => void;
  label?: string;
  placeholder?: string;
  dark?: boolean;
}

export function NeuralRoutePicker({
  value,
  onChange,
  label = "رابط التوجيه الذكي (بدون أخطاء)",
  placeholder = "اختر أو اكتب الرابط...",
  dark = true,
}: NeuralRoutePickerProps) {
  const [mode, setMode] = useState<"entities" | "whatsapp" | "custom">("entities");
  const [waPhone, setWaPhone] = useState("");
  const [waMsg, setWaMsg] = useState("");

  const ENTITY_ROUTES = [
    { group: "الصفحات الرئيسية 🏠", items: [
      { label: "الرئيسية (البوابة الرسمية)", route: "/" },
      { label: "الرئيسية > قصص وستوريات العقيق", route: "/#stories" },
      { label: "الرئيسية > شبكة البنتو التفاعلية", route: "/#bento-section" },
    ]},
    { group: "القبول والتسجيل والرسوم 💰", items: [
      { label: "بوابة القبول والتسجيل الرسمية", route: "/admissions" },
      { label: "القبول > نموذج تسجيل طالب جديد", route: "/admissions#apply-step" },
      { label: "القبول > جدول الرسوم وحاسبة الأقساط", route: "/admissions#fees-table-section" },
    ]},
    { group: "مدارسنا والصرح التعليمي 🏛️", items: [
      { label: "صفحة مدارسنا والريادة", route: "/about" },
      { label: "مدارسنا > رؤية 2030 والرسالة", route: "/about#vision" },
      { label: "مدارسنا > فريق القيادات المدرسية", route: "/about#leadership" },
    ]},
    { group: "الاعتمادات الدولية والجوائز 🛡️", items: [
      { label: "صفحة الاعتمادات والتراخيص", route: "/accreditations" },
      { label: "الاعتمادات > اعتماد كوجنيا الأمريكي (99.2%)", route: "/accreditations#cognia" },
      { label: "الاعتمادات > دروع وجوائز التميز", route: "/accreditations#awards" },
    ]},
    { group: "الإصدارات والمكتبة الرقمية 📚", items: [
      { label: "مجلة العقيق 3D التفاعلية", route: "/journal" },
      { label: "ألبوم فعاليات ومعارض العقيق", route: "/albums" },
      { label: "الأخبار والعروض المباشرة", route: "/showcase" },
      { label: "أقلام العقيق والمقالات", route: "/articles" },
      { label: "أثير العقيق (البودكاست)", route: "/podcast" },
    ]},
    { group: "البوابات والمنصات التعليمية 🚪", items: [
      { label: "منصة مدرستي للتعليم الرقمي", route: "https://schools.madrasati.sa" },
      { label: "نظام نور لنتائج وسجلات الطلاب", route: "https://noor.moe.gov.sa" },
      { label: "نظام كلاسيرا لإدارة التعلم", route: "https://me.classera.com" },
      { label: "نظام فارس للخدمات الذاتية", route: "https://sshr.moe.gov.sa" },
    ]},
  ];

  // Helper to build WhatsApp URL
  const applyWhatsApp = () => {
    let clean = waPhone.replace(/[^0-9]/g, "");
    if (clean.startsWith("05")) {
      clean = "966" + clean.substring(1);
    } else if (clean.startsWith("5")) {
      clean = "966" + clean;
    }
    const finalUrl = `https://wa.me/${clean}${waMsg ? `?text=${encodeURIComponent(waMsg)}` : ""}`;
    onChange(finalUrl);
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-xs font-black text-slate-300 block">{label}</label>}

      {/* Mode Switcher */}
      <div className="flex gap-1.5 p-1 rounded-xl bg-black/10 dark:bg-white/5 border border-current/10 max-w-md">
        <button
          type="button"
          onClick={() => setMode("entities")}
          className={`flex-1 py-1 rounded-lg text-[11px] font-black transition ${
            mode === "entities"
              ? dark ? "bg-amber-400 text-black shadow" : "bg-[#08467d] text-white shadow"
              : "text-slate-400 hover:text-white"
          }`}
        >
          أقسام الموقع 🌐
        </button>
        <button
          type="button"
          onClick={() => setMode("whatsapp")}
          className={`flex-1 py-1 rounded-lg text-[11px] font-black transition ${
            mode === "whatsapp"
              ? dark ? "bg-emerald-500 text-white shadow" : "bg-emerald-600 text-white shadow"
              : "text-slate-400 hover:text-white"
          }`}
        >
          رابط واتساب 💚
        </button>
        <button
          type="button"
          onClick={() => setMode("custom")}
          className={`flex-1 py-1 rounded-lg text-[11px] font-black transition ${
            mode === "custom"
              ? dark ? "bg-white/20 text-white shadow" : "bg-slate-300 text-slate-900 shadow"
              : "text-slate-400 hover:text-white"
          }`}
        >
          رابط مخصص 🔗
        </button>
      </div>

      {/* Mode 1: Entity Picker */}
      {mode === "entities" && (
        <div className="space-y-2">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full rounded-xl border p-3 text-xs font-bold outline-none cursor-pointer ${
              dark ? "border-white/10 bg-[#12161f] text-white" : "border-slate-300 bg-white text-slate-900"
            }`}
          >
            <option value="">-- اختر القسم أو الوجهة المستهدفة --</option>
            {ENTITY_ROUTES.map((grp, i) => (
              <optgroup key={i} label={grp.group}>
                {grp.items.map((item, j) => (
                  <option key={j} value={item.route}>
                    {item.label} ({item.route})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      )}

      {/* Mode 2: WhatsApp Generator */}
      {mode === "whatsapp" && (
        <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] font-black text-slate-400 block mb-1">رقم الجوال (سعودي)</span>
              <input
                type="text"
                placeholder="0500000000"
                value={waPhone}
                onChange={(e) => setWaPhone(e.target.value)}
                className="w-full rounded-lg border p-2 text-xs font-mono outline-none bg-white/5"
              />
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-400 block mb-1">رسالة مسبقة (اختياري)</span>
              <input
                type="text"
                placeholder="أرغب في الاستفسار عن القبول..."
                value={waMsg}
                onChange={(e) => setWaMsg(e.target.value)}
                className="w-full rounded-lg border p-2 text-xs font-bold outline-none bg-white/5"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={applyWhatsApp}
            className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <MessageCircle size={13} />
            <span>توليد وتطبيق رابط الواتساب المعتمد</span>
          </button>
        </div>
      )}

      {/* Mode 3: Custom Text */}
      {mode === "custom" && (
        <div className="space-y-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full rounded-xl border p-3 text-xs font-bold outline-none ${
              dark ? "border-white/10 bg-white/5 text-white" : "border-slate-300 bg-white text-slate-900"
            }`}
          />
        </div>
      )}

      {/* Active Link Preview Banner */}
      {value && (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/[0.02] border border-current/10 text-[11px] font-bold text-slate-400">
          <span className="truncate max-w-[80%] font-mono text-amber-400/90" dir="ltr">
            {value}
          </span>
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition"
          >
            <span>تجربة</span>
            <ExternalLink size={11} />
          </a>
        </div>
      )}
    </div>
  );
}
