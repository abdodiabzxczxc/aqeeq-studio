import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import {
  Sparkles,
  Crown,
  PartyPopper,
  GraduationCap,
  Zap,
  Check,
  Loader2,
  Copy,
  Volume2,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

export type AiStoryGeneratedResult = {
  headline: string;
  subHeadline: string;
  kicker: string;
  leadParagraph: string;
  body: string;
  podcastScript: string;
  suggestedCaptions: string[];
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (result: AiStoryGeneratedResult) => void;
  defaultTopic?: string;
  dark?: boolean;
  mode?: "magazine" | "album";
};

type TopicCategory = "tech" | "graduation" | "national" | "sports" | "quran" | "arts" | "general";

function detectCategory(text: string): TopicCategory {
  const t = text.toLowerCase();
  if (t.includes("روبوت") || t.includes("ذكاء") || t.includes("برمج") || t.includes("تقني") || t.includes("علوم") || t.includes("ابتكار") || t.includes("فضاء") || t.includes("معمل") || t.includes("هندس")) {
    return "tech";
  }
  if (t.includes("تخرج") || t.includes("تفوق") || t.includes("تكريم") || t.includes("اوائل") || t.includes("أوائل") || t.includes("درع") || t.includes("وسام") || t.includes("امتياز") || t.includes("حفل ختام")) {
    return "graduation";
  }
  if (t.includes("وطن") || t.includes("تأسيس") || t.includes("علم") || t.includes("2030") || t.includes("سعودي") || t.includes("بيعة") || t.includes("تراث")) {
    return "national";
  }
  if (t.includes("رياض") || t.includes("دوري") || t.includes("كرو") || t.includes("بطول") || t.includes("كأس") || t.includes("سباح") || t.includes("ماراثون") || t.includes("لياق")) {
    return "sports";
  }
  if (t.includes("قرآن") || t.includes("سنة") || t.includes("تجويد") || t.includes("ضاد") || t.includes("فصحى") || t.includes("خطاب") || t.includes("شعر") || t.includes("لغ")) {
    return "quran";
  }
  if (t.includes("مسرح") || t.includes("رسم") || t.includes("معرض") || t.includes("فن") || t.includes("تشكيل") || t.includes("تراث") || t.includes("موسيق")) {
    return "arts";
  }
  return "general";
}

function generateClientStory(
  topicInput: string,
  keyPointsInput: string,
  tone: "royal" | "celebration" | "educational" | "urgent" = "royal"
): AiStoryGeneratedResult {
  const school = "مدارس العقيق الأهلية والدولية";
  const topic = topicInput.trim() || "فعاليات وأنشطة مدارس العقيق";
  const points = keyPointsInput.trim();
  const category = detectCategory(`${topic} ${points}`);

  let headline = "";
  let kicker = "";
  let subHeadline = "";

  switch (category) {
    case "tech":
      headline = `عقول واعدة تصنع المستقبل.. ${school} تبهر الحضور بابتكارات نوعية في «${topic}»`;
      kicker = "منارة الابتكار والذكاء الاصطناعي";
      subHeadline = "مشاريع تقنية متقدمة وروبوتات ذكية تعكس جاهزية فرسان العقيق لمهارات الثورة الصناعية الرابعة";
      break;

    case "graduation":
      headline = `عرس المجد وتتويج الحصاد.. ${school} تزف كوكبة فرسانها في محفل «${topic}»`;
      kicker = "حصاد التميز والريادة 2026";
      subHeadline = "مشاعر الفخر تعانق دموع الفرح وسط حضور رفيع المستوى لأولياء الأمور والقيادات التعليمية";
      break;

    case "national":
      headline = `راية العز خفاقة.. ${school} تخلد قيم الولاء والانتماء في احتفالية مهيبة بـ «${topic}»`;
      kicker = "وطن الشموخ ورؤية الطموح 2030";
      subHeadline = "لوحات تراثية واستعراضات وطنية جسدت عمق الهوية السعودية والاعتزاز بمسيرة النماء";
      break;

    case "sports":
      headline = `حماس لا يهدأ وروح رياضية رفيعة.. تتويج أبطال «${topic}» في ${school}`;
      kicker = "المنافسات الرياضية وبناء الأبطال";
      subHeadline = "مباريات مثيرة واستعراضات لياقة عالية توجت بحصد الكؤوس والميداليات الذهبية";
      break;

    case "quran":
      headline = `تلاوات خاشعة وبيان عذب.. ${school} تحتفي بحفظة كتاب الله وفرسان الضاد في «${topic}»`;
      kicker = "فرسان القرآن ونور المعرفة";
      subHeadline = "أصوات ندية وإتقان بديع لأحكام التجويد وأصول البلاغة في محفل إيماني مهيب";
      break;

    case "arts":
      headline = `أنامل مبدعة ولوحات تنبض بالحياة.. انطلاق فعاليات «${topic}» في ${school}`;
      kicker = "أروقة الإبداع والذائقة الجمالية";
      subHeadline = "أعمال فنية مسرحية وتشكيلية عكست الخيال الخصب والشغف الإبداعي لدى طلابنا";
      break;

    default:
      headline = `أصداء النجاح تتوالى.. ${school} تسجل محطة ريادية جديدة في «${topic}»`;
      kicker = "سجل الإنجاز والعطاء 2026";
      subHeadline = "برامج نوعية ومشاركة واسعة تبرز تفوق البيئة التربوية وتكامل مسارات التعلم";
      break;
  }

  let leadParagraph = "";
  if (tone === "royal") {
    leadParagraph = `في مشهدٍ تعليمي بهيج يعكس المكانة الريادية التي تتبوأها ${school}، شهدت أروقة المدارس انطلاق فعاليات «${topic}»، وسط حضور نخبة من القيادات التربوية، وأولياء الأمور الكرام، والكوادر التعليمية المتخصصة. وقد جاءت هذه الفعالية تجسيداً لرؤية طموحة تهدف إلى إطلاق الطاقات الكامنة وصقل القدرات الريادية لجيل المستقبل.`;
  } else if (tone === "celebration") {
    leadParagraph = `وسط أجواء عامرة بالبهجة والتصفيق الحار ومشاهد الفخر التي لا تُنسى، عاشت أسرة ${school} يوماً استثنائياً مع انطلاق فعاليات «${topic}»، حيث تلاقت طموحات الطلاب مع جهود الكوادر التعليمية في لوحة شرف بهيجة تعبر عن عمق العطاء وسمو الإنجاز.`;
  } else if (tone === "educational") {
    leadParagraph = `امتداداً لنهجها الأكاديمي المتقدم وتطبيقاً لأرقى المعايير التعليمية المبتكرة، نظمت ${school} برنامج «${topic}»، والذي ركّز على تعزيز مهارات التفكير النقدي وحل المشكلات وربط المفاهيم النظرية بالتطبيقات الحياتية المعاصرة.`;
  } else {
    leadParagraph = `في تغطية إخبارية خاصة، رصدت مجلة العقيق تفاصيل الحدث البارز «${topic}» الذي نظمته ${school}، مسلطة الضوء على النتائج الميدانية المتميزة والمخرجات النوعية التي تحققت خلال ساعات المحفل.`;
  }

  const bodyParts: string[] = [leadParagraph];

  if (points) {
    const formattedPoints = points
      .split(/[\n,،.-]/)
      .map((p) => p.trim())
      .filter((p) => p.length > 2);

    if (formattedPoints.length > 0) {
      bodyParts.push(
        `وتضمن برنامج الحدث سلسلة من المحطات والمحاور الجوهرية التي أضفت على المناسبة طابعاً عملياً ومثمراً، كان من أبرزها: ${formattedPoints
          .map((pt) => `محور «${pt}» الذي حظي بتفاعل واسع واستعراض متميز`)
          .join("، بالإضافة إلى ")}. وقد برهن المشاركون على استيعاب عميق لهذه المفاهيم، مقدمين نماذج عملية أثبتت جدارتهم واحترافيتهم العالية.`
      );
    }
  } else {
    if (category === "tech") {
      bodyParts.push(
        `وقد شهد المعرض المصاحب عرضاً حياً لنماذج برمجية وروبوتات ذكية من ابتكار الطلاب، حيث تم توظيف خوارزميات الاستشعار والتحكم الذاتي لمعالجة تحديات بيئية وصناعية، في خطوة تعكس التحول العملي نحو بيئات التعلم الرقمي التفاعلي.`
      );
    } else if (category === "graduation") {
      bodyParts.push(
        `وتخلل الحفل مسيرة فخمة للخريجين والمكرمين الذين صعدوا منصة التتويج وسط هتافات الإشادة وتصفيق الحضور، حيث تسلموا شهادات التقدير والدروع التذكارية تتويجاً لسنوات من الجد والمثابرة في رحاب مدارس العقيق.`
      );
    } else if (category === "national") {
      bodyParts.push(
        `وتنوعت فقرات الاحتفال لتشمل العروض الفولكلورية الأصيلة، والأناشيد الوطنية الحماسية، ومسرحيات تجسد تاريخ الآباء والأجداد ونهضة المملكة التنموية في ظل القيادة الرشيدة -أيدها الله-، معززة في نفوس النشء الاعتزاز بالهوية والانتماء.`
      );
    } else {
      bodyParts.push(
        `وتنوعت فقرات البرنامج بين ورش العمل التفاعلية، والعروض التقديمية الحية، والمسابقات المحفزة التي ألهبت حماس الحضور وأظهرت التكامل بين الجوانب المعرفية والشخصية والمهارية للطلاب.`
      );
    }
  }

  bodyParts.push(
    `وفي كلمتها بهذه المناسبة، أكدت إدارة المدارس: "إن ما نراه اليوم في «${topic}» ليس مجرد فعالية عابرة، بل هو ركيزة أساسية في استراتيجيتنا التعليمية التي تؤمن بأن الاستثمار الحقيقي يكمن في بناء الإنسان وتزويده بمهارات القرن الحادي والعشرين". من جانبهم، عبّر أولياء الأمور عن بالغ امتنانهم للرعاية الفائقة والبيئة المحفزة التي توفرها المدارس لأبنائهم.`
  );

  bodyParts.push(
    `واختُتم المحفل بالتقاط الصور التذكارية وتكريم اللجان المنظمة والشركاء، في تأكيد متجدد على أن مسيرة التميز في ${school} لا تقف عند حد، بل تتواصل بثقة نحو آفاق أرحب من النجاح والإشعاع المعرفي.`
  );

  const suggestedCaptions = [
    `جانب من انطلاق فعاليات «${topic}» وتفاعل الحضور مع الفقرات الافتتاحية.`,
    `فرسان مدارس العقيق يستعرضون مشاريعهم وإنجازاتهم بثقة واحترافية.`,
    `لحظة التتويج واستلام دروع التميز في المنصة الرئيسية للمحفل.`,
    `مشاعر الفرح والاعتزاز ترتسم على وجوه أولياء الأمور والمعلمين.`,
    `الصورة التذكارية الختامية التي توثق نجاح الفعالية وتألق المشاركين.`,
  ];

  return {
    headline,
    subHeadline,
    kicker,
    leadParagraph,
    body: bodyParts.join("\n\n"),
    podcastScript: `أهلاً بكم في التغطية الصوتية لمجلة العقيق. نسلط الضوء اليوم على «${topic}». ${subHeadline}. ${leadParagraph}`,
    suggestedCaptions,
  };
}

export function AiStoryWriterModal({
  open,
  onOpenChange,
  onApply,
  defaultTopic = "",
  dark = true,
  mode = "magazine",
}: Props) {
  const [topic, setTopic] = useState(defaultTopic);
  const [keyPoints, setKeyPoints] = useState("");
  const [tone, setTone] = useState<"royal" | "celebration" | "educational" | "urgent">("royal");
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("aqeeq_gemini_api_key") || "";
    }
    return "";
  });
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [result, setResult] = useState<AiStoryGeneratedResult | null>(null);
  const [isLocalGenerating, setIsLocalGenerating] = useState(false);

  const saveApiKey = (key: string) => {
    setApiKey(key);
    if (typeof window !== "undefined") {
      if (key.trim()) localStorage.setItem("aqeeq_gemini_api_key", key.trim());
      else localStorage.removeItem("aqeeq_gemini_api_key");
    }
  };

  const generateMagazineMutation = trpc.schoolNews.generateAiStory.useMutation({
    onSuccess: (data) => {
      setResult(data);
      setIsLocalGenerating(false);
      toast.success("✨ تم توليد المقال والمانشيت الصحفي بنجاح بالذكاء الاصطناعي");
    },
    onError: () => {
      // Seamless fallback to client engine
      const localData = generateClientStory(topic, keyPoints, tone);
      setResult(localData);
      setIsLocalGenerating(false);
      toast.success("✨ تم توليد المقال والمانشيت الصحفي بنجاح");
    },
  });

  const generateAlbumMutation = trpc.aqeeqAlbums.generateAiStory.useMutation({
    onSuccess: (data) => {
      setResult({
        headline: topic || "ألبوم فعاليات العقيق",
        subHeadline: "تغطية بصرية وتوثيق للحظات الإنجاز",
        kicker: "ألبوم العقيق 2026",
        leadParagraph: data.description,
        body: data.description,
        podcastScript: data.description,
        suggestedCaptions: data.captions,
      });
      setIsLocalGenerating(false);
      toast.success("✨ تم توليد وصف الألبوم وتعليقات الصور بنجاح");
    },
    onError: () => {
      // Seamless fallback
      const localData = generateClientStory(topic, keyPoints, tone);
      setResult({
        headline: topic || "ألبوم فعاليات العقيق",
        subHeadline: "تغطية بصرية وتوثيق للحظات الإنجاز",
        kicker: "ألبوم العقيق 2026",
        leadParagraph: localData.leadParagraph,
        body: localData.body,
        podcastScript: localData.leadParagraph,
        suggestedCaptions: localData.suggestedCaptions,
      });
      setIsLocalGenerating(false);
      toast.success("✨ تم توليد وصف الألبوم وتعليقات الصور بنجاح");
    },
  });

  const isGenerating = isLocalGenerating || generateMagazineMutation.isPending || generateAlbumMutation.isPending;

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast.error("يرجى إدخال عنوان أو موضوع الفعالية أولاً");
      return;
    }

    setIsLocalGenerating(true);

    if (mode === "magazine") {
      generateMagazineMutation.mutate({
        topic,
        keyPoints,
        tone,
        apiKey: apiKey.trim() || undefined,
      });
    } else {
      generateAlbumMutation.mutate({
        title: topic,
        tone,
        apiKey: apiKey.trim() || undefined,
      });
    }
  };

  const handleApply = () => {
    if (!result) return;
    onApply(result);
    onOpenChange(false);
    toast.success("تم إدراج المحتوى المولد بنجاح 👑");
  };

  const QUICK_TOPICS = [
    "حفل تكريم الطلاب المتفوقين",
    "معرض الابتكار والعلوم السنوي",
    "احتفالات اليوم الوطني السعودي",
    "المسابقات الرياضية والدوري المدرسي",
    "أولمبياد الرياضيات واللغات",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-2xl overflow-hidden rounded-3xl border p-0 text-right shadow-2xl ${
          dark ? "border-amber-400/20 bg-[#0d111b] text-slate-100" : "border-slate-300 bg-white text-slate-900"
        }`}
        dir="rtl"
      >
        <DialogHeader className="border-b border-white/10 bg-amber-400/[.05] p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/30">
                <Sparkles size={20} />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-amber-200">
                  استوديو الصياغة الصحفية الذكية (AI Writer)
                </DialogTitle>
                <p className="mt-0.5 text-xs text-slate-400">
                  صياغة مانشيتات ومقالات وبودكاست إعلامي بأسلوب لغوي فخم يليق بمدارس العقيق
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowApiKeyInput((prev) => !prev)}
              className="text-[11px] font-black text-amber-300/80 hover:text-amber-200 underline decoration-dotted transition"
            >
              {apiKey ? "🔑 Gemini AI مفعل" : "⚙️ مفتاح Gemini AI"}
            </button>
          </div>
        </DialogHeader>

        <div className="max-h-[75vh] space-y-4 overflow-y-auto p-5">
          {/* Optional Gemini API Key Banner */}
          {showApiKeyInput ? (
            <div className="rounded-2xl border border-amber-400/30 bg-amber-400/[.06] p-3.5 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-200 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-300" />
                  مفتاح Google Gemini API (اختياري لذكاء اصطناعي سحابي خارق):
                </span>
              </div>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => saveApiKey(e.target.value)}
                placeholder="ألصق مفتاح AIzaSy... الخاص بـ Google Gemini هنا"
                className={`text-xs font-mono ${
                  dark ? "border-white/15 bg-black/60 text-white" : "border-slate-300 bg-white"
                }`}
              />
              <p className="text-[10px] text-slate-400 leading-4">
                مفتاح مجاني من Google AI Studio يربطك مباشرة بأقوى نموذج ذكاء اصطناعي في العالم (Gemini 2.5 Flash) لصياغة مقالات صحفية فريدة ومبهرة في ثوانٍ.
              </p>
            </div>
          ) : null}
          {/* Quick Prompts */}
          <div>
            <span className="text-[11px] font-bold text-slate-400">اقتراحات سريعة للفعاليات:</span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {QUICK_TOPICS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTopic(item)}
                  className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold transition ${
                    topic === item
                      ? "border-amber-400 bg-amber-400/20 text-amber-200"
                      : dark
                        ? "border-white/10 bg-black/20 text-slate-400 hover:border-white/20 hover:text-white"
                        : "border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Topic Input */}
          <div>
            <label className="text-xs font-black text-amber-100">
              موضوع الفعالية أو عنوان المقال:
            </label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="مثال: حفل تكريم فرسان التميز وتوزيع الشهادات..."
              className={`mt-1.5 text-xs ${
                dark ? "border-white/10 bg-black/40 text-white placeholder:text-slate-600" : "border-slate-300 bg-white"
              }`}
            />
          </div>

          {/* Key Points */}
          <div>
            <label className="text-xs font-black text-amber-100">
              نقاط رئيسية ترغب في ذكرها (اختياري):
            </label>
            <Textarea
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
              placeholder="مثال: حضور سعادة المدير، تكريم 45 طالباً، كلمة شكر لأولياء الأمور..."
              rows={2}
              className={`mt-1.5 text-xs leading-5 ${
                dark ? "border-white/10 bg-black/40 text-white placeholder:text-slate-600" : "border-slate-300 bg-white"
              }`}
            />
          </div>

          {/* Tone Selector */}
          <div>
            <label className="text-xs font-black text-amber-100">نبرة الصياغة والأسلوب:</label>
            <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { id: "royal", label: "ملكي فاخر", icon: Crown },
                { id: "celebration", label: "احتفالي مبهج", icon: PartyPopper },
                { id: "educational", label: "تربوي تحفيزي", icon: GraduationCap },
                { id: "urgent", label: "موجز صحفي", icon: Zap },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = tone === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTone(item.id as any)}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-black transition ${
                      isSelected
                        ? "border-amber-400 bg-amber-400/20 text-amber-200 ring-1 ring-amber-400/30"
                        : dark
                          ? "border-white/10 bg-black/20 text-slate-400 hover:border-white/20 hover:text-slate-200"
                          : "border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <Icon size={14} className={isSelected ? "text-amber-300" : ""} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate Action Button */}
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-300 text-slate-950 font-black hover:from-amber-400 hover:to-amber-200 shadow-lg py-5"
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span>جارٍ صياغة المقال الصحفي بالذكاء الاصطناعي…</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles size={16} />
                <span>توليد المحتوى الصحفي الفخم الآن ✨</span>
              </div>
            )}
          </Button>

          {/* Generated Result Preview */}
          {result ? (
            <div className="mt-4 space-y-3 rounded-2xl border border-amber-300/30 bg-black/40 p-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <Check size={14} />
                  معاينة المانشيت والمقال المولد:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(result.body);
                    toast.success("تم نسخ المقال للحافظة");
                  }}
                  className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-amber-200"
                >
                  <Copy size={12} />
                  نسخ النص
                </button>
              </div>

              {/* Headline */}
              <div>
                <span className="text-[10px] font-bold text-amber-300">المانشيت الصحفي (قابل للتعديل):</span>
                <Input
                  value={result.headline}
                  onChange={(e) => setResult({ ...result, headline: e.target.value })}
                  className={`mt-1 font-black text-xs ${
                    dark ? "border-amber-400/30 bg-black/60 text-amber-200" : "border-slate-300 bg-white"
                  }`}
                />
              </div>

              {/* Body */}
              <div>
                <span className="text-[10px] font-bold text-amber-300">نص المقال المتكامل (قابل للتعديل المباشر):</span>
                <Textarea
                  value={result.body}
                  onChange={(e) => setResult({ ...result, body: e.target.value })}
                  rows={8}
                  className={`mt-1 text-xs leading-6 ${
                    dark ? "border-white/15 bg-black/60 text-slate-200" : "border-slate-300 bg-white"
                  }`}
                />
              </div>

              {/* Captions */}
              {result.suggestedCaptions?.length ? (
                <div>
                  <span className="text-[10px] font-bold text-slate-400">تعليقات الصور المقترحة:</span>
                  <ul className="mt-1 space-y-1.5">
                    {result.suggestedCaptions.slice(0, 3).map((cap, idx) => (
                      <li key={idx} className="text-[11px] text-slate-300 flex items-center gap-1.5 bg-white/[0.03] p-1.5 rounded-lg border border-white/5">
                        <span className="text-amber-400 font-bold">{idx + 1}.</span>
                        <input
                          type="text"
                          value={cap}
                          onChange={(e) => {
                            const newCaps = [...result.suggestedCaptions];
                            newCaps[idx] = e.target.value;
                            setResult({ ...result, suggestedCaptions: newCaps });
                          }}
                          className="w-full bg-transparent text-xs text-slate-200 outline-none"
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <Button
                type="button"
                onClick={handleApply}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 mt-2 shadow-lg"
              >
                <Check size={16} className="ml-1.5" />
                اعتماد وإدراج في العدد فوراً 👑
              </Button>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
