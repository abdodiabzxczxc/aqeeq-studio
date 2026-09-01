import { useEffect, useState } from "react";
import { Volume2, VolumeX, SlidersHorizontal } from "lucide-react";
import { usePodcastPlayer } from "./AqeeqFloatingPodcastPlayer";

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
}: Props) {
  const player = usePodcastPlayer();
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // Seamlessly hook into the unified audio player on mount & clean up on unmount
  useEffect(() => {
    if (!audioUrl || !player.playReaderAudio) return;

    const unregister = player.playReaderAudio({
      id: trackTitle,
      title: trackTitle,
      subtitle: "موسيقى قارئ العقيق التفاعلية",
      category: "قارئ العقيق",
      audioUrl: audioUrl,
      autoPlay: true,
    });

    return () => {
      if (typeof unregister === "function") {
        unregister();
      }
    };
  }, [audioUrl, trackTitle]);

  if (!audioUrl) return null;

  const isPlaying = player.isPlaying && player.activeItem?.type === "reader";
  const isMuted = player.isMuted;
  const volume = player.volume;

  const toggleMuteOrPlay = () => {
    player.togglePlay();
  };

  const handleVolumeChange = (newVol: number) => {
    player.setVolume(newVol);
  };

  return (
    <div className="relative inline-flex items-center shrink-0">
      {/* Luxury Synchronized Audio Pill */}
      <div
        className={`flex h-9 items-center gap-1.5 sm:gap-2 rounded-xl border px-2 sm:px-3 shadow-sm transition-all select-none ${
          isPlaying && !isMuted
            ? "border-amber-300/50 bg-amber-300/15 text-amber-200 ring-1 ring-amber-300/20"
            : dark
              ? "border-white/10 bg-black/40 text-slate-400 hover:border-white/20"
              : "border-slate-900/10 bg-white text-slate-600 hover:border-slate-300 shadow-sm"
        }`}
      >
        {/* Click / Tap to Play or Mute */}
        <button
          type="button"
          onClick={toggleMuteOrPlay}
          className="flex items-center gap-1.5 sm:gap-2 text-xs font-black transition active:scale-95 touch-manipulation"
          title={isPlaying && !isMuted ? "إيقاف الموسيقى مؤقتاً" : "تشغيل الموسيقى"}
          aria-label={isPlaying && !isMuted ? "إيقاف الموسيقى مؤقتاً" : "تشغيل الموسيقى"}
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

          {/* Text visible on desktop, compact on mobile */}
          <span className="hidden sm:inline">
            {isPlaying && !isMuted ? "موسيقى نشطة" : "مكتومة"}
          </span>

          {isPlaying && !isMuted ? (
            <Volume2 size={14} className="text-amber-300 shrink-0" />
          ) : (
            <VolumeX size={14} className="text-slate-400 shrink-0" />
          )}
        </button>

        {/* Volume Slider Expander Toggle */}
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
          <SlidersHorizontal size={12} />
        </button>

        {/* Inline Smooth Volume Slider */}
        {showVolumeSlider ? (
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 sm:gap-2 border-r border-white/15 pr-1.5 sm:pr-2 mr-0.5 sm:mr-1 animate-in fade-in zoom-in-95 duration-200"
          >
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="h-1.5 w-14 sm:w-20 cursor-pointer appearance-none rounded-lg bg-slate-700 accent-amber-300 touch-manipulation"
              title={`مستوى الصوت: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
            />
            <span className="font-mono text-[9px] sm:text-[10px] text-amber-200 min-w-5 sm:min-w-6 text-center">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
