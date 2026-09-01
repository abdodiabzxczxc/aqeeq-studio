import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize, Minimize, X, ScanQrCode, Clock as ClockIcon, AlertCircle, Sparkles, Megaphone } from "lucide-react";
import QRCode from "qrcode";
import { trpc } from "@/lib/trpc";

type AlbumImage = {
  id: number;
  url: string;
  caption?: string | null;
};

type AqeeqAlbumTvModeProps = {
  albumTitle: string;
  images: AlbumImage[];
  onClose: () => void;
};

export function AqeeqAlbumTvMode({ albumTitle, images, onClose }: AqeeqAlbumTvModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Live Broadcast Interruption
  const { data: broadcast } = trpc.executiveAdmin.getBroadcast.useQuery(undefined, {
    refetchInterval: 3000, // Poll every 3 seconds for instant TV interruption
    refetchOnWindowFocus: false,
  });
  const hasActiveBroadcast = broadcast?.enabled && broadcast?.message;
  
  const SLIDE_DURATION = 8000; // 8 seconds per slide

  // Handle Fullscreen
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Handle Slideshow
  useEffect(() => {
    if (images.length <= 1 || hasActiveBroadcast) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [images.length, hasActiveBroadcast]);

  // Handle Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Generate QR Code for the current page URL
  useEffect(() => {
    const generateQR = async () => {
      try {
        const url = window.location.href;
        const dataUrl = await QRCode.toDataURL(url, {
          color: { dark: "#000000", light: "#ffffff" },
          margin: 1,
          width: 120,
        });
        setQrCodeDataUrl(dataUrl);
      } catch (err) {
        console.error("QR Generation failed", err);
      }
    };
    generateQR();
  }, []);

  if (!images || images.length === 0) {
    return (
      <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col items-center justify-center font-['Tajawal']" dir="rtl">
        <h1 className="text-3xl font-black mb-4">لا توجد صور لعرضها</h1>
        <p className="text-white/60 mb-8">الألبوم الحالي فارغ أو لا يحتوي على صور (فقط فيديوهات).</p>
        <button 
          onClick={onClose}
          className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl backdrop-blur-md border border-white/20 transition font-black"
        >
          العودة
        </button>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-black text-white overflow-hidden flex flex-col font-['Tajawal']"
      dir="rtl"
    >
      {/* Ambient Blurred Background */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={`bg-${currentIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 z-0"
        >
          <img 
            src={currentImage.url} 
            alt="" 
            className="w-full h-full object-cover blur-3xl scale-110 saturate-150 opacity-40"
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-black/40 z-0" />

      {/* Main Image with Ken Burns Effect */}
      <div className="absolute inset-0 z-10 flex items-center justify-center p-12 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={`img-${currentIndex}`}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ 
              opacity: { duration: 1.5 },
              scale: { duration: SLIDE_DURATION / 1000, ease: "linear" } 
            }}
            className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10"
          >
            <img 
              src={currentImage.url} 
              alt={currentImage.caption || ""} 
              className="w-full h-full object-contain bg-black/50 backdrop-blur-sm"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Top Bar: Golden Progress Line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/10 z-50">
        <motion.div 
          key={`progress-${currentIndex}`}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
          className="h-full bg-gradient-to-r from-[#e5b84f] to-[#f8ca14] shadow-[0_0_10px_#e5b84f]"
        />
      </div>

      {/* Top Header Information */}
      <div className="absolute top-6 left-8 right-8 z-50 flex justify-between items-start pointer-events-none">
        {/* Right side: Logo & Event Name */}
        <div className="flex items-center gap-4">
          <img src="/alaqeeq-logo.png" alt="العقيق" className="h-12 w-auto object-contain brightness-0 invert drop-shadow-md" />
          <div>
            <span className="text-[10px] font-black tracking-widest text-[#e5b84f] uppercase drop-shadow-md">بث مباشر - حصاد الفعاليات</span>
            <h1 className="text-2xl font-black drop-shadow-lg max-w-xl truncate">{albumTitle}</h1>
          </div>
        </div>

        {/* Left side: Clock */}
        <div className="flex items-center gap-2 text-white/90 drop-shadow-md bg-black/30 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
          <ClockIcon size={18} className="text-[#e5b84f]" />
          <span className="text-xl font-bold font-mono tracking-wider">
            {currentTime.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>

      {/* Bottom Bar Cinematic UI */}
      <div className="absolute bottom-0 left-0 right-0 z-50 p-8 pt-24 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none flex items-end justify-between">
        
        {/* Image Caption */}
        <div className="max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={`caption-${currentIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 1 }}
            >
              {currentImage.caption ? (
                <p className="text-3xl font-bold leading-relaxed text-white/90 drop-shadow-xl border-r-4 border-[#e5b84f] pr-4">
                  {currentImage.caption}
                </p>
              ) : (
                <p className="text-xl font-medium text-white/50 italic pr-4">لحظات منتقاة من {albumTitle}</p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* QR Code Anchor */}
        <div className="flex flex-col items-center gap-3 bg-black/40 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-2xl pointer-events-auto">
          <div className="bg-white p-2 rounded-2xl shadow-inner">
            {qrCodeDataUrl ? (
              <img src={qrCodeDataUrl} alt="QR Code" className="w-24 h-24 object-contain" />
            ) : (
              <div className="w-24 h-24 bg-slate-200 animate-pulse rounded-xl" />
            )}
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-[#e5b84f] mb-1">
              <ScanQrCode size={14} />
              <span className="text-[10px] font-black">احصل على الألبوم</span>
            </div>
            <p className="text-[10px] text-white/60 font-bold max-w-[100px]">امسح الكود بكاميرا الجوال لعرض الصور</p>
          </div>
        </div>
      </div>

      {/* EMERGENCY BROADCAST OVERLAY */}
      <AnimatePresence>
        {hasActiveBroadcast && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className={`absolute inset-0 z-[80] flex flex-col items-center justify-center p-12 text-center ${
              broadcast.type === "urgent" 
                ? "bg-red-700/95" 
                : broadcast.type === "celebration"
                ? "bg-[#d4af37]/95"
                : "bg-[#08467d]/95"
            } backdrop-blur-3xl`}
          >
            {/* Pulsing background effect */}
            <motion.div 
              animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2),transparent_60%)] pointer-events-none"
            />
            
            <div className="relative z-10 max-w-5xl">
              <div className="mb-8 flex justify-center">
                <div className={`p-6 rounded-full bg-white/20 shadow-2xl border-4 ${
                  broadcast.type === "urgent" ? "border-white animate-pulse" : "border-white/50"
                }`}>
                  {broadcast.type === "urgent" ? <AlertCircle size={80} className="text-white" /> : 
                   broadcast.type === "celebration" ? <Sparkles size={80} className="text-white" /> : 
                   <Megaphone size={80} className="text-white" />}
                </div>
              </div>
              
              <h2 className="text-2xl font-black text-white/80 tracking-widest mb-6 uppercase">
                {broadcast.type === "urgent" ? "تنبيه عاجل" : 
                 broadcast.type === "celebration" ? "إعلان تهنئة" : "إشعار هام"}
              </h2>
              
              <p className="text-6xl md:text-8xl font-black text-white leading-tight drop-shadow-2xl">
                {broadcast.message}
              </p>
              
              {broadcast.link && (
                <div className="mt-12">
                  <span className="inline-block px-8 py-4 bg-black/30 rounded-full text-white text-2xl font-bold border border-white/20">
                    امسح الرمز أو تفضل بزيارة الرابط المرفق للمزيد من التفاصيل
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Tools (Visible on hover) */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 opacity-0 hover:opacity-100 transition-opacity duration-300">
        <button 
          onClick={toggleFullScreen}
          className="bg-black/50 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-md border border-white/20 transition"
          title="ملء الشاشة"
        >
          {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
        <button 
          onClick={onClose}
          className="bg-red-500/50 hover:bg-red-500/80 text-white p-3 rounded-full backdrop-blur-md border border-white/20 transition"
          title="إغلاق العرض"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
