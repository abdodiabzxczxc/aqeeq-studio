import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { useSiteTheme } from "@/lib/useSiteTheme";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import {
  Building2,
  Phone,
  Clock,
  MapPin,
  ExternalLink,
  ChevronUp,
  GraduationCap,
  Newspaper,
  MessageCircle,
  ArrowUpLeft,
  ShieldCheck,
  Award,
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

  const campuses = orchestration?.schoolCampuses;
  const boysPhone = campuses?.boysPhone || "0148131652";
  const girlsPhone = campuses?.girlsPhone || "0148644466";
  const whatsappNumber = orchestration?.social?.whatsappNumber || "966531896000";
  const cleanWhatsapp = whatsappNumber.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    "السلام عليكم ورحمة الله، أود الاستفسار عن القبول والتسجيل بمدارس العقيق"
  )}`;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeLogo = isNationalDay
    ? dark
      ? "/alaqeeq-logo-national-dark.png"
      : "/alaqeeq-logo-national-light.png"
    : "/alaqeeq-logo.png";

  return (
    <footer
      dir="rtl"
      className={`border-t relative overflow-hidden transition-colors duration-300 font-['Tajawal',sans-serif] ${
        isNationalDay
          ? dark
            ? "border-emerald-500/20 bg-[#020d07] text-white"
            : "border-emerald-200 bg-[#f7fbf9] text-slate-900"
          : dark
          ? "border-white/[0.08] bg-[#070a0f] text-slate-200"
          : "border-slate-200 bg-[#faf9f6] text-slate-900"
      }`}
    >
      <div className="container mx-auto px-5 sm:px-8 max-w-7xl relative z-10 pt-12 pb-8">
        {/* 1. Header Invitation Strip (سلس، غير صندوقي، متناسق مع الفوتر) */}
        <div className="pb-10 border-b border-white/[0.08] dark:border-white/[0.08] border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="text-[11px] font-black tracking-widest uppercase text-emerald-500 block mb-1">
              القبول والتسجيل · 2026 / 2027
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white dark:text-white text-slate-900">
              ابدأ رحلة التميّز والريادة مع مدارس العقيق
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              نرحب بانضمام أبنائكم وبناتكم لمجتمعنا التعليمي في كافة المراحل (تمهيدي، ابتدائي، متوسط، ثانوي) بالمسارين الأهلي والدولي.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            <button
              type="button"
              onClick={() => navigate("/admissions")}
              className="flex-1 md:flex-initial px-5 py-2.5 rounded-xl bg-[#f8ca14] hover:bg-yellow-400 text-black font-black text-xs transition shadow-md flex items-center justify-center gap-1.5"
            >
              <span>حجز مقعد دراسي</span>
              <ArrowUpLeft size={14} />
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                dark
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                  : "border-emerald-600/20 bg-white text-emerald-700 hover:bg-emerald-50 shadow-sm"
              }`}
            >
              <MessageCircle size={14} className="text-emerald-500" />
              <span>مستشار القبول</span>
            </a>
          </div>
        </div>

        {/* 2. Main 4-Column Grid (أعمدة متوازنة مع دمج الفروع بداخلها دون كبسولات شاذة) */}
        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Brand & Accreditations (5 columns on desktop) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={activeLogo}
                alt="مدارس العقيق"
                className={`h-11 w-auto object-contain ${
                  dark && !isNationalDay ? "brightness-0 invert opacity-95" : ""
                }`}
              />
              <div>
                <h4 className="text-base font-black text-white dark:text-white text-slate-900 leading-tight">
                  مدارس العقيق الأهلية والدولية
                </h4>
                <p className="text-[11px] text-slate-400 font-bold">المدينة المنورة · مجمعات البنين والبنات</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              صرح تعليمي وتربوي رائد بالمدينة المنورة، يُلهم الأجيال ويُنمّي القدرات عبر بيئات تعلم متطورة، واعتمادات دولية Cognia و SAT و IELTS، متوافق مع مستهدفات رؤية المملكة 2030.
            </p>

            {/* Quiet, refined trust markers */}
            <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-slate-400 font-bold">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>إشراف وزارة التعليم</span>
              </span>
              <span className="text-slate-600">·</span>
              <span className="flex items-center gap-1.5">
                <Award size={14} className="text-[#f8ca14]" />
                <span>اعتماد Cognia الدولي</span>
              </span>
              <span className="text-slate-600">·</span>
              <span className="flex items-center gap-1.5">
                <GraduationCap size={14} className="text-sky-400" />
                <span>مركز SAT & IELTS</span>
              </span>
            </div>
          </div>

          {/* Col 1: مدارسنا (2 columns on desktop) */}
          <div className="lg:col-span-2 space-y-3">
            <h5 className="text-xs font-black uppercase tracking-wider text-white dark:text-white text-slate-900 pb-1">
              مدارسنا والمسار
            </h5>
            <ul className="space-y-2 text-xs font-bold text-slate-400">
              <li>
                <button type="button" onClick={() => navigate("/")} className="hover:text-white transition">
                  الصفحة الرئيسية
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate("/about")} className="hover:text-white transition">
                  عن مدارس العقيق ورؤيتنا
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate("/accreditations")} className="hover:text-white transition">
                  الاعتمادات والجودة
                </button>
              </li>
              <li>
                <a
                  href="https://live.aqeeq.edu.sa/jobs"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white transition"
                >
                  <span>بوابة التوظيف الرسمية</span>
                  <ExternalLink size={10} className="opacity-50" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 2: القبول والخدمات (3 columns on desktop) */}
          <div className="lg:col-span-3 space-y-3">
            <h5 className="text-xs font-black uppercase tracking-wider text-white dark:text-white text-slate-900 pb-1">
              القبول والخدمات
            </h5>
            <ul className="space-y-2 text-xs font-bold text-slate-400">
              <li>
                <button type="button" onClick={() => navigate("/admissions")} className="hover:text-white transition">
                  جدول الرسوم المعتمد والخصومات
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate("/admissions#admission-form-section")} className="hover:text-white transition">
                  طلب الالتحاق والتسجيل
                </button>
              </li>
              <li>
                <a
                  href="https://portal.aqeeq.app/pages/daily_plans/parent_lookup.php"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white transition"
                >
                  <span>الخطط الدراسية الأسبوعية</span>
                  <ExternalLink size={10} className="opacity-50" />
                </a>
              </li>
              <li>
                <a
                  href="https://qr-codes.io/LQMip0"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white transition"
                >
                  <span>تطبيق أولياء الأمور الذكي</span>
                  <ExternalLink size={10} className="opacity-50" />
                </a>
              </li>
              <li>
                <button type="button" onClick={() => navigate("/journal")} className="hover:text-white transition">
                  مجلة العقيق والمركز الإعلامي
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: المجمعات والتواصل (3 columns on desktop) */}
          <div className="lg:col-span-3 space-y-3">
            <h5 className="text-xs font-black uppercase tracking-wider text-white dark:text-white text-slate-900 pb-1">
              مجمعاتنا والتواصل
            </h5>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div>
                <span className="block text-white dark:text-white text-slate-900 font-bold">مجمع البنين (الرانوناء):</span>
                <a href={`tel:${boysPhone}`} className="hover:text-emerald-400 transition font-mono dir-ltr inline-block">
                  {boysPhone}
                </a>
              </div>

              <div>
                <span className="block text-white dark:text-white text-slate-900 font-bold">مجمع البنات (ممشى الهجرة):</span>
                <a href={`tel:${girlsPhone}`} className="hover:text-amber-400 transition font-mono dir-ltr inline-block">
                  {girlsPhone}
                </a>
              </div>

              <div className="pt-1 text-[11px] text-slate-400">
                <span className="block text-slate-400">ساعات الدوام الرسمي:</span>
                <span className="text-slate-300">الأحد إلى الخميس · 7:00 ص – 2:30 م</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Bottom Row: Copyright + Social Network + Back to Top */}
        <div className="pt-8 border-t border-white/[0.08] dark:border-white/[0.08] border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            <span>© 2026 مدارس العقيق الأهلية والدولية. جميع الحقوق محفوظة.</span>
          </div>

          <div className="flex items-center gap-3">
            {orchestration?.social?.xUrl && (
              <a
                href={orchestration.social.xUrl}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-white transition text-xs font-bold"
                title="منصة 𝕏"
              >
                𝕏
              </a>
            )}

            {orchestration?.social?.instagramUrl && (
              <a
                href={orchestration.social.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-pink-400 transition"
                title="Instagram"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            )}

            {orchestration?.social?.snapchatUrl && (
              <a
                href={orchestration.social.snapchatUrl}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-yellow-400 transition"
                title="Snapchat"
              >
                <SnapchatIcon size={15} />
              </a>
            )}

            {orchestration?.social?.youtubeUrl && (
              <a
                href={orchestration.social.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-red-400 transition"
                title="YouTube"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            )}

            {((orchestration?.social as any)?.telegramUrl || "https://t.me/alaqeeqschools") && (
              <a
                href={(orchestration?.social as any)?.telegramUrl || "https://t.me/alaqeeqschools"}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-sky-400 transition"
                title="قناة Telegram الرسمية"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                </svg>
              </a>
            )}

            <button
              type="button"
              onClick={scrollToTop}
              className="mr-3 text-slate-400 hover:text-white transition flex items-center gap-1 font-bold"
              title="العودة لأعلى الصفحة"
            >
              <span>للأعلى</span>
              <ChevronUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
