import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import {
  Bot,
  Sparkles,
  Send,
  X,
  RotateCcw,
  BookOpen,
  Camera,
  PenTool,
  Radio,
  ExternalLink,
  ChevronDown,
  ArrowUpLeft,
  GraduationCap,
  Layers,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Zap,
  Key,
  Settings,
  ShieldCheck,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useLocation } from "wouter";


type ActionShortcut = {
  label: string;
  url: string;
  icon: string;
};

type ChatMsg = {
  role: "user" | "assistant";
  content: string;
  suggestedQuestions?: string[];
  actionShortcuts?: ActionShortcut[];
};

const INITIAL_MESSAGE: ChatMsg = {
  role: "assistant",
  content: `مرحباً بك في **مدارس العقيق الأهلية والدولية بالمدينة المنورة**! 💎🤖
أنا مستشارك التعليمي والذكاء الاصطناعي التفاعلي الفائق. أنا جاهز للحديث معك بطلاقة وفهم عميق لكل تفاصيل المدارس، ومقارنة المناهج والمسارات، وحساب الخصومات، والإجابة على أي سؤال تربوي أو تقني.

كيف يمكنني مساعدتك اليوم؟`,
  suggestedQuestions: [
    "قارن لي بين المسار الوطني والدبلومة الأمريكية",
    "ما هي شروط ورسوم القبول وخصومات الإخوة؟",
    "كيف أبحث عن صوري في حفلات التخرج بالذكاء الاصطناعي؟",
    "ما هي برامج الموهبة ونوادي الروبوت بالمدارس؟",
  ],
  actionShortcuts: [
    { label: "📖 مجلة العقيق التفاعلية", url: "/journal", icon: "journal" },
    { label: "📸 ألبومات الحفلات والبحث بالوجه", url: "/albums", icon: "albums" },
    { label: "✍️ مقالات الطلاب والمعلمين", url: "/articles", icon: "articles" },
    { label: "🎙️ إذاعة وبودكاست العقيق", url: "/podcast", icon: "podcast" },
  ],
};

function renderFormattedMessage(text: string, isDark: boolean = true) {
  const lines = text.split("\n");
  return lines.map((line, idx) => {
    let formatted = line;

    if (formatted.startsWith("### ")) {
      return (
        <h4 key={idx} className={`text-xs sm:text-sm font-black mt-2.5 mb-1 flex items-center gap-1 ${
          isDark ? "text-amber-300" : "text-amber-700"
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${isDark ? "bg-amber-400" : "bg-amber-500"}`} />
          <span>{formatted.replace("### ", "")}</span>
        </h4>
      );
    }
    if (formatted.startsWith("## ")) {
      return (
        <h3 key={idx} className={`text-sm sm:text-base font-black mt-3 mb-1.5 pb-1 border-b ${
          isDark ? "text-amber-400 border-white/10" : "text-amber-800 border-slate-200"
        }`}>
          {formatted.replace("## ", "")}
        </h3>
      );
    }
    if (formatted.startsWith("• ") || formatted.startsWith("- ")) {
      const bulletContent = formatted.replace(/^[•\-]\s*/, "");
      return (
        <div key={idx} className={`flex items-start gap-2 my-1 leading-relaxed ${
          isDark ? "text-slate-200" : "text-slate-700"
        }`}>
          <span className={`text-sm shrink-0 leading-none mt-1 ${isDark ? "text-amber-400" : "text-amber-600"}`}>✦</span>
          <span className="flex-1">{renderInlineBoldAndLinks(bulletContent, isDark)}</span>
        </div>
      );
    }

    if (!formatted.trim()) {
      return <div key={idx} className="h-2" />;
    }

    return (
      <p key={idx} className={`my-1 leading-relaxed ${isDark ? "text-slate-200" : "text-slate-700"}`}>
        {renderInlineBoldAndLinks(formatted, isDark)}
      </p>
    );
  });
}

function renderInlineBoldAndLinks(str: string, isDark: boolean = true) {
  const parts = str.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className={`font-black ${isDark ? "text-amber-300" : "text-amber-800"}`}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, label, url] = linkMatch;
      return (
        <a
          key={index}
          href={url}
          target={url.startsWith("http") ? "_blank" : undefined}
          rel="noreferrer"
          className={`font-black underline inline-flex items-center gap-0.5 mx-0.5 ${
            isDark ? "text-amber-300 hover:text-white" : "text-amber-700 hover:text-amber-900"
          }`}
        >
          <span>{label}</span>
          <ArrowUpLeft size={11} />
        </a>
      );
    }
    return part;
  });
}

export function AqeeqAiAssistantWidget() {
  const { theme } = useAqeeqStudioTheme();
  const isDark = theme === "dark";


  const [isOpen, setIsOpen] = useState(false);
  const [activeUiStyle, setActiveUiStyle] = useState<"siri" | "swiss">(() => {
    return (localStorage.getItem("aqeeq_ai_ui_style") as "siri" | "swiss") || "siri";
  });
  const [isSiriTextOpen, setIsSiriTextOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  const openWithStyle = (style: "siri" | "swiss") => {
    setActiveUiStyle(style);
    localStorage.setItem("aqeeq_ai_ui_style", style);
    setIsOpen(true);
  };
  const [geminiApiKeyInput, setGeminiApiKeyInput] = useState("");
  const [inputPrompt, setInputPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([INITIAL_MESSAGE]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [, navigate] = useLocation();

  const utils = trpc.useUtils();
  const { data: aiStatus, refetch: refetchAiStatus } = trpc.schoolAi.getAiStatus.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const saveKeyMutation = trpc.schoolAi.testAndSaveApiKey.useMutation({
    onSuccess: (res) => {
      toast.success(res.message);
      setIsKeyModalOpen(false);
      void refetchAiStatus();
      void utils.schoolAi.getAiStatus.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "فشل التحقق من المفتاح");
    },
  });

  const askAiMutation = trpc.schoolAi.ask.useMutation({
    onSuccess: (data: any) => {
      const newMsg: ChatMsg = {
        role: "assistant",
        content: data.reply,
        suggestedQuestions: data.suggestedQuestions,
        actionShortcuts: data.actionShortcuts,
      };
      setMessages((prev) => [...prev, newMsg]);
    },
    onError: () => {
      const fallbackMsg: ChatMsg = {
        role: "assistant",
        content:
          "يسعدنا دائماً خدمتكم! للتواصل المباشر مع إدارة القبول والتسجيل بمدارس العقيق، يرجى زيارة موقعنا الرسمي https://aqeeq.edu.sa أو زيارة مقر المدارس بالمدينة المنورة.",
        suggestedQuestions: ["ما هي شروط القبول والتسجيل؟", "كيف أتصفح مجلة العقيق؟"],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    },
  });

  useEffect(() => {
    stopSpeaking();
  }, []);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      stopSpeaking();
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend?: string) => {

    const text = (textToSend || inputPrompt).trim();
    if (!text || askAiMutation.isPending) return;

    stopSpeaking();
    const newHistory = [...messages, { role: "user" as const, content: text }];
    setMessages(newHistory);
    setInputPrompt("");

    askAiMutation.mutate({
      prompt: text,
      history: newHistory.map((m) => ({ role: m.role, content: m.content })),
    });
  };

  const handleReset = () => {
    stopSpeaking();
    setMessages([INITIAL_MESSAGE]);
    toast.success("تم بدء محادثة جديدة");
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("تم نسخ الرد إلى الحافظة");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleShortcutClick = (url: string) => {
    if (url.startsWith("http")) {
      window.open(url, "_blank");
    } else {
      navigate(url);
    }
  };

  return (
    <div dir="rtl" className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-3 sm:left-6 z-50 font-[Tajawal,sans-serif]">
      {/* ── 1. Permanent Luxury Spatial Morphing Orb (When Closed) ── */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            stopSpeaking();
          }}
          className={`group relative flex items-center rounded-full border-2 p-1.5 sm:p-2 shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:scale-105 ${
            isDark
              ? "border-amber-400/60 bg-[#070b16]/95 text-white shadow-[0_10px_35px_rgba(248,202,20,0.35)]"
              : "border-amber-400/80 bg-white/95 text-slate-900 shadow-[0_10px_35px_rgba(248,202,20,0.25)]"
          }`}
          title="مستشار العقيق الذكي"
        >
          <div className="relative grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-full bg-gradient-to-tr from-[#f8ca14] to-yellow-300 text-slate-950 font-black shadow-md shrink-0">
            <Bot size={22} className="group-hover:rotate-12 transition-transform duration-300" />
            <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-950 animate-pulse bg-emerald-400" />
          </div>

          {/* Dynamic Morphing Expansion on Hover */}
          <div className="max-w-0 overflow-hidden opacity-0 group-hover:max-w-[170px] group-hover:opacity-100 group-hover:px-2.5 transition-all duration-300 whitespace-nowrap text-right hidden sm:block">
            <div className="flex items-center gap-1">
              <span className="text-xs font-black block text-amber-500 leading-tight">مستشار العقيق الذكي</span>
              <Sparkles size={11} className="text-amber-400" />
            </div>
            <span className="text-[10px] text-slate-400 font-bold block leading-tight">محادثة فورية ذكية 💬</span>
          </div>
        </button>
      )}

      {/* ── 2. Compact Unified Chat Spatial Card (When Open) ─── */}
      {isOpen && (
        <div
          className={`flex flex-col transition-all duration-300 border-2 aq-siri-glow shadow-2xl backdrop-blur-3xl animate-in fade-in zoom-in-95 overflow-hidden w-[calc(100vw-1.5rem)] sm:w-[380px] h-[520px] max-h-[82vh] rounded-[2.2rem] ${
            isDark
              ? "bg-[#070a14]/95 text-white border-amber-400/50 shadow-[0_25px_80px_rgba(0,0,0,0.9)]"
              : "bg-white/98 text-slate-900 border-amber-300/80 shadow-[0_25px_80px_rgba(248,202,20,0.18)]"
          }`}
        >
          {/* Top Liquid Neon Mesh Line */}
          <div className="aq-fluid-mesh h-1.5 w-full shrink-0" />

          {/* Card Header */}
          <div className={`flex items-center justify-between px-3.5 py-2.5 border-b transition-colors shrink-0 ${
            isDark
              ? "border-white/10 bg-gradient-to-r from-[#091020] via-[#0d172e] to-[#091020] text-white"
              : "border-slate-200/90 bg-gradient-to-r from-slate-50 via-white to-amber-50/40 text-slate-900"
          }`}>
            {/* Right: Branding & Status */}
            <div className="flex items-center gap-2">
              <div className="relative grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-tr from-[#f8ca14] to-yellow-300 text-slate-950 font-black shadow-sm shrink-0">
                <Bot size={17} />
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 border border-slate-950 animate-pulse" />
              </div>
              <div className="text-right">
                <h4 className={`text-xs font-black tracking-tight leading-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                  مستشار العقيق الذكي
                </h4>
                <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>متصل • محادثة ذكية 💬</span>
                </p>
              </div>
            </div>

            {/* Left: Quick Actions (Reset, API Key, Close) */}
            <div className="flex items-center gap-1">
              {/* Reset Conversation */}
              <button
                type="button"
                onClick={handleReset}
                className={`grid h-7 w-7 place-items-center rounded-lg transition ${
                  isDark ? "text-slate-400 hover:text-red-400 hover:bg-red-500/10" : "text-slate-500 hover:text-red-500 hover:bg-red-50"
                }`}
                title="بدء محادثة جديدة"
              >
                <RotateCcw size={13} />
              </button>

              {/* API Key Modal Button */}
              <button
                type="button"
                onClick={() => setIsKeyModalOpen(true)}
                className={`grid h-7 w-7 place-items-center rounded-lg transition ${
                  aiStatus?.hasLiveGemini
                    ? "text-emerald-500"
                    : isDark ? "text-slate-500 hover:text-amber-400" : "text-slate-400 hover:text-amber-600"
                }`}
                title="إعدادات الذكاء الحي (API)"
              >
                <Key size={13} />
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  setIsOpen(false);
                }}
                className={`grid h-7 w-7 place-items-center rounded-lg transition ${
                  isDark ? "text-slate-400 hover:text-white hover:bg-white/10" : "text-slate-500 hover:text-slate-900 hover:bg-black/5"
                }`}
                title="إغلاق"
              >
                <X size={15} />
              </button>
            </div>
          </div>


          {/* Card Body: Unified Scrollable Chat & Live Interaction Stream */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide text-right">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                  msg.role === "user" ? "items-start" : "items-end"
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs font-medium leading-relaxed shadow-xs relative transition-all ${
                    msg.role === "user"
                      ? "bg-gradient-to-tr from-amber-500 via-[#f8ca14] to-yellow-300 text-slate-950 font-bold rounded-br-xs shadow-amber-500/20"
                      : isDark
                      ? "border rounded-bl-xs text-white border-white/10 bg-[#0c1222]"
                      : "border rounded-bl-xs text-slate-900 border-slate-200/90 bg-slate-50/90"
                  }`}
                >
                  <p className="whitespace-pre-wrap selection:bg-amber-400 selection:text-slate-950">
                    {msg.content}
                  </p>

                  {/* Assistant Actions Bar (Copy Only) */}
                  {msg.role === "assistant" && (
                    <div className={`mt-2 pt-1.5 flex items-center justify-between border-t border-current/10 text-[10px] ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}>
                      <span className="text-[10px] opacity-60">مدارس العقيق الأهلية والدولية</span>

                      <button
                        type="button"
                        onClick={() => handleCopy(msg.content, i)}
                        className="hover:text-amber-500 transition p-0.5 flex items-center gap-1 font-bold"
                        title="نسخ الرد"
                      >
                        {copiedIndex === i ? (
                          <>
                            <Check size={11} className="text-emerald-500" />
                            <span className="text-emerald-500">تم النسخ</span>
                          </>
                        ) : (
                          <>
                            <Copy size={11} />
                            <span>نسخ</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Action Shortcuts on Assistant Replies */}
                {i > 0 && msg.actionShortcuts && msg.actionShortcuts.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1 justify-end">
                    {msg.actionShortcuts.map((act, ai) => (
                      <button
                        key={ai}
                        type="button"
                        onClick={() => handleShortcutClick(act.url)}
                        className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1 text-[10px] font-bold transition shadow-xs ${
                          isDark
                            ? "border-amber-400/40 bg-amber-400/10 text-amber-300 hover:bg-amber-400 hover:text-slate-950"
                            : "border-amber-400/60 bg-amber-50 text-amber-800 hover:bg-amber-400 hover:text-slate-950"
                        }`}
                      >
                        <span>{act.label}</span>
                        <ArrowUpLeft size={10} />
                      </button>
                    ))}
                  </div>
                )}

                {/* Follow-up Questions */}
                {i > 0 && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && i === messages.length - 1 && (
                  <div className="mt-2 flex flex-wrap gap-1 justify-end">
                    {msg.suggestedQuestions.map((q, qi) => (
                      <button
                        key={qi}
                        type="button"
                        onClick={() => handleSend(q)}
                        className={`rounded-xl border px-2.5 py-1 text-[10px] font-bold transition text-right ${
                          isDark
                            ? "border-white/10 bg-black/60 text-amber-300 hover:border-amber-400 hover:bg-amber-400 hover:text-slate-950"
                            : "border-slate-200 bg-white text-amber-800 hover:border-amber-400 hover:bg-amber-400 hover:text-slate-950 shadow-xs"
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* 3 Clean Minimalist Swiss Service Pills (On first message) */}
            {messages.length === 1 && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2 pb-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {[
                  { icon: "🎓", text: "شروط ورسوم القبول والتسجيل" },
                  { icon: "📸", text: "البحث عن صوري بالوجه في الألبومات" },
                  { icon: "🎙️", text: "مجلة وبودكاست العقيق" },
                ].map((card, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(card.text)}
                    className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all duration-200 hover:scale-105 flex items-center gap-1.5 shadow-xs ${
                      isDark
                        ? "border-white/10 bg-white/5 hover:border-amber-400/50 hover:bg-amber-400/10 text-slate-200"
                        : "border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50 text-slate-800 shadow-sm"
                    }`}
                  >
                    <span className="text-xs">{card.icon}</span>
                    <span>{card.text}</span>
                  </button>
                ))}
              </div>
            )}

            {/* AI Thinking Indicator */}
            {askAiMutation.isPending && (
              <div className={`flex items-center gap-2 p-2.5 rounded-2xl border text-xs font-bold w-fit animate-pulse ${
                isDark ? "border-amber-400/30 bg-amber-400/10 text-amber-300" : "border-amber-400/40 bg-amber-50 text-amber-800"
              }`}>
                <Sparkles size={14} className="animate-spin text-amber-500 shrink-0" />
                <span>المستشار يفكر ويصيغ الرد... ⚡</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Unified Bottom Dock: Pure Text Chat */}
          <div className={`p-2.5 sm:p-3 border-t transition-colors shrink-0 ${
            isDark ? "border-white/10 bg-[#080d1a]" : "border-slate-200/90 bg-slate-50/90"
          }`}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              {/* Text Input */}
              <input
                ref={inputRef}
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="اكتب استفسارك وسأجيبك فوراً..."
                className={`flex-1 rounded-xl border px-3.5 py-2.5 text-xs font-bold outline-none transition ${
                  isDark
                    ? "border-white/10 bg-white/5 text-white placeholder-slate-400 focus:border-amber-400 focus:bg-white/10"
                    : "border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-amber-500 shadow-inner"
                }`}
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputPrompt.trim() || askAiMutation.isPending}
                className="h-10 w-10 shrink-0 grid place-items-center rounded-xl bg-gradient-to-tr from-[#f8ca14] to-yellow-300 text-slate-950 font-black shadow hover:opacity-95 disabled:opacity-30 disabled:cursor-not-allowed transition active:scale-95"
                title="إرسال"
              >
                <Send size={15} />
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Google Gemini Key Setup Dialog */}
      <Dialog open={isKeyModalOpen} onOpenChange={setIsKeyModalOpen}>
        <DialogContent
          className={`max-w-lg rounded-[2.5rem] border p-6 sm:p-8 text-right shadow-2xl ${
            isDark
              ? "border-amber-400/40 bg-[#0a0d18] text-white"
              : "border-slate-200 bg-white text-slate-900"
          }`}
          dir="rtl"
        >
          <DialogHeader className={`text-right border-b pb-4 ${isDark ? "border-white/10" : "border-slate-200"}`}>
            <DialogTitle className={`text-lg font-black flex items-center gap-2 ${isDark ? "text-amber-300" : "text-amber-800"}`}>
              <Sparkles size={20} className="text-amber-400" />
              <span>ربط الذكاء الاصطناعي الحي (Google Gemini 3.6 Flash)</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2 text-xs leading-relaxed">
            <p className={isDark ? "text-slate-300" : "text-slate-600"}>
              لجعل المساعد يتحدث معك بحرية وذكاء فائق تماماً مثل النماذج العالمية وبدون أي إجابات محفوظة مسبقاً، يمكنك ربط مفتاح API مجاني من Google:
            </p>

            <div className={`rounded-2xl border p-3.5 space-y-2 ${
              isDark ? "border-amber-400/20 bg-amber-400/5" : "border-amber-300/40 bg-amber-50/60"
            }`}>
              <p className={`font-bold flex items-center gap-1.5 ${isDark ? "text-amber-300" : "text-amber-800"}`}>
                <Key size={14} />
                <span>كيف تحصل على المفتاح المجاني في 10 ثوانٍ؟</span>
              </p>
              <ol className={`list-decimal list-inside space-y-1 text-[11px] ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                <li>افتح موقع Google AI Studio: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-amber-500 font-bold underline">aistudio.google.com/app/apikey ↗</a></li>
                <li>سجل دخول بحساب Google واضغط على <strong>Create API Key</strong>.</li>
                <li>انسخ المفتاح والصقه في الحقل أدناه واضغط <strong>تفعيل وحفظ</strong>.</li>
              </ol>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-black text-slate-400">مفتاح Google Gemini API Key</label>
              <Input
                type="password"
                value={geminiApiKeyInput}
                onChange={(e) => setGeminiApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className={`font-mono text-xs rounded-xl ${
                  isDark
                    ? "bg-black/60 border-white/15 text-white"
                    : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-[11px] text-slate-400">
                {aiStatus?.hasLiveGemini ? (
                  <span className="text-emerald-500 font-bold flex items-center gap-1">
                    <ShieldCheck size={14} />
                    <span>الذكاء الاصطناعي الحي مفعّل حالياً بنجاح!</span>
                  </span>
                ) : (
                  <span className="text-slate-400">الحالة الحالية: محرك المعرفة الأساسي</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!geminiApiKeyInput.trim()) {
                    toast.error("يرجى إدخال مفتاح API");
                    return;
                  }
                  saveKeyMutation.mutate({ apiKey: geminiApiKeyInput });
                }}
                disabled={saveKeyMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#f8ca14] hover:bg-yellow-400 text-black px-5 py-2.5 text-xs font-black transition shadow-lg shadow-[#f8ca14]/20"
              >
                {saveKeyMutation.isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>جاري التحقق والتفعيل...</span>
                  </>
                ) : (
                  <>
                    <Check size={15} />
                    <span>تفعيل الذكاء الحي فوراً</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
