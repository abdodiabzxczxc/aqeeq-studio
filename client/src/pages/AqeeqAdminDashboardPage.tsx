import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { AqeeqUniversalMediaPickerModal, MediaPickerItem } from "@/components/AqeeqUniversalMediaPickerModal";
import { AqeeqAiYearbookGenerator } from "@/components/AqeeqAiYearbookGenerator";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  LayoutDashboard,
  GraduationCap,
  Layers,
  Megaphone,
  Shield,
  Palette,
  Users,
  Eye,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Copy,
  Download,
  Search,
  SlidersHorizontal,
  Flame,
  ArrowUpLeft,
  RefreshCw,
  LogOut,
  Sun,
  Moon,
  Clock,
  Wand2,
  Headphones,
  BookOpen,
  Camera,
  Clapperboard,
  Newspaper,
  Mic,
  FileSpreadsheet,
  Building2,
  Rocket,
  TrendingUp,
  Database,
  Share2,
  MessageCircle,
  FolderSync,
  Instagram,
  Upload,
  QrCode,
  Globe,
  Radio,
  Check,
  Link2,
  Smartphone,
  Laptop,
  CloudDownload,
} from "lucide-react";

import { AqeeqAdminCommandPalette } from "@/components/AqeeqAdminCommandPalette";
import { DEFAULT_WELLINGTON_HOVER_ITEMS } from "@/components/AqeeqInteractiveFxModal";
import { BackdropsManager } from "@/components/BackdropsManager";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function directDriveImage(url: string | null | undefined) {
  if (!url) return null;
  const match = url.match(/\/file\/d\/([A-Za-z0-9_-]+)/);
  return match ? `/api/drive-proxy/${match[1]}` : url;
}

export type TabKey = "radar" | "admissions" | "content" | "campaigns" | "system";
export type AdmissionsSubTab = "inbox" | "fees" | "settings";
export type ContentSubTab = "master" | "articles" | "backdrops";
export type CampaignsSubTab = "broadcast" | "whatsapp" | "radio";
export type SystemSubTab = "theme" | "users" | "campuses" | "marketing" | "backup";

const DEFAULT_ORCHESTRATION = {
  nav: {
    homeLabel: "الرئيسية",
    aboutLabel: "مدارسنا",
    accreditationsLabel: "الاعتمادات",
    admissionsLabel: "القبول والتسجيل",
    journalLabel: "مجلة العقيق",
    albumsLabel: "ألبوم العقيق",
    showcaseLabel: "الأخبار والعروض",
    articlesLabel: "المقالات ✍️",
    podcastLabel: "أثير العقيق 🎙️",
    offersLabel: "العروض والخصومات",
    logoUrl: "/alaqeeq-logo.png",
    phone: "0148131652",
    whatsapp: "966500000000",
    email: "info@alaqeeq.edu.sa",
    locationText: "المدينة المنورة · ممشى الهجرة",
    portalsUrl: "https://alaqeeq.edu.sa/portals",
    jobsUrl: "https://alaqeeq.edu.sa/jobs",
    ctaButtonText: "القبول والتسجيل 🎓",
    ctaButtonUrl: "/admissions",
    hiddenNavKeys: [] as string[],
  },
  emergencyBanner: {
    enabled: false,
    type: "urgent" as "urgent" | "notice" | "celebration",
    text: "",
    linkUrl: "",
    linkText: "",
  },
  interactiveFx: {
    wellingtonHoverItems: DEFAULT_WELLINGTON_HOVER_ITEMS,
  },
  marketingPixels: {
    snapchatPixelId: "",
    metaPixelId: "",
    tiktokPixelId: "",
    googleAnalyticsId: "",
    ogTitle: "مدارس العقيق الأهلية والدولية بالمدينة المنورة",
    ogDescription: "الريادة في التعليم وصناعة المستقبل منذ عام 1994",
    ogImageUrl: "/alaqeeq-logo.png",
    pageShareOverrides: {} as Record<string, {
      mode: "auto" | "custom";
      title?: string;
      description?: string;
      imageUrl?: string;
    }>,
  },
  heroCovers: {
    journalMode: "auto",
    customJournalIssueId: null,
    journalSecondaryIssueId: null,
    journalCustomTitle: "",
    journalCustomSubtitle: "",
    journalCustomDesc: "",
    journalCustomTag: "",
    albumsMode: "auto",
    customAlbumId: null,
    albumsSecondaryAlbumId: null,
    albumsCustomTitle: "",
    albumsCustomSubtitle: "",
    albumsCustomDesc: "",
    albumsCustomTag: "",
    showcaseMode: "auto",
    customShowcasePostId: null,
    showcaseSecondaryPostId: null,
    showcaseCustomTitle: "",
    showcaseCustomSubtitle: "",
    showcaseCustomDesc: "",
    showcaseCustomTag: "",
    articlesMode: "auto",
    customArticleId: null,
    articlesSecondaryArticleId: null,
    articlesCustomTitle: "",
    articlesCustomSubtitle: "",
    articlesCustomDesc: "",
    articlesCustomTag: "",
    podcastsMode: "auto",
    customPodcastId: null,
    podcastsSecondaryPodcastId: null,
    podcastsCustomTitle: "",
    podcastsCustomSubtitle: "",
    podcastsCustomDesc: "",
    podcastsCustomTag: "",
  },
  weeklyBento: {
    enabled: true,
    featuredMode: "auto",
    customPostId: null,
    customTag: "",
    customTitle: "",
    customDescription: "",
    academicBadgeTitle: "وسام التميز الأكاديمي",
    academicBadgeWeek: "الأسبوع 14",
    academicBadgeDesc: "ريادة في مسابقات موهبة والروبوتيكس على مستوى المنطقة",
    heartsCount: 142,
  },
  sections: {
    storiesEnabled: true,
    marqueeEnabled: true,
    marqueeBadge: "آخر الأخبار",
    studioHighlightsEnabled: true,
    studioHighlightsTitle: "جديد مدارس العقيق",
    studioHighlightsDesc: "أحدث ما تم نشره وتوثيقه في مدارس العقيق من فعاليات وإصدارات رقمية.",
    libraryEnabled: true,
    libraryTitle: "استكشف المكتبة",
    libraryDesc: "تصفح متكامل وشامل لجميع أرشيفات البودكاست، المقالات، الألبومات والمجلات المدرسية.",
    pathwaysEnabled: true,
    bentoEnabled: true,
    quoteEnabled: true,
    memoryWallEnabled: true,
    archiveStatsEnabled: true,
    journalSectionTitle: "مجلة العقيق الدورية",
    journalSectionDesc: "تصفح الأعداد الدورية التفاعلية للمجلة واستمتع بتقليب الصفحات ثلاثية الأبعاد.",
    albumsSectionTitle: "ألبوم فعاليات العقيق",
    albumsSectionDesc: "أرشيف حي لجميع الفعاليات والمناسبات والأنشطة المدرسية بالصور والفيديوهات.",
    showcaseSectionTitle: "الأخبار والعروض والسوشيال ميديا",
    showcaseSectionDesc: "تغطيات مصورة حية، فيديوهات تفاعلية، ومنشورات منصات التواصل لحظة بلحظة.",
    memoryWallTitle: "حائط الذكريات ولحظات لا تُنسى",
    memoryWallDesc: "توثيق بالصور لأجمل اللحظات التي تجمع طلاب ومعلمي مدارس العقيق.",
    archiveTitle: "أرشيف العقيق المفتوح",
    archiveDesc: "ذاكرة رقمية متكاملة تنمو يومياً مع كل خبر وعرض مباشر، وكل عدد جديد من المجلة.",
  },
  editorialVoice: {
    enabled: true,
    quoteText: "نؤمن في مدارس العقيق بأن التعليم ليس مجرد تلقين، بل صناعة هوية وبناء جيل ملهم يقود المستقبل بالمعرفة والقيم.",
    authorName: "أ. عبد الله الساعدي",
    authorTitle: "المشرف العام على مدارس العقيق",
    audioUrl: null,
  },
  schoolSongs: [
    {
      id: "song-1",
      title: "نشيد مدارس العقيق الرسمي",
      artist: "كورال طلاب مدارس العقيق الأهلية",
      category: "النشيد المدرسي",
      mediaUrl: "/audio/aqeeq-royal.mp3",
      coverUrl: "",
    },
    {
      id: "song-2",
      title: "أغنية فخر التميز والريادة",
      artist: "فرقة المدارس الاحتفالية",
      category: "احتفالي",
      mediaUrl: "/audio/aqeeq-celebration.mp3",
      coverUrl: "",
    },
    {
      id: "song-3",
      title: "معزوفة إلهام العقيق (بيانو)",
      artist: "كورال مدارس العقيق",
      category: "بيانو وهدوء",
      mediaUrl: "/audio/aqeeq-piano.mp3",
      coverUrl: "",
    },
    {
      id: "song-4",
      title: "أنغام العقيق الملكية",
      artist: "وتريات العقيق",
      category: "أجواء ملكية",
      mediaUrl: "/audio/aqeeq-ambient.mp3",
      coverUrl: "",
    },
  ],
  social: {
    xUrl: "https://x.com/alaqeeq_schools",
    instagramUrl: "https://instagram.com/alaqeeq_schools",
    youtubeUrl: "https://youtube.com/@alaqeeq_schools",
    snapchatUrl: "https://snapchat.com/add/alaqeeq_schools",
    facebookUrl: "https://facebook.com/alaqeeqschools",
    telegramUrl: "https://t.me/alaqeeqschools",
    whatsappNumber: "966500000000",
  },
  footer: {
    copyrightText: "جميع الحقوق محفوظة لمدارس العقيق الأهلية والدولية © 2026",
    subText: "صُنعت المنصة الرقمية بأحدث التقنيات لخدمة الطلاب وأولياء الأمور والمعلمين",
  },
  location: {
    enabled: true,
    text: "المدينة المنورة · المملكة العربية السعودية",
    mapUrl: "https://maps.google.com/?q=Alaqeeq+Schools+Madinah",
  },
  appShowcase: {
    enabled: true,
    youtubeVideoId: "_h3K-q8cDUc",
    qrCodeUrl: "https://qr-codes.io/LQMip0",
    appStoreUrl: "https://apps.apple.com",
    googlePlayUrl: "https://play.google.com",
  },
  schoolCampuses: {
    boysPhone: "0148131652",
    girlsPhone: "0148644466",
    boysAddress: "مجمع الرانوناء — ممشى الهجرة (خلف نايس برايس) بالمدينة المنورة",
    girlsAddress: "مجمع الرانوناء — ممشى الهجرة (خلف نايس برايس) بالمدينة المنورة",
    boysMapUrl: "https://maps.google.com/?q=Alaqeeq+Schools+Madinah",
    girlsMapUrl: "https://maps.google.com/?q=Alaqeeq+Schools+Madinah",
  },
  admissionsSettings: {
    isOpen: true,
    closedNoticeText: "تم اكتمال المقاعد للعام الدراسي الحالي. بإمكانكم تسجيل بياناتكم في قائمة الانتظار.",
    siblingDiscountFirst: 10,
    siblingDiscountSecond: 15,
    earlyPaymentDiscount: 5,
    tuitionFees: [
      { gradeLevel: "رياض الأطفال (KG1 - KG3)", nationalAnnual: 14500, internationalAnnual: 18500 },
      { gradeLevel: "المرحلة الابتدائية (صفوف 1 - 3)", nationalAnnual: 16800, internationalAnnual: 21500 },
      { gradeLevel: "المرحلة الابتدائية العليا (صفوف 4 - 6)", nationalAnnual: 17500, internationalAnnual: 22500 },
      { gradeLevel: "المرحلة المتوسطة (صفوف 7 - 9)", nationalAnnual: 19500, internationalAnnual: 24500 },
      { gradeLevel: "المرحلة الثانوية مسارات (صفوف 10 - 12)", nationalAnnual: 22000, internationalAnnual: 27500 },
    ],
  },
};

const SOCIAL_SHARE_PAGES: Array<{
  path: string;
  name: string;
  badge: string;
  icon: string;
  autoTitle: string;
  autoDesc: string;
  autoImage: string;
}> = [
  {
    path: "/",
    name: "الرئيسية",
    badge: "البوابة الرسمية",
    icon: "🏠",
    autoTitle: "مدارس العقيق الأهلية والدولية بالمدينة المنورة",
    autoDesc: "الريادة في التعليم وصناعة المستقبل منذ عام 1994 - برامج تعليمية معتمدة ورعاية للموهبة والإبداع.",
    autoImage: "/covers/cover-about.jpg",
  },
  {
    path: "/admissions",
    name: "القبول والرسوم",
    badge: "بوابة التقديم",
    icon: "🎓",
    autoTitle: "القبول والتسجيل للعام الدراسي الجديد 🎓 | مدارس العقيق",
    autoDesc: "سجل مقعد ابنك الآن في مدارس العقيق الأهلية والدولية - فصول مجهزة، برامج وطنية ودولية، وحاسبة رسوم وخصومات حية.",
    autoImage: "/covers/student-lab-admissions.jpg",
  },
  {
    path: "/journal",
    name: "المجلة الرقمية",
    badge: "الأعداد الدورية",
    icon: "📖",
    autoTitle: "مجلة العقيق المدرسية 📖 | صدى الإبداع والريادة",
    autoDesc: "تصفح أحدث أعداد مجلة العقيق الدورية بتجربة قراءة تفاعلية ثلاثية الأبعاد وتقليب حقيقي للصفحات.",
    autoImage: "/uploads/site-media/1/1788029592790-9f51a02b-drive-1B3LhIXBI_l4gw0RQgAI92qeuufkowJWJ-p01_f952eff9.jpg",
  },
  {
    path: "/albums",
    name: "ألبومات الفعاليات",
    badge: "معارض مصورة",
    icon: "📸",
    autoTitle: "معارض وألبومات العقيق 📸 | ذكريات وإنجازات مصورة",
    autoDesc: "شاهد أحدث التغطيات المصورة والمعارض التفاعلية لفعاليات وإنجازات طلاب ومعلمي مدارس العقيق.",
    autoImage: "/covers/first-lego-champions.png",
  },
  {
    path: "/articles",
    name: "المقالات والأخبار",
    badge: "المدونة والإنتاج",
    icon: "✍️",
    autoTitle: "أقلام العقيق والمقالات ✍️ | إبداع الطلاب والمعلمين",
    autoDesc: "منصة المقالات التعليمية والمعرفية والمشاركات الأدبية والعلمية لأسرة مدارس العقيق.",
    autoImage: "/articles/ai-in-education-comprehensive-research.jpg",
  },
  {
    path: "/atheer",
    name: "إذاعة وبودكاست أثير",
    badge: "صوت العقيق",
    icon: "🎙️",
    autoTitle: "أثير وبودكاست العقيق 🎙️ | صوت المعرفة والإلهام",
    autoDesc: "استمع لحلقات بودكاست العقيق وأناشيد المدارس الرسمية وحوارات ملهمة مع المتميزين والمبدعين.",
    autoImage: "/articles/morning-radio-student-personality-development.jpg",
  },
  {
    path: "/accreditations",
    name: "الاعتمادات والجودة",
    badge: "Cognia والجوائز",
    icon: "🏅",
    autoTitle: "الاعتمادات والجودة والجوائز 🏅 | مدارس العقيق الأهلية والدولية",
    autoDesc: "سجل حافل من الاعتمادات الوطنية والدولية وجوائز التميز المؤسسي والأكاديمي واعتماد Cognia الأمريكي.",
    autoImage: "/covers/cover-accreditations.jpg",
  },
  {
    path: "/about",
    name: "عن المدارس والمسيرة",
    badge: "منذ 1994",
    icon: "🏛️",
    autoTitle: "عن مدارس العقيق 🏛️ | مسيرة ريادة منذ عام 1994",
    autoDesc: "تعرف على تاريخ مجمعات العقيق التعليمية بالمدينة المنورة، رؤيتنا، رسالتنا، ومرافقنا المتطورة.",
    autoImage: "/covers/student-excellence-about.jpg",
  },
];

export default function AqeeqAdminDashboardPage() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, loading, login, logout } = useAuth();
  const { theme, toggleTheme } = useAqeeqStudioTheme();
  const dark = theme === "dark";
  const isLocalhost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  // 🏛️ The 5 Pillars Master State
  const [activeTab, setActiveTab] = useState<TabKey>("radar");
  const [admissionsSubTab, setAdmissionsSubTab] = useState<AdmissionsSubTab>("inbox");
  const [contentSubTab, setContentSubTab] = useState<ContentSubTab>("master");
  const [campaignsSubTab, setCampaignsSubTab] = useState<CampaignsSubTab>("broadcast");
  const [systemSubTab, setSystemSubTab] = useState<SystemSubTab>("theme");

  // Auxiliary UI States
  const [isYearbookOpen, setIsYearbookOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [admissionsFilter, setAdmissionsFilter] = useState<string>("all");
  const [admissionsSearch, setAdmissionsSearch] = useState<string>("");
  const [selectedLeadIds, setSelectedLeadIds] = useState<number[]>([]);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);

  const utils = trpc.useUtils();

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Deploy to live mutation
  const deployMutation = trpc.deploy.syncToLive.useMutation({
    onSuccess: () => {
      setIsDeploying(false);
      toast.success("🚀 تم نشر وتحديث الموقع المباشر بنجاح على سيرفرات ريندر!");
    },
    onError: (err) => {
      setIsDeploying(false);
      toast.error(err.message || "فشل نشر التعديلات");
    },
  });

  const [isPulling, setIsPulling] = useState(false);
  const pullMutation = trpc.deploy.pullFromLive.useMutation({
    onSuccess: (res) => {
      setIsPulling(false);
      toast.success(res.message || "📥 تم سحب أحدث تعديلات ريندر بنجاح!");
      void utils.invalidate();
    },
    onError: (err) => {
      setIsPulling(false);
      toast.error(err.message || "فشل سحب التعديلات من ريندر");
    },
  });

  // Admin Overview Queries
  const { data: stats, refetch: refetchStats } = trpc.executiveAdmin.getOverviewStats.useQuery(undefined, {
    enabled: Boolean(isAuthenticated && user?.role === "admin"),
    refetchInterval: 20000,
  });

  const { data: usersList = [], refetch: refetchUsers } = trpc.executiveAdmin.getUsers.useQuery(undefined, {
    enabled: Boolean(isAuthenticated && user?.role === "admin"),
  });

  const { data: masterContent = [] } = trpc.executiveAdmin.getMasterContent.useQuery(undefined, {
    enabled: Boolean(isAuthenticated && user?.role === "admin"),
  });

  const { data: orchestrationData, refetch: refetchOrchestration } = trpc.executiveAdmin.getSiteOrchestration.useQuery(undefined, {
    enabled: Boolean(isAuthenticated && user?.role === "admin"),
  });

  const { data: admissionsList = [], refetch: refetchAdmissions } = trpc.admissions.list.useQuery(undefined, {
    enabled: Boolean(isAuthenticated && user?.role === "admin"),
    refetchInterval: 15000,
  });

  const updateAdmissionStatusMutation = trpc.admissions.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث حالة طلب القبول بنجاح");
      refetchAdmissions();
    },
    onError: (err) => toast.error(err.message || "فشل تحديث حالة الطلب"),
  });

  const deleteAdmissionMutation = trpc.admissions.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الطلب بنجاح");
      refetchAdmissions();
    },
    onError: (err) => toast.error(err.message || "فشل حذف الطلب"),
  });

  // Form Orchestration state
  const [orchestrationForm, setOrchestrationForm] = useState<any>(DEFAULT_ORCHESTRATION);

  useEffect(() => {
    if (orchestrationData) {
      setOrchestrationForm({
        ...DEFAULT_ORCHESTRATION,
        ...orchestrationData,
        nav: { ...DEFAULT_ORCHESTRATION.nav, ...(orchestrationData.nav || {}) },
        emergencyBanner: { ...DEFAULT_ORCHESTRATION.emergencyBanner, ...(orchestrationData.emergencyBanner || {}) },
        marketingPixels: { ...DEFAULT_ORCHESTRATION.marketingPixels, ...(orchestrationData.marketingPixels || {}) },
        heroCovers: { ...DEFAULT_ORCHESTRATION.heroCovers, ...(orchestrationData.heroCovers || {}) },
        weeklyBento: { ...DEFAULT_ORCHESTRATION.weeklyBento, ...(orchestrationData.weeklyBento || {}) },
        sections: { ...DEFAULT_ORCHESTRATION.sections, ...(orchestrationData.sections || {}) },
        editorialVoice: { ...DEFAULT_ORCHESTRATION.editorialVoice, ...(orchestrationData.editorialVoice || {}) },
        social: { ...DEFAULT_ORCHESTRATION.social, ...(orchestrationData.social || {}) },
        footer: { ...DEFAULT_ORCHESTRATION.footer, ...(orchestrationData.footer || {}) },
        location: { ...DEFAULT_ORCHESTRATION.location, ...(orchestrationData.location || {}) },
        schoolSongs: (orchestrationData as any).schoolSongs || DEFAULT_ORCHESTRATION.schoolSongs,
        appShowcase: (orchestrationData as any).appShowcase || DEFAULT_ORCHESTRATION.appShowcase,
        schoolCampuses: (orchestrationData as any).schoolCampuses || DEFAULT_ORCHESTRATION.schoolCampuses,
        admissionsSettings: (orchestrationData as any).admissionsSettings || DEFAULT_ORCHESTRATION.admissionsSettings,
        interactiveFx: (orchestrationData as any).interactiveFx || DEFAULT_ORCHESTRATION.interactiveFx,
      });
    }
  }, [orchestrationData]);

  // 🌐 Universal Social Share Hub State (Dual Engine: Auto vs Custom)
  const [selectedSharePage, setSelectedSharePage] = useState<string>("/");
  const [previewPlatform, setPreviewPlatform] = useState<"whatsapp" | "x" | "facebook">("whatsapp");
  const [utmSource, setUtmSource] = useState<string>("whatsapp");
  const [utmCampaign, setUtmCampaign] = useState<string>("admissions-2026");
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const currentSharePageConfig = useMemo(() => {
    return SOCIAL_SHARE_PAGES.find((p) => p.path === selectedSharePage) || SOCIAL_SHARE_PAGES[0];
  }, [selectedSharePage]);

  const pageOverridesMap = (orchestrationForm.marketingPixels?.pageShareOverrides || {}) as Record<
    string,
    { mode: "auto" | "custom"; title?: string; description?: string; imageUrl?: string }
  >;

  const activePageOverride = pageOverridesMap[selectedSharePage] || {
    mode: "auto" as const,
    title: "",
    description: "",
    imageUrl: "",
  };

  const isCustomMode = activePageOverride.mode === "custom";

  const effectiveTitle = isCustomMode && activePageOverride.title?.trim()
    ? activePageOverride.title.trim()
    : (selectedSharePage === "/" && orchestrationForm.marketingPixels?.ogTitle?.trim()
      ? orchestrationForm.marketingPixels.ogTitle.trim()
      : currentSharePageConfig.autoTitle);

  const effectiveDesc = isCustomMode && activePageOverride.description?.trim()
    ? activePageOverride.description.trim()
    : (selectedSharePage === "/" && orchestrationForm.marketingPixels?.ogDescription?.trim()
      ? orchestrationForm.marketingPixels.ogDescription.trim()
      : currentSharePageConfig.autoDesc);

  const { data: allVisualOverrides } = trpc.visualEditor.listAll.useQuery();

  const dynamicPageVisualImage = useMemo(() => {
    if (!allVisualOverrides || !Array.isArray(allVisualOverrides)) return null;
    const match = allVisualOverrides.find(
      (o: any) => o.pagePath === selectedSharePage && o.mediaUrl && typeof o.mediaUrl === "string" && o.mediaUrl.trim() && !o.isHidden
    );
    return match ? (match as any).mediaUrl.trim() : null;
  }, [allVisualOverrides, selectedSharePage]);

  const autoDynamicImage = dynamicPageVisualImage || (
    selectedSharePage === "/journal" && (masterContent as any[]).find((c) => c.type === "journal" && c.coverUrl)?.coverUrl ? (masterContent as any[]).find((c) => c.type === "journal" && c.coverUrl).coverUrl :
    selectedSharePage === "/albums" && (masterContent as any[]).find((c) => c.type === "album" && c.coverUrl)?.coverUrl ? (masterContent as any[]).find((c) => c.type === "album" && c.coverUrl).coverUrl :
    selectedSharePage === "/articles" && (masterContent as any[]).find((c) => c.type === "article" && c.coverUrl)?.coverUrl ? (masterContent as any[]).find((c) => c.type === "article" && c.coverUrl).coverUrl :
    selectedSharePage === "/atheer" && (masterContent as any[]).find((c) => c.type === "podcast" && c.coverUrl)?.coverUrl ? (masterContent as any[]).find((c) => c.type === "podcast" && c.coverUrl).coverUrl :
    currentSharePageConfig.autoImage
  );

  const effectiveImage = isCustomMode && activePageOverride.imageUrl?.trim()
    ? activePageOverride.imageUrl.trim()
    : autoDynamicImage;

  const updateActiveOverride = (updates: Partial<{ mode: "auto" | "custom"; title: string; description: string; imageUrl: string }>) => {
    const nextOverrides = {
      ...pageOverridesMap,
      [selectedSharePage]: {
        ...activePageOverride,
        ...updates,
      },
    };
    const nextMarketingPixels = {
      ...orchestrationForm.marketingPixels,
      pageShareOverrides: nextOverrides,
      ...(selectedSharePage === "/" && updates.title !== undefined ? { ogTitle: updates.title } : {}),
      ...(selectedSharePage === "/" && updates.description !== undefined ? { ogDescription: updates.description } : {}),
      ...(selectedSharePage === "/" && updates.imageUrl !== undefined ? { ogImageUrl: updates.imageUrl } : {}),
    };
    setOrchestrationForm({
      ...orchestrationForm,
      marketingPixels: nextMarketingPixels,
    });
  };

  const resetToAutoMode = () => {
    updateActiveOverride({
      mode: "auto",
      title: "",
      description: "",
      imageUrl: "",
    });
    toast.success(`🔄 تم تفعيل الوضع التلقائي الذكي لصفحة (${currentSharePageConfig.name})!`);
  };

  const copyCacheBusterLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://alaqeeq.edu.sa";
    const cacheBusterUrl = `${origin}${selectedSharePage === "/" ? "" : selectedSharePage}?v=${Date.now()}`;
    navigator.clipboard.writeText(cacheBusterUrl);
    toast.success("⚡ تم نسخ رابط كاسر كاش واتساب وتويتر! استخدمه لتحديث الصورة فوراً.");
  };

  const shareDirectToWhatsApp = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://alaqeeq.edu.sa";
    const targetUrl = `${origin}${selectedSharePage === "/" ? "" : selectedSharePage}?v=${Date.now()}`;
    const text = `${effectiveTitle}\n\n${effectiveDesc}\n\n🔗 ${targetUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const campaignGeneratedUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://alaqeeq.edu.sa";
    const base = `${origin}${selectedSharePage === "/" ? "" : selectedSharePage}`;
    const cleanCamp = (utmCampaign || "promo").trim().toLowerCase().replace(/\s+/g, "-");
    return `${base}?utm_source=${utmSource}&utm_campaign=${cleanCamp}&v=${Date.now()}`;
  }, [selectedSharePage, utmSource, utmCampaign]);

  const setOrchestrationMutation = trpc.executiveAdmin.setSiteOrchestration.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ وتحديث الإعدادات بنجاح! 🚀");
      void refetchOrchestration();
    },
    onError: (err) => toast.error(err.message || "تعذر حفظ التعديلات"),
  });

  // Media Picker state
  const [mediaPickerConfig, setMediaPickerConfig] = useState<{
    open: boolean;
    title: string;
    currentUrl?: string | null;
    onSelect: (item: MediaPickerItem) => void;
  }>({
    open: false,
    title: "",
    onSelect: () => {},
  });

  // School Songs state
  const [newSongTitle, setNewSongTitle] = useState("");
  const [newSongArtist, setNewSongArtist] = useState("");
  const [newSongUrl, setNewSongUrl] = useState("");
  const [newSongCategory, setNewSongCategory] = useState("النشيد المدرسي");
  const [newSongCover, setNewSongCover] = useState("");
  const [isAddSongOpen, setIsAddSongOpen] = useState(false);
  const [isImportAudioFolderOpen, setIsImportAudioFolderOpen] = useState(false);
  const [driveAudioFolderUrl, setDriveAudioFolderUrl] = useState("");
  const [scannedAudioTracks, setScannedAudioTracks] = useState<any[]>([]);
  const [selectedTrackIds, setSelectedTrackIds] = useState<Record<string, boolean>>({});

  const scanDriveAudioFolderMutation = trpc.admin.scanGoogleDriveAudioFolder.useMutation();

  // User Management state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserOpenId, setNewUserOpenId] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "coordinator" | "receptionist" | "auditor">("admin");
  const [resetPassUserId, setResetPassUserId] = useState<number | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState("");
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);

  // Broadcast Banner state
  const [editingBroadcastId, setEditingBroadcastId] = useState<string | null>(null);
  const [broadcastEnabled, setBroadcastEnabled] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastType, setBroadcastType] = useState<"urgent" | "celebration" | "info">("info");
  const [broadcastLink, setBroadcastLink] = useState("");
  const [broadcastLinkText, setBroadcastLinkText] = useState("");

  const { data: broadcastList = [], refetch: refetchBroadcastList } = trpc.executiveAdmin.getBroadcastList.useQuery(undefined, {
    enabled: Boolean(isAuthenticated && user?.role === "admin"),
  });

  const [broadcastInitialized, setBroadcastInitialized] = useState(false);
  if (stats?.broadcast && !broadcastInitialized) {
    const b = stats.broadcast as any;
    setBroadcastEnabled(Boolean(b.enabled));
    setBroadcastMessage(b.message || "");
    setBroadcastType(b.type || "info");
    setBroadcastLink(b.link || "");
    setBroadcastLinkText(b.linkText || "");
    if (b.id) setEditingBroadcastId(b.id);
    setBroadcastInitialized(true);
  }

  // WhatsApp Campaign state
  const [selectedCampaignItem, setSelectedCampaignItem] = useState<string>("");

  // Content Grid Search & Filters
  const [contentSearch, setContentSearch] = useState("");
  const [contentTypeFilter, setContentTypeFilter] = useState<"all" | "journal" | "album" | "post">("all");

  // User Mutations
  const createUserMutation = trpc.executiveAdmin.createUser.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء حساب المشرف بنجاح!");
      setIsAddUserOpen(false);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserOpenId("");
      setNewUserPassword("");
      void refetchUsers();
      void refetchStats();
    },
    onError: (err) => toast.error(err.message || "تعذر إنشاء الحساب"),
  });

  const resetPasswordMutation = trpc.executiveAdmin.resetPassword.useMutation({
    onSuccess: () => {
      toast.success("تم تغيير كلمة المرور بنجاح!");
      setResetPassUserId(null);
      setNewPasswordValue("");
    },
    onError: (err) => toast.error(err.message || "تعذر تغيير كلمة المرور"),
  });

  const deleteUserMutation = trpc.executiveAdmin.deleteUser.useMutation({
    onSuccess: () => {
      toast.success("تم حذف المستخدم بنجاح!");
      setDeleteUserId(null);
      void refetchUsers();
      void refetchStats();
    },
    onError: (err) => toast.error(err.message || "تعذر حذف المستخدم"),
  });

  const updateRoleMutation = trpc.executiveAdmin.updateRole.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث صلاحية المستخدم!");
      void refetchUsers();
    },
    onError: (err) => toast.error(err.message || "تعذر تحديث الصلاحية"),
  });

  // Broadcast Mutations
  const setBroadcastMutation = trpc.executiveAdmin.setBroadcast.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ ونشر التنبيه العاجل بنجاح!");
      void refetchBroadcastList();
      void refetchStats();
      void utils.executiveAdmin.getBroadcast.invalidate();
    },
    onError: (err) => toast.error(err.message || "تعذر حفظ إعدادات التنبيه"),
  });

  const deleteBroadcastMutation = trpc.executiveAdmin.deleteBroadcast.useMutation({
    onSuccess: () => {
      toast.success("تم حذف التنبيه من السجل بنجاح!");
      void refetchBroadcastList();
      void refetchStats();
      void utils.executiveAdmin.getBroadcast.invalidate();
    },
    onError: (err) => toast.error(err.message || "تعذر حذف التنبيه"),
  });

  // Stories Mutations
  const hideStoryMutation = trpc.executiveAdmin.hideStory.useMutation({
    onSuccess: (_, variables) => {
      toast.success("تم استبعاد القصة من شريط 24H بنجاح", {
        action: {
          label: "تراجع ↩️",
          onClick: () => unhideStoryMutation.mutate({ storyId: variables.storyId }),
        },
      });
      void utils.executiveAdmin.getOverviewStats.invalidate();
      void utils.executiveAdmin.getSiteOrchestration.invalidate();
    },
    onError: (err) => toast.error(err.message || "تعذر استبعاد القصة"),
  });

  const unhideStoryMutation = trpc.executiveAdmin.unhideStory.useMutation({
    onSuccess: () => {
      toast.success("تمت استعادة القصة إلى شريط 24H بنجاح!");
      void utils.executiveAdmin.getOverviewStats.invalidate();
      void utils.executiveAdmin.getSiteOrchestration.invalidate();
    },
    onError: (err) => toast.error(err.message || "تعذر استعادة القصة"),
  });

  const toggleStoryMutation = trpc.executiveAdmin.toggleStoryActive.useMutation({
    onSuccess: (_, variables) => {
      const durationLabel = variables.durationHours === 24 ? "٢٤ ساعة"
        : variables.durationHours === 48 ? "٤٨ ساعة"
        : variables.durationHours === 72 ? "٧٢ ساعة"
        : variables.durationHours === 168 ? "أسبوع كامل"
        : `${variables.durationHours} ساعة`;
      toast.success(variables.active
        ? `تم تفعيل الاستوري لمدة ${durationLabel} في الصفحة الرئيسية! 🟢`
        : "تم إيقاف القصة من الاستوريهات");
      void utils.executiveAdmin.getOverviewStats.invalidate();
      void utils.executiveAdmin.getAllAvailableStories.invalidate();
      void utils.executiveAdmin.getSiteOrchestration.invalidate();
    },
    onError: (err) => toast.error(err.message || "تعذر تعديل حالة القصة"),
  });

  const { data: availableStories = [] } = trpc.executiveAdmin.getAllAvailableStories.useQuery(undefined, {
    enabled: Boolean(isAuthenticated && user?.role === "admin"),
  });

  const [isStoryPickerOpen, setIsStoryPickerOpen] = useState(false);
  const [storyPickerSearch, setStoryPickerSearch] = useState<string>("");
  const [storyDurationHours, setStoryDurationHours] = useState<number>(24);

  // Global Theme Engine State & Mutation
  const setActiveThemeMutation = trpc.executiveAdmin.setActiveTheme.useMutation({
    onSuccess: (data) => {
      const isNd = data.themeMode?.activeTheme === "saudi-national-day";
      toast.success(isNd ? "تم تفعيل ثيم اليوم الوطني السعودي بنجاح على كامل الموقع! 🇸🇦✨" : "تمت العودة إلى الثيم الأصلي للعقيق 💎");
      void utils.executiveAdmin.getSiteOrchestration.invalidate();
      void refetchOrchestration();
    },
    onError: (err) => toast.error(err.message || "تعذر تحديث ثيم الموقع"),
  });

  const [themeForm, setThemeForm] = useState<{
    activeTheme: "default" | "saudi-national-day";
    durationHours: number | null;
    templateVariant: "general" | "generosity" | "authenticity" | "vision" | "giving";
    customBadgeText: string;
    showCelebrationRibbon: boolean;
    backgroundPatternOpacity: number;
  }>({
    activeTheme: "default",
    durationHours: null,
    templateVariant: "general",
    customBadgeText: "نحلم ونحقق 🇸🇦",
    showCelebrationRibbon: true,
    backgroundPatternOpacity: 85,
  });

  useEffect(() => {
    if (orchestrationData?.themeMode) {
      setThemeForm((prev) => ({
        ...prev,
        activeTheme: orchestrationData.themeMode?.activeTheme || "default",
        templateVariant: (orchestrationData.themeMode?.templateVariant as any) || "general",
        customBadgeText: orchestrationData.themeMode?.customBadgeText || "نحلم ونحقق 🇸🇦",
        showCelebrationRibbon: orchestrationData.themeMode?.showCelebrationRibbon !== false,
        backgroundPatternOpacity: orchestrationData.themeMode?.backgroundPatternOpacity ?? 85,
      }));
    }
  }, [orchestrationData]);

  // Articles Moderation State & Queries
  const { data: allAdminArticles = [], refetch: refetchAdminArticles } = trpc.articles.listAllAdmin.useQuery(undefined, {
    enabled: Boolean(isAuthenticated && user?.role === "admin"),
  });
  const [articleFilterStatus, setArticleFilterStatus] = useState<"all" | "pending" | "published" | "rejected">("all");
  const [selectedArticleForEdit, setSelectedArticleForEdit] = useState<any>(null);

  const moderateArticleMutation = trpc.articles.moderate.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث حالة المقال بنجاح!");
      setSelectedArticleForEdit(null);
      void refetchAdminArticles();
    },
    onError: (err) => toast.error(err.message || "تعذر تحديث المقال"),
  });

  const deleteArticleMutation = trpc.articles.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف المقال بنجاح!");
      void refetchAdminArticles();
    },
    onError: (err) => toast.error(err.message || "تعذر حذف المقال"),
  });

  const aiPolishArticleMutation = trpc.articles.aiPolish.useMutation({
    onSuccess: (data) => {
      toast.success("✨ تم التدقيق والتحسين اللغوي بالذكاء الاصطناعي!");
      if (selectedArticleForEdit) {
        setSelectedArticleForEdit((prev: any) => ({
          ...prev,
          title: data.polishedTitle,
          content: data.polishedContent,
          excerpt: data.polishedExcerpt,
        }));
      }
    },
    onError: () => toast.error("تعذر التدقيق اللغوي بالذكاء الاصطناعي"),
  });

  // Filtered Master Content
  const filteredContent = useMemo(() => {
    return masterContent.filter((item) => {
      if (contentTypeFilter !== "all" && item.type !== contentTypeFilter) return false;
      if (contentSearch) {
        const q = contentSearch.toLowerCase();
        return item.title.toLowerCase().includes(q) || item.typeLabel.toLowerCase().includes(q);
      }
      return true;
    });
  }, [masterContent, contentTypeFilter, contentSearch]);

  // WhatsApp Campaign details
  const campaignItemData = useMemo(() => {
    return masterContent.find((item) => item.id === selectedCampaignItem);
  }, [masterContent, selectedCampaignItem]);

  const generatedWhatsAppMessage = useMemo(() => {
    if (!campaignItemData) return "";
    const fullUrl = window.location.origin + campaignItemData.viewUrl;
    return [
      "✨ *مدارس العقيق الأهلية والدولية* ✨",
      "📌 يسعدنا مشاركتكم جديد مدارس العقيق:",
      "",
      "📖 *" + campaignItemData.title + "*",
      "🏷️ التصنيف: " + campaignItemData.typeLabel,
      campaignItemData.date ? "📅 التاريخ: " + campaignItemData.date : "",
      "",
      "🔗 *رابط التصفح والمشاهدة المباشرة:*",
      fullUrl,
      "",
      "🌟 _أهلاً بكم في رحاب التميز والإبداع_",
    ]
      .filter(Boolean)
      .join("\n");
  }, [campaignItemData]);

  // Intelligent navigation router for shortcuts & command palette
  const handleNavigateTab = (tab: any, subTab?: string) => {
    if (tab === "radar") {
      setActiveTab("radar");
    } else if (tab === "admissions") {
      setActiveTab("admissions");
      if (subTab === "inbox" || subTab === "fees" || subTab === "settings") {
        setAdmissionsSubTab(subTab);
      }
    } else if (tab === "content" || tab === "articles") {
      setActiveTab("content");
      if (tab === "articles" || subTab === "articles") {
        setContentSubTab("articles");
      } else {
        setContentSubTab("master");
      }
    } else if (tab === "campaigns" || tab === "broadcast" || tab === "whatsapp" || tab === "music" || tab === "podcast") {
      setActiveTab("campaigns");
      if (tab === "whatsapp" || subTab === "whatsapp") {
        setCampaignsSubTab("whatsapp");
      } else if (tab === "music" || tab === "podcast" || subTab === "radio") {
        setCampaignsSubTab("radio");
      } else {
        setCampaignsSubTab("broadcast");
      }
    } else if (tab === "system" || tab === "users" || tab === "orchestration") {
      setActiveTab("system");
      if (tab === "users" || subTab === "users") {
        setSystemSubTab("users");
      } else if (subTab === "campuses" || subTab === "header_nav") {
        setSystemSubTab("campuses");
      } else if (subTab === "marketing") {
        setSystemSubTab("marketing");
      } else if (subTab === "backup") {
        setSystemSubTab("backup");
      } else {
        setSystemSubTab("theme");
      }
    }
  };

  // Pending counts
  const pendingLeadsCount = admissionsList.filter(
    (a: any) => a.status === "new" || a.status === "pending"
  ).length;

  const pendingArticlesCount = allAdminArticles.filter((a) => a.status === "pending").length;

  // Auth Loading Screen
  if (loading) {
    return (
      <div dir="rtl" className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-slate-950 text-white font-[Tajawal,sans-serif]">
        <div className="w-12 h-12 rounded-full border-4 border-amber-400/20 border-t-amber-400 animate-spin mb-4" />
        <h2 className="text-base font-black text-amber-300">جارِ فحص صلاحيات المشرف...</h2>
      </div>
    );
  }

  // Auth Gate
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div dir="rtl" className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-slate-950 text-white font-[Tajawal,sans-serif]">
        <div className="w-16 h-16 rounded-3xl bg-[#f8ca14]/10 border border-[#f8ca14]/30 flex items-center justify-center mb-5 text-[#f8ca14]">
          <Shield size={34} />
        </div>
        <h1 className="text-2xl font-black">لوحة الإدارة والتحكم — مدارس العقيق</h1>
        <p className="mt-2 text-sm text-slate-400 max-w-md">يرجى تسجيل الدخول بحساب المشرف العام لإدارة محتوى المنصة، القبول والتسجيل، والعمليات.</p>
        
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={async () => {
              try {
                await login({ username: "admin", password: "aqeeq2026" });
                toast.success("تم الدخول بحساب المشرف العام بنجاح");
              } catch {
                navigate("/login");
              }
            }}
            className="rounded-2xl bg-[#f8ca14] px-6 py-3.5 text-sm font-black text-black transition hover:bg-yellow-400 active:scale-95 shadow-lg shadow-[#f8ca14]/20 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>⚡ الدخول المباشر كمسؤول</span>
          </button>
          <button
            onClick={() => navigate("/login")}
            className="rounded-2xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10 active:scale-95 cursor-pointer"
          >
            تسجيل الدخول يدويًا
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className={"min-h-screen w-full max-w-full overflow-x-hidden transition-colors duration-300 font-[Tajawal,sans-serif] pb-24 lg:pb-12 " + (
        dark ? "bg-[#080808] text-white" : "bg-[#f4f6f9] text-slate-900"
      )}
    >
      {/* ==================== TOP EXECUTIVE HEADER ==================== */}
      <header
        className={"sticky top-0 z-40 border-b backdrop-blur-xl transition " + (
          dark ? "border-white/[0.08] bg-black/85" : "border-black/[0.08] bg-white/90"
        )}
      >
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-4 sm:px-8">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/")} className="h-11 w-auto cursor-pointer" title="العودة للصفحة الرئيسية">
              <img
                src="/alaqeeq-logo.png"
                alt="العقيق"
                className={"h-11 object-contain transition " + (dark ? "brightness-0 invert opacity-95" : "")}
              />
            </button>
            <div className="hidden sm:block border-r pr-4 border-current/10">
              <div className="flex items-center gap-2">
                <span className="grid h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <h1 className="text-base font-black">غرفة قيادة مدارس العقيق</h1>
              </div>
              <p className="text-[11px] font-bold text-slate-400">Executive Command Center · قمرة القيادة 2.0</p>
            </div>
          </div>

          {/* Quick Actions & Profiles */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Command Palette (Ctrl+K) */}
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className={"inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition cursor-pointer " + (
                dark
                  ? "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                  : "border-black/10 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
              )}
              title="البحث السريع وشريط الأوامر (Ctrl + K)"
            >
              <Search size={14} className="text-amber-400" />
              <span className="hidden md:inline">بحث سريع...</span>
              <kbd className="hidden sm:inline-block rounded border border-current/20 px-1.5 py-0.5 text-[9px] font-mono text-slate-400">
                ⌘K
              </kbd>
            </button>

            {/* Direct CTA to Live Visual Editor */}
            <button
              onClick={() => navigate("/")}
              className="hidden md:inline-flex items-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3.5 py-2 text-xs font-black text-amber-400 hover:bg-amber-400 hover:text-black transition shadow-sm cursor-pointer"
              title="فتح المحرر البصري التفاعلي على الموقع"
            >
              <Palette size={14} />
              <span>المحرر البصري 🎨</span>
            </button>

            {/* View Live Site */}
            <button
              onClick={() => window.open("/", "_blank")}
              className={"inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-black transition cursor-pointer " + (
                dark
                  ? "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                  : "border-black/10 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
              )}
              title="معاينة الموقع كزائر"
            >
              <span>الموقع</span>
              <ExternalLink size={13} />
            </button>

            {/* Theme Switcher */}
            <button
              onClick={toggleTheme}
              className={"grid h-10 w-10 place-items-center rounded-xl border transition cursor-pointer " + (
                dark
                  ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]"
                  : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"
              )}
              title="تبديل المظهر (نهاري / ليلي)"
            >
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Deploy to Live Button & Pull from Live Button (for localhost sync) */}
            {isLocalhost && (
              <>
                <button
                  onClick={() => {
                    if (isDeploying || isPulling) return;
                    setIsDeploying(true);
                    deployMutation.mutate();
                  }}
                  disabled={isDeploying || isPulling}
                  className={`flex items-center gap-2 px-3 sm:px-4 h-10 rounded-xl border transition shadow-lg text-xs font-black active:scale-95 cursor-pointer ${
                    isDeploying
                      ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-400 cursor-wait"
                      : "border-emerald-500/50 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-400"
                  }`}
                  title="مزامنة ونشر التعديلات على الموقع المباشر 🚀"
                >
                  <Rocket size={15} className={isDeploying ? "animate-spin" : ""} />
                  <span className="hidden sm:inline">{isDeploying ? "جارِ النشر..." : "نشر للإنتاج 🚀"}</span>
                </button>

                <button
                  onClick={() => {
                    if (isDeploying || isPulling) return;
                    if (!window.confirm("📥 هل تريد سحب أحدث تعديلات المحتوى من موقع ريندر إلى جهازك الآن؟")) return;
                    setIsPulling(true);
                    pullMutation.mutate();
                  }}
                  disabled={isDeploying || isPulling}
                  className={`flex items-center gap-2 px-3 sm:px-4 h-10 rounded-xl border transition shadow-lg text-xs font-black active:scale-95 cursor-pointer ${
                    isPulling
                      ? "border-amber-500/40 bg-amber-500/20 text-amber-400 cursor-wait"
                      : "border-amber-500/50 bg-amber-500/15 text-amber-400 hover:bg-amber-500 hover:text-black hover:border-amber-400"
                  }`}
                  title="سحب أحدث تعديلات المحتوى من موقع ريندر إلى جهازك 📥"
                >
                  <CloudDownload size={15} className={isPulling ? "animate-bounce" : ""} />
                  <span className="hidden sm:inline">{isPulling ? "جارِ السحب..." : "سحب من ريندر 📥"}</span>
                </button>
              </>
            )}

            {/* Logout */}
            <button
              onClick={() => void logout()}
              className="grid h-10 w-10 place-items-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition cursor-pointer"
              title="تسجيل الخروج"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* 🏛️ The 5 Pillars Executive Tabs */}
        <div className="mx-auto flex max-w-[1440px] items-center gap-2 px-4 sm:px-8 overflow-x-auto scrollbar-hide pb-2 pt-1">
          {[
            {
              key: "radar" as TabKey,
              label: "مركز القيادة والرادار",
              icon: LayoutDashboard,
              badge: undefined,
              alert: false,
            },
            {
              key: "admissions" as TabKey,
              label: "شؤون القبول والرسوم CRM",
              icon: GraduationCap,
              badge: pendingLeadsCount || undefined,
              alert: pendingLeadsCount > 0,
            },
            {
              key: "content" as TabKey,
              label: "الجدول الموحد للمحتوى",
              icon: Layers,
              badge: pendingArticlesCount || undefined,
              alert: pendingArticlesCount > 0,
            },
            {
              key: "campaigns" as TabKey,
              label: "التنبيهات والتواصل المباشر",
              icon: Megaphone,
              badge: broadcastEnabled ? "بث نشط" : undefined,
              alert: broadcastEnabled,
            },
            {
              key: "system" as TabKey,
              label: "إدارة النظام والهوية والأمان",
              icon: Shield,
              badge: orchestrationData?.themeMode?.activeTheme === "saudi-national-day" ? "اليوم الوطني 🇸🇦" : undefined,
              alert: false,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`relative inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black transition whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? dark
                      ? "bg-gradient-to-r from-[#f8ca14] to-amber-500 text-black shadow-lg shadow-[#f8ca14]/20"
                      : "bg-[#08467d] text-white shadow-lg shadow-[#08467d]/20"
                    : dark
                    ? "bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white border border-white/5"
                    : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-black/5 shadow-sm"
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>

                {tab.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                      tab.alert
                        ? "bg-red-500 text-white animate-pulse"
                        : active
                        ? "bg-black/20 text-current"
                        : "bg-amber-400/20 text-amber-400 border border-amber-400/30"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* ==================== MAIN DASHBOARD BODY ==================== */}
      <main className="mx-auto max-w-[1440px] px-4 sm:px-8 py-6 sm:py-8">

        {/* ============================================================== */}
        {/* 🌟 PILLAR 1: COMMAND RADAR & REAL-TIME INTELLIGENCE             */}
        {/* ============================================================== */}
        {activeTab === "radar" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* AI Yearbook Super Feature Banner */}
            <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 shadow-2xl border ${
              dark
                ? "bg-gradient-to-r from-[#111] via-[#1a1508] to-[#111] border-[#e5b84f]/20"
                : "bg-gradient-to-r from-slate-50 via-amber-50 to-slate-50 border-[#e5b84f]/30"
            }`}>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-right max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black bg-[#e5b84f]/15 text-[#e5b84f] mb-3 border border-[#e5b84f]/30">
                    <Sparkles size={14} />
                    <span>ميزة الذكاء الاصطناعي الفائقة 🎓</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black mb-2">
                    منشئ السجل السنوي وكتاب التخرج بالذكاء الاصطناعي
                  </h3>
                  <p className={`text-xs sm:text-sm font-bold leading-relaxed ${dark ? "text-slate-300" : "text-slate-600"}`}>
                    توليد كتاب تخرج وسجل سنوي تفاعلي حصري لكل طالب بناءً على بصمته الرقمية، إنجازاته، ومشاركاته في المعارض والفعاليات.
                  </p>
                </div>
                <button
                  onClick={() => setIsYearbookOpen(true)}
                  className="shrink-0 flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-gradient-to-l from-[#e5b84f] to-[#c59c3a] text-black font-black text-sm shadow-[0_0_30px_rgba(229,184,79,0.35)] hover:scale-105 transition-all cursor-pointer"
                >
                  <Wand2 size={18} />
                  <span>فتح استوديو السجلات الذكية</span>
                </button>
              </div>
            </div>

            {/* 4 Executive Real-time KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* 1. Admissions Priority KPI (The #1 Metric for School Leadership) */}
              <div
                onClick={() => setActiveTab("admissions")}
                className={`relative overflow-hidden rounded-3xl border p-5 sm:p-6 shadow-md cursor-pointer transition-all hover:scale-[1.02] ${
                  pendingLeadsCount > 0
                    ? "border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent"
                    : dark ? "border-white/10 bg-[#121212]" : "border-black/5 bg-white shadow-slate-200/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-400">طلبات القبول والتسجيل 🎓</span>
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-black font-black shadow-md">
                    <GraduationCap size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <p className="text-3xl sm:text-4xl font-black">{pendingLeadsCount}</p>
                  <span className="text-xs font-bold text-slate-400">طلب بانتظار المراجعة</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-400">إجمالي الطلبات: {admissionsList.length}</span>
                  <span className="text-amber-400 flex items-center gap-1">
                    <span>فتح الصندوق</span>
                    <ArrowUpLeft size={12} />
                  </span>
                </div>
              </div>

              {/* 2. Total Views & Engagement */}
              <div
                className={"relative overflow-hidden rounded-3xl border p-5 sm:p-6 shadow-md " + (
                  dark ? "border-white/10 bg-gradient-to-br from-[#121212] to-[#0a0a0a]" : "border-black/5 bg-white shadow-slate-200/50"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-400">إجمالي المشاهدات والتفاعل 👁️</span>
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-tr from-[#08467d] to-[#0e6cbd] text-white shadow-md">
                    <Eye size={18} />
                  </div>
                </div>
                <p className="mt-4 text-3xl sm:text-4xl font-black">{stats?.totalViews?.toLocaleString() || 0}</p>
                <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-emerald-500">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>تحديث لحظي مستمر</span>
                </div>
              </div>

              {/* 3. Published Master Content */}
              <div
                onClick={() => setActiveTab("content")}
                className={"relative overflow-hidden rounded-3xl border p-5 sm:p-6 shadow-md cursor-pointer transition-all hover:scale-[1.02] " + (
                  dark ? "border-white/10 bg-gradient-to-br from-[#121212] to-[#0a0a0a]" : "border-black/5 bg-white shadow-slate-200/50"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-400">المحتوى والأرشيف المفتوح 📚</span>
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md">
                    <BookOpen size={18} />
                  </div>
                </div>
                <p className="mt-4 text-3xl sm:text-4xl font-black">
                  {(stats?.totalIssues || 0) + (stats?.totalAlbums || 0) + (stats?.totalMediaFiles || 0)}
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span>{stats?.totalIssues || 0} مجلة · {stats?.totalAlbums || 0} ألبوم · {stats?.totalMediaFiles || 0} ميديا</span>
                  <ArrowUpLeft size={12} className="text-emerald-400" />
                </div>
              </div>

              {/* 4. Active Admins & Team */}
              <div
                onClick={() => { setActiveTab("system"); setSystemSubTab("users"); }}
                className={"relative overflow-hidden rounded-3xl border p-5 sm:p-6 shadow-md cursor-pointer transition-all hover:scale-[1.02] " + (
                  dark ? "border-white/10 bg-gradient-to-br from-[#121212] to-[#0a0a0a]" : "border-black/5 bg-white shadow-slate-200/50"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-400">فريق المشرفين والصلاحيات 👥</span>
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md">
                    <Users size={18} />
                  </div>
                </div>
                <p className="mt-4 text-3xl sm:text-4xl font-black">{usersList.length}</p>
                <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span>مدراء الأقسام والمعلمين</span>
                  <ArrowUpLeft size={12} className="text-purple-400" />
                </div>
              </div>
            </div>

            {/* Middle Section: 24H Stories Hub + Executive Quick Launchpad */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* 24H Stories Radar Widget (2 Cols) */}
              <div
                className={"rounded-3xl border p-6 lg:col-span-2 shadow-md space-y-5 " + (
                  dark ? "border-white/10 bg-[#101010]" : "border-black/5 bg-white shadow-slate-200/50"
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-tr from-[#f8ca14] to-[#de191e] text-white shadow-md">
                      <Flame size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-black">رادار وقصص اليوم (24H Stories Hub)</h3>
                      <p className="text-xs font-bold text-slate-400">القصص التفاعلية الحية المعروضة في شريط قمة الموقع</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={"rounded-xl px-3 py-1 text-xs font-black " + (
                        stats?.activeStoriesCount
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-500/15 text-slate-400 border border-slate-500/30"
                      )}
                    >
                      {stats?.activeStoriesCount ? stats.activeStoriesCount + " قصص نشطة" : "لا توجد قصص حالياً"}
                    </span>
                    <Button
                      type="button"
                      onClick={() => setIsStoryPickerOpen(true)}
                      className="gap-2 bg-gradient-to-r from-[#08467d] via-[#367453] to-[#f8ca14] text-white hover:opacity-95 text-xs font-black rounded-xl shadow-md cursor-pointer"
                    >
                      <Sparkles size={14} className="text-[#f8ca14]" />
                      <span>اختيار وتفعيل استوريهات</span>
                    </Button>
                  </div>
                </div>

                {stats?.activeStories && stats.activeStories.length > 0 ? (
                  <div className="space-y-4">
                    {/* Visual Stories Row Preview */}
                    <div className="flex items-center gap-3 overflow-x-auto pb-3 scrollbar-none border-b border-current/10">
                      {stats.activeStories.slice(0, 12).map((story: any) => (
                        <div key={story.id} className="flex flex-col items-center gap-1 shrink-0 text-center">
                          <div className={"relative p-[2px] rounded-full " + (
                            dark
                              ? "bg-gradient-to-tr from-[#f8ca14] via-[#de191e] to-[#08467d]"
                              : "bg-gradient-to-tr from-[#08467d] via-[#367453] to-[#f8ca14]"
                          )}>
                            <div className={"h-12 w-12 overflow-hidden rounded-full border-2 flex items-center justify-center " + (
                              dark ? "border-black bg-[#151515]" : "border-white bg-slate-100"
                            )}>
                              {story.sourceType === "instagram" ? (
                                <Instagram size={18} className="text-[#de191e]" />
                              ) : story.sourceType === "x" ? (
                                <span className="font-black text-sm">𝕏</span>
                              ) : story.imageUrl ? (
                                <img src={directDriveImage(story.imageUrl) || story.imageUrl} alt="" className="h-full w-full object-cover" />
                              ) : story.sourceType === "article" ? (
                                <Newspaper size={18} className="text-[#de191e]" />
                              ) : story.sourceType === "podcast" ? (
                                <Mic size={18} className="text-[#f8ca14]" />
                              ) : story.sourceType === "journal" ? (
                                <BookOpen size={18} className="text-[#f8ca14]" />
                              ) : (
                                <Camera size={18} className="text-[#367453]" />
                              )}
                            </div>
                            {story.isPinned && (
                              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#f8ca14] text-[9px] font-black text-black shadow-md">
                                ★
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 max-w-[65px] truncate">{story.title}</span>
                        </div>
                      ))}
                    </div>

                    {/* Active Stories List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                      {stats.activeStories.map((story: any) => (
                        <div
                          key={story.id}
                          className={"flex items-center justify-between gap-3 rounded-2xl border p-3 text-xs " + (
                            dark ? "border-white/10 bg-white/5" : "border-black/5 bg-slate-50"
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-black/40 border border-current/10 flex items-center justify-center">
                              {story.imageUrl ? (
                                <img src={directDriveImage(story.imageUrl) || story.imageUrl} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <Sparkles size={14} className="text-amber-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-black truncate">{story.title}</p>
                              <span className="text-[10px] text-slate-400">{story.category} · {story.timeAgo}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => hideStoryMutation.mutate({ storyId: story.id })}
                            className="rounded-lg p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                            title="استبعاد من شريط 24H"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Hidden Stories Recovery */}
                    {stats?.hiddenStories && stats.hiddenStories.length > 0 && (
                      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3 flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-300">
                          يوجد {stats.hiddenStories.length} قصص مستبعدة مؤقتاً
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            stats.hiddenStories.forEach((s: any) => unhideStoryMutation.mutate({ storyId: s.id }));
                          }}
                          className="text-xs font-black text-amber-400 hover:underline cursor-pointer"
                        >
                          استعادة الكل
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-current/10 p-8 text-center space-y-3">
                    <p className="text-xs font-bold text-slate-400">لا توجد استوريهات نشطة في الصفحة الرئيسية حالياً.</p>
                    <Button
                      onClick={() => setIsStoryPickerOpen(true)}
                      className="bg-amber-400 hover:bg-amber-500 text-black font-black text-xs rounded-xl"
                    >
                      <Plus size={14} className="ml-1" />
                      <span>اختيار قصص وتثبيتها الآن</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* Quick Operations Launchpad (1 Col) */}
              <div
                className={"rounded-3xl border p-6 shadow-md flex flex-col justify-between space-y-4 " + (
                  dark ? "border-white/10 bg-[#101010]" : "border-black/5 bg-white shadow-slate-200/50"
                )}
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-tr from-[#08467d] to-[#f8ca14] text-white shadow-md">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-black">منصة الإجراءات السريعة</h3>
                      <p className="text-xs font-bold text-slate-400">الوصول المباشر لأدوات المنظومة</p>
                    </div>
                  </div>

                  {/* PROMINENT VISUAL EDITOR CTA */}
                  <div className="p-4 rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-400/10 via-amber-400/5 to-transparent space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <Palette size={16} className="text-amber-400" />
                      <h4 className="text-xs font-black text-amber-400">المحرر البصري التفاعلي المباشر</h4>
                    </div>
                    <p className="text-[11px] font-bold text-slate-300 leading-relaxed">
                      عدّل النصوص والصور والفيديوهات والألوان مباشرة على صفحات الموقع بالمعاينة الحية بدون نماذج عمياء!
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate("/")}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-400 hover:bg-yellow-400 text-black font-black text-xs shadow-md transition active:scale-95 cursor-pointer"
                    >
                      <Palette size={15} />
                      <span>🎨 فتح المحرر البصري الآن</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => setActiveTab("admissions")}
                      className={"flex w-full items-center justify-between rounded-xl border p-3 text-xs font-black transition cursor-pointer " + (
                        dark ? "border-white/10 hover:bg-white/5" : "border-black/5 hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <GraduationCap size={16} className="text-amber-400" />
                        <span>صندوق طلبات القبول والرسوم</span>
                      </div>
                      <ArrowUpLeft size={14} className="text-slate-400" />
                    </button>

                    <button
                      onClick={() => { setActiveTab("campaigns"); setCampaignsSubTab("whatsapp"); }}
                      className={"flex w-full items-center justify-between rounded-xl border p-3 text-xs font-black transition cursor-pointer " + (
                        dark ? "border-white/10 hover:bg-white/5" : "border-black/5 hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Share2 size={16} className="text-emerald-400" />
                        <span>منشئ حملات واتساب لأولياء الأمور</span>
                      </div>
                      <ArrowUpLeft size={14} className="text-slate-400" />
                    </button>

                    <button
                      onClick={() => { setActiveTab("campaigns"); setCampaignsSubTab("broadcast"); }}
                      className={"flex w-full items-center justify-between rounded-xl border p-3 text-xs font-black transition cursor-pointer " + (
                        dark ? "border-white/10 hover:bg-white/5" : "border-black/5 hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Megaphone size={16} className="text-red-400" />
                        <span>شريط التنبيهات العاجلة والاحتفالية</span>
                      </div>
                      <ArrowUpLeft size={14} className="text-slate-400" />
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-current/10">
                  <span className="text-[10px] text-slate-400 font-bold block text-center">
                    مدارس العقيق الأهلية والدولية · غرفة القيادة الموحدة
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Activity Log */}
            <div
              className={"rounded-3xl border p-6 shadow-md " + (
                dark ? "border-white/10 bg-[#101010]" : "border-black/5 bg-white shadow-slate-200/50"
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-slate-400" />
                  <h3 className="text-sm font-black">سجل العمليات والنشاط الأخير للمشرفين</h3>
                </div>
                <button
                  onClick={() => void refetchStats()}
                  className="text-xs font-bold text-slate-400 hover:text-current flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw size={12} /> تحديث
                </button>
              </div>

              <div className="space-y-2">
                {stats?.recentLogs?.length ? (
                  stats.recentLogs.slice(0, 5).map((log: any) => (
                    <div
                      key={log.id}
                      className={"flex items-center justify-between rounded-xl p-3 text-xs " + (
                        dark ? "bg-white/[0.03]" : "bg-slate-50"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-black text-[#f8ca14]">{log.userName || "مشرف"}</span>
                        <span className="text-slate-400">نفذ إجراء:</span>
                        <code className="rounded bg-black/20 px-1.5 py-0.5 text-[11px] font-mono">{log.action}</code>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {log.createdAt ? new Date(log.createdAt).toLocaleTimeString("ar-SA") : ""}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-center text-xs text-slate-400 font-bold">لا توجد عمليات مسجلة حديثاً</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 🎓 PILLAR 2: ADMISSIONS & TUITION FEES CRM                      */}
        {/* ============================================================== */}
        {activeTab === "admissions" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Pillar Subtabs Navigation */}
            <div className="flex items-center gap-2 border-b border-current/10 pb-3 overflow-x-auto scrollbar-hide">
              <button
                type="button"
                onClick={() => setAdmissionsSubTab("inbox")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition cursor-pointer ${
                  admissionsSubTab === "inbox"
                    ? dark ? "bg-[#f8ca14] text-black shadow-md" : "bg-[#08467d] text-white shadow-md"
                    : dark ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-white text-slate-700 hover:bg-slate-100 border border-black/5"
                }`}
              >
                <GraduationCap size={15} />
                <span>صندوق طلبات التسجيل الواردة 📥</span>
                {pendingLeadsCount > 0 && (
                  <span className="rounded-full bg-red-500 text-white text-[10px] font-black px-2 py-0.2 animate-pulse">
                    {pendingLeadsCount} جديد
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setAdmissionsSubTab("fees")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition cursor-pointer ${
                  admissionsSubTab === "fees"
                    ? dark ? "bg-[#f8ca14] text-black shadow-md" : "bg-[#08467d] text-white shadow-md"
                    : dark ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-white text-slate-700 hover:bg-slate-100 border border-black/5"
                }`}
              >
                <FileSpreadsheet size={15} />
                <span>جدول الرسوم الدراسية وحاسبة الأقساط 💰</span>
              </button>

              <button
                type="button"
                onClick={() => setAdmissionsSubTab("settings")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition cursor-pointer ${
                  admissionsSubTab === "settings"
                    ? dark ? "bg-[#f8ca14] text-black shadow-md" : "bg-[#08467d] text-white shadow-md"
                    : dark ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-white text-slate-700 hover:bg-slate-100 border border-black/5"
                }`}
              >
                <SlidersHorizontal size={15} />
                <span>ضوابط وإغلاق التسجيل ⚙️</span>
              </button>
            </div>

            {/* SUBTAB 1: INBOX & LEADS CRM */}
            {admissionsSubTab === "inbox" && (
              <div className="space-y-6">
                {/* Header Actions & Filter Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black">صندوق طلبات التسجيل والقبول الإلكتروني</h2>
                    <p className="text-xs font-bold text-slate-400 mt-1">
                      متابعة أولياء الأمور، تغيير حالات الطلبات، والتواصل السريع عبر واتساب بنقرة واحدة
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* CSV Export Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (admissionsList.length === 0) {
                          toast.error("لا توجد بيانات للتصدير");
                          return;
                        }
                        const headers = ["رقم الطلب", "اسم الطالب", "ولي الأمر", "رقم الجوال", "البريد", "المرحلة", "المسار", "الجنس", "الحالة", "تاريخ الطلب"];
                        const rows = admissionsList.map((a: any) => [
                          a.id,
                          `"${a.studentName}"`,
                          `"${a.guardianName}"`,
                          `"${a.phone}"`,
                          `"${a.email || ''}"`,
                          `"${a.gradeLevel}"`,
                          `"${a.track}"`,
                          `"${a.gender}"`,
                          `"${a.status}"`,
                          `"${new Date(a.createdAt).toLocaleDateString('ar-SA')}"`,
                        ]);
                        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", `aqeeq-admissions-${new Date().toISOString().slice(0, 10)}.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        toast.success("تم تصدير ملف الإكسل (CSV) بنجاح!");
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-current/15 px-3.5 py-2 text-xs font-black transition hover:bg-white/10 cursor-pointer"
                    >
                      <Download size={14} />
                      <span>تصدير Excel / CSV</span>
                    </button>

                    {/* Bulk Delete Selected */}
                    {selectedLeadIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setBulkDeleteConfirmOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-2 text-xs font-black text-white hover:bg-red-700 transition cursor-pointer"
                      >
                        <Trash2 size={14} />
                        <span>حذف المحدد ({selectedLeadIds.length})</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Filter Pills & Search Input */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl border border-current/10">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { id: "all", label: `الكل (${admissionsList.length})` },
                      { id: "new", label: `جديد (${admissionsList.filter((a: any) => a.status === "new").length}) 🟢` },
                      { id: "pending", label: `قيد المراجعة (${admissionsList.filter((a: any) => a.status === "pending").length}) 🟡` },
                      { id: "contacted", label: `تم التواصل (${admissionsList.filter((a: any) => a.status === "contacted").length}) 📞` },
                      { id: "admitted", label: `تم القبول (${admissionsList.filter((a: any) => a.status === "admitted").length}) ✅` },
                      { id: "rejected", label: `مرفوض (${admissionsList.filter((a: any) => a.status === "rejected").length}) ❌` },
                    ].map((pill) => (
                      <button
                        key={pill.id}
                        type="button"
                        onClick={() => setAdmissionsFilter(pill.id)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-black transition cursor-pointer ${
                          admissionsFilter === pill.id
                            ? "bg-amber-400 text-black shadow"
                            : dark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-black"
                        }`}
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="بحث بالاسم أو الجوال أو المرحلة..."
                      value={admissionsSearch}
                      onChange={(e) => setAdmissionsSearch(e.target.value)}
                      className={`w-full rounded-xl border py-2 pr-9 pl-3 text-xs font-bold outline-none ${
                        dark ? "border-white/10 bg-black/40 text-white" : "border-black/10 bg-white text-slate-900"
                      }`}
                    />
                  </div>
                </div>

                {/* Leads Table */}
                {(() => {
                  const filteredLeads = admissionsList.filter((lead: any) => {
                    if (admissionsFilter !== "all" && lead.status !== admissionsFilter) return false;
                    if (admissionsSearch) {
                      const q = admissionsSearch.toLowerCase();
                      return (
                        lead.studentName?.toLowerCase().includes(q) ||
                        lead.guardianName?.toLowerCase().includes(q) ||
                        lead.phone?.includes(q) ||
                        lead.gradeLevel?.toLowerCase().includes(q)
                      );
                    }
                    return true;
                  });

                  if (filteredLeads.length === 0) {
                    return (
                      <div className="rounded-3xl border border-dashed border-current/10 p-12 text-center text-slate-400 text-xs font-bold">
                        لا توجد طلبات قبول مطابقة لمعايير البحث الحالية.
                      </div>
                    );
                  }

                  return (
                    <div className={`overflow-hidden rounded-3xl border shadow-md ${dark ? "border-white/10 bg-[#101010]" : "border-black/5 bg-white shadow-slate-200/50"}`}>
                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                          <thead className={`border-b text-[11px] font-black uppercase text-slate-400 ${
                            dark ? "border-white/10 bg-white/[0.02]" : "border-black/5 bg-slate-50"
                          }`}>
                            <tr>
                              <th className="p-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedLeadIds.length === filteredLeads.length && filteredLeads.length > 0}
                                  onChange={(e) => {
                                    if (e.target.checked) setSelectedLeadIds(filteredLeads.map((l: any) => l.id));
                                    else setSelectedLeadIds([]);
                                  }}
                                  className="rounded"
                                />
                              </th>
                              <th className="p-4">الطالب والمرحلة</th>
                              <th className="p-4">ولي الأمر والجوال</th>
                              <th className="p-4">المسار والجنس</th>
                              <th className="p-4">تاريخ الطلب</th>
                              <th className="p-4">الحالة والمتابعة</th>
                              <th className="p-4 text-center">التواصل والإجراء</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-current/5">
                            {filteredLeads.map((lead: any) => {
                              const cleanPhone = lead.phone?.replace(/[^0-9]/g, "") || "";
                              const whatsappPhone = cleanPhone.startsWith("0") ? "966" + cleanPhone.slice(1) : cleanPhone;
                              const waMessage = `السلام عليكم ورحمة الله وبركاته، ولي أمر الطالب/ة *${lead.studentName}* المحترم.. نرحب بكم من مدارس العقيق الأهلية والدولية بشأن طلب التسجيل رقم #${lead.id} للمرحلة (${lead.gradeLevel}). يسعدنا استكمال إجراءات القبول معكم.`;

                              return (
                                <tr key={lead.id} className="hover:bg-white/[0.02] transition">
                                  <td className="p-4 text-center">
                                    <input
                                      type="checkbox"
                                      checked={selectedLeadIds.includes(lead.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) setSelectedLeadIds([...selectedLeadIds, lead.id]);
                                        else setSelectedLeadIds(selectedLeadIds.filter((id) => id !== lead.id));
                                      }}
                                      className="rounded"
                                    />
                                  </td>

                                  <td className="p-4">
                                    <div>
                                      <p className="font-black text-sm text-amber-300">{lead.studentName}</p>
                                      <span className="text-[11px] text-slate-400 font-bold">{lead.gradeLevel}</span>
                                    </div>
                                  </td>

                                  <td className="p-4">
                                    <div>
                                      <p className="font-bold">{lead.guardianName}</p>
                                      <span className="text-[11px] text-slate-400 font-mono" dir="ltr">{lead.phone}</span>
                                    </div>
                                  </td>

                                  <td className="p-4">
                                    <span className="inline-block rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-bold">
                                      {lead.track} · {lead.gender === "boy" ? "بنين" : "بنات"}
                                    </span>
                                  </td>

                                  <td className="p-4 text-slate-400 font-mono text-[11px]">
                                    {new Date(lead.createdAt).toLocaleDateString("ar-SA")}
                                  </td>

                                  <td className="p-4">
                                    <select
                                      value={lead.status || "new"}
                                      onChange={(e) => {
                                        updateAdmissionStatusMutation.mutate({
                                          id: lead.id,
                                          status: e.target.value as any,
                                        });
                                      }}
                                      className={`rounded-xl border px-3 py-1.5 text-xs font-black outline-none cursor-pointer ${
                                        lead.status === "new"
                                          ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
                                          : lead.status === "admitted"
                                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                                          : lead.status === "contacted"
                                          ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                                          : lead.status === "rejected"
                                          ? "border-red-500/40 bg-red-500/10 text-red-400"
                                          : "border-current/20 bg-transparent text-slate-300"
                                      }`}
                                    >
                                      <option value="new">جديد 🟢</option>
                                      <option value="pending">قيد المراجعة 🟡</option>
                                      <option value="contacted">تم التواصل 📞</option>
                                      <option value="admitted">تم القبول ✅</option>
                                      <option value="rejected">مرفوض ❌</option>
                                    </select>
                                  </td>

                                  <td className="p-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                      {/* One-click WhatsApp Contact Button */}
                                      <a
                                        href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(waMessage)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] px-2.5 py-1.5 transition shadow"
                                        title="مراسلة عبر واتساب مباشرة"
                                      >
                                        <MessageCircle size={13} />
                                        <span>مراسلة</span>
                                      </a>

                                      {/* Delete single lead */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (confirm(`هل أنت متأكد من حذف طلب الطالب ${lead.studentName}؟`)) {
                                            deleteAdmissionMutation.mutate({ id: lead.id });
                                          }
                                        }}
                                        className="grid h-8 w-8 place-items-center rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                                        title="حذف الطلب"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* SUBTAB 2: TUITION FEES & DISCOUNTS */}
            {admissionsSubTab === "fees" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 border-current/10">
                  <div>
                    <h3 className="text-lg font-black flex items-center gap-2">
                      <FileSpreadsheet size={20} className="text-[#f8ca14]" />
                      <span>إدارة جدول الرسوم الدراسية وحاسبة الأقساط</span>
                    </h3>
                    <p className="text-xs font-bold text-slate-400 mt-1">
                      تعديل الرسوم السنوية لكل مرحلة دراسية، ونسب خصومات الإخوة والسداد المبكر، وتنعكس مباشرة على حاسبة الموقع.
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={() => {
                      setOrchestrationMutation.mutate({
                        admissionsSettings: orchestrationForm.admissionsSettings,
                      });
                    }}
                    disabled={setOrchestrationMutation.isPending}
                    className="rounded-2xl bg-[#f8ca14] hover:bg-yellow-400 text-black font-black text-xs px-6 py-2.5 shadow-lg shadow-[#f8ca14]/20 gap-2 cursor-pointer"
                  >
                    <CheckCircle2 size={16} />
                    <span>{setOrchestrationMutation.isPending ? "جاري الحفظ..." : "حفظ جدول الرسوم والخصومات"}</span>
                  </Button>
                </div>

                {/* Discounts Settings Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-5 rounded-2xl border ${dark ? "border-white/10 bg-[#121212]" : "border-black/5 bg-white shadow-sm"}`}>
                    <label className="text-xs font-black text-slate-300 block mb-2">نسبة خصم الابن الثاني (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={orchestrationForm.admissionsSettings?.siblingDiscountFirst ?? 10}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setOrchestrationForm({
                          ...orchestrationForm,
                          admissionsSettings: {
                            ...orchestrationForm.admissionsSettings,
                            siblingDiscountFirst: val,
                          },
                        });
                      }}
                      className={`w-full rounded-xl border px-3.5 py-2 text-sm font-bold outline-none ${
                        dark ? "border-white/10 bg-white/5 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                      }`}
                    />
                    <p className="text-[10px] font-bold text-slate-400 mt-1.5">يطبق تلقائياً عند اختيار "طالبين" بالحاسبة</p>
                  </div>

                  <div className={`p-5 rounded-2xl border ${dark ? "border-white/10 bg-[#121212]" : "border-black/5 bg-white shadow-sm"}`}>
                    <label className="text-xs font-black text-slate-300 block mb-2">نسبة خصم الابن الثالث فأكثر (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={orchestrationForm.admissionsSettings?.siblingDiscountSecond ?? 15}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setOrchestrationForm({
                          ...orchestrationForm,
                          admissionsSettings: {
                            ...orchestrationForm.admissionsSettings,
                            siblingDiscountSecond: val,
                          },
                        });
                      }}
                      className={`w-full rounded-xl border px-3.5 py-2 text-sm font-bold outline-none ${
                        dark ? "border-white/10 bg-white/5 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                      }`}
                    />
                    <p className="text-[10px] font-bold text-slate-400 mt-1.5">يطبق على الابن الثالث فما فوق</p>
                  </div>

                  <div className={`p-5 rounded-2xl border ${dark ? "border-white/10 bg-[#121212]" : "border-black/5 bg-white shadow-sm"}`}>
                    <label className="text-xs font-black text-slate-300 block mb-2">خصم السداد المبكر دفعة واحدة (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={orchestrationForm.admissionsSettings?.earlyPaymentDiscount ?? 5}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setOrchestrationForm({
                          ...orchestrationForm,
                          admissionsSettings: {
                            ...orchestrationForm.admissionsSettings,
                            earlyPaymentDiscount: val,
                          },
                        });
                      }}
                      className={`w-full rounded-xl border px-3.5 py-2 text-sm font-bold outline-none ${
                        dark ? "border-white/10 bg-white/5 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                      }`}
                    />
                    <p className="text-[10px] font-bold text-slate-400 mt-1.5">يُمنح عند سداد كامل الرسوم السنوية كاش</p>
                  </div>
                </div>

                {/* Grade Tuition Fees Table */}
                <div className={`rounded-2xl border overflow-hidden ${dark ? "border-white/10 bg-[#121212]" : "border-black/5 bg-white shadow-sm"}`}>
                  <div className="p-4 border-b border-current/10 flex items-center justify-between">
                    <span className="text-xs font-black">الرسوم السنوية لكل مرحلة دراسية (ريال سعودي / سنوي)</span>
                    <span className="text-[11px] text-slate-400 font-bold">يتم حساب القسط الفصلي تلقائياً (السنوي ÷ 3)</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead>
                        <tr className={dark ? "border-b border-white/5 bg-white/[0.02]" : "border-b border-black/5 bg-slate-50"}>
                          <th className="p-4 font-black">المرحلة الدراسية</th>
                          <th className="p-4 font-black">رسوم المسار الأهلي (ريال)</th>
                          <th className="p-4 font-black">رسوم المسار الدولي (ريال)</th>
                          <th className="p-4 font-black text-center">القسط الفصلي التقريبي (أهلي)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-current/5">
                        {(orchestrationForm.admissionsSettings?.tuitionFees || DEFAULT_ORCHESTRATION.admissionsSettings!.tuitionFees!).map((feeItem: any, idx: number) => (
                          <tr key={idx} className={dark ? "hover:bg-white/5" : "hover:bg-slate-50"}>
                            <td className="p-4 font-black text-sm">{feeItem.gradeLevel}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={feeItem.nationalAnnual}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const updatedList = [...(orchestrationForm.admissionsSettings?.tuitionFees || DEFAULT_ORCHESTRATION.admissionsSettings!.tuitionFees!)];
                                    updatedList[idx] = { ...updatedList[idx], nationalAnnual: val };
                                    setOrchestrationForm({
                                      ...orchestrationForm,
                                      admissionsSettings: {
                                        ...orchestrationForm.admissionsSettings,
                                        tuitionFees: updatedList,
                                      },
                                    });
                                  }}
                                  className={`w-36 rounded-xl border px-3 py-1.5 text-xs font-black outline-none ${
                                    dark ? "border-white/10 bg-white/5 text-white" : "border-slate-300 bg-white text-slate-900"
                                  }`}
                                />
                                <span className="text-[11px] text-slate-400 font-bold">ريال</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={feeItem.internationalAnnual}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const updatedList = [...(orchestrationForm.admissionsSettings?.tuitionFees || DEFAULT_ORCHESTRATION.admissionsSettings!.tuitionFees!)];
                                    updatedList[idx] = { ...updatedList[idx], internationalAnnual: val };
                                    setOrchestrationForm({
                                      ...orchestrationForm,
                                      admissionsSettings: {
                                        ...orchestrationForm.admissionsSettings,
                                        tuitionFees: updatedList,
                                      },
                                    });
                                  }}
                                  className={`w-36 rounded-xl border px-3 py-1.5 text-xs font-black outline-none ${
                                    dark ? "border-white/10 bg-white/5 text-white" : "border-slate-300 bg-white text-slate-900"
                                  }`}
                                />
                                <span className="text-[11px] text-slate-400 font-bold">ريال</span>
                              </div>
                            </td>
                            <td className="p-4 text-center font-bold text-emerald-400 font-mono">
                              {Math.round(feeItem.nationalAnnual / 3).toLocaleString()} ريال
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 3: REGISTRATION STATUS & SWITCHES */}
            {admissionsSubTab === "settings" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 border-current/10">
                  <div>
                    <h3 className="text-lg font-black flex items-center gap-2">
                      <SlidersHorizontal size={20} className="text-[#f8ca14]" />
                      <span>ضوابط وحالة استقبال طلبات التسجيل الإلكتروني</span>
                    </h3>
                    <p className="text-xs font-bold text-slate-400 mt-1">
                      التحكم في فتح أو إغلاق استقبال الطلبات، وتخصيص رسالة التنبيه التي تظهر لأولياء الأمور.
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={() => {
                      setOrchestrationMutation.mutate({
                        admissionsSettings: orchestrationForm.admissionsSettings,
                      });
                    }}
                    disabled={setOrchestrationMutation.isPending}
                    className="rounded-2xl bg-[#f8ca14] hover:bg-yellow-400 text-black font-black text-xs px-6 py-2.5 shadow-lg shadow-[#f8ca14]/20 gap-2 cursor-pointer"
                  >
                    <CheckCircle2 size={16} />
                    <span>{setOrchestrationMutation.isPending ? "جاري الحفظ..." : "حفظ ضوابط التسجيل"}</span>
                  </Button>
                </div>

                <div className={`p-6 rounded-2xl border space-y-5 ${dark ? "border-white/10 bg-[#121212]" : "border-black/5 bg-white shadow-sm"}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black">حالة فتح باب القبول والتسجيل الإلكتروني</h4>
                      <p className="text-xs text-slate-400 mt-0.5">عند الإيقاف، سيتم تعطيل زر إرسال الطلبات وعرض رسالة اعتذار أنيقة لأولياء الأمور</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const current = orchestrationForm.admissionsSettings?.isOpen ?? true;
                        setOrchestrationForm({
                          ...orchestrationForm,
                          admissionsSettings: {
                            ...orchestrationForm.admissionsSettings,
                            isOpen: !current,
                          },
                        });
                      }}
                      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        (orchestrationForm.admissionsSettings?.isOpen ?? true) ? "bg-emerald-500" : "bg-slate-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow transition ease-in-out duration-200 ${
                          (orchestrationForm.admissionsSettings?.isOpen ?? true) ? "translate-x-0" : "-translate-x-5"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="border-t border-current/10 pt-4">
                    <label className="text-xs font-black text-slate-300 block mb-2">
                      رسالة التنبيه عند إغلاق التسجيل أو اكتمال المقاعد
                    </label>
                    <textarea
                      rows={3}
                      value={orchestrationForm.admissionsSettings?.closedNoticeText ?? "تم اكتمال المقاعد للعام الدراسي الحالي. بإمكانكم تسجيل بياناتكم في قائمة الانتظار."}
                      onChange={(e) => {
                        setOrchestrationForm({
                          ...orchestrationForm,
                          admissionsSettings: {
                            ...orchestrationForm.admissionsSettings,
                            closedNoticeText: e.target.value,
                          },
                        });
                      }}
                      className={`w-full rounded-xl border p-3.5 text-xs font-bold outline-none leading-relaxed ${
                        dark ? "border-white/10 bg-white/5 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* 📚 PILLAR 3: MASTER CONTENT MATRIX & ARTICLES MODERATION        */}
        {/* ============================================================== */}
        {activeTab === "content" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Dedicated Studio Launchers Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <button
                onClick={() => navigate("/")}
                className="p-3.5 rounded-2xl border border-amber-400/30 bg-amber-400/5 hover:bg-amber-400/15 text-right transition group cursor-pointer"
              >
                <Palette size={20} className="text-amber-400 mb-2 group-hover:scale-110 transition" />
                <h4 className="text-xs font-black">المحرر البصري</h4>
                <p className="text-[10px] text-slate-400">تعديل حي على الموقع</p>
              </button>

              <button
                onClick={() => navigate("/journal/manage")}
                className="p-3.5 rounded-2xl border border-current/10 bg-white/[0.02] hover:bg-white/[0.06] text-right transition group cursor-pointer"
              >
                <BookOpen size={20} className="text-yellow-400 mb-2 group-hover:scale-110 transition" />
                <h4 className="text-xs font-black">استوديو المجلات</h4>
                <p className="text-[10px] text-slate-400">الأعداد الدورية 3D</p>
              </button>

              <button
                onClick={() => navigate("/albums/manage")}
                className="p-3.5 rounded-2xl border border-current/10 bg-white/[0.02] hover:bg-white/[0.06] text-right transition group cursor-pointer"
              >
                <Camera size={20} className="text-emerald-400 mb-2 group-hover:scale-110 transition" />
                <h4 className="text-xs font-black">استوديو الألبومات</h4>
                <p className="text-[10px] text-slate-400">توثيق الفعاليات</p>
              </button>

              <button
                onClick={() => navigate("/offers/manage")}
                className="p-3.5 rounded-2xl border border-current/10 bg-white/[0.02] hover:bg-white/[0.06] text-right transition group cursor-pointer"
              >
                <Clapperboard size={20} className="text-red-400 mb-2 group-hover:scale-110 transition" />
                <h4 className="text-xs font-black">الأخبار والعروض</h4>
                <p className="text-[10px] text-slate-400">فيديوهات ومنشورات</p>
              </button>

              <button
                onClick={() => navigate("/articles/manage")}
                className="p-3.5 rounded-2xl border border-current/10 bg-white/[0.02] hover:bg-white/[0.06] text-right transition group cursor-pointer"
              >
                <Newspaper size={20} className="text-blue-400 mb-2 group-hover:scale-110 transition" />
                <h4 className="text-xs font-black">استوديو المقالات</h4>
                <p className="text-[10px] text-slate-400">كتابة مقال جديد</p>
              </button>

              <button
                onClick={() => navigate("/podcast/manage")}
                className="p-3.5 rounded-2xl border border-current/10 bg-white/[0.02] hover:bg-white/[0.06] text-right transition group cursor-pointer"
              >
                <Mic size={20} className="text-purple-400 mb-2 group-hover:scale-110 transition" />
                <h4 className="text-xs font-black">استوديو البودكاست</h4>
                <p className="text-[10px] text-slate-400">أثير العقيق الصوتي</p>
              </button>
            </div>

            {/* Subtabs Bar */}
            <div className="flex items-center gap-2 border-b border-current/10 pb-3 overflow-x-auto scrollbar-hide">
              <button
                type="button"
                onClick={() => setContentSubTab("master")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition cursor-pointer ${
                  contentSubTab === "master"
                    ? dark ? "bg-[#f8ca14] text-black shadow-md" : "bg-[#08467d] text-white shadow-md"
                    : dark ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-white text-slate-700 hover:bg-slate-100 border border-black/5"
                }`}
              >
                <Layers size={15} />
                <span>الجدول الموحد الشامل للمحتوى 📑</span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">{masterContent.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setContentSubTab("articles")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition cursor-pointer ${
                  contentSubTab === "articles"
                    ? dark ? "bg-[#f8ca14] text-black shadow-md" : "bg-[#08467d] text-white shadow-md"
                    : dark ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-white text-slate-700 hover:bg-slate-100 border border-black/5"
                }`}
              >
                <BookOpen size={15} />
                <span>مراجعة واعتماد مقالات الطلاب والمعلمين ✍️</span>
                {pendingArticlesCount > 0 && (
                  <span className="rounded-full bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 animate-pulse">
                    {pendingArticlesCount} معلق
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setContentSubTab("backdrops")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition cursor-pointer ${
                  contentSubTab === "backdrops"
                    ? dark ? "bg-[#f8ca14] text-black shadow-md" : "bg-[#08467d] text-white shadow-md"
                    : dark ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-white text-slate-700 hover:bg-slate-100 border border-black/5"
                }`}
              >
                <Camera size={15} />
                <span>صور الخلفيات المتحركة (مدارسنا · الاعتمادات · القبول) 🖼️✨</span>
              </button>
            </div>

            {/* SUBTAB 1: UNIFIED MASTER CONTENT TABLE */}
            {contentSubTab === "master" && (
              <div className="space-y-6">
                {/* Search & Type Filters */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black">الجدول الموحد لإدارة جميع إصدارات العقيق</h2>
                    <p className="text-xs font-bold text-slate-400 mt-1">
                      استعراض وتعديل ومعاينة المجلات والألبومات والتغطيات في شاشة مركزية واحدة
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 ${
                      dark ? "border-white/10 bg-black/40" : "border-black/10 bg-white shadow-sm"
                    }`}>
                      <Search size={14} className="text-slate-400" />
                      <input
                        type="text"
                        value={contentSearch}
                        onChange={(e) => setContentSearch(e.target.value)}
                        placeholder="بحث في العناوين..."
                        className="bg-transparent text-xs outline-none w-36 sm:w-48 font-bold"
                      />
                    </div>

                    <div className="flex items-center gap-1 rounded-xl border border-current/10 p-1">
                      {[
                        { id: "all", label: "الكل" },
                        { id: "journal", label: "المجلات" },
                        { id: "album", label: "الألبومات" },
                        { id: "post", label: "الأخبار" },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setContentTypeFilter(tab.id as any)}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-black transition cursor-pointer ${
                            contentTypeFilter === tab.id
                              ? dark ? "bg-[#f8ca14] text-black" : "bg-[#08467d] text-white"
                              : "text-slate-400 hover:text-current"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Master Table */}
                <div className={`overflow-hidden rounded-3xl border shadow-md ${dark ? "border-white/10 bg-[#101010]" : "border-black/5 bg-white shadow-slate-200/50"}`}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead className={`border-b text-[11px] font-black uppercase text-slate-400 ${
                        dark ? "border-white/10 bg-white/[0.02]" : "border-black/5 bg-slate-50"
                      }`}>
                        <tr>
                          <th className="p-4 sm:px-6">المحتوى والغلاف</th>
                          <th className="p-4">النوع</th>
                          <th className="p-4">التاريخ / الموسم</th>
                          <th className="p-4">الحجم / الصفحات</th>
                          <th className="p-4">المشاهدات</th>
                          <th className="p-4 sm:px-6 text-center">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-current/5">
                        {filteredContent.map((item) => (
                          <tr key={item.id} className="hover:bg-white/[0.02] transition">
                            <td className="p-4 sm:px-6">
                              <div className="flex items-center gap-3">
                                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-current/10 bg-black">
                                  {item.coverUrl ? (
                                    <img
                                      src={directDriveImage(item.coverUrl) || item.coverUrl}
                                      alt=""
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="grid h-full w-full place-items-center text-slate-500">
                                      {item.type === "journal" ? <BookOpen size={16} /> : item.type === "album" ? <Camera size={16} /> : <Clapperboard size={16} />}
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 max-w-xs">
                                  <p className="font-black text-sm truncate">{item.title}</p>
                                  <span className="text-[10px] text-slate-400 font-mono">ID: {item.id}</span>
                                </div>
                              </div>
                            </td>

                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-black ${
                                item.type === "journal"
                                  ? "bg-[#f8ca14]/20 text-[#f8ca14]"
                                  : item.type === "album"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-[#de191e]/20 text-[#de191e]"
                              }`}>
                                {item.typeLabel}
                              </span>
                            </td>

                            <td className="p-4 text-slate-300 font-bold">{item.date || "—"}</td>
                            <td className="p-4 text-slate-300 font-bold">
                              {item.count ? item.count + (item.type === "journal" ? " صفحة" : " ملف") : "—"}
                            </td>
                            <td className="p-4 font-mono font-bold text-[#f8ca14]">
                              {item.viewsCount?.toLocaleString() || 0}
                            </td>

                            <td className="p-4 sm:px-6">
                              <div className="flex items-center justify-center gap-2">
                                <a
                                  href={item.viewUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={`grid h-8 w-8 place-items-center rounded-lg border transition ${
                                    dark ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10" : "border-black/10 bg-slate-100 text-slate-700 hover:bg-slate-200"
                                  }`}
                                  title="معاينة في الموقع"
                                >
                                  <ExternalLink size={13} />
                                </a>

                                <button
                                  onClick={() => navigate(item.editUrl)}
                                  className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-black transition cursor-pointer ${
                                    dark
                                      ? "bg-[#f8ca14]/15 text-[#f8ca14] hover:bg-[#f8ca14] hover:text-black"
                                      : "bg-[#08467d]/10 text-[#08467d] hover:bg-[#08467d] hover:text-white"
                                  }`}
                                >
                                  <span>تعديل في الاستوديو</span>
                                  <ArrowUpLeft size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 2: ARTICLES REVIEW & AI MODERATION */}
            {contentSubTab === "articles" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black">غرفة مراجعة واعتماد مقالات العقيق ✍️</h2>
                    <p className="text-xs font-bold text-slate-400 mt-1">
                      مراجعة مقالات الطلاب والمعلمين وتدقيقها بالذكاء الاصطناعي وقبول نشرها فوراً
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-black/40 p-1">
                    {(["all", "pending", "published", "rejected"] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setArticleFilterStatus(st)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-black transition cursor-pointer ${
                          articleFilterStatus === st
                            ? "bg-amber-400 text-slate-950 shadow"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {st === "all"
                          ? `الكل (${allAdminArticles.length})`
                          : st === "pending"
                          ? `بانتظار المراجعة (${pendingArticlesCount}) ⏳`
                          : st === "published"
                          ? `المنشورة (${allAdminArticles.filter((a) => a.status === "published").length}) ✅`
                          : `المرفوضة (${allAdminArticles.filter((a) => a.status === "rejected").length})`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Articles Cards Grid */}
                {allAdminArticles.filter((a) => (articleFilterStatus === "all" ? true : a.status === articleFilterStatus)).length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center text-slate-400 text-xs font-bold">
                    لا توجد مقالات في هذه القائمة حالياً.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {allAdminArticles
                      .filter((a) => (articleFilterStatus === "all" ? true : a.status === articleFilterStatus))
                      .map((art) => (
                        <div
                          key={art.id}
                          className={`rounded-3xl border p-5 sm:p-6 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                            art.status === "pending"
                              ? "border-amber-400/40 bg-amber-400/[0.03] shadow-lg shadow-amber-400/5"
                              : art.status === "published"
                              ? dark ? "border-white/10 bg-[#10131d]" : "border-black/10 bg-white"
                              : "border-red-500/20 bg-red-950/10 opacity-70"
                          }`}
                        >
                          <div className="space-y-2 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`rounded-lg px-2.5 py-0.5 text-[10px] font-black ${
                                art.status === "pending"
                                  ? "bg-amber-400/20 text-amber-300 border border-amber-400/30 animate-pulse"
                                  : art.status === "published"
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                  : "bg-red-500/20 text-red-300 border border-red-500/30"
                              }`}>
                                {art.status === "pending"
                                  ? "⏳ بانتظار المراجعة والاعتماد"
                                  : art.status === "published"
                                  ? "✅ منشور على المنصة"
                                  : "❌ مرفوض"}
                              </span>

                              <span className="rounded-lg bg-white/5 px-2 py-0.5 text-[10px] font-black text-amber-200">
                                {art.category}
                              </span>

                              <span className="text-[10px] text-slate-500 font-mono">
                                {new Date(art.createdAt).toLocaleDateString("ar-SA")}
                              </span>
                            </div>

                            <h3 className="text-base font-black text-white">{art.title}</h3>
                            <p className="text-xs text-slate-300 line-clamp-2 leading-5 font-bold">
                              {art.excerpt || art.content.slice(0, 150)}
                            </p>

                            <div className="flex items-center gap-3 text-xs text-slate-400 font-bold pt-1">
                              <span>الكاتب: <b className="text-slate-200">{art.authorName}</b> ({art.authorRole})</span>
                              <span>·</span>
                              <span>👁️ {art.viewCount} قراءة</span>
                              <span>·</span>
                              <span>❤️ {art.likesCount} إعجاب</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                            <Button
                              type="button"
                              onClick={() => setSelectedArticleForEdit(art)}
                              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs h-9 px-4 rounded-xl shadow cursor-pointer"
                            >
                              <BookOpen size={14} className="ml-1.5" />
                              <span>مراجعة وتعديل المقال</span>
                            </Button>

                            {art.status === "pending" && (
                              <Button
                                type="button"
                                onClick={() => moderateArticleMutation.mutate({ id: art.id, status: "published" })}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs h-9 px-3.5 rounded-xl shadow cursor-pointer"
                              >
                                <CheckCircle2 size={14} className="ml-1" />
                                <span>قبول ونشر</span>
                              </Button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                if (confirm("هل أنت متأكد من حذف هذا المقال نهائياً؟")) {
                                  deleteArticleMutation.mutate({ id: art.id });
                                }
                              }}
                              className="grid h-9 w-9 place-items-center rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 hover:bg-red-900/40 transition cursor-pointer"
                              title="حذف المقال"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* SUBTAB 3: SCROLLING BACKDROPS MANAGER */}
            {contentSubTab === "backdrops" && (
              <BackdropsManager
                orchestrationForm={orchestrationForm}
                setOrchestrationForm={setOrchestrationForm}
                onSave={() => setOrchestrationMutation.mutate(orchestrationForm)}
                isSaving={setOrchestrationMutation.isPending}
                dark={dark}
              />
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* 📢 PILLAR 4: COMMS, BROADCASTS & CAMPAIGNS                     */}
        {/* ============================================================== */}
        {activeTab === "campaigns" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Subtabs Bar */}
            <div className="flex items-center gap-2 border-b border-current/10 pb-3 overflow-x-auto scrollbar-hide">
              <button
                type="button"
                onClick={() => setCampaignsSubTab("broadcast")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition cursor-pointer ${
                  campaignsSubTab === "broadcast"
                    ? dark ? "bg-[#f8ca14] text-black shadow-md" : "bg-[#08467d] text-white shadow-md"
                    : dark ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-white text-slate-700 hover:bg-slate-100 border border-black/5"
                }`}
              >
                <Megaphone size={15} />
                <span>شريط التنبيهات العاجل والاحتفالي للموقع 📣</span>
                {broadcastEnabled && <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />}
              </button>

              <button
                type="button"
                onClick={() => setCampaignsSubTab("whatsapp")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition cursor-pointer ${
                  campaignsSubTab === "whatsapp"
                    ? dark ? "bg-[#f8ca14] text-black shadow-md" : "bg-[#08467d] text-white shadow-md"
                    : dark ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-white text-slate-700 hover:bg-slate-100 border border-black/5"
                }`}
              >
                <Share2 size={15} />
                <span>حملات ورسائل الواتساب وQR 💬</span>
              </button>

              <button
                type="button"
                onClick={() => setCampaignsSubTab("radio")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition cursor-pointer ${
                  campaignsSubTab === "radio"
                    ? dark ? "bg-[#f8ca14] text-black shadow-md" : "bg-[#08467d] text-white shadow-md"
                    : dark ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-white text-slate-700 hover:bg-slate-100 border border-black/5"
                }`}
              >
                <Headphones size={15} />
                <span>أغاني وراديو العقيق والنشيد المدرسي 🎵</span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">{(orchestrationForm.schoolSongs || []).length}</span>
              </button>
            </div>

            {/* SUBTAB 1: EMERGENCY & CELEBRATION BROADCAST BANNER */}
            {campaignsSubTab === "broadcast" && (
              <div className="max-w-4xl space-y-6">
                <div>
                  <h2 className="text-xl font-black">إدارة شريط التنبيهات والأخبار العاجلة للموقع</h2>
                  <p className="text-xs font-bold text-slate-400 mt-1">
                    شريط بارز يظهر في أعلى صفحات الموقع لتنبيه أولياء الأمور والطلاب بالأمور الطارئة أو الاحتفالية
                  </p>
                </div>

                {/* Broadcast Live Preview */}
                <div className="space-y-2">
                  <span className="text-xs font-black text-slate-400 block">معاينة شكل التنبيه في قمة الموقع:</span>
                  <div className={`p-4 rounded-2xl flex items-center justify-between gap-4 text-xs font-black transition ${
                    broadcastType === "urgent"
                      ? "bg-red-600 text-white shadow-lg shadow-red-500/20"
                      : broadcastType === "celebration"
                      ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-lg shadow-amber-500/20"
                      : "bg-[#08467d] text-white shadow-lg shadow-[#08467d]/20"
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <Megaphone size={16} />
                      <span>{broadcastMessage || "نص التنبيه العاجل يظهر هنا..."}</span>
                    </div>
                    {broadcastLink && (
                      <span className="underline text-[11px] shrink-0">
                        {broadcastLinkText || "اضغط للتفاصيل"} ←
                      </span>
                    )}
                  </div>
                </div>

                {/* Edit Form */}
                <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${dark ? "border-white/10 bg-[#101010]" : "border-black/5 bg-white shadow-sm"}`}>
                  <div className="flex items-center justify-between border-b pb-4 border-current/10">
                    <div>
                      <h4 className="text-sm font-black">حالة تفعيل شريط التنبيه</h4>
                      <p className="text-xs text-slate-400">تشغيل أو إيقاف ظهور الشريط في الموقع فوراً</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBroadcastEnabled(!broadcastEnabled)}
                      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        broadcastEnabled ? "bg-emerald-500" : "bg-slate-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow transition ease-in-out duration-200 ${
                          broadcastEnabled ? "translate-x-0" : "-translate-x-5"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-black text-slate-300 block mb-2">نوع وطابع التنبيه</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: "urgent", label: "🚨 عاجل وهام (أحمر)", desc: "تعليق دراسة، طوارئ" },
                          { id: "celebration", label: "🎉 مناسبة واحتفال (ذهبي)", desc: "يوم وطني، إنجاز" },
                          { id: "info", label: "ℹ️ تنويه عام (كحلي)", desc: "إعلان، موعد تسجيل" },
                        ].map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setBroadcastType(t.id as any)}
                            className={`p-3 rounded-2xl border text-right transition cursor-pointer ${
                              broadcastType === t.id
                                ? "border-amber-400 bg-amber-400/10 text-amber-300 shadow"
                                : dark ? "border-white/10 bg-white/5 text-slate-400" : "border-black/10 bg-slate-50 text-slate-600"
                            }`}
                          >
                            <span className="text-xs font-black block">{t.label}</span>
                            <span className="text-[10px] opacity-75">{t.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-black text-slate-300 block mb-1">نص رسالة التنبيه</label>
                      <textarea
                        rows={2}
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        placeholder="مثال: تعليق الدراسة الحضورية غداً وتحويلها عن بُعد عبر منصة مدرستي حرصاً على سلامة أبنائنا..."
                        className={`w-full rounded-xl border p-3 text-xs font-bold outline-none leading-relaxed ${
                          dark ? "border-white/10 bg-white/5 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-black text-slate-300 block mb-1">رابط التفاصيل (اختياري)</label>
                        <input
                          type="url"
                          value={broadcastLink}
                          onChange={(e) => setBroadcastLink(e.target.value)}
                          placeholder="https://... أو /news-offers"
                          className={`w-full rounded-xl border p-2.5 text-xs font-mono outline-none ${
                            dark ? "border-white/10 bg-white/5 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-black text-slate-300 block mb-1">نص زر الرابط</label>
                        <input
                          type="text"
                          value={broadcastLinkText}
                          onChange={(e) => setBroadcastLinkText(e.target.value)}
                          placeholder="اضغط للتفاصيل"
                          className={`w-full rounded-xl border p-2.5 text-xs font-bold outline-none ${
                            dark ? "border-white/10 bg-white/5 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button
                        type="button"
                        onClick={() => {
                          setBroadcastMutation.mutate({
                            id: editingBroadcastId || undefined,
                            enabled: broadcastEnabled,
                            message: broadcastMessage,
                            type: broadcastType,
                            link: broadcastLink,
                            linkText: broadcastLinkText,
                          });
                        }}
                        disabled={setBroadcastMutation.isPending}
                        className="rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-6 py-2.5 shadow-lg shadow-amber-400/20 cursor-pointer"
                      >
                        <CheckCircle2 size={16} className="ml-1" />
                        <span>{setBroadcastMutation.isPending ? "جاري الحفظ..." : "حفظ ونشر التنبيه فوراً"}</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Saved Broadcasts List */}
                {broadcastList.length > 0 && (
                  <div className={`p-6 rounded-3xl border space-y-4 ${dark ? "border-white/10 bg-[#101010]" : "border-black/5 bg-white shadow-sm"}`}>
                    <h4 className="text-xs font-black text-slate-400">سجل التنبيهات المحفوظة</h4>
                    <div className="space-y-2">
                      {broadcastList.map((b: any) => (
                        <div key={b.id} className="flex items-center justify-between p-3 rounded-2xl border border-current/10 text-xs">
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${b.enabled ? "bg-emerald-500" : "bg-slate-500"}`} />
                            <span className="font-bold">{b.message}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingBroadcastId(b.id);
                                setBroadcastEnabled(b.enabled);
                                setBroadcastMessage(b.message);
                                setBroadcastType(b.type);
                                setBroadcastLink(b.link || "");
                                setBroadcastLinkText(b.linkText || "");
                                toast.info("تم تحميل بيانات التنبيه للنموذج بالأعلى للتعديل");
                              }}
                              className="text-amber-400 text-xs font-bold hover:underline cursor-pointer"
                            >
                              تعديل
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteBroadcastMutation.mutate({ id: b.id })}
                              className="text-red-400 text-xs font-bold hover:underline cursor-pointer"
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUBTAB 2: WHATSAPP CAMPAIGNS GENERATOR */}
            {campaignsSubTab === "whatsapp" && (
              <div className="max-w-3xl space-y-6">
                <div>
                  <h2 className="text-xl font-black">مُولّد حملات ورسائل الواتساب وQR</h2>
                  <p className="text-xs font-bold text-slate-400 mt-1">
                    تجهيز رسائل إعلامية منسقة بضغطة زر لنشرها في قروبات أولياء الأمور والطلاب والمعلمين
                  </p>
                </div>

                <div className={`rounded-3xl border p-6 sm:p-8 space-y-6 shadow-md ${dark ? "border-white/10 bg-[#101010]" : "border-black/5 bg-white shadow-slate-200/50"}`}>
                  <div>
                    <label className="block text-xs font-black text-slate-400 mb-2">اختر المحتوى المراد تجهيز حملته</label>
                    <select
                      value={selectedCampaignItem}
                      onChange={(e) => setSelectedCampaignItem(e.target.value)}
                      className={`w-full rounded-2xl border p-4 text-xs font-black outline-none cursor-pointer ${
                        dark ? "border-white/10 bg-black/50 text-white" : "border-black/10 bg-slate-50 text-slate-900"
                      }`}
                    >
                      <option value="">-- اختر من المحتوى المنشور --</option>
                      {masterContent.map((item) => (
                        <option key={item.id} value={item.id}>
                          [{item.typeLabel}] {item.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {campaignItemData ? (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-black text-slate-400 mb-2">الرسالة المنسقة المجهزة للواتساب</label>
                        <div className={`relative rounded-2xl border p-5 font-mono text-xs leading-relaxed whitespace-pre-wrap ${
                          dark ? "border-white/10 bg-black/60 text-slate-200" : "border-black/10 bg-slate-50 text-slate-800"
                        }`}>
                          {generatedWhatsAppMessage}

                          <div className="mt-4 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(generatedWhatsAppMessage);
                                toast.success("تم نسخ نص الرسالة للحافظة بنجاح!");
                              }}
                              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-black text-white transition shadow-md cursor-pointer"
                            >
                              <Copy size={14} />
                              <span>نسخ الرسالة</span>
                            </button>

                            <a
                              href={`https://wa.me/?text=${encodeURIComponent(generatedWhatsAppMessage)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20b558] px-4 py-2 text-xs font-black text-white transition shadow-md"
                            >
                              <MessageCircle size={14} />
                              <span>فتح في واتساب ويب مباشرة</span>
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* QR Code Generator */}
                      <div className="border-t pt-6 border-current/10">
                        <h4 className="text-sm font-black mb-3">رمز QR المباشر للمحتوى</h4>
                        <div className="flex flex-col sm:flex-row items-center gap-5">
                          <div className="h-36 w-36 rounded-2xl bg-white p-2.5 shadow-lg flex items-center justify-center">
                            <img
                              src={"https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=" + encodeURIComponent(window.location.origin + campaignItemData.viewUrl)}
                              alt="QR Code"
                              className="h-full w-full object-contain"
                            />
                          </div>
                          <div className="space-y-2 text-center sm:text-right">
                            <p className="text-xs font-bold text-slate-400">
                              رمز استجابة سريع عالي الدقة، جاهز للطباعة أو الإرفاق مع النشرات المدرسية لفتح المحتوى مباشرة من كاميرا الجوال.
                            </p>
                            <a
                              href={"https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=" + encodeURIComponent(window.location.origin + campaignItemData.viewUrl)}
                              target="_blank"
                              rel="noreferrer"
                              download="aqeeq-qr-code.png"
                              className="inline-flex items-center gap-1.5 rounded-xl border border-current/20 px-3.5 py-2 text-xs font-black transition hover:bg-white/10"
                            >
                              <Download size={14} />
                              <span>تحميل صورة QR بدقة عالية</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-400 font-bold">
                      اختر أحد أعداد المجلات أو ألبومات الفعاليات بالأعلى لتوليد رسالة الواتساب ورمز QR فوراً.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUBTAB 3: SCHOOL SONGS & SPOTIFY ENGINE */}
            {campaignsSubTab === "radio" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className={`rounded-3xl border p-6 sm:p-8 space-y-6 shadow-md ${dark ? "border-white/10 bg-[#101010]" : "border-black/5 bg-white"}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 border-current/10">
                    <div className="flex items-center gap-4">
                      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-tr from-[#f8ca14] to-amber-600 text-black font-black shadow-lg shadow-amber-400/20">
                        <Headphones size={26} />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-black font-cairo">أغاني وراديو العقيق 🎵 (Spotify Engine)</h2>
                        <p className="text-xs sm:text-sm font-bold text-slate-400">إدارة الأناشيد والأغاني المدرسية التي تعمل في المشغل الصوتي الموحد</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setNewSongTitle("");
                          setNewSongArtist("");
                          setNewSongUrl("");
                          setNewSongCategory("النشيد المدرسي");
                          setNewSongCover("");
                          setIsAddSongOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#f8ca14] text-black font-black text-xs hover:bg-yellow-400 transition shadow-lg shadow-[#f8ca14]/20 active:scale-95 cursor-pointer"
                      >
                        <Plus size={15} />
                        <span>إضافة نشيد يدوي</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsImportAudioFolderOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-current/20 bg-white/5 hover:bg-white/10 text-xs font-black transition cursor-pointer"
                      >
                        <FolderSync size={15} />
                        <span>استيراد مجلد من Drive 📁</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setOrchestrationMutation.mutate(orchestrationForm)}
                        disabled={setOrchestrationMutation.isPending}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500 text-white font-black text-xs hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        <CheckCircle2 size={16} />
                        <span>{setOrchestrationMutation.isPending ? "جاري الحفظ..." : "حفظ ونشر التعديلات"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Songs List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(orchestrationForm.schoolSongs || []).map((song: any, idx: number) => (
                      <div
                        key={song.id || idx}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition ${
                          dark ? "border-white/10 bg-black/40 hover:border-white/20" : "border-black/5 bg-slate-50 hover:border-black/15"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="relative h-12 w-12 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-black shadow-md">
                            <img
                              src={
                                (!song.coverUrl || song.coverUrl.includes("logo") || song.coverUrl.includes("og-"))
                                  ? (dark ? "/audio-default-cover-dark.svg" : "/audio-default-cover-light.svg")
                                  : (directDriveImage(song.coverUrl) || song.coverUrl)
                              }
                              alt=""
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = dark ? "/audio-default-cover-dark.svg" : "/audio-default-cover-light.svg";
                              }}
                            />
                          </div>
                          <div className="min-w-0">
                            <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-400/10 text-amber-400 border border-amber-400/20 mb-1">
                              {song.category || "نشيد مدرسي"}
                            </span>
                            <h4 className="text-sm font-black truncate">{song.title}</h4>
                            <p className="text-xs text-slate-400 truncate">{song.artist || "مدارس العقيق"}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = (orchestrationForm.schoolSongs || []).filter((_: any, i: number) => i !== idx);
                            setOrchestrationForm({ ...orchestrationForm, schoolSongs: updated });
                            toast.info("تم حذف النشيد. اضغط 'حفظ ونشر التعديلات' لتثبيت التغيير.");
                          }}
                          className="grid h-9 w-9 place-items-center rounded-xl text-[#de191e] hover:bg-[#de191e]/10 transition cursor-pointer"
                          title="حذف النشيد"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* ⚙️ PILLAR 5: SYSTEM CORE, SECURITY & NATIONAL THEME             */}
        {/* ============================================================== */}
        {activeTab === "system" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Subtabs Bar */}
            <div className="flex items-center gap-2 border-b border-current/10 pb-3 overflow-x-auto scrollbar-hide">
              <button
                type="button"
                onClick={() => setSystemSubTab("theme")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition cursor-pointer ${
                  systemSubTab === "theme"
                    ? dark ? "bg-[#f8ca14] text-black shadow-md" : "bg-[#08467d] text-white shadow-md"
                    : dark ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-white text-slate-700 hover:bg-slate-100 border border-black/5"
                }`}
              >
                <Palette size={15} />
                <span>محرك الهوية والمناسبات الوطنية (اليوم الوطني 94) 🇸🇦</span>
              </button>

              <button
                type="button"
                onClick={() => setSystemSubTab("users")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition cursor-pointer ${
                  systemSubTab === "users"
                    ? dark ? "bg-[#f8ca14] text-black shadow-md" : "bg-[#08467d] text-white shadow-md"
                    : dark ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-white text-slate-700 hover:bg-slate-100 border border-black/5"
                }`}
              >
                <Users size={15} />
                <span>المشرفين والصلاحيات 👥</span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">{usersList.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setSystemSubTab("campuses")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition cursor-pointer ${
                  systemSubTab === "campuses"
                    ? dark ? "bg-[#f8ca14] text-black shadow-md" : "bg-[#08467d] text-white shadow-md"
                    : dark ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-white text-slate-700 hover:bg-slate-100 border border-black/5"
                }`}
              >
                <Building2 size={15} />
                <span>مجمعات المدارس والتواصل 📍</span>
              </button>

              <button
                type="button"
                onClick={() => setSystemSubTab("marketing")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition cursor-pointer ${
                  systemSubTab === "marketing"
                    ? dark ? "bg-[#f8ca14] text-black shadow-md" : "bg-[#08467d] text-white shadow-md"
                    : dark ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-white text-slate-700 hover:bg-slate-100 border border-black/5"
                }`}
              >
                <TrendingUp size={15} />
                <span>بكسلات التتبع وسيو المنصة 📊</span>
              </button>

              <button
                type="button"
                onClick={() => setSystemSubTab("backup")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition cursor-pointer ${
                  systemSubTab === "backup"
                    ? dark ? "bg-[#f8ca14] text-black shadow-md" : "bg-[#08467d] text-white shadow-md"
                    : dark ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-white text-slate-700 hover:bg-slate-100 border border-black/5"
                }`}
              >
                <Database size={15} />
                <span>المزامنة السحابية والنسخ الاحتياطي 💾</span>
              </button>
            </div>

            {/* SUBTAB 1: NATIONAL OCCASIONS THEME ENGINE */}
            {systemSubTab === "theme" && (
              <div className="max-w-4xl space-y-6">
                <div>
                  <h2 className="text-xl font-black">محرك سيمات وهوية المناسبات الوطنية (Theme Engine)</h2>
                  <p className="text-xs font-bold text-slate-400 mt-1">
                    تحويل هوية وألوان وزخارف الموقع بالكامل إلى سيم اليوم الوطني السعودي 94 بضغطة زر واحدة
                  </p>
                </div>

                <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${dark ? "border-white/10 bg-[#101010]" : "border-black/5 bg-white shadow-sm"}`}>
                  <div className="flex items-center justify-between border-b pb-4 border-current/10">
                    <div>
                      <h4 className="text-sm font-black">تفعيل سيم اليوم الوطني السعودي 94 🇸🇦</h4>
                      <p className="text-xs text-slate-400">تطبيق الألوان الخضراء الملكية، الزخارف النجدية والحجازية، وشارة نحلم ونحقق</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newTheme = themeForm.activeTheme === "saudi-national-day" ? "default" : "saudi-national-day";
                        setThemeForm({ ...themeForm, activeTheme: newTheme });
                      }}
                      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        themeForm.activeTheme === "saudi-national-day" ? "bg-emerald-600" : "bg-slate-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow transition ease-in-out duration-200 ${
                          themeForm.activeTheme === "saudi-national-day" ? "translate-x-0" : "-translate-x-5"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-black text-slate-300 block mb-1">نص الشارة الاحتفالية</label>
                        <input
                          type="text"
                          value={themeForm.customBadgeText}
                          onChange={(e) => setThemeForm({ ...themeForm, customBadgeText: e.target.value })}
                          className={`w-full rounded-xl border p-2.5 text-xs font-bold outline-none ${
                            dark ? "border-white/10 bg-white/5 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                          }`}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-black text-slate-300 block mb-1">نمط وهوية الاحتفال (Variant)</label>
                        <select
                          value={themeForm.templateVariant}
                          onChange={(e) => setThemeForm({ ...themeForm, templateVariant: e.target.value as any })}
                          className={`w-full rounded-xl border p-2.5 text-xs font-bold outline-none cursor-pointer ${
                            dark ? "border-white/10 bg-black/50 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                          }`}
                        >
                          <option value="general">العام — نحلم ونحقق 94</option>
                          <option value="generosity">كرم العقيق وجود المدينة</option>
                          <option value="authenticity">أصالة وتاريخ طيبة الطيبة</option>
                          <option value="vision">رؤية المملكة الطموحة 2030</option>
                          <option value="giving">عطاء ونماء المستقبل</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-current/10 pt-4">
                      <div>
                        <h4 className="text-xs font-black">إظهار الشريط الاحتفالي والزخارف العليا</h4>
                        <p className="text-[11px] text-slate-400">شريط رفيع متحرك بنقوش السيفين والنخلة في أعلى الهيدر</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={themeForm.showCelebrationRibbon}
                        onChange={(e) => setThemeForm({ ...themeForm, showCelebrationRibbon: e.target.checked })}
                        className="rounded cursor-pointer"
                      />
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button
                        type="button"
                        onClick={() => {
                          setActiveThemeMutation.mutate(themeForm);
                        }}
                        disabled={setActiveThemeMutation.isPending}
                        className="rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-6 py-2.5 shadow-lg shadow-emerald-600/20 cursor-pointer"
                      >
                        <CheckCircle2 size={16} className="ml-1" />
                        <span>{setActiveThemeMutation.isPending ? "جاري الحفظ..." : "حفظ وتفعيل ثيم المناسبة"}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 2: ADMIN USERS & ACCESS CONTROL */}
            {systemSubTab === "users" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black">إدارة المشرفين والصلاحيات والأمان</h2>
                    <p className="text-xs font-bold text-slate-400 mt-1">
                      إضافة أعضاء جدد لفريق العمل، تعيين الصلاحيات، وإعادة تعيين كلمات المرور
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={() => setIsAddUserOpen(true)}
                    className="rounded-2xl bg-amber-400 hover:bg-yellow-400 text-black font-black text-xs px-5 py-2.5 shadow-lg shadow-amber-400/20 cursor-pointer gap-2"
                  >
                    <Plus size={16} />
                    <span>إضافة مشرف جديد</span>
                  </Button>
                </div>

                <div className={`overflow-hidden rounded-3xl border shadow-md ${dark ? "border-white/10 bg-[#101010]" : "border-black/5 bg-white shadow-slate-200/50"}`}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead className={`border-b text-[11px] font-black uppercase text-slate-400 ${
                        dark ? "border-white/10 bg-white/[0.02]" : "border-black/5 bg-slate-50"
                      }`}>
                        <tr>
                          <th className="p-4 sm:px-6">المشرف والبريد</th>
                          <th className="p-4">اسم المستخدم</th>
                          <th className="p-4">مستوى الصلاحية</th>
                          <th className="p-4">تاريخ الإنشاء</th>
                          <th className="p-4 sm:px-6 text-center">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-current/5">
                        {usersList.map((u: any) => (
                          <tr key={u.id} className="hover:bg-white/[0.02] transition">
                            <td className="p-4 sm:px-6">
                              <div className="flex items-center gap-3">
                                <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 text-black font-black text-xs">
                                  {u.name?.[0] || "U"}
                                </div>
                                <div>
                                  <p className="font-black text-sm">{u.name}</p>
                                  <span className="text-[11px] text-slate-400">{u.email || "بدون بريد"}</span>
                                </div>
                              </div>
                            </td>

                            <td className="p-4 font-mono font-bold text-slate-300">{u.openId || u.id}</td>

                            <td className="p-4">
                              <select
                                value={u.role || "admin"}
                                onChange={(e) => updateRoleMutation.mutate({ userId: u.id, role: e.target.value as any })}
                                className="rounded-xl border border-current/20 bg-transparent px-3 py-1 text-xs font-black outline-none cursor-pointer"
                              >
                                <option value="admin">مدير عام (Admin)</option>
                                <option value="coordinator">منسق محتوى (Coordinator)</option>
                                <option value="receptionist">مسؤول قبول (Receptionist)</option>
                                <option value="auditor">مدقق لغوي (Auditor)</option>
                              </select>
                            </td>

                            <td className="p-4 text-slate-400 font-mono text-[11px]">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString("ar-SA") : "—"}
                            </td>

                            <td className="p-4 sm:px-6 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setResetPassUserId(u.id);
                                    setNewPasswordValue("");
                                  }}
                                  className="rounded-xl border border-current/15 px-3 py-1.5 text-[11px] font-bold hover:bg-white/10 transition cursor-pointer"
                                >
                                  كلمة المرور
                                </button>

                                {u.id !== user?.id && (
                                  <button
                                    type="button"
                                    onClick={() => setDeleteUserId(u.id)}
                                    className="grid h-8 w-8 place-items-center rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                                    title="حذف المشرف"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 3: CAMPUSES & DIRECTORY */}
            {systemSubTab === "campuses" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 border-current/10">
                  <div>
                    <h3 className="text-lg font-black flex items-center gap-2">
                      <Building2 size={20} className="text-[#f8ca14]" />
                      <span>إدارة مجمعات مدارس العقيق وبيانات التواصل المعتمدة</span>
                    </h3>
                    <p className="text-xs font-bold text-slate-400 mt-1">
                      تعديل هواتف الاستقبال لمجمعي البنين والبنات، العناوين الرسمية، وروابط خرائط Google Maps
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={() => {
                      setOrchestrationMutation.mutate({
                        schoolCampuses: orchestrationForm.schoolCampuses,
                        nav: orchestrationForm.nav,
                      });
                    }}
                    disabled={setOrchestrationMutation.isPending}
                    className="rounded-2xl bg-[#f8ca14] hover:bg-yellow-400 text-black font-black text-xs px-6 py-2.5 shadow-lg shadow-[#f8ca14]/20 gap-2 cursor-pointer"
                  >
                    <CheckCircle2 size={16} />
                    <span>{setOrchestrationMutation.isPending ? "جاري الحفظ..." : "حفظ بيانات المجمعات والتواصل"}</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Boys Campus Card */}
                  <div className={`p-6 rounded-3xl border space-y-4 ${dark ? "border-emerald-500/20 bg-[#0c141a]" : "border-emerald-700/15 bg-white shadow-sm"}`}>
                    <div className="flex items-center gap-3 border-b pb-3 border-current/10">
                      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black">مجمع البنين — طيبة الطيبة</h4>
                        <p className="text-[11px] text-slate-400">أهلي ودولي (ابتدائي ومتوسط وثانوي)</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-black text-slate-300 block mb-1">هاتف الاستقبال والتسجيل (مجمع البنين)</label>
                      <input
                        type="tel"
                        value={orchestrationForm.schoolCampuses?.boysPhone ?? "0148131652"}
                        onChange={(e) => setOrchestrationForm({
                          ...orchestrationForm,
                          schoolCampuses: { ...orchestrationForm.schoolCampuses, boysPhone: e.target.value.trim() },
                        })}
                        className={`w-full rounded-xl border p-2.5 text-xs font-bold outline-none font-mono ${
                          dark ? "border-white/10 bg-white/5 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black text-slate-300 block mb-1">العنوان والوصف الجغرافي</label>
                      <input
                        type="text"
                        value={orchestrationForm.schoolCampuses?.boysAddress ?? "مجمع الرانوناء — ممشى الهجرة بالمدينة المنورة"}
                        onChange={(e) => setOrchestrationForm({
                          ...orchestrationForm,
                          schoolCampuses: { ...orchestrationForm.schoolCampuses, boysAddress: e.target.value },
                        })}
                        className={`w-full rounded-xl border p-2.5 text-xs font-bold outline-none ${
                          dark ? "border-white/10 bg-white/5 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black text-slate-300 block mb-1">رابط خرائط Google Maps</label>
                      <input
                        type="url"
                        value={orchestrationForm.schoolCampuses?.boysMapUrl ?? "https://maps.google.com/?q=Alaqeeq+Schools+Madinah"}
                        onChange={(e) => setOrchestrationForm({
                          ...orchestrationForm,
                          schoolCampuses: { ...orchestrationForm.schoolCampuses, boysMapUrl: e.target.value.trim() },
                        })}
                        className={`w-full rounded-xl border p-2.5 text-xs font-bold outline-none font-mono ${
                          dark ? "border-white/10 bg-white/5 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Girls Campus Card */}
                  <div className={`p-6 rounded-3xl border space-y-4 ${dark ? "border-[#08467d]/40 bg-[#08467d]/10" : "border-[#08467d]/20 bg-white shadow-sm"}`}>
                    <div className="flex items-center gap-3 border-b pb-3 border-current/10">
                      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#08467d]/20 text-[#08467d] dark:text-[#f8ca14]">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black">مجمع البنات ورياض الأطفال — طيبة الطيبة</h4>
                        <p className="text-[11px] text-slate-400">أهلي ودولي (روضة وحضانة وابتدائي ومتوسط وثانوي)</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-black text-slate-300 block mb-1">هاتف الاستقبال والتسجيل (مجمع البنات)</label>
                      <input
                        type="tel"
                        value={orchestrationForm.schoolCampuses?.girlsPhone ?? "0148644466"}
                        onChange={(e) => setOrchestrationForm({
                          ...orchestrationForm,
                          schoolCampuses: { ...orchestrationForm.schoolCampuses, girlsPhone: e.target.value.trim() },
                        })}
                        className={`w-full rounded-xl border p-2.5 text-xs font-bold outline-none font-mono ${
                          dark ? "border-white/10 bg-white/5 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black text-slate-300 block mb-1">العنوان والوصف الجغرافي</label>
                      <input
                        type="text"
                        value={orchestrationForm.schoolCampuses?.girlsAddress ?? "مجمع الرانوناء — ممشى الهجرة بالمدينة المنورة"}
                        onChange={(e) => setOrchestrationForm({
                          ...orchestrationForm,
                          schoolCampuses: { ...orchestrationForm.schoolCampuses, girlsAddress: e.target.value },
                        })}
                        className={`w-full rounded-xl border p-2.5 text-xs font-bold outline-none ${
                          dark ? "border-white/10 bg-white/5 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black text-slate-300 block mb-1">رابط خرائط Google Maps</label>
                      <input
                        type="url"
                        value={orchestrationForm.schoolCampuses?.girlsMapUrl ?? "https://maps.google.com/?q=Alaqeeq+Schools+Madinah"}
                        onChange={(e) => setOrchestrationForm({
                          ...orchestrationForm,
                          schoolCampuses: { ...orchestrationForm.schoolCampuses, girlsMapUrl: e.target.value.trim() },
                        })}
                        className={`w-full rounded-xl border p-2.5 text-xs font-bold outline-none font-mono ${
                          dark ? "border-white/10 bg-white/5 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 4: MARKETING PIXELS & SEO */}
            {systemSubTab === "marketing" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className={`rounded-3xl border p-6 sm:p-8 space-y-6 shadow-xl ${dark ? "border-white/10 bg-[#12141a]" : "border-black/5 bg-white"}`}>
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 border-current/10">
                    <div>
                      <h3 className="text-xl font-black">أكواد وبكسل منصات التسويق (Tracking Pixels)</h3>
                      <p className="text-xs text-slate-400 mt-1 font-bold">
                        تتبع الحملات الإعلانية ومعدلات تحويل نماذج القبول والتسجيل
                      </p>
                    </div>

                    <Button
                      type="button"
                      onClick={() => {
                        setOrchestrationMutation.mutate({
                          marketingPixels: orchestrationForm.marketingPixels,
                        });
                      }}
                      disabled={setOrchestrationMutation.isPending}
                      className="rounded-2xl bg-amber-400 hover:bg-yellow-400 text-black font-black text-xs px-6 py-2.5 shadow-lg shadow-amber-400/20 gap-2 cursor-pointer"
                    >
                      <CheckCircle2 size={16} />
                      <span>{setOrchestrationMutation.isPending ? "جاري الحفظ..." : "حفظ إعدادات التسويق"}</span>
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-amber-400 mb-1">Snapchat Pixel ID 👻:</label>
                      <input
                        type="text"
                        value={orchestrationForm.marketingPixels?.snapchatPixelId || ""}
                        onChange={(e) => setOrchestrationForm({
                          ...orchestrationForm,
                          marketingPixels: { ...orchestrationForm.marketingPixels, snapchatPixelId: e.target.value },
                        })}
                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                        className={`w-full rounded-xl border p-2.5 text-xs font-mono outline-none ${
                          dark ? "border-white/10 bg-black/40 text-white" : "border-black/10 bg-white"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-blue-400 mb-1">Meta / Facebook Pixel ID 🔵:</label>
                      <input
                        type="text"
                        value={orchestrationForm.marketingPixels?.metaPixelId || ""}
                        onChange={(e) => setOrchestrationForm({
                          ...orchestrationForm,
                          marketingPixels: { ...orchestrationForm.marketingPixels, metaPixelId: e.target.value },
                        })}
                        placeholder="123456789012345"
                        className={`w-full rounded-xl border p-2.5 text-xs font-mono outline-none ${
                          dark ? "border-white/10 bg-black/40 text-white" : "border-black/10 bg-white"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-red-400 mb-1">TikTok Pixel ID 🎵:</label>
                      <input
                        type="text"
                        value={orchestrationForm.marketingPixels?.tiktokPixelId || ""}
                        onChange={(e) => setOrchestrationForm({
                          ...orchestrationForm,
                          marketingPixels: { ...orchestrationForm.marketingPixels, tiktokPixelId: e.target.value },
                        })}
                        placeholder="CXXXXXXXXXXXXXXXXX"
                        className={`w-full rounded-xl border p-2.5 text-xs font-mono outline-none ${
                          dark ? "border-white/10 bg-black/40 text-white" : "border-black/10 bg-white"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-emerald-400 mb-1">Google Analytics ID (GA4) 📊:</label>
                      <input
                        type="text"
                        value={orchestrationForm.marketingPixels?.googleAnalyticsId || ""}
                        onChange={(e) => setOrchestrationForm({
                          ...orchestrationForm,
                          marketingPixels: { ...orchestrationForm.marketingPixels, googleAnalyticsId: e.target.value },
                        })}
                        placeholder="G-XXXXXXXXXX"
                        className={`w-full rounded-xl border p-2.5 text-xs font-mono outline-none ${
                          dark ? "border-white/10 bg-black/40 text-white" : "border-black/10 bg-white"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* UNIVERSAL SOCIAL SHARE & OPENGRAPH HUB (Dual Engine: Auto vs Custom) */}
                <div className={`rounded-3xl border p-6 sm:p-8 space-y-8 shadow-xl ${dark ? "border-white/10 bg-[#12141a]" : "border-black/5 bg-white"}`}>
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5 border-current/10">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black bg-amber-400/10 text-amber-500 border border-amber-400/20">
                        <Share2 size={13} />
                        <span>محرك المشاركة الاجتماعية الذكي (Social Virality Hub)</span>
                      </div>
                      <h3 className="text-xl font-black">بطاقات المشاركة لشبكات التواصل وواتساب (OpenGraph & Meta)</h3>
                      <p className="text-xs text-slate-400 font-bold max-w-2xl">
                        تحكم في شكل العنوان، الوصف، والصورة عند إرسال روابط الموقع عبر واتساب، تويتر، وفيسبوك. يدعم المحرك المزدوج (التحديث التلقائي الذكي أو التخصيص اليدوي) لكل صفحة بشكل مستقل.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        onClick={copyCacheBusterLink}
                        variant="outline"
                        className={`rounded-2xl text-xs font-black px-4 py-2 gap-1.5 cursor-pointer ${
                          dark ? "border-white/10 hover:bg-white/5 text-amber-400" : "border-black/10 hover:bg-black/5 text-amber-600"
                        }`}
                        title="ينشئ رابط فوري بكود تحديث لحظي لإجبار واتساب وتويتر على تحديث الصورة فوراً"
                      >
                        <RefreshCw size={14} className="text-amber-400 animate-spin-slow" />
                        <span>⚡ نسخ رابط كاسر الكاش</span>
                      </Button>

                      <Button
                        type="button"
                        onClick={shareDirectToWhatsApp}
                        className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2 gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/20"
                      >
                        <MessageCircle size={14} />
                        <span>تجربة في واتساب</span>
                      </Button>

                      <Button
                        type="button"
                        onClick={() => {
                          setOrchestrationMutation.mutate({
                            marketingPixels: orchestrationForm.marketingPixels,
                          });
                        }}
                        disabled={setOrchestrationMutation.isPending}
                        className="rounded-2xl bg-amber-400 hover:bg-yellow-400 text-black font-black text-xs px-5 py-2 shadow-lg shadow-amber-400/20 gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 size={15} />
                        <span>{setOrchestrationMutation.isPending ? "جاري الحفظ..." : "حفظ بطاقات المشاركة"}</span>
                      </Button>
                    </div>
                  </div>

                  {/* 1. Page Selector Pills */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black flex items-center gap-1.5">
                        <Globe size={14} className="text-amber-400" />
                        <span>اختر الصفحة المراد ضبط بطاقة مشاركتها:</span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-bold">
                        {isCustomMode ? (
                          <span className="text-amber-400 font-black">🟡 وضع مخصص لهذه الصفحة</span>
                        ) : (
                          <span className="text-emerald-400 font-black">🟢 وضع تلقائي ذكي متجدد</span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {SOCIAL_SHARE_PAGES.map((pg) => {
                        const isSelected = selectedSharePage === pg.path;
                        const hasCustom = pageOverridesMap[pg.path]?.mode === "custom";
                        return (
                          <button
                            key={pg.path}
                            type="button"
                            onClick={() => setSelectedSharePage(pg.path)}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-black transition shrink-0 cursor-pointer border ${
                              isSelected
                                ? "bg-amber-400 text-black border-amber-400 shadow-md shadow-amber-400/20"
                                : dark
                                ? "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/10"
                                : "border-black/10 bg-slate-50 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            <span>{pg.icon}</span>
                            <span>{pg.name}</span>
                            <span
                              className={`w-2 h-2 rounded-full ${
                                hasCustom ? "bg-amber-500" : "bg-emerald-500"
                              }`}
                              title={hasCustom ? "مخصص" : "تلقائي"}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Dual Engine Switcher: Auto-Pilot vs Custom Override */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={resetToAutoMode}
                      className={`p-4 rounded-2xl border text-right transition cursor-pointer relative overflow-hidden ${
                        !isCustomMode
                          ? dark
                            ? "border-emerald-500/40 bg-emerald-500/10 ring-2 ring-emerald-500/30"
                            : "border-emerald-600/40 bg-emerald-50 ring-2 ring-emerald-600/20"
                          : dark
                          ? "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                          : "border-black/10 bg-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 font-black text-sm text-emerald-500">
                          <RefreshCw size={16} />
                          <span>الوضع التلقائي الذكي (Auto-Pilot)</span>
                        </div>
                        {!isCustomMode && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                            الوضع النشط ✓
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                        يقرأ النظام تلقائياً أحدث غلاف وعنوان وتفاصيل من قاعدة البيانات عند إرسال الرابط، ويتجدد تلقائياً مع كل محتوى جديد دون الحاجة لتدخلك.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        updateActiveOverride({
                          mode: "custom",
                          title: activePageOverride.title || effectiveTitle,
                          description: activePageOverride.description || effectiveDesc,
                          imageUrl: activePageOverride.imageUrl || effectiveImage,
                        });
                      }}
                      className={`p-4 rounded-2xl border text-right transition cursor-pointer relative overflow-hidden ${
                        isCustomMode
                          ? dark
                            ? "border-amber-500/40 bg-amber-500/10 ring-2 ring-amber-500/30"
                            : "border-amber-500/40 bg-amber-50 ring-2 ring-amber-500/20"
                          : dark
                          ? "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                          : "border-black/10 bg-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 font-black text-sm text-amber-500">
                          <Wand2 size={16} />
                          <span>الوضع المخصص اليدوي (Custom Override)</span>
                        </div>
                        {isCustomMode && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-black">
                            الوضع النشط ✓
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                        يتيح لك كتابة عنوان تسويقي مخصص، رفع صورة غلاف من جهازك، وصياغة وصف مخصص للحملات والإعلانات الخاصة ومواسم التسجيل.
                      </p>
                    </button>
                  </div>

                  {/* 3. Custom Mode Form Controls OR Auto Mode Banner */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left/Main Column: Form or Auto Info */}
                    <div className="lg:col-span-7 space-y-5">
                      {isCustomMode ? (
                        <div className="space-y-4">
                          {/* Image Field & Upload */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-black">
                              صورة الغلاف والمعاينة (OG Image):
                            </label>
                            <div className="flex flex-wrap sm:flex-nowrap gap-2">
                              <input
                                type="text"
                                value={activePageOverride.imageUrl || ""}
                                onChange={(e) => updateActiveOverride({ imageUrl: e.target.value })}
                                placeholder="/covers/cover-about.jpg أو رابط صورة مباشرة"
                                className={`flex-1 rounded-xl border p-2.5 text-xs font-mono outline-none ${
                                  dark ? "border-white/10 bg-black/40 text-white" : "border-black/10 bg-white"
                                }`}
                              />

                              <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black cursor-pointer bg-amber-400 hover:bg-yellow-400 text-black transition shrink-0">
                                <Upload size={14} />
                                <span>رفع من الجهاز</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    if (file.size > 8 * 1024 * 1024) {
                                      toast.error("الحد الأقصى لحجم الصورة هو 8 ميجابايت");
                                      return;
                                    }
                                    const reader = new FileReader();
                                    reader.onload = () => {
                                      if (typeof reader.result === "string") {
                                        updateActiveOverride({
                                          mode: "custom",
                                          imageUrl: reader.result,
                                        });
                                        toast.success("✅ تم رفع وتعيين صورة المعاينة بنجاح!");
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }}
                                />
                              </label>

                              <button
                                type="button"
                                onClick={() => {
                                  setMediaPickerConfig({
                                    open: true,
                                    title: "اختر صورة الغلاف من مكتبة وسائط العقيق",
                                    currentUrl: effectiveImage,
                                    onSelect: (item) => {
                                      updateActiveOverride({
                                        mode: "custom",
                                        imageUrl: item.url,
                                      });
                                    },
                                  });
                                }}
                                className={`px-3 py-2 rounded-xl text-xs font-bold border transition shrink-0 ${
                                  dark ? "border-white/10 hover:bg-white/10 text-slate-300" : "border-black/10 hover:bg-black/5 text-slate-700"
                                }`}
                              >
                                🖼️ المكتبة
                              </button>
                            </div>

                            {/* Quick Image Suggestions */}
                            <div className="flex flex-wrap gap-1.5 text-[10px] font-bold pt-1">
                              <span className="text-slate-400 py-0.5">اقتراحات سريعة من المدارس:</span>
                              <button
                                type="button"
                                onClick={() => updateActiveOverride({ imageUrl: "/covers/cover-about.jpg" })}
                                className={`px-2 py-0.5 rounded-lg border transition ${
                                  dark ? "border-white/10 hover:bg-white/10 text-slate-300" : "border-black/10 hover:bg-black/5 text-slate-600"
                                }`}
                              >
                                🏛️ صرح المدارس
                              </button>
                              <button
                                type="button"
                                onClick={() => updateActiveOverride({ imageUrl: "/covers/student-lab-admissions.jpg" })}
                                className={`px-2 py-0.5 rounded-lg border transition ${
                                  dark ? "border-white/10 hover:bg-white/10 text-slate-300" : "border-black/10 hover:bg-black/5 text-slate-600"
                                }`}
                              >
                                🔬 معامل الطلاب وSTEM
                              </button>
                              <button
                                type="button"
                                onClick={() => updateActiveOverride({ imageUrl: "/covers/cover-accreditations.jpg" })}
                                className={`px-2 py-0.5 rounded-lg border transition ${
                                  dark ? "border-white/10 hover:bg-white/10 text-slate-300" : "border-black/10 hover:bg-black/5 text-slate-600"
                                }`}
                              >
                                🏅 اعتماد Cognia
                              </button>
                              <button
                                type="button"
                                onClick={() => updateActiveOverride({ imageUrl: "/alaqeeq-logo.png" })}
                                className={`px-2 py-0.5 rounded-lg border transition ${
                                  dark ? "border-white/10 hover:bg-white/10 text-slate-300" : "border-black/10 hover:bg-black/5 text-slate-600"
                                }`}
                              >
                                🦅 شعار المدارس
                              </button>
                            </div>
                          </div>

                          {/* Title */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-black">
                                عنوان الرابط والمشاركة (OG Title):
                              </label>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {(activePageOverride.title || "").length} حرف
                              </span>
                            </div>
                            <input
                              type="text"
                              value={activePageOverride.title || ""}
                              onChange={(e) => updateActiveOverride({ title: e.target.value })}
                              placeholder={currentSharePageConfig.autoTitle}
                              className={`w-full rounded-xl border p-2.5 text-xs font-bold outline-none ${
                                dark ? "border-white/10 bg-black/40 text-white" : "border-black/10 bg-white"
                              }`}
                            />
                          </div>

                          {/* Description */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-black">
                                الوصف التسويقي للرابط (OG Description):
                              </label>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {(activePageOverride.description || "").length} حرف
                              </span>
                            </div>
                            <textarea
                              rows={3}
                              value={activePageOverride.description || ""}
                              onChange={(e) => updateActiveOverride({ description: e.target.value })}
                              placeholder={currentSharePageConfig.autoDesc}
                              className={`w-full rounded-xl border p-2.5 text-xs font-medium outline-none resize-none ${
                                dark ? "border-white/10 bg-black/40 text-white" : "border-black/10 bg-white"
                              }`}
                            />
                          </div>

                          <div className="pt-2 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={resetToAutoMode}
                              className="text-xs text-amber-500 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <RefreshCw size={12} />
                              <span>استعادة الوضع التلقائي الذكي لهذه الصفحة</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Auto Mode Detailed Preview */
                        <div className={`p-6 rounded-2xl border space-y-4 ${
                          dark ? "border-emerald-500/20 bg-emerald-500/5" : "border-emerald-600/20 bg-emerald-50/50"
                        }`}>
                          <div className="flex items-center gap-2 text-emerald-500 font-black text-sm">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                            <span>المحرك يعمل في وضع التحديث التلقائي الذكي (Auto-Pilot)</span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed font-medium">
                            تقوم خوارزميات المنصة بالاتصال المباشر بقاعدة البيانات عند إرسال رابط <span className="font-mono text-amber-400">{selectedSharePage}</span> عبر واتساب أو منصات التواصل، واستخراج أحدث عنوان وغلاف ووصف تم نشره.
                          </p>

                          <div className={`p-4 rounded-xl border space-y-2 text-xs ${
                            dark ? "border-white/10 bg-black/30" : "border-black/10 bg-white"
                          }`}>
                            <div className="text-slate-400 text-[11px] font-bold">البيانات الحية المعتمدة حالياً:</div>
                            <div className="font-bold text-sm line-clamp-1">📌 {effectiveTitle}</div>
                            <div className="text-[11px] text-slate-400 line-clamp-2">📝 {effectiveDesc}</div>
                          </div>

                          <Button
                            type="button"
                            onClick={() => {
                              updateActiveOverride({
                                mode: "custom",
                                title: effectiveTitle,
                                description: effectiveDesc,
                                imageUrl: effectiveImage,
                              });
                            }}
                            className="w-full rounded-xl bg-amber-400 hover:bg-yellow-400 text-black font-black text-xs py-2.5 gap-2 cursor-pointer shadow-md"
                          >
                            <Wand2 size={14} />
                            <span>تخصيص بيانات هذا الرابط يدوياً (التحويل للوضع المخصص)</span>
                          </Button>
                        </div>
                      )}

                      {/* Campaign UTM Generator & QR Code Studio */}
                      <div className={`p-5 rounded-2xl border space-y-3 ${
                        dark ? "border-white/10 bg-white/[0.02]" : "border-black/5 bg-slate-50"
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black flex items-center gap-1.5">
                            <Megaphone size={14} className="text-amber-400" />
                            <span>صانع روابط الحملات التسويقية ورموز QR (UTM Builder):</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">تتبع دقيق في رادار الزيارات</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1">المنصة الناشرة:</label>
                            <select
                              value={utmSource}
                              onChange={(e) => setUtmSource(e.target.value)}
                              className={`w-full rounded-xl border p-2 text-xs font-bold outline-none ${
                                dark ? "border-white/10 bg-black/40 text-white" : "border-black/10 bg-white"
                              }`}
                            >
                              <option value="whatsapp">واتساب (WhatsApp)</option>
                              <option value="snapchat">سناب شات (Snapchat)</option>
                              <option value="x">منصة إكس / تويتر (X)</option>
                              <option value="instagram">إنستغرام (Instagram)</option>
                              <option value="sms">رسائل SMS المباشرة</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1">رمز الحملة الإعلانية:</label>
                            <input
                              type="text"
                              value={utmCampaign}
                              onChange={(e) => setUtmCampaign(e.target.value)}
                              placeholder="admissions-2026"
                              className={`w-full rounded-xl border p-2 text-xs font-mono outline-none ${
                                dark ? "border-white/10 bg-black/40 text-white" : "border-black/10 bg-white"
                              }`}
                            />
                          </div>
                        </div>

                        <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-[11px] font-mono overflow-hidden ${
                          dark ? "border-white/10 bg-black/60 text-slate-300" : "border-black/10 bg-white text-slate-700"
                        }`}>
                          <span className="truncate" dir="ltr">{campaignGeneratedUrl}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(campaignGeneratedUrl);
                                toast.success("📋 تم نسخ رابط الحملة المتتبع!");
                              }}
                              className="px-2.5 py-1 rounded-lg bg-amber-400 text-black font-black text-xs hover:bg-yellow-400 transition"
                            >
                              نسخ
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsQrModalOpen(true)}
                              className={`p-1.5 rounded-lg border transition ${
                                dark ? "border-white/10 hover:bg-white/10" : "border-black/10 hover:bg-black/5"
                              }`}
                              title="عرض رمز QR"
                            >
                              <QrCode size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Multi-Platform Live Realistic Preview */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black flex items-center gap-1.5">
                          <Eye size={14} className="text-amber-400" />
                          <span>معاينة الرابط الحية (Live Preview):</span>
                        </span>

                        {/* Platform Switcher */}
                        <div className={`flex items-center p-0.5 rounded-xl border text-[11px] font-bold ${
                          dark ? "border-white/10 bg-white/[0.04]" : "border-black/10 bg-slate-100"
                        }`}>
                          <button
                            type="button"
                            onClick={() => setPreviewPlatform("whatsapp")}
                            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                              previewPlatform === "whatsapp"
                                ? "bg-emerald-600 text-white shadow-sm"
                                : "text-slate-400 hover:text-current"
                            }`}
                          >
                            واتساب
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewPlatform("x")}
                            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                              previewPlatform === "x"
                                ? dark
                                  ? "bg-white text-black shadow-sm"
                                  : "bg-black text-white shadow-sm"
                                : "text-slate-400 hover:text-current"
                            }`}
                          >
                            إكس / تويتر
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewPlatform("facebook")}
                            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                              previewPlatform === "facebook"
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-slate-400 hover:text-current"
                            }`}
                          >
                            فيسبوك
                          </button>
                        </div>
                      </div>

                      {/* WhatsApp Simulation */}
                      {previewPlatform === "whatsapp" && (
                        <div className={`p-4 rounded-3xl border shadow-2xl relative ${
                          dark ? "border-white/10 bg-[#0b141a]" : "border-emerald-900/10 bg-[#e5ddd5]"
                        }`}>
                          <div className="text-[10px] text-center text-slate-400 mb-3 font-mono">
                            فقاعة محادثة واتساب الرسمية
                          </div>

                          <div className={`rounded-2xl border overflow-hidden max-w-sm mx-auto shadow-md ${
                            dark ? "border-white/10 bg-[#1f2c34] text-white" : "border-emerald-800/10 bg-white text-slate-900"
                          }`}>
                            <div className="h-44 bg-gradient-to-tr from-[#08467d] to-[#0e6cbd] flex items-center justify-center relative overflow-hidden">
                              {effectiveImage ? (
                                <img
                                  src={effectiveImage}
                                  alt="معاينة الغلاف"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/alaqeeq-logo.png";
                                  }}
                                />
                              ) : (
                                <span className="font-black text-white text-lg">مدارس العقيق</span>
                              )}
                              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[9px] font-mono text-white">
                                alaqeeq.edu.sa
                              </span>
                            </div>

                            <div className="p-3.5 space-y-1.5 text-right">
                              <span className="text-[10px] text-emerald-500 font-mono font-bold block">
                                alaqeeq.edu.sa{selectedSharePage === "/" ? "" : selectedSharePage}
                              </span>
                              <h4 className="text-xs font-black line-clamp-2 leading-snug">
                                {effectiveTitle}
                              </h4>
                              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                                {effectiveDesc}
                              </p>
                              <div className="flex justify-end pt-1">
                                <span className="text-[9px] text-slate-400 font-mono">12:30 م ✓✓</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* X / Twitter Simulation */}
                      {previewPlatform === "x" && (
                        <div className={`p-4 rounded-3xl border shadow-2xl relative ${
                          dark ? "border-white/10 bg-[#000]" : "border-black/10 bg-slate-900 text-white"
                        }`}>
                          <div className="text-[10px] text-center text-slate-400 mb-3 font-mono">
                            بطاقة تويتر السينمائية العريضة (Summary Large Image)
                          </div>

                          <div className="rounded-2xl border border-white/20 overflow-hidden bg-black text-white max-w-sm mx-auto shadow-md">
                            <div className="h-44 bg-gradient-to-tr from-[#08467d] to-[#0e6cbd] flex items-center justify-center relative overflow-hidden">
                              {effectiveImage ? (
                                <img
                                  src={effectiveImage}
                                  alt="معاينة الغلاف"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/alaqeeq-logo.png";
                                  }}
                                />
                              ) : (
                                <span className="font-black text-white text-lg">مدارس العقيق</span>
                              )}
                              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-mono text-white">
                                alaqeeq.edu.sa
                              </span>
                            </div>

                            <div className="p-3 space-y-1 text-right">
                              <span className="text-[10px] text-slate-400 font-mono block">
                                From alaqeeq.edu.sa
                              </span>
                              <h4 className="text-xs font-black line-clamp-1">
                                {effectiveTitle}
                              </h4>
                              <p className="text-[11px] text-slate-400 line-clamp-2">
                                {effectiveDesc}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Facebook Simulation */}
                      {previewPlatform === "facebook" && (
                        <div className={`p-4 rounded-3xl border shadow-2xl relative ${
                          dark ? "border-white/10 bg-[#18191a]" : "border-black/10 bg-[#f0f2f5]"
                        }`}>
                          <div className="text-[10px] text-center text-slate-400 mb-3 font-mono">
                            بطاقة مشاركة فيسبوك ولينكد إن الرسمية
                          </div>

                          <div className={`rounded-2xl border overflow-hidden max-w-sm mx-auto shadow-md ${
                            dark ? "border-white/10 bg-[#242526] text-white" : "border-black/10 bg-white text-slate-900"
                          }`}>
                            <div className="h-44 bg-gradient-to-tr from-[#08467d] to-[#0e6cbd] flex items-center justify-center relative overflow-hidden">
                              {effectiveImage ? (
                                <img
                                  src={effectiveImage}
                                  alt="معاينة الغلاف"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/alaqeeq-logo.png";
                                  }}
                                />
                              ) : (
                                <span className="font-black text-white text-lg">مدارس العقيق</span>
                              )}
                            </div>

                            <div className="p-3 space-y-1 text-right">
                              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono block">
                                ALAQEEQ.EDU.SA
                              </span>
                              <h4 className="text-xs font-black line-clamp-1">
                                {effectiveTitle}
                              </h4>
                              <p className="text-[11px] text-slate-400 line-clamp-2">
                                {effectiveDesc}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* External Debugger Links */}
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[10px] text-slate-400">
                        <span>أدوات فحص الكاش الرسمية للمطورين:</span>
                        <a
                          href={`https://developers.facebook.com/tools/debug/?q=${encodeURIComponent("https://alaqeeq.edu.sa" + selectedSharePage)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-500 hover:underline inline-flex items-center gap-0.5"
                        >
                          <span>Facebook Debugger</span>
                          <ExternalLink size={10} />
                        </a>
                        <span>·</span>
                        <a
                          href="https://cards-dev.twitter.com/validator"
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-500 hover:underline inline-flex items-center gap-0.5"
                        >
                          <span>Twitter Validator</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Code Dialog */}
                <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
                  <DialogContent className={`max-w-md text-right ${dark ? "bg-[#11141c] text-white border-white/10" : "bg-white text-slate-900 border-black/10"}`}>
                    <DialogHeader>
                      <DialogTitle className="text-right text-base font-black flex items-center gap-2">
                        <QrCode size={18} className="text-amber-400" />
                        <span>رمز الاستجابة السريعة (QR Code) للحملة</span>
                      </DialogTitle>
                      <DialogDescription className="text-right text-xs text-slate-400">
                        امسح الكود بكاميرا الجوال للانتقال المباشر للرابط المتتبع
                      </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col items-center justify-center p-4 space-y-4">
                      <div className="bg-white p-4 rounded-2xl shadow-xl border border-black/10">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(campaignGeneratedUrl)}`}
                          alt="QR Code"
                          className="w-48 h-48"
                        />
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 text-center break-all max-w-sm px-2">
                        {campaignGeneratedUrl}
                      </p>
                    </div>

                    <DialogFooter className="flex-row-reverse gap-2">
                      <Button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(campaignGeneratedUrl);
                          toast.success("📋 تم نسخ الرابط!");
                        }}
                        className="bg-amber-400 hover:bg-yellow-400 text-black font-black text-xs gap-1.5"
                      >
                        <Copy size={14} />
                        <span>نسخ الرابط</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsQrModalOpen(false)}
                        className="text-xs font-bold"
                      >
                        إغلاق
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {/* SUBTAB 5: CLOUD DEPLOY, BACKUP & HEALTH */}
            {systemSubTab === "backup" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className={`rounded-3xl border p-6 sm:p-8 space-y-6 shadow-xl ${dark ? "border-white/10 bg-[#12141a]" : "border-black/5 bg-white"}`}>
                  <div className="border-b border-current/10 pb-4">
                    <h3 className="text-xl font-black">المزامنة السحابية والنسخ الاحتياطي (Cloud Sync & Backup)</h3>
                    <p className="text-xs text-slate-400 mt-1 font-bold">
                      نشر الموقع للإنتاج على ريندر وتصدير نسخة احتياطية مشفرة لكامل البيانات
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Live Sync to Render */}
                    <div className={`rounded-2xl border p-6 space-y-4 ${dark ? "border-emerald-500/20 bg-emerald-500/5" : "border-emerald-700/15 bg-white shadow-sm"}`}>
                      <div className="flex items-center gap-3">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-400 font-black">
                          <Rocket size={24} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black">مزامنة ونشر الموقع المباشر</h4>
                          <p className="text-[11px] text-slate-400">إرسال كافة التعديلات لسيرفرات Render الحية</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (isDeploying) return;
                          setIsDeploying(true);
                          deployMutation.mutate();
                        }}
                        disabled={isDeploying}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 py-3 text-xs font-black text-white transition shadow-lg shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                      >
                        <Rocket size={16} className={isDeploying ? "animate-spin" : ""} />
                        <span>{isDeploying ? "جارِ المزامنة والنشر..." : "نشر التعديلات للإنتاج الآن 🚀"}</span>
                      </button>
                    </div>

                    {/* Full JSON Snapshot Download */}
                    <div className={`rounded-2xl border p-6 space-y-4 ${dark ? "border-white/10 bg-white/[0.02]" : "border-black/5 bg-slate-50"}`}>
                      <div className="flex items-center gap-3">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-400/10 text-amber-500 font-black">
                          <Download size={22} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black">تنزيل نسخة احتياطية كاملة</h4>
                          <p className="text-[11px] text-slate-400">تصدير snapshot لكافة إعدادات الموقع JSON</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          try {
                            const fullSnapshot = {
                              timestamp: new Date().toISOString(),
                              orchestration: orchestrationForm,
                              exportedBy: user?.name || "admin",
                            };
                            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullSnapshot, null, 2));
                            const downloadAnchor = document.createElement("a");
                            downloadAnchor.setAttribute("href", dataStr);
                            downloadAnchor.setAttribute("download", `alaqeeq-system-snapshot-${new Date().toISOString().slice(0, 10)}.json`);
                            document.body.appendChild(downloadAnchor);
                            downloadAnchor.click();
                            downloadAnchor.remove();
                            toast.success("✅ تم تصدير النسخة الاحتياطية بنجاح!");
                          } catch {
                            toast.error("فشل تصدير النسخة الاحتياطية");
                          }
                        }}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 py-3 text-xs font-black text-black hover:bg-yellow-400 transition shadow-lg shadow-amber-400/20 cursor-pointer"
                      >
                        <Download size={16} />
                        <span>تحميل ملف النسخة الاحتياطية (JSON) 💾</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* 📱 MOBILE BOTTOM EXECUTIVE NAVIGATION BAR (lg:hidden)           */}
      {/* ============================================================== */}
      <nav
        aria-label="التنقل السريع للوحة التحكم"
        className={`fixed bottom-0 left-0 right-0 z-50 block lg:hidden border-t backdrop-blur-2xl transition-colors ${
          dark ? "bg-black/95 border-white/10" : "bg-white/95 border-black/10 shadow-2xl"
        }`}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {[
            { key: "radar" as TabKey, label: "الرادار", icon: LayoutDashboard },
            { key: "admissions" as TabKey, label: "القبول", icon: GraduationCap, badge: pendingLeadsCount || undefined },
            { key: "content" as TabKey, label: "المحتوى", icon: Layers, badge: pendingArticlesCount || undefined },
            { key: "campaigns" as TabKey, label: "التواصل", icon: Megaphone },
            { key: "system" as TabKey, label: "النظام", icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl text-[10px] font-black transition cursor-pointer ${
                  active
                    ? "text-amber-400 bg-amber-400/10"
                    : dark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-black"
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="absolute top-1 right-2 flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ============================================================== */}
      {/* 🧩 PRESERVED MODALS & DIALOGS                                   */}
      {/* ============================================================== */}

      {/* MODAL 1: ADD ADMIN USER */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent
          dir="rtl"
          className={"sm:max-w-[480px] rounded-3xl " + (
            dark ? "bg-[#121212] text-white border-white/15" : "bg-white text-slate-900 border-black/10"
          )}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-black">إضافة مشرف أو عضو جديد</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              قم بإدخال بيانات الحساب الجديد وتعيين كلمة المرور ومستوى الصلاحية
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-xs font-black text-slate-400 block mb-1">الاسم الكامل *</label>
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="مثال: أ. محمد الحربي"
                className={`w-full rounded-xl border p-2.5 text-xs font-bold outline-none ${
                  dark ? "border-white/10 bg-white/5 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                }`}
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 block mb-1">اسم المستخدم للدخول (Username) *</label>
              <input
                type="text"
                value={newUserOpenId}
                onChange={(e) => setNewUserOpenId(e.target.value.trim().toLowerCase())}
                placeholder="مثال: m.alharbi"
                className={`w-full rounded-xl border p-2.5 text-xs font-bold font-mono outline-none ${
                  dark ? "border-white/10 bg-white/5 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                }`}
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 block mb-1">البريد الإلكتروني (اختياري)</label>
              <input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value.trim())}
                placeholder="admin@alaqeeq.edu.sa"
                className={`w-full rounded-xl border p-2.5 text-xs font-bold outline-none ${
                  dark ? "border-white/10 bg-white/5 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                }`}
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 block mb-1">كلمة المرور *</label>
              <input
                type="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full rounded-xl border p-2.5 text-xs font-bold outline-none ${
                  dark ? "border-white/10 bg-white/5 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                }`}
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 block mb-1">مستوى الصلاحية *</label>
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value as any)}
                className={`w-full rounded-xl border p-2.5 text-xs font-black outline-none cursor-pointer ${
                  dark ? "border-white/10 bg-black/50 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                }`}
              >
                <option value="admin">مدير عام — تحكم كامل (Admin)</option>
                <option value="coordinator">منسق محتوى — إضافة وتحرير (Coordinator)</option>
                <option value="receptionist">مسؤول قبول — متابعة طلبات التسجيل (Receptionist)</option>
                <option value="auditor">مدقق لغوي — مراجعة واعتماد المقالات (Auditor)</option>
              </select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              onClick={() => {
                if (!newUserName.trim() || !newUserOpenId.trim() || !newUserPassword.trim()) {
                  toast.error("يرجى ملء جميع الحقول المطلوبة");
                  return;
                }
                const emailToUse = newUserEmail.trim() || `${newUserOpenId.trim()}@alaqeeq.edu.sa`;
                createUserMutation.mutate({
                  name: newUserName.trim(),
                  openId: newUserOpenId.trim(),
                  email: emailToUse,
                  password: newUserPassword,
                  role: newUserRole,
                });
              }}
              disabled={createUserMutation.isPending}
              className="rounded-2xl bg-amber-400 hover:bg-yellow-400 text-black font-black text-xs px-5 py-2.5"
            >
              {createUserMutation.isPending ? "جاري الإنشاء..." : "حفظ وإنشاء الحساب"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddUserOpen(false)}
              className="rounded-2xl text-xs font-bold"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: RESET PASSWORD */}
      <Dialog open={resetPassUserId !== null} onOpenChange={(open) => !open && setResetPassUserId(null)}>
        <DialogContent
          dir="rtl"
          className={"sm:max-w-[420px] rounded-3xl " + (
            dark ? "bg-[#121212] text-white border-white/15" : "bg-white text-slate-900 border-black/10"
          )}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-black">تعيين كلمة مرور جديدة</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              قم بكتابة كلمة المرور الجديدة للمشرف
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <label className="text-xs font-black text-slate-400 block mb-1">كلمة المرور الجديدة</label>
            <input
              type="password"
              value={newPasswordValue}
              onChange={(e) => setNewPasswordValue(e.target.value)}
              placeholder="••••••••"
              className={`w-full rounded-xl border p-2.5 text-xs font-bold outline-none ${
                dark ? "border-white/10 bg-white/5 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
              }`}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              onClick={() => {
                if (!newPasswordValue.trim() || !resetPassUserId) return;
                resetPasswordMutation.mutate({
                  userId: resetPassUserId,
                  newPassword: newPasswordValue.trim(),
                });
              }}
              disabled={resetPasswordMutation.isPending}
              className="rounded-2xl bg-amber-400 hover:bg-yellow-400 text-black font-black text-xs px-5 py-2.5"
            >
              {resetPasswordMutation.isPending ? "جاري الحفظ..." : "حفظ كلمة المرور"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setResetPassUserId(null)}
              className="rounded-2xl text-xs font-bold"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: DELETE USER CONFIRMATION */}
      <Dialog open={deleteUserId !== null} onOpenChange={(open) => !open && setDeleteUserId(null)}>
        <DialogContent
          dir="rtl"
          className={"sm:max-w-[400px] rounded-3xl " + (
            dark ? "bg-[#121212] text-white border-white/15" : "bg-white text-slate-900 border-black/10"
          )}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-red-400">تأكيد حذف المشرف</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              هل أنت متأكد من رغبتك في حذف هذا الحساب نهائياً؟ لن يتمكن من تسجيل الدخول مرة أخرى.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button
              type="button"
              onClick={() => {
                if (deleteUserId) deleteUserMutation.mutate({ userId: deleteUserId });
              }}
              disabled={deleteUserMutation.isPending}
              className="rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs px-5 py-2.5"
            >
              {deleteUserMutation.isPending ? "جاري الحذف..." : "نعم، احذف المشرف"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteUserId(null)}
              className="rounded-2xl text-xs font-bold"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 4: BULK DELETE LEADS CONFIRMATION */}
      <Dialog open={bulkDeleteConfirmOpen} onOpenChange={setBulkDeleteConfirmOpen}>
        <DialogContent
          dir="rtl"
          className={"sm:max-w-[400px] rounded-3xl " + (
            dark ? "bg-[#121212] text-white border-white/15" : "bg-white text-slate-900 border-black/10"
          )}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-red-400">⚠️ تأكيد الحذف الجماعي للطلبات</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              هل أنت متأكد من رغبتك في حذف {selectedLeadIds.length} طلب قبول محدد نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button
              type="button"
              onClick={() => {
                selectedLeadIds.forEach((id) => deleteAdmissionMutation.mutate({ id }));
                setSelectedLeadIds([]);
                setBulkDeleteConfirmOpen(false);
                toast.success("تم إرسال أوامر الحذف بنجاح");
              }}
              className="rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs px-5 py-2.5"
            >
              نعم، احذف {selectedLeadIds.length} طلب
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setBulkDeleteConfirmOpen(false)}
              className="rounded-2xl text-xs font-bold"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 5: ADD SCHOOL SONG */}
      <Dialog open={isAddSongOpen} onOpenChange={setIsAddSongOpen}>
        <DialogContent
          dir="rtl"
          className={"sm:max-w-[480px] rounded-3xl " + (
            dark ? "bg-[#121212] text-white border-white/15" : "bg-white text-slate-900 border-black/10"
          )}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-black flex items-center gap-2">
              <Headphones size={20} className="text-[#f8ca14]" />
              <span>إضافة نشيد / أغنية مدرسية جديدة</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              أضف رابط ملف MP3 وعنوان النشيد ليعمل في المشغل الصوتي الموحد للزوار
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-xs font-black text-slate-300 block mb-1">عنوان النشيد / المعزوفة *</label>
              <input
                type="text"
                value={newSongTitle}
                onChange={(e) => setNewSongTitle(e.target.value)}
                placeholder="مثال: نشيد صُنّاع المجد"
                className={`w-full rounded-xl border p-2.5 text-xs font-bold outline-none ${
                  dark ? "border-white/10 bg-white/5 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                }`}
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-300 block mb-1">المؤدي / الكورال</label>
              <input
                type="text"
                value={newSongArtist}
                onChange={(e) => setNewSongArtist(e.target.value)}
                placeholder="كورال طلاب العقيق"
                className={`w-full rounded-xl border p-2.5 text-xs font-bold outline-none ${
                  dark ? "border-white/10 bg-white/5 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                }`}
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-300 block mb-1">رابط ملف الصوت (MP3) أو Google Drive *</label>
              <input
                type="url"
                value={newSongUrl}
                onChange={(e) => setNewSongUrl(e.target.value.trim())}
                placeholder="https://.../audio.mp3"
                className={`w-full rounded-xl border p-2.5 text-xs font-mono outline-none ${
                  dark ? "border-white/10 bg-white/5 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                }`}
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-300 block mb-1">التصنيف</label>
              <select
                value={newSongCategory}
                onChange={(e) => setNewSongCategory(e.target.value)}
                className={`w-full rounded-xl border p-2.5 text-xs font-black outline-none cursor-pointer ${
                  dark ? "border-white/10 bg-black/50 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                }`}
              >
                <option value="النشيد المدرسي">النشيد المدرسي</option>
                <option value="احتفالي">احتفالي</option>
                <option value="بيانو وهدوء">بيانو وهدوء</option>
                <option value="أجواء ملكية">أجواء ملكية</option>
                <option value="تخرج وفخر">تخرج وفخر</option>
              </select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              onClick={() => {
                if (!newSongTitle.trim() || !newSongUrl.trim()) {
                  toast.error("يرجى إدخال عنوان النشيد ورابط الملف الصوتي");
                  return;
                }
                const newSong = {
                  id: "song-" + Date.now(),
                  title: newSongTitle.trim(),
                  artist: newSongArtist.trim() || "مدارس العقيق",
                  category: newSongCategory,
                  mediaUrl: newSongUrl.trim(),
                  coverUrl: newSongCover.trim() || "",
                };
                const updatedList = [...(orchestrationForm.schoolSongs || []), newSong];
                setOrchestrationForm({ ...orchestrationForm, schoolSongs: updatedList });
                setIsAddSongOpen(false);
                toast.success("تمت إضافة النشيد! اضغط 'حفظ ونشر التعديلات' لتثبيته.");
              }}
              className="rounded-2xl bg-[#f8ca14] hover:bg-yellow-400 text-black font-black text-xs px-5 py-2.5 cursor-pointer"
            >
              إضافة النشيد
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddSongOpen(false)}
              className="rounded-2xl text-xs font-bold cursor-pointer"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 6: IMPORT GOOGLE DRIVE AUDIO FOLDER */}
      <Dialog open={isImportAudioFolderOpen} onOpenChange={setIsImportAudioFolderOpen}>
        <DialogContent className={`max-w-2xl rounded-3xl ${dark ? "bg-[#0d0f15] border-white/10 text-white" : "bg-white border-black/10 text-slate-900"}`} dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 text-base font-black">
              <div className="h-9 w-9 rounded-2xl bg-[#08467d] text-white grid place-items-center shadow-md">
                <FolderSync size={18} />
              </div>
              <div>
                <span>استيراد مكتبة صوتية كاملة من Google Drive</span>
                <p className="text-xs font-bold text-slate-400 mt-0.5">يدعم جميع صيغ الصوت: MP3, WAV, M4A, FLAC, OGG, AAC...</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-black text-slate-400 mb-1.5">رابط مجلد Google Drive (يجب أن يكون «أي شخص لديه الرابط - مشاهد»)</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={driveAudioFolderUrl}
                  onChange={(e) => setDriveAudioFolderUrl(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className={`flex-1 rounded-2xl border px-3.5 py-2.5 text-xs font-mono font-bold outline-none transition ${
                    dark ? "border-white/10 bg-black/50 focus:border-emerald-400/50" : "border-black/10 bg-slate-50 focus:border-emerald-500"
                  }`}
                />
                <button
                  type="button"
                  disabled={scanDriveAudioFolderMutation.isPending || !driveAudioFolderUrl.trim()}
                  onClick={async () => {
                    if (!driveAudioFolderUrl.trim()) return;
                    try {
                      const res = await scanDriveAudioFolderMutation.mutateAsync({ folderUrl: driveAudioFolderUrl.trim() });
                      setScannedAudioTracks(res.tracks);
                      const initialSelected: Record<string, boolean> = {};
                      res.tracks.forEach((t: any) => {
                        initialSelected[t.driveFileId] = true;
                      });
                      setSelectedTrackIds(initialSelected);
                      toast.success(`تم بنجاح العثور على ${res.count} ملف صوتي في المجلد!`);
                    } catch (err: any) {
                      toast.error(err.message || "تعذر قراءة المجلد. تأكد من صحة الرابط.");
                    }
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition flex items-center gap-1.5 shrink-0 shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {scanDriveAudioFolderMutation.isPending ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>جاري الفحص...</span>
                    </>
                  ) : (
                    <>
                      <Search size={14} />
                      <span>فحص المجلد</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Scanned Audio List Preview */}
            {scannedAudioTracks.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={14} />
                    <span>تم اكتشاف ({scannedAudioTracks.length}) مقطع صوتي:</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const all: Record<string, boolean> = {};
                        scannedAudioTracks.forEach((t: any) => { all[t.driveFileId] = true; });
                        setSelectedTrackIds(all);
                      }}
                      className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
                    >
                      تحديد الكل
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => setSelectedTrackIds({})}
                      className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
                    >
                      إلغاء التحديد
                    </button>
                  </div>
                </div>

                <div className="max-h-[240px] overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                  {scannedAudioTracks.map((track: any) => {
                    const isChecked = !!selectedTrackIds[track.driveFileId];
                    return (
                      <div
                        key={track.driveFileId}
                        onClick={() => {
                          setSelectedTrackIds((prev) => ({
                            ...prev,
                            [track.driveFileId]: !prev[track.driveFileId],
                          }));
                        }}
                        className={`flex items-center justify-between p-2.5 rounded-2xl border cursor-pointer transition ${
                          isChecked
                            ? dark ? "bg-emerald-500/10 border-emerald-500/40 text-white" : "bg-emerald-50 border-emerald-300 text-slate-900"
                            : dark ? "bg-white/[0.02] border-white/5 opacity-50" : "bg-slate-50 border-black/5 opacity-50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded accent-emerald-500 h-4 w-4"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-black truncate">{track.title}</p>
                            <p className="text-[10px] text-slate-400 truncate">{track.artist} · {track.fileName}</p>
                          </div>
                        </div>

                        <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                          {track.extension}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsImportAudioFolderOpen(false)}
              className="rounded-xl text-xs font-bold"
            >
              إلغاء
            </Button>
            <Button
              type="button"
              disabled={Object.values(selectedTrackIds).filter(Boolean).length === 0}
              onClick={() => {
                const selected = scannedAudioTracks.filter((t) => selectedTrackIds[t.driveFileId]);
                const newSongs = selected.map((t) => ({
                  id: "drive-" + t.driveFileId,
                  title: t.title,
                  artist: t.artist || "مدارس العقيق",
                  category: t.category || "نشيد مدرسي",
                  mediaUrl: `/api/drive-proxy/${t.driveFileId}`,
                  coverUrl: t.coverUrl || "",
                }));
                const updatedList = [...(orchestrationForm.schoolSongs || []), ...newSongs];
                setOrchestrationForm({ ...orchestrationForm, schoolSongs: updatedList });
                setIsImportAudioFolderOpen(false);
                toast.success(`تم بنجاح إضافة ${newSongs.length} نشيد! اضغط حفظ التعديلات.`);
              }}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs px-5"
            >
              استيراد الأناشيد المحددة ({Object.values(selectedTrackIds).filter(Boolean).length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 7: 24H STORY PICKER */}
      <Dialog open={isStoryPickerOpen} onOpenChange={setIsStoryPickerOpen}>
        <DialogContent className={`max-w-4xl max-h-[90vh] flex flex-col p-6 overflow-hidden rounded-3xl ${dark ? "bg-[#0c0c0c] border-white/10 text-white" : "bg-white border-black/10 text-black"}`} dir="rtl">
          <DialogHeader className="space-y-1 text-right border-b pb-4 border-current/10">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-black flex items-center gap-2">
                <Sparkles size={20} className="text-[#f8ca14]" />
                <span>إدارة وتفعيل قصص العقيق (Stories Hub)</span>
              </DialogTitle>
              <span className="text-xs text-slate-400 font-bold">
                المتاح: {availableStories.length} قصة
              </span>
            </div>
            <DialogDescription className="text-xs text-slate-400">
              اختر أي محتوى من المقالات، المجلات، الألبومات، أو الأخبار لتثبيته في شريط الاستوريهات في قمة الموقع.
            </DialogDescription>
          </DialogHeader>

          {/* Story Duration Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-current/10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-300">مدة بقاء القصة نشطة:</span>
              <select
                value={storyDurationHours}
                onChange={(e) => setStoryDurationHours(Number(e.target.value))}
                className="rounded-xl border border-current/20 bg-transparent px-3 py-1 text-xs font-black outline-none cursor-pointer"
              >
                <option value={24}>٢٤ ساعة (يوم واحد)</option>
                <option value={48}>٤٨ ساعة (يومان)</option>
                <option value={72}>٧٢ ساعة (٣ أيام)</option>
                <option value={168}>أسبوع كامل (٧ أيام)</option>
              </select>
            </div>

            <div className="relative w-48 sm:w-64">
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="بحث في القصص..."
                value={storyPickerSearch}
                onChange={(e) => setStoryPickerSearch(e.target.value)}
                className={`w-full rounded-xl border py-1.5 pr-8 pl-3 text-xs font-bold outline-none ${
                  dark ? "border-white/10 bg-black/40 text-white" : "border-black/10 bg-slate-50 text-slate-900"
                }`}
              />
            </div>
          </div>

          {/* Stories Grid */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3 scrollbar-thin">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableStories
                .filter((s: any) => {
                  if (storyPickerSearch) {
                    return s.title?.toLowerCase().includes(storyPickerSearch.toLowerCase());
                  }
                  return true;
                })
                .map((story: any) => {
                  const isStoryActive = story.isActive;

                  return (
                    <div
                      key={story.id}
                      className={`flex items-center justify-between gap-3 p-3 rounded-2xl border transition ${
                        isStoryActive
                          ? "border-emerald-500/40 bg-emerald-500/5"
                          : dark ? "border-white/10 bg-white/[0.02]" : "border-black/5 bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-black/40 border border-current/10 flex items-center justify-center">
                          {story.imageUrl ? (
                            <img src={directDriveImage(story.imageUrl) || story.imageUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <Sparkles size={16} className="text-amber-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-xs truncate">{story.title}</p>
                          <span className="text-[10px] text-slate-400 font-bold">{story.category}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          toggleStoryMutation.mutate({
                            storyId: story.id,
                            active: !isStoryActive,
                            durationHours: storyDurationHours,
                          });
                        }}
                        disabled={toggleStoryMutation.isPending}
                        className={`rounded-xl px-3 py-1.5 text-[10px] font-black transition cursor-pointer shrink-0 ${
                          isStoryActive
                            ? "bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25"
                            : "bg-emerald-500 text-white hover:bg-emerald-600 shadow"
                        }`}
                      >
                        {isStoryActive ? "إيقاف" : "تفعيل 🟢"}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-current/10 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold">
              يتم تحديث شريط الاستوريهات لحظياً في الصفحة الرئيسية
            </span>
            <Button
              type="button"
              onClick={() => setIsStoryPickerOpen(false)}
              className="rounded-xl text-xs font-bold cursor-pointer"
            >
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 8: ARTICLE REVIEW & AI POLISH */}
      {selectedArticleForEdit && (
        <Dialog open={Boolean(selectedArticleForEdit)} onOpenChange={() => setSelectedArticleForEdit(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-amber-400/40 bg-[#090d16] p-6 sm:p-8 text-right text-white shadow-2xl" dir="rtl">
            <DialogHeader className="text-right border-b border-white/10 pb-4">
              <DialogTitle className="text-lg font-black text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BookOpen size={20} className="text-amber-400" />
                  <span>مراجعة وتدقيق المقال بالذكاء الاصطناعي</span>
                </span>
                <Button
                  type="button"
                  onClick={() => {
                    aiPolishArticleMutation.mutate({
                      title: selectedArticleForEdit.title,
                      content: selectedArticleForEdit.content,
                    });
                  }}
                  disabled={aiPolishArticleMutation.isPending}
                  className="gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-xs rounded-xl shadow-lg cursor-pointer"
                >
                  <Sparkles size={14} className={aiPolishArticleMutation.isPending ? "animate-spin" : ""} />
                  <span>{aiPolishArticleMutation.isPending ? "جارِ التدقيق..." : "تدقيق بالذكاء الاصطناعي ✨"}</span>
                </Button>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                الكاتب: {selectedArticleForEdit.authorName} ({selectedArticleForEdit.authorRole}) · التصنيف: {selectedArticleForEdit.category}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="text-xs font-black text-amber-300 block mb-1">عنوان المقال</label>
                <input
                  type="text"
                  value={selectedArticleForEdit.title}
                  onChange={(e) => setSelectedArticleForEdit({ ...selectedArticleForEdit, title: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm font-black text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-300 block mb-1">المقتطف التعريفي</label>
                <textarea
                  rows={2}
                  value={selectedArticleForEdit.excerpt || ""}
                  onChange={(e) => setSelectedArticleForEdit({ ...selectedArticleForEdit, excerpt: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs font-bold text-slate-200 outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-300 block mb-1">نص المقال الكامل</label>
                <textarea
                  rows={10}
                  value={selectedArticleForEdit.content}
                  onChange={(e) => setSelectedArticleForEdit({ ...selectedArticleForEdit, content: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-xs font-bold text-slate-200 outline-none leading-relaxed font-sans"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-white/10">
              <div className="flex flex-wrap items-center justify-between w-full gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={() => {
                      moderateArticleMutation.mutate({
                        id: selectedArticleForEdit.id,
                        status: "published",
                        updates: {
                          title: selectedArticleForEdit.title,
                          content: selectedArticleForEdit.content,
                          excerpt: selectedArticleForEdit.excerpt,
                        },
                      });
                    }}
                    disabled={moderateArticleMutation.isPending}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow cursor-pointer"
                  >
                    <CheckCircle2 size={14} className="ml-1" />
                    <span>قبول واعتماد النشر فوراً ✅</span>
                  </Button>

                  <Button
                    type="button"
                    onClick={() => {
                      moderateArticleMutation.mutate({
                        id: selectedArticleForEdit.id,
                        status: "rejected",
                      });
                    }}
                    disabled={moderateArticleMutation.isPending}
                    className="bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow cursor-pointer"
                  >
                    رفض المقال ❌
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedArticleForEdit(null)}
                  className="text-xs font-bold rounded-xl cursor-pointer"
                >
                  إغلاق
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* MODAL 9: UNIVERSAL MEDIA PICKER */}
      <AqeeqUniversalMediaPickerModal
        open={mediaPickerConfig.open}
        onOpenChange={(open) => setMediaPickerConfig((prev) => ({ ...prev, open }))}
        title={mediaPickerConfig.title}
        currentSelectedUrl={mediaPickerConfig.currentUrl}
        onSelect={mediaPickerConfig.onSelect}
      />

      {/* MODAL 10: AI YEARBOOK GENERATOR */}
      <AqeeqAiYearbookGenerator
        open={isYearbookOpen}
        onOpenChange={setIsYearbookOpen}
      />

      {/* MODAL 11: COMMAND PALETTE (CTRL+K) */}
      <AqeeqAdminCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={handleNavigateTab}
        onTriggerDeploy={() => deployMutation.mutate()}
        admissionsList={admissionsList}
      />
    </div>
  );
}
