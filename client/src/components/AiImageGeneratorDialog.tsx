import { useState, useEffect, useMemo, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Check,
  Palette,
  Camera,
  Search,
  Globe,
  ChevronLeft,
  ChevronRight,
  RectangleHorizontal,
  RectangleVertical,
  Square,
  X,
  Layers,
  UploadCloud,
  ImageIcon,
  Sparkles,
  BookOpen,
  Feather,
  Sun,
  Sunset,
  Moon,
  Sunrise,
  Clock,
  Radio,
  Share2,
  Mic,
  Volume2,
  Headphones,
  Award,
  FileText,
  Bookmark,
  Disc,
  LayoutTemplate,
  Frame,
  Columns2,
  Map,
  Grid,
  Gem,
  Compass,
  Landmark,
  Library,
  Scroll,
  Building2,
  TreePine,
  Paintbrush,
  Upload,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { MASTER_PHOTO_CATALOG_500 } from "@/lib/masterPhotoCatalog500";

interface AiImageGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectCover: (url: string) => void;
  type?: "article" | "podcast" | "general";
  defaultPrompt?: string;
  defaultAuthor?: string;
  defaultQuote?: string;
  defaultDuration?: string;
  articleWordCount?: number;
  dark?: boolean;
}

type OrientationFilter = "all" | "wide" | "tall" | "square";
type MedinaTimeMode = "auto" | "dawn" | "noon" | "sunset" | "night";
type ArticleLayoutStyle = "framed" | "masthead" | "split";
type ArticleTextureType =
  // 1. Medina & Heritage
  | "cinematic_medina"
  | "cinematic_arches"
  | "cinematic_valley"
  | "cinematic_mountains"
  | "cinematic_dome"
  | "cinematic_minaret"
  // 2. Philosophy & Libraries
  | "cinematic_library"
  | "cinematic_calligraphy"
  | "cinematic_manuscript"
  | "cinematic_science"
  | "cinematic_microscope"
  // 3. Tech & Future
  | "cinematic_innovation"
  | "cinematic_cosmos"
  | "cinematic_cyber"
  | "cinematic_robotics"
  | "cinematic_quantum"
  | "cinematic_galaxy"
  // 4. Education & Leadership
  | "cinematic_auditorium"
  | "cinematic_classroom"
  | "cinematic_achievement"
  | "cinematic_dawn"
  | "cinematic_graduates"
  // 5. Nature & Environment
  | "cinematic_oasis"
  | "cinematic_forest"
  | "cinematic_desert_dunes"
  | "cinematic_night_stars"
  // 6. Arts & Philosophy
  | "cinematic_palette"
  | "cinematic_chess"
  | "cinematic_prism";

interface MedinaAtmosphere {
  id: MedinaTimeMode;
  name: string;
  timeRange: string;
  description: string;
  icon: any;
  bgGradient: string;
  accentColor: string;
  badgeStyle: string;
  textColor: string;
  subtextColor: string;
  pattern: string;
  archGlow: string;
}

const MEDINA_ATMOSPHERES: Record<"dawn" | "noon" | "sunset" | "night", MedinaAtmosphere> = {
  dawn: {
    id: "dawn",
    name: "فجر المدينة المنورة المذهب",
    timeRange: "٠٤:٠٠ ص - ٠٩:٠٠ ص",
    description: "سكينة الفجر مع إشراقة الصباح الأولى وتدرجات الذهب الناعم",
    icon: Sunrise,
    bgGradient: "from-[#1a1c2e] via-[#241a2e] to-[#422835]",
    accentColor: "#fde047",
    badgeStyle: "bg-yellow-400/20 text-yellow-300 border-yellow-400/40",
    textColor: "text-white",
    subtextColor: "text-amber-200/80",
    pattern: "radial-gradient(circle at 50% 0%, rgba(253, 224, 71, 0.18) 0%, transparent 60%)",
    archGlow: "rgba(253, 224, 71, 0.3)"
  },
  noon: {
    id: "noon",
    name: "ضياء الظهيرة والعقيق الأخضر",
    timeRange: "٠٩:٠٠ ص - ٠٤:٠٠ م",
    description: "نقاء الشمس الساطعة والزمرد الملكي بلمسات ذهبية مشرقة",
    icon: Sun,
    bgGradient: "from-[#04261b] via-[#083b2c] to-[#02130d]",
    accentColor: "#4ade80",
    badgeStyle: "bg-emerald-400/20 text-emerald-300 border-emerald-400/40",
    textColor: "text-white",
    subtextColor: "text-emerald-200/80",
    pattern: "radial-gradient(circle at 80% 20%, rgba(74, 222, 128, 0.16) 0%, transparent 50%)",
    archGlow: "rgba(74, 222, 128, 0.3)"
  },
  sunset: {
    id: "sunset",
    name: "شفق الأصيل وغروب العقيق",
    timeRange: "٠٤:٠٠ م - ٠٧:٣٠ م",
    description: "سحر الغروب وتدرجات الياقوت القرمزي والذهب الدافئ",
    icon: Sunset,
    bgGradient: "from-[#3b0d19] via-[#21060f] to-[#0d0105]",
    accentColor: "#f8ca14",
    badgeStyle: "bg-rose-500/20 text-rose-300 border-rose-400/40",
    textColor: "text-white",
    subtextColor: "text-rose-200/80",
    pattern: "radial-gradient(circle at 30% 80%, rgba(248, 202, 20, 0.2) 0%, transparent 55%)",
    archGlow: "rgba(248, 202, 20, 0.35)"
  },
  night: {
    id: "night",
    name: "سماء ليل المدينة المرصعة",
    timeRange: "٠٧:٣٠ م - ٠٤:٠٠ ص",
    description: "كحلي ملكي عميق ونجوم متلألئة مع لمعان ذهبي هادئ",
    icon: Moon,
    bgGradient: "from-[#06182c] via-[#030d17] to-[#01050a]",
    accentColor: "#f8ca14",
    badgeStyle: "bg-[#f8ca14]/20 text-[#f8ca14] border-[#f8ca14]/40",
    textColor: "text-white",
    subtextColor: "text-slate-300",
    pattern: "radial-gradient(circle at 50% 50%, rgba(248, 202, 20, 0.12) 0%, transparent 70%)",
    archGlow: "rgba(248, 202, 20, 0.25)"
  }
};

// Calculate Medina Atmosphere based on current Saudi Arabia Time
function getLiveMedinaAtmosphere(): "dawn" | "noon" | "sunset" | "night" {
  try {
    const medinaHourStr = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Riyadh",
      hour: "numeric",
      hour12: false
    }).format(new Date());
    const hour = parseInt(medinaHourStr, 10);

    if (hour >= 4 && hour < 9) return "dawn";
    if (hour >= 9 && hour < 16) return "noon";
    if (hour >= 16 && hour < 19) return "sunset";
    return "night";
  } catch (e) {
    return "sunset";
  }
}

// Preset Badges for Articles
const ARTICLE_BADGES = [
  "🌟 أقلام العقيق الواعدة",
  "🔬 رؤية وبحث علمي",
  "🧭 بوصلة تربوية وإلهام",
  "🇸🇦 نبض الوطن وهوية المدينة",
  "💡 ابتكار ومشاريع موهبة",
];

// Article Background Themes & Tactile Visuals
interface ArticleBackgroundTheme {
  id: ArticleTextureType;
  name: string;
  badge: string;
  category: "medina" | "library" | "tech" | "education" | "nature" | "arts";
  description: string;
  icon: any;
  bgImage: string;
}

const ARTICLE_TEXTURES: Record<ArticleTextureType, ArticleBackgroundTheme> = {
  // --- 1. Medina & Heritage ---
  cinematic_medina: {
    id: "cinematic_medina",
    name: "أنوار المدينة المنورة 🏛️",
    badge: "هوية المدينة",
    category: "medina",
    description: "إطلالة ليلية لعمارة المدينة المنورة مع تدرج ذهبي دافئ",
    icon: Landmark,
    bgImage: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1400&q=85",
  },
  cinematic_arches: {
    id: "cinematic_arches",
    name: "أروقة العمارة والأقواس 🕌",
    badge: "أصالة وتراث",
    category: "medina",
    description: "أقواس حجرية تاريخية مهيبة بنور الصباح المذهب",
    icon: Frame,
    bgImage: "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1400&q=85",
  },
  cinematic_valley: {
    id: "cinematic_valley",
    name: "واحة وادي العقيق والنخيل 🌴",
    badge: "طبيعة المدينة",
    category: "medina",
    description: "نخيل وادي العقيق وسكينة بساتين المدينة الخضراء",
    icon: Map,
    bgImage: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1400&q=85",
  },
  cinematic_mountains: {
    id: "cinematic_mountains",
    name: "جبال المدينة والآفاق المهيبة ⛰️",
    badge: "شموخ وتاريخ",
    category: "medina",
    description: "جبال أُحد والآفاق التاريخية بضوء الغروب الذهبي",
    icon: Sun,
    bgImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=85",
  },
  cinematic_dome: {
    id: "cinematic_dome",
    name: "القباب الإسلامية والزخارف 🕋",
    badge: "هندسة معمارية",
    category: "medina",
    description: "تفاصيل القباب والزخارف الهندسية الإسلامية الفريدة",
    icon: Landmark,
    bgImage: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1400&q=85",
  },
  cinematic_minaret: {
    id: "cinematic_minaret",
    name: "مئذنة النور وسماء المدينة 🌙",
    badge: "روحانية المدينة",
    category: "medina",
    description: "مآذن شامخة تعانق سماء المدينة الصافية في الغسق",
    icon: Moon,
    bgImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=85",
  },

  // --- 2. Philosophy & Libraries ---
  cinematic_library: {
    id: "cinematic_library",
    name: "رحاب المكتبة والفكر 📚",
    badge: "أكاديمي فكري",
    category: "library",
    description: "أجواء المكتبات العريقة والرفوف الخشبية الكلاسيكية بإنارة ذهبية",
    icon: Library,
    bgImage: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1400&q=85",
  },
  cinematic_calligraphy: {
    id: "cinematic_calligraphy",
    name: "محبرة الكاتب والمخطوطات 🖋️",
    badge: "أدب وتوثيق",
    category: "library",
    description: "مكتب الكاتب الكلاسيكي مع قلم الحبر والأوراق المعتقة",
    icon: Feather,
    bgImage: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&q=85",
  },
  cinematic_manuscript: {
    id: "cinematic_manuscript",
    name: "كنوز المخطوطات والوثائق 📜",
    badge: "تراث وبحث",
    category: "library",
    description: "صفحات مخطوطة أثرية نادرة مع أضواء دافئة",
    icon: Scroll,
    bgImage: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1400&q=85",
  },
  cinematic_science: {
    id: "cinematic_science",
    name: "مختبر الاكتشاف والبحث العلمي 🔬",
    badge: "تجربة وبحث",
    category: "library",
    description: "بلورات بصرية ومجاهر وأبحاث مخبرية دقيقة",
    icon: Gem,
    bgImage: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1400&q=85",
  },
  cinematic_microscope: {
    id: "cinematic_microscope",
    name: "آفاق العلوم والفيزياء 🧪",
    badge: "علوم دقيقة",
    category: "library",
    description: "تفاعلات ضوئية وأنابيب بحث علمي متقدم لمقالات STEM",
    icon: Sparkles,
    bgImage: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1400&q=85",
  },

  // --- 3. Tech & Future ---
  cinematic_innovation: {
    id: "cinematic_innovation",
    name: "مختبر الابتكار والذكاء 🤖",
    badge: "تقنية ومستقبل",
    category: "tech",
    description: "مختبرات الروبوتات والذكاء الاصطناعي مع إضاءة نيون هادئة",
    icon: Sparkles,
    bgImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1400&q=85",
  },
  cinematic_cosmos: {
    id: "cinematic_cosmos",
    name: "قبة الفضاء والأجرام 🌌",
    badge: "علوم وفلك",
    category: "tech",
    description: "سماء مرصعة بالنجوم ومجرات كونية ملهمة فوق الجبال",
    icon: Compass,
    bgImage: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1400&q=85",
  },
  cinematic_cyber: {
    id: "cinematic_cyber",
    name: "شبكات البيانات والألياف الذكية 🌐",
    badge: "معرفة رقمية",
    category: "tech",
    description: "تموجات ضوئية رقمية وشبكات ترابط معرفي عصري",
    icon: Columns2,
    bgImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1400&q=85",
  },
  cinematic_robotics: {
    id: "cinematic_robotics",
    name: "صناعة المستقبل ومشاريع موهبة 💡",
    badge: "ابتكار وموهبة",
    category: "tech",
    description: "أذرع روبوتية ودوائر إلكترونية لمشاريع الطلاب الابتكارية",
    icon: Award,
    bgImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1400&q=85",
  },
  cinematic_quantum: {
    id: "cinematic_quantum",
    name: "الحوسبة السحابية والمعالجات 💻",
    badge: "حوسبة فائقة",
    category: "tech",
    description: "معالجات سيليكونية ومصفوفات حوسبة متطورة",
    icon: Disc,
    bgImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=85",
  },
  cinematic_galaxy: {
    id: "cinematic_galaxy",
    name: "سديم المجرات والفيزياء الكونية ✨",
    badge: "استكشاف كوني",
    category: "tech",
    description: "سحب سديمية مشعة وأطياف النجوم في الفضاء السحيق",
    icon: Compass,
    bgImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=85",
  },

  // --- 4. Education & Leadership ---
  cinematic_auditorium: {
    id: "cinematic_auditorium",
    name: "مدرج الفكر والمؤتمرات 🎓",
    badge: "منبر القيادة",
    category: "education",
    description: "قاعات المؤتمرات والندوات الفكرية الكبرى بإضاءة مسرحية راقية",
    icon: Building2,
    bgImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=85",
  },
  cinematic_classroom: {
    id: "cinematic_classroom",
    name: "واحة التعليم الحديث والصف الذكي 🏫",
    badge: "بيئة تعليمية",
    category: "education",
    description: "قاعات دراسية ذكية وتفاعل طلابي مبهر",
    icon: BookOpen,
    bgImage: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1400&q=85",
  },
  cinematic_achievement: {
    id: "cinematic_achievement",
    name: "منصة التميز والجوائز الكبرى 🏆",
    badge: "تكريم وتفوق",
    category: "education",
    description: "أوسمة التفوق المدرسي والاعتلاء الأكاديمي",
    icon: Award,
    bgImage: "https://images.unsplash.com/photo-1578269174936-2709b6aeb913?auto=format&fit=crop&w=1400&q=85",
  },
  cinematic_dawn: {
    id: "cinematic_dawn",
    name: "إشراقة الأمل والآفاق الواعدة 🌅",
    badge: "أمل وإلهام",
    category: "education",
    description: "شروق شمس ذهبي فوق الآفاق يرمز لجيل واعد ملهم",
    icon: Sunrise,
    bgImage: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1400&q=85",
  },
  cinematic_graduates: {
    id: "cinematic_graduates",
    name: "مسيرة الخريجين وقادة الغد 👨‍🎓",
    badge: "تخرج وفخر",
    category: "education",
    description: "منصات التخرج وأروقة المستقبل الواعد لطلاب العقيق",
    icon: Award,
    bgImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1400&q=85",
  },

  // --- 5. Nature & Environment ---
  cinematic_oasis: {
    id: "cinematic_oasis",
    name: "الواحات الخضراء والبيئة 🌿",
    badge: "استدامة وبيئة",
    category: "nature",
    description: "طبيعة غناء وأشجار خضراء تعبر عن مبادرات الاستدامة",
    icon: TreePine,
    bgImage: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1400&q=85",
  },
  cinematic_forest: {
    id: "cinematic_forest",
    name: "ضباب الصباح والغابات الساحرة 🌲",
    badge: "سكينة وتأمل",
    category: "nature",
    description: "أشعة شمس متسللة بين الأشجار في صباح ضبابي منعش",
    icon: TreePine,
    bgImage: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1400&q=85",
  },
  cinematic_desert_dunes: {
    id: "cinematic_desert_dunes",
    name: "كثبان الرمال الذهبية والوطن 🏜️",
    badge: "أصالة الوطن",
    category: "nature",
    description: "كثبان رملية ذهبية تموج بجمال الطبيعة الصحراوية للمملكة",
    icon: Sun,
    bgImage: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1400&q=85",
  },
  cinematic_night_stars: {
    id: "cinematic_night_stars",
    name: "ليالي الصحراء وسماء الشهب 🌠",
    badge: "تأمل وهدوء",
    category: "nature",
    description: "سماء ليلية نقية تعج بالنجوم والشهب المضيئة",
    icon: Moon,
    bgImage: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1400&q=85",
  },

  // --- 6. Arts & Philosophy ---
  cinematic_palette: {
    id: "cinematic_palette",
    name: "لوحة الفنون والألوان الزيتية 🎨",
    badge: "إبداع وتعبير",
    category: "arts",
    description: "ألوان زيتية وريش رسم فنية لمقالات الفنون والإبداع",
    icon: Paintbrush,
    bgImage: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1400&q=85",
  },
  cinematic_chess: {
    id: "cinematic_chess",
    name: "شطرنج الفكر والتخطيط الاستراتيجي ♟️",
    badge: "حكمة وقيادة",
    category: "arts",
    description: "قطع شطرنج خشبية فاخرة ترمز للدهاء والتفكير المنطقي",
    icon: Award,
    bgImage: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1400&q=85",
  },
  cinematic_prism: {
    id: "cinematic_prism",
    name: "منشور الضوء وأطياف البصيرة 💎",
    badge: "فلسفة ورؤية",
    category: "arts",
    description: "انكسار الضوء الأبيض إلى ألوان الطيف السبعة المعبرة",
    icon: Gem,
    bgImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1400&q=85",
  },
};

export default function AiImageGeneratorDialog({
  open,
  onOpenChange,
  onSelectCover,
  type = "article",
  defaultPrompt = "",
  defaultAuthor = "",
  defaultQuote = "",
  defaultDuration = "",
  articleWordCount = 0,
}: AiImageGeneratorDialogProps) {
  // Main Tab Navigation
  const [activeTab, setActiveTab] = useState<"livingMedina" | "gallery" | "globalSearch">("livingMedina");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Common Customization States
  const [medinaMode, setMedinaMode] = useState<MedinaTimeMode>("auto");
  const [title, setTitle] = useState(defaultPrompt || (type === "podcast" ? "عنوان حلقة البودكاست الإذاعية" : "عنوان المقال أو البحث العلمي"));
  const [author, setAuthor] = useState(defaultAuthor || "");
  const [category, setCategory] = useState(type === "podcast" ? "إذاعة وبودكاست" : "مقال تربوي وثقافي");
  const [quote, setQuote] = useState(defaultQuote || "");
  const [aspectRatio, setAspectRatio] = useState<"wide" | "square" | "tall">(type === "podcast" ? "square" : "wide");
  const [isExporting, setIsExporting] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  // Article Specific Layout & Texture (Default to "cinematic_medina")
  const [articleLayout, setArticleLayout] = useState<ArticleLayoutStyle>("masthead");
  const [articleTexture, setArticleTexture] = useState<ArticleTextureType>("cinematic_medina");
  const [selectedBgCategory, setSelectedBgCategory] = useState<"all" | "medina" | "library" | "tech" | "education" | "nature" | "arts">("all");
  const [customBgImage, setCustomBgImage] = useState<string | null>(null);
  const bgUploadRef = useRef<HTMLInputElement>(null);

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 10 ميجابايت");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomBgImage(event.target.result as string);
          toast.success("تم رفع وتطبيق صورتك الخاصة كخلفية سينمائية بنجاح! ✨");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Adaptive Layout Controls (Features 1, 4, 6)
  const [showQuote, setShowQuote] = useState(true);
  const [showWordCountCapsule, setShowWordCountCapsule] = useState(true);
  const [showHeritageCapsule, setShowHeritageCapsule] = useState(true);
  const [vignetteIntensity, setVignetteIntensity] = useState<"soft" | "balanced" | "deep">("balanced");
  const [textAlign, setTextAlign] = useState<"right" | "center">("right");
  const [showGoldFrame, setShowGoldFrame] = useState(true);
  const [showCategoryPill, setShowCategoryPill] = useState(true);

  // Specific Podcast States
  const [podcastDuration, setPodcastDuration] = useState(defaultDuration || "١٨:٤٥");

  // Specific Article States
  const [readingTime, setReadingTime] = useState(articleWordCount > 0 ? `📖 ${articleWordCount} كلمة` : "📖 قراءة معمقة");
  const [selectedArticleBadge, setSelectedArticleBadge] = useState(ARTICLE_BADGES[0]);

  // Smart Typography Sizing (Feature 1)
  const titleFontSizeClass = useMemo(() => {
    const len = (title || "").trim().length;
    const hasQuote = showQuote && Boolean(quote);
    
    if (aspectRatio === "tall") {
      if (len <= 25) return "text-2xl sm:text-3xl lg:text-4xl";
      if (len <= 55) return "text-xl sm:text-2xl lg:text-3xl";
      if (len <= 90) return "text-lg sm:text-xl lg:text-2xl";
      return "text-base sm:text-lg lg:text-xl leading-snug";
    }
    
    if (aspectRatio === "square") {
      if (len <= 30) return "text-2xl sm:text-3xl lg:text-4xl";
      if (len <= 65) return "text-xl sm:text-2xl lg:text-3xl";
      if (len <= 100) return "text-lg sm:text-xl lg:text-2xl";
      return "text-base sm:text-lg lg:text-xl leading-snug";
    }
    
    // Wide 16:9
    if (len <= 35) return hasQuote ? "text-2xl sm:text-3xl lg:text-4xl" : "text-3xl sm:text-4xl lg:text-5xl";
    if (len <= 75) return hasQuote ? "text-xl sm:text-2xl lg:text-3xl" : "text-2xl sm:text-3xl lg:text-4xl";
    if (len <= 120) return "text-lg sm:text-xl lg:text-2xl leading-snug";
    return "text-base sm:text-lg lg:text-xl leading-snug";
  }, [title, quote, showQuote, aspectRatio]);

  // Dynamic Background Vignette Intensities
  const vignetteConfig = useMemo(() => {
    if (vignetteIntensity === "soft") {
      return {
        gradT: "from-black/75 via-black/25 to-black/55",
        gradR: "from-black/60 via-transparent to-black/60",
        imgFilter: "brightness-[0.44] contrast-[1.12] saturate-[0.95]",
      };
    }
    if (vignetteIntensity === "deep") {
      return {
        gradT: "from-black/95 via-black/55 to-black/85",
        gradR: "from-black/90 via-transparent to-black/90",
        imgFilter: "brightness-[0.28] contrast-[1.25] saturate-[0.9]",
      };
    }
    // Balanced (default)
    return {
      gradT: "from-black/90 via-black/40 to-black/70",
      gradR: "from-black/80 via-transparent to-black/80",
      imgFilter: "brightness-[0.36] contrast-[1.18] saturate-[0.92]",
    };
  }, [vignetteIntensity]);

  // Quick Catalog State (500+ Photos)
  const [catalogPage, setCatalogPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [catalogOrientation, setCatalogOrientation] = useState<OrientationFilter>("all");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);

  // Live Global Search State
  const [globalQuery, setGlobalQuery] = useState(defaultPrompt || (type === "podcast" ? "إذاعة وبودكاست" : "روبوت وذكاء اصطناعي"));
  const [globalPage, setGlobalPage] = useState(1);
  const [activeSearchTerm, setActiveSearchTerm] = useState(defaultPrompt || (type === "podcast" ? "إذاعة وبودكاست" : "روبوت وذكاء اصطناعي"));
  const [searchOrientation, setSearchOrientation] = useState<OrientationFilter>("all");

  // Determine active atmosphere
  const effectiveAtmosphereKey = useMemo(() => {
    if (medinaMode === "auto") {
      return getLiveMedinaAtmosphere();
    }
    return medinaMode;
  }, [medinaMode]);

  const activeAtmosphere = MEDINA_ATMOSPHERES[effectiveAtmosphereKey];

  // Live Medina time string for display
  const liveMedinaTimeStr = useMemo(() => {
    try {
      return new Intl.DateTimeFormat("ar-SA", {
        timeZone: "Asia/Riyadh",
        hour: "numeric",
        minute: "numeric",
        hour12: true
      }).format(new Date());
    } catch (e) {
      return "الآن";
    }
  }, []);

  useEffect(() => {
    if (open) {
      if (defaultPrompt) {
        const cleanTitle = defaultPrompt
          .replace(/^غلاف صحفي لمقال بعنوان:\s*/, "")
          .replace(/^غلاف إذاعي وبودكاست لحلقة بعنوان:\s*/, "")
          .replace(/^غلاف احترافي لمقال مدرسي بمدارس العقيق:\s*/, "");
        setTitle(cleanTitle);
        setGlobalQuery(cleanTitle);
        setActiveSearchTerm(cleanTitle);
      }
      if (defaultAuthor) {
        setAuthor(defaultAuthor);
      }
      if (defaultQuote) {
        setQuote(defaultQuote);
      }
      if (defaultDuration) {
        setPodcastDuration(defaultDuration);
      }
      if (articleWordCount && articleWordCount > 0) {
        setReadingTime(`📖 ${articleWordCount} كلمة`);
      }
      if (type === "podcast") {
        setAspectRatio("square");
      } else {
        setAspectRatio("wide");
        setArticleLayout("masthead");
      }
    }
  }, [open, defaultPrompt, defaultAuthor, defaultQuote, defaultDuration, articleWordCount, type]);

  // Categories list
  const categories = [
    { id: "all", label: `✨ كل الأقسام (${MASTER_PHOTO_CATALOG_500.length})` },
    { id: "روبوت وتكنولوجيا", label: "🤖 روبوت وتكنولوجيا" },
    { id: "إذاعة وبودكاست", label: "🎙️ إذاعة وبودكاست" },
    { id: "تفوق وتكريم", label: "🏆 تفوق وتكريم" },
    { id: "علوم ومختبرات", label: "🔬 علوم ومختبرات" },
    { id: "قراءة ومكتبة", label: "📚 قراءة ومكتبة" },
    { id: "رياضة وأكاديمية", label: "⚽ رياضة وأكاديمية" },
    { id: "بيئة وفصول", label: "🏫 بيئة وفصول" },
    { id: "فنون وإبداع", label: "🎨 فنون وإبداع" },
    { id: "رحلات واستكشاف", label: "🚀 رحلات واستكشاف" },
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
  } = trpc.aiVisuals.searchRealPhotos.useQuery(
    {
      query: activeSearchTerm || (type === "podcast" ? "podcast studio microphone" : "education school"),
      page: globalPage,
      pageSize: 32,
      orientation: searchOrientation,
    },
    { enabled: Boolean(open) }
  );

  const combinedSearchResults = useMemo(() => {
    const apiResults = globalSearchData?.results || [];
    if (apiResults.length > 0) return apiResults;
    const q = activeSearchTerm.toLowerCase();
    const localMatches = MASTER_PHOTO_CATALOG_500.filter((p) => {
      if (searchOrientation !== "all" && p.orientation !== searchOrientation) return false;
      return p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    });
    if (localMatches.length > 0) {
      return localMatches.map((p) => ({ id: p.id, title: p.title, url: p.url, thumbnail: p.url, source: "catalog", aspectRatio: p.orientation }));
    }
    return MASTER_PHOTO_CATALOG_500.slice(0, 28).map((p) => ({ id: p.id, title: p.title, url: p.url, thumbnail: p.url, source: "catalog", aspectRatio: p.orientation }));
  }, [globalSearchData, activeSearchTerm, searchOrientation]);

  const handleApply = (url: string) => {
    onSelectCover(url);
    toast.success("تم اعتماد الغلاف بنجاح! 📸");
    onOpenChange(false);
  };

  const handleExportLivingCard = async () => {
    const el = document.getElementById("aqeeq-living-medina-canvas");
    if (!el) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(el, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false
      });
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      handleApply(dataUrl);
    } catch (e) {
      toast.error("حدث خطأ أثناء تصدير الغلاف");
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onSelectCover(event.target.result as string);
          toast.success("تم رفع واعتماد الغلاف بنجاح! ✨");
          onOpenChange(false);
        }
      };
      reader.readAsDataURL(file);
    }
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

  // Holographic Foil Mouse Move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const isPodcast = type === "podcast";

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in-0 duration-200">
      <div className="relative w-full max-w-[1550px] h-[92vh] max-h-[92vh] rounded-3xl border border-white/20 bg-[#0d0d0d] text-white shadow-2xl flex flex-col overflow-hidden font-[Tajawal,sans-serif]" dir="rtl">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/10 bg-black/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-tr from-[#f8ca14] to-[#08467d] text-black shadow-lg">
              {isPodcast ? <Disc size={20} className="animate-spin" style={{ animationDuration: '10s' }} /> : <BookOpen size={20} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm sm:text-base">
                  {isPodcast ? "استوديو أغلفة البودكاست والإذاعة المدرسية 🎙️" : "استوديو الأغلفة التحريرية والصحفية 📰"}
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black border flex items-center gap-1 ${
                  isPodcast ? "bg-purple-500/20 text-purple-300 border-purple-400/40" : "bg-[#f8ca14]/20 text-[#f8ca14] border-[#f8ca14]/40"
                }`}>
                  <Clock size={11} /> {isPodcast ? "هوية الاستوديو الصوتي والأسطوانة الذهبية" : "المخطوطة الملكية • سلسلة إثراء المعرفة"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal">
                {isPodcast 
                  ? "أسطوانة ذهبية ثلاثية الأبعاد + موجات صوتية + شريط مشغل صوتي ليزري + هوية صوتية" 
                  : "إطار المخطوطة الملكية + نقش تضاريس المدينة + عدد كلمات تلقائي"}
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab("livingMedina")}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition ${
                activeTab === "livingMedina"
                  ? "bg-[#f8ca14] text-black shadow-md shadow-[#f8ca14]/20"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              {isPodcast ? <Mic size={15} /> : <Sun size={15} />}
              <span>{isPodcast ? "🎙️ مصمم غلاف البودكاست" : "🏛️ مصمم غلاف المقال الصحفي"}</span>
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
              <span>📸 الألبوم الفوتوغرافي ({MASTER_PHOTO_CATALOG_500.length})</span>
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
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition"
              title="رفع صورة من جهازك"
            >
              <UploadCloud size={15} />
              <span>📤 رفع صورة من جهازك</span>
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

        {/* Main Studio Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* ================= TAB 1: LIVING MEDINA ATMOSPHERE STUDIO ================= */}
          {activeTab === "livingMedina" && (
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {/* Left Control Sidebar */}
              <div className="w-full lg:w-[440px] shrink-0 border-l border-white/10 bg-black/40 p-5 overflow-y-auto space-y-4">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-[#f8ca14]" />
                    {isPodcast ? "تخصيص هوية الاستوديو الصوتي للبودكاست" : "تخصيص هوية المخطوطة ونقش الخلفية"}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isPodcast 
                      ? "خصص مدة الحلقة، اسم المقدم، والموضوع مع أجواء المدينة المنورة."
                      : "اختر نقش خلفية المقال، شارة التميز، وأوقات المدينة المنورة."}
                  </p>
                </div>

                {/* ARTICLE BACKGROUND THEME SELECTOR (28 PRESETS + CATEGORIES + DIRECT UPLOAD) */}
                {!isPodcast && (
                  <div className="space-y-3 bg-gradient-to-br from-[#f8ca14]/15 via-black/40 to-transparent p-4 rounded-2xl border border-[#f8ca14]/30 shadow-lg">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-black text-yellow-400 flex items-center gap-1.5">
                        <Sparkles size={14} className="text-[#f8ca14]" />
                        <span>خلفيات سينمائية فاخرة (+٢٨ مشهد + رفع خاص):</span>
                      </Label>
                      <span className="text-[10px] font-black text-black bg-[#f8ca14] px-2.5 py-0.5 rounded-full shadow-sm">
                        ٢٨ مشهد + رفع حر
                      </span>
                    </div>

                    {/* Direct Custom Image Upload & Media Library Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="file"
                        ref={bgUploadRef}
                        onChange={handleBgUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => bgUploadRef.current?.click()}
                        className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-yellow-500/40 hover:bg-yellow-500/30 text-yellow-300 font-black text-[11px] flex items-center justify-center gap-1.5 transition shadow-sm"
                      >
                        <Upload size={13} className="text-yellow-400" />
                        <span>رفع صورة من جهازك 📤</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab("gallery")}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 font-bold text-[11px] flex items-center justify-center gap-1.5 transition"
                      >
                        <ImageIcon size={13} className="text-amber-400" />
                        <span>أرشيف الصور (+500) 🖼️</span>
                      </button>
                    </div>

                    {/* Active Custom Image Status Banner */}
                    {customBgImage && (
                      <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-emerald-300 font-bold">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[11px]">صورتك المخصصة مفعلة الآن كخلفية سينمائية</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCustomBgImage(null)}
                          className="text-[10px] font-black text-rose-300 hover:text-rose-200 underline"
                        >
                          استعادة المشاهد
                        </button>
                      </div>
                    )}

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                      {[
                        { id: "all", label: "الكل (٢٨)" },
                        { id: "medina", label: "🏛️ المدينة والتراث (٦)" },
                        { id: "library", label: "📚 المكتبات والبحوث (٥)" },
                        { id: "tech", label: "💡 التقنية والمستقبل (٦)" },
                        { id: "education", label: "🎓 التعليم والقيادة (٥)" },
                        { id: "nature", label: "🌿 الطبيعة والاستدامة (٤)" },
                        { id: "arts", label: "🎨 الفنون والإبداع (٣)" },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedBgCategory(cat.id as any)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black shrink-0 transition ${
                            selectedBgCategory === cat.id
                              ? "bg-[#f8ca14] text-black shadow-sm"
                              : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    {/* Themed Presets Grid (28 items) */}
                    <div className="grid grid-cols-2 gap-1.5 max-h-[260px] overflow-y-auto p-1 rounded-xl bg-black/40 border border-white/5">
                      {(Object.keys(ARTICLE_TEXTURES) as ArticleTextureType[])
                        .filter((key) => selectedBgCategory === "all" || ARTICLE_TEXTURES[key].category === selectedBgCategory)
                        .map((key) => {
                          const tex = ARTICLE_TEXTURES[key];
                          const IconComp = tex.icon;
                          const isSelected = articleTexture === key && !customBgImage;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => {
                                setArticleTexture(key);
                                setCustomBgImage(null);
                              }}
                              className={`p-2 rounded-xl text-xs transition border text-right flex flex-col justify-between ${
                                isSelected
                                  ? "bg-[#f8ca14] text-black border-[#f8ca14] font-black shadow-lg shadow-[#f8ca14]/25 ring-2 ring-yellow-400/50"
                                  : "bg-black/60 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              <div className="flex items-center justify-between w-full mb-1">
                                <div className={`w-5 h-5 rounded-md flex items-center justify-center ${isSelected ? "bg-black text-yellow-400" : "bg-white/10 text-yellow-400"}`}>
                                  <IconComp size={11} />
                                </div>
                                <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded ${isSelected ? "bg-black/20 text-black" : "bg-white/10 text-slate-300"}`}>
                                  {tex.badge}
                                </span>
                              </div>
                              <span className="text-[10px] font-black leading-tight line-clamp-1">{tex.name}</span>
                              <span className={`text-[8px] leading-tight line-clamp-1 mt-0.5 ${isSelected ? "text-black/80 font-bold" : "text-slate-400"}`}>
                                {tex.description}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Medina Atmosphere Mode Switcher */}
                <div className="space-y-2">
                  <Label className="text-xs font-black text-slate-200">اختر وقت وجو المدينة المنورة:</Label>
                  
                  {/* Live Auto Mode Button */}
                  <button
                    type="button"
                    onClick={() => setMedinaMode("auto")}
                    className={`w-full p-2.5 rounded-2xl text-xs transition-all text-right flex items-center justify-between border ${
                      medinaMode === "auto"
                        ? "bg-gradient-to-r from-[#f8ca14] to-amber-500 text-black border-yellow-400 font-black shadow-lg shadow-yellow-400/20"
                        : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock size={16} className={medinaMode === "auto" ? "text-black animate-pulse" : "text-yellow-400"} />
                      <div>
                        <div className="font-black text-xs">⚡ الوضع الحي التلقائي ({liveMedinaTimeStr})</div>
                        <div className={`text-[10px] ${medinaMode === "auto" ? "text-black/80" : "text-slate-400"}`}>
                          تطبيق جو المدينة المنورة الفعلي لحظة التصفح
                        </div>
                      </div>
                    </div>
                    {medinaMode === "auto" && <Check size={16} className="stroke-[3] shrink-0 mr-2" />}
                  </button>

                  {/* Manual Mood Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {(Object.keys(MEDINA_ATMOSPHERES) as Array<keyof typeof MEDINA_ATMOSPHERES>).map((key) => {
                      const atm = MEDINA_ATMOSPHERES[key];
                      const IconComp = atm.icon;
                      const isSelected = medinaMode === key;
                      return (
                        <button
                          key={atm.id}
                          type="button"
                          onClick={() => setMedinaMode(key)}
                          className={`p-2.5 rounded-xl text-xs transition-all text-right flex flex-col justify-between border ${
                            isSelected
                              ? "bg-[#f8ca14] text-black border-[#f8ca14] font-black shadow-md shadow-[#f8ca14]/20"
                              : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-1">
                            <IconComp size={16} className={isSelected ? "text-black" : "text-yellow-400"} />
                            <span className={`text-[9px] font-bold ${isSelected ? "text-black/70" : "text-slate-400"}`}>{atm.timeRange}</span>
                          </div>
                          <div className="font-black text-[11px] leading-tight">{atm.name}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Text Customization Inputs */}
                <div className="space-y-3.5 pt-2 border-t border-white/10">
                  <div className="space-y-1">
                    <Label className="text-xs font-black text-slate-200">
                      {isPodcast ? "عنوان حلقة البودكاست:" : "عنوان المقال أو البحث العلمي:"}
                    </Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="اكتب العنوان هنا..."
                      className="text-xs h-10 rounded-xl bg-white/5 border-white/10 text-white font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs font-black text-slate-200">
                        {isPodcast ? "صوت وتقديم:" : "الكاتب / الباحث:"}
                      </Label>
                      <Input
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="اسم الكاتب أو المقدم..."
                        className="text-xs h-9 rounded-xl bg-white/5 border-white/10 text-white font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-black text-slate-200">التصنيف / الموضوع:</Label>
                      <Input
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder={isPodcast ? "إذاعة مدرسية" : "مقال تربوي"}
                        className="text-xs h-9 rounded-xl bg-white/5 border-white/10 text-white font-bold"
                      />
                    </div>
                  </div>

                  {/* Differentiated Specific Inputs */}
                  {isPodcast ? (
                    <div className="space-y-1 bg-purple-500/10 p-2.5 rounded-xl border border-purple-500/20">
                      <Label className="text-xs font-black text-purple-300">مدة الحلقة أو التسجيل الصوتي:</Label>
                      <Input
                        value={podcastDuration}
                        onChange={(e) => setPodcastDuration(e.target.value)}
                        placeholder="مثال: ١٨:٤٥"
                        className="text-xs h-8 rounded-lg bg-black/40 border-white/10 text-white font-bold"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1.5 bg-[#f8ca14]/10 p-3 rounded-2xl border border-[#f8ca14]/25">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-black text-yellow-300 flex items-center gap-1.5">
                          <Bookmark size={13} />
                          <span>توثيق حجم المقال الرسمي:</span>
                        </Label>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md border border-emerald-400/20">
                          ✓ محسوب تلقائياً
                        </span>
                      </div>
                      <div className="flex items-center justify-between bg-black/40 px-3 py-2 rounded-xl border border-white/10 text-xs">
                        <span className="text-slate-300 font-bold">العدد الفعلي المعتمد:</span>
                        <span className="font-black text-[#f8ca14] font-mono text-sm">
                          {(articleWordCount && articleWordCount > 0 ? articleWordCount : 520).toLocaleString("ar-SA")} كلمة
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        يتم استخراج العدد تلقائياً من نص المقال الحقيقي لمنع التعديل اليدوي وضمان الدقة الأكاديمية.
                      </p>
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label className="text-xs font-black text-slate-200">
                      {isPodcast ? "مقتطف صوتي أو فكرة الحلقة:" : "اقتباس رئيسي من المقال:"}
                    </Label>
                    <Input
                      value={quote}
                      onChange={(e) => setQuote(e.target.value)}
                      placeholder={isPodcast ? "مثال: حوار شيق حول مستقبل الذكاء الاصطناعي مع ضيفنا..." : "مثال: رحلة استكشافية ملهمة في آفاق المعرفة..."}
                      className="text-xs h-9 rounded-xl bg-white/5 border-white/10 text-slate-300 font-medium"
                    />
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <Label className="text-xs font-black text-slate-200">اختر المقاس المناسب لك (متاح لكل الأقسام):</Label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setAspectRatio("wide")}
                        className={`p-2 rounded-xl text-xs font-bold border transition ${
                          aspectRatio === "wide"
                            ? "bg-[#f8ca14] text-black border-[#f8ca14] font-black shadow-md shadow-[#f8ca14]/20"
                            : "border-white/10 text-slate-300 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        عريض (16:9)
                      </button>
                      <button
                        type="button"
                        onClick={() => setAspectRatio("square")}
                        className={`p-2 rounded-xl text-xs font-bold border transition ${
                          aspectRatio === "square"
                            ? "bg-[#f8ca14] text-black border-[#f8ca14] font-black shadow-md shadow-[#f8ca14]/20"
                            : "border-white/10 text-slate-300 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        مربع (1:1)
                      </button>
                      <button
                        type="button"
                        onClick={() => setAspectRatio("tall")}
                        className={`p-2 rounded-xl text-xs font-bold border transition ${
                          aspectRatio === "tall"
                            ? "bg-[#f8ca14] text-black border-[#f8ca14] font-black shadow-md shadow-[#f8ca14]/20"
                            : "border-white/10 text-slate-300 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        طولي (3:4)
                      </button>
                    </div>
                  </div>

                  {/* Smart Layout & Visibility Controls (Feature 6 & Fine-Tuning) */}
                  {!isPodcast && (
                    <div className="space-y-3 bg-black/40 p-3.5 rounded-2xl border border-white/10 mt-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-black text-slate-200 flex items-center gap-1.5">
                          <Sparkles size={13} className="text-[#f8ca14]" />
                          <span>تخصيص المحاذاة والكبسولات والإطار:</span>
                        </Label>
                      </div>

                      {/* Text Alignment Selector */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400">محاذاة نصوص المقال:</span>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setTextAlign("right")}
                            className={`py-1.5 rounded-xl text-xs font-bold border transition ${
                              textAlign === "right"
                                ? "bg-[#f8ca14] text-black border-[#f8ca14] font-black shadow-sm"
                                : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                            }`}
                          >
                            يمين كلاسيكي 📰
                          </button>
                          <button
                            type="button"
                            onClick={() => setTextAlign("center")}
                            className={`py-1.5 rounded-xl text-xs font-bold border transition ${
                              textAlign === "center"
                                ? "bg-[#f8ca14] text-black border-[#f8ca14] font-black shadow-sm"
                                : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                            }`}
                          >
                            وسط سينمائي 🎬
                          </button>
                        </div>
                      </div>

                      {/* Toggle Switches */}
                      <div className="grid grid-cols-2 gap-1.5 text-xs pt-1 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => setShowCategoryPill(!showCategoryPill)}
                          className={`px-2 py-1.5 rounded-xl border text-[10px] font-bold flex items-center justify-between transition ${
                            showCategoryPill ? "bg-white/10 text-white border-white/20" : "bg-black/30 text-slate-500 border-white/5 line-through"
                          }`}
                        >
                          <span>شارة التصنيف 🏷️</span>
                          <span className={`w-2 h-2 rounded-full ${showCategoryPill ? "bg-emerald-400" : "bg-slate-600"}`} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowGoldFrame(!showGoldFrame)}
                          className={`px-2 py-1.5 rounded-xl border text-[10px] font-bold flex items-center justify-between transition ${
                            showGoldFrame ? "bg-white/10 text-white border-white/20" : "bg-black/30 text-slate-500 border-white/5 line-through"
                          }`}
                        >
                          <span>الإطار المذهب 🖼️</span>
                          <span className={`w-2 h-2 rounded-full ${showGoldFrame ? "bg-emerald-400" : "bg-slate-600"}`} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowQuote(!showQuote)}
                          className={`px-2 py-1.5 rounded-xl border text-[10px] font-bold flex items-center justify-between transition ${
                            showQuote ? "bg-white/10 text-white border-white/20" : "bg-black/30 text-slate-500 border-white/5 line-through"
                          }`}
                        >
                          <span>صندوق الاقتباس ❝</span>
                          <span className={`w-2 h-2 rounded-full ${showQuote ? "bg-emerald-400" : "bg-slate-600"}`} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowWordCountCapsule(!showWordCountCapsule)}
                          className={`px-2 py-1.5 rounded-xl border text-[10px] font-bold flex items-center justify-between transition ${
                            showWordCountCapsule ? "bg-white/10 text-white border-white/20" : "bg-black/30 text-slate-500 border-white/5 line-through"
                          }`}
                        >
                          <span>كبسولة الكلمات 📖</span>
                          <span className={`w-2 h-2 rounded-full ${showWordCountCapsule ? "bg-emerald-400" : "bg-slate-600"}`} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowHeritageCapsule(!showHeritageCapsule)}
                          className={`px-2 py-1.5 rounded-xl border text-[10px] font-bold flex items-center justify-between transition col-span-2 ${
                            showHeritageCapsule ? "bg-white/10 text-white border-white/20" : "bg-black/30 text-slate-500 border-white/5 line-through"
                          }`}
                        >
                          <span>كبسولة التوثيق الرسمي (المدينة المنورة ١٤٤٦هـ) 🏛️</span>
                          <span className={`w-2 h-2 rounded-full ${showHeritageCapsule ? "bg-emerald-400" : "bg-slate-600"}`} />
                        </button>
                      </div>

                      {/* Vignette Intensity Selector */}
                      <div className="space-y-1 pt-1 border-t border-white/5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10.5px] font-bold text-slate-400">كثافة تباين وتعتيم الخلفية:</span>
                          <span className="text-[10px] font-black text-amber-400">
                            {vignetteIntensity === "soft" ? "تعتيم ناعم (35%)" : vignetteIntensity === "deep" ? "سينمائي داكن (80%)" : "تعتيم متوازن (60%)"}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          {[
                            { id: "soft", label: "ناعم" },
                            { id: "balanced", label: "متوازن" },
                            { id: "deep", label: "داكن" },
                          ].map((v) => (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => setVignetteIntensity(v.id as any)}
                              className={`py-1 rounded-lg text-[10px] font-black transition ${
                                vignetteIntensity === v.id
                                  ? "bg-[#f8ca14] text-black shadow-sm"
                                  : "bg-white/5 text-slate-300 hover:bg-white/10"
                              }`}
                            >
                              {v.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 1-Click Export Action */}
                <div className="pt-3 border-t border-white/10">
                  <button
                    type="button"
                    disabled={isExporting}
                    onClick={handleExportLivingCard}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#f8ca14] via-amber-400 to-yellow-500 hover:opacity-90 text-black font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-yellow-400/25 transition transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>جاري تصدير الغلاف بدقة 4K...</span>
                      </>
                    ) : (
                      <>
                        <Check size={18} className="stroke-[3]" />
                        <span>اعتماد وتطبيق هذا الغلاف الفاخر ✨</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Live Canvas Preview with Interactive Holographic Tilt */}
              <div 
                className="flex-1 flex flex-col items-center justify-center bg-[#050505] p-6 sm:p-10 overflow-y-auto select-none"
                onMouseMove={handleMouseMove}
              >
                <div className="text-center mb-4 flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-300 bg-white/10 px-3.5 py-1 rounded-full border border-white/15 flex items-center gap-1.5 shadow">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    {isPodcast 
                      ? "🎙️ معاينة غلاف البودكاست (أسطوانة ذهبية + شريط ليزري)" 
                      : `📰 معاينة غلاف المقال (الترويسة العريضة • ${ARTICLE_TEXTURES[articleTexture]?.name || "المدينة المنورة"})`}
                  </span>
                </div>

                {/* The Rendered Canvas Element */}
                <div
                  id="aqeeq-living-medina-canvas"
                  className={`relative w-full ${
                    aspectRatio === "wide"
                      ? "max-w-[820px] aspect-[16/9]"
                      : aspectRatio === "square"
                      ? "max-w-[520px] aspect-square"
                      : "max-w-[440px] aspect-[3/4]"
                  } rounded-3xl border border-white/20 bg-gradient-to-br ${activeAtmosphere.bgGradient} ${
                    aspectRatio === "tall" ? "p-6 sm:p-8" : "p-8 sm:p-10"
                  } flex flex-col justify-between shadow-2xl overflow-hidden group transition-colors duration-700`}
                  style={{
                    boxShadow: `0 30px 80px rgba(0,0,0,0.9), 0 0 40px ${activeAtmosphere.archGlow}, inset 0 0 0 1px rgba(255,255,255,0.15)`
                  }}
                >
                  {/* Atmospheric Light Shimmer */}
                  <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-700"
                    style={{ backgroundImage: activeAtmosphere.pattern }}
                  />

                  {/* ARTICLE EXCLUSIVE CINEMATIC PHOTOGRAPHIC THEME OVERLAYS */}
                  {!isPodcast && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <img
                        src={customBgImage || ARTICLE_TEXTURES[articleTexture]?.bgImage || ARTICLE_TEXTURES.cinematic_medina.bgImage}
                        alt=""
                        className={`w-full h-full object-cover scale-105 filter ${vignetteConfig.imgFilter} transition-all duration-700`}
                      />
                      {/* Deep Cinematic Gradients with Dynamic Intensity */}
                      <div className={`absolute inset-0 bg-gradient-to-t ${vignetteConfig.gradT}`} />
                      <div className={`absolute inset-0 bg-gradient-to-r ${vignetteConfig.gradR}`} />
                    </div>
                  )}

                  {/* Interactive Dynamic Foil Reflection (Follows Mouse) */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-40 mix-blend-color-dodge transition-transform duration-100"
                    style={{
                      background: `radial-gradient(circle 350px at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.25), transparent 70%)`
                    }}
                  />

                  {/* 1px Royal Editorial Inner Frame */}
                  {!isPodcast && showGoldFrame && (
                    <div className="absolute inset-3 sm:inset-4 rounded-2xl sm:rounded-3xl border border-[#f8ca14]/25 pointer-events-none z-20 shadow-[inset_0_0_25px_rgba(248,202,20,0.05)]" />
                  )}

                  {/* ================= PODCAST LAYOUT ================= */}
                  {isPodcast ? (
                    <>
                      {/* Concentric Gold Vinyl Grooves in Background */}
                      <div 
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] rounded-full border border-[#f8ca14]/10 pointer-events-none opacity-30"
                        style={{
                          boxShadow: `inset 0 0 0 30px rgba(248,202,20,0.03), inset 0 0 0 60px rgba(248,202,20,0.03), inset 0 0 0 90px rgba(248,202,20,0.03), inset 0 0 0 120px rgba(248,202,20,0.03)`
                        }}
                      />
                      <div className="absolute left-8 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-2 border-dashed border-[#f8ca14]/20 opacity-20 pointer-events-none animate-spin" style={{ animationDuration: '40s' }} />

                      {/* Top Bar */}
                      <div className="relative z-10 flex items-start justify-between border-b border-white/15 pb-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black tracking-widest uppercase" style={{ color: activeAtmosphere.accentColor }}>
                              بودكاستات العقيق
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                            <span className="text-[10px] font-bold text-white/80">المدينة المنورة</span>
                          </div>
                          <span className={`text-[10px] font-medium ${activeAtmosphere.subtextColor}`}>
                            {activeAtmosphere.name} • {liveMedinaTimeStr}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="px-3 py-1 rounded-full border text-[11px] font-black bg-purple-500/20 text-purple-300 border-purple-400/40 shadow-sm flex items-center gap-1">
                            <Headphones size={12} /> {category || "بودكاست العقيق"}
                          </span>
                        </div>
                      </div>

                      {/* Center Title & Content */}
                      <div className="relative z-10 my-auto py-6 flex flex-col gap-4">
                        <div className="flex items-center gap-1.5 opacity-90 mb-1">
                          {[4, 12, 22, 10, 32, 18, 38, 26, 16, 30, 20, 8, 28, 18, 10, 24, 14, 6, 18, 10, 4].map((h, i) => (
                            <div 
                              key={i} 
                              className="w-1.5 rounded-full shadow-sm" 
                              style={{ 
                                height: `${h}px`, 
                                backgroundColor: activeAtmosphere.accentColor 
                              }} 
                            />
                          ))}
                          <span className="text-[10px] font-bold text-white/70 mr-2 bg-black/40 px-2 py-0.5 rounded-md border border-white/10">
                            STEREO 48kHz HQ
                          </span>
                        </div>

                        <h1
                          className={`${titleFontSizeClass} font-black leading-[1.25] tracking-tight text-white drop-shadow-2xl line-clamp-3`}
                          style={{ textShadow: "0 4px 20px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.9)" }}
                        >
                          {title || "عنوان حلقة البودكاست"}
                        </h1>

                        {quote && (
                          <p
                            className="text-xs sm:text-sm font-medium italic border-r-2 pr-3 leading-relaxed text-white/90 drop-shadow line-clamp-2"
                            style={{ borderColor: activeAtmosphere.accentColor }}
                          >
                            "{quote}"
                          </p>
                        )}

                        <div className="flex items-center gap-3 pt-2">
                          <span className="text-[10px] font-mono text-white/60">00:00</span>
                          <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden relative">
                            <div className="h-full w-1/3 rounded-full" style={{ backgroundColor: activeAtmosphere.accentColor }} />
                          </div>
                          <span className="text-[10px] font-mono text-white/80 font-bold">{podcastDuration}</span>
                        </div>
                      </div>

                      {/* Bottom Bar */}
                      <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/15">
                        <div className="flex items-center gap-3">
                          {author ? (
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shadow-lg border border-white/20 text-black"
                                style={{ backgroundColor: activeAtmosphere.accentColor }}
                              >
                                <Mic size={14} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-white/60">صوت وتقديم</span>
                                <span className="text-xs font-black text-white">{author}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: activeAtmosphere.accentColor }} />
                              <span className="text-xs font-bold text-white/80">بودكاستات العقيق • إصدار صوتي رسمي</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 opacity-80">
                          <Radio size={15} className="text-white" />
                          <span className="text-[10px] font-black tracking-widest uppercase text-white">AQEEQ PODCASTS</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* ================= ARTICLE: PREMIER GRID MASTHEAD (الترويسة المطورة الفاخرة المتكيفة) ================= */
                    <div className="relative z-10 w-full h-full flex flex-col justify-between">
                      {/* Mega Top Masthead Banner */}
                      <div className={`bg-black/60 backdrop-blur-xl ${aspectRatio === "tall" ? "p-3" : "p-3.5 sm:p-4"} rounded-2xl border border-white/20 shadow-xl flex items-center justify-between`}>
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <div
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-black text-sm shadow-lg border border-white/25 text-black shrink-0"
                            style={{ backgroundColor: activeAtmosphere.accentColor }}
                          >
                            <BookOpen size={16} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-xs sm:text-sm text-white tracking-wide">
                              سلسلة إثراء المعرفة
                            </span>
                            <span className="text-[8.5px] sm:text-[9.5px] font-medium text-white/60">
                              منبر الفكر والبحث العلمي • مدارس العقيق الأهلية والدولية
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Center Content with High Contrast Typography & Elegant Quote Plaque */}
                      <div className={`my-auto ${aspectRatio === "tall" ? "py-3 space-y-2.5" : "py-4 sm:py-5 space-y-3.5"}`}>
                        {/* Category Eyebrow Pill */}
                        {showCategoryPill && category && (
                          <div className={`flex items-center ${textAlign === "center" ? "justify-center" : "justify-start"} gap-2`}>
                            <span 
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black tracking-wide border shadow-md backdrop-blur-md"
                              style={{
                                backgroundColor: "rgba(0,0,0,0.65)",
                                borderColor: `${activeAtmosphere.accentColor}60`,
                                color: activeAtmosphere.accentColor,
                              }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: activeAtmosphere.accentColor }} />
                              {category}
                            </span>
                          </div>
                        )}

                        <div className={`space-y-2 ${textAlign === "center" ? "flex flex-col items-center" : ""}`}>
                          <div className="w-10 sm:w-12 h-1 rounded-full" style={{ backgroundColor: activeAtmosphere.accentColor }} />
                          <h1
                            className={`${titleFontSizeClass} font-black leading-[1.25] text-white drop-shadow-2xl tracking-tight line-clamp-3 ${
                              textAlign === "center" ? "text-center" : "text-right"
                            }`}
                            style={{ textShadow: "0 4px 25px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.95)" }}
                          >
                            {title || "عنوان المقال أو البحث العلمي"}
                          </h1>
                        </div>

                        {showQuote && quote && (
                          <div 
                            className={`${aspectRatio === "tall" ? "p-2.5 sm:p-3" : "p-3 sm:p-3.5"} rounded-2xl bg-black/45 backdrop-blur-md border border-white/15 flex items-start gap-2.5 sm:gap-3 shadow-lg ${
                              textAlign === "center" ? "text-center justify-center" : "text-right"
                            }`}
                            style={{ 
                              borderRight: textAlign === "right" ? `3px solid ${activeAtmosphere.accentColor}` : "1px solid rgba(255,255,255,0.15)",
                              borderLeft: textAlign === "center" ? `1px solid rgba(255,255,255,0.15)` : undefined
                            }}
                          >
                            <span className="text-xl sm:text-2xl leading-none font-serif shrink-0 opacity-80" style={{ color: activeAtmosphere.accentColor }}>❝</span>
                            <p className="text-[11px] sm:text-xs md:text-sm font-medium italic leading-relaxed text-white/95 drop-shadow line-clamp-2">
                              {quote}
                            </p>
                            {textAlign === "center" && (
                              <span className="text-xl sm:text-2xl leading-none font-serif shrink-0 opacity-80 rotate-180" style={{ color: activeAtmosphere.accentColor }}>❝</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Bottom Floating Data Capsules with Adaptive Grid */}
                      <div className={`grid ${
                        aspectRatio === "tall" 
                          ? "grid-cols-1 sm:grid-cols-2 gap-1.5" 
                          : aspectRatio === "square"
                          ? (showWordCountCapsule && showHeritageCapsule ? "grid-cols-2 sm:grid-cols-3 gap-2" : "grid-cols-2 gap-2")
                          : "grid-cols-1 sm:grid-cols-3 gap-2"
                      } text-xs`}>
                        {/* Capsule 1: Author */}
                        <div className="bg-black/60 backdrop-blur-xl px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl border border-white/15 border-t-[#f8ca14]/40 flex items-center gap-2.5 shadow-lg">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-black font-black text-[10px] shrink-0 shadow-sm"
                            style={{ backgroundColor: activeAtmosphere.accentColor }}
                          >
                            <Feather size={12} />
                          </div>
                          <div className="flex flex-col truncate">
                            <span className="text-[7.5px] sm:text-[8px] font-bold text-white/60">الباحث / الكاتب</span>
                            <span className="font-black text-white text-[10.5px] sm:text-[11px] truncate">{author || "باحث العقيق"}</span>
                          </div>
                        </div>

                        {/* Capsule 2: Word Count & Category */}
                        {showWordCountCapsule && (
                          <div className="bg-black/60 backdrop-blur-xl px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl border border-white/15 border-t-[#f8ca14]/40 flex items-center gap-2.5 shadow-lg">
                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[#f8ca14] shrink-0 border border-[#f8ca14]/30">
                              <Bookmark size={12} />
                            </div>
                            <div className="flex flex-col truncate">
                              <span className="text-[7.5px] sm:text-[8px] font-bold text-white/60">حجم المقال المعتمد</span>
                              <span className="font-black text-white text-[10.5px] sm:text-[11px]">
                                📖 {(articleWordCount && articleWordCount > 0 ? articleWordCount : 520).toLocaleString("ar-SA")} كلمة
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Capsule 3: City & Academic Year */}
                        {showHeritageCapsule && (
                          <div className={`bg-black/60 backdrop-blur-xl px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl border border-white/15 border-t-[#f8ca14]/40 flex items-center justify-between shadow-lg ${
                            aspectRatio === "tall" && showWordCountCapsule ? "col-span-2 sm:col-span-1" : ""
                          }`}>
                            <div className="flex flex-col">
                              <span className="text-[7.5px] sm:text-[8px] font-bold text-white/60">التوثيق الرسمي</span>
                              <span className="font-black text-white text-[9.5px] sm:text-[10px]">المدينة المنورة ١٤٤٦هـ</span>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#f8ca14]">AQEEQ</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: CURATED PHOTO CATALOG ================= */}
          {activeTab === "gallery" && (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              <div className="w-full md:w-[340px] lg:w-[360px] shrink-0 border-l border-white/10 bg-black/40 p-4 overflow-y-auto space-y-4">
                <div>
                  <Label className="text-xs font-black text-slate-300 mb-1.5 block">بحث سريع في الأرشيف (+500 صورة)</Label>
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
                  <div className="flex flex-col gap-1 max-h-[38vh] overflow-y-auto pr-1">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setCatalogPage(1);
                        }}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition text-right ${
                          selectedCategory === cat.id
                            ? "bg-[#f8ca14] text-black font-black shadow-md shadow-[#f8ca14]/20"
                            : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <span>{cat.label}</span>
                        {selectedCategory === cat.id && <Check size={14} className="stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col overflow-hidden p-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300">
                      معروض الآن: <strong className="text-[#f8ca14]">{filteredCatalogPhotos.length} صورة</strong>
                    </span>
                  </div>

                  {totalCatalogPages > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={catalogPage <= 1}
                        onClick={() => setCatalogPage((p) => Math.max(1, p - 1))}
                        className="grid h-8 w-8 place-items-center rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-30 hover:bg-white/10 transition"
                      >
                        <ChevronRight size={16} />
                      </button>
                      <span className="px-2 text-xs font-bold text-slate-300">
                        {catalogPage} / {totalCatalogPages}
                      </span>
                      <button
                        type="button"
                        disabled={catalogPage >= totalCatalogPages}
                        onClick={() => setCatalogPage((p) => Math.min(totalCatalogPages, p + 1))}
                        className="grid h-8 w-8 place-items-center rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-30 hover:bg-white/10 transition"
                      >
                        <ChevronLeft size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto pt-4 pr-1">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 pb-6">
                    {paginatedCatalogPhotos.map((photo) => {
                      const aspectClass =
                        photo.orientation === "tall"
                          ? "aspect-[3/4]"
                          : photo.orientation === "square"
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
                            src={photo.url}
                            alt={photo.title}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent p-2.5 flex flex-col justify-end">
                            <span className="text-[11px] font-bold text-white line-clamp-1">{photo.title}</span>
                            <span className="text-[10px] text-[#f8ca14] font-medium">{photo.category}</span>
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
                      <img src={selectedPhotoUrl} alt="Selected" className="h-10 w-14 object-cover rounded-lg border border-white/20" />
                      <span className="text-xs text-slate-300 font-bold">تم تحديد الصورة: اختر طريقة استخدامها</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCustomBgImage(selectedPhotoUrl);
                          setActiveTab("livingMedina");
                          toast.success("تم نقل وتطبيق الصورة كخلفية لترويسة المقال الفاخرة! ✨");
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#f8ca14] hover:from-amber-400 hover:to-yellow-400 text-black font-black px-4 py-2.5 text-xs transition shadow-lg shadow-yellow-500/20"
                      >
                        <Sparkles size={14} />
                        <span>دمج في ترويسة المقال 📰</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApply(selectedPhotoUrl)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 text-xs transition border border-white/20"
                      >
                        <Check size={14} />
                        <span>اعتماد كغلاف مستقل</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 3: GLOBAL OPEN SEARCH ================= */}
          {activeTab === "globalSearch" && (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              <div className="w-full md:w-[340px] lg:w-[360px] shrink-0 border-l border-white/10 bg-black/40 p-4 overflow-y-auto space-y-4">
                <form onSubmit={handleRunGlobalSearch} className="space-y-3">
                  <div>
                    <Label className="text-xs font-black text-slate-300 mb-1.5 block">كلمة البحث في الأرشيف العالمي</Label>
                    <div className="flex gap-2">
                      <Input
                        value={globalQuery}
                        onChange={(e) => setGlobalQuery(e.target.value)}
                        placeholder="اكتب باللغة العربية أو الإنجليزية..."
                        className="text-xs h-10 rounded-xl bg-white/5 border-white/10 text-white font-bold"
                      />
                      <button
                        type="submit"
                        disabled={isGlobalSearching}
                        className="shrink-0 px-4 h-10 rounded-xl bg-[#f8ca14] hover:bg-[#e5ba10] text-black font-black text-xs transition flex items-center gap-1"
                      >
                        {isGlobalSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                        <span>بحث</span>
                      </button>
                    </div>
                  </div>
                </form>

                <div>
                  <Label className="text-xs font-black text-slate-300 mb-2 block">📐 المقاس المطلوب</Label>
                  <div className="grid grid-cols-3 gap-1.5">
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
                      <span>عريض</span>
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
                      <span>طولي</span>
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
                      <span>مربع</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col overflow-hidden p-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
                  <span className="text-xs font-bold text-slate-300">
                    نتائج الأرشيف المفتوح لكلمة: <strong className="text-[#f8ca14]">"{activeSearchTerm}"</strong>
                  </span>
                  <span className="text-[11px] text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                    {combinedSearchResults.length} نتيجة متوفرة
                  </span>
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
                        <p className="text-sm font-bold">اكتب كلمة البحث واضغط "بحث" لاستعراض الصور</p>
                      </div>
                    </div>
                  )}
                </div>

                {selectedPhotoUrl && (
                  <div className="shrink-0 pt-3 border-t border-white/10 flex items-center justify-between gap-4 bg-black/60 p-3 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <img src={selectedPhotoUrl} alt="Selected" className="h-10 w-14 object-cover rounded-lg border border-white/20" />
                      <span className="text-xs text-slate-300 font-bold">تم تحديد الصورة: اختر طريقة استخدامها</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCustomBgImage(selectedPhotoUrl);
                          setActiveTab("livingMedina");
                          toast.success("تم نقل وتطبيق الصورة كخلفية لترويسة المقال الفاخرة! ✨");
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#f8ca14] hover:from-amber-400 hover:to-yellow-400 text-black font-black px-4 py-2.5 text-xs transition shadow-lg shadow-yellow-500/20"
                      >
                        <Sparkles size={14} />
                        <span>دمج في ترويسة المقال 📰</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApply(selectedPhotoUrl)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 text-xs transition border border-white/20"
                      >
                        <Check size={14} />
                        <span>اعتماد كغلاف مستقل</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
