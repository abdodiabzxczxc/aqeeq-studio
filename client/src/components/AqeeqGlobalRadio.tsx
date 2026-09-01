import { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipForward, Radio as RadioIcon, Music, Volume2, VolumeX, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { useLocation } from "wouter";

export function AqeeqGlobalRadio() {
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";
  const [location] = useLocation();

  // Fetch all podcasts/audio tracks
  const { data: podcasts } = trpc.podcasts.list.useQuery(undefined, { refetchOnWindowFocus: false });
  
  const audioTracks = (podcasts || []).filter(p => p.mediaType === "audio");
  
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stop radio if user is in an admin/studio page to avoid distraction? 
  // No, let them listen everywhere! But hide the UI if in TV mode.
  const isTvModeActive = document.fullscreenElement !== null; // Rough heuristic

  useEffect(() => {
    if (audioTracks.length > 0 && !audioRef.current) {
      audioRef.current = new Audio(audioTracks[0].mediaUrl);
      
      audioRef.current.addEventListener("timeupdate", () => {
        if (audioRef.current) {
          setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
        }
      });
      
      audioRef.current.addEventListener("ended", () => {
        handleNext();
      });
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, [audioTracks]);

  const togglePlay = () => {
    if (!audioRef.current || audioTracks.length === 0) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Playback blocked", e));
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (!audioRef.current || audioTracks.length === 0) return;
    const nextIndex = (currentIndex + 1) % audioTracks.length;
    setCurrentIndex(nextIndex);
    
    const wasPlaying = !audioRef.current.paused;
    audioRef.current.src = audioTracks[nextIndex].mediaUrl;
    audioRef.current.load();
    
    if (wasPlaying) {
      audioRef.current.play().catch(e => console.error(e));
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  if (audioTracks.length === 0 || isTvModeActive) return null;

  const currentTrack = audioTracks[currentIndex];

  return (
    <div className="fixed bottom-6 left-6 z-[90] font-['Tajawal']" dir="rtl">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`absolute bottom-16 right-0 w-72 rounded-3xl overflow-hidden shadow-2xl border ${
              dark 
                ? "bg-black/60 backdrop-blur-2xl border-white/10" 
                : "bg-white/70 backdrop-blur-2xl border-black/10"
            }`}
          >
            {/* Visualizer / Header */}
            <div className="relative h-24 overflow-hidden bg-gradient-to-r from-[#08467d] to-[#0e6cbd]">
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
              {currentTrack.coverUrl && (
                <img src={currentTrack.coverUrl} className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay blur-sm" alt="" />
              )}
              
              <button onClick={() => setIsOpen(false)} className="absolute top-3 left-3 text-white/70 hover:text-white p-1 rounded-full bg-black/20">
                <X size={14} />
              </button>
              
              <div className="absolute bottom-3 right-4 left-4">
                <span className="text-[9px] font-black tracking-widest text-[#f8ca14] bg-black/40 px-2 py-0.5 rounded-full inline-block mb-1">
                  {currentTrack.category || "العقيق أوديو"}
                </span>
                <p className="text-sm font-black text-white truncate drop-shadow-md">
                  {currentTrack.title}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className={`p-4 ${dark ? "bg-black/40" : "bg-white/40"}`}>
              {/* Progress Bar */}
              <div className="h-1 w-full bg-black/10 dark:bg-white/10 rounded-full mb-4 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-l from-[#f8ca14] to-[#e5b84f] transition-all duration-1000 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <button onClick={toggleMute} className={`p-2 rounded-full transition ${dark ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-slate-500 hover:text-black hover:bg-black/5"}`}>
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleNext}
                    className={`p-2 rounded-full transition ${dark ? "text-slate-300 hover:text-white hover:bg-white/10" : "text-slate-700 hover:text-black hover:bg-black/10"}`}
                  >
                    <SkipForward size={20} />
                  </button>
                  
                  <button 
                    onClick={togglePlay}
                    className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-r from-[#f8ca14] to-[#e5b84f] text-black shadow-lg shadow-[#f8ca14]/20 hover:scale-105 transition-transform"
                  >
                    {isPlaying ? <Pause size={20} className="fill-black" /> : <Play size={20} className="fill-black ml-1" />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative grid h-14 w-14 place-items-center rounded-full border-2 shadow-2xl transition-colors ${
          isPlaying 
            ? "border-[#f8ca14] bg-gradient-to-tr from-[#08467d] to-[#121212] text-[#f8ca14]"
            : dark
              ? "border-white/10 bg-[#111] text-slate-400 hover:text-white"
              : "border-black/5 bg-white text-slate-600 hover:text-black"
        }`}
      >
        {isPlaying && (
          <span className="absolute -inset-2 animate-spin rounded-full border border-dashed border-[#f8ca14]/30" />
        )}
        <RadioIcon size={24} className={isPlaying ? "animate-pulse" : ""} />
        
        {/* Unread dot / Status indicator */}
        <span className={`absolute top-0 right-0 h-3 w-3 rounded-full border-2 border-black ${isPlaying ? "bg-emerald-500" : "bg-[#f8ca14]"}`} />
      </motion.button>
    </div>
  );
}
