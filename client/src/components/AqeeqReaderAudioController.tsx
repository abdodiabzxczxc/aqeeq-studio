import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, SlidersHorizontal, Music } from "lucide-react";

type Props = {
  audioUrl?: string | null;
  trackTitle?: string;
  dark?: boolean;
  defaultVolume?: number;
};

export function AqeeqReaderAudioController({
  audioUrl,
  trackTitle = "موسيقى العقيق",
  dark = true,
  defaultVolume = 0.35,
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(defaultVolume);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [needsUserGesture, setNeedsUserGesture] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize and handle playback across Desktop and Mobile
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) {
      setIsPlaying(false);
      return;
    }

    audio.volume = isMuted ? 0 : volume;
    audio.muted = isMuted;

    // Function to unlock audio on first touch/interaction on mobile
    const startAudioPlayback = () => {
      if (!audioRef.current || isMuted) return;
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setNeedsUserGesture(false);
        })
        .catch(() => {
          setNeedsUserGesture(true);
        });
    };

    // Attempt direct play first
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setNeedsUserGesture(false);
        })
        .catch(() => {
          // Mobile browser blocked autoplay: attach listeners to unlock on first gesture
          setIsPlaying(false);
          setNeedsUserGesture(true);

          const gestureEvents = ["touchstart", "touchend", "pointerdown", "click", "keydown", "scroll"];
          const handleFirstGesture = () => {
            startAudioPlayback();
            gestureEvents.forEach((evt) => window.removeEventListener(evt, handleFirstGesture));
          };

          gestureEvents.forEach((evt) => {
            window.addEventListener(evt, handleFirstGesture, { passive: true, once: true });
          });
        });
    }

    return () => {
      audio.pause();
    };
  }, [audioUrl]);

  const toggleMuteOrPlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted || !isPlaying) {
      setIsMuted(false);
      setNeedsUserGesture(false);
      audio.muted = false;
      audio.volume = volume > 0 ? volume : 0.35;
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn("Audio play failed:", err);
        });
    } else {
      setIsMuted(true);
      audio.muted = true;
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    const audio = audioRef.current;
    if (audio) {
      audio.volume = newVol;
      if (newVol > 0 && (isMuted || !isPlaying)) {
        setIsMuted(false);
        setNeedsUserGesture(false);
        audio.muted = false;
        audio
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {});
      } else if (newVol === 0) {
        setIsMuted(true);
        audio.muted = true;
        audio.pause();
        setIsPlaying(false);
      }
    }
  };

  if (!audioUrl) return null;

  return (
    <div className="relative inline-flex items-center">
      {/* Real HTML5 Audio Element with Mobile Attributes */}
      <audio
        ref={audioRef}
        src={audioUrl}
        loop
        preload="auto"
        playsInline
        onPlay={() => {
          setIsPlaying(true);
          setNeedsUserGesture(false);
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Main Luxury Audio Pill */}
      <div
        className={`flex h-9 items-center gap-2 rounded-xl border px-3 shadow-sm transition-all select-none ${
          isPlaying && !isMuted
            ? "border-amber-300/50 bg-amber-300/15 text-amber-200 ring-1 ring-amber-300/20"
            : needsUserGesture
              ? "border-amber-400/80 bg-amber-400/20 text-amber-300 ring-2 ring-amber-400/40 animate-pulse"
              : dark
                ? "border-white/10 bg-black/40 text-slate-400 hover:border-white/20"
                : "border-slate-900/10 bg-white text-slate-600 hover:border-slate-300 shadow-sm"
        }`}
      >
        {/* Clickable / Tappable Play & Mute Button */}
        <button
          type="button"
          onClick={toggleMuteOrPlay}
          className="flex items-center gap-2 text-xs font-black transition active:scale-95 touch-manipulation"
          title={isPlaying && !isMuted ? "كتم الموسيقى" : "تشغيل الموسيقى"}
          aria-label={isPlaying && !isMuted ? "كتم الموسيقى" : "تشغيل الموسيقى"}
        >
          {/* Animated Equalizer Wave Bars */}
          <div
            className={`aq-equalizer ${
              !isPlaying || isMuted ? "aq-equalizer-paused text-slate-500" : "text-amber-300"
            }`}
          >
            <span className="aq-equalizer-bar" />
            <span className="aq-equalizer-bar" />
            <span className="aq-equalizer-bar" />
            <span className="aq-equalizer-bar" />
          </div>

          <span className="truncate max-w-[110px] sm:max-w-none">
            {isPlaying && !isMuted
              ? "موسيقى نشطة"
              : needsUserGesture
                ? "انقر لتشغيل الموسيقى 🎵"
                : "موسيقى (مكتومة)"}
          </span>

          {isPlaying && !isMuted ? (
            <Volume2 size={15} className="text-amber-300 shrink-0" />
          ) : (
            <VolumeX size={15} className="text-slate-400 shrink-0" />
          )}
        </button>

        {/* Toggle Volume Slider Expander */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowVolumeSlider((prev) => !prev);
          }}
          className={`grid h-6 w-6 place-items-center rounded-lg transition hover:bg-white/15 touch-manipulation ${
            showVolumeSlider ? "text-amber-300 bg-white/10" : "text-slate-400"
          }`}
          title="التحكم في مستوى الصوت"
          aria-label="التحكم في مستوى الصوت"
        >
          <SlidersHorizontal size={13} />
        </button>

        {/* Inline Smooth Volume Slider */}
        {showVolumeSlider ? (
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 border-r border-white/15 pr-2 mr-1 animate-in fade-in zoom-in-95 duration-200"
          >
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="h-1.5 w-16 sm:w-24 cursor-pointer appearance-none rounded-lg bg-slate-700 accent-amber-300 touch-manipulation"
              title={`مستوى الصوت: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
            />
            <span className="font-mono text-[10px] text-amber-200 min-w-7 text-center">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
