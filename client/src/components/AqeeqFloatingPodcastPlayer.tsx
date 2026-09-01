import { useState, useRef, useEffect, createContext, useContext, useMemo } from "react";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  X, 
  Radio, 
  Music, 
  Sparkles, 
  ExternalLink, 
  SkipForward, 
  SkipBack, 
  ListMusic, 
  ArrowRight, 
  RefreshCw, 
  Headphones, 
  Check, 
  Disc, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw,
  RotateCw,
  Mic,
  Power,
  Search
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export type AudioTrackType = "song" | "podcast";

export type UniversalAudioItem = {
  id: string | number;
  type: AudioTrackType;
  title: string;
  artistOrHost?: string;
  category?: string;
  description?: string;
  lyrics?: string;
  audioUrl?: string;
  mediaType: "audio" | "video";
  sourceType?: "drive" | "youtube" | "direct";
  mediaUrl: string;
  coverUrl?: string | null;
  duration?: string;
};

// Direct Google Drive image proxy handler
function directDriveImage(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(/\/file\/d\/([A-Za-z0-9_-]+)/) ||
                url.match(/[?&]id=([^&]+)/) ||
                url.match(/lh3\.googleusercontent\.com\/d\/([A-Za-z0-9_-]+)/);
  return match ? `/api/drive-proxy/${match[1]}` : url;
}

// Universal Audio Media URL Resolver: seamlessly handles all Google Drive audio files, Drive links, and direct URLs
function resolveAudioMediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  const trimmed = url.trim();
  const match = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
                trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    const extMatch = trimmed.match(/\.([a-zA-Z0-9]+)(?:[?#]|$)/);
    const ext = extMatch ? `?ext=${extMatch[1].toLowerCase()}` : "";
    return `/api/drive-audio-proxy/${match[1]}${ext}`;
  }
  return trimmed;
}

import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";

function isDefaultOrLogoImage(url?: string | null): boolean {
  if (!url || url.trim() === "") return true;
  const lower = url.toLowerCase();
  return (
    lower.includes("logo") ||
    lower.includes("og-image") ||
    lower.includes("og-preview") ||
    lower.includes("alaqeeq-hero") ||
    lower.includes("school-logo") ||
    lower.includes("audio-default-cover")
  );
}

// Smart Cover Art Resolver: returns custom image if valid, or clean musical note / podcast mic default matching Dark/White mode
function getSongCover(
  item?: { coverUrl?: string | null; category?: string; title?: string; type?: string } | null,
  theme: "dark" | "light" = "dark"
): string {
  if (item?.coverUrl && !isDefaultOrLogoImage(item.coverUrl)) {
    return directDriveImage(item.coverUrl) || item.coverUrl;
  }
  if (item?.type === "podcast") {
    return theme === "light" ? "/podcast-default-cover-light.svg" : "/podcast-default-cover-dark.svg";
  }
  return theme === "light" ? "/audio-default-cover-light.svg" : "/audio-default-cover-dark.svg";
}

// Default fallback school songs with pure musical note default artwork (no ugly school logos)
const DEFAULT_SCHOOL_SONGS: UniversalAudioItem[] = [
  {
    id: "song-1",
    type: "song",
    title: "نشيد مدارس العقيق الرسمي",
    artistOrHost: "كورال مدارس العقيق الأهلية",
    category: "النشيد المدرسي",
    mediaType: "audio",
    mediaUrl: "/audio/aqeeq-royal.mp3",
    coverUrl: null,
  },
  {
    id: "song-2",
    type: "song",
    title: "أغنية فخر التميز والريادة",
    artistOrHost: "فرقة المدارس الاحتفالية",
    category: "احتفالي",
    mediaType: "audio",
    mediaUrl: "/audio/aqeeq-celebration.mp3",
    coverUrl: null,
  },
  {
    id: "song-3",
    type: "song",
    title: "معزوفة إلهام العقيق (بيانو)",
    artistOrHost: "استوديو العقيق الموسيقي",
    category: "بيانو وهدوء",
    mediaType: "audio",
    mediaUrl: "/audio/aqeeq-piano.mp3",
    coverUrl: null,
  },
  {
    id: "song-4",
    type: "song",
    title: "أنغام العقيق الملكية",
    artistOrHost: "وتريات العقيق",
    category: "أجواء ملكية",
    mediaType: "audio",
    mediaUrl: "/audio/aqeeq-ambient.mp3",
    coverUrl: null,
  },
];

type AudioPlayerContextType = {
  activeItem: UniversalAudioItem | null;
  activePodcast: any | null; // For backwards compatibility
  isPlaying: boolean;
  isMuted: boolean;
  progress: number;
  duration: number;
  currentTrackType: AudioTrackType | null;

  // Actions
  playSong: (song: UniversalAudioItem | number) => void;
  playPodcast: (podcast: any) => void;
  playEpisode: (podcast: any) => void;
  playNextSong: () => void;
  playPrevSong: () => void;
  playNextPodcast: () => void;
  handlePrevOrRestart: () => void;
  togglePlay: () => void;
  pausePodcast: () => void;
  stopPodcast: () => void;
  returnToSongs: () => void;

  // Song playlist
  songs: UniversalAudioItem[];
  allPodcasts: any[];
};

const PodcastPlayerContext = createContext<AudioPlayerContextType>({
  activeItem: null,
  activePodcast: null,
  isPlaying: false,
  isMuted: false,
  progress: 0,
  duration: 0,
  currentTrackType: null,
  playSong: () => {},
  playPodcast: () => {},
  playEpisode: () => {},
  playNextSong: () => {},
  playPrevSong: () => {},
  playNextPodcast: () => {},
  handlePrevOrRestart: () => {},
  togglePlay: () => {},
  pausePodcast: () => {},
  stopPodcast: () => {},
  returnToSongs: () => {},
  songs: [],
  allPodcasts: [],
});

export const usePodcastPlayer = () => useContext(PodcastPlayerContext);

export function PodcastPlayerProvider({ children }: { children: React.ReactNode }) {
  const { data: orchestration } = trpc.executiveAdmin.getSiteOrchestration.useQuery(undefined, {
    refetchOnWindowFocus: false,
    staleTime: 60000,
  });
  const { data: podcastsList = [] } = trpc.podcasts.list.useQuery({}, {
    refetchOnWindowFocus: false,
  });

  const { theme } = useAqeeqStudioTheme();
  const isDark = theme === "dark";

  // Assemble current school songs from orchestration or defaults
  const schoolSongs = useMemo(() => {
    const customSongs = (orchestration as any)?.schoolSongs;
    if (Array.isArray(customSongs) && customSongs.length > 0) {
      return customSongs.map((s: any, idx: number): UniversalAudioItem => ({
        id: s.id || `custom-song-${idx}`,
        type: "song",
        title: s.title || "نشيد العقيق",
        artistOrHost: s.artist || "مدارس العقيق",
        category: s.category || "أغاني العقيق",
        mediaType: "audio",
        mediaUrl: resolveAudioMediaUrl(s.mediaUrl),
        coverUrl: s.coverUrl ? (directDriveImage(s.coverUrl) || s.coverUrl) : getSongCover(s, theme),
      }));
    }
    return DEFAULT_SCHOOL_SONGS.map((s) => ({
      ...s,
      coverUrl: getSongCover(s, theme),
    }));
  }, [orchestration, theme]);

  const [activeItem, setActiveItem] = useState<UniversalAudioItem | null>(null);
  const currentTrackType = activeItem?.type || null;
  const isPodcast = currentTrackType === "podcast";
  const [lastSong, setLastSong] = useState<UniversalAudioItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playlistDrawerOpen, setPlaylistDrawerOpen] = useState(false);
  const [playlistTab, setPlaylistTab] = useState<"songs" | "podcasts">("songs");
  const [playlistSearch, setPlaylistSearch] = useState("");
  const playlistSheetRef = useRef<HTMLDivElement | null>(null);

  const [completionPrompt, setCompletionPrompt] = useState<{
    visible: boolean;
    finishedPodcastTitle: string;
  }>({ visible: false, finishedPodcastTitle: "" });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [volume, setVolume] = useState(1);

  const isDockVisible = isHovered || isExpanded;

  const toggleMute = () => {
    if (audioRef.current) {
      if (volume > 0) {
        audioRef.current.volume = 0;
        setVolume(0);
        setIsMuted(true);
      } else {
        audioRef.current.volume = 1;
        setVolume(1);
        setIsMuted(false);
      }
    }
  };

  // Play a song
  const playSong = (songOrIndex: UniversalAudioItem | number) => {
    let targetSong: UniversalAudioItem;
    if (typeof songOrIndex === "number") {
      targetSong = schoolSongs[songOrIndex] || schoolSongs[0];
    } else {
      targetSong = songOrIndex;
    }
    setCompletionPrompt({ visible: false, finishedPodcastTitle: "" });
    setLastSong(targetSong);
    setActiveItem(targetSong);
    setIsPlaying(true);
    setIsExpanded(true);
  };

  // Play a podcast (swaps current song with the podcast!)
  const playPodcast = (podcast: any) => {
    if (!podcast) return;
    setCompletionPrompt({ visible: false, finishedPodcastTitle: "" });

    // If we were playing a song, remember it so we can return to it later
    if (activeItem && activeItem.type === "song") {
      setLastSong(activeItem);
    } else if (!lastSong && schoolSongs.length > 0) {
      setLastSong(schoolSongs[0]);
    }

    const podItem: UniversalAudioItem = {
      id: podcast.id,
      type: "podcast",
      title: podcast.title,
      artistOrHost: podcast.hostName || "صوت العقيق",
      category: podcast.category || "بودكاست",
      mediaType: podcast.mediaType || "audio",
      sourceType: podcast.sourceType || "direct",
      mediaUrl: podcast.mediaUrl,
      coverUrl: podcast.coverUrl ? (directDriveImage(podcast.coverUrl) || podcast.coverUrl) : "/alaqeeq-logo.png",
      duration: podcast.duration,
    };

    setActiveItem(podItem);
    setIsPlaying(true);
    setIsExpanded(true);
  };

  const playEpisode = playPodcast;

  // Next / Prev Songs
  const playNextSong = () => {
    const currentIndex = schoolSongs.findIndex((s) => s.id === activeItem?.id);
    const nextIndex = (currentIndex + 1) % schoolSongs.length;
    playSong(schoolSongs[nextIndex]);
  };

  const playPrevSong = () => {
    const currentIndex = schoolSongs.findIndex((s) => s.id === activeItem?.id);
    const prevIndex = (currentIndex - 1 + schoolSongs.length) % schoolSongs.length;
    playSong(schoolSongs[prevIndex]);
  };

  // Next Podcast
  const playNextPodcast = () => {
    if (podcastsList.length === 0) return;
    const currentIndex = podcastsList.findIndex((p) => p.id === activeItem?.id);
    const nextIndex = (currentIndex + 1) % podcastsList.length;
    playPodcast(podcastsList[nextIndex]);
  };

  // Previous song or restart current song if played > 3 seconds
  const handlePrevOrRestart = () => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setProgress(0);
    } else {
      if (activeItem?.type === "podcast") {
        if (podcastsList.length > 0) {
          const currentIndex = podcastsList.findIndex((p) => p.id === activeItem?.id);
          const prevIndex = (currentIndex - 1 + podcastsList.length) % podcastsList.length;
          playPodcast(podcastsList[prevIndex]);
        }
      } else {
        playPrevSong();
      }
    }
  };

  // Return to Song after podcast
  const returnToSongs = () => {
    setCompletionPrompt({ visible: false, finishedPodcastTitle: "" });
    if (lastSong) {
      playSong(lastSong);
    } else if (schoolSongs.length > 0) {
      playSong(schoolSongs[0]);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const pausePodcast = () => {
    setIsPlaying(false);
    if (audioRef.current) audioRef.current.pause();
  };

  const stopPodcast = () => {
    setIsPlaying(false);
    setActiveItem(null);
    setCompletionPrompt({ visible: false, finishedPodcastTitle: "" });
    setIsExpanded(false);
    setIsHovered(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // Audio source effect
  useEffect(() => {
    if (activeItem && activeItem.mediaType === "audio" && audioRef.current) {
      audioRef.current.src = activeItem.mediaUrl;
      audioRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  }, [activeItem?.id, activeItem?.mediaUrl]);

  // When audio finishes (Podcast vs Song behavior)
  const handleEnded = () => {
    if (activeItem?.type === "podcast") {
      setIsPlaying(false);
      setIsExpanded(true);
      setCompletionPrompt({
        visible: true,
        finishedPodcastTitle: activeItem.title,
      });
    } else if (activeItem?.type === "song") {
      // Auto-advance to next song seamlessly
      playNextSong();
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setProgress(val);
    }
  };

  const skipTime = (seconds: number) => {
    if (audioRef.current) {
      const newTime = Math.min(Math.max(0, audioRef.current.currentTime + seconds), duration || Infinity);
      audioRef.current.currentTime = newTime;
      setProgress(newTime);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Next podcast candidate
  const nextPodcastCandidate = useMemo(() => {
    if (!activeItem || activeItem.type !== "podcast" || podcastsList.length === 0) return null;
    const currentIndex = podcastsList.findIndex((p) => p.id === activeItem.id);
    return podcastsList[(currentIndex + 1) % podcastsList.length] || null;
  }, [activeItem, podcastsList]);

  const volumePercent = Math.round((isMuted ? 0 : volume) * 100);
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (progress / duration) * 100)) : 0;

  // Click-outside listener for the floating playlist sheet
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        playlistDrawerOpen &&
        playlistSheetRef.current &&
        !playlistSheetRef.current.contains(event.target as Node)
      ) {
        // Check if the click was also on the playlist button inside the dock
        const target = event.target as HTMLElement;
        if (target.closest("[data-playlist-trigger]")) return;
        setPlaylistDrawerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [playlistDrawerOpen]);

  // Filtered lists for the floating sheet search
  const filteredSongs = useMemo(() => {
    if (!playlistSearch.trim()) return schoolSongs;
    const q = playlistSearch.toLowerCase();
    return schoolSongs.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.artistOrHost && s.artistOrHost.toLowerCase().includes(q)) ||
        (s.category && s.category.toLowerCase().includes(q))
    );
  }, [schoolSongs, playlistSearch]);

  const filteredPodcasts = useMemo(() => {
    if (!playlistSearch.trim()) return podcastsList;
    const q = playlistSearch.toLowerCase();
    return podcastsList.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.hostName && p.hostName.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
    );
  }, [podcastsList, playlistSearch]);

  return (
    <PodcastPlayerContext.Provider
      value={{
        activeItem,
        activePodcast: activeItem?.type === "podcast" ? activeItem : null,
        isPlaying,
        isMuted,
        progress,
        duration,
        currentTrackType: activeItem?.type || null,
        playSong,
        playPodcast,
        playEpisode,
        playNextSong,
        playPrevSong,
        playNextPodcast,
        handlePrevOrRestart,
        togglePlay,
        pausePodcast,
        stopPodcast,
        returnToSongs,
        songs: schoolSongs,
        allPodcasts: podcastsList,
      }}
    >
      {children}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        className="hidden"
      />

      {/* ========================================================================= */}
      {/* LUXURY FLOATING VINYL ORB & COMPACT ATTACHED DOCK (Bottom-Right) */}
      {/* ========================================================================= */}
      <div
        dir="rtl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 select-none"
      >
        <div className="relative flex items-center gap-3">

          {/* Post-Podcast Choice Notification (Right above the dock) */}
          {completionPrompt.visible && (
            <div className={`absolute bottom-full mb-3 right-0 w-max flex items-center gap-2 p-3 rounded-2xl border backdrop-blur-2xl shadow-2xl animate-in slide-in-from-bottom-2 duration-200 ring-1 ${
              isDark
                ? "border-amber-400/50 bg-[#090b10]/98 text-white ring-amber-400/30"
                : "border-slate-200/90 bg-white/98 text-slate-900 ring-amber-400/30 shadow-[0_12px_36px_rgba(0,0,0,0.14)]"
            }`}>
              <Headphones size={16} className={`animate-pulse shrink-0 ${isDark ? "text-amber-400" : "text-amber-600"}`} />
              <div className="text-right pl-2">
                <p className={`text-[11px] font-black ${isDark ? "text-amber-300" : "text-amber-800"}`}>انتهت الحلقة: {completionPrompt.finishedPodcastTitle}</p>
                <p className={`text-[10px] font-bold ${isDark ? "text-slate-300" : "text-slate-600"}`}>ماذا تود أن تستمع الآن؟</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {nextPodcastCandidate && (
                  <button
                    type="button"
                    onClick={playNextPodcast}
                    className="flex items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-black bg-amber-400 text-slate-950 hover:bg-amber-300 transition"
                  >
                    <SkipForward size={12} />
                    <span>التالية</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={returnToSongs}
                  className={`flex items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-black transition border ${
                    isDark
                      ? "bg-white/10 hover:bg-white/20 text-white border-white/20"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300/80"
                  }`}
                >
                  <Music size={12} className={isDark ? "text-emerald-400" : "text-emerald-600"} />
                  <span>للأغاني</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCompletionPrompt({ visible: false, finishedPodcastTitle: "" })}
                  className={`p-1 transition ${isDark ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-slate-900"}`}
                  title="إغلاق"
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          )}

          {/* The Circular Floating Trigger (Vinyl Record Disc for Song vs Studio Radio Capsule for Podcast) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (isExpanded) {
                // If it is currently expanded, clicking CLOSES it!
                setIsExpanded(false);
                setIsHovered(false);
              } else {
                // If it is compact or closed, clicking EXPANDS it!
                setIsExpanded(true);
                if (!activeItem) {
                  playSong(0);
                }
              }
            }}
            className={`relative grid h-14 w-14 sm:h-16 sm:w-16 place-items-center rounded-full border-2 transition-all duration-300 hover:scale-105 active:scale-95 shrink-0 ${
              isPodcast
                ? isDark
                  ? "bg-gradient-to-tr from-[#0b0d1a] via-[#11142b] to-[#181d3d] border-indigo-400/60 shadow-[0_12px_36px_rgba(79,70,229,0.45)] ring-2 ring-indigo-400/30"
                  : "bg-gradient-to-tr from-[#eef2ff] via-[#f8fafc] to-[#ffffff] border-indigo-300 shadow-[0_10px_30px_rgba(99,102,241,0.25)] ring-2 ring-indigo-400/40"
                : isDark
                  ? "bg-[#0a0c13] border-amber-400/50 shadow-[0_12px_36px_rgba(0,0,0,0.7)] ring-2 ring-amber-400/20 backdrop-blur-2xl"
                  : "bg-gradient-to-tr from-[#f8fafc] via-[#f1f5f9] to-[#ffffff] border-slate-300 shadow-[0_10px_30px_rgba(0,0,0,0.14)] ring-2 ring-amber-400/35 backdrop-blur-2xl"
            } ${
              isPlaying
                ? isPodcast
                  ? "shadow-indigo-500/40 ring-indigo-400/60"
                  : isDark
                    ? "shadow-amber-400/25 ring-amber-400/40"
                    : "shadow-amber-400/35 ring-amber-400/60"
                : ""
            }`}
            title={activeItem ? (isExpanded ? "انقر لإغلاق المشغل" : "انقر لتوسيع المشغل") : "تشغيل راديو وأناشيد العقيق"}
          >
            {/* If Song: Circular Vinyl CD Grooves | If Podcast: Radio Studio Pulse Waves */}
            {!isPodcast ? (
              <>
                {/* Outer Grooves (شفرات الاسطوانة الموسيقية) */}
                <div className={`pointer-events-none absolute inset-1 rounded-full border ${isDark ? "border-white/10" : "border-slate-300/80"}`} />
                <div className={`pointer-events-none absolute inset-2 rounded-full border ${isDark ? "border-white/5" : "border-slate-300/40"}`} />
                <div className={`pointer-events-none absolute inset-3 rounded-full border ${isDark ? "border-white/10" : "border-slate-300/80"}`} />

                {/* Center Spinning Spindle Disc with Musical Note Artwork */}
                <div
                  className={`relative grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full bg-gradient-to-tr from-[#f8ca14] to-amber-600 text-black shadow-md overflow-hidden ${
                    isPlaying ? "animate-[spin_4s_linear_infinite]" : ""
                  }`}
                >
                  <img
                    src={getSongCover(activeItem, theme)}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        theme === "light" ? "/audio-default-cover-light.svg" : "/audio-default-cover-dark.svg";
                    }}
                  />
                  {/* Center Spindle Hole */}
                  <div className={`absolute h-2 w-2 rounded-full shadow-inner border ${
                    isDark ? "bg-[#0a0c13] border-amber-300" : "bg-slate-100 border-slate-400"
                  }`} />
                </div>

                {/* Song Playing Pulsing Waves & Green Dot */}
                {isPlaying && (
                  <>
                    <span className="absolute -inset-1 rounded-full bg-amber-400/30 blur-sm animate-pulse pointer-events-none" />
                    <span className={`absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 ${isDark ? "border-[#0a0c13]" : "border-white"} animate-ping`} />
                    <span className={`absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 ${isDark ? "border-[#0a0c13]" : "border-white"}`} />
                  </>
                )}
              </>
            ) : (
              <>
                {/* Podcast Studio Broadcasting Aesthetics (كبسولة استوديو البودكاست مع ميكروفون وبث مباشر) */}
                <div className={`pointer-events-none absolute inset-1.5 rounded-full border ${
                  isDark ? "border-indigo-400/20" : "border-indigo-200"
                }`} />

                {/* Center Studio Mic & Artwork (Does NOT spin!) */}
                <div className="relative grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-lg overflow-hidden border border-white/20">
                  {activeItem?.coverUrl && !isDefaultOrLogoImage(activeItem.coverUrl) ? (
                    <img
                      src={directDriveImage(activeItem.coverUrl) || activeItem.coverUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <Mic size={18} className="text-white drop-shadow animate-pulse" />
                    </div>
                  )}

                  {/* Audio Equalizer overlay when playing */}
                  {isPlaying && (
                    <div className="absolute inset-0 bg-black/40 flex items-end justify-center gap-0.5 pb-1">
                      <span className="w-1 h-3 bg-white rounded-full animate-bounce" />
                      <span className="w-1 h-4 bg-indigo-300 rounded-full animate-bounce delay-75" />
                      <span className="w-1 h-2 bg-white rounded-full animate-bounce delay-150" />
                    </div>
                  )}
                </div>

                {/* Podcast Broadcasting Red LIVE Indicator */}
                {isPlaying ? (
                  <>
                    <span className="absolute -inset-1 rounded-full bg-indigo-500/25 blur-sm animate-pulse pointer-events-none" />
                    <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-rose-500 border-2 border-white animate-ping" />
                    <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-rose-500 border-2 border-white" />
                    {/* Live On-Air Pill */}
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-rose-600 text-[7px] font-black text-white tracking-wider shadow-md uppercase">
                      LIVE
                    </span>
                  </>
                ) : (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-indigo-400 border-2 border-white" />
                )}
              </>
            )}
          </button>

          {/* Attached Control Dock (Single-Line Capsule: Stretches HORIZONTALLY ONLY) */}
          {isDockVisible && (
            <div
              className={`flex items-center gap-2.5 rounded-full border shadow-2xl transition-all duration-300 relative overflow-hidden animate-in fade-in slide-in-from-right-3 duration-200 h-13 sm:h-14 px-3.5 sm:px-4 shrink-0 ${
                isPodcast
                  ? isDark
                    ? "border-indigo-400/40 bg-[#080914]/95 backdrop-blur-2xl text-white ring-1 ring-indigo-400/30"
                    : "border-indigo-200/90 bg-white/95 backdrop-blur-2xl text-slate-900 ring-1 ring-indigo-400/30 shadow-[0_15px_45px_rgba(99,102,241,0.14)]"
                  : isDark
                    ? "border-amber-400/40 bg-[#090b10]/95 backdrop-blur-2xl text-white ring-1 ring-amber-400/20"
                    : "border-slate-200/90 bg-white/95 backdrop-blur-2xl text-slate-900 ring-1 ring-amber-400/30 shadow-[0_15px_45px_rgba(0,0,0,0.12)]"
              }`}
            >
              {/* 1. Rightmost: Playlist Launcher Button (فتح القائمة: آخر حاجة على اليمين) */}
              <button
                type="button"
                data-playlist-trigger="true"
                onClick={(e) => {
                  e.stopPropagation();
                  setPlaylistDrawerOpen((prev) => !prev);
                }}
                className={`grid h-7 w-7 place-items-center rounded-full transition active:scale-95 border shrink-0 ${
                  playlistDrawerOpen
                    ? isPodcast
                      ? "bg-indigo-500 text-white border-indigo-400 font-bold shadow-sm"
                      : "bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-sm"
                    : isDark
                      ? isPodcast
                        ? "text-indigo-300 hover:text-white hover:bg-indigo-600/30 border-indigo-400/30"
                        : "text-amber-300 hover:text-black hover:bg-amber-400 border-amber-400/30"
                      : isPodcast
                        ? "text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50 border-indigo-200"
                        : "text-slate-700 hover:text-slate-950 hover:bg-slate-100 border-slate-300"
                }`}
                title="فتح مكتبة الأغاني والبودكاست"
              >
                <ListMusic size={14} />
              </button>

              {/* 2. وقبله الصوت التعلية والتوطية (من الشمال واطي لليمين عالي مع خلفية ملونة تقل عند الخفض) */}
              {isExpanded && (
                <div className={`flex items-center gap-1.5 border-r pr-2 shrink-0 animate-in fade-in slide-in-from-right-2 duration-200 ${
                  isDark ? "border-white/10" : "border-slate-200"
                }`}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMute();
                    }}
                    className={`transition p-0.5 ${
                      isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
                    }`}
                    title={volume === 0 || isMuted ? "إلغاء الكتم" : "كتم الصوت"}
                  >
                    {volume === 0 || isMuted ? (
                      <VolumeX size={14} className="text-rose-500" />
                    ) : (
                      <Volume2 size={14} className={isPodcast ? (isDark ? "text-indigo-300" : "text-indigo-600") : (isDark ? "text-amber-300" : "text-amber-600")} />
                    )}
                  </button>
                  <div dir="ltr" className="flex items-center">
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.02}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setVolume(val);
                        if (isMuted) setIsMuted(false);
                        if (audioRef.current) {
                          audioRef.current.volume = val;
                          audioRef.current.muted = false;
                        }
                      }}
                      style={{
                        background: `linear-gradient(to right, ${isPodcast ? "#6366f1" : "#f8ca14"} 0%, ${isPodcast ? "#6366f1" : "#f8ca14"} ${volumePercent}%, ${isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.12)"} ${volumePercent}%, ${isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.12)"} 100%)`,
                      }}
                      className={`h-1.5 w-14 sm:w-16 cursor-pointer appearance-none rounded-full ${isPodcast ? "accent-indigo-500" : "accent-[#f8ca14]"}`}
                      title={`مستوى الصوت: ${volumePercent}% (شمال واطي / يمين عالي)`}
                    />
                  </div>
                </div>
              )}

              {/* 3. Playback Controls (تختلف تلقائياً ما بين الأغنية والبودكاست) */}
              <div className={`flex items-center gap-1 border-r pr-1.5 shrink-0 ${
                isDark ? "border-white/10" : "border-slate-200"
              }`}>
                {isPodcast ? (
                  <>
                    {/* PODCAST: Skip Forward 15s */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        skipTime(15);
                      }}
                      className={`relative grid h-7 w-7 place-items-center rounded-full transition active:scale-95 ${
                        isDark ? "text-indigo-300 hover:text-white hover:bg-white/10" : "text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50"
                      }`}
                      title="تقديم 15 ثانية ⏩"
                    >
                      <RotateCw size={14} />
                      <span className="absolute -bottom-0.5 text-[7px] font-black font-mono leading-none">15</span>
                    </button>

                    {/* PODCAST: Play / Pause Button in Studio Indigo */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!activeItem) playSong(0);
                        else togglePlay();
                      }}
                      className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-400 hover:to-purple-500 transition shadow-md active:scale-95 mx-0.5 font-black"
                      title={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
                    >
                      {isPlaying ? <Pause size={14} /> : <Play size={14} className="mr-0.5 fill-current" />}
                    </button>

                    {/* PODCAST: Skip Backward 15s */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        skipTime(-15);
                      }}
                      className={`relative grid h-7 w-7 place-items-center rounded-full transition active:scale-95 ${
                        isDark ? "text-indigo-300 hover:text-white hover:bg-white/10" : "text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50"
                      }`}
                      title="تأخير 15 ثانية ⏪"
                    >
                      <RotateCcw size={14} />
                      <span className="absolute -bottom-0.5 text-[7px] font-black font-mono leading-none">15</span>
                    </button>
                  </>
                ) : (
                  <>
                    {/* SONG: Next Track */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playNextSong();
                      }}
                      className={`grid h-7 w-7 place-items-center rounded-full transition active:scale-95 ${
                        isDark ? "text-slate-300 hover:text-amber-300 hover:bg-white/10" : "text-slate-700 hover:text-amber-700 hover:bg-black/5"
                      }`}
                      title="الأغنية التالية"
                    >
                      <SkipForward size={14} />
                    </button>

                    {/* SONG: Play / Pause Toggle in Gold */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!activeItem) playSong(0);
                        else togglePlay();
                      }}
                      className="grid h-8 w-8 place-items-center rounded-full bg-amber-400 text-slate-950 hover:bg-amber-300 transition shadow-md active:scale-95 mx-0.5 font-black"
                      title={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
                    >
                      {isPlaying ? <Pause size={14} /> : <Play size={14} className="mr-0.5 fill-current" />}
                    </button>

                    {/* SONG: Prev Track or Restart to 0:00 */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevOrRestart();
                      }}
                      className={`grid h-7 w-7 place-items-center rounded-full transition active:scale-95 ${
                        isDark ? "text-slate-300 hover:text-amber-300 hover:bg-white/10" : "text-slate-700 hover:text-amber-700 hover:bg-black/5"
                      }`}
                      title="الأغنية السابقة / إعادة من البداية"
                    >
                      <SkipBack size={14} />
                    </button>
                  </>
                )}
              </div>

              {/* 4. Track Info: Thumbnail & Title & Live Time (شمال: الاسم دائماً على الشمال) */}
              <div
                onClick={() => setIsExpanded(!isExpanded)}
                className={`flex items-center gap-2 cursor-pointer shrink-0 max-w-[135px] sm:max-w-[170px] truncate border-r pr-2 ${
                  isDark ? "border-white/10" : "border-slate-200"
                }`}
                title={isExpanded ? "انقر للتقليص" : "انقر لتوسيع عناصر التحكم"}
              >
                <div className={`h-7 w-7 overflow-hidden shrink-0 border ${
                  isPodcast
                    ? isDark ? "border-indigo-400/60 bg-[#12152b] rounded-lg" : "border-indigo-300 bg-indigo-50 rounded-lg"
                    : isDark ? "border-amber-400/40 bg-black rounded-full" : "border-slate-300 bg-slate-100 rounded-full"
                }`}>
                  <img
                    src={getSongCover(activeItem, theme)}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        isPodcast
                          ? theme === "light" ? "/podcast-default-cover-light.svg" : "/podcast-default-cover-dark.svg"
                          : theme === "light" ? "/audio-default-cover-light.svg" : "/audio-default-cover-dark.svg";
                    }}
                  />
                </div>
                <div className="text-right truncate">
                  <span className={`block text-[11px] font-black leading-tight truncate ${
                    isPodcast
                      ? isDark ? "text-indigo-300" : "text-indigo-900"
                      : isDark ? "text-amber-300" : "text-slate-900"
                  }`}>
                    {activeItem ? activeItem.title : "راديو العقيق 🎵"}
                  </span>
                  <span className={`block text-[9px] font-mono leading-tight ${
                    isPodcast
                      ? isDark ? "text-indigo-300/80" : "text-indigo-600"
                      : isDark ? "text-slate-400" : "text-slate-500"
                  }`}>
                    {isPodcast && "🎙️ "}{formatTime(progress)} / {formatTime(duration)}
                  </span>
                </div>
              </div>

              {/* 5. In Expanded Mode: Close Button (X) at Far Left (أقصى الشمال) */}
              {isExpanded && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                    setIsHovered(false);
                  }}
                  className={`grid h-6 w-6 place-items-center rounded-full transition shrink-0 mr-1 animate-in fade-in duration-200 ${
                    isDark ? "text-slate-400 hover:text-white hover:bg-white/15" : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                  title="إغلاق المشغل"
                >
                  <X size={14} />
                </button>
              )}

              {/* Interactive Bottom Progress Scrubber (يمتد على طول الكبسولة مع نقطة تظهر بالماوس) */}
              {activeItem && duration > 0 && (
                <div
                  dir="ltr"
                  className="group/bar absolute bottom-0 left-0 right-0 h-3 flex items-end cursor-pointer z-20 overflow-visible"
                  title={`تقديم / تأخير: ${formatTime(progress)} / ${formatTime(duration)} (شمال البداية / يمين النهاية)`}
                >
                  {/* Track Background */}
                  <div className={`relative w-full h-[2.5px] group-hover/bar:h-[4px] transition-all duration-150 overflow-visible ${
                    isDark ? "bg-white/15" : "bg-slate-200"
                  }`}>
                    {/* Filled Active Line (Golden for Songs, Indigo for Podcasts) */}
                    <div
                      className={`h-full transition-all duration-75 ${
                        isPodcast
                          ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400"
                          : "bg-gradient-to-r from-amber-400 to-yellow-300"
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                    {/* Scrubber Dot / Thumb that appears on hover */}
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3 w-3 rounded-full border-2 opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none z-30 ${
                        isPodcast
                          ? "bg-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.9)]"
                          : "bg-amber-400 shadow-[0_0_10px_rgba(248,202,20,0.9)]"
                      } ${isDark ? "border-[#090b10]" : "border-white"}`}
                      style={{ left: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Native invisible range input on top for smooth dragging & clicks */}
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={progress}
                    onChange={handleSeek}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. LUXURY FLOATING PLAYLIST SHEET (Anchored right above the Vinyl Dock) */}
      {/* ========================================================================= */}
      {playlistDrawerOpen && (
        <div
          ref={playlistSheetRef}
          dir="rtl"
          className={`fixed bottom-20 sm:bottom-24 right-4 sm:right-6 w-[350px] sm:w-[410px] max-h-[540px] flex flex-col rounded-3xl backdrop-blur-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 select-none ${
            isDark
              ? "bg-[#090b11]/98 border border-amber-400/40 shadow-[0_24px_70px_rgba(0,0,0,0.9)] ring-1 ring-amber-400/20 text-white"
              : "bg-white/98 border border-slate-200/90 shadow-[0_24px_70px_rgba(0,0,0,0.18)] ring-1 ring-amber-400/30 text-slate-900"
          }`}
        >
          {/* Header */}
          <div className={`p-4 pb-3 border-b flex items-center justify-between ${
            isDark ? "border-white/10" : "border-slate-200"
          }`}>
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 grid place-items-center text-slate-950 shadow-md font-black">
                <Headphones size={17} />
              </div>
              <div>
                <h3 className={`text-sm font-black leading-tight ${isDark ? "text-white" : "text-slate-900"}`}>مكتبة العقيق الصوتية</h3>
                <p className={`text-[10px] font-bold ${isDark ? "text-amber-300/80" : "text-amber-700"}`}>سبوتيفاي مدارس العقيق الأهلية</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {activeItem && (
                <button
                  type="button"
                  onClick={() => {
                    stopPodcast();
                    toast.success("تم إيقاف تشغيل الصوت بالكامل");
                  }}
                  className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-xl transition border ${
                    isDark
                      ? "text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 border-rose-500/20"
                      : "text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                  }`}
                  title="إطفاء الصوت بالكامل"
                >
                  <Power size={11} />
                  <span>إطفاء</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setPlaylistDrawerOpen(false)}
                className={`grid h-7 w-7 place-items-center rounded-full transition ${
                  isDark ? "text-slate-400 hover:text-white hover:bg-white/10" : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                }`}
                title="إغلاق القائمة"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Segmented Tabs (الأناشيد المدرسية / بودكاست العقيق) */}
          <div className="px-4 pt-3">
            <div className={`grid grid-cols-2 gap-1 p-1 rounded-2xl border text-xs font-black ${
              isDark ? "bg-white/5 border-white/10" : "bg-slate-100 border-slate-200"
            }`}>
              <button
                type="button"
                onClick={() => setPlaylistTab("songs")}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition duration-200 ${
                  playlistTab === "songs"
                    ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md font-black"
                    : isDark
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Music size={13} />
                <span>الأناشيد ({schoolSongs.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setPlaylistTab("podcasts")}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition duration-200 ${
                  playlistTab === "podcasts"
                    ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md font-black"
                    : isDark
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Radio size={13} />
                <span>البودكاست ({podcastsList.length})</span>
              </button>
            </div>
          </div>

          {/* Live Search Bar */}
          <div className="px-4 pt-2.5 pb-2">
            <div className="relative">
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={playlistSearch}
                onChange={(e) => setPlaylistSearch(e.target.value)}
                placeholder={playlistTab === "songs" ? "ابحث بالاسم أو المنشد أو المناسبة..." : "ابحث في الحلقات أو الضيف..."}
                className={`w-full h-8 pr-8 pl-3 rounded-xl border text-xs outline-none transition ${
                  isDark
                    ? "bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-400/50 focus:bg-white/10"
                    : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white"
                }`}
              />
              {playlistSearch && (
                <button
                  type="button"
                  onClick={() => setPlaylistSearch("")}
                  className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${
                    isDark ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Song / Podcast Cards List */}
          <div className="flex-1 overflow-y-auto px-4 py-1 space-y-1.5 max-h-[300px] custom-scrollbar">
            {playlistTab === "songs" ? (
              filteredSongs.length > 0 ? (
                filteredSongs.map((song) => {
                  const isCurrent = activeItem?.id === song.id;
                  const cover = getSongCover(song, theme);
                  return (
                    <div
                      key={song.id}
                      onClick={() => playSong(song)}
                      className={`group flex items-center justify-between p-2 rounded-2xl cursor-pointer transition duration-200 border ${
                        isCurrent
                          ? "bg-amber-400/15 border-amber-400/50 shadow-sm"
                          : isDark
                            ? "bg-white/[0.03] hover:bg-white/[0.08] border-white/5 hover:border-white/10"
                            : "bg-slate-50/80 hover:bg-amber-50/70 border-slate-200/70 hover:border-amber-300"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Artwork */}
                        <div className={`relative h-11 w-11 rounded-xl overflow-hidden shrink-0 border shadow-sm ${
                          isDark ? "border-white/10 bg-black" : "border-slate-300 bg-slate-100"
                        }`}>
                          <img
                            src={cover}
                            alt=""
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                theme === "light" ? "/audio-default-cover-light.svg" : "/audio-default-cover-dark.svg";
                            }}
                          />
                          {/* Play overlay or Equalizer animation */}
                          {isCurrent ? (
                            <div className="absolute inset-0 bg-black/60 grid place-items-center">
                              {isPlaying ? (
                                <div className="flex items-end gap-0.5 h-3.5">
                                  <span className={`w-0.5 h-full rounded-full animate-pulse ${isDark ? "bg-amber-400" : "bg-amber-600"}`} />
                                  <span className={`w-0.5 h-2/3 rounded-full animate-pulse delay-75 ${isDark ? "bg-amber-400" : "bg-amber-600"}`} />
                                  <span className={`w-0.5 h-4/5 rounded-full animate-pulse delay-150 ${isDark ? "bg-amber-400" : "bg-amber-600"}`} />
                                </div>
                              ) : (
                                <Pause size={14} className={`fill-current ${isDark ? "text-amber-300" : "text-amber-800"}`} />
                              )}
                            </div>
                          ) : (
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center text-white">
                              <Play size={14} className="fill-current text-amber-300 mr-0.5" />
                            </div>
                          )}
                        </div>

                        {/* Title & Artist */}
                        <div className="min-w-0 text-right">
                          <p className={`text-xs font-black truncate leading-snug ${
                            isCurrent
                              ? isDark ? "text-amber-300" : "text-amber-800"
                              : isDark ? "text-white group-hover:text-amber-200" : "text-slate-900 group-hover:text-amber-700"
                          }`}>
                            {song.title}
                          </p>
                          <p className={`text-[10px] truncate mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            {song.artistOrHost || "كورال العقيق"}
                          </p>
                        </div>
                      </div>

                      {/* Badge / Category */}
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg shrink-0 border ${
                        isCurrent
                          ? "bg-amber-400/20 text-amber-300 border-amber-400/30"
                          : isDark
                            ? "bg-white/5 text-slate-400 border-white/5"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}>
                        {song.category || "نشيد"}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className={`text-center py-8 text-xs font-bold ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  لم يتم العثور على نشيد مطابق للبحث
                </div>
              )
            ) : (
              filteredPodcasts.length > 0 ? (
                filteredPodcasts.map((pod) => {
                  const isCurrent = activeItem?.id === pod.id;
                  const cover = pod.coverUrl ? (directDriveImage(pod.coverUrl) || pod.coverUrl) : (theme === "light" ? "/audio-default-cover-light.svg" : "/audio-default-cover-dark.svg");
                  return (
                    <div
                      key={pod.id}
                      onClick={() => playPodcast(pod)}
                      className={`group flex items-center justify-between p-2 rounded-2xl cursor-pointer transition duration-200 border ${
                        isCurrent
                          ? "bg-indigo-500/15 border-indigo-400/50 shadow-sm"
                          : isDark
                            ? "bg-white/[0.03] hover:bg-white/[0.08] border-white/5 hover:border-white/10"
                            : "bg-slate-50/80 hover:bg-indigo-50/60 border-slate-200/70 hover:border-indigo-300"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Artwork */}
                        <div className={`relative h-11 w-11 rounded-xl overflow-hidden shrink-0 border shadow-sm ${
                          isDark ? "border-white/10 bg-black" : "border-slate-300 bg-slate-100"
                        }`}>
                          <img
                            src={cover}
                            alt=""
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                theme === "light" ? "/audio-default-cover-light.svg" : "/audio-default-cover-dark.svg";
                            }}
                          />
                          {isCurrent ? (
                            <div className="absolute inset-0 bg-black/60 grid place-items-center">
                              {isPlaying ? (
                                <div className="flex items-end gap-0.5 h-3.5">
                                  <span className={`w-0.5 h-full rounded-full animate-pulse ${isDark ? "bg-indigo-400" : "bg-indigo-600"}`} />
                                  <span className={`w-0.5 h-2/3 rounded-full animate-pulse delay-75 ${isDark ? "bg-indigo-400" : "bg-indigo-600"}`} />
                                  <span className={`w-0.5 h-4/5 rounded-full animate-pulse delay-150 ${isDark ? "bg-indigo-400" : "bg-indigo-600"}`} />
                                </div>
                              ) : (
                                <Pause size={14} className={`fill-current ${isDark ? "text-indigo-300" : "text-indigo-800"}`} />
                              )}
                            </div>
                          ) : (
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center text-white">
                              <Play size={14} className="fill-current text-indigo-300 mr-0.5" />
                            </div>
                          )}
                        </div>

                        {/* Title & Host */}
                        <div className="min-w-0 text-right">
                          <p className={`text-xs font-black truncate leading-snug ${
                            isCurrent
                              ? isDark ? "text-indigo-300" : "text-indigo-800"
                              : isDark ? "text-white group-hover:text-indigo-200" : "text-slate-900 group-hover:text-indigo-700"
                          }`}>
                            {pod.title}
                          </p>
                          <p className={`text-[10px] truncate mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            {pod.hostName || "صوت العقيق"}
                          </p>
                        </div>
                      </div>

                      {/* Badge / Category */}
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg shrink-0 border ${
                        isCurrent
                          ? "bg-indigo-500/20 text-indigo-300 border-indigo-400/30"
                          : "bg-white/5 text-slate-400 border-white/5"
                      }`}>
                        {pod.category || "بودكاست"}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs font-bold">
                  لم يتم العثور على حلقة مطابقة للبحث
                </div>
              )
            )}
          </div>

          {/* Bottom Live Bar / Now Playing Status */}
          {activeItem && (
            <div className="p-3 bg-white/[0.04] border-t border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-[10px] text-slate-300 truncate">
                  يعزف الآن: <strong className="text-amber-300">{activeItem.title}</strong>
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 shrink-0">
                {formatTime(progress)} / {formatTime(duration)}
              </span>
            </div>
          )}
        </div>
      )}
    </PodcastPlayerContext.Provider>
  );
}
