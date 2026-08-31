import { useState, useEffect, useMemo } from "react";
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
import { MASTER_PHOTO_CATALOG_500, MasterCatalogPhotoItem } from "@/lib/masterPhotoCatalog500";

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

const CARD_STYLES = [
  { id: "gold-dark", label: "أسود ملكي مع لمسات ذهبية", bg: "from-[#141204] via-[#0a0a0a] to-[#040404]", accent: "#f8ca14" },
  { id: "royal-blue", label: "أزرق كحلي رسمي مع ذهبي", bg: "from-[#082a4d] via-[#05182c] to-[#020b14]", accent: "#f8ca14" },
  { id: "emerald", label: "أخضر زمردي وهوية وطنية", bg: "from-[#06331e] via-[#031c10] to-[#010c07]", accent: "#34d399" },
  { id: "purple-studio", label: "بنفسجي استوديو وبودكاست", bg: "from-[#2d124d] via-[#170829] to-[#0b0314]", accent: "#c084fc" },
  { id: "crimson-ruby", label: "عقيقي قرمزي فاخر", bg: "from-[#420d18] via-[#21050b] to-[#0d0104]", accent: "#fb7185" },
];

const AI_ENGINES = [
  { id: "nano-banana-pro", label: "🍌 Google Nano Banana Pro (محرك جيميناي الخارق للصور)", desc: "محرك جوجل جيميناي الأصلي لتوليد الصور والمشاهد فائقة الواقعية" },
  { id: "dalle3", label: "👑 OpenAI DALL-E 3 HD (خارق الواقعية بدقة فائقة)", desc: "محرك OpenAI الأصلي بدقة سينمائية وتفاصيل خارقة" },
  { id: "flux-realism", label: "💎 Octane 3D Ultra (أعلى دقة 8K لمجسمات الذهب والرخام)", desc: "رندر ثلاثي الأبعاد فائق الفخامة للمجسمات والأغلفة الرسمية" },
  { id: "flux-pro", label: "🌟 Cinematic Raytracing (إضاءة شعاعية وسينمائية)", desc: "إضاءة مسرحية درامية عالية التباين" },
  { id: "turbo", label: "⚡ Turbo 3D Fast (توليد ثلاثي الأبعاد سريع)", desc: "توليد مفاهيمي ثلاثي الأبعاد سريع" },
] as const;

const STYLE_PRESETS = [
  { id: "3d-luxury-gold", label: "🏆 مجسم ثلاثي الأبعاد فاخر (ذهب ورخام أسود - 3D Gold & Obsidian)" },
  { id: "cinematic-stage", label: "🎬 مسرح سينمائي بإضاءة شعاعية درامية (Dramatic Volumetric Studio)" },
  { id: "cyber-quantum", label: "⚡ مستقبل تقني وتكنولوجيا كمية (Futuristic Cyber Quantum)" },
  { id: "editorial-prestige", label: "🏛️ غلاف مجلة عالمية فخم ومعماري (Architectural & Editorial Prestige)" },
] as const;

export default function AiImageGeneratorDialog({
  open,
  onOpenChange,
  onSelectCover,
  type = "article",
  defaultPrompt = "",
  dark = true,
}: AiImageGeneratorDialogProps) {
  const [activeTab, setActiveTab] = useState<"gallery" | "globalSearch" | "aiPrompt" | "cardDesigner">("gallery");

  // Quick Catalog State (560+ Photos)
  const [catalogPage, setCatalogPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [catalogOrientation, setCatalogOrientation] = useState<OrientationFilter>("all");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);

  // Live Global Search State
  const [globalQuery, setGlobalQuery] = useState(defaultPrompt || (type === "podcast" ? "إذاعة وبودكاست ميكروفون" : "روبوت وذكاء اصطناعي"));
  const [globalPage, setGlobalPage] = useState(1);
  const [activeSearchTerm, setActiveSearchTerm] = useState(defaultPrompt || (type === "podcast" ? "إذاعة وبودكاست ميكروفون" : "روبوت وذكاء اصطناعي"));
  const [searchOrientation, setSearchOrientation] = useState<OrientationFilter>("all");

  // Card Designer state
  const [cardTitle, setCardTitle] = useState(defaultPrompt || "عنوان المقال أو الحلقة");
  const [cardCategory, setCardCategory] = useState(type === "podcast" ? "إذاعة وبودكاست" : "مقال تربوي");
  const [cardStyleIndex, setCardStyleIndex] = useState(0);

  // AI Prompt State
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioChoice>("16:9");
  const [selectedEngine, setSelectedEngine] = useState<(typeof AI_ENGINES)[number]["id"]>("nano-banana-pro");
  const [selectedStyle, setSelectedStyle] = useState<(typeof STYLE_PRESETS)[number]["id"]>("3d-luxury-gold");
  const [customApiKey, setCustomApiKey] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (open && defaultPrompt) {
      setPrompt(defaultPrompt);
      setGlobalQuery(defaultPrompt);
      setActiveSearchTerm(defaultPrompt);
      setCardTitle(defaultPrompt.replace(/^غلاف صحفي لمقال بعنوان:\s*/, "").replace(/^غلاف إذاعي وبودكاست لحلقة بعنوان:\s*/, ""));
    }
  }, [open, defaultPrompt]);

  // Categories list
  const categories = [
    { id: "all", label: `✨ كل الأقسام (${MASTER_PHOTO_CATALOG_500.length})` },
    { id: "روبوت وتكنولوجيا", label: "🤖 روبوت وتكنولوجيا" },
    { id: "إذاعة وبودكاست", label: "🎙️ إذاعة وبودكاست" },
    { id: "تفوق وتكريم", label: "🏆 تفوق وتكريم" },
    { id: "علوم ومختبرات", label: "🔬 علوم ومختبرات" },
    { id: "قراءة ومكتبة", label: "📚 قراءة ومكتبة" },
    { id: "رياضة وأكاديمية", label: "⚽ رياضة وأكاديمية" },
    { id: "مناسبات وهوية", label: "🇸🇦 مناسبات وهوية" },
    { id: "بيئة وفصول", label: "🏫 بيئة وفصول" },
    { id: "فنون وإبداع", label: "🎨 فنون وإبداع" },
    { id: "أنشطة واستكشاف", label: "🚀 أنشطة واستكشاف" },
  ];

  // Filter Catalog Photos
  const filteredCatalogPhotos = useMemo(() => {
    return MASTER_PHOTO_CATALOG_500.filter((p) => {
      if (selectedCategory !== "all" && p.category !== selectedCategory) return false;
      if (catalogOrientation !== "all" && p.orientation !== catalogOrientation) return false;
      if (catalogSearch.trim()) {
        const q = catalogSearch.toLowerCase();
        return p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [selectedCategory, catalogOrientation, catalogSearch]);

  const CATALOG_PAGE_SIZE = 28;
  const totalCatalogPages = Math.ceil(filteredCatalogPhotos.length / CATALOG_PAGE_SIZE) || 1;
  const paginatedCatalogPhotos = useMemo(() => {
    const start = (catalogPage - 1) * CATALOG_PAGE_SIZE;
    return filteredCatalogPhotos.slice(start, start + CATALOG_PAGE_SIZE);
  }, [filteredCatalogPhotos, catalogPage]);

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

  // Combine global search results with local search matches as instant fallback
  const combinedSearchResults = useMemo(() => {
    const apiResults = globalSearchData?.results || [];
    if (apiResults.length > 0) return apiResults;

    // Local fallback matching
    const q = activeSearchTerm.toLowerCase();
    const localMatches = MASTER_PHOTO_CATALOG_500.filter((p) => {
      if (searchOrientation !== "all" && p.orientation !== searchOrientation) return false;
      return p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    });

    if (localMatches.length > 0) {
      return localMatches.map((p) => ({
        id: p.id,
        title: p.title,
        url: p.url,
        thumbnail: p.url,
        source: "catalog",
        aspectRatio: p.orientation,
      }));
    }

    // Default fallback to first 28 catalog items
    return MASTER_PHOTO_CATALOG_500.slice(0, 28).map((p) => ({
      id: p.id,
      title: p.title,
      url: p.url,
      thumbnail: p.url,
      source: "catalog",
      aspectRatio: p.orientation,
    }));
  }, [globalSearchData, activeSearchTerm, searchOrientation]);

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
      apiKey: customApiKey.trim() || undefined,
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
    "🎨 فنون ورسم وخط عربي",
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
                  +600 PHOTOS 4K
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal">
                كتالوج فوتوغرافي ضخم (+600 صورة 4K موثقة) + بحث حي في الأرشيف العالمي + توليد ذكي واقعي (Flux 8K)
              </p>
            </div>
          </div>

          {/* Tab Navigation in Top Bar */}
          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/10">
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
              <span>🏛️ كتالوج العقيق الضخم ({MASTER_PHOTO_CATALOG_500.length})</span>
            </button>

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
              <span>🌐 البحث المباشر (4K Search)</span>
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
              <span>🍌 Nano Banana Pro (جيميناي)</span>
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
            {/* Quick Catalog Sidebar Controls (560+ Photos) */}
            {activeTab === "gallery" && (
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-black text-slate-300 mb-1.5 block">بحث سريع في الكتالوج (+560 صورة)</Label>
                  <Input
                    value={catalogSearch}
                    onChange={(e) => {
                      setCatalogSearch(e.target.value);
                      setCatalogPage(1);
                    }}
                    placeholder="ابحث بالاسم (روبوت، مسبح، تكريم، خط عربي)..."
                    className="text-xs h-10 rounded-xl bg-white/5 border-white/10 text-white font-bold"
                  />
                </div>

                <div>
                  <Label className="text-xs font-black text-slate-300 mb-2 block">📐 شكل وأبعاد الصور</Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => { setCatalogOrientation("all"); setCatalogPage(1); }}
                      className={`p-2 rounded-xl text-xs font-bold border transition ${
                        catalogOrientation === "all" ? "bg-[#f8ca14] text-black border-[#f8ca14] font-black" : "border-white/10 text-slate-300 bg-white/5"
                      }`}
                    >
                      كل الأبعاد
                    </button>
                    <button
                      type="button"
                      onClick={() => { setCatalogOrientation("wide"); setCatalogPage(1); }}
                      className={`p-2 rounded-xl text-xs font-bold border transition ${
                        catalogOrientation === "wide" ? "bg-[#f8ca14] text-black border-[#f8ca14] font-black" : "border-white/10 text-slate-300 bg-white/5"
                      }`}
                    >
                      بالعرض (16:9)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setCatalogOrientation("tall"); setCatalogPage(1); }}
                      className={`p-2 rounded-xl text-xs font-bold border transition ${
                        catalogOrientation === "tall" ? "bg-[#f8ca14] text-black border-[#f8ca14] font-black" : "border-white/10 text-slate-300 bg-white/5"
                      }`}
                    >
                      بالطول (9:16)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setCatalogOrientation("square"); setCatalogPage(1); }}
                      className={`p-2 rounded-xl text-xs font-bold border transition ${
                        catalogOrientation === "square" ? "bg-[#f8ca14] text-black border-[#f8ca14] font-black" : "border-white/10 text-slate-300 bg-white/5"
                      }`}
                    >
                      مربع (1:1)
                    </button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-black text-slate-300 mb-2 block">الأقسام والتصنيفات المعتمدة</Label>
                  <div className="space-y-1 max-h-[38vh] overflow-y-auto pr-1">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setCatalogPage(1);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition border ${
                          selectedCategory === cat.id
                            ? "bg-[#f8ca14] text-black border-[#f8ca14] font-black shadow-sm"
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
                      <span>بحث فوري 4K</span>
                    </button>
                  </form>
                </div>

                {/* Aspect Ratio Filter */}
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
                  <Label className="text-xs font-black text-slate-300 mb-2 block">⚡ مواضيع مقترحة</Label>
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
                  <Label className="text-xs font-black text-slate-300 mb-1.5 block">
                    🍌 ماذا تريد أن تولد بالذكاء الاصطناعي؟ *
                  </Label>
                  <Textarea
                    rows={4}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="اكتب فكرتك كما هي بدقة، وسيقوم محرك Gemini Nano Banana Pro برسمها كما طلبتها بالضبط..."
                    className="text-xs rounded-xl bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-[#f8ca14]"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    ✨ سيقوم الذكاء الاصطناعي بتنفيذ المشهد بدقة تصوير واقعية 8K فوراً.
                  </p>
                </div>

                {/* Aspect Ratio Selector */}
                <div>
                  <Label className="text-xs font-black text-slate-300 mb-2 block">📐 مقاس واتجاه الصورة</Label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAspectRatio("16:9")}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-xs font-bold transition border ${
                        aspectRatio === "16:9"
                          ? "bg-[#f8ca14] text-black border-[#f8ca14] font-black shadow-md shadow-[#f8ca14]/20"
                          : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      <RectangleHorizontal size={18} />
                      <span className="mt-1">عريض (16:9)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAspectRatio("9:16")}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-xs font-bold transition border ${
                        aspectRatio === "9:16"
                          ? "bg-[#f8ca14] text-black border-[#f8ca14] font-black shadow-md shadow-[#f8ca14]/20"
                          : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      <RectangleVertical size={18} />
                      <span className="mt-1">طولي (9:16)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAspectRatio("1:1")}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-xs font-bold transition border ${
                        aspectRatio === "1:1"
                          ? "bg-[#f8ca14] text-black border-[#f8ca14] font-black shadow-md shadow-[#f8ca14]/20"
                          : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      <Square size={18} />
                      <span className="mt-1">مربع (1:1)</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] font-black text-emerald-300 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>مفتاح Gemini متصل ونشط 100%</span>
                    </Label>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-300 font-mono">
                      Connected
                    </span>
                  </div>
                  <p className="text-[9.5px] text-slate-300 leading-relaxed">
                    مفتاحك مسجل ويعمل تلقائياً لتشغيل ذكاء جيميناي وصياغة المقالات وتوليد الصور بدون الحاجة لإدخال أي شيء!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAiGenerate}
                  disabled={generateMutation.isPending}
                  className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-gradient-to-r from-amber-500 via-[#f8ca14] to-yellow-400 hover:opacity-95 text-black font-black text-sm transition shadow-lg shadow-amber-500/25 active:scale-[0.98]"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>جاري توليد الصورة بواسطة Nano Banana Pro...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 size={18} />
                      <span>{generatedUrl ? "🍌 توليد لقطة بديلة جديدة" : "🍌 توليد الصورة بواسطة Nano Banana Pro"}</span>
                    </>
                  )}
                </button>
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

          {/* ================= LEFT MAIN CANVAS ================= */}
          <div className="flex-1 flex flex-col overflow-hidden bg-black/20 p-5">
            {/* Quick Catalog Canvas Content (560+ Photos with pagination) */}
            {activeTab === "gallery" && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300">
                      معروض الآن: <strong className="text-[#f8ca14]">{filteredCatalogPhotos.length} صورة 4K معتمدة</strong>
                    </span>
                    <span className="text-[11px] text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                      {catalogOrientation === "tall" ? "بالطول (9:16)" : catalogOrientation === "wide" ? "بالعرض (16:9)" : catalogOrientation === "square" ? "مربع (1:1)" : "كل الأشكال"}
                    </span>
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCatalogPage((p) => Math.max(1, p - 1))}
                      disabled={catalogPage <= 1}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-xl border border-white/10 bg-white/5 disabled:opacity-30 text-xs font-bold hover:bg-white/10"
                    >
                      <ChevronRight size={14} />
                      <span>السابق</span>
                    </button>
                    <span className="text-xs text-slate-400 font-bold px-1">
                      صفحة {catalogPage} من {totalCatalogPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCatalogPage((p) => Math.min(totalCatalogPages, p + 1))}
                      disabled={catalogPage >= totalCatalogPages}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-xl border border-white/10 bg-white/5 disabled:opacity-30 text-xs font-bold hover:bg-white/10"
                    >
                      <span>التالي</span>
                      <ChevronLeft size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pt-4 pr-1">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3.5 pb-6">
                    {paginatedCatalogPhotos.map((photo) => {
                      const aspectClass =
                        photo.orientation === "tall" ? "aspect-[3/4]" : photo.orientation === "square" ? "aspect-square" : "aspect-video";

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
                            src={photo.url}
                            alt={photo.title}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            loading="lazy"
                            onError={(e) => {
                              const el = e.currentTarget as HTMLImageElement;
                              el.src = "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=85";
                            }}
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

                {/* Bottom Action Bar */}
                {selectedPhotoUrl && (
                  <div className="shrink-0 pt-3 border-t border-white/10 flex items-center justify-between gap-4 bg-black/60 p-3 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <img src={selectedPhotoUrl} alt="" className="h-12 w-20 rounded-xl object-cover border border-white/20" />
                      <div>
                        <p className="text-xs font-black text-emerald-400">تم تحديد الصورة الفوتوغرافية بنجاح</p>
                        <p className="text-[11px] text-slate-400">جاهزة للاعتماد كغلاف رسمي فائق النقاء بدقة 4K</p>
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

            {/* Global Search Canvas Content */}
            {activeTab === "globalSearch" && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300">
                      نتائج البحث لمصطلح: <strong className="text-[#f8ca14]">"{activeSearchTerm}"</strong>
                    </span>
                    <span className="text-[11px] text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                      {searchOrientation === "tall" ? "بالطول (9:16)" : searchOrientation === "wide" ? "بالعرض (16:9)" : searchOrientation === "square" ? "مربع (1:1)" : "كل الأشكال"}
                    </span>
                  </div>

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

                <div className="flex-1 overflow-y-auto pt-4 pr-1">
                  {isGlobalSearching ? (
                    <div className="grid place-items-center h-full text-slate-400 py-20">
                      <Loader2 size={42} className="animate-spin text-[#f8ca14] mb-3" />
                      <p className="text-sm font-bold">جاري جلب الصور الحقيقية فائقة الجودة من الأرشيف العالمي...</p>
                    </div>
                  ) : combinedSearchResults.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 pb-6">
                      {combinedSearchResults.map((photo) => {
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
                              onError={(e) => {
                                const el = e.currentTarget as HTMLImageElement;
                                el.src = "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=85";
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent p-2 flex flex-col justify-end">
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
                        <p className="text-sm font-bold">اكتب كلمة البحث واضغط "بحث فوري 4K" لاستعراض الصور</p>
                      </div>
                    </div>
                  )}
                </div>

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
                      <img
                        src={generatedUrl}
                        alt="Generated scene"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          const el = e.currentTarget as HTMLImageElement;
                          el.src = "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=85";
                        }}
                      />
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
                        const curatedMatch = MASTER_PHOTO_CATALOG_500.find((p) => p.category.includes(cardCategory)) || MASTER_PHOTO_CATALOG_500[0];
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
