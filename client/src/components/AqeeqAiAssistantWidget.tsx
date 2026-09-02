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
    <div dir="rtl" className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-3 sm:left-5 z-50 font-[Tajawal,sans-serif]">
      {/* Unified Apple Intelligence Trigger (Single luxury spatial button) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setActiveUiStyle("siri");
            enterLiveVoiceMode();
          }}
          className={`group relative flex items-center gap-3 rounded-full border-2 aq-siri-glow p-2 sm:px-4 sm:py-2.5 shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:scale-105 ${
            isDark
              ? "bg-[#070b16]/95 text-white shadow-[0_15px_45px_rgba(0,0,0,0.85)]"
              : "bg-white/95 text-slate-900 shadow-[0_15px_45px_rgba(248,202,20,0.25)]"
          }`}
          title="مستشار العقيق الذكي (Apple Intelligence)"
        >
          <div className="relative grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-full bg-gradient-to-tr from-[#f8ca14] to-yellow-300 text-slate-950 font-black shadow-lg shrink-0">
            <Bot size={22} className="group-hover:rotate-12 transition-transform duration-300" />
            <span
              className={`absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 ${
                isDark ? "border-slate-950" : "border-white"
              } animate-pulse bg-emerald-400`}
            />
          </div>

          <div className="hidden sm:block text-right">
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-black ${isDark ? "text-amber-300" : "text-amber-700"}`}>
                مستشار العقيق الصوتي
              </span>
              <Sparkles size={12} className={isDark ? "text-amber-400" : "text-amber-600"} />
            </div>
            <p className={`text-[10px] font-bold ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              تحدث بالصوت وتصفح الموقع بحرية 🎙️
            </p>
          </div>

          {/* Dynamic Island Mini Equalizer Waveform */}
          <div className="hidden sm:flex items-center gap-1 h-5 px-1 shrink-0">
            <span className="aq-wave-bar w-1 rounded-full bg-amber-400" style={{ animationDelay: "0.1s" }} />
            <span className="aq-wave-bar w-1 rounded-full bg-emerald-400" style={{ animationDelay: "0.3s" }} />
            <span className="aq-wave-bar w-1 rounded-full bg-cyan-400" style={{ animationDelay: "0.5s" }} />
            <span className="aq-wave-bar w-1 rounded-full bg-amber-400" style={{ animationDelay: "0.2s" }} />
          </div>
        </button>
      )}

      {/* ========================================================================= */}
      {/* NEXT-GEN ALL-IN-ONE SIRI AMBIENT SPATIAL CAPSULE (Option 1)               */}
      {/* ========================================================================= */}
      {isOpen && activeUiStyle === "siri" && (
        <div className="fixed bottom-4 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-50 w-full sm:max-w-xl animate-in slide-in-from-bottom-5 duration-300 select-none">
          <div className={`rounded-[2.4rem] border-2 aq-siri-glow backdrop-blur-3xl p-4 sm:p-5 shadow-2xl transition-all relative overflow-hidden ${
            isDark
              ? "bg-[#070b16]/95 text-white shadow-[0_25px_80px_rgba(0,0,0,0.9)]"
              : "bg-white/95 text-slate-900 shadow-[0_25px_80px_rgba(248,202,20,0.18)]"
          }`}>
            {/* Top Ambient Fluid Mesh Ribbon Background Glow */}
            <div className="aq-fluid-mesh absolute top-0 left-0 right-0 h-1.5 opacity-80" />

            {/* Top Header & Status Row */}
            <div className="flex items-center justify-between pb-3 border-b border-current/10">
              {/* Right: Bot Brand & Live Status */}
              <div className="flex items-center gap-2.5">
                <div className="relative grid h-9 w-9 place-items-center rounded-full bg-gradient-to-tr from-[#f8ca14] to-yellow-300 text-slate-950 font-black shadow shrink-0">
                  <Bot size={18} />
                  <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-slate-900 animate-pulse" />
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black">مستشار العقيق الذكي</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      liveVoiceState === "speaking"
                        ? "bg-amber-400/20 text-amber-500 border-amber-400/30"
                        : liveVoiceState === "listening"
                        ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/30 animate-pulse"
                        : "bg-cyan-500/20 text-cyan-500 border-cyan-500/30"
                    }`}>
                      {liveVoiceState === "speaking" && "يتحدث الآن 🔊"}
                      {liveVoiceState === "listening" && "يستمع لصوتك 🎙️"}
                      {liveVoiceState === "thinking" && "يفكر ويصيغ الرد... ⚡"}
                      {liveVoiceState === "idle" && "جاهز للمحادثة"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Left: Quick Controls */}
              <div className="flex items-center gap-1.5">
                {/* Switch to Full Swiss Chat Modal */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveUiStyle("swiss");
                    localStorage.setItem("aqeeq_ai_ui_style", "swiss");
                  }}
                  className={`hidden sm:inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-[10px] font-black transition border ${
                    isDark
                      ? "border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
                      : "border-slate-200 bg-slate-100 text-slate-700 hover:text-black"
                  }`}
                  title="فتح نافذة الشات الكاملة"
                >
                  <MessageSquare size={11} />
                  <span>الشات الكامل</span>
                </button>

                {/* Voice Mute Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    if (isSpeaking) stopSpeaking();
                    setIsVoiceEnabled(!isVoiceEnabled);
                    toast.info(!isVoiceEnabled ? "تم تفعيل الصوت الطبيعي 🔊" : "تم كتم الصوت 🔈");
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
                  title={isVoiceEnabled ? "الصوت مفعل" : "الصوت مكتوم"}
                >
                  {isVoiceEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                </button>

                {/* Keyboard Spotlight Input Toggle */}
                <button
                  type="button"
                  onClick={() => setIsSiriTextOpen(!isSiriTextOpen)}
                  className={`grid h-8 w-8 place-items-center rounded-xl transition ${
                    isSiriTextOpen
                      ? "bg-amber-400 text-slate-950 font-black"
                      : isDark
                      ? "border border-white/10 bg-white/5 text-slate-300 hover:text-white"
                      : "border border-slate-200 bg-slate-100 text-slate-700 hover:text-black"
                  }`}
                  title="كتابة سؤالك بالكيبورد"
                >
                  <Keyboard size={15} />
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (isSpeaking) stopSpeaking();
                    if (isListening) stopListening();
                    setIsOpen(false);
                  }}
                  className={`grid h-8 w-8 place-items-center rounded-xl transition ${
                    isDark ? "text-slate-400 hover:text-white hover:bg-white/10" : "text-slate-500 hover:text-slate-900 hover:bg-black/5"
                  }`}
                  title="تصغير / إغلاق"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Middle Section: Spotlight Input Mode OR Live Voice & Subtitles Stage */}
            {isSiriTextOpen ? (
              /* Spotlight Command Input Morph */
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (inputPrompt.trim()) {
                    handleSend();
                    setIsSiriTextOpen(false);
                  }
                }}
                className="py-3 animate-in fade-in zoom-in-95 duration-200"
              >
                <div className={`flex items-center gap-2 rounded-2xl border p-2 transition shadow-inner ${
                  isDark
                    ? "border-white/15 bg-black/70 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20"
                    : "border-slate-300 bg-slate-50 focus-within:border-amber-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/20"
                }`}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    placeholder="اكتب استفسارك هنا، وسأجيبك فوراً بالصوت..."
                    className="flex-1 bg-transparent px-2 py-1 text-xs sm:text-sm font-bold outline-none"
                    autoFocus
                  />
                  <Button
                    type="submit"
                    disabled={!inputPrompt.trim() || askAiMutation.isPending}
                    className="rounded-xl bg-[#f8ca14] text-slate-950 font-black px-4 py-1.5 text-xs hover:bg-yellow-300 transition shadow"
                  >
                    <span>إرسال</span>
                    <Send size={13} className="mr-1" />
                  </Button>
                </div>
              </form>
            ) : (
              /* Live Voice Subtitles & Visualizer Stage */
              <div className="py-3 sm:py-4 space-y-3">
                {/* Live Transcript Bubble */}
                <div className={`rounded-2xl border p-3.5 text-right transition-all ${
                  isDark
                    ? "border-white/10 bg-white/[0.04]"
                    : "border-amber-200/80 bg-amber-50/40"
                }`}>
                  {interimSpeech ? (
                    <div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-400/20 text-emerald-500 text-[10px] font-black">
                        🎙️ أنت تتحدث:
                      </span>
                      <p className={`mt-1.5 text-xs sm:text-sm font-bold leading-relaxed ${isDark ? "text-emerald-200" : "text-emerald-900"}`}>
                        "{interimSpeech}"
                      </p>
                    </div>
                  ) : lastAssistantVoiceTranscript ? (
                    <div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-500 text-[10px] font-black">
                        💎 المستشار:
                      </span>
                      <p className={`mt-1.5 text-xs sm:text-sm font-medium leading-relaxed ${isDark ? "text-white" : "text-slate-900"}`}>
                        {lastAssistantVoiceTranscript}
                      </p>
                    </div>
                  ) : (
                    <p className={`text-xs sm:text-sm font-medium text-center py-0.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      أنا أسمعك الآن.. تفضل بالسؤال أو تصفح الموقع وسأجيبك فوراً 🎙️✨
                    </p>
                  )}
                </div>

                {/* Siri Multi-Colored Fluid Equalizer Waveform */}
                <div className="flex items-center justify-center gap-1.5 h-8">
                  {[25, 60, 40, 90, 70, 100, 80, 50, 30].map((h, idx) => (
                    <span
                      key={idx}
                      style={{
                        animationDelay: `${0.1 * idx}s`,
                      }}
                      className={`aq-wave-bar w-1.5 sm:w-2 rounded-full transition-all duration-200 ${
                        idx % 3 === 0
                          ? "bg-gradient-to-t from-amber-500 to-yellow-300 shadow-[0_0_10px_rgba(248,202,20,0.5)]"
                          : idx % 3 === 1
                          ? "bg-gradient-to-t from-emerald-500 to-teal-300 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                          : "bg-gradient-to-t from-cyan-500 to-blue-300 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Controls & Contextual Action Chips */}
            <div className="pt-2 border-t border-current/10 flex flex-wrap items-center justify-between gap-2">
              {/* Primary Glowing Action Pill */}
              <div className="flex items-center gap-2">
                {liveVoiceState === "speaking" ? (
                  <button
                    type="button"
                    onClick={() => {
                      stopSpeaking();
                      startLiveVoiceListening();
                    }}
                    className="rounded-full bg-gradient-to-r from-amber-400 via-[#f8ca14] to-yellow-300 text-slate-950 font-black px-4 sm:px-5 py-1.5 text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(248,202,20,0.5)] hover:scale-105 transition"
                  >
                    <Square size={11} className="fill-current" />
                    <span>مقاطعة والتحدث 🎙️</span>
                  </button>
                ) : liveVoiceState === "listening" ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (interimSpeech) {
                        sendLiveVoiceTurn(interimSpeech);
                      } else {
                        stopListening();
                      }
                    }}
                    className="rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300 text-slate-950 font-black px-4 sm:px-5 py-1.5 text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:scale-105 transition"
                  >
                    <Square size={11} className="fill-current" />
                    <span>أستمع لصوتك.. (إنهاء وإرسال)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startLiveVoiceListening}
                    className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black px-4 sm:px-5 py-1.5 text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:scale-105 transition"
                  >
                    <Mic size={13} />
                    <span>تحدث الآن 🎙️</span>
                  </button>
                )}
              </div>

              {/* Contextual Smart Site Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                {[
                  { label: "القبول والرسوم", url: "https://aqeeq.edu.sa", isExt: true },
                  { label: "صوري بالوجه", url: "/albums", isExt: false },
                  { label: "البودكاست", url: "/podcast", isExt: false },
                ].map((chip, ci) => (
                  <button
                    key={ci}
                    type="button"
                    onClick={() => handleShortcutClick(chip.url)}
                    className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold border transition hover:scale-105 ${
                      isDark
                        ? "border-white/10 bg-white/5 text-slate-300 hover:border-amber-400/50 hover:bg-amber-400/10 hover:text-amber-300"
                        : "border-slate-200 bg-slate-100 text-slate-700 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-900"
                    }`}
                  >
                    <span>{chip.label}</span>
                    <ArrowUpLeft size={10} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SWISS LUXURY GLASS CARD VIEW (Option 2)                                 */}
      {/* ========================================================================= */}
      {isOpen && activeUiStyle === "swiss" && (
        <div
          className={`flex flex-col transition-all duration-300 border-2 aq-siri-glow shadow-2xl backdrop-blur-3xl animate-in zoom-in-95 overflow-hidden fixed inset-0 sm:inset-auto sm:relative sm:rounded-[2.8rem] w-full sm:w-[470px] h-[100dvh] sm:h-[620px] max-h-none sm:max-h-[88vh] z-50 ${
            isLiveVoiceMode
              ? isDark
                ? "bg-[#060913] text-white shadow-[0_25px_90px_rgba(0,0,0,0.95)]"
                : "bg-white text-slate-900 shadow-[0_25px_90px_rgba(248,202,20,0.15)]"
              : isDark
              ? "bg-[#070a14]/95 text-white shadow-[0_25px_80px_rgba(0,0,0,0.9)]"
              : "bg-white/98 text-slate-900 shadow-[0_25px_80px_rgba(0,0,0,0.18)]"
          } ${
            isExpanded
              ? "sm:w-[740px] sm:h-[85vh] sm:max-h-[820px]"
              : ""
          }`}
        >
          {/* Executive Clean Header */}
          <div className={`flex items-center justify-between border-b px-3.5 sm:px-4 py-2.5 sm:py-3 transition-colors ${
            isLiveVoiceMode
              ? "border-white/10 bg-[#050811] text-white"
              : isDark
              ? "border-white/10 bg-gradient-to-r from-[#0a101f] via-[#0d162c] to-[#0a101f] text-white"
              : "border-slate-200/90 bg-gradient-to-r from-slate-50 via-white to-amber-50/30 text-slate-900"
          }`}>
            {/* Right: Branding & Status */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="relative grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-2xl bg-gradient-to-tr from-[#f8ca14] to-yellow-300 text-slate-950 font-black shadow-md shrink-0">
                <Bot size={20} className="sm:w-[22px] sm:h-[22px]" />
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse" />
              </div>
              <div className="text-right">
                <h3 className={`text-xs sm:text-sm font-black tracking-tight leading-tight ${isDark || isLiveVoiceMode ? "text-white" : "text-slate-900"}`}>
                  مستشار العقيق الذكي
                </h3>
                <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>متصل الآن • مدارس العقيق</span>
                </p>
              </div>
            </div>

            {/* Center: Segmented Pill Switch [ 🎙️ صوتي | 💬 كتابي ] */}
            <div className={`flex items-center rounded-full p-1 border backdrop-blur-md shadow-inner transition-colors mx-1 ${
              isDark || isLiveVoiceMode
                ? "border-white/10 bg-black/60"
                : "border-slate-200 bg-slate-100/90"
            }`}>
              <button
                type="button"
                onClick={enterLiveVoiceMode}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-black transition-all duration-300 ${
                  isLiveVoiceMode
                    ? "bg-gradient-to-r from-amber-400 to-[#f8ca14] text-slate-950 shadow-md scale-105"
                    : isDark
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-600 hover:text-black"
                }`}
                title="التحويل للمحادثة الصوتية المباشرة"
              >
                <Mic size={13} className={isLiveVoiceMode ? "animate-pulse" : ""} />
                <span>صوتي</span>
              </button>

              <button
                type="button"
                onClick={exitLiveVoiceMode}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-black transition-all duration-300 ${
                  !isLiveVoiceMode
                    ? isDark
                      ? "bg-white/15 text-white shadow-md scale-105"
                      : "bg-white text-slate-950 shadow-sm scale-105"
                    : "text-slate-400 hover:text-white"
                }`}
                title="التحويل للشات المكتوب"
              >
                <MessageSquare size={13} />
                <span>كتابي</span>
              </button>
            </div>

            {/* Left: Sound, Switcher, More Options Menu, and Close */}
            <div className="flex items-center gap-1 sm:gap-1.5 relative">
              {/* Quick Switch Button to Siri Ambient Ribbon */}
              <button
                type="button"
                onClick={() => {
                  setActiveUiStyle("siri");
                  localStorage.setItem("aqeeq_ai_ui_style", "siri");
                  enterLiveVoiceMode();
                }}
                className={`hidden sm:inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-[10px] font-black transition border ${
                  isDark
                    ? "border-cyan-400/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
                    : "border-cyan-500/40 bg-cyan-50 text-cyan-800 hover:bg-cyan-100"
                }`}
                title="التبديل إلى شريط سيري المحيطي"
              >
                <span>🌌 شريط سيري</span>
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
                    ? isDark || isLiveVoiceMode
                      ? "text-amber-300 bg-amber-400/10 hover:bg-amber-400/20"
                      : "text-amber-700 bg-amber-50 hover:bg-amber-100"
                    : isDark || isLiveVoiceMode
                      ? "text-slate-500 hover:text-white hover:bg-white/10"
                      : "text-slate-400 hover:text-slate-900 hover:bg-black/5"
                }`}
                title={isVoiceEnabled ? "الصوت مفعل (اضغط للكتم)" : "الصوت مكتوم (اضغط للتفعيل)"}
              >
                {isVoiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>

              {/* More Options Dropdown Button ⋯ */}
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`grid h-8 w-8 place-items-center rounded-xl transition ${
                  isMenuOpen
                    ? isDark || isLiveVoiceMode
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 text-black"
                    : isDark || isLiveVoiceMode
                      ? "text-slate-400 hover:text-white hover:bg-white/10"
                      : "text-slate-500 hover:text-slate-900 hover:bg-black/5"
                }`}
                title="خيارات إضافية"
              >
                <MoreHorizontal size={18} />
              </button>

              {/* More Options Floating Popover Menu */}
              {isMenuOpen && (
                <div
                  className={`absolute top-10 left-0 z-50 w-52 rounded-2xl border p-2 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 ${
                    isDark || isLiveVoiceMode
                      ? "border-white/15 bg-[#0a0e1c]/95 text-white"
                      : "border-slate-200 bg-white/98 text-slate-800"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsExpanded(!isExpanded);
                    }}
                    className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-right hover:bg-amber-400/15 hover:text-amber-400 transition"
                  >
                    {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    <span>{isExpanded ? "تصغير حجم النافذة" : "تكبير الشاشة (ملء الحجم)"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleReset();
                    }}
                    className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-right hover:bg-red-500/15 hover:text-red-400 transition"
                  >
                    <RotateCcw size={14} />
                    <span>مسح وبدء محادثة جديدة</span>
                  </button>

                  <div className="my-1 border-t border-current/10" />

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsKeyModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-right hover:bg-amber-400/15 hover:text-amber-400 transition"
                  >
                    <Key size={14} />
                    <div className="flex flex-col items-start text-right">
                      <span>إعدادات الذكاء الحي (API)</span>
                      <span className="text-[10px] opacity-60">
                        {aiStatus?.hasLiveGemini ? "Google Gemini مفعّل ⚡" : "تفعيل المفتاح الشخصي"}
                      </span>
                    </div>
                  </button>
                </div>
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsOpen(false);
                }}
                className={`grid h-8 w-8 place-items-center rounded-xl transition ${
                  isDark || isLiveVoiceMode
                    ? "text-slate-400 hover:text-white hover:bg-white/10"
                    : "text-slate-500 hover:text-slate-900 hover:bg-black/5"
                }`}
                title="إغلاق النافذة"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* MAIN BODY: Either Gemini Live Aurora Studio OR Written Chat History */}
          {isLiveVoiceMode ? (
            /* ========================================================================= */
            /* GEMINI LIVE AURORA STUDIO (استوديو الفويس الحي الأورورا ثلاثي الأبعاد)    */
            /* ========================================================================= */
            <div className={`flex-1 flex flex-col justify-between p-4 sm:p-6 text-center animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden select-none transition-colors ${
              isDark
                ? "bg-gradient-to-b from-[#070b16] via-[#091124] to-[#04060e] text-white"
                : "bg-gradient-to-b from-white via-amber-50/40 to-slate-100 text-slate-900"
            }`}>
              {/* Multidimensional Cosmic Aurora Background Blobs */}
              <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl pointer-events-none animate-pulse" />
              <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-teal-500/15 blur-3xl pointer-events-none animate-pulse" />

              {/* Status Header Badge (Single - No duplicate buttons!) */}
              <div className="relative z-10 flex items-center justify-center">
                <div
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-black border backdrop-blur-xl shadow-lg transition ${
                    liveVoiceState === "speaking"
                      ? "border-amber-400/50 bg-amber-400/15 text-amber-300 shadow-[0_0_20px_rgba(248,202,20,0.2)]"
                      : liveVoiceState === "listening"
                      ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                      : "border-cyan-400/40 bg-cyan-500/10 text-cyan-300"
                  }`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      liveVoiceState === "speaking"
                        ? "bg-amber-400 animate-pulse"
                        : liveVoiceState === "listening"
                        ? "bg-emerald-400 animate-ping"
                        : "bg-cyan-400 animate-spin"
                    }`}
                  />
                  <span>
                    {liveVoiceState === "speaking" && "المستشار يتحدث بصوت بشري طبيعي 🔊"}
                    {liveVoiceState === "listening" && "أستمع إليك الآن.. تفضل بالتحدث 🎙️"}
                    {liveVoiceState === "thinking" && "المستشار يفكر ويصيغ الرد... ⚡"}
                    {liveVoiceState === "idle" && "جاهز للاستماع"}
                  </span>
                </div>
              </div>

              {/* Center: The Futuristic Living Aurora Plasma Orb */}
              <div className="relative z-10 flex-1 flex flex-col items-center justify-center my-3">
                <div className="relative flex items-center justify-center">
                  {/* Outer Concentric Sonic Ripples */}
                  <div
                    className={`absolute h-56 w-56 sm:h-72 sm:w-72 rounded-full blur-3xl transition-all duration-700 ${
                      liveVoiceState === "speaking"
                        ? "bg-gradient-to-tr from-amber-500/40 via-yellow-400/30 to-rose-500/30 scale-125 animate-pulse"
                        : liveVoiceState === "listening"
                        ? "bg-gradient-to-tr from-emerald-500/40 via-teal-400/30 to-cyan-500/35 scale-120 animate-pulse"
                        : "bg-gradient-to-tr from-blue-600/30 via-indigo-600/25 to-purple-600/30 scale-100 animate-spin"
                    }`}
                  />

                  {/* Glass Outer Ambient Ring */}
                  <div
                    className={`relative grid h-44 w-44 sm:h-56 sm:w-56 place-items-center rounded-full border border-white/20 transition-all duration-500 shadow-2xl backdrop-blur-md ${
                      liveVoiceState === "speaking"
                        ? "border-amber-400/60 bg-gradient-to-tr from-amber-500/20 via-yellow-500/10 to-transparent shadow-[0_0_60px_rgba(248,202,20,0.5)] scale-105"
                        : liveVoiceState === "listening"
                        ? "border-emerald-400/60 bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-transparent shadow-[0_0_60px_rgba(16,185,129,0.5)] scale-105"
                        : "border-cyan-400/40 bg-gradient-to-tr from-cyan-500/15 via-blue-500/10 to-transparent shadow-[0_0_50px_rgba(6,182,212,0.4)] animate-pulse"
                    }`}
                  >
                    {/* Middle Acoustic Layer */}
                    <div
                      className={`grid h-36 w-36 sm:h-44 sm:w-44 place-items-center rounded-full border border-white/25 transition-all duration-300 ${
                        liveVoiceState === "speaking"
                          ? "bg-amber-400/10 shadow-[0_0_30px_rgba(248,202,20,0.3)]"
                          : liveVoiceState === "listening"
                          ? "bg-emerald-400/10 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                          : "bg-blue-500/10"
                      }`}
                    >
                      {/* Fluid Radiant Core with 3D Depth */}
                      <div
                        className={`grid h-28 w-28 sm:h-36 sm:w-36 place-items-center rounded-full transition-all duration-300 shadow-2xl relative overflow-hidden ${
                          liveVoiceState === "speaking"
                            ? "bg-gradient-to-tr from-amber-500 via-[#f8ca14] to-yellow-200 shadow-[0_0_50px_rgba(248,202,20,0.8),inset_0_0_25px_rgba(255,255,255,0.8)] scale-105"
                            : liveVoiceState === "listening"
                            ? "bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-200 shadow-[0_0_50px_rgba(16,185,129,0.8),inset_0_0_25px_rgba(255,255,255,0.8)] animate-pulse"
                            : "bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-600 shadow-[0_0_40px_rgba(6,182,212,0.7),inset_0_0_20px_rgba(255,255,255,0.5)]"
                        }`}
                      >
                        {/* Dynamic Interactive Sound Wave Spectrum inside the Orb */}
                        <div className="flex items-center gap-1.5 h-12 z-10 px-2">
                          {[35, 75, 55, 100, 80, 95, 60, 85, 40].map((barHeight, idx) => (
                            <span
                              key={idx}
                              style={{
                                animationDelay: `${0.1 * idx}s`,
                                height:
                                  liveVoiceState === "speaking" || liveVoiceState === "listening"
                                    ? undefined
                                    : "25%",
                              }}
                              className={`w-1.5 rounded-full transition-all duration-150 ${
                                liveVoiceState === "speaking" || liveVoiceState === "listening"
                                  ? "aq-wave-bar bg-slate-950 shadow-sm"
                                  : "bg-white/80"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Real-time Subtitles Capsule (100% High-Contrast, Crystal Clear in both Light and Dark!) */}
                <div className={`mt-6 w-full max-w-sm rounded-2xl border p-4 text-right backdrop-blur-2xl shadow-lg transition-all ${
                  isDark
                    ? "border-white/20 bg-white/[0.08] text-white shadow-[0_15px_35px_rgba(0,0,0,0.5)]"
                    : "border-amber-300/80 bg-white text-slate-900 shadow-md"
                }`}>
                  {interimSpeech ? (
                    <div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-400/25 text-emerald-500 border border-emerald-400/40 text-[11px] font-black">
                        🎙️ أنت تتحدث الآن:
                      </span>
                      <p className={`mt-2 text-sm font-bold leading-relaxed ${isDark ? "text-emerald-100" : "text-emerald-900"}`}>
                        "{interimSpeech}"
                      </p>
                    </div>
                  ) : lastAssistantVoiceTranscript ? (
                    <div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400/25 text-amber-500 border border-amber-400/40 text-[11px] font-black">
                        💎 المستشار:
                      </span>
                      <p className={`mt-2 text-sm font-medium leading-relaxed line-clamp-4 ${isDark ? "text-white" : "text-slate-900"}`}>
                        {lastAssistantVoiceTranscript}
                      </p>
                    </div>
                  ) : lastUserVoiceTranscript ? (
                    <div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-400/25 text-emerald-500 border border-emerald-400/40 text-[11px] font-black">
                        🎙️ آخر ما قلته:
                      </span>
                      <p className={`mt-2 text-sm font-medium leading-relaxed line-clamp-3 ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                        "{lastUserVoiceTranscript}"
                      </p>
                    </div>
                  ) : (
                    <p className={`text-center text-xs font-medium py-1 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                      تحدث بحرية.. سأسمعك وأرد فوراً بدون لمس أي زر 🎙️✨
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom Floating Control Bar */}
              <div className="relative z-10 flex items-center justify-center gap-3 pt-3 border-t border-white/10">
                {liveVoiceState === "speaking" ? (
                  <button
                    type="button"
                    onClick={() => {
                      stopSpeaking();
                      startLiveVoiceListening();
                    }}
                    className="rounded-full bg-gradient-to-r from-amber-400 via-[#f8ca14] to-yellow-300 text-slate-950 font-black px-7 py-2.5 text-xs flex items-center gap-2 shadow-[0_0_30px_rgba(248,202,20,0.6)] hover:scale-105 transition"
                  >
                    <Square size={13} className="fill-current" />
                    <span>مقاطعة والتحدث 🎙️</span>
                  </button>
                ) : liveVoiceState === "listening" ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (interimSpeech) {
                        sendLiveVoiceTurn(interimSpeech);
                      } else {
                        stopListening();
                      }
                    }}
                    className="rounded-full bg-emerald-500 text-slate-950 font-black px-6 py-2.5 text-xs flex items-center gap-2 shadow-xl hover:bg-emerald-400 transition hover:scale-105"
                  >
                    <Square size={14} className="fill-current" />
                    <span>إنهاء الحديث وإرسال</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startLiveVoiceListening}
                    className="rounded-full bg-emerald-500 text-slate-950 font-black px-6 py-2.5 text-xs flex items-center gap-2 shadow-xl hover:bg-emerald-400 transition hover:scale-105"
                  >
                    <Mic size={16} />
                    <span>تحدث الآن 🎙️</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={exitLiveVoiceMode}
                  className={`rounded-full p-2.5 border transition ${
                    isDark
                      ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-black"
                  }`}
                  title="العودة للشات المكتوب"
                >
                  <Keyboard size={16} />
                </button>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* WRITTEN CHAT VIEW (رسائل الشات المكتوبة + شريط الإدخال)                 */
            /* ========================================================================= */
            <>
              {/* Chat Messages List */}
              <div
                className={`flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm leading-relaxed ${
                  isDark ? "bg-[#070a12]/70" : "bg-slate-50/50"
                }`}
              >
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
                              copiedIndex === i
                                ? "text-emerald-500 bg-emerald-500/20"
                                : isDark
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

                    {/* Action Shortcuts (Only on subsequent messages) */}
                    {i > 0 && msg.actionShortcuts && msg.actionShortcuts.length > 0 && (
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

                    {/* Suggested Quick Follow-Up Questions (Only on subsequent messages) */}
                    {i > 0 && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && i === messages.length - 1 && (
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
                  <div
                    className={`flex items-center gap-2.5 text-xs font-black p-3.5 rounded-2xl rounded-bl-none w-fit shadow-md animate-pulse ${
                      isDark
                        ? "bg-[#111728] border border-amber-400/30 text-amber-300"
                        : "bg-white border border-amber-400/50 text-amber-800 shadow-sm"
                    }`}
                  >
                    <Sparkles size={16} className={`${isDark ? "text-amber-400" : "text-amber-600"} animate-spin`} />
                    <span>المساعد الذكي يفكر ويصيغ الإجابة الحية...</span>
                  </div>
                )}

                {/* 3 Clean Minimalist Swiss Service Pills (Zero Clutter!) */}
                {messages.length === 1 && (
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-4 pb-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {[
                      { icon: "🎓", text: "شروط ورسوم القبول والتسجيل" },
                      { icon: "📸", text: "البحث عن صوري بالوجه في الألبومات" },
                      { icon: "🎙️", text: "مجلة وبودكاست العقيق" },
                    ].map((card, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSend(card.text)}
                        className={`px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all duration-200 hover:scale-105 flex items-center gap-2 shadow-xs ${
                          isDark
                            ? "border-white/10 bg-white/5 hover:border-amber-400/50 hover:bg-amber-400/10 text-slate-200"
                            : "border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50 text-slate-800 shadow-sm"
                        }`}
                      >
                        <span className="text-sm">{card.icon}</span>
                        <span>{card.text}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div ref={chatBottomRef} />
              </div>

              {/* Floating Executive Input Dock */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className={`border-t p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-colors ${
                  isDark ? "border-white/10 bg-[#070b16]" : "border-slate-200 bg-white"
                }`}
              >
                <div
                  className={`flex items-center gap-2 rounded-2xl border p-1.5 px-2.5 transition-all shadow-inner ${
                    isDark
                      ? "border-white/15 bg-black/60 focus-within:border-amber-400/80 focus-within:ring-2 focus-within:ring-amber-400/20"
                      : "border-slate-300 bg-slate-50 focus-within:border-amber-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/20"
                  }`}
                >
                  {/* Quick Voice Mic Button */}
                  <button
                    type="button"
                    onClick={enterLiveVoiceMode}
                    className={`grid h-9 w-9 place-items-center rounded-xl transition shrink-0 ${
                      isDark
                        ? "bg-amber-400/10 text-amber-300 hover:bg-amber-400 hover:text-slate-950"
                        : "bg-amber-100/70 text-amber-800 hover:bg-amber-400 hover:text-slate-950"
                    }`}
                    title="التحدث صوتياً (محادثة فورية) 🎙️"
                  >
                    <Mic size={17} />
                  </button>

                  <input
                    ref={inputRef}
                    type="text"
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    placeholder="اكتب استفسارك هنا، أو اضغط على المايك للتحدث..."
                    className={`flex-1 bg-transparent px-2 py-1 text-xs sm:text-sm font-bold outline-none ${
                      isDark
                        ? "text-white placeholder-slate-500"
                        : "text-slate-900 placeholder-slate-400"
                    }`}
                  />

                  <Button
                    type="submit"
                    disabled={!inputPrompt.trim() || askAiMutation.isPending}
                    className="grid h-9 w-9 place-items-center rounded-xl bg-[#f8ca14] text-slate-950 font-black hover:bg-yellow-300 transition shadow-md shrink-0 p-0 disabled:opacity-30"
                    title="إرسال"
                  >
                    <Send size={15} className="mr-0.5" />
                  </Button>
                </div>
              </form>
            </>
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
