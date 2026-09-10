import { trpc } from "@/lib/trpc";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { resolveStudioCardCovers } from "@/lib/studioCardCovers";
import { useAuth } from "@/_core/hooks/useAuth";
import { AlaqeeqStudioSiteHeader } from "@/components/AlaqeeqStudioSiteHeader";
import { AlaqeeqStudioSiteFooter } from "@/components/AlaqeeqStudioSiteFooter";
import { AqeeqAmbientLighting } from "@/components/AqeeqAmbientLighting";
import { AqeeqUnifiedVideoFrame } from "@/components/AqeeqVideoPlayer";
import { isAqeeqDriveVideo } from "@/lib/aqeeqAlbumMedia";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { AqeeqHorizontalScrubSection } from "@/components/AqeeqHorizontalScrubSection";
import { AqeeqMemoryWallSection } from "@/components/AqeeqMemoryWallSection";
import { AqeeqLiveArchiveSection } from "@/components/AqeeqLiveArchiveSection";
import { AqeeqCursorHoverPreview, triggerCursorPreview } from "@/components/AqeeqCursorHoverPreview";
import { useVisualEditorState, VisualEditable, VisualIcon, VisualImage } from "@/components/VisualEditor";
import { AqeeqInteractiveFxModal, type InteractiveHoverItem, DEFAULT_WELLINGTON_HOVER_ITEMS } from "@/components/AqeeqInteractiveFxModal";
import { AqeeqUniversalMediaPickerModal, type MediaPickerItem } from "@/components/AqeeqUniversalMediaPickerModal";
import {
  ArrowUp,
  ArrowUpLeft,
  Award,
  Bell,
  BookOpen,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Edit3,
  Flame,
  Heart,
  Instagram,
  Facebook,
  Youtube,
  MessageCircle,
  Phone,
  Loader2,
  MapPin,
  Play,
  Quote,
  Radio,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  X,
  Newspaper,
  Mic,
  Video,
  Globe2,
  Users,
  Send,
  GraduationCap,
  Calculator,
} from "lucide-react";

import { useEffect, useMemo, useState, useRef } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { FastInstagramEmbed, XEmbed } from "@/components/AqeeqAlbumSocialEmbed";
import { AqeeqNewsMarquee } from "@/components/AqeeqNewsMarquee";
import { AqeeqHomeBentoGrid } from "@/components/AqeeqHomeBentoGrid";
import { AqeeqHomeTabsLibrary } from "@/components/AqeeqHomeTabsLibrary";
import { useSiteTheme } from "@/lib/useSiteTheme";
import { AqeeqNationalTraitsSection } from "@/components/AqeeqNationalTraitsSection";
import AqeeqSchoolAppShowcaseSection from "@/components/AqeeqSchoolAppShowcaseSection";

import { AqeeqWeeklyHighlightsSection } from "@/components/AqeeqWeeklyHighlightsSection";



function directDriveImage(url: string | null | undefined) {
  if (!url) return null;
  const id =
    url.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/)?.[1] ||
    url.match(/[?&]id=([^&]+)/)?.[1] ||
    url.match(/lh3\.googleusercontent\.com\/d\/([A-Za-z0-9_-]+)/)?.[1];
  return id ? "/api/drive-proxy/" + id : url;
}

function SnapchatIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12.166 2C8.36 2 6.27 4.29 6.27 7.07c0 1.25.46 2.37 1.05 3.19.14.19.17.43.07.64-.19.4-.64.81-1.39 1.01-.35.09-.59.4-.57.76.03.48.42.79.88.79.13 0 .27-.02.4-.08.57-.23 1.1-.3 1.54-.15.25.09.4.3.4.57 0 .8-.56 2.37-2.3 3.03-.43.16-.69.61-.59 1.06.1.44.53.75.98.71 1.45-.13 2.76.62 3.65 1.55.3.31.72.48 1.15.48h.04c.43 0 .85-.17 1.15-.48.89-.93 2.2-1.68 3.65-1.55.45.04.88-.27.98-.71.1-.45-.16-.9-.59-1.06-1.74-.66-2.3-2.23-2.3-3.03 0-.27.15-.48.4-.57.44-.15.97-.08 1.54.15.13.06.27.08.4.08.46 0 .85-.31.88-.79.02-.36-.22-.67-.57-.76-.75-.2-1.2-.61-1.39-1.01-.1-.21-.07-.45.07-.64.59-.82 1.05-1.94 1.05-3.19C17.73 4.29 15.64 2 12.166 2z" />
    </svg>
  );
}

function StudioCardImage({
  id,
  label,
  src,
  alt,
  imageClassName = "object-cover",
}: {
  id: string;
  label: string;
  src: string;
  alt: string;
  imageClassName?: string;
}) {
  const { getOverride } = useVisualEditorState();
  const override = getOverride(id);
  const resolvedSrc = override?.mediaUrl || src;
  const resolvedAlt = override?.altText || alt;
  return (
    <VisualEditable id={id} tag="image" label={label} as="span" className="absolute inset-0 block overflow-hidden">
      <img loading="lazy" src={resolvedSrc} alt={resolvedAlt} className={"h-full w-full " + imageClassName} />
    </VisualEditable>
  );
}


function ArchiveCard({
  id,
  title,
  label,
  body,
  imageUrl,
  previousImageUrl,
  onOpen,
  icon,
  count,
  dark,
}: {
  id: string;
  title: string;
  label: string;
  body: string;
  imageUrl?: string | null;
  previousImageUrl?: string | null;
  onOpen: () => void;
  icon: "book" | "camera" | "clapperboard";
  count: number;
  dark: boolean;
}) {
  return (
    <article
      className={"aq-studio-share-card group relative min-w-0 overflow-hidden rounded-[2rem] border transition duration-300 hover:-translate-y-1 " + (
        dark
          ? "border-[#f8ca14]/30 bg-[#080808] shadow-[0_24px_60px_rgba(0,0,0,0.5)] hover:border-[#f8ca14]/60 hover:shadow-[0_30px_70px_rgba(248,202,20,0.15)]"
          : "border-[#08467d]/20 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:border-[#08467d]/50 hover:shadow-[0_25px_60px_rgba(8,70,125,0.12)]"
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,transparent_45%,rgba(255,255,255,0.03)_46%,transparent_47%)]" />
      <button
        type="button"
        onClick={onOpen}
        className={"aq-studio-share-media relative block h-[180px] sm:h-[240px] w-full overflow-hidden border-b text-right " + (
          dark ? "border-white/[0.08] bg-[#0c0c0c]" : "border-black/[0.06] bg-[#f8f8f8]"
        )}
      >
        <div className={"pointer-events-none absolute inset-y-5 left-[16%] w-[59%] rotate-[-6deg] overflow-hidden rounded-[1.2rem] border opacity-40 " + (
          dark ? "border-white/[0.1] bg-[#141414]" : "border-black/[0.08] bg-[#ebebeb]"
        )}>
          <StudioCardImage id={id + "-image-echo"} label={"صورة سابقة " + title} src={previousImageUrl || imageUrl || ""} alt="" imageClassName="object-cover" />
        </div>
        <div className={"absolute inset-y-4 right-[13%] w-[62%] overflow-hidden rounded-[1.25rem] border p-2 shadow-xl " + (
          dark ? "border-[#f8ca14]/60 bg-[#141414]" : "border-[#08467d]/40 bg-white"
        )}>
          <StudioCardImage id={id + "-image"} label={"أحدث صورة " + title} src={imageUrl || ""} alt={"أحدث غلاف " + title} imageClassName="rounded-[0.85rem] object-cover transition duration-500 group-hover:scale-[1.03]" />
        </div>
        <span className={"pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 " + (
          dark ? "bg-gradient-to-t from-[#080808] to-transparent" : "bg-gradient-to-t from-white to-transparent"
        )} />
        <VisualEditable
          id={id + "-label"}
          tag="text"
          label={"شارة " + title}
          defaultText={label}
          as="span"
          className={"pointer-events-none absolute bottom-4 right-5 z-20 text-[9px] font-black tracking-[0.16em] " + (
            dark ? "text-[#f8ca14]" : "text-[#08467d]"
          )}
        />
      </button>
      <div className="relative flex min-h-[216px] flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <VisualEditable
            id={id + "-title"}
            tag="text"
            label={"عنوان " + title}
            defaultText={title}
            as="h2"
            className={"min-w-0 text-2xl font-black leading-tight md:text-[1.75rem] " + (dark ? "text-white" : "text-black")}
          />
          <VisualIcon
            id={id + "-icon"}
            label={"أيقونة " + title}
            icon={icon}
            className={"grid h-11 w-11 shrink-0 place-items-center rounded-xl border " + (
              dark
                ? "border-[#f8ca14]/35 bg-[#f8ca14]/10 text-[#f8ca14] shadow-[0_0_15px_rgba(248,202,20,0.15)]"
                : "border-[#08467d]/30 bg-[#08467d]/10 text-[#08467d]"
            )}
            size={20}
          />
        </div>
        <VisualEditable id={id + "-body"} tag="text" label={"وصف " + title} defaultText={body} as="p" className={"mt-3 text-sm leading-7 " + (dark ? "text-slate-400" : "text-slate-600")} />
        <div className={"mt-auto flex items-end justify-between border-t pt-4 " + (dark ? "border-white/[0.08]" : "border-black/[0.08]")}>
          <VisualEditable
            id={id + "-action"}
            tag="button"
            label={"زر " + title}
            defaultText="استكشف الآن"
            as="button"
            onAction={onOpen}
            className={"inline-flex items-center gap-2 border-b pb-1.5 text-sm font-black transition " + (
              dark
                ? "border-[#f8ca14]/70 text-[#f8ca14] hover:opacity-80"
                : "border-[#08467d]/70 text-[#08467d] hover:opacity-80"
            )}
          >
            {(text) => (
              <>
                {text} <VisualIcon id={id + "-action-icon"} label={"أيقونة زر " + title} icon="external" size={15} />
              </>
            )}
          </VisualEditable>
          <span className="text-left">
            <b className={"block text-2xl font-black " + (dark ? "text-white" : "text-black")}>{String(count).padStart(2, "0")}</b>
            <small className={"text-[9px] font-black tracking-[0.16em] " + (dark ? "text-[#f8ca14]/70" : "text-[#08467d]/70")}>ARCHIVED</small>
          </span>
        </div>
      </div>
    </article>
  );
}

type StoryItem = {
  id: string;
  title: string;
  category: string;
  imageUrl?: string | null;
  time: string;
  sourceType: "journal" | "album" | "post" | "x" | "instagram" | "youtube" | "article" | "showcase" | "podcast" | "custom";
  targetUrl: string;
  buttonLabel: string;
  youtubeId?: string | null;
  videoUrl?: string | null;
  isPinned?: boolean;
};

function formatArabicTimeAgo(dateVal: Date | string | number | undefined): { isWithin24Hours: boolean; label: string } {
  if (!dateVal) return { isWithin24Hours: false, label: "" };
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return { isWithin24Hours: false, label: "" };
  const diffMs = Date.now() - d.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  // Consider it fresh if within the last 24 hours (with 1h clock skew margin)
  const isWithin24Hours = diffHours >= -1 && diffHours <= 24;

  if (diffHours < 1) {
    const mins = Math.max(1, Math.round(diffMs / (1000 * 60)));
    return { isWithin24Hours, label: `منذ ${mins} دقيقة` };
  }
  if (diffHours < 24) {
    return { isWithin24Hours, label: `منذ ${Math.round(diffHours)} ساعة` };
  }
  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return { isWithin24Hours, label: "أمس" };
  if (diffDays < 7) return { isWithin24Hours, label: `منذ ${diffDays} أيام` };
  return { isWithin24Hours, label: "مؤخراً" };
}

export default function AlaqeeqStudioPublicPage() {
  const [, navigate] = useLocation();
  const { theme } = useAqeeqStudioTheme();
  const { isNationalDay, backgroundPatternUrl, backgroundPatternOpacity, customBadgeText, variantInfo } = useSiteTheme();
  const dark = theme === "dark";
  const { isEditing, isPreviewing, select, selectedId } = useVisualEditorState();
  const isEditorActive = isEditing && !isPreviewing;

  const { data: issues = [], isLoading: issuesLoading } = trpc.schoolNews.publicList.useQuery(undefined, { refetchOnWindowFocus: false });
  const { data: albums = [], isLoading: albumsLoading } = trpc.aqeeqAlbums.publicList.useQuery(undefined, { refetchOnWindowFocus: false });
  const { data: showcases = [], isLoading: showcasesLoading } = trpc.aqeeqShowcases.publicList.useQuery(undefined, { refetchOnWindowFocus: false });
  const { data: articles = [], isLoading: articlesLoading } = trpc.articles.listPublished.useQuery({}, { refetchOnWindowFocus: false });
  const { data: podcasts = [], isLoading: podcastsLoading } = trpc.podcasts.list.useQuery({}, { refetchOnWindowFocus: false });
  const { data: orchestration, refetch: refetchOrchestration } = trpc.executiveAdmin.getSiteOrchestration.useQuery(undefined, { refetchOnMount: true, staleTime: 0 });

  // Interactive FX Modal & Media Picker State
  const [editingHoverItem, setEditingHoverItem] = useState<InteractiveHoverItem | null>(null);
  const [mediaPickerConfig, setMediaPickerConfig] = useState<{
    open: boolean;
    title: string;
    currentUrl?: string | null;
    onSelect: (item: MediaPickerItem) => void;
  }>({
    open: false,
    title: "اختيار صورة أو غلاف",
    currentUrl: null,
    onSelect: () => {},
  });

  const openMediaPicker = (title: string, currentUrl: string | null | undefined, onSelect: (item: MediaPickerItem) => void) => {
    setMediaPickerConfig({
      open: true,
      title,
      currentUrl,
      onSelect: (item) => {
        onSelect(item);
        setMediaPickerConfig((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const setOrchestrationMutation = trpc.executiveAdmin.setSiteOrchestration.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ وتحديث العنصر التفاعلي بنجاح! ✨");
      void refetchOrchestration();
    },
    onError: (err) => {
      toast.error(err.message || "تعذر حفظ التعديل");
    },
  });

  const handleSaveHoverItem = async (updatedItem: InteractiveHoverItem) => {
    const currentItems = (((orchestration?.interactiveFx as any)?.wellingtonHoverItems as InteractiveHoverItem[])?.length
      ? ((orchestration?.interactiveFx as any)?.wellingtonHoverItems as InteractiveHoverItem[])
      : DEFAULT_WELLINGTON_HOVER_ITEMS);

    const nextItems = currentItems.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    );

    if (!nextItems.some((item) => item.id === updatedItem.id)) {
      nextItems.push(updatedItem);
    }

    await setOrchestrationMutation.mutateAsync({
      interactiveFx: {
        ...((orchestration?.interactiveFx as any) || {}),
        wellingtonHoverItems: nextItems,
      },
    });
  };

  const hoverItems = useMemo(() => {
    const items = ((orchestration?.interactiveFx as any)?.wellingtonHoverItems as InteractiveHoverItem[]) || [];
    return items.length > 0 ? items : DEFAULT_WELLINGTON_HOVER_ITEMS;
  }, [orchestration?.interactiveFx]);

  const cogniaItem = hoverItems.find((it) => it.id === "wellington-cognia") || DEFAULT_WELLINGTON_HOVER_ITEMS[0];
  const ieltsItem = hoverItems.find((it) => it.id === "wellington-ielts") || DEFAULT_WELLINGTON_HOVER_ITEMS[1];
  const satItem = hoverItems.find((it) => it.id === "wellington-sat") || DEFAULT_WELLINGTON_HOVER_ITEMS[2];
  const communityItem = hoverItems.find((it) => it.id === "wellington-community") || DEFAULT_WELLINGTON_HOVER_ITEMS[3];

  const issue = issues[0];
  const album = albums[0];
  const showcase = showcases[0];

  const { data: showcaseDetail } = trpc.aqeeqShowcases.publicShowcase.useQuery(
    { slug: showcase?.slug || "news-offers" },
    { enabled: Boolean(showcase?.slug), refetchOnWindowFocus: false }
  );

  const activeShowcasePosts: any[] = (showcaseDetail?.posts && showcaseDetail.posts.length > 0)
    ? (showcaseDetail.posts as any[])
    : ((showcase as any)?.posts as any[]) || [];

  const newestShowcasePosts = useMemo(() => {
    return [...activeShowcasePosts].sort((a, b) => {
      const orderA = typeof a.postOrder === "number" ? a.postOrder : 9999;
      const orderB = typeof b.postOrder === "number" ? b.postOrder : 9999;
      if (orderA !== orderB) return orderA - orderB;
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [activeShowcasePosts]);

  const defaultJournalCovers = resolveStudioCardCovers(issues, (entry) => entry.coverUrl);
  const defaultAlbumCovers = resolveStudioCardCovers(albums, (entry) => directDriveImage(entry.coverUrl) || entry.coverUrl);
  const defaultShowcaseCovers = resolveStudioCardCovers(
    newestShowcasePosts,
    (entry) => directDriveImage(entry.thumbnailUrl) || entry.thumbnailUrl || (entry.mediaType === "image" ? entry.mediaUrl : null)
  );

  // Dynamic Custom / Auto Cover resolution based on Admin Orchestration
  const customJournalCover = orchestration?.heroCovers?.journalMode === "custom" && orchestration?.heroCovers?.customJournalIssueId
    ? issues.find((i) => i.id === orchestration.heroCovers.customJournalIssueId)?.coverUrl
    : null;
  const customAlbumCover = orchestration?.heroCovers?.albumsMode === "custom" && orchestration?.heroCovers?.customAlbumId
    ? directDriveImage(albums.find((a) => a.id === orchestration.heroCovers.customAlbumId)?.coverUrl) || albums.find((a) => a.id === orchestration.heroCovers.customAlbumId)?.coverUrl
    : null;
  const customShowcaseCover = orchestration?.heroCovers?.showcaseMode === "custom" && orchestration?.heroCovers?.customShowcasePostId
    ? (() => {
        const p = activeShowcasePosts.find((post) => post.id === orchestration.heroCovers.customShowcasePostId);
        return p ? (directDriveImage(p.thumbnailUrl) || p.thumbnailUrl || p.mediaUrl) : null;
      })()
    : null;

  const [cachedHeroCovers] = useState(() => {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("aqeeq-hero-cached-covers");
        if (raw) return JSON.parse(raw) as { journal?: string; album?: string; showcase?: string };
      }
    } catch {}
    return {
      journal: "/covers/student-excellence-about.jpg",
      album: "/covers/first-lego-champions.png",
      showcase: "/covers/cover-admissions.jpg",
    };
  });

  const primaryShowcaseCover = defaultShowcaseCovers.front
    || (showcase?.coverUrl ? (directDriveImage(showcase.coverUrl) || showcase.coverUrl) : null)
    || cachedHeroCovers?.showcase
    || "/covers/cover-admissions.jpg";

  const resolvedJournalCover = customJournalCover || defaultJournalCovers.front || cachedHeroCovers?.journal || "/covers/student-excellence-about.jpg";
  const resolvedAlbumCover = customAlbumCover || defaultAlbumCovers.front || cachedHeroCovers?.album || "/covers/first-lego-champions.png";
  const resolvedShowcaseCover = customShowcaseCover || primaryShowcaseCover;

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && resolvedJournalCover && resolvedAlbumCover && resolvedShowcaseCover) {
        localStorage.setItem(
          "aqeeq-hero-cached-covers",
          JSON.stringify({
            journal: resolvedJournalCover,
            album: resolvedAlbumCover,
            showcase: resolvedShowcaseCover,
          })
        );
      }
    } catch {}
  }, [resolvedJournalCover, resolvedAlbumCover, resolvedShowcaseCover]);

  const journalCovers = {
    front: resolvedJournalCover,
    back: defaultJournalCovers.back || resolvedJournalCover,
  };
  const albumCovers = {
    front: resolvedAlbumCover,
    back: defaultAlbumCovers.back || resolvedAlbumCover,
  };
  const showcaseCovers = {
    front: resolvedShowcaseCover,
    back: defaultShowcaseCovers.back || resolvedShowcaseCover,
  };
  const featuredEventPost = orchestration?.weeklyBento?.featuredMode === "custom" && orchestration?.weeklyBento?.customPostId
    ? activeShowcasePosts.find((p) => p.id === orchestration.weeklyBento.customPostId) || newestShowcasePosts[0]
    : newestShowcasePosts[0];
  const logoUrl = issues.find((entry) => entry.headerLogoUrl)?.headerLogoUrl || null;

  // Interactive States for New Showcased Sections
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [isStoryPaused, setIsStoryPaused] = useState(false);
  const [likesCount, setLikesCount] = useState(482);
  const [hasLiked, setHasLiked] = useState(false);
  const [isPlayingQuoteAudio, setIsPlayingQuoteAudio] = useState(false);

  const totalPages = issues.reduce((total, entry) => total + Number(entry.pageCount || 0), 0);
  const totalFiles = albums.reduce((total, entry) => total + Number(entry.mediaCount || 0), 0);
  const totalPosts = showcases.reduce((total, entry) => total + Number(entry.postCount || 0), 0);

// Dynamic Stories Data (Supporting All Content Types + Custom Selected Stories)
  const storiesList: StoryItem[] = useMemo(() => {
    const hiddenSet = new Set(orchestration?.hiddenStoryIds || []);
    const customSet = new Set(orchestration?.customStoryIds || []);
    const expiryMap: Record<string, number> = orchestration?.storyExpiryMap || {};
    const nowMs = Date.now();
    const items: (StoryItem & { timestamp: number })[] = [];

    // Check if a story is still within its pinned window
    const isPinnedAndValid = (id: string): boolean => {
      if (!customSet.has(id) && !customSet.has(`story-${id}`)) return false;
      const expiresAt = expiryMap[id] ?? null;
      // If no expiry recorded, treat as valid (legacy entries)
      if (!expiresAt) return true;
      return nowMs < expiresAt;
    };

    // Helper to evaluate freshness / label
    const getTime = (dateVal: any) => {
      const { isWithin24Hours, label } = formatArabicTimeAgo(dateVal);
      const ts = new Date(dateVal || 0).getTime();
      return { isWithin24Hours, label: label || "مؤخراً", ts };
    };

    // 1. Articles
    for (const a of articles) {
      const id = "story-article-" + a.id;
      const rawId = "article-" + a.id;
      if (hiddenSet.has(id) || hiddenSet.has(rawId)) continue;
      const isPinned = isPinnedAndValid(id) || isPinnedAndValid(rawId);
      const { isWithin24Hours, label, ts } = getTime(a.publishedAt || a.createdAt);
      if (!isPinned && !isWithin24Hours && customSet.size > 0) continue;

      items.push({
        id,
        title: a.title,
        category: "مقال جديد",
        imageUrl: directDriveImage(a.coverUrl) || a.coverUrl || null,
        time: label,
        sourceType: "article",
        targetUrl: "/articles/" + a.slug,
        buttonLabel: "قراءة المقال الآن",
        isPinned,
        timestamp: ts,
      });
    }

    // 2. Video Showcases
    for (const s of showcases) {
      const id = "story-showcase-" + s.id;
      const rawId = "showcase-" + s.id;
      if (hiddenSet.has(id) || hiddenSet.has(rawId)) continue;
      const isPinned = isPinnedAndValid(id) || isPinnedAndValid(rawId);
      const { isWithin24Hours, label, ts } = getTime(s.createdAt);
      if (!isPinned && !isWithin24Hours && customSet.size > 0) continue;

      items.push({
        id,
        title: s.title,
        category: "مرئي وتغطية",
        imageUrl: directDriveImage(s.coverUrl) || s.coverUrl || null,
        time: label,
        sourceType: "showcase",
        targetUrl: "/showcase/" + s.slug,
        buttonLabel: "مشاهدة العرض المرئي",
        isPinned,
        timestamp: ts,
      });
    }

    // 3. Podcasts
    for (const p of podcasts) {
      const id = "story-podcast-" + p.id;
      const rawId = "podcast-" + p.id;
      if (hiddenSet.has(id) || hiddenSet.has(rawId)) continue;
      const isPinned = isPinnedAndValid(id) || isPinnedAndValid(rawId);
      const { isWithin24Hours, label, ts } = getTime(p.createdAt);
      if (!isPinned && !isWithin24Hours && customSet.size > 0) continue;

      items.push({
        id,
        title: p.title,
        category: p.mediaType === "video" ? "فيديو بودكاست" : "أثير العقيق 🎙️",
        imageUrl: directDriveImage(p.coverUrl) || p.coverUrl || null,
        time: label,
        sourceType: "podcast",
        targetUrl: "/podcast",
        buttonLabel: "استمع للبودكاست",
        isPinned,
        timestamp: ts,
      });
    }

    // 4. Showcase Posts
    for (const post of activeShowcasePosts) {
      const id = "story-post-" + post.id;
      const rawId = "post-" + post.id;
      if (hiddenSet.has(id) || hiddenSet.has(rawId)) continue;
      const isPinned = isPinnedAndValid(id) || isPinnedAndValid(rawId);
      const { isWithin24Hours, label, ts } = getTime(post.createdAt);
      if (!isPinned && !isWithin24Hours && customSet.size > 0) continue;

      const postUrl = post.externalUrl || post.mediaUrl || "";
      const isX = post.sourceType === "x" || postUrl.includes("x.com") || postUrl.includes("twitter.com");
      const isInsta = post.sourceType === "instagram" || postUrl.includes("instagram.com");
      const isYT = post.sourceType === "youtube" || postUrl.includes("youtube.com") || postUrl.includes("youtu.be");

      if (isX) {
        items.push({
          id,
          title: post.title || post.fileName || "منشور من منصة 𝕏",
          category: "منشور 𝕏",
          imageUrl: post.thumbnailUrl ? (directDriveImage(post.thumbnailUrl) || post.thumbnailUrl) : null,
          time: label,
          sourceType: "x",
          targetUrl: postUrl || "/offers",
          buttonLabel: "فتح المنشور على منصة 𝕏",
          isPinned,
          timestamp: ts,
        });
      } else if (isInsta) {
        items.push({
          id,
          title: post.title || post.fileName || "منشور Instagram",
          category: "Instagram",
          imageUrl: post.thumbnailUrl ? (directDriveImage(post.thumbnailUrl) || post.thumbnailUrl) : null,
          time: label,
          sourceType: "instagram",
          targetUrl: postUrl || "/offers",
          buttonLabel: "فتح المنشور على Instagram",
          isPinned,
          timestamp: ts,
        });
      } else if (isYT) {
        let ytId: string | null = null;
        try {
          const match = postUrl.match(/(?:v=|\/shorts\/|\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
          if (match) ytId = match[1];
        } catch {}
        items.push({
          id,
          title: post.title || post.fileName || "فيديو YouTube",
          category: "فيديو YouTube",
          imageUrl: ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : null,
          time: label,
          sourceType: "youtube",
          targetUrl: postUrl || "/offers",
          buttonLabel: "مشاهدة الفيديو على YouTube",
          youtubeId: ytId,
          isPinned,
          timestamp: ts,
        });
      } else {
        const img = directDriveImage(post.thumbnailUrl) || post.thumbnailUrl || post.mediaUrl;
        const isVid = post.mediaType === "video" || isAqeeqDriveVideo(post.mediaUrl);
        items.push({
          id,
          title: post.title || post.fileName.replace(/\.[^.]+$/, ""),
          category: isVid ? "فيديو جديد" : "خبر جديد",
          imageUrl: img || null,
          time: label,
          sourceType: isVid ? "showcase" : "post",
          targetUrl: "/offers",
          buttonLabel: isVid ? "مشاهدة الفيديو والتغطية" : "فتح الخبر والتغطية الكاملة",
          videoUrl: isVid ? post.mediaUrl : null,
          isPinned,
          timestamp: ts,
        });
      }
    }

    // 5. Journal Issues
    for (const iss of issues) {
      const id = "story-issue-" + iss.id;
      const rawId = "issue-" + iss.id;
      if (hiddenSet.has(id) || hiddenSet.has(rawId)) continue;
      const isPinned = isPinnedAndValid(id) || isPinnedAndValid(rawId);
      const { isWithin24Hours, label, ts } = getTime(iss.publishedAt || iss.createdAt || iss.issueDate);
      if (!isPinned && !isWithin24Hours && customSet.size > 0) continue;

      items.push({
        id,
        title: iss.title,
        category: "مجلة العقيق",
        imageUrl: directDriveImage(iss.coverUrl) || iss.coverUrl || null,
        time: label,
        sourceType: "journal",
        targetUrl: "/journal/issue/" + encodeURIComponent(iss.slug),
        buttonLabel: "تصفح مجلة العقيق الآن",
        isPinned,
        timestamp: ts,
      });
    }

    // 6. Albums
    for (const alb of albums) {
      const id = "story-album-" + alb.id;
      const rawId = "album-" + alb.id;
      if (hiddenSet.has(id) || hiddenSet.has(rawId)) continue;
      const isPinned = isPinnedAndValid(id) || isPinnedAndValid(rawId);
      const img = directDriveImage(alb.coverUrl) || alb.coverUrl;
      const { isWithin24Hours, label, ts } = getTime(alb.albumDate || alb.createdAt);
      if (!isPinned && !isWithin24Hours && customSet.size > 0) continue;

      items.push({
        id,
        title: alb.title,
        category: "ألبوم فعاليات",
        imageUrl: img || null,
        time: label,
        sourceType: "album",
        targetUrl: "/albums/" + encodeURIComponent(alb.slug),
        buttonLabel: "مشاهدة الألبوم بالكامل",
        isPinned,
        timestamp: ts,
      });
    }

    // 7. Custom Direct Site Stories (from Site Content Engine)
    if (orchestration?.siteStories && Array.isArray(orchestration.siteStories)) {
      for (const cs of orchestration.siteStories) {
        if (!cs.active) continue;
        if (hiddenSet.has(cs.id)) continue;
        items.push({
          id: cs.id,
          title: cs.title,
          category: cs.category || "إعلان هام 📢",
          imageUrl: directDriveImage(cs.imageUrl) || cs.imageUrl || null,
          time: "الآن",
          sourceType: "custom",
          targetUrl: cs.targetUrl || "/admissions",
          buttonLabel: cs.buttonLabel || "عرض التفاصيل",
          isPinned: cs.isPinned ?? true,
          timestamp: cs.isPinned ? Date.now() + 100000000 : (new Date(cs.createdAt || 0).getTime() || Date.now()),
        });
      }
    }

    // Sort: Pinned first, then newest timestamp first
    items.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return b.timestamp - a.timestamp;
    });

    return items;
  }, [activeShowcasePosts, issues, albums, articles, showcases, podcasts, orchestration?.hiddenStoryIds, orchestration?.customStoryIds, orchestration?.storyExpiryMap]);

  const isStoriesLoading = (issuesLoading || albumsLoading || showcasesLoading || articlesLoading || podcastsLoading) && storiesList.length === 0;

  // Enforce scroll to top on mount / refresh
  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, []);

  // Story Auto-Advance Timer (with pause on hover/hold)
  useEffect(() => {
    if (activeStoryIndex === null) {
      setStoryProgress(0);
      return;
    }
    if (isStoryPaused) return;

    const interval = setInterval(() => {
      setStoryProgress((prev) => {
        if (prev >= 100) {
          if (activeStoryIndex < storiesList.length - 1) {
            setActiveStoryIndex(activeStoryIndex + 1);
            return 0;
          } else {
            setActiveStoryIndex(null);
            return 0;
          }
        }
        return prev + 2;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [activeStoryIndex, storiesList.length, isStoryPaused]);

  // Keyboard navigation for Stories (ESC to close, Arrow keys to navigate)
  useEffect(() => {
    if (activeStoryIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveStoryIndex(null);
      } else if (e.key === "ArrowRight") {
        if (activeStoryIndex > 0) {
          setActiveStoryIndex(activeStoryIndex - 1);
          setStoryProgress(0);
        }
      } else if (e.key === "ArrowLeft") {
        if (activeStoryIndex < storiesList.length - 1) {
          setActiveStoryIndex(activeStoryIndex + 1);
          setStoryProgress(0);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeStoryIndex, storiesList.length]);

  const toggleLike = () => {
    if (hasLiked) {
      setLikesCount((prev) => prev - 1);
      setHasLiked(false);
    } else {
      setLikesCount((prev) => prev + 1);
      setHasLiked(true);
      toast.success("شكراً لتفاعلك وتشجيعك لأبطال العقيق! ❤️");
    }
  };

  const handleEventReminder = (eventName: string) => {
    toast.success("تم تفعيل التذكير بفعالية: " + eventName, {
      description: "سيتم إشعارك فور انطلاق التغطية المباشرة للفعالية.",
    });
  };

  const memoryEntries = [
    ...issues.slice(0, 2).map((entry) => ({
      id: "issue-" + entry.id,
      title: entry.title,
      label: "مجلة العقيق",
      imageUrl: entry.coverUrl || null,
      onOpen: () => navigate("/journal"),
    })),
    ...albums.slice(0, 2).map((entry) => ({
      id: "album-" + entry.id,
      title: entry.title,
      label: "ألبوم العقيق",
      imageUrl: directDriveImage(entry.coverUrl) || entry.coverUrl || null,
      onOpen: () => navigate("/albums"),
    })),
    ...showcases.slice(0, 1).map((entry) => ({
      id: "showcase-" + entry.id,
      title: entry.title,
      label: "الأخبار والعروض",
      imageUrl: directDriveImage(entry.coverUrl) || entry.coverUrl || null,
      onOpen: () => navigate("/offers"),
    })),
  ].slice(0, 3);

  const horizontalShowcaseItems = [
    ...issues.map((entry) => ({
      id: "issue-" + entry.id,
      title: entry.title,
      category: "journal" as const,
      badge: "مجلة العقيق",
      imageUrl: entry.coverUrl || null,
      href: `/journal/${entry.slug || entry.id}`,
      metaText: "العدد المدرسي الرسمي",
    })),
    ...albums.map((entry) => ({
      id: "album-" + entry.id,
      title: entry.title,
      category: "album" as const,
      badge: "ألبوم العقيق",
      imageUrl: directDriveImage(entry.coverUrl) || entry.coverUrl || null,
      href: `/albums/${entry.slug || entry.id}`,
      metaText: "تغطية مصورة كاملة",
    })),
    ...showcases.map((entry) => ({
      id: "showcase-" + entry.id,
      title: entry.title,
      category: "offer" as const,
      badge: "الأخبار والأنشطة",
      imageUrl: directDriveImage(entry.coverUrl) || entry.coverUrl || null,
      href: "/offers",
      metaText: "فعاليات العقيق الكبرى",
    })),
  ].slice(0, 8);

  // فحص الشاشات الكبيرة لضبط فيزياء تفتح الكروت (Desktop vs Mobile 3D Fan-out)
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // فيزياء تفتح كروت الهيرو في البعد الثالث مع السكرول (3D Fan-out on Scroll)
  const { scrollY } = useScroll();
  const rawHeroFrontCardX = useTransform(scrollY, [0, 500], [0, isDesktop ? -40 : -10]);
  const rawHeroFrontCardRotate = useTransform(scrollY, [0, 500], [0, isDesktop ? -7 : -2.5]);
  const rawHeroBackCardX = useTransform(scrollY, [0, 500], [0, isDesktop ? 40 : 10]);
  const rawHeroBackCardRotate = useTransform(scrollY, [0, 500], [0, isDesktop ? 7 : 2.5]);
  const rawHeroMiddleCardY = useTransform(scrollY, [0, 500], [0, isDesktop ? -30 : -10]);
  const rawHeroMiddleCardScale = useTransform(scrollY, [0, 500], [1, isDesktop ? 1.06 : 1.02]);

  const smoothConfig = { stiffness: 100, damping: 30, mass: 0.1, restDelta: 0.001 };

  const heroFrontCardX = useSpring(rawHeroFrontCardX, smoothConfig);
  const heroFrontCardRotate = useSpring(rawHeroFrontCardRotate, smoothConfig);
  const heroBackCardX = useSpring(rawHeroBackCardX, smoothConfig);
  const heroBackCardRotate = useSpring(rawHeroBackCardRotate, smoothConfig);
  const heroMiddleCardY = useSpring(rawHeroMiddleCardY, smoothConfig);
  const heroMiddleCardScale = useSpring(rawHeroMiddleCardScale, smoothConfig);

  // فيزياء تراجع الهيرو بانسيابية حريرية فائقة وبدون أي رجفة
  const rawHeroOpacity = useTransform(scrollY, [0, 500], [1, isDesktop ? 0.8 : 0.9]);
  const rawHeroY = useTransform(scrollY, [0, 500], [0, isDesktop ? 100 : 35]);
  const heroOpacity = rawHeroOpacity;
  const heroY = useSpring(rawHeroY, smoothConfig);

  // فيزياء ميلان كروت الهيرو بالماوس في البعد الثالث (3D Mouse Perspective Tilt)
  const [heroMouse, setHeroMouse] = useState({ x: 0, y: 0 });
  const heroTiltX = useSpring(heroMouse.y, { stiffness: 120, damping: 18 });
  const heroTiltY = useSpring(heroMouse.x, { stiffness: 120, damping: 18 });

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -14;
    setHeroMouse({ x, y });
  };
  const handleHeroMouseLeave = () => {
    setHeroMouse({ x: 0, y: 0 });
  };

  if (issuesLoading || albumsLoading || showcasesLoading) {
    return (
      <main dir="rtl" className={"min-h-screen overflow-x-hidden " + (dark ? "bg-black" : "bg-white")}>
        {/* Skeleton Header */}
        <div className="h-[60px] bg-transparent border-0" />
        {/* Skeleton Hero */}
        <div className="py-12 md:py-16 bg-transparent border-0">
          <div className="mx-auto max-w-[1380px] 2xl:max-w-[1560px] px-5 md:px-8">
            <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
              <div className="space-y-4 animate-pulse">
                <div className={`h-3 w-32 rounded-full ${dark ? "bg-white/10" : "bg-black/10"}`} />
                <div className={`h-12 w-3/4 rounded-2xl ${dark ? "bg-white/10" : "bg-black/10"}`} />
                <div className={`h-4 w-full rounded-xl ${dark ? "bg-white/[0.06]" : "bg-black/[0.06]"}`} />
                <div className={`h-4 w-5/6 rounded-xl ${dark ? "bg-white/[0.06]" : "bg-black/[0.06]"}`} />
                <div className="flex gap-3 mt-6">
                  {[1,2,3].map(i => <div key={i} className={`h-16 flex-1 rounded-2xl ${dark ? "bg-white/[0.06]" : "bg-black/[0.06]"}`} />)}
                </div>
              </div>
              <div className={`h-[290px] sm:h-[360px] lg:h-[430px] rounded-[2rem] animate-pulse ${dark ? "bg-white/[0.05]" : "bg-black/[0.05]"}`} />
            </div>
          </div>
        </div>
        {/* Skeleton Bento Grid */}
        <div className="py-14 md:py-20 bg-transparent border-0">
          <div className="mx-auto max-w-[1380px] 2xl:max-w-[1560px] px-5 md:px-8">
            <div className={`h-8 w-48 rounded-full mb-8 animate-pulse ${dark ? "bg-white/10" : "bg-black/10"}`} />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1,2,3,4].map(i => (
                <div key={i} className={`rounded-[2rem] h-[200px] animate-pulse ${dark ? "bg-white/[0.06]" : "bg-black/[0.06]"}`} />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className={"aq-studio-share min-h-screen overflow-x-clip relative " + (
        dark
          ? "aq-studio-share--dark text-white"
          : "aq-studio-share--light text-black"
      )}
      style={{
        background: dark ? "#000000" : "#ffffff",
      }}
    >
      {/* Global Unclipped Ambient Lighting Aura — floats smoothly across the entire page with zero borders */}
      <AqeeqAmbientLighting />

      <AlaqeeqStudioSiteHeader title="مدارس العقيق الأهلية والدولية" active="studio" logoUrl={logoUrl} />

      {/* 1. شريط «قصص ولحظات اليوم» (Stories 24H) — عائم بانسيابية تامة وبدون أي تقطيع لوني */}
      {storiesList.length > 0 ? (
        <section data-no-visual-edit="true" className="relative z-10 py-3.5 sm:py-5 transition bg-transparent border-0">
          <div className="mx-auto max-w-[1380px] 2xl:max-w-[1560px] px-4 sm:px-6 md:px-8">
            <div className="flex items-center gap-4 sm:gap-5 overflow-x-auto py-1 [&::-webkit-scrollbar]:hidden">
              {storiesList.map((story, index) => (
                <button
                  key={story.id}
                  type="button"
                  onClick={() => {
                    triggerCursorPreview({ visible: false });
                    setActiveStoryIndex(index);
                  }}
                  onMouseEnter={() => {
                    if (story.imageUrl) {
                      triggerCursorPreview({
                        visible: true,
                        imageUrl: story.imageUrl,
                        title: story.title,
                        badge: "لحظات وقصص العقيق",
                      });
                    }
                  }}
                  onMouseLeave={() => triggerCursorPreview({ visible: false })}
                  className={"group flex flex-col items-center gap-1.5 shrink-0 text-center transition active:scale-95"}
                >
                  <div className={"relative p-[2.5px] rounded-full transition duration-300 group-hover:scale-[1.12] " + (
                    isNationalDay
                      ? "snd-story-ring bg-gradient-to-tr from-[#f8ca14] via-[#5aba1c] to-[#005A36] shadow-[0_0_14px_rgba(248,202,20,0.35)]"
                      : dark
                      ? "bg-gradient-to-tr from-[#f8ca14] via-[#de191e] to-[#08467d] shadow-[0_0_12px_rgba(248,202,20,0.2)] group-hover:shadow-[0_0_22px_rgba(248,202,20,0.55)]"
                      : "bg-gradient-to-tr from-[#08467d] via-[#367453] to-[#f8ca14] shadow-[0_0_10px_rgba(8,70,125,0.15)]"
                  )}>

                    <div className={"h-14 w-14 sm:h-16 sm:w-16 overflow-hidden rounded-full border-2 flex items-center justify-center " + (
                      dark ? "border-black bg-[#121212]" : "border-white bg-slate-100"
                    )}>
                      {story.imageUrl ? (
                        <img loading="lazy" src={directDriveImage(story.imageUrl) || story.imageUrl} alt={story.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                      ) : story.sourceType === "instagram" ? (
                        <div className="grid h-full w-full place-items-center bg-gradient-to-tr from-[#f8ca14] via-[#de191e] to-[#08467d] text-white">
                          <Instagram size={24} />
                        </div>
                      ) : story.sourceType === "x" ? (
                        <div className="grid h-full w-full place-items-center bg-black text-white font-black text-xl">
                          𝕏
                        </div>
                      ) : story.sourceType === "article" ? (
                        <div className="grid h-full w-full place-items-center bg-[#de191e]/20 text-[#de191e]">
                          <Newspaper size={22} />
                        </div>
                      ) : story.sourceType === "podcast" ? (
                        <div className="grid h-full w-full place-items-center bg-[#f8ca14]/20 text-[#f8ca14]">
                          <Mic size={22} />
                        </div>
                      ) : story.sourceType === "showcase" ? (
                        <div className="grid h-full w-full place-items-center bg-[#08467d]/25 text-[#f8ca14]">
                          <Video size={22} />
                        </div>
                      ) : story.sourceType === "journal" ? (
                        <div className="grid h-full w-full place-items-center bg-amber-500/20 text-amber-400">
                          <BookOpen size={22} />
                        </div>
                      ) : story.sourceType === "album" ? (
                        <div className="grid h-full w-full place-items-center bg-[#08467d]/20 text-[#f8ca14]">
                          <Camera size={22} />
                        </div>
                      ) : (
                        <span className="text-xs font-black">العقيق</span>
                      )}
                    </div>
                    {story.isPinned && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#f8ca14] text-[9px] font-black text-black shadow-md z-10">
                        ★
                      </span>
                    )}
                    {story.imageUrl && (story.sourceType === "x" || story.sourceType === "instagram") ? (
                      <span className={`absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full border shadow-md z-10 ${
                        story.sourceType === "x"
                          ? "border-white/30 bg-black text-white text-[10px] font-black"
                          : "border-white/30 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white"
                      }`}>
                        {story.sourceType === "x" ? "𝕏" : <Instagram size={10} />}
                      </span>
                    ) : !story.isPinned ? (
                      <span className={`absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full bg-[#367453] border-2 ${
                        dark ? "border-black" : "border-white"
                      } animate-pulse`} />
                    ) : null}
                  </div>
                  <p className={"max-w-[84px] sm:max-w-[100px] line-clamp-2 text-center text-[10px] sm:text-[11px] font-black leading-snug transition " + (
                    dark ? "text-slate-200 group-hover:text-[#f8ca14]" : "text-slate-800 group-hover:text-[#08467d]"
                  )}>
                    {story.title}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : isStoriesLoading ? (
        <section data-no-visual-edit="true" className="relative z-10 py-3.5 sm:py-5 transition bg-transparent border-0">
          <div className="mx-auto max-w-[1380px] 2xl:max-w-[1560px] px-4 sm:px-6 md:px-8">
            <div className="flex items-center gap-4 sm:gap-5 overflow-x-auto py-1 [&::-webkit-scrollbar]:hidden">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 shrink-0 animate-pulse">
                  <div className={`h-14 w-14 sm:h-16 sm:w-16 rounded-full border-2 p-[2.5px] ${dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-200"}`} />
                  <div className={`h-2.5 w-12 rounded-full ${dark ? "bg-white/10" : "bg-slate-200"}`} />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* 2. غلاف واجهة مدارس العقيق الرئيسية - انسياب طبيعي وسلس 100% بدون أي قص */}
      <div className="relative z-10 w-full">
        <VisualEditable
            id="studio-hero-section"
            tag="section"
            label="غلاف واجهة مدارس العقيق"
            as="section"
            className={"relative isolate overflow-hidden transition-colors duration-500 bg-transparent border-0 " + (
              dark ? "text-white" : "text-slate-900"
            )}
          >



        <div className="relative mx-auto grid max-w-[1380px] 2xl:max-w-[1560px] items-center gap-6 sm:gap-8 md:gap-10 lg:gap-14 2xl:gap-20 px-4 sm:px-6 md:px-8 pt-5 sm:pt-8 md:pt-10 pb-8 sm:pb-12 md:pb-16 md:grid-cols-[minmax(340px,0.95fr)_minmax(0,1.05fr)] lg:grid-cols-[minmax(430px,0.95fr)_minmax(0,1.05fr)]">
          <div>
            {isNationalDay ? (
              <div className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 mb-3 text-xs font-black shadow-md backdrop-blur-md ${
                dark
                  ? "bg-[#f8ca14]/10 border-[#f8ca14]/30 text-[#f8ca14]"
                  : "bg-slate-50 border-[#08467d]/20 text-[#08467d]"
              }`}>
                <span className="text-sm">🇸🇦</span>
                <span className={`font-black ${dark ? "text-[#f8ca14]" : "text-[#08467d]"}`}>{customBadgeText}</span>
                <span className={`font-normal mr-1 ${dark ? "text-white/60" : "text-[#08467d]/70"}`}>· هوية اليوم الوطني</span>
              </div>
            ) : (
              <VisualEditable
                id="studio-hero-kicker"
                tag="text"
                label="شارة الغلاف الرئيسي"
                defaultText="ALAQEEQ SCHOOLS · OFFICIAL PORTAL"
                as="p"
                className={"text-[10px] font-black tracking-[0.18em] " + (dark ? "text-[#f8ca14]" : "text-[#08467d]")}
              />
            )}

            <h1 className={"mt-2.5 sm:mt-4 text-3xl sm:text-5xl md:text-5xl lg:text-6xl font-black leading-[1.15] " + (
              isNationalDay
                ? dark ? "text-white" : "text-emerald-950"
                : dark ? "text-white" : "text-black"
            )}>
              <VisualEditable id="studio-hero-title" tag="text" label="العنوان الرئيسي" defaultText="ذاكرة العقيق" as="span" />
              <br />
              <span className={isNationalDay ? (dark ? "snd-text-gradient" : "text-[#005A36]") : (dark ? "text-[#f8ca14]" : "text-[#08467d]")}>
                <VisualEditable
                  id="studio-hero-accent"
                  tag="text"
                  label="تكملة العنوان"
                  defaultText="في مكان واحد."
                  as="span"
                />
              </span>
            </h1>

            <VisualEditable
              id="studio-hero-description"
              tag="text"
              label="الوصف الرئيسي"
              defaultText="الموقع الرسمي لمدارس العقيق الأهلية والدولية بالمدينة المنورة - نلهم الأجيال ونصنع الأثر من خلال بيئة تعليمية رائدة ومعتمدة عالمياً."
              as="p"
              className={"mt-3 sm:mt-5 max-w-xl text-xs sm:text-sm leading-6 sm:leading-8 " + (
                isNationalDay
                  ? dark ? "text-emerald-100/80" : "text-emerald-900/80"
                  : dark ? "text-slate-300" : "text-slate-600"
              )}
            />


            {/* Quick Action CTA Buttons */}
            <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => navigate("/admissions")}
                data-visual-id="hero-cta-admissions"
                data-visual-tag="button"
                data-visual-label="زر القبول والتسجيل في الهيرو"
                className={`inline-flex items-center gap-2 rounded-2xl px-5 sm:px-6 py-2.5 sm:py-3 text-xs font-black shadow-lg transition active:scale-95 ${
                  dark
                    ? isNationalDay
                      ? "bg-gradient-to-r from-[#D4AF37] to-amber-500 text-black shadow-[#D4AF37]/20 hover:opacity-95"
                      : "bg-gradient-to-r from-[#f8ca14] to-amber-500 text-black shadow-[#f8ca14]/20 hover:opacity-95"
                    : isNationalDay
                    ? "bg-gradient-to-r from-[#005A36] to-[#003822] text-white shadow-[#005A36]/30 hover:opacity-95"
                    : "bg-gradient-to-r from-[#08467d] to-[#052c52] text-white shadow-[#08467d]/25 hover:opacity-95"
                }`}
              >
                <Send size={15} />
                <span>القبول والتسجيل والرسوم ✦</span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/accreditations")}
                data-visual-id="hero-cta-accreditations"
                data-visual-tag="button"
                data-visual-label="زر الاعتمادات الدولية في الهيرو"
                className={`inline-flex items-center gap-2 rounded-2xl border px-4 sm:px-5 py-2.5 sm:py-3 text-xs font-black transition active:scale-95 ${
                  dark
                    ? isNationalDay
                      ? "border-emerald-600/30 bg-emerald-950/30 text-white hover:bg-emerald-900/40"
                      : "border-white/15 bg-white/5 text-white hover:bg-white/10"
                    : isNationalDay
                    ? "border-emerald-700/20 bg-emerald-50 text-emerald-900 hover:bg-emerald-100/80"
                    : "border-black/10 bg-black/5 text-slate-800 hover:bg-black/10"
                }`}
              >
                <Award size={15} className={isNationalDay ? "text-[#D4AF37]" : "text-[#f8ca14]"} />
                <span>الاعتمادات الدولية</span>
              </button>
            </div>


            {/* Stats Bar */}
            <div className={"mt-5 sm:mt-8 grid max-w-lg grid-cols-3 divide-x divide-x-reverse border-y py-2.5 sm:py-4 " + (
              isNationalDay
                ? dark
                  ? "divide-[#D4AF37]/20 border-[#D4AF37]/20 bg-[#001f13]/80 rounded-2xl px-3 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                  : "divide-emerald-700/15 border-emerald-700/20 bg-emerald-50/80 rounded-2xl px-3 backdrop-blur-sm"
                : dark ? "divide-white/[0.1] border-white/[0.1]" : "divide-black/[0.08] border-black/[0.08]"
            )}>
              <div className="pl-3">
                <VisualEditable
                  id="studio-issues-label"
                  tag="text"
                  label="وصف عداد المجلات"
                  defaultText="PUBLISHED ISSUES"
                  as="p"
                  className={"text-[8px] font-black tracking-[0.12em] " + (
                    isNationalDay
                      ? dark ? "text-[#f8ca14]" : "text-[#005A36]"
                      : dark ? "text-[#f8ca14]/80" : "text-[#08467d]/80"
                  )}
                />
                <p className={"mt-1 text-2xl font-black " + (dark ? "text-white" : isNationalDay ? "text-[#003822]" : "text-black")}>{String(issues.length).padStart(2, "0")}</p>
              </div>
              <div className="px-3">
                <VisualEditable
                  id="studio-albums-label"
                  tag="text"
                  label="وصف عداد الألبومات"
                  defaultText="EVENT ALBUMS"
                  as="p"
                  className={"text-[8px] font-black tracking-[0.12em] " + (
                    isNationalDay
                      ? dark ? "text-[#f8ca14]" : "text-[#005A36]"
                      : dark ? "text-[#f8ca14]/80" : "text-[#08467d]/80"
                  )}
                />
                <p className={"mt-1 text-2xl font-black " + (dark ? "text-white" : isNationalDay ? "text-[#003822]" : "text-black")}>{String(albums.length).padStart(2, "0")}</p>
              </div>
              <div className="pr-3">
                <VisualEditable
                  id="studio-showcase-label"
                  tag="text"
                  label="وصف عداد الأخبار والعروض"
                  defaultText="NEWS & OFFERS"
                  as="p"
                  className={"text-[8px] font-black tracking-[0.12em] " + (
                    isNationalDay
                      ? dark ? "text-[#f8ca14]" : "text-[#005A36]"
                      : dark ? "text-[#f8ca14]/80" : "text-[#08467d]/80"
                  )}
                />
                <p className={"mt-1 text-2xl font-black " + (dark ? "text-white" : isNationalDay ? "text-[#003822]" : "text-black")}>{String(totalPosts).padStart(2, "0")}</p>
              </div>
            </div>
          </div>

          {/* Overlapping Hero Covers with 3D Fan-out on Scroll & 3D Interactive Mouse Tilt */}
          <div className="relative">
            {/* Quick Hero Covers Direct Edit Bar in Visual Editor Mode */}
            {isEditorActive && (
              <div className="mb-5 mx-auto w-fit z-50 flex flex-wrap items-center justify-center gap-2 bg-[#0b0f17]/95 border-2 border-amber-400/80 px-4 py-2 rounded-2xl shadow-2xl backdrop-blur-xl">
                <span className="text-xs font-black text-amber-400 ml-1">تعديل الأغلفة الثلاثة مباشرة:</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    select("studio-hero-journal-image", "image", "صورة غلاف المجلة");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                    selectedId === "studio-hero-journal-image"
                      ? "bg-[#f8ca14] text-black shadow-lg scale-105"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                >
                  <span>📘 غلاف المجلة (الأمامي)</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    select("studio-hero-album-image", "image", "صورة غلاف الألبومات");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                    selectedId === "studio-hero-album-image"
                      ? "bg-[#5aba1c] text-white shadow-lg scale-105"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                >
                  <span>📸 غلاف الألبومات (الأوسط)</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    select("studio-hero-showcase-image", "image", "صورة غلاف الأخبار");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                    selectedId === "studio-hero-showcase-image"
                      ? "bg-[#6565e0] text-white shadow-lg scale-105"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                >
                  <span>📰 غلاف الأخبار (الخلفي)</span>
                </button>
              </div>
            )}

            <motion.div
              onMouseMove={isEditorActive ? undefined : handleHeroMouseMove}
              onMouseLeave={isEditorActive ? undefined : handleHeroMouseLeave}
              style={isEditorActive ? {} : { rotateX: heroTiltX, rotateY: heroTiltY, transformStyle: "preserve-3d" }}
              className="relative mx-auto h-[270px] sm:h-[340px] md:h-[380px] lg:h-[430px] xl:h-[470px] w-full max-w-[620px] xl:max-w-[680px] perspective-1000 will-change-transform"
            >
              {/* Back Card: Showcase / Vision & Excellence */}
              <motion.div
                style={{ x: heroBackCardX, rotate: heroBackCardRotate }}
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  if (isEditorActive) {
                    e.stopPropagation();
                    select("studio-hero-showcase-image", "image", "صورة غلاف الأخبار");
                    return;
                  }
                  navigate("/offers");
                }}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (isEditorActive ? select("studio-hero-showcase-image", "image", "صورة غلاف الأخبار") : navigate("/offers"))}
                className={"group absolute bottom-[12%] right-[1%] top-[14%] w-[45%] overflow-hidden rounded-[1.6rem] border cursor-pointer will-change-transform transition-all duration-300 " + (
                  isEditorActive
                    ? selectedId === "studio-hero-showcase-image"
                      ? "z-30 ring-2 ring-[#6565e0] opacity-100 shadow-2xl scale-[1.04]"
                      : "z-0 opacity-80 hover:opacity-100 hover:scale-[1.03] hover:ring-2 hover:ring-[#6565e0]/80"
                    : "z-0 opacity-75 hover:opacity-100 hover:scale-[1.03] duration-500 "
                ) + (
                  isNationalDay
                    ? dark
                      ? "border-[#6565e0]/40 bg-[#001c10] shadow-[0_15px_40px_rgba(0,0,0,0.6)]"
                      : "border-[#6565e0]/40 bg-white shadow-[0_15px_40px_rgba(0,0,0,0.1)]"
                    : dark ? "border-white/[0.08] bg-[#111111]" : "border-black/[0.08] bg-slate-100"
                )}>
                <VisualImage
                  id="studio-hero-showcase-image"
                  label="صورة غلاف الأخبار"
                  src={isNationalDay ? "/themes/saudi-national-day/opt/cover_showcase_national.webp" : showcaseCovers.front}
                  alt="غلاف الأخبار والعروض"
                  priority={true}
                  className="h-full w-full object-cover"
                />
                {isEditorActive ? (
                  <div className={`absolute top-2.5 left-2.5 z-40 bg-[#6565e0] text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-xl flex items-center gap-1 pointer-events-none transition-opacity duration-200 ${selectedId === "studio-hero-showcase-image" ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                    <span>📰 غلاف الأخبار</span>
                  </div>
                ) : isNationalDay ? (
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-lg bg-black/80 border border-[#6565e0]/50 px-2 py-0.5 text-[9px] font-black text-white shadow-md backdrop-blur-md">
                    <span>طموح الرؤية 🇸🇦</span>
                  </div>
                ) : null}
              </motion.div>

              {/* Middle Card: Albums / Heritage & Ajrab Sword */}
              <motion.div
                style={{ y: heroMiddleCardY, scale: heroMiddleCardScale }}
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  if (isEditorActive) {
                    e.stopPropagation();
                    select("studio-hero-album-image", "image", "صورة غلاف الألبومات");
                    return;
                  }
                  navigate("/albums");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    if (isEditorActive) {
                      select("studio-hero-album-image", "image", "صورة غلاف الألبومات");
                      return;
                    }
                    navigate("/albums");
                  }
                }}
                className={"group absolute bottom-[8%] left-[28%] top-[8%] w-[53%] cursor-pointer overflow-hidden rounded-[1.8rem] border transition duration-300 will-change-transform " + (
                  isEditorActive
                    ? selectedId === "studio-hero-album-image"
                      ? "z-30 ring-2 ring-[#5aba1c] shadow-2xl scale-[1.04]"
                      : "z-10 hover:scale-[1.03] hover:ring-2 hover:ring-[#5aba1c]/80"
                    : "z-10 hover:scale-[1.02]"
                ) + " " + (
                  isNationalDay
                    ? dark
                      ? "border-[#5aba1c]/50 bg-[#002617] shadow-[0_20px_50px_rgba(0,50,25,0.45)]"
                      : "border-[#5aba1c]/40 bg-white shadow-[0_20px_50px_rgba(0,50,25,0.12)]"
                    : dark ? "border-white/[0.15] bg-[#111111]" : "border-black/[0.12] bg-white shadow-md"
                )}
              >
                <VisualImage
                  id="studio-hero-album-image"
                  label="صورة غلاف الألبومات"
                  src={isNationalDay ? "/themes/saudi-national-day/opt/cover_album_national.webp" : albumCovers.front}
                  alt="غلاف ألبوم العقيق"
                  priority={true}
                  className="h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-[1.03]"
                />
                {isEditorActive ? (
                  <div className={`absolute top-2.5 left-2.5 z-40 bg-[#5aba1c] text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-xl flex items-center gap-1 pointer-events-none transition-opacity duration-200 ${selectedId === "studio-hero-album-image" ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                    <span>📸 غلاف الألبومات</span>
                  </div>
                ) : isNationalDay ? (
                  <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-1 rounded-xl bg-black/80 border border-[#5aba1c]/50 px-2.5 py-1 text-[10px] font-black text-[#5aba1c] shadow-lg backdrop-blur-md">
                    <span>أصالة وفخر 🇸🇦</span>
                  </div>
                ) : null}
              </motion.div>

              {/* Front Card: Journal / Generosity & Family Generations */}
              <motion.div
                style={{ x: heroFrontCardX, rotate: heroFrontCardRotate }}
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  if (isEditorActive) {
                    e.stopPropagation();
                    select("studio-hero-journal-image", "image", "صورة غلاف المجلة");
                    return;
                  }
                  navigate("/journal");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    if (isEditorActive) {
                      select("studio-hero-journal-image", "image", "صورة غلاف المجلة");
                      return;
                    }
                    navigate("/journal");
                  }
                }}
                className={"group absolute bottom-[2%] left-[1%] top-[5%] w-[48%] cursor-pointer overflow-hidden rounded-[1.9rem] border p-2 transition duration-300 will-change-transform " + (
                  isEditorActive
                    ? selectedId === "studio-hero-journal-image"
                      ? "z-30 ring-2 ring-[#f8ca14] shadow-2xl scale-[1.04]"
                      : "z-20 hover:scale-[1.03] hover:ring-2 hover:ring-[#f8ca14]/80"
                    : "z-20 hover:scale-[1.02]"
                ) + " " + (
                  isNationalDay
                    ? dark
                      ? "border-[#f8ca14]/80 bg-[#001f13]/90 shadow-[0_30px_70px_rgba(0,90,54,0.55)] backdrop-blur-md ring-1 ring-[#f8ca14]/30"
                      : "border-emerald-600/50 bg-white/95 shadow-[0_25px_60px_rgba(0,90,54,0.18)] backdrop-blur-md ring-1 ring-emerald-500/20"
                    : dark
                    ? "border-[#f8ca14]/50 bg-[#111111] shadow-[0_30px_70px_rgba(0,0,0,0.8)]"
                    : "border-[#08467d]/40 bg-white shadow-[0_30px_70px_rgba(8,70,125,0.15)]"
                )}
              >
                <VisualImage
                  id="studio-hero-journal-image"
                  label="صورة غلاف المجلة"
                  src={isNationalDay ? "/themes/saudi-national-day/opt/cover_journal_national.webp" : journalCovers.front}
                  alt="غلاف مجلة العقيق"
                  priority={true}
                  className="h-full w-full rounded-[1.4rem] object-cover transition duration-700 group-hover:scale-[1.03]"
                />
                {isEditorActive ? (
                  <div className={`absolute top-2.5 left-2.5 z-40 bg-[#f8ca14] text-black text-[10px] font-black px-2 py-0.5 rounded-lg shadow-xl flex items-center gap-1 pointer-events-none transition-opacity duration-200 ${selectedId === "studio-hero-journal-image" ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                    <span>📘 غلاف المجلة</span>
                  </div>
                ) : isNationalDay ? (
                  <div className="absolute bottom-4 right-4 z-30 flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#f8ca14] to-[#facc15] px-3 py-1 text-[11px] font-black text-black shadow-xl shadow-black/80 backdrop-blur-md">
                    <span>🇸🇦</span>
                    <span>عزّنا بطبعنا</span>
                  </div>
                ) : null}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </VisualEditable>
      </div>

      {/* 3. واحة العقيق الرقمية وشريط الثقة - انسياب طبيعي 100% بدون ستائر أو قص */}
      <div className="relative z-10 w-full bg-transparent border-0 shadow-none">

      {/* 🇸🇦 شريط الاعتمادات وشارات الثقة الدولية */}
      {/* 🇸🇦 شريط الاعتمادات وشارات الثقة الدولية (محمي من تطفل المحرر المرئي مع تثبيت تلقائي) */}
      <section
        data-no-visual-edit="true"
        data-interactive-fx="true"
        className={`py-3.5 sm:py-4 transition bg-transparent border-0 ${
          dark ? "text-white" : "text-slate-800"
        }`}
      >
        <div data-no-visual-edit="true" data-interactive-fx="true" className="mx-auto max-w-[1380px] 2xl:max-w-[1560px] px-4 sm:px-6 md:px-8">
          <div data-no-visual-edit="true" data-interactive-fx="true" className="flex flex-wrap items-center justify-between gap-4 sm:gap-6 text-xs font-black">
            {/* Cognia */}
            <div data-no-visual-edit="true" data-interactive-fx="true" className="flex items-center gap-1.5">
              <button
                type="button"
                data-no-visual-edit="true"
                data-interactive-fx="true"
                onClick={() => {
                  if (isEditorActive) {
                    setEditingHoverItem(cogniaItem);
                  } else {
                    navigate(cogniaItem.targetUrl || "/accreditations");
                  }
                }}
                onMouseEnter={() => triggerCursorPreview({
                  visible: true,
                  imageUrl: cogniaItem.imageUrl,
                  title: cogniaItem.title,
                  badge: cogniaItem.badge,
                  targetUrl: cogniaItem.targetUrl,
                  isFrozen: isEditorActive,
                  onEdit: isEditorActive ? () => setEditingHoverItem(cogniaItem) : undefined,
                })}
                onMouseLeave={() => {
                  if (!isEditorActive) {
                    triggerCursorPreview({ visible: false });
                  }
                }}
                className={`flex items-center gap-2 transition cursor-pointer ${
                  isEditorActive ? "ring-1 ring-amber-400/40 rounded-xl px-2 py-1 bg-amber-400/10 hover:bg-amber-400/20" : "hover:opacity-80"
                }`}
                title={isEditorActive ? "انقر لتعديل صورة كوجنيا والكلمة مباشرة" : undefined}
              >
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#f8ca14]/15 text-[#f8ca14]">
                  <Award size={16} />
                </span>
                <span>{cogniaItem.triggerText}</span>
              </button>
              {isEditorActive && (
                <button
                  type="button"
                  data-no-visual-edit="true"
                  data-interactive-fx="true"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingHoverItem(cogniaItem);
                  }}
                  className="p-1.5 rounded-xl bg-[#f8ca14] hover:bg-yellow-400 text-black shadow-sm transition cursor-pointer"
                  title="تعديل هذا العنصر وصورة الماوس"
                >
                  <Edit3 size={13} />
                </button>
              )}
            </div>

            {/* IELTS */}
            <div data-no-visual-edit="true" data-interactive-fx="true" className="hidden sm:flex items-center gap-1.5">
              <button
                type="button"
                data-no-visual-edit="true"
                data-interactive-fx="true"
                onClick={() => {
                  if (isEditorActive) {
                    setEditingHoverItem(ieltsItem);
                  } else {
                    navigate(ieltsItem.targetUrl || "/accreditations");
                  }
                }}
                onMouseEnter={() => triggerCursorPreview({
                  visible: true,
                  imageUrl: ieltsItem.imageUrl,
                  title: ieltsItem.title,
                  badge: ieltsItem.badge,
                  targetUrl: ieltsItem.targetUrl,
                  isFrozen: isEditorActive,
                  onEdit: isEditorActive ? () => setEditingHoverItem(ieltsItem) : undefined,
                })}
                onMouseLeave={() => {
                  if (!isEditorActive) {
                    triggerCursorPreview({ visible: false });
                  }
                }}
                className={`flex items-center gap-2 transition cursor-pointer ${
                  isEditorActive ? "ring-1 ring-amber-400/40 rounded-xl px-2 py-1 bg-amber-400/10 hover:bg-amber-400/20" : "hover:opacity-80"
                }`}
                title={isEditorActive ? "انقر لتعديل صورة آيلتس والكلمة مباشرة" : undefined}
              >
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-500/10 text-blue-500">
                  <Globe2 size={16} />
                </span>
                <span>{ieltsItem.triggerText}</span>
              </button>
              {isEditorActive && (
                <button
                  type="button"
                  data-no-visual-edit="true"
                  data-interactive-fx="true"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingHoverItem(ieltsItem);
                  }}
                  className="p-1.5 rounded-xl bg-[#f8ca14] hover:bg-yellow-400 text-black shadow-sm transition cursor-pointer"
                  title="تعديل هذا العنصر وصورة الماوس"
                >
                  <Edit3 size={13} />
                </button>
              )}
            </div>

            {/* SAT */}
            <div data-no-visual-edit="true" data-interactive-fx="true" className="flex items-center gap-1.5">
              <button
                type="button"
                data-no-visual-edit="true"
                data-interactive-fx="true"
                onClick={() => {
                  if (isEditorActive) {
                    setEditingHoverItem(satItem);
                  } else {
                    navigate(satItem.targetUrl || "/accreditations");
                  }
                }}
                onMouseEnter={() => triggerCursorPreview({
                  visible: true,
                  imageUrl: satItem.imageUrl,
                  title: satItem.title,
                  badge: satItem.badge,
                  targetUrl: satItem.targetUrl,
                  isFrozen: isEditorActive,
                  onEdit: isEditorActive ? () => setEditingHoverItem(satItem) : undefined,
                })}
                onMouseLeave={() => {
                  if (!isEditorActive) {
                    triggerCursorPreview({ visible: false });
                  }
                }}
                className={`flex items-center gap-2 transition cursor-pointer ${
                  isEditorActive ? "ring-1 ring-amber-400/40 rounded-xl px-2 py-1 bg-amber-400/10 hover:bg-amber-400/20" : "hover:opacity-80"
                }`}
                title={isEditorActive ? "انقر لتعديل صورة سات والكلمة مباشرة" : undefined}
              >
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-500/10 text-[#f8ca14]">
                  <CheckCircle2 size={16} />
                </span>
                <span>{satItem.triggerText}</span>
              </button>
              {isEditorActive && (
                <button
                  type="button"
                  data-no-visual-edit="true"
                  data-interactive-fx="true"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingHoverItem(satItem);
                  }}
                  className="p-1.5 rounded-xl bg-[#f8ca14] hover:bg-yellow-400 text-black shadow-sm transition cursor-pointer"
                  title="تعديل هذا العنصر وصورة الماوس"
                >
                  <Edit3 size={13} />
                </button>
              )}
            </div>

            {/* Community */}
            <div data-no-visual-edit="true" data-interactive-fx="true" className="hidden md:flex items-center gap-1.5">
              <button
                type="button"
                data-no-visual-edit="true"
                data-interactive-fx="true"
                onClick={() => {
                  if (isEditorActive) {
                    setEditingHoverItem(communityItem);
                  } else {
                    navigate(communityItem.targetUrl || "/about");
                  }
                }}
                onMouseEnter={() => triggerCursorPreview({
                  visible: true,
                  imageUrl: communityItem.imageUrl,
                  title: communityItem.title,
                  badge: communityItem.badge,
                  targetUrl: communityItem.targetUrl,
                  isFrozen: isEditorActive,
                  onEdit: isEditorActive ? () => setEditingHoverItem(communityItem) : undefined,
                })}
                onMouseLeave={() => {
                  if (!isEditorActive) {
                    triggerCursorPreview({ visible: false });
                  }
                }}
                className={`flex items-center gap-2 transition cursor-pointer ${
                  isEditorActive ? "ring-1 ring-amber-400/40 rounded-xl px-2 py-1 bg-amber-400/10 hover:bg-amber-400/20" : "hover:opacity-80"
                }`}
                title={isEditorActive ? "انقر لتعديل صورة مجتمع العقيق والكلمة مباشرة" : undefined}
              >
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#f8ca14]/15 text-[#f8ca14]">
                  <Users size={16} />
                </span>
                <span>{communityItem.triggerText}</span>
              </button>
              {isEditorActive && (
                <button
                  type="button"
                  data-no-visual-edit="true"
                  data-interactive-fx="true"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingHoverItem(communityItem);
                  }}
                  className="p-1.5 rounded-xl bg-[#f8ca14] hover:bg-yellow-400 text-black shadow-sm transition cursor-pointer"
                  title="تعديل هذا العنصر وصورة الماوس"
                >
                  <Edit3 size={13} />
                </button>
              )}
            </div>
          </div>

          {/* ⚡ لوحة التثبيت التلقائي للبطاقات التفاعلية (تظهر تلقائياً في وضع المحرر) */}
          {isEditorActive && (
            <div data-no-visual-edit="true" data-interactive-fx="true" className="mt-5 pt-4 border-t border-amber-400/25 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 px-1">
                <div className="flex items-center gap-2 text-xs font-black text-[#f8ca14]">
                  <Sparkles size={16} />
                  <span>⚡ بطاقات التفاعل مُثبتة تلقائياً — انقر مباشرة على أي بطاقة لتعديل صورتها وكلمتها فوراً:</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] text-amber-200 bg-amber-500/15 border border-amber-400/30 px-3 py-1 rounded-xl font-bold w-fit">
                  <span>❄️ مثبت تلقائياً</span>
                  <span>·</span>
                  <span>نقرة واحدة للتعديل</span>
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                {[
                  { item: cogniaItem, num: 1 },
                  { item: ieltsItem, num: 2 },
                  { item: satItem, num: 3 },
                  { item: communityItem, num: 4 },
                ].map(({ item, num }) => (
                  <div
                    key={item.id}
                    data-no-visual-edit="true"
                    data-interactive-fx="true"
                    onClick={() => setEditingHoverItem(item)}
                    className="group relative overflow-hidden rounded-2xl border-2 border-amber-400/40 bg-black/85 hover:border-amber-400 hover:shadow-[0_0_25px_rgba(248,202,20,0.4)] hover:scale-[1.02] transition-all p-2.5 cursor-pointer shadow-lg"
                    title={`انقر لتعديل ${item.triggerText}`}
                  >
                    {/* Image container */}
                    <div className="relative h-28 w-full overflow-hidden rounded-xl bg-slate-900 border border-white/10">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                      {item.badge && (
                        <div className="absolute top-1.5 right-1.5 rounded-full bg-black/80 border border-[#f8ca14]/50 px-2 py-0.5 text-[9px] font-black text-[#f8ca14]">
                          {item.badge}
                        </div>
                      )}
                      <div className="absolute bottom-1.5 inset-x-2">
                        <p className="text-[10px] font-black text-white line-clamp-1 text-right">
                          {item.title}
                        </p>
                      </div>
                    </div>

                    {/* Trigger text and click button */}
                    <div className="mt-2 text-right space-y-1.5">
                      <p className="text-xs font-black text-white line-clamp-1">
                        {item.triggerText}
                      </p>
                      <button
                        type="button"
                        data-no-visual-edit="true"
                        data-interactive-fx="true"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingHoverItem(item);
                        }}
                        className="w-full py-1.5 rounded-xl bg-[#f8ca14] hover:bg-yellow-400 text-black text-[11px] font-black flex items-center justify-center gap-1.5 shadow transition active:scale-95"
                      >
                        <Edit3 size={12} />
                        <span>تعديل الصورة والبيانات ✏️</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}

      {/* 3. NEW MEDIA DASHBOARD */}
      {/* ========================================================================= */}
      {(orchestration?.sections as any)?.marqueeEnabled !== false && (
        <AqeeqNewsMarquee badgeOverride={(orchestration?.sections as any)?.marqueeBadge} />
      )}

      {/* 🇸🇦 قسم قيم الهوية الوطنية الست الرسمية (عزّنا بطبعنا) */}
      {isNationalDay && <AqeeqNationalTraitsSection dark={dark} />}

      {(orchestration?.sections as any)?.studioHighlightsEnabled !== false && (

        <AqeeqHomeBentoGrid
          titleOverride={(orchestration?.sections as any)?.studioHighlightsTitle}
          descOverride={(orchestration?.sections as any)?.studioHighlightsDesc}
        />
      )}

      {/* 🎬 مسار ويلينغتون السينمائي الأفقي للمجلات والألبومات (Horizontal Scrubbing) */}
      <AqeeqHorizontalScrubSection items={horizontalShowcaseItems} />



      {(orchestration?.sections as any)?.libraryEnabled !== false && (
        <AqeeqHomeTabsLibrary
          titleOverride={(orchestration?.sections as any)?.libraryTitle}
          descOverride={(orchestration?.sections as any)?.libraryDesc}
        />
      )}

      {/* 📱 قسم تطبيق مدارس العقيق الذكي — فيديو الشرح، رمز QR، وأزرار المتاجر */}
      <AqeeqSchoolAppShowcaseSection dark={dark} />



      {/* ========================================================================= */}
      {/* 4. الأقسام المعتمدة: القصص اليومية، بينتو إنجازات الأسبوع، وصوت العقيق */}
      {/* ========================================================================= */}

      {/* 🌟 2. لوحة «بينتو إنجازات وأحداث الأسبوع» (Weekly Highlights Section) */}
      <AqeeqWeeklyHighlightsSection
        dark={dark}
        isNationalDay={isNationalDay}
        orchestration={orchestration}
        featuredEventPost={featuredEventPost}
        showcaseCovers={showcaseCovers}
        albumCovers={albumCovers}
        hasLiked={hasLiked}
        toggleLike={toggleLike}
        directDriveImage={directDriveImage}
      />

      {/* 🌟 3. لوحة «صوت العقيق» التحريرية (Editorial Spotlight & Quote) */}
      <VisualEditable
        id="studio-editorial-section"
        tag="section"
        label="قسم صوت العقيق والكلمة التوجيهية"
        as="section"
        className="py-14 md:py-20 transition bg-transparent border-0"
      >
        <div className="mx-auto max-w-[1380px] 2xl:max-w-[1560px] px-4 sm:px-6 md:px-8">
          <div className="mb-8 sm:mb-10 text-right">
            <VisualEditable
              id="studio-editorial-kicker"
              tag="text"
              label="شارة صوت العقيق"
              defaultText={isNationalDay ? "🇸🇦 رسالة القيادة في اليوم الوطني" : "EDITORIAL · LEADERSHIP MESSAGE"}
              as="span"
              className={"inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black tracking-widest uppercase mb-3 " + (
                isNationalDay
                  ? "snd-kicker-badge border-[#f8ca14]/40 bg-[#f8ca14]/10 text-[#f8ca14]"
                  : dark ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]" : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"
              )}
            >
              {(text) => (
                <>
                  <Quote size={12} />
                  {text}
                </>
              )}
            </VisualEditable>
            <VisualEditable
              id="studio-editorial-title"
              tag="text"
              label="عنوان صوت العقيق"
              defaultText="صوت العقيق والكلمة التربوية"
              as="h2"
              className={"text-2xl sm:text-4xl font-black font-cairo " + (dark ? "text-white" : isNationalDay ? "text-[#003822]" : "text-black")}
            />
            {/* Glowing Golden Accent Line (يتمدد مع السكرول وينكمش عند الخروج) */}
            <motion.div
              initial={{ width: 0, opacity: 0.3 }}
              whileInView={{ width: 175, opacity: 1 }}
              viewport={{ once: false, margin: "-20px" }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className={`h-1 sm:h-[3.5px] rounded-full my-3.5 ${
                dark
                  ? "bg-gradient-to-l from-[#f8ca14] via-[#f8ca14]/80 to-transparent shadow-[0_0_15px_rgba(248,202,20,0.6)]"
                  : "bg-gradient-to-l from-[#08467d] via-[#08467d]/80 to-transparent shadow-[0_0_12px_rgba(8,70,125,0.4)]"
              }`}
            />
            <VisualEditable
              id="studio-editorial-desc"
              tag="text"
              label="وصف صوت العقيق"
              defaultText="رسائل قيادية ملهمة وتوجيهات تربوية تعكس رؤية ورسالة مدارس العقيق."
              as="p"
              className={"mt-2 max-w-xl text-xs sm:text-sm " + (dark ? "text-slate-400" : isNationalDay ? "text-emerald-800" : "text-slate-600")}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 60 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: false, margin: "-60px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className={"relative overflow-hidden rounded-[2.5rem] border p-8 sm:p-14 " + (
              isNationalDay
                ? dark ? "snd-editorial-card-dark" : "snd-editorial-card-light"
                : dark
                ? "border-[#f8ca14]/30 bg-gradient-to-l from-[#161616] to-[#0a0a0a] shadow-2xl"
                : "border-[#08467d]/20 bg-white shadow-xl"
            )}
          >

            {/* Ghost Watermark Quote */}
            <div
              className="pointer-events-none absolute -top-8 -right-4 select-none leading-none font-black opacity-[0.035] text-current"
              style={{ fontSize: "clamp(200px, 35vw, 480px)", lineHeight: 1 }}
              aria-hidden
            >
              «
            </div>
            <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-8 items-center">
              <div>
                <Quote size={60} className={dark ? "text-[#f8ca14]/30" : isNationalDay ? "text-[#005A36]/30" : "text-[#08467d]/25"} />
                <motion.div initial={{ opacity: 0, x: -60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false }} transition={{ duration: 0.8, delay: 0.15 }}>
                  <VisualEditable
                    id="studio-editorial-quote"
                    tag="text"
                    label="نص اقتباس صوت العقيق"
                    defaultText={`«${orchestration?.editorialVoice?.quoteText || "في مدارس العقيق، لا نعلّم للعلم فحسب، بل نصنع قيادات المستقبل بوعي وطموح لا ينضب."}»`}
                    as="h3"
                    className={"mt-3 text-2xl sm:text-3xl lg:text-4xl font-black leading-relaxed " + (dark ? "text-white" : isNationalDay ? "text-[#003822]" : "text-black")}
                  />
                </motion.div>

                {/* 🎙️ Dynamic Soundwave Visualizer */}
                <div className="flex items-center gap-1.5 my-5 h-7">
                  {[14, 28, 45, 20, 36, 52, 24, 48, 60, 32, 20, 44, 56, 38, 18, 42, 30, 16].map((h, i) => (
                    <motion.span
                      key={i}
                      animate={{ height: [`${Math.max(4, h * 0.25)}px`, `${h * 0.65}px`, `${Math.max(4, h * 0.25)}px`] }}
                      transition={{ duration: 1.1 + (i % 4) * 0.25, repeat: Infinity, ease: "easeInOut", delay: i * 0.04 }}
                      className={`w-1 rounded-full ${dark ? "bg-gradient-to-t from-[#f8ca14]/30 to-[#f8ca14]" : "bg-gradient-to-t from-[#08467d]/30 to-[#08467d]"}`}
                      style={{ height: `${h * 0.45}px` }}
                    />
                  ))}
                  <span className={`text-[11px] font-bold mr-3 ${dark ? "text-slate-400" : "text-slate-600"}`}>
                    الموجة الصوتية الحية للكلمة التربوية 🎙️
                  </span>
                </div>

                <VisualEditable
                  id="studio-editorial-author"
                  tag="text"
                  label="اسم ووصف صاحب الاقتباس"
                  defaultText={(orchestration?.editorialVoice?.authorName ? `${orchestration.editorialVoice.authorName} · ` : "") + (orchestration?.editorialVoice?.authorTitle || "المشرف العام على مدارس العقيق الأهلية")}
                  as="p"
                  className={"mt-2 text-sm font-black " + (dark ? "text-[#f8ca14]" : isNationalDay ? "text-[#005A36]" : "text-[#08467d]")}
                />
              </div>

              {/* 🎖️ Rotating Golden Seal Watermark */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                className="pointer-events-none absolute -bottom-12 -left-12 select-none opacity-[0.08]"
                aria-hidden
              >
                <svg width="220" height="220" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" className={dark ? "text-[#f8ca14]" : "text-[#08467d]"}>
                  <circle cx="50" cy="50" r="46" strokeDasharray="3 3" />
                  <circle cx="50" cy="50" r="38" />
                  <polygon points="50,15 61,38 85,38 66,54 73,78 50,64 27,78 34,54 15,38 39,38" />
                </svg>
              </motion.div>

              <div className={"flex flex-col items-center justify-center p-6 rounded-2xl border text-center " + (
                dark ? "border-white/[0.08] bg-black/40" : isNationalDay ? "border-emerald-500/20 bg-white/80 shadow-sm" : "border-black/[0.06] bg-slate-50"
              )}>
                <div className={"grid h-16 w-16 place-items-center rounded-full mb-3 " + (
                  dark ? "bg-[#f8ca14]/15 text-[#f8ca14]" : isNationalDay ? "bg-emerald-100 text-[#005A36]" : "bg-[#08467d]/10 text-[#08467d]"
                )}>
                  <Radio size={28} className={isPlayingQuoteAudio ? "animate-pulse text-[#de191e]" : ""} />
                </div>
                <VisualEditable
                  id="studio-editorial-audio-title"
                  tag="text"
                  label="عنوان الكلمة التوجيهية"
                  defaultText="الكلمة التوجيهية الأسبوعية"
                  as="h4"
                  className={"font-black text-sm " + (dark ? "text-white" : isNationalDay ? "text-[#003822]" : "text-black")}
                />
                <VisualEditable
                  id="studio-editorial-audio-desc"
                  tag="text"
                  label="وصف الكلمة التوجيهية"
                  defaultText="رسالة الإدارة لفرسان وأولياء أمور المدارس"
                  as="p"
                  className={"mt-1 text-xs " + (dark ? "text-slate-400" : isNationalDay ? "text-emerald-900/70" : "text-slate-500")}
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsPlayingQuoteAudio(!isPlayingQuoteAudio);
                    toast.success(isPlayingQuoteAudio ? "تم إيقاف المقطع الصوتي" : "جاري تشغيل الكلمة التوجيهية 🎧");
                  }}
                  className={"mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black transition active:scale-95 " + (
                    dark
                      ? "!bg-[#f8ca14] !text-black shadow-[0_0_15px_rgba(248,202,20,0.3)]"
                      : isNationalDay
                      ? "!bg-[#005A36] !text-white shadow-[0_0_15px_rgba(0,90,54,0.25)] hover:bg-[#003822]"
                      : "!bg-[#08467d] !text-white shadow-[0_0_15px_rgba(8,70,125,0.2)]"
                  )}
                >
                  {isPlayingQuoteAudio ? <VolumeX size={15} /> : <Volume2 size={15} />}
                  {isPlayingQuoteAudio ? "إيقاف الاستماع" : "استمع للكلمة الصوتية"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </VisualEditable>


      {/* 7. قسم ذاكرة العقيق المفتوحة (Memory Wall) */}
      <AqeeqMemoryWallSection
        dark={dark}
        isNationalDay={isNationalDay}
        memoryEntries={memoryEntries}
      />

      {/* 8. إحصائيات الأرشيف المفتوح الشامل - المحدث بنظام الهولوجرام والعدادات الحية */}
      <AqeeqLiveArchiveSection
        dark={dark}
        totalPosts={totalPosts}
        totalIssues={issues.length}
        totalAlbums={albums.length}
        totalPages={totalPages}
        totalMedia={totalFiles + totalPosts}
      />

      {/* Unified Luxury Site Footer */}
      <AlaqeeqStudioSiteFooter />
      </div>



      {/* Story Viewer Modal — Instagram-Style Morph Zoom from Circle Origin (z-[300] above header with click-outside dismiss) */}
      <AnimatePresence>
        {activeStoryIndex !== null && storiesList[activeStoryIndex] ? (() => {
          const activeStory = storiesList[activeStoryIndex];
          const prevStory = activeStoryIndex > 0 ? storiesList[activeStoryIndex - 1] : null;
          const nextStory = activeStoryIndex < storiesList.length - 1 ? storiesList[activeStoryIndex + 1] : null;

          return (
            <motion.div
              key="story-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onClick={() => setActiveStoryIndex(null)}
              className={`fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-5 md:p-8 select-none overflow-hidden ${
                dark ? "bg-black/80" : "bg-black/75"
              } backdrop-blur-xl`}
            >
              {/* Subtle Ambient Ambilight Glow (Takes colors of current story) */}
              {activeStory.imageUrl && (
                <motion.div
                  key={`ambilight-${activeStory.id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.35 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center blur-3xl overflow-hidden"
                >
                  <img
                    src={directDriveImage(activeStory.imageUrl) || activeStory.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </motion.div>
              )}

              {/* Top Bar Floating Dismiss Pill */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute top-4 left-4 sm:left-7 z-40 flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveStoryIndex(null);
                  }}
                  className="grid h-10 w-10 place-items-center rounded-full bg-black/60 border border-white/25 text-white transition-colors duration-150 hover:bg-[#de191e] hover:border-[#de191e] shadow-2xl backdrop-blur-md"
                  title="إغلاق (ESC)"
                >
                  <X size={20} />
                </button>
                <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-white/70 bg-black/50 border border-white/15 px-3 py-1.5 rounded-full backdrop-blur-md">
                  <span>اضغط بالخارج أو</span>
                  <kbd className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-mono text-white">ESC</kbd>
                  <span>للإغلاق</span>
                </div>
              </motion.div>

              {/* 3D Story Carousel Stage */}
              <div className="relative flex items-center justify-center gap-5 lg:gap-8 w-full max-w-6xl h-full max-h-[88vh]">

                {/* Previous Story Card (Desktop 3D Preview on the Right) */}
                {prevStory ? (
                  <motion.div
                    key={`prev-story-${prevStory.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.45 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveStoryIndex(activeStoryIndex - 1);
                      setStoryProgress(0);
                    }}
                    className="group/prev relative hidden lg:flex flex-col items-center justify-between w-[200px] xl:w-[230px] h-[66vh] max-h-[560px] rounded-[2rem] border border-white/20 bg-black/50 overflow-hidden shadow-2xl transition-opacity duration-200 cursor-pointer backdrop-blur-md shrink-0 hover:opacity-80 select-none"
                    style={{
                      transform: "perspective(1200px) rotateY(-8deg) scale(0.88)",
                    }}
                    title={`القصة السابقة: ${prevStory.title}`}
                  >
                    {prevStory.imageUrl ? (
                      <img
                        src={directDriveImage(prevStory.imageUrl) || prevStory.imageUrl}
                        alt={prevStory.title}
                        className="absolute inset-0 h-full w-full object-cover brightness-[0.6] group-hover/prev:brightness-95 transition duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#181818] to-black">
                        <span className="text-3xl font-black text-white/30">العقيق</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/60" />
                    <div className="relative z-10 p-3.5 w-full flex items-center justify-between text-xs text-white/80">
                      <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold backdrop-blur-md">{prevStory.category}</span>
                      <span className="text-[10px] opacity-70">{prevStory.time}</span>
                    </div>
                    <div className="relative z-10 p-4 w-full text-right">
                      <p className="text-xs font-black line-clamp-2 text-white leading-snug">{prevStory.title}</p>
                      <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#f8ca14]">
                        <span>السابق</span>
                        <ChevronRight size={14} />
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <div className="hidden lg:block w-[200px] xl:w-[230px] shrink-0" />
                )}

                {/* Center Main Active Story Card (Silky Smooth Instant Elevation) */}
                <motion.div
                  key={`active-story-card-${activeStory.id}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  onClick={(e) => e.stopPropagation()}
                  onMouseEnter={() => setIsStoryPaused(true)}
                  onMouseLeave={() => setIsStoryPaused(false)}
                  onTouchStart={() => setIsStoryPaused(true)}
                  onTouchEnd={() => setIsStoryPaused(false)}
                  className={`relative h-[86vh] max-h-[760px] w-full max-w-[420px] sm:max-w-[440px] overflow-hidden rounded-[2.2rem] border bg-black shadow-[0_25px_80px_rgba(0,0,0,0.85)] shrink-0 will-change-transform ${
                    dark
                      ? "border-[#f8ca14]/30 shadow-[0_0_60px_rgba(248,202,20,0.18)]"
                      : "border-white/45 shadow-[0_30px_90px_rgba(0,0,0,0.6)]"
                  }`}
                >
                  {/* Progress Bars */}
                  <div className="absolute top-3.5 inset-x-3.5 z-20 flex gap-1.5">
                    {storiesList.map((_, i) => (
                      <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
                        <div
                          className="h-full bg-white transition-all duration-100"
                          style={{
                            width:
                              i < activeStoryIndex
                                ? "100%"
                                : i === activeStoryIndex
                                ? storyProgress + "%"
                                : "0%",
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Pause status indicator pill */}
                  {isStoryPaused && (
                    <span className="absolute top-8 left-1/2 -translate-x-1/2 z-20 rounded-full bg-black/60 border border-white/20 px-2.5 py-0.5 text-[9px] font-bold text-[#f8ca14] backdrop-blur-md animate-pulse">
                      موقوف مؤقتاً
                    </span>
                  )}

                  {/* Header Info */}
                  <div className="absolute top-6 inset-x-4 z-20 flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 overflow-hidden rounded-full border border-white/30 bg-black flex items-center justify-center shadow-md">
                        {activeStory.imageUrl ? (
                          <img loading="lazy" src={directDriveImage(activeStory.imageUrl) || activeStory.imageUrl || ""} alt="" className="h-full w-full object-cover" />
                        ) : activeStory.sourceType === "instagram" ? (
                          <Instagram size={16} className="text-[#f8ca14]" />
                        ) : activeStory.sourceType === "x" ? (
                          <span className="text-xs font-black">𝕏</span>
                        ) : activeStory.sourceType === "article" ? (
                          <Newspaper size={16} className="text-[#de191e]" />
                        ) : activeStory.sourceType === "podcast" ? (
                          <Mic size={16} className="text-[#f8ca14]" />
                        ) : activeStory.sourceType === "showcase" ? (
                          <Video size={16} className="text-[#08467d]" />
                        ) : activeStory.sourceType === "journal" ? (
                          <BookOpen size={16} className="text-[#f8ca14]" />
                        ) : activeStory.sourceType === "album" ? (
                          <Camera size={16} className="text-[#367453]" />
                        ) : (
                          <span className="text-[10px] font-black">العقيق</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-black">{activeStory.category}</p>
                          {activeStory.isPinned && (
                            <span className="rounded bg-[#f8ca14] px-1 py-0.2 text-[8px] font-black text-black">مميز</span>
                          )}
                        </div>
                        <p className="text-[10px] text-white/70">{activeStory.time}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveStoryIndex(null)}
                      className="grid h-8 w-8 place-items-center rounded-full bg-black/40 text-white transition hover:bg-[#de191e] hover:border-[#de191e]"
                      title="إغلاق"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Rich Story Content Display */}
                  <div className="relative h-full w-full flex items-center justify-center bg-black">
                    {activeStory.imageUrl ? (
                      <img
                        src={directDriveImage(activeStory.imageUrl) || activeStory.imageUrl || ""}
                        alt={activeStory.title}
                        className="h-full w-full object-cover"
                      />
                    ) : activeStory.sourceType === "x" ? (
                      <div className="w-full px-4 pt-16 pb-28">
                        <XEmbed url={activeStory.targetUrl} title={activeStory.title} dark={true} />
                      </div>
                    ) : activeStory.sourceType === "instagram" ? (
                      <div className="w-full h-full pt-16 pb-24 overflow-hidden">
                        <FastInstagramEmbed url={activeStory.targetUrl} title={activeStory.title} />
                      </div>
                    ) : activeStory.sourceType === "youtube" && activeStory.youtubeId ? (
                      <div className="w-full aspect-video overflow-hidden rounded-2xl">
                        <AqeeqUnifiedVideoFrame
                          sourceUrl={"https://www.youtube.com/watch?v=" + activeStory.youtubeId}
                          title={activeStory.title}
                        />
                      </div>
                    ) : activeStory.videoUrl ? (
                      <div className="w-full aspect-video overflow-hidden rounded-2xl">
                        <AqeeqUnifiedVideoFrame
                          sourceUrl={activeStory.videoUrl!}
                          title={activeStory.title}
                          posterUrl={activeStory.imageUrl}
                        />
                      </div>
                    ) : activeStory.sourceType === "article" ? (
                      <div className="p-8 text-center text-white space-y-4">
                        <div className="mx-auto h-20 w-20 rounded-3xl bg-[#de191e]/20 border border-[#de191e]/30 flex items-center justify-center text-[#de191e] shadow-[0_0_30px_rgba(222,25,30,0.3)]">
                          <Newspaper size={40} />
                        </div>
                        <span className="inline-block rounded-full bg-[#de191e]/20 px-3 py-1 text-xs font-black text-[#de191e]">مقال أدبي جديد</span>
                        <p className="text-lg font-black leading-snug">{activeStory.title}</p>
                      </div>
                    ) : activeStory.sourceType === "podcast" ? (
                      <div className="p-8 text-center text-white space-y-4">
                        <div className="mx-auto h-20 w-20 rounded-3xl bg-[#f8ca14]/20 border border-[#f8ca14]/30 flex items-center justify-center text-[#f8ca14] shadow-[0_0_30px_rgba(248,202,20,0.3)] animate-pulse">
                          <Mic size={40} />
                        </div>
                        <span className="inline-block rounded-full bg-[#f8ca14]/20 px-3 py-1 text-xs font-black text-[#f8ca14]">أثير العقيق 🎙️</span>
                        <p className="text-lg font-black leading-snug">{activeStory.title}</p>
                      </div>
                    ) : activeStory.sourceType === "showcase" ? (
                      <div className="p-8 text-center text-white space-y-4">
                        <div className="mx-auto h-20 w-20 rounded-3xl bg-[#08467d]/20 border border-[#08467d]/30 flex items-center justify-center text-[#08467d] shadow-[0_0_30px_rgba(8,70,125,0.3)]">
                          <Video size={40} />
                        </div>
                        <span className="inline-block rounded-full bg-[#08467d]/20 px-3 py-1 text-xs font-black text-[#f8ca14]">عرض مرئي وتغطية</span>
                        <p className="text-lg font-black leading-snug">{activeStory.title}</p>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-white">
                        <span className="text-3xl font-black">العقيق</span>
                        <p className="mt-4 text-base font-bold">{activeStory.title}</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50 pointer-events-none" />
                  </div>

                  {/* Title / Caption & Direct Navigation Button */}
                  <div className="absolute bottom-6 inset-x-5 z-20 text-white text-right">
                    <span className="rounded bg-[#f8ca14] px-2 py-0.5 text-[10px] font-black text-black">
                      {activeStory.category}
                    </span>
                    <h3 className="mt-2 text-base font-black leading-snug">
                      {activeStory.title}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        const target = activeStory.targetUrl;
                        setActiveStoryIndex(null);
                        if (/^https?:\/\//i.test(target)) {
                          window.open(target, "_blank", "noopener,noreferrer");
                        } else {
                          navigate(target);
                        }
                      }}
                      className={"mt-4 w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-black transition active:scale-95 shadow-xl " + (
                        dark
                          ? "!bg-[#f8ca14] !text-black shadow-[0_0_20px_rgba(248,202,20,0.4)]"
                          : "!bg-[#08467d] !text-white shadow-[0_0_20px_rgba(8,70,125,0.3)]"
                      )}
                    >
                      <span>{activeStory.buttonLabel}</span>
                      <ArrowUpLeft size={16} />
                    </button>
                  </div>

                  {/* Mobile Tap Areas (Touch navigation left/right) */}
                  <button
                    type="button"
                    onClick={() => {
                      if (activeStoryIndex > 0) {
                        setActiveStoryIndex(activeStoryIndex - 1);
                        setStoryProgress(0);
                      }
                    }}
                    className="absolute inset-y-0 right-0 w-1/3 z-10 opacity-0 flex items-center justify-end pr-2 text-white"
                    aria-label="القصة السابقة"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (activeStoryIndex < storiesList.length - 1) {
                        setActiveStoryIndex(activeStoryIndex + 1);
                        setStoryProgress(0);
                      } else {
                        setActiveStoryIndex(null);
                      }
                    }}
                    className="absolute inset-y-0 left-0 w-1/3 z-10 opacity-0 flex items-center justify-start pl-2 text-white"
                    aria-label="القصة التالية"
                  />
                </motion.div>

                {/* Next Story Card (Desktop 3D Preview on the Left) */}
                {nextStory ? (
                  <motion.div
                    key={`next-story-${nextStory.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.45 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveStoryIndex(activeStoryIndex + 1);
                      setStoryProgress(0);
                    }}
                    className="group/next relative hidden lg:flex flex-col items-center justify-between w-[200px] xl:w-[230px] h-[66vh] max-h-[560px] rounded-[2rem] border border-white/20 bg-black/50 overflow-hidden shadow-2xl transition-opacity duration-200 cursor-pointer backdrop-blur-md shrink-0 hover:opacity-80 select-none"
                    style={{
                      transform: "perspective(1200px) rotateY(8deg) scale(0.88)",
                    }}
                    title={`القصة التالية: ${nextStory.title}`}
                  >
                    {nextStory.imageUrl ? (
                      <img
                        src={directDriveImage(nextStory.imageUrl) || nextStory.imageUrl}
                        alt={nextStory.title}
                        className="absolute inset-0 h-full w-full object-cover brightness-[0.6] group-hover/next:brightness-95 transition duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#181818] to-black">
                        <span className="text-3xl font-black text-white/30">العقيق</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/60" />
                    <div className="relative z-10 p-3.5 w-full flex items-center justify-between text-xs text-white/80">
                      <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold backdrop-blur-md">{nextStory.category}</span>
                      <span className="text-[10px] opacity-70">{nextStory.time}</span>
                    </div>
                    <div className="relative z-10 p-4 w-full text-right">
                      <p className="text-xs font-black line-clamp-2 text-white leading-snug">{nextStory.title}</p>
                      <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#f8ca14]">
                        <ChevronLeft size={14} />
                        <span>التالي</span>
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <div className="hidden lg:block w-[200px] xl:w-[230px] shrink-0" />
                )}
              </div>

              {/* Floating Navigation Controls on Desktop */}
              {activeStoryIndex > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveStoryIndex(activeStoryIndex - 1);
                    setStoryProgress(0);
                  }}
                  className="hidden sm:grid absolute right-3 md:right-5 lg:right-8 top-1/2 -translate-y-1/2 h-12 w-12 place-items-center rounded-full border border-white/25 bg-black/70 text-white hover:bg-[#f8ca14] hover:text-black hover:border-[#f8ca14] transition-colors duration-150 shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl z-50 p-2.5"
                  title="القصة السابقة"
                >
                  <ChevronRight size={26} />
                </button>
              )}
              {activeStoryIndex < storiesList.length - 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveStoryIndex(activeStoryIndex + 1);
                    setStoryProgress(0);
                  }}
                  className="hidden sm:grid absolute left-3 md:left-5 lg:left-8 top-1/2 -translate-y-1/2 h-12 w-12 place-items-center rounded-full border border-white/25 bg-black/70 text-white hover:bg-[#f8ca14] hover:text-black hover:border-[#f8ca14] transition-colors duration-150 shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl z-50 p-2.5"
                  title="القصة التالية"
                >
                  <ChevronLeft size={26} />
                </button>
              )}
            </motion.div>
          );
        })() : null}
      </AnimatePresence>

      {/* Wellington-style Interactive Cursor Hover Preview */}
      <AqeeqCursorHoverPreview />

      {/* Interactive FX Edit Modal */}
      <AqeeqInteractiveFxModal
        isOpen={Boolean(editingHoverItem)}
        onClose={() => setEditingHoverItem(null)}
        item={editingHoverItem}
        onSave={handleSaveHoverItem}
        isSaving={setOrchestrationMutation.isPending}
        dark={dark}
        openMediaPicker={openMediaPicker}
      />

      {/* Universal Media Picker Modal for Visual Editor */}
      <AqeeqUniversalMediaPickerModal
        open={mediaPickerConfig.open}
        onOpenChange={(open) => setMediaPickerConfig((prev) => ({ ...prev, open }))}
        title={mediaPickerConfig.title}
        currentSelectedUrl={mediaPickerConfig.currentUrl}
        onSelect={mediaPickerConfig.onSelect}
        dark={dark}
      />
    </main>
  );
}
