import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { useSiteTheme } from "@/lib/useSiteTheme";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
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
} from "lucide-react";

function SnapchatIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.166 2C8.36 2 6.27 4.29 6.27 7.07c0 1.25.46 2.37 1.05 3.19.14.19.17.43.07.64-.19.4-.64.81-1.39 1.01-.35.09-.59.4-.57.76.03.48.42.79.88.79.13 0 .27-.02.4-.08.57-.23 1.1-.3 1.54-.15.25.09.4.3.4.57 0 .8-.56 2.37-2.3 3.03-.43.16-.69.61-.59 1.06.1.44.53.75.98.71 1.45-.13 2.76.62 3.65 1.55.3.31.72.48 1.15.48h.04c.43 0 .85-.17 1.15-.48.89-.93 2.2-1.68 3.65-1.55.45.04.88-.27.98-.71.1-.45-.16-.9-.59-1.06-1.74-.66-2.3-2.23-2.3-3.03 0-.27.15-.48.4-.57.44-.15.97-.08 1.54.15.13.06.27.08.4.08.46 0 .85-.31.88-.79.02-.36-.22-.67-.57-.76-.75-.2-1.2-.61-1.39-1.01-.1-.21-.07-.45.07-.64.59-.82 1.05-1.94 1.05-3.19C17.73 4.29 15.64 2 12.166 2z" />
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

  const activeLogo = isNationalDay
    ? dark
      ? "/alaqeeq-logo-national-dark.png"
      : "/alaqeeq-logo-national-light.png"
    : "/alaqeeq-logo.png";

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      dir="rtl"
      className={`border-t relative overflow-hidden transition-colors duration-300 font-['Tajawal',sans-serif] ${
        isNationalDay
          ? dark
            ? "border-emerald-500/20 bg-[#021008] text-white"
            : "border-emerald-200 bg-[#f7fbf9] text-slate-900"
          : dark
          ? "border-white/[0.08] bg-[#000000] text-white"
          : "border-black/[0.06] bg-[#fafafa] text-slate-900"
      }`}
    >
      <div className="mx-auto max-w-[1360px] px-5 pt-10 pb-8 md:px-8">
        {/* 1. Pre-Footer Call-to-Excellence Card (الجزء العلوي الذي أعجبك) */}
        <div
          className={`mb-10 rounded-[2rem] border p-6 sm:p-8 lg:p-10 relative overflow-hidden backdrop-blur-xl transition shadow-2xl ${
            dark
              ? "border-[#f8ca14]/25 bg-gradient-to-br from-[#0a1218] via-[#05090e] to-[#02140c] shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              : "border-emerald-700/20 bg-gradient-to-br from-white via-emerald-50/40 to-amber-50/30 shadow-[0_15px_40px_rgba(1,90,55,0.06)]"
          }`}
        >
          {/* Subtle Glow Accents */}
          <div className="pointer-events-none absolute -left-12 -top-12 h-64 w-64 rounded-full bg-[#f8ca14]/5 blur-3xl" />
          <div className="pointer-events-none absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-black text-emerald-400 mb-3">
                <Sparkles size={12} className="text-[#f8ca14]" />
                <span>القبول والتسجيل مفتوح للعام الدراسي 2026 / 2027</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
                ابدأ مسيرة التفوق والريادة مع مدارس العقيق ✦
              </h3>
              <p className={`mt-2 text-xs sm:text-sm leading-relaxed ${dark ? "text-slate-300" : "text-slate-600"}`}>
                بيئة تعليمية رائدة تجمع بين أصالة القيم وأحدث معايير التعليم الدولي (الأمريكي والدولي)، بمجمعات نموذجية متكاملة للبنين والبنات بالمدينة المنورة.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto shrink-0">
              <button
                type="button"
                onClick={() => navigate("/admissions")}
                className="flex-1 sm:flex-initial px-6 py-3.5 rounded-xl bg-gradient-to-l from-[#f8ca14] to-yellow-500 hover:from-yellow-400 hover:to-yellow-500 text-black font-black text-xs sm:text-sm shadow-xl shadow-amber-500/15 transition active:scale-95 flex items-center justify-center gap-2 group"
              >
                <span>حجز مقعد دراسي</span>
                <ArrowUpLeft size={16} className="transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1" />
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className={`flex-1 sm:flex-initial px-5 py-3.5 rounded-xl border text-xs sm:text-sm font-black transition active:scale-95 flex items-center justify-center gap-2 ${
                  dark
                    ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/40"
                    : "border-emerald-600/30 bg-white text-emerald-700 hover:bg-emerald-50 shadow-sm"
                }`}
              >
                <MessageCircle size={16} className="text-emerald-500" />
                <span>مستشار القبول</span>
              </a>

              <button
                type="button"
                onClick={() => navigate("/admissions#fees-table-section")}
                className={`w-full sm:w-auto px-4 py-3.5 rounded-xl border text-xs font-bold transition ${
                  dark
                    ? "border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 shadow-sm"
                }`}
              >
                جدول الرسوم المعتمد
              </button>
            </div>
          </div>
        </div>

        {/* 2. Main Minimal Studio Bar: Brand + Badges under title (from 'م' to 'ة') + Location + Socials */}
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row py-4">
          {/* Brand Logo & Name with Badges */}
          <div className="flex items-center gap-4 sm:gap-5">
            <img
              src={activeLogo}
              alt="مدارس العقيق"
              className={`h-12 sm:h-14 w-auto object-contain transition shrink-0 ${
                dark ? "brightness-0 invert opacity-95" : "opacity-90"
              }`}
            />

            {/* Container fits title exactly, scaled down as a single unit */}
            <div
              className="w-fit inline-flex flex-col items-stretch origin-right shrink-0"
              style={{ zoom: 0.82 }}
            >
              <h3
                className={`text-xl sm:text-2xl font-black tracking-tight whitespace-nowrap leading-none ${
                  dark
                    ? "text-white"
                    : isNationalDay
                    ? "text-[#015a37]"
                    : "text-slate-900"
                }`}
              >
                مدارس العقيق الأهلية والدولية
              </h3>

              {/* The 2 capsule pills spanning from 'م' in مدارس to 'ة' in الدولية */}
              <div className="mt-2.5 grid grid-cols-2 gap-2.5 w-full">
                {/* 1. Golden Pill on the right (under مدارس العقيق) */}
                <div
                  className={`flex items-center justify-center gap-1.5 px-3 py-1 rounded-full border text-[11px] sm:text-xs font-bold whitespace-nowrap transition shadow-sm ${
                    dark
                      ? "border-amber-500/80 bg-amber-950/20 text-amber-400 shadow-amber-500/5"
                      : "border-amber-600/40 bg-amber-50 text-amber-800"
                  }`}
                >
                  <Award size={13} className="text-amber-400 shrink-0" />
                  <span>اعتماد Cognia الدولي</span>
                </div>

                {/* 2. Sky Blue Pill on the left (under الأهلية والدولية) */}
                <div
                  className={`flex items-center justify-center gap-1.5 px-3 py-1 rounded-full border text-[11px] sm:text-xs font-bold whitespace-nowrap transition shadow-sm ${
                    dark
                      ? "border-sky-500/80 bg-sky-950/20 text-sky-400 shadow-sky-500/5"
                      : "border-sky-600/40 bg-sky-50 text-sky-800"
                  }`}
                >
                  <GraduationCap size={13} className="text-sky-400 shrink-0" />
                  <span>مركز اختبارات SAT & IELTS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Location Tag */}
          {orchestration?.location?.enabled !== false && (
            <a
              href={orchestration?.location?.mapUrl || "https://maps.google.com/?q=Alaqeeq+Schools+Madinah"}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition hover:scale-105 ${
                dark
                  ? "border-white/10 bg-white/5 text-slate-300 hover:border-[#f8ca14] hover:text-[#f8ca14]"
                  : "border-black/10 bg-white text-slate-700 hover:border-[#08467d] hover:text-[#08467d] shadow-sm"
              }`}
              title="موقع مدارس العقيق على خرائط Google"
            >
              <MapPin size={13} className={dark ? "text-[#f8ca14]" : "text-[#08467d]"} />
              <span>{orchestration?.location?.text || "المدينة المنورة · المملكة العربية السعودية"}</span>
            </a>
          )}

          {/* Social Media & WhatsApp Contact */}
          <div className="flex items-center gap-2.5">
            {orchestration?.social?.xUrl && (
              <a
                href={orchestration.social.xUrl}
                target="_blank"
                rel="noreferrer"
                className={`grid h-8 w-8 place-items-center rounded-full border text-xs font-black transition hover:scale-110 ${
                  dark
                    ? "border-white/10 bg-white/5 text-slate-300 hover:border-[#f8ca14] hover:text-[#f8ca14]"
                    : "border-black/10 bg-white text-slate-700 hover:border-[#08467d] hover:text-[#08467d] shadow-sm"
                }`}
                title="منصة 𝕏"
              >
                <span>𝕏</span>
              </a>
            )}

            {orchestration?.social?.instagramUrl && (
              <a
                href={orchestration.social.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className={`grid h-8 w-8 place-items-center rounded-full border text-xs transition hover:scale-110 ${
                  dark
                    ? "border-white/10 bg-white/5 text-slate-300 hover:border-pink-500 hover:text-pink-400"
                    : "border-black/10 bg-white text-slate-700 hover:border-pink-500 hover:text-pink-600 shadow-sm"
                }`}
                title="Instagram"
              >
                <Instagram size={14} />
              </a>
            )}

            {orchestration?.social?.snapchatUrl && (
              <a
                href={orchestration.social.snapchatUrl}
                target="_blank"
                rel="noreferrer"
                className={`grid h-8 w-8 place-items-center rounded-full border text-xs transition hover:scale-110 ${
                  dark
                    ? "border-white/10 bg-white/5 text-slate-300 hover:border-yellow-400 hover:text-yellow-400"
                    : "border-black/10 bg-white text-slate-700 hover:border-yellow-500 hover:text-yellow-600 shadow-sm"
                }`}
                title="Snapchat"
              >
                <SnapchatIcon size={14} />
              </a>
            )}

            {orchestration?.social?.facebookUrl && (
              <a
                href={orchestration.social.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className={`grid h-8 w-8 place-items-center rounded-full border text-xs transition hover:scale-110 ${
                  dark
                    ? "border-white/10 bg-white/5 text-slate-300 hover:border-blue-500 hover:text-blue-400"
                    : "border-black/10 bg-white text-slate-700 hover:border-blue-500 hover:text-blue-600 shadow-sm"
                }`}
                title="Facebook"
              >
                <Facebook size={14} />
              </a>
            )}

            {orchestration?.social?.youtubeUrl && (
              <a
                href={orchestration.social.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className={`grid h-8 w-8 place-items-center rounded-full border text-xs transition hover:scale-110 ${
                  dark
                    ? "border-white/10 bg-white/5 text-slate-300 hover:border-red-500 hover:text-red-400"
                    : "border-black/10 bg-white text-slate-700 hover:border-red-500 hover:text-red-600 shadow-sm"
                }`}
                title="YouTube"
              >
                <Youtube size={14} />
              </a>
            )}

            {((orchestration?.social as any)?.telegramUrl || "https://t.me/alaqeeqschools") && (
              <a
                href={(orchestration?.social as any)?.telegramUrl || "https://t.me/alaqeeqschools"}
                target="_blank"
                rel="noreferrer"
                className={`grid h-8 w-8 place-items-center rounded-full border text-xs transition hover:scale-110 ${
                  dark
                    ? "border-white/10 bg-white/5 text-slate-300 hover:border-sky-400 hover:text-sky-400"
                    : "border-black/10 bg-white text-slate-700 hover:border-sky-500 hover:text-sky-600 shadow-sm"
                }`}
                title="قناة Telegram الرسمية"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                </svg>
              </a>
            )}

            {orchestration?.social?.whatsappNumber && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-black transition hover:scale-105 ${
                  dark
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                    : "border-emerald-500/20 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 shadow-sm"
                }`}
                title="تواصل معنا عبر واتساب"
              >
                <MessageCircle size={14} />
                <span>تواصل عبر واتساب</span>
              </a>
            )}
          </div>
        </div>

        {/* 3. Minimal Copyright Line & Back to Top */}
        <div
          className={`mt-6 border-t pt-4 flex items-center justify-between gap-4 text-[11px] font-bold ${
            dark ? "border-white/[0.06] text-slate-500" : "border-black/[0.06] text-slate-400"
          }`}
        >
          <p>{orchestration?.footer?.copyrightText || "جميع الحقوق محفوظة لمدارس العقيق الأهلية والدولية © 2026"}</p>
          <button
            type="button"
            onClick={scrollToTop}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black transition hover:scale-105 ${
              dark
                ? "border-white/10 bg-white/5 text-slate-300 hover:border-[#f8ca14] hover:text-[#f8ca14]"
                : "border-black/10 bg-white text-slate-600 hover:border-[#08467d] hover:text-[#08467d] shadow-sm"
            }`}
            title="العودة لأعلى الصفحة"
          >
            <span>للأعلى</span>
            <ArrowUp size={12} />
          </button>
        </div>
      </div>
    </footer>
  );
}
