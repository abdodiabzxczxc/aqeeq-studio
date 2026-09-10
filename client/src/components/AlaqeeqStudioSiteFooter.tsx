import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { useSiteTheme } from "@/lib/useSiteTheme";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { VisualEditable } from "@/components/VisualEditor";
import {
  MapPin,
  MessageCircle,
  ArrowUp,
  ArrowUpLeft,
  Sparkles,
  ShieldCheck,
  Award,
  GraduationCap,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  PhoneCall,
} from "lucide-react";

function SnapchatIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.166 2C8.36 2 6.27 4.29 6.27 7.07c0 1.25.46 2.37 1.05 3.19.14.19.17.43.07.64-.19.4-.64.81-1.39 1.01-.35.09-.59.4-.57.76.03.48.42.79.88.79.13 0 .27-.02.4-.08.57-.23 1.1-.3 1.54-.15.25.09.4.3.4.57 0 .8-.56 2.37-2.3 3.03-.43.16-.69.61-.59 1.06.1.44.53.75.98.71 1.45-.13 2.76.62 3.65 1.55.3.31.72.48 1.15.48h.04c.43 0 .85-.17 1.15-.48.89-.93 2.2-1.68 3.65-1.55.45.04.88-.27.98-.71.1-.45-.16-.9-.59-1.06-1.74-.66-2.3-2.23-2.3-3.03 0-.27.15-.48.4-.57.44-.15.97-.08 1.54.15.13.06.27.08.4.08.46 0 .85-.31.88-.79.02-.36-.22-.67-.57-.76-.75-.2-1.2-.61-1.39-1.01-.1-.21-.07-.45.07-.64.59-.82 1.05-1.94 1.05-3.19C17.73 4.29 15.64 2 12.166 2z" />
    </svg>
  );
}

function TikTokIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.81 4.48 6.27 6.27 0 0 0 1.84-4.48V8.71a8.18 8.18 0 0 0 4.94 1.63v-3.65z" />
    </svg>
  );
}

function ThreadsIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.186 24C5.452 24 0 18.608 0 12.003 0 5.394 5.452 0 12.186 0c6.684 0 12.133 5.344 12.186 11.905v.21c0 .548-.444.992-.992.992-.548 0-.992-.444-.992-.992v-.21C22.336 5.86 17.804 1.984 12.186 1.984 6.55 1.984 1.984 6.478 1.984 12.003c0 5.522 4.566 10.013 10.202 10.013 4.29 0 8.016-2.632 9.53-6.623.197-.512.775-.769 1.286-.572.512.197.77.776.572 1.287-1.83 4.821-6.33 7.892-11.388 7.892zm4.127-9.525c-.015-.008-.03-.017-.044-.025-.568-.337-1.283-.541-2.071-.591.228-.62.385-1.291.464-1.993.684.093 1.341.28 1.93.555.27.126.473.344.577.618.106.277.08.586-.07.848-.172.302-.452.511-.786.588zm-3.693-.654c.73.048 1.391.237 1.916.548-.158.552-.46 1.053-.883 1.45-1.127 1.058-2.673 1.29-4.01 1.058-1.503-.26-2.584-1.39-2.628-2.75-.043-1.332.96-2.48 2.434-2.788 1.058-.22 2.146-.086 3.171.482zm-2.91-4.717c-1.365.176-2.55.85-3.336 1.898-.797 1.063-1.076 2.378-.787 3.7.306 1.402 1.325 2.536 2.724 3.033.486.173.993.26 1.505.26.782 0 1.573-.204 2.29-.607.728-.409 1.307-.999 1.706-1.724.316-.574.498-1.218.544-1.897-.563-.223-1.168-.363-1.796-.418-.112-1.042-.423-2.036-.921-2.923-.48-.854-1.128-1.527-1.929-1.321zm.292-1.934c1.232 0 2.348.51 3.205 1.402.766.797 1.304 1.815 1.579 2.956.771.077 1.52.269 2.213.568 1.155.498 1.923 1.493 2.053 2.663.14 1.258-.458 2.454-1.564 3.125-.436.264-.925.438-1.442.518-.088.754-.316 1.488-.679 2.176-.566 1.073-1.399 1.947-2.437 2.548-1.128.653-2.404.992-3.693.992-.767 0-1.534-.122-2.274-.366-2.083-.687-3.64-2.342-4.164-4.425-.407-1.618-.116-3.328.799-4.697 1.037-1.554 2.628-2.529 4.38-2.736.677-.08 1.353-.024 2.025.076z" />
    </svg>
  );
}

export function AlaqeeqStudioSiteFooter() {
  const { theme } = useAqeeqStudioTheme();
  const { isNationalDay } = useSiteTheme();
  const dark = theme === "dark";
  const [, navigate] = useLocation();

  const { data: orchestration } = trpc.executiveAdmin.getSiteOrchestration.useQuery(undefined, {
    refetchOnWindowFocus: false,
    staleTime: 60000,
  });

  const whatsappNumber = orchestration?.social?.whatsappNumber || "966531896000";
  const cleanWhatsapp = whatsappNumber.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    "السلام عليكم ورحمة الله، أود الاستفسار بخصوص مدارس العقيق."
  )}`;

  const rawPhone = (orchestration?.social as any)?.phoneUrl || orchestration?.topBar?.phone || "+966531896000";
  const cleanPhone = rawPhone.replace(/[^0-9]/g, "");

  // Helper to determine if a social media channel is enabled and visible
  const isSocialVisible = (key: string, url?: string | null) => {
    if (!url || !url.trim()) return false;
    const rawEnabled = (orchestration?.social as any)?.[`${key}Enabled`];
    if (rawEnabled === false) return false;
    return true;
  };

  const isWhatsappVisible = () => {
    const rawEnabled = (orchestration?.social as any)?.whatsappEnabled;
    if (rawEnabled === false) return false;
    return Boolean(orchestration?.social?.whatsappNumber || whatsappNumber);
  };

  const activeLogo = "/alaqeeq-logo.png";

  const isPreFooterEnabled = orchestration?.footer?.preFooterEnabled !== false;
  const preFooterTitle = orchestration?.footer?.preFooterTitle || "ابدأ مسيرة التفوق والريادة مع مدارس العقيق ✦";
  const preFooterDesc = orchestration?.footer?.preFooterDesc || "بيئة تعليمية رائدة تجمع بين أصالة القيم وأحدث معايير التعليم الدولي (الأمريكي والدولي)، بمجمعات نموذجية متكاملة للبنين والبنات بالمدينة المنورة.";
  const preFooterCta1Text = orchestration?.footer?.preFooterCta1Text || "حجز مقعد دراسي";
  const preFooterCta1Url = orchestration?.footer?.preFooterCta1Url || "/admissions";
  const preFooterCta2Text = orchestration?.footer?.preFooterCta2Text || "مستشار القبول";
  const preFooterCta2Url = orchestration?.footer?.preFooterCta2Url || whatsappUrl;
  const preFooterCta3Text = orchestration?.footer?.preFooterCta3Text || "جدول الرسوم المعتمد";
  const preFooterCta3Url = orchestration?.footer?.preFooterCta3Url || "/admissions#fees-table-section";

  const isBadge1Enabled = orchestration?.footer?.badge1Enabled !== false;
  const isBadge2Enabled = orchestration?.footer?.badge2Enabled !== false;
  const isQuickLink1Enabled = orchestration?.footer?.quickLink1Enabled !== false;
  const isQuickLink2Enabled = orchestration?.footer?.quickLink2Enabled !== false;
  const isQuickLink3Enabled = orchestration?.footer?.quickLink3Enabled !== false;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      dir="rtl"
      className={`border-0 relative overflow-visible transition-colors duration-300 font-['Tajawal',sans-serif] bg-transparent ${
        dark ? "text-white" : "text-slate-900"
      }`}
    >
      <div className="mx-auto max-w-[1380px] 2xl:max-w-[1560px] px-4 sm:px-6 md:px-8 pt-8 pb-28 md:pb-10">
        {/* 1. Pre-Footer Call-to-Excellence Card */}
        {isPreFooterEnabled && (
          <div
            className={`mb-8 rounded-2xl sm:rounded-[1.8rem] border p-5 sm:p-6 md:p-7 relative overflow-hidden backdrop-blur-2xl transition-all duration-300 shadow-xl ${
              dark
                ? "border-[#f8ca14]/20 bg-gradient-to-br from-[#0a1218] via-[#05090e] to-[#02140c] shadow-[0_15px_40px_rgba(0,0,0,0.5)]"
                : "border-[#08467d]/15 bg-gradient-to-br from-white via-slate-50 to-amber-50/25 shadow-[0_10px_30px_rgba(8,70,125,0.05)]"
            }`}
          >
            {/* Subtle Ambient Glow */}
            <div className="pointer-events-none absolute -left-12 -top-12 h-48 w-48 rounded-full bg-[#f8ca14]/10 blur-3xl animate-pulse" />
            <div className="pointer-events-none absolute -right-12 -bottom-12 h-48 w-48 rounded-full bg-[#08467d]/10 blur-3xl animate-pulse" />

            {/* Rotating Golden Compass Seal in Background */}
            <div className="pointer-events-none absolute -bottom-10 left-1/4 w-44 h-44 opacity-[0.04] select-none animate-[spin_60s_linear_infinite]">
              <svg viewBox="0 0 200 200" fill="none" className="w-full h-full text-[#f8ca14]">
                <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
                <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="1.5" />
                <polygon points="100,20 115,85 180,100 115,115 100,180 85,115 20,100 85,85" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.15" />
              </svg>
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="max-w-2xl text-right">
                <div className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 text-[10px] font-black mb-2 shadow-sm ${
                  dark
                    ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]"
                    : "border-[#08467d]/20 bg-[#08467d]/5 text-[#08467d]"
                }`}>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dark ? "bg-[#f8ca14]" : "bg-[#08467d]"}`} />
                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dark ? "bg-[#f8ca14]" : "bg-[#08467d]"}`} />
                  </span>
                  <Sparkles size={11} className={dark ? "text-[#f8ca14]" : "text-[#08467d]"} />
                  <VisualEditable
                    id="studio-prefooter-kicker"
                    tag="text"
                    label="شارة شريط القبول"
                    defaultText="القبول والتسجيل مفتوح للعام الدراسي 2026 / 2027"
                    as="span"
                  />
                </div>

                <VisualEditable
                  id="studio-prefooter-title"
                  tag="text"
                  label="عنوان شريط القبول"
                  defaultText={preFooterTitle}
                  as="h3"
                  className="text-xl sm:text-2xl font-black tracking-tight leading-snug font-cairo"
                />

                <VisualEditable
                  id="studio-prefooter-desc"
                  tag="text"
                  label="وصف شريط القبول"
                  defaultText={preFooterDesc}
                  as="p"
                  className={`mt-1.5 text-xs sm:text-[13px] leading-relaxed ${dark ? "text-slate-300" : "text-slate-600"}`}
                />
              </div>

              {/* Clean Horizontal Button Strip on Left Side */}
              <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0">
                <a
                  href={preFooterCta1Url}
                  onClick={(e) => {
                    if (preFooterCta1Url.startsWith("/")) {
                      e.preventDefault();
                      navigate(preFooterCta1Url);
                    }
                  }}
                  target={preFooterCta1Url.startsWith("http") ? "_blank" : undefined}
                  rel={preFooterCta1Url.startsWith("http") ? "noreferrer" : undefined}
                  className="relative overflow-hidden flex-1 sm:flex-initial px-5 py-3 rounded-xl bg-gradient-to-l from-[#f8ca14] to-yellow-500 hover:from-yellow-400 hover:to-yellow-500 text-black font-black text-xs shadow-lg shadow-amber-500/15 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12" />
                  <VisualEditable
                    id="studio-prefooter-cta-text"
                    tag="text"
                    label="نص زر حجز مقعد دراسي"
                    defaultText={preFooterCta1Text}
                    as="span"
                  />
                  <ArrowUpLeft size={15} className="transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1" />
                </a>

                <a
                  href={preFooterCta2Url}
                  target={preFooterCta2Url.startsWith("http") ? "_blank" : undefined}
                  rel={preFooterCta2Url.startsWith("http") ? "noreferrer" : undefined}
                  className={`flex-1 sm:flex-initial px-4 py-3 rounded-xl border text-xs font-black transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
                    dark
                      ? "border-white/15 bg-white/5 text-[#f8ca14] hover:bg-white/10"
                      : "border-[#08467d]/20 bg-white text-[#08467d] hover:bg-slate-50 shadow-sm"
                  }`}
                >
                  <MessageCircle size={15} className="text-[#25D366]" />
                  <VisualEditable
                    id="studio-prefooter-advisor-text"
                    tag="text"
                    label="نص زر مستشار القبول"
                    defaultText={preFooterCta2Text}
                    as="span"
                  />
                </a>

                <a
                  href={preFooterCta3Url}
                  onClick={(e) => {
                    if (preFooterCta3Url.startsWith("/")) {
                      e.preventDefault();
                      navigate(preFooterCta3Url);
                    }
                  }}
                  target={preFooterCta3Url.startsWith("http") ? "_blank" : undefined}
                  rel={preFooterCta3Url.startsWith("http") ? "noreferrer" : undefined}
                  className={`w-full sm:w-auto px-3.5 py-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    dark
                      ? "border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 shadow-sm"
                  }`}
                >
                  <VisualEditable
                    id="studio-prefooter-fees-text"
                    tag="text"
                    label="نص زر جدول الرسوم"
                    defaultText={preFooterCta3Text}
                    as="span"
                  />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* 2. Main Minimal Luxury Emblem Footer Bar */}
        <div className="py-6 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between md:items-center">
            
            {/* Brand Logo & Title with Badges */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-right">
              <img
                src={activeLogo}
                alt="مدارس العقيق"
                className={`h-12 sm:h-14 w-auto object-contain transition shrink-0 ${
                  dark ? "brightness-0 invert opacity-95" : "opacity-95"
                }`}
              />
              <div className="flex flex-col items-center sm:items-start">
                <h3
                  className={`text-base sm:text-lg font-black tracking-tight ${
                    dark ? "text-white" : "text-slate-900"
                  }`}
                >
                  مدارس العقيق الأهلية والدولية
                </h3>
                <div className="mt-1.5 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  {isBadge1Enabled && (
                    <a
                      href={orchestration?.footer?.badge1Url || "/accreditations"}
                      onClick={(e) => {
                        const url = orchestration?.footer?.badge1Url || "/accreditations";
                        if (url.startsWith("/")) {
                          e.preventDefault();
                          navigate(url);
                        }
                      }}
                      target={orchestration?.footer?.badge1Url?.startsWith("http") ? "_blank" : undefined}
                      rel={orchestration?.footer?.badge1Url?.startsWith("http") ? "noreferrer" : undefined}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] sm:text-[11px] font-bold shadow-sm transition hover:scale-105 active:scale-95 cursor-pointer ${
                        dark
                          ? "border-[#f8ca14]/40 bg-[#f8ca14]/10 text-[#f8ca14] hover:bg-[#f8ca14]/20"
                          : "border-amber-500/40 bg-amber-50 text-[#855e09] hover:bg-amber-100"
                      }`}
                    >
                      <Award size={11} className="text-[#f8ca14] shrink-0" />
                      <span>{orchestration?.footer?.badge1Text || "اعتماد Cognia"}</span>
                    </a>
                  )}
                  {isBadge2Enabled && (
                    <a
                      href={orchestration?.footer?.badge2Url || "/accreditations"}
                      onClick={(e) => {
                        const url = orchestration?.footer?.badge2Url || "/accreditations";
                        if (url.startsWith("/")) {
                          e.preventDefault();
                          navigate(url);
                        }
                      }}
                      target={orchestration?.footer?.badge2Url?.startsWith("http") ? "_blank" : undefined}
                      rel={orchestration?.footer?.badge2Url?.startsWith("http") ? "noreferrer" : undefined}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] sm:text-[11px] font-bold shadow-sm transition hover:scale-105 active:scale-95 cursor-pointer ${
                        dark
                          ? "border-[#08467d]/60 bg-[#08467d]/20 text-slate-200 hover:bg-[#08467d]/30"
                          : "border-[#08467d]/25 bg-[#08467d]/5 text-[#08467d] hover:bg-[#08467d]/15"
                      }`}
                    >
                      <GraduationCap size={11} className="text-[#08467d] dark:text-[#f8ca14] shrink-0" />
                      <span>{orchestration?.footer?.badge2Text || "مركز اختبارات SAT & IELTS"}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Links Capsule Navigation */}
            <div className="flex items-center justify-center gap-2 flex-wrap text-xs font-bold">
              {isQuickLink1Enabled && (
                <a
                  href={orchestration?.footer?.quickLink1Url || "/admissions"}
                  onClick={(e) => {
                    const url = orchestration?.footer?.quickLink1Url || "/admissions";
                    if (url.startsWith("/")) {
                      e.preventDefault();
                      navigate(url);
                    }
                  }}
                  target={orchestration?.footer?.quickLink1Url?.startsWith("http") ? "_blank" : undefined}
                  rel={orchestration?.footer?.quickLink1Url?.startsWith("http") ? "noreferrer" : undefined}
                  className={`px-3 py-1.5 rounded-full border transition hover:scale-105 active:scale-95 cursor-pointer ${
                    dark
                      ? "border-white/10 bg-white/5 text-slate-300 hover:text-[#f8ca14] hover:border-[#f8ca14]/40"
                      : "border-black/10 bg-white text-slate-700 hover:text-[#08467d] hover:border-[#08467d]/30 shadow-sm"
                  }`}
                >
                  {orchestration?.footer?.quickLink1Text || "القبول والتسجيل ✦"}
                </a>
              )}
              {isQuickLink2Enabled && (
                <a
                  href={orchestration?.footer?.quickLink2Url || "/accreditations"}
                  onClick={(e) => {
                    const url = orchestration?.footer?.quickLink2Url || "/accreditations";
                    if (url.startsWith("/")) {
                      e.preventDefault();
                      navigate(url);
                    }
                  }}
                  target={orchestration?.footer?.quickLink2Url?.startsWith("http") ? "_blank" : undefined}
                  rel={orchestration?.footer?.quickLink2Url?.startsWith("http") ? "noreferrer" : undefined}
                  className={`px-3 py-1.5 rounded-full border transition hover:scale-105 active:scale-95 cursor-pointer ${
                    dark
                      ? "border-white/10 bg-white/5 text-slate-300 hover:text-[#f8ca14] hover:border-[#f8ca14]/40"
                      : "border-black/10 bg-white text-slate-700 hover:text-[#08467d] hover:border-[#08467d]/30 shadow-sm"
                  }`}
                >
                  {orchestration?.footer?.quickLink2Text || "الاعتمادات"}
                </a>
              )}
              {isQuickLink3Enabled && (
                <a
                  href={orchestration?.footer?.quickLink3Url || "/about"}
                  onClick={(e) => {
                    const url = orchestration?.footer?.quickLink3Url || "/about";
                    if (url.startsWith("/")) {
                      e.preventDefault();
                      navigate(url);
                    }
                  }}
                  target={orchestration?.footer?.quickLink3Url?.startsWith("http") ? "_blank" : undefined}
                  rel={orchestration?.footer?.quickLink3Url?.startsWith("http") ? "noreferrer" : undefined}
                  className={`px-3 py-1.5 rounded-full border transition hover:scale-105 active:scale-95 cursor-pointer ${
                    dark
                      ? "border-white/10 bg-white/5 text-slate-300 hover:text-[#f8ca14] hover:border-[#f8ca14]/40"
                      : "border-black/10 bg-white text-slate-700 hover:text-[#08467d] hover:border-[#08467d]/30 shadow-sm"
                  }`}
                >
                  {orchestration?.footer?.quickLink3Text || "المجمعات 🏫"}
                </a>
              )}
            </div>

            {/* Clean Uniform Social Media Circles (Including WhatsApp) */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {isSocialVisible("x", orchestration?.social?.xUrl) && (
                <a
                  href={orchestration!.social.xUrl!}
                  target="_blank"
                  rel="noreferrer"
                  className={`grid h-9 w-9 min-h-[36px] min-w-[36px] place-items-center rounded-full border text-xs font-black transition hover:scale-110 active:scale-95 ${
                    dark
                      ? "border-white/10 bg-white/5 text-slate-300 hover:border-[#f8ca14] hover:text-[#f8ca14]"
                      : "border-black/10 bg-white text-slate-700 hover:border-[#08467d] hover:text-[#08467d] shadow-sm"
                  }`}
                  title="منصة 𝕏"
                >
                  <span>𝕏</span>
                </a>
              )}

              {isSocialVisible("instagram", orchestration?.social?.instagramUrl) && (
                <a
                  href={orchestration!.social.instagramUrl!}
                  target="_blank"
                  rel="noreferrer"
                  className={`grid h-9 w-9 min-h-[36px] min-w-[36px] place-items-center rounded-full border text-xs transition hover:scale-110 active:scale-95 ${
                    dark
                      ? "border-white/10 bg-white/5 text-slate-300 hover:border-[#de191e] hover:text-[#de191e]"
                      : "border-black/10 bg-white text-slate-700 hover:border-[#de191e] hover:text-[#de191e] shadow-sm"
                  }`}
                  title="Instagram"
                >
                  <Instagram size={15} />
                </a>
              )}

              {isSocialVisible("snapchat", orchestration?.social?.snapchatUrl) && (
                <a
                  href={orchestration!.social.snapchatUrl!}
                  target="_blank"
                  rel="noreferrer"
                  className={`grid h-9 w-9 min-h-[36px] min-w-[36px] place-items-center rounded-full border text-xs transition hover:scale-110 active:scale-95 ${
                    dark
                      ? "border-white/10 bg-white/5 text-slate-300 hover:border-[#f8ca14] hover:text-[#f8ca14]"
                      : "border-black/10 bg-white text-slate-700 hover:border-[#f8ca14] hover:text-amber-600 shadow-sm"
                  }`}
                  title="Snapchat"
                >
                  <SnapchatIcon size={15} />
                </a>
              )}

              {isSocialVisible("tiktok", (orchestration?.social as any)?.tiktokUrl) && (
                <a
                  href={(orchestration?.social as any).tiktokUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`grid h-9 w-9 min-h-[36px] min-w-[36px] place-items-center rounded-full border text-xs transition hover:scale-110 active:scale-95 ${
                    dark
                      ? "border-white/10 bg-white/5 text-slate-300 hover:border-pink-500 hover:text-pink-400"
                      : "border-black/10 bg-white text-slate-700 hover:border-pink-500 hover:text-pink-600 shadow-sm"
                  }`}
                  title="TikTok"
                >
                  <TikTokIcon size={14} />
                </a>
              )}

              {isSocialVisible("facebook", orchestration?.social?.facebookUrl) && (
                <a
                  href={orchestration!.social.facebookUrl!}
                  target="_blank"
                  rel="noreferrer"
                  className={`grid h-9 w-9 min-h-[36px] min-w-[36px] place-items-center rounded-full border text-xs transition hover:scale-110 active:scale-95 ${
                    dark
                      ? "border-white/10 bg-white/5 text-slate-300 hover:border-[#1877F2] hover:text-[#1877F2]"
                      : "border-black/10 bg-white text-slate-700 hover:border-[#1877F2] hover:text-[#1877F2] shadow-sm"
                  }`}
                  title="Facebook"
                >
                  <Facebook size={15} />
                </a>
              )}

              {isSocialVisible("linkedin", (orchestration?.social as any)?.linkedinUrl) && (
                <a
                  href={(orchestration?.social as any).linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`grid h-9 w-9 min-h-[36px] min-w-[36px] place-items-center rounded-full border text-xs transition hover:scale-110 active:scale-95 ${
                    dark
                      ? "border-white/10 bg-white/5 text-slate-300 hover:border-[#0A66C2] hover:text-[#0A66C2]"
                      : "border-black/10 bg-white text-slate-700 hover:border-[#0A66C2] hover:text-[#0A66C2] shadow-sm"
                  }`}
                  title="LinkedIn"
                >
                  <Linkedin size={15} />
                </a>
              )}

              {isSocialVisible("threads", (orchestration?.social as any)?.threadsUrl) && (
                <a
                  href={(orchestration?.social as any).threadsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`grid h-9 w-9 min-h-[36px] min-w-[36px] place-items-center rounded-full border text-xs transition hover:scale-110 active:scale-95 ${
                    dark
                      ? "border-white/10 bg-white/5 text-slate-300 hover:border-white hover:text-white"
                      : "border-black/10 bg-white text-slate-700 hover:border-black hover:text-black shadow-sm"
                  }`}
                  title="Threads"
                >
                  <ThreadsIcon size={14} />
                </a>
              )}

              {isSocialVisible("youtube", orchestration?.social?.youtubeUrl) && (
                <a
                  href={orchestration!.social.youtubeUrl!}
                  target="_blank"
                  rel="noreferrer"
                  className={`grid h-9 w-9 min-h-[36px] min-w-[36px] place-items-center rounded-full border text-xs transition hover:scale-110 active:scale-95 ${
                    dark
                      ? "border-white/10 bg-white/5 text-slate-300 hover:border-[#de191e] hover:text-[#de191e]"
                      : "border-black/10 bg-white text-slate-700 hover:border-[#de191e] hover:text-[#de191e] shadow-sm"
                  }`}
                  title="YouTube"
                >
                  <Youtube size={15} />
                </a>
              )}

              {isSocialVisible("telegram", (orchestration?.social as any)?.telegramUrl) && (
                <a
                  href={(orchestration?.social as any).telegramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`grid h-9 w-9 min-h-[36px] min-w-[36px] place-items-center rounded-full border text-xs transition hover:scale-110 active:scale-95 ${
                    dark
                      ? "border-white/10 bg-white/5 text-slate-300 hover:border-[#08467d] hover:text-[#f8ca14]"
                      : "border-black/10 bg-white text-slate-700 hover:border-[#08467d] hover:text-[#08467d] shadow-sm"
                  }`}
                  title="Telegram"
                >
                  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                  </svg>
                </a>
              )}

              {isWhatsappVisible() && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`grid h-9 w-9 min-h-[36px] min-w-[36px] place-items-center rounded-full border text-xs transition hover:scale-110 active:scale-95 ${
                    dark
                      ? "border-emerald-500/40 bg-emerald-950/30 text-[#25D366] hover:bg-emerald-900/50"
                      : "border-[#25D366]/40 bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 shadow-sm"
                  }`}
                  title="واتساب مدارس العقيق"
                >
                  <MessageCircle size={15} />
                </a>
              )}

              {isSocialVisible("phone", (orchestration?.social as any)?.phoneUrl || orchestration?.topBar?.phoneUrl) && (
                <a
                  href={(orchestration?.social as any)?.phoneUrl || orchestration?.topBar?.phoneUrl || `tel:${cleanPhone}`}
                  className={`grid h-9 w-9 min-h-[36px] min-w-[36px] place-items-center rounded-full border text-xs transition hover:scale-110 active:scale-95 ${
                    dark
                      ? "border-amber-400/30 bg-amber-400/10 text-amber-400 hover:bg-amber-400/20"
                      : "border-amber-500/30 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 shadow-sm"
                  }`}
                  title="الاتصال المباشر"
                >
                  <PhoneCall size={15} />
                </a>
              )}
            </div>

          </div>
        </div>

        {/* 3. Centered Copyright Line & Clickable Location */}
        <div className="mt-4 pt-3 space-y-2 text-center text-[11px] font-bold">
          <p className={`mx-auto text-center leading-relaxed ${dark ? "text-slate-400" : "text-slate-600"}`}>
            {orchestration?.footer?.copyrightText || "جميع الحقوق محفوظة لمدارس العقيق الأهلية والدولية © 2026"}
            {orchestration?.location?.enabled !== false && (
              <a
                href={orchestration?.location?.mapUrl || orchestration?.topBar?.locationUrl || "https://maps.google.com/?q=Alaqeeq+Schools+Madinah"}
                target="_blank"
                rel="noreferrer"
                className={`hover:underline cursor-pointer transition ${dark ? "text-slate-400 hover:text-amber-400" : "text-slate-500 hover:text-[#08467d]"}`}
                title="عرض موقع المدارس على خرائط جوجل"
              >
                {" · "}
                {orchestration?.location?.text || "المدينة المنورة · المملكة العربية السعودية"}
              </a>
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
