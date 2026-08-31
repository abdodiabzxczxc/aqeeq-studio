import { useState, useEffect } from "react";
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
  Globe,
  ChevronLeft,
  ChevronRight,
  RectangleHorizontal,
  RectangleVertical,
  Square,
  LayoutGrid,
  X,
  Layers,
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

type AspectRatioChoice = "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
type OrientationFilter = "all" | "wide" | "tall" | "square";

// 🏛️ كتالوج الأغلفة السريعة 4K المعتمدة لمدارس العقيق
const MASTER_PHOTO_CATALOG = [
  // 🤖 روبوت وابتكار
  {
    title: "مختبر الروبوتات والذكاء الاصطناعي المتقدم",
    category: "روبوت وابتكار",
    orientation: "wide" as const,
    url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "برمجة اللوحات الإلكترونية والمعالجات",
    category: "روبوت وابتكار",
    orientation: "wide" as const,
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "هندسة الأردوينو ومستشعرات الروبوت",
    category: "روبوت وابتكار",
    orientation: "wide" as const,
    url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "شاشات البرمجة والذكاء الاصطناعي الحديث",
    category: "روبوت وابتكار",
    orientation: "tall" as const,
    url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=85",
  },
  {
    title: "ذراع روبوتي تفاعلي ومختبر الابتكار",
    category: "روبوت وابتكار",
    orientation: "square" as const,
    url: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&w=1000&q=85",
  },

  // 🎙️ إذاعة وبودكاست
  {
    title: "ميكروفون إذاعي فخم واستوديو احترافي",
    category: "إذاعة وبودكاست",
    orientation: "wide" as const,
    url: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "استوديو صوتي عازل مع سماعات ومكسر",
    category: "إذاعة وبودكاست",
    orientation: "wide" as const,
    url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "طاولة حوار وميكروفونات متعددة للضيوف",
    category: "إذاعة وبودكاست",
    orientation: "wide" as const,
    url: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "ميكروفون كلاسيكي ذهبي طولي",
    category: "إذاعة وبودكاست",
    orientation: "tall" as const,
    url: "https://images.unsplash.com/photo-1520523839898-50712825e3a7?auto=format&fit=crop&w=800&q=85",
  },
  {
    title: "سماعات استوديو مربعة للموسيقى والصوت",
    category: "إذاعة وبودكاست",
    orientation: "square" as const,
    url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1000&q=85",
  },

  // 🏆 تفوق وتكريم
  {
    title: "كأس التفوق والتميز الذهبي",
    category: "تفوق وتكريم",
    orientation: "tall" as const,
    url: "https://images.unsplash.com/photo-1569517282132-25d22f4573e6?auto=format&fit=crop&w=800&q=85",
  },
  {
    title: "ميداليات التكريم والإنجازات المدرسية",
    category: "تفوق وتكريم",
    orientation: "square" as const,
    url: "https://images.unsplash.com/photo-1578269174936-2709b6aeb913?auto=format&fit=crop&w=1000&q=85",
  },
  {
    title: "قبعة التخرج والشهادة الأكاديمية",
    category: "تفوق وتكريم",
    orientation: "wide" as const,
    url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "احتفال الإنجاز والتخرج الماسي الفخم",
    category: "تفوق وتكريم",
    orientation: "wide" as const,
    url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=85",
  },

  // 🔬 علوم ومختبرات
  {
    title: "مختبر علمي متطور ومحاليل ملونة",
    category: "علوم ومختبرات",
    orientation: "wide" as const,
    url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "مجهر دقيق وأبحاث بيولوجية متقدمة",
    category: "علوم ومختبرات",
    orientation: "tall" as const,
    url: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=85",
  },
  {
    title: "أنابيب اختبار وتجارب كيميائية مدرسية",
    category: "علوم ومختبرات",
    orientation: "square" as const,
    url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=85",
  },

  // 📚 قراءة ومكتبة
  {
    title: "مكتبة كبرى وصرح معرفي فاخر",
    category: "قراءة ومكتبة",
    orientation: "wide" as const,
    url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "كتاب مفتوح في إضاءة ذهبية ملهمة",
    category: "قراءة ومكتبة",
    orientation: "tall" as const,
    url: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=85",
  },
  {
    title: "رفوف الكتب والثقافة المدرسية العريقة",
    category: "قراءة ومكتبة",
    orientation: "wide" as const,
    url: "https://images.unsplash.com/photo-1507842229451-9f0147b19811?auto=format&fit=crop&w=1200&q=85",
  },

  // 🏊‍♂️ رياضة وأكاديمية
  {
    title: "مسبح مدرسي أولمبي ومسارات السباحة",
    category: "رياضة وأكاديمية",
    orientation: "wide" as const,
    url: "https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "فنون قتالية تايكوندو وتدريبات لياقة",
    category: "رياضة وأكاديمية",
    orientation: "tall" as const,
    url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=85",
  },
  {
    title: "ملعب كرة قدم عشبي حديث ومضاء",
    category: "رياضة وأكاديمية",
    orientation: "wide" as const,
    url: "https://images.unsplash.com/photo-1529900245534-47fbf76681e0?auto=format&fit=crop&w=1200&q=85",
  },

  // 🇸🇦 مناسبات وهوية
  {
    title: "العلم السعودي وهيبة الوطن",
    category: "مناسبات وهوية",
    orientation: "tall" as const,
    url: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=85",
  },
  {
    title: "أصالة المدينة المنورة وشروق ذهبي مهيب",
    category: "مناسبات وهوية",
    orientation: "wide" as const,
    url: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "جبال وصخور العلا التاريخية",
    category: "رحلات واستكشاف",
    orientation: "wide" as const,
    url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=85",
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
  { id: "flux-realism", label: "🌟 Flux Realism Pro (واقعية فوتوغرافية 8K)", desc: "الأفضل والأدق للصور الفوتوغرافية الواقعية بدون مظهر كرتوني" },
  { id: "flux-pro", label: "💎 Flux Cinematic Ultra (سينمائي فاخر)", desc: "إضاءة درامية سينمائية عالية التباين" },
  { id: "flux", label: "🎨 Flux Studio Standard (معياري)", desc: "توازن بين الألوان والأشكال" },
  { id: "turbo", label: "⚡ Turbo Instant (توليد فوري)", desc: "سرعة فائقة في التوليد" },
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
  const [activeTab, setActiveTab] = useState<"globalSearch" | "aiPrompt" | "gallery" | "cardDesigner">("globalSearch");

  // Live Global Search State
  const [globalQuery, setGlobalQuery] = useState(defaultPrompt || (type === "podcast" ? "إذاعة وبودكاست ميكروفون" : "روبوت وذكاء اصطناعي"));
  const [globalPage, setGlobalPage] = useState(1);
  const [activeSearchTerm, setActiveSearchTerm] = useState(defaultPrompt || (type === "podcast" ? "إذاعة وبودكاست ميكروفون" : "روبوت وذكاء اصطناعي"));
  const [searchOrientation, setSearchOrientation] = useState<OrientationFilter>("all");

  // Quick Catalog State
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [catalogOrientation, setCatalogOrientation] = useState<OrientationFilter>("all");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);

  // Card Designer state
  const [cardTitle, setCardTitle] = useState(defaultPrompt || "عنوان المقال أو الحلقة");
  const [cardCategory, setCardCategory] = useState(type === "podcast" ? "إذاعة وبودكاست" : "مقال تربوي");
  const [cardStyleIndex, setCardStyleIndex] = useState(0);

  // AI Prompt State
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioChoice>("16:9");
  const [selectedEngine, setSelectedEngine] = useState<(typeof AI_ENGINES)[number]["id"]>("flux-realism");
  const [selectedStyle, setSelectedStyle] = useState<(typeof STYLE_PRESETS)[number]["id"]>("photorealistic");
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (open && defaultPrompt) {
      setPrompt(defaultPrompt);
      setGlobalQuery(defaultPrompt);
      setActiveSearchTerm(defaultPrompt);
      setCardTitle(defaultPrompt.replace(/^غلاف صحفي لمقال بعنوان:\s*/, "").replace(/^غلاف إذاعي وبودكاست لحلقة بعنوان:\s*/, ""));
    }
  }, [open, defaultPrompt]);

  // Live Real Global Photo Search Query
  const {
    data: globalSearchData,
    isLoading: isGlobalSearching,
    isFetching: isGlobalFetching,
  } = trpc.aiVisuals.searchRealPhotos.useQuery(
    {
      query: activeSearchTerm || (type === "podcast" ? "podcast studio microphone" : "education school"),
      page: globalPage,
      pageSize: 32,
      orientation: searchOrientation,
    },
    {
      enabled: Boolean(open),
    }
  );

  const categories = [
    { id: "all", label: `✨ كل الأقسام (${MASTER_PHOTO_CATALOG.length})` },
    { id: "روبوت وابتكار", label: "🤖 روبوت وتكنولوجيا" },
    { id: "إذاعة وبودكاست", label: "🎙️ إذاعة وبودكاست" },
    { id: "تفوق وتكريم", label: "🏆 تفوق وتكريم" },
    { id: "علوم ومختبرات", label: "🔬 علوم ومختبرات" },
    { id: "قراءة ومكتبة", label: "📚 قراءة ومكتبة" },
    { id: "رياضة وأكاديمية", label: "⚽ رياضة وأكاديمية" },
    { id: "مناسبات وهوية", label: "🇸🇦 مناسبات وهوية" },
  ];

  const filteredCatalogPhotos = MASTER_PHOTO_CATALOG.filter((p) => {
    if (selectedCategory !== "all" && p.category !== selectedCategory) return false;
    if (catalogOrientation !== "all" && p.orientation !== catalogOrientation) return false;
    if (catalogSearch.trim()) {
      const q = catalogSearch.toLowerCase();
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

  const handleRunGlobalSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!globalQuery.trim()) {
      toast.error("يرجى كتابة كلمة البحث");
      return;
    }
    setGlobalPage(1);
    setActiveSearchTerm(globalQuery.trim());
  };

  const quickSearchPills = [
    "🤖 روبوت وذكاء اصطناعي",
    "🎙️ استوديو بودكاست وميكروفون",
    "🏆 كؤوس وتكريم المتفوقين",
    "🎓 حفل تخرج وقبعات",
    "🔬 مختبر كيمياء ومجاهر",
    "📚 مكتبة كبرى وقراءة",
    "🏊‍♂️ مسبح أولمبي وسباحة",
    "🥋 تايكوندو وفنون قتالية",
    "⚽ ملعب كرة قدم معشب",
    "🇸🇦 العلم السعودي وتراث",
    "🚀 جبال العلا التاريخية",
  ];

  const activeCardStyle = CARD_STYLES[cardStyleIndex];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in-0 duration-200">
      <div
        className="relative w-full max-w-[1600px] h-[92vh] max-h-[92vh] rounded-3xl border border-white/20 bg-[#0d0d0d] text-white shadow-2xl flex flex-col overflow-hidden font-[Tajawal,sans-serif]"
        dir="rtl"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/10 bg-black/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-tr from-[#f8ca14] to-[#08467d] text-black shadow-lg">
              <Camera size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm sm:text-base">استوديو الأغلفة والصور البصرية لمدارس العقيق</span>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-black text-emerald-400">
                  FULL STUDIO 4K
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal">
                واجهة متكاملة عريضة ومريحة: بحث في 700 مليون صورة + توليد واقعي 8K + تحكم كامل في الأبعاد بدون تمرير جانبي
              </p>
            </div>
          </div>

          {/* Tab Navigation in Top Bar */}
          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab("globalSearch")}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition ${
                activeTab === "globalSearch"
                  ? "bg-[#f8ca14] text-black shadow-md shadow-[#f8ca14]/20"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Globe size={15} />
              <span>🌐 بحث مباشر (700M+ صورة)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("aiPrompt")}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition ${
                activeTab === "aiPrompt"
                  ? "bg-[#f8ca14] text-black shadow-md shadow-[#f8ca14]/20"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Sparkles size={15} />
              <span>✨ توليد واقعي (Flux 8K)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("gallery")}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition ${
                activeTab === "gallery"
                  ? "bg-[#f8ca14] text-black shadow-md shadow-[#f8ca14]/20"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Layers size={15} />
              <span>🏛️ الكتالوج السريع ({MASTER_PHOTO_CATALOG.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("cardDesigner")}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition ${
                activeTab === "cardDesigner"
                  ? "bg-[#f8ca14] text-black shadow-md shadow-[#f8ca14]/20"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Palette size={15} />
              <span>🎨 مصمم بطاقة الغلاف</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="mr-2 grid h-8 w-8 place-items-center rounded-xl bg-white/10 hover:bg-rose-500 hover:text-white text-slate-400 transition"
              title="إغلاق الاستوديو"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Main Studio Body (Two Columns: Right Sidebar + Left Canvas) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* ================= RIGHT CONTROL SIDEBAR (340px Fixed) ================= */}
          <div className="w-full md:w-[340px] lg:w-[360px] shrink-0 border-l border-white/10 bg-black/40 p-4 overflow-y-auto space-y-4">
            {/* Global Search Sidebar Controls */}
            {activeTab === "globalSearch" && (
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-black text-slate-300 mb-1.5 block">كلمة أو موضوع البحث</Label>
                  <form onSubmit={handleRunGlobalSearch} className="space-y-2">
                    <Input
                      value={globalQuery}
                      onChange={(e) => setGlobalQuery(e.target.value)}
                      placeholder="اكتب أي موضوع بالعربية أو الإنجليزية..."
                      className="text-xs h-10 rounded-xl bg-white/5 border-white/10 text-white font-bold"
                    />
                    <button
                      type="submit"
                      disabled={isGlobalSearching || isGlobalFetching}
                      className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-[#f8ca14] hover:bg-yellow-400 text-black font-black text-xs transition shadow-md shadow-[#f8ca14]/20"
                    >
                      {isGlobalSearching || isGlobalFetching ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Search size={15} />
                      )}
                      <span>بحث في ملايين الصور</span>
                    </button>
                  </form>
                </div>

                {/* Aspect Ratio Filter (Clean 2x2 Grid) */}
                <div>
                  <Label className="text-xs font-black text-slate-300 mb-2 block">📐 شكل وأبعاد الصور</Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => { setSearchOrientation("all"); setGlobalPage(1); }}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-black transition border ${
                        searchOrientation === "all"
                          ? "bg-[#f8ca14] text-black border-[#f8ca14]"
                          : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      <LayoutGrid size={14} />
                      <span>كل الأشكال</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setSearchOrientation("wide"); setGlobalPage(1); }}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-black transition border ${
                        searchOrientation === "wide"
                          ? "bg-[#f8ca14] text-black border-[#f8ca14]"
                          : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      <RectangleHorizontal size={14} />
                      <span>بالعرض (16:9)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setSearchOrientation("tall"); setGlobalPage(1); }}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-black transition border ${
                        searchOrientation === "tall"
                          ? "bg-[#f8ca14] text-black border-[#f8ca14]"
                          : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      <RectangleVertical size={14} />
                      <span>بالطول (9:16)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setSearchOrientation("square"); setGlobalPage(1); }}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-black transition border ${
                        searchOrientation === "square"
                          ? "bg-[#f8ca14] text-black border-[#f8ca14]"
                          : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      <Square size={14} />
                      <span>مربع (1:1)</span>
                    </button>
                  </div>
                </div>

                {/* Quick Topics */}
                <div>
                  <Label className="text-xs font-black text-slate-300 mb-2 block">⚡ مواضيع وأقسام مقترحة</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {quickSearchPills.map((pill, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const clean = pill.replace(/^[^\s]+\s*/, "");
                          setGlobalQuery(clean);
                          setActiveSearchTerm(clean);
                          setGlobalPage(1);
                        }}
                        className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition"
                      >
                        {pill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* AI Prompt Sidebar Controls */}
            {activeTab === "aiPrompt" && (
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-black text-slate-300 mb-1.5 block">وصف المشهد المراد توليده *</Label>
                  <Textarea
                    rows={3}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="اكتب وصفاً باللغة العربية (مثلاً: طلاب سعوديون في مختبر الروبوت والذكاء الاصطناعي مع إضاءة سينمائية)..."
                    className="text-xs rounded-xl bg-white/5 border-white/10 text-white"
                  />
                </div>

                {/* Aspect Ratio Selector (2x2 Grid) */}
                <div>
                  <Label className="text-xs font-black text-slate-300 mb-2 block">📐 أبعاد وشكل الصورة</Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAspectRatio("16:9")}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold transition border ${
                        aspectRatio === "16:9"
                          ? "bg-[#f8ca14] text-black border-[#f8ca14] font-black"
                          : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      <RectangleHorizontal size={16} />
                      <span>بالعرض (16:9)</span>
                      <span className="text-[9px] opacity-75">للمقالات والمواقع</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAspectRatio("9:16")}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold transition border ${
                        aspectRatio === "9:16"
                          ? "bg-[#f8ca14] text-black border-[#f8ca14] font-black"
                          : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      <RectangleVertical size={16} />
                      <span>بالطول (9:16)</span>
                      <span className="text-[9px] opacity-75">للهواتف والستوري</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAspectRatio("1:1")}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold transition border ${
                        aspectRatio === "1:1"
                          ? "bg-[#f8ca14] text-black border-[#f8ca14] font-black"
                          : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      <Square size={16} />
                      <span>مربع (1:1)</span>
                      <span className="text-[9px] opacity-75">للبودكاست وإنستغرام</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAspectRatio("3:4")}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold transition border ${
                        aspectRatio === "3:4"
                          ? "bg-[#f8ca14] text-black border-[#f8ca14] font-black"
                          : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      <RectangleVertical size={16} />
                      <span>طولي قياسي (3:4)</span>
                      <span className="text-[9px] opacity-75">للبوسترات والمجلات</span>
                    </button>
                  </div>
                </div>

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

                <button
                  type="button"
                  onClick={handleAiGenerate}
                  disabled={generateMutation.isPending}
                  className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-gradient-to-r from-amber-500 to-[#f8ca14] hover:opacity-90 text-black font-black text-xs transition shadow-lg shadow-amber-500/20"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>جاري التوليد بأعلى دقة واقعية...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 size={16} />
                      <span>{generatedUrl ? "توليد صورة بديلة" : "توليد المشهد الآن"}</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Quick Catalog Sidebar Controls */}
            {activeTab === "gallery" && (
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-black text-slate-300 mb-1.5 block">بحث سريع في الكتالوج</Label>
                  <Input
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    placeholder="ابحث في الكتالوج..."
                    className="text-xs h-10 rounded-xl bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div>
                  <Label className="text-xs font-black text-slate-300 mb-2 block">📐 فلترة الأبعاد</Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCatalogOrientation("all")}
                      className={`p-2 rounded-xl text-xs font-bold border transition ${
                        catalogOrientation === "all" ? "bg-[#f8ca14] text-black border-[#f8ca14] font-black" : "border-white/10 text-slate-300"
                      }`}
                    >
                      كل الأبعاد
                    </button>
                    <button
                      type="button"
                      onClick={() => setCatalogOrientation("wide")}
                      className={`p-2 rounded-xl text-xs font-bold border transition ${
                        catalogOrientation === "wide" ? "bg-[#f8ca14] text-black border-[#f8ca14] font-black" : "border-white/10 text-slate-300"
                      }`}
                    >
                      بالعرض
                    </button>
                    <button
                      type="button"
                      onClick={() => setCatalogOrientation("tall")}
                      className={`p-2 rounded-xl text-xs font-bold border transition ${
                        catalogOrientation === "tall" ? "bg-[#f8ca14] text-black border-[#f8ca14] font-black" : "border-white/10 text-slate-300"
                      }`}
                    >
                      بالطول
                    </button>
                    <button
                      type="button"
                      onClick={() => setCatalogOrientation("square")}
                      className={`p-2 rounded-xl text-xs font-bold border transition ${
                        catalogOrientation === "square" ? "bg-[#f8ca14] text-black border-[#f8ca14] font-black" : "border-white/10 text-slate-300"
                      }`}
                    >
                      مربع
                    </button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-black text-slate-300 mb-2 block">الأقسام المعتمدة</Label>
                  <div className="space-y-1">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition border ${
                          selectedCategory === cat.id
                            ? "bg-[#f8ca14] text-black border-[#f8ca14] font-black"
                            : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Card Designer Sidebar Controls */}
            {activeTab === "cardDesigner" && (
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-black text-slate-300 mb-1 block">عنوان الغلاف الرئيسي</Label>
                  <Input
                    value={cardTitle}
                    onChange={(e) => setCardTitle(e.target.value)}
                    placeholder="اكتب العنوان الرئيسي..."
                    className="text-xs rounded-xl bg-white/5 border-white/10 text-white font-bold"
                  />
                </div>

                <div>
                  <Label className="text-xs font-black text-slate-300 mb-1 block">وسام التصنيف</Label>
                  <Input
                    value={cardCategory}
                    onChange={(e) => setCardCategory(e.target.value)}
                    placeholder="مثال: روبوت وابتكار / إذاعة وبودكاست..."
                    className="text-xs rounded-xl bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div>
                  <Label className="text-xs font-black text-slate-300 mb-1.5 block">نمط الخلفية الملكية</Label>
                  <div className="space-y-1.5">
                    {CARD_STYLES.map((style, idx) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setCardStyleIndex(idx)}
                        className={`w-full flex items-center justify-between p-2 rounded-xl border text-xs font-bold transition ${
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
            )}
          </div>

          {/* ================= LEFT MAIN CANVAS (Spacious Responsive Area) ================= */}
          <div className="flex-1 flex flex-col overflow-hidden bg-black/20 p-5">
            {/* Global Search Canvas Content */}
            {activeTab === "globalSearch" && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300">
                      نتائج البحث المباشر لمصطلح: <strong className="text-[#f8ca14]">"{activeSearchTerm}"</strong>
                    </span>
                    <span className="text-[11px] text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                      {searchOrientation === "tall" ? "بالطول (9:16)" : searchOrientation === "wide" ? "بالعرض (16:9)" : searchOrientation === "square" ? "مربع (1:1)" : "كل الأشكال"}
                    </span>
                  </div>

                  {/* Pagination in header */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setGlobalPage((p) => Math.max(1, p - 1))}
                      disabled={globalPage <= 1}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-xl border border-white/10 bg-white/5 disabled:opacity-30 text-xs font-bold hover:bg-white/10"
                    >
                      <ChevronRight size={14} />
                      <span>السابق</span>
                    </button>
                    <span className="text-xs text-slate-400 font-bold px-1">صفحة {globalPage}</span>
                    <button
                      type="button"
                      onClick={() => setGlobalPage((p) => p + 1)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-xl border border-white/10 bg-white/5 text-xs font-bold hover:bg-white/10"
                    >
                      <span>التالي</span>
                      <ChevronLeft size={14} />
                    </button>
                  </div>
                </div>

                {/* Big Photo Grid */}
                <div className="flex-1 overflow-y-auto pt-4 pr-1">
                  {isGlobalSearching ? (
                    <div className="grid place-items-center h-full text-slate-400 py-20">
                      <Loader2 size={42} className="animate-spin text-[#f8ca14] mb-3" />
                      <p className="text-sm font-bold">جاري جلب الصور الحقيقية فائقة الجودة من الأرشيف العالمي...</p>
                    </div>
                  ) : globalSearchData?.results && globalSearchData.results.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 pb-6">
                      {globalSearchData.results.map((photo) => {
                        const aspectClass =
                          searchOrientation === "tall" || photo.aspectRatio === "tall"
                            ? "aspect-[3/4]"
                            : searchOrientation === "square" || photo.aspectRatio === "square"
                            ? "aspect-square"
                            : "aspect-video";

                        return (
                          <div
                            key={photo.id}
                            onClick={() => setSelectedPhotoUrl(photo.url)}
                            className={`group relative ${aspectClass} cursor-pointer overflow-hidden rounded-2xl border transition-all ${
                              selectedPhotoUrl === photo.url
                                ? "ring-3 ring-[#f8ca14] border-[#f8ca14] scale-[1.02] shadow-xl shadow-[#f8ca14]/10"
                                : "border-white/10 hover:border-white/30 hover:scale-[1.01]"
                            }`}
                          >
                            <img
                              src={photo.thumbnail || photo.url}
                              alt={photo.title}
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent p-2.5 flex flex-col justify-end">
                              <span className="text-[11px] font-bold text-white line-clamp-1">{photo.title}</span>
                            </div>
                            {selectedPhotoUrl === photo.url && (
                              <div className="absolute top-2 left-2 grid h-7 w-7 place-items-center rounded-full bg-[#f8ca14] text-black shadow-lg">
                                <Check size={16} className="stroke-[3]" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-full grid place-items-center text-center text-slate-400 py-20">
                      <div>
                        <Search size={36} className="mx-auto text-slate-500 mb-2" />
                        <p className="text-sm font-bold">اكتب كلمة البحث واضغط "بحث" لاستعراض مئات الصور الحقيقية</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Action Bar when a photo is selected */}
                {selectedPhotoUrl && (
                  <div className="shrink-0 pt-3 border-t border-white/10 flex items-center justify-between gap-4 bg-black/60 p-3 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <img src={selectedPhotoUrl} alt="" className="h-12 w-20 rounded-xl object-cover border border-white/20" />
                      <div>
                        <p className="text-xs font-black text-emerald-400">تم تحديد الصورة الفوتوغرافية بدقة 4K بنجاح</p>
                        <p className="text-[11px] text-slate-400">انقر على الزر لاعتمادها فوراً كغلاف رسمي للمقال/البودكاست</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApply(selectedPhotoUrl)}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black px-6 py-2.5 text-xs transition shadow-lg shadow-emerald-500/20"
                    >
                      <Check size={16} />
                      <span>اعتماد هذه الصورة كغلاف رسمي الآن</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* AI Generator Canvas Content */}
            {activeTab === "aiPrompt" && (
              <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto p-4">
                {generatedUrl ? (
                  <div className="space-y-4 max-w-2xl w-full text-center">
                    <div
                      className={`relative mx-auto overflow-hidden rounded-3xl bg-black border-2 border-white/20 shadow-2xl ${
                        aspectRatio === "9:16"
                          ? "aspect-[9/16] max-h-[55vh]"
                          : aspectRatio === "1:1"
                          ? "aspect-square max-h-[55vh]"
                          : aspectRatio === "3:4"
                          ? "aspect-[3/4] max-h-[55vh]"
                          : "aspect-video w-full max-h-[55vh]"
                      }`}
                    >
                      <img src={generatedUrl} alt="Generated scene" className="h-full w-full object-cover" />
                    </div>

                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => handleApply(generatedUrl)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black px-8 py-3 text-sm transition shadow-xl shadow-emerald-500/20"
                      >
                        <Check size={18} />
                        <span>اعتماد هذا المشهد كغلاف رسمي</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleAiGenerate}
                        disabled={generateMutation.isPending}
                        className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-bold px-5 py-3 text-xs transition"
                      >
                        <span>توليد لقطة بديلة</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-400 max-w-md space-y-3">
                    <div className="grid h-16 w-16 place-items-center rounded-3xl bg-amber-500/10 border border-amber-500/20 text-[#f8ca14] mx-auto shadow-inner">
                      <Wand2 size={28} />
                    </div>
                    <h3 className="text-base font-black text-white">استوديو التوليد الذكي فائق الواقعية (8K)</h3>
                    <p className="text-xs leading-6 text-slate-400">
                      حدد وصف المشهد والأبعاد المطلوبة من القائمة الجانبية ثم اضغط «توليد المشهد الآن» لعرض النتيجة السينمائية هنا
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Quick Catalog Canvas Content */}
            {activeTab === "gallery" && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
                  <span className="text-xs font-bold text-slate-300">
                    الكتالوج المعتمد لمدارس العقيق ({filteredCatalogPhotos.length} صورة)
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto pt-4 pr-1">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 pb-6">
                    {filteredCatalogPhotos.map((photo, idx) => {
                      const aspectClass =
                        photo.orientation === "tall" ? "aspect-[3/4]" : photo.orientation === "square" ? "aspect-square" : "aspect-video";

                      return (
                        <div
                          key={idx}
                          onClick={() => setSelectedPhotoUrl(photo.url)}
                          className={`group relative ${aspectClass} cursor-pointer overflow-hidden rounded-2xl border transition-all ${
                            selectedPhotoUrl === photo.url
                              ? "ring-3 ring-[#f8ca14] border-[#f8ca14] scale-[1.02] shadow-xl shadow-[#f8ca14]/10"
                              : "border-white/10 hover:border-white/30 hover:scale-[1.01]"
                          }`}
                        >
                          <img
                            src={photo.url}
                            alt={photo.title}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent p-2.5 flex flex-col justify-end">
                            <span className="text-[9px] font-black text-[#f8ca14]">{photo.category}</span>
                            <span className="text-[11px] font-bold text-white line-clamp-1">{photo.title}</span>
                          </div>
                          {selectedPhotoUrl === photo.url && (
                            <div className="absolute top-2 left-2 grid h-7 w-7 place-items-center rounded-full bg-[#f8ca14] text-black shadow-lg">
                              <Check size={16} className="stroke-[3]" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedPhotoUrl && (
                  <div className="shrink-0 pt-3 border-t border-white/10 flex items-center justify-between gap-4 bg-black/60 p-3 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <img src={selectedPhotoUrl} alt="" className="h-12 w-20 rounded-xl object-cover border border-white/20" />
                      <div>
                        <p className="text-xs font-black text-emerald-400">تم تحديد الصورة بنجاح</p>
                        <p className="text-[11px] text-slate-400">جاهزة للاعتماد كغلاف رسمي فائق النقاء</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApply(selectedPhotoUrl)}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black px-6 py-2.5 text-xs transition shadow-lg shadow-emerald-500/20"
                    >
                      <Check size={16} />
                      <span>اعتماد كغلاف رسمي الآن</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Card Designer Canvas Content */}
            {activeTab === "cardDesigner" && (
              <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto p-4">
                <div className="max-w-xl w-full space-y-4">
                  <div
                    id="aqeeq-branded-card"
                    className={`relative aspect-video w-full overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br ${activeCardStyle.bg} p-8 flex flex-col justify-between shadow-2xl`}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(248,202,20,0.18),transparent_60%)] pointer-events-none" />

                    {/* Header of card */}
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f8ca14]/40 bg-[#f8ca14]/15 px-3.5 py-1 text-xs font-black text-[#f8ca14]">
                        <Sparkles size={12} /> {cardCategory}
                      </span>
                      <span className="text-xs font-black tracking-wider text-slate-400 uppercase">
                        ALAQEEQ STUDIO
                      </span>
                    </div>

                    {/* Body Title */}
                    <div className="relative z-10 space-y-2.5 my-auto">
                      <h2 className="text-2xl sm:text-3xl font-black leading-snug text-white drop-shadow-md">
                        {cardTitle || "عنوان المقال أو الحلقة"}
                      </h2>
                      <p className="text-xs font-bold text-slate-300">
                        صرح العقيق التعليمي · المدينة المنورة
                      </p>
                    </div>

                    {/* Footer of card */}
                    <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-3.5">
                      <span className="text-[11px] font-black text-[#f8ca14]">
                        مدارس العقيق الأهلية والدولية
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        1448H · 2026
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const curatedMatch = MASTER_PHOTO_CATALOG.find((p) => p.category.includes(cardCategory)) || MASTER_PHOTO_CATALOG[0];
                        handleApply(curatedMatch.url);
                      }}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#f8ca14] hover:bg-yellow-400 text-black font-black px-8 py-3 text-sm transition shadow-xl shadow-[#f8ca14]/20"
                    >
                      <Check size={18} />
                      <span>اعتماد بطاقة الغلاف الرسمي بالعنوان</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
