import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  Loader2,
  Check,
  Wand2,
  Palette,
  Camera,
  Search,
  Sliders,
  ExternalLink,
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

// 🏛️ موسوعة الصور الفوتوغرافية الحقيقية فائقة الجودة 4K لمدارس العقيق
const MASTER_PHOTO_CATALOG = [
  // 🤖 1. الروبوت والذكاء الاصطناعي وهندسة المستقبل
  {
    title: "مختبر الروبوتات والذكاء الاصطناعي المتقدم",
    category: "روبوت وابتكار",
    url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "برمجة اللوحات الإلكترونية والمعالجات",
    category: "روبوت وابتكار",
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "هندسة الأردوينو ومستشعرات الروبوت",
    category: "روبوت وابتكار",
    url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "شاشات البرمجة والذكاء الاصطناعي الحديث",
    category: "روبوت وابتكار",
    url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "ذراع روبوتي تفاعلي ومختبر الابتكار",
    category: "روبوت وابتكار",
    url: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "أكاديمية البرمجة وتطوير التطبيقات",
    category: "روبوت وابتكار",
    url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=85",
  },

  // 🎙️ 2. الإذاعة والبودكاست والاستوديوهات الصوتية
  {
    title: "ميكروفون إذاعي فخم واستوديو احترافي",
    category: "إذاعة وبودكاست",
    url: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "استوديو صوتي عازل مع سماعات ومكسر",
    category: "إذاعة وبودكاست",
    url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "طاولة حوار وميكروفونات متعددة للضيوف",
    category: "إذاعة وبودكاست",
    url: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "ميكروفون كلاسيكي ذهبي بإضاءة دافئة",
    category: "إذاعة وبودكاست",
    url: "https://images.unsplash.com/photo-1520523839898-50712825e3a7?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "هندسة الصوت والتسجيل الإذاعي الصباحي",
    category: "إذاعة وبودكاست",
    url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=85",
  },

  // 🏆 3. التفوق والجوائز والتكريم
  {
    title: "كأس التفوق والتميز الذهبي",
    category: "تفوق وتكريم",
    url: "https://images.unsplash.com/photo-1569517282132-25d22f4573e6?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "ميداليات التكريم والإنجازات المدرسية",
    category: "تفوق وتكريم",
    url: "https://images.unsplash.com/photo-1578269174936-2709b6aeb913?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "قبعة التخرج والشهادة الأكاديمية",
    category: "تفوق وتكريم",
    url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "احتفال الإنجاز والتخرج الماسي الفخم",
    category: "تفوق وتكريم",
    url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "منصة التتويج والنجاح الأكاديمي",
    category: "تفوق وتكريم",
    url: "https://images.unsplash.com/photo-1532649538693-f3a2ec1bf8bd?auto=format&fit=crop&w=1200&q=85",
  },

  // 🔬 4. العلوم والمختبرات والأبحاث
  {
    title: "مختبر علمي متطور ومحاليل ملونة",
    category: "علوم ومختبرات",
    url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "مجهر دقيق وأبحاث بيولوجية متقدمة",
    category: "علوم ومختبرات",
    url: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "أنابيب اختبار وتجارب كيميائية مدرسية",
    category: "علوم ومختبرات",
    url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "فيزياء وموجات ضوئية وتجارب عملية",
    category: "علوم ومختبرات",
    url: "https://images.unsplash.com/photo-1607988795691-3d0147b43231?auto=format&fit=crop&w=1200&q=85",
  },

  // 📚 5. المكتبة والقراءة والثقافة
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
    title: "رفوف الكتب والثقافة المدرسية العريقة",
    category: "قراءة ومكتبة",
    url: "https://images.unsplash.com/photo-1507842229451-9f0147b19811?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "جلسة قراءة وبحث هادئة لطلاب متميزين",
    category: "قراءة ومكتبة",
    url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=85",
  },

  // 🏊‍♂️ 6. الرياضة والأكاديمية الرياضية
  {
    title: "مسبح مدرسي أولمبي ومسارات السباحة",
    category: "رياضة وأكاديمية",
    url: "https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "ملعب كرة قدم عشبي حديث ومضاء",
    category: "رياضة وأكاديمية",
    url: "https://images.unsplash.com/photo-1529900245534-47fbf76681e0?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "فنون قتالية تايكوندو وتدريبات لياقة",
    category: "رياضة وأكاديمية",
    url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "صالة رياضية مجهزة وأجهزة لياقة بدنية",
    category: "رياضة وأكاديمية",
    url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=85",
  },

  // 🇸🇦 7. المناسبات الوطنية والهوية السعودية
  {
    title: "العلم السعودي وهيبة الوطن",
    category: "مناسبات وهوية",
    url: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "أصالة المدينة المنورة وشروق ذهبي مهيب",
    category: "مناسبات وهوية",
    url: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "تراث سعودي عريق وفخر التأسيس",
    category: "مناسبات وهوية",
    url: "https://images.unsplash.com/photo-1512632570417-a60037a28e75?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "سماء طيبة الطيبة وأجواء روحانية راقية",
    category: "مناسبات وهوية",
    url: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=85",
  },

  // 🏫 8. الفصول الذكية والبيئة التعليمية
  {
    title: "فصل دراسي حديث وشاشات ذكية متطورة",
    category: "بيئة وفصول",
    url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "نقاش جماعي وتفكير نقدي في بيئة ملهمة",
    category: "بيئة وفصول",
    url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "مدرج وقاعة محاضرات كبرى للمؤتمرات",
    category: "بيئة وفصول",
    url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=85",
  },

  // 🚀 9. الرحلات الاستكشافية والمغامرات
  {
    title: "جبال وصخور العلا الأثرية والتاريخية",
    category: "رحلات واستكشاف",
    url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "شاطئ البحر الأحمر ومنتجع الدلافين بينبع",
    category: "رحلات واستكشاف",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85",
  },
];

const CARD_STYLES = [
  { id: "gold-dark", label: "أسود ملكي مع لمسات ذهبية", bg: "from-[#141204] via-[#0a0a0a] to-[#040404]", accent: "#f8ca14" },
  { id: "royal-blue", label: "أزرق كحلي رسمي مع ذهبي", bg: "from-[#082a4d] via-[#05182c] to-[#020b14]", accent: "#f8ca14" },
  { id: "emerald", label: "أخضر زمردي وهوية وطنية", bg: "from-[#06331e] via-[#031c10] to-[#010c07]", accent: "#34d399" },
  { id: "purple-studio", label: "بنفسجي استوديو وبودكاست", bg: "from-[#2d124d] via-[#170829] to-[#0b0314]", accent: "#c084fc" },
  { id: "crimson-ruby", label: "عقيقي قرمزي فاخر", bg: "from-[#420d18] via-[#21050b] to-[#0d0104]", accent: "#fb7185" },
];

const AI_ENGINES = [
  { id: "flux-realism", label: "🌟 Flux Realism Pro (واقعية فوتوغرافية 8K فائقة النقاء)", desc: "الأفضل والأدق للصور الفوتوغرافية الواقعية بدون مظهر كرتوني" },
  { id: "flux-pro", label: "💎 Flux Cinematic Ultra (سينمائي فاخر بإضاءة ذهبية)", desc: "إضاءة درامية سينمائية عالية التباين" },
  { id: "flux", label: "🎨 Flux Studio Standard (نمط الاستوديو المعياري)", desc: "توازن بين الألوان والأشكال" },
  { id: "turbo", label: "⚡ Turbo Instant (توليد فوري سريع)", desc: "سرعة فائقة في التوليد" },
] as const;

const STYLE_PRESETS = [
  { id: "photorealistic", label: "📸 تصوير فوتوغرافي واقعي (Hasselblad Camera)" },
  { id: "cinematic", label: "🎬 سينمائي بإضاءة ذهبية دافئة (Golden Hour)" },
  { id: "editorial", label: "📰 غلاف مجلة صحفية عالمية (Editorial Style)" },
  { id: "studio-pro", label: "🎙️ استوديو احترافي بإضاءة موجهة (Studio Pro)" },
] as const;

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

  // AI Prompt State
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "1:1" | "4:3">("16:9");
  const [selectedEngine, setSelectedEngine] = useState<(typeof AI_ENGINES)[number]["id"]>("flux-realism");
  const [selectedStyle, setSelectedStyle] = useState<(typeof STYLE_PRESETS)[number]["id"]>("photorealistic");
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (open && defaultPrompt) {
      setPrompt(defaultPrompt);
      setCardTitle(defaultPrompt.replace(/^غلاف صحفي لمقال بعنوان:\s*/, "").replace(/^غلاف إذاعي وبودكاست لحلقة بعنوان:\s*/, ""));
    }
  }, [open, defaultPrompt]);

  const categories = [
    { id: "all", label: `✨ كل الصور (${MASTER_PHOTO_CATALOG.length})` },
    { id: "روبوت وابتكار", label: "🤖 روبوت وتكنولوجيا" },
    { id: "إذاعة وبودكاست", label: "🎙️ إذاعة وبودكاست" },
    { id: "تفوق وتكريم", label: "🏆 تفوق وتكريم" },
    { id: "علوم ومختبرات", label: "🔬 علوم ومختبرات" },
    { id: "قراءة ومكتبة", label: "📚 قراءة ومكتبة" },
    { id: "رياضة وأكاديمية", label: "⚽ رياضة وأكاديمية" },
    { id: "مناسبات وهوية", label: "🇸🇦 مناسبات وهوية" },
    { id: "بيئة وفصول", label: "🏫 بيئة وفصول" },
    { id: "رحلات واستكشاف", label: "🚀 رحلات واستكشاف" },
  ];

  const filteredPhotos = MASTER_PHOTO_CATALOG.filter((p) => {
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
      toast.success("تم توليد المشهد البصري فائق الواقعية بنجاح! ✨");
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
      model: selectedEngine,
      stylePreset: selectedStyle,
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
        className={`max-w-4xl max-h-[92vh] overflow-y-auto font-[Tajawal,sans-serif] ${
          dark ? "bg-[#0c0c0c] border-white/10 text-white" : "bg-white border-black/10 text-slate-900"
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
                <div className="flex items-center gap-2">
                  <span>استوديو الأغلفة البصرية الفاخرة</span>
                  <span className="rounded-full bg-[#f8ca14]/20 border border-[#f8ca14]/40 px-2 py-0.5 text-[10px] font-black text-[#f8ca14]">
                    PRO 4K
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-normal mt-0.5">
                  مكتبة فوتوغرافية حقيقية متكاملة لمدارس العقيق + محرك توليد فائق الواقعية (Flux Realism 8K)
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
            <span>🏛️ مكتبة الصور الفوتوغرافية الحقيقية 4K ({MASTER_PHOTO_CATALOG.length})</span>
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
            <span>✨ محرك التوليد الذكي فائق الواقعية (Flux Realism 8K)</span>
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
            <span>🎨 مصمم بطاقة الغلاف الملكي بالعنوان</span>
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
                  placeholder="ابحث بالكلمات (مثال: روبوت، إذاعة، تكريم، مسبح، مختبر، العلا، قراءة، كيمياء)..."
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-2.5 flex flex-col justify-end">
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
                    <p className="text-xs font-black text-emerald-300">تم تحديد الصورة الفوتوغرافية الحقيقية بنجاح</p>
                    <p className="text-[11px] text-slate-400">جودة 4K فائقة الوضوح معتمدة لمدارس العقيق</p>
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

        {/* TAB 2: AI High-End Realistic Generation Engine */}
        {activeTab === "aiPrompt" && (
          <div className="space-y-4 pt-2">
            {/* Topic Badge */}
            {defaultPrompt && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <Sparkles size={14} className="shrink-0 text-[#f8ca14]" />
                  <span className="line-clamp-1">موضوع المحتوى المرتبط: {defaultPrompt}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPrompt(defaultPrompt);
                    handleAiGenerate();
                  }}
                  disabled={generateMutation.isPending}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-[#f8ca14] hover:bg-yellow-400 text-black font-black px-3 py-1 text-[11px] transition"
                >
                  <span>توليد فوري فائق الواقعية</span>
                </button>
              </div>
            )}

            {/* Prompt Input */}
            <div>
              <Label className="text-xs font-black text-slate-300">وصف المشهد المراد تصويره وتوليده *</Label>
              <Textarea
                rows={2}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="اكتب وصفاً للمشهد (مثال: طلاب سعوديون في مختبر الروبوت والذكاء الاصطناعي مع إضاءة استوديو دافئة)..."
                className="text-xs mt-1.5 rounded-xl bg-white/5 border-white/10 text-white"
              />
            </div>

            {/* Engine & Style Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-black text-slate-300 mb-1.5 block">محرك التوليد البصري</Label>
                <select
                  value={selectedEngine}
                  onChange={(e) => setSelectedEngine(e.target.value as any)}
                  className="w-full text-xs rounded-xl border border-white/10 bg-[#161616] p-2.5 text-white font-bold outline-none"
                >
                  {AI_ENGINES.map((eng) => (
                    <option key={eng.id} value={eng.id}>
                      {eng.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs font-black text-slate-300 mb-1.5 block">النمط البصري الفني</Label>
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value as any)}
                  className="w-full text-xs rounded-xl border border-white/10 bg-[#161616] p-2.5 text-white font-bold outline-none"
                >
                  {STYLE_PRESETS.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Aspect Ratio and Generate Button */}
            <div className="flex items-center justify-between gap-4 pt-1">
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
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-[#f8ca14] hover:opacity-90 text-black font-black px-6 py-2.5 text-xs transition shadow-lg shadow-amber-500/20"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>جاري التوليد بأعلى دقة واقعية...</span>
                  </>
                ) : (
                  <>
                    <Wand2 size={14} />
                    <span>{generatedUrl ? "توليد صورة بديلة" : "توليد المشهد الآن"}</span>
                  </>
                )}
              </button>
            </div>

            {/* Generated Image Result */}
            {generatedUrl && (
              <div className="rounded-2xl border border-white/10 bg-black/60 p-3 space-y-3">
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black border border-white/10">
                  <img src={generatedUrl} alt="Generated Scene" className="h-full w-full object-cover" />
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleAiGenerate}
                    disabled={generateMutation.isPending}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    إعادة المحاولة بزاوية أخرى
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApply(generatedUrl)}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black px-6 py-2.5 text-xs transition shadow-lg shadow-emerald-500/20"
                  >
                    <Check size={16} />
                    <span>اعتماد هذه الصورة كغلاف رسمي</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Official Branded Card Designer */}
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
                      const curatedMatch = MASTER_PHOTO_CATALOG.find((p) => p.category.includes(cardCategory)) || MASTER_PHOTO_CATALOG[0];
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
      </DialogContent>
    </Dialog>
  );
}
