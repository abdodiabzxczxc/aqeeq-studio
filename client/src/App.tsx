import { lazy, Suspense, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { VisualEditorProvider } from "./components/VisualEditor";
import VisualGlobalSections from "./components/VisualGlobalSections";
import { RouteMotion } from "./components/ExperienceMotion";
import { PublishedHomepageProvider, usePublishedHomepage } from "./contexts/PublishedHomepageContext";
import { AqeeqBroadcastBanner } from "./components/AqeeqBroadcastBanner";
import { AqeeqOccasionRibbon } from "./components/AqeeqOccasionRibbon";
import { PwaInstallBanner } from "./components/PwaInstallBanner";
import { PodcastPlayerProvider, usePodcastPlayer } from "./components/AqeeqFloatingPodcastPlayer";
import { AqeeqAiAssistantWidget } from "./components/AqeeqAiAssistantWidget";

// 🚀 Core Public Pages (Directly Loaded for 0ms Instant Seamless Navigation)
import AlaqeeqStudioPage from "./pages/AlaqeeqStudioPage";
import AqeeqSchoolAboutPage from "./pages/AqeeqSchoolAboutPage";
import AqeeqSchoolAdmissionsPage from "./pages/AqeeqSchoolAdmissionsPage";
import AqeeqSchoolAccreditationsPage from "./pages/AqeeqSchoolAccreditationsPage";
import AqeeqArticlesPage from "./pages/AqeeqArticlesPage";
import AqeeqPodcastPage from "./pages/AqeeqPodcastPage";
import SchoolNewsPage from "./pages/SchoolNewsPage";
import AqeeqAlbumsPage from "./pages/AqeeqAlbumsPage";
import AqeeqShowcasePage from "./pages/AqeeqShowcasePage";

// 📦 Heavy Admin & Studio Chunks (Lazily loaded on demand)
const LoginPage = lazy(() => import("./pages/LoginPage"));
const AqeeqAdminDashboardPage = lazy(() => import("./pages/AqeeqAdminDashboardPage"));
const AqeeqAnalyticsDashboardPage = lazy(() => import("./pages/AqeeqAnalyticsDashboardPage"));
const AqeeqArticlesStudioPage = lazy(() => import("./pages/AqeeqArticlesStudioPage"));
const AqeeqPodcastStudioPage = lazy(() => import("./pages/AqeeqPodcastStudioPage"));
const SchoolNewsReaderPage = lazy(() => import("./pages/SchoolNewsReaderPage"));
const SchoolNewsMonthlyPage = lazy(() => import("./pages/SchoolNewsMonthlyPage"));
const JournalArchivePage = lazy(() => import("./pages/JournalArchivePage"));
const JournalStudioPage = lazy(() => import("./pages/JournalStudioPage"));
const AqeeqAlbumReaderPage = lazy(() => import("./pages/AqeeqAlbumReaderPage"));
const AqeeqAlbumStudioPage = lazy(() => import("./pages/AqeeqAlbumStudioPage"));
const AqeeqShowcaseStudioPage = lazy(() => import("./pages/AqeeqShowcaseStudioPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function ArticleDetailRoute({ params }: { params: { slug: string } }) {
  return <AqeeqArticlesPage params={params} />;
}

function JournalMonthRoute({ params }: { params: { monthKey: string } }) {
  return <SchoolNewsMonthlyPage monthKey={params.monthKey} standalone />;
}

function JournalIssueRoute({ params }: { params: { slug: string } }) {
  return <SchoolNewsReaderPage slug={params.slug} standalone />;
}

function AlbumReaderRoute({ params }: { params: { slug: string } }) {
  return <AqeeqAlbumReaderPage slug={params.slug} />;
}

function ScrollToTopOnNavigation() {
  const [location] = useLocation();

  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    // 1. Instant scroll reset to top
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // 2. Secondary frame check to ensure any dynamic layout reflows stay at the top
    const frame = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });

    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 60);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [location]);

  return null;
}

function Router() {
  const [location] = useLocation();
  return (
    <>
      <ScrollToTopOnNavigation />
      <RouteMotion routeKey={location}>
        <Suspense fallback={null}>
          <Switch>
            <Route path="/" component={AlaqeeqStudioPage} />
            <Route path="/studio" component={AlaqeeqStudioPage} />
            <Route path="/about" component={AqeeqSchoolAboutPage} />
            <Route path="/admissions" component={AqeeqSchoolAdmissionsPage} />
            <Route path="/admission" component={AqeeqSchoolAdmissionsPage} />
            <Route path="/fees" component={AqeeqSchoolAdmissionsPage} />
            <Route path="/prices" component={AqeeqSchoolAdmissionsPage} />
            <Route path="/accreditations" component={AqeeqSchoolAccreditationsPage} />
            <Route path="/quality" component={AqeeqSchoolAccreditationsPage} />
            <Route path="/login" component={LoginPage} />

            <Route path="/admin" component={AqeeqAdminDashboardPage} />
            <Route path="/articles/manage" component={AqeeqArticlesStudioPage} />
            <Route path="/articles" component={AqeeqArticlesPage} />
            <Route path="/articles/:slug" component={ArticleDetailRoute} />
            <Route path="/atheer/manage" component={AqeeqPodcastStudioPage} />
            <Route path="/atheer" component={AqeeqPodcastPage} />
            <Route path="/podcast/manage" component={AqeeqPodcastStudioPage} />
            <Route path="/podcast" component={AqeeqPodcastPage} />
            <Route path="/journal" component={SchoolNewsPage} />
            <Route path="/journal/archive" component={JournalArchivePage} />
            <Route path="/journal/manage" component={JournalStudioPage} />
            <Route path="/journal/month/:monthKey" component={JournalMonthRoute} />
            <Route path="/journal/issue/:slug" component={JournalIssueRoute} />
            <Route path="/journal/:slug" component={JournalIssueRoute} />
            <Route path="/albums/manage" component={AqeeqAlbumStudioPage} />
            <Route path="/albums/:slug" component={AlbumReaderRoute} />
            <Route path="/albums" component={AqeeqAlbumsPage} />
            <Route path="/showcase/manage" component={AqeeqShowcaseStudioPage} />
            <Route path="/showcase" component={AqeeqShowcasePage} />
            <Route path="/offers/manage" component={AqeeqShowcaseStudioPage} />
            <Route path="/offers" component={AqeeqShowcasePage} />
            <Route path="/news/manage" component={AqeeqShowcaseStudioPage} />
            <Route path="/news" component={AqeeqShowcasePage} />
            <Route path="/news/month/:monthKey" component={LegacyNewsMonthRedirect} />
            <Route path="/news/:slug" component={LegacyNewsSlugRedirect} />
            <Route path="/admin/analytics" component={AqeeqAnalyticsDashboardPage} />
            <Route path="/404" component={NotFound} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </RouteMotion>
    </>
  );
}


function LegacyNewsManageRedirect() {
  const [, navigate] = useLocation();
  useEffect(() => { navigate("/journal/manage", { replace: true }); }, [navigate]);
  return null;
}

function LegacyNewsMonthRedirect({ params }: { params: { monthKey: string } }) {
  const [, navigate] = useLocation();
  useEffect(() => { navigate(`/journal/month/${params.monthKey}`, { replace: true }); }, [params.monthKey, navigate]);
  return null;
}

function LegacyNewsSlugRedirect({ params }: { params: { slug: string } }) {
  const [, navigate] = useLocation();
  useEffect(() => { navigate(`/journal/${params.slug}`, { replace: true }); }, [params.slug, navigate]);
  return null;
}

function LegacyNewsRedirect() {
  const [, navigate] = useLocation();
  useEffect(() => { navigate("/journal", { replace: true }); }, [navigate]);
  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "oklch(13% 0.015 250)",
                border: "1px solid oklch(28% 0.025 250)",
                color: "oklch(87% 0.05 85)",
                fontFamily: "'Tajawal', sans-serif",
                direction: "rtl",
              },
            }}
          />
          <PublishedHomepageProvider>
            <VisualEditorProvider>
              <PodcastPlayerProvider>
                <StudioAppShell />
              </PodcastPlayerProvider>
            </VisualEditorProvider>
          </PublishedHomepageProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

import { useSiteTheme } from "./lib/useSiteTheme";
import { useAqeeqStudioTheme } from "./lib/aqeeqStudioTheme";
import { AqeeqCelebrationConfetti } from "./components/AqeeqCelebrationConfetti";

function StudioAppShell() {
  const [location] = useLocation();
  const isLoginPage = location === "/login";
  const { snapshot } = usePublishedHomepage();
  const brand = snapshot?.settings;
  const { activeItem } = usePodcastPlayer();
  const { isNationalDay } = useSiteTheme();
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";

  const brandStyle = {
    "--aq-gold": isNationalDay ? "#f8ca14" : (dark ? (brand?.brand_primary || "#e5b84f") : "#08467d"),
    "--aq-ink": dark ? (brand?.brand_surface || "#000000") : "#ffffff",
    "--aq-brand-secondary": isNationalDay ? "#003822" : (dark ? (brand?.brand_secondary || "#18293a") : "#f1f5f9"),
    "--aq-blue": isNationalDay ? "#005A36" : (brand?.brand_primary || "#08467d"),
    fontFamily: brand?.brand_font ? `'${brand.brand_font}', Tajawal, sans-serif` : undefined,
  } as React.CSSProperties;

  return (
    <div style={brandStyle} className={`aq-brand-shell ${isNationalDay ? "theme-saudi-national-day" : ""}`}>
      {/* 🎞️ Global Cinematic Film Grain Texture */}
      {!isLoginPage && <div className="aqeeq-grain-overlay" aria-hidden />}
      {!isLoginPage && isNationalDay && <AqeeqCelebrationConfetti />}
      {/* 🌟 Floating Gold & Emerald Stars Particles on ALL Pages */}
      {!isLoginPage && isNationalDay && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden z-20">
          <span className="snd-floating-star text-xs top-[92vh] left-[8%] [animation-duration:14s] [animation-delay:0s]">★</span>
          <span className="snd-floating-star text-sm top-[96vh] left-[22%] [animation-duration:19s] [animation-delay:3s]">✦</span>
          <span className="snd-floating-star text-xs top-[94vh] left-[45%] [animation-duration:16s] [animation-delay:7s]">★</span>
          <span className="snd-floating-star text-base top-[98vh] left-[68%] [animation-duration:22s] [animation-delay:1.5s]">✦</span>
          <span className="snd-floating-star text-xs top-[90vh] left-[84%] [animation-duration:17s] [animation-delay:5s]">★</span>
          <span className="snd-floating-star text-sm top-[95vh] left-[93%] [animation-duration:15s] [animation-delay:9s]">✦</span>
          <span className="snd-floating-star text-xs top-[93vh] left-[35%] [animation-duration:20s] [animation-delay:4s]">★</span>
        </div>
      )}
      <div className={`min-h-screen transition-[padding-bottom] duration-300 ${!isLoginPage && activeItem ? "pb-[100px] sm:pb-[120px]" : ""}`}>
        {!isLoginPage && <ErrorBoundary fallback={null}><AqeeqOccasionRibbon /></ErrorBoundary>}
        {!isLoginPage && <ErrorBoundary fallback={null}><AqeeqBroadcastBanner /></ErrorBoundary>}
        <ErrorBoundary><Router /></ErrorBoundary>

        {!isLoginPage && <ErrorBoundary fallback={null}><VisualGlobalSections /></ErrorBoundary>}
        {!isLoginPage && <ErrorBoundary fallback={null}><PwaInstallBanner /></ErrorBoundary>}
        {!isLoginPage && <ErrorBoundary fallback={null}><AqeeqAiAssistantWidget /></ErrorBoundary>}
      </div>

    </div>
  );
}

export default App;


