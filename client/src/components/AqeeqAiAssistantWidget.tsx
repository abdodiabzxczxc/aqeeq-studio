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
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Square,
  AudioWaveform as WaveformIcon,
  Phone,
  PhoneOff,
  PhoneCall,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { usePodcastPlayer } from "./AqeeqFloatingPodcastPlayer";

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

function cleanTextForSpeech(text: string): string {
  return text
    .replace(/###/g, "")
    .replace(/##/g, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[•\-\_]/g, " ")
    .replace(/[^\u0600-\u06FF\s0-9a-zA-Z،.؟!:,-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getBestArabicVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const saudi = voices.find((v) => v.lang === "ar-SA" || v.name.includes("Saudi"));
  if (saudi) return saudi;
  const arabic = voices.find((v) => v.lang.startsWith("ar") || v.name.toLowerCase().includes("arabic"));
  if (arabic) return arabic;
  return null;
}

export function AqeeqAiAssistantWidget() {
  const { theme } = useAqeeqStudioTheme();
  const isDark = theme === "dark";
  const { pausePodcast } = usePodcastPlayer();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [geminiApiKeyInput, setGeminiApiKeyInput] = useState("");
  const [inputPrompt, setInputPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([INITIAL_MESSAGE]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Voice Interaction States
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const speechRecognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Gemini / ChatGPT Integrated Voice States
  const [isLiveVoiceMode, setIsLiveVoiceMode] = useState(false);
  const [liveVoiceState, setLiveVoiceState] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [interimSpeech, setInterimSpeech] = useState("");
  const isLiveVoiceModeRef = useRef(false);
  const isTurnBusyRef = useRef(false);

  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [, navigate] = useLocation();

  const utils = trpc.useUtils();
  const { data: aiStatus, refetch: refetchAiStatus } = trpc.schoolAi.getAiStatus.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const transcribeMutation = trpc.schoolAi.transcribeVoiceAudio.useMutation({
    onSuccess: (data) => {
      setIsTranscribing(false);
      const text = data.text?.trim();
      if (text) {
        setInputPrompt(text);
        handleSend(text);
        toast.success(`تم التقاط صوتك: "${text}"`);
      } else {
        toast.error("لم نتمكن من تمييز الكلام، يرجى إعادة المحاولة والتحدث بوضوح");
      }
    },
    onError: (err) => {
      setIsTranscribing(false);
      toast.error(err.message || "تعذر تفريغ الصوت المسجل");
    },
  });

  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const synthesizeMutation = trpc.schoolAi.synthesizeSpeech.useMutation();

  const stopSpeaking = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.onended = null;
      audioPlayerRef.current.onerror = null;
      audioPlayerRef.current.src = "";
      audioPlayerRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpeakingIndex(null);
  };

  const fallbackBrowserSpeak = (text: string, index?: number) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleaned = cleanTextForSpeech(text);
    if (!cleaned) return;

    try {
      pausePodcast();
    } catch (e) {}

    const utterance = new SpeechSynthesisUtterance(cleaned);
    const voice = getBestArabicVoice();
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang || "ar-SA";
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeakingIndex(index ?? null);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingIndex(null);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingIndex(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const speakText = async (text: string, index?: number) => {
    stopSpeaking();
    const cleaned = cleanTextForSpeech(text);
    if (!cleaned) return;

    try {
      pausePodcast();
    } catch (e) {}

    setIsSpeaking(true);
    setSpeakingIndex(index ?? null);

    try {
      const data = await synthesizeMutation.mutateAsync({ text: cleaned, voice: "male" });
      if (data?.audioBase64) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`);
        audioPlayerRef.current = audio;

        audio.onended = () => {
          setIsSpeaking(false);
          setSpeakingIndex(null);
          audioPlayerRef.current = null;
        };

        audio.onerror = () => {
          fallbackBrowserSpeak(text, index);
        };

        await audio.play();
      } else {
        fallbackBrowserSpeak(text, index);
      }
    } catch (err) {
      fallbackBrowserSpeak(text, index);
    }
  };

  const stopListening = () => {
    setIsListening(false);

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
      speechRecognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }

    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      } catch (e) {}
      mediaStreamRef.current = null;
    }
  };

  const toggleListening = async () => {
    if (isListening) {
      stopListening();
      return;
    }

    try {
      pausePodcast();
      stopSpeaking();
    } catch (e) {}

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("المتصفح لا يدعم الوصول للمايكروفون");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setIsListening(true);
      audioChunksRef.current = [];

      // Setup MediaRecorder as bulletproof fallback/primary recorder
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "audio/ogg";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (evt) => {
        if (evt.data && evt.data.size > 0) {
          audioChunksRef.current.push(evt.data);
        }
      };

      recorder.onstop = async () => {
        setIsListening(false);
        const tracks = stream.getTracks();
        tracks.forEach((t) => t.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size > 1500) {
          setIsTranscribing(true);
          toast.info("جاري تحليل صوتك بدقة ذكية عالية... ⏳");

          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Audio = (reader.result as string)?.split(",")[1];
            if (base64Audio) {
              transcribeMutation.mutate({
                audioBase64: base64Audio,
                mimeType: mimeType.split(";")[0],
              });
            } else {
              setIsTranscribing(false);
            }
          };
          reader.readAsDataURL(audioBlob);
        }
      };

      recorder.start(250);
      toast.info("🎙️ المساعد يستمع لصوتك الآن.. تحدث ثم اضغط على المايك مجدداً للإرسال", { duration: 4000 });

      // In parallel: try Web Speech Recognition for instant zero-latency recognition
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.lang = "ar-SA";
          recognition.continuous = false;
          recognition.interimResults = false;

          recognition.onresult = (event: any) => {
            const transcript = event.results?.[0]?.[0]?.transcript;
            if (transcript && transcript.trim()) {
              audioChunksRef.current = []; // avoid duplicate fallback
              stopListening();
              setInputPrompt(transcript.trim());
              handleSend(transcript.trim());
              toast.success(`تم استلام صوتك: "${transcript.trim()}"`);
            }
          };

          recognition.onerror = () => {
            // Silently allow MediaRecorder to finish on user stop
          };

          recognition.onend = () => {
            // If user stopped, MediaRecorder handles it
          };

          speechRecognitionRef.current = recognition;
          recognition.start();
        } catch (e) {
          // Ignored, MediaRecorder is recording
        }
      }
    } catch (err: any) {
      setIsListening(false);
      if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
        toast.error("يرجى الضغط على أيقونة القفل أو المايكروفون في شريط المتصفح والسماح بالمايكروفون");
      } else if (err?.name === "NotFoundError" || err?.name === "DevicesNotFoundError") {
        toast.error("لم يتم العثور على مايكروفون متصل بالجهاز");
      } else {
        toast.error("تعذر فتح المايكروفون: " + (err?.message || ""));
      }
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
      setMessages((prev) => {
        const next = [...prev, newMsg];
        if (isVoiceEnabled && !isLiveVoiceModeRef.current && (data.spokenText || data.reply)) {
          setTimeout(() => {
            speakText(data.spokenText || data.reply, next.length - 1);
          }, 150);
        }
        return next;
      });
    },
    onError: () => {
      const fallbackMsg: ChatMsg = {
        role: "assistant",
        content:
          "يسعدنا دائماً خدمتكم! للتواصل المباشر مع إدارة القبول والتسجيل بمدارس العقيق، يرجى زيارة موقعنا الرسمي https://aqeeq.edu.sa أو زيارة مقر المدارس بالمدينة المنورة.",
        suggestedQuestions: ["ما هي شروط القبول والتسجيل؟", "كيف أتصفح مجلة العقيق؟"],
      };
      setMessages((prev) => {
        const next = [...prev, fallbackMsg];
        if (isVoiceEnabled) {
          setTimeout(() => {
            speakText(fallbackMsg.content, next.length - 1);
          }, 150);
        }
        return next;
      });
    },
  });

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      stopSpeaking();
      if (isListening && speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {}
        setIsListening(false);
      }
    }
  }, [messages, isOpen]);

  // =========================================================================
  // INTEGRATED GEMINI / CHATGPT VOICE ENGINE (محادثة صوتية حية مدمجة في الشات)
  // =========================================================================

  const enterLiveVoiceMode = async () => {
    setIsLiveVoiceMode(true);
    isLiveVoiceModeRef.current = true;
    isTurnBusyRef.current = false;
    setIsOpen(true);
    setLiveVoiceState("speaking");
    setInterimSpeech("");

    const initialGreeting =
      "أَهْلًا وَسَهْلًا بِكَ فِي مَدَارِسِ العَقِيق! أَنَا مُسْتَشَارُكَ التَّعْلِيمِيُّ الذَّكِيُّ، أَنَا فِي اسْتِمَاعِكَ.. تَفَضَّلْ بِسُؤَالِك!";

    await playVoiceWithCallback(initialGreeting, () => {
      if (isLiveVoiceModeRef.current) {
        startLiveVoiceListening();
      }
    });
  };

  const exitLiveVoiceMode = () => {
    isLiveVoiceModeRef.current = false;
    isTurnBusyRef.current = false;
    setIsLiveVoiceMode(false);
    setLiveVoiceState("idle");
    setInterimSpeech("");
    stopSpeaking();
    stopListening();
  };

  const playVoiceWithCallback = async (text: string, onEnded?: () => void) => {
    stopSpeaking();
    const cleaned = cleanTextForSpeech(text);
    if (!cleaned) {
      onEnded?.();
      return;
    }

    try {
      pausePodcast();
    } catch (e) {}

    setIsSpeaking(true);
    setLiveVoiceState("speaking");

    try {
      const data = await synthesizeMutation.mutateAsync({ text: cleaned, voice: "male" });
      if (data?.audioBase64) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`);
        audioPlayerRef.current = audio;

        audio.onended = () => {
          setIsSpeaking(false);
          audioPlayerRef.current = null;
          onEnded?.();
        };

        audio.onerror = () => {
          setIsSpeaking(false);
          audioPlayerRef.current = null;
          onEnded?.();
        };

        await audio.play();
      } else {
        setIsSpeaking(false);
        onEnded?.();
      }
    } catch (e) {
      setIsSpeaking(false);
      onEnded?.();
    }
  };

  const sendLiveVoiceTurn = async (userText: string) => {
    const text = userText.trim();
    if (!text || isTurnBusyRef.current) return;

    // Single turn lock prevents any double speech / race conditions
    isTurnBusyRef.current = true;
    stopListening();
    stopSpeaking();
    setLiveVoiceState("thinking");
    setInterimSpeech("");

    // 1. Immediately append user's speech bubble to chat
    const userMsg: ChatMsg = { role: "user", content: text };
    let currentHistory: ChatMsg[] = [];
    setMessages((prev) => {
      currentHistory = [...prev, userMsg];
      return currentHistory;
    });

    try {
      // 2. Query AI
      const res = await askAiMutation.mutateAsync({
        prompt: text,
        history: currentHistory.map((m) => ({ role: m.role, content: m.content })),
      });

      // 3. Immediately append assistant reply to chat
      const assistantMsg: ChatMsg = {
        role: "assistant",
        content: res.reply,
        suggestedQuestions: res.suggestedQuestions,
        actionShortcuts: res.actionShortcuts,
      };

      setMessages((prev) => {
        const next = [...prev, assistantMsg];
        setSpeakingIndex(next.length - 1);
        return next;
      });

      // 4. Play audio in Hamed's voice
      const speechText = res.spokenText || res.reply;
      await playVoiceWithCallback(speechText, () => {
        isTurnBusyRef.current = false;
        if (isLiveVoiceModeRef.current) {
          startLiveVoiceListening();
        } else {
          setLiveVoiceState("idle");
        }
      });
    } catch (err) {
      isTurnBusyRef.current = false;
      toast.error("حدث تعذر في الرد، تفضل بالتحدث مرة ثانية");
      if (isLiveVoiceModeRef.current) {
        startLiveVoiceListening();
      } else {
        setLiveVoiceState("idle");
      }
    }
  };

  const startLiveVoiceListening = async () => {
    if (!isLiveVoiceModeRef.current || isTurnBusyRef.current) return;
    stopSpeaking();
    stopListening();
    setLiveVoiceState("listening");
    setInterimSpeech("");

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition();
        rec.lang = "ar-SA";
        rec.continuous = false;
        rec.interimResults = true;

        rec.onresult = (event: any) => {
          const transcript = event.results?.[0]?.[0]?.transcript || "";
          if (transcript) {
            setInterimSpeech(transcript);
            if (event.results[0].isFinal) {
              rec.stop();
              sendLiveVoiceTurn(transcript);
            }
          }
        };

        rec.onerror = () => {
          startMediaRecorderTurn();
        };

        speechRecognitionRef.current = rec;
        rec.start();
        return;
      } catch (e) {}
    }

    startMediaRecorderTurn();
  };

  const startMediaRecorderTurn = async () => {
    if (!isLiveVoiceModeRef.current || isTurnBusyRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (evt) => {
        if (evt.data && evt.data.size > 0) {
          audioChunksRef.current.push(evt.data);
        }
      };

      recorder.onstop = async () => {
        const tracks = stream.getTracks();
        tracks.forEach((t) => t.stop());

        if (!isLiveVoiceModeRef.current || isTurnBusyRef.current) return;

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size > 1200) {
          setLiveVoiceState("thinking");
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string)?.split(",")[1];
            if (base64Audio && isLiveVoiceModeRef.current && !isTurnBusyRef.current) {
              try {
                const res = await transcribeMutation.mutateAsync({
                  audioBase64: base64Audio,
                  mimeType: mimeType.split(";")[0],
                });
                const userText = res?.text?.trim();
                if (userText) {
                  sendLiveVoiceTurn(userText);
                } else if (isLiveVoiceModeRef.current) {
                  startLiveVoiceListening();
                }
              } catch (e) {
                if (isLiveVoiceModeRef.current) startLiveVoiceListening();
              }
            } else if (isLiveVoiceModeRef.current) {
              startLiveVoiceListening();
            }
          };
          reader.readAsDataURL(audioBlob);
        } else if (isLiveVoiceModeRef.current) {
          startLiveVoiceListening();
        }
      };

      recorder.start(250);
    } catch (err) {
      if (isLiveVoiceModeRef.current) {
        toast.error("يرجى التأكد من إذن المايكروفون");
        exitLiveVoiceMode();
      }
    }
  };

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
    <div dir="rtl" className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-3 sm:left-5 z-50 font-[Tajawal,sans-serif]">
      {/* Floating Trigger Buttons */}
      {!isOpen && (
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className={`group relative flex items-center gap-3 rounded-full border p-2 sm:px-4 sm:py-3 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 ${
              isDark
                ? "border-amber-400/50 bg-gradient-to-r from-[#070b14] via-[#0d1527] to-[#121c33] text-white hover:border-amber-400 hover:shadow-[0_0_30px_rgba(248,202,20,0.4)]"
                : "border-amber-400/60 bg-gradient-to-r from-white via-slate-50 to-amber-50/50 text-slate-900 shadow-[0_10px_30px_rgba(0,0,0,0.12)] hover:border-amber-500 hover:shadow-[0_10px_30px_rgba(248,202,20,0.3)]"
            }`}
          >
            <div className="relative grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-full bg-gradient-to-tr from-[#f8ca14] to-amber-300 text-slate-950 font-black shadow-lg">
              <Bot size={22} className="group-hover:rotate-12 transition-transform duration-300" />
              <span className={`absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 ${
                isDark ? "border-slate-950" : "border-white"
              } animate-pulse ${
                aiStatus?.hasLiveGemini ? "bg-emerald-400" : "bg-amber-400"
              }`} />
            </div>

            <div className="hidden sm:block text-right">
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-black ${isDark ? "text-amber-300" : "text-amber-700"}`}>مساعد العقيق الذكي</span>
                <Sparkles size={12} className={isDark ? "text-amber-400" : "text-amber-600"} />
              </div>
              <p className={`text-[10px] font-bold ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                {aiStatus?.hasLiveGemini ? "Gemini Live AI متصل ⚡" : "اسألني أي شيء عن المدارس 🤖"}
              </p>
            </div>
          </button>

          {/* Quick Direct Live Voice Button */}
          <button
            type="button"
            onClick={enterLiveVoiceMode}
            className="group relative flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-full border border-emerald-400/60 bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] ring-4 ring-emerald-500/20 animate-pulse"
            title="بدء محادثة صوتية حية فورية (Gemini Voice) 🎙️"
          >
            <PhoneCall size={22} className="group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 text-[8px] font-black items-center justify-center text-white">LIVE</span>
            </span>
          </button>
        </div>
      )}

      {/* Interactive Luxury Chat Window */}
      {isOpen && (
        <div
          className={`flex flex-col transition-all duration-300 border shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 overflow-hidden fixed inset-0 sm:inset-auto sm:relative sm:rounded-[2rem] w-full sm:w-[460px] h-[100dvh] sm:h-[600px] max-h-none sm:max-h-[88vh] z-50 ${
            isDark
              ? "border-amber-400/40 bg-[#070a12] sm:bg-[#070a12]/95 text-white shadow-[0_25px_70px_rgba(0,0,0,0.85)] ring-1 ring-amber-400/20"
              : "border-slate-200/90 bg-white sm:bg-white/98 text-slate-900 shadow-[0_25px_70px_rgba(0,0,0,0.18)] ring-1 ring-amber-400/30"
          } ${
            isExpanded
              ? "sm:w-[720px] sm:h-[85vh] sm:max-h-[820px]"
              : ""
          }`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between border-b px-4 py-3.5 transition-colors ${
            isDark
              ? "border-white/10 bg-gradient-to-r from-[#0d1424] via-[#101b33] to-[#0a101d] text-white"
              : "border-slate-200 bg-gradient-to-r from-slate-50 via-amber-50/40 to-white text-slate-900"
          }`}>
            <div className="flex items-center gap-3">
              <div className="relative grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-tr from-[#f8ca14] to-yellow-300 text-slate-950 font-black shadow-md">
                <Bot size={22} />
                <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`text-xs sm:text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>مساعد مدارس العقيق الذكي</h3>
                  <button
                    type="button"
                    onClick={() => setIsKeyModalOpen(true)}
                    className={`rounded-md px-1.5 py-0.5 text-[9px] font-mono font-black flex items-center gap-1 transition ${
                      aiStatus?.hasLiveGemini
                        ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 hover:bg-emerald-500/30"
                        : isDark
                          ? "bg-amber-400/20 text-amber-300 border border-amber-400/40 hover:bg-amber-400 hover:text-black"
                          : "bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-400 hover:text-black"
                    }`}
                    title="إعدادات وربط مفتاح الذكاء الاصطناعي"
                  >
                    <Sparkles size={10} />
                    <span>{aiStatus?.hasLiveGemini ? "GEMINI LIVE ⚡" : "تفعيل الذكاء الحي 🔑"}</span>
                  </button>
                </div>
                <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>{aiStatus?.hasLiveGemini ? "متصل بنموذج Gemini 3.6 Flash الذكي ⚡" : "جاهز للرد والمساعدة التربوية"}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Live Voice Toggle Button (Integrated in Chat) */}
              <button
                type="button"
                onClick={isLiveVoiceMode ? exitLiveVoiceMode : enterLiveVoiceMode}
                className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-black shadow-md transition hover:scale-105 mr-1 ${
                  isLiveVoiceMode
                    ? "bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 animate-pulse"
                    : "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-teal-400"
                }`}
                title={isLiveVoiceMode ? "إنهاء المحادثة الصوتية والعودة للكتابة" : "بدء محادثة صوتية حية (Gemini Voice)"}
              >
                {isLiveVoiceMode ? (
                  <>
                    <PhoneOff size={13} />
                    <span className="hidden sm:inline">إنهاء الفويس</span>
                  </>
                ) : (
                  <>
                    <PhoneCall size={13} className="animate-bounce" />
                    <span className="hidden sm:inline">فويس لايف ⚡</span>
                  </>
                )}
              </button>

              {/* Voice Sound Toggle Button */}
              <button
                type="button"
                onClick={() => {
                  if (isSpeaking) {
                    stopSpeaking();
                  }
                  setIsVoiceEnabled(!isVoiceEnabled);
                  toast.info(!isVoiceEnabled ? "تم تفعيل القراءة الصوتية الطبيعية 🔊" : "تم كتم الصوت 🔈");
                }}
                className={`grid h-8 w-8 place-items-center rounded-xl transition ${
                  isVoiceEnabled
                    ? isDark
                      ? "text-amber-300 bg-amber-400/10 hover:bg-amber-400/20"
                      : "text-amber-700 bg-amber-50 hover:bg-amber-100"
                    : isDark
                      ? "text-slate-500 hover:text-white hover:bg-white/10"
                      : "text-slate-400 hover:text-slate-900 hover:bg-black/5"
                }`}
                title={isVoiceEnabled ? "الصوت مفعل (اضغط للكتم)" : "الصوت مكتوم (اضغط للتفعيل)"}
              >
                {isVoiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>

              <button
                type="button"
                onClick={() => setIsKeyModalOpen(true)}
                className={`grid h-8 w-8 place-items-center rounded-xl transition ${
                  isDark ? "text-slate-400 hover:text-amber-300 hover:bg-white/10" : "text-slate-500 hover:text-amber-700 hover:bg-black/5"
                }`}
                title="ربط مفتاح الذكاء الاصطناعي (Gemini Key)"
              >
                <Settings size={15} />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className={`grid h-8 w-8 place-items-center rounded-xl transition ${
                  isDark ? "text-slate-400 hover:text-white hover:bg-white/10" : "text-slate-500 hover:text-slate-900 hover:bg-black/5"
                }`}
                title={isExpanded ? "تصغير الحجم" : "تكبير الشاشة"}
              >
                {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className={`grid h-8 w-8 place-items-center rounded-xl transition ${
                  isDark ? "text-slate-400 hover:text-white hover:bg-white/10" : "text-slate-500 hover:text-slate-900 hover:bg-black/5"
                }`}
                title="إعادة بدء المحادثة"
              >
                <RotateCcw size={14} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className={`grid h-8 w-8 place-items-center rounded-xl transition ${
                  isDark ? "text-slate-400 hover:text-white hover:bg-white/10" : "text-slate-500 hover:text-slate-900 hover:bg-black/5"
                }`}
                title="تصغير النافذة"
              >
                <ChevronDown size={20} />
              </button>
            </div>
          </div>

          {/* Quick Shortcuts Bar */}
          <div className={`flex items-center gap-1.5 border-b px-3 py-2 overflow-x-auto scrollbar-none transition-colors ${
            isDark ? "border-white/5 bg-black/40" : "border-slate-200/80 bg-slate-100/80"
          }`}>
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
                className={`shrink-0 rounded-lg border px-2.5 py-1 text-[10px] font-black transition ${
                  isDark
                    ? "border-white/10 bg-white/5 text-slate-300 hover:bg-[#f8ca14] hover:text-black"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-[#f8ca14] hover:text-black hover:border-amber-400 shadow-xs"
                }`}
              >
                {sc.label}
              </button>
            ))}
          </div>

          {/* Chat Messages List */}
          <div className={`flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm leading-relaxed ${
            isDark ? "bg-[#070a12]/70" : "bg-slate-50/50"
          }`}>
            {/* Live Speaking Indicator Banner */}
            {isSpeaking && (
              <div className="sticky top-0 z-10 flex items-center justify-between rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 border border-amber-400/40 p-2.5 backdrop-blur-md shadow-md animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-black">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </span>
                  <WaveformIcon size={16} className="animate-pulse text-amber-400" />
                  <span>المساعد يتحدث بصوت بشري طبيعي...</span>
                </div>
                <button
                  type="button"
                  onClick={stopSpeaking}
                  className="rounded-lg bg-amber-400 px-2.5 py-1 text-[10px] font-black text-black hover:bg-yellow-300 transition shadow-xs flex items-center gap-1"
                >
                  <Square size={10} className="fill-current" />
                  <span>إيقاف الصوت</span>
                </button>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${
                  msg.role === "user" ? "items-start" : "items-end"
                } animate-in fade-in duration-200`}
              >
                <div
                  className={`group relative max-w-[88%] rounded-2xl p-3.5 sm:p-4 text-right shadow-sm ${
                    msg.role === "user"
                      ? "rounded-br-none bg-gradient-to-tr from-[#f8ca14] to-yellow-400 text-slate-950 font-bold"
                      : isDark
                        ? "rounded-bl-none border border-white/10 bg-[#0e1628] text-slate-100 shadow-md"
                        : "rounded-bl-none border border-slate-200/80 bg-white text-slate-900 shadow-md"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-current/10">
                      <div className="h-5 w-5 rounded-md bg-[#f8ca14] text-slate-950 grid place-items-center font-black text-[10px]">
                        💎
                      </div>
                      <span className={`text-[11px] font-black ${isDark ? "text-amber-300" : "text-amber-700"}`}>
                        مستشار العقيق الذكي
                      </span>
                    </div>
                  )}

                  <div className="space-y-1 text-right leading-relaxed font-medium">
                    {msg.role === "user" ? msg.content : renderFormattedMessage(msg.content, isDark)}
                  </div>

                  {/* Speech & Copy Action Buttons for Assistant Replies */}
                  {msg.role === "assistant" && (
                    <div className="mt-2.5 pt-2 border-t border-current/10 flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (isSpeaking && speakingIndex === i) {
                              stopSpeaking();
                            } else {
                              speakText(msg.content, i);
                            }
                          }}
                          className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-black transition ${
                            isSpeaking && speakingIndex === i
                              ? "text-red-400 bg-red-500/20 animate-pulse border border-red-500/40"
                              : isDark
                                ? "text-amber-300 hover:text-white bg-white/5 border border-white/10 hover:bg-amber-400/20"
                                : "text-amber-800 hover:text-black bg-amber-50 border border-amber-200 hover:bg-amber-100"
                          }`}
                          title={isSpeaking && speakingIndex === i ? "إيقاف الصوت" : "استمع للرد بالصوت"}
                        >
                          {isSpeaking && speakingIndex === i ? (
                            <>
                              <Square size={11} className="fill-current" />
                              <span>إيقاف</span>
                            </>
                          ) : (
                            <>
                              <Volume2 size={12} />
                              <span>استمع بالصوت 🔊</span>
                            </>
                          )}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopy(msg.content, i)}
                        className={`grid h-6 w-6 place-items-center rounded-lg transition ${
                          isDark
                            ? "text-slate-400 hover:text-amber-300 bg-black/40"
                            : "text-slate-500 hover:text-amber-700 bg-slate-100"
                        }`}
                        title="نسخ الرد"
                      >
                        {copiedIndex === i ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      </button>
                    </div>
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
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-black transition shadow-xs ${
                          isDark
                            ? "border-amber-400/40 bg-amber-400/10 text-amber-300 hover:bg-amber-400 hover:text-slate-950"
                            : "border-amber-400/60 bg-amber-50 text-amber-800 hover:bg-amber-400 hover:text-slate-950"
                        }`}
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
                        className={`rounded-xl border px-3 py-1.5 text-[11px] font-bold transition shadow-xs text-right ${
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

            {askAiMutation.isPending && (
              <div className={`flex items-center gap-2.5 text-xs font-black p-3.5 rounded-2xl rounded-bl-none w-fit shadow-md animate-pulse ${
                isDark
                  ? "bg-[#111728] border border-amber-400/30 text-amber-300"
                  : "bg-white border border-amber-400/50 text-amber-800 shadow-sm"
              }`}>
                <Sparkles size={16} className={`${isDark ? "text-amber-400" : "text-amber-600"} animate-spin`} />
                <span>المساعد الذكي يفكر ويصيغ الإجابة الحية...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Input Footer: Switches seamlessly between Normal Input and Gemini / ChatGPT Live Voice Bar */}
          {isLiveVoiceMode ? (
            <div
              className={`border-t p-3 pb-[max(1rem,env(safe-area-inset-bottom))] transition-all flex flex-col gap-2.5 ${
                isDark
                  ? "border-amber-400/30 bg-gradient-to-r from-[#070d1a] via-[#0d172e] to-[#070d1a]"
                  : "border-amber-300/60 bg-gradient-to-r from-amber-50/90 via-white to-amber-50/90"
              }`}
            >
              {/* Header Status & Exit Button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-2.5 w-2.5 rounded-full ${
                      liveVoiceState === "listening"
                        ? "bg-emerald-500 animate-ping"
                        : liveVoiceState === "speaking"
                        ? "bg-amber-400 animate-pulse"
                        : "bg-cyan-400 animate-spin"
                    }`}
                  />
                  <span
                    className={`text-xs font-black flex items-center gap-1.5 ${
                      liveVoiceState === "listening"
                        ? "text-emerald-500"
                        : liveVoiceState === "speaking"
                        ? isDark ? "text-amber-300" : "text-amber-800"
                        : "text-cyan-400"
                    }`}
                  >
                    {liveVoiceState === "listening" && "🎙️ أستمع إليك الآن.. تفضل بالتحدث..."}
                    {liveVoiceState === "speaking" && "🔊 المستشار يتحدث إليك..."}
                    {liveVoiceState === "thinking" && "⚡ جاري التفكير وصياغة الرد..."}
                    {liveVoiceState === "idle" && "جاهز للمحادثة الصوتية"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={exitLiveVoiceMode}
                  className={`rounded-xl px-2.5 py-1 text-[11px] font-bold flex items-center gap-1 transition ${
                    isDark
                      ? "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-black"
                  }`}
                  title="الرجوع للكتابة النصية"
                >
                  <X size={13} />
                  <span>إنهاء الفويس</span>
                </button>
              </div>

              {/* Soundwave Equalizer Capsule */}
              <div
                className={`flex items-center justify-between rounded-2xl border p-2.5 px-4 shadow-inner transition ${
                  liveVoiceState === "listening"
                    ? isDark
                      ? "border-emerald-500/40 bg-emerald-950/20"
                      : "border-emerald-400/60 bg-emerald-50/50"
                    : liveVoiceState === "speaking"
                    ? isDark
                      ? "border-amber-400/40 bg-amber-950/20"
                      : "border-amber-400/60 bg-amber-50/50"
                    : isDark
                      ? "border-white/10 bg-black/40"
                      : "border-slate-200 bg-slate-50"
                }`}
              >
                {/* Equalizer Bars */}
                <div className="flex items-center gap-1 h-7 shrink-0">
                  {[35, 75, 50, 95, 60, 100, 45, 85, 55, 70, 30].map((h, i) => (
                    <span
                      key={i}
                      style={{
                        height:
                          liveVoiceState === "speaking" || liveVoiceState === "listening"
                            ? `${Math.max(20, h * (i % 2 === 0 ? 1 : 0.75))}%`
                            : "25%",
                      }}
                      className={`w-1 rounded-full transition-all duration-200 ${
                        liveVoiceState === "listening"
                          ? "bg-emerald-400 animate-pulse"
                          : liveVoiceState === "speaking"
                          ? "bg-amber-400 animate-pulse"
                          : "bg-slate-500"
                      }`}
                    />
                  ))}
                </div>

                {/* Real-time Spoken Text Preview */}
                <div className="flex-1 mx-3 text-right truncate">
                  <span className={`text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                    {interimSpeech || (
                      liveVoiceState === "listening"
                        ? "تحدث بحرية.. سأسمعك وأرد فوراً 🎙️"
                        : liveVoiceState === "speaking"
                        ? "استمع لرد المستشار الفصيح 🔊"
                        : "جاري المعالجة الذكية... ⚡"
                    )}
                  </span>
                </div>

                {/* Control Action Button */}
                {liveVoiceState === "speaking" ? (
                  <button
                    type="button"
                    onClick={() => {
                      stopSpeaking();
                      startLiveVoiceListening();
                    }}
                    className="shrink-0 rounded-xl bg-amber-500 text-black px-3 py-1.5 text-xs font-black flex items-center gap-1 hover:bg-amber-400 transition shadow"
                    title="مقاطعة الرد والبدء في التحدث فوراً"
                  >
                    <Square size={13} className="fill-current" />
                    <span>مقاطعة 🎙️</span>
                  </button>
                ) : liveVoiceState === "listening" ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (interimSpeech) {
                        sendLiveVoiceTurn(interimSpeech);
                      }
                    }}
                    disabled={!interimSpeech}
                    className="shrink-0 rounded-xl bg-emerald-500 disabled:opacity-40 text-black px-3 py-1.5 text-xs font-black flex items-center gap-1 hover:bg-emerald-400 transition shadow"
                    title="إرسال الكلام الآن"
                  >
                    <Check size={13} />
                    <span>إرسال</span>
                  </button>
                ) : (
                  <div className="shrink-0 flex items-center gap-1 text-[11px] text-slate-400 font-bold">
                    <Loader2 size={13} className="animate-spin text-cyan-400" />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className={`border-t p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center gap-2 transition-colors ${
                isDark ? "border-white/10 bg-[#0a0e1a]" : "border-slate-200 bg-white"
              }`}
            >
              {/* Quick Voice Mode Button */}
              <Button
                type="button"
                onClick={enterLiveVoiceMode}
                className={`grid h-10 w-10 place-items-center rounded-2xl transition shadow-md shrink-0 p-0 ${
                  isDark
                    ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black"
                    : "border border-emerald-400/60 bg-emerald-50 text-emerald-800 hover:bg-emerald-500 hover:text-white"
                }`}
                title="بدء محادثة صوتية مستمرة (Gemini Voice) 🎙️"
              >
                <PhoneCall size={18} />
              </Button>

              {/* Single Mic Button */}
              <Button
                type="button"
                onClick={toggleListening}
                disabled={isTranscribing}
                className={`grid h-10 w-10 place-items-center rounded-2xl transition shadow-md shrink-0 p-0 ${
                  isListening
                    ? "bg-red-500 text-white animate-bounce ring-4 ring-red-500/40"
                    : isTranscribing
                      ? "bg-amber-500 text-black animate-pulse"
                      : isDark
                        ? "border border-amber-400/40 bg-amber-400/10 text-amber-300 hover:bg-amber-400 hover:text-black"
                        : "border border-amber-400/60 bg-amber-50 text-amber-800 hover:bg-[#f8ca14] hover:text-black"
                }`}
                title={
                  isListening
                    ? "جاري الاستماع.. اضغط للإرسال"
                    : isTranscribing
                      ? "جاري تفريغ الصوت..."
                      : "تحدث بالصوت 🎙️"
                }
              >
                {isListening ? (
                  <Square size={16} className="fill-current text-white animate-pulse" />
                ) : isTranscribing ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Mic size={18} />
                )}
              </Button>

              <input
                ref={inputRef}
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder={
                  isListening
                    ? "🎙️ استمع إليك الآن.. تفضل بالتحدث..."
                    : "اكتب سؤالك أو اضغط على الفويس للتحدث..."
                }
                className={`flex-1 rounded-2xl border px-4 py-2.5 text-xs sm:text-sm font-bold outline-none transition ${
                  isDark
                    ? "border-white/15 bg-black/70 text-white placeholder-slate-500 focus:border-amber-400"
                    : "border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:bg-white"
                }`}
              />
              <Button
                type="submit"
                disabled={!inputPrompt.trim() || askAiMutation.isPending}
                className="grid h-10 w-10 place-items-center rounded-2xl bg-[#f8ca14] text-slate-950 font-black hover:bg-yellow-300 transition shadow-md shrink-0 p-0 disabled:opacity-40"
              >
                <Send size={16} className="mr-0.5" />
              </Button>
            </form>
          )}
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
