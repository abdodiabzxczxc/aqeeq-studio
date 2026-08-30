import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { useVisualEditorState, VisualEditable, VisualIcon, VisualImage } from "@/components/VisualEditor";
import { AlaqeeqSpotlightSearch } from "@/components/AlaqeeqSpotlightSearch";
import { Search, LayoutDashboard } from "lucide-react";
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
        <div className="relative mx-auto h-[80px] max-w-[1360px] px-5 md:px-8">
          <button onClick={() => go("/")} aria-label={`العودة إلى ${title}`} className="absolute right-5 top-1/2 flex h-[58px] w-[165px] -translate-y-1/2 items-center justify-end md:right-8">
            <VisualImage id="aqeeq-studio-site-logo" label="شعار صفحة الاستوديو" src={activeLogo} alt="شعار مدارس العقيق" className={`max-h-full max-w-full object-contain transition duration-300 ${dark ? "brightness-0 invert opacity-95" : ""}`} />
          </button>

          <nav dir="rtl" className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-7 whitespace-nowrap text-xs font-black md:flex">
            <VisualEditable id="aqeeq-studio-nav-home" tag="button" label="اسم رابط الرئيسية" defaultText={orchestration?.nav?.homeLabel || "الرئيسية"} as="button" onAction={() => go("/")} className={`aq-studio-toplink ${active === "studio" ? "aq-studio-toplink--active" : ""}`} />
            <VisualEditable id="aqeeq-studio-nav-journal" tag="button" label="اسم رابط المجلة" defaultText={orchestration?.nav?.journalLabel || "مجلة العقيق"} as="button" onAction={() => go("/journal")} className={`aq-studio-toplink ${active === "journal" ? "aq-studio-toplink--active" : ""}`} />
            <VisualEditable id="aqeeq-studio-nav-albums" tag="button" label="اسم رابط الألبوم" defaultText={orchestration?.nav?.albumsLabel || "ألبوم العقيق"} as="button" onAction={() => go("/albums")} className={`aq-studio-toplink ${active === "albums" ? "aq-studio-toplink--active" : ""}`} />
            <VisualEditable id="aqeeq-studio-nav-showcase" tag="button" label="اسم رابط الأخبار والعروض" defaultText={orchestration?.nav?.showcaseLabel || "الأخبار والعروض"} as="button" onAction={() => go("/offers")} className={`aq-studio-toplink ${active === "showcase" ? "aq-studio-toplink--active" : ""}`} />
          </nav>

          <div dir="ltr" className="absolute left-5 top-1/2 flex -translate-y-1/2 items-center gap-2.5 sm:gap-3 md:left-8">
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

            {/* Theme Toggle (Dark / Light) */}
            <button
              onClick={toggleTheme}
              className={`grid h-11 w-11 place-items-center rounded-xl border transition ${
                dark
                  ? "border-[#f8ca14]/30 bg-[#f8ca14]/[0.08] text-[#f8ca14] hover:bg-[#f8ca14] hover:text-black"
                  : "border-[#08467d]/20 bg-[#08467d]/[0.08] text-[#08467d] hover:bg-[#08467d] hover:text-white"
              }`}
              title={dark ? "تفعيل الوضع الفاتح (White Mode)" : "تفعيل الوضع الداكن (Black Mode)"}
            >
              <VisualIcon id="aqeeq-studio-theme-icon" label="أيقونة مبدّل المظهر" icon={dark ? "sun" : "moon"} size={17} />
            </button>

            {/* Spotlight Search Trigger (Icon Only) */}
            <button
              onClick={() => setSearchOpen(true)}
              className={`grid h-11 w-11 place-items-center rounded-xl border transition active:scale-95 ${
                dark
                  ? "border-[#f8ca14]/30 bg-[#f8ca14]/[0.08] text-[#f8ca14] hover:bg-[#f8ca14] hover:text-black"
                  : "border-[#08467d]/20 bg-[#08467d]/[0.08] text-[#08467d] hover:bg-[#08467d] hover:text-white"
              }`}
              title="البحث الشامل في الاستوديو (Ctrl+K)"
              aria-label="البحث الشامل"
            >
              <Search size={18} />
            </button>

            {isAdmin ? (
              <button
                onClick={() => navigate("/admin")}
                className={`grid h-11 w-11 place-items-center rounded-xl border transition active:scale-95 ${
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

            {isAdmin ? (
              <VisualEditable
                id="aqeeq-studio-edit-action"
                tag="button"
                label="زر تحرير الصفحة"
                defaultText={editor.isEditing ? "إنهاء التعديل" : "تحرير الصفحة"}
                as="button"
                onAction={editor.toggleEditing}
                className={`hidden rounded-xl border px-3 py-2 text-xs font-black transition lg:inline-flex ${
                  editor.isEditing
                    ? dark
                      ? "border-[#f8ca14] bg-[#f8ca14] text-black"
                      : "border-[#08467d] bg-[#08467d] text-white"
                    : dark
                    ? "border-[#f8ca14]/30 bg-[#f8ca14]/[0.08] text-[#f8ca14] hover:bg-[#f8ca14] hover:text-black"
                    : "border-[#08467d]/20 bg-[#08467d]/[0.08] text-[#08467d] hover:bg-[#08467d] hover:text-white"
                }`}
              />
            ) : null}

            <button
              onClick={() => setMobileMenuOpen((open) => !open)}
              className={`grid h-11 w-11 place-items-center rounded-xl border transition md:hidden ${
                dark
                  ? "border-white/[0.1] bg-white/[0.03] text-white"
                  : "border-black/[0.08] bg-black/[0.03] text-black"
              }`}
              aria-label="قائمة الموقع"
            >
              <VisualIcon id="aqeeq-studio-mobile-menu-icon" label="أيقونة قائمة الاستوديو" icon={mobileMenuOpen ? "close" : "menu"} size={20} />
            </button>
          </div>

          {mobileMenuOpen && (
            <div className={`absolute inset-x-5 top-[70px] overflow-hidden rounded-2xl border p-2 shadow-2xl backdrop-blur-2xl md:hidden ${
              dark
                ? "border-[#f8ca14]/30 bg-black/95 shadow-[0_24px_55px_rgba(0,0,0,0.8)] text-white"
                : "border-black/[0.08] bg-white/95 shadow-[0_24px_55px_rgba(0,0,0,0.12)] text-black"
            }`}>
              {isAdmin ? (
                <button
                  onClick={() => go("/admin")}
                  className={`aq-studio-mobile-link font-black text-right flex items-center justify-between border-b pb-2 mb-2 ${
                    dark ? "border-white/10 text-[#f8ca14]" : "border-black/10 text-[#08467d]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <LayoutDashboard size={16} />
                    لوحة تحكم المشرف العام
                  </span>
                  <span className="rounded bg-[#f8ca14]/20 px-2 py-0.5 text-[10px]">ADMIN</span>
                </button>
              ) : null}
              <VisualEditable id="aqeeq-studio-mobile-nav-home" tag="button" label="اسم رابط الرئيسية للهاتف" defaultText="الرئيسية" as="button" onAction={() => go("/")} className={`aq-studio-mobile-link ${active === "studio" ? "aq-studio-mobile-link--active" : ""}`} />
              <VisualEditable id="aqeeq-studio-mobile-nav-journal" tag="button" label="اسم رابط المجلة للهاتف" defaultText="مجلة العقيق" as="button" onAction={() => go("/journal")} className={`aq-studio-mobile-link ${active === "journal" ? "aq-studio-mobile-link--active" : ""}`} />
              <VisualEditable id="aqeeq-studio-mobile-nav-albums" tag="button" label="اسم رابط الألبوم للهاتف" defaultText="ألبوم العقيق" as="button" onAction={() => go("/albums")} className={`aq-studio-mobile-link ${active === "albums" ? "aq-studio-mobile-link--active" : ""}`} />
              <VisualEditable id="aqeeq-studio-mobile-nav-showcase" tag="button" label="اسم رابط الأخبار للهاتف" defaultText="الأخبار والعروض" as="button" onAction={() => go("/offers")} className={`aq-studio-mobile-link ${active === "showcase" ? "aq-studio-mobile-link--active" : ""}`} />
            </div>
          )}
        </div>
      </header>

      {/* Universal Spotlight Search Dialog */}
      <AlaqeeqSpotlightSearch open={searchOpen} onOpenChange={setSearchOpen} dark={dark} />
    </div>
  );
}
