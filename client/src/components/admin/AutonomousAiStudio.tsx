import React, { useState } from "react";
import { Sparkles, Mic, MicOff, Send, Wand2, CheckCircle2, ArrowRight, BookOpen, Layers } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export function AutonomousAiStudio({ dark = true }: { dark?: boolean }) {
  const [prompt, setPrompt] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<{
    type: string;
    title: string;
    summary: string;
    storyReady: boolean;
    tags: string[];
  } | null>(null);

  const handleExecutePrompt = () => {
    if (!prompt.trim()) return;
    setIsProcessing(true);
    toast.info("جاري تحليل الأمر وصياغة المحتوى بالذكاء الاصطناعي...");

    setTimeout(() => {
      setIsProcessing(false);
      setGeneratedResult({
        type: "مقال إخباري + ستوري هيرو",
        title: "تكريم أبطال العقيق في أولمبياد الرياضيات الوطني 2026",
        summary:
          "في إنجاز تعليمي متميز، حقق طلاب مدارس العقيق مراكز متقدمة على مستوى المملكة في منافسات أولمبياد الرياضيات، مجسدين معايير التميز الأكاديمي والرعاية التربوية الشاملة.",
        storyReady: true,
        tags: ["أولمبياد_الرياضيات", "تميز_العقيق", "إنجازات_الطلاب"],
      });
      toast.success("تم توليد المحتوى والستوري بنجاح وجاهز للنشر!");
    }, 1800);
  };

  const handlePublishNow = () => {
    toast.success("تم نشر المقال وتثبيت الستوري في قمة الصفحة الرئيسية بنجاح! 🚀");
    setGeneratedResult(null);
    setPrompt("");
  };

  return (
    <div
      className={`rounded-3xl border p-6 shadow-2xl relative overflow-hidden transition-all ${
        dark
          ? "bg-[#0b0f19] border-white/10 text-white shadow-black/40"
          : "bg-white border-slate-200 text-slate-900 shadow-slate-200/50"
      }`}
    >
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#f8ca14]" />
            <span className="text-xs font-black tracking-widest text-[#f8ca14]">مساعد العقيق التنفيذي (AQEEQ AI CO-PILOT)</span>
          </div>
          <h3 className="text-xl font-black mt-1">مركز الأوامر وإنتاج المحتوى الذكي</h3>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20">
          مدعوم بنماذج Gemini 2.0
        </span>
      </div>

      <p className="text-xs text-slate-400 mb-5 max-w-2xl leading-relaxed">
        اكتب أو تحدث بأي أمر باللغة الطبيعية (مثال: "اكتب مقال رسمي عن حفل التخرج مع ستوري في الهيرو" أو "أطلق خصم 10% للتسجيل المبكر")، وسيقوم الذكاء الاصطناعي بصياغة كل شيء وربطه بالمنصة فوراً.
      </p>

      {/* Prompt Input Bar */}
      <div
        className={`relative flex items-center gap-2 p-2 rounded-2xl border transition-all ${
          dark
            ? "bg-black/40 border-white/15 focus-within:border-amber-400"
            : "bg-slate-50 border-slate-300 focus-within:border-[#08467d]"
        }`}
      >
        <button
          onClick={() => {
            setIsRecording(!isRecording);
            if (!isRecording) {
              toast.info("جاري الاستماع لصوتك... تحدث الآن");
              setTimeout(() => {
                setIsRecording(false);
                setPrompt("انشر مقال تكريم الطلاب الفائزين بمسابقة الرياضيات ونزل ستوري للرئيسية");
                toast.success("تم التقاط الصوت بدقة!");
              }, 2500);
            }
          }}
          className={`p-3 rounded-xl transition ${
            isRecording
              ? "bg-red-500 text-white animate-pulse"
              : dark
              ? "bg-white/5 hover:bg-white/10 text-slate-300"
              : "bg-slate-200 text-slate-700"
          }`}
          title="تسجيل صوتي للأمر"
        >
          {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        <input
          type="text"
          placeholder="تحدث أو اكتب أمرك هنا باللغة العربية..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleExecutePrompt()}
          className="flex-1 bg-transparent border-none text-sm font-bold outline-none px-2 text-right"
        />

        <button
          onClick={handleExecutePrompt}
          disabled={isProcessing || !prompt.trim()}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-black text-xs transition disabled:opacity-50 flex items-center gap-2"
        >
          {isProcessing ? (
            <Wand2 size={16} className="animate-spin" />
          ) : (
            <>
              <span>توليد وتنفيذ</span>
              <Send size={14} className="rotate-180" />
            </>
          )}
        </button>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap gap-2 mt-3">
        {[
          "انشر مقال عن تكريم الفائزين بمسابقة الروبوت 🤖",
          "فعل خصم 10% للتسجيل المبكر في الابتدائي 🎓",
          "لخص إنجازات هذا الأسبوع في ستوري سريع ⚡",
        ].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => setPrompt(suggestion)}
            className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition ${
              dark
                ? "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                : "bg-slate-100 border-slate-200 text-slate-600 hover:text-black"
            }`}
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Generated Result Card */}
      {generatedResult && (
        <div
          className={`mt-6 p-5 rounded-2xl border animate-in fade-in slide-in-from-bottom-3 duration-300 ${
            dark ? "bg-black/50 border-amber-400/30" : "bg-amber-50/70 border-amber-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
              <CheckCircle2 size={15} /> تم التوليد بنجاح: {generatedResult.type}
            </span>
            <span className="text-[10px] font-bold bg-amber-400/20 text-amber-400 px-2.5 py-0.5 rounded-full">
              مدمج مع الستوريز 24H
            </span>
          </div>

          <h4 className="text-base font-black mt-2 text-white">{generatedResult.title}</h4>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">{generatedResult.summary}</p>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {generatedResult.tags.map((tag) => (
              <span key={tag} className="text-[10px] text-slate-400 font-bold bg-white/5 px-2 py-0.5 rounded-md">
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-current/10 justify-end">
            <button
              onClick={() => setGeneratedResult(null)}
              className="px-4 py-2 rounded-xl border border-current/20 text-xs font-bold"
            >
              إلغاء
            </button>
            <button
              onClick={handlePublishNow}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs transition flex items-center gap-2"
            >
              <span>اعتماد ونشر فوري الآن 🚀</span>
              <ArrowRight size={14} className="rotate-180" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
