import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, SlidersHorizontal } from "lucide-react";

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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) {
      setIsPlaying(false);
      return;
    }

    audio.volume = isMuted ? 0 : volume;
    audio.muted = isMuted;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // Autoplay blocked by browser policy until interaction
          setIsPlaying(false);
          const handleFirstInteraction = () => {
            if (audioRef.current && !isMuted) {
              audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
            }
            window.removeEventListener("click", handleFirstInteraction);
            window.removeEventListener("touchstart", handleFirstInteraction);
            window.removeEventListener("keydown", handleFirstInteraction);
          };
          window.addEventListener("click", handleFirstInteraction, { once: true });
          window.addEventListener("touchstart", handleFirstInteraction, { once: true });
          window.addEventListener("keydown", handleFirstInteraction, { once: true });
        });
    }
  }, [audioUrl]);

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted || !isPlaying) {
      setIsMuted(false);
      audio.muted = false;
      audio.volume = volume > 0 ? volume : 0.35;
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
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
      {/* Real HTML5 Audio Element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        loop
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Main Luxury Audio Pill */}
      <div
        className={`flex h-9 items-center gap-2 rounded-xl border px-3 shadow-sm transition-all ${
          isPlaying && !isMuted
            ? "border-amber-300/50 bg-amber-300/15 text-amber-200 ring-1 ring-amber-300/20"
            : dark
              ? "border-white/10 bg-black/40 text-slate-400 hover:border-white/20"
              : "border-slate-900/10 bg-white text-slate-600 hover:border-slate-300 shadow-sm"
        }`}
      >
        {/* Clickable Mute / Play Button */}
        <button
          type="button"
          onClick={toggleMute}
          className="flex items-center gap-2 text-xs font-black transition active:scale-95"
          title={isPlaying && !isMuted ? "كتم الصوت" : "تشغيل الصوت"}
          aria-label={isPlaying && !isMuted ? "كتم الصوت" : "تشغيل الصوت"}
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

          <span>
            {isPlaying && !isMuted ? "موسيقى نشطة" : "موسيقى (مكتومة)"}
          </span>

          {isPlaying && !isMuted ? (
            <Volume2 size={15} className="text-amber-300" />
          ) : (
            <VolumeX size={15} className="text-slate-400" />
          )}
        </button>

        {/* Toggle Volume Slider Expander */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowVolumeSlider((prev) => !prev);
          }}
          className={`grid h-6 w-6 place-items-center rounded-lg transition hover:bg-white/15 ${
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
              className="h-1.5 w-16 sm:w-24 cursor-pointer appearance-none rounded-lg bg-slate-700 accent-amber-300"
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
