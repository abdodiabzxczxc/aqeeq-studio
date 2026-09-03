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
  PhoneCall,
  MessageCircle,
  Send,
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
  const cleanPhone = boysPhone.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/966${cleanPhone.startsWith("0") ? cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(
    "السلام عليكم ورحمة الله، أود الاستفسار عن القبول والتسجيل بمدارس العقيق"
  )}`;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      dir="rtl"
      className={`border-t relative overflow-hidden transition-colors duration-300 font-['Tajawal',sans-serif] ${
        isNationalDay
          ? dark
            ? "border-emerald-500/20 bg-[#01140c] text-white"
            : "border-emerald-200 bg-[#f7fbf9] text-slate-900"
          : dark
          ? "border-white/[0.08] bg-[#05080c] text-white"
          : "border-black/[0.06] bg-[#fbfaf8] text-slate-900"
      }`}
    >
      {/* Subtle Ambient Light */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(1,90,55,0.08),transparent_65%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(1,90,55,0.2),transparent_65%)]" />

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10 py-12 sm:py-16">
        {/* Top Executive Row: Brand + Vision + Fast CTA */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-12 border-b border-current/10">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-auto">
                <img
                  src={
                    isNationalDay
                      ? dark
                        ? "/alaqeeq-logo-national-dark.png"
                        : "/alaqeeq-logo-national-light.png"
                      : dark
                      ? "/alaqeeq-logo-white.png"
                      : "/alaqeeq-logo-colored.png"
                  }
                  alt="مدارس العقيق الأهلية والدولية"
                  className={`h-10 w-auto object-contain ${dark && !isNationalDay ? "brightness-0 invert" : ""}`}
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = "none";
                  }}
                />
              </div>
              <div>
                <h3 className="text-lg font-black leading-tight">مدارس العقيق الأهلية والدولية</h3>
                <span className="text-[11px] text-slate-500 font-bold block">المدينة المنورة · بنين وبنات</span>
              </div>
            </div>
            <p className={`text-xs sm:text-sm leading-relaxed ${dark ? "text-slate-400" : "text-slate-600"}`}>
              صرح تعليمي وتربوي رائد بالمدينة المنورة، يُلهم الأجيال ويُنمّي القدرات عبر بيئات تعلم متطورة، واعتمادات دولية Cognia و SAT و IELTS، متوافق مع مستهدفات رؤية المملكة 2030.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => navigate("/admissions#admission-form-section")}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-xs font-black shadow-lg transition active:scale-95 ${
                dark
                  ? "bg-gradient-to-l from-[#f8ca14] to-amber-500 text-black hover:opacity-95 shadow-[#f8ca14]/20"
                  : "bg-gradient-to-l from-[#015a37] to-emerald-700 text-white hover:opacity-95 shadow-emerald-950/25"
              }`}
            >
              <Send size={14} />
              <span>سجّل ابنك الآن في مدارس العقيق ✦</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-xs font-black bg-[#25D366] text-white shadow-md hover:bg-[#20bd59] transition active:scale-95"
            >
              <MessageCircle size={15} />
              <span>واتساب القبول</span>
            </a>
          </div>
        </div>

        {/* Navigation Grid (4 Columns) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10">
          {/* Col 1: مدارسنا والمسار التعليمي */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Building2 size={14} />
              <span>مدارسنا والمسار</span>
            </h4>
            <ul className="space-y-2 text-xs font-bold">
              <li>
                <button type="button" onClick={() => navigate("/")} className="hover:text-emerald-500 transition text-right">
                  الصفحة الرئيسية
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate("/about")} className="hover:text-emerald-500 transition text-right">
                  عن مدارس العقيق
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate("/accreditations")} className="hover:text-emerald-500 transition text-right">
                  الاعتمادات ومراكز الاختبارات
                </button>
              </li>
              <li>
                <a href="https://live.aqeeq.edu.sa/jobs" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-emerald-500 transition">
                  <span>بوابة التوظيف الرسمية</span>
                  <ExternalLink size={10} className="opacity-60" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 2: القبول والتسجيل */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-500 dark:text-amber-400 flex items-center gap-1.5">
              <GraduationCap size={14} />
              <span>القبول وأولياء الأمور</span>
            </h4>
            <ul className="space-y-2 text-xs font-bold">
              <li>
                <button type="button" onClick={() => navigate("/admissions")} className="hover:text-amber-500 transition text-right">
                  جدول الرسوم المعتمد
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate("/admissions#admission-form-section")} className="hover:text-amber-500 transition text-right">
                  نموذج حجز مقعد دراسي
                </button>
              </li>
              <li>
                <a href="https://portal.aqeeq.app/pages/daily_plans/parent_lookup.php" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-amber-500 transition">
                  <span>الخطط الدراسية الأسبوعية</span>
                  <ExternalLink size={10} className="opacity-60" />
                </a>
              </li>
              <li>
                <a href="https://qr-codes.io/LQMip0" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-amber-500 transition">
                  <span>تحميل تطبيق أولياء الأمور</span>
                  <ExternalLink size={10} className="opacity-60" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: المركز الإعلامي */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-sky-500 dark:text-sky-400 flex items-center gap-1.5">
              <Newspaper size={14} />
              <span>المركز الإعلامي</span>
            </h4>
            <ul className="space-y-2 text-xs font-bold">
              <li>
                <button type="button" onClick={() => navigate("/journal")} className="hover:text-sky-500 transition text-right">
                  مجلة العقيق الدورية
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate("/albums")} className="hover:text-sky-500 transition text-right">
                  ألبومات الفعاليات والأنشطة
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate("/atheer")} className="hover:text-sky-500 transition text-right">
                  أثير — الاستوديو الصوتي والبودكاست
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate("/articles")} className="hover:text-sky-500 transition text-right">
                  المقالات وأقلام العقيق
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate("/offers")} className="hover:text-sky-500 transition text-right">
                  الأخبار والإعلانات
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: مجمعاتنا وتواصل مباشر */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
              <PhoneCall size={14} />
              <span>مجمعاتنا والتواصل</span>
            </h4>
            <div className="space-y-2 text-xs font-bold">
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-emerald-500 shrink-0" />
                <span className="text-[11px] text-slate-500 dark:text-slate-400">حي الرانوناء · ممشى الهجرة</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-emerald-500 shrink-0" />
                <a href={`tel:${cleanPhone}`} className="hover:underline" dir="ltr">{boysPhone}</a>
                <span className="text-[10px] text-slate-400">(بنين)</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-emerald-500 shrink-0" />
                <a href={`tel:${girlsPhone.replace(/[^0-9]/g, "")}`} className="hover:underline" dir="ltr">{girlsPhone}</a>
                <span className="text-[10px] text-slate-400">(بنات)</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={13} className="text-emerald-500 shrink-0" />
                <span className="text-[10px] text-slate-500 dark:text-slate-400">الأحد – الخميس | 7:00 ص – 2:30 م</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Links & Back to Top Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-current/10">
          <div className="flex items-center gap-2">
            {(orchestration?.social?.xUrl || (orchestration?.social as any)?.twitterUrl) && (
              <a
                href={orchestration?.social?.xUrl || (orchestration?.social as any)?.twitterUrl}
                target="_blank"
                rel="noreferrer"
                className={`grid h-8 w-8 place-items-center rounded-xl border text-xs transition hover:scale-110 ${
                  dark ? "border-white/10 bg-white/5 text-slate-300 hover:text-white" : "border-black/10 bg-white text-slate-700 hover:text-black shadow-xs"
                }`}
                title="منصة X"
              >
                𝕏
              </a>
            )}
            {orchestration?.social?.snapchatUrl && (
              <a
                href={orchestration.social.snapchatUrl}
                target="_blank"
                rel="noreferrer"
                className={`grid h-8 w-8 place-items-center rounded-xl border text-xs transition hover:scale-110 ${
                  dark ? "border-white/10 bg-white/5 text-slate-300 hover:text-yellow-400" : "border-black/10 bg-white text-slate-700 hover:text-yellow-600 shadow-xs"
                }`}
                title="سناب شات"
              >
                <SnapchatIcon size={14} />
              </a>
            )}
            {orchestration?.social?.instagramUrl && (
              <a
                href={orchestration.social.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className={`grid h-8 w-8 place-items-center rounded-xl border text-xs transition hover:scale-110 ${
                  dark ? "border-white/10 bg-white/5 text-slate-300 hover:text-pink-400" : "border-black/10 bg-white text-slate-700 hover:text-pink-600 shadow-xs"
                }`}
                title="إنستغرام"
              >
                📷
              </a>
            )}
            {orchestration?.social?.youtubeUrl && (
              <a
                href={orchestration.social.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className={`grid h-8 w-8 place-items-center rounded-xl border text-xs transition hover:scale-110 ${
                  dark ? "border-white/10 bg-white/5 text-slate-300 hover:text-red-400" : "border-black/10 bg-white text-slate-700 hover:text-red-600 shadow-xs"
                }`}
                title="يوتيوب"
              >
                ▶
              </a>
            )}
            <a
              href={(orchestration?.social as any)?.telegramUrl || "https://t.me/alaqeeqschools"}
              target="_blank"
              rel="noreferrer"
              className={`grid h-8 w-8 place-items-center rounded-xl border text-xs transition hover:scale-110 ${
                dark ? "border-white/10 bg-white/5 text-slate-300 hover:text-sky-400" : "border-black/10 bg-white text-slate-700 hover:text-sky-600 shadow-xs"
              }`}
              title="قناة تيليجرام"
            >
              📢
            </a>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
            <span>© {new Date().getFullYear()} مدارس العقيق الأهلية والدولية. جميع الحقوق محفوظة.</span>
            <button
              type="button"
              onClick={scrollToTop}
              className={`grid h-8 w-8 place-items-center rounded-xl border transition active:scale-95 ${
                dark ? "border-white/10 bg-white/5 text-slate-400 hover:text-white" : "border-black/10 bg-white text-slate-600 hover:text-black shadow-xs"
              }`}
              title="العودة لأعلى الصفحة"
            >
              <ChevronUp size={16} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
