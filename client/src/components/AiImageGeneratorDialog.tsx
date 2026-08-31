import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, RefreshCw, Check, Wand2, Image as ImageIcon, Ratio } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface AiImageGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectCover: (url: string) => void;
  type?: "article" | "podcast" | "general";
  defaultPrompt?: string;
  dark?: boolean;
}

const ARTICLE_PRESETS = [
  "روبوت وذكاء اصطناعي في مختبر مدرسي متطور",
  "طالب سعودي يحمل كأس التفوق الذهبي بالمدينة المنورة",
  "معرض العلوم والأبحاث والابتكارات الطلابية",
  "قراءة ملهمة ومكتبة مدرسية فاخرة",
  "حفل تكريم وإنجازات وطنية في مدارس العقيق",
  "مبنى مجمع العقيق الفخم في ممشى الهجرة حي الرانوناء",
];

const PODCAST_PRESETS = [
  "استوديو إذاعي فاخر مع ميكروفون احترافي وإضاءة ذهبية",
  "حوار ونقاش شبابي ملهم بين طلاب متميزين",
  "نشرة إخبارية وإذاعة مدرسية صباحية حيوية",
  "صوت القيادة التعليمية ورؤية تربوية طموحة",
  "بودكاست الابتكار وعلوم المستقبل والذكاء الاصطناعي",
];

export default function AiImageGeneratorDialog({
  open,
  onOpenChange,
  onSelectCover,
  type = "article",
  defaultPrompt = "",
  dark = true,
}: AiImageGeneratorDialogProps) {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "1:1" | "4:3">("16:9");
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    if (open && defaultPrompt && !prompt) {
      setPrompt(defaultPrompt);
    }
  }, [open, defaultPrompt]);

  const generateMutation = trpc.aiVisuals.generateCover.useMutation({
    onSuccess: (data) => {
      setImageLoading(true);
      setGeneratedUrl(data.imageUrl);
      toast.success("تم توليد المشهد البصري بنجاح بالذكاء الاصطناعي! ✨");
    },
    onError: (err) => {
      toast.error(err.message || "تعذر توليد الصورة");
    },
  });

  const handleGenerate = (customPrompt?: string) => {
    const finalPrompt = (customPrompt || prompt).trim();
    if (!finalPrompt) {
      toast.error("يرجى كتابة وصف أو فكرة الصورة المطلوبة");
      return;
    }
    generateMutation.mutate({
      prompt: finalPrompt,
      type,
      aspectRatio,
    });
  };

  const handleApply = () => {
    if (generatedUrl) {
      onSelectCover(generatedUrl);
      onOpenChange(false);
      toast.success("تم اعتماد الغلاف بنجاح! 🎨");
    }
  };

  const presets = type === "podcast" ? PODCAST_PRESETS : ARTICLE_PRESETS;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-2xl font-[Tajawal,sans-serif] ${
          dark ? "bg-[#121212] border-white/10 text-white" : "bg-white border-black/10 text-slate-900"
        }`}
        dir="rtl"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 text-base font-black">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-tr from-[#f8ca14] to-[#08467d] text-black shadow-lg">
              <Sparkles size={18} />
            </div>
            <div>
              <span>توليد وتصميم غلاف بالذكاء الاصطناعي (Gemini Vision + Flux)</span>
              <p className="text-xs text-slate-400 font-normal mt-0.5">
                {type === "podcast"
                  ? "توليد هوية بصرية مخصصة لحلقة البودكاست بجودة استوديو احترافية"
                  : "توليد صورة غلاف صحفية فاخرة تعكس موضوع المقال وهوية مدارس العقيق"}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Prompt Input */}
          <div>
            <Label className="text-xs font-black text-slate-300">وصف المشهد أو فكرة الغلاف *</Label>
            <Textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="اكتب وصفاً للمشهد باللغة العربية (مثلاً: طلاب في مختبر الروبوت والذكاء الاصطناعي بإضاءة سينمائية)..."
              className={`text-xs mt-1.5 rounded-xl ${
                dark ? "bg-black/50 border-white/10" : "bg-slate-50 border-black/10"
              }`}
            />
          </div>

          {/* Quick Presets */}
          <div>
            <Label className="text-[11px] font-bold text-slate-400 block mb-1.5">
              💡 أفكار مقترحة سريعة:
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPrompt(preset);
                    handleGenerate(preset);
                  }}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition ${
                    dark
                      ? "border-white/10 bg-white/5 hover:bg-white/10 text-slate-300"
                      : "border-black/10 bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio Selector */}
          <div className="flex items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-300">أبعاد الصورة:</span>
              <div className="flex items-center gap-1.5">
                {(["16:9", "1:1", "4:3"] as const).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black border transition ${
                      aspectRatio === ratio
                        ? "bg-[#f8ca14] text-black border-[#f8ca14]"
                        : dark
                        ? "border-white/10 bg-white/5 text-slate-300"
                        : "border-black/10 bg-slate-100 text-slate-700"
                    }`}
                  >
                    {ratio === "16:9" ? "16:9 (عريض)" : ratio === "1:1" ? "1:1 (مربع)" : "4:3 (كلاسيكي)"}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleGenerate()}
              disabled={generateMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-[#f8ca14] hover:opacity-90 text-black font-black px-4 py-2 text-xs transition shadow-lg shadow-amber-500/20"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>جاري التوليد...</span>
                </>
              ) : (
                <>
                  <Wand2 size={14} />
                  <span>{generatedUrl ? "توليد صورة بديلة" : "توليد الصورة الآن"}</span>
                </>
              )}
            </button>
          </div>

          {/* Preview Area */}
          {generatedUrl && (
            <div className="rounded-2xl border border-white/10 bg-black/60 p-3 space-y-3">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black border border-white/10 flex items-center justify-center">
                {imageLoading && (
                  <div className="absolute inset-0 grid place-items-center bg-black/70 backdrop-blur-sm z-10">
                    <Loader2 className="animate-spin text-[#f8ca14]" size={32} />
                  </div>
                )}
                <img
                  src={generatedUrl}
                  alt="Generated AI Cover"
                  className="h-full w-full object-cover"
                  onLoad={() => setImageLoading(false)}
                  onError={() => setImageLoading(false)}
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleGenerate()}
                  disabled={generateMutation.isPending}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
                >
                  <RefreshCw size={13} />
                  <span>إعادة المحاولة بزاوية أخرى</span>
                </button>

                <button
                  type="button"
                  onClick={handleApply}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black px-5 py-2 text-xs transition shadow-lg shadow-emerald-500/20"
                >
                  <Check size={16} />
                  <span>اعتماد هذه الصورة كغلاف رسمي</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
