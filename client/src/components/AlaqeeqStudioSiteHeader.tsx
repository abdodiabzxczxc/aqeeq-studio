import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { useVisualEditorState, VisualEditable, VisualIcon, VisualImage } from "@/components/VisualEditor";
import { AlaqeeqSpotlightSearch } from "@/components/AlaqeeqSpotlightSearch";
import { AqeeqFaceSearchModal } from "@/components/AqeeqFaceSearchModal";
import { Search, LayoutDashboard, PencilRuler, ScanFace } from "lucide-react";
import { trpc } from "@/lib/trpc";

type Section = "studio" | "journal" | "albums" | "showcase";

type AlaqeeqStudioSiteHeaderProps = {
  title: string;
  active: Section;
  logoUrl?: string | null;
};

export function AlaqeeqStudioSiteHeader({ title, active, logoUrl }: AlaqeeqStudioSiteHeaderProps) {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { data: orchestration } = trpc.executiveAdmin.getSiteOrchestration.useQuery(undefined, { refetchOnWindowFocus: false });
  const editor = useVisualEditorState();
  const { theme, toggleTheme } = useAqeeqStudioTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [faceSearchOpen, setFaceSearchOpen] = useState(false);
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
        <div className="relative mx-auto h-[66px] sm:h-[80px] max-w-[1360px] px-3.5 sm:px-6 md:px-8">
          {/* Logo with responsive max-width to prevent any collision */}
          <button
            onClick={() => go("/")}
            aria-label={`العودة إلى ${title}`}
            className="absolute right-3.5 sm:right-6 md:right-8 top-1/2 flex h-[42px] sm:h-[56px] w-auto max-w-[125px] sm:max-w-[165px] -translate-y-1/2 items-center justify-end transition"
          >
            <VisualImage
              id="aqeeq-studio-site-logo"
              label="شعار صفحة الاستوديو"
              src={activeLogo}
              alt="شعار مدارس العقيق"
              className={`max-h-full max-w-full object-contain transition duration-300 ${dark ? "brightness-0 invert opacity-95" : ""}`}
            />
          </button>

          {/* Desktop Nav */}
          <nav dir="rtl" className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-7 whitespace-nowrap text-xs font-black md:flex">
            <VisualEditable id="aqeeq-studio-nav-home" tag="button" label="اسم رابط الرئيسية" defaultText={orchestration?.nav?.homeLabel || "الرئيسية"} as="button" onAction={() => go("/")} className={`aq-studio-toplink ${active === "studio" ? "aq-studio-toplink--active" : ""}`} />
            <VisualEditable id="aqeeq-studio-nav-journal" tag="button" label="اسم رابط المجلة" defaultText={orchestration?.nav?.journalLabel || "مجلة العقيق"} as="button" onAction={() => go("/journal")} className={`aq-studio-toplink ${active === "journal" ? "aq-studio-toplink--active" : ""}`} />
            <VisualEditable id="aqeeq-studio-nav-albums" tag="button" label="اسم رابط الألبوم" defaultText={orchestration?.nav?.albumsLabel || "ألبوم العقيق"} as="button" onAction={() => go("/albums")} className={`aq-studio-toplink ${active === "albums" ? "aq-studio-toplink--active" : ""}`} />
            <VisualEditable id="aqeeq-studio-nav-showcase" tag="button" label="اسم رابط الأخبار والعروض" defaultText={orchestration?.nav?.showcaseLabel || "الأخبار والعروض"} as="button" onAction={() => go("/offers")} className={`aq-studio-toplink ${active === "showcase" ? "aq-studio-toplink--active" : ""}`} />
          </nav>

          {/* Left Action Buttons (Compact & Zero Collision on Mobile) */}
          <div dir="ltr" className="absolute left-3.5 sm:left-6 md:left-8 top-1/2 flex -translate-y-1/2 items-center gap-1.5 sm:gap-2.5 md:gap-3">
            {/* Desktop-only Auth Button (Moved into drawer on mobile) */}
            <div className="hidden md:block">
              <VisualEditable
                id="aqeeq-studio-auth-action"
                tag="button"
                label="زر تسجيل الدخول أو الخروج"
                defaultText={isAuthenticated ? "تسجيل الخروج" : "تسجيل الدخول"}
                as="button"
                onAction={handleAuth}
                className={`grid h-11 w-11 place-items-center rounded-xl border transition ${
                  dark
                    ? "border-[#f8ca14]/30 bg-[#f8ca14]/[0.08] text-[#f8ca14] hover:bg-[#f8ca14] hover:text-black"
                    : "border-[#08467d]/20 bg-[#08467d]/[0.08] text-[#08467d] hover:bg-[#08467d] hover:text-white"
                }`}
              >
                <VisualIcon id="aqeeq-studio-auth-icon" label="أيقونة تسجيل الدخول أو الخروج" icon={isAuthenticated ? "logout" : "login"} size={20} />
              </VisualEditable>
            </div>

            {/* Theme Toggle (Always Outside on both Mobile & Desktop) */}
            <button
              onClick={toggleTheme}
              className={`grid h-9 w-9 sm:h-11 sm:w-11 place-items-center rounded-xl border transition active:scale-95 ${
                dark
                  ? "border-[#f8ca14]/30 bg-[#f8ca14]/[0.08] text-[#f8ca14] hover:bg-[#f8ca14] hover:text-black"
                  : "border-[#08467d]/20 bg-[#08467d]/[0.08] text-[#08467d] hover:bg-[#08467d] hover:text-white"
              }`}
              title={dark ? "تفعيل الوضع الفاتح (White Mode)" : "تفعيل الوضع الداكن (Black Mode)"}
            >
              <VisualIcon id="aqeeq-studio-theme-icon" label="أيقونة مبدّل المظهر" icon={dark ? "sun" : "moon"} size={17} />
            </button>

            {/* AI Face Recognition Trigger */}
            <button
              onClick={() => setFaceSearchOpen(true)}
              className={`grid h-9 w-9 sm:h-11 sm:w-11 place-items-center rounded-xl border transition active:scale-95 ${
                dark
                  ? "border-amber-400/40 bg-amber-400/[0.12] text-amber-300 hover:bg-amber-400 hover:text-black ring-1 ring-amber-400/20 shadow-amber-400/10 shadow-lg"
                  : "border-amber-500/30 bg-amber-50 text-amber-900 hover:bg-amber-400 hover:text-black shadow-sm"
              }`}
              title="البحث عن صوري بالذكاء الاصطناعي في كافة الألبومات (AI Face Recognition)"
              aria-label="البحث عن صوري بالذكاء الاصطناعي"
            >
              <ScanFace size={18} />
            </button>

            {/* Spotlight Search Trigger */}
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

            {/* Visual Editor Icon-only Button (Zero text to save space) */}
            {isAdmin ? (
              <button
                onClick={() => editor.toggleEditing()}
                className={`grid h-9 w-9 sm:h-11 sm:w-11 place-items-center rounded-xl border transition active:scale-95 ${
                  editor.isEditing
                    ? "border-rose-400 bg-rose-500/30 text-rose-100 ring-2 ring-rose-400/50 animate-pulse shadow-lg"
                    : dark
                      ? "border-[#f8ca14]/30 bg-[#f8ca14]/[0.08] text-[#f8ca14] hover:bg-[#f8ca14] hover:text-black"
                      : "border-[#08467d]/20 bg-[#08467d]/[0.08] text-[#08467d] hover:bg-[#08467d] hover:text-white"
                }`}
                title={editor.isEditing ? "إنهاء التعديل البصري (وضع التحرير نشط الآن)" : "تفعيل المحرر البصري لتعديل النصوص والصور والخلفيات"}
                aria-label="المحرر البصري"
              >
                <PencilRuler size={17} />
              </button>
            ) : null}

            {/* Desktop-only Admin Button */}
            {isAdmin ? (
              <button
                onClick={() => navigate("/admin")}
                className={`hidden md:grid h-11 w-11 place-items-center rounded-xl border transition active:scale-95 ${
                  dark
                    ? "border-[#f8ca14]/40 bg-[#f8ca14]/15 text-[#f8ca14] hover:bg-[#f8ca14] hover:text-black shadow-lg shadow-[#f8ca14]/10"
                    : "border-[#08467d]/30 bg-[#08467d]/10 text-[#08467d] hover:bg-[#08467d] hover:text-white shadow-sm"
                }`}
                title="لوحة تحكم المشرف العام (Admin Command Center)"
                aria-label="لوحة تحكم المشرف العام"
              >
                <LayoutDashboard size={18} />
              </button>
            ) : null}

            {/* Mobile Hamburger Menu Button */}
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
                <button
                  type="button"
                  onClick={() => { setMobileMenuOpen(false); handleAuth(); }}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-black transition ${
                    dark ? "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10" : "border-black/10 bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <VisualIcon id="aqeeq-studio-auth-drawer-icon" label="أيقونة الدخول" icon={isAuthenticated ? "logout" : "login"} size={14} />
                  <span>{isAuthenticated ? "تسجيل الخروج" : "تسجيل الدخول"}</span>
                </button>
              </div>

              {/* Admin Command Center & Visual Editor Quick Buttons (if admin) */}
              {isAdmin ? (
                <div className="mb-3 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      editor.toggleEditing();
                    }}
                    className={`w-full flex items-center justify-between rounded-xl p-3 text-xs font-black transition active:scale-95 shadow-md ${
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
                    className="w-full flex items-center justify-between rounded-xl bg-gradient-to-r from-[#08467d] to-[#0c599c] p-3 text-xs font-black text-white shadow-lg shadow-[#08467d]/30 active:scale-95 transition"
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
              <div className="space-y-1">
                <VisualEditable id="aqeeq-studio-mobile-nav-home" tag="button" label="اسم رابط الرئيسية للهاتف" defaultText={orchestration?.nav?.homeLabel || "الرئيسية"} as="button" onAction={() => go("/")} className={`aq-studio-mobile-link w-full text-right p-2.5 rounded-xl font-black text-xs transition flex items-center gap-2.5 ${active === "studio" ? (dark ? "bg-[#f8ca14]/15 text-[#f8ca14]" : "bg-[#08467d]/10 text-[#08467d]") : ""}`} />
                <VisualEditable id="aqeeq-studio-mobile-nav-journal" tag="button" label="اسم رابط المجلة للهاتف" defaultText={orchestration?.nav?.journalLabel || "مجلة العقيق"} as="button" onAction={() => go("/journal")} className={`aq-studio-mobile-link w-full text-right p-2.5 rounded-xl font-black text-xs transition flex items-center gap-2.5 ${active === "journal" ? (dark ? "bg-[#f8ca14]/15 text-[#f8ca14]" : "bg-[#08467d]/10 text-[#08467d]") : ""}`} />
                <VisualEditable id="aqeeq-studio-mobile-nav-albums" tag="button" label="اسم رابط الألبوم للهاتف" defaultText={orchestration?.nav?.albumsLabel || "ألبوم العقيق"} as="button" onAction={() => go("/albums")} className={`aq-studio-mobile-link w-full text-right p-2.5 rounded-xl font-black text-xs transition flex items-center gap-2.5 ${active === "albums" ? (dark ? "bg-[#f8ca14]/15 text-[#f8ca14]" : "bg-[#08467d]/10 text-[#08467d]") : ""}`} />
                <VisualEditable id="aqeeq-studio-mobile-nav-showcase" tag="button" label="اسم رابط الأخبار للهاتف" defaultText={orchestration?.nav?.showcaseLabel || "الأخبار والعروض"} as="button" onAction={() => go("/offers")} className={`aq-studio-mobile-link w-full text-right p-2.5 rounded-xl font-black text-xs transition flex items-center gap-2.5 ${active === "showcase" ? (dark ? "bg-[#f8ca14]/15 text-[#f8ca14]" : "bg-[#08467d]/10 text-[#08467d]") : ""}`} />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Universal Spotlight Search Dialog */}
      <AlaqeeqSpotlightSearch open={searchOpen} onOpenChange={setSearchOpen} dark={dark} />

      {/* Global AI Face Recognition Modal */}
      <AqeeqFaceSearchModal open={faceSearchOpen} onOpenChange={setFaceSearchOpen} dark={dark} />
    </div>
  );
}
