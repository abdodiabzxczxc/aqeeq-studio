import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ScanGate from "./pages/ScanGate";
import EventLandingPage from "./pages/EventLandingPage";
import EventWorkspacePage from "./pages/EventWorkspacePage";
import ControlCenterPage from "./pages/ControlCenterPage";
import CustomPage from "./pages/CustomPage";
import GuestLiveCardPage from "./pages/GuestLiveCardPage";
import AlaqeeqLivePage from "./pages/AlaqeeqLivePage";
import SchoolNewsPage from "./pages/SchoolNewsPage";
import JournalStudioPage from "./pages/JournalStudioPage";

import SchoolNewsReaderPage from "./pages/SchoolNewsReaderPage";
import SchoolNewsMonthlyPage from "./pages/SchoolNewsMonthlyPage";
import EventStagePage from "./pages/EventStagePage";
import EventMemoryPage from "./pages/EventMemoryPage";
import ActivityBlueprintsPage from "./pages/ActivityBlueprintsPage";
import JournalArchivePage from "./pages/JournalArchivePage";
import AlaqeeqStudioPage from "./pages/AlaqeeqStudioPage";
import AqeeqAlbumsPage from "./pages/AqeeqAlbumsPage";
import AqeeqAlbumReaderPage from "./pages/AqeeqAlbumReaderPage";
import AqeeqAlbumStudioPage from "./pages/AqeeqAlbumStudioPage";
import AqeeqShowcasePage from "./pages/AqeeqShowcasePage";
import AqeeqShowcaseStudioPage from "./pages/AqeeqShowcaseStudioPage";
import MaisonExperiencePage from "./pages/MaisonExperiencePage";
import MaisonVaultPage from "./pages/MaisonVaultPage";
import SchoolStoryPage from "./pages/SchoolStoryPage";
import LoginPage from "./pages/LoginPage";
import { VisualEditorProvider } from "./components/VisualEditor";
import VisualGlobalSections from "./components/VisualGlobalSections";
import { AlaqeeqStudioSiteHeader } from "./components/AlaqeeqStudioSiteHeader";
import { RouteMotion } from "./components/ExperienceMotion";
import { JOURNAL_ROUTES } from "./lib/journalRoutes";
import { useAuth } from "./_core/hooks/useAuth";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { PublishedHomepageProvider, usePublishedHomepage } from "./contexts/PublishedHomepageContext";


import AqeeqAdminDashboardPage from "./pages/AqeeqAdminDashboardPage";
import AqeeqAnalyticsDashboardPage from "./pages/AqeeqAnalyticsDashboardPage";
import { AqeeqBroadcastBanner } from "./components/AqeeqBroadcastBanner";
import { AqeeqOccasionRibbon } from "./components/AqeeqOccasionRibbon";
import { PwaInstallBanner } from "./components/PwaInstallBanner";

import AqeeqArticlesPage from "./pages/AqeeqArticlesPage";
import AqeeqArticlesStudioPage from "./pages/AqeeqArticlesStudioPage";
import AqeeqPodcastPage from "./pages/AqeeqPodcastPage";
import AqeeqPodcastStudioPage from "./pages/AqeeqPodcastStudioPage";
import AqeeqSchoolAboutPage from "./pages/AqeeqSchoolAboutPage";
import AqeeqSchoolAdmissionsPage from "./pages/AqeeqSchoolAdmissionsPage";
import AqeeqSchoolAccreditationsPage from "./pages/AqeeqSchoolAccreditationsPage";
import { PodcastPlayerProvider, usePodcastPlayer } from "./components/AqeeqFloatingPodcastPlayer";
import { AqeeqAiAssistantWidget } from "./components/AqeeqAiAssistantWidget";

function Router() {

  const [location] = useLocation();
  return (
    <RouteMotion routeKey={location}>
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
      <Route path="/articles/:slug" component={({ params }: { params: { slug: string } }) => <AqeeqArticlesPage params={params} />} />
      <Route path="/atheer/manage" component={AqeeqPodcastStudioPage} />
      <Route path="/atheer" component={AqeeqPodcastPage} />
      <Route path="/podcast/manage" component={AqeeqPodcastStudioPage} />
      <Route path="/podcast" component={AqeeqPodcastPage} />
      <Route path="/journal" component={SchoolNewsPage} />
      <Route path="/journal/archive" component={JournalArchivePage} />
      <Route path="/journal/manage" component={JournalStudioPage} />
      <Route path="/journal/month/:monthKey" component={({ params }: { params: { monthKey: string } }) => <SchoolNewsMonthlyPage monthKey={params.monthKey} standalone />} />
      <Route path="/journal/issue/:slug" component={({ params }: { params: { slug: string } }) => <SchoolNewsReaderPage slug={params.slug} standalone />} />
      <Route path="/journal/:slug" component={({ params }: { params: { slug: string } }) => <SchoolNewsReaderPage slug={params.slug} standalone />} />
      <Route path="/albums/manage" component={AqeeqAlbumStudioPage} />
      <Route path="/albums/:slug" component={({ params }: { params: { slug: string } }) => <AqeeqAlbumReaderPage slug={params.slug} />} />
      <Route path="/albums" component={AqeeqAlbumsPage} />
      <Route path="/offers/manage" component={AqeeqShowcaseStudioPage} />
      <Route path="/offers" component={AqeeqShowcasePage} />
      <Route path="/admin/analytics" component={AqeeqAnalyticsDashboardPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
    </RouteMotion>
  );
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
              <StudioAppShell />
            </VisualEditorProvider>
          </PublishedHomepageProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

import { useSiteTheme } from "./lib/useSiteTheme";
import { AqeeqCelebrationConfetti } from "./components/AqeeqCelebrationConfetti";

function StudioAppShell() {
  const { snapshot } = usePublishedHomepage();
  const brand = snapshot?.settings;
  const { activeItem } = usePodcastPlayer();
  const { isNationalDay } = useSiteTheme();

  const brandStyle = {
    "--aq-gold": isNationalDay ? "#f8ca14" : (brand?.brand_primary || "#e5b84f"),
    "--aq-ink": brand?.brand_surface || "#000000",
    "--aq-brand-secondary": isNationalDay ? "#003822" : (brand?.brand_secondary || "#18293a"),
    "--aq-blue": isNationalDay ? "#005A36" : (brand?.brand_primary || "#08467d"),
    fontFamily: brand?.brand_font ? `'${brand.brand_font}', Tajawal, sans-serif` : undefined,
  } as React.CSSProperties;

  return (
    <PodcastPlayerProvider>
      <div style={brandStyle} className={`aq-brand-shell ${isNationalDay ? "theme-saudi-national-day" : ""}`}>
        {isNationalDay && <AqeeqCelebrationConfetti />}
        {/* 🌟 Floating Gold & Emerald Stars Particles on ALL Pages */}
        {isNationalDay && (
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
        <div className={`min-h-screen transition-[padding-bottom] duration-300 ${activeItem ? "pb-[100px] sm:pb-[120px]" : ""}`}>
          <AqeeqOccasionRibbon />
          <AqeeqBroadcastBanner />
          <Router />

          <VisualGlobalSections />
          <PwaInstallBanner />
          <AqeeqAiAssistantWidget />
        </div>

      </div>
    </PodcastPlayerProvider>
  );
}

export default App;


