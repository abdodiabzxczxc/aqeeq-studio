import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { useVisualEditorState, VisualEditable, VisualIcon, VisualImage } from "@/components/VisualEditor";
import { AlaqeeqSpotlightSearch } from "@/components/AlaqeeqSpotlightSearch";
import { AqeeqFaceSearchModal } from "@/components/AqeeqFaceSearchModal";
import { Search, LayoutDashboard, PencilRuler, ScanFace, Plus, Grid, Sun, Moon, LogOut, Settings2, Headphones } from "lucide-react";
import { usePodcastPlayer } from "@/components/AqeeqFloatingPodcastPlayer";
import { trpc } from "@/lib/trpc";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { AqeeqCreatorStudioModal } from "./AqeeqCreatorStudioModal";

export type Section = "studio" | "journal" | "albums" | "showcase" | "articles" | "podcast";

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
  const { activeItem, isPlaying, playSong, togglePlay } = usePodcastPlayer();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [faceSearchOpen, setFaceSearchOpen] = useState(false);
  const [creatorModalOpen, setCreatorModalOpen] = useState(false);
  const dark = theme === "dark";
  const isAdmin = isAuthenticated && user?.role === "admin";
  const go = (path: string) => { setMobileMenuOpen(false); navigate(path); };
  const handleAuth = () => {
    if (isAuthenticated) {
      void logout();
      return;
    }
    navigate("/login");
  };

  // Auto-resolve active section accurately from route or prop to prevent any mismatch
  let currentActive = active;
  if (!currentActive || currentActive === "studio") {
    if (location.startsWith("/articles") || location.startsWith("/article")) {
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
      <header className={`aq-studio-share-header sticky top-0 z-40 border-b backdrop-blur-xl transition duration-200 ${
        dark ? "border-white/[0.08] bg-black/90" : "border-black/[0.06] bg-white/95"
      }`}>
        <div className="relative mx-auto h-[66px] sm:h-[80px] max-w-[1380px] px-3.5 sm:px-6 md:px-8">
          {/* Logo with responsive max-width to prevent any collision */}
          <button
            onClick={() => go("/")}
            aria-label={`العودة إلى ${title}`}
            className="absolute right-3.5 sm:right-6 md:right-8 top-1/2 flex h-[44px] sm:h-[60px] w-auto max-w-[160px] sm:max-w-[220px] -translate-y-1/2 items-center justify-end transition hover:opacity-90"
          >
            <img
              src="/alaqeeq-logo.png"
              alt="شعار مدارس العقيق الأهلية والدولية"
              className={`max-h-full max-w-full object-contain transition duration-200 ${
                dark ? "brightness-0 invert opacity-95" : ""
              }`}
            />
          </button>

          {/* Desktop Nav */}
          <nav dir="rtl" className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-5 lg:gap-7 whitespace-nowrap text-xs font-black md:flex">
            <VisualEditable id="aqeeq-studio-nav-home" tag="button" label="اسم رابط الرئيسية" defaultText={orchestration?.nav?.homeLabel || "الرئيسية"} as="button" onAction={() => go("/")} className={`aq-studio-toplink ${currentActive === "studio" ? "aq-studio-toplink--active" : ""}`} />
            <VisualEditable id="aqeeq-studio-nav-journal" tag="button" label="اسم رابط المجلة" defaultText={orchestration?.nav?.journalLabel || "مجلة العقيق"} as="button" onAction={() => go("/journal")} className={`aq-studio-toplink ${currentActive === "journal" ? "aq-studio-toplink--active" : ""}`} />
            <VisualEditable id="aqeeq-studio-nav-albums" tag="button" label="اسم رابط الألبوم" defaultText={orchestration?.nav?.albumsLabel || "ألبوم العقيق"} as="button" onAction={() => go("/albums")} className={`aq-studio-toplink ${currentActive === "albums" ? "aq-studio-toplink--active" : ""}`} />
            <VisualEditable id="aqeeq-studio-nav-showcase" tag="button" label="اسم رابط الأخبار والعروض" defaultText={orchestration?.nav?.showcaseLabel || "الأخبار والعروض"} as="button" onAction={() => go("/offers")} className={`aq-studio-toplink ${currentActive === "showcase" ? "aq-studio-toplink--active" : ""}`} />
            <VisualEditable id="aqeeq-studio-nav-articles" tag="button" label="اسم رابط المقالات" defaultText={(orchestration?.nav as any)?.articlesLabel || "المقالات ✍️"} as="button" onAction={() => go("/articles")} className={`aq-studio-toplink ${currentActive === "articles" ? "aq-studio-toplink--active" : ""}`} />
            <VisualEditable id="aqeeq-studio-nav-podcast" tag="button" label="اسم رابط أثير العقيق" defaultText={(orchestration?.nav as any)?.podcastLabel || "أثير العقيق 🎙️"} as="button" onAction={() => go("/atheer")} className={`aq-studio-toplink ${currentActive === "podcast" ? "aq-studio-toplink--active" : ""}`} />
          </nav>

          {/* Left Action Buttons (Compact & Zero Collision on Mobile) */}
          <div dir="ltr" className="absolute left-3.5 sm:left-6 md:left-8 top-1/2 flex -translate-y-1/2 items-center gap-1.5 sm:gap-2.5 md:gap-3">
            
            {/* 1. Options Dropdown Menu OR Login Button (Desktop / Tablet) */}
            {isAuthenticated ? (
              <div className="hidden sm:block">
                <DropdownMenu dir="rtl">
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`grid h-9 w-9 sm:h-11 sm:w-11 place-items-center rounded-xl border transition active:scale-95 ${
                        dark
                          ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                          : "border-black/10 bg-black/5 text-slate-700 hover:bg-black/10"
                      }`}
                      aria-label="قائمة الخيارات"
                      title="قائمة الخيارات"
                    >
                      <Settings2 size={17} />
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
            ) : (
              <div className="hidden sm:block">
                <VisualEditable
                  id="aqeeq-studio-auth-action"
                  tag="button"
                  label="زر تسجيل الدخول"
                  defaultText="تسجيل الدخول"
                  as="button"
                  onAction={handleAuth}
                  className={`grid h-9 w-9 sm:h-11 sm:w-11 place-items-center rounded-xl border transition active:scale-95 ${
                    dark
                      ? "border-[#08467d]/30 bg-[#08467d]/10 text-slate-300 hover:bg-[#08467d]/30 hover:text-white"
                      : "border-[#08467d]/20 bg-[#08467d]/5 text-slate-700 hover:bg-[#08467d]/10 hover:text-black"
                  }`}
                  title="تسجيل الدخول"
                  aria-label="تسجيل الدخول"
                >
                  <VisualIcon id="aqeeq-studio-login-icon" label="أيقونة الدخول" icon="login" size={17} />
                </VisualEditable>
              </div>
            )}

            {/* 2. Unified Creator Studio Button (Desktop) */}
            {isAdmin ? (
              <button
                onClick={() => setCreatorModalOpen(true)}
                className={`hidden sm:grid h-9 w-9 sm:h-11 sm:w-11 place-items-center rounded-xl border transition active:scale-95 shadow-lg ${
                  dark
                    ? "border-[#e5b84f]/50 bg-[#e5b84f]/10 text-[#e5b84f] hover:bg-[#e5b84f] hover:text-black hover:shadow-[#e5b84f]/30"
                    : "border-[#e5b84f]/60 bg-[#e5b84f]/10 text-[#c59c3a] hover:bg-[#e5b84f] hover:text-white"
                }`}
                title="إنشاء محتوى جديد"
                aria-label="إنشاء محتوى جديد"
              >
                <Plus size={18} />
              </button>
            ) : null}

            {/* 3. Theme Toggle (Desktop) */}
            <button
              onClick={toggleTheme}
              className={`hidden sm:grid h-9 w-9 sm:h-11 sm:w-11 place-items-center rounded-xl border transition active:scale-95 ${
                dark
                  ? "border-[#f8ca14]/30 bg-[#f8ca14]/[0.08] text-[#f8ca14] hover:bg-[#f8ca14] hover:text-black"
                  : "border-[#08467d]/20 bg-[#08467d]/[0.08] text-[#08467d] hover:bg-[#08467d] hover:text-white"
              }`}
              title={dark ? "تفعيل الوضع الفاتح (White Mode)" : "تفعيل الوضع الداكن (Black Mode)"}
            >
              <VisualIcon id="aqeeq-studio-theme-icon" label="أيقونة مبدّل المظهر" icon={dark ? "sun" : "moon"} size={17} />
            </button>

            {/* 4. Spotlight Search Trigger (Always Visible) */}
            <button
              onClick={() => setSearchOpen(true)}
              className={`grid h-9 w-9 sm:h-11 sm:w-11 place-items-center rounded-xl border transition active:scale-95 ${
                dark
                  ? "border-[#f8ca14]/30 bg-[#f8ca14]/[0.08] text-[#f8ca14] hover:bg-[#f8ca14] hover:text-black"
                  : "border-[#08467d]/20 bg-[#08467d]/[0.08] text-[#08467d] hover:bg-[#08467d] hover:text-white"
              }`}
              title="البحث الشامل في الاستوديو (Ctrl+K)"
              aria-label="البحث الشامل"
            >
              <Search size={17} />
            </button>

            {/* 5. Mobile Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen((open) => !open)}
              className={`grid h-9 w-9 sm:h-11 sm:w-11 place-items-center rounded-xl border transition md:hidden active:scale-95 ${
                dark
                  ? "border-[#f8ca14]/40 bg-[#f8ca14]/10 text-[#f8ca14]"
                  : "border-[#08467d]/30 bg-[#08467d]/10 text-[#08467d]"
              }`}
              aria-label="قائمة الموقع"
            >
              <VisualIcon id="aqeeq-studio-mobile-menu-icon" label="أيقونة قائمة الاستوديو" icon={mobileMenuOpen ? "close" : "menu"} size={19} />
            </button>
          </div>

          {/* Luxury Slide-Down Mobile Menu Drawer */}
          {mobileMenuOpen && (
            <div className={`absolute inset-x-3.5 sm:inset-x-5 top-[70px] overflow-hidden rounded-2xl border p-3.5 shadow-2xl backdrop-blur-2xl md:hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 ${
              dark
                ? "border-[#f8ca14]/30 bg-black/95 shadow-[0_24px_55px_rgba(0,0,0,0.9)] text-white"
                : "border-black/[0.08] bg-white/98 shadow-[0_24px_55px_rgba(0,0,0,0.15)] text-black"
            }`}>
              {/* User Bar / Status inside Drawer */}
              <div className="flex items-center justify-between border-b pb-3 mb-3 border-current/10">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${isAuthenticated ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                  <span className="text-xs font-black">{isAuthenticated ? (user?.name || "المشرف العام") : "زائر الاستوديو"}</span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  {/* Theme Toggle in Mobile Drawer */}
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1 text-[11px] font-black transition ${
                      dark ? "border-amber-400/30 bg-amber-400/10 text-amber-300" : "border-slate-300 bg-slate-100 text-slate-700"
                    }`}
                  >
                    {dark ? <Sun size={13} /> : <Moon size={13} />}
                    <span>{dark ? "فاتح" : "داكن"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setMobileMenuOpen(false); handleAuth(); }}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-black transition ${
                      dark ? "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10" : "border-black/10 bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <VisualIcon id="aqeeq-studio-auth-drawer-icon" label="أيقونة الدخول" icon={isAuthenticated ? "logout" : "login"} size={14} />
                    <span>{isAuthenticated ? "خروج" : "دخول"}</span>
                  </button>
                </div>
              </div>

              {/* Face Search Quick Launcher inside Mobile Drawer */}
              <div className="mb-3">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setFaceSearchOpen(true);
                  }}
                  className="w-full flex items-center justify-between rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent p-3 text-xs font-black text-amber-200 transition active:scale-95 shadow-sm"
                >
                  <span className="flex items-center gap-2">
                    <ScanFace size={16} className="text-amber-300" />
                    <span>البحث عن صوري بالذكاء الاصطناعي 🔍</span>
                  </span>
                  <span className="rounded-lg bg-amber-400 px-2 py-0.5 text-[9px] font-black text-black">AI SCAN</span>
                </button>
              </div>

              {/* Admin Command Center & Visual Editor Quick Buttons (if admin) */}
              {isAdmin ? (
                <div className="mb-3 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setCreatorModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between rounded-xl border border-[#e5b84f]/40 bg-[#e5b84f]/15 p-2.5 text-xs font-black text-[#e5b84f] transition active:scale-95 shadow-sm"
                  >
                    <span className="flex items-center gap-2">
                      <Plus size={16} />
                      إنشاء محتوى جديد
                    </span>
                    <span className="rounded-lg bg-[#e5b84f] px-2 py-0.5 text-[10px] font-black text-black">NEW</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      editor.toggleEditing();
                    }}
                    className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs font-black transition active:scale-95 shadow-md ${
                      editor.isEditing
                        ? "border-rose-400 bg-rose-500/25 text-rose-100 ring-2 ring-rose-400/40 animate-pulse"
                        : "border border-amber-400/40 bg-amber-400/15 text-amber-200"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <PencilRuler size={16} className="text-amber-300" />
                      {editor.isEditing ? "إنهاء التعديل البصري" : "تفعيل المحرر البصري للموقع"}
                    </span>
                    <span className="rounded-lg bg-amber-400 px-2 py-0.5 text-[10px] font-black text-black">
                      {editor.isEditing ? "مفتوح" : "محرر"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => go("/admin")}
                    className="w-full flex items-center justify-between rounded-xl bg-gradient-to-r from-[#08467d] to-[#0c599c] p-2.5 text-xs font-black text-white shadow-lg shadow-[#08467d]/30 active:scale-95 transition"
                  >
                    <span className="flex items-center gap-2">
                      <LayoutDashboard size={16} className="text-[#f8ca14]" />
                      غرفة القيادة والتحكم الإداري
                    </span>
                    <span className="rounded-lg bg-[#f8ca14] px-2 py-0.5 text-[10px] font-black text-black">ADMIN</span>
                  </button>
                </div>
              ) : null}

              {/* Navigation Links */}
              <div className="space-y-1 border-t border-current/10 pt-2">
                <VisualEditable id="aqeeq-studio-mobile-nav-home" tag="button" label="اسم رابط الرئيسية للهاتف" defaultText={orchestration?.nav?.homeLabel || "الرئيسية"} as="button" onAction={() => go("/")} className={`aq-studio-mobile-link w-full text-right p-2.5 rounded-xl font-black text-xs transition flex items-center gap-2.5 ${currentActive === "studio" ? (dark ? "bg-[#f8ca14]/15 text-[#f8ca14]" : "bg-[#08467d]/10 text-[#08467d]") : ""}`} />
                <VisualEditable id="aqeeq-studio-mobile-nav-journal" tag="button" label="اسم رابط المجلة للهاتف" defaultText={orchestration?.nav?.journalLabel || "مجلة العقيق"} as="button" onAction={() => go("/journal")} className={`aq-studio-mobile-link w-full text-right p-2.5 rounded-xl font-black text-xs transition flex items-center gap-2.5 ${currentActive === "journal" ? (dark ? "bg-[#f8ca14]/15 text-[#f8ca14]" : "bg-[#08467d]/10 text-[#08467d]") : ""}`} />
                <VisualEditable id="aqeeq-studio-mobile-nav-albums" tag="button" label="اسم رابط الألبوم للهاتف" defaultText={orchestration?.nav?.albumsLabel || "ألبوم العقيق"} as="button" onAction={() => go("/albums")} className={`aq-studio-mobile-link w-full text-right p-2.5 rounded-xl font-black text-xs transition flex items-center gap-2.5 ${currentActive === "albums" ? (dark ? "bg-[#f8ca14]/15 text-[#f8ca14]" : "bg-[#08467d]/10 text-[#08467d]") : ""}`} />
                <VisualEditable id="aqeeq-studio-mobile-nav-showcase" tag="button" label="اسم رابط الأخبار للهاتف" defaultText={orchestration?.nav?.showcaseLabel || "الأخبار والعروض"} as="button" onAction={() => go("/offers")} className={`aq-studio-mobile-link w-full text-right p-2.5 rounded-xl font-black text-xs transition flex items-center gap-2.5 ${currentActive === "showcase" ? (dark ? "bg-[#f8ca14]/15 text-[#f8ca14]" : "bg-[#08467d]/10 text-[#08467d]") : ""}`} />
                <VisualEditable id="aqeeq-studio-mobile-nav-articles" tag="button" label="اسم رابط المقالات للهاتف" defaultText={(orchestration?.nav as any)?.articlesLabel || "المقالات ✍️"} as="button" onAction={() => go("/articles")} className={`aq-studio-mobile-link w-full text-right p-2.5 rounded-xl font-black text-xs transition flex items-center gap-2.5 ${currentActive === "articles" ? (dark ? "bg-[#f8ca14]/15 text-[#f8ca14]" : "bg-[#08467d]/10 text-[#08467d]") : ""}`} />
                <VisualEditable id="aqeeq-studio-mobile-nav-podcast" tag="button" label="اسم رابط أثير العقيق للهاتف" defaultText={(orchestration?.nav as any)?.podcastLabel || "أثير العقيق 🎙️"} as="button" onAction={() => go("/atheer")} className={`aq-studio-mobile-link w-full text-right p-2.5 rounded-xl font-black text-xs transition flex items-center gap-2.5 ${currentActive === "podcast" ? (dark ? "bg-[#f8ca14]/15 text-[#f8ca14]" : "bg-[#08467d]/10 text-[#08467d]") : ""}`} />
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
