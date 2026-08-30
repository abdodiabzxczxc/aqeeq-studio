import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Music2, Play, Pause } from "lucide-react";

type Props = {
  audioUrl?: string | null;
  trackTitle?: string;
  dark?: boolean;
  variant?: "header" | "floating" | "rail";
  defaultVolume?: number;
};

export function AqeeqReaderAudioController({
  audioUrl,
  trackTitle = "موسيقى العقيق",
  dark = true,
  variant = "header",
  defaultVolume = 0.35,
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(defaultVolume);
  const [showVolumeMenu, setShowVolumeMenu] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Initialize and handle autoplay
  useEffect(() => {
    if (!audioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
      return;
    }

    const audio = new Audio(audioUrl);
    audio.loop = true;
    audio.volume = isMuted ? 0 : volume;
    audioRef.current = audio;

    // Attempt autoplay with browser gesture fallback
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // Browser prevented autoplay without user interaction
          setIsPlaying(false);
          const handleFirstClick = () => {
            if (audioRef.current && !isMuted) {
              audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
            }
            window.removeEventListener("click", handleFirstClick);
            window.removeEventListener("touchstart", handleFirstClick);
            window.removeEventListener("keydown", handleFirstClick);
          };
          window.addEventListener("click", handleFirstClick, { once: true });
          window.addEventListener("touchstart", handleFirstClick, { once: true });
          window.addEventListener("keydown", handleFirstClick, { once: true });
        });
    }

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [audioUrl]);

  // Volume change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Toggle Mute / Playback
  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted || !isPlaying) {
      setIsMuted(false);
      audioRef.current.volume = volume;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    } else {
      setIsMuted(true);
      audioRef.current.volume = 0;
      setIsPlaying(false);
    }
  };

  if (!audioUrl) return null;

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center"
      onMouseEnter={() => setShowVolumeMenu(true)}
      onMouseLeave={() => setShowVolumeMenu(false)}
    >
      <button
        type="button"
        onClick={toggleMute}
        aria-label={isPlaying && !isMuted ? "كتم الموسيقى" : "تشغيل الموسيقى"}
        title={isPlaying && !isMuted ? "كتم الموسيقى الخلفية" : "تشغيل الموسيقى الخلفية"}
        className={`group relative flex h-9 items-center gap-2 rounded-xl border px-3 transition active:scale-95 ${
          isPlaying && !isMuted
            ? "border-amber-300/50 bg-amber-300/15 text-amber-200 shadow-lg shadow-amber-400/10"
            : dark
              ? "border-white/10 bg-black/40 text-slate-400 hover:border-white/20 hover:text-white"
              : "border-slate-900/10 bg-white text-slate-600 hover:border-slate-300 hover:text-black shadow-sm"
        }`}
      >
        {/* Animated Equalizer Wave Bars */}
        <div className={`aq-equalizer ${!isPlaying || isMuted ? "aq-equalizer-paused text-slate-500" : "text-amber-300"}`}>
          <span className="aq-equalizer-bar" />
          <span className="aq-equalizer-bar" />
          <span className="aq-equalizer-bar" />
          <span className="aq-equalizer-bar" />
        </div>

        <span className="text-xs font-black">
          {isPlaying && !isMuted ? "موسيقى نشطة" : "موسيقى (مكتومة)"}
        </span>

        {isPlaying && !isMuted ? (
          <Volume2 size={15} className="text-amber-300" />
        ) : (
          <VolumeX size={15} className="text-slate-400" />
        )}
      </button>

      {/* Floating Volume & Track Info Popover on Hover */}
      {showVolumeMenu ? (
        <div
          dir="rtl"
          className={`absolute left-0 top-full z-50 mt-2 w-56 rounded-2xl border p-3 shadow-2xl backdrop-blur-xl transition-all ${
            dark
              ? "border-amber-300/25 bg-[#0d1019]/95 text-slate-200"
              : "border-slate-900/10 bg-white/95 text-slate-800 shadow-slate-300/50"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-black">
            <span className="truncate text-amber-300">{trackTitle}</span>
            <span className="font-mono text-[10px] text-slate-400">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
          </div>

          <div className="mt-2.5 flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 text-slate-300 hover:border-amber-300 hover:text-amber-200"
            >
              {isPlaying && !isMuted ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const newVol = parseFloat(e.target.value);
                setVolume(newVol);
                if (newVol > 0 && isMuted) {
                  setIsMuted(false);
                }
              }}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-700 accent-amber-300"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
