import { useState, useEffect } from "react";
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
  Server,
  ArrowRight,
  ExternalLink,
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
              <DropdownMenuContent align="start" className={`w-56 p-1.5 rounded-xl border backdrop-blur-xl ${dark ? "bg-[#0c1218]/95 border-white/10 text-white" : "bg-white/95 border-black/10 text-black"}`}>
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
              <span className={`hidden lg:inline-flex items-center gap-1.5 text-[11px] font-black px-3 py-1 rounded-full border shadow-sm ${
                dark
                  ? "bg-gradient-to-r from-[#005A36]/30 to-[#5aba1c]/20 border-[#5aba1c]/40 text-[#5aba1c]"
                  : "bg-emerald-50 border-emerald-600/30 text-[#005A36]"
              }`}>
                <span>🇸🇦</span>
                <span className={`font-bold ${dark ? "text-white" : "text-[#005A36]"}`}>عزّنا بطبعنا</span>
              </span>
            )}
          </div>

          {/* Center 3 Executive Core Navigation Menus (Desktop) */}
          <nav dir="rtl" className="hidden md:flex items-center gap-6 lg:gap-8 whitespace-nowrap text-xs font-black">
            {/* Home */}
            <button
              onClick={() => go("/")}
              className={`aq-studio-toplink ${currentActive === "studio" ? "aq-studio-toplink--active" : ""}`}
            >
              الرئيسية
            </button>

            {/* 1. مدارسنا ▾ */}
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <button className={`aq-studio-toplink flex items-center gap-1.5 outline-none ${currentActive === "about" || currentActive === "accreditations" ? "aq-studio-toplink--active" : ""}`}>
                  <span>مدارسنا</span>
                  <ChevronDown size={13} className="opacity-70" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className={`w-72 p-2 rounded-2xl border shadow-2xl backdrop-blur-2xl ${dark ? "bg-[#0c1218]/95 border-white/15 text-white" : "bg-white/95 border-black/10 text-slate-900"}`}>
                <DropdownMenuItem onClick={() => go("/about")} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer font-bold text-xs">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-500">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <div className="font-black text-sm">عن مدارس العقيق</div>
                    <div className="text-[10px] text-slate-400">الرؤية والرسالة، الركائز، والمجمعات</div>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => go("/accreditations")} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer font-bold text-xs">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-500/10 text-[#f8ca14]">
                    <Award size={16} />
                  </div>
                  <div>
                    <div className="font-black text-sm">الاعتمادات ومراكز الاختبارات</div>
                    <div className="text-[10px] text-slate-400">كوجنيا الأمريكية، ومراكز IELTS و SAT و ACT</div>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator className={dark ? "bg-white/10" : "bg-black/5"} />

                <DropdownMenuItem onClick={() => go("/about")} className="flex items-center gap-2.5 p-2 rounded-lg cursor-pointer text-xs font-bold text-slate-500 hover:text-emerald-500">
                  <MapPin size={14} />
                  <span>فروعنا ومجمعاتنا بالمدينة المنورة</span>
                </DropdownMenuItem>

                <a href="https://live.aqeeq.edu.sa/jobs" target="_blank" rel="noreferrer" className="flex items-center justify-between p-2 rounded-lg text-xs font-bold text-slate-500 hover:text-emerald-500">
                  <div className="flex items-center gap-2.5">
                    <Briefcase size={14} />
                    <span>بوابة التوظيف الرسمية</span>
                  </div>
                  <ExternalLink size={12} className="opacity-50" />
                </a>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 2. القبول والرسوم ▾ */}
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <button className={`aq-studio-toplink flex items-center gap-1.5 outline-none ${currentActive === "admissions" ? "aq-studio-toplink--active" : ""}`}>
                  <span>القبول والرسوم</span>
                  <ChevronDown size={13} className="opacity-70" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className={`w-72 p-2 rounded-2xl border shadow-2xl backdrop-blur-2xl ${dark ? "bg-[#0c1218]/95 border-white/15 text-white" : "bg-white/95 border-black/10 text-slate-900"}`}>
                <DropdownMenuItem onClick={() => go("/admissions")} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer font-bold text-xs">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-500">
                    <Calculator size={16} />
                  </div>
                  <div>
                    <div className="font-black text-sm">جدول الرسوم الدراسية</div>
                    <div className="text-[10px] text-slate-400">لكافة المراحل أهلي ودولي مع الخصومات</div>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => go("/admissions#admission-form-section")} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer font-bold text-xs">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-500/10 text-[#f8ca14]">
                    <Send size={16} />
                  </div>
                  <div>
                    <div className="font-black text-sm">تقديم طلب تسجيل إلكتروني</div>
                    <div className="text-[10px] text-slate-400">حجز مقعد دراسي والتواصل مع القبول</div>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator className={dark ? "bg-white/10" : "bg-black/5"} />

                <DropdownMenuItem onClick={() => go("/admissions#tuition-fees-section")} className="flex items-center gap-2.5 p-2 rounded-lg cursor-pointer text-xs font-bold text-slate-500 hover:text-emerald-500">
                  <Smartphone size={14} />
                  <span>تطبيق أولياء الأمور (سداد ونداء)</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 3. استوديو العقيق (المركز الإعلامي) ▾ */}
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <button className={`aq-studio-toplink flex items-center gap-1.5 outline-none ${["journal", "albums", "showcase", "articles", "podcast"].includes(currentActive || "") ? "aq-studio-toplink--active" : ""}`}>
                  <span>استوديو العقيق</span>
                  <ChevronDown size={13} className="opacity-70" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className={`w-64 p-2 rounded-2xl border shadow-2xl backdrop-blur-2xl ${dark ? "bg-[#0c1218]/95 border-white/15 text-white" : "bg-white/95 border-black/10 text-slate-900"}`}>
                <DropdownMenuItem onClick={() => go("/journal")} className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer font-bold text-xs">
                  <BookOpen size={16} className="text-emerald-500" />
                  <span>مجلة العقيق الرقمية</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => go("/albums")} className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer font-bold text-xs">
                  <Camera size={16} className="text-amber-500" />
                  <span>ألبومات الصور والفعاليات</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => go("/atheer")} className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer font-bold text-xs">
                  <Radio size={16} className="text-purple-500" />
                  <span>بودكاست أثير العقيق</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => go("/articles")} className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer font-bold text-xs">
                  <FileText size={16} className="text-blue-500" />
                  <span>مقالات وأقلام العقيق</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => go("/offers")} className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer font-bold text-xs">
                  <Clapperboard size={16} className="text-rose-500" />
                  <span>الأخبار والعروض التفاعلية</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

            {/* National Day Celebration Quick Button */}
            {isNationalDay && (
              <button
                type="button"
                onClick={() => triggerNationalCelebration()}
                className={`hidden lg:flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-black transition active:scale-95 shadow-sm ${
                  dark
                    ? "border-[#f8ca14]/40 bg-[#f8ca14]/15 text-[#f8ca14] hover:bg-[#f8ca14]/25"
                    : "border-emerald-600/30 bg-emerald-50 text-[#005A36] hover:bg-emerald-100"
                }`}
                title="شارِكنا بهجة الوطن"
              >
                <Sparkles size={14} className={dark ? "text-[#f8ca14]" : "text-[#005A36]"} />
                <span>بهجة الوطن 🇸🇦</span>
              </button>
            )}

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
              className={`grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl border transition md:hidden active:scale-95 ${
                dark
                  ? "border-[#f8ca14]/40 bg-[#f8ca14]/10 text-[#f8ca14]"
                  : "border-[#015a37]/30 bg-[#015a37]/10 text-[#015a37]"
              }`}
              aria-label="قائمة الموقع"
            >
              <VisualIcon id="aqeeq-studio-mobile-menu-icon" label="أيقونة قائمة الاستوديو" icon={mobileMenuOpen ? "close" : "menu"} size={18} />
            </button>
          </div>

          {/* Luxury Slide-Down Mobile Menu Drawer */}
          {mobileMenuOpen && (
            <div className={`absolute inset-x-3.5 sm:inset-x-5 top-[70px] max-h-[calc(100vh-85px)] overflow-y-auto scrollbar-none rounded-2xl border p-4 shadow-2xl backdrop-blur-2xl md:hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 ${
              dark
                ? "border-[#f8ca14]/30 bg-black/95 shadow-[0_24px_55px_rgba(0,0,0,0.9)] text-white"
                : "border-black/[0.08] bg-white/98 shadow-[0_24px_55px_rgba(0,0,0,0.15)] text-black"
            }`}>
              {/* User Bar / Status inside Drawer */}
              <div className="flex items-center justify-between border-b pb-3 mb-3 border-current/10">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${isAuthenticated ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                  <span className="text-xs font-black">{isAuthenticated ? (user?.name || "المشرف العام") : "زائر المدارس"}</span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => { setMobileMenuOpen(false); handleAuth(); }}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-black transition ${
                      dark ? "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10" : "border-black/10 bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <span>{isAuthenticated ? "خروج" : "دخول"}</span>
                  </button>
                </div>
              </div>

              {/* Primary Mobile CTA Button */}
              <div className="mb-4">
                <Button
                  onClick={() => go("/admissions#admission-form-section")}
                  className={`w-full rounded-xl py-3 text-xs font-black shadow-lg ${
                    dark
                      ? "bg-gradient-to-r from-[#f8ca14] to-amber-500 text-black shadow-[#f8ca14]/20"
                      : "bg-gradient-to-r from-[#015a37] to-emerald-700 text-white shadow-emerald-950/20"
                  }`}
                >
                  <Send size={15} className="ml-2" />
                  <span>سجّل ابنك الآن في مدارس العقيق ✦</span>
                </Button>
              </div>

              {/* Mobile Sections Accordion */}
              <div className="space-y-4">
                {/* 1. مدارسنا */}
                <div className="rounded-xl border border-current/10 p-2.5">
                  <div className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                    <Building2 size={13} />
                    <span>مدارسنا</span>
                  </div>
                  <div className="space-y-1">
                    <button onClick={() => go("/about")} className="w-full text-right p-2 rounded-lg text-xs font-bold hover:bg-emerald-500/10 flex items-center justify-between">
                      <span>عن مدارس العقيق</span>
                      <ArrowRight size={13} className="opacity-40" />
                    </button>
                    <button onClick={() => go("/accreditations")} className="w-full text-right p-2 rounded-lg text-xs font-bold hover:bg-emerald-500/10 flex items-center justify-between">
                      <span>الاعتمادات ومراكز الاختبارات (Cognia / IELTS)</span>
                      <ArrowRight size={13} className="opacity-40" />
                    </button>
                  </div>
                </div>

                {/* 2. القبول والرسوم */}
                <div className="rounded-xl border border-current/10 p-2.5">
                  <div className="text-[11px] font-black text-[#f8ca14] mb-2 flex items-center gap-1.5">
                    <Calculator size={13} />
                    <span>القبول والرسوم</span>
                  </div>
                  <div className="space-y-1">
                    <button onClick={() => go("/admissions")} className="w-full text-right p-2 rounded-lg text-xs font-bold hover:bg-emerald-500/10 flex items-center justify-between">
                      <span>جدول الرسوم الدراسية</span>
                      <ArrowRight size={13} className="opacity-40" />
                    </button>
                    <button onClick={() => go("/admissions#admission-form-section")} className="w-full text-right p-2 rounded-lg text-xs font-bold hover:bg-emerald-500/10 flex items-center justify-between">
                      <span>نموذج حجز مقعد دراسي</span>
                      <ArrowRight size={13} className="opacity-40" />
                    </button>
                  </div>
                </div>

                {/* 3. استوديو العقيق */}
                <div className="rounded-xl border border-current/10 p-2.5">
                  <div className="text-[11px] font-black text-blue-500 mb-2 flex items-center gap-1.5">
                    <BookOpen size={13} />
                    <span>استوديو العقيق (المركز الإعلامي)</span>
                  </div>
                  <div className="space-y-1">
                    <button onClick={() => go("/journal")} className="w-full text-right p-2 rounded-lg text-xs font-bold hover:bg-emerald-500/10 flex items-center justify-between">
                      <span>مجلة العقيق</span>
                      <ArrowRight size={13} className="opacity-40" />
                    </button>
                    <button onClick={() => go("/albums")} className="w-full text-right p-2 rounded-lg text-xs font-bold hover:bg-emerald-500/10 flex items-center justify-between">
                      <span>ألبوم الصور والفعاليات</span>
                      <ArrowRight size={13} className="opacity-40" />
                    </button>
                    <button onClick={() => go("/atheer")} className="w-full text-right p-2 rounded-lg text-xs font-bold hover:bg-emerald-500/10 flex items-center justify-between">
                      <span>أثير العقيق (بودكاست)</span>
                      <ArrowRight size={13} className="opacity-40" />
                    </button>
                    <button onClick={() => go("/articles")} className="w-full text-right p-2 rounded-lg text-xs font-bold hover:bg-emerald-500/10 flex items-center justify-between">
                      <span>مقالات وأقلام العقيق</span>
                      <ArrowRight size={13} className="opacity-40" />
                    </button>
                    <button onClick={() => go("/offers")} className="w-full text-right p-2 rounded-lg text-xs font-bold hover:bg-emerald-500/10 flex items-center justify-between">
                      <span>الأخبار والعروض</span>
                      <ArrowRight size={13} className="opacity-40" />
                    </button>
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
    </div>
  );
}
