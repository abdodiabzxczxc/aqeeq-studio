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
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  ExternalLink,
  Briefcase,
  PhoneCall,
  Video,
  Ticket,
  Cloud,
  Server,
  Shield,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_SYSTEM_PORTALS,
  SystemPortalItem,
  SystemPortalCategory,
  PORTAL_CATEGORY_LABELS,
  AVAILABLE_PORTAL_ICONS,
  PORTAL_ICON_CATEGORY_LABELS,
  PortalIconCategory,
} from "@shared/portals";
import { renderPortalIcon } from "@/components/PortalIconRenderer";

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

  // 1. Top Utility Bar Form (بوابة التوظيف وأرقام الاستقبال)
  const currentTopBar = orchestration?.topBar || {
    enabled: true,
    locationText: "المدينة المنورة — المملكة العربية السعودية",
    locationUrl: "https://maps.google.com/?q=Alaqeeq+Schools+Madinah",
    locationEnabled: true,
    phone: "+966 53 189 6000",
    phoneUrl: "tel:+966531896000",
    phoneEnabled: true,
    email: "info@alaqeeqholding.com",
    emailUrl: "mailto:info@alaqeeqholding.com",
    emailEnabled: true,
    jobsText: "بوابة التوظيف",
    jobsUrl: "https://live.aqeeq.edu.sa/jobs",
    jobsEnabled: true,
    workingHours: "أوقات الاستقبال: الأحد - الخميس 7:00 ص - 2:30 م",
    workingHoursEnabled: true,
  };
  const [topBarForm, setTopBarForm] = useState(currentTopBar);

  // 2. Nav & Header Form
  const currentNav = orchestration?.nav || {};
  const [navForm, setNavForm] = useState(currentNav);

  // 3. Social Form (10 Platforms with URLs and Show/Hide Toggles)
  const currentSocial = orchestration?.social || {};
  const [socialForm, setSocialForm] = useState<Record<string, any>>({
    xUrl: currentSocial.xUrl || "",
    xEnabled: currentSocial.xEnabled !== false,
    instagramUrl: currentSocial.instagramUrl || "",
    instagramEnabled: currentSocial.instagramEnabled !== false,
    youtubeUrl: currentSocial.youtubeUrl || "",
    youtubeEnabled: currentSocial.youtubeEnabled !== false,
    snapchatUrl: currentSocial.snapchatUrl || "",
    snapchatEnabled: currentSocial.snapchatEnabled !== false,
    tiktokUrl: currentSocial.tiktokUrl || "",
    tiktokEnabled: currentSocial.tiktokEnabled !== false,
    facebookUrl: currentSocial.facebookUrl || "",
    facebookEnabled: currentSocial.facebookEnabled !== false,
    linkedinUrl: currentSocial.linkedinUrl || "",
    linkedinEnabled: currentSocial.linkedinEnabled !== false,
    telegramUrl: currentSocial.telegramUrl || "",
    telegramEnabled: currentSocial.telegramEnabled !== false,
    whatsappUrl: currentSocial.whatsappUrl || "",
    whatsappEnabled: currentSocial.whatsappEnabled !== false,
    phoneUrl: currentSocial.phoneUrl || "",
    phoneEnabled: currentSocial.phoneEnabled !== false,
  });

  const SOCIAL_NETWORKS_CONFIG = [
    { key: "x", name: "1. منصة إكس (تويتر)", sub: "X / Twitter", placeholder: "https://x.com/alaqeeq..." },
    { key: "instagram", name: "2. إنستغرام", sub: "Instagram", placeholder: "https://instagram.com/alaqeeq..." },
    { key: "youtube", name: "3. قناة يوتيوب", sub: "YouTube", placeholder: "https://youtube.com/@alaqeeq..." },
    { key: "snapchat", name: "4. سناب شات", sub: "Snapchat", placeholder: "https://snapchat.com/add/..." },
    { key: "tiktok", name: "5. تيك توك", sub: "TikTok", placeholder: "https://tiktok.com/@alaqeeq..." },
    { key: "facebook", name: "6. فيسبوك", sub: "Facebook", placeholder: "https://facebook.com/alaqeeq..." },
    { key: "linkedin", name: "7. لينكد إن", sub: "LinkedIn", placeholder: "https://linkedin.com/company/alaqeeq..." },
    { key: "telegram", name: "8. قناة تيليجرام", sub: "Telegram", placeholder: "https://t.me/alaqeeq..." },
    { key: "whatsapp", name: "9. واتساب الموحد", sub: "WhatsApp (+966)", placeholder: "https://wa.me/966531896000" },
    { key: "phone", name: "10. الهاتف الموحد / الاتصال", sub: "Phone Call", placeholder: "tel:+966531896000" },
  ];

  // 4. System Portals Form
  const [portalsList, setPortalsList] = useState<SystemPortalItem[]>(
    orchestration?.systemPortals && orchestration.systemPortals.length > 0
      ? orchestration.systemPortals
      : DEFAULT_SYSTEM_PORTALS
  );
  const [isAddingPortal, setIsAddingPortal] = useState(false);
  const [newPortalTitle, setNewPortalTitle] = useState("");
  const [newPortalDesc, setNewPortalDesc] = useState("");
  const [newPortalUrl, setNewPortalUrl] = useState("");
  const [newPortalCategory, setNewPortalCategory] = useState<SystemPortalCategory>("parents_students");
  const [newPortalIcon, setNewPortalIcon] = useState("file-text");
  const [newPortalBadge, setNewPortalBadge] = useState("");

  // 5. Emergency Banner Form
  const currentBanner = orchestration?.emergencyBanner || {};
  const [bannerForm, setBannerForm] = useState(currentBanner);

  // 6. Marketing Pixels Form
  const currentPixels = orchestration?.marketingPixels || {};
  const [pixelsForm, setPixelsForm] = useState(currentPixels);

  // 7. Seasons Form
  const currentTheme = orchestration?.theme || {};
  const [selectedSeason, setSelectedSeason] = useState<string>(currentTheme?.season || "default");

  const SEASONS = [
    { id: "default", name: "الهوية الرسمية الأصلية 🏛️", desc: "أزرق ياقوتي ملكي مع ذهب العقيق المعتمد" },
    { id: "national_day", name: "اليوم الوطني السعودي 94 🇸🇦", desc: "أخضر زمردي ملكي وبانرات الاحتفاء الوطنية" },
    { id: "founding_day", name: "يوم التأسيس السعودي 🇸🇦", desc: "ألوان تراثية دافئة ونقوش يوم التأسيس" },
    { id: "ramadan", name: "شهر رمضان المبارك 🌙", desc: "ثيم الشهر الفضيل، أوقات الدوام، والتهاني" },
    { id: "exams", name: "موسم الاختبارات النهائية 📝", desc: "أدعية التوفيق ونصائح وإرشادات اللجان" },
  ];

  // Portals Helper Functions
  const handleTogglePortalVisibility = (id: string) => {
    setPortalsList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, visible: !p.visible } : p))
    );
  };

  const handleMovePortal = (id: string, direction: "up" | "down") => {
    const list = [...portalsList];
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) return;
    if (direction === "up" && index > 0) {
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
    } else if (direction === "down" && index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
    }
    const reordered = list.map((p, idx) => ({ ...p, order: idx + 1 }));
    setPortalsList(reordered);
  };

  const handleDeletePortal = (id: string) => {
    setPortalsList((prev) =>
      prev.filter((p) => p.id !== id).map((p, idx) => ({ ...p, order: idx + 1 }))
    );
    toast.success("تم حذف البوابة من القائمة");
  };

  const handleAddPortal = () => {
    if (!newPortalTitle.trim() || !newPortalUrl.trim()) {
      toast.error("يرجى إدخال اسم البوابة ورابط التوجيه");
      return;
    }
    const newP: SystemPortalItem = {
      id: "portal-" + Date.now(),
      title: newPortalTitle.trim(),
      description: newPortalDesc.trim(),
      url: newPortalUrl.trim(),
      category: newPortalCategory,
      iconName: newPortalIcon,
      badge: newPortalBadge.trim() || undefined,
      visible: true,
      order: portalsList.length + 1,
      openInNewTab: true,
    };
    setPortalsList([...portalsList, newP]);
    setNewPortalTitle("");
    setNewPortalDesc("");
    setNewPortalUrl("");
    setNewPortalBadge("");
    setIsAddingPortal(false);
    toast.success("تمت إضافة البوابة بنجاح ➕");
  };

  const handleResetPortalsToDefault = () => {
    setPortalsList(DEFAULT_SYSTEM_PORTALS);
    toast.info("تمت استعادة بوابات المدارس الافتراضية 🔄");
  };

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
              إدارة الهيدر والفوتر، بوابة التوظيف، شبكات التواصل الـ 10، بوابات المدارس، وبكسلات التسويق
            </p>
          </div>
        </div>

        {/* Sub-tab Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-current/10">
          <button
            type="button"
            onClick={() => setSubTab("header_footer")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              subTab === "header_footer"
                ? dark ? "bg-[#f8ca14] text-black shadow" : "bg-[#08467d] text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>الهيدر والتوظيف والسوشيال 📱</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab("portals")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              subTab === "portals"
                ? dark ? "bg-[#f8ca14] text-black shadow" : "bg-[#08467d] text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Server size={13} />
            <span>بوابات الأنظمة والخدمات ({portalsList.length}) 🚪</span>
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

      {/* SUBTAB 1: HEADER & FOOTER & JOBS & 10 SOCIAL CHANNELS */}
      {subTab === "header_footer" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Section 1A: Top Utility Bar & Employment Portal (بوابة التوظيف) */}
          <div className={`p-6 rounded-3xl border space-y-6 ${dark ? "border-white/10 bg-[#0d1218]" : "border-black/10 bg-white shadow-xs"}`}>
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-current/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Briefcase size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black">الشريط العلوي الرئاسي وبوابة التوظيف (Top Utility Bar)</h3>
                  <p className="text-xs text-slate-400 font-bold mt-0.5">
                    التحكم في زر بوابة التوظيف، أوقات الاستقبال والدوام، وأرقام التواصل الرسمية بأعلى الموقع
                  </p>
                </div>
              </div>
              <Button
                type="button"
                onClick={async () => {
                  await onSaveOrchestration({
                    topBar: topBarForm,
                    nav: navForm,
                    social: socialForm,
                  });
                  toast.success("تم حفظ إعدادات الهيدر وبوابة التوظيف بنجاح ✅");
                }}
                disabled={isSaving}
                className="rounded-xl font-black text-xs px-5 bg-amber-500 hover:bg-amber-400 text-black gap-1.5 cursor-pointer"
              >
                <Save size={13} />
                <span>{isSaving ? "جاري الحفظ..." : "حفظ التعديلات 💾"}</span>
              </Button>
            </div>

            {/* Employment Portal Box (بوابة التوظيف) */}
            <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase size={16} className="text-amber-400" />
                  <h4 className="text-xs font-black text-amber-400">إعدادات بوابة التوظيف الرسمية</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400">
                    {topBarForm.jobsEnabled ? "مفعلة وتظهر بالهيدر 🟢" : "مخفية مؤقتاً ⚪"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setTopBarForm({ ...topBarForm, jobsEnabled: !topBarForm.jobsEnabled })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      topBarForm.jobsEnabled ? "bg-amber-500" : "bg-slate-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                        topBarForm.jobsEnabled ? "translate-x-0" : "-translate-x-5"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">نص زر بوابة التوظيف</label>
                  <input
                    type="text"
                    value={topBarForm.jobsText || ""}
                    onChange={(e) => setTopBarForm({ ...topBarForm, jobsText: e.target.value })}
                    placeholder="بوابة التوظيف"
                    className="w-full rounded-xl border p-2.5 text-xs font-bold outline-none bg-white/5"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">رابط بوابة التقديم والوظائف (URL)</label>
                  <input
                    type="text"
                    value={topBarForm.jobsUrl || ""}
                    onChange={(e) => setTopBarForm({ ...topBarForm, jobsUrl: e.target.value })}
                    placeholder="https://live.aqeeq.edu.sa/jobs"
                    className="w-full rounded-xl border p-2.5 text-xs font-mono outline-none bg-white/5"
                  />
                </div>
              </div>
            </div>

            {/* Other Top Bar Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 block">ساعات الدوام وأوقات الاستقبال</label>
                <input
                  type="text"
                  value={topBarForm.workingHours || ""}
                  onChange={(e) => setTopBarForm({ ...topBarForm, workingHours: e.target.value })}
                  placeholder="أوقات الاستقبال: الأحد - الخميس 7:00 ص - 2:30 م"
                  className="w-full rounded-xl border p-2.5 text-xs font-bold outline-none bg-white/5"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 block">نص الموقع الجغرافي بالهيدر</label>
                <input
                  type="text"
                  value={topBarForm.locationText || ""}
                  onChange={(e) => setTopBarForm({ ...topBarForm, locationText: e.target.value })}
                  placeholder="المدينة المنورة — المملكة العربية السعودية"
                  className="w-full rounded-xl border p-2.5 text-xs font-bold outline-none bg-white/5"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 block">رابط خرائط جوجل للمدارس</label>
                <input
                  type="text"
                  value={topBarForm.locationUrl || ""}
                  onChange={(e) => setTopBarForm({ ...topBarForm, locationUrl: e.target.value })}
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full rounded-xl border p-2.5 text-xs font-mono outline-none bg-white/5"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 block">نص زر الإجراء بالهيدر (CTA Button)</label>
                <input
                  type="text"
                  value={navForm.ctaButtonText || "القبول والتسجيل 🎓"}
                  onChange={(e) => setNavForm({ ...navForm, ctaButtonText: e.target.value })}
                  className="w-full rounded-xl border p-2.5 text-xs font-bold outline-none bg-white/5"
                />
              </div>
            </div>
          </div>

          {/* Section 1B: The 10 Official Social Media Platforms (شبكات التواصل الاجتماعي الـ 10) */}
          <div className={`p-6 rounded-3xl border space-y-5 ${dark ? "border-white/10 bg-[#0d1218]" : "border-black/10 bg-white shadow-xs"}`}>
            <div className="flex items-center justify-between pb-3 border-b border-current/10">
              <div>
                <h3 className="text-base font-black">شبكات التواصل الاجتماعي الرسمية (10 قنوات معتمدة) 📱🔗</h3>
                <p className="text-xs text-slate-400 font-bold mt-0.5">
                  تظهر في الترويسة والفوتر وشريط الاتصال السريع، وتغذي شارات التواصل بالموقع
                </p>
              </div>
              <span className="text-xs font-black text-amber-400 bg-amber-400/10 px-3 py-1 rounded-xl border border-amber-400/20">
                10 قنوات كاملة
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {SOCIAL_NETWORKS_CONFIG.map((net) => {
                const urlKey = `${net.key}Url`;
                const enabledKey = `${net.key}Enabled`;
                const isEnabled = socialForm[enabledKey] !== false;
                const urlValue = socialForm[urlKey] || "";

                return (
                  <div key={net.key} className="p-3.5 rounded-2xl bg-white/[0.02] border border-current/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-black block">{net.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{net.sub}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400">
                          {isEnabled ? "ظاهر 🟢" : "مخفي ⚪"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSocialForm((prev) => ({ ...prev, [enabledKey]: !isEnabled }))}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                            isEnabled ? "bg-amber-400" : "bg-slate-700"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
                              isEnabled ? "translate-x-0" : "-translate-x-4"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={urlValue}
                      onChange={(e) => setSocialForm((prev) => ({ ...prev, [urlKey]: e.target.value }))}
                      placeholder={net.placeholder}
                      className="w-full rounded-xl border p-2 text-xs font-mono outline-none bg-white/5"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: INTERACTIVE SYSTEM PORTALS MANAGER (بوابات الأنظمة والخدمات) */}
      {subTab === "portals" && (
        <div className={`p-6 rounded-3xl border space-y-6 animate-in fade-in duration-200 ${
          dark ? "border-white/10 bg-[#0d1218]" : "border-black/10 bg-white shadow-xs"
        }`}>
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-current/10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Server size={20} />
              </div>
              <div>
                <h3 className="text-base font-black">مدير بوابات الأنظمة والخدمات المدرسية ({portalsList.length} بوابة)</h3>
                <p className="text-xs text-slate-400 font-bold mt-0.5">
                  إضافة وتعديل وترتيب بوابات الدخول السريع في القائمة المنسدلة وشريط الخدمات بالموقع
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                onClick={handleResetPortalsToDefault}
                variant="outline"
                className="text-xs font-bold gap-1.5 rounded-xl border-dashed cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>استعادة الافتراضيات</span>
              </Button>

              <Button
                type="button"
                onClick={() => setIsAddingPortal(!isAddingPortal)}
                className="bg-amber-400 hover:bg-amber-500 text-black font-black text-xs gap-1.5 rounded-xl cursor-pointer"
              >
                <Plus size={14} />
                <span>إضافة بوابة جديدة ➕</span>
              </Button>

              <Button
                type="button"
                onClick={async () => {
                  await onSaveOrchestration({ systemPortals: portalsList });
                  toast.success("تم حفظ بوابات المدارس بنجاح ✅");
                }}
                disabled={isSaving}
                className="rounded-xl font-black text-xs px-5 bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 cursor-pointer"
              >
                <Save size={13} />
                <span>{isSaving ? "جارِ الحفظ..." : "حفظ التغييرات 💾"}</span>
              </Button>
            </div>
          </div>

          {/* Add Portal Inline Box */}
          {isAddingPortal && (
            <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-4 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-amber-400">إضافة بوابة نظام أو خدمة جديدة</h4>
                <button
                  type="button"
                  onClick={() => setIsAddingPortal(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  إلغاء ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">اسم البوابة</label>
                  <input
                    type="text"
                    value={newPortalTitle}
                    onChange={(e) => setNewPortalTitle(e.target.value)}
                    placeholder="مثال: نظام كلاسيرا الذكي"
                    className="w-full rounded-xl border p-2.5 text-xs font-bold outline-none bg-white/5"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">وصف مختصر للبوابة</label>
                  <input
                    type="text"
                    value={newPortalDesc}
                    onChange={(e) => setNewPortalDesc(e.target.value)}
                    placeholder="مثال: إدارة التعلم التفاعلي والواجبات"
                    className="w-full rounded-xl border p-2.5 text-xs font-bold outline-none bg-white/5"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">رابط الدخول (URL)</label>
                  <input
                    type="text"
                    value={newPortalUrl}
                    onChange={(e) => setNewPortalUrl(e.target.value)}
                    placeholder="https://me.classera.com"
                    className="w-full rounded-xl border p-2.5 text-xs font-mono outline-none bg-white/5"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">تصنيف البوابة</label>
                  <select
                    value={newPortalCategory}
                    onChange={(e) => setNewPortalCategory(e.target.value as any)}
                    className="w-full rounded-xl border p-2.5 text-xs font-bold outline-none bg-white/5"
                  >
                    <option value="parents_students">خدمات أولياء الأمور والطلاب</option>
                    <option value="staff_admin">الأنظمة الإدارية والموظفين</option>
                    <option value="public">خدمات ومنصات عامة</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">شارة البوابة (Badge اختياري)</label>
                  <input
                    type="text"
                    value={newPortalBadge}
                    onChange={(e) => setNewPortalBadge(e.target.value)}
                    placeholder="مثال: جديد أو LMS"
                    className="w-full rounded-xl border p-2.5 text-xs font-bold outline-none bg-white/5"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">أيقونة البوابة</label>
                  <select
                    value={newPortalIcon}
                    onChange={(e) => setNewPortalIcon(e.target.value)}
                    className="w-full rounded-xl border p-2.5 text-xs font-bold outline-none bg-white/5"
                  >
                    {AVAILABLE_PORTAL_ICONS.slice(0, 25).map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label} ({opt.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  onClick={handleAddPortal}
                  className="bg-amber-400 hover:bg-amber-500 text-black font-black text-xs px-6 rounded-xl cursor-pointer"
                >
                  إضافة البوابة للقائمة ➕
                </Button>
              </div>
            </div>
          )}

          {/* Portals List Cards */}
          <div className="space-y-3">
            {portalsList.map((portal, idx) => (
              <div
                key={portal.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  portal.visible
                    ? dark ? "bg-white/[0.02] border-white/10 hover:border-white/20" : "bg-slate-50/70 border-black/10 hover:border-black/20"
                    : "opacity-40 bg-black/20 border-dashed border-current/10"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 shrink-0">
                    {renderPortalIcon(portal.iconName, 18)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black">{portal.title}</h4>
                      {portal.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-400/15 text-amber-400 border border-amber-400/20">
                          {portal.badge}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
                        {PORTAL_CATEGORY_LABELS[portal.category] || portal.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-bold mt-0.5">{portal.description}</p>
                    <a
                      href={portal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue-400 hover:underline inline-flex items-center gap-1 mt-1 font-mono"
                    >
                      <span>{portal.url}</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Move Up/Down */}
                  <button
                    type="button"
                    onClick={() => handleMovePortal(portal.id, "up")}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg border text-slate-300 hover:text-white disabled:opacity-20 cursor-pointer"
                    title="تحريك لأعلى"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMovePortal(portal.id, "down")}
                    disabled={idx === portalsList.length - 1}
                    className="p-1.5 rounded-lg border text-slate-300 hover:text-white disabled:opacity-20 cursor-pointer"
                    title="تحريك لأسفل"
                  >
                    <ArrowDown size={14} />
                  </button>

                  {/* Toggle Visibility */}
                  <button
                    type="button"
                    onClick={() => handleTogglePortalVisibility(portal.id)}
                    className={`p-1.5 rounded-lg border transition cursor-pointer ${
                      portal.visible ? "text-emerald-400 hover:bg-emerald-400/10" : "text-slate-500 hover:bg-white/5"
                    }`}
                    title={portal.visible ? "إخفاء من الموقع" : "إظهار في الموقع"}
                  >
                    {portal.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDeletePortal(portal.id)}
                    className="p-1.5 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                    title="حذف البوابة"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: EMERGENCY TOP BANNER */}
      {subTab === "emergency" && (
        <div className={`p-6 rounded-3xl border space-y-6 ${dark ? "border-white/10 bg-[#0d1218]" : "border-black/10 bg-white shadow-xs"}`}>
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-current/10">
            <div>
              <h3 className="text-base font-black">شريط التنبيهات والقرارات العاجلة بأعلى الموقع</h3>
              <p className="text-xs text-slate-400 font-bold mt-0.5">
                تفعيل شريط أحمر أو أزرق أو ذهبي في قمة صفحات الموقع لبث خبر عاجل أو تعليق دراسة أو تهنئة
              </p>
            </div>
            <Button
              type="button"
              onClick={async () => {
                await onSaveOrchestration({ emergencyBanner: bannerForm });
                toast.success("تم حفظ إعدادات البانر العاجل بنجاح");
              }}
              disabled={isSaving}
              className="rounded-xl font-black text-xs px-5 bg-amber-500 hover:bg-amber-400 text-black gap-1.5 cursor-pointer"
            >
              <Save size={13} />
              <span>{isSaving ? "جاري الحفظ..." : "حفظ التعديلات 💾"}</span>
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
              className="rounded-xl font-black text-xs px-5 bg-amber-500 hover:bg-amber-400 text-black gap-1.5 cursor-pointer"
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
              className="rounded-xl font-black text-xs px-6 bg-amber-500 hover:bg-amber-400 text-black gap-2 cursor-pointer"
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
