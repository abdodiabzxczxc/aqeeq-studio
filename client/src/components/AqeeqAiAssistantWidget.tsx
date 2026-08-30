import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import {
  Bot,
  Sparkles,
  Send,
  X,
  RotateCcw,
  MessageSquare,
  HelpCircle,
  BookOpen,
  GraduationCap,
  FileText,
  Phone,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type ChatMsg = {
  role: "user" | "assistant";
  content: string;
  suggestedQuestions?: string[];
};

const INITIAL_MESSAGE: ChatMsg = {
  role: "assistant",
  content: `مرحباً بك في مدارس العقيق الأهلية والدولية بالمدينة المنورة! 💎🤖
أنا مساعدك الذكي، جاهز للإجابة على جميع استفساراتك حول القبول والتسجيل، المناهج والأنشطة، ومساعدتك في تصفح ألبومات الحفلات ومجلة العقيق.

كيف يمكنني مساعدتك اليوم؟`,
  suggestedQuestions: [
    "كيف أقدم على القبول والتسجيل؟",
    "ما هي مميزات الدبلومة الأمريكية؟",
    "كيف أبحث عن صوري في ألبومات التخرج؟",
    "أين أجد أحدث أعداد مجلة العقيق؟",
  ],
};

export function AqeeqAiAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputPrompt, setInputPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([INITIAL_MESSAGE]);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const askAiMutation = trpc.schoolAi.ask.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
          suggestedQuestions: data.suggestedQuestions,
        },
      ]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "يسعدنا دائماً خدمتك! للتواصل المباشر مع قسم القبول والتسجيل يرجى زيارة موقعنا الرسمي https://aqeeq.edu.sa أو الاتصال بإدارة المدارس.",
          suggestedQuestions: ["ما هي شروط القبول والتسجيل؟", "كيف أتصفح مجلة العقيق؟"],
        },
      ]);
    },
  });

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
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
  };

  return (
    <div dir="rtl" className="fixed bottom-5 left-5 z-40">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 rounded-full border border-amber-400/40 bg-gradient-to-r from-[#0d121f] to-[#171e30] p-2.5 sm:px-4 sm:py-3 text-white shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-amber-400 hover:shadow-amber-400/20"
        >
          <div className="relative grid h-10 w-10 place-items-center rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black shadow-lg">
            <Bot size={22} className="animate-bounce" />
            <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-slate-950" />
          </div>

          <div className="hidden sm:block text-right">
            <div className="flex items-center gap-1">
              <span className="text-xs font-black text-amber-300">مساعد العقيق الذكي</span>
              <Sparkles size={11} className="text-amber-400" />
            </div>
            <p className="text-[10px] text-slate-400 font-bold">اسألني أي شيء عن المدارس 🤖</p>
          </div>
        </button>
      )}

      {/* Interactive Chat Window */}
      {isOpen && (
        <div className="flex flex-col w-[92vw] sm:w-[400px] h-[520px] max-h-[85vh] rounded-3xl border border-amber-400/40 bg-[#090d16]/95 text-white shadow-2xl backdrop-blur-xl ring-1 ring-amber-400/20 animate-in zoom-in-95 duration-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-[#0f1424] px-4 py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-amber-400 text-slate-950 font-black">
                <Bot size={20} />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0f1424]" />
              </div>
              <div>
                <h3 className="text-xs font-black text-white flex items-center gap-1">
                  <span>المساعد الذكي لمدرستنا</span>
                  <span className="rounded bg-amber-400/20 px-1 py-0.2 text-[9px] text-amber-300 font-mono">AI 2.5</span>
                </h3>
                <p className="text-[10px] text-emerald-400 font-bold">متصل الآن وجاهز لمساعدتك</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleReset}
                className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                title="إعادة المحادثة"
              >
                <RotateCcw size={13} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                title="تصغير النافذة"
              >
                <ChevronDown size={18} />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-right">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-start" : "items-end"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm font-bold leading-6 ${
                    msg.role === "user"
                      ? "bg-amber-400 text-slate-950 rounded-br-none shadow-md"
                      : "bg-[#141b2d] text-slate-100 border border-white/10 rounded-bl-none shadow-md"
                  } whitespace-pre-wrap`}
                >
                  {msg.content}
                </div>

                {/* Suggested Quick Questions */}
                {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && i === messages.length - 1 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5 justify-end">
                    {msg.suggestedQuestions.map((q, qi) => (
                      <button
                        key={qi}
                        type="button"
                        onClick={() => handleSend(q)}
                        className="rounded-xl border border-amber-400/30 bg-black/40 px-2.5 py-1 text-[11px] font-black text-amber-300 hover:bg-amber-400 hover:text-slate-950 transition shadow-sm"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {askAiMutation.isPending && (
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold bg-[#141b2d] border border-white/10 p-3 rounded-2xl rounded-bl-none w-fit">
                <Sparkles size={14} className="text-amber-400 animate-spin" />
                <span>المساعد الذكي يكتب الرد...</span>
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
            className="border-t border-white/10 bg-[#0c101c] p-3 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="اكتب سؤالك هنا (مثلاً: كيف أسجل في المدارس؟)..."
              className="flex-1 rounded-2xl border border-white/15 bg-black/60 px-3.5 py-2.5 text-xs font-bold text-white placeholder-slate-500 outline-none focus:border-amber-400 transition"
            />
            <Button
              type="submit"
              disabled={!inputPrompt.trim() || askAiMutation.isPending}
              className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-400 text-slate-950 font-black hover:bg-amber-300 transition shadow-md shrink-0 p-0"
            >
              <Send size={16} className="mr-0.5" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
