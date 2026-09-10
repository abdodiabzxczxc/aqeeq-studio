import React, { useState } from "react";
import { Sparkles, Wand2, Copy, Check, Send, Lightbulb, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const QUICK_PROMPTS = [
  { label: "ترحيب رمضاني 🌙", text: "صغ ترحيباً راقياً بمناسبة شهر رمضان المبارك لأولياء الأمور والطلاب بمدارس العقيق" },
  { label: "اليوم الوطني 🇸🇦", text: "اكتب عنواناً ووصفاً فخماً لفعاليات اليوم الوطني ويوم التأسيس السعودي" },
  { label: "حفل التخرج 🎓", text: "صياغة إعلان لحفل تكريم خريجي الثانوية العامة لدفعة هذا العام" },
  { label: "معرض العلوم 🔬", text: "دعوة ملهمة لزيارة معرض الابتكار العلمي ومشاريع الروبوت والذكاء الاصطناعي" },
  { label: "فتح باب القبول 🎒", text: "نص حماسي وترحيبي لفتح باب التسجيل والقبول للعام الدراسي الجديد" },
];

const PRE_GENERATED_RESPONSES: Record<string, { headline: string; body: string; cta: string }> = {
  "ترحيب رمضاني 🌙": {
    headline: "أهلاً بشهر الخير والبركات في رحاب العقيق 🌙",
    body: "تهنئكم مدارس العقيق الأهلية والدولية بحلول شهر رمضان المبارك، سائلين المولى أن يجعله شهر خير وبركة ونماء لأبنائنا وبناتنا.",
    cta: "اكتشف جدول الأنشطة الرمضانية",
  },
  "اليوم الوطني 🇸🇦": {
    headline: "نحلم ونحقق — مسيرة وطن نصنعها بأيدي أجيالنا 🇸🇦",
    body: "في يومنا الوطني المجيد، تحتفي مدارس العقيق بمسيرة الفخر والعطاء، ونغرس في قلوب قادتنا الصغار حب الوطن وعزة الانتماء.",
    cta: "استكشف فعاليات الاحتفاء",
  },
  "حفل التخرج 🎓": {
    headline: "تتويج مسيرة الطموح — حفل تخرج قادة المستقبل 🎓",
    body: "بكل فخر واعتزاز، تحتفي مدارس العقيق بتخريج كوكبة وضاءة من طلابها وطالباتها، لتبدأ رحلتهم نحو آفاق الريادة والتميز.",
    cta: "شاهد بطاقات الخريجين",
  },
  "معرض العلوم 🔬": {
    headline: "ملتقى الابتكار والمستقبل — معرض العقيق للعلوم والتقنية 🔬",
    body: "تجارب حية، ابتكارات طلابية، وحلول ذكية صممها أبناؤنا في مجالات الذكاء الاصطناعي والروبوت والفضاء.",
    cta: "سجل زيارتك للمعرض",
  },
  "فتح باب القبول 🎒": {
    headline: "اصنع مستقبل ابنك في بيئة تعليمية رائدة تلهم الإبداع 🎒",
    body: "تعلن مدارس العقيق عن فتح باب القبول والتسجيل لجميع المراحل الدراسية والمسارين الأهلي والدولي مع خصومات خاصة بالتسجيل المبكر.",
    cta: "احجز مقعدك الآن",
  },
};

export function StudioAiCopilot({ onApplyText }: { onApplyText?: (text: { headline: string; body: string; cta: string }) => void }) {
  const [prompt, setPrompt] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>("ترحيب رمضاني 🌙");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const currentOutput = selectedPrompt && PRE_GENERATED_RESPONSES[selectedPrompt]
    ? PRE_GENERATED_RESPONSES[selectedPrompt]
    : {
        headline: prompt ? `عنوان مقترح: ${prompt.slice(0, 35)}…` : "اكتب عنواناً مميزاً لفعاليتك القادمة",
        body: "مدارس العقيق الأهلية والدولية بالمدينة المنورة — بيئة تعليمية ترتقي بمستويات التميز وتفتح آفاق الإبداع لكل طالب.",
        cta: "اكتشف المزيد",
      };

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      toast.success("✓ تم توليد النص بنجاح بواسطة الذكاء الاصطناعي");
    }, 800);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("تم نسخ النص");
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-4 text-white" dir="rtl">
      {/* Header Banner */}
      <div className="rounded-2xl border border-violet-400/25 bg-gradient-to-br from-violet-600/15 via-black/40 to-transparent p-3.5">
        <div className="flex items-center gap-2 text-xs font-black text-violet-300">
          <Sparkles size={15} />
          <span>مساعد العقيق الذكي (AI Studio Copilot)</span>
        </div>
        <p className="mt-1 text-[11px] leading-5 text-slate-400">
          مولد ذكي يصيغ لك عناوين وأوصافاً ورسائل ترحيبية راقية للمناسبات المدرسية بلهجة سعودية فورية.
        </p>
      </div>

      {/* Quick Prompt Pills */}
      <div>
        <label className="text-[10px] font-black text-slate-400 mb-1.5 block">قوالب ومناسبات جاهزة:</label>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map((qp) => (
            <button
              key={qp.label}
              type="button"
              onClick={() => {
                setSelectedPrompt(qp.label);
                setPrompt(qp.text);
              }}
              className={`rounded-xl border px-2.5 py-1 text-[10px] font-black transition cursor-pointer ${
                selectedPrompt === qp.label
                  ? "border-violet-400 bg-violet-400/15 text-violet-200 shadow"
                  : "border-white/10 bg-black/30 text-slate-400 hover:text-white"
              }`}
            >
              {qp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Input */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 block">أو اكتب طلبك بالتفصيل:</label>
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="مثلاً: صياغة دعوة لحضور المعرض الفني السنوي لطلاب المرحلة الابتدائية…"
            className="w-full rounded-2xl border border-white/10 bg-black/40 p-3 text-xs leading-5 text-white outline-none placeholder:text-slate-600 focus:border-violet-400 min-h-[70px]"
          />
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="mt-2 flex items-center justify-center gap-1.5 w-full rounded-xl bg-violet-500 hover:bg-violet-400 px-3 py-2 text-xs font-black text-white transition disabled:opacity-40"
          >
            {isGenerating ? <RefreshCw className="animate-spin" size={14} /> : <Wand2 size={14} />}
            <span>{isGenerating ? "جارٍ التوليد الذكي…" : "توليد المحتوى بالذكاء الاصطناعي"}</span>
          </button>
        </div>
      </div>

      {/* Generated Result Card */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5 space-y-3">
        <div className="flex items-center justify-between text-[11px] font-black text-violet-300">
          <span>النتيجة المولدة:</span>
          <button
            type="button"
            onClick={() => {
              onApplyText?.(currentOutput);
              toast.success("✓ تم تطبيق النص المولد على المحرر مباشرة!");
            }}
            className="text-[10px] bg-violet-500/20 text-violet-300 border border-violet-400/30 px-2 py-0.5 rounded-lg hover:bg-violet-500/30 transition"
          >
            تطبيق على العنصر المحدد
          </button>
        </div>

        {/* Headline */}
        <div className="rounded-xl border border-white/5 bg-black/30 p-2.5">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold mb-1">
            <span>العنوان الرئيسي</span>
            <button
              type="button"
              onClick={() => copyToClipboard(currentOutput.headline, "headline")}
              className="text-slate-400 hover:text-white"
            >
              {copiedField === "headline" ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            </button>
          </div>
          <div className="text-xs font-black text-white">{currentOutput.headline}</div>
        </div>

        {/* Body */}
        <div className="rounded-xl border border-white/5 bg-black/30 p-2.5">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold mb-1">
            <span>الوصف والتفاصيل</span>
            <button
              type="button"
              onClick={() => copyToClipboard(currentOutput.body, "body")}
              className="text-slate-400 hover:text-white"
            >
              {copiedField === "body" ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            </button>
          </div>
          <div className="text-[11px] leading-5 text-slate-300">{currentOutput.body}</div>
        </div>

        {/* CTA */}
        <div className="rounded-xl border border-white/5 bg-black/30 p-2.5">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold mb-1">
            <span>نص زر الإجراء (CTA)</span>
            <button
              type="button"
              onClick={() => copyToClipboard(currentOutput.cta, "cta")}
              className="text-slate-400 hover:text-white"
            >
              {copiedField === "cta" ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            </button>
          </div>
          <div className="text-xs font-black text-amber-300">{currentOutput.cta}</div>
        </div>
      </div>
    </div>
  );
}
