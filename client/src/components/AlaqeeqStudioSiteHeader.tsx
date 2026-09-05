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
  const isAdmin = isAuthenticated && user?.role === "admin";
  const isLocalhost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
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

                {/* Options Dropdown Menu OR Login Button */}
                {isAuthenticated && (
                  <div ref={optionsRef} className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => { setOptionsOpen((prev) => !prev); setPortalsOpen(false); }}
                      className={`grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl border transition active:scale-95 cursor-pointer ${
                        dark
                          ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                          : "border-black/10 bg-black/5 text-slate-700 hover:bg-black/10"
                      }`}
                      aria-label="قائمة الخيارات"
                      title="قائمة الخيارات"
                    >
                      <Settings2 size={16} />
                    </button>

                    {optionsOpen && (
                      <div
                        dir="rtl"
                        className={`absolute left-0 top-full mt-2 w-56 rounded-2xl border shadow-2xl backdrop-blur-xl z-50 p-1.5 ${
                          dark ? "bg-[#0c0c0c]/95 border-white/10 text-white" : "bg-white/95 border-slate-200 text-slate-900 shadow-2xl"
                        }`}
                      >
                        <div className="font-black text-xs text-center py-2 text-slate-500 dark:text-slate-400">
                          {user?.name || "المشرف العام"}
                        </div>
                        <div className={`h-px my-1 ${dark ? "bg-white/10" : "bg-slate-200"}`} />

                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              onClick={() => { setOptionsOpen(false); editor.toggleEditing(); }}
                              className={`w-full flex items-center gap-3 py-2.5 px-3 cursor-pointer font-bold text-xs ${
                                dark ? "hover:bg-white/5 text-white" : "hover:bg-slate-100 text-slate-800"
                              } rounded-xl mb-1 text-right transition`}
                            >
                              <PencilRuler size={15} className="text-[#f8ca14] shrink-0" />
                              <span>{editor.isEditing ? "إنهاء التعديل البصري" : "تفعيل المحرر البصري"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => { setOptionsOpen(false); navigate("/admin"); }}
                              className={`w-full flex items-center gap-3 py-2.5 px-3 cursor-pointer font-bold text-xs ${
                                dark ? "hover:bg-white/5 text-white" : "hover:bg-slate-100 text-slate-800"
                              } rounded-xl mb-1 text-right transition`}
                            >
                              <LayoutDashboard size={15} className="text-blue-500 shrink-0" />
                              <span>لوحة التحكم للإدارة</span>
                            </button>
                          </>
                        )}

                        <div className={`h-px my-1 ${dark ? "bg-white/10" : "bg-black/10"}`} />

                        <button
                          type="button"
                          onClick={() => { setOptionsOpen(false); handleAuth(); }}
                          className={`w-full flex items-center gap-3 py-2.5 px-3 cursor-pointer font-bold text-xs ${
                            dark ? "hover:bg-[#de191e]/20 text-[#de191e]" : "hover:bg-[#de191e]/10 text-[#de191e]"
                          } rounded-xl text-right transition`}
                        >
                          <LogOut size={15} className="shrink-0" />
                          <span>تسجيل الخروج</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Deploy to Live — للمشرف فقط */}
                {isAdmin && isLocalhost && (
                  <button
                    onClick={() => {
                      if (isDeploying) return;
                      if (!window.confirm("🚀 هل تريد نشر التعديلات الحالية على الموقع المباشر الآن؟")) return;
                      setIsDeploying(true);
                      deployMutation.mutate();
                    }}
                    disabled={isDeploying}
                    className={`shrink-0 grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl border transition active:scale-95 shadow-lg ${
                      isDeploying
                        ? "border-[#f8ca14]/40 bg-[#f8ca14]/10 text-[#f8ca14] cursor-wait opacity-70"
                        : "border-[#f8ca14]/50 bg-[#f8ca14]/10 text-[#f8ca14] hover:bg-[#f8ca14] hover:text-black hover:border-[#f8ca14] hover:shadow-[#f8ca14]/20"
                    }`}
                    title="نشر التعديلات على الموقع المباشر 🚀"
                  >
                    <Rocket size={16} className={isDeploying ? "animate-spin" : ""} />
                  </button>
                )}

                {/* Spotlight Search Trigger */}
                <button
                  onClick={() => setSearchOpen(true)}
                  data-visual-id="header-icon-search"
                  data-visual-tag="icon"
                  data-visual-label="زر البحث الشامل"
                  className={`shrink-0 grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl border transition active:scale-95 ${
                    dark
                      ? "border-[#f8ca14]/30 bg-[#f8ca14]/[0.08] text-[#f8ca14] hover:bg-[#f8ca14] hover:text-black"
                      : "border-[#08467d]/20 bg-[#08467d]/[0.08] text-[#08467d] hover:bg-[#08467d] hover:text-white"
                  }`}
                  title="البحث الشامل (Ctrl+K)"
                  aria-label="البحث الشامل"
                >
                  <Search size={16} />
                </button>
              </div>

              {/* ☀️ / 🌙 زر الإضاءة (Theme Toggle) — Always visible, silky smooth */}
              <button
                onClick={toggleTheme}
                className={`grid shrink-0 ${isScrolled ? "h-8 w-8 sm:h-8.5 sm:w-8.5" : "h-9 w-9 sm:h-10 sm:w-10"} place-items-center rounded-xl border transition-all duration-300 active:scale-95 ${
                  dark
                    ? "border-[#f8ca14]/30 bg-[#f8ca14]/[0.08] text-[#f8ca14] hover:bg-[#f8ca14] hover:text-black"
                    : "border-[#08467d]/20 bg-[#08467d]/[0.08] text-[#08467d] hover:bg-[#08467d] hover:text-white"
                }`}
                title={dark ? "تفعيل الوضع الفاتح (White Mode)" : "تفعيل الوضع الداكن (Black Mode)"}
              >
                <VisualIcon id="aqeeq-studio-theme-icon" label="أيقونة مبدّل المظهر" icon={dark ? "sun" : "moon"} size={16} />
              </button>

              {/* ☰ الثلاث شُرط (Hamburger Menu Button) — Fluid entry on desktop without snap */}
              <div className={`transition-[max-width,opacity,transform] duration-300 ease-out overflow-hidden ${
                isScrolled
                  ? "max-w-[48px] opacity-100 scale-100 pointer-events-auto"
                  : "max-w-[48px] opacity-100 scale-100 lg:max-w-0 lg:opacity-0 lg:scale-90 lg:pointer-events-none"
              }`}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
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
            </div>

          {/* ── Dual-Pane Interactive Cockpit Popover ── */}
          {mobileMenuOpen && (
            <>
              {/* Invisible Click-Outside Dismiss Layer (Zero Blur, Site stays 100% visible & bright) */}
              <div
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 z-[140] bg-transparent cursor-default"
                aria-label="إغلاق القائمة"
              />

              {/* The Dual-Pane Cockpit Container — Anchored under Left Island */}
              <div
                dir="rtl"
                className={`absolute top-full mt-2.5 left-0 z-[150] w-[min(650px,calc(100vw-24px))] max-h-[85vh] flex flex-col rounded-[2rem] border shadow-2xl backdrop-blur-2xl backdrop-saturate-[180%] overflow-hidden animate-in zoom-in-95 fade-in slide-in-from-top-3 duration-250 ease-out origin-top-left pointer-events-auto ${
                  dark
                    ? "bg-[#070c14]/94 text-white border-white/15 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.08)]"
                    : "bg-white/94 text-slate-900 border-black/10 shadow-[0_25px_60px_-15px_rgba(8,70,125,0.25),0_0_0_1px_rgba(0,0,0,0.05)]"
                }`}
              >
                {/* 1. Cockpit Header with Logo, Search Trigger & Close */}
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
                        دليل الصروح والخدمات التعليمية ✦ 1446-1447هـ
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Quick Spotlight Search Trigger inside menu */}
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setSearchOpen(true);
                      }}
                      className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        dark
                          ? "border-white/10 bg-white/5 hover:bg-white/10 text-slate-300"
                          : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
                      }`}
                      title="البحث الشامل (Ctrl+K)"
                    >
                      <Search size={13} className={dark ? "text-[#f8ca14]" : "text-[#08467d]"} />
                      <span>بحث سريع</span>
                      <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono">⌘K</kbd>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMobileMenuOpen(false)}
                      className="grid h-8 w-8 place-items-center rounded-xl border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-[#de191e]/15 hover:text-[#de191e] hover:border-[#de191e]/30 active:scale-90 transition cursor-pointer"
                      aria-label="إغلاق القائمة"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* 2. Mobile Responsive Tab Bar (< sm screens) */}
                <div className="flex sm:hidden overflow-x-auto scrollbar-hide border-b border-black/[0.06] dark:border-white/10 p-2 gap-1.5 shrink-0 bg-black/[0.02] dark:bg-white/[0.02]">
                  {[
                    { id: "about" as const, label: "🏛️ الصروح" },
                    { id: "admissions" as const, label: "🎓 القبول والرسوم" },
                    { id: "media" as const, label: "🎨 الإعلام والمجلة" },
                    { id: "services" as const, label: "💻 البوابات والخطط" },
                    { id: "contact" as const, label: "📞 التواصل" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveMenuTab(tab.id)}
                      className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-black transition ${
                        activeMenuTab === tab.id
                          ? dark
                            ? "bg-[#f8ca14] text-slate-950 shadow-sm"
                            : "bg-[#08467d] text-white shadow-sm"
                          : dark
                          ? "bg-white/5 text-slate-300 hover:bg-white/10"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* 3. Dual-Pane Content Area */}
                <div className="flex-1 min-h-0 flex flex-col sm:grid sm:grid-cols-[210px_1fr] divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-black/[0.06] dark:divide-white/[0.08] overflow-hidden">
                  
                  {/* Right Column (Desktop Master Doors Navigation) */}
                  <div className="hidden sm:flex flex-col p-2.5 gap-1 overflow-y-auto scrollbar-hide bg-slate-50/60 dark:bg-white/[0.02]">
                    {[
                      {
                        id: "about" as const,
                        title: "صروح ومدارس العقيق",
                        subtitle: "الرؤية والفروع والاعتمادات",
                        icon: Building2,
                        badge: "٤ مسارات",
                      },
                      {
                        id: "admissions" as const,
                        title: "القبول والرسوم الدراسية",
                        subtitle: "حجز المقاعد والخصومات",
                        icon: GraduationCap,
                        badge: "متاح الآن",
                        badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                      },
                      {
                        id: "media" as const,
                        title: "المركز الإعلامي والمجلة",
                        subtitle: "البودكاست، الألبومات، المقالات",
                        icon: BookOpen,
                        badge: "أثير والمجلة",
                      },
                      {
                        id: "services" as const,
                        title: "بوابات الطلاب والخدمات",
                        subtitle: "الخطط الأسبوعية والتوظيف",
                        icon: Server,
                        badge: "خدمات ذكية",
                      },
                      {
                        id: "contact" as const,
                        title: "التواصل الفوري والموقع",
                        subtitle: "الهاتف والواتساب واللوكيشن",
                        icon: PhoneCall,
                        badge: "24/7",
                      },
                    ].map((door) => {
                      const Icon = door.icon;
                      const isActive = activeMenuTab === door.id;
                      return (
                        <button
                          key={door.id}
                          type="button"
                          onMouseEnter={() => setActiveMenuTab(door.id)}
                          onClick={() => setActiveMenuTab(door.id)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-right transition-all cursor-pointer ${
                            isActive
                              ? dark
                                ? "bg-[#f8ca14]/15 text-[#f8ca14] border border-[#f8ca14]/40 shadow-sm"
                                : "bg-[#08467d]/10 text-[#08467d] border border-[#08467d]/25 shadow-sm"
                              : dark
                              ? "text-slate-300 hover:bg-white/5 border border-transparent"
                              : "text-slate-700 hover:bg-white border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`h-8 w-8 rounded-xl grid place-items-center shrink-0 transition ${
                              isActive
                                ? dark
                                  ? "bg-[#f8ca14] text-slate-950 font-black shadow-xs"
                                  : "bg-[#08467d] text-white shadow-xs"
                                : dark
                                ? "bg-white/5 text-slate-400"
                                : "bg-slate-200/60 text-slate-600"
                            }`}>
                              <Icon size={16} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-black leading-tight truncate">{door.title}</div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{door.subtitle}</div>
                            </div>
                          </div>
                          {door.badge && (
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0 ${
                              door.badgeClass || (dark ? "bg-white/10 text-slate-300" : "bg-slate-200 text-slate-700")
                            }`}>
                              {door.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Left Column (Dynamic Interactive Content & Curated Links) */}
                  <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto scrollbar-hide space-y-3">
                    
                    {/* Tab 1: About & Campuses */}
                    {activeMenuTab === "about" && (
                      <div className="space-y-3 animate-in fade-in duration-200">
                        <div className={`p-3 rounded-2xl border ${
                          dark ? "bg-white/[0.03] border-white/10" : "bg-slate-50 border-slate-200 shadow-xs"
                        }`}>
                          <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Building2 size={15} className={dark ? "text-[#f8ca14]" : "text-[#08467d]"} />
                            <span>صروح مدارس العقيق الأهلية والدولية</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            بيئة تعليمية رائدة بالمدينة المنورة تجمع بين أصالة القيم والمعايير العالمية لصناعة قادة الغد.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {[
                            { title: "الصفحة الرئيسية", desc: "بوابة المدارس وصناع المستقبل", href: "/", icon: "🏠" },
                            { title: "عن مدارس العقيق", desc: "الرؤية والرسالة والتاريخ", href: "/about", icon: "🏛️" },
                            { title: "الاعتمادات الدولية", desc: "اعتماد Cognia وضمان الجودة", href: "/accreditations", icon: "🏆" },
                            { title: "الفروع والمراحل", desc: "بنين، بنات، دولي، أهلي، وروضة", href: "/about#campuses", icon: "🏫" },
                          ].map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => go(item.href)}
                              className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-right transition cursor-pointer ${
                                dark
                                  ? "border-white/10 bg-white/5 hover:bg-white/10 text-white"
                                  : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-xs"
                              }`}
                            >
                              <span className="text-base shrink-0 mt-0.5">{item.icon}</span>
                              <div className="min-w-0">
                                <div className="text-xs font-black leading-tight text-slate-900 dark:text-white">{item.title}</div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{item.desc}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tab 2: Admissions & Tuition */}
                    {activeMenuTab === "admissions" && (
                      <div className="space-y-3 animate-in fade-in duration-200">
                        {/* Admissions Hero Flagship Card */}
                        <div className={`p-3.5 rounded-2xl border relative overflow-hidden ${
                          dark
                            ? "bg-gradient-to-br from-[#08467d]/90 via-[#042442] to-[#021424] border-[#f8ca14]/30 text-white shadow-md"
                            : "bg-gradient-to-br from-[#08467d] via-[#073661] to-[#042442] border-[#f8ca14]/40 text-white shadow-md"
                        }`}>
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black bg-[#f8ca14] text-slate-950 mb-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
                                <span>القبول والتسجيل متاح الآن</span>
                              </span>
                              <h4 className="text-sm font-black leading-tight">احجز مقعد ابنك للعام الجديد</h4>
                              <p className="text-[10px] text-white/80 mt-0.5">تعليم أهلي ودولي بمعايير عالمية</p>
                            </div>
                            <GraduationCap className="text-[#f8ca14] opacity-90 shrink-0" size={24} />
                          </div>

                          <div className="mt-3 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => go("/admissions#admission-form-section")}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black bg-[#f8ca14] hover:bg-amber-400 text-slate-950 shadow-sm transition active:scale-95 cursor-pointer"
                            >
                              <span>سجّل الآن فوري</span>
                              <ArrowLeft size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => go("/admissions#fees-table")}
                              className="px-3 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 border border-white/20 text-white transition cursor-pointer"
                            >
                              جدول الرسوم
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {[
                            { title: "جدول الرسوم المعتمد", desc: "كشف رسوم جميع المراحل", href: "/admissions#fees-table", icon: "💳" },
                            { title: "حاسبة الأقساط والخصومات", desc: "خصم الأشقاء وتسهيلات السداد", href: "/admissions#fees-calculator", icon: "🧮" },
                            { title: "شروط وسياسة القبول", desc: "المستندات وإجراءات المقابلة", href: "/admissions#requirements", icon: "📄" },
                            { title: "استفسارات القبول المباشرة", desc: "تواصل مع شؤون الطلاب", href: `tel:${cleanPhone}`, icon: "📞" },
                          ].map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => go(item.href)}
                              className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-right transition cursor-pointer ${
                                dark
                                  ? "border-white/10 bg-white/5 hover:bg-white/10 text-white"
                                  : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-xs"
                              }`}
                            >
                              <span className="text-base shrink-0 mt-0.5">{item.icon}</span>
                              <div className="min-w-0">
                                <div className="text-xs font-black leading-tight text-slate-900 dark:text-white">{item.title}</div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{item.desc}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tab 3: Media & Culture Hub */}
                    {activeMenuTab === "media" && (
                      <div className="space-y-3 animate-in fade-in duration-200">
                        {/* Podcast Mini Banner */}
                        <div
                          onClick={() => go("/podcast")}
                          className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition hover:scale-[1.01] ${
                            dark ? "bg-white/[0.04] border-white/10" : "bg-slate-50 border-slate-200 shadow-xs"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-xl grid place-items-center bg-gradient-to-tr from-[#de191e] to-rose-500 text-white shadow-xs">
                              <Mic size={16} />
                            </div>
                            <div>
                              <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span>أثير العقيق 🎙️</span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-500 font-bold">حي ومحدث</span>
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">بودكاست المدارس وحوارات ملهمة</p>
                            </div>
                          </div>
                          <ArrowLeft size={13} className="text-slate-400" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {[
                            { title: "مجلة العقيق الدورية", desc: "الإصدارات الرقمية التفاعلية", href: "/journal", icon: "📖" },
                            { title: "أرشيف أعداد المجلة", desc: "تصفح أعداد الأعوام السابقة", href: "/journal/archive", icon: "📚" },
                            { title: "ألبومات الفعاليات", desc: "معارض الصور والأنشطة", href: "/albums", icon: "📸" },
                            { title: "مقالات وأقلام العقيق", desc: "كتابات تربوية وثقافية", href: "/articles", icon: "✍️" },
                            { title: "الأخبار والعروض", desc: "مستجدات وإعلانات المدارس", href: "/showcase", icon: "📰" },
                            { title: "أثير البودكاست", desc: "استمع لكافة الحلقات", href: "/podcast", icon: "🎙️" },
                          ].map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => go(item.href)}
                              className={`flex items-start gap-2.5 p-2 rounded-xl border text-right transition cursor-pointer ${
                                dark
                                  ? "border-white/10 bg-white/5 hover:bg-white/10 text-white"
                                  : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-xs"
                              }`}
                            >
                              <span className="text-base shrink-0 mt-0.5">{item.icon}</span>
                              <div className="min-w-0">
                                <div className="text-xs font-black leading-tight text-slate-900 dark:text-white">{item.title}</div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{item.desc}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tab 4: Portals & Student Services */}
                    {activeMenuTab === "services" && (
                      <div className="space-y-3 animate-in fade-in duration-200">
                        <div className={`p-3 rounded-2xl border ${
                          dark ? "bg-white/[0.03] border-white/10" : "bg-slate-50 border-slate-200 shadow-xs"
                        }`}>
                          <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Server size={15} className={dark ? "text-[#f8ca14]" : "text-[#08467d]"} />
                            <span>بوابات الأنظمة والخدمات الإلكترونية</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            روابط مباشرة للأنظمة المدرسية، الخطط الدراسية، وبوابات أولياء الأمور والتوظيف.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                          <a
                            href="https://portal.aqeeq.app/pages/daily_plans/parent_lookup.php"
                            target="_blank"
                            rel="noreferrer"
                            className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                              dark ? "bg-amber-400/10 border-amber-400/20 text-amber-300 hover:bg-amber-400/20" : "bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100"
                            }`}
                          >
                            <span className="flex items-center gap-2 text-xs font-black">
                              <FileText size={15} />
                              <span>الخطط الدراسية الأسبوعية للطلاب</span>
                            </span>
                            <ExternalLink size={13} className="opacity-60" />
                          </a>

                          <a
                            href="https://live.aqeeq.edu.sa/jobs"
                            target="_blank"
                            rel="noreferrer"
                            className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                              dark ? "border-white/10 bg-white/5 hover:bg-white/10 text-white" : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-xs"
                            }`}
                          >
                            <span className="flex items-center gap-2 text-xs font-black">
                              <Briefcase size={15} className={dark ? "text-[#f8ca14]" : "text-[#08467d]"} />
                              <span>بوابة التوظيف واستقطاب الكفاءات</span>
                            </span>
                            <ExternalLink size={13} className="opacity-60" />
                          </a>

                          <button
                            type="button"
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setSearchOpen(true);
                            }}
                            className={`flex items-center justify-between p-2.5 rounded-xl border text-right transition cursor-pointer ${
                              dark ? "border-white/10 bg-white/5 hover:bg-white/10 text-white" : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-xs"
                            }`}
                          >
                            <span className="flex items-center gap-2 text-xs font-black">
                              <Search size={15} className={dark ? "text-[#f8ca14]" : "text-[#08467d]"} />
                              <span>البحث الشامل في الموقع والمحتوى</span>
                            </span>
                            <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono">⌘K</kbd>
                          </button>

                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => go("/admin")}
                              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-[#f8ca14]/15 text-[#f8ca14] border border-[#f8ca14]/30 hover:bg-[#f8ca14]/25 transition cursor-pointer"
                            >
                              <LayoutDashboard size={14} />
                              <span>لوحة تحكم الإدارة والأوركسترا</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tab 5: Direct Connect & Location */}
                    {activeMenuTab === "contact" && (
                      <div className="space-y-3 animate-in fade-in duration-200">
                        <div className={`p-3 rounded-2xl border ${
                          dark ? "bg-white/[0.03] border-white/10" : "bg-slate-50 border-slate-200 shadow-xs"
                        }`}>
                          <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                            <PhoneCall size={15} className={dark ? "text-[#f8ca14]" : "text-[#08467d]"} />
                            <span>قنوات التواصل المباشر وخدمة المستفيدين</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            يسعدنا استقبال استفساراتكم والتواصل معكم عبر القنوات الرسمية طوال أيام الأسبوع.
                          </p>
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

                        <div className="space-y-1.5 text-[11px]">
                          <div className={`p-2 rounded-xl flex items-center gap-2 ${
                            dark ? "bg-white/5 text-slate-300" : "bg-slate-100 text-slate-700"
                          }`}>
                            <MapPin size={13} className="text-[#f8ca14] shrink-0" />
                            <span>المدينة المنورة — المملكة العربية السعودية</span>
                          </div>
                          <a
                            href="mailto:info@alaqeeqholding.com"
                            className={`p-2 rounded-xl flex items-center gap-2 transition ${
                              dark ? "bg-white/5 text-slate-300 hover:text-white" : "bg-slate-100 text-slate-700 hover:text-black"
                            }`}
                          >
                            <Mail size={13} className="text-blue-400 shrink-0" />
                            <span>info@alaqeeqholding.com</span>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Bottom Cockpit Quick Bar */}
                <div className="px-5 py-2.5 border-t border-black/[0.06] dark:border-white/10 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-bold bg-white/30 dark:bg-black/20 shrink-0">
                  <span>ساعات العمل: الأحد – الخميس (7:00 ص – 2:00 م)</span>
                  <span className="flex items-center gap-1 text-[#08467d] dark:text-[#f8ca14]">
                    <span>✦</span>
                    <span>مدارس العقيق — ريادة تعليمية</span>
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
    </div>

    {/* Static Spacer in DOM so page content starts cleanly below fixed header */}
    <div className="h-[66px] sm:h-[108px] w-full shrink-0 pointer-events-none" aria-hidden="true" />

      {/* Universal Spotlight Search Dialog */}
      <AlaqeeqSpotlightSearch open={searchOpen} onOpenChange={setSearchOpen} dark={dark} />

      {/* Global AI Face Recognition Modal */}
      <AqeeqFaceSearchModal open={faceSearchOpen} onOpenChange={setFaceSearchOpen} dark={dark} />
      <AqeeqCreatorStudioModal open={creatorModalOpen} onOpenChange={setCreatorModalOpen} />

    </div>
  );
}
