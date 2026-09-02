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
  Keyboard,
  MessageSquare,
  MoreHorizontal,
  Trash2,
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
    if (style === "siri") {
      enterLiveVoiceMode();
    }
  };
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
  const [lastUserVoiceTranscript, setLastUserVoiceTranscript] = useState("");
  const [lastAssistantVoiceTranscript, setLastAssistantVoiceTranscript] = useState("");
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
    setLastAssistantVoiceTranscript(initialGreeting);

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
    setLastUserVoiceTranscript(text);

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
      setLastAssistantVoiceTranscript(res.reply);

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
    <div dir="rtl" className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-3 sm:left-6 z-50 font-[Tajawal,sans-serif]">
      {/* ── 1. Both Trigger Options Side-by-Side on the Live Site ─────────── */}
      {!isOpen && (
        <div className="flex items-center gap-2 sm:gap-3 p-1.5 rounded-full backdrop-blur-2xl border border-white/15 bg-black/50 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* 🌟 Option 1: The Spatial Morphing Orb (الدائرة الفضائية المدمجة الفاخرة) */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              stopSpeaking();
            }}
            className={`group relative flex items-center rounded-full border-2 p-1.5 sm:p-2 shadow-xl backdrop-blur-2xl transition-all duration-300 hover:scale-105 ${
              isDark
                ? "border-amber-400/70 bg-[#070b16]/95 text-white shadow-[0_8px_30px_rgba(248,202,20,0.35)]"
                : "border-amber-400/80 bg-white/95 text-slate-900 shadow-[0_8px_30px_rgba(248,202,20,0.25)]"
            }`}
            title="الخيار 1: الأيقونة الفضائية الدائرية المدمجة (تتوسع بنعومة)"
          >
            <div className="relative grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-full bg-gradient-to-tr from-[#f8ca14] to-yellow-300 text-slate-950 font-black shadow-md shrink-0">
              <Bot size={21} className="group-hover:rotate-12 transition-transform duration-300" />
              <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-950 animate-pulse bg-emerald-400" />
            </div>

            {/* Dynamic Morphing Expansion on Hover */}
            <div className="max-w-0 overflow-hidden opacity-0 group-hover:max-w-[140px] group-hover:opacity-100 group-hover:px-2.5 transition-all duration-300 whitespace-nowrap text-right hidden sm:block">
              <span className="text-[11px] font-black block text-amber-500 leading-tight">1. أيقونة دائرية</span>
              <span className="text-[9px] text-slate-400 font-bold">فندقية هادئة 🎙️</span>
            </div>
          </button>

          {/* 💎 Option 2: Ultra-Slim Dynamic Island Pill (كبسولة الدايناميك آيلاند النحيفة) */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              stopSpeaking();
            }}
            className={`group relative flex items-center gap-2 rounded-full border-2 px-3 py-2 sm:px-3.5 sm:py-2 shadow-xl backdrop-blur-2xl transition-all duration-300 hover:scale-105 ${
              isDark
                ? "border-cyan-400/70 bg-[#070b16]/95 text-white shadow-[0_8px_30px_rgba(6,182,212,0.35)]"
                : "border-cyan-500/70 bg-white/95 text-slate-900 shadow-[0_8px_30px_rgba(6,182,212,0.25)]"
            }`}
            title="الخيار 2: كبسولة الدايناميك آيلاند النحيفة"
          >
            <div className="relative grid h-8 w-8 place-items-center rounded-full bg-gradient-to-tr from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 font-black shadow-md shrink-0">
              <Bot size={16} />
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-slate-950 animate-ping bg-cyan-400" />
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1">
                <span className="text-[11px] sm:text-xs font-black text-cyan-400 leading-tight">2. كبسولة نحيفة</span>
                <span className="text-[9px] text-slate-400 font-bold hidden sm:inline">• سطر واحد</span>
              </div>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 leading-tight">
                مدمجة ومصقولة 🎙️
              </p>
            </div>

            {/* Mini Equalizer Waves */}
            <div className="hidden sm:flex items-center gap-1 h-3.5 px-0.5 shrink-0">
              <span className="aq-wave-bar w-1 rounded-full bg-cyan-400" style={{ animationDelay: "0.1s" }} />
              <span className="aq-wave-bar w-1 rounded-full bg-teal-400" style={{ animationDelay: "0.3s" }} />
              <span className="aq-wave-bar w-1 rounded-full bg-emerald-400" style={{ animationDelay: "0.5s" }} />
            </div>
          </button>
        </div>
      )}

      {/* ── 2. Compact Unified Chat & Voice Spatial Card (When Open) ─── */}
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
                  <span>متصل • صوتي وكتابي</span>
                </p>
              </div>
            </div>

            {/* Left: Quick Actions (Volume, Reset, API Key, Close) */}
            <div className="flex items-center gap-0.5">
              {/* Sound Volume Toggle */}
              <button
                type="button"
                onClick={() => {
                  if (isSpeaking) stopSpeaking();
                  setIsVoiceEnabled(!isVoiceEnabled);
                  toast.info(!isVoiceEnabled ? "تم تفعيل القراءة الصوتية 🔊" : "تم كتم الصوت 🔈");
                }}
                className={`grid h-7 w-7 place-items-center rounded-lg transition ${
                  isVoiceEnabled
                    ? isDark ? "text-amber-300 bg-amber-400/10" : "text-amber-700 bg-amber-50"
                    : isDark ? "text-slate-500 hover:text-white" : "text-slate-400 hover:text-slate-900"
                }`}
                title={isVoiceEnabled ? "القراءة الصوتية مفعلة" : "الصوت مكتوم"}
              >
                {isVoiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              </button>

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
                  stopListening();
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
                      ? `border rounded-bl-xs text-white ${
                          isSpeaking && speakingIndex === i
                            ? "border-amber-400/70 bg-[#0e162a] shadow-[0_0_15px_rgba(248,202,20,0.25)]"
                            : "border-white/10 bg-[#0c1222]"
                        }`
                      : `border rounded-bl-xs text-slate-900 ${
                          isSpeaking && speakingIndex === i
                            ? "border-amber-400/80 bg-amber-50/60 shadow-sm"
                            : "border-slate-200/90 bg-slate-50/90"
                        }`
                  }`}
                >
                  <p className="whitespace-pre-wrap selection:bg-amber-400 selection:text-slate-950">
                    {msg.content}
                  </p>

                  {/* Assistant Actions Bar (Listen Again, Copy) */}
                  {msg.role === "assistant" && (
                    <div className={`mt-2 pt-1.5 flex items-center justify-between border-t border-current/10 text-[10px] ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}>
                      <div className="flex items-center gap-1.5">
                        {isSpeaking && speakingIndex === i ? (
                          <button
                            type="button"
                            onClick={stopSpeaking}
                            className="flex items-center gap-1 text-amber-500 font-bold hover:underline"
                          >
                            <Square size={10} className="fill-current" />
                            <span>إيقاف القراءة</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => speakText(msg.content, i)}
                            className="flex items-center gap-1 hover:text-amber-500 transition"
                            title="إعادة الاستماع للصوت"
                          >
                            <Volume2 size={11} />
                            <span>استمع 🔊</span>
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopy(msg.content, i)}
                        className="hover:text-amber-500 transition p-0.5"
                        title="نسخ الرد"
                      >
                        {copiedIndex === i ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
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

            {/* Live Mic Listening Card */}
            {isListening && (
              <div className={`flex items-center gap-2 p-3 rounded-2xl border text-xs font-bold animate-pulse ${
                isDark
                  ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-300"
                  : "border-emerald-500/40 bg-emerald-50 text-emerald-800"
              }`}>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <div className="flex-1">
                  <span>أستمع لصوتك الآن.. تحدث وسأرد فوراً 🎙️</span>
                  <p className="text-[10px] opacity-75 mt-0.5">اضغط على زر المايك مرة أخرى عند الانتهاء</p>
                </div>
              </div>
            )}

            {/* Audio Transcribing Loading */}
            {isTranscribing && (
              <div className={`flex items-center gap-2 p-2.5 rounded-2xl border text-xs font-bold animate-pulse ${
                isDark ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-300" : "border-cyan-400/40 bg-cyan-50 text-cyan-800"
              }`}>
                <Loader2 size={14} className="animate-spin text-cyan-400 shrink-0" />
                <span>جاري تحليل صوتك بدقة عالية... ⏳</span>
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

          {/* Unified Bottom Dock: Voice + Text in One Single Place */}
          <div className={`p-2 sm:p-2.5 border-t transition-colors shrink-0 ${
            isDark ? "border-white/10 bg-[#080d1a]" : "border-slate-200/90 bg-slate-50/90"
          }`}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-1.5"
            >
              {/* Mic / Interrupt Voice Button */}
              {isSpeaking ? (
                <button
                  type="button"
                  onClick={stopSpeaking}
                  className="h-9 w-9 shrink-0 grid place-items-center rounded-xl bg-amber-400 text-slate-950 font-black shadow-md hover:scale-105 transition animate-pulse"
                  title="مقاطعة الصوت"
                >
                  <Square size={13} className="fill-current" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`h-9 w-9 shrink-0 grid place-items-center rounded-xl font-black shadow-md hover:scale-105 transition ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-gradient-to-tr from-[#f8ca14] to-yellow-300 text-slate-950"
                  }`}
                  title={isListening ? "اضغط لإنهاء التحدث والإرسال" : "تحدث بالصوت 🎙️"}
                >
                  <Mic size={15} />
                </button>
              )}

              {/* Text Input */}
              <input
                ref={inputRef}
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder={isListening ? "أستمع لصوتك الآن..." : "اكتب استفسارك أو اضغط المايك..."}
                className={`flex-1 rounded-xl border px-3 py-2 text-xs font-bold outline-none transition ${
                  isDark
                    ? "border-white/10 bg-white/5 text-white placeholder-slate-400 focus:border-amber-400"
                    : "border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-amber-500"
                }`}
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputPrompt.trim() || askAiMutation.isPending}
                className="h-9 w-9 shrink-0 grid place-items-center rounded-xl bg-amber-400 text-slate-950 font-black shadow hover:bg-yellow-300 disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="إرسال"
              >
                <Send size={14} />
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
