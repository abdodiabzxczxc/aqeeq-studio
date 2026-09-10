import React from "react";
import { trpc } from "@/lib/trpc";
import { DEFAULT_PARTNERS, PartnerItem } from "@/components/admin/content/PartnersContentManager";
import { ExternalLink, Award } from "lucide-react";

interface PartnersMarqueeProps {
  dark?: boolean;
}

export function PartnersMarquee({ dark = true }: PartnersMarqueeProps) {
  const { data: orchestration } = trpc.executiveAdmin.getSiteOrchestration.useQuery(undefined, {
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  const partnersList: PartnerItem[] = (orchestration as any)?.partners && (orchestration as any).partners.length > 0
    ? (orchestration as any).partners
    : DEFAULT_PARTNERS;

  const visiblePartners = partnersList.filter((p) => p.visible);

  if (visiblePartners.length === 0) return null;

  // Duplicate list for seamless infinite loop effect
  const marqueeItems = [...visiblePartners, ...visiblePartners];

  return (
    <section
      dir="rtl"
      className={`relative w-full py-12 overflow-hidden transition-colors duration-300 font-[Tajawal,sans-serif] ${
        dark ? "bg-transparent text-white" : "bg-transparent text-slate-900"
      }`}
    >
      <div className="mx-auto max-w-[1380px] px-4 sm:px-6 md:px-8 mb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-black mb-2">
          <Award size={13} />
          <span>شركاء التميز والاعتمادات الرسمية</span>
        </div>
        <h3 className={`text-base sm:text-lg font-black ${dark ? "text-slate-200" : "text-slate-800"}`}>
          صروح وطنية واعتمادات دولية تعزز مسيرة الريادة
        </h3>
      </div>

      {/* Marquee Container with side fade gradients */}
      <div className="relative w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 sm:w-32 bg-gradient-to-l from-current-bg to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 sm:w-32 bg-gradient-to-r from-current-bg to-transparent z-10" />

        <div className="flex items-center gap-6 sm:gap-8 w-max animate-marquee-rtl hover:[animation-play-state:paused] py-2">
          {marqueeItems.map((partner, index) => (
            <a
              key={`${partner.id}-${index}`}
              href={partner.targetUrl}
              target="_blank"
              rel="noreferrer"
              className={`group flex items-center gap-3.5 px-5 py-3 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                dark
                  ? "border-white/10 bg-white/[0.03] hover:border-amber-400/40 hover:bg-white/[0.06] text-white"
                  : "border-black/5 bg-white shadow-xs hover:border-[#08467d]/30 text-slate-800"
              }`}
            >
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white/10 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src={partner.logoUrl}
                  alt={partner.name}
                  className="h-full w-full object-contain filter group-hover:brightness-110 transition"
                  loading="lazy"
                />
              </div>
              <div className="text-right">
                <h4 className="text-xs sm:text-sm font-black whitespace-nowrap group-hover:text-amber-400 transition">
                  {partner.name}
                </h4>
                <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                  <span>زيارة الموقع الرسمي</span>
                  <ExternalLink size={10} className="opacity-60" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
