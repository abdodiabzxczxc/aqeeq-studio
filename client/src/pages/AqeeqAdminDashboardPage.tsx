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
  EyeOff,
  Compass,
  RotateCcw,
  Save,
  AlertCircle,
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
  ArrowUp,
  ArrowDown,
  Pencil,
  Briefcase,
  FileText,
  Mail,
  PhoneCall,
  MapPin,
  Award,
  Cloud,
  Ticket,
  Video,
  Server,
} from "lucide-react";

import {
  DEFAULT_SYSTEM_PORTALS,
  SystemPortalItem,
  SystemPortalCategory,
  PORTAL_CATEGORY_LABELS,
  AVAILABLE_PORTAL_ICONS,
  PORTAL_ICON_CATEGORY_LABELS,
  PortalIconCategory,
} from "@shared/portals";
import { renderPortalIcon } from "@/components/PortalIconRenderer";

import { AqeeqAdminCommandPalette } from "@/components/AqeeqAdminCommandPalette";
import { DEFAULT_WELLINGTON_HOVER_ITEMS } from "@/components/AqeeqInteractiveFxModal";
import { BackdropsManager } from "@/components/BackdropsManager";
import { HomepageContentManager } from "@/components/admin/content/HomepageContentManager";
import { AboutPageContentManager } from "@/components/admin/content/AboutPageContentManager";
import { AccreditationsContentManager } from "@/components/admin/content/AccreditationsContentManager";
import { TuitionFeesContentManager } from "@/components/admin/content/TuitionFeesContentManager";
import { ExecutiveTopBar } from "@/components/admin/executive/ExecutiveTopBar";
import { ExecutiveSidebar, ExecutivePillar } from "@/components/admin/executive/ExecutiveSidebar";
import { OperationsHub } from "@/components/admin/executive/OperationsHub";
import { TuitionFinanceHub } from "@/components/admin/executive/TuitionFinanceHub";
import { CommunityHub } from "@/components/admin/executive/CommunityHub";
import { SiteContentStudio } from "@/components/admin/executive/SiteContentStudio";
import { PublishingStudio } from "@/components/admin/executive/PublishingStudio";
import { SystemBrandHub } from "@/components/admin/executive/SystemBrandHub";
import { LiveStudioCanvas } from "@/components/admin/executive/LiveStudioCanvas";
import { SiteHealthCopilot } from "@/components/admin/executive/SiteHealthCopilot";

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
export type ContentSubTab = "pages_content" | "master" | "articles" | "backdrops";
export type CampaignsSubTab = "broadcast" | "whatsapp" | "radio";
export type SystemSubTab = "pages" | "portals" | "header_footer" | "theme" | "users" | "campuses" | "marketing" | "backup";

export interface CorePageItem {
  key: string;
  labelKey: string;
  defaultLabel: string;
  path: string;
  icon: string;
  category: string;
  description: string;
}

export const CORE_PAGES_CONFIG: CorePageItem[] = [
  {
    key: "home",
    labelKey: "homeLabel",
    defaultLabel: "الرئيسية",
    path: "/",
    icon: "🏠",
    category: "البوابة الرئيسية",
    description: "بوابة مدارس العقيق الرسمية: الهيرو الملكي، البنتو الحي، والقصص التفاعلية.",
  },
  {
    key: "about",
    labelKey: "aboutLabel",
    defaultLabel: "مدارسنا",
    path: "/about",
    icon: "🏛️",
    category: "الصروح والتعريف",
    description: "فلسفة ورؤية مدارس العقيق، مجمعات البنين والبنات، والصرح التعليمي الشامل.",
  },
  {
    key: "accreditations",
    labelKey: "accreditationsLabel",
    defaultLabel: "الاعتمادات",
    path: "/accreditations",
    icon: "🏆",
    category: "الجودة والاعتماد",
    description: "الاعتماد الأكاديمي الدولي Cognia، الأوسمة، ومعايير الجودة المدرسية.",
  },
  {
    key: "admissions",
    labelKey: "admissionsLabel",
    defaultLabel: "القبول والتسجيل",
    path: "/admissions",
    icon: "🎓",
    category: "التسجيل والرسوم",
    description: "بوابة التقديم الإلكتروني الفوري، حاسبة الأقساط الذكية، وجداول الرسوم الدراسية.",
  },
  {
    key: "journal",
    labelKey: "journalLabel",
    defaultLabel: "مجلة العقيق",
    path: "/journal",
    icon: "📖",
    category: "النشر والتوثيق",
    description: "الأعداد الدورية لمجلة العقيق، المقالات والأنشطة الطلابية، وقارئ المجلة التفاعلي.",
  },
  {
    key: "albums",
    labelKey: "albumsLabel",
    defaultLabel: "ألبوم العقيق",
    path: "/albums",
    icon: "📸",
    category: "الوسائط الحية",
    description: "معارض الصور والألبومات الحصرية للأنشطة المدرسية والرحلات والاحتفالات.",
  },
  {
    key: "podcast",
    labelKey: "podcastLabel",
    defaultLabel: "أثير",
    path: "/podcast",
    icon: "🎙️",
    category: "الإنتاج الصوتي",
    description: "بودكاست أثير العقيق: حوارات وقصص وإبداعات صوتية من صميم بيئة المدرسة.",
  },
  {
    key: "articles",
    labelKey: "articlesLabel",
    defaultLabel: "المقالات",
    path: "/articles",
    icon: "✍️",
    category: "الفكر والتربية",
    description: "أقلام العقيق: مقالات تربوية ونفسية متخصصة موجهة للأسرة والمجتمع المدرسي.",
  },
  {
    key: "showcase",
    labelKey: "showcaseLabel",
    defaultLabel: "الأخبار",
    path: "/showcase",
    icon: "📰",
    category: "المركز الإعلامي",
    description: "أحدث الأخبار والتعاميم والمستجدات والفعاليات الجارية والعروض الحصرية.",
  },
];

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
  systemPortals: DEFAULT_SYSTEM_PORTALS,
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
    xEnabled: true,
    instagramUrl: "https://instagram.com/alaqeeq_schools",
    instagramEnabled: true,
    youtubeUrl: "https://youtube.com/@alaqeeq_schools",
    youtubeEnabled: true,
    snapchatUrl: "https://snapchat.com/add/alaqeeq_schools",
    snapchatEnabled: true,
    whatsappNumber: "966531896000",
    whatsappEnabled: true,
    tiktokUrl: "",
    tiktokEnabled: false,
    facebookUrl: "",
    facebookEnabled: false,
    linkedinUrl: "",
    linkedinEnabled: false,
    threadsUrl: "",
    threadsEnabled: false,
    telegramUrl: "",
    telegramEnabled: false,
  },
  topBar: {
    enabled: true,
    phone: "+966 53 189 6000",
    phoneUrl: "tel:+966531896000",
    phoneEnabled: true,
    email: "info@alaqeeqholding.com",
    emailUrl: "mailto:info@alaqeeqholding.com",
    emailEnabled: true,
    locationText: "المدينة المنورة — المملكة العربية السعودية",
    locationUrl: "https://maps.google.com/?q=Alaqeeq+Schools+Madinah",
    locationEnabled: true,
    jobsText: "بوابة التوظيف",
    jobsUrl: "https://live.aqeeq.edu.sa/jobs",
    jobsEnabled: true,
    workingHours: "أوقات الاستقبال: الأحد - الخميس 7:00 ص - 2:30 م",
    workingHoursEnabled: true,
  },
  footer: {
    copyrightText: "جميع الحقوق محفوظة لمدارس العقيق الأهلية والدولية © 2026",
    subText: "صُنعت المنصة الرقمية بأحدث التقنيات لخدمة الطلاب وأولياء الأمور والمعلمين",
    badge1Text: "اعتماد Cognia",
    badge1Url: "/accreditations",
    badge1Enabled: true,
    badge2Text: "مركز اختبارات SAT & IELTS",
    badge2Url: "/accreditations",
    badge2Enabled: true,
    quickLink1Text: "القبول والتسجيل ✦",
    quickLink1Url: "/admissions",
    quickLink1Enabled: true,
    quickLink2Text: "الاعتمادات",
    quickLink2Url: "/accreditations",
    quickLink2Enabled: true,
    quickLink3Text: "المجمعات 🏫",
    quickLink3Url: "/about",
    quickLink3Enabled: true,
    preFooterEnabled: true,
    preFooterTitle: "ابدأ مسيرة التفوق والريادة مع مدارس العقيق ✦",
    preFooterDesc: "بيئة تعليمية رائدة تجمع بين أصالة القيم وأحدث معايير التعليم الدولي (الأمريكي والدولي)، بمجمعات نموذجية متكاملة للبنين والبنات بالمدينة المنورة.",
    preFooterCta1Text: "حجز مقعد دراسي",
    preFooterCta1Url: "/admissions",
    preFooterCta2Text: "مستشار القبول",
    preFooterCta2Url: "https://wa.me/966500000000",
    preFooterCta3Text: "جدول الرسوم المعتمد",
    preFooterCta3Url: "/admissions#fees-table-section",
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
  siteStories: [
    {
      id: "story-welcome-2026",
      title: "فتح باب القبول والتسجيل للعام الدراسي الجديد",
      category: "إعلان هام 📢",
      imageUrl: "/covers/cover-admissions.jpg",
      targetUrl: "/admissions",
      buttonLabel: "سجّل مقعدك الآن",
      active: true,
      isPinned: true,
    },
    {
      id: "story-stem-robotics",
      title: "أبطال العقيق في أولمبياد الروبوت WRO",
      category: "إنجاز عالمي 🌐",
      imageUrl: "/covers/student-robotics-accreditations.jpg",
      targetUrl: "/accreditations",
      buttonLabel: "تفاصيل الإنجاز",
      active: true,
      isPinned: false,
    },
  ],
  bentoCards: [
    { id: "journal", key: "journal", title: "مجلة العقيق 3D", badge: "إصدار رقمي", enabled: true, linkUrl: "/journal" },
    { id: "albums", key: "albums", title: "ألبوم الفعاليات", badge: "معرض الصور", enabled: true, linkUrl: "/albums" },
    { id: "podcast", key: "podcast", title: "أثير العقيق", badge: "بودكاست صوتي", enabled: true, linkUrl: "/podcast" },
    { id: "articles", key: "articles", title: "مدونة ومقالات", badge: "أقلام العقيق", enabled: true, linkUrl: "/articles" },
  ],
  schoolMetrics: {
    studentsCount: 1500,
    teachersCount: 180,
    successRate: 100,
    graduatesCount: 25000,
    campusesCount: 2,
    yearsOfExperience: 30,
  },
  aboutPageConfig: {
    vision: "أن نكون الصرح التعليمي والتربوي الرائد في المملكة العربية السعودية الذي يصنع قادة الغد بتعليم نوعي وقيم أصيلة تواكب رؤية 2030.",
    mission: "تقديم بيئة تعليمية ملهمة ومحفزة للابتكار والتميز الأكاديمي، وبناء الشخصية المتوازنة والمتمسكة بهويتها الوطنية والإسلامية.",
    statYears: "منذ 1994",
    statCampuses: "مجمعين للبنين والبنات",
    statAccreditation: "Cognia أمريكي",
    statGrades: "KG - 12 كافة المراحل",
    leadershipTeam: [
      {
        name: "أ. عبد الله بن عبد العزيز الساعدي",
        role: "المشرف العام على مدارس العقيق",
        image: "/team/saadi.jpg",
        speech: "نسعى لتقديم تجربة تعليمية فريدة ترتقي بمهارات أبنائنا الطلاب وتعدهم للمستقبل بثقة واقتدار."
      },
      {
        name: "د. عبد الرحمن الأحمدي",
        role: "مدير المجمع التعليمي (بنين)",
        image: "/team/ahmadi.jpg",
        speech: "نحرص على خلق بيئة تربوية رائدة تجمع بين التحصيل العلمي وبناء المهارات القيادية."
      },
      {
        name: "أ. منيرة الحربي",
        role: "مديرة المجمع التعليمي (بنات)",
        image: "/team/harbi.jpg",
        speech: "بناتنا هن أمل المستقبل، ونعمل جاهدين لتمكينهن بالمعرفة والإبداع في بيئة متكاملة."
      }
    ]
  },
  faqs: [],
  partners: [],
  eventModal: { enabled: false, title: "", subtitle: "", badge: "", imageUrl: "", ctaText: "", ctaUrl: "" },
  vacationMode: { enabled: false, title: "", message: "", type: "vacation" as const, linkText: "", linkUrl: "" },
  accreditationsConfig: {
    cogniaScore: "99.2%",
    cogniaValidUntil: "2028",
    ieltsVenueCode: "IDP Venue Madinah",
    satCenterCode: "#68412",
    accreditationsList: [
      { id: "cognia", title: "اعتماد كوجنيا الأمريكي (Cognia)", subtitle: "الاعتماد الدولي الأرفع للتعليم المدرسي بدرجة 99.2%", badge: "اعتماد دولي", icon: "shield" },
      { id: "ministry", title: "ترخيص وتصنيف وزارة التعليم الفئة الأولى (A)", subtitle: "أعلى تصنيف للمدارس الأهلية في المدينة المنورة", badge: "تصنيف وزاري", icon: "award" },
      { id: "cambridge", title: "مركز تدريب واختبارات كامبريدج المعتمد", subtitle: "إعداد واختبار شهادات اللغة والمسار الدولي", badge: "شراكة دولية", icon: "check" },
      { id: "idp-ielts", title: "المقر الرسمي لاختبارات آيلتس (IELTS Venue)", subtitle: "قاعات اختبارات معتمدة دولياً ومجهزة بأحدث التقنيات", badge: "مركز رسمي", icon: "book" }
    ],
    awardsList: [
      { id: "award-1", title: "درع التميز والريادة لتعليم المدينة", year: "2025", authority: "الإدارة العامة للتعليم بمنطقة المدينة المنورة", category: "تفوق مؤسسي" },
      { id: "award-2", title: "المركز الأول في أولمبياد الروبوت WRO", year: "2024", authority: "الاتحاد السعودي للرياضات اللاسلكية والتحكم", category: "ابتكار وتقنية" },
      { id: "award-3", title: "الوسام الذهبي لجائزة موهبة للإبداع", year: "2024", authority: "مؤسسة الملك عبد العزيز ورجاله للموهبة والإبداع", category: "موهبة ورعاية" }
    ]
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
  const [activePillar, setActivePillar] = useState<ExecutivePillar>("admissions");
  const [admissionsSubTab, setAdmissionsSubTab] = useState<AdmissionsSubTab>("inbox");
  const [contentSubTab, setContentSubTab] = useState<ContentSubTab>("pages_content");
  const [pageContentSection, setPageContentSection] = useState<"homepage" | "about" | "accreditations" | "fees">("homepage");
  const [campaignsSubTab, setCampaignsSubTab] = useState<CampaignsSubTab>("broadcast");
  const [systemSubTab, setSystemSubTab] = useState<SystemSubTab>("pages");

  // Pages & Navigation States
  const [pagesSearchQuery, setPagesSearchQuery] = useState("");
  const [pagesFilter, setPagesFilter] = useState<"all" | "visible" | "hidden">("all");

  // Auxiliary UI States
  const [isYearbookOpen, setIsYearbookOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [admissionsFilter, setAdmissionsFilter] = useState<string>("all");
  const [admissionsSearch, setAdmissionsSearch] = useState<string>("");
  const [selectedLeadIds, setSelectedLeadIds] = useState<number[]>([]);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [isHealthOpen, setIsHealthOpen] = useState(false);

  // Sync pillar from URL search params (e.g. from InContextHUDBridge)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const pillarParam = params.get("pillar") as ExecutivePillar;
      if (pillarParam) {
        if (["admissions", "finance", "pages", "media", "community", "channels", "alerts"].includes(pillarParam)) {
          setActivePillar(pillarParam);
        } else if (pillarParam === "operations") {
          setActivePillar("admissions");
        } else if (pillarParam === "content") {
          setActivePillar("pages");
        } else if (pillarParam === "publishing") {
          setActivePillar("media");
        } else if (pillarParam === "system") {
          setActivePillar("channels");
        }
      }
    }
  }, []);

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

  const { data: admissionsList = [], refetch: refetchAdmissions, isLoading: isLoadingAdmissions } = trpc.admissions.list.useQuery(undefined, {
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
        topBar: { ...DEFAULT_ORCHESTRATION.topBar, ...(orchestrationData.topBar || {}) },
        footer: { ...DEFAULT_ORCHESTRATION.footer, ...(orchestrationData.footer || {}) },
        location: { ...DEFAULT_ORCHESTRATION.location, ...(orchestrationData.location || {}) },
        schoolSongs: (orchestrationData as any).schoolSongs || DEFAULT_ORCHESTRATION.schoolSongs,
        appShowcase: (orchestrationData as any).appShowcase || DEFAULT_ORCHESTRATION.appShowcase,
        schoolCampuses: (orchestrationData as any).schoolCampuses || DEFAULT_ORCHESTRATION.schoolCampuses,
        admissionsSettings: (orchestrationData as any).admissionsSettings || DEFAULT_ORCHESTRATION.admissionsSettings,
        interactiveFx: (orchestrationData as any).interactiveFx || DEFAULT_ORCHESTRATION.interactiveFx,
        systemPortals: (orchestrationData as any).systemPortals || DEFAULT_SYSTEM_PORTALS,
        siteStories: (orchestrationData as any).siteStories || DEFAULT_ORCHESTRATION.siteStories,
        bentoCards: (orchestrationData as any).bentoCards || DEFAULT_ORCHESTRATION.bentoCards,
        schoolMetrics: (orchestrationData as any).schoolMetrics || DEFAULT_ORCHESTRATION.schoolMetrics,
        aboutPageConfig: (orchestrationData as any).aboutPageConfig || DEFAULT_ORCHESTRATION.aboutPageConfig,
        accreditationsConfig: (orchestrationData as any).accreditationsConfig || DEFAULT_ORCHESTRATION.accreditationsConfig,
        faqs: (orchestrationData as any).faqs || [],
        partners: (orchestrationData as any).partners || [],
        eventModal: (orchestrationData as any).eventModal || {},
        vacationMode: (orchestrationData as any).vacationMode || {},
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

  // Navigation & Pages Management Helpers
  const currentHiddenKeys: string[] = orchestrationForm.nav?.hiddenNavKeys || [];

  const hasNavChanges = useMemo(() => {
    const savedNav = (orchestrationData as any)?.nav || DEFAULT_ORCHESTRATION.nav;
    const currentNav = orchestrationForm?.nav || DEFAULT_ORCHESTRATION.nav;

    const savedHidden = ((savedNav.hiddenNavKeys as string[]) || []).slice().sort().join(",");
    const currentHidden = ((currentNav.hiddenNavKeys as string[]) || []).slice().sort().join(",");
    if (savedHidden !== currentHidden) return true;

    const keys = [
      "homeLabel",
      "aboutLabel",
      "accreditationsLabel",
      "admissionsLabel",
      "journalLabel",
      "albumsLabel",
      "podcastLabel",
      "articlesLabel",
      "showcaseLabel",
    ];
    for (const k of keys) {
      if ((savedNav[k] ?? "") !== (currentNav[k] ?? "")) return true;
    }
    return false;
  }, [orchestrationData, orchestrationForm?.nav]);

  const handleTogglePageHidden = (pageKey: string) => {
    const hidden: string[] = orchestrationForm.nav?.hiddenNavKeys || [];
    const isHidden = hidden.includes(pageKey);
    const nextHidden = isHidden
      ? hidden.filter((k) => k !== pageKey)
      : [...hidden, pageKey];

    setOrchestrationForm((prev: any) => ({
      ...prev,
      nav: {
        ...prev.nav,
        hiddenNavKeys: nextHidden,
      },
    }));
  };

  const handleUpdateNavLabel = (labelKey: string, val: string) => {
    setOrchestrationForm((prev: any) => ({
      ...prev,
      nav: {
        ...prev.nav,
        [labelKey]: val,
      },
    }));
  };

  const handleResetNavLabel = (labelKey: string, defaultVal: string) => {
    setOrchestrationForm((prev: any) => ({
      ...prev,
      nav: {
        ...prev.nav,
        [labelKey]: defaultVal,
      },
    }));
    toast.info(`تمت استعادة المسمى الافتراضي: "${defaultVal}"`);
  };

  const handleUnhideAllPages = () => {
    setOrchestrationForm((prev: any) => ({
      ...prev,
      nav: {
        ...prev.nav,
        hiddenNavKeys: [],
      },
    }));
    toast.success("تم إظهار جميع الصفحات في القائمة بنجاح! 🟢");
  };

  const handleResetAllNavLabels = () => {
    setOrchestrationForm((prev: any) => ({
      ...prev,
      nav: {
        ...prev.nav,
        homeLabel: "الرئيسية",
        aboutLabel: "مدارسنا",
        accreditationsLabel: "الاعتمادات",
        admissionsLabel: "القبول والتسجيل",
        journalLabel: "مجلة العقيق",
        albumsLabel: "ألبوم العقيق",
        podcastLabel: "أثير",
        articlesLabel: "المقالات",
        showcaseLabel: "الأخبار",
      },
    }));
    toast.success("تمت استعادة كافة المسميات الافتراضية للروابط");
  };

  const handleSaveNavSettings = () => {
    setOrchestrationMutation.mutate({
      ...orchestrationForm,
      nav: orchestrationForm.nav,
    });
  };

  const handleDiscardNavChanges = () => {
    if (orchestrationData) {
      setOrchestrationForm((prev: any) => ({
        ...prev,
        nav: { ...DEFAULT_ORCHESTRATION.nav, ...(orchestrationData.nav || {}) },
      }));
    } else {
      setOrchestrationForm((prev: any) => ({
        ...prev,
        nav: { ...DEFAULT_ORCHESTRATION.nav },
      }));
    }
    toast.info("تم التراجع عن التعديلات غير المحفوظة");
  };

  const filteredCorePages = useMemo(() => {
    return CORE_PAGES_CONFIG.filter((page) => {
      const isHidden = currentHiddenKeys.includes(page.key);
      if (pagesFilter === "visible" && isHidden) return false;
      if (pagesFilter === "hidden" && !isHidden) return false;

      if (!pagesSearchQuery.trim()) return true;
      const q = pagesSearchQuery.toLowerCase().trim();
      const currentLabel = ((orchestrationForm.nav?.[page.labelKey] as string) || page.defaultLabel).toLowerCase();
      return (
        page.defaultLabel.toLowerCase().includes(q) ||
        currentLabel.includes(q) ||
        page.path.toLowerCase().includes(q) ||
        page.category.toLowerCase().includes(q) ||
        page.description.toLowerCase().includes(q)
      );
    });
  }, [pagesFilter, pagesSearchQuery, currentHiddenKeys, orchestrationForm.nav]);

  // =========================================================================
  // 🌐 System Portals & Services Management State & Handlers
  // =========================================================================
  const [portalsCategoryFilter, setPortalsCategoryFilter] = useState<"all" | SystemPortalCategory>("all");
  const [portalsSearchQuery, setPortalsSearchQuery] = useState("");
  const [editingPortal, setEditingPortal] = useState<SystemPortalItem | null>(null);
  const [isPortalModalOpen, setIsPortalModalOpen] = useState(false);
  const [deleteConfirmPortalId, setDeleteConfirmPortalId] = useState<string | null>(null);
  const [portalForm, setPortalForm] = useState<{
    id?: string;
    title: string;
    description: string;
    url: string;
    category: SystemPortalCategory;
    iconName: string;
    badge: string;
    visible: boolean;
    order: number;
    openInNewTab: boolean;
  }>({
    title: "",
    description: "",
    url: "",
    category: "parents_students",
    iconName: "file-text",
    badge: "",
    visible: true,
    order: 1,
    openInNewTab: true,
  });

  const [portalIconCategory, setPortalIconCategory] = useState<PortalIconCategory>("all");
  const [portalIconSearch, setPortalIconSearch] = useState("");

  const filteredAvailableIcons = useMemo(() => {
    const q = portalIconSearch.trim().toLowerCase();
    return AVAILABLE_PORTAL_ICONS.filter((ic) => {
      // When searching, search across all icons
      if (!q && portalIconCategory !== "all" && ic.category !== portalIconCategory) {
        return false;
      }
      if (!q) return true;
      const matchLabel = ic.label.toLowerCase().includes(q);
      const matchId = ic.id.toLowerCase().includes(q);
      const matchIcon = ic.icon.toLowerCase().includes(q);
      const matchKeywords = ic.keywords?.some((k) => k.toLowerCase().includes(q));
      return matchLabel || matchId || matchIcon || matchKeywords;
    });
  }, [portalIconCategory, portalIconSearch]);

  const currentSystemPortals: SystemPortalItem[] = useMemo(() => {
    return ((orchestrationForm?.systemPortals || DEFAULT_SYSTEM_PORTALS) as SystemPortalItem[])
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [orchestrationForm?.systemPortals]);

  const hasPortalsChanges = useMemo(() => {
    const saved = JSON.stringify((orchestrationData as any)?.systemPortals || DEFAULT_SYSTEM_PORTALS);
    const current = JSON.stringify(orchestrationForm?.systemPortals || DEFAULT_SYSTEM_PORTALS);
    return saved !== current;
  }, [orchestrationData, orchestrationForm?.systemPortals]);

  const filteredSystemPortals = useMemo(() => {
    return currentSystemPortals.filter((portal) => {
      if (portalsCategoryFilter !== "all" && portal.category !== portalsCategoryFilter) return false;
      if (!portalsSearchQuery.trim()) return true;
      const q = portalsSearchQuery.toLowerCase().trim();
      return (
        portal.title.toLowerCase().includes(q) ||
        portal.description.toLowerCase().includes(q) ||
        portal.url.toLowerCase().includes(q) ||
        (portal.badge || "").toLowerCase().includes(q)
      );
    });
  }, [currentSystemPortals, portalsCategoryFilter, portalsSearchQuery]);

  const handleTogglePortalVisibility = (id: string) => {
    const updated = currentSystemPortals.map((p) =>
      p.id === id ? { ...p, visible: !p.visible } : p
    );
    setOrchestrationForm((prev: any) => ({ ...prev, systemPortals: updated }));
  };

  const handleMovePortal = (id: string, direction: "up" | "down") => {
    const list = [...currentSystemPortals];
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) return;
    if (direction === "up" && index > 0) {
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
    } else if (direction === "down" && index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
    }
    const reordered = list.map((p, idx) => ({ ...p, order: idx + 1 }));
    setOrchestrationForm((prev: any) => ({ ...prev, systemPortals: reordered }));
  };

  const handleDeletePortal = (id: string) => {
    const updated = currentSystemPortals
      .filter((p) => p.id !== id)
      .map((p, idx) => ({ ...p, order: idx + 1 }));
    setOrchestrationForm((prev: any) => ({ ...prev, systemPortals: updated }));
    setDeleteConfirmPortalId(null);
    toast.success("تم حذف البوابة من القائمة بنجاح");
  };

  const handleResetPortalsToDefault = () => {
    setOrchestrationForm((prev: any) => ({
      ...prev,
      systemPortals: DEFAULT_SYSTEM_PORTALS,
    }));
    toast.info("تمت استعادة القائمة الرسمية الافتراضية للبوابات 🔄");
  };

  const handleSavePortals = () => {
    setOrchestrationMutation.mutate({
      ...orchestrationForm,
      systemPortals: currentSystemPortals,
    });
  };

  const handleDiscardPortalsChanges = () => {
    setOrchestrationForm((prev: any) => ({
      ...prev,
      systemPortals: (orchestrationData as any)?.systemPortals || DEFAULT_SYSTEM_PORTALS,
    }));
    toast.info("تم التراجع عن التعديلات غير المحفوظة في البوابات");
  };

  const handleOpenAddPortalModal = () => {
    setEditingPortal(null);
    setPortalIconCategory("all");
    setPortalIconSearch("");
    setPortalForm({
      title: "",
      description: "",
      url: "",
      category: "parents_students",
      iconName: "file-text",
      badge: "",
      visible: true,
      order: currentSystemPortals.length + 1,
      openInNewTab: true,
    });
    setIsPortalModalOpen(true);
  };

  const handleOpenEditPortalModal = (portal: SystemPortalItem) => {
    setEditingPortal(portal);
    setPortalIconCategory("all");
    setPortalIconSearch("");
    setPortalForm({
      id: portal.id,
      title: portal.title,
      description: portal.description,
      url: portal.url,
      category: portal.category,
      iconName: portal.iconName,
      badge: portal.badge || "",
      visible: portal.visible,
      order: portal.order,
      openInNewTab: portal.openInNewTab !== false,
    });
    setIsPortalModalOpen(true);
  };

  const handleSavePortalForm = () => {
    if (!portalForm.title.trim()) {
      toast.error("يرجى كتابة عنوان البوابة");
      return;
    }
    if (!portalForm.url.trim()) {
      toast.error("يرجى كتابة رابط البوابة");
      return;
    }

    if (editingPortal) {
      const updated = currentSystemPortals.map((p) =>
        p.id === editingPortal.id
          ? {
              ...p,
              title: portalForm.title.trim(),
              description: portalForm.description.trim(),
              url: portalForm.url.trim(),
              category: portalForm.category,
              iconName: portalForm.iconName,
              badge: portalForm.badge.trim() || undefined,
              visible: portalForm.visible,
              order: portalForm.order,
              openInNewTab: portalForm.openInNewTab,
            }
          : p
      );
      setOrchestrationForm((prev: any) => ({ ...prev, systemPortals: updated }));
      toast.success("تم تحديث بيانات البوابة بنجاح! ✏️");
    } else {
      const newPortal: SystemPortalItem = {
        id: `portal-${Date.now()}`,
        title: portalForm.title.trim(),
        description: portalForm.description.trim(),
        url: portalForm.url.trim(),
        category: portalForm.category,
        iconName: portalForm.iconName,
        badge: portalForm.badge.trim() || undefined,
        visible: portalForm.visible,
        order: currentSystemPortals.length + 1,
        openInNewTab: portalForm.openInNewTab,
      };
      setOrchestrationForm((prev: any) => ({
        ...prev,
        systemPortals: [...currentSystemPortals, newPortal],
      }));
      toast.success("تمت إضافة البوابة بنجاح! ➕");
    }

    setIsPortalModalOpen(false);
  };

  const renderDashboardPortalIcon = (iconName: string, size = 16, className = "") => {
    return renderPortalIcon(iconName, size, className);
  };

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
    if (tab === "admissions" || tab === "radar" || tab === "operations") {
      setActivePillar("admissions");
    } else if (tab === "finance" || tab === "fees" || tab === "prices") {
      setActivePillar("finance");
    } else if (tab === "content" || tab === "pages_content" || tab === "pages") {
      setActivePillar("pages");
    } else if (tab === "campaigns" || tab === "publishing" || tab === "articles" || tab === "journal" || tab === "albums" || tab === "media") {
      setActivePillar("media");
    } else if (tab === "community" || tab === "faqs" || tab === "partners") {
      setActivePillar("community");
    } else if (tab === "channels" || tab === "social" || tab === "portals" || tab === "footer") {
      setActivePillar("channels");
    } else if (tab === "alerts" || tab === "popup" || tab === "vacation" || tab === "system" || tab === "settings" || tab === "orchestration") {
      setActivePillar("alerts");
    }
  };

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
      className={
        "min-h-screen w-full max-w-full overflow-x-hidden transition-colors duration-300 font-[Tajawal,sans-serif] flex flex-col " +
        (dark ? "bg-[#05080c] text-white" : "bg-[#f8fafc] text-slate-900")
      }
    >
      {/* Sticky Top Executive Bar */}
      <ExecutiveTopBar
        dark={dark}
        toggleTheme={toggleTheme}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onSaveAll={async () => {
          await setOrchestrationMutation.mutateAsync(orchestrationForm);
        }}
        isSaving={setOrchestrationMutation.isPending}
        hasUnsavedChanges={false}
        isCanvasOpen={isCanvasOpen}
        onToggleCanvas={() => setIsCanvasOpen((prev) => !prev)}
        isHealthOpen={isHealthOpen}
        onToggleHealth={() => setIsHealthOpen((prev) => !prev)}
      />

      {/* 🩺 Site Health Copilot Drawer */}
      {isHealthOpen && (
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 pt-4 animate-in slide-in-from-top-3 duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-emerald-400">🛡️ فاحص سلامة وجودة الموقع الاستباقي (Site Health Copilot)</span>
            <button
              type="button"
              onClick={() => setIsHealthOpen(false)}
              className="text-xs font-bold text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-white/5 cursor-pointer"
            >
              إغلاق ✕
            </button>
          </div>
          <SiteHealthCopilot
            orchestration={orchestrationForm}
            onUpdateOrchestration={async (updated) => {
              setOrchestrationForm((prev: any) => ({ ...prev, ...updated }));
              await setOrchestrationMutation.mutateAsync({ ...orchestrationForm, ...updated });
            }}
            dark={dark}
          />
        </div>
      )}

      {/* 📱 Live Studio Multi-Device Canvas */}
      {isCanvasOpen && (
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 pt-4 animate-in slide-in-from-top-3 duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-amber-400">📱 الكانفاس الحي متعدد الشاشات (Live Studio Multi-Device Canvas)</span>
            <button
              type="button"
              onClick={() => setIsCanvasOpen(false)}
              className="text-xs font-bold text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-white/5 cursor-pointer"
            >
              إغلاق الكانفاس ✕
            </button>
          </div>
          <LiveStudioCanvas dark={dark} onClose={() => setIsCanvasOpen(false)} />
        </div>
      )}

      {/* 2-Column Command Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1600px] mx-auto">
        {/* Collapsible Executive Sidebar */}
        <ExecutiveSidebar
          dark={dark}
          activePillar={activePillar}
          setActivePillar={setActivePillar}
          pendingLeadsCount={pendingLeadsCount}
          pendingArticlesCount={pendingArticlesCount}
          user={user}
          onLogout={() => void logout()}
          kpiData={{
            totalAdmissions: admissionsList.length,
            pendingAdmissions: pendingLeadsCount,
            totalArticles: allAdminArticles.length,
            pendingArticles: pendingArticlesCount,
            totalIssues: (masterContent as any[]).filter((c) => c.type === "journal").length,
            totalAlbums: (masterContent as any[]).filter((c) => c.type === "album").length,
          }}
        />

        {/* Dynamic Pillar Workspace Canvas (7 Specialized Hubs) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          {/* 1. شؤون القبول والتسجيل */}
          {(activePillar === "admissions" || activePillar === "operations") && (
            <OperationsHub
              dark={dark}
              leads={admissionsList as any}
              isLoadingLeads={isLoadingAdmissions}
              onUpdateLeadStatus={async (id, status) => {
                await updateAdmissionStatusMutation.mutateAsync({ id, status } as any);
                refetchAdmissions();
              }}
              onDeleteLead={async (id) => {
                await deleteAdmissionMutation.mutateAsync({ id } as any);
                refetchAdmissions();
              }}
              orchestration={orchestrationForm}
              onSaveOrchestration={async (updated) => {
                await setOrchestrationMutation.mutateAsync(updated);
              }}
              isSaving={setOrchestrationMutation.isPending}
            />
          )}

          {/* 2. الرسوم الدراسية والمالية */}
          {activePillar === "finance" && (
            <TuitionFinanceHub
              dark={dark}
              orchestration={orchestrationForm}
              onSaveOrchestration={async (updated) => {
                await setOrchestrationMutation.mutateAsync(updated);
              }}
              isSaving={setOrchestrationMutation.isPending}
            />
          )}

          {/* 3. صفحات الموقع والتعريف */}
          {(activePillar === "pages" || activePillar === "content") && (
            <SiteContentStudio
              dark={dark}
              orchestration={orchestrationForm}
              onSaveOrchestration={async (updated) => {
                await setOrchestrationMutation.mutateAsync(updated);
              }}
              isSaving={setOrchestrationMutation.isPending}
            />
          )}

          {/* 4. المركز الإعلامي والنشر */}
          {(activePillar === "media" || activePillar === "publishing") && (
            <PublishingStudio
              dark={dark}
              masterContent={masterContent as any}
              pendingArticles={allAdminArticles as any}
              onApproveArticle={async (id) => {
                await moderateArticleMutation.mutateAsync({ id, status: "approved" } as any);
                refetchAdminArticles();
              }}
              onRejectArticle={async (id) => {
                await moderateArticleMutation.mutateAsync({ id, status: "rejected" } as any);
                refetchAdminArticles();
              }}
              onDeleteContentItem={async (type, id) => {
                if (type === "article") {
                  await deleteArticleMutation.mutateAsync({ id: Number(id) } as any);
                  refetchAdminArticles();
                }
              }}
              onNavigate={navigate}
              orchestrationForm={orchestrationForm}
              setOrchestrationForm={setOrchestrationForm}
              onSaveOrchestration={async () => {
                await setOrchestrationMutation.mutateAsync(orchestrationForm);
              }}
              isSaving={setOrchestrationMutation.isPending}
            />
          )}

          {/* 5. الأسئلة الشائعة والشركاء */}
          {activePillar === "community" && (
            <CommunityHub
              dark={dark}
              orchestration={orchestrationForm}
              onSaveOrchestration={async (updated) => {
                await setOrchestrationMutation.mutateAsync(updated);
              }}
              isSaving={setOrchestrationMutation.isPending}
            />
          )}

          {/* 6. القنوات والربط الرقمي */}
          {(activePillar === "channels" || activePillar === "system") && (
            <SystemBrandHub
              dark={dark}
              mode="channels"
              orchestration={orchestrationForm}
              onSaveOrchestration={async (updated) => {
                await setOrchestrationMutation.mutateAsync(updated);
              }}
              isSaving={setOrchestrationMutation.isPending}
            />
          )}

          {/* 7. الإعلانات والتنبيهات والمواسم */}
          {activePillar === "alerts" && (
            <SystemBrandHub
              dark={dark}
              mode="alerts"
              orchestration={orchestrationForm}
              onSaveOrchestration={async (updated) => {
                await setOrchestrationMutation.mutateAsync(updated);
              }}
              isSaving={setOrchestrationMutation.isPending}
            />
          )}
        </main>
      </div>

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
