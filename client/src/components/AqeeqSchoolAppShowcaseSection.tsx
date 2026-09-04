import React, { useEffect, useState } from "react";
import {
  Smartphone,
  QrCode as QrIcon,
  CreditCard,
  BellRing,
  Users,
  FileCheck2,
  ExternalLink,
  Sparkles,
  Download,
  Apple,
} from "lucide-react";
import QRCode from "qrcode";
import { useSiteTheme } from "@/lib/useSiteTheme";
import { trpc } from "@/lib/trpc";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { VisualEditable } from "./VisualEditor";

interface AqeeqSchoolAppShowcaseSectionProps {
  dark?: boolean;
}

export default function AqeeqSchoolAppShowcaseSection({
  dark = false,
}: AqeeqSchoolAppShowcaseSectionProps) {
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const { isNationalDay } = useSiteTheme();
  const { data: orchestrationData } = trpc.executiveAdmin.getSiteOrchestration.useQuery(undefined, {
    staleTime: 60000,
  });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const rawCol1Y = useTransform(scrollYProgress, [0, 1], [35, -35]);
  const rawCol2Y = useTransform(scrollYProgress, [0, 1], [65, -15]);
  const col1Y = useSpring(rawCol1Y, { stiffness: 85, damping: 20 });
  const col2Y = useSpring(rawCol2Y, { stiffness: 85, damping: 20 });

  // 3D Perspective scrubbing physics for the video / app frame
  const rawRotateX = useTransform(scrollYProgress, [0, 0.45, 0.9], [14, 0, -6]);
  const rawRotateY = useTransform(scrollYProgress, [0, 0.45, 0.9], [-16, 0, 8]);
  const rawScale = useTransform(scrollYProgress, [0, 0.45, 0.9], [0.92, 1, 0.96]);

  const rotateX = useSpring(rawRotateX, { stiffness: 80, damping: 20 });
  const rotateY = useSpring(rawRotateY, { stiffness: 80, damping: 20 });
  const scale = useSpring(rawScale, { stiffness: 80, damping: 20 });

  const appShowcase = orchestrationData?.appShowcase;
  const isEnabled = appShowcase?.enabled ?? true;
  const appDownloadUrl = appShowcase?.qrCodeUrl || "https://qr-codes.io/LQMip0";
  const appStoreUrl = appShowcase?.appStoreUrl || appDownloadUrl;
  const googlePlayUrl = appShowcase?.googlePlayUrl || appDownloadUrl;
  const youtubeVideoId = appShowcase?.youtubeVideoId || "_h3K-q8cDUc";
  const youtubeEmbedUrl = `https://www.youtube.com/embed/${youtubeVideoId}?rel=0&enablejsapi=1`;

  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    QRCode.toDataURL(appDownloadUrl, {
      width: 280,
      margin: 1.5,
      color: {
        dark: "#015a37",
        light: "#ffffff",
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("Failed to generate app QR:", err));
  }, [appDownloadUrl]);

  if (!isEnabled) {
    return <div ref={sectionRef} className="hidden" aria-hidden="true" />;
  }

  const features = [
    {
      icon: Users,
      title: "متابعة الأبناء الأكاديمية",
      desc: "ربط فوري لجميع الأبناء، متابعة الحضور والغياب، وجداول الحصص والتقارير الدورية.",
    },
    {
      icon: CreditCard,
      title: "سداد الرسوم والأقساط",
      desc: "دفع إلكتروني آمن ومعتمد عبر (مدى، فيزا، ماستركارد) وتقسيط ميسر للرسوم.",
    },
    {
      icon: FileCheck2,
      title: "فواتير إلكترونية معتمدة (ZATCA)",
      desc: "استعراض وتحميل الفواتير الضريبية المعتمدة لجميع الدفعات في أي وقت.",
    },
    {
      icon: BellRing,
      title: "إشعارات فورية والنداء الآلي",
      desc: "تنبيهات حية بالتعاميم والأنشطة، مع ميزة استدعاء الطلاب الذكي عند الانصراف.",
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="aqeeq-app-section"
      className={`relative py-16 md:py-24 border-b overflow-hidden transition-colors duration-300 ${
        dark
          ? "border-white/10 bg-[#070b10] text-white"
          : "border-slate-200/80 bg-[#f8faf9] text-slate-900"
      }`}
    >
      {/* Ambient Background Gradients */}
      <div
        className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full blur-3xl opacity-20"
        style={{ background: "radial-gradient(circle, #015a37, transparent)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 left-0 h-96 w-96 rounded-full blur-3xl opacity-15"
        style={{ background: "radial-gradient(circle, #f8ca14, transparent)" }}
      />

      <div className="relative mx-auto max-w-[1360px] px-4 sm:px-6 md:px-8">
        {/* Unified Section Header — Aligned Right Matching Site Identity */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="mb-8 sm:mb-12 text-right"
        >
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border mb-3 text-[10px] font-black tracking-widest uppercase ${
              isNationalDay
                ? "border-[#f8ca14]/40 bg-[#f8ca14]/15 text-[#f8ca14]"
                : dark
                ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]"
                : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"
            }`}
          >
            {isNationalDay ? <span>🇸🇦</span> : <Smartphone size={12} />}
            <VisualEditable
              id="studio-schoolapp-kicker"
              tag="text"
              label="شارة تطبيق المدارس"
              defaultText={isNationalDay ? "بوابة الخدمات الذكية لأولياء الأمور · عزّنا بطبعنا 🇸🇦" : "SMART SCHOOL APP · PARENT PORTAL"}
              as="span"
            />
          </span>

          <VisualEditable
            id="studio-schoolapp-title"
            tag="text"
            label="عنوان تطبيق المدارس"
            defaultText="تطبيق مدارس العقيق الذكي"
            as="h2"
            className={`text-2xl sm:text-4xl lg:text-5xl font-black font-cairo ${
              dark ? "text-white" : "text-black"
            }`}
          />

          {/* Glowing Golden Accent Line (يتمدد مع السكرول وينكمش عند الخروج) */}
          <motion.div
            initial={{ width: 0, opacity: 0.3 }}
            whileInView={{ width: 175, opacity: 1 }}
            viewport={{ once: false, margin: "-20px" }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className={`h-1 sm:h-[3.5px] rounded-full my-3 ${
              dark
                ? "bg-gradient-to-l from-[#f8ca14] via-[#f8ca14]/80 to-transparent shadow-[0_0_15px_rgba(248,202,20,0.6)]"
                : "bg-gradient-to-l from-[#08467d] via-[#08467d]/80 to-transparent shadow-[0_0_12px_rgba(8,70,125,0.4)]"
            }`}
          />

          <VisualEditable
            id="studio-schoolapp-desc"
            tag="text"
            label="وصف تطبيق المدارس"
            defaultText="بوابتكم الرقمية المتكاملة لمتابعة الأبناء، سداد الرسوم الدراسية إلكترونياً، والاطلاع على الفواتير المعتمدة وإشعارات المدرسة أولاً بأول."
            as="p"
            className={`mt-2 max-w-2xl text-xs sm:text-sm leading-relaxed ${
              dark ? "text-slate-400" : "text-slate-600"
            }`}
          />
        </motion.div>

        {/* Main 2-Column Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Column 1 (Right in RTL): Interactive Embedded Video Player (7 Cols) */}
          <motion.div
            style={{
              y: col1Y,
              rotateX,
              rotateY,
              scale,
              transformStyle: "preserve-3d",
            }}
            className="lg:col-span-7 flex flex-col justify-between will-change-transform relative"
          >
            {/* 🚗 Floating 3D Pill 1: Smart Gate Auto-Call */}
            <motion.div
              initial={{ opacity: 0, x: 35, y: -15, scale: 0.85 }}
              whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              viewport={{ once: false }}
              transition={{ type: "spring", stiffness: 190, damping: 17, delay: 0.15 }}
              className={`absolute -top-5 -right-3 sm:-right-6 z-30 flex items-center gap-3 px-4 py-2.5 rounded-2xl border shadow-2xl backdrop-blur-xl ${
                dark
                  ? "border-emerald-500/30 bg-[#0d161a]/95 text-white shadow-emerald-950/40"
                  : "border-emerald-500/25 bg-white/95 text-slate-900 shadow-xl"
              }`}
            >
              <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-400 grid place-items-center text-base">
                🚗
              </div>
              <div className="text-right">
                <p className="text-[11px] font-black flex items-center gap-1.5">
                  <span>النداء الآلي الذكي</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                </p>
                <p className="text-[10px] text-slate-400">ولي أمر الطالب فهد وصل للبوابة 1</p>
              </div>
            </motion.div>

            {/* 🌟 Floating 3D Pill 2: Academic Medal Badge */}
            <motion.div
              initial={{ opacity: 0, x: -35, y: 15, scale: 0.85 }}
              whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              viewport={{ once: false }}
              transition={{ type: "spring", stiffness: 190, damping: 17, delay: 0.3 }}
              className={`absolute -bottom-5 -left-3 sm:-left-6 z-30 flex items-center gap-3 px-4 py-2.5 rounded-2xl border shadow-2xl backdrop-blur-xl ${
                dark
                  ? "border-[#f8ca14]/30 bg-[#161309]/95 text-white shadow-amber-950/40"
                  : "border-amber-400/30 bg-white/95 text-slate-900 shadow-xl"
              }`}
            >
              <div className="h-9 w-9 rounded-xl bg-[#f8ca14]/20 text-[#f8ca14] grid place-items-center text-base">
                🌟
              </div>
              <div className="text-right">
                <p className="text-[11px] font-black text-amber-400">وسام التفوق والشهادات</p>
                <p className="text-[10px] text-slate-400">تم رصد درجات الشهر بنجاح</p>
              </div>
            </motion.div>

            <div
              className={`rounded-[2.2rem] border p-4 sm:p-6 shadow-2xl transition duration-300 flex-1 flex flex-col justify-between ${
                dark
                  ? "border-emerald-500/25 bg-[#0d141d]"
                  : "border-slate-200/90 bg-white"
              }`}
            >
              {/* Player Top Bar */}
              <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200/60 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <div>
                    <h3
                      className={`text-xs sm:text-sm font-black ${
                        dark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      دليل استخدام التطبيق وسداد الرسوم 🎬
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      فيديو توضيحي رسمي خطوة بخطوة
                    </p>
                  </div>
                </div>

                <a
                  href="https://www.youtube.com/watch?v=_h3K-q8cDUc"
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-xl transition ${
                    dark
                      ? "text-slate-300 hover:text-white bg-white/5 hover:bg-white/10"
                      : "text-slate-600 hover:text-black bg-slate-100 hover:bg-slate-200"
                  }`}
                  title="فتح في YouTube"
                >
                  <span>يوتيوب</span>
                  <ExternalLink size={12} />
                </a>
              </div>

              {/* Responsive Embedded Playable Video */}
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-xl bg-black border border-black/20">
                <iframe
                  src={youtubeEmbedUrl}
                  title="كيفية تسجيل حساب جديد لولي الأمر ودفع الرسوم الدراسية من خلال تطبيق أولياء الأمور - مدارس العقيق"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              </div>

              {/* Video Quick Navigation Badges */}
              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/10">
                <p className="text-[11px] font-bold text-slate-500 mb-2">
                  أبرز محاور الشرح في الفيديو:
                </p>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
                  <div
                    className={`p-2 rounded-xl border ${
                      dark
                        ? "border-white/5 bg-white/5 text-slate-200"
                        : "border-slate-100 bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span className="block text-[10px] text-emerald-500 font-black">
                      الخطوة 01
                    </span>
                    <span className="truncate block">تسجيل حساب جديد</span>
                  </div>
                  <div
                    className={`p-2 rounded-xl border ${
                      dark
                        ? "border-white/5 bg-white/5 text-slate-200"
                        : "border-slate-100 bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span className="block text-[10px] text-emerald-500 font-black">
                      الخطوة 02
                    </span>
                    <span className="truncate block">ربط ملفات الأبناء</span>
                  </div>
                  <div
                    className={`p-2 rounded-xl border ${
                      dark
                        ? "border-white/5 bg-white/5 text-slate-200"
                        : "border-slate-100 bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span className="block text-[10px] text-emerald-500 font-black">
                      الخطوة 03
                    </span>
                    <span className="truncate block">الدفع بمدى وفيزا</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Column 2 (Left in RTL): Features, QR Code & Store Links (5 Cols) */}
          <motion.div
            style={{ y: col2Y }}
            className="lg:col-span-5 flex flex-col justify-between space-y-6 will-change-transform"
          >
            {/* Features List */}
            <div
              className={`rounded-[2.2rem] border p-6 shadow-xl ${
                dark
                  ? "border-white/10 bg-[#0d141d]"
                  : "border-slate-200/90 bg-white"
              }`}
            >
              <h3
                className={`text-base font-black mb-4 flex items-center gap-2 ${
                  dark ? "text-white" : "text-[#0a192f]"
                }`}
              >
                <Sparkles size={16} className="text-[#f8ca14]" />
                <span>أبرز خدمات ومميزات التطبيق</span>
              </h3>

              <div className="space-y-3.5">
                {features.map((f, idx) => {
                  const Icon = f.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <div
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border ${
                          dark
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                            : "border-emerald-700/20 bg-emerald-50 text-[#015a37]"
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0">
                        <h4
                          className={`text-xs sm:text-sm font-black ${
                            dark ? "text-slate-100" : "text-slate-800"
                          }`}
                        >
                          {f.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                          {f.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* QR Code & Store Download Card */}
            <div
              className={`rounded-[2.2rem] border p-6 shadow-xl transition relative overflow-hidden ${
                dark
                  ? "border-emerald-500/30 bg-gradient-to-br from-[#0e1724] to-[#090f17]"
                  : "border-emerald-700/25 bg-gradient-to-br from-[#f2f8f4] to-white"
              }`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                {/* QR Code Box */}
                <div className="sm:col-span-5 flex flex-col items-center justify-center text-center">
                  <div className="relative p-2.5 bg-white rounded-2xl shadow-md border border-slate-200/80">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="QR Code لتحميل تطبيق مدارس العقيق"
                        className="w-28 h-28 sm:w-32 sm:h-32 object-contain"
                      />
                    ) : (
                      <div className="w-28 h-28 sm:w-32 sm:h-32 grid place-items-center bg-slate-100 rounded-xl text-slate-400">
                        <QrIcon size={32} />
                      </div>
                    )}
                  </div>
                  <span className="mt-2 text-[10px] font-black text-slate-500 flex items-center gap-1">
                    <QrIcon size={12} className="text-[#015a37]" />
                    <span>امسح بكاميرا الجوال</span>
                  </span>
                </div>

                {/* Download Store Buttons */}
                <div className="sm:col-span-7 flex flex-col justify-center space-y-2.5">
                  <span
                    className={`text-xs font-black block ${
                      dark ? "text-emerald-400" : "text-[#015a37]"
                    }`}
                  >
                    حمل التطبيق الآن مجاناً 📲
                  </span>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    متوفر لجميع أجهزة آبل بنظام iOS وأجهزة أندرويد:
                  </p>

                  {/* App Store Button */}
                  <a
                    href={appStoreUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-black hover:bg-slate-900 text-white transition active:scale-95 shadow-md border border-white/10"
                  >
                    <Apple size={22} className="shrink-0" />
                    <div className="text-right">
                      <span className="block text-[9px] text-slate-300">
                        تحميل من متجر
                      </span>
                      <span className="block text-xs font-black">
                        App Store (آيفون)
                      </span>
                    </div>
                  </a>

                  {/* Google Play Button */}
                  <a
                    href={googlePlayUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#015a37] hover:bg-emerald-800 text-white transition active:scale-95 shadow-md"
                  >
                    <Download size={20} className="shrink-0" />
                    <div className="text-right">
                      <span className="block text-[9px] text-emerald-100">
                        تحميل من متجر
                      </span>
                      <span className="block text-xs font-black">
                        Google Play (أندرويد)
                      </span>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
