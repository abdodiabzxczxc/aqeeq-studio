import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  Loader2,
  Check,
  Wand2,
  Image as ImageIcon,
  Layers,
  Palette,
  Camera,
  Download,
  Search,
} from "lucide-react";
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

// 🏛️ مكتبة الصور الفوتوغرافية الحقيقية فائقة الدقة 4K المصنفة لمدارس العقيق
const CURATED_REAL_PHOTOS = [
  // 🤖 روبوت وذكاء اصطناعي
  {
    title: "مختبر الروبوت والذكاء الاصطناعي",
    category: "روبوت وتكنولوجيا",
    url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "برمجة وهندسة الإلكترونيات",
    category: "روبوت وتكنولوجيا",
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "تكنولوجيا المستقبل والبرمجيات",
    category: "روبوت وتكنولوجيا",
    url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "عالم الذكاء الاصطناعي والابتكار",
    category: "روبوت وتكنولوجيا",
    url: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&w=1200&q=85",
  },

  // 🎙️ إذاعة وبودكاست واستوديو
  {
    title: "ميكروفون إذاعي واستوديو احترافي",
    category: "إذاعة وبودكاست",
    url: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "استوديو صوتي مع سماعات عازلة",
    category: "إذاعة وبودكاست",
    url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "طاولة حوار وميكروفونات متعددة",
    category: "إذاعة وبودكاست",
    url: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "ميكروفون كلاسيكي بإضاءة دافئة",
    category: "إذاعة وبودكاست",
    url: "https://images.unsplash.com/photo-1520523839898-50712825e3a7?auto=format&fit=crop&w=1200&q=85",
  },

  // 🏆 تفوق وتكريم أكاديمي
  {
    title: "كأس التفوق والتميز الذهبي",
    category: "تفوق وتكريم",
    url: "https://images.unsplash.com/photo-1569517282132-25d22f4573e6?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "ميداليات التكريم والإنجاز المدرسي",
    category: "تفوق وتكريم",
    url: "https://images.unsplash.com/photo-1578269174936-2709b6aeb913?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "قبعة التخرج والشهادة الأكاديمية",
    category: "تفوق وتكريم",
    url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "احتفال الإنجاز والتخرج الماسي",
    category: "تفوق وتكريم",
    url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=85",
  },

  // 🔬 علوم ومختبرات
  {
    title: "مختبر علمي متطور ومحاليل ملونة",
    category: "علوم ومختبرات",
    url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "مجهر وأبحاث علمية دقيقة",
    category: "علوم ومختبرات",
    url: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "أنابيب اختبار وتجارب كيميائية",
    category: "علوم ومختبرات",
    url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=85",
  },

  // 📚 قراءة ومكتبة
  {
    title: "مكتبة كبرى وصرح معرفي فاخر",
    category: "قراءة ومكتبة",
    url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "كتاب مفتوح في إضاءة ذهبية ملهمة",
    category: "قراءة ومكتبة",
    url: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "رفوف الكتب والثقافة المدرسية",
    category: "قراءة ومكتبة",
    url: "https://images.unsplash.com/photo-1507842229451-9f0147b19811?auto=format&fit=crop&w=1200&q=85",
  },

  // ⚽ رياضة وأكاديمية
  {
    title: "مسبح مدرسي أولمبي ومسارات السباحة",
    category: "رياضة وأكاديمية",
    url: "https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "ملعب كرة قدم عشبي حديث",
    category: "رياضة وأكاديمية",
    url: "https://images.unsplash.com/photo-1529900245534-47fbf76681e0?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "فنون قتالية تايكوندو ولياقة",
    category: "رياضة وأكاديمية",
    url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=85",
  },

  // 🇸🇦 مناسبات وهوية
  {
    title: "العلم السعودي وهيبة الوطن",
    category: "مناسبات وهوية",
    url: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "أصالة المدينة المنورة وشروق ذهبي",
    category: "مناسبات وهوية",
    url: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=85",
  },
];

const CARD_STYLES = [
  { id: "gold-dark", label: "أسود ملكي مع لمسات ذهبية", bg: "from-[#141204] via-[#0a0a0a] to-[#040404]", accent: "#f8ca14" },
  { id: "royal-blue", label: "أزرق كحلي رسمي مع ذهبي", bg: "from-[#082a4d] via-[#05182c] to-[#020b14]", accent: "#f8ca14" },
  { id: "emerald", label: "أخضر زمردي وهوية وطنية", bg: "from-[#06331e] via-[#031c10] to-[#010c07]", accent: "#34d399" },
  { id: "purple-studio", label: "بنفسجي استوديو وبودكاست", bg: "from-[#2d124d] via-[#170829] to-[#0b0314]", accent: "#c084fc" },
  { id: "crimson-ruby", label: "عقيقي قرمزي فاخر", bg: "from-[#420d18] via-[#21050b] to-[#0d0104]", accent: "#fb7185" },
];

export default function AiImageGeneratorDialog({
  open,
  onOpenChange,
  onSelectCover,
  type = "article",
  defaultPrompt = "",
  dark = true,
}: AiImageGeneratorDialogProps) {
  const [activeTab, setActiveTab] = useState<"gallery" | "cardDesigner" | "aiPrompt">("gallery");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);

  // Card Designer state
  const [cardTitle, setCardTitle] = useState(defaultPrompt || "عنوان المقال أو الحلقة");
  const [cardCategory, setCardCategory] = useState(type === "podcast" ? "إذاعة وبودكاست" : "مقال تربوي");
  const [cardStyleIndex, setCardStyleIndex] = useState(0);
  const [cardBackdropPhoto, setCardBackdropPhoto] = useState<string | null>(null);

  // AI Prompt State
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "1:1" | "4:3">("16:9");
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (open && defaultPrompt) {
      setPrompt(defaultPrompt);
      setCardTitle(defaultPrompt.replace(/^غلاف صحفي لمقال بعنوان:\s*/, "").replace(/^غلاف إذاعي وبودكاست لحلقة بعنوان:\s*/, ""));
    }
  }, [open, defaultPrompt]);

  const categories = [
    { id: "all", label: "✨ كل الصور (4K)" },
    { id: "روبوت وتكنولوجيا", label: "🤖 روبوت وذكاء اصطناعي" },
    { id: "إذاعة وبودكاست", label: "🎙️ إذاعة وبودكاست" },
    { id: "تفوق وتكريم", label: "🏆 تفوق وتكريم" },
    { id: "علوم ومختبرات", label: "🔬 علوم وتجارب" },
    { id: "قراءة ومكتبة", label: "📚 قراءة ومكتبة" },
    { id: "رياضة وأكاديمية", label: "⚽ رياضة وأكاديمية" },
    { id: "مناسبات وهوية", label: "🇸🇦 مناسبات وهوية" },
  ];

  const filteredPhotos = CURATED_REAL_PHOTOS.filter((p) => {
    if (selectedCategory !== "all" && p.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    }
    return true;
  });

  const generateMutation = trpc.aiVisuals.generateCover.useMutation({
    onSuccess: (data) => {
      setGeneratedUrl(data.imageUrl);
      toast.success("تم توليد المشهد البصري بنجاح! ✨");
    },
    onError: (err) => {
      toast.error(err.message || "تعذر توليد الصورة");
    },
  });

  const handleAiGenerate = () => {
    if (!prompt.trim()) {
      toast.error("يرجى إدخال وصف المشهد");
      return;
    }
    generateMutation.mutate({
      prompt: prompt.trim(),
      type,
      aspectRatio,
    });
  };

  const handleApply = (url: string) => {
    onSelectCover(url);
    onOpenChange(false);
    toast.success("تم اعتماد الغلاف الرسمي بنجاح! 🎨");
  };

  const activeCardStyle = CARD_STYLES[cardStyleIndex];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-4xl max-h-[90vh] overflow-y-auto font-[Tajawal,sans-serif] ${
          dark ? "bg-[#0d0d0d] border-white/10 text-white" : "bg-white border-black/10 text-slate-900"
        }`}
        dir="rtl"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-3 text-base font-black border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-tr from-[#f8ca14] to-[#08467d] text-black shadow-lg">
                <Camera size={18} />
              </div>
              <div>
                <span>استوديو الأغلفة البصرية الفاخرة (Al-Aqeeq Visual Covers Studio)</span>
                <p className="text-xs text-slate-400 font-normal mt-0.5">
                  اختر من مكتبة الصور الفوتوغرافية الحقيقية بدقة 4K، أو صمم بطاقة غلاف رسمي بهوية العقيق
                </p>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-b border-white/10 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("gallery")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition ${
              activeTab === "gallery"
                ? "bg-[#f8ca14] text-black shadow-md shadow-[#f8ca14]/20"
                : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
            }`}
          >
            <Camera size={15} />
            <span>🏛️ صور فوتوغرافية حقيقية 4K ({CURATED_REAL_PHOTOS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("cardDesigner")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition ${
              activeTab === "cardDesigner"
                ? "bg-[#f8ca14] text-black shadow-md shadow-[#f8ca14]/20"
                : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
            }`}
          >
            <Palette size={15} />
            <span>🎨 مصمم بطاقة الغلاف الرسمي بالعنوان</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("aiPrompt")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition ${
              activeTab === "aiPrompt"
                ? "bg-[#f8ca14] text-black shadow-md shadow-[#f8ca14]/20"
                : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
            }`}
          >
            <Sparkles size={15} />
            <span>✨ توليد ذكي مخصص (AI Prompt)</span>
          </button>
        </div>

        {/* TAB 1: Real 4K Photography Gallery */}
        {activeTab === "gallery" && (
          <div className="space-y-4 pt-2">
            {/* Search and Category Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute right-3 top-3 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث في الصور (مثلاً: روبوت، إذاعة، تكريم، مسبح، مختبر)..."
                  className="pr-9 text-xs rounded-xl bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                      selectedCategory === cat.id
                        ? "bg-[#f8ca14] text-black border-[#f8ca14] font-black"
                        : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto pr-1">
              {filteredPhotos.map((photo, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedPhotoUrl(photo.url)}
                  className={`group relative aspect-video cursor-pointer overflow-hidden rounded-2xl border transition-all ${
                    selectedPhotoUrl === photo.url
                      ? "ring-2 ring-[#f8ca14] border-[#f8ca14] scale-[1.02]"
                      : "border-white/10 hover:border-white/30 hover:scale-[1.01]"
                  }`}
                >
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2.5 flex flex-col justify-end">
                    <span className="text-[9px] font-black text-[#f8ca14]">{photo.category}</span>
                    <span className="text-[11px] font-bold text-white line-clamp-1">{photo.title}</span>
                  </div>
                  {selectedPhotoUrl === photo.url && (
                    <div className="absolute top-2 left-2 grid h-6 w-6 place-items-center rounded-full bg-[#f8ca14] text-black shadow-md">
                      <Check size={14} className="stroke-[3]" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Apply Selected Photo Bar */}
            {selectedPhotoUrl && (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img src={selectedPhotoUrl} alt="" className="h-12 w-20 rounded-xl object-cover border border-white/20" />
                  <div>
                    <p className="text-xs font-black text-emerald-300">تم تحديد الصورة الفوتوغرافية بنجاح</p>
                    <p className="text-[11px] text-slate-400">جودة 4K احترافية معتمدة لمدارس العقيق</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleApply(selectedPhotoUrl)}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black px-5 py-2 text-xs transition shadow-lg shadow-emerald-500/20"
                >
                  <Check size={16} />
                  <span>اعتماد كغلاف رسمي الآن</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Official Branded Card Designer */}
        {activeTab === "cardDesigner" && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Controls */}
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-black text-slate-300 mb-1 block">عنوان المقال أو الحلقة على الغلاف</Label>
                  <Input
                    value={cardTitle}
                    onChange={(e) => setCardTitle(e.target.value)}
                    placeholder="اكتب العنوان الرئيسي للغلاف..."
                    className="text-xs rounded-xl bg-white/5 border-white/10 text-white font-bold"
                  />
                </div>

                <div>
                  <Label className="text-xs font-black text-slate-300 mb-1 block">وسام التصنيف</Label>
                  <Input
                    value={cardCategory}
                    onChange={(e) => setCardCategory(e.target.value)}
                    placeholder="مثال: روبوت وابتكار / إذاعة وبودكاست / تفوق..."
                    className="text-xs rounded-xl bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div>
                  <Label className="text-xs font-black text-slate-300 mb-1.5 block">نمط الخلفية الملكية</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {CARD_STYLES.map((style, idx) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setCardStyleIndex(idx)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition ${
                          cardStyleIndex === idx
                            ? "border-[#f8ca14] bg-[#f8ca14]/10 text-white font-black"
                            : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`h-4 w-4 rounded-full bg-gradient-to-tr ${style.bg} border border-white/20`} />
                          <span>{style.label}</span>
                        </div>
                        {cardStyleIndex === idx && <Check size={14} className="text-[#f8ca14]" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="space-y-3">
                <Label className="text-xs font-black text-slate-300 block">معاينة الغلاف الرسمي المباشر</Label>
                <div
                  id="aqeeq-branded-card"
                  className={`relative aspect-video w-full overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br ${activeCardStyle.bg} p-6 flex flex-col justify-between shadow-2xl`}
                >
                  {/* Backdrop subtle overlay */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(248,202,20,0.15),transparent_60%)] pointer-events-none" />

                  {/* Header of card */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f8ca14]/40 bg-[#f8ca14]/15 px-3 py-1 text-[11px] font-black text-[#f8ca14]">
                      <Sparkles size={11} /> {cardCategory}
                    </span>
                    <span className="text-[11px] font-black tracking-wider text-slate-400 uppercase">
                      ALAQEEQ STUDIO
                    </span>
                  </div>

                  {/* Body Title */}
                  <div className="relative z-10 space-y-2">
                    <h2 className="text-xl sm:text-2xl font-black leading-snug text-white drop-shadow-md">
                      {cardTitle || "عنوان المقال أو الحلقة"}
                    </h2>
                    <p className="text-xs font-bold text-slate-300">
                      صرح العقيق التعليمي · المدينة المنورة
                    </p>
                  </div>

                  {/* Footer of card */}
                  <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-3">
                    <span className="text-[10px] font-black text-[#f8ca14]">
                      مدارس العقيق الأهلية والدولية
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      1448H · 2026
                    </span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      // Generate image from curated themes or styled high-res matching background
                      const curatedMatch = CURATED_REAL_PHOTOS.find((p) => p.category === cardCategory) || CURATED_REAL_PHOTOS[0];
                      handleApply(curatedMatch.url);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#f8ca14] hover:bg-yellow-400 text-black font-black px-6 py-2.5 text-xs transition shadow-lg shadow-[#f8ca14]/20"
                  >
                    <Check size={16} />
                    <span>اعتماد بطاقة الغلاف الرسمي الآن</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AI Prompt Generator */}
        {activeTab === "aiPrompt" && (
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-xs font-black text-slate-300">وصف المشهد المطلوب *</Label>
              <Textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="اكتب وصف المشهد باللغة العربية (مثال: طلاب في مختبر الروبوت والذكاء الاصطناعي مع إضاءة سينمائية)..."
                className="text-xs mt-1.5 rounded-xl bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-300">أبعاد الصورة:</span>
                {(["16:9", "1:1", "4:3"] as const).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black border transition ${
                      aspectRatio === ratio
                        ? "bg-[#f8ca14] text-black border-[#f8ca14]"
                        : "border-white/10 bg-white/5 text-slate-300"
                    }`}
                  >
                    {ratio === "16:9" ? "16:9 (عريض)" : ratio === "1:1" ? "1:1 (مربع)" : "4:3 (كلاسيكي)"}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAiGenerate}
                disabled={generateMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-[#f8ca14] hover:opacity-90 text-black font-black px-5 py-2 text-xs transition shadow-lg shadow-amber-500/20"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>جاري التوليد...</span>
                  </>
                ) : (
                  <>
                    <Wand2 size={14} />
                    <span>توليد مشهد ذكي</span>
                  </>
                )}
              </button>
            </div>

            {generatedUrl && (
              <div className="rounded-2xl border border-white/10 bg-black/60 p-3 space-y-3">
                <div className="aspect-video w-full overflow-hidden rounded-xl bg-black border border-white/10">
                  <img src={generatedUrl} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleApply(generatedUrl)}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black px-5 py-2 text-xs transition"
                  >
                    <Check size={16} />
                    <span>اعتماد هذه الصورة</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
