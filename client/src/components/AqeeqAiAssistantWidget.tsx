import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
أنا مستشارك التعليمي الذكي فائق التطور. أعرف كل تفاصيل المدارس من مرحلة رياض الأطفال حتى الثانوي والمسار الدولي والدبلومة الأمريكية.

كيف يمكنني خدمتك اليوم؟ يمكنك سؤالي عن أي شيء أو اختيار أحد المواضيع المقترحة:`,
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

function renderFormattedMessage(text: string) {
  const lines = text.split("\n");
  return lines.map((line, idx) => {
    let formatted = line;

    if (formatted.startsWith("### ")) {
      return (
        <h4 key={idx} className="text-xs sm:text-sm font-black text-amber-300 mt-2.5 mb-1 flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          <span>{formatted.replace("### ", "")}</span>
        </h4>
      );
    }
    if (formatted.startsWith("## ")) {
      return (
        <h3 key={idx} className="text-sm sm:text-base font-black text-amber-400 mt-3 mb-1.5 border-b border-white/10 pb-1">
          {formatted.replace("## ", "")}
        </h3>
      );
    }
    if (formatted.startsWith("• ") || formatted.startsWith("- ")) {
      const bulletContent = formatted.replace(/^[•\-]\s*/, "");
      return (
        <div key={idx} className="flex items-start gap-2 my-1 text-slate-200 leading-relaxed">
          <span className="text-amber-400 text-sm shrink-0 leading-none mt-1">✦</span>
          <span className="flex-1">{renderInlineBoldAndLinks(bulletContent)}</span>
        </div>
      );
    }

    if (!formatted.trim()) {
      return <div key={idx} className="h-2" />;
    }

    return (
      <p key={idx} className="my-1 leading-relaxed">
        {renderInlineBoldAndLinks(formatted)}
      </p>
    );
  });
}

function renderInlineBoldAndLinks(str: string) {
  const parts = str.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-black text-amber-300">
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
          className="text-amber-300 font-black underline hover:text-white inline-flex items-center gap-0.5 mx-0.5"
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
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputPrompt, setInputPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([INITIAL_MESSAGE]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [, navigate] = useLocation();

  const askAiMutation = trpc.schoolAi.ask.useMutation({
    onSuccess: (data: any) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
          suggestedQuestions: data.suggestedQuestions,
          actionShortcuts: data.actionShortcuts,
        },
      ]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "يسعدنا دائماً خدمتكم! للتواصل المباشر مع إدارة القبول والتسجيل بمدارس العقيق، يرجى زيارة موقعنا الرسمي https://aqeeq.edu.sa أو زيارة مقر المدارس بالمدينة المنورة.",
          suggestedQuestions: ["ما هي شروط القبول والتسجيل؟", "كيف أتصفح مجلة العقيق؟"],
        },
      ]);
    },
  });

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || askAiMutation.isPending) return;

    const newHistory = [...messages, { role: "user" as const, content: text }];
    setMessages(newHistory);
    setInputPrompt("");

    askAiMutation.mutate({
      prompt: text,
      history: newHistory.map((m) => ({ role: m.role, content: m.content })),
    });
  };

  const handleReset = () => {
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
    <div dir="rtl" className="fixed bottom-5 left-5 z-50 font-[Tajawal,sans-serif]">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 rounded-full border border-amber-400/50 bg-gradient-to-r from-[#070b14] via-[#0d1527] to-[#121c33] p-2.5 sm:px-4 sm:py-3 text-white shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-amber-400 hover:shadow-[0_0_30px_rgba(248,202,20,0.4)]"
        >
          <div className="relative grid h-11 w-11 place-items-center rounded-full bg-gradient-to-tr from-[#f8ca14] to-amber-300 text-slate-950 font-black shadow-lg">
            <Bot size={24} className="group-hover:rotate-12 transition-transform duration-300" />
            <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse" />
          </div>

          <div className="hidden sm:block text-right">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-amber-300">مساعد العقيق الذكي</span>
              <Sparkles size={12} className="text-amber-400" />
            </div>
            <p className="text-[10px] text-slate-300 font-bold">اسألني أي شيء عن المدارس 🤖</p>
          </div>
        </button>
      )}

      {/* Interactive Luxury Chat Window */}
      {isOpen && (
        <div
          className={`flex flex-col transition-all duration-300 rounded-[2rem] border border-amber-400/40 bg-[#070a12]/95 text-white shadow-[0_25px_70px_rgba(0,0,0,0.85)] backdrop-blur-2xl ring-1 ring-amber-400/20 animate-in zoom-in-95 overflow-hidden ${
            isExpanded
              ? "w-[96vw] sm:w-[720px] h-[85vh] max-h-[820px]"
              : "w-[94vw] sm:w-[460px] h-[600px] max-h-[88vh]"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-[#0d1424] via-[#101b33] to-[#0a101d] px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="relative grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-tr from-[#f8ca14] to-yellow-300 text-slate-950 font-black shadow-md">
                <Bot size={22} />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0f1424]" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                  <span>مساعد مدارس العقيق الذكي</span>
                  <span className="rounded-md bg-amber-400/20 border border-amber-400/40 px-1.5 py-0.2 text-[9px] text-amber-300 font-mono">
                    GEMINI PRO
                  </span>
                </h3>
                <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>متصل وجاهز للإجابة الفورية</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
                title={isExpanded ? "تصغير الحجم" : "تكبير الشاشة"}
              >
                {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
                title="إعادة بدء المحادثة"
              >
                <RotateCcw size={14} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
                title="تصغير النافذة"
              >
                <ChevronDown size={20} />
              </button>
            </div>
          </div>

          {/* Quick Shortcuts Bar */}
          <div className="flex items-center gap-1.5 border-b border-white/5 bg-black/40 px-3 py-2 overflow-x-auto scrollbar-none">
            {[
              { label: "📖 المجلة", url: "/journal" },
              { label: "📸 الألبومات والبحث بالوجه", url: "/albums" },
              { label: "✍️ المقالات", url: "/articles" },
              { label: "🎙️ البودكاست", url: "/podcast" },
              { label: "🌐 القبول والتسجيل", url: "https://aqeeq.edu.sa" },
            ].map((sc, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleShortcutClick(sc.url)}
                className="shrink-0 rounded-lg border border-white/10 bg-white/5 hover:bg-[#f8ca14] hover:text-black px-2.5 py-1 text-[10px] font-black text-slate-300 transition"
              >
                {sc.label}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-right scrollbar-thin">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-start" : "items-end"}`}>
                <div
                  className={`group relative max-w-[92%] rounded-2xl p-4 text-xs sm:text-[13px] font-medium leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-bold rounded-br-none shadow-lg"
                      : "bg-[#111728] text-slate-100 border border-white/10 rounded-bl-none shadow-md"
                  }`}
                >
                  {msg.role === "user" ? msg.content : renderFormattedMessage(msg.content)}

                  {msg.role === "assistant" && (
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.content, i)}
                      className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-amber-300 transition p-1 rounded-lg bg-black/40"
                      title="نسخ الرد"
                    >
                      {copiedIndex === i ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    </button>
                  )}
                </div>

                {/* Dynamic Action Buttons in assistant replies */}
                {msg.actionShortcuts && msg.actionShortcuts.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 justify-end">
                    {msg.actionShortcuts.map((act, ai) => (
                      <button
                        key={ai}
                        type="button"
                        onClick={() => handleShortcutClick(act.url)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-[11px] font-black text-amber-300 hover:bg-amber-400 hover:text-slate-950 transition shadow-sm"
                      >
                        <span>{act.label}</span>
                        <ArrowUpLeft size={12} />
                      </button>
                    ))}
                  </div>
                )}

                {/* Suggested Quick Follow-Up Questions */}
                {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && i === messages.length - 1 && (
                  <div className="mt-3 flex flex-wrap gap-1.5 justify-end">
                    {msg.suggestedQuestions.map((q, qi) => (
                      <button
                        key={qi}
                        type="button"
                        onClick={() => handleSend(q)}
                        className="rounded-xl border border-white/10 bg-black/60 px-3 py-1.5 text-[11px] font-bold text-amber-300 hover:border-amber-400 hover:bg-amber-400 hover:text-slate-950 transition shadow-sm text-right"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {askAiMutation.isPending && (
              <div className="flex items-center gap-2.5 text-amber-300 text-xs font-black bg-[#111728] border border-amber-400/30 p-3.5 rounded-2xl rounded-bl-none w-fit shadow-md animate-pulse">
                <Sparkles size={16} className="text-amber-400 animate-spin" />
                <span>المساعد الذكي يفكر ويصيغ الإجابة النموذجية...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="border-t border-white/10 bg-[#0a0e1a] p-3 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="اكتب سؤالك هنا (مثلاً: قارن بين الدبلومة الأمريكية والمسار الوطني)..."
              className="flex-1 rounded-2xl border border-white/15 bg-black/70 px-4 py-2.5 text-xs sm:text-sm font-bold text-white placeholder-slate-500 outline-none focus:border-amber-400 transition"
            />
            <Button
              type="submit"
              disabled={!inputPrompt.trim() || askAiMutation.isPending}
              className="grid h-10 w-10 place-items-center rounded-2xl bg-[#f8ca14] text-slate-950 font-black hover:bg-yellow-300 transition shadow-md shrink-0 p-0 disabled:opacity-40"
            >
              <Send size={16} className="mr-0.5" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
