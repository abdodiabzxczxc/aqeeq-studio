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
import { PwaInstallBanner } from "./components/PwaInstallBanner";
import { PodcastPlayerProvider, usePodcastPlayer } from "./components/AqeeqFloatingPodcastPlayer";
// 🚀 Core Public Pages (Directly Loaded for 0ms Instant In-Memory Seamless Navigation)
import AlaqeeqStudioPage from "./pages/AlaqeeqStudioPage";
import AqeeqSchoolAboutPage from "./pages/AqeeqSchoolAboutPage";
import AqeeqSchoolAdmissionsPage from "./pages/AqeeqSchoolAdmissionsPage";
import AqeeqSchoolAccreditationsPage from "./pages/AqeeqSchoolAccreditationsPage";
import AqeeqArticlesPage from "./pages/AqeeqArticlesPage";
import AqeeqPodcastPage from "./pages/AqeeqPodcastPage";
import SchoolNewsPage from "./pages/SchoolNewsPage";
import AqeeqAlbumsPage from "./pages/AqeeqAlbumsPage";
import AqeeqShowcasePage from "./pages/AqeeqShowcasePage";

// 🤖 Lazy-loaded Assistant Widget (Isolated chunk)
const AqeeqAiAssistantWidget = lazy(() =>
  import("./components/AqeeqAiAssistantWidget").then((m) => ({ default: m.AqeeqAiAssistantWidget }))
);


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
const AqeeqProStudioPage = lazy(() => import("./pages/AqeeqProStudioPage"));
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
    // Single instant scroll reset — avoids Layout Thrashing from multiple calls
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
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
            <Route path="/studio" component={AqeeqProStudioPage} />
            <Route path="/about" component={AqeeqSchoolAboutPage} />
            <Route path="/admissions" component={AqeeqSchoolAdmissionsPage} />
            {/* Alias routes for SEO & external links — canonical is /admissions */}
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
            {/* Alias: /podcast mirrors /atheer — canonical is /atheer */}
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
import { AqeeqEventModal } from "./components/AqeeqEventModal";

function StudioAppShell() {
  const [location] = useLocation();
  const isLoginPage = location === "/login";
  const isDockPreview = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("dockpreview") === "1";
  const isStudioCanvasMode = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("studiomode") === "1";

  useEffect(() => {
    if (isDockPreview) {
      document.documentElement.dataset.dockPreview = "true";
    } else {
      delete document.documentElement.dataset.dockPreview;
    }

    if (isStudioCanvasMode) {
      document.documentElement.dataset.studioCanvas = "true";
    } else {
      delete document.documentElement.dataset.studioCanvas;
    }
  }, [isDockPreview, isStudioCanvasMode]);

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

  if (isDockPreview) {
    return (
      <div style={brandStyle} className={`aq-brand-shell overflow-hidden ${isNationalDay ? "theme-saudi-national-day" : ""}`}>
        <ErrorBoundary><Router /></ErrorBoundary>
      </div>
    );
  }

  return (
    <div style={brandStyle} className={`aq-brand-shell ${isNationalDay ? "theme-saudi-national-day" : ""}`}>
      {/* 🎞️ Global Cinematic Film Grain Texture */}
      {!isLoginPage && !isStudioCanvasMode && <div className="aqeeq-grain-overlay" aria-hidden />}
      {!isLoginPage && !isStudioCanvasMode && isNationalDay && <AqeeqCelebrationConfetti />}
      <div className={`min-h-screen transition-[padding-bottom] duration-300 ${!isLoginPage && activeItem && !isStudioCanvasMode ? "pb-[100px] sm:pb-[120px]" : ""}`}>
        {!isLoginPage && !isStudioCanvasMode && <ErrorBoundary fallback={null}><AqeeqBroadcastBanner /></ErrorBoundary>}
        <ErrorBoundary><Router /></ErrorBoundary>

        {!isLoginPage && <ErrorBoundary fallback={null}><VisualGlobalSections /></ErrorBoundary>}
        {!isLoginPage && !isStudioCanvasMode && <ErrorBoundary fallback={null}><PwaInstallBanner /></ErrorBoundary>}
        {!isLoginPage && !isStudioCanvasMode && (
          <ErrorBoundary fallback={null}>
            <Suspense fallback={null}>
              <AqeeqAiAssistantWidget />
            </Suspense>
          </ErrorBoundary>
        )}
        {!isLoginPage && !isStudioCanvasMode && (
          <ErrorBoundary fallback={null}>
            <AqeeqEventModal />
          </ErrorBoundary>
        )}
      </div>

    </div>
  );
}

export default App;


