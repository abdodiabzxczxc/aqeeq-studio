import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { useSiteTheme } from "@/lib/useSiteTheme";
import { useVisualEditorState, VisualEditable, VisualIcon } from "@/components/VisualEditor";
import { AlaqeeqSpotlightSearch } from "@/components/AlaqeeqSpotlightSearch";
import { AqeeqFaceSearchModal } from "@/components/AqeeqFaceSearchModal";
import { MobileStickyActionBar } from "@/components/MobileStickyActionBar";
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
} from "lucide-react";
import { toast } from "sonner";
import { usePodcastPlayer } from "@/components/AqeeqFloatingPodcastPlayer";
import { trpc } from "@/lib/trpc";
import { triggerNationalCelebration } from "./AqeeqCelebrationConfetti";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
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

  const activeLogo = logoUrl || "/alaqeeq-logo.png";

  return (
    <div dir="rtl" className={`aq-studio-share ${dark ? "aq-studio-share--dark" : "aq-studio-share--light"}`}>
      {/* 1. Top Executive Utility Bar */}
      <div className={`hidden sm:block border-b text-[11px] font-bold py-1.5 transition-colors ${
        dark ? "border-white/5 bg-[#010f08]/90 text-slate-400" : "border-black/5 bg-slate-50/90 text-slate-600"
      }`}>
        <div className="mx-auto flex max-w-[1380px] items-center justify-between px-3.5 sm:px-6 md:px-8">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <MapPin size={12} />
              <span>المدينة المنورة — المملكة العربية السعودية</span>
            </span>
            <span className="h-3 w-px bg-current opacity-20" />
            <a href="tel:+966531896000" className="flex items-center gap-1.5 hover:text-emerald-600 transition" dir="ltr">
              <PhoneCall size={12} />
              <span>+966 53 189 6000</span>
            </a>
            <span className="h-3 w-px bg-current opacity-20 hidden md:inline-block" />
            <a href="mailto:info@alaqeeqholding.com" className="hidden md:flex items-center gap-1.5 hover:text-emerald-600 transition" dir="ltr">
              <Mail size={12} />
              <span>info@alaqeeqholding.com</span>
            </a>
          </div>

          <div className="flex items-center gap-3">
            {/* Portals Dropdown */}
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 hover:text-emerald-600 transition">
                  <Server size={12} className="text-emerald-500" />
                  <span>بوابات الأنظمة والخدمات</span>
                  <ChevronDown size={11} className="opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className={`w-64 p-1.5 rounded-xl border backdrop-blur-xl ${dark ? "bg-[#0c1218]/95 border-white/10 text-white" : "bg-white/95 border-black/10 text-black"}`}>
                <DropdownMenuLabel className="text-[10px] text-emerald-500 font-black px-2 py-1 flex items-center gap-1.5">
                  <GraduationCap size={12} />
                  <span>خدمات أولياء الأمور والطلاب</span>
                </DropdownMenuLabel>
                <a href="https://portal.aqeeq.app/pages/daily_plans/parent_lookup.php" target="_blank" rel="noreferrer" className="flex items-center justify-between p-2 rounded-lg text-xs font-bold hover:bg-emerald-500/10 text-amber-500 dark:text-amber-300">
                  <span className="flex items-center gap-1.5">
                    <FileText size={12} />
                    <span>الخطط الدراسية الأسبوعية</span>
                  </span>
                  <ExternalLink size={12} className="opacity-60" />
                </a>
                <a href="https://qr-codes.io/LQMip0" target="_blank" rel="noreferrer" className="flex items-center justify-between p-2 rounded-lg text-xs font-bold hover:bg-emerald-500/10">
                  <span className="flex items-center gap-1.5">
                    <Smartphone size={12} />
                    <span>تحميل تطبيق أولياء الأمور</span>
                  </span>
                  <ExternalLink size={12} className="opacity-60" />
                </a>

                <div className="h-px bg-current/10 my-1" />

                <DropdownMenuLabel className="text-[10px] text-slate-400 font-bold px-2 py-1">الأنظمة الإدارية والموظفين</DropdownMenuLabel>
                <a href="https://live.aqeeq.edu.sa" target="_blank" rel="noreferrer" className="flex items-center justify-between p-2 rounded-lg text-xs font-bold hover:bg-emerald-500/10">
                  <span>نظام Odoo الإداري</span>
                  <ExternalLink size={12} className="opacity-60" />
                </a>
                <a href="https://email.aqeeqholding.com" target="_blank" rel="noreferrer" className="flex items-center justify-between p-2 rounded-lg text-xs font-bold hover:bg-emerald-500/10">
                  <span>البريد الإلكتروني الرسمي</span>
                  <ExternalLink size={12} className="opacity-60" />
                </a>
                <a href="https://next.aqeeq.app" target="_blank" rel="noreferrer" className="flex items-center justify-between p-2 rounded-lg text-xs font-bold hover:bg-emerald-500/10">
                  <span>سحابة العقيق الرقمية</span>
                  <ExternalLink size={12} className="opacity-60" />
                </a>
                <a href="https://portal.aqeeq.app" target="_blank" rel="noreferrer" className="flex items-center justify-between p-2 rounded-lg text-xs font-bold hover:bg-emerald-500/10">
                  <span>بوابة التذاكر والصيانة</span>
                  <ExternalLink size={12} className="opacity-60" />
                </a>
                <a href="https://aqeeq.live" target="_blank" rel="noreferrer" className="flex items-center justify-between p-2 rounded-lg text-xs font-bold hover:bg-emerald-500/10">
                  <span>اجتماعات العقيق المرئية</span>
                  <ExternalLink size={12} className="opacity-60" />
                </a>
              </DropdownMenuContent>
            </DropdownMenu>

            <span className="h-3 w-px bg-current opacity-20" />
            <a href="https://live.aqeeq.edu.sa/jobs" target="_blank" rel="noreferrer" className="hover:text-emerald-600 transition">
              بوابة التوظيف
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Executive Header */}
      <header className={`aq-studio-share-header sticky top-0 z-40 border-b backdrop-blur-xl transition duration-200 ${
        isNationalDay
          ? dark ? "border-emerald-500/20 bg-[#01140c]/90" : "border-emerald-200/80 bg-white/95"
          : dark ? "border-white/[0.08] bg-black/90" : "border-black/[0.06] bg-white/95"
      }`}>
        <div className="relative mx-auto h-[66px] sm:h-[78px] max-w-[1380px] px-3.5 sm:px-6 md:px-8 flex items-center justify-between">
          {/* Logo with clean branding */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => go("/")}
              aria-label={`العودة إلى ${title}`}
              className="flex h-[44px] sm:h-[58px] w-auto max-w-[160px] sm:max-w-[220px] items-center transition hover:opacity-90"
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
                className={`max-h-full max-w-full object-contain transition duration-200 ${
                  dark
                    ? "brightness-0 invert opacity-95"
                    : isNationalDay
                    ? "drop-shadow-[0_1px_3px_rgba(1,90,55,0.18)]"
                    : ""
                }`}
              />
            </button>

            {isNationalDay && (
              <button
                type="button"
                onClick={() => triggerNationalCelebration()}
                title="انقر لمشاركتنا بهجة الوطن 🇸🇦"
                className={`hidden lg:inline-flex items-center gap-1.5 text-[11px] font-black px-3 py-1 rounded-full border shadow-sm transition hover:scale-105 active:scale-95 cursor-pointer ${
                  dark
                    ? "bg-gradient-to-r from-[#005A36]/30 to-[#5aba1c]/20 border-[#5aba1c]/40 text-[#5aba1c]"
                    : "bg-emerald-50 border-emerald-600/30 text-[#005A36]"
                }`}
              >
                <span>🇸🇦</span>
                <span className={`font-bold ${dark ? "text-white" : "text-[#005A36]"}`}>عزّنا بطبعنا</span>
              </button>
            )}
          </div>

          {/* Center 9 Core Navigation Links (Desktop) */}
          <nav dir="rtl" className="hidden lg:flex items-center gap-2.5 xl:gap-5 whitespace-nowrap text-[13px] font-bold font-['Tajawal',sans-serif]">
            {/* 1. الرئيسية */}
            <button
              onClick={() => go("/")}
              className={`aq-studio-toplink ${currentActive === "studio" ? "aq-studio-toplink--active" : ""}`}
            >
              الرئيسية
            </button>

            {/* 2. مدارسنا */}
            <button
              onClick={() => go("/about")}
              className={`aq-studio-toplink ${
                currentActive === "about" ? "aq-studio-toplink--active" : ""
              } ${dark ? "text-[#f8ca14]/90 hover:text-[#f8ca14]" : "text-[#08467d] hover:text-[#08467d]/80"}`}
            >
              مدارسنا
            </button>

            {/* 3. الاعتمادات */}
            <button
              onClick={() => go("/accreditations")}
              className={`aq-studio-toplink ${
                currentActive === "accreditations" ? "aq-studio-toplink--active" : ""
              } ${dark ? "text-[#f8ca14]/90 hover:text-[#f8ca14]" : "text-[#08467d] hover:text-[#08467d]/80"}`}
            >
              الاعتمادات
            </button>

            {/* 4. القبول والتسجيل */}
            <button
              onClick={() => go("/admissions")}
              className={`aq-studio-toplink ${
                currentActive === "admissions" ? "aq-studio-toplink--active" : ""
              } ${dark ? "text-[#f8ca14]/90 hover:text-[#f8ca14]" : "text-[#08467d] hover:text-[#08467d]/80"}`}
            >
              القبول والتسجيل
            </button>

            {/* 4. المجلة */}
            <VisualEditable
              id="aqeeq-studio-nav-journal"
              tag="button"
              label="اسم رابط المجلة"
              defaultText={
                orchestration?.nav?.journalLabel === "مجلة العقيق"
                  ? "المجلة"
                  : orchestration?.nav?.journalLabel || "المجلة"
              }
              as="button"
              onAction={() => go("/journal")}
              className={`aq-studio-toplink ${currentActive === "journal" ? "aq-studio-toplink--active" : ""}`}
            />

            {/* 5. الألبومات */}
            <VisualEditable
              id="aqeeq-studio-nav-albums"
              tag="button"
              label="اسم رابط الألبوم"
              defaultText={
                orchestration?.nav?.albumsLabel === "ألبوم العقيق"
                  ? "الألبومات"
                  : orchestration?.nav?.albumsLabel || "الألبومات"
              }
              as="button"
              onAction={() => go("/albums")}
              className={`aq-studio-toplink ${currentActive === "albums" ? "aq-studio-toplink--active" : ""}`}
            />

            {/* 6. أثير */}
            <VisualEditable
              id="aqeeq-studio-nav-podcast"
              tag="button"
              label="اسم رابط أثير"
              defaultText={
                (orchestration?.nav as any)?.podcastLabel === "أثير العقيق" ||
                (orchestration?.nav as any)?.podcastLabel === "أثير العقيق 🎙️"
                  ? "أثير"
                  : (orchestration?.nav as any)?.podcastLabel || "أثير"
              }
              as="button"
              onAction={() => go("/atheer")}
              className={`aq-studio-toplink ${currentActive === "podcast" ? "aq-studio-toplink--active" : ""}`}
            />

            {/* 7. المقالات */}
            <VisualEditable
              id="aqeeq-studio-nav-articles"
              tag="button"
              label="اسم رابط المقالات"
              defaultText={
                (orchestration?.nav as any)?.articlesLabel === "المقالات ✍️" ||
                (orchestration?.nav as any)?.articlesLabel === "مقالات وأقلام العقيق"
                  ? "المقالات"
                  : (orchestration?.nav as any)?.articlesLabel || "المقالات"
              }
              as="button"
              onAction={() => go("/articles")}
              className={`aq-studio-toplink ${currentActive === "articles" ? "aq-studio-toplink--active" : ""}`}
            />

            {/* 8. الأخبار */}
            <VisualEditable
              id="aqeeq-studio-nav-showcase"
              tag="button"
              label="اسم رابط الأخبار"
              defaultText={
                orchestration?.nav?.showcaseLabel === "الأخبار والعروض"
                  ? "الأخبار"
                  : orchestration?.nav?.showcaseLabel || "الأخبار"
              }
              as="button"
              onAction={() => go("/offers")}
              className={`aq-studio-toplink ${currentActive === "showcase" ? "aq-studio-toplink--active" : ""}`}
            />
          </nav>



          {/* Left Action Buttons & Primary CTA */}
          <div dir="ltr" className="flex items-center gap-2 sm:gap-3">
            {/* Primary Executive CTA Button */}
            <Button
              onClick={() => go("/admissions#admission-form-section")}
              className={`hidden sm:inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black shadow-md transition active:scale-95 ${
                dark
                  ? "bg-gradient-to-r from-[#f8ca14] to-amber-500 text-black hover:opacity-95 shadow-[#f8ca14]/20"
                  : "bg-gradient-to-r from-[#015a37] to-emerald-700 text-white hover:opacity-95 shadow-emerald-950/25"
              }`}
            >
              <span>سجّل الآن ✦</span>
            </Button>

            {/* Options Dropdown Menu OR Login Button (Desktop) */}
            {isAuthenticated ? (
              <div className="hidden sm:block">
                <DropdownMenu dir="rtl">
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl border transition active:scale-95 ${
                        dark
                          ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                          : "border-black/10 bg-black/5 text-slate-700 hover:bg-black/10"
                      }`}
                      aria-label="قائمة الخيارات"
                      title="قائمة الخيارات"
                    >
                      <Settings2 size={16} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className={`w-56 mt-2 rounded-2xl border ${dark ? "bg-[#0c0c0c] border-white/10 text-white" : "bg-white border-black/10 text-black"}`}>
                    <DropdownMenuLabel className="font-black text-xs text-center py-2">
                      {user?.name || "المشرف العام"}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className={dark ? "bg-white/10" : "bg-black/10"} />
                    
                    {/* Admin Only Actions */}
                    {isAdmin && (
                      <>
                        <DropdownMenuItem onClick={() => editor.toggleEditing()} className={`flex items-center gap-3 py-3 px-4 cursor-pointer font-bold text-xs ${dark ? "hover:bg-white/5" : "hover:bg-slate-100"} rounded-xl mb-1`}>
                          <PencilRuler size={15} className="text-emerald-500" />
                          <span>{editor.isEditing ? "إنهاء التعديل البصري" : "تفعيل المحرر البصري"}</span>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={() => navigate("/admin")} className={`flex items-center gap-3 py-3 px-4 cursor-pointer font-bold text-xs ${dark ? "hover:bg-white/5" : "hover:bg-slate-100"} rounded-xl mb-1`}>
                          <LayoutDashboard size={15} className="text-blue-500" />
                          <span>لوحة التحكم للإدارة</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    <DropdownMenuSeparator className={dark ? "bg-white/10" : "bg-black/10"} />
                    
                    {/* Auth Logout */}
                    <DropdownMenuItem onClick={handleAuth} className={`flex items-center gap-3 py-3 px-4 cursor-pointer font-bold text-xs ${dark ? "hover:bg-rose-500/20 text-rose-400" : "hover:bg-rose-50 text-rose-600"} rounded-xl`}>
                      <LogOut size={15} />
                      <span>تسجيل الخروج</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : null}

            {/* Deploy to Live — للمشرف فقط */}
            {isAdmin && isLocalhost ? (
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
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 cursor-wait opacity-70"
                    : "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-400 hover:shadow-emerald-500/20"
                }`}
                title="نشر التعديلات على الموقع المباشر 🚀"
              >
                <Rocket size={16} className={isDeploying ? "animate-spin" : ""} />
              </button>
            ) : null}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl border transition active:scale-95 ${
                dark
                  ? "border-[#f8ca14]/30 bg-[#f8ca14]/[0.08] text-[#f8ca14] hover:bg-[#f8ca14] hover:text-black"
                  : "border-[#015a37]/20 bg-[#015a37]/[0.08] text-[#015a37] hover:bg-[#015a37] hover:text-white"
              }`}
              title={dark ? "تفعيل الوضع الفاتح (White Mode)" : "تفعيل الوضع الداكن (Black Mode)"}
            >
              <VisualIcon id="aqeeq-studio-theme-icon" label="أيقونة مبدّل المظهر" icon={dark ? "sun" : "moon"} size={16} />
            </button>

            {/* Spotlight Search Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className={`grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl border transition active:scale-95 ${
                dark
                  ? "border-[#f8ca14]/30 bg-[#f8ca14]/[0.08] text-[#f8ca14] hover:bg-[#f8ca14] hover:text-black"
                  : "border-[#015a37]/20 bg-[#015a37]/[0.08] text-[#015a37] hover:bg-[#015a37] hover:text-white"
              }`}
              title="البحث الشامل (Ctrl+K)"
              aria-label="البحث الشامل"
            >
              <Search size={16} />
            </button>

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen((open) => !open)}
              className={`grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl border transition lg:hidden active:scale-95 ${
                dark
                  ? "border-[#f8ca14]/40 bg-[#f8ca14]/10 text-[#f8ca14]"
                  : "border-[#015a37]/30 bg-[#015a37]/10 text-[#015a37]"
              }`}
              aria-label="قائمة الموقع"
            >
              <VisualIcon id="aqeeq-studio-mobile-menu-icon" label="أيقونة القائمة" icon={mobileMenuOpen ? "close" : "menu"} size={18} />
            </button>
          </div>

          {/* Full-Screen Immersive Mobile Menu Canvas */}
          {mobileMenuOpen && (
            <div
              dir="rtl"
              className={`fixed inset-x-0 bottom-0 top-[64px] sm:top-[74px] z-[120] lg:hidden animate-in fade-in slide-in-from-top-3 duration-200 backdrop-blur-3xl overflow-hidden ${
                dark
                  ? "bg-[#060a10]/99 text-white border-t border-white/10"
                  : "bg-white/99 text-slate-900 border-t border-black/[0.08]"
              }`}
            >
              {/* Inner Scroll Container with Safe Bottom Space */}
              <div className="h-full overflow-y-auto overscroll-contain px-4 sm:px-6 pt-4 pb-36 max-w-lg mx-auto space-y-6 scrollbar-hide">

                {/* 1. Executive / Account Status Bar */}
                <div className={`flex items-center justify-between p-3 rounded-2xl border ${
                  dark ? "bg-white/[0.03] border-white/10" : "bg-slate-50 border-black/5"
                }`}>
                  <div className="flex items-center gap-2.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${isAuthenticated ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-slate-400"}`} />
                    <div>
                      <span className="text-xs font-black block leading-tight">
                        {isAuthenticated ? (user?.name || "المشرف العام") : "مرحباً بك في مدارس العقيق"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold block leading-tight">
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
                            : "border-[#08467d]/25 bg-[#08467d]/10 text-[#08467d]"
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
                        dark ? "border-white/15 bg-white/5 text-slate-300 hover:bg-white/10" : "border-black/10 bg-white text-slate-700 hover:bg-slate-100"
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
                  className={`w-full flex items-center justify-center gap-2 rounded-2xl h-12 text-sm font-black shadow-xl transition active:scale-[.98] ${
                    dark
                      ? "bg-gradient-to-l from-[#f8ca14] via-amber-400 to-amber-500 text-slate-950 shadow-amber-400/20"
                      : "bg-gradient-to-l from-[#015a37] via-emerald-700 to-emerald-800 text-white shadow-emerald-900/30"
                  }`}
                >
                  <Send size={16} />
                  <span>سجّل ابنك الآن في مدارس العقيق ✦</span>
                </button>

                {/* 3. Navigation Links List */}
                <div className="space-y-4 pt-1">

                  {/* 3.1 الرئيسية (Home) */}
                  <button
                    type="button"
                    onClick={() => go("/")}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-base font-black transition ${
                      currentActive === "studio"
                        ? dark ? "bg-white/10 text-[#f8ca14]" : "bg-emerald-50 text-[#015a37]"
                        : dark ? "hover:bg-white/5 text-white" : "hover:bg-slate-100 text-slate-900"
                    }`}
                  >
                    <span>الرئيسية</span>
                    <span className="text-xs opacity-40 font-mono">01</span>
                  </button>

                  <div className="h-px bg-current/10 my-2" />

                  {/* 3.2 مدارسنا */}
                  <div>
                    <p className="px-3 pb-2 text-[11px] font-black tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
                      مدارسنا
                    </p>
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => go("/about")}
                        className={`w-full text-right px-3.5 py-2.5 rounded-xl text-sm font-bold transition ${
                          currentActive === "about"
                            ? dark ? "bg-white/10 text-[#f8ca14]" : "bg-emerald-50 text-[#015a37]"
                            : dark ? "text-slate-200 hover:bg-white/5" : "text-slate-800 hover:bg-slate-100"
                        }`}
                      >
                        عن مدارس العقيق الأهلية والدولية
                      </button>
                      <button
                        type="button"
                        onClick={() => go("/accreditations")}
                        className={`w-full text-right px-3.5 py-2.5 rounded-xl text-sm font-bold transition ${
                          currentActive === "accreditations"
                            ? dark ? "bg-white/10 text-[#f8ca14]" : "bg-emerald-50 text-[#015a37]"
                            : dark ? "text-slate-200 hover:bg-white/5" : "text-slate-800 hover:bg-slate-100"
                        }`}
                      >
                        الاعتمادات ومراكز الاختبارات (Cognia / IELTS)
                      </button>
                    </div>
                  </div>

                  <div className="h-px bg-current/10 my-2" />

                  {/* 3.3 القبول والتسجيل */}
                  <div>
                    <p className="px-3 pb-2 text-[11px] font-black tracking-widest text-amber-500 dark:text-amber-400 uppercase">
                      القبول والتسجيل
                    </p>
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => go("/admissions")}
                        className={`w-full text-right px-3.5 py-2.5 rounded-xl text-sm font-bold transition ${
                          currentActive === "admissions"
                            ? dark ? "bg-white/10 text-[#f8ca14]" : "bg-emerald-50 text-[#015a37]"
                            : dark ? "text-slate-200 hover:bg-white/5" : "text-slate-800 hover:bg-slate-100"
                        }`}
                      >
                        جدول الرسوم الدراسية
                      </button>
                      <button
                        type="button"
                        onClick={() => go("/admissions#admission-form-section")}
                        className="w-full text-right px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition"
                      >
                        نموذج حجز مقعد دراسي فوري
                      </button>
                      <a
                        href="https://portal.aqeeq.app/pages/daily_plans/parent_lookup.php"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition"
                      >
                        <span>الخطط الدراسية الأسبوعية</span>
                        <ExternalLink size={13} className="opacity-60" />
                      </a>
                      <a
                        href="https://qr-codes.io/LQMip0"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition"
                      >
                        <span>تحميل تطبيق أولياء الأمور</span>
                        <ExternalLink size={13} className="opacity-60" />
                      </a>
                    </div>
                  </div>

                  <div className="h-px bg-current/10 my-2" />

                  {/* 3.4 المركز الإعلامي والمحتوى */}
                  <div>
                    <p className="px-3 pb-2 text-[11px] font-black tracking-widest text-sky-500 dark:text-sky-400 uppercase">
                      المركز الإعلامي والمحتوى
                    </p>
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => go("/journal")}
                        className={`w-full text-right px-3.5 py-2.5 rounded-xl text-sm font-bold transition ${
                          currentActive === "journal"
                            ? dark ? "bg-white/10 text-[#f8ca14]" : "bg-emerald-50 text-[#015a37]"
                            : dark ? "text-slate-200 hover:bg-white/5" : "text-slate-800 hover:bg-slate-100"
                        }`}
                      >
                        المجلة المدرسية
                      </button>
                      <button
                        type="button"
                        onClick={() => go("/albums")}
                        className={`w-full text-right px-3.5 py-2.5 rounded-xl text-sm font-bold transition ${
                          currentActive === "albums"
                            ? dark ? "bg-white/10 text-[#f8ca14]" : "bg-emerald-50 text-[#015a37]"
                            : dark ? "text-slate-200 hover:bg-white/5" : "text-slate-800 hover:bg-slate-100"
                        }`}
                      >
                        ألبومات الفعاليات والأنشطة
                      </button>
                      <button
                        type="button"
                        onClick={() => go("/atheer")}
                        className={`w-full text-right px-3.5 py-2.5 rounded-xl text-sm font-bold transition ${
                          currentActive === "podcast"
                            ? dark ? "bg-white/10 text-[#f8ca14]" : "bg-emerald-50 text-[#015a37]"
                            : dark ? "text-slate-200 hover:bg-white/5" : "text-slate-800 hover:bg-slate-100"
                        }`}
                      >
                        أثير — الاستوديو الصوتي والبودكاست
                      </button>
                      <button
                        type="button"
                        onClick={() => go("/offers")}
                        className={`w-full text-right px-3.5 py-2.5 rounded-xl text-sm font-bold transition ${
                          currentActive === "showcase"
                            ? dark ? "bg-white/10 text-[#f8ca14]" : "bg-emerald-50 text-[#015a37]"
                            : dark ? "text-slate-200 hover:bg-white/5" : "text-slate-800 hover:bg-slate-100"
                        }`}
                      >
                        الأخبار والإعلانات
                      </button>
                      <button
                        type="button"
                        onClick={() => go("/articles")}
                        className={`w-full text-right px-3.5 py-2.5 rounded-xl text-sm font-bold transition ${
                          currentActive === "articles"
                            ? dark ? "bg-white/10 text-[#f8ca14]" : "bg-emerald-50 text-[#015a37]"
                            : dark ? "text-slate-200 hover:bg-white/5" : "text-slate-800 hover:bg-slate-100"
                        }`}
                      >
                        المقالات وأقلام العقيق
                      </button>
                    </div>
                  </div>

                  <div className="h-px bg-current/10 my-2" />

                  {/* 4. Direct Contact & Hours Card */}
                  <div className={`p-4 rounded-2xl border space-y-3 ${
                    dark ? "bg-white/[0.02] border-white/10" : "bg-slate-50 border-black/5"
                  }`}>
                    <div className="text-xs font-black flex items-center justify-between">
                      <span>تواصل مباشر مع إدارة القبول</span>
                      <span className="text-[10px] text-slate-400 font-normal">المدينة المنورة</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={`tel:${cleanPhone}`}
                        className={`flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-bold border transition ${
                          dark ? "border-white/15 bg-white/5 text-slate-200 hover:bg-white/10" : "border-slate-300 bg-white text-slate-800 shadow-sm"
                        }`}
                      >
                        <PhoneCall size={14} className="text-emerald-500" />
                        <span>اتصال بالهاتف</span>
                      </a>
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-bold bg-[#25D366] text-white shadow-sm hover:opacity-95 transition"
                      >
                        <MessageCircle size={14} />
                        <span>محادثة واتساب</span>
                      </a>
                    </div>

                    <p className="text-[10px] text-slate-400 text-center">
                      أوقات العمل: الأحد – الخميس (7:00 ص – 2:00 م)
                    </p>
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Universal Spotlight Search Dialog */}
      <AlaqeeqSpotlightSearch open={searchOpen} onOpenChange={setSearchOpen} dark={dark} />

      {/* Global AI Face Recognition Modal */}
      <AqeeqFaceSearchModal open={faceSearchOpen} onOpenChange={setFaceSearchOpen} dark={dark} />
      <AqeeqCreatorStudioModal open={creatorModalOpen} onOpenChange={setCreatorModalOpen} />

      {/* Global Mobile Sticky Action Bar */}
      <MobileStickyActionBar />
    </div>
  );
}
