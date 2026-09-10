import React, { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { X, Sparkles, ExternalLink, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AqeeqEventModal() {
  const { data: orchestration } = trpc.executiveAdmin.getSiteOrchestration.useQuery(undefined, {
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  const [isOpen, setIsOpen] = useState(false);

  const eventModal = (orchestration as any)?.eventModal;

  useEffect(() => {
    if (!eventModal?.enabled || !eventModal?.title) {
      setIsOpen(false);
      return;
    }

    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem("aqeeq_event_modal_dismissed");
    if (!dismissed) {
      // Small delay for smooth entry
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [eventModal?.enabled, eventModal?.title]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("aqeeq_event_modal_dismissed", "true");
  };

  if (!isOpen || !eventModal?.enabled) return null;

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300 font-[Tajawal,sans-serif]"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-amber-400/40 bg-[#0a0f16] text-white shadow-2xl shadow-amber-500/10 animate-in zoom-in-95 duration-200">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-500 via-[#f8ca14] to-yellow-300" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 left-4 z-10 p-2 rounded-full bg-black/40 text-slate-300 hover:text-white hover:bg-black/70 border border-white/10 transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Event Poster Image (if provided) */}
        {eventModal.imageUrl && (
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/40">
            <img
              src={eventModal.imageUrl}
              alt={eventModal.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f16] via-transparent to-transparent" />
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-4 text-center">
          {eventModal.badge && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-400 text-xs font-black">
              <Sparkles size={13} />
              <span>{eventModal.badge}</span>
            </div>
          )}

          <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
            {eventModal.title}
          </h3>

          {eventModal.subtitle && (
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium max-w-md mx-auto">
              {eventModal.subtitle}
            </p>
          )}

          {/* Action CTAs */}
          <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
            {eventModal.ctaUrl && (
              <a
                href={eventModal.ctaUrl}
                onClick={handleClose}
                className="w-full flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#f8ca14] to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-black text-sm transition shadow-lg shadow-amber-500/25 cursor-pointer"
              >
                <span>{eventModal.ctaText || "احجز مقعدك الآن 🚀"}</span>
                <ArrowLeft size={16} />
              </a>
            )}

            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto py-3 px-5 rounded-2xl border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white text-xs font-bold transition cursor-pointer"
            >
              {eventModal.secondaryText || "تخطي ومتابعة"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
