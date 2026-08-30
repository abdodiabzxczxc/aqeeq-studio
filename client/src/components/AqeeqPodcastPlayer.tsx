import { useState, useRef, useEffect } from "react";
import { Mic, Pause, Play, Sparkles, Volume2, X } from "lucide-react";
import { toast } from "sonner";

type Props = {
  title: string;
  script?: string | null;
  dark?: boolean;
  onDuckingChange?: (isDucking: boolean) => void;
};

export function AqeeqPodcastPlayer({
  title,
  script,
  dark = true,
  onDuckingChange,
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const defaultScript = script || `أهلاً بكم في بودكاست مجلة العقيق الأسبوعية لمدارس العقيق الأهلية والدولية. نستعرض معكم في هذا العدد أبرز المحطات والفعاليات التعليمية، متمنين لكم قراءة وتصفحاً ممتعاً.`;

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      onDuckingChange?.(false);
    };
  }, []);

  const startNarration = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("ميزة القارئ الصوتي غير مدعومة في هذا المتصفح");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(defaultScript);
    utterance.lang = "ar-SA";
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    // Look for Arabic voice
    const voices = window.speechSynthesis.getVoices();
    const arVoice = voices.find((v) => v.lang.startsWith("ar") || v.name.includes("Arabic") || v.name.includes("Maged") || v.name.includes("Tarik") || v.name.includes("Laila"));
    if (arVoice) {
      utterance.voice = arVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      onDuckingChange?.(true); // Lower background music (Audio Ducking)
    };

    utterance.onend = () => {
      setIsPlaying(false);
      onDuckingChange?.(false); // Restore background music
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      onDuckingChange?.(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setShowPlayer(true);
  };

  const stopNarration = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    onDuckingChange?.(false);
  };

  const toggleNarration = () => {
    if (isPlaying) {
      stopNarration();
    } else {
      startNarration();
    }
  };

  return (
    <div className="relative inline-flex items-center">
      {/* Podcast Trigger Button in Header */}
      <button
        type="button"
        onClick={toggleNarration}
        className={`flex h-9 items-center gap-1.5 sm:gap-2 rounded-xl border px-2 sm:px-3 text-xs font-black transition active:scale-95 shadow-sm touch-manipulation ${
          isPlaying
            ? "border-purple-400 bg-purple-500/20 text-purple-200 ring-2 ring-purple-400/40 animate-pulse"
            : dark
              ? "border-purple-400/30 bg-purple-500/10 text-purple-300 hover:border-purple-400/60 hover:bg-purple-500/20"
              : "border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100"
        }`}
        title="استمع إلى البودكاست والتعليق الصوتي الذكي للعدد"
      >
        <Mic size={14} className={isPlaying ? "text-purple-300" : "text-purple-400"} />
        <span className="hidden sm:inline">
          {isPlaying ? "إيقاف البودكاست" : "بودكاست العدد 🎙️"}
        </span>
        {isPlaying ? <Pause size={13} /> : <Play size={13} />}
      </button>

      {/* Floating Animated Active Voice Indicator */}
      {isPlaying ? (
        <div className="fixed bottom-20 left-4 z-50 flex items-center gap-3 rounded-2xl border border-purple-400/40 bg-[#120f24]/95 p-3 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom duration-300">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-purple-500/20 text-purple-300">
            <Mic size={18} className="animate-pulse" />
          </div>
          <div className="min-w-0 pr-1">
            <div className="flex items-center gap-1 text-[11px] font-black text-purple-200">
              <Sparkles size={12} className="text-amber-300" />
              <span>القارئ الصوتي الذكي يعمل الآن</span>
            </div>
            <p className="truncate text-[10px] text-purple-300/80 max-w-[200px]">
              {title}
            </p>
          </div>
          <button
            type="button"
            onClick={stopNarration}
            className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
