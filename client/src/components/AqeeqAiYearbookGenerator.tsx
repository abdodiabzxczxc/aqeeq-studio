import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sparkles, GraduationCap, Play, Download, X, Film, Image as ImageIcon, CheckCircle, ChevronLeft, Loader2, Share2 } from "lucide-react";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { getAqeeqAlbumImageSource, getAqeeqDriveFileId } from "@/lib/aqeeqAlbumMedia";
import { toast } from "sonner";

/** تحوّل أي رابط Drive إلى البروكسي السريع */
function resolveImageUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith("/api/drive-proxy/")) return url;
  const fileId = getAqeeqDriveFileId(url);
  if (fileId) return `/api/drive-proxy/${fileId}`;
  return url;
}

export function AqeeqAiYearbookGenerator({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";
  
  const [studentPhoto, setStudentPhoto] = useState<string | null>(null);
  const [stage, setStage] = useState<"input" | "processing" | "cinematic">("input");
  const [progress, setProgress] = useState(0);
  const [isExportingVideo, setIsExportingVideo] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Fetch media for cinematic simulation (always enabled so it's ready when they click)
  const { data: allMediaDetails } = trpc.aqeeqAlbums.allPublicMedia.useQuery(undefined, { refetchOnWindowFocus: false });
  // Always route through the fast proxy
  const photos = (allMediaDetails || []).map(m => resolveImageUrl(m.imageUrl));

  // Cinematic State
  const [sceneIndex, setSceneIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Matched photos state for the cinematic video
  const [matchedPhotos, setMatchedPhotos] = useState<string[]>([]);
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape");

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setStudentPhoto(url);
  };

  const handleStartSearch = async () => {
    if (!studentPhoto) return;
    setStage("processing");
    setProgress(10);
    
    let finalPhotos = photos;
    
    try {
      if (photos.length > 0) {
        const { matchSelfieAgainstPhotos } = await import("@/lib/aqeeqFaceRecognition");
        setProgress(30);
        
        const mediaObjects = (allMediaDetails || []).map(m => ({
          id: m.id,
          imageUrl: resolveImageUrl(m.imageUrl)
        }));
        
        const matches = await matchSelfieAgainstPhotos(studentPhoto, mediaObjects, (scanned, total) => {
          setProgress(30 + Math.floor((scanned / total) * 60));
        });
        
        if (matches && matches.length > 0) {
          finalPhotos = matches.map(m => resolveImageUrl(m.photo.imageUrl));
        }
      }
    } catch (e) {
      console.warn("AI Match failed, using all photos:", e);
    }
    
    setProgress(92);
    
    // Determine orientation from first few images
    let vCount = 0, hCount = 0;
    await Promise.all(finalPhotos.slice(0, 6).map(url => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => { if (img.naturalHeight > img.naturalWidth) vCount++; else hCount++; resolve(null); };
      img.onerror = resolve;
      img.src = url;
    })));
    setOrientation(vCount > hCount ? "portrait" : "landscape");

    // Preload first 12 cinematic photos so they appear instantly
    const toPreload = (finalPhotos.length > 0 ? finalPhotos : photos).slice(0, 12);
    await Promise.allSettled(toPreload.map(url => new Promise((resolve) => {
      const img = new Image(); img.onload = resolve; img.onerror = resolve; img.src = url;
    })));

    setProgress(100);
    setMatchedPhotos(finalPhotos.length > 0 ? finalPhotos : photos);
    setTimeout(() => startCinematic(), 400);
  };

  const startCinematic = () => {
    setStage("cinematic");
    setSceneIndex(0);
    if (!audioRef.current) {
      audioRef.current = new Audio("https://cdn.pixabay.com/download/audio/2022/10/25/audio_24a242488a.mp3?filename=cinematic-epic-122933.mp3");
      audioRef.current.volume = 0.5;
    }
    audioRef.current.play().catch(() => console.log("Audio blocked"));
    
    // Balanced cinematic timeline
    setTimeout(() => setSceneIndex(1), 2500);  // 2.5s: text scene 2
    setTimeout(() => setSceneIndex(2), 5000);  // 5.0s: continuous Ken Burns montage starts
    setTimeout(() => setSceneIndex(3), 21500); // 21.5s: climax logo (8 photos × 2.0s + buffer)
  };

  // Helper to draw image maintaining aspect ratio with object-fit: cover and zoom scale
  const drawImageCover = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number, scale: number) => {
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = w / h;
    let renderW = w;
    let renderH = h;
    if (imgRatio > canvasRatio) {
      renderH = h;
      renderW = h * imgRatio;
    } else {
      renderW = w;
      renderH = w / imgRatio;
    }
    renderW *= scale;
    renderH *= scale;
    const offsetX = (w - renderW) / 2;
    const offsetY = (h - renderH) / 2;
    ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
  };

  // Helper to pre-render 1080p crisp Arabic title cards using SVG Base64 (Never taints canvas)
  const createArabicTitleCard = (
    title: string,
    subtitle: string,
    width: number,
    height: number,
    theme: "gold" | "blue" | "climax"
  ): Promise<HTMLImageElement> => {
    return new Promise((resolve) => {
      const isPortrait = height > width;
      const titleSize = isPortrait ? 52 : 72;
      const subSize = isPortrait ? 58 : 82;
      const glowColor = theme === "blue" ? "rgba(77,161,235,0.8)" : "rgba(229,184,79,0.8)";

      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
          <defs>
            <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="6" stdDeviation="20" flood-color="${glowColor}" flood-opacity="0.9" />
            </filter>
          </defs>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@900&amp;family=Tajawal:wght@900&amp;display=swap');
            .t1 { font-family: 'Cairo', 'Tajawal', 'Segoe UI', Tahoma, sans-serif; font-size: ${titleSize}px; font-weight: 900; fill: #ffffff; text-anchor: middle; }
            .t2 { font-family: 'Cairo', 'Tajawal', 'Segoe UI', Tahoma, sans-serif; font-size: ${subSize}px; font-weight: 900; fill: #f8ca14; text-anchor: middle; }
            .cap { font-size: ${isPortrait ? 90 : 120}px; text-anchor: middle; }
          </style>
          ${theme === "climax" ? `<text x="${width / 2}" y="${height / 2 - 110}" class="cap">🎓</text>` : ""}
          <text x="${width / 2}" y="${theme === "climax" ? height / 2 : height / 2 - 50}" class="t1" filter="url(#glow)">${title}</text>
          <text x="${width / 2}" y="${theme === "climax" ? height / 2 + 80 : height / 2 + 65}" class="t2" filter="url(#glow)">${subtitle}</text>
        </svg>
      `;

      const encoded = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(img);
      img.src = encoded;
    });
  };

  // Export 1080p Full HD Studio Video with seamless overlapping timeline (Zero cuts, Zero freeze)
  const handleExportVideo = async () => {
    if (isExportingVideo) return;
    setIsExportingVideo(true);
    setExportProgress(5);

    try {
      if (typeof document !== "undefined" && (document as any).fonts) {
        await (document as any).fonts.ready;
      }

      // 1080p Full HD Resolution (1920x1080 or 1080x1920)
      const isPortrait = orientation === "portrait";
      const width = isPortrait ? 1080 : 1920;
      const height = isPortrait ? 1920 : 1080;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) {
        toast.error("تعذر إنشاء بيئة تصدير الفيديو");
        setIsExportingVideo(false);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // 1. Preload 1080p HD title cards
      const [scene1Card, scene2Card, scene4Card] = await Promise.all([
        createArabicTitleCard("في كل عام،", "تُكتب قصة جديدة...", width, height, "gold"),
        createArabicTitleCard("وهذا العام...", "كانت الكاميرا تبحث عنك!", width, height, "blue"),
        createArabicTitleCard("مدارس العقيق تفخر بك", "أنت بطل قصتنا 🌟", width, height, "climax"),
      ]);

      setExportProgress(15);

      // 2. Preload student photos
      const photoUrls = matchedPhotos.slice(0, 8);
      const loadedImages: HTMLImageElement[] = [];

      for (let idx = 0; idx < photoUrls.length; idx++) {
        const url = photoUrls[idx];
        try {
          const img = new Image();
          img.crossOrigin = "anonymous";
          await new Promise((res) => {
            img.onload = res;
            img.onerror = () => res(null);
            img.src = url;
          });
          if (img.naturalWidth > 0) loadedImages.push(img);
        } catch {}
        setExportProgress(15 + Math.floor(((idx + 1) / Math.max(1, photoUrls.length)) * 20));
      }

      // 3. Setup 60 FPS 1080p stream at 16 Mbps high bitrate
      const fps = 60;
      const stream = canvas.captureStream(fps);

      const mimeTypes = [
        "video/mp4;codecs=avc1",
        "video/mp4;codecs=h264",
        "video/mp4",
        "video/webm;codecs=h264",
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
      ];
      const supportedMime = mimeTypes.find((t) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) || "video/webm";

      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(stream, { mimeType: supportedMime, videoBitsPerSecond: 16000000 }); // 16 Mbps 1080p
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      // 4. Build Continuous Multi-Track Overlapping Timeline
      type TimelineTrack = {
        startTime: number;
        endTime: number;
        fadeInDuration: number;
        fadeOutDuration: number;
        zoomIn: boolean;
        render: (ctx: CanvasRenderingContext2D, alpha: number, scale: number) => void;
      };

      const tracks: TimelineTrack[] = [];
      let cursor = 0;

      // Track 1: Intro Scene 1 (0.0s to 3.0s, fade in 0.6s, fade out 0.8s)
      tracks.push({
        startTime: cursor,
        endTime: cursor + 3.0,
        fadeInDuration: 0.6,
        fadeOutDuration: 0.8,
        zoomIn: true,
        render: (c, a, s) => {
          c.save();
          c.globalAlpha = a;
          c.translate(width / 2, height / 2);
          c.scale(s, s);
          const halo = c.createRadialGradient(0, 0, 10, 0, 0, width * 0.45);
          halo.addColorStop(0, "rgba(229,184,79,0.25)");
          halo.addColorStop(1, "rgba(0,0,0,0)");
          c.fillStyle = halo;
          c.fillRect(-width / 2, -height / 2, width, height);
          c.drawImage(scene1Card, -width / 2, -height / 2, width, height);
          c.restore();
        },
      });

      // Track 2: Intro Scene 2 (starts at 2.4s, overlaps 0.6s with Intro 1, lasts to 5.4s)
      cursor = 2.4;
      tracks.push({
        startTime: cursor,
        endTime: cursor + 3.0,
        fadeInDuration: 0.8,
        fadeOutDuration: 0.8,
        zoomIn: false,
        render: (c, a, s) => {
          c.save();
          c.globalAlpha = a;
          c.translate(width / 2, height / 2);
          c.scale(s, s);
          const halo = c.createRadialGradient(0, 0, 10, 0, 0, width * 0.45);
          halo.addColorStop(0, "rgba(77,161,235,0.28)");
          halo.addColorStop(1, "rgba(0,0,0,0)");
          c.fillStyle = halo;
          c.fillRect(-width / 2, -height / 2, width, height);
          c.drawImage(scene2Card, -width / 2, -height / 2, width, height);
          c.restore();
        },
      });

      // Photo Tracks: each photo lasts 2.8s, with 0.8s overlap with next photo
      cursor = 4.8;
      const photoSlideInterval = 2.0; // Next photo starts every 2.0s
      const photoLifespan = 2.8; // 2.8s total lifespan = 0.8s overlap with next!

      loadedImages.forEach((img, idx) => {
        const pStart = cursor + idx * photoSlideInterval;
        const pEnd = pStart + photoLifespan;
        const zoomIn = idx % 2 === 0;

        tracks.push({
          startTime: pStart,
          endTime: pEnd,
          fadeInDuration: 0.8,
          fadeOutDuration: idx === loadedImages.length - 1 ? 0.9 : 0.8,
          zoomIn,
          render: (c, a, s) => {
            c.save();
            c.globalAlpha = a;
            drawImageCover(c, img, width, height, s);

            // Ambient Cinema Vignette
            const grad = c.createRadialGradient(width / 2, height / 2, width * 0.2, width / 2, height / 2, width * 0.75);
            grad.addColorStop(0, "rgba(0,0,0,0)");
            grad.addColorStop(1, "rgba(0,0,0,0.7)");
            c.fillStyle = grad;
            c.fillRect(0, 0, width, height);
            c.restore();
          },
        });
      });

      // Climax Scene: starts overlapping 0.8s before the last photo finishes
      const lastPhotoEnd = cursor + Math.max(1, loadedImages.length - 1) * photoSlideInterval + photoLifespan;
      const climaxStart = lastPhotoEnd - 0.8;
      const climaxDuration = 4.0;

      tracks.push({
        startTime: climaxStart,
        endTime: climaxStart + climaxDuration,
        fadeInDuration: 0.9,
        fadeOutDuration: 0.5,
        zoomIn: true,
        render: (c, a, s) => {
          c.save();
          c.globalAlpha = a;
          c.translate(width / 2, height / 2);
          c.scale(s, s);
          const halo = c.createRadialGradient(0, 0, 10, 0, 0, width * 0.45);
          halo.addColorStop(0, "rgba(229,184,79,0.3)");
          halo.addColorStop(1, "rgba(0,0,0,0)");
          c.fillStyle = halo;
          c.fillRect(-width / 2, -height / 2, width, height);
          c.drawImage(scene4Card, -width / 2, -height / 2, width, height);
          c.restore();
        },
      });

      const totalSeconds = climaxStart + climaxDuration;
      const totalFrames = Math.floor(totalSeconds * fps);

      recorder.start(500);

      let currentFrame = 0;
      const frameStepMs = 1000 / fps;

      // Smooth cosine interpolation function (no linear robotic cuts)
      const smoothEase = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * Math.max(0, Math.min(1, t)));

      const renderLoop = async () => {
        while (currentFrame < totalFrames) {
          const currentTime = currentFrame / fps;

          // Clear frame to deep black
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, width, height);

          // Render all active tracks in z-order
          for (let i = 0; i < tracks.length; i++) {
            const track = tracks[i];
            if (currentTime >= track.startTime && currentTime <= track.endTime) {
              const age = currentTime - track.startTime;
              const lifespan = track.endTime - track.startTime;

              // Calculate smooth continuous alpha with cosine ease
              let alpha = 1.0;
              if (age < track.fadeInDuration) {
                alpha = smoothEase(age / track.fadeInDuration);
              } else if (age > lifespan - track.fadeOutDuration) {
                alpha = smoothEase((lifespan - age) / track.fadeOutDuration);
              }

              // Calculate continuous smooth scale (moves for the entire lifespan)
              const progress = age / lifespan;
              const scale = track.zoomIn ? 1.0 + progress * 0.14 : 1.14 - progress * 0.14;

              if (alpha > 0.001) {
                track.render(ctx, alpha, scale);
              }
            }
          }

          currentFrame++;
          setExportProgress(35 + Math.floor((currentFrame / totalFrames) * 60));
          await new Promise((r) => setTimeout(r, frameStepMs));
        }

        recorder.requestData();
        await new Promise((res) => {
          recorder.onstop = res;
          recorder.stop();
        });

        const fileBlob = new Blob(chunks, { type: supportedMime });
        if (fileBlob.size > 0) {
          const url = URL.createObjectURL(fileBlob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `حصاد-العقيق-الذكي-1080p-${new Date().getFullYear()}.mp4`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          setExportProgress(100);
          setIsExportingVideo(false);
          toast.success("تم تجهيز وتحميل الفيديو التوثيقي بجودة 1080p Full HD بنجاح! 🎬✨");
        } else {
          throw new Error("Empty video blob");
        }
      };

      renderLoop();
    } catch (err) {
      console.error("Video export error:", err);
      toast.error("حدث خطأ أثناء تصدير الفيديو، يرجى المحاولة مرة أخرى");
      setIsExportingVideo(false);
    }
  };


  const closeWrapped = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    onOpenChange(false);
    setTimeout(() => {
      setStage("input");
      setStudentPhoto(null);
      setProgress(0);
      setIsExportingVideo(false);
      setExportProgress(0);
    }, 500);
  };


  // Determine dynamic classes based on stage and orientation
  // We MUST use sm:max-w-* to override the default sm:max-w-lg in shadcn DialogContent!
  let dialogShapeClasses = "max-w-4xl sm:max-w-4xl w-[95vw] sm:w-full h-[90vh] md:h-[85vh]"; // Default for input/processing
  if (stage === "cinematic") {
    if (orientation === "portrait") {
      dialogShapeClasses = "max-w-[450px] sm:max-w-[450px] w-[95vw] sm:w-full h-[90vh] md:h-[85vh]"; // Tall phone shape
    } else {
      dialogShapeClasses = "max-w-6xl sm:max-w-6xl w-[95vw] sm:w-full aspect-[16/9] h-auto max-h-[90vh] md:h-[85vh]"; // Wide cinematic shape
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if(!v) closeWrapped(); }}>
      <DialogContent 
        className={`${dialogShapeClasses} border-0 p-0 overflow-hidden rounded-[32px] shadow-2xl transition-all duration-1000 ease-in-out ${
          dark 
            ? "bg-[#050505] text-white shadow-[0_0_80px_rgba(229,184,79,0.15)]" 
            : "bg-white text-black shadow-[0_30px_80px_rgba(0,0,0,0.15)]"
        }`}
        dir="rtl"
      >
        <button onClick={closeWrapped} className="absolute top-6 left-6 z-[100] text-white/50 hover:text-white bg-black/20 p-2 rounded-full backdrop-blur-sm">
          <X size={24} />
        </button>

        <AnimatePresence mode="wait">
          {/* STAGE 1: INPUT */}
          {stage === "input" && (
            <motion.div 
              key="input"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"
            >
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_50%_0%,#e5b84f_0%,transparent_70%)] pointer-events-none" />
              
              <div className="relative z-10 text-center max-w-lg w-full">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-[#e5b84f] to-[#c59c3a] text-black shadow-2xl shadow-[#e5b84f]/30 mb-8 transform hover:scale-105 transition-transform duration-500">
                  <Sparkles size={48} strokeWidth={1.5} />
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight font-['Tajawal'] mb-4 bg-clip-text text-transparent bg-gradient-to-l from-[#f8ca14] to-[#f8ca14]/70">
                  حصاد العقيق الذكي
                </h1>
                <p className={`text-lg mb-12 ${dark ? "text-white/60" : "text-black/60"}`}>
                  ارفع صورة للطالب، وسيقوم الذكاء الاصطناعي بالبحث في آلاف الصور، ليجمع كل لحظاته وإنجازاته في رحلة سينمائية مذهلة.
                </p>
                
                <div className="flex flex-col gap-4 items-center">
                  {!studentPhoto ? (
                    <label className="cursor-pointer group relative overflow-hidden rounded-2xl bg-black/5 dark:bg-white/5 border border-dashed border-black/20 dark:border-white/20 hover:border-[#e5b84f] transition-colors w-full h-32 flex flex-col items-center justify-center">
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                      <ImageIcon size={32} className="text-[#e5b84f] mb-3 group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-lg">التقط أو ارفع صورة للطالب</span>
                    </label>
                  ) : (
                    <div className="w-full flex flex-col sm:flex-row gap-3">
                      <div className="relative h-16 w-16 sm:w-20 rounded-2xl overflow-hidden shrink-0 border-2 border-[#e5b84f]">
                        <img src={studentPhoto} className="w-full h-full object-cover" alt="Student" />
                        <button 
                          onClick={() => setStudentPhoto(null)} 
                          className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"
                        >
                          <X size={12} />
                        </button>
                      </div>
                      <Button 
                        onClick={handleStartSearch}
                        className="flex-1 h-16 rounded-2xl bg-gradient-to-r from-[#e5b84f] to-[#c59c3a] hover:from-[#f0c35f] hover:to-[#d0a74b] text-black font-black text-xl shadow-xl shadow-[#e5b84f]/25 transition-all active:scale-95"
                      >
                        ابدأ الرحلة السينمائية
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* STAGE 2: PROCESSING */}
          {stage === "processing" && (
            <motion.div 
              key="processing"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-black text-white"
            >
              <GraduationCap size={64} className="text-[#e5b84f] mb-8 animate-pulse" />
              <h2 className="text-2xl font-black mb-8 font-['Tajawal']">جارِ البحث باستخدام الذكاء الاصطناعي...</h2>
              <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-l from-[#e5b84f] to-[#e5b84f]/50 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-4 text-white/50 text-sm">{progress < 40 ? "مسح آلاف الصور في قاعدة البيانات..." : progress < 80 ? "تحليل الوجوه ومطابقة الطالب..." : "تجهيز رحلة العمر..."}</p>
            </motion.div>
          )}

          {/* STAGE 5: CINEMATIC */}
          {stage === "cinematic" && (
            <motion.div 
              key="cinematic"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black text-white flex items-center justify-center overflow-hidden"
            >
              {/* Scene 1: Intro Text 1 (Continuous Slow Zoom In) */}
              <AnimatePresence>
                {sceneIndex === 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1.04 }}
                    exit={{ opacity: 0, scale: 1.08 }}
                    transition={{
                      opacity: { duration: 0.6, ease: "easeInOut" },
                      scale: { duration: 2.8, ease: "linear" },
                    }}
                    className="absolute inset-0 flex items-center justify-center text-center px-6"
                  >
                    <div className="relative">
                      {/* Ambient Golden Halo behind text */}
                      <div className="absolute -inset-10 bg-[radial-gradient(circle_at_center,rgba(229,184,79,0.15),transparent_70%)] pointer-events-none" />
                      <h2 className="text-4xl md:text-6xl font-black tracking-wider leading-relaxed drop-shadow-md">في كل عام،</h2>
                      <h2 className="text-4xl md:text-6xl font-black tracking-wider leading-relaxed text-[#e5b84f] drop-shadow-[0_0_25px_rgba(229,184,79,0.4)]">تُكتب قصة جديدة...</h2>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Scene 2: Intro Text 2 (Continuous Slow Zoom Out) */}
              <AnimatePresence>
                {sceneIndex === 1 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 1.06 }}
                    animate={{ opacity: 1, scale: 0.98 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{
                      opacity: { duration: 0.6, ease: "easeInOut" },
                      scale: { duration: 2.8, ease: "linear" },
                    }}
                    className="absolute inset-0 flex items-center justify-center text-center px-6"
                  >
                    <div className="relative">
                      {/* Ambient Blue-Cyan Halo */}
                      <div className="absolute -inset-12 bg-[radial-gradient(circle_at_center,rgba(77,161,235,0.2),transparent_70%)] pointer-events-none" />
                      <h2 className="text-5xl md:text-8xl font-black drop-shadow-[0_0_35px_rgba(255,255,255,0.35)]">وهذا العام...</h2>
                      <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#e5b84f] via-[#f8ca14] to-[#f8ca14] mt-4 drop-shadow-[0_0_20px_rgba(248,202,20,0.4)]">كانت الكاميرا تبحث عنك!</h2>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Scene 3: CONTINUOUS KEN BURNS MONTAGE (Zero Freeze) */}
              <AnimatePresence>
                {sceneIndex === 2 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
                    {/* 8 photos with continuous Ken Burns motion that NEVER stops while on screen */}
                    {matchedPhotos.slice(0, 8).map((url, i) => {
                      const zoomIn = i % 2 === 0;
                      const slideInterval = 2.0; // 2 seconds between slides
                      const motionDuration = 3.2; // 3.2s continuous motion — lasts past the next slide's entrance so it NEVER freezes!
                      
                      return (
                        <motion.div
                          key={i}
                          initial={{
                            opacity: 0,
                            scale: zoomIn ? 1.0 : 1.14,
                          }}
                          animate={{
                            opacity: 1,
                            scale: zoomIn ? 1.14 : 1.0,
                          }}
                          exit={{ opacity: 0 }}
                          transition={{
                            opacity: { duration: 0.6, delay: i * slideInterval, ease: "easeInOut" },
                            scale: { duration: motionDuration, delay: i * slideInterval, ease: "linear" },
                          }}
                          className="absolute inset-0 bg-black"
                          style={{ zIndex: i }}
                        >
                          <img
                            src={url}
                            className="w-full h-full object-cover"
                            alt=""
                            loading="eager"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                          />
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.75)_100%)] pointer-events-none" />
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Scene 4: Climax (Continuous Slow Breathing Motion & Glow) */}
              <AnimatePresence>
                {sceneIndex === 3 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1.03 }}
                    transition={{
                      opacity: { duration: 0.8, ease: "easeOut" },
                      scale: { duration: 8.0, ease: "linear" },
                    }}
                    className="absolute inset-0 bg-black flex flex-col items-center justify-center z-30 overflow-hidden"
                  >
                    {/* Ambient Glow */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(229,184,79,0.18),transparent_65%)] pointer-events-none" />

                    <div className="relative mb-8 flex items-center justify-center">
                      <div className="absolute -inset-6 bg-gradient-to-r from-[#e5b84f] to-amber-600 rounded-full blur-2xl opacity-40 animate-pulse" />
                      <GraduationCap size={100} className="text-[#e5b84f] relative z-10 drop-shadow-[0_0_30px_rgba(229,184,79,0.7)]" />
                    </div>

                    <h1 className="text-4xl md:text-7xl font-black font-['Tajawal'] text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-white drop-shadow-2xl mb-4 text-center">
                      مدارس العقيق تفخر بك
                    </h1>
                    <p className="text-[#e5b84f] text-xl md:text-2xl font-bold tracking-widest mb-10 drop-shadow-lg">
                      أنت بطل قصتنا 🌟
                    </p>

                    {/* Actions Group */}
                    <div className="flex flex-col sm:flex-row items-center gap-3.5 z-40">
                      {/* Download Video Button */}
                      <Button
                        onClick={handleExportVideo}
                        disabled={isExportingVideo}
                        className="rounded-full h-14 px-8 bg-gradient-to-r from-[#e5b84f] via-[#f8ca14] to-[#c59c3a] hover:from-[#f0c35f] hover:to-[#d0a74b] text-black font-black text-base shadow-2xl shadow-[#e5b84f]/40 transition-all active:scale-95 flex items-center gap-2.5"
                      >
                        {isExportingVideo ? (
                          <>
                            <Loader2 size={20} className="animate-spin text-black" />
                            <span>جاري تصدير الفيديو... {exportProgress}%</span>
                          </>
                        ) : (
                          <>
                            <Download size={20} className="text-black" />
                            <span>تحميل الفيديو التوثيقي (MP4) 🎬</span>
                          </>
                        )}
                      </Button>

                      {/* Share Button */}
                      <Button
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: "حصاد العقيق الذكي 2026",
                              text: "شاهد لحظاتي وإنجازاتي في حصاد العقيق الذكي 🌟",
                              url: window.location.href,
                            }).catch(() => {});
                          } else {
                            navigator.clipboard.writeText(window.location.href);
                            toast.success("تم نسخ رابط المنصة للمشاركة 📋");
                          }
                        }}
                        className="rounded-full h-14 px-6 bg-white/10 hover:bg-white/20 text-white font-bold text-base backdrop-blur-md border border-white/20 transition-all active:scale-95 flex items-center gap-2"
                      >
                        <Share2 size={18} />
                        <span>مشاركة</span>
                      </Button>

                      {/* Close Button */}
                      <Button
                        onClick={closeWrapped}
                        variant="ghost"
                        className="rounded-full h-14 px-6 text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm font-bold"
                      >
                        إنهاء العرض ✨
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
