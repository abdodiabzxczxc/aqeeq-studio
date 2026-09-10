import React, { useState } from "react";
import {
  Sliders,
  Share2,
  AlertTriangle,
  Globe,
  Radio,
  Sparkles,
  Save,
  CheckCircle2,
  Lock,
  Instagram,
  Phone,
  Mail,
  MapPin,
  Flame,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface SystemBrandHubProps {
  dark: boolean;
  orchestration: any;
  onSaveOrchestration: (updated: any) => Promise<void>;
  isSaving: boolean;
}

export function SystemBrandHub({
  dark,
  orchestration,
  onSaveOrchestration,
  isSaving,
}: SystemBrandHubProps) {
  const [subTab, setSubTab] = useState<"header_footer" | "emergency" | "portals" | "marketing" | "seasons">("header_footer");

  // Nav & Header Form
  const currentNav = orchestration?.nav || {};
  const [navForm, setNavForm] = useState(currentNav);

  // Social Form
  const currentSocial = orchestration?.social || {};
  const [socialForm, setSocialForm] = useState(currentSocial);

  // Emergency Banner Form
  const currentBanner = orchestration?.emergencyBanner || {};
  const [bannerForm, setBannerForm] = useState(currentBanner);

  // Marketing Pixels Form
  const currentPixels = orchestration?.marketingPixels || {};
  const [pixelsForm, setPixelsForm] = useState(currentPixels);

  // Seasons Form (Theme overrides)
  const currentTheme = orchestration?.theme || {};
  const [selectedSeason, setSelectedSeason] = useState<string>(currentTheme?.season || "default");

  const SEASONS = [
    { id: "default", name: "الهوية الرسمية الأصلية 🏛️", desc: "أزرق ياقوتي ملكي مع ذهب العقيق المعتمد" },
    { id: "national_day", name: "اليوم الوطني السعودي 94 🇸🇦", desc: "أخضر زمردي ملكي وبانرات الاحتفاء الوطنية" },
    { id: "founding_day", name: "يوم التأسيس السعودي 🇸🇦", desc: "ألوان تراثية دافئة ونقوش يوم التأسيس" },
    { id: "ramadan", name: "شهر رمضان المبارك 🌙", desc: "ثيم الشهر الفضيل، أوقات الدوام، والتهاني" },
    { id: "exams", name: "موسم الاختبارات النهائية 📝", desc: "أدعية التوفيق ونصائح وإرشادات اللجان" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Hub Bar */}
      <div className={`p-4 sm:p-5 rounded-3xl border flex flex-wrap items-center justify-between gap-4 ${
        dark ? "border-white/10 bg-[#0c1015]" : "border-black/10 bg-white shadow-xs"
      }`}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Sliders size={20} />
          </div>
          <div>
            <h2 className="text-base font-black">هوية المنظومة والتقنية والحوكمة</h2>
            <p className="text-xs text-slate-400 font-bold">
              إدارة الهيدر والفوتر، السوشيال ميديا، بوابات الدخول، بكسلات التسويق، والمواسم الوطنية
            </p>
          </div>
        </div>

        {/* Sub-tab Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-current/10">
          <button
            type="button"
            onClick={() => setSubTab("header_footer")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              subTab === "header_footer"
                ? dark ? "bg-[#f8ca14] text-black shadow" : "bg-[#08467d] text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            الهيدر والفوتر 🌐
          </button>
          <button
            type="button"
            onClick={() => setSubTab("emergency")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              subTab === "emergency"
                ? dark ? "bg-[#f8ca14] text-black shadow" : "bg-[#08467d] text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            البانر العاجل 🚨
          </button>
          <button
            type="button"
            onClick={() => setSubTab("portals")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              subTab === "portals"
                ? dark ? "bg-[#f8ca14] text-black shadow" : "bg-[#08467d] text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            بوابات المدارس 🚪
          </button>
          <button
            type="button"
            onClick={() => setSubTab("marketing")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              subTab === "marketing"
                ? dark ? "bg-[#f8ca14] text-black shadow" : "bg-[#08467d] text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            التسويق و SEO 📈
          </button>
          <button
            type="button"
            onClick={() => setSubTab("seasons")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              subTab === "seasons"
                ? dark ? "bg-[#f8ca14] text-black shadow" : "bg-[#08467d] text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            المواسم الوطنية 🇸🇦
          </button>
        </div>
      </div>

      {/* SUBTAB 1: HEADER & FOOTER & SOCIAL NETWORKS */}
      {subTab === "header_footer" && (
        <div className={`p-6 rounded-3xl border space-y-6 ${dark ? "border-white/10 bg-[#0d1218]" : "border-black/10 bg-white shadow-xs"}`}>
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-current/10">
            <div>
              <h3 className="text-base font-black">إعدادات الترويسة وأزرار التواصل وشبكات التواصل الـ 10</h3>
              <p className="text-xs text-slate-400 font-bold mt-0.5">
                تعديل نصوص وأرقام الهيدر والفوتر، وروابط قنوات التواصل الرسمية
              </p>
            </div>
            <Button
              type="button"
              onClick={async () => {
                await onSaveOrchestration({ nav: navForm, social: socialForm });
                toast.success("تم حفظ إعدادات الهيدر والفوتر بنجاح");
              }}
              disabled={isSaving}
              className="rounded-xl font-black text-xs px-5 bg-amber-500 hover:bg-amber-400 text-black gap-1.5"
            >
              <Save size={13} />
              <span>{isSaving ? "جاري الحفظ..." : "حفظ التعديلات 💾"}</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-300 block">رقم الهاتف الموحد</label>
              <input
                type="text"
                value={navForm.phone || ""}
                onChange={(e) => setNavForm({ ...navForm, phone: e.target.value })}
                className="w-full rounded-xl border p-3 text-xs font-bold outline-none bg-white/5"
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-300 block">رقم الواتساب الرسمي (بدون +)</label>
              <input
                type="text"
                value={navForm.whatsapp || ""}
                onChange={(e) => setNavForm({ ...navForm, whatsapp: e.target.value })}
                className="w-full rounded-xl border p-3 text-xs font-bold outline-none bg-white/5"
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-300 block">البريد الإلكتروني الرسمي</label>
              <input
                type="email"
                value={navForm.email || ""}
                onChange={(e) => setNavForm({ ...navForm, email: e.target.value })}
                className="w-full rounded-xl border p-3 text-xs font-bold outline-none bg-white/5"
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-300 block">نص زر الإجراء بالهيدر (CTA Button)</label>
              <input
                type="text"
                value={navForm.ctaButtonText || ""}
                onChange={(e) => setNavForm({ ...navForm, ctaButtonText: e.target.value })}
                className="w-full rounded-xl border p-3 text-xs font-bold outline-none bg-white/5"
              />
            </div>
          </div>

          {/* Social Networks List */}
          <div className="pt-4 border-t border-current/10 space-y-3">
            <h4 className="text-xs font-black text-amber-400">حسابات التواصل الاجتماعي الرسمية</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-current/5 space-y-1.5">
                <span className="text-[11px] font-black block">حساب منصة إكس (تويتر)</span>
                <input
                  type="text"
                  value={socialForm.xUrl || ""}
                  onChange={(e) => setSocialForm({ ...socialForm, xUrl: e.target.value })}
                  placeholder="https://x.com/..."
                  className="w-full rounded-lg border p-2 text-xs font-bold outline-none bg-white/5"
                />
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-current/5 space-y-1.5">
                <span className="text-[11px] font-black block">حساب إنستغرام</span>
                <input
                  type="text"
                  value={socialForm.instagramUrl || ""}
                  onChange={(e) => setSocialForm({ ...socialForm, instagramUrl: e.target.value })}
                  placeholder="https://instagram.com/..."
                  className="w-full rounded-lg border p-2 text-xs font-bold outline-none bg-white/5"
                />
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-current/5 space-y-1.5">
                <span className="text-[11px] font-black block">قناة يوتيوب</span>
                <input
                  type="text"
                  value={socialForm.youtubeUrl || ""}
                  onChange={(e) => setSocialForm({ ...socialForm, youtubeUrl: e.target.value })}
                  placeholder="https://youtube.com/..."
                  className="w-full rounded-lg border p-2 text-xs font-bold outline-none bg-white/5"
                />
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-current/5 space-y-1.5">
                <span className="text-[11px] font-black block">حساب سناب شات</span>
                <input
                  type="text"
                  value={socialForm.snapchatUrl || ""}
                  onChange={(e) => setSocialForm({ ...socialForm, snapchatUrl: e.target.value })}
                  placeholder="https://snapchat.com/add/..."
                  className="w-full rounded-lg border p-2 text-xs font-bold outline-none bg-white/5"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: EMERGENCY TOP BANNER */}
      {subTab === "emergency" && (
        <div className={`p-6 rounded-3xl border space-y-6 ${dark ? "border-white/10 bg-[#0d1218]" : "border-black/10 bg-white shadow-xs"}`}>
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-current/10">
            <div>
              <h3 className="text-base font-black">شريط التنبيهات والقرارات العاجلة بأعلى الموقع</h3>
              <p className="text-xs text-slate-400 font-bold mt-0.5">
                يظهر كشريط علوي بارز للزوار (مثلاً: تعليق الدراسة الحضورية، إعلان بدء القبول، إجازة مطولة)
              </p>
            </div>
            <Button
              type="button"
              onClick={async () => {
                await onSaveOrchestration({ emergencyBanner: bannerForm });
                toast.success("تم تحديث البانر العاجل بنجاح");
              }}
              disabled={isSaving}
              className="rounded-xl font-black text-xs px-5 bg-amber-500 hover:bg-amber-400 text-black gap-1.5"
            >
              <Save size={13} />
              <span>{isSaving ? "جاري الحفظ..." : "حفظ البانر 💾"}</span>
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-current/10">
            <div>
              <h4 className="text-sm font-black">تفعيل الشريط العاجل الآن</h4>
              <p className="text-xs text-slate-400 font-bold mt-0.5">
                {bannerForm.enabled ? "الشريط ظاهر ومفعل في أعلى كافة الصفحات" : "الشريط مخفي حالياً"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setBannerForm({ ...bannerForm, enabled: !bannerForm.enabled })}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                bannerForm.enabled ? "bg-rose-500" : "bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow transition ease-in-out duration-200 ${
                  bannerForm.enabled ? "translate-x-0" : "-translate-x-5"
                }`}
              />
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-300 block">نوع التنبيه</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setBannerForm({ ...bannerForm, type: "urgent" })}
                  className={`flex-1 py-2 rounded-xl text-xs font-black border transition ${
                    bannerForm.type === "urgent"
                      ? "bg-rose-500 text-white border-rose-500"
                      : "border-current/10 text-slate-400"
                  }`}
                >
                  🔴 طوارئ وعاجل
                </button>
                <button
                  type="button"
                  onClick={() => setBannerForm({ ...bannerForm, type: "notice" })}
                  className={`flex-1 py-2 rounded-xl text-xs font-black border transition ${
                    bannerForm.type === "notice"
                      ? "bg-blue-500 text-white border-blue-500"
                      : "border-current/10 text-slate-400"
                  }`}
                >
                  🔵 إشعار وتنبيه
                </button>
                <button
                  type="button"
                  onClick={() => setBannerForm({ ...bannerForm, type: "celebration" })}
                  className={`flex-1 py-2 rounded-xl text-xs font-black border transition ${
                    bannerForm.type === "celebration"
                      ? "bg-amber-500 text-black border-amber-500"
                      : "border-current/10 text-slate-400"
                  }`}
                >
                  🟡 احتفال ومناسبة
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-300 block">نص التنبيه</label>
              <input
                type="text"
                value={bannerForm.text || ""}
                onChange={(e) => setBannerForm({ ...bannerForm, text: e.target.value })}
                placeholder="مثال: تعليق الدراسة الحضورية وتحويل التعليم عن بعد..."
                className="w-full rounded-xl border p-3 text-xs font-bold outline-none bg-white/5"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-300 block">رابط التوجيه (اختياري)</label>
                <input
                  type="text"
                  value={bannerForm.linkUrl || ""}
                  onChange={(e) => setBannerForm({ ...bannerForm, linkUrl: e.target.value })}
                  placeholder="https://schools.madrasati.sa"
                  className="w-full rounded-xl border p-3 text-xs font-bold outline-none bg-white/5"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-300 block">نص زر الرابط</label>
                <input
                  type="text"
                  value={bannerForm.linkText || ""}
                  onChange={(e) => setBannerForm({ ...bannerForm, linkText: e.target.value })}
                  placeholder="الدخول لمنصة مدرستي ↗"
                  className="w-full rounded-xl border p-3 text-xs font-bold outline-none bg-white/5"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: SYSTEM PORTALS */}
      {subTab === "portals" && (
        <div className={`p-6 rounded-3xl border space-y-4 ${dark ? "border-white/10 bg-[#0d1218]" : "border-black/10 bg-white shadow-xs"}`}>
          <div className="pb-4 border-b border-current/10">
            <h3 className="text-base font-black">بوابات الدخول السريع للمدارس</h3>
            <p className="text-xs text-slate-400 font-bold mt-0.5">
              روابط المنصات التعليمية الرسمية (نظام نور، مدرستي، كلاسيرا، فارس، وبوابات الموظفين وأولياء الأمور)
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-current/10 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black">منصة مدرستي</h4>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">التعليم الرقمي والواجبات</p>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/10 text-emerald-400">نشط</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-current/10 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black">نظام نور الوزاري</h4>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">النتائج وسجلات الطلاب</p>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/10 text-emerald-400">نشط</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-current/10 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black">نظام كلاسيرا الذكي</h4>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">إدارة التعلم التفاعلي</p>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/10 text-emerald-400">نشط</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-current/10 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black">نظام فارس للخدمات الذاتية</h4>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">شؤون المعلمين والموظفين</p>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/10 text-emerald-400">نشط</span>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: MARKETING PIXELS & SEO */}
      {subTab === "marketing" && (
        <div className={`p-6 rounded-3xl border space-y-6 ${dark ? "border-white/10 bg-[#0d1218]" : "border-black/10 bg-white shadow-xs"}`}>
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-current/10">
            <div>
              <h3 className="text-base font-black">أكواد التتبع والتسويق وبطاقات المشاركة SEO</h3>
              <p className="text-xs text-slate-400 font-bold mt-0.5">
                ربط بكسلات الإعلانات (Snapchat, Meta, TikTok) وإحصائيات Google، وتخصيص بطاقات المشاركة
              </p>
            </div>
            <Button
              type="button"
              onClick={async () => {
                await onSaveOrchestration({ marketingPixels: pixelsForm });
                toast.success("تم حفظ إعدادات التسويق وبكسلات التتبع بنجاح");
              }}
              disabled={isSaving}
              className="rounded-xl font-black text-xs px-5 bg-amber-500 hover:bg-amber-400 text-black gap-1.5"
            >
              <Save size={13} />
              <span>{isSaving ? "جاري الحفظ..." : "حفظ الإعدادات 💾"}</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-300 block">Snapchat Pixel ID</label>
              <input
                type="text"
                value={pixelsForm.snapchatPixelId || ""}
                onChange={(e) => setPixelsForm({ ...pixelsForm, snapchatPixelId: e.target.value })}
                placeholder="xxxx-xxxx-xxxx"
                className="w-full rounded-xl border p-3 text-xs font-mono outline-none bg-white/5"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-300 block">Meta (Facebook/Instagram) Pixel ID</label>
              <input
                type="text"
                value={pixelsForm.metaPixelId || ""}
                onChange={(e) => setPixelsForm({ ...pixelsForm, metaPixelId: e.target.value })}
                placeholder="1234567890..."
                className="w-full rounded-xl border p-3 text-xs font-mono outline-none bg-white/5"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-300 block">TikTok Pixel ID</label>
              <input
                type="text"
                value={pixelsForm.tiktokPixelId || ""}
                onChange={(e) => setPixelsForm({ ...pixelsForm, tiktokPixelId: e.target.value })}
                placeholder="Cxxxxxxx..."
                className="w-full rounded-xl border p-3 text-xs font-mono outline-none bg-white/5"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-300 block">Google Analytics ID (GA4)</label>
              <input
                type="text"
                value={pixelsForm.googleAnalyticsId || ""}
                onChange={(e) => setPixelsForm({ ...pixelsForm, googleAnalyticsId: e.target.value })}
                placeholder="G-XXXXXXXXXX"
                className="w-full rounded-xl border p-3 text-xs font-mono outline-none bg-white/5"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 5: NATIONAL SEASONS SWITCHER */}
      {subTab === "seasons" && (
        <div className={`p-6 rounded-3xl border space-y-6 ${dark ? "border-white/10 bg-[#0d1218]" : "border-black/10 bg-white shadow-xs"}`}>
          <div className="pb-4 border-b border-current/10">
            <h3 className="text-base font-black">محول المناسبات الوطنية والمواسم بنقرة زر 🇸🇦</h3>
            <p className="text-xs text-slate-400 font-bold mt-0.5">
              تغيير هوية وأجواء الموقع بالكامل ليتناسب مع المناسبات الوطنية والتعليمية الكبرى
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SEASONS.map((season) => {
              const isSelected = selectedSeason === season.id;
              return (
                <div
                  key={season.id}
                  onClick={() => setSelectedSeason(season.id)}
                  className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/5"
                      : "border-current/10 bg-white/[0.02] hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-black">{season.name}</h4>
                    {isSelected && <CheckCircle2 size={16} className="text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 font-bold">{season.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-current/10 flex justify-end">
            <Button
              type="button"
              onClick={async () => {
                await onSaveOrchestration({
                  theme: { ...currentTheme, season: selectedSeason },
                });
                toast.success(`تم تفعيل (${SEASONS.find((s) => s.id === selectedSeason)?.name}) بنجاح`);
              }}
              disabled={isSaving}
              className="rounded-xl font-black text-xs px-6 bg-amber-500 hover:bg-amber-400 text-black gap-2"
            >
              <Sparkles size={14} />
              <span>تطبيق الموسم على الموقع الحي 🚀</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
