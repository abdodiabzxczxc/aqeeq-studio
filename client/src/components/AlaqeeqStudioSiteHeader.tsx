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
          setIsScrolled(window.scrollY > 40);
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
    <div dir="rtl" className={`aq-studio-share ${dark ? "aq-studio-share--dark" : "aq-studio-share--light"}`}>
      {/* ── Fixed Master Header Deck (Always follows user down on all pages) ── */}
      <div className="fixed top-0 inset-x-0 z-[130] w-full transition-all duration-300 ease-out">
        {/* 1. Top Executive Utility Bar */}
        <div className={`hidden sm:block relative z-[140] border-b text-[11px] font-bold transition-all duration-300 overflow-hidden ${
          isScrolled
            ? "max-h-0 py-0 opacity-0 border-transparent pointer-events-none"
            : "max-h-12 py-1.5 opacity-100"
        } ${
          dark ? "border-white/5 bg-[#0c1218]/95 text-slate-400" : "border-black/5 bg-slate-50/95 text-slate-600"
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

      {/* 2. Main Executive Header — Collapses to Wellington-Style Compact Luxury on Scroll */}
      <header className={`aq-studio-share-header w-full border-b backdrop-blur-2xl transition-all duration-300 ease-out ${
        isScrolled
          ? dark
            ? "border-white/[0.08] bg-[#060a10]/95 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
            : "border-black/[0.06] bg-white/95 shadow-[0_4px_20px_rgba(8,70,125,0.06)]"
          : isNationalDay
          ? dark ? "border-[#f8ca14]/20 bg-[#0c1218]/95" : "border-[#08467d]/15 bg-white/95"
          : dark ? "border-white/[0.08] bg-black/90" : "border-black/[0.06] bg-white/95"
      }`}>
        <div className={`relative mx-auto max-w-[1380px] px-3.5 sm:px-6 md:px-8 flex items-center justify-between transition-all duration-300 ease-out ${
          isScrolled ? "h-[50px] sm:h-[54px]" : "h-[66px] sm:h-[78px]"
        }`}>
          {/* Logo with clean branding — Pinned on the far right */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              onClick={() => go("/")}
              aria-label={`العودة إلى ${title}`}
              data-visual-id="header-logo-container"
              data-visual-tag="button"
              data-visual-label="حاوية الشعار"
              className={`flex items-center transition-all duration-300 hover:opacity-90 ${
                isScrolled
                  ? "h-[32px] sm:h-[38px] max-w-[130px] sm:max-w-[180px]"
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

          {/* Center 9 Core Navigation Links (Desktop) — Hidden on scroll */}
          {!isScrolled && (
            <nav dir="rtl" className="hidden lg:flex items-center gap-2.5 xl:gap-5 whitespace-nowrap text-[13px] font-bold font-['Tajawal',sans-serif] animate-in fade-in duration-200">
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
          )}



          {/* Left Action Buttons & Primary CTA */}
          {/* Left Action Buttons — On scroll: Compresses to Theme Toggle + 3 Lines Menu */}
          <div dir="ltr" className="flex items-center gap-2 sm:gap-2.5 shrink-0">
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
        </div>
      </header>
      </div>

      {/* Static Spacer in DOM so page content starts cleanly below fixed header */}
      <div className="h-[66px] sm:h-[108px] w-full shrink-0 pointer-events-none" aria-hidden="true" />

      {/* Full-Screen Immersive Menu Canvas (Mobile & Desktop) */}
      {mobileMenuOpen && (
        <div
          dir="rtl"
          className={`fixed inset-0 z-[150] animate-in fade-in duration-200 backdrop-blur-3xl overflow-hidden flex flex-col ${
            dark
              ? "bg-[#060a10]/98 text-white"
              : "bg-white/98 text-slate-900"
          }`}
        >
          {/* Header Bar inside Drawer to guarantee seamless header integration without overlap */}
          <div className="flex items-center justify-between px-3.5 sm:px-6 h-[66px] sm:h-[78px] border-b border-black/[0.08] dark:border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); navigate("/"); }}
                className="flex h-[44px] sm:h-[58px] w-auto max-w-[160px] sm:max-w-[220px] items-center"
              >
                <img
                  src={
                    isNationalDay
                      ? dark
                        ? "/alaqeeq-logo-national-dark.png"
                        : "/alaqeeq-logo-national-light.png"
                      : activeLogo
                  }
                  alt="شعار مدارس العقيق"
                  className={`max-h-full max-w-full object-contain ${
                    dark ? "brightness-0 invert opacity-95" : ""
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-xl border border-[#de191e]/50 bg-[#de191e]/15 text-[#de191e] active:scale-90 transition cursor-pointer"
                aria-label="إغلاق القائمة"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Inner Scroll Container with Safe Bottom Space */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 pt-3 pb-36 max-w-lg mx-auto w-full space-y-4 scrollbar-hide">

                {/* 1. Account / Admin Bar */}
                <div className={`flex items-center justify-between p-3.5 rounded-2xl border ${
                  dark ? "bg-white/[0.04] border-white/10" : "bg-slate-100/90 border-slate-200/80"
                }`}>
                  <div className="flex items-center gap-2.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${isAuthenticated ? "bg-[#f8ca14] animate-pulse shadow-[0_0_8px_rgba(248,202,20,0.7)]" : "bg-slate-400"}`} />
                    <div>
                      <span className={`text-xs font-black block leading-tight ${dark ? "text-white" : "text-slate-900"}`}>
                        {isAuthenticated ? (user?.name || "المشرف العام") : "مرحباً بك في مدارس العقيق"}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block leading-tight">
                        {isAuthenticated ? "جلسة المشرف نشطة" : "بوابة أولياء الأمور والزوار"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => go("/admin")}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black border shadow-sm transition active:scale-95 ${
                          dark
                            ? "border-[#f8ca14]/40 bg-[#f8ca14]/15 text-[#f8ca14]"
                            : "border-[#08467d]/30 bg-[#08467d]/10 text-[#08467d]"
                        }`}
                      >
                        <LayoutDashboard size={13} />
                        <span>لوحة التحكم</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => { setMobileMenuOpen(false); handleAuth(); }}
                      className={`rounded-xl px-3 py-1.5 text-xs font-black border transition active:scale-95 ${
                        dark
                          ? "border-white/15 bg-white/5 text-slate-300 hover:bg-white/10"
                          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
                      }`}
                    >
                      {isAuthenticated ? "خروج" : "دخول"}
                    </button>
                  </div>
                </div>

                {/* 2. Primary Action CTA Button */}
                <button
                  type="button"
                  onClick={() => go("/admissions#admission-form-section")}
                  className={`w-full flex items-center justify-center gap-2 rounded-2xl h-12 text-sm font-black shadow-lg transition active:scale-[.98] ${
                    dark
                      ? "bg-gradient-to-l from-[#f8ca14] via-amber-400 to-amber-500 text-slate-950 shadow-amber-400/20"
                      : "bg-gradient-to-l from-[#08467d] via-[#063560] to-[#042442] text-white shadow-[#08467d]/25"
                  }`}
                >
                  <Send size={16} />
                  <span>سجّل ابنك الآن في مدارس العقيق ✦</span>
                </button>

                {/* 3. Group 1: المسار الأكاديمي والمدارس */}
                <div>
                  <div className={`px-2 pb-1.5 text-[11px] font-black ${dark ? "text-[#f8ca14]" : "text-[#08467d]"} uppercase tracking-wider flex items-center gap-1.5`}>
                    <span>🏛️</span>
                    <span>مدارسنا والمسار التعليمي</span>
                  </div>
                  <div className={`rounded-2xl border overflow-hidden divide-y ${
                    dark
                      ? "bg-white/[0.03] border-white/10 divide-white/5"
                      : "bg-slate-50/90 border-slate-200 divide-slate-200/70 shadow-sm"
                  }`}>
                    <button
                      type="button"
                      onClick={() => go("/")}
                      className={`w-full flex items-center justify-between px-4 py-3.5 text-sm font-black transition ${
                        currentActive === "studio"
                          ? dark ? "bg-[#f8ca14]/15 text-[#f8ca14]" : "bg-[#08467d]/10 text-[#08467d]"
                          : dark ? "text-slate-100 hover:bg-white/5" : "text-slate-900 hover:bg-white"
                      }`}
                    >
                      <span>الصفحة الرئيسية</span>
                      {currentActive === "studio" && <span className={`text-[10px] px-2 py-0.5 rounded-full bg-[#f8ca14]/20 ${dark ? "text-[#f8ca14]" : "text-[#08467d]"} font-bold`}>الحالية</span>}
                    </button>

                    <button
                      type="button"
                      onClick={() => go("/about")}
                      className={`w-full flex items-center justify-between px-4 py-3.5 text-sm font-black transition ${
                        currentActive === "about"
                          ? dark ? "bg-[#f8ca14]/15 text-[#f8ca14]" : "bg-[#08467d]/10 text-[#08467d]"
                          : dark ? "text-slate-100 hover:bg-white/5" : "text-slate-900 hover:bg-white"
                      }`}
                    >
                      <span>عن مدارس العقيق الأهلية والدولية</span>
                      {currentActive === "about" && <span className={`text-[10px] px-2 py-0.5 rounded-full bg-[#f8ca14]/20 ${dark ? "text-[#f8ca14]" : "text-[#08467d]"} font-bold`}>الحالية</span>}
                    </button>

                    <button
                      type="button"
                      onClick={() => go("/accreditations")}
                      className={`w-full flex items-center justify-between px-4 py-3.5 text-sm font-black transition ${
                        currentActive === "accreditations"
                          ? dark ? "bg-[#f8ca14]/15 text-[#f8ca14]" : "bg-[#08467d]/10 text-[#08467d]"
                          : dark ? "text-slate-100 hover:bg-white/5" : "text-slate-900 hover:bg-white"
                      }`}
                    >
                      <span>الاعتمادات ومراكز الاختبارات (Cognia / IELTS)</span>
                      {currentActive === "accreditations" && <span className={`text-[10px] px-2 py-0.5 rounded-full bg-[#f8ca14]/20 ${dark ? "text-[#f8ca14]" : "text-[#08467d]"} font-bold`}>الحالية</span>}
                    </button>
                  </div>
                </div>

                {/* 4. Group 2: القبول والتسجيل وبوابة أولياء الأمور */}
                <div>
                  <div className={`px-2 pb-1.5 text-[11px] font-black ${dark ? "text-[#f8ca14]" : "text-[#08467d]"} uppercase tracking-wider flex items-center gap-1.5`}>
                    <span>🎓</span>
                    <span>القبول والتسجيل وخدمات أولياء الأمور</span>
                  </div>
                  <div className={`rounded-2xl border overflow-hidden divide-y ${
                    dark
                      ? "bg-white/[0.03] border-white/10 divide-white/5"
                      : "bg-slate-50/90 border-slate-200 divide-slate-200/70 shadow-sm"
                  }`}>
                    <button
                      type="button"
                      onClick={() => go("/admissions")}
                      className={`w-full flex items-center justify-between px-4 py-3.5 text-sm font-black transition ${
                        currentActive === "admissions"
                          ? dark ? "bg-[#f8ca14]/15 text-[#f8ca14]" : "bg-[#08467d]/10 text-[#08467d]"
                          : dark ? "text-slate-100 hover:bg-white/5" : "text-slate-900 hover:bg-white"
                      }`}
                    >
                      <span>جدول الرسوم الدراسية المعتمد</span>
                      {currentActive === "admissions" && <span className={`text-[10px] px-2 py-0.5 rounded-full bg-[#f8ca14]/20 ${dark ? "text-[#f8ca14]" : "text-[#08467d]"} font-bold`}>الحالية</span>}
                    </button>

                    <button
                      type="button"
                      onClick={() => go("/admissions#admission-form-section")}
                      className={`w-full flex items-center justify-between px-4 py-3.5 text-sm font-black transition ${
                        dark ? "text-slate-100 hover:bg-white/5" : "text-slate-900 hover:bg-white"
                      }`}
                    >
                      <span>نموذج حجز مقعد دراسي فوري</span>
                      <span className={`text-[10px] font-bold ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>متاح الآن</span>
                    </button>

                    <a
                      href="https://portal.aqeeq.app/pages/daily_plans/parent_lookup.php"
                      target="_blank"
                      rel="noreferrer"
                      className={`w-full flex items-center justify-between px-4 py-3.5 text-sm font-black transition ${
                        dark ? "text-amber-400 hover:bg-white/5" : "text-amber-700 hover:bg-white"
                      }`}
                    >
                      <span>الخطط الدراسية الأسبوعية</span>
                      <ExternalLink size={14} className="opacity-70" />
                    </a>

                    <a
                      href="https://qr-codes.io/LQMip0"
                      target="_blank"
                      rel="noreferrer"
                      className={`w-full flex items-center justify-between px-4 py-3.5 text-sm font-black transition ${
                        dark ? "text-slate-100 hover:bg-white/5" : "text-slate-900 hover:bg-white"
                      }`}
                    >
                      <span>تحميل تطبيق أولياء الأمور للجوال</span>
                      <ExternalLink size={14} className="opacity-70" />
                    </a>
                  </div>
                </div>

                {/* 5. Group 3: المركز الإعلامي والمحتوى */}
                <div>
                  <div className={`px-2 pb-1.5 text-[11px] font-black ${dark ? "text-[#f8ca14]" : "text-[#08467d]"} uppercase tracking-wider flex items-center gap-1.5`}>
                    <span>📰</span>
                    <span>المركز الإعلامي والمحتوى</span>
                  </div>
                  <div className={`rounded-2xl border overflow-hidden divide-y ${
                    dark
                      ? "bg-white/[0.03] border-white/10 divide-white/5"
                      : "bg-slate-50/90 border-slate-200 divide-slate-200/70 shadow-sm"
                  }`}>
                    <button
                      type="button"
                      onClick={() => go("/journal")}
                      className={`w-full flex items-center justify-between px-4 py-3.5 text-sm font-black transition ${
                        currentActive === "journal"
                          ? dark ? "bg-[#f8ca14]/15 text-[#f8ca14]" : "bg-[#08467d]/10 text-[#08467d]"
                          : dark ? "text-slate-100 hover:bg-white/5" : "text-slate-900 hover:bg-white"
                      }`}
                    >
                      <span>مجلة العقيق الدورية</span>
                      {currentActive === "journal" && <span className={`text-[10px] px-2 py-0.5 rounded-full bg-[#f8ca14]/20 ${dark ? "text-[#f8ca14]" : "text-[#08467d]"} font-bold`}>الحالية</span>}
                    </button>

                    <button
                      type="button"
                      onClick={() => go("/albums")}
                      className={`w-full flex items-center justify-between px-4 py-3.5 text-sm font-black transition ${
                        currentActive === "albums"
                          ? dark ? "bg-[#f8ca14]/15 text-[#f8ca14]" : "bg-[#08467d]/10 text-[#08467d]"
                          : dark ? "text-slate-100 hover:bg-white/5" : "text-slate-900 hover:bg-white"
                      }`}
                    >
                      <span>ألبومات الفعاليات والأنشطة</span>
                      {currentActive === "albums" && <span className={`text-[10px] px-2 py-0.5 rounded-full bg-[#f8ca14]/20 ${dark ? "text-[#f8ca14]" : "text-[#08467d]"} font-bold`}>الحالية</span>}
                    </button>

                    <button
                      type="button"
                      onClick={() => go("/atheer")}
                      className={`w-full flex items-center justify-between px-4 py-3.5 text-sm font-black transition ${
                        currentActive === "podcast"
                          ? dark ? "bg-[#f8ca14]/15 text-[#f8ca14]" : "bg-[#08467d]/10 text-[#08467d]"
                          : dark ? "text-slate-100 hover:bg-white/5" : "text-slate-900 hover:bg-white"
                      }`}
                    >
                      <span>أثير — الاستوديو الصوتي والبودكاست</span>
                      {currentActive === "podcast" && <span className={`text-[10px] px-2 py-0.5 rounded-full bg-[#f8ca14]/20 ${dark ? "text-[#f8ca14]" : "text-[#08467d]"} font-bold`}>الحالية</span>}
                    </button>

                    <button
                      type="button"
                      onClick={() => go("/offers")}
                      className={`w-full flex items-center justify-between px-4 py-3.5 text-sm font-black transition ${
                        currentActive === "showcase"
                          ? dark ? "bg-[#f8ca14]/15 text-[#f8ca14]" : "bg-[#08467d]/10 text-[#08467d]"
                          : dark ? "text-slate-100 hover:bg-white/5" : "text-slate-900 hover:bg-white"
                      }`}
                    >
                      <span>الأخبار والإعلانات المدرسية</span>
                      {currentActive === "showcase" && <span className={`text-[10px] px-2 py-0.5 rounded-full bg-[#f8ca14]/20 ${dark ? "text-[#f8ca14]" : "text-[#08467d]"} font-bold`}>الحالية</span>}
                    </button>

                    <button
                      type="button"
                      onClick={() => go("/articles")}
                      className={`w-full flex items-center justify-between px-4 py-3.5 text-sm font-black transition ${
                        currentActive === "articles"
                          ? dark ? "bg-[#f8ca14]/15 text-[#f8ca14]" : "bg-[#08467d]/10 text-[#08467d]"
                          : dark ? "text-slate-100 hover:bg-white/5" : "text-slate-900 hover:bg-white"
                      }`}
                    >
                      <span>المقالات وأقلام المعلمين والطلاب</span>
                      {currentActive === "articles" && <span className={`text-[10px] px-2 py-0.5 rounded-full bg-[#f8ca14]/20 ${dark ? "text-[#f8ca14]" : "text-[#08467d]"} font-bold`}>الحالية</span>}
                    </button>
                  </div>
                </div>

                {/* 6. Group 4: تواصل مباشر وساعات العمل */}
                <div className={`p-4 rounded-2xl border space-y-3 ${
                  dark ? "bg-white/[0.04] border-white/10" : "bg-slate-50/90 border-slate-200 shadow-sm"
                }`}>
                  <div className="flex items-center justify-between text-xs font-black">
                    <span className={dark ? "text-white" : "text-slate-900"}>تواصل مباشر مع إدارة المدارس</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">المدينة المنورة</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <a
                      href={`tel:${cleanPhone}`}
                      className={`flex items-center justify-center gap-1.5 h-11 rounded-xl text-xs font-black border transition ${
                        dark
                          ? "border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"
                          : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50 shadow-sm"
                      }`}
                    >
                      <PhoneCall size={15} className={dark ? "text-[#f8ca14]" : "text-[#08467d]"} />
                      <span>اتصال هاتفي</span>
                    </a>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 h-11 rounded-xl text-xs font-black bg-[#25D366] text-white shadow-md hover:bg-[#20bd59] transition"
                    >
                      <MessageCircle size={15} />
                      <span>واتساب القبول</span>
                    </a>
                  </div>

                  <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center font-bold">
                    ساعات العمل: الأحد – الخميس (7:00 ص – 2:00 م)
                  </p>
                </div>
              </div>
            </div>
          )}

      {/* Universal Spotlight Search Dialog */}
      <AlaqeeqSpotlightSearch open={searchOpen} onOpenChange={setSearchOpen} dark={dark} />

      {/* Global AI Face Recognition Modal */}
      <AqeeqFaceSearchModal open={faceSearchOpen} onOpenChange={setFaceSearchOpen} dark={dark} />
      <AqeeqCreatorStudioModal open={creatorModalOpen} onOpenChange={setCreatorModalOpen} />

    </div>
  );
}
