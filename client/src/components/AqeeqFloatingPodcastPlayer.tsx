import { useState, useRef, useEffect, createContext, useContext } from "react";
import { Play, Pause, Volume2, VolumeX, X, Radio, Sparkles, ExternalLink, Maximize2, SkipForward, SkipBack } from "lucide-react";
import { Button } from "@/components/ui/button";

export type PlayingPodcast = {
  id: number;
  title: string;
  hostName?: string;
  category: string;
  mediaType: "audio" | "video";
  sourceType: "drive" | "youtube" | "direct";
  mediaUrl: string;
  coverUrl?: string | null;
  duration?: string;
};

type PodcastContextType = {
  activePodcast: PlayingPodcast | null;
  isPlaying: boolean;
  playPodcast: (podcast: PlayingPodcast) => void;
  pausePodcast: () => void;
  stopPodcast: () => void;
};

const PodcastPlayerContext = createContext<PodcastContextType>({
  activePodcast: null,
  isPlaying: false,
  playPodcast: () => {},
  pausePodcast: () => {},
  stopPodcast: () => {},
});

export const usePodcastPlayer = () => useContext(PodcastPlayerContext);

export function PodcastPlayerProvider({ children }: { children: React.ReactNode }) {
  const [activePodcast, setActivePodcast] = useState<PlayingPodcast | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playPodcast = (podcast: PlayingPodcast) => {
    setActivePodcast(podcast);
    setIsPlaying(true);
  };

  const pausePodcast = () => {
    setIsPlaying(false);
    if (audioRef.current) audioRef.current.pause();
  };

  const stopPodcast = () => {
    setIsPlaying(false);
    setActivePodcast(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    if (activePodcast && activePodcast.mediaType === "audio" && audioRef.current) {
      audioRef.current.src = activePodcast.mediaUrl;
      audioRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  }, [activePodcast?.id, activePodcast?.mediaUrl]);

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

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <PodcastPlayerContext.Provider value={{ activePodcast, isPlaying, playPodcast, pausePodcast, stopPodcast }}>
      {children}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

      {/* Persistent Floating Audio/Media Bar */}
      {activePodcast && (
        <div
          dir="rtl"
          className="fixed bottom-3 sm:bottom-5 left-3 sm:left-6 right-3 sm:right-6 z-50 mx-auto max-w-4xl animate-in slide-in-from-bottom-5 duration-300"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl sm:rounded-3xl border border-amber-400/40 bg-[#0a0d16]/95 p-3.5 sm:p-4 shadow-2xl backdrop-blur-xl ring-1 ring-amber-400/20 text-white">
            {/* Podcast Info */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/30 overflow-hidden">
                {activePodcast.coverUrl ? (
                  <img src={activePodcast.coverUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Radio size={22} />
                )}
                {isPlaying && (
                  <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-black text-amber-300">
                    {activePodcast.category}
                  </span>
                  {activePodcast.hostName && (
                    <span className="truncate text-[11px] text-slate-400 font-bold">
                      {activePodcast.hostName}
                    </span>
                  )}
                </div>
                <h4 className="truncate text-xs sm:text-sm font-black text-slate-100 mt-0.5">
                  {activePodcast.title}
                </h4>
              </div>
            </div>

            {/* Controls & Scrubber (for audio) */}
            {activePodcast.mediaType === "audio" ? (
              <div className="flex flex-1 items-center gap-3 max-w-md mx-auto w-full">
                <span className="text-[10px] text-slate-400 font-mono w-9 text-left">
                  {formatTime(progress)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={progress}
                  onChange={handleSeek}
                  className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-white/20 accent-amber-400"
                />
                <span className="text-[10px] text-slate-400 font-mono w-9">
                  {formatTime(duration)}
                </span>
              </div>
            ) : null}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 shrink-0">
              {activePodcast.mediaType === "audio" ? (
                <button
                  type="button"
                  onClick={togglePlay}
                  className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-400 text-slate-950 font-black hover:bg-amber-300 transition shadow-lg shadow-amber-400/30"
                  title={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} className="mr-0.5" />}
                </button>
              ) : (
                <a
                  href={activePodcast.mediaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-xs font-black text-white hover:bg-red-500 transition shadow-lg"
                >
                  <ExternalLink size={14} />
                  <span>مشاهدة الفيديو</span>
                </a>
              )}

              <button
                type="button"
                onClick={stopPodcast}
                className="grid h-8 w-8 place-items-center rounded-xl bg-white/10 text-slate-400 hover:text-white hover:bg-white/20 transition"
                title="إغلاق المشغل"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </PodcastPlayerContext.Provider>
  );
}
