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
        <div className={`relative mx-auto max-w-[1380px] flex items-center justify-between transition-all duration-300 ease-out ${
          isScrolled
            ? "px-3 sm:px-6 pt-2.5 sm:pt-3.5 pointer-events-none"
            : "px-3.5 sm:px-6 md:px-8 h-[66px] sm:h-[78px] pointer-events-auto"
        }`}>
          {/* Logo with clean branding — On scroll: Twin Floating Right Island with Smoked Crystal & Ambient Aura */}
          <div className="relative shrink-0">
            {isScrolled && (
              <span
                className="pointer-events-none absolute -inset-1.5 rounded-full bg-gradient-to-r from-[#f8ca14]/25 via-amber-500/10 to-transparent blur-xl -z-10 animate-in fade-in duration-500"
                aria-hidden="true"
              />
            )}
            <div className={`transition-all duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] ${
              isScrolled
                ? "pointer-events-auto rounded-full border shadow-xl backdrop-blur-2xl backdrop-saturate-[180%] px-3 sm:px-4 py-1.5 flex items-center bg-white/45 dark:bg-[#060a12]/55 border-black/10 dark:border-white/20 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.85),0_10px_30px_-5px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.18),0_12px_30px_-5px_rgba(0,0,0,0.7)]"
                : "flex items-center gap-2.5 sm:gap-3 shrink-0"
            }`}>
              <button
                onClick={() => go("/")}
                aria-label={`العودة إلى ${title}`}
                data-visual-id="header-logo-container"
                data-visual-tag="button"
                data-visual-label="حاوية الشعار"
                className={`flex items-center transition-all duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:opacity-90 ${
                  isScrolled
                    ? "h-[28px] sm:h-[34px] max-w-[120px] sm:max-w-[170px]"
                    : "h-[44px] sm:h-[58px] w-auto max-w-[160px] sm:max-w-[220px]"
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

              {isNationalDay && !isScrolled && (
                <button
                  type="button"
                  onClick={() => triggerNationalCelebration()}
                  title="انقر لمشاركتنا بهجة الوطن 🇸🇦"
                  className={`hidden lg:inline-flex items-center gap-1.5 text-[11px] font-black px-3 py-1 rounded-full border shadow-sm transition hover:scale-105 active:scale-95 cursor-pointer ${
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

          {/* Center 9 Core Navigation Links (Desktop) — Liquid exit/enter animation on scroll */}
          <nav
            dir="rtl"
            className={`hidden lg:flex items-center gap-2.5 xl:gap-5 whitespace-nowrap text-[13px] font-bold font-['Tajawal',sans-serif] transition-all duration-400 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] ${
              isScrolled
                ? "opacity-0 -translate-y-3 pointer-events-none scale-95 max-h-0 overflow-hidden"
                : "opacity-100 translate-y-0 pointer-events-auto scale-100 max-h-16"
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
                } ${dark ? "text-[#f8ca14]/90 hover:text-[#f8ca14]" : "text-[#08467d] hover:text-[#08467d]/80"}`}
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
                } ${dark ? "text-[#f8ca14]/90 hover:text-[#f8ca14]" : "text-[#08467d] hover:text-[#08467d]/80"}`}
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
                data-visual-label="رابط ألبومات العقيق"
                className={`aq-studio-toplink ${currentActive === "albums" ? "aq-studio-toplink--active" : ""}`}
              >
                {navAlbumsText}
              </button>

              {/* 7. أثير */}
              <button
                onClick={() => go("/atheer")}
                data-visual-id="header-nav-podcast"
                data-visual-tag="text"
                data-visual-label="رابط بودكاست أثير"
                className={`aq-studio-toplink ${currentActive === "podcast" ? "aq-studio-toplink--active" : ""}`}
              >
                {navPodcastText}
              </button>

              {/* 8. المقالات */}
              <button
                onClick={() => go("/articles")}
                data-visual-id="header-nav-articles"
                data-visual-tag="text"
                data-visual-label="رابط مقالات العقيق"
                className={`aq-studio-toplink ${currentActive === "articles" ? "aq-studio-toplink--active" : ""}`}
              >
                {navArticlesText}
              </button>

              {/* 9. الأخبار */}
              <button
                onClick={() => go("/offers")}
                data-visual-id="header-nav-offers"
                data-visual-tag="text"
                data-visual-label="رابط الأخبار والعروض"
                className={`aq-studio-toplink ${currentActive === "showcase" ? "aq-studio-toplink--active" : ""}`}
              >
                {navOffersText}
              </button>
            </nav>

          {/* Left Action Buttons & Primary CTA */}
          {/* Left Action Buttons — On scroll: Twin Floating Left Island with Smoked Crystal & Ambient Aura */}
          <div className="relative shrink-0">
            {isScrolled && (
              <span
                className="pointer-events-none absolute -inset-1.5 rounded-full bg-gradient-to-l from-[#08467d]/30 via-blue-600/15 to-transparent blur-xl -z-10 animate-in fade-in duration-500"
                aria-hidden="true"
              />
            )}
            <div
              dir="ltr"
              className={`transition-all duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] ${
                isScrolled
                  ? "pointer-events-auto rounded-full border shadow-xl backdrop-blur-2xl backdrop-saturate-[180%] px-2 sm:px-2.5 py-1.5 flex items-center gap-1.5 sm:gap-2 bg-white/45 dark:bg-[#060a12]/55 border-black/10 dark:border-white/20 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.85),0_10px_30px_-5px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.18),0_12px_30px_-5px_rgba(0,0,0,0.7)] shrink-0"
                  : "flex items-center gap-2 sm:gap-2.5 shrink-0 pointer-events-auto"
              }`}
            >
            {/* Primary Executive CTA Button — Hidden on scroll */}
            {!isScrolled && (
              <Button
                onClick={() => go("/admissions#admission-form-section")}
                data-visual-id="header-cta-button"
                data-visual-tag="button"
                data-visual-label="زر القبول والتسجيل (الهيدر)"
                className={`hidden sm:inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black shadow-md transition active:scale-95 ${
                  dark
                    ? "bg-gradient-to-r from-[#f8ca14] to-amber-500 text-black hover:opacity-95 shadow-[#f8ca14]/20"
                    : "bg-gradient-to-r from-[#08467d] to-[#042442] text-white hover:opacity-95 shadow-[#08467d]/25"
                }`}
              >
                <span>{ctaButtonText}</span>
              </Button>
            )}

            {/* Options Dropdown Menu OR Login Button (Desktop) — Hidden on scroll */}
            {!isScrolled && isAuthenticated ? (
              <div ref={optionsRef} className="hidden sm:block relative">
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

                    {/* Admin Only Actions */}
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

                    {/* Auth Logout */}
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
            ) : null}

            {/* Deploy to Live — للمشرف فقط — Hidden on scroll */}
            {!isScrolled && isAdmin && isLocalhost ? (
              <button
                onClick={() => {
                  if (isDeploying) return;
                  if (!window.confirm("🚀 هل تريد نشر التعديلات الحالية على الموقع المباشر الآن؟")) return;
                  setIsDeploying(true);
                  deployMutation.mutate();
                }}
                disabled={isDeploying}
                className={`hidden sm:grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl border transition active:scale-95 shadow-lg ${
                  isDeploying
                    ? "border-[#f8ca14]/40 bg-[#f8ca14]/10 text-[#f8ca14] cursor-wait opacity-70"
                    : "border-[#f8ca14]/50 bg-[#f8ca14]/10 text-[#f8ca14] hover:bg-[#f8ca14] hover:text-black hover:border-[#f8ca14] hover:shadow-[#f8ca14]/20"
                }`}
                title="نشر التعديلات على الموقع المباشر 🚀"
              >
                <Rocket size={16} className={isDeploying ? "animate-spin" : ""} />
              </button>
            ) : null}

            {/* Spotlight Search Trigger — Hidden on scroll */}
            {!isScrolled && (
              <button
                onClick={() => setSearchOpen(true)}
                data-visual-id="header-icon-search"
                data-visual-tag="icon"
                data-visual-label="زر البحث الشامل"
                className={`grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl border transition active:scale-95 ${
                  dark
                    ? "border-[#f8ca14]/30 bg-[#f8ca14]/[0.08] text-[#f8ca14] hover:bg-[#f8ca14] hover:text-black"
                    : "border-[#08467d]/20 bg-[#08467d]/[0.08] text-[#08467d] hover:bg-[#08467d] hover:text-white"
                }`}
                title="البحث الشامل (Ctrl+K)"
                aria-label="البحث الشامل"
              >
                <Search size={16} />
              </button>
            )}

            {/* ☀️ / 🌙 زر الإضاءة (Theme Toggle) — Always visible, compact on scroll */}
            <button
              onClick={toggleTheme}
              className={`grid ${isScrolled ? "h-8 w-8 sm:h-8.5 sm:w-8.5" : "h-9 w-9 sm:h-10 sm:w-10"} place-items-center rounded-xl border transition-all duration-200 active:scale-95 ${
                dark
                  ? "border-[#f8ca14]/30 bg-[#f8ca14]/[0.08] text-[#f8ca14] hover:bg-[#f8ca14] hover:text-black"
                  : "border-[#08467d]/20 bg-[#08467d]/[0.08] text-[#08467d] hover:bg-[#08467d] hover:text-white"
              }`}
              title={dark ? "تفعيل الوضع الفاتح (White Mode)" : "تفعيل الوضع الداكن (Black Mode)"}
            >
              <VisualIcon id="aqeeq-studio-theme-icon" label="أيقونة مبدّل المظهر" icon={dark ? "sun" : "moon"} size={16} />
            </button>

            {/* ☰ الثلاث شُرط (Hamburger Menu Button) — Visible on ALL screens when isScrolled */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen((open) => !open);
              }}
              className={`group grid ${isScrolled ? "h-8 w-8 sm:h-8.5 sm:w-8.5 flex" : "h-9 w-9 sm:h-10 sm:w-10 lg:hidden"} place-items-center rounded-xl border transition-all duration-200 active:scale-90 cursor-pointer ${
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

          {/* ── Contextual Anchored Bento Popover (Directly Below the Button) ── */}
          {mobileMenuOpen && (
            <>
              {/* Dimming Backdrop */}
              <div
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 z-[140] bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
                aria-label="إغلاق القائمة"
              />

              {/* The Floating Bento Cockpit Popover — Attached directly below the Left Island */}
              <div
                dir="rtl"
                className={`absolute top-full mt-2.5 left-0 z-[150] w-[min(430px,calc(100vw-24px))] max-h-[82vh] flex flex-col rounded-[2rem] border shadow-2xl backdrop-blur-2xl backdrop-saturate-[180%] overflow-hidden animate-in zoom-in-95 fade-in slide-in-from-top-3 duration-250 ease-out origin-top-left pointer-events-auto ${
                  dark
                    ? "bg-[#070c14]/92 text-white border-white/15 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),inset_0_1px_1.5px_rgba(255,255,255,0.12)]"
                    : "bg-white/88 text-slate-900 border-black/10 shadow-[0_25px_60px_-15px_rgba(8,70,125,0.2),inset_0_1px_1.5px_rgba(255,255,255,0.85)]"
                }`}
              >
                {/* Bento Cockpit Header with Brand & Close Button */}
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
                        المدينة المنورة ✦ 1446-1447هـ
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

                {/* Living Bento Grid Scroll Area */}
                <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-5 py-4 space-y-3.5 pb-8 scrollbar-hide">
                  
                  {/* 1. 🏛️ أولاً: خارطة المدارس والتنقل الأساسي (Primary Navigation First) */}
                  <div className={`rounded-2xl border p-3.5 space-y-2.5 ${
                    dark ? "bg-white/[0.03] border-white/10" : "bg-slate-50/90 border-slate-200/80 shadow-sm"
                  }`}>
                    <div className="flex items-center justify-between pb-1 border-b border-black/5 dark:border-white/5">
                      <span className={`text-[11px] font-black ${dark ? "text-[#f8ca14]" : "text-[#08467d]"} flex items-center gap-1.5`}>
                        <span>🏛️</span>
                        <span>خارطة صروح ومسارات العقيق</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold">تصفح سريع</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => go("/")}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-right transition cursor-pointer ${
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
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-right transition cursor-pointer ${
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
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-right transition cursor-pointer ${
                          currentActive === "accreditations"
                            ? dark ? "bg-[#f8ca14]/15 border-[#f8ca14]/40 text-[#f8ca14]" : "bg-[#08467d]/10 border-[#08467d]/30 text-[#08467d]"
                            : dark ? "border-white/10 bg-white/5 hover:bg-white/10 text-white" : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-xs"
                        }`}
                      >
                        <span className="text-base">🏆</span>
                        <div>
                          <div className="text-[11px] font-black leading-tight">الاعتمادات الدولية</div>
                          <div className="text-[9px] text-slate-500 dark:text-slate-400">Cognia و IELTS</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => go("/articles")}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-right transition cursor-pointer ${
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
                    </div>

                    <button
                      type="button"
                      onClick={() => go("/offers")}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                        currentActive === "showcase"
                          ? dark ? "bg-[#f8ca14]/15 text-[#f8ca14]" : "bg-[#08467d]/10 text-[#08467d]"
                          : dark ? "bg-white/5 hover:bg-white/10 text-slate-200" : "bg-white hover:bg-slate-50 text-slate-700 shadow-xs"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>📰</span>
                        <span>الأخبار والإعلانات المدرسية والعروض</span>
                      </span>
                      <ArrowLeft size={12} className="opacity-60" />
                    </button>
                  </div>

                  {/* 2. 🎓 ثانياً: البطاقة الملكية للقبول والتسجيل (Flagship Admissions Hero) */}
                  <div className={`relative overflow-hidden rounded-2xl p-4 transition duration-300 hover:scale-[1.01] border ${
                    dark
                      ? "bg-gradient-to-br from-[#08467d]/90 via-[#042442] to-[#021424] border-[#f8ca14]/30 text-white shadow-[0_12px_30px_rgba(8,70,125,0.4)]"
                      : "bg-gradient-to-br from-[#08467d] via-[#073661] to-[#042442] border-[#f8ca14]/40 text-white shadow-[0_12px_30px_rgba(8,70,125,0.25)]"
                  }`}>
                    <div className="relative z-10 flex items-start justify-between">
                      <div>
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-[#f8ca14] text-slate-950 mb-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
                          <span>القبول والتسجيل متاح الآن</span>
                        </span>
                        <h3 className="text-sm font-black tracking-tight leading-snug">
                          احجز مقعد ابنك للعام الجديد
                        </h3>
                        <p className="text-[11px] text-white/80 mt-0.5 font-medium">
                          تعليم أهلي ودولي معتمد بمناهج عالمية
                        </p>
                      </div>
                      <GraduationCap className="text-[#f8ca14] opacity-80 shrink-0" size={28} />
                    </div>

                    <div className="relative z-10 mt-3.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => go("/admissions#admission-form-section")}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black bg-[#f8ca14] hover:bg-amber-400 text-slate-950 shadow-md transition active:scale-95 cursor-pointer"
                      >
                        <span>سجّل الآن فوري</span>
                        <ArrowLeft size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => go("/admissions")}
                        className="px-3 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 border border-white/20 text-white transition cursor-pointer"
                      >
                        جدول الرسوم
                      </button>
                    </div>
                  </div>

                  {/* 3. 🎙️ & 📖 ثالثاً: المركز الإعلامي والثقافي (Media & Culture) */}
                  {/* ويدجت البودكاست الحي (أثير العقيق) */}
                  <div
                    onClick={() => go("/atheer")}
                    className={`group cursor-pointer rounded-2xl p-3.5 border transition-all duration-300 hover:scale-[1.01] ${
                      dark
                        ? "bg-white/[0.04] hover:bg-white/[0.08] border-white/10"
                        : "bg-white/80 hover:bg-white border-black/[0.08] shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl grid place-items-center bg-gradient-to-tr from-[#de191e] to-rose-500 text-white shadow-md group-hover:scale-105 transition">
                          <Mic size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900 dark:text-white group-hover:text-[#de191e] transition">
                              أثير العقيق 🎙️
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold">
                              بودكاست حي
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium line-clamp-1">
                            حوارات ملهمة وقصص إبداعية من صميم المدارس
                          </p>
                        </div>
                      </div>

                      {/* Animated Waveform Bars */}
                      <div className="flex items-end gap-[2.5px] h-4">
                        <span className="w-[3px] bg-rose-500 rounded-full animate-pulse h-3" />
                        <span className="w-[3px] bg-rose-500 rounded-full animate-pulse h-4" />
                        <span className="w-[3px] bg-rose-500 rounded-full animate-pulse h-2" />
                        <span className="w-[3px] bg-rose-500 rounded-full animate-pulse h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* ثنائي المجلة والألبومات */}
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => go("/journal")}
                      className={`group cursor-pointer rounded-2xl p-3 border transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between min-h-[100px] ${
                        dark
                          ? "bg-white/[0.04] hover:bg-white/[0.08] border-white/10"
                          : "bg-white/80 hover:bg-white border-black/[0.08] shadow-sm"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="h-8 w-8 rounded-lg grid place-items-center bg-gradient-to-tr from-[#f8ca14] to-amber-500 text-slate-950 font-black shadow-sm">
                          <BookOpen size={16} />
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold group-hover:translate-x-[-2px] transition">
                          ←
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-[#08467d] dark:group-hover:text-[#f8ca14] transition">
                          مجلة العقيق
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium line-clamp-1 mt-0.5">
                          الأعداد الدورية الرقمية
                        </p>
                      </div>
                    </div>

                    <div
                      onClick={() => go("/albums")}
                      className={`group cursor-pointer rounded-2xl p-3 border transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between min-h-[100px] ${
                        dark
                          ? "bg-white/[0.04] hover:bg-white/[0.08] border-white/10"
                          : "bg-white/80 hover:bg-white border-black/[0.08] shadow-sm"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="h-8 w-8 rounded-lg grid place-items-center bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-black shadow-sm">
                          <Camera size={16} />
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold group-hover:translate-x-[-2px] transition">
                          ←
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-[#08467d] dark:group-hover:text-[#f8ca14] transition">
                          ألبومات الأنشطة
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium line-clamp-1 mt-0.5">
                          معرض الصور والفعاليات
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 4. 📞 رابعاً: قنوات التواصل المباشر وبوابة أولياء الأمور */}
                  <div className={`p-3.5 rounded-2xl border space-y-2.5 ${
                    dark ? "bg-white/[0.04] border-white/10" : "bg-white border-slate-200 shadow-sm"
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
                        className="flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-black bg-[#25D366] text-white shadow-sm hover:bg-[#20bd59] transition"
                      >
                        <MessageCircle size={14} />
                        <span>واتساب القبول</span>
                      </a>
                    </div>

                    <a
                      href="https://portal.aqeeq.app/pages/daily_plans/parent_lookup.php"
                      target="_blank"
                      rel="noreferrer"
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-[11px] font-bold transition ${
                        dark ? "bg-amber-400/10 text-amber-300 hover:bg-amber-400/20" : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <FileText size={13} />
                        <span>الخطط الدراسية الأسبوعية للطلاب</span>
                      </span>
                      <ExternalLink size={12} className="opacity-60" />
                    </a>

                    {/* Admin Quick Entry if logged in */}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => go("/admin")}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold bg-[#f8ca14]/15 text-[#f8ca14] border border-[#f8ca14]/30 hover:bg-[#f8ca14]/25 transition cursor-pointer"
                      >
                        <LayoutDashboard size={13} />
                        <span>لوحة تحكم الإدارة</span>
                      </button>
                    )}
                  </div>
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
