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
  const [result, setResult] = useState<AiStoryGeneratedResult | null>(null);

  const generateMagazineMutation = trpc.schoolNews.generateAiStory.useMutation({
    onSuccess: (data) => {
      setResult(data);
      toast.success("✨ تم توليد المقال والمانشيت الصحفي بنجاح بالذكاء الاصطناعي");
    },
    onError: (err) => {
      toast.error(err.message || "تعذر توليد المقال");
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
      toast.success("✨ تم توليد وصف الألبوم وتعليقات الصور بنجاح");
    },
    onError: (err) => {
      toast.error(err.message || "تعذر توليد الوصف");
    },
  });

  const isGenerating = generateMagazineMutation.isPending || generateAlbumMutation.isPending;

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast.error("يرجى إدخال عنوان أو موضوع الفعالية أولاً");
      return;
    }

    if (mode === "magazine") {
      generateMagazineMutation.mutate({
        topic,
        keyPoints,
        tone,
      });
    } else {
      generateAlbumMutation.mutate({
        title: topic,
        tone,
      });
    }
  };

  const handleApply = () => {
    if (!result) return;
    onApply(result);
    onOpenChange(false);
    toast.success("تم إدراج المحتوى المولد في العدد بنجاح 👑");
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
        </DialogHeader>

        <div className="max-h-[75vh] space-y-4 overflow-y-auto p-5">
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
                <span className="text-[10px] font-bold text-slate-400">المانشيت الصحفي:</span>
                <p className="mt-0.5 text-sm font-black text-amber-100">{result.headline}</p>
              </div>

              {/* Body */}
              <div>
                <span className="text-[10px] font-bold text-slate-400">نص المقال المتكامل:</span>
                <p className="mt-1 whitespace-pre-line text-xs leading-6 text-slate-300">
                  {result.body}
                </p>
              </div>

              {/* Podcast Script Preview */}
              {result.podcastScript ? (
                <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-3">
                  <div className="flex items-center gap-1.5 text-xs font-black text-purple-200">
                    <Volume2 size={14} className="text-purple-300" />
                    <span>نص البودكاست الإذاعي المخصص:</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-5 text-purple-100">
                    {result.podcastScript}
                  </p>
                </div>
              ) : null}

              {/* Captions */}
              {result.suggestedCaptions?.length ? (
                <div>
                  <span className="text-[10px] font-bold text-slate-400">تعليقات الصور المقترحة:</span>
                  <ul className="mt-1 space-y-1">
                    {result.suggestedCaptions.slice(0, 3).map((cap, idx) => (
                      <li key={idx} className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <span className="text-amber-400">•</span>
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <Button
                type="button"
                onClick={handleApply}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 mt-2"
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
