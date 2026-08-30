import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Radio,
  Mic,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Send,
  Bus,
  ShieldAlert,
  Megaphone,
  Bell,
  CheckCircle2,
  Play,
  Pause,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function AqeeqStaffWalkieCapsule() {
  const { user, isAuthenticated } = useAuth();
  const isStaff = isAuthenticated && (user?.role === "admin" || user?.role === "receptionist" || user?.role === "coordinator");

  const [isOpen, setIsOpen] = useState(false);
  const [activeChannelId, setActiveChannelId] = useState("channel-1");
  const [isRecording, setIsRecording] = useState(false);
  const [audioTranscriptText, setAudioTranscriptText] = useState("");
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);

  const { data: channels = [] } = trpc.walkie.getChannels.useQuery();
  const { data: messages = [], refetch: refetchMessages } = trpc.walkie.listMessages.useQuery(
    { channelId: activeChannelId },
    { refetchInterval: 6000 } // Live polling for walkie dispatches
  );

  const dispatchMutation = trpc.walkie.dispatch.useMutation({
    onSuccess: () => {
      toast.success("📻 تم بث النداء عبر جهاز اللاسلكي الإداري!");
      setAudioTranscriptText("");
      setIsRecording(false);
      void refetchMessages();
    },
    onError: (err) => {
      toast.error(err.message || "تعذر إرسال النداء");
    },
  });

  // Sound chime for incoming emergency calls
  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch {}
  };

  const handleSendQuickDispatch = (presetText?: string) => {
    const text = (presetText || audioTranscriptText).trim();
    if (!text) {
      toast.error("يرجى كتابة نص النداء أو تسجيل الصوت أولاً");
      return;
    }

    playChime();
    dispatchMutation.mutate({
      channelId: activeChannelId,
      senderName: user?.name || "مشرف العقيق",
      senderRole: user?.role === "admin" ? "الإدارة العامة" : "مشرف ميداني",
      transcriptText: text,
      isEmergency: activeChannelId === "channel-1",
    });
  };

  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0];

  // Don't render for unauthenticated visitors unless in demo mode
  if (!isStaff) return null;

  return (
    <div dir="rtl" className="fixed bottom-5 right-5 z-40">
      {/* Floating Walkie Dynamic Capsule */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 rounded-full border border-red-500/40 bg-gradient-to-r from-[#170c10] via-[#221016] to-[#12080c] p-2.5 sm:px-4 sm:py-3 text-white shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-red-500 hover:shadow-red-500/20"
        >
          <div className="relative grid h-10 w-10 place-items-center rounded-full bg-gradient-to-tr from-red-600 to-rose-400 text-white font-black shadow-lg">
            <Radio size={20} className="animate-pulse" />
            <span className="absolute -top-0.5 -left-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-slate-950" />
          </div>

          <div className="hidden sm:block text-right">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-rose-300">اللاسلكي الإداري</span>
              <span className="rounded bg-red-500/30 px-1.5 py-0.2 text-[9px] text-red-200 font-mono">PTT</span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold">نداء الكادر المباشر 📟</p>
          </div>
        </button>
      )}

      {/* Expanded Walkie Radar Box */}
      {isOpen && (
        <div className="flex flex-col w-[92vw] sm:w-[420px] h-[580px] max-h-[88vh] rounded-3xl border border-red-500/40 bg-[#0a080d]/95 text-white shadow-2xl backdrop-blur-2xl ring-1 ring-red-500/30 animate-in zoom-in-95 duration-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-[#160b10] px-4 py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-red-600 text-white font-black">
                <Radio size={20} />
              </div>
              <div>
                <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                  <span>رادار اللاسلكي الإداري</span>
                  <span className="rounded bg-red-500/30 px-1.5 py-0.5 text-[9px] text-red-200 font-mono">
                    {activeChannel?.code || "ALL-01"}
                  </span>
                </h3>
                <p className="text-[10px] text-emerald-400 font-bold">جاهز للإرسال والاستقبال</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X size={16} />
            </button>
          </div>

          {/* 4 Frequency Channels Selector */}
          <div className="grid grid-cols-2 gap-1.5 p-3 border-b border-white/10 bg-black/40">
            {channels.map((ch) => {
              const isSelected = ch.id === activeChannelId;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setActiveChannelId(ch.id)}
                  className={`rounded-2xl p-2 text-right transition border ${
                    isSelected
                      ? "border-amber-400 bg-amber-400/15 text-white shadow-md"
                      : "border-white/5 bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-black" style={{ color: ch.color }}>
                      {ch.code}
                    </span>
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isSelected ? "bg-emerald-400 animate-ping" : "bg-slate-700"
                      }`}
                    />
                  </div>
                  <p className="truncate text-xs font-black text-slate-200 mt-1">{ch.name}</p>
                </button>
              );
            })}
          </div>

          {/* Live Audio Dispatch Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="text-center">
              <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold text-slate-400">
                {activeChannel?.description}
              </span>
            </div>

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-2xl border p-3 space-y-2 transition ${
                  msg.isEmergency
                    ? "border-red-500/40 bg-red-950/20"
                    : "border-white/10 bg-[#120d18]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-lg bg-red-600/30 text-red-300 font-bold text-[10px]">
                      🎙️
                    </span>
                    <span className="text-xs font-black text-slate-200">{msg.senderName}</span>
                    <span className="text-[10px] text-slate-400 font-bold">{msg.senderRole}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(msg.createdAt).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                {/* AI Voice-to-Text Transcript Bubble */}
                <p className="text-xs font-bold text-slate-100 bg-black/40 p-2.5 rounded-xl leading-5 border border-white/5">
                  {msg.transcriptText}
                </p>
              </div>
            ))}
          </div>

          {/* Quick Dispatch Presets & PTT Bar */}
          <div className="border-t border-white/10 bg-[#12090e] p-3 space-y-3">
            {/* Quick Action Chips */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleSendQuickDispatch("📢 نداء: انصراف حافلات المرحلة الابتدائية عند البوابة 1")}
                className="rounded-lg bg-black/40 border border-white/10 px-2 py-1 text-[10px] font-bold text-slate-300 hover:text-white hover:border-amber-400 transition"
              >
                🚌 انصراف باصات
              </button>
              <button
                type="button"
                onClick={() => handleSendQuickDispatch("🚨 تنبيه: يرجى تواجد مشرفي الأدوار في الفناء الآن")}
                className="rounded-lg bg-black/40 border border-white/10 px-2 py-1 text-[10px] font-bold text-slate-300 hover:text-white hover:border-amber-400 transition"
              >
                🏫 إشراف الفناء
              </button>
              <button
                type="button"
                onClick={() => handleSendQuickDispatch("🎓 تنبيه المسرح: بدء مسيرة خريجي الدفعة")}
                className="rounded-lg bg-black/40 border border-white/10 px-2 py-1 text-[10px] font-bold text-slate-300 hover:text-white hover:border-amber-400 transition"
              >
                🎙️ بدء المسيرة
              </button>
            </div>

            {/* Input & Send */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={audioTranscriptText}
                onChange={(e) => setAudioTranscriptText(e.target.value)}
                placeholder="اكتب نداءً صوتياً أو إدارياً سريعاً..."
                className="flex-1 rounded-2xl border border-white/15 bg-black/60 px-3.5 py-2.5 text-xs font-bold text-white placeholder-slate-500 outline-none focus:border-red-400 transition"
              />

              <Button
                type="button"
                disabled={dispatchMutation.isPending}
                onClick={() => handleSendQuickDispatch()}
                className="bg-red-600 hover:bg-red-500 text-white font-black text-xs px-4 h-10 rounded-2xl shadow-lg shadow-red-600/30 flex items-center gap-1.5 shrink-0"
              >
                <Send size={14} className="mr-0.5" />
                <span>بث 🎙️</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
