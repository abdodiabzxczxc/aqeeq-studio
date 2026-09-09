import { useState, useEffect, useRef, useMemo, lazy, Suspense } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { useSiteTheme } from "@/lib/useSiteTheme";
import { useVisualEditorState, VisualEditable, VisualIcon } from "@/components/VisualEditor";

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
  Shield,
  LogIn,
  ChevronLeft,
  CloudDownload,
  Cloud,
  Ticket,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { usePodcastPlayer } from "@/components/AqeeqFloatingPodcastPlayer";
import { trpc } from "@/lib/trpc";
import { triggerNationalCelebration } from "./AqeeqCelebrationConfetti";
import { AlaqeeqSpotlightSearch } from "@/components/AlaqeeqSpotlightSearch";


// ⚡ Dynamic lazy modals for heavy modules (Face AI, Studio Creator)
const AqeeqFaceSearchModal = lazy(() =>
  import("@/components/AqeeqFaceSearchModal").then((m) => ({ default: m.AqeeqFaceSearchModal }))
);
const AqeeqCreatorStudioModal = lazy(() =>
  import("./AqeeqCreatorStudioModal").then((m) => ({ default: m.AqeeqCreatorStudioModal }))
);


import { HeaderDockNav, NavDockItemConfig } from "./ui/header-dock-preview";
import {
  DEFAULT_SYSTEM_PORTALS,
  SystemPortalItem,
  PORTAL_CATEGORY_LABELS,
} from "@shared/portals";
import { renderPortalIcon } from "@/components/PortalIconRenderer";

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
  const [isPulling, setIsPulling] = useState(false);
  const utils = trpc.useUtils();
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

  const [mobilePortalsOpen, setMobilePortalsOpen] = useState(false);

  const systemPortalsList: SystemPortalItem[] = useMemo(() => {
    const rawList: SystemPortalItem[] = (orchestration as any)?.systemPortals || DEFAULT_SYSTEM_PORTALS;
    return rawList
      .filter((p) => p.visible !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [orchestration]);

  const parentsPortals = useMemo(
    () => systemPortalsList.filter((p) => p.category === "parents_students"),
    [systemPortalsList]
  );
  const staffPortals = useMemo(
    () => systemPortalsList.filter((p) => p.category === "staff_admin"),
    [systemPortalsList]
  );
  const publicPortals = useMemo(
    () => systemPortalsList.filter((p) => p.category === "public"),
    [systemPortalsList]
  );



  const dark = theme === "dark";
  const isLocalhost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.includes("manus.space"));
  const isAdmin = Boolean(isAuthenticated && (user?.role === "admin" || user?.openId === "admin"));
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

  const handleAuth = () => {
    if (isAuthenticated) {
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("aqeeq-admin-mode");
        } catch {}
      }
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

  const hiddenNavKeys: string[] = (orchestration?.nav as any)?.hiddenNavKeys || [];
  const isNavHidden = (key: string) => hiddenNavKeys.includes(key);

  const navHomeText = editor?.getOverride?.("header-nav-home")?.contentText || orchestration?.nav?.homeLabel || "الرئيسية";
  const navAboutText = editor?.getOverride?.("header-nav-about")?.contentText || orchestration?.nav?.aboutLabel || "مدارسنا";
  const navAccreditationsText = editor?.getOverride?.("header-nav-accreditations")?.contentText || orchestration?.nav?.accreditationsLabel || "الاعتمادات";
  const navAdmissionsText = editor?.getOverride?.("header-nav-admissions")?.contentText || orchestration?.nav?.admissionsLabel || "القبول والتسجيل";
  const navJournalText = editor?.getOverride?.("header-nav-journal")?.contentText || orchestration?.nav?.journalLabel || "المجلة";
  const navAlbumsText = editor?.getOverride?.("header-nav-albums")?.contentText || orchestration?.nav?.albumsLabel || "الألبومات";
  const navPodcastText = editor?.getOverride?.("header-nav-podcast")?.contentText || (orchestration?.nav as any)?.podcastLabel || "أثير";
  const navArticlesText = editor?.getOverride?.("header-nav-articles")?.contentText || (orchestration?.nav as any)?.articlesLabel || "المقالات";
  const navOffersText = editor?.getOverride?.("header-nav-offers")?.contentText || orchestration?.nav?.showcaseLabel || "الأخبار";


  return (
    <div dir="rtl" className="w-full bg-transparent">
      {/* ── Fixed Master Header Deck (Always follows user down on all pages) ── */}
      <div className={`fixed top-0 inset-x-0 z-[130] w-full transition-all duration-300 ease-out bg-transparent ${
        isScrolled ? "pointer-events-none" : "pointer-events-auto"
      }`}>
        {/* 1. Top Executive Utility Bar */}
        <div className={`hidden sm:block relative z-[140] text-[11px] font-bold transition-all duration-300 ${
          isScrolled
            ? "overflow-hidden max-h-0 h-0 py-0 opacity-0 !border-0 !border-transparent pointer-events-none"
            : `overflow-visible border-b max-h-12 py-1.5 opacity-100 ${
                dark ? "border-white/5 bg-[#0c1218]/95 text-slate-400" : "border-black/5 bg-slate-50/95 text-slate-600"
              }`
        }`}>
        <div className="mx-auto flex max-w-[1380px] 2xl:max-w-[1560px] items-center justify-between px-4 sm:px-6 md:px-8">
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
                  className={`absolute left-0 top-full mt-2 w-72 p-2 rounded-2xl border shadow-2xl backdrop-blur-xl z-50 animate-in fade-in duration-150 ${
                    dark
                      ? "bg-[#0c1218]/95 border-white/10 text-white shadow-black/60"
                      : "bg-white/95 border-slate-200 text-slate-900 shadow-xl"
                  }`}
                >
                  {/* Category 1: Parents & Students */}
                  {parentsPortals.length > 0 && (
                    <div className="space-y-0.5">
                      <div className={`text-[10px] ${dark ? "text-[#f8ca14]" : "text-[#08467d]"} font-black px-2 py-1 flex items-center gap-1.5`}>
                        <GraduationCap size={12} />
                        <span>{PORTAL_CATEGORY_LABELS.parents_students}</span>
                      </div>
                      {parentsPortals.map((portal) => {
                        const isInternal = portal.url.startsWith("/");
                        return (
                          <a
                            key={portal.id}
                            href={portal.url}
                            target={portal.openInNewTab && !isInternal ? "_blank" : undefined}
                            rel={portal.openInNewTab && !isInternal ? "noreferrer" : undefined}
                            onClick={(e) => {
                              if (isInternal) {
                                e.preventDefault();
                                setPortalsOpen(false);
                                navigate(portal.url);
                              } else {
                                setPortalsOpen(false);
                              }
                            }}
                            className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-bold transition hover:bg-[#f8ca14]/10 ${
                              portal.id === "portal-daily-plans" ? "text-amber-700 dark:text-amber-300" : ""
                            }`}
                          >
                            <span className="flex items-center gap-2 min-w-0">
                              <span className="shrink-0 text-current opacity-80">
                                {renderPortalIcon(portal.iconName, 13)}
                              </span>
                              <span className="truncate">{portal.title}</span>
                              {portal.badge && (
                                <span className="text-[8px] font-black px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                                  {portal.badge}
                                </span>
                              )}
                            </span>
                            <ExternalLink size={11} className="opacity-40 shrink-0 mr-1" />
                          </a>
                        );
                      })}
                    </div>
                  )}

                  {/* Divider */}
                  {parentsPortals.length > 0 && staffPortals.length > 0 && (
                    <div className="h-px bg-current/10 my-1" />
                  )}

                  {/* Category 2: Staff & Admin */}
                  {staffPortals.length > 0 && (
                    <div className="space-y-0.5">
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold px-2 py-1 flex items-center gap-1.5">
                        <Briefcase size={12} />
                        <span>{PORTAL_CATEGORY_LABELS.staff_admin}</span>
                      </div>
                      {staffPortals.map((portal) => {
                        const isInternal = portal.url.startsWith("/");
                        return (
                          <a
                            key={portal.id}
                            href={portal.url}
                            target={portal.openInNewTab && !isInternal ? "_blank" : undefined}
                            rel={portal.openInNewTab && !isInternal ? "noreferrer" : undefined}
                            onClick={(e) => {
                              if (isInternal) {
                                e.preventDefault();
                                setPortalsOpen(false);
                                navigate(portal.url);
                              } else {
                                setPortalsOpen(false);
                              }
                            }}
                            className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-bold transition hover:bg-[#f8ca14]/10 ${
                              portal.url.includes("admin") || portal.url.includes("login")
                                ? "text-slate-400 hover:text-white"
                                : ""
                            }`}
                          >
                            <span className="flex items-center gap-2 min-w-0">
                              <span className={`shrink-0 ${portal.url.includes("admin") || portal.url.includes("login") ? "text-[#f8ca14]" : "opacity-80"}`}>
                                {renderPortalIcon(portal.iconName, 13)}
                              </span>
                              <span className="truncate">{portal.title}</span>
                              {portal.badge && (
                                <span className="text-[8px] font-black px-1.5 py-0.2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                                  {portal.badge}
                                </span>
                              )}
                            </span>
                            <ExternalLink size={11} className="opacity-40 shrink-0 mr-1" />
                          </a>
                        );
                      })}
                    </div>
                  )}

                  {/* Category 3: Public (if any) */}
                  {publicPortals.length > 0 && (
                    <>
                      <div className="h-px bg-current/10 my-1" />
                      <div className="space-y-0.5">
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold px-2 py-1 flex items-center gap-1.5">
                          <ExternalLink size={12} />
                          <span>{PORTAL_CATEGORY_LABELS.public}</span>
                        </div>
                        {publicPortals.map((portal) => {
                          const isInternal = portal.url.startsWith("/");
                          return (
                            <a
                              key={portal.id}
                              href={portal.url}
                              target={portal.openInNewTab && !isInternal ? "_blank" : undefined}
                              rel={portal.openInNewTab && !isInternal ? "noreferrer" : undefined}
                              onClick={(e) => {
                                if (isInternal) {
                                  e.preventDefault();
                                  setPortalsOpen(false);
                                  navigate(portal.url);
                                } else {
                                  setPortalsOpen(false);
                                }
                              }}
                              className="flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-bold transition hover:bg-[#f8ca14]/10"
                            >
                              <span className="flex items-center gap-2 min-w-0">
                                <span className="shrink-0 opacity-80">
                                  {renderPortalIcon(portal.iconName, 13)}
                                </span>
                                <span className="truncate">{portal.title}</span>
                              </span>
                              <ExternalLink size={11} className="opacity-40 shrink-0 mr-1" />
                            </a>
                          );
                        })}
                      </div>
                    </>
                  )}
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
        <div className={`relative mx-auto max-w-[1380px] 2xl:max-w-[1560px] flex items-center justify-between lg:grid lg:grid-cols-[1fr_auto_1fr] transition-[height] duration-300 ease-out ${
          isScrolled
            ? "px-4 sm:px-6 md:px-8 h-[54px] sm:h-[62px] pointer-events-none"
            : "px-4 sm:px-6 md:px-8 h-[66px] sm:h-[78px] pointer-events-auto"
        }`}>
          {/* Logo with clean branding — Permanently rounded pill island, zero circle morphing */}
          <div className="relative shrink-0 lg:justify-self-start">
            <div className={`rounded-full flex items-center transition-[background-color,border-color,box-shadow,padding] duration-300 ease-out ${
              isScrolled
                ? "pointer-events-auto border backdrop-blur-2xl backdrop-saturate-[180%] px-3 sm:px-4 py-1.5 bg-white/60 dark:bg-[#060a12]/70 border-black/10 dark:border-white/15 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.85),0_8px_25px_-5px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.15),0_12px_30px_-5px_rgba(0,0,0,0.6)]"
                : "border border-transparent bg-transparent pr-0 sm:pr-0 pl-1 sm:pl-2 py-1"
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
                  loading="eager"
                  fetchPriority="high"
                  decoding="sync"
                  width={160}
                  height={54}
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

          {/* Center 9 Core Navigation Links with Dock Magnification & Live Page Hover Preview */}
          <div
            className={`transition-[opacity,transform] duration-250 ease-out ${
              isScrolled
                ? "opacity-0 -translate-y-2 pointer-events-none"
                : "opacity-100 translate-y-0 pointer-events-auto"
            }`}
          >
            <HeaderDockNav
              items={[
                {
                  key: "home",
                  label: navHomeText,
                  path: "/",
                  active: currentActive === "studio",
                  visualId: "header-nav-home",
                  visualLabel: "رابط الرئيسية",
                },
                {
                  key: "about",
                  label: navAboutText,
                  path: "/about",
                  active: currentActive === "about",
                  visualId: "header-nav-about",
                  visualLabel: "رابط مدارسنا",
                  customClass: dark ? "text-[#f8ca14]/90 hover:text-[#f8ca14]" : "text-[#08467d] hover:text-[#08467d]/80",
                },
                {
                  key: "accreditations",
                  label: navAccreditationsText,
                  path: "/accreditations",
                  active: currentActive === "accreditations",
                  visualId: "header-nav-accreditations",
                  visualLabel: "رابط الاعتمادات",
                },
                {
                  key: "admissions",
                  label: navAdmissionsText,
                  path: "/admissions",
                  active: currentActive === "admissions",
                  visualId: "header-nav-admissions",
                  visualLabel: "رابط القبول والتسجيل",
                },
                {
                  key: "journal",
                  label: navJournalText,
                  path: "/journal",
                  active: currentActive === "journal",
                  visualId: "header-nav-journal",
                  visualLabel: "رابط مجلة العقيق",
                },
                {
                  key: "albums",
                  label: navAlbumsText,
                  path: "/albums",
                  active: currentActive === "albums",
                  visualId: "header-nav-albums",
                  visualLabel: "رابط الألبومات",
                },
                {
                  key: "podcast",
                  label: navPodcastText,
                  path: "/podcast",
                  active: currentActive === "podcast",
                  visualId: "header-nav-podcast",
                  visualLabel: "رابط البودكاست",
                },
                {
                  key: "articles",
                  label: navArticlesText,
                  path: "/articles",
                  active: currentActive === "articles",
                  visualId: "header-nav-articles",
                  visualLabel: "رابط المقالات",
                },
                {
                  key: "showcase",
                  label: navOffersText,
                  path: "/showcase",
                  active: currentActive === "showcase",
                  visualId: "header-nav-offers",
                  visualLabel: "رابط الأخبار",
                },
              ].filter((it) => !isNavHidden(it.key))}
              dark={dark}
              onNavigate={go}
            />
          </div>

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

              {/* ⚙️ قائمة المشرف للمسؤولين / 🔑 زر تسجيل الدخول للعامة */}
              {isAdmin ? (
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

                        {isLocalhost && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                if (isDeploying || isPulling) return;
                                if (!window.confirm("🚀 هل تريد نشر التعديلات الحالية على الموقع المباشر الآن؟")) return;
                                setIsDeploying(true);
                                deployMutation.mutate();
                              }}
                              disabled={isDeploying || isPulling}
                              className={`w-full flex items-center gap-3 py-2.5 px-3 cursor-pointer font-black text-xs ${
                                dark ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-800"
                              } rounded-xl transition text-right`}
                            >
                              <Rocket size={15} className={`text-emerald-500 shrink-0 ${isDeploying ? "animate-spin" : ""}`} />
                              <span>{isDeploying ? "جارِ النشر..." : "نشر التعديلات للعامة 🚀"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (isDeploying || isPulling) return;
                                if (!window.confirm("📥 هل تريد سحب أحدث تعديلات المحتوى والنصوص من موقع ريندر إلى جهازك الآن؟")) return;
                                setIsPulling(true);
                                pullMutation.mutate();
                              }}
                              disabled={isDeploying || isPulling}
                              className={`w-full flex items-center gap-3 py-2.5 px-3 cursor-pointer font-black text-xs ${
                                dark ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-800"
                              } rounded-xl transition text-right`}
                            >
                              <CloudDownload size={15} className={`text-amber-400 shrink-0 ${isPulling ? "animate-bounce" : ""}`} />
                              <span>{isPulling ? "جارِ سحب البيانات..." : "سحب التعديلات من ريندر 📥"}</span>
                            </button>
                          </>
                        )}
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
                        <span>تسجيل الخروج</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className={`grid shrink-0 ${isScrolled ? "h-8 w-8 sm:h-8.5 sm:w-8.5" : "h-9 w-9 sm:h-10 sm:w-10"} place-items-center rounded-xl border transition-all duration-300 active:scale-95 cursor-pointer ${
                    dark
                      ? "border-white/10 bg-white/5 text-slate-300 hover:bg-[#f8ca14] hover:text-black hover:border-[#f8ca14]"
                      : "border-black/10 bg-black/5 text-slate-700 hover:bg-[#08467d] hover:text-white hover:border-[#08467d]"
                  }`}
                  aria-label="تسجيل الدخول"
                  title="تسجيل الدخول كمسؤول"
                >
                  <LogIn size={16} />
                </button>
              )}

              {/* ☰ الثلاث شُرط (Hamburger Menu Button) — Fluid entry on desktop without snap, always visible on mobile */}
              <div className={`transition-[max-width,opacity,transform] duration-300 ease-out overflow-hidden ${
                isScrolled
                  ? "max-w-[48px] opacity-100 scale-100 pointer-events-auto"
                  : "max-w-[48px] opacity-100 scale-100 lg:max-w-0 lg:opacity-0 lg:scale-90 lg:pointer-events-none"
              }`}>
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
                      {!isNavHidden("home") && (
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
                            <div className="text-[11px] font-black leading-tight">{navHomeText}</div>
                            <div className="text-[9px] text-slate-500 dark:text-slate-400">بوابة المدارس</div>
                          </div>
                        </button>
                      )}

                      {!isNavHidden("about") && (
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
                            <div className="text-[11px] font-black leading-tight">{navAboutText}</div>
                            <div className="text-[9px] text-slate-500 dark:text-slate-400">الرؤية والصروح</div>
                          </div>
                        </button>
                      )}

                      {!isNavHidden("accreditations") && (
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
                            <div className="text-[11px] font-black leading-tight">{navAccreditationsText}</div>
                            <div className="text-[9px] text-slate-500 dark:text-slate-400">Cognia وضمان الجودة</div>
                          </div>
                        </button>
                      )}

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
                  {!isNavHidden("admissions") && (
                    <div className={`relative overflow-hidden rounded-2xl p-3.5 transition duration-300 hover:scale-[1.01] border ${
                      dark
                        ? "bg-gradient-to-br from-[#08467d]/90 via-[#042442] to-[#021424] border-[#f8ca14]/30 text-white shadow-[0_12px_30px_rgba(8,70,125,0.4)]"
                        : "bg-gradient-to-br from-[#08467d] via-[#073661] to-[#042442] border-[#f8ca14]/40 text-white shadow-[0_12px_30px_rgba(8,70,125,0.25)]"
                    }`}>
                      <div className="relative z-10 flex items-start justify-between">
                        <div>
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-[#f8ca14] text-slate-950 mb-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
                            <span>{navAdmissionsText} متاح الآن</span>
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
                  )}

                  {/* 3. 🎨 ثالثاً: المركز الإعلامي والثقافي الموحد (Compact Media Hub) */}
                  <div className={`rounded-2xl border p-3 space-y-2 ${
                    dark ? "bg-white/[0.03] border-white/10" : "bg-slate-50/90 border-slate-200/80 shadow-xs"
                  }`}>
                    <div className="flex items-center justify-between pb-1 border-b border-black/5 dark:border-white/5">
                      <span className={`text-[11px] font-black ${dark ? "text-[#f8ca14]" : "text-[#08467d]"} flex items-center gap-1.5`}>
                        <span>🎨</span>
                        <span>المركز الإعلامي والإنتاج الثقافي</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold">الأقسام الحية</span>
                    </div>

                    {/* المربعات الأنيقة المدمجة: الأخبار، المقالات، المجلة، الألبومات */}
                    <div className="grid grid-cols-2 gap-2">
                      {!isNavHidden("showcase") && (
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
                            <div className="text-[11px] font-black leading-tight">{navOffersText}</div>
                            <div className="text-[9px] text-slate-500 dark:text-slate-400">المستجدات والإعلانات</div>
                          </div>
                        </button>
                      )}

                      {!isNavHidden("articles") && (
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
                            <div className="text-[11px] font-black leading-tight">{navArticlesText}</div>
                            <div className="text-[9px] text-slate-500 dark:text-slate-400">أقلام تربوية وثقافية</div>
                          </div>
                        </button>
                      )}

                      {!isNavHidden("journal") && (
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
                            <div className="text-[11px] font-black leading-tight">{navJournalText}</div>
                            <div className="text-[9px] text-slate-500 dark:text-slate-400">الأعداد والأرشيف</div>
                          </div>
                        </button>
                      )}

                      {!isNavHidden("albums") && (
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
                            <div className="text-[11px] font-black leading-tight">{navAlbumsText}</div>
                            <div className="text-[9px] text-slate-500 dark:text-slate-400">معرض الصور والأنشطة</div>
                          </div>
                        </button>
                      )}
                    </div>

                    {/* أثير العقيق (بودكاست مدمج أنيق بكامل العرض وبدون هدر للمساحة) */}
                    {!isNavHidden("podcast") && (
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
                              <span>{navPodcastText} — بودكاست حي</span>
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
                    )}
                  </div>

                  {/* 4. 🌐 رابعاً: بوابات الأنظمة والخدمات المدرسية */}
                  <div className={`rounded-2xl border overflow-hidden transition-all ${
                    dark ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-slate-50/70"
                  }`}>
                    <button
                      type="button"
                      onClick={() => setMobilePortalsOpen((prev) => !prev)}
                      className={`w-full flex items-center justify-between p-3 text-right transition cursor-pointer min-h-[44px] ${
                        mobilePortalsOpen
                          ? dark ? "bg-[#f8ca14]/10 text-[#f8ca14]" : "bg-[#08467d]/10 text-[#08467d]"
                          : dark ? "text-slate-200 hover:bg-white/5" : "text-slate-800 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`grid h-7 w-7 place-items-center rounded-lg ${
                          dark ? "bg-[#f8ca14]/20 text-[#f8ca14]" : "bg-[#08467d]/15 text-[#08467d]"
                        }`}>
                          <Server size={14} />
                        </div>
                        <div>
                          <div className="text-xs font-black leading-tight flex items-center gap-2">
                            <span>بوابات الأنظمة والخدمات</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black">
                              {systemPortalsList.length} بوابة
                            </span>
                          </div>
                          <div className="text-[9px] text-slate-500 dark:text-slate-400">
                            الخطط الأسبوعية، التطبيق، ERP، والبريد
                          </div>
                        </div>
                      </div>
                      <ChevronDown
                        size={15}
                        className={`opacity-60 transition-transform duration-200 ${
                          mobilePortalsOpen ? "rotate-180 text-current" : ""
                        }`}
                      />
                    </button>

                    {mobilePortalsOpen && (
                      <div className="p-2 space-y-1.5 border-t border-current/10 animate-in fade-in duration-150">
                        {systemPortalsList.map((portal) => {
                          const isInternal = portal.url.startsWith("/");
                          return (
                            <a
                              key={portal.id}
                              href={portal.url}
                              target={portal.openInNewTab && !isInternal ? "_blank" : undefined}
                              rel={portal.openInNewTab && !isInternal ? "noreferrer" : undefined}
                              onClick={(e) => {
                                if (isInternal) {
                                  e.preventDefault();
                                  setMobileMenuOpen(false);
                                  navigate(portal.url);
                                } else {
                                  setMobileMenuOpen(false);
                                }
                              }}
                              className={`flex items-center justify-between p-2.5 rounded-xl border transition min-h-[44px] ${
                                dark
                                  ? "border-white/5 bg-white/5 hover:bg-white/10 text-white"
                                  : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-xs"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${
                                  portal.category === "parents_students"
                                    ? "bg-amber-400/15 text-amber-500"
                                    : dark ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-700"
                                }`}>
                                  {renderPortalIcon(portal.iconName, 14)}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold truncate">{portal.title}</span>
                                    {portal.badge && (
                                      <span className="text-[8px] font-black px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                                        {portal.badge}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate">
                                    {portal.description}
                                  </p>
                                </div>
                              </div>
                              <ExternalLink size={12} className="opacity-50 shrink-0 mr-2" />
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 5. 👑 خامساً: أجنحة المشرف أو 🔑 تسجيل الدخول للمشرفين */}
                  {isAdmin ? (
                    <div className={`p-3 rounded-2xl border space-y-2 ${
                      dark ? "bg-[#f8ca14]/[0.06] border-[#f8ca14]/30" : "bg-amber-50/80 border-amber-300/60 shadow-xs"
                    }`}>
                      <div className="flex items-center justify-between pb-1 border-b border-black/5 dark:border-white/5">
                        <span className="text-xs font-black text-[#f8ca14] dark:text-[#f8ca14] flex items-center gap-1.5">
                          <span>👑</span>
                          <span>أدوات المشرف العام والتحكم بالموقع</span>
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          {user?.name || "المشرف"}
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
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            go("/admin");
                          }}
                          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black border transition cursor-pointer ${
                            dark
                              ? "border-white/10 bg-white/5 hover:bg-white/10 text-white"
                              : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800"
                          }`}
                        >
                          <LayoutDashboard size={14} className="text-blue-500" />
                          <span>لوحة الإدارة</span>
                        </button>

                        {/* زرا النشر المباشر وسحب التعديلات — خاص باللوكال فقط */}
                        {isLocalhost && (
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (isDeploying || isPulling) return;
                                if (!window.confirm("🚀 هل تريد نشر التعديلات الحالية على الموقع المباشر الآن؟")) return;
                                setIsDeploying(true);
                                deployMutation.mutate();
                              }}
                              disabled={isDeploying || isPulling}
                              className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black bg-[#f8ca14]/20 border border-[#f8ca14]/40 text-[#f8ca14] hover:bg-[#f8ca14] hover:text-black transition cursor-pointer"
                            >
                              <Rocket size={14} className={isDeploying ? "animate-spin" : ""} />
                              <span>نشر مباشر 🚀</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (isDeploying || isPulling) return;
                                if (!window.confirm("📥 هل تريد سحب أحدث تعديلات المحتوى من موقع ريندر إلى جهازك؟")) return;
                                setIsPulling(true);
                                pullMutation.mutate();
                              }}
                              disabled={isDeploying || isPulling}
                              className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500 hover:text-black transition cursor-pointer"
                            >
                              <CloudDownload size={14} className={isPulling ? "animate-bounce" : ""} />
                              <span>سحب ريندر 📥</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate("/login");
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition cursor-pointer ${
                        dark
                          ? "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800 shadow-xs"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className={`w-8 h-8 rounded-xl ${dark ? "bg-[#f8ca14]/15 text-[#f8ca14]" : "bg-[#08467d]/10 text-[#08467d]"} flex items-center justify-center`}>
                          <LogIn size={15} />
                        </span>
                        <span className="flex flex-col text-right">
                          <span className="font-black text-xs">تسجيل الدخول كمسؤول</span>
                          <span className="text-[10px] text-slate-400 font-normal">بوابة الوصول للوحة الإدارة والتحرير</span>
                        </span>
                      </span>
                      <ChevronLeft size={16} className="text-slate-400" />
                    </button>
                  )}

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
      {faceSearchOpen && (
        <Suspense fallback={null}>
          <AqeeqFaceSearchModal open={faceSearchOpen} onOpenChange={setFaceSearchOpen} dark={dark} />
        </Suspense>
      )}
      {creatorModalOpen && (
        <Suspense fallback={null}>
          <AqeeqCreatorStudioModal open={creatorModalOpen} onOpenChange={setCreatorModalOpen} />
        </Suspense>
      )}

    </div>
  );
}
