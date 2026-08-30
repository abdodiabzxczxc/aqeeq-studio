import { trpc } from "@/lib/trpc";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { resolveStudioCardCovers } from "@/lib/studioCardCovers";
import { useAuth } from "@/_core/hooks/useAuth";
import { AlaqeeqStudioSiteHeader } from "@/components/AlaqeeqStudioSiteHeader";
import { useVisualEditorState, VisualEditable, VisualIcon, VisualImage } from "@/components/VisualEditor";
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
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { FastInstagramEmbed, XEmbed } from "@/components/AqeeqAlbumSocialEmbed";

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
  return (
    <VisualEditable id={id} tag="image" label={label} as="span" className="absolute inset-0 block overflow-hidden">
      <img src={src} alt={alt} className={"h-full w-full " + imageClassName} />
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
        className={"aq-studio-share-media relative block h-[240px] w-full overflow-hidden border-b text-right " + (
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
  sourceType: "journal" | "album" | "post" | "x" | "instagram" | "youtube";
  targetUrl: string;
  buttonLabel: string;
  youtubeId?: string | null;
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
    const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    return { isWithin24Hours, label: "منذ " + diffMins + " دقيقة" };
  }
  if (diffHours < 2) return { isWithin24Hours, label: "منذ ساعة" };
  if (diffHours < 11) return { isWithin24Hours, label: "منذ " + Math.floor(diffHours) + " ساعات" };
  if (diffHours <= 24) return { isWithin24Hours, label: "منذ " + Math.floor(diffHours) + " ساعة" };
  return { isWithin24Hours: false, label: "منذ يوم" };
}

export default function AlaqeeqStudioPublicPage() {
  const [, navigate] = useLocation();
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";

  const { data: issues = [], isLoading: issuesLoading } = trpc.schoolNews.publicList.useQuery(undefined, { refetchOnWindowFocus: false });
  const { data: albums = [], isLoading: albumsLoading } = trpc.aqeeqAlbums.publicList.useQuery(undefined, { refetchOnWindowFocus: false });
  const { data: showcases = [], isLoading: showcasesLoading } = trpc.aqeeqShowcases.publicList.useQuery(undefined, { refetchOnWindowFocus: false });
  const { data: orchestration } = trpc.executiveAdmin.getSiteOrchestration.useQuery(undefined, { refetchOnMount: true, staleTime: 0 });

  const issue = issues[0];
  const album = albums[0];
  const showcase = showcases[0];

  const { data: showcaseDetail } = trpc.aqeeqShowcases.publicShowcase.useQuery(
    { slug: showcase?.slug || "news-offers" },
    { enabled: Boolean(showcase?.slug), refetchOnWindowFocus: false }
  );

  const defaultJournalCovers = resolveStudioCardCovers(issues, (entry) => entry.coverUrl);
  const defaultAlbumCovers = resolveStudioCardCovers(albums, (entry) => directDriveImage(entry.coverUrl) || entry.coverUrl);
  const defaultShowcaseCovers = resolveStudioCardCovers(
    showcaseDetail?.posts || [],
    (entry) => directDriveImage(entry.thumbnailUrl) || entry.thumbnailUrl || entry.mediaUrl
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
        const p = showcaseDetail?.posts?.find((post) => post.id === orchestration.heroCovers.customShowcasePostId);
        return p ? (directDriveImage(p.thumbnailUrl) || p.thumbnailUrl || p.mediaUrl) : null;
      })()
    : null;

  const journalCovers = {
    front: customJournalCover || defaultJournalCovers.front,
    back: defaultJournalCovers.back,
  };
  const albumCovers = {
    front: customAlbumCover || defaultAlbumCovers.front,
    back: defaultAlbumCovers.back,
  };
  const showcaseCovers = {
    front: customShowcaseCover || defaultShowcaseCovers.front,
    back: defaultShowcaseCovers.back,
  };
  const featuredEventPost = orchestration?.weeklyBento?.featuredMode === "custom" && orchestration?.weeklyBento?.customPostId
    ? showcaseDetail?.posts?.find((p) => p.id === orchestration.weeklyBento.customPostId) || showcaseDetail?.posts?.[0]
    : showcaseDetail?.posts?.[0];
  const logoUrl = issues.find((entry) => entry.headerLogoUrl)?.headerLogoUrl || null;

  // Interactive States for New Showcased Sections
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [likesCount, setLikesCount] = useState(482);
  const [hasLiked, setHasLiked] = useState(false);
  const [isPlayingQuoteAudio, setIsPlayingQuoteAudio] = useState(false);

  const totalPages = issues.reduce((total, entry) => total + Number(entry.pageCount || 0), 0);
  const totalFiles = albums.reduce((total, entry) => total + Number(entry.mediaCount || 0), 0);
  const totalPosts = showcases.reduce((total, entry) => total + Number(entry.postCount || 0), 0);

// Dynamic 24-Hour Snapchat-style Stories Data
  const storiesList: StoryItem[] = useMemo(() => {
    const items: StoryItem[] = [];

    // 1. Posts from Showcase (within 24h)
    for (const post of showcaseDetail?.posts || []) {
      const { isWithin24Hours, label } = formatArabicTimeAgo(post.createdAt);
      if (!isWithin24Hours) continue;

      const postUrl = post.externalUrl || post.mediaUrl || "";
      const isX = post.sourceType === "x" || postUrl.includes("x.com") || postUrl.includes("twitter.com");
      const isInsta = post.sourceType === "instagram" || postUrl.includes("instagram.com");
      const isYT = post.sourceType === "youtube" || postUrl.includes("youtube.com") || postUrl.includes("youtu.be");

      if (isX) {
        items.push({
          id: "story-post-" + post.id,
          title: post.title || post.fileName || "منشور من منصة 𝕏",
          category: "منشور 𝕏",
          imageUrl: null,
          time: label || "الآن",
          sourceType: "x",
          targetUrl: postUrl || "/offers",
          buttonLabel: "فتح المنشور على منصة 𝕏",
        });
      } else if (isInsta) {
        items.push({
          id: "story-post-" + post.id,
          title: post.title || post.fileName || "منشور Instagram",
          category: "Instagram",
          imageUrl: null,
          time: label || "الآن",
          sourceType: "instagram",
          targetUrl: postUrl || "/offers",
          buttonLabel: "فتح المنشور على Instagram",
        });
      } else if (isYT) {
        let ytId: string | null = null;
        try {
          const match = postUrl.match(/(?:v=|\/shorts\/|\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
          if (match) ytId = match[1];
        } catch {}
        items.push({
          id: "story-post-" + post.id,
          title: post.title || post.fileName || "فيديو YouTube",
          category: "فيديو YouTube",
          imageUrl: ytId ? "https://img.youtube.com/vi/" + ytId + "/hqdefault.jpg" : null,
          time: label || "الآن",
          sourceType: "youtube",
          targetUrl: postUrl || "/offers",
          buttonLabel: "مشاهدة الفيديو على YouTube",
          youtubeId: ytId,
        });
      } else {
        const img = directDriveImage(post.thumbnailUrl) || post.thumbnailUrl || post.mediaUrl;
        if (!img) continue;
        items.push({
          id: "story-post-" + post.id,
          title: post.title || post.fileName.replace(/\.[^.]+$/, ""),
          category: post.mediaType === "video" ? "فيديو جديد" : "خبر جديد",
          imageUrl: img,
          time: label || "الآن",
          sourceType: "post",
          targetUrl: "/offers",
          buttonLabel: "فتح الخبر والتغطية الكاملة",
        });
      }
    }

    // 2. Journal Issues (within 24h)
    for (const iss of issues) {
      if (!iss.coverUrl) continue;
      const { isWithin24Hours, label } = formatArabicTimeAgo(iss.createdAt || iss.issueDate);
      if (!isWithin24Hours) continue;
      items.push({
        id: "story-issue-" + iss.id,
        title: iss.title,
        category: "مجلة العقيق",
        imageUrl: iss.coverUrl,
        time: label || "اليوم",
        sourceType: "journal",
        targetUrl: "/journal/issue/" + encodeURIComponent(iss.slug),
        buttonLabel: "تصفح مجلة العقيق الآن",
      });
    }

    // 3. Albums (within 24h)
    for (const alb of albums) {
      const img = directDriveImage(alb.coverUrl) || alb.coverUrl;
      if (!img) continue;
      const { isWithin24Hours, label } = formatArabicTimeAgo(alb.createdAt || alb.albumDate);
      if (!isWithin24Hours) continue;
      items.push({
        id: "story-album-" + alb.id,
        title: alb.title,
        category: "ألبوم فعاليات",
        imageUrl: img,
        time: label || "اليوم",
        sourceType: "album",
        targetUrl: "/albums/" + encodeURIComponent(alb.slug),
        buttonLabel: "مشاهدة الألبوم بالكامل",
      });
    }

    const hiddenSet = new Set(orchestration?.hiddenStoryIds || []);
    return items.filter((it) => !hiddenSet.has(it.id) && !hiddenSet.has(it.id.replace("story-", "")));
  }, [showcaseDetail?.posts, issues, albums, orchestration?.hiddenStoryIds]);

  // Story Auto-Advance Timer
  useEffect(() => {
    if (activeStoryIndex === null) {
      setStoryProgress(0);
      return;
    }
    setStoryProgress(0);
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

  if (issuesLoading || albumsLoading || showcasesLoading) {
    return (
      <main dir="rtl" className={"grid min-h-screen place-items-center " + (dark ? "bg-black text-white" : "bg-white text-black")}>
        <Loader2 className="animate-spin text-[#f8ca14]" />
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className={"aq-studio-share min-h-screen overflow-x-hidden " + (
        dark ? "aq-studio-share--dark bg-black text-white" : "aq-studio-share--light bg-white text-black"
      )}
    >
      <AlaqeeqStudioSiteHeader title="استوديو العقيق" active="studio" logoUrl={logoUrl} />

      {/* 1. شريط «قصص ولحظات اليوم» (Stories 24H) - تصميم فائق النظافة والأناقة (Minimalist Instagram/Snapchat Style) */}
      {storiesList.length > 0 ? (
        <section className={"border-b py-3.5 sm:py-4 backdrop-blur-md transition " + (
          dark ? "border-white/[0.08] bg-[#070707]/90" : "border-black/[0.05] bg-white/90"
        )}>
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 md:px-8">
            <div className="flex items-center gap-4 sm:gap-5 overflow-x-auto py-1 scrollbar-none">
              {storiesList.map((story, index) => (
                <button
                  key={story.id}
                  type="button"
                  onClick={() => setActiveStoryIndex(index)}
                  className="group flex flex-col items-center gap-1.5 shrink-0 text-center transition active:scale-95"
                >
                  <div className={"relative p-[2.5px] rounded-full transition duration-300 group-hover:scale-105 " + (
                    dark
                      ? "bg-gradient-to-tr from-[#f8ca14] via-[#de191e] to-[#08467d] shadow-[0_0_12px_rgba(248,202,20,0.2)]"
                      : "bg-gradient-to-tr from-[#08467d] via-[#367453] to-[#f8ca14] shadow-[0_0_10px_rgba(8,70,125,0.15)]"
                  )}>
                    <div className={"h-14 w-14 sm:h-16 sm:w-16 overflow-hidden rounded-full border-2 flex items-center justify-center " + (
                      dark ? "border-black bg-[#121212]" : "border-white bg-slate-100"
                    )}>
                      {story.sourceType === "instagram" ? (
                        <div className="grid h-full w-full place-items-center bg-gradient-to-tr from-[#f8ca14] via-[#de191e] to-[#08467d] text-white">
                          <Instagram size={24} />
                        </div>
                      ) : story.sourceType === "x" ? (
                        <div className="grid h-full w-full place-items-center bg-black text-white font-black text-xl">
                          𝕏
                        </div>
                      ) : story.imageUrl ? (
                        <img src={story.imageUrl} alt={story.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                      ) : (
                        <span className="text-xs font-black">العقيق</span>
                      )}
                    </div>
                    <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full bg-[#367453] border-2 border-black animate-pulse" />
                  </div>
                  <p className={"max-w-[72px] sm:max-w-[84px] truncate text-[10px] sm:text-[11px] font-black transition " + (
                    dark ? "text-slate-200 group-hover:text-[#f8ca14]" : "text-slate-800 group-hover:text-[#08467d]"
                  )}>
                    {story.title}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* 2. غلاف استوديو العقيق الرئيسي (Hero Section مع الكفرات المتداخلة) */}
      <VisualEditable
        id="studio-hero-section"
        tag="section"
        label="غلاف استوديو العقيق"
        as="section"
        className={"aq-studio-share-hero relative isolate overflow-hidden border-b " + (
          dark ? "border-white/[0.08] bg-black text-white" : "border-black/[0.06] bg-white text-black"
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(248,202,20,0.14),transparent_30%),radial-gradient(circle_at_10%_90%,rgba(255,255,255,0.02),transparent_35%)]" />
        <div className="relative mx-auto grid max-w-[1360px] items-center gap-8 px-5 py-12 md:px-8 md:py-16 lg:grid-cols-[minmax(430px,0.95fr)_minmax(0,1.05fr)] lg:gap-16">
          <div>
            <VisualEditable
              id="studio-hero-kicker"
              tag="text"
              label="شارة غلاف الاستوديو"
              defaultText="AQEEQ STUDIO · DIGITAL ARCHIVE"
              as="p"
              className={"text-[10px] font-black tracking-[0.18em] " + (dark ? "text-[#f8ca14]" : "text-[#08467d]")}
            />
            <h1 className={"mt-4 text-4xl font-black leading-[1.1] md:text-6xl " + (dark ? "text-white" : "text-black")}>
              <VisualEditable id="studio-hero-title" tag="text" label="العنوان الرئيسي للاستوديو" defaultText="ذاكرة العقيق" as="span" />
              <br />
              <VisualEditable
                id="studio-hero-accent"
                tag="text"
                label="تكملة عنوان الاستوديو"
                defaultText="في مكان واحد."
                as="span"
                className={dark ? "text-[#f8ca14]" : "text-[#08467d]"}
              />
            </h1>
            <VisualEditable
              id="studio-hero-description"
              tag="text"
              label="وصف غلاف الاستوديو"
              defaultText="منصة مدارس العقيق الرقمية المتكاملة لتوثيق الفعاليات المدرسية، إصدارات المجلات الدورية، وأحدث الأخبار والعروض في تجربة تفاعلية فاخرة."
              as="p"
              className={"mt-5 max-w-xl text-sm leading-8 " + (dark ? "text-slate-300" : "text-slate-600")}
            />

            {/* Stats Bar */}
            <div className={"mt-8 grid max-w-lg grid-cols-3 divide-x divide-x-reverse border-y py-4 " + (
              dark ? "divide-white/[0.1] border-white/[0.1]" : "divide-black/[0.08] border-black/[0.08]"
            )}>
              <div className="pl-3">
                <VisualEditable
                  id="studio-issues-label"
                  tag="text"
                  label="وصف عداد المجلات"
                  defaultText="PUBLISHED ISSUES"
                  as="p"
                  className={"text-[8px] font-black tracking-[0.12em] " + (dark ? "text-[#f8ca14]/80" : "text-[#08467d]/80")}
                />
                <p className={"mt-1 text-2xl font-black " + (dark ? "text-white" : "text-black")}>{String(issues.length).padStart(2, "0")}</p>
              </div>
              <div className="px-3">
                <VisualEditable
                  id="studio-albums-label"
                  tag="text"
                  label="وصف عداد الألبومات"
                  defaultText="EVENT ALBUMS"
                  as="p"
                  className={"text-[8px] font-black tracking-[0.12em] " + (dark ? "text-[#f8ca14]/80" : "text-[#08467d]/80")}
                />
                <p className={"mt-1 text-2xl font-black " + (dark ? "text-white" : "text-black")}>{String(albums.length).padStart(2, "0")}</p>
              </div>
              <div className="pr-3">
                <VisualEditable
                  id="studio-showcase-label"
                  tag="text"
                  label="وصف عداد الأخبار والعروض"
                  defaultText="NEWS & OFFERS"
                  as="p"
                  className={"text-[8px] font-black tracking-[0.12em] " + (dark ? "text-[#f8ca14]/80" : "text-[#08467d]/80")}
                />
                <p className={"mt-1 text-2xl font-black " + (dark ? "text-white" : "text-black")}>{String(totalPosts).padStart(2, "0")}</p>
              </div>
            </div>
          </div>

          {/* Overlapping Hero Covers */}
          <div className="relative mx-auto h-[290px] w-full max-w-[620px] sm:h-[360px] lg:h-[430px]">
            <div className={"absolute bottom-[12%] right-[1%] top-[14%] w-[45%] overflow-hidden rounded-[1.6rem] border opacity-60 " + (
              dark ? "border-white/[0.08] bg-[#111111]" : "border-black/[0.08] bg-slate-100"
            )}>
              <VisualImage
                id="studio-hero-showcase-image"
                label="صورة أخبار وعروض غلاف الاستوديو"
                src={showcaseCovers.front || directDriveImage(showcase?.coverUrl) || showcase?.coverUrl || ""}
                alt="غلاف الأخبار والعروض"
                className="h-full w-full object-cover"
              />
            </div>
            <div
              role="button"
              tabIndex={0}
              onClick={() => navigate("/albums")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") navigate("/albums");
              }}
              className={"group absolute bottom-[8%] left-[28%] top-[8%] z-10 w-[53%] cursor-pointer overflow-hidden rounded-[1.8rem] border transition duration-300 hover:scale-[1.02] " + (
                dark ? "border-white/[0.15] bg-[#111111]" : "border-black/[0.12] bg-white shadow-md"
              )}
            >
              <VisualImage
                id="studio-hero-album-image"
                label="صورة ألبوم غلاف الاستوديو"
                src={albumCovers.front || ""}
                alt="غلاف ألبوم العقيق"
                className="h-full w-full object-cover opacity-85 transition duration-700 group-hover:scale-[1.03]"
              />
            </div>
            <div
              role="button"
              tabIndex={0}
              onClick={() => navigate("/journal")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") navigate("/journal");
              }}
              className={"group absolute bottom-[2%] left-[1%] top-[5%] z-20 w-[48%] cursor-pointer overflow-hidden rounded-[1.9rem] border p-2 transition duration-300 hover:scale-[1.02] " + (
                dark
                  ? "border-[#f8ca14]/50 bg-[#111111] shadow-[0_30px_70px_rgba(0,0,0,0.8)]"
                  : "border-[#08467d]/40 bg-white shadow-[0_30px_70px_rgba(8,70,125,0.15)]"
              )}
            >
              <VisualImage
                id="studio-hero-journal-image"
                label="صورة مجلة غلاف الاستوديو"
                src={journalCovers.front || ""}
                alt="غلاف مجلة العقيق"
                className="h-full w-full rounded-[1.4rem] object-cover transition duration-700 group-hover:scale-[1.03]"
              />
            </div>
          </div>
        </div>
      </VisualEditable>

      {/* 3. نظرة عامة سريعة (Quick Overview Cards) */}
      <section className={"border-b py-12 md:py-16 " + (dark ? "border-white/[0.08] bg-[#050505]" : "border-black/[0.06] bg-[#fafafa]")}>
        <div className="mx-auto grid max-w-[1340px] gap-6 px-5 sm:grid-cols-2 md:px-8 lg:grid-cols-3">
          <ArchiveCard
            id="studio-journal-card"
            title="مجلة العقيق"
            label="WEEKLY JOURNAL · 01"
            body="أعداد دورية موثقة بتقليب تفاعلي وتنسيق صحفي يواكب كل جديد في مسيرة المدارس."
            imageUrl={journalCovers.front}
            previousImageUrl={journalCovers.back}
            onOpen={() => navigate("/journal")}
            icon="book"
            count={issues.length}
            dark={dark}
          />
          <ArchiveCard
            id="studio-albums-card"
            title="ألبوم العقيق"
            label="EVENT ARCHIVE · 02"
            body="صور وفيديوهات الفعاليات في تجربة واحدة تحفظ المشاهد كما عاشت."
            imageUrl={albumCovers.front}
            previousImageUrl={albumCovers.back}
            onOpen={() => navigate("/albums")}
            icon="camera"
            count={albums.length}
            dark={dark}
          />
          <ArchiveCard
            id="studio-showcase-card"
            title="الأخبار والعروض"
            label="AQEEQ LIVE FEED · 03"
            body="خلاصة مباشرة للصور والفيديوهات، تجمع كل جديد من حياة العقيق وعروضها."
            imageUrl={showcaseCovers.front || directDriveImage(showcase?.coverUrl) || showcase?.coverUrl}
            previousImageUrl={showcaseCovers.back || showcaseCovers.front || directDriveImage(showcase?.coverUrl) || showcase?.coverUrl}
            onOpen={() => navigate("/offers")}
            icon="clapperboard"
            count={totalPosts}
            dark={dark}
          />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. الأقسام المعتمدة: القصص اليومية، بينتو إنجازات الأسبوع، وصوت العقيق */}
      {/* ========================================================================= */}

      {/* 🌟 2. لوحة «بينتو إنجازات وأحداث الأسبوع» (Weekly Bento Grid Highlights) */}
      <VisualEditable
        id="studio-bento-section"
        tag="section"
        label="قسم إنجازات وأحداث الأسبوع"
        as="section"
        className={"border-b py-14 md:py-20 transition " + (dark ? "border-white/[0.08] bg-[#090909]" : "border-black/[0.06] bg-[#fbfbfb]")}
      >
        <div className="mx-auto max-w-[1340px] px-5 md:px-8">
          <div className="mb-8">
            <VisualEditable
              id="studio-bento-kicker"
              tag="text"
              label="شارة إنجازات الأسبوع"
              defaultText="WEEKLY HIGHLIGHTS · SPOTLIGHT"
              as="span"
              className={"inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[9px] font-black tracking-widest " + (
                dark ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]" : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"
              )}
            >
              {(text) => (
                <>
                  <Trophy size={11} />
                  {text}
                </>
              )}
            </VisualEditable>
            <VisualEditable
              id="studio-bento-title"
              tag="text"
              label="عنوان إنجازات وأحداث الأسبوع"
              defaultText="أبرز أحداث وإنجازات الأسبوع"
              as="h2"
              className={"mt-1 text-2xl font-black sm:text-3xl " + (dark ? "text-white" : "text-black")}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-4">
            {/* Bento Card 1: الحدث الرئيسي الأبرز (Spans 2 columns) */}
            <VisualEditable
              id="studio-bento-card1"
              tag="section"
              label="بطاقة الحدث التعليمي الأبرز"
              as="div"
              className={"group relative overflow-hidden rounded-[2rem] border p-6 sm:p-8 md:col-span-2 lg:col-span-2 flex flex-col justify-between transition duration-300 " + (
                dark
                  ? "border-white/[0.08] bg-gradient-to-br from-[#141414] to-[#0a0a0a] shadow-xl hover:border-[#f8ca14]/50"
                  : "border-black/[0.08] bg-white shadow-md hover:border-[#08467d]/50"
              )}
            >
              <div className="relative h-48 sm:h-56 overflow-hidden rounded-2xl mb-6">
                <VisualImage
                  id="studio-bento-card1-image"
                  label="صورة الحدث التعليمي الأبرز"
                  src={
                    (featuredEventPost ? (directDriveImage(featuredEventPost.thumbnailUrl) || featuredEventPost.thumbnailUrl || featuredEventPost.mediaUrl) : null) ||
                    showcaseCovers.front || albumCovers.front || "/alaqeeq-hero-dark.png"
                  }
                  alt="تغطية الأسبوع"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <VisualEditable
                  id="studio-bento-card1-tag"
                  tag="text"
                  label="شارة وسم الأسبوع"
                  defaultText={orchestration?.weeklyBento?.customTag || "🌟 تغطية الأسبوع الكبرى"}
                  as="span"
                  className={"absolute top-3 right-3 rounded-full border px-3 py-1 text-[10px] font-black backdrop-blur-md " + (
                    dark ? "border-[#f8ca14]/40 bg-black/80 text-[#f8ca14]" : "border-[#08467d]/20 bg-white/90 text-[#08467d]"
                  )}
                />
              </div>
              <div>
                <VisualEditable
                  id="studio-bento-card1-category"
                  tag="text"
                  label="تصنيف الحدث الأبرز"
                  defaultText="الحدث التعليمي الأبرز"
                  as="span"
                  className={"text-xs font-black " + (dark ? "text-[#f8ca14]" : "text-[#08467d]")}
                />
                <VisualEditable
                  id="studio-bento-card1-title"
                  tag="text"
                  label="عنوان الحدث الأبرز"
                  defaultText={orchestration?.weeklyBento?.customTitle || featuredEventPost?.title || "انطلاق فعاليات الأسبوع العلمي وتكريم الفرسان"}
                  as="h3"
                  className={"mt-2 text-xl sm:text-2xl font-black leading-snug " + (dark ? "text-white" : "text-black")}
                />
                <VisualEditable
                  id="studio-bento-card1-desc"
                  tag="text"
                  label="وصف الحدث الأبرز"
                  defaultText={orchestration?.weeklyBento?.customDescription || "تغطية شاملة للفعاليات، ورش العمل الإبداعية، ولحظات التميز في ساحات ومختبرات مدارس العقيق."}
                  as="p"
                  className={"mt-2 text-xs sm:text-sm leading-6 " + (dark ? "text-slate-400" : "text-slate-600")}
                />
              </div>
              <div className={"mt-6 pt-4 border-t flex items-center justify-between " + (dark ? "border-white/[0.08]" : "border-black/[0.08]")}>
                <VisualEditable
                  id="studio-bento-card1-action"
                  tag="button"
                  label="زر مشاهدة التغطية"
                  defaultText="مشاهدة التغطية بالكامل"
                  as="button"
                  onAction={() => navigate("/offers")}
                  className={"inline-flex items-center gap-2 text-xs font-black transition " + (
                    dark ? "text-[#f8ca14] hover:opacity-80" : "text-[#08467d] hover:opacity-80"
                  )}
                >
                  {(text) => (
                    <>
                      {text} <ArrowUpLeft size={15} />
                    </>
                  )}
                </VisualEditable>
              </div>
            </VisualEditable>

            {/* Bento Card 2: وسام وإنجاز الأسبوع */}
            <VisualEditable
              id="studio-bento-card2"
              tag="section"
              label="بطاقة وسام التميز الأكاديمي"
              as="div"
              className={"relative overflow-hidden rounded-[2rem] border p-6 flex flex-col justify-between transition duration-300 " + (
                dark
                  ? "border-[#f8ca14]/30 bg-[#0d0d0d] shadow-xl"
                  : "border-[#08467d]/20 bg-white shadow-md"
              )}
            >
              <div>
                <div className={"grid h-12 w-12 place-items-center rounded-2xl mb-4 " + (
                  dark ? "bg-[#f8ca14]/15 text-[#f8ca14]" : "bg-[#08467d]/10 text-[#08467d]"
                )}>
                  <Award size={24} />
                </div>
                <VisualEditable
                  id="studio-bento-card2-label"
                  tag="text"
                  label="شارة وسام التميز"
                  defaultText={orchestration?.weeklyBento?.academicBadgeTitle || "وسام التميز الأكاديمي"}
                  as="span"
                  className={"text-[10px] font-black tracking-wider " + (dark ? "text-[#f8ca14]" : "text-[#08467d]")}
                />
                <VisualEditable
                  id="studio-bento-card2-title"
                  tag="text"
                  label="عنوان وسام التميز"
                  defaultText={orchestration?.weeklyBento?.academicBadgeWeek || "فخر مدارس العقيق"}
                  as="h4"
                  className={"mt-2 text-lg font-black " + (dark ? "text-white" : "text-black")}
                />
                <VisualEditable
                  id="studio-bento-card2-desc"
                  tag="text"
                  label="وصف وسام التميز"
                  defaultText={orchestration?.weeklyBento?.academicBadgeDesc || "تحقيق المركز الأول في مسابقات الموهبة والابتكار على مستوى المنطقة وتكريم الطلاب المشاركين."}
                  as="p"
                  className={"mt-2 text-xs leading-6 " + (dark ? "text-slate-400" : "text-slate-600")}
                />
              </div>
              <div className={"mt-6 pt-4 border-t " + (dark ? "border-white/[0.08]" : "border-black/[0.08]")}>
                <VisualEditable
                  id="studio-bento-card2-tag"
                  tag="text"
                  label="وسم تكريم مستحق"
                  defaultText="🥇 تكريم مستحق"
                  as="span"
                  className={"inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-black " + (
                    dark ? "bg-white/[0.05] text-[#f8ca14]" : "bg-slate-100 text-[#08467d]"
                  )}
                />
              </div>
            </VisualEditable>

            {/* Bento Card 3: مقياس نبض التفاعل الأسبوعي */}
            <VisualEditable
              id="studio-bento-card3"
              tag="section"
              label="بطاقة نبض التفاعل"
              as="div"
              className={"relative overflow-hidden rounded-[2rem] border p-6 flex flex-col justify-between transition duration-300 " + (
                dark
                  ? "border-white/[0.08] bg-[#0d0d0d] shadow-xl"
                  : "border-black/[0.08] bg-white shadow-md"
              )}
            >
              <div>
                <div className={"grid h-12 w-12 place-items-center rounded-2xl mb-4 " + (
                  dark ? "bg-[#de191e]/15 text-[#de191e]" : "bg-[#de191e]/10 text-[#de191e]"
                )}>
                  <Flame size={24} />
                </div>
                <VisualEditable
                  id="studio-bento-card3-title"
                  tag="text"
                  label="عنوان نبض أولياء الأمور"
                  defaultText="نبض وتفاعل أولياء الأمور"
                  as="span"
                  className={"text-[10px] font-black tracking-wider " + (dark ? "text-[#f8ca14]" : "text-[#08467d]")}
                />
                <p className={"mt-3 text-3xl sm:text-4xl font-black " + (dark ? "text-white" : "text-black")}>
                  +{(orchestration?.weeklyBento?.heartsCount ?? 142) + (hasLiked ? 1 : 0)}
                </p>
                <VisualEditable
                  id="studio-bento-card3-desc"
                  tag="text"
                  label="وصف نبض أولياء الأمور"
                  defaultText="إعجاب وتشجيع لطلاب وأنشطة هذا الأسبوع"
                  as="p"
                  className={"mt-1 text-xs " + (dark ? "text-slate-400" : "text-slate-500")}
                />
              </div>

              <div className={"mt-6 pt-4 border-t " + (dark ? "border-white/[0.08]" : "border-black/[0.08]")}>
                <button
                  type="button"
                  onClick={toggleLike}
                  className={"w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-black transition active:scale-95 " + (
                    hasLiked
                      ? "bg-[#de191e] text-white shadow-lg"
                      : (dark ? "bg-white/10 text-white hover:bg-[#de191e]/20" : "bg-slate-100 text-slate-900 hover:bg-[#de191e]/10")
                  )}
                >
                  <Heart size={16} className={hasLiked ? "fill-current" : ""} />
                  {hasLiked ? "أنت معجب بهذا! ❤️" : "شجّع الطلاب الآن"}
                </button>
              </div>
            </VisualEditable>
          </div>
        </div>
      </VisualEditable>

      {/* 🌟 3. لوحة «صوت العقيق» التحريرية (Editorial Spotlight & Quote) */}
      <VisualEditable
        id="studio-editorial-section"
        tag="section"
        label="قسم صوت العقيق والكلمة التوجيهية"
        as="section"
        className={"border-b py-14 md:py-20 transition " + (dark ? "border-white/[0.08] bg-[#0a0a0a]" : "border-black/[0.06] bg-[#f7f7f8]")}
      >
        <div className="mx-auto max-w-[1340px] px-5 md:px-8">
          <div className="mb-6">
            <VisualEditable
              id="studio-editorial-kicker"
              tag="text"
              label="شارة صوت العقيق"
              defaultText="EDITORIAL · LEADERSHIP MESSAGE"
              as="span"
              className={"inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[9px] font-black tracking-widest " + (
                dark ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]" : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"
              )}
            >
              {(text) => (
                <>
                  <Quote size={11} />
                  {text}
                </>
              )}
            </VisualEditable>
          </div>

          <div className={"relative overflow-hidden rounded-[2.2rem] border p-8 sm:p-12 " + (
            dark
              ? "border-[#f8ca14]/30 bg-gradient-to-l from-[#161616] to-[#0a0a0a] shadow-2xl"
              : "border-[#08467d]/20 bg-white shadow-xl"
          )}>
            <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-8 items-center">
              <div>
                <Quote size={40} className={dark ? "text-[#f8ca14]/30" : "text-[#08467d]/25"} />
                <VisualEditable
                  id="studio-editorial-quote"
                  tag="text"
                  label="نص اقتباس صوت العقيق"
                  defaultText={`«${orchestration?.editorialVoice?.quoteText || "في مدارس العقيق، لا نعلّم للعلم فحسب، بل نصنع قيادات المستقبل بوعي وطموح لا ينضب."}»`}
                  as="h3"
                  className={"mt-3 text-2xl sm:text-3xl lg:text-4xl font-black leading-relaxed " + (dark ? "text-white" : "text-black")}
                />
                <VisualEditable
                  id="studio-editorial-author"
                  tag="text"
                  label="اسم ووصف صاحب الاقتباس"
                  defaultText={(orchestration?.editorialVoice?.authorName ? `${orchestration.editorialVoice.authorName} · ` : "") + (orchestration?.editorialVoice?.authorTitle || "المشرف العام على مدارس العقيق الأهلية")}
                  as="p"
                  className={"mt-4 text-sm font-black " + (dark ? "text-[#f8ca14]" : "text-[#08467d]")}
                />
              </div>

              <div className={"flex flex-col items-center justify-center p-6 rounded-2xl border text-center " + (
                dark ? "border-white/[0.08] bg-black/40" : "border-black/[0.06] bg-slate-50"
              )}>
                <div className={"grid h-16 w-16 place-items-center rounded-full mb-3 " + (
                  dark ? "bg-[#f8ca14]/15 text-[#f8ca14]" : "bg-[#08467d]/10 text-[#08467d]"
                )}>
                  <Radio size={28} className={isPlayingQuoteAudio ? "animate-pulse text-[#de191e]" : ""} />
                </div>
                <VisualEditable
                  id="studio-editorial-audio-title"
                  tag="text"
                  label="عنوان الكلمة التوجيهية"
                  defaultText="الكلمة التوجيهية الأسبوعية"
                  as="h4"
                  className={"font-black text-sm " + (dark ? "text-white" : "text-black")}
                />
                <VisualEditable
                  id="studio-editorial-audio-desc"
                  tag="text"
                  label="وصف الكلمة التوجيهية"
                  defaultText="رسالة الإدارة لفرسان وأولياء أمور المدارس"
                  as="p"
                  className={"mt-1 text-xs " + (dark ? "text-slate-400" : "text-slate-500")}
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
                      : "!bg-[#08467d] !text-white shadow-[0_0_15px_rgba(8,70,125,0.2)]"
                  )}
                >
                  {isPlayingQuoteAudio ? <VolumeX size={15} /> : <Volume2 size={15} />}
                  {isPlayingQuoteAudio ? "إيقاف الاستماع" : "استمع للكلمة الصوتية"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </VisualEditable>

      {/* 7. قسم ذاكرة العقيق المفتوحة (Memory Wall) */}
      <VisualEditable
        id="studio-memory-section"
        tag="section"
        label="قسم ذاكرة العقيق"
        as="section"
        className={"border-b py-14 md:py-20 " + (dark ? "border-white/[0.08] bg-black" : "border-black/[0.06] bg-white")}
      >
        <div className="mx-auto max-w-[1340px] px-5 md:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] items-center">
            <div>
              <VisualEditable
                id="studio-memory-kicker"
                tag="text"
                label="شارة ذاكرة العقيق"
                defaultText="VISUAL MEMORY"
                as="p"
                className={"text-[10px] font-black tracking-[0.18em] " + (dark ? "text-[#f8ca14]" : "text-[#08467d]")}
              />
              <VisualEditable
                id="studio-memory-title"
                tag="text"
                label="عنوان قسم ذاكرة العقيق"
                defaultText="ذاكرة العقيق الحية."
                as="h2"
                className={"mt-1 text-3xl font-black md:text-4xl " + (dark ? "text-white" : "text-black")}
              />
              <VisualEditable
                id="studio-memory-body"
                tag="text"
                label="وصف ذاكرة العقيق"
                defaultText="كل عدد يوثّق قصة، وكل ألبوم يحفظ لحظة. لقطات حقيقية من أرشيف مدارس العقيق المتجدد."
                as="p"
                className={"mt-4 max-w-md text-sm leading-8 " + (dark ? "text-slate-400" : "text-slate-600")}
              />
              <VisualEditable
                id="studio-memory-action"
                tag="button"
                label="زر استكشاف الأرشيف"
                defaultText="استكشف الأرشيف"
                as="button"
                onAction={() => navigate("/journal")}
                className={"mt-6 inline-flex items-center gap-2 border-b pb-1.5 text-sm font-black transition " + (
                  dark ? "border-[#f8ca14]/60 text-[#f8ca14] hover:opacity-80" : "border-[#08467d]/60 text-[#08467d] hover:opacity-80"
                )}
              >
                {(text) => (
                  <>
                    {text} <ArrowUpLeft size={16} />
                  </>
                )}
              </VisualEditable>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-5">
              {memoryEntries.map((entry, index) => (
                <VisualEditable
                  key={entry.id}
                  id={"studio-memory-" + entry.id}
                  tag="section"
                  label={"بطاقة ذاكرة " + entry.title}
                  as="button"
                  onAction={entry.onOpen}
                  className={"group relative h-[230px] sm:h-[300px] overflow-hidden rounded-[1.5rem] border text-right transition duration-300 hover:-translate-y-1 " + (
                    index === 1 ? "mt-6" : ""
                  ) + " " + (
                    dark
                      ? "border-white/[0.1] bg-[#111111] shadow-[0_20px_48px_rgba(0,0,0,0.5)] hover:border-[#f8ca14]/60"
                      : "border-black/[0.08] bg-white shadow-[0_15px_35px_rgba(0,0,0,0.08)] hover:border-[#08467d]/50"
                  )}
                >
                  <VisualImage
                    id={"studio-memory-" + entry.id + "-image"}
                    label={"صورة " + entry.title}
                    src={entry.imageUrl || ""}
                    alt={entry.title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent px-3 pb-4 pt-16">
                    <p className="text-[9px] font-black text-[#f8ca14]">{entry.label}</p>
                    <p className="mt-1 truncate text-xs font-black text-white">{entry.title}</p>
                  </div>
                </VisualEditable>
              ))}
            </div>
          </div>
        </div>
      </VisualEditable>

      {/* 8. إحصائيات الأرشيف المفتوح الشامل - المحدث ليشمل الأخبار والعروض والمجلات والألبومات */}
      <VisualEditable
        id="studio-archive-summary"
        tag="section"
        label="قسم الأرشيف المفتوح"
        as="section"
        className="mx-auto max-w-[1340px] px-5 py-16 md:px-8 md:py-20"
      >
        <div className={"rounded-[2rem] border px-5 py-9 sm:px-8 sm:py-12 " + (
          dark
            ? "border-[#f8ca14]/25 bg-[#080808] text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            : "border-[#08467d]/20 bg-[#fbfbfb] text-black shadow-[0_20px_50px_rgba(0,0,0,0.06)]"
        )}>
          <div className="max-w-2xl">
            <VisualEditable
              id="studio-archive-kicker"
              tag="text"
              label="شارة الأرشيف"
              defaultText="THE OPEN ARCHIVE & LIVE FEED"
              as="p"
              className={"text-[10px] font-black tracking-[0.18em] " + (dark ? "text-[#f8ca14]" : "text-[#08467d]")}
            />
            <h2 className={"mt-2 text-3xl font-black md:text-4xl " + (dark ? "text-white" : "text-black")}>
              <VisualEditable id="studio-archive-title" tag="text" label="عنوان الأرشيف" defaultText="أرشيف العقيق" as="span" />{" "}
              <VisualEditable
                id="studio-archive-accent"
                tag="text"
                label="تكملة عنوان الأرشيف"
                defaultText="المفتوح."
                as="span"
                className={dark ? "text-[#f8ca14]" : "text-[#08467d]"}
              />
            </h2>
            <VisualEditable
              id="studio-archive-body"
              tag="text"
              label="وصف الأرشيف"
              defaultText="ذاكرة رقمية متكاملة تنمو يومياً مع كل خبر وعرض مباشر، وكل عدد جديد من المجلة، وكل ألبوم فعالية، متاحة بالكامل للجمهور والزوار."
              as="p"
              className={"mt-3 text-sm leading-8 " + (dark ? "text-slate-400" : "text-slate-600")}
            />
          </div>

          <div className={"mt-9 grid grid-cols-2 divide-x divide-x-reverse divide-y border-y sm:grid-cols-3 lg:grid-cols-5 lg:divide-y-0 " + (
            dark ? "divide-white/[0.08] border-white/[0.08]" : "divide-black/[0.08] border-black/[0.08]"
          )}>
            {/* 1. الأخبار والعروض */}
            <div className="py-5 pl-4 sm:pl-6">
              <p className={"text-[9px] font-black tracking-[0.14em] " + (dark ? "text-[#f8ca14]/80" : "text-[#08467d]/80")}>
                LIVE FEED & POSTS
              </p>
              <b className={"mt-2 block text-3xl font-black " + (dark ? "text-white" : "text-black")}>{String(totalPosts).padStart(2, "0")}</b>
              <span className={"mt-1 block text-xs " + (dark ? "text-slate-500" : "text-slate-400")}>منشور وخبر حي</span>
            </div>

            {/* 2. أعداد المجلة */}
            <div className="py-5 pr-4 pl-4 sm:px-6">
              <p className={"text-[9px] font-black tracking-[0.14em] " + (dark ? "text-[#f8ca14]/80" : "text-[#08467d]/80")}>
                PUBLISHED ISSUES
              </p>
              <b className={"mt-2 block text-3xl font-black " + (dark ? "text-white" : "text-black")}>{String(issues.length).padStart(2, "0")}</b>
              <span className={"mt-1 block text-xs " + (dark ? "text-slate-500" : "text-slate-400")}>عدد مجلة منشور</span>
            </div>

            {/* 3. ألبومات الفعاليات */}
            <div className="py-5 pr-4 pl-4 sm:px-6">
              <p className={"text-[9px] font-black tracking-[0.14em] " + (dark ? "text-[#f8ca14]/80" : "text-[#08467d]/80")}>
                EVENT ALBUMS
              </p>
              <b className={"mt-2 block text-3xl font-black " + (dark ? "text-white" : "text-black")}>{String(albums.length).padStart(2, "0")}</b>
              <span className={"mt-1 block text-xs " + (dark ? "text-slate-500" : "text-slate-400")}>ألبوم فعالية</span>
            </div>

            {/* 4. صفحات المجلة */}
            <div className="py-5 pr-4 pl-4 sm:px-6">
              <p className={"text-[9px] font-black tracking-[0.14em] " + (dark ? "text-[#f8ca14]/80" : "text-[#08467d]/80")}>
                JOURNAL PAGES
              </p>
              <b className={"mt-2 block text-3xl font-black " + (dark ? "text-white" : "text-black")}>{String(totalPages).padStart(2, "0")}</b>
              <span className={"mt-1 block text-xs " + (dark ? "text-slate-500" : "text-slate-400")}>صفحة محفوظة</span>
            </div>

            {/* 5. إجمالي الصور والفيديوهات */}
            <div className="py-5 pr-4 sm:pr-6">
              <p className={"text-[9px] font-black tracking-[0.14em] " + (dark ? "text-[#f8ca14]/80" : "text-[#08467d]/80")}>
                MEDIA FILES
              </p>
              <b className={"mt-2 block text-3xl font-black " + (dark ? "text-white" : "text-black")}>{String(totalFiles + totalPosts).padStart(2, "0")}</b>
              <span className={"mt-1 block text-xs " + (dark ? "text-slate-500" : "text-slate-400")}>صورة وفيديو موثق</span>
            </div>
          </div>
        </div>
      </VisualEditable>

      {/* 9. فوتر استوديو العقيق الفاخر المنمق والأنيق */}
      <VisualEditable
        id="studio-footer-section"
        tag="section"
        label="تذييل الصفحة (الفوتر)"
        as="footer"
        className={`border-t transition ${
          dark ? "border-white/[0.08] bg-[#000000] text-white" : "border-black/[0.06] bg-[#fafafa] text-slate-900"
        }`}
      >
        <div className="mx-auto max-w-[1360px] px-5 py-8 md:px-8">
          <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3">
              <VisualImage
                id="studio-footer-logo"
                label="شعار الفوتر"
                src={logoUrl || "/alaqeeq-logo.png"}
                alt="مدارس العقيق"
                className={`h-9 w-auto object-contain transition ${dark ? "brightness-0 invert opacity-90" : "opacity-90"}`}
              />
              <VisualEditable
                id="studio-footer-title"
                tag="text"
                label="اسم الاستوديو في الفوتر"
                defaultText="استوديو العقيق الرقمي"
                as="span"
                className={`text-xs font-black tracking-wide ${dark ? "text-slate-300" : "text-slate-700"}`}
              />
            </div>

            {/* Location Tag (فكرة 5: وسم المدينة المنورة) */}
            {orchestration?.location?.enabled !== false && (
              <a
                href={orchestration?.location?.mapUrl || "https://maps.google.com/?q=Alaqeeq+Schools+Madinah"}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold transition hover:scale-105 ${
                  dark
                    ? "border-white/10 bg-white/5 text-slate-300 hover:border-[#f8ca14] hover:text-[#f8ca14]"
                    : "border-black/10 bg-white text-slate-700 hover:border-[#08467d] hover:text-[#08467d] shadow-sm"
                }`}
                title="موقع مدارس العقيق على خرائط Google"
              >
                <MapPin size={13} className={dark ? "text-[#f8ca14]" : "text-[#08467d]"} />
                <VisualEditable
                  id="studio-footer-location"
                  tag="text"
                  label="موقع المدارس في الفوتر"
                  defaultText={orchestration?.location?.text || "المدينة المنورة · المملكة العربية السعودية"}
                  as="span"
                />
              </a>
            )}

            {/* Social Media & WhatsApp Contact */}
            <div className="flex items-center gap-2.5">
              {orchestration?.social?.xUrl && (
                <a
                  href={orchestration.social.xUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`grid h-8 w-8 place-items-center rounded-full border text-xs font-black transition hover:scale-110 ${
                    dark
                      ? "border-white/10 bg-white/5 text-slate-300 hover:border-[#f8ca14] hover:text-[#f8ca14]"
                      : "border-black/10 bg-white text-slate-700 hover:border-[#08467d] hover:text-[#08467d] shadow-sm"
                  }`}
                  title="منصة 𝕏"
                >
                  <span>𝕏</span>
                </a>
              )}
              {orchestration?.social?.instagramUrl && (
                <a
                  href={orchestration.social.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`grid h-8 w-8 place-items-center rounded-full border text-xs transition hover:scale-110 ${
                    dark
                      ? "border-white/10 bg-white/5 text-slate-300 hover:border-pink-500 hover:text-pink-400"
                      : "border-black/10 bg-white text-slate-700 hover:border-pink-500 hover:text-pink-600 shadow-sm"
                  }`}
                  title="Instagram"
                >
                  <Instagram size={14} />
                </a>
              )}
              {orchestration?.social?.snapchatUrl && (
                <a
                  href={orchestration.social.snapchatUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`grid h-8 w-8 place-items-center rounded-full border text-xs transition hover:scale-110 ${
                    dark
                      ? "border-white/10 bg-white/5 text-slate-300 hover:border-yellow-400 hover:text-yellow-400"
                      : "border-black/10 bg-white text-slate-700 hover:border-yellow-500 hover:text-yellow-600 shadow-sm"
                  }`}
                  title="Snapchat"
                >
                  <SnapchatIcon size={14} />
                </a>
              )}
              {orchestration?.social?.facebookUrl && (
                <a
                  href={orchestration.social.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`grid h-8 w-8 place-items-center rounded-full border text-xs transition hover:scale-110 ${
                    dark
                      ? "border-white/10 bg-white/5 text-slate-300 hover:border-blue-500 hover:text-blue-400"
                      : "border-black/10 bg-white text-slate-700 hover:border-blue-500 hover:text-blue-600 shadow-sm"
                  }`}
                  title="Facebook"
                >
                  <Facebook size={14} />
                </a>
              )}
              {orchestration?.social?.youtubeUrl && (
                <a
                  href={orchestration.social.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`grid h-8 w-8 place-items-center rounded-full border text-xs transition hover:scale-110 ${
                    dark
                      ? "border-white/10 bg-white/5 text-slate-300 hover:border-red-500 hover:text-red-400"
                      : "border-black/10 bg-white text-slate-700 hover:border-red-500 hover:text-red-600 shadow-sm"
                  }`}
                  title="YouTube"
                >
                  <Youtube size={14} />
                </a>
              )}
              {orchestration?.social?.whatsappNumber && (
                <a
                  href={`https://wa.me/${orchestration.social.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("السلام عليكم ورحمة الله، أود الاستفسار بخصوص مدارس العقيق.")}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-black transition hover:scale-105 ${
                    dark
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                      : "border-emerald-500/20 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 shadow-sm"
                  }`}
                  title="تواصل معنا عبر واتساب"
                >
                  <MessageCircle size={14} />
                  <span>تواصل عبر واتساب</span>
                </a>
              )}
            </div>
          </div>

          {/* Minimal Copyright Line & Back to Top (فكرة 1: زر الصعود للأعلى) */}
          <div className={`mt-6 border-t pt-4 flex items-center justify-between gap-4 text-[11px] font-bold ${
            dark ? "border-white/[0.06] text-slate-500" : "border-black/[0.06] text-slate-400"
          }`}>
            <VisualEditable
              id="studio-footer-copyright"
              tag="text"
              label="حقوق النشر في الفوتر"
              defaultText={orchestration?.footer?.copyrightText || "جميع الحقوق محفوظة لمدارس العقيق الأهلية والدولية © 2026"}
              as="p"
            />
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black transition hover:scale-105 ${
                dark
                  ? "border-white/10 bg-white/5 text-slate-300 hover:border-[#f8ca14] hover:text-[#f8ca14]"
                  : "border-black/10 bg-white text-slate-600 hover:border-[#08467d] hover:text-[#08467d] shadow-sm"
              }`}
              title="العودة لأعلى الصفحة"
            >
              <span>للأعلى</span>
              <ArrowUp size={12} />
            </button>
          </div>
        </div>
      </VisualEditable>



      {/* Story Viewer Modal */}
      {activeStoryIndex !== null && storiesList[activeStoryIndex] ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl">
          <div className="relative h-[85vh] max-h-[750px] w-full max-w-[420px] overflow-hidden rounded-3xl border border-white/20 bg-black shadow-2xl">
            {/* Progress Bars */}
            <div className="absolute top-3 inset-x-3 z-20 flex gap-1.5">
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

            {/* Header info */}
            <div className="absolute top-6 inset-x-4 z-20 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 overflow-hidden rounded-full border border-white/30 bg-black flex items-center justify-center">
                  {storiesList[activeStoryIndex].sourceType === "instagram" ? (
                    <Instagram size={16} className="text-[#f8ca14]" />
                  ) : storiesList[activeStoryIndex].sourceType === "x" ? (
                    <span className="text-xs font-black">𝕏</span>
                  ) : storiesList[activeStoryIndex].imageUrl ? (
                    <img src={storiesList[activeStoryIndex].imageUrl || ""} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-black">العقيق</span>
                  )}
                </div>
                <div>
                  <p className="text-xs font-black">{storiesList[activeStoryIndex].category}</p>
                  <p className="text-[10px] text-white/70">{storiesList[activeStoryIndex].time}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveStoryIndex(null)}
                className="grid h-8 w-8 place-items-center rounded-full bg-black/40 text-white transition hover:bg-black/80"
              >
                <X size={18} />
              </button>
            </div>

            {/* Rich Story Content Display */}
            <div className="relative h-full w-full flex items-center justify-center bg-black">
              {storiesList[activeStoryIndex].sourceType === "x" ? (
                <div className="w-full px-4 pt-16 pb-28">
                  <XEmbed url={storiesList[activeStoryIndex].targetUrl} title={storiesList[activeStoryIndex].title} dark={true} />
                </div>
              ) : storiesList[activeStoryIndex].sourceType === "instagram" ? (
                <div className="w-full h-full pt-16 pb-24 overflow-hidden">
                  <FastInstagramEmbed url={storiesList[activeStoryIndex].targetUrl} title={storiesList[activeStoryIndex].title} />
                </div>
              ) : storiesList[activeStoryIndex].sourceType === "youtube" && storiesList[activeStoryIndex].youtubeId ? (
                <div className="w-full aspect-video">
                  <iframe
                    src={"https://www.youtube-nocookie.com/embed/" + storiesList[activeStoryIndex].youtubeId + "?autoplay=1&rel=0&playsinline=1"}
                    title={storiesList[activeStoryIndex].title}
                    className="h-full w-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : storiesList[activeStoryIndex].imageUrl ? (
                <img
                  src={storiesList[activeStoryIndex].imageUrl || ""}
                  alt={storiesList[activeStoryIndex].title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="p-8 text-center text-white">
                  <span className="text-3xl font-black">العقيق</span>
                  <p className="mt-4 text-base font-bold">{storiesList[activeStoryIndex].title}</p>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50 pointer-events-none" />
            </div>

            {/* Title / Caption & Direct Navigation Button */}
            <div className="absolute bottom-6 inset-x-5 z-20 text-white text-right">
              <span className="rounded bg-[#f8ca14] px-2 py-0.5 text-[10px] font-black text-black">
                {storiesList[activeStoryIndex].category}
              </span>
              <h3 className="mt-2 text-base font-black leading-snug">
                {storiesList[activeStoryIndex].title}
              </h3>
              <button
                type="button"
                onClick={() => {
                  const target = storiesList[activeStoryIndex].targetUrl;
                  setActiveStoryIndex(null);
                  navigate(target);
                }}
                className={"mt-4 w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-black transition active:scale-95 shadow-xl " + (
                  dark
                    ? "!bg-[#f8ca14] !text-black shadow-[0_0_20px_rgba(248,202,20,0.4)]"
                    : "!bg-[#08467d] !text-white shadow-[0_0_20px_rgba(8,70,125,0.3)]"
                )}
              >
                <span>{storiesList[activeStoryIndex].buttonLabel}</span>
                <ArrowUpLeft size={16} />
              </button>
            </div>

            {/* Navigation Overlay Buttons */}
            <button
              type="button"
              onClick={() => {
                if (activeStoryIndex > 0) setActiveStoryIndex(activeStoryIndex - 1);
              }}
              className="absolute inset-y-0 right-0 w-1/3 z-10 opacity-0 hover:opacity-10 flex items-center justify-end pr-2 text-white"
            >
              <ChevronRight size={30} />
            </button>
            <button
              type="button"
              onClick={() => {
                if (activeStoryIndex < storiesList.length - 1) setActiveStoryIndex(activeStoryIndex + 1);
                else setActiveStoryIndex(null);
              }}
              className="absolute inset-y-0 left-0 w-1/3 z-10 opacity-0 hover:opacity-10 flex items-center justify-start pl-2 text-white"
            >
              <ChevronLeft size={30} />
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
