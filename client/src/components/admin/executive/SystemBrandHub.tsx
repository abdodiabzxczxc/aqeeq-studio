import React, { useState, useEffect } from "react";
import {
  Sliders,
  Share2,
  AlertTriangle,
  Globe,
  Radio,
  Sparkles,
  Save,
  CheckCircle2,
  Lock,
  Instagram,
  Phone,
  Mail,
  MapPin,
  Flame,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  ExternalLink,
  Briefcase,
  PhoneCall,
  Video,
  Ticket,
  Cloud,
  Server,
  Shield,
  Clock,
  ChevronDown,
  ChevronUp,
  Palmtree,
  Megaphone,
  FileText,
  Award,
  GraduationCap,
  Link2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { TemplateVariant, TEMPLATE_VARIANT_INFO } from "@/lib/useSiteTheme";
import { trpc } from "@/lib/trpc";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface SystemBrandHubProps {
  dark: boolean;
  orchestration: any;
  onSaveOrchestration: (updated: any) => Promise<void>;
  isSaving: boolean;
  mode?: "channels" | "alerts" | "all";
}

export function SystemBrandHub({
  dark,
  orchestration,
  onSaveOrchestration,
  isSaving,
  mode = "all",
}: SystemBrandHubProps) {
  const utils = trpc.useUtils();
  const defaultTab = mode === "alerts" ? "popup" : "header_footer";
  const [subTab, setSubTab] = useState<"header_footer" | "footer" | "popup" | "vacation" | "portals" | "emergency" | "marketing" | "seasons">(defaultTab);

  useEffect(() => {
    if (mode === "alerts" && (subTab === "header_footer" || subTab === "portals" || subTab === "footer")) {
      setSubTab("popup");
    } else if (mode === "channels" && (subTab === "popup" || subTab === "emergency" || subTab === "vacation" || subTab === "seasons" || subTab === "marketing")) {
      setSubTab("header_footer");
    }
  }, [mode]);

  // 1. Top Utility Bar Form (بوابة التوظيف وأرقام الاستقبال)
  const currentTopBar = orchestration?.topBar || {
    enabled: true,
    locationText: "المدينة المنورة — المملكة العربية السعودية",
    locationUrl: "https://maps.google.com/?q=Alaqeeq+Schools+Madinah",
    locationEnabled: true,
    phone: "+966 53 189 6000",
    phoneUrl: "tel:+966531896000",
    phoneEnabled: true,
    email: "info@alaqeeqholding.com",
    emailUrl: "mailto:info@alaqeeqholding.com",
    emailEnabled: true,
    jobsText: "بوابة التوظيف",
    jobsUrl: "https://live.aqeeq.edu.sa/jobs",
    jobsEnabled: true,
    workingHours: "أوقات الاستقبال: الأحد - الخميس 7:00 ص - 2:30 م",
    workingHoursEnabled: true,
  };
  const [topBarForm, setTopBarForm] = useState(currentTopBar);

  // 2. Nav & Header Form
  const currentNav = orchestration?.nav || {};
  const [navForm, setNavForm] = useState(currentNav);

  // 3. Social Form (10 Platforms with URLs and Show/Hide Toggles)
  const currentSocial = orchestration?.social || {};
  const [socialForm, setSocialForm] = useState<Record<string, any>>({
    xUrl: currentSocial.xUrl || "",
    xEnabled: currentSocial.xEnabled !== false,
    instagramUrl: currentSocial.instagramUrl || "",
    instagramEnabled: currentSocial.instagramEnabled !== false,
    youtubeUrl: currentSocial.youtubeUrl || "",
    youtubeEnabled: currentSocial.youtubeEnabled !== false,
    snapchatUrl: currentSocial.snapchatUrl || "",
    snapchatEnabled: currentSocial.snapchatEnabled !== false,
    tiktokUrl: currentSocial.tiktokUrl || "",
    tiktokEnabled: currentSocial.tiktokEnabled !== false,
    facebookUrl: currentSocial.facebookUrl || "",
    facebookEnabled: currentSocial.facebookEnabled !== false,
    linkedinUrl: currentSocial.linkedinUrl || "",
    linkedinEnabled: currentSocial.linkedinEnabled !== false,
    telegramUrl: currentSocial.telegramUrl || "",
    telegramEnabled: currentSocial.telegramEnabled !== false,
    whatsappUrl: currentSocial.whatsappUrl || "",
    whatsappEnabled: currentSocial.whatsappEnabled !== false,
    phoneUrl: currentSocial.phoneUrl || "",
    phoneEnabled: currentSocial.phoneEnabled !== false,
  });

  const SOCIAL_NETWORKS_CONFIG = [
    { key: "x", name: "1. منصة إكس (تويتر)", sub: "X / Twitter", placeholder: "https://x.com/alaqeeq..." },
    { key: "instagram", name: "2. إنستغرام", sub: "Instagram", placeholder: "https://instagram.com/alaqeeq..." },
    { key: "youtube", name: "3. قناة يوتيوب", sub: "YouTube", placeholder: "https://youtube.com/@alaqeeq..." },
    { key: "snapchat", name: "4. سناب شات", sub: "Snapchat", placeholder: "https://snapchat.com/add/..." },
    { key: "tiktok", name: "5. تيك توك", sub: "TikTok", placeholder: "https://tiktok.com/@alaqeeq..." },
    { key: "facebook", name: "6. فيسبوك", sub: "Facebook", placeholder: "https://facebook.com/alaqeeq..." },
    { key: "linkedin", name: "7. لينكد إن", sub: "LinkedIn", placeholder: "https://linkedin.com/company/alaqeeq..." },
    { key: "telegram", name: "8. قناة تيليجرام", sub: "Telegram", placeholder: "https://t.me/alaqeeq..." },
    { key: "whatsapp", name: "9. واتساب الموحد", sub: "WhatsApp (+966)", placeholder: "https://wa.me/966531896000" },
    { key: "phone", name: "10. الهاتف الموحد / الاتصال", sub: "Phone Call", placeholder: "tel:+966531896000" },
  ];

  // 4. System Portals Form
  const [portalsList, setPortalsList] = useState<SystemPortalItem[]>(
    orchestration?.systemPortals && orchestration.systemPortals.length > 0
      ? orchestration.systemPortals
      : DEFAULT_SYSTEM_PORTALS
  );
  const [isAddingPortal, setIsAddingPortal] = useState(false);
  const [newPortalTitle, setNewPortalTitle] = useState("");
  const [newPortalDesc, setNewPortalDesc] = useState("");
  const [newPortalUrl, setNewPortalUrl] = useState("");
  const [newPortalCategory, setNewPortalCategory] = useState<SystemPortalCategory>("parents_students");
  const [newPortalIcon, setNewPortalIcon] = useState("file-text");
  const [newPortalBadge, setNewPortalBadge] = useState("");

  // 5. Emergency Banner Form
  const currentBanner = orchestration?.emergencyBanner || {};
  const [bannerForm, setBannerForm] = useState(currentBanner);

  // 6. Marketing Pixels Form
  const currentPixels = orchestration?.marketingPixels || {};
  const [pixelsForm, setPixelsForm] = useState(currentPixels);

  // 7. Seasons & National Day Theme Form
  const currentTheme = orchestration?.theme || {};
  const currentThemeMode = orchestration?.themeMode || {
    activeTheme: "default",
    expiresAt: null,
    templateVariant: "vision",
    customBadgeText: "نحلم ونحقق 🇸🇦",
    showCelebrationRibbon: true,
    backgroundPatternOpacity: 85,
  };
  const [selectedSeason, setSelectedSeason] = useState<string>(
    orchestration?.themeMode?.activeTheme === "saudi-national-day"
      ? "national_day"
      : orchestration?.theme?.season || "default"
  );
  const [themeModeForm, setThemeModeForm] = useState<{
    activeTheme: "default" | "saudi-national-day";
    durationHours: number | null;
    templateVariant: TemplateVariant;
    customBadgeText: string;
    showCelebrationRibbon: boolean;
    backgroundPatternOpacity: number;
  }>({
    activeTheme: (orchestration?.themeMode?.activeTheme || (currentTheme?.season === "national_day" ? "saudi-national-day" : "default")) as "default" | "saudi-national-day",
    durationHours: null,
    templateVariant: (orchestration?.themeMode?.templateVariant as TemplateVariant) || "vision",
    customBadgeText: orchestration?.themeMode?.customBadgeText || "نحلم ونحقق 🇸🇦",
    showCelebrationRibbon: orchestration?.themeMode?.showCelebrationRibbon !== false,
    backgroundPatternOpacity: orchestration?.themeMode?.backgroundPatternOpacity ?? 85,
  });

  // 8. Footer Form (Pre-footer, Badges, Quick Links, Copyright)
  const currentFooter = orchestration?.footer || {
    preFooterEnabled: true,
    preFooterTitle: "ابدأ مسيرة التفوق والريادة مع مدارس العقيق ✦",
    preFooterDesc: "بيئة تعليمية رائدة تجمع بين أصالة القيم وأحدث معايير التعليم الدولي (الأمريكي والدولي)، بمجمعات نموذجية متكاملة للبنين والبنات بالمدينة المنورة.",
    preFooterCta1Text: "حجز مقعد دراسي",
    preFooterCta1Url: "/admissions",
    preFooterCta2Text: "مستشار القبول",
    preFooterCta2Url: "https://wa.me/966531896000",
    preFooterCta3Text: "جدول الرسوم المعتمد",
    preFooterCta3Url: "/admissions#fees-table-section",
    badge1Enabled: true,
    badge1Text: "اعتماد Cognia",
    badge1Url: "/accreditations",
    badge2Enabled: true,
    badge2Text: "مركز اختبارات SAT & IELTS",
    badge2Url: "/accreditations",
    quickLink1Enabled: true,
    quickLink1Text: "القبول والتسجيل ✦",
    quickLink1Url: "/admissions",
    quickLink2Enabled: true,
    quickLink2Text: "الاعتمادات",
    quickLink2Url: "/accreditations",
    quickLink3Enabled: true,
    quickLink3Text: "المجمعات 🏫",
    quickLink3Url: "/about",
    copyrightText: "جميع الحقوق محفوظة لمدارس العقيق الأهلية والدولية © 2026",
  };
  const [footerForm, setFooterForm] = useState(currentFooter);

  // 9. Event Pop-up Modal Form
  const currentEventModal = orchestration?.eventModal || {
    enabled: false,
    title: "فتح باب القبول والتسجيل للعام الدراسي الجديد",
    subtitle: "يسر مدارس العقيق الأهلية والدولية الإعلان عن بدء استقبال طلبات الالتحاق ببرامج التعليم العام والمسار الأمريكي المعتمد.",
    badge: "إعلان هام ✦ 2026/2027",
    imageUrl: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80",
    ctaText: "حجز مقعد دراسي الآن 🚀",
    ctaUrl: "/admissions",
  };
  const [eventModalForm, setEventModalForm] = useState(currentEventModal);

  // 10. Vacation / Maintenance Mode Form
  const currentVacation = orchestration?.vacationMode || {
    enabled: false,
    title: "إجازة نهاية الفصل الدراسي",
    message: "نتمنى لطلابنا وأولياء أمورنا إجازة سعيدة ومباركة. يُستأنف استقبال طلبات التسجيل الإلكتروني على مدار الساعة.",
    type: "vacation",
    linkText: "التقديم الإلكتروني 24/7",
    linkUrl: "/admissions",
  };
  const [vacationForm, setVacationForm] = useState(currentVacation);


  const SEASONS = [
    { id: "default", name: "الهوية الرسمية الأصلية 🏛️", desc: "أزرق ياقوتي ملكي مع ذهب العقيق المعتمد" },
    { id: "national_day", name: "اليوم الوطني السعودي 94 🇸🇦", desc: "أخضر زمردي ملكي وبانرات الاحتفاء الوطنية" },
    { id: "founding_day", name: "يوم التأسيس السعودي 🇸🇦", desc: "ألوان تراثية دافئة ونقوش يوم التأسيس" },
    { id: "ramadan", name: "شهر رمضان المبارك 🌙", desc: "ثيم الشهر الفضيل، أوقات الدوام، والتهاني" },
    { id: "exams", name: "موسم الاختبارات النهائية 📝", desc: "أدعية التوفيق ونصائح وإرشادات اللجان" },
  ];

  // Synchronize form states when orchestration prop updates
  useEffect(() => {
    if (orchestration) {
      if (orchestration.topBar) setTopBarForm(orchestration.topBar);
      if (orchestration.nav) setNavForm(orchestration.nav);
      if (orchestration.social) {
        setSocialForm({
          xUrl: orchestration.social.xUrl || "",
          xEnabled: orchestration.social.xEnabled !== false,
          instagramUrl: orchestration.social.instagramUrl || "",
          instagramEnabled: orchestration.social.instagramEnabled !== false,
          youtubeUrl: orchestration.social.youtubeUrl || "",
          youtubeEnabled: orchestration.social.youtubeEnabled !== false,
          snapchatUrl: orchestration.social.snapchatUrl || "",
          snapchatEnabled: orchestration.social.snapchatEnabled !== false,
          tiktokUrl: orchestration.social.tiktokUrl || "",
          tiktokEnabled: orchestration.social.tiktokEnabled !== false,
          facebookUrl: orchestration.social.facebookUrl || "",
          facebookEnabled: orchestration.social.facebookEnabled !== false,
          linkedinUrl: orchestration.social.linkedinUrl || "",
          linkedinEnabled: orchestration.social.linkedinEnabled !== false,
          telegramUrl: orchestration.social.telegramUrl || "",
          telegramEnabled: orchestration.social.telegramEnabled !== false,
          whatsappUrl: orchestration.social.whatsappUrl || "",
          whatsappEnabled: orchestration.social.whatsappEnabled !== false,
          phoneUrl: orchestration.social.phoneUrl || "",
          phoneEnabled: orchestration.social.phoneEnabled !== false,
        });
      }
      if (orchestration.systemPortals && orchestration.systemPortals.length > 0) {
        setPortalsList(orchestration.systemPortals);
      }
      if (orchestration.emergencyBanner) setBannerForm(orchestration.emergencyBanner);
      if (orchestration.marketingPixels) setPixelsForm(orchestration.marketingPixels);
      if (orchestration.themeMode) {
        setThemeModeForm((prev) => ({
          ...prev,
          activeTheme: orchestration.themeMode.activeTheme || "default",
          templateVariant: (orchestration.themeMode.templateVariant as TemplateVariant) || "vision",
          customBadgeText: orchestration.themeMode.customBadgeText || "نحلم ونحقق 🇸🇦",
          showCelebrationRibbon: orchestration.themeMode.showCelebrationRibbon !== false,
          backgroundPatternOpacity: orchestration.themeMode.backgroundPatternOpacity ?? 85,
        }));
        if (orchestration.themeMode.activeTheme === "saudi-national-day") {
          setSelectedSeason("national_day");
        }
      }
      if (orchestration.theme?.season) {
        setSelectedSeason(orchestration.theme.season);
        if (orchestration.theme.season === "national_day") {
          setThemeModeForm((prev) => ({ ...prev, activeTheme: "saudi-national-day" }));
        }
      }
      if (orchestration.footer) setFooterForm((prev: any) => ({ ...prev, ...orchestration.footer }));
      if (orchestration.eventModal) setEventModalForm((prev: any) => ({ ...prev, ...orchestration.eventModal }));
      if (orchestration.vacationMode) setVacationForm((prev: any) => ({ ...prev, ...orchestration.vacationMode }));
    }
  }, [orchestration]);

  // Portals Helper Functions
  const handleTogglePortalVisibility = (id: string) => {
    setPortalsList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, visible: !p.visible } : p))
    );
  };

  const handleMovePortal = (id: string, direction: "up" | "down") => {
    const list = [...portalsList];
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
    setPortalsList(reordered);
  };

  const handleDeletePortal = (id: string) => {
    setPortalsList((prev) =>
      prev.filter((p) => p.id !== id).map((p, idx) => ({ ...p, order: idx + 1 }))
    );
    toast.success("تم حذف البوابة من القائمة");
  };

  const handleAddPortal = () => {
    if (!newPortalTitle.trim() || !newPortalUrl.trim()) {
      toast.error("يرجى إدخال اسم البوابة ورابط التوجيه");
      return;
    }
    const newP: SystemPortalItem = {
      id: "portal-" + Date.now(),
      title: newPortalTitle.trim(),
      description: newPortalDesc.trim(),
      url: newPortalUrl.trim(),
      category: newPortalCategory,
      iconName: newPortalIcon,
      badge: newPortalBadge.trim() || undefined,
      visible: true,
      order: portalsList.length + 1,
      openInNewTab: true,
    };
    setPortalsList([...portalsList, newP]);
    setNewPortalTitle("");
    setNewPortalDesc("");
    setNewPortalUrl("");
    setNewPortalBadge("");
    setIsAddingPortal(false);
    toast.success("تمت إضافة البوابة بنجاح ➕");
  };

  const handleResetPortalsToDefault = () => {
    setPortalsList(DEFAULT_SYSTEM_PORTALS);
    toast.info("تمت استعادة بوابات المدارس الافتراضية 🔄");
  };

  return (
    <div className="space-y-6">
      {/* Top Hub Bar */}
      <div className={`p-4 sm:p-5 rounded-3xl border flex flex-wrap items-center justify-between gap-4 ${
        dark ? "border-white/10 bg-[#0c1015]" : "border-black/10 bg-white shadow-xs"
      }`}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            {mode === "channels" ? <Share2 size={20} /> : mode === "alerts" ? <Megaphone size={20} /> : <Sliders size={20} />}
          </div>
          <div>
            <h2 className="text-base font-black">
              {mode === "channels"
                ? "القنوات والربط الرقمي وبوابات الخدمات 📱🚪"
                : mode === "alerts"
                ? "الإعلانات والتنبيهات والمواسم الوطنية 📣🇸🇦"
                : "هوية المنظومة والتقنية والحوكمة"}
            </h2>
            <p className="text-xs text-slate-400 font-bold">
              {mode === "channels"
                ? "إدارة شبكات التواصل الاجتماعي الـ 10، بوابات الأنظمة (مدرستي/نور)، وبطاقة وروابط الفوتر"
                : mode === "alerts"
                ? "إدارة النافذة الإعلانية المنبثقة، البانر العاجل، وضع العطلات، وثيمات المناسبات الوطنية"
                : "إدارة الهيدر والفوتر، بوابة التوظيف، شبكات التواصل الـ 10، بوابات المدارس، وبكسلات التسويق"}
            </p>
          </div>
        </div>

        {/* Sub-tab Pills (Filtered by Mode) */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-current/10">
          {(mode === "channels" || mode === "all") && (
            <>
              <button
                type="button"
                onClick={() => setSubTab("header_footer")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  subTab === "header_footer"
                    ? dark ? "bg-[#f8ca14] text-black shadow" : "bg-[#08467d] text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>شبكات التواصل والتوظيف 📱</span>
              </button>
              <button
                type="button"
                onClick={() => setSubTab("portals")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  subTab === "portals"
                    ? dark ? "bg-[#f8ca14] text-black shadow" : "bg-[#08467d] text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Server size={13} />
                <span>بوابات الأنظمة ({portalsList.length}) 🚪</span>
              </button>
              <button
                type="button"
                onClick={() => setSubTab("footer")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  subTab === "footer"
                    ? dark ? "bg-[#f8ca14] text-black shadow" : "bg-[#08467d] text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FileText size={13} />
                <span>روابط وبطاقة الفوتر 📄</span>
              </button>
            </>
          )}

          {(mode === "alerts" || mode === "all") && (
            <>
              <button
                type="button"
                onClick={() => setSubTab("popup")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  subTab === "popup"
                    ? dark ? "bg-[#f8ca14] text-black shadow" : "bg-[#08467d] text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Megaphone size={13} />
                <span>النافذة الإعلانية المنبثقة 📣</span>
              </button>
              <button
                type="button"
                onClick={() => setSubTab("emergency")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                  subTab === "emergency"
                    ? dark ? "bg-[#f8ca14] text-black shadow" : "bg-[#08467d] text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                البانر العاجل 🚨
              </button>
              <button
                type="button"
                onClick={() => setSubTab("vacation")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  subTab === "vacation"
                    ? dark ? "bg-[#f8ca14] text-black shadow" : "bg-[#08467d] text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Palmtree size={13} />
                <span>وضع العطلات والصيانة 🌴</span>
              </button>
              <button
                type="button"
                onClick={() => setSubTab("seasons")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                  subTab === "seasons"
                    ? dark ? "bg-[#f8ca14] text-black shadow" : "bg-[#08467d] text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                المواسم الوطنية 🇸🇦
              </button>
              <button
                type="button"
                onClick={() => setSubTab("marketing")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                  subTab === "marketing"
                    ? dark ? "bg-[#f8ca14] text-black shadow" : "bg-[#08467d] text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                التسويق و SEO 📈
              </button>
            </>
          )}
        </div>
      </div>

      {/* SUBTAB 1: HEADER & FOOTER & JOBS & 10 SOCIAL CHANNELS */}
      {subTab === "header_footer" && (
        <Accordion type="multiple" defaultValue={["topbar"]} className="space-y-4 animate-in fade-in duration-200">
          {/* Section 1A: Top Utility Bar & Employment Portal (بوابة التوظيف) */}
          <AccordionItem value="topbar" className={`rounded-3xl border overflow-hidden ${dark ? "border-white/10 bg-[#0d1218]" : "border-black/10 bg-white shadow-xs"}`}>
            <AccordionTrigger className="px-6 py-4 text-right hover:no-underline [&>svg]:ml-0 [&>svg]:mr-auto">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Briefcase size={20} />
                </div>
                <div className="text-right">
                  <p className="text-sm font-black">الشريط العلوي الرئاسي وبوابة التوظيف</p>
                  <p className="text-xs text-slate-400 font-bold mt-0.5">أرقام التواصل، أوقات الدوام، رابط بوابة التوظيف</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 space-y-6">
              <Button
                type="button"
                onClick={async () => {
                  await onSaveOrchestration({
                    topBar: topBarForm,
                    nav: navForm,
                    social: socialForm,
                  });
                  toast.success("تم حفظ إعدادات الهيدر وبوابة التوظيف بنجاح ✅");
                }}
                disabled={isSaving}
                className="rounded-xl font-black text-xs px-5 bg-amber-500 hover:bg-amber-400 text-black gap-1.5 cursor-pointer"
              >
                <Save size={13} />
                <span>{isSaving ? "جاري الحفظ..." : "حفظ التعديلات 💾"}</span>
              </Button>

            {/* Employment Portal Box (بوابة التوظيف) */}
            <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase size={16} className="text-amber-400" />
                  <h4 className="text-xs font-black text-amber-400">إعدادات بوابة التوظيف الرسمية</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400">
                    {topBarForm.jobsEnabled ? "مفعلة وتظهر بالهيدر 🟢" : "مخفية مؤقتاً ⚪"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setTopBarForm({ ...topBarForm, jobsEnabled: !topBarForm.jobsEnabled })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      topBarForm.jobsEnabled ? "bg-amber-500" : "bg-slate-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                        topBarForm.jobsEnabled ? "translate-x-0" : "-translate-x-5"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">نص زر بوابة التوظيف</label>
                  <input
                    type="text"
                    value={topBarForm.jobsText || ""}
                    onChange={(e) => setTopBarForm({ ...topBarForm, jobsText: e.target.value })}
                    placeholder="بوابة التوظيف"
                    className="w-full rounded-xl border p-2.5 text-xs font-bold outline-none bg-white/5"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">رابط بوابة التقديم والوظائف (URL)</label>
                  <input
                    type="text"
                    value={topBarForm.jobsUrl || ""}
                    onChange={(e) => setTopBarForm({ ...topBarForm, jobsUrl: e.target.value })}
                    placeholder="https://live.aqeeq.edu.sa/jobs"
                    className="w-full rounded-xl border p-2.5 text-xs font-mono outline-none bg-white/5"
                  />
                </div>
              </div>
            </div>

            {/* Other Top Bar Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 block">ساعات الدوام وأوقات الاستقبال</label>
                <input
                  type="text"
                  value={topBarForm.workingHours || ""}
                  onChange={(e) => setTopBarForm({ ...topBarForm, workingHours: e.target.value })}
                  placeholder="أوقات الاستقبال: الأحد - الخميس 7:00 ص - 2:30 م"
                  className="w-full rounded-xl border p-2.5 text-xs font-bold outline-none bg-white/5"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 block">نص الموقع الجغرافي بالهيدر</label>
                <input
                  type="text"
                  value={topBarForm.locationText || ""}
                  onChange={(e) => setTopBarForm({ ...topBarForm, locationText: e.target.value })}
                  placeholder="المدينة المنورة — المملكة العربية السعودية"
                  className="w-full rounded-xl border p-2.5 text-xs font-bold outline-none bg-white/5"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 block">رابط خرائط جوجل للمدارس</label>
                <input
                  type="text"
                  value={topBarForm.locationUrl || ""}
                  onChange={(e) => setTopBarForm({ ...topBarForm, locationUrl: e.target.value })}
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full rounded-xl border p-2.5 text-xs font-mono outline-none bg-white/5"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 block">نص زر الإجراء بالهيدر (CTA Button)</label>
                <input
                  type="text"
                  value={navForm.ctaButtonText || "القبول والتسجيل 🎓"}
                  onChange={(e) => setNavForm({ ...navForm, ctaButtonText: e.target.value })}
                  className="w-full rounded-xl border p-2.5 text-xs font-bold outline-none bg-white/5"
                />
              </div>
            </div>
            </AccordionContent>
          </AccordionItem>

          {/* Section 1B: The 10 Official Social Media Platforms (شبكات التواصل الاجتماعي الـ 10) */}
          <AccordionItem value="social" className={`rounded-3xl border overflow-hidden ${dark ? "border-white/10 bg-[#0d1218]" : "border-black/10 bg-white shadow-xs"}`}>
            <AccordionTrigger className="px-6 py-4 text-right hover:no-underline [&>svg]:ml-0 [&>svg]:mr-auto">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Share2 size={20} />
                </div>
                <div className="text-right">
                  <p className="text-sm font-black">شبكات التواصل الاجتماعي الرسمية (10 قنوات)</p>
                  <p className="text-xs text-slate-400 font-bold mt-0.5">تظهر في فوتر الموقع وشريط الاتصال السريع</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="flex items-center justify-between pb-3 border-b border-current/10 mb-4">
              <div>
                <h3 className="text-base font-black">شبكات التواصل الاجتماعي الرسمية (10 قنوات معتمدة) 📱🔗</h3>
                <p className="text-xs text-slate-400 font-bold mt-0.5">
                  تظهر في فوتر الموقع وشريط الاتصال السريع، وتغذي شارات التواصل بالموقع
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={async () => {
                    await onSaveOrchestration({ social: socialForm });
                    toast.success("تم حفظ روابط وقنوات التواصل الاجتماعي الـ 10 بنجاح 💾");
                  }}
                  disabled={isSaving}
                  className="rounded-xl font-black text-xs px-5 bg-amber-500 hover:bg-amber-400 text-black gap-1.5 cursor-pointer shadow-md"
                >
                  <Save size={13} />
                  <span>{isSaving ? "جاري الحفظ..." : "حفظ شبكات التواصل 💾"}</span>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {SOCIAL_NETWORKS_CONFIG.map((net) => {
                const urlKey = `${net.key}Url`;
                const enabledKey = `${net.key}Enabled`;
                const isEnabled = socialForm[enabledKey] !== false;
                const urlValue = socialForm[urlKey] || "";

                return (
                  <div key={net.key} className="p-3.5 rounded-2xl bg-white/[0.02] border border-current/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-black block">{net.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{net.sub}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400">
                          {isEnabled ? "ظاهر 🟢" : "مخفي ⚪"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSocialForm((prev) => ({ ...prev, [enabledKey]: !isEnabled }))}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                            isEnabled ? "bg-amber-400" : "bg-slate-700"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
                              isEnabled ? "translate-x-0" : "-translate-x-4"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={urlValue}
                      onChange={(e) => setSocialForm((prev) => ({ ...prev, [urlKey]: e.target.value }))}
                      placeholder={net.placeholder}
                      className="w-full rounded-xl border p-2 text-xs font-mono outline-none bg-white/5"
                    />
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-current/10 flex justify-end">
              <Button
                type="button"
                onClick={async () => {
                  await onSaveOrchestration({ social: socialForm });
                  toast.success("تم حفظ روابط وقنوات التواصل الاجتماعي الـ 10 بنجاح 💾");
                }}
                disabled={isSaving}
                className="rounded-xl font-black text-xs px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black gap-2 cursor-pointer shadow-lg"
              >
                <Save size={14} />
                <span>{isSaving ? "جاري الحفظ..." : "حفظ وتفعيل شبكات التواصل الـ 10 💾"}</span>
              </Button>
            </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}


      {/* SUBTAB: FOOTER CONTENT & QUICK LINKS MANAGER (روابط وبطاقة الفوتر) */}
      {subTab === "footer" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Card 1: Pre-Footer Call to Action Banner */}
          <div className={`p-6 rounded-3xl border space-y-5 ${dark ? "border-white/10 bg-[#0d1218]" : "border-black/10 bg-white shadow-xs"}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-current/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black">شريط الدعوة للتسجيل المسبق (Pre-Footer Banner) 📣</h3>
                  <p className="text-xs text-slate-400 font-bold mt-0.5">
                    البطاقة الترويجية الفاخرة التي تسبق الفوتر في كافة صفحات الموقع وتدعو للتسجيل المباشر
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={async () => {
                    await onSaveOrchestration({ footer: footerForm });
                    toast.success("تم حفظ إعدادات بطاقة الفوتر بنجاح 💾");
                  }}
                  disabled={isSaving}
                  className="rounded-xl font-black text-xs px-5 bg-amber-500 hover:bg-amber-400 text-black gap-1.5 cursor-pointer shadow-md"
                >
                  <Save size={13} />
                  <span>{isSaving ? "جاري الحفظ..." : "حفظ إعدادات الفوتر 💾"}</span>
                </Button>
              </div>
            </div>

            {/* Toggle Active */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-current/10">
              <div>
                <span className="text-xs font-black block">تفعيل ظهور بطاقة ما قبل الفوتر (Pre-Footer)</span>
                <span className="text-[10px] text-slate-400 font-bold">عند التعطيل، يظهر الفوتر مباشرة دون شريط النداء الترويجي</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">
                  {footerForm.preFooterEnabled !== false ? "مفعل 🟢" : "معطل ⚪"}
                </span>
                <button
                  type="button"
                  onClick={() => setFooterForm((prev: any) => ({ ...prev, preFooterEnabled: !(prev.preFooterEnabled !== false) }))}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    footerForm.preFooterEnabled !== false ? "bg-amber-400" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                      footerForm.preFooterEnabled !== false ? "translate-x-0" : "-translate-x-5"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">عنوان الشريط الترويجي الرئيسي</label>
                <input
                  type="text"
                  value={footerForm.preFooterTitle || ""}
                  onChange={(e) => setFooterForm((prev: any) => ({ ...prev, preFooterTitle: e.target.value }))}
                  placeholder="ابدأ مسيرة التفوق والريادة مع مدارس العقيق ✦"
                  className="w-full rounded-xl border p-2.5 text-xs font-bold outline-none bg-white/5"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">النص التعريفي والتسويقي للشريط</label>
                <textarea
                  rows={2}
                  value={footerForm.preFooterDesc || ""}
                  onChange={(e) => setFooterForm((prev: any) => ({ ...prev, preFooterDesc: e.target.value }))}
                  placeholder="بيئة تعليمية رائدة تجمع بين أصالة القيم وأحدث معايير التعليم الدولي..."
                  className="w-full rounded-xl border p-2.5 text-xs font-medium outline-none bg-white/5 resize-none"
                />
              </div>
            </div>

            {/* 3 Call to Action Buttons */}
            <div className="pt-2 border-t border-current/10 space-y-3">
              <span className="text-xs font-black block text-amber-400">أزرار الإجراء السريع الثلاثة بالبطاقة (CTAs) 🚀</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* CTA 1 */}
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-current/10 space-y-2">
                  <span className="text-[11px] font-black block">الزر الأول (الأساسي)</span>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">نص الزر</label>
                    <input
                      type="text"
                      value={footerForm.preFooterCta1Text || ""}
                      onChange={(e) => setFooterForm((prev: any) => ({ ...prev, preFooterCta1Text: e.target.value }))}
                      placeholder="حجز مقعد دراسي"
                      className="w-full rounded-xl border p-2 text-xs font-bold outline-none bg-white/5"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">رابط الزر (URL)</label>
                    <input
                      type="text"
                      value={footerForm.preFooterCta1Url || ""}
                      onChange={(e) => setFooterForm((prev: any) => ({ ...prev, preFooterCta1Url: e.target.value }))}
                      placeholder="/admissions"
                      className="w-full rounded-xl border p-2 text-xs font-mono outline-none bg-white/5"
                    />
                  </div>
                </div>

                {/* CTA 2 */}
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-current/10 space-y-2">
                  <span className="text-[11px] font-black block">الزر الثاني (المستشار / واتساب)</span>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">نص الزر</label>
                    <input
                      type="text"
                      value={footerForm.preFooterCta2Text || ""}
                      onChange={(e) => setFooterForm((prev: any) => ({ ...prev, preFooterCta2Text: e.target.value }))}
                      placeholder="مستشار القبول"
                      className="w-full rounded-xl border p-2 text-xs font-bold outline-none bg-white/5"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">رابط الزر (URL)</label>
                    <input
                      type="text"
                      value={footerForm.preFooterCta2Url || ""}
                      onChange={(e) => setFooterForm((prev: any) => ({ ...prev, preFooterCta2Url: e.target.value }))}
                      placeholder="https://wa.me/966531896000"
                      className="w-full rounded-xl border p-2 text-xs font-mono outline-none bg-white/5"
                    />
                  </div>
                </div>

                {/* CTA 3 */}
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-current/10 space-y-2">
                  <span className="text-[11px] font-black block">الزر الثالث (الرسوم والمعلومات)</span>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">نص الزر</label>
                    <input
                      type="text"
                      value={footerForm.preFooterCta3Text || ""}
                      onChange={(e) => setFooterForm((prev: any) => ({ ...prev, preFooterCta3Text: e.target.value }))}
                      placeholder="جدول الرسوم المعتمد"
                      className="w-full rounded-xl border p-2 text-xs font-bold outline-none bg-white/5"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">رابط الزر (URL)</label>
                    <input
                      type="text"
                      value={footerForm.preFooterCta3Url || ""}
                      onChange={(e) => setFooterForm((prev: any) => ({ ...prev, preFooterCta3Url: e.target.value }))}
                      placeholder="/admissions#fees-table-section"
                      className="w-full rounded-xl border p-2 text-xs font-mono outline-none bg-white/5"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Badges & Quick Links */}
          <div className={`p-6 rounded-3xl border space-y-5 ${dark ? "border-white/10 bg-[#0d1218]" : "border-black/10 bg-white shadow-xs"}`}>
            <div>
              <h3 className="text-base font-black">شارات الاعتماد والروابط السريعة بالفوتر 🏆🔗</h3>
              <p className="text-xs text-slate-400 font-bold mt-0.5">
                تخصيص شارات الاعتمادين الرسميين والروابط الثلاثة في الفوتر السفلي
              </p>
            </div>

            {/* Accreditations Badges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Badge 1 */}
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-current/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black flex items-center gap-1.5">
                    <Award size={14} className="text-amber-400" />
                    <span>شارة الاعتماد الأولى (Cognia)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setFooterForm((prev: any) => ({ ...prev, badge1Enabled: !(prev.badge1Enabled !== false) }))}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      footerForm.badge1Enabled !== false ? "bg-amber-400" : "bg-slate-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
                        footerForm.badge1Enabled !== false ? "translate-x-0" : "-translate-x-4"
                      }`}
                    />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={footerForm.badge1Text || ""}
                    onChange={(e) => setFooterForm((prev: any) => ({ ...prev, badge1Text: e.target.value }))}
                    placeholder="اعتماد Cognia"
                    className="rounded-xl border p-2 text-xs font-bold outline-none bg-white/5"
                  />
                  <input
                    type="text"
                    value={footerForm.badge1Url || ""}
                    onChange={(e) => setFooterForm((prev: any) => ({ ...prev, badge1Url: e.target.value }))}
                    placeholder="/accreditations"
                    className="rounded-xl border p-2 text-xs font-mono outline-none bg-white/5"
                  />
                </div>
              </div>

              {/* Badge 2 */}
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-current/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black flex items-center gap-1.5">
                    <Award size={14} className="text-amber-400" />
                    <span>شارة الاعتماد الثانية (SAT & IELTS)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setFooterForm((prev: any) => ({ ...prev, badge2Enabled: !(prev.badge2Enabled !== false) }))}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      footerForm.badge2Enabled !== false ? "bg-amber-400" : "bg-slate-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
                        footerForm.badge2Enabled !== false ? "translate-x-0" : "-translate-x-4"
                      }`}
                    />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={footerForm.badge2Text || ""}
                    onChange={(e) => setFooterForm((prev: any) => ({ ...prev, badge2Text: e.target.value }))}
                    placeholder="مركز اختبارات SAT & IELTS"
                    className="rounded-xl border p-2 text-xs font-bold outline-none bg-white/5"
                  />
                  <input
                    type="text"
                    value={footerForm.badge2Url || ""}
                    onChange={(e) => setFooterForm((prev: any) => ({ ...prev, badge2Url: e.target.value }))}
                    placeholder="/accreditations"
                    className="rounded-xl border p-2 text-xs font-mono outline-none bg-white/5"
                  />
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="pt-2 border-t border-current/10 space-y-3">
              <span className="text-xs font-black block text-amber-400">الروابط السريعة بالفوتر (Quick Links) 🔗</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Link 1 */}
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-current/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black">رابط سريع 1</span>
                    <button
                      type="button"
                      onClick={() => setFooterForm((prev: any) => ({ ...prev, quickLink1Enabled: !(prev.quickLink1Enabled !== false) }))}
                      className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                        footerForm.quickLink1Enabled !== false ? "bg-amber-400" : "bg-slate-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow transition duration-200 ${
                          footerForm.quickLink1Enabled !== false ? "translate-x-0" : "-translate-x-3"
                        }`}
                      />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={footerForm.quickLink1Text || ""}
                    onChange={(e) => setFooterForm((prev: any) => ({ ...prev, quickLink1Text: e.target.value }))}
                    placeholder="القبول والتسجيل ✦"
                    className="w-full rounded-xl border p-2 text-xs font-bold outline-none bg-white/5"
                  />
                  <input
                    type="text"
                    value={footerForm.quickLink1Url || ""}
                    onChange={(e) => setFooterForm((prev: any) => ({ ...prev, quickLink1Url: e.target.value }))}
                    placeholder="/admissions"
                    className="w-full rounded-xl border p-2 text-xs font-mono outline-none bg-white/5"
                  />
                </div>

                {/* Link 2 */}
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-current/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black">رابط سريع 2</span>
                    <button
                      type="button"
                      onClick={() => setFooterForm((prev: any) => ({ ...prev, quickLink2Enabled: !(prev.quickLink2Enabled !== false) }))}
                      className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                        footerForm.quickLink2Enabled !== false ? "bg-amber-400" : "bg-slate-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow transition duration-200 ${
                          footerForm.quickLink2Enabled !== false ? "translate-x-0" : "-translate-x-3"
                        }`}
                      />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={footerForm.quickLink2Text || ""}
                    onChange={(e) => setFooterForm((prev: any) => ({ ...prev, quickLink2Text: e.target.value }))}
                    placeholder="الاعتمادات"
                    className="w-full rounded-xl border p-2 text-xs font-bold outline-none bg-white/5"
                  />
                  <input
                    type="text"
                    value={footerForm.quickLink2Url || ""}
                    onChange={(e) => setFooterForm((prev: any) => ({ ...prev, quickLink2Url: e.target.value }))}
                    placeholder="/accreditations"
                    className="w-full rounded-xl border p-2 text-xs font-mono outline-none bg-white/5"
                  />
                </div>

                {/* Link 3 */}
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-current/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black">رابط سريع 3</span>
                    <button
                      type="button"
                      onClick={() => setFooterForm((prev: any) => ({ ...prev, quickLink3Enabled: !(prev.quickLink3Enabled !== false) }))}
                      className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                        footerForm.quickLink3Enabled !== false ? "bg-amber-400" : "bg-slate-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow transition duration-200 ${
                          footerForm.quickLink3Enabled !== false ? "translate-x-0" : "-translate-x-3"
                        }`}
                      />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={footerForm.quickLink3Text || ""}
                    onChange={(e) => setFooterForm((prev: any) => ({ ...prev, quickLink3Text: e.target.value }))}
                    placeholder="المجمعات 🏫"
                    className="w-full rounded-xl border p-2 text-xs font-bold outline-none bg-white/5"
                  />
                  <input
                    type="text"
                    value={footerForm.quickLink3Url || ""}
                    onChange={(e) => setFooterForm((prev: any) => ({ ...prev, quickLink3Url: e.target.value }))}
                    placeholder="/about"
                    className="w-full rounded-xl border p-2 text-xs font-mono outline-none bg-white/5"
                  />
                </div>
              </div>
            </div>

            {/* Copyright Line */}
            <div className="pt-2 border-t border-current/10">
              <label className="text-xs font-bold text-slate-300 block mb-1.5">سطر حقوق الملكية الفكرية المعتمد أسفل الموقع</label>
              <input
                type="text"
                value={footerForm.copyrightText || ""}
                onChange={(e) => setFooterForm((prev: any) => ({ ...prev, copyrightText: e.target.value }))}
                placeholder="جميع الحقوق محفوظة لمدارس العقيق الأهلية والدولية © 2026"
                className="w-full rounded-xl border p-2.5 text-xs font-bold outline-none bg-white/5"
              />
            </div>

            {/* Save Button */}
            <div className="pt-3 border-t border-current/10 flex justify-end">
              <Button
                type="button"
                onClick={async () => {
                  await onSaveOrchestration({ footer: footerForm });
                  toast.success("تم حفظ وتحديث إعدادات بطاقة الفوتر بنجاح 💾");
                }}
                disabled={isSaving}
                className="rounded-xl font-black text-xs px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black gap-2 cursor-pointer shadow-lg"
              >
                <Save size={14} />
                <span>{isSaving ? "جاري الحفظ..." : "حفظ إعدادات وبطاقة الفوتر بالكامل 💾"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB: EVENT POPUP MODAL MANAGER (النافذة الإعلانية المنبثقة) */}
      {subTab === "popup" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className={`p-6 rounded-3xl border space-y-6 ${dark ? "border-white/10 bg-[#0d1218]" : "border-black/10 bg-white shadow-xs"}`}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-current/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  <Megaphone size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black">النافذة الإعلانية المنبثقة للزوار (Event Pop-up Modal) 📣</h3>
                  <p className="text-xs text-slate-400 font-bold mt-0.5">
                    نافذة إعلانية فاخرة تظهر للزوار عند الدخول للإعلان عن فتح التسجيل، الفعاليات الكبرى، أو قرارات الإدارة
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={async () => {
                    await onSaveOrchestration({ eventModal: eventModalForm });
                    toast.success("تم حفظ إعدادات النافذة الإعلانية المنبثقة بنجاح 💾");
                  }}
                  disabled={isSaving}
                  className="rounded-xl font-black text-xs px-5 bg-amber-500 hover:bg-amber-400 text-black gap-1.5 cursor-pointer shadow-md"
                >
                  <Save size={13} />
                  <span>{isSaving ? "جاري الحفظ..." : "حفظ النافذة الإعلانية 💾"}</span>
                </Button>
              </div>
            </div>

            {/* Master Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-current/10">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{eventModalForm.enabled ? "🟢" : "⚪"}</span>
                <div>
                  <span className="text-sm font-black block">
                    {eventModalForm.enabled ? "النافذة الإعلانية نشطة وتظهر لزوار الموقع الآن 🚀" : "النافذة الإعلانية متوقفة حالياً (لا تظهر للزوار)"}
                  </span>
                  <span className="text-[11px] text-slate-400 font-bold">
                    يمكنك تشغيلها في مواسم التسجيل أو الفعاليات وإيقافها في أي وقت بنقرة واحدة
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEventModalForm((prev: any) => ({ ...prev, enabled: !prev.enabled }))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  eventModalForm.enabled ? "bg-amber-400" : "bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                    eventModalForm.enabled ? "translate-x-0" : "-translate-x-5"
                  }`}
                />
              </button>
            </div>

            {/* Grid of Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">شارة الإعلان العلوية (Badge)</label>
                <input
                  type="text"
                  value={eventModalForm.badge || ""}
                  onChange={(e) => setEventModalForm((prev: any) => ({ ...prev, badge: e.target.value }))}
                  placeholder="إعلان هام ✦ 2026/2027"
                  className="w-full rounded-xl border p-2.5 text-xs font-bold outline-none bg-white/5"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">عنوان الإعلان الرئيسي</label>
                <input
                  type="text"
                  value={eventModalForm.title || ""}
                  onChange={(e) => setEventModalForm((prev: any) => ({ ...prev, title: e.target.value }))}
                  placeholder="فتح باب القبول والتسجيل للعام الدراسي الجديد"
                  className="w-full rounded-xl border p-2.5 text-xs font-bold outline-none bg-white/5"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-300 block mb-1.5">نص وتفاصيل الإعلان (Subtitle)</label>
                <textarea
                  rows={2}
                  value={eventModalForm.subtitle || ""}
                  onChange={(e) => setEventModalForm((prev: any) => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="يسر مدارس العقيق الأهلية والدولية الإعلان عن بدء استقبال طلبات الالتحاق..."
                  className="w-full rounded-xl border p-2.5 text-xs font-medium outline-none bg-white/5 resize-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-300 block mb-1.5">رابط بوستر / صورة الإعلان (Image URL)</label>
                <input
                  type="text"
                  value={eventModalForm.imageUrl || ""}
                  onChange={(e) => setEventModalForm((prev: any) => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://images.unsplash.com/... أو رابط مباشر للصورة"
                  className="w-full rounded-xl border p-2.5 text-xs font-mono outline-none bg-white/5"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">نص زر الإجراء (CTA Button)</label>
                <input
                  type="text"
                  value={eventModalForm.ctaText || ""}
                  onChange={(e) => setEventModalForm((prev: any) => ({ ...prev, ctaText: e.target.value }))}
                  placeholder="حجز مقعد دراسي الآن 🚀"
                  className="w-full rounded-xl border p-2.5 text-xs font-bold outline-none bg-white/5"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">رابط زر الإجراء (URL)</label>
                <input
                  type="text"
                  value={eventModalForm.ctaUrl || ""}
                  onChange={(e) => setEventModalForm((prev: any) => ({ ...prev, ctaUrl: e.target.value }))}
                  placeholder="/admissions أو رابط خارجي"
                  className="w-full rounded-xl border p-2.5 text-xs font-mono outline-none bg-white/5"
                />
              </div>
            </div>

            {/* Live Interactive Preview Box */}
            <div className="pt-4 border-t border-current/10 space-y-3">
              <span className="text-xs font-black block text-amber-400 flex items-center gap-1.5">
                <Sparkles size={14} />
                <span>المعاينة الحية الفورية للنافذة الإعلانية (Live Visual Preview)</span>
              </span>

              <div className="p-4 sm:p-6 rounded-3xl bg-black/60 border border-white/10 flex items-center justify-center">
                <div className="w-full max-w-sm rounded-[2rem] border border-amber-400/40 bg-[#0a0f16] text-white shadow-2xl overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-amber-500 via-[#f8ca14] to-yellow-300" />
                  {eventModalForm.imageUrl && (
                    <div className="aspect-[16/9] w-full overflow-hidden bg-black/40">
                      <img loading="lazy" src={eventModalForm.imageUrl} alt="معاينة البوستر" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="p-4 space-y-2 text-right">
                    {eventModalForm.badge && (
                      <span className="inline-block text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-400 border border-amber-400/30">
                        {eventModalForm.badge}
                      </span>
                    )}
                    <h4 className="text-sm font-black text-white">{eventModalForm.title || "عنوان الإعلان"}</h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{eventModalForm.subtitle || "نص الإعلان التوضيحي..."}</p>
                    <div className="pt-2">
                      <div className="w-full py-2 rounded-xl bg-amber-400 text-black text-xs font-black text-center shadow">
                        {eventModalForm.ctaText || "زر الإجراء"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-3 border-t border-current/10 flex justify-end">
              <Button
                type="button"
                onClick={async () => {
                  await onSaveOrchestration({ eventModal: eventModalForm });
                  toast.success("تم حفظ وتفعيل النافذة الإعلانية المنبثقة بنجاح 💾");
                }}
                disabled={isSaving}
                className="rounded-xl font-black text-xs px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black gap-2 cursor-pointer shadow-lg"
              >
                <Save size={14} />
                <span>{isSaving ? "جاري الحفظ..." : "حفظ وتفعيل النافذة الإعلانية 💾"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB: VACATION & MAINTENANCE MODE MANAGER (وضع العطلات والصيانة) */}
      {subTab === "vacation" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className={`p-6 rounded-3xl border space-y-6 ${dark ? "border-white/10 bg-[#0d1218]" : "border-black/10 bg-white shadow-xs"}`}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-current/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  <Palmtree size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black">وضع العطلات الرسمية والصيانة المجدولة 🌴🛠️</h3>
                  <p className="text-xs text-slate-400 font-bold mt-0.5">
                    شريط تنبيه عاجل وبارز يظهر بأعلى صفحات الموقع لإشعار أولياء الأمور والزوار بالعطلات أو أعمال التحديث
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={async () => {
                    await onSaveOrchestration({ vacationMode: vacationForm });
                    toast.success("تم حفظ وضع العطلات والصيانة بنجاح 💾");
                  }}
                  disabled={isSaving}
                  className="rounded-xl font-black text-xs px-5 bg-amber-500 hover:bg-amber-400 text-black gap-1.5 cursor-pointer shadow-md"
                >
                  <Save size={13} />
                  <span>{isSaving ? "جاري الحفظ..." : "حفظ وضع العطلات 💾"}</span>
                </Button>
              </div>
            </div>

            {/* Master Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-current/10">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{vacationForm.enabled ? "🌴" : "⚪"}</span>
                <div>
                  <span className="text-sm font-black block">
                    {vacationForm.enabled ? "شريط التنبيه نشط وظاهر في أعلى الموقع الآن 🟢" : "وضع العطلات معطل حالياً (الوضع الطبيعي للمدارس)"}
                  </span>
                  <span className="text-[11px] text-slate-400 font-bold">
                    عند التفعيل، يظهر شريط عريض في أعلى كل الصفحات بالرسالة المحددة وزر الإجراء السريع
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setVacationForm((prev: any) => ({ ...prev, enabled: !prev.enabled }))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  vacationForm.enabled ? "bg-amber-400" : "bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                    vacationForm.enabled ? "translate-x-0" : "-translate-x-5"
                  }`}
                />
              </button>
            </div>

            {/* Mode Type Selection */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">نوع ونمط التنبيه (Alert Type)</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: "vacation", name: "إجازة مدرسية وعطلة رسمية 🌴", desc: "أجواء مريحة، تهاني، واستمرار التسجيل الإلكتروني" },
                  { id: "maintenance", name: "صيانة وتحديث مجدول 🛠️", desc: "إشعار بأعمال التطوير مع توجيه لقنوات التواصل" },
                  { id: "alert", name: "إشعار وتنبيه هام 📢", desc: "تنبيه رسمي لأولياء الأمور والطلاب" },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setVacationForm((prev: any) => ({ ...prev, type: type.id }))}
                    className={`p-3 rounded-2xl border text-right transition cursor-pointer ${
                      vacationForm.type === type.id
                        ? "bg-amber-400/15 border-amber-400/40 text-amber-400"
                        : "bg-white/[0.02] border-current/10 text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    <span className="text-xs font-black block">{type.name}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{type.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">عنوان التنبيه أو الإجازة</label>
                <input
                  type="text"
                  value={vacationForm.title || ""}
                  onChange={(e) => setVacationForm((prev: any) => ({ ...prev, title: e.target.value }))}
                  placeholder="إجازة نهاية الفصل الدراسي الثاني"
                  className="w-full rounded-xl border p-2.5 text-xs font-bold outline-none bg-white/5"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">نص زر التوجيه السريع</label>
                <input
                  type="text"
                  value={vacationForm.linkText || ""}
                  onChange={(e) => setVacationForm((prev: any) => ({ ...prev, linkText: e.target.value }))}
                  placeholder="التقديم الإلكتروني 24/7"
                  className="w-full rounded-xl border p-2.5 text-xs font-bold outline-none bg-white/5"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-300 block mb-1.5">الرسالة الموجهة للزوار وأولياء الأمور</label>
                <textarea
                  rows={2}
                  value={vacationForm.message || ""}
                  onChange={(e) => setVacationForm((prev: any) => ({ ...prev, message: e.target.value }))}
                  placeholder="نتمنى لطلابنا وأولياء أمورنا إجازة سعيدة ومباركة. يُستأنف استقبال طلبات التسجيل الإلكتروني على مدار الساعة..."
                  className="w-full rounded-xl border p-2.5 text-xs font-medium outline-none bg-white/5 resize-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-300 block mb-1.5">رابط زر التوجيه السريع (URL)</label>
                <input
                  type="text"
                  value={vacationForm.linkUrl || ""}
                  onChange={(e) => setVacationForm((prev: any) => ({ ...prev, linkUrl: e.target.value }))}
                  placeholder="/admissions"
                  className="w-full rounded-xl border p-2.5 text-xs font-mono outline-none bg-white/5"
                />
              </div>
            </div>

            {/* Live Interactive Preview */}
            <div className="pt-4 border-t border-current/10 space-y-3">
              <span className="text-xs font-black block text-amber-400 flex items-center gap-1.5">
                <Sparkles size={14} />
                <span>المعاينة الحية لشريط العطلة بأعلى الموقع (Live Banner Preview)</span>
              </span>

              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
                vacationForm.type === "maintenance"
                  ? "bg-rose-950/40 border-rose-500/30 text-rose-200"
                  : vacationForm.type === "alert"
                  ? "bg-amber-950/40 border-amber-500/30 text-amber-200"
                  : "bg-emerald-950/40 border-emerald-500/30 text-emerald-200"
              }`}>
                <div className="flex items-center gap-2.5 text-right">
                  <span className="text-lg">
                    {vacationForm.type === "maintenance" ? "🛠️" : vacationForm.type === "alert" ? "📢" : "🌴"}
                  </span>
                  <div>
                    <span className="font-black block">{vacationForm.title || "عنوان التنبيه"}</span>
                    <span className="text-[11px] opacity-80">{vacationForm.message || "نص الرسالة الموجهة للجمهور..."}</span>
                  </div>
                </div>

                {vacationForm.linkText && (
                  <div className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 font-black text-[11px] shrink-0 text-center">
                    {vacationForm.linkText} ←
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-3 border-t border-current/10 flex justify-end">
              <Button
                type="button"
                onClick={async () => {
                  await onSaveOrchestration({ vacationMode: vacationForm });
                  toast.success("تم حفظ وتفعيل وضع العطلات والصيانة بنجاح 💾");
                }}
                disabled={isSaving}
                className="rounded-xl font-black text-xs px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black gap-2 cursor-pointer shadow-lg"
              >
                <Save size={14} />
                <span>{isSaving ? "جاري الحفظ..." : "حفظ وتفعيل وضع العطلات والصيانة 💾"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: INTERACTIVE SYSTEM PORTALS MANAGER (بوابات الأنظمة والخدمات) */}
      {subTab === "portals" && (
        <div className={`p-6 rounded-3xl border space-y-6 animate-in fade-in duration-200 ${
          dark ? "border-white/10 bg-[#0d1218]" : "border-black/10 bg-white shadow-xs"
        }`}>
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-current/10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Server size={20} />
              </div>
              <div>
                <h3 className="text-base font-black">مدير بوابات الأنظمة والخدمات المدرسية ({portalsList.length} بوابة)</h3>
                <p className="text-xs text-slate-400 font-bold mt-0.5">
                  إضافة وتعديل وترتيب بوابات الدخول السريع في القائمة المنسدلة وشريط الخدمات بالموقع
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                onClick={handleResetPortalsToDefault}
                variant="outline"
                className="text-xs font-bold gap-1.5 rounded-xl border-dashed cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>استعادة الافتراضيات</span>
              </Button>

              <Button
                type="button"
                onClick={() => setIsAddingPortal(!isAddingPortal)}
                className="bg-amber-400 hover:bg-amber-500 text-black font-black text-xs gap-1.5 rounded-xl cursor-pointer"
              >
                <Plus size={14} />
                <span>إضافة بوابة جديدة ➕</span>
              </Button>

              <Button
                type="button"
                onClick={async () => {
                  await onSaveOrchestration({ systemPortals: portalsList });
                  toast.success("تم حفظ بوابات المدارس بنجاح ✅");
                }}
                disabled={isSaving}
                className="rounded-xl font-black text-xs px-5 bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 cursor-pointer"
              >
                <Save size={13} />
                <span>{isSaving ? "جارِ الحفظ..." : "حفظ التغييرات 💾"}</span>
              </Button>
            </div>
          </div>

          {/* Add Portal Inline Box */}
          {isAddingPortal && (
            <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-4 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-amber-400">إضافة بوابة نظام أو خدمة جديدة</h4>
                <button
                  type="button"
                  onClick={() => setIsAddingPortal(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  إلغاء ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">اسم البوابة</label>
                  <input
                    type="text"
                    value={newPortalTitle}
                    onChange={(e) => setNewPortalTitle(e.target.value)}
                    placeholder="مثال: نظام كلاسيرا الذكي"
                    className="w-full rounded-xl border p-2.5 text-xs font-bold outline-none bg-white/5"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">وصف مختصر للبوابة</label>
                  <input
                    type="text"
                    value={newPortalDesc}
                    onChange={(e) => setNewPortalDesc(e.target.value)}
                    placeholder="مثال: إدارة التعلم التفاعلي والواجبات"
                    className="w-full rounded-xl border p-2.5 text-xs font-bold outline-none bg-white/5"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">رابط الدخول (URL)</label>
                  <input
                    type="text"
                    value={newPortalUrl}
                    onChange={(e) => setNewPortalUrl(e.target.value)}
                    placeholder="https://me.classera.com"
                    className="w-full rounded-xl border p-2.5 text-xs font-mono outline-none bg-white/5"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">تصنيف البوابة</label>
                  <select
                    value={newPortalCategory}
                    onChange={(e) => setNewPortalCategory(e.target.value as any)}
                    className="w-full rounded-xl border p-2.5 text-xs font-bold outline-none bg-white/5"
                  >
                    <option value="parents_students">خدمات أولياء الأمور والطلاب</option>
                    <option value="staff_admin">الأنظمة الإدارية والموظفين</option>
                    <option value="public">خدمات ومنصات عامة</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">شارة البوابة (Badge اختياري)</label>
                  <input
                    type="text"
                    value={newPortalBadge}
                    onChange={(e) => setNewPortalBadge(e.target.value)}
                    placeholder="مثال: جديد أو LMS"
                    className="w-full rounded-xl border p-2.5 text-xs font-bold outline-none bg-white/5"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">أيقونة البوابة</label>
                  <select
                    value={newPortalIcon}
                    onChange={(e) => setNewPortalIcon(e.target.value)}
                    className="w-full rounded-xl border p-2.5 text-xs font-bold outline-none bg-white/5"
                  >
                    {AVAILABLE_PORTAL_ICONS.slice(0, 25).map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label} ({opt.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  onClick={handleAddPortal}
                  className="bg-amber-400 hover:bg-amber-500 text-black font-black text-xs px-6 rounded-xl cursor-pointer"
                >
                  إضافة البوابة للقائمة ➕
                </Button>
              </div>
            </div>
          )}

          {/* Portals List Cards */}
          <div className="space-y-3">
            {portalsList.map((portal, idx) => (
              <div
                key={portal.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  portal.visible
                    ? dark ? "bg-white/[0.02] border-white/10 hover:border-white/20" : "bg-slate-50/70 border-black/10 hover:border-black/20"
                    : "opacity-40 bg-black/20 border-dashed border-current/10"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 shrink-0">
                    {renderPortalIcon(portal.iconName, 18)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black">{portal.title}</h4>
                      {portal.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-400/15 text-amber-400 border border-amber-400/20">
                          {portal.badge}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
                        {PORTAL_CATEGORY_LABELS[portal.category] || portal.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-bold mt-0.5">{portal.description}</p>
                    <a
                      href={portal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue-400 hover:underline inline-flex items-center gap-1 mt-1 font-mono"
                    >
                      <span>{portal.url}</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Move Up/Down */}
                  <button
                    type="button"
                    onClick={() => handleMovePortal(portal.id, "up")}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg border text-slate-300 hover:text-white disabled:opacity-20 cursor-pointer"
                    title="تحريك لأعلى"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMovePortal(portal.id, "down")}
                    disabled={idx === portalsList.length - 1}
                    className="p-1.5 rounded-lg border text-slate-300 hover:text-white disabled:opacity-20 cursor-pointer"
                    title="تحريك لأسفل"
                  >
                    <ArrowDown size={14} />
                  </button>

                  {/* Toggle Visibility */}
                  <button
                    type="button"
                    onClick={() => handleTogglePortalVisibility(portal.id)}
                    className={`p-1.5 rounded-lg border transition cursor-pointer ${
                      portal.visible ? "text-emerald-400 hover:bg-emerald-400/10" : "text-slate-500 hover:bg-white/5"
                    }`}
                    title={portal.visible ? "إخفاء من الموقع" : "إظهار في الموقع"}
                  >
                    {portal.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDeletePortal(portal.id)}
                    className="p-1.5 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                    title="حذف البوابة"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: EMERGENCY TOP BANNER */}
      {subTab === "emergency" && (
        <div className={`p-6 rounded-3xl border space-y-6 ${dark ? "border-white/10 bg-[#0d1218]" : "border-black/10 bg-white shadow-xs"}`}>
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-current/10">
            <div>
              <h3 className="text-base font-black">شريط التنبيهات والقرارات العاجلة بأعلى الموقع</h3>
              <p className="text-xs text-slate-400 font-bold mt-0.5">
                تفعيل شريط أحمر أو أزرق أو ذهبي في قمة صفحات الموقع لبث خبر عاجل أو تعليق دراسة أو تهنئة
              </p>
            </div>
            <Button
              type="button"
              onClick={async () => {
                await onSaveOrchestration({ emergencyBanner: bannerForm });
                toast.success("تم حفظ إعدادات البانر العاجل بنجاح");
              }}
              disabled={isSaving}
              className="rounded-xl font-black text-xs px-5 bg-amber-500 hover:bg-amber-400 text-black gap-1.5 cursor-pointer"
            >
              <Save size={13} />
              <span>{isSaving ? "جاري الحفظ..." : "حفظ التعديلات 💾"}</span>
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-current/10">
            <div>
              <h4 className="text-sm font-black">تفعيل الشريط العاجل الآن</h4>
              <p className="text-xs text-slate-400 font-bold mt-0.5">
                {bannerForm.enabled ? "الشريط ظاهر ومفعل في أعلى كافة الصفحات" : "الشريط مخفي حالياً"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setBannerForm({ ...bannerForm, enabled: !bannerForm.enabled })}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                bannerForm.enabled ? "bg-rose-500" : "bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow transition ease-in-out duration-200 ${
                  bannerForm.enabled ? "translate-x-0" : "-translate-x-5"
                }`}
              />
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-300 block">نوع التنبيه</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setBannerForm({ ...bannerForm, type: "urgent" })}
                  className={`flex-1 py-2 rounded-xl text-xs font-black border transition ${
                    bannerForm.type === "urgent"
                      ? "bg-rose-500 text-white border-rose-500"
                      : "border-current/10 text-slate-400"
                  }`}
                >
                  🔴 طوارئ وعاجل
                </button>
                <button
                  type="button"
                  onClick={() => setBannerForm({ ...bannerForm, type: "notice" })}
                  className={`flex-1 py-2 rounded-xl text-xs font-black border transition ${
                    bannerForm.type === "notice"
                      ? "bg-blue-500 text-white border-blue-500"
                      : "border-current/10 text-slate-400"
                  }`}
                >
                  🔵 إشعار وتنبيه
                </button>
                <button
                  type="button"
                  onClick={() => setBannerForm({ ...bannerForm, type: "celebration" })}
                  className={`flex-1 py-2 rounded-xl text-xs font-black border transition ${
                    bannerForm.type === "celebration"
                      ? "bg-amber-500 text-black border-amber-500"
                      : "border-current/10 text-slate-400"
                  }`}
                >
                  🟡 احتفال ومناسبة
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-300 block">نص التنبيه</label>
              <input
                type="text"
                value={bannerForm.text || ""}
                onChange={(e) => setBannerForm({ ...bannerForm, text: e.target.value })}
                placeholder="مثال: تعليق الدراسة الحضورية وتحويل التعليم عن بعد..."
                className="w-full rounded-xl border p-3 text-xs font-bold outline-none bg-white/5"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-300 block">رابط التوجيه (اختياري)</label>
                <input
                  type="text"
                  value={bannerForm.linkUrl || ""}
                  onChange={(e) => setBannerForm({ ...bannerForm, linkUrl: e.target.value })}
                  placeholder="https://schools.madrasati.sa"
                  className="w-full rounded-xl border p-3 text-xs font-bold outline-none bg-white/5"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-300 block">نص زر الرابط</label>
                <input
                  type="text"
                  value={bannerForm.linkText || ""}
                  onChange={(e) => setBannerForm({ ...bannerForm, linkText: e.target.value })}
                  placeholder="الدخول لمنصة مدرستي ↗"
                  className="w-full rounded-xl border p-3 text-xs font-bold outline-none bg-white/5"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: MARKETING PIXELS & SEO */}
      {subTab === "marketing" && (
        <div className={`p-6 rounded-3xl border space-y-6 ${dark ? "border-white/10 bg-[#0d1218]" : "border-black/10 bg-white shadow-xs"}`}>
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-current/10">
            <div>
              <h3 className="text-base font-black">أكواد التتبع والتسويق وبطاقات المشاركة SEO</h3>
              <p className="text-xs text-slate-400 font-bold mt-0.5">
                ربط بكسلات الإعلانات (Snapchat, Meta, TikTok) وإحصائيات Google، وتخصيص بطاقات المشاركة
              </p>
            </div>
            <Button
              type="button"
              onClick={async () => {
                await onSaveOrchestration({ marketingPixels: pixelsForm });
                toast.success("تم حفظ إعدادات التسويق وبكسلات التتبع بنجاح");
              }}
              disabled={isSaving}
              className="rounded-xl font-black text-xs px-5 bg-amber-500 hover:bg-amber-400 text-black gap-1.5 cursor-pointer"
            >
              <Save size={13} />
              <span>{isSaving ? "جاري الحفظ..." : "حفظ الإعدادات 💾"}</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-300 block">Snapchat Pixel ID</label>
              <input
                type="text"
                value={pixelsForm.snapchatPixelId || ""}
                onChange={(e) => setPixelsForm({ ...pixelsForm, snapchatPixelId: e.target.value })}
                placeholder="xxxx-xxxx-xxxx"
                className="w-full rounded-xl border p-3 text-xs font-mono outline-none bg-white/5"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-300 block">Meta (Facebook/Instagram) Pixel ID</label>
              <input
                type="text"
                value={pixelsForm.metaPixelId || ""}
                onChange={(e) => setPixelsForm({ ...pixelsForm, metaPixelId: e.target.value })}
                placeholder="1234567890..."
                className="w-full rounded-xl border p-3 text-xs font-mono outline-none bg-white/5"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-300 block">TikTok Pixel ID</label>
              <input
                type="text"
                value={pixelsForm.tiktokPixelId || ""}
                onChange={(e) => setPixelsForm({ ...pixelsForm, tiktokPixelId: e.target.value })}
                placeholder="Cxxxxxxx..."
                className="w-full rounded-xl border p-3 text-xs font-mono outline-none bg-white/5"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-300 block">Google Analytics ID (GA4)</label>
              <input
                type="text"
                value={pixelsForm.googleAnalyticsId || ""}
                onChange={(e) => setPixelsForm({ ...pixelsForm, googleAnalyticsId: e.target.value })}
                placeholder="G-XXXXXXXXXX"
                className="w-full rounded-xl border p-3 text-xs font-mono outline-none bg-white/5"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 5: NATIONAL SEASONS SWITCHER & SAUDI NATIONAL DAY STUDIO */}
      {subTab === "seasons" && (
        <div className={`p-6 rounded-3xl border space-y-6 ${dark ? "border-white/10 bg-[#0d1218]" : "border-black/10 bg-white shadow-xs"}`}>
          {/* Header */}
          <div className="pb-4 border-b border-current/10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black flex items-center gap-2">
                <span>محول المناسبات الوطنية وثيم اليوم الوطني 🇸🇦</span>
              </h3>
              <p className="text-xs text-slate-400 font-bold mt-0.5">
                تغيير هوية وأجواء الموقع بالكامل لليوم الوطني 94 بنقرة واحدة (ألوان زمردية، زخارف الهوية الوطنية، وشريط التهنئة الاحتفالي)
              </p>
            </div>

            <a
              href="/?siteTheme=saudi-national-day"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-black transition flex items-center gap-2 border border-emerald-500/30 shadow-xs cursor-pointer"
            >
              <ExternalLink size={14} />
              <span>معاينة حية للموقع بثيم اليوم الوطني ↗</span>
            </a>
          </div>

          {/* Active Live Status Pill */}
          {themeModeForm.activeTheme === "saudi-national-day" ? (
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-emerald-900/60 to-teal-950/80 border border-emerald-500/40 text-white shadow-lg shadow-emerald-950/30">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-tr from-[#005A36] to-[#5aba1c] text-white font-black text-xl shadow-md">
                  🇸🇦
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-emerald-300">ثيم اليوم الوطني السعودي مفعّل ونشط على كامل الموقع 🇸🇦✨</h4>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200/80 font-bold mt-0.5">
                    القالب المعتمد: {TEMPLATE_VARIANT_INFO[themeModeForm.templateVariant]?.label || "القالب العام"} · الشعار: «{themeModeForm.customBadgeText}» · شفافية الزخارف: {themeModeForm.backgroundPatternOpacity}%
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-black border border-emerald-500/30">
                🟢 حي ومباشر الآن
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white/[0.03] border border-current/10 text-slate-300">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#08467d] text-[#f8ca14] font-black text-base shadow-sm">
                  💎
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">الهوية الرسمية الأصلية للعقيق (الكلاسيكية) نشطة حالياً 🏛️</h4>
                  <p className="text-xs text-slate-400 font-bold mt-0.5">اللون الكحلي والذهبي والزمردي الرسمي المستقر لكافة صفحات الموقع</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-500/10 text-slate-400 text-[11px] font-black border border-slate-500/20">
                الهوية القياسية
              </span>
            </div>
          )}

          {/* Season Chooser Cards */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400">اختر المناسبة أو الموسم المطلوب تفعيله:</label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SEASONS.map((season) => {
                const isSelected = selectedSeason === season.id;
                const isNational = season.id === "national_day";
                return (
                  <div
                    key={season.id}
                    onClick={() => {
                      setSelectedSeason(season.id);
                      if (isNational) {
                        setThemeModeForm((prev) => ({ ...prev, activeTheme: "saudi-national-day" }));
                      } else {
                        setThemeModeForm((prev) => ({ ...prev, activeTheme: "default" }));
                      }
                    }}
                    className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? isNational
                          ? "border-emerald-500 bg-emerald-500/15 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-600/20"
                          : "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/5"
                        : "border-current/10 bg-white/[0.02] hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-black">{season.name}</h4>
                      {isSelected ? (
                        <CheckCircle2 size={16} className={isNational ? "text-emerald-400" : "text-amber-400"} />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-current/20" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-bold">{season.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DEDICATED SAUDI NATIONAL DAY STUDIO (Revealed when national_day is selected) */}
          {(selectedSeason === "national_day" || themeModeForm.activeTheme === "saudi-national-day") && (
            <div className={`p-5 rounded-2xl border space-y-6 ${dark ? "border-emerald-500/30 bg-emerald-950/20" : "border-emerald-500/20 bg-emerald-50/60"}`}>
              <div className="pb-3 border-b border-emerald-500/20 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🇸🇦</span>
                  <h4 className="text-xs font-black text-emerald-400 tracking-wide">
                    إعدادات وتخصيص هوية اليوم الوطني السعودي 94
                  </h4>
                </div>
                <span className="text-[11px] text-emerald-400/80 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                  معايير الهوية الرسمية (نحلم ونحقق)
                </span>
              </div>

              {/* 1. Official Template Variants */}
              <div className="space-y-3">
                <label className="text-xs font-black flex items-center justify-between">
                  <span>🎨 القالب الفني المعتمد (5 قوالب رسمية):</span>
                  <span className="text-[11px] text-emerald-400 font-normal">
                    {TEMPLATE_VARIANT_INFO[themeModeForm.templateVariant]?.label}
                  </span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(Object.keys(TEMPLATE_VARIANT_INFO) as TemplateVariant[]).map((vKey) => {
                    const info = TEMPLATE_VARIANT_INFO[vKey];
                    const isPicked = themeModeForm.templateVariant === vKey;
                    return (
                      <div
                        key={vKey}
                        onClick={() => setThemeModeForm((prev) => ({ ...prev, templateVariant: vKey }))}
                        className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                          isPicked
                            ? "border-emerald-500 bg-emerald-500/20 ring-1 ring-emerald-500"
                            : "border-current/10 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="h-4 w-4 rounded-full shrink-0 shadow-xs"
                            style={{ backgroundColor: info.color }}
                          />
                          <div>
                            <p className="text-xs font-black">{info.label}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{info.enLabel}</p>
                          </div>
                        </div>
                        {isPicked && <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400">يتغير نمط الخلفية والزخارف الرسمية في الهيرو والسكاشن تلقائياً حسب القالب المختار.</p>
              </div>

              {/* Controls Row: Duration + Slogan Text */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Duration / Expiry */}
                <div className="space-y-2">
                  <label className="text-xs font-black flex items-center gap-1.5">
                    <span>⏱ مدة تفعيل الثيم:</span>
                  </label>
                  <select
                    value={themeModeForm.durationHours === null ? "permanent" : String(themeModeForm.durationHours)}
                    onChange={(e) => {
                      const val = e.target.value;
                      setThemeModeForm((prev) => ({
                        ...prev,
                        durationHours: val === "permanent" ? null : Number(val),
                      }));
                    }}
                    className={`w-full rounded-xl border p-2.5 text-xs font-black cursor-pointer ${
                      dark ? "border-white/10 bg-black/60 text-white" : "border-slate-200 bg-white text-slate-900"
                    }`}
                  >
                    <option value="permanent">♾️ دائم حتى أقوم بإيقافه يدوياً</option>
                    <option value="24">⏱ ٢٤ ساعة (يوم الاحتفال)</option>
                    <option value="48">⏱ ٤٨ ساعة (يومان)</option>
                    <option value="168">⏱ أسبوع كامل (7 أيام)</option>
                    <option value="720">⏱ شهر كامل (30 يوماً)</option>
                  </select>
                  <p className="text-[10px] text-slate-400">يعود الموقع تلقائياً للهوية الأصلية فور انتهاء المدة المحددة.</p>
                </div>

                {/* Slogan Text */}
                <div className="space-y-2">
                  <label className="text-xs font-black flex items-center gap-1.5">
                    <span>✍️ نص شارة وشعار المناسبة:</span>
                  </label>
                  <input
                    type="text"
                    value={themeModeForm.customBadgeText}
                    onChange={(e) => setThemeModeForm((prev) => ({ ...prev, customBadgeText: e.target.value }))}
                    placeholder="نحلم ونحقق 🇸🇦"
                    className={`w-full rounded-xl border p-2.5 text-xs font-black ${
                      dark ? "border-white/10 bg-black/60 text-white" : "border-slate-200 bg-white text-slate-900"
                    }`}
                  />
                  <p className="text-[10px] text-slate-400">تظهر في الهيدر والـ Ribbon أعلى كافة صفحات الموقع.</p>
                </div>
              </div>

              {/* Toggles: Ribbon & Pattern Opacity */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-emerald-500/20">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-black">
                  <input
                    type="checkbox"
                    checked={themeModeForm.showCelebrationRibbon}
                    onChange={(e) => setThemeModeForm((prev) => ({ ...prev, showCelebrationRibbon: e.target.checked }))}
                    className="h-4 w-4 rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>إظهار شريط التهنئة الاحتفالي أعلى الموقع (Celebration Ribbon مع زر الكونفيتي 🎊)</span>
                </label>

                <div className="flex items-center gap-3 text-xs font-black">
                  <span className="text-slate-400">شفافية الزخارف:</span>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="5"
                    value={themeModeForm.backgroundPatternOpacity}
                    onChange={(e) => setThemeModeForm((prev) => ({ ...prev, backgroundPatternOpacity: Number(e.target.value) }))}
                    className="w-28 accent-emerald-500 cursor-pointer"
                  />
                  <span className="font-mono text-emerald-400">{themeModeForm.backgroundPatternOpacity}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-4 border-t border-current/10 flex flex-wrap items-center justify-between gap-3">
            <a
              href="/?siteTheme=saudi-national-day"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1.5"
            >
              <ExternalLink size={13} />
              <span>تجربة الثيم كزائر في تبويب جديد</span>
            </a>

            <Button
              type="button"
              onClick={async () => {
                const isNd = selectedSeason === "national_day";
                await onSaveOrchestration({
                  theme: { ...currentTheme, season: selectedSeason },
                  themeMode: {
                    activeTheme: isNd ? "saudi-national-day" : "default",
                    expiresAt: isNd && themeModeForm.durationHours ? Date.now() + themeModeForm.durationHours * 3600 * 1000 : null,
                    templateVariant: themeModeForm.templateVariant,
                    customBadgeText: themeModeForm.customBadgeText,
                    showCelebrationRibbon: themeModeForm.showCelebrationRibbon,
                    backgroundPatternOpacity: themeModeForm.backgroundPatternOpacity,
                  },
                });
                await utils.executiveAdmin.getSiteOrchestration.invalidate();
                toast.success(
                  isNd
                    ? "تم تفعيل ثيم اليوم الوطني السعودي بنجاح على كامل الموقع! 🇸🇦✨"
                    : `تم تطبيق (${SEASONS.find((s) => s.id === selectedSeason)?.name}) بنجاح`
                );
              }}
              disabled={isSaving}
              className={`rounded-xl font-black text-xs px-7 py-3 transition shadow-lg gap-2 cursor-pointer ${
                selectedSeason === "national_day"
                  ? "bg-gradient-to-r from-[#005A36] via-[#006C35] to-[#5aba1c] hover:opacity-90 text-white shadow-emerald-700/30"
                  : "bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20"
              }`}
            >
              <Sparkles size={14} />
              <span>
                {selectedSeason === "national_day"
                  ? "حفظ وتفعيل ثيم اليوم الوطني على كامل الموقع فوراً 🇸🇦🚀"
                  : "تطبيق الموسم المختار على الموقع الحي 🚀"}
              </span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
