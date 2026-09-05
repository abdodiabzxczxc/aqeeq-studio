import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { useSiteTheme } from "@/lib/useSiteTheme";
import { useVisualEditorState, VisualEditable, VisualIcon } from "@/components/VisualEditor";
import { AlaqeeqSpotlightSearch } from "@/components/AlaqeeqSpotlightSearch";
import { AqeeqFaceSearchModal } from "@/components/AqeeqFaceSearchModal";
import {
  Search,
  LayoutDashboard,
  PencilRuler,
  ScanFace,
  Plus,
  Sun,
  Moon,
  LogOut,
  Settings2,
  Rocket,
  Sparkles,
  ChevronDown,
  Building2,
  Award,
  MapPin,
  Briefcase,
  Calculator,
  Send,
  Smartphone,
  BookOpen,
  Camera,
  Radio,
  FileText,
  Clapperboard,
  PhoneCall,
  MessageCircle,
  Server,
  ArrowRight,
  ArrowLeft,
  Mic,
  ExternalLink,
  GraduationCap,
  Mail,
  Menu,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { usePodcastPlayer } from "@/components/AqeeqFloatingPodcastPlayer";
import { trpc } from "@/lib/trpc";
import { triggerNationalCelebration } from "./AqeeqCelebrationConfetti";
import { AqeeqCreatorStudioModal } from "./AqeeqCreatorStudioModal";
import { Button } from "@/components/ui/button";

export type Section =
  | "studio"
  | "about"
  | "admissions"
  | "accreditations"
  | "journal"
  | "albums"
  | "showcase"
  | "articles"
  | "podcast"
  | string;

type AlaqeeqStudioSiteHeaderProps = {
  title: string;
  active?: Section;
  logoUrl?: string | null;
};

export function AlaqeeqStudioSiteHeader({ title, active, logoUrl }: AlaqeeqStudioSiteHeaderProps) {
  const [location, navigate] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { data: orchestration } = trpc.executiveAdmin.getSiteOrchestration.useQuery(undefined, { refetchOnWindowFocus: false });
  const editor = useVisualEditorState();
  const { theme, toggleTheme } = useAqeeqStudioTheme();
  const { isNationalDay } = useSiteTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [faceSearchOpen, setFaceSearchOpen] = useState(false);
  const [creatorModalOpen, setCreatorModalOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [portalsOpen, setPortalsOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const portalsRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (portalsRef.current && !portalsRef.current.contains(e.target as Node)) {
        setPortalsOpen(false);
      }
      if (optionsRef.current && !optionsRef.current.contains(e.target as Node)) {
        setOptionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dark = theme === "dark";
  const isLocalhost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.includes("manus.space"));
  const isAdmin = (isAuthenticated && user?.role === "admin") || isLocalhost || (typeof window !== "undefined" && (window.location.search.includes("visual=1") || localStorage.getItem("aqeeq-admin-mode") === "true"));
  const go = (path: string) => { setMobileMenuOpen(false); navigate(path); };

  const campuses = orchestration?.schoolCampuses;
  const boysPhone = campuses?.boysPhone || "0148131652";
  const cleanPhone = boysPhone.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/966${cleanPhone.startsWith("0") ? cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent("السلام عليكم ورحمة الله، أود الاستفسار عن القبول والتسجيل بمدارس العقيق")}`;

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const deployMutation = trpc.deploy.syncToLive.useMutation({
    onSuccess: () => {
      setIsDeploying(false);
      toast.success("🚀 تم نشر التعديلات على الموقع المباشر بنجاح!");
    },
    onError: (err) => {
      setIsDeploying(false);
      toast.error(err.message || "فشل نشر التعديلات");
    },
  });

  const handleAuth = () => {
    if (isAuthenticated) {
      void logout();
      return;
    }
    navigate("/login");
  };

  // Auto-resolve active section accurately from route or prop
  let currentActive = active;
  if (!currentActive || currentActive === "studio") {
    if (location.startsWith("/about")) {
      currentActive = "about";
    } else if (location.startsWith("/admissions") || location.startsWith("/admission") || location.startsWith("/fees") || location.startsWith("/prices")) {
      currentActive = "admissions";
    } else if (location.startsWith("/accreditations") || location.startsWith("/quality") || location.startsWith("/centers")) {
      currentActive = "accreditations";
    } else if (location.startsWith("/articles") || location.startsWith("/article")) {
      currentActive = "articles";
    } else if (location.startsWith("/podcast") || location.startsWith("/atheer")) {
      currentActive = "podcast";
    } else if (location.startsWith("/journal") || location.startsWith("/news")) {
      currentActive = "journal";
    } else if (location.startsWith("/albums") || location.startsWith("/album")) {
      currentActive = "albums";
    } else if (location.startsWith("/offers") || location.startsWith("/showcase")) {
      currentActive = "showcase";
    } else if (location === "/") {
      currentActive = "studio";
    }
  }

  // Global Keyboard Shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ── Compression on scroll (Wellington-inspired luxury header) ──
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMenuTab, setActiveMenuTab] = useState<"about" | "admissions" | "media" | "services" | "contact">("about");

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          setIsScrolled((prev) => {
            if (!prev && currentY > 55) return true;
            if (prev && currentY < 20) return false;
            return prev;
          });
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const logoOverride = editor?.getOverride?.("header-logo");
  const activeLogo = logoOverride?.mediaUrl || logoUrl || "/alaqeeq-logo.png";

  const topLocationText = editor?.getOverride?.("header-top-location")?.contentText || "المدينة المنورة — المملكة العربية السعودية";
  const topPhoneText = editor?.getOverride?.("header-top-phone")?.contentText || "+966 53 189 6000";
  const topPhoneLink = editor?.getOverride?.("header-top-phone")?.linkUrl || "tel:+966531896000";
  const topEmailText = editor?.getOverride?.("header-top-email")?.contentText || "info@alaqeeqholding.com";
  const topEmailLink = editor?.getOverride?.("header-top-email")?.linkUrl || "mailto:info@alaqeeqholding.com";
  const topPortalsText = editor?.getOverride?.("header-top-portals")?.contentText || "بوابات الأنظمة والخدمات";
  const topJobsText = editor?.getOverride?.("header-top-jobs")?.contentText || "بوابة التوظيف";
  const topJobsLink = editor?.getOverride?.("header-top-jobs")?.linkUrl || "https://live.aqeeq.edu.sa/jobs";

  const navHomeText = editor?.getOverride?.("header-nav-home")?.contentText || "الرئيسية";
  const navAboutText = editor?.getOverride?.("header-nav-about")?.contentText || "مدارسنا";
  const navAccreditationsText = editor?.getOverride?.("header-nav-accreditations")?.contentText || "الاعتمادات";
  const navAdmissionsText = editor?.getOverride?.("header-nav-admissions")?.contentText || "القبول والتسجيل";
  const navJournalText = editor?.getOverride?.("header-nav-journal")?.contentText || (orchestration?.nav?.journalLabel === "مجلة العقيق" ? "المجلة" : orchestration?.nav?.journalLabel || "المجلة");
  const navAlbumsText = editor?.getOverride?.("header-nav-albums")?.contentText || (orchestration?.nav?.albumsLabel === "ألبوم العقيق" ? "الألبومات" : orchestration?.nav?.albumsLabel || "الألبومات");
  const navPodcastText = editor?.getOverride?.("header-nav-podcast")?.contentText || ((orchestration?.nav as any)?.podcastLabel === "أثير العقيق" || (orchestration?.nav as any)?.podcastLabel === "أثير العقيق 🎙️" ? "أثير" : (orchestration?.nav as any)?.podcastLabel || "أثير");
  const navArticlesText = editor?.getOverride?.("header-nav-articles")?.contentText || ((orchestration?.nav as any)?.articlesLabel === "المقالات ✍️" || (orchestration?.nav as any)?.articlesLabel === "مقالات وأقلام العقيق" ? "المقالات" : (orchestration?.nav as any)?.articlesLabel || "المقالات");
  const navOffersText = editor?.getOverride?.("header-nav-offers")?.contentText || (orchestration?.nav?.showcaseLabel === "الأخبار والعروض" ? "الأخبار" : orchestration?.nav?.showcaseLabel || "الأخبار");
  const ctaButtonText = editor?.getOverride?.("header-cta-button")?.contentText || "سجّل الآن ✦";

  return (
    <div dir="rtl" className="w-full bg-transparent">
      {/* ── Fixed Master Header Deck (Always follows user down on all pages) ── */}
      <div className={`fixed top-0 inset-x-0 z-[130] w-full transition-all duration-300 ease-out bg-transparent ${
        isScrolled ? "pointer-events-none" : "pointer-events-auto"
      }`}>
        {/* 1. Top Executive Utility Bar */}
        <div className={`hidden sm:block relative z-[140] text-[11px] font-bold transition-all duration-300 overflow-hidden ${
          isScrolled
            ? "max-h-0 h-0 py-0 opacity-0 !border-0 !border-transparent pointer-events-none"
            : `border-b max-h-12 py-1.5 opacity-100 ${
                dark ? "border-white/5 bg-[#0c1218]/95 text-slate-400" : "border-black/5 bg-slate-50/95 text-slate-600"
              }`
        }`}>
        <div className="mx-auto flex max-w-[1380px] items-center justify-between px-3.5 sm:px-6 md:px-8">
          <div className="flex items-center gap-4">
            <span
              data-visual-id="header-top-location"
              data-visual-tag="text"
              data-visual-label="موقع المدارس في الشريط العلوي"
              className={`flex items-center gap-1.5 ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}
            >
              <MapPin size={12} />
              <span>{topLocationText}</span>
            </span>
            <span className="h-3 w-px bg-current opacity-20" />
            <a
              href={topPhoneLink}
              data-visual-id="header-top-phone"
              data-visual-tag="text"
              data-visual-label="هاتف المدارس في الشريط العلوي"
              className="flex items-center gap-1.5 hover:text-[#f8ca14] transition"
              dir="ltr"
            >
              <PhoneCall size={12} />
              <span>{topPhoneText}</span>
            </a>
            <span className="h-3 w-px bg-current opacity-20 hidden md:inline-block" />
            <a
              href={topEmailLink}
              data-visual-id="header-top-email"
              data-visual-tag="text"
              data-visual-label="إيميل المدارس في الشريط العلوي"
              className="hidden md:flex items-center gap-1.5 hover:text-[#f8ca14] transition"
              dir="ltr"
            >
              <Mail size={12} />
              <span>{topEmailText}</span>
            </a>
          </div>

          <div className="flex items-center gap-3">
            {/* Portals Dropdown */}
            <div ref={portalsRef} className="relative">
              <button
                type="button"
                onClick={() => { setPortalsOpen((prev) => !prev); setOptionsOpen(false); }}
                data-visual-id="header-top-portals"
                data-visual-tag="text"
                data-visual-label="زر بوابات الخدمات"
                className="flex items-center gap-1 hover:text-[#f8ca14] transition cursor-pointer"
              >
                <Server size={12} className={dark ? "text-[#f8ca14]" : "text-[#08467d]"} />
                <span>{topPortalsText}</span>
                <ChevronDown size={11} className={`opacity-60 transition-transform ${portalsOpen ? "rotate-180" : ""}`} />
              </button>

              {portalsOpen && (
                <div
                  dir="rtl"
                  className={`absolute right-0 top-full mt-2 w-64 p-2 rounded-2xl border shadow-2xl backdrop-blur-xl z-50 ${
                    dark ? "bg-[#0c1218]/95 border-white/10 text-white" : "bg-white/95 border-slate-200 text-slate-900 shadow-xl"
                  }`}
                >
                  <div className={`text-[10px] ${dark ? "text-[#f8ca14]" : "text-[#08467d]"} font-black px-2 py-1 flex items-center gap-1.5`}>
                    <GraduationCap size={12} />
                    <span>خدمات أولياء الأمور والطلاب</span>
                  </div>
                  <a
                    href="https://portal.aqeeq.app/pages/daily_plans/parent_lookup.php"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setPortalsOpen(false)}
                    className="flex items-center justify-between p-2 rounded-lg text-xs font-bold hover:bg-[#f8ca14]/10 text-amber-700 dark:text-amber-300"
                  >
                    <span className="flex items-center gap-1.5">
                      <FileText size={12} />
                      <span>الخطط الدراسية الأسبوعية</span>
                    </span>
                    <ExternalLink size={12} className="opacity-60" />
                  </a>
                  <a
                    href="https://qr-codes.io/LQMip0"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setPortalsOpen(false)}
                    className="flex items-center justify-between p-2 rounded-lg text-xs font-bold hover:bg-[#f8ca14]/10"
                  >
                    <span className="flex items-center gap-1.5">
                      <Smartphone size={12} />
                      <span>تحميل تطبيق أولياء الأمور</span>
                    </span>
                    <ExternalLink size={12} className="opacity-60" />
                  </a>

                  <div className="h-px bg-current/10 my-1" />

                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold px-2 py-1">الأنظمة الإدارية والموظفين</div>
                  <a
                    href="https://live.aqeeq.edu.sa"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setPortalsOpen(false)}
                    className="flex items-center justify-between p-2 rounded-lg text-xs font-bold hover:bg-[#f8ca14]/10"
                  >
                    <span>نظام Odoo الإداري</span>
                    <ExternalLink size={12} className="opacity-60" />
                  </a>
                  <a
                    href="https://email.aqeeqholding.com"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setPortalsOpen(false)}
                    className="flex items-center justify-between p-2 rounded-lg text-xs font-bold hover:bg-[#f8ca14]/10"
                  >
                    <span>البريد الإلكتروني الرسمي</span>
                    <ExternalLink size={12} className="opacity-60" />
                  </a>
                  <a
                    href="https://next.aqeeq.app"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setPortalsOpen(false)}
                    className="flex items-center justify-between p-2 rounded-lg text-xs font-bold hover:bg-[#f8ca14]/10"
                  >
                    <span>سحابة العقيق الرقمية</span>
                    <ExternalLink size={12} className="opacity-60" />
                  </a>
                  <a
                    href="https://portal.aqeeq.app"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setPortalsOpen(false)}
                    className="flex items-center justify-between p-2 rounded-lg text-xs font-bold hover:bg-[#f8ca14]/10"
                  >
                    <span>بوابة التذاكر والصيانة</span>
                    <ExternalLink size={12} className="opacity-60" />
                  </a>
                  <a
                    href="https://aqeeq.live"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setPortalsOpen(false)}
                    className="flex items-center justify-between p-2 rounded-lg text-xs font-bold hover:bg-[#f8ca14]/10"
                  >
                    <span>اجتماعات العقيق المرئية</span>
                    <ExternalLink size={12} className="opacity-60" />
                  </a>
                </div>
              )}
            </div>

            <span className="h-3 w-px bg-current opacity-20" />
            <a
              href={topJobsLink}
              target="_blank"
              rel="noreferrer"
              data-visual-id="header-top-jobs"
              data-visual-tag="text"
              data-visual-label="رابط بوابة التوظيف"
              className="hover:text-[#f8ca14] transition"
            >
              {topJobsText}
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Executive Header — Collapses into Twin Corner Floating Islands on Scroll */}
      <header className={`w-full transition-all duration-300 ease-out ${
        isScrolled
          ? "is-scrolled !bg-transparent !border-transparent !border-0 !shadow-none pointer-events-none"
          : `aq-studio-share-header border-b backdrop-blur-2xl ${
              isNationalDay
                ? dark ? "border-[#f8ca14]/20 bg-[#0c1218]/95" : "border-[#08467d]/15 bg-white/95"
                : dark ? "border-white/[0.08] bg-black/90" : "border-black/[0.06] bg-white/95"
            }`
      }`}>
        <div className={`relative mx-auto max-w-[1380px] flex items-center justify-between lg:grid lg:grid-cols-[1fr_auto_1fr] transition-[height] duration-300 ease-out ${
          isScrolled
            ? "px-3.5 sm:px-6 md:px-8 h-[54px] sm:h-[62px] pointer-events-none"
            : "px-3.5 sm:px-6 md:px-8 h-[66px] sm:h-[78px] pointer-events-auto"
        }`}>
          {/* Logo with clean branding — Permanently rounded pill island, zero circle morphing */}
          <div className="relative shrink-0 lg:justify-self-start">
            <div className={`rounded-full flex items-center transition-[background-color,border-color,box-shadow,padding] duration-300 ease-out ${
              isScrolled
                ? "pointer-events-auto border backdrop-blur-2xl backdrop-saturate-[180%] px-3 sm:px-4 py-1.5 bg-white/60 dark:bg-[#060a12]/70 border-black/10 dark:border-white/15 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.85),0_8px_25px_-5px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.15),0_12px_30px_-5px_rgba(0,0,0,0.6)]"
                : "border border-transparent bg-transparent px-1 sm:px-2 py-1"
            }`}>
              <button
                onClick={() => go("/")}
                aria-label={`العودة إلى ${title}`}
                data-visual-id="header-logo-container"
                data-visual-tag="button"
                data-visual-label="حاوية الشعار"
                className={`flex items-center transition-[height,max-width,transform] duration-300 ease-out hover:opacity-90 ${
                  isScrolled
                    ? "h-[30px] sm:h-[34px] max-w-[125px] sm:max-w-[170px]"
                    : "h-[42px] sm:h-[54px] w-auto max-w-[160px] sm:max-w-[220px]"
                }`}
              >
                <img
                  src={
                    isNationalDay
                      ? dark
                        ? "/alaqeeq-logo-national-dark.png"
                        : "/alaqeeq-logo-national-light.png"
                      : activeLogo
                  }
                  alt="شعار مدارس العقيق الأهلية والدولية"
                  data-visual-id="header-logo"
                  data-visual-tag="image"
                  data-visual-label="شعار مدارس العقيق"
                  className={`max-h-full max-w-full object-contain transition duration-200 ${
                    dark
                      ? "brightness-0 invert opacity-95"
                      : isNationalDay
                      ? "drop-shadow-[0_1px_3px_rgba(8,70,125,0.18)]"
                      : ""
                  }`}
                />
              </button>

              {isNationalDay && (
                <button
                  type="button"
                  onClick={() => triggerNationalCelebration()}
                  title="انقر لمشاركتنا بهجة الوطن 🇸🇦"
                  className={`hidden lg:inline-flex items-center gap-1.5 text-[11px] font-black px-3 py-1 rounded-full border shadow-sm transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
                    isScrolled ? "max-w-0 opacity-0 overflow-hidden pointer-events-none p-0 border-0" : "max-w-[120px] opacity-100 mr-2"
                  } ${
                    dark
                      ? "bg-gradient-to-r from-[#08467d]/30 to-[#042442]/20 border-[#f8ca14]/40 text-[#f8ca14]"
                      : "bg-[#08467d]/10 border-[#08467d]/30 text-[#08467d]"
                  }`}
                >
                  <span>🇸🇦</span>
                  <span className={`font-bold ${dark ? "text-white" : "text-[#08467d]"}`}>عزّنا بطبعنا</span>
                </button>
              )}
            </div>
          </div>

          {/* Center 9 Core Navigation Links (Desktop) — Isolated in Grid Center with zero horizontal drift */}
          <nav
            dir="rtl"
            className={`hidden lg:flex items-center justify-self-center gap-2 xl:gap-4 whitespace-nowrap text-[13px] font-bold font-['Tajawal',sans-serif] transition-[opacity,transform] duration-250 ease-out ${
              isScrolled
                ? "opacity-0 -translate-y-2 pointer-events-none"
                : "opacity-100 translate-y-0 pointer-events-auto"
            }`}
          >
              {/* 1. الرئيسية */}
              <button
                onClick={() => go("/")}
                data-visual-id="header-nav-home"
                data-visual-tag="text"
                data-visual-label="رابط الرئيسية"
                className={`aq-studio-toplink ${currentActive === "studio" ? "aq-studio-toplink--active" : ""}`}
              >
                {navHomeText}
              </button>

              {/* 2. مدارسنا */}
              <button
                onClick={() => go("/about")}
                data-visual-id="header-nav-about"
                data-visual-tag="text"
                data-visual-label="رابط مدارسنا"
                className={`aq-studio-toplink ${
                  currentActive === "about" ? "aq-studio-toplink--active" : ""
                } ${dark ? "text-[#f8ca14]/90 hover:text-[#f8ca14]" : "text-[#08467d] hover:text-[#08467d]/80"}`}
              >
                {navAboutText}
              </button>

              {/* 3. الاعتمادات */}
              <button
                onClick={() => go("/accreditations")}
                data-visual-id="header-nav-accreditations"
                data-visual-tag="text"
                data-visual-label="رابط الاعتمادات"
                className={`aq-studio-toplink ${
                  currentActive === "accreditations" ? "aq-studio-toplink--active" : ""
                }`}
              >
                {navAccreditationsText}
              </button>

              {/* 4. القبول والتسجيل */}
              <button
                onClick={() => go("/admissions")}
                data-visual-id="header-nav-admissions"
                data-visual-tag="text"
                data-visual-label="رابط القبول والتسجيل"
                className={`aq-studio-toplink ${
                  currentActive === "admissions" ? "aq-studio-toplink--active" : ""
                }`}
              >
                {navAdmissionsText}
              </button>

              {/* 5. المجلة */}
              <button
                onClick={() => go("/journal")}
                data-visual-id="header-nav-journal"
                data-visual-tag="text"
                data-visual-label="رابط مجلة العقيق"
                className={`aq-studio-toplink ${currentActive === "journal" ? "aq-studio-toplink--active" : ""}`}
              >
                {navJournalText}
              </button>

              {/* 6. الألبومات */}
              <button
                onClick={() => go("/albums")}
                data-visual-id="header-nav-albums"
                data-visual-tag="text"
                data-visual-label="رابط الألبومات"
                className={`aq-studio-toplink ${currentActive === "albums" ? "aq-studio-toplink--active" : ""}`}
              >
                {navAlbumsText}
              </button>

              {/* 7. أثير البودكاست */}
              <button
                onClick={() => go("/podcast")}
                data-visual-id="header-nav-podcast"
                data-visual-tag="text"
                data-visual-label="رابط البودكاست"
                className={`aq-studio-toplink ${currentActive === "podcast" ? "aq-studio-toplink--active" : ""}`}
              >
                {navPodcastText}
              </button>

              {/* 8. المقالات */}
              <button
                onClick={() => go("/articles")}
                data-visual-id="header-nav-articles"
                data-visual-tag="text"
                data-visual-label="رابط المقالات"
                className={`aq-studio-toplink ${currentActive === "articles" ? "aq-studio-toplink--active" : ""}`}
              >
                {navArticlesText}
              </button>

              {/* 9. الأخبار */}
              <button
                onClick={() => go("/showcase")}
                data-visual-id="header-nav-offers"
                data-visual-tag="text"
                data-visual-label="رابط الأخبار"
                className={`aq-studio-toplink ${currentActive === "showcase" ? "aq-studio-toplink--active" : ""}`}
              >
                {navOffersText}
              </button>
            </nav>

          {/* Left Action Buttons — Permanently rounded pill island, zero circle morphing */}
          <div className="relative shrink-0 lg:justify-self-end">
            <div
              dir="ltr"
              className={`rounded-full flex items-center shrink-0 transition-[background-color,border-color,box-shadow,padding,gap] duration-300 ease-out ${
                isScrolled
                  ? "pointer-events-auto border backdrop-blur-2xl backdrop-saturate-[180%] px-2 sm:px-2.5 py-1.5 gap-1.5 sm:gap-2 bg-white/60 dark:bg-[#060a12]/70 border-black/10 dark:border-white/15 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.85),0_8px_25px_-5px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.15),0_12px_30px_-5px_rgba(0,0,0,0.6)]"
                  : "border border-transparent bg-transparent px-1 sm:px-1.5 py-1 gap-2 sm:gap-2.5 pointer-events-auto"
              }`}
            >
              {/* Desktop Collapsible Extra Action Items (Glide away smoothly on scroll without layout snap) */}
              <div
                className={`hidden sm:flex items-center gap-2 transition-[max-width,opacity] duration-300 ease-out overflow-hidden ${
                  isScrolled
                    ? "max-w-0 opacity-0 pointer-events-none"
                    : "max-w-[420px] opacity-100 pointer-events-auto"
                }`}
              >
                {/* Primary Executive CTA Button */}
                <Button
                  onClick={() => go("/admissions#admission-form-section")}
                  data-visual-id="header-cta-button"
                  data-visual-tag="button"
                  data-visual-label="زر القبول والتسجيل (الهيدر)"
                  className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black shadow-md transition active:scale-95 whitespace-nowrap ${
                    dark
                      ? "bg-gradient-to-r from-[#f8ca14] to-amber-500 text-black hover:opacity-95 shadow-[#f8ca14]/20"
                      : "bg-gradient-to-r from-[#08467d] to-[#042442] text-white hover:opacity-95 shadow-[#08467d]/25"
                  }`}
                >
                  <span>{ctaButtonText}</span>
                </Button>

              </div>

              {/* 🔍 زر البحث الشامل (Spotlight Search) — Always visible in Left Island */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setOptionsOpen(false);
                  setSearchOpen((open) => !open);
                }}
                data-visual-id="header-icon-search"
                data-visual-tag="icon"
                data-visual-label="زر البحث الشامل"
                className={`grid shrink-0 ${isScrolled ? "h-8 w-8 sm:h-8.5 sm:w-8.5" : "h-9 w-9 sm:h-10 sm:w-10"} place-items-center rounded-xl border transition-all duration-300 active:scale-95 cursor-pointer ${
                  searchOpen
                    ? "border-[#f8ca14] bg-[#f8ca14]/20 text-[#f8ca14] shadow-md shadow-[#f8ca14]/15"
                    : dark
                    ? "border-[#f8ca14]/30 bg-[#f8ca14]/[0.08] text-[#f8ca14] hover:bg-[#f8ca14] hover:text-black"
                    : "border-[#08467d]/20 bg-[#08467d]/[0.08] text-[#08467d] hover:bg-[#08467d] hover:text-white"
                }`}
                title="البحث الشامل (Ctrl+K)"
                aria-label="البحث الشامل"
              >
                {searchOpen ? <X size={16} /> : <Search size={16} />}
              </button>

              {/* ☀️ / 🌙 زر الإضاءة (Theme Toggle) — Always visible, silky smooth */}
              <button
                onClick={toggleTheme}
                className={`grid shrink-0 ${isScrolled ? "h-8 w-8 sm:h-8.5 sm:w-8.5" : "h-9 w-9 sm:h-10 sm:w-10"} place-items-center rounded-xl border transition-all duration-300 active:scale-95 cursor-pointer ${
                  dark
                    ? "border-[#f8ca14]/30 bg-[#f8ca14]/[0.08] text-[#f8ca14] hover:bg-[#f8ca14] hover:text-black"
                    : "border-[#08467d]/20 bg-[#08467d]/[0.08] text-[#08467d] hover:bg-[#08467d] hover:text-white"
                }`}
                title={dark ? "تفعيل الوضع الفاتح (White Mode)" : "تفعيل الوضع الداكن (Black Mode)"}
              >
                <VisualIcon id="aqeeq-studio-theme-icon" label="أيقونة مبدّل المظهر" icon={dark ? "sun" : "moon"} size={16} />
              </button>

              {/* ⚙️ قائمة المشرف والمحرر البصري والداش بورد (دائمة ومتاحة في كل الأوضاع) */}
              <div ref={optionsRef} className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setOptionsOpen((prev) => !prev);
                    setPortalsOpen(false);
                    setMobileMenuOpen(false);
                  }}
                  className={`grid shrink-0 ${isScrolled ? "h-8 w-8 sm:h-8.5 sm:w-8.5" : "h-9 w-9 sm:h-10 sm:w-10"} place-items-center rounded-xl border transition-all duration-300 active:scale-95 cursor-pointer ${
                    optionsOpen
                      ? "border-[#f8ca14] bg-[#f8ca14]/25 text-[#f8ca14] shadow-md shadow-[#f8ca14]/15"
                      : editor.isEditing
                      ? "border-emerald-500 bg-emerald-500/20 text-emerald-400 animate-pulse"
                      : dark
                      ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                      : "border-black/10 bg-black/5 text-slate-700 hover:bg-black/10 hover:text-black"
                  }`}
                  aria-label="قائمة المشرف والمحرر"
                  title="المحرر البصري ولوحة الإدارة"
                >
                  <Settings2 size={16} />
                </button>

                {optionsOpen && (
                  <div
                    dir="rtl"
                    className={`absolute left-0 top-full mt-2 w-64 rounded-2xl border shadow-2xl backdrop-blur-xl z-[160] p-2.5 ${
                      dark ? "bg-[#0c0c0c]/95 border-white/15 text-white" : "bg-white/98 border-slate-200 text-slate-900 shadow-2xl"
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/10">
                      <span className="text-xs font-black text-[#f8ca14] flex items-center gap-1.5">
                        <span>👑</span>
                        <span>أدوات المشرف العام</span>
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        {user?.name || "المشرف"}
                      </span>
                    </div>

                    <div className="space-y-1.5 mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setOptionsOpen(false);
                          editor.toggleEditing();
                        }}
                        className={`w-full flex items-center justify-between py-2.5 px-3 cursor-pointer font-black text-xs ${
                          editor.isEditing
                            ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/40"
                            : dark
                            ? "bg-white/5 hover:bg-white/10 text-white border border-white/5"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200"
                        } rounded-xl transition`}
                      >
                        <span className="flex items-center gap-2">
                          <PencilRuler size={15} className="text-[#f8ca14] shrink-0" />
                          <span>{editor.isEditing ? "إنهاء التعديل البصري" : "تفعيل المحرر البصري للتعديل"}</span>
                        </span>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                          editor.isEditing ? "bg-emerald-500 text-white" : dark ? "bg-white/10 text-slate-400" : "bg-slate-200 text-slate-600"
                        }`}>
                          {editor.isEditing ? "ON" : "OFF"}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setOptionsOpen(false);
                          navigate("/admin");
                        }}
                        className={`w-full flex items-center gap-3 py-2.5 px-3 cursor-pointer font-black text-xs ${
                          dark ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-800"
                        } rounded-xl transition text-right`}
                      >
                        <LayoutDashboard size={15} className="text-blue-500 shrink-0" />
                        <span>لوحة التحكم للإدارة (Admin)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (isDeploying) return;
                          if (!window.confirm("🚀 هل تريد نشر التعديلات الحالية على الموقع المباشر الآن؟")) return;
                          setIsDeploying(true);
                          deployMutation.mutate();
                        }}
                        disabled={isDeploying}
                        className={`w-full flex items-center gap-3 py-2.5 px-3 cursor-pointer font-black text-xs ${
                          dark ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-800"
                        } rounded-xl transition text-right`}
                      >
                        <Rocket size={15} className={`text-emerald-500 shrink-0 ${isDeploying ? "animate-spin" : ""}`} />
                        <span>{isDeploying ? "جارِ النشر..." : "نشر التعديلات للعامة 🚀"}</span>
                      </button>
                    </div>

                    <div className={`h-px my-2 ${dark ? "bg-white/10" : "bg-black/10"}`} />

                    <button
                      type="button"
                      onClick={() => {
                        setOptionsOpen(false);
                        handleAuth();
                      }}
                      className={`w-full flex items-center gap-3 py-2 px-3 cursor-pointer font-bold text-xs ${
                        isAuthenticated
                          ? dark ? "hover:bg-[#de191e]/20 text-[#de191e]" : "hover:bg-[#de191e]/10 text-[#de191e]"
                          : dark ? "hover:bg-white/5 text-slate-300" : "hover:bg-slate-100 text-slate-700"
                      } rounded-xl text-right transition`}
                    >
                      <LogOut size={15} className="shrink-0" />
                      <span>{isAuthenticated ? "تسجيل الخروج" : "تسجيل الدخول كمسؤول"}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* ☰ الثلاث شُرط (Hamburger Menu Button) — Always visible and active on all screens */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchOpen(false);
                  setOptionsOpen(false);
                  setMobileMenuOpen((open) => !open);
                }}
                className={`group grid shrink-0 ${isScrolled ? "h-8 w-8 sm:h-8.5 sm:w-8.5" : "h-9 w-9 sm:h-10 sm:w-10"} place-items-center rounded-xl border transition-all duration-200 active:scale-90 cursor-pointer ${
                  mobileMenuOpen
                    ? "border-[#de191e]/50 bg-[#de191e]/15 text-[#de191e]"
                    : dark
                    ? "border-[#f8ca14]/40 bg-[#f8ca14]/10 text-[#f8ca14] hover:bg-[#f8ca14]/20 hover:border-[#f8ca14]"
                    : "border-[#08467d]/30 bg-[#08467d]/10 text-[#08467d] hover:bg-[#08467d]/15 hover:border-[#08467d]"
                }`}
                aria-label={mobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
                title="القائمة الشاملة"
              >
                {mobileMenuOpen ? (
                  <X size={18} />
                ) : (
                  <div className="flex flex-col justify-center items-center gap-[3.5px] w-4">
                    <span className="h-[2px] w-4 rounded-full bg-current transition-all duration-300" />
                    <span className="h-[2px] w-2.5 rounded-full bg-current transition-all duration-300 group-hover:w-4" />
                    <span className="h-[2px] w-4 rounded-full bg-current transition-all duration-300" />
                  </div>
                )}
              </button>
            </div>

          {/* ── Complete Bento Cockpit Popover ── */}
          {mobileMenuOpen && (
            <>
              {/* Invisible Click-Outside Dismiss Layer (Zero Blur, Site stays 100% visible & bright) */}
              <div
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 z-[140] bg-transparent cursor-default"
                aria-label="إغلاق القائمة"
              />

              {/* The Floating Bento Cockpit Popover — Attached directly below Left Island */}
              <div
                dir="rtl"
                className={`absolute top-full mt-2.5 left-0 z-[150] w-[min(440px,calc(100vw-24px))] max-h-[85vh] flex flex-col rounded-[2rem] border shadow-2xl backdrop-blur-2xl backdrop-saturate-[180%] overflow-hidden animate-in zoom-in-95 fade-in slide-in-from-top-3 duration-250 ease-out origin-top-left pointer-events-auto ${
                  dark
                    ? "bg-[#070c14]/94 text-white border-white/15 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.08)]"
                    : "bg-white/94 text-slate-900 border-black/10 shadow-[0_25px_60px_-15px_rgba(8,70,125,0.25),0_0_0_1px_rgba(0,0,0,0.05)]"
                }`}
              >
                {/* 1. Header with Brand & Close */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/[0.08] dark:border-white/10 shrink-0 bg-white/40 dark:bg-black/30 backdrop-blur-md">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={
                        isNationalDay
                          ? dark
                            ? "/alaqeeq-logo-national-dark.png"
                            : "/alaqeeq-logo-national-light.png"
                          : activeLogo
                      }
                      alt="شعار مدارس العقيق"
                      className={`h-7 sm:h-8 w-auto object-contain ${dark ? "brightness-0 invert opacity-95" : ""}`}
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                        بوابة مدارس العقيق الذكية
                      </span>
                      <span className="text-[10px] font-bold text-[#08467d] dark:text-[#f8ca14] leading-tight">
                        دليل الصروح والخدمات ✦ 1446-1447هـ
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="grid h-8 w-8 place-items-center rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-[#de191e]/15 hover:text-[#de191e] hover:border-[#de191e]/30 active:scale-90 transition cursor-pointer"
                    aria-label="إغلاق القائمة"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* 2. Living Bento Scroll Area */}
                <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-5 py-3.5 space-y-3 pb-6 scrollbar-hide">
                  
                  {/* 1. 🏛️ أولاً: الصروح والمسارات المؤسسية لمدارس العقيق */}
                  <div className={`rounded-2xl border p-3 space-y-2 ${
                    dark ? "bg-white/[0.03] border-white/10" : "bg-slate-50/90 border-slate-200/80 shadow-xs"
                  }`}>
                    <div className="flex items-center justify-between pb-1 border-b border-black/5 dark:border-white/5">
                      <span className={`text-[11px] font-black ${dark ? "text-[#f8ca14]" : "text-[#08467d]"} flex items-center gap-1.5`}>
                        <span>🏛️</span>
                        <span>صروح ومسارات مدارس العقيق</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold">بوابات رسمية</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => go("/")}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-right transition cursor-pointer ${
                          currentActive === "studio"
                            ? dark ? "bg-[#f8ca14]/15 border-[#f8ca14]/40 text-[#f8ca14]" : "bg-[#08467d]/10 border-[#08467d]/30 text-[#08467d]"
                            : dark ? "border-white/10 bg-white/5 hover:bg-white/10 text-white" : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-xs"
                        }`}
                      >
                        <span className="text-base">🏠</span>
                        <div>
                          <div className="text-[11px] font-black leading-tight">الصفحة الرئيسية</div>
                          <div className="text-[9px] text-slate-500 dark:text-slate-400">بوابة المدارس</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => go("/about")}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-right transition cursor-pointer ${
                          currentActive === "about"
                            ? dark ? "bg-[#f8ca14]/15 border-[#f8ca14]/40 text-[#f8ca14]" : "bg-[#08467d]/10 border-[#08467d]/30 text-[#08467d]"
                            : dark ? "border-white/10 bg-white/5 hover:bg-white/10 text-white" : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-xs"
                        }`}
                      >
                        <span className="text-base">🏛️</span>
                        <div>
                          <div className="text-[11px] font-black leading-tight">عن مدارس العقيق</div>
                          <div className="text-[9px] text-slate-500 dark:text-slate-400">الرؤية والصروح</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => go("/accreditations")}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-right transition cursor-pointer ${
                          currentActive === "accreditations"
                            ? dark ? "bg-[#f8ca14]/15 border-[#f8ca14]/40 text-[#f8ca14]" : "bg-[#08467d]/10 border-[#08467d]/30 text-[#08467d]"
                            : dark ? "border-white/10 bg-white/5 hover:bg-white/10 text-white" : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-xs"
                        }`}
                      >
                        <span className="text-base">🏆</span>
                        <div>
                          <div className="text-[11px] font-black leading-tight">الاعتمادات الدولية</div>
                          <div className="text-[9px] text-slate-500 dark:text-slate-400">Cognia وضمان الجودة</div>
                        </div>
                      </button>

                      <a
                        href="https://live.aqeeq.edu.sa/jobs"
                        target="_blank"
                        rel="noreferrer"
                        className={`flex items-center gap-2 p-2 rounded-xl border text-right transition cursor-pointer ${
                          dark ? "border-white/10 bg-white/5 hover:bg-white/10 text-white" : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-xs"
                        }`}
                      >
                        <span className="text-base">💼</span>
                        <div>
                          <div className="text-[11px] font-black leading-tight flex items-center gap-1">
                            <span>بوابة التوظيف</span>
                            <ExternalLink size={10} className="opacity-60" />
                          </div>
                          <div className="text-[9px] text-slate-500 dark:text-slate-400">انضم لكادر العقيق</div>
                        </div>
                      </a>
                    </div>
                  </div>

                  {/* 2. 🎓 ثانياً: البطاقة الملكية للقبول والتسجيل والرسوم (Flagship Admissions) */}
                  <div className={`relative overflow-hidden rounded-2xl p-3.5 transition duration-300 hover:scale-[1.01] border ${
                    dark
                      ? "bg-gradient-to-br from-[#08467d]/90 via-[#042442] to-[#021424] border-[#f8ca14]/30 text-white shadow-[0_12px_30px_rgba(8,70,125,0.4)]"
                      : "bg-gradient-to-br from-[#08467d] via-[#073661] to-[#042442] border-[#f8ca14]/40 text-white shadow-[0_12px_30px_rgba(8,70,125,0.25)]"
                  }`}>
                    <div className="relative z-10 flex items-start justify-between">
                      <div>
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-[#f8ca14] text-slate-950 mb-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
                          <span>القبول والتسجيل متاح الآن</span>
                        </span>
                        <h3 className="text-xs sm:text-sm font-black tracking-tight leading-snug">
                          احجز مقعد ابنك للعام الجديد
                        </h3>
                        <p className="text-[10px] text-white/80 mt-0.5 font-medium">
                          تعليم أهلي ودولي معتمد بمناهج عالمية
                        </p>
                      </div>
                      <GraduationCap className="text-[#f8ca14] opacity-80 shrink-0" size={26} />
                    </div>

                    <div className="relative z-10 mt-3 flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => go("/admissions#admission-form-section")}
                        className="flex-1 min-w-[110px] flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-black bg-[#f8ca14] hover:bg-amber-400 text-slate-950 shadow-md transition active:scale-95 cursor-pointer"
                      >
                        <span>سجّل الآن فوري</span>
                        <ArrowLeft size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => go("/admissions#fees-table")}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 border border-white/20 text-white transition cursor-pointer"
                      >
                        جدول الرسوم
                      </button>
                      <button
                        type="button"
                        onClick={() => go("/admissions#fees-calculator")}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 border border-white/20 text-white transition cursor-pointer"
                      >
                        حاسبة الأقساط
                      </button>
                    </div>
                  </div>

                  {/* 3. 🎨 ثالثاً: المركز الإعلامي والثقافي الموحد (Compact Media Hub) */}
                  <div className={`rounded-2xl border p-3 space-y-2 ${
                    dark ? "bg-white/[0.03] border-white/10" : "bg-slate-50/90 border-slate-200/80 shadow-xs"
                  }`}>
                    <div className="flex items-center justify-between pb-1 border-b border-black/5 dark:border-white/5">
                      <span className={`text-[11px] font-black ${dark ? "text-[#f8ca14]" : "text-[#08467d]"} flex items-center gap-1.5`}>
                        <span>🎨</span>
                        <span>المركز الإعلامي والإنتاج الثقافي</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold">5 أقسام حية</span>
                    </div>

                    {/* المربعات الأنيقة المدمجة: الأخبار، المقالات، المجلة، الألبومات */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => go("/showcase")}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-right transition cursor-pointer ${
                          currentActive === "showcase"
                            ? dark ? "bg-[#f8ca14]/15 border-[#f8ca14]/40 text-[#f8ca14]" : "bg-[#08467d]/10 border-[#08467d]/30 text-[#08467d]"
                            : dark ? "border-white/10 bg-white/5 hover:bg-white/10 text-white" : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-xs"
                        }`}
                      >
                        <span className="text-base">📰</span>
                        <div>
                          <div className="text-[11px] font-black leading-tight">الأخبار والعروض</div>
                          <div className="text-[9px] text-slate-500 dark:text-slate-400">المستجدات والإعلانات</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => go("/articles")}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-right transition cursor-pointer ${
                          currentActive === "articles"
                            ? dark ? "bg-[#f8ca14]/15 border-[#f8ca14]/40 text-[#f8ca14]" : "bg-[#08467d]/10 border-[#08467d]/30 text-[#08467d]"
                            : dark ? "border-white/10 bg-white/5 hover:bg-white/10 text-white" : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-xs"
                        }`}
                      >
                        <span className="text-base">✍️</span>
                        <div>
                          <div className="text-[11px] font-black leading-tight">مقالات العقيق</div>
                          <div className="text-[9px] text-slate-500 dark:text-slate-400">أقلام تربوية وثقافية</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => go("/journal")}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-right transition cursor-pointer ${
                          currentActive === "journal"
                            ? dark ? "bg-[#f8ca14]/15 border-[#f8ca14]/40 text-[#f8ca14]" : "bg-[#08467d]/10 border-[#08467d]/30 text-[#08467d]"
                            : dark ? "border-white/10 bg-white/5 hover:bg-white/10 text-white" : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-xs"
                        }`}
                      >
                        <span className="text-base">📖</span>
                        <div>
                          <div className="text-[11px] font-black leading-tight">مجلة العقيق</div>
                          <div className="text-[9px] text-slate-500 dark:text-slate-400">الأعداد والأرشيف</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => go("/albums")}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-right transition cursor-pointer ${
                          currentActive === "albums"
                            ? dark ? "bg-[#f8ca14]/15 border-[#f8ca14]/40 text-[#f8ca14]" : "bg-[#08467d]/10 border-[#08467d]/30 text-[#08467d]"
                            : dark ? "border-white/10 bg-white/5 hover:bg-white/10 text-white" : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-xs"
                        }`}
                      >
                        <span className="text-base">📸</span>
                        <div>
                          <div className="text-[11px] font-black leading-tight">ألبومات الفعاليات</div>
                          <div className="text-[9px] text-slate-500 dark:text-slate-400">معرض الصور والأنشطة</div>
                        </div>
                      </button>
                    </div>

                    {/* أثير العقيق (بودكاست مدمج أنيق بكامل العرض وبدون هدر للمساحة) */}
                    <button
                      type="button"
                      onClick={() => go("/podcast")}
                      className={`w-full flex items-center justify-between p-2 rounded-xl border text-right transition cursor-pointer ${
                        currentActive === "podcast"
                          ? dark ? "bg-[#f8ca14]/15 border-[#f8ca14]/40 text-[#f8ca14]" : "bg-[#08467d]/10 border-[#08467d]/30 text-[#08467d]"
                          : dark ? "border-white/10 bg-white/5 hover:bg-white/10 text-white" : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-xs"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">🎙️</span>
                        <div>
                          <div className="text-[11px] font-black leading-tight flex items-center gap-1.5">
                            <span>أثير العقيق — بودكاست حي</span>
                            <span className="text-[8px] px-1.5 py-0.2 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-black">
                              Live
                            </span>
                          </div>
                          <div className="text-[9px] text-slate-500 dark:text-slate-400">حوارات وإبداعات من صميم المدارس</div>
                        </div>
                      </div>

                      {/* Animated Waveform Bars */}
                      <div className="flex items-end gap-[2px] h-3 shrink-0 mr-1">
                        <span className="w-[2px] bg-rose-500 rounded-full animate-pulse h-2" />
                        <span className="w-[2px] bg-rose-500 rounded-full animate-pulse h-3" />
                        <span className="w-[2px] bg-rose-500 rounded-full animate-pulse h-1.5" />
                        <span className="w-[2px] bg-rose-500 rounded-full animate-pulse h-2.5" />
                      </div>
                    </button>
                  </div>

                  {/* 4. 📑 رابعاً: الخدمات الطلابية والخطط الدراسية */}
                  <a
                    href="https://portal.aqeeq.app/pages/daily_plans/parent_lookup.php"
                    target="_blank"
                    rel="noreferrer"
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition ${
                      dark ? "bg-amber-400/10 border-amber-400/20 text-amber-300 hover:bg-amber-400/20" : "bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <FileText size={14} />
                      <span>الخطط الدراسية الأسبوعية للطلاب (متابعة ولي الأمر)</span>
                    </span>
                    <ExternalLink size={12} className="opacity-60" />
                  </a>

                  {/* 5. 👑 خامساً: أجنحة المشرف وإدارة المحتوى والمحرر البصري (Admin Suite) */}
                  <div className={`p-3 rounded-2xl border space-y-2 ${
                    dark ? "bg-[#f8ca14]/[0.06] border-[#f8ca14]/30" : "bg-amber-50/80 border-amber-300/60 shadow-xs"
                  }`}>
                    <div className="flex items-center justify-between pb-1 border-b border-black/5 dark:border-white/5">
                      <span className="text-xs font-black text-[#f8ca14] dark:text-[#f8ca14] flex items-center gap-1.5">
                        <span>👑</span>
                        <span>أدوات المشرف العام والتحكم بالموقع</span>
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        {isAuthenticated ? (user?.name || "المشرف") : "متاح للمشرف"}
                      </span>
                    </div>

                    {/* زر المحرر البصري — Direct Visual Editor Toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        editor.toggleEditing();
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl border text-xs font-black transition cursor-pointer ${
                        editor.isEditing
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                          : dark
                          ? "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                          : "bg-white border-slate-200 hover:bg-slate-50 text-slate-800"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <PencilRuler size={14} className="text-[#f8ca14]" />
                        <span>{editor.isEditing ? "إنهاء التعديل البصري (نشط الآن)" : "تفعيل المحرر البصري للتعديل"}</span>
                      </span>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                        editor.isEditing ? "bg-emerald-500 text-white" : dark ? "bg-white/10 text-slate-400" : "bg-slate-200 text-slate-600"
                      }`}>
                        {editor.isEditing ? "ON" : "OFF"}
                      </span>
                    </button>

                    {/* زر الداشبورد والتحكم */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          go("/admin");
                        }}
                        className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black border transition cursor-pointer ${
                          dark
                            ? "border-white/10 bg-white/5 hover:bg-white/10 text-white"
                            : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800"
                        }`}
                      >
                        <LayoutDashboard size={14} className="text-blue-500" />
                        <span>لوحة الإدارة</span>
                      </button>

                      {/* زر النشر المباشر */}
                      <button
                        type="button"
                        onClick={() => {
                          if (isDeploying) return;
                          if (!window.confirm("🚀 هل تريد نشر التعديلات الحالية على الموقع المباشر الآن؟")) return;
                          setIsDeploying(true);
                          deployMutation.mutate();
                        }}
                        disabled={isDeploying}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black bg-[#f8ca14]/20 border border-[#f8ca14]/40 text-[#f8ca14] hover:bg-[#f8ca14] hover:text-black transition cursor-pointer"
                      >
                        <Rocket size={14} className={isDeploying ? "animate-spin" : ""} />
                        <span>نشر مباشر 🚀</span>
                      </button>
                    </div>
                  </div>

                  {/* 6. 📞 سادساً: قنوات التواصل المباشر وبوابة أولياء الأمور */}
                  <div className={`p-3.5 rounded-2xl border space-y-2.5 ${
                    dark ? "bg-white/[0.04] border-white/10" : "bg-white border-slate-200 shadow-xs"
                  }`}>
                    <div className="flex items-center justify-between text-xs font-black">
                      <span className={dark ? "text-white" : "text-slate-900"}>خدمات أولياء الأمور والتواصل</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">متاح 24/7</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={`tel:${cleanPhone}`}
                        className={`flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-black border transition ${
                          dark
                            ? "border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"
                            : "border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100"
                        }`}
                      >
                        <PhoneCall size={14} className={dark ? "text-[#f8ca14]" : "text-[#08467d]"} />
                        <span>اتصال فوري</span>
                      </a>
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-black bg-[#25D366] text-white shadow-xs hover:bg-[#20bd59] transition"
                      >
                        <MessageCircle size={14} />
                        <span>واتساب القبول</span>
                      </a>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-bold pt-1">
                      <span>المدينة المنورة — المملكة العربية السعودية</span>
                      <a href="mailto:info@alaqeeqholding.com" className="hover:underline">info@alaqeeqholding.com</a>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 🔍 Anchored Spotlight Search Cockpit — Drops down right under Search Island */}
          <AlaqeeqSpotlightSearch open={searchOpen} onOpenChange={setSearchOpen} dark={dark} />
        </div>
      </div>
    </header>
    </div>

    {/* Static Spacer in DOM so page content starts cleanly below fixed header */}
    <div className="h-[66px] sm:h-[108px] w-full shrink-0 pointer-events-none" aria-hidden="true" />

      {/* Global AI Face Recognition Modal */}
      <AqeeqFaceSearchModal open={faceSearchOpen} onOpenChange={setFaceSearchOpen} dark={dark} />
      <AqeeqCreatorStudioModal open={creatorModalOpen} onOpenChange={setCreatorModalOpen} />

    </div>
  );
}
