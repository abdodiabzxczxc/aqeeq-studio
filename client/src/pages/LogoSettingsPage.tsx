import { trpc } from "@/lib/trpc";
import { Image as ImageIcon, Loader2, Save, Upload, FileText, Settings as SettingsIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import MediaLibrary from "../components/MediaLibrary";

export default function LogoSettingsPage() {
  const utils = trpc.useUtils();
  const { data: settings, isLoading } = trpc.settings.getAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const [ceremonyLogo, setCeremonyLogo] = useState("");
  const [schoolLogo, setSchoolLogo] = useState("");
  const [eventTitle, setEventTitle] = useState("منصة إدارة الفعاليات");
  const [eventSubtitle, setEventSubtitle] = useState("نظام تشغيل ذكي لكل حفلاتك ومناسباتك");
  const [dashboardTitle, setDashboardTitle] = useState("لوحة تحكم الإدارة");
  const [dashboardSubtitle, setDashboardSubtitle] = useState("إدارة الضيوف، البوابات، والإحصائيات الحية");
  const [attendeeFormTitle, setAttendeeFormTitle] = useState("إضافة ضيف جديد");
  const [attendeeModalDesc, setAttendeeModalDesc] = useState("أدخل بيانات الضيف بدقة لتوليد رمز التحقق وتذكرة الدخول.");
  const [brandPrimary, setBrandPrimary] = useState("#e5b84f");
  const [brandSecondary, setBrandSecondary] = useState("#18293a");
  const [brandSurface, setBrandSurface] = useState("#000000");
  const [brandFont, setBrandFont] = useState("Tajawal");

  const [uploadingCeremony, setUploadingCeremony] = useState(false);
  const [uploadingSchool, setUploadingSchool] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<"ceremony" | "school" | null>(null);

  useEffect(() => {
    if (settings) {
      if (settings.ceremony_logo) setCeremonyLogo(settings.ceremony_logo);
      else setCeremonyLogo("/manus-storage/logo_ceremony_2026_476bbf7a.png");

      if (settings.school_logo) setSchoolLogo(settings.school_logo);
      else setSchoolLogo("/manus-storage/logo_school_b7348eaa.png");

      if (settings.event_title) setEventTitle(settings.event_title);
      if (settings.event_subtitle) setEventSubtitle(settings.event_subtitle);
      if (settings.dashboard_title) setDashboardTitle(settings.dashboard_title);
      if (settings.dashboard_subtitle) setDashboardSubtitle(settings.dashboard_subtitle);
      if (settings.attendee_form_title) setAttendeeFormTitle(settings.attendee_form_title);
      if (settings.attendee_modal_desc) setAttendeeModalDesc(settings.attendee_modal_desc);
      if (settings.brand_primary) setBrandPrimary(settings.brand_primary);
      if (settings.brand_secondary) setBrandSecondary(settings.brand_secondary);
      if (settings.brand_surface) setBrandSurface(settings.brand_surface);
      if (settings.brand_font) setBrandFont(settings.brand_font);
    }
  }, [settings]);

  const updateMutation = trpc.settings.update.useMutation({
    onSuccess: () => {
      utils.settings.getAll.invalidate();
      utils.settings.getPublicLogos.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "حدث خطأ أثناء حفظ الإعدادات");
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "ceremony" | "school") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const supportedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];
    if (!supportedTypes.includes(file.type)) {
      toast.error("الصيغ المدعومة هي PNG أو JPG أو WEBP أو SVG");
      return;
    }

    const setUploading = type === "ceremony" ? setUploadingCeremony : setUploadingSchool;
    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        if (type === "ceremony") {
          setCeremonyLogo(base64);
        } else {
          setSchoolLogo(base64);
        }
        setUploading(false);
        toast.success("تم تحميل الشعار بنجاح. اضغط 'حفظ كافة التغييرات' أدناه لتثبيته.");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      toast.error("فشل رفع الصورة");
      setUploading(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await updateMutation.mutateAsync({ key: "ceremony_logo", value: ceremonyLogo });
      await updateMutation.mutateAsync({ key: "school_logo", value: schoolLogo });
      await updateMutation.mutateAsync({ key: "event_title", value: eventTitle });
      await updateMutation.mutateAsync({ key: "event_subtitle", value: eventSubtitle });
      await updateMutation.mutateAsync({ key: "dashboard_title", value: dashboardTitle });
      await updateMutation.mutateAsync({ key: "dashboard_subtitle", value: dashboardSubtitle });
      await updateMutation.mutateAsync({ key: "attendee_form_title", value: attendeeFormTitle });
      await updateMutation.mutateAsync({ key: "attendee_modal_desc", value: attendeeModalDesc });
      await updateMutation.mutateAsync({ key: "brand_primary", value: brandPrimary });
      await updateMutation.mutateAsync({ key: "brand_secondary", value: brandSecondary });
      await updateMutation.mutateAsync({ key: "brand_surface", value: brandSurface });
      await updateMutation.mutateAsync({ key: "brand_font", value: brandFont });

      toast.success("تم حفظ إعدادات المنصة ونصوص النظام والشعارات بنجاح!");
    } catch (error: any) {
      toast.error(error.message || "فشل حفظ التغييرات");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="animate-spin text-amber-400 mx-auto mb-3" size={32} />
        <p className="text-slate-400 text-sm">جارٍ تحميل إعدادات ونصوص المنصة...</p>
      </div>
    );
  }

  return (
    <><div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-amber-100 flex items-center gap-2">
            <SettingsIcon className="text-amber-400" size={26} />
            إدارة إعدادات ونصوص المنصة
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            قم بتخصيص شعارات الفعالية، عناوين لوحة التحكم، ونصوص نماذج إضافة الضيوف بكل سهولة لتنعكس فوراً في جميع أنحاء النظام.
          </p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-amber-950 transition-all hover:opacity-90 disabled:opacity-50 shadow-lg shadow-amber-500/20"
          style={{ background: "var(--gold-gradient)" }}
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          حفظ كافة التغييرات
        </button>
      </div>

      {/* Section 1: Logos */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-amber-200 border-b border-amber-500/20 pb-2 flex items-center gap-2"><SettingsIcon size={20} className="text-amber-400" />هوية الموقع المركزية</h3>
        <p className="text-xs leading-6 text-slate-400">غيّر الألوان والخط مرة واحدة لتظهر رموز الهوية الجديدة في القوالب والأدوات والمشاهد التي تعتمد على هوية العقيق.</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[{ label: "اللون الأساسي", value: brandPrimary, onChange: setBrandPrimary }, { label: "اللون الثانوي", value: brandSecondary, onChange: setBrandSecondary }, { label: "خلفية الموقع", value: brandSurface, onChange: setBrandSurface }].map((field) => <label key={field.label} className="card-dark rounded-2xl border border-amber-500/10 p-4 text-xs font-bold text-amber-100">{field.label}<div className="mt-3 flex overflow-hidden rounded-xl border border-slate-700 bg-black/30"><input type="color" value={field.value} onChange={(event) => field.onChange(event.target.value)} className="h-10 w-12 bg-transparent p-1" /><input value={field.value} onChange={(event) => field.onChange(event.target.value)} className="min-w-0 flex-1 bg-transparent px-2 text-xs text-white outline-none" /></div></label>)}<label className="card-dark rounded-2xl border border-amber-500/10 p-4 text-xs font-bold text-amber-100">خط المنصة<select value={brandFont} onChange={(event) => setBrandFont(event.target.value)} className="mt-3 w-full rounded-xl border border-slate-700 bg-black/30 px-3 py-2.5 text-xs text-white outline-none"><option value="Tajawal">Tajawal</option><option value="Cairo">Cairo</option><option value="IBM Plex Sans Arabic">IBM Plex Sans Arabic</option></select></label></div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-amber-200 border-b border-amber-500/20 pb-2 flex items-center gap-2">
          <ImageIcon size={20} className="text-amber-400" />
          شعار الفعالية وشعار الجهة المنظمة
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ceremony Logo */}
          <div className="card-dark rounded-2xl p-6 space-y-4 border border-amber-500/10">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-100 text-sm">شعار الفعالية (الرئيسي)</span>
              <span className="text-xs text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg">الصفحة الرئيسية والدعوات</span>
            </div>

            <div
              className="h-44 rounded-xl border border-dashed flex items-center justify-center p-4 relative overflow-hidden bg-black/40"
              style={{ borderColor: "oklch(28% 0.025 250)" }}
            >
              {ceremonyLogo ? (
                <img src={ceremonyLogo} alt="شعار الفعالية" className="max-h-32 object-contain" />
              ) : (
                <ImageIcon className="text-slate-600" size={48} />
              )}
            </div>

            <div>
              <label className="block w-full cursor-pointer">
                <div
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold border transition-all hover:bg-amber-400/5 text-amber-400"
                  style={{ borderColor: "oklch(66% 0.20 70 / 0.3)" }}
                >
                  {uploadingCeremony ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                  <span>تغيير شعار الفعالية</span>
                </div>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, "ceremony")}
                />
              </label>
              <button onClick={() => setMediaTarget("ceremony")} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-sky-400/30 py-2.5 text-xs font-bold text-sky-200 transition hover:bg-sky-400/[0.06]"><ImageIcon size={15} />اختيار من مكتبة الوسائط</button>
            </div>
          </div>

          {/* School Logo */}
          <div className="card-dark rounded-2xl p-6 space-y-4 border border-amber-500/10">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-100 text-sm">شعار مدارس العقيق</span>
              <span className="text-xs text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg">الهيدر والفوتر</span>
            </div>

            <div
              className="h-44 rounded-xl border border-dashed flex items-center justify-center p-4 relative overflow-hidden bg-black/40"
              style={{ borderColor: "oklch(28% 0.025 250)" }}
            >
              {schoolLogo ? (
                <img src={schoolLogo} alt="شعار المدرسة" className="max-h-24 object-contain" />
              ) : (
                <ImageIcon className="text-slate-600" size={48} />
              )}
            </div>

            <div>
              <label className="block w-full cursor-pointer">
                <div
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold border transition-all hover:bg-amber-400/5 text-amber-400"
                  style={{ borderColor: "oklch(66% 0.20 70 / 0.3)" }}
                >
                  {uploadingSchool ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                  <span>تغيير شعار المدرسة</span>
                </div>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, "school")}
                />
              </label>
              <button onClick={() => setMediaTarget("school")} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-sky-400/30 py-2.5 text-xs font-bold text-sky-200 transition hover:bg-sky-400/[0.06]"><ImageIcon size={15} />اختيار من مكتبة الوسائط</button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Platform & Dashboard Texts */}
      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-bold text-amber-200 border-b border-amber-500/20 pb-2 flex items-center gap-2">
          <FileText size={20} className="text-amber-400" />
          عناوين ونصوص لوحة التحكم والصفحة الرئيسية
        </h3>

        <div className="card-dark rounded-2xl p-6 space-y-6 border border-amber-500/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">عنوان الفعالية الرئيسي (الصفحة الرئيسية)</label>
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full bg-black/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">الوصف التعريفي للفعالية</label>
              <input
                type="text"
                value={eventSubtitle}
                onChange={(e) => setEventSubtitle(e.target.value)}
                className="w-full bg-black/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">عنوان لوحة التحكم (الرئيسي)</label>
              <input
                type="text"
                value={dashboardTitle}
                onChange={(e) => setDashboardTitle(e.target.value)}
                className="w-full bg-black/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">وصف لوحة التحكم الفرعي</label>
              <input
                type="text"
                value={dashboardSubtitle}
                onChange={(e) => setDashboardSubtitle(e.target.value)}
                className="w-full bg-black/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Attendee Form & Modal Texts */}
      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-bold text-amber-200 border-b border-amber-500/20 pb-2 flex items-center gap-2">
          <FileText size={20} className="text-amber-400" />
          تسميات نموذج إضافة وتعديل الضيوف
        </h3>

        <div className="card-dark rounded-2xl p-6 space-y-6 border border-amber-500/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">عنوان نموذج إضافة ضيف جديد</label>
              <input
                type="text"
                value={attendeeFormTitle}
                onChange={(e) => setAttendeeFormTitle(e.target.value)}
                className="w-full bg-black/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">وصف نافذة إضافة الضيف</label>
              <input
                type="text"
                value={attendeeModalDesc}
                onChange={(e) => setAttendeeModalDesc(e.target.value)}
                className="w-full bg-black/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-amber-950 transition-all hover:opacity-90 disabled:opacity-50 shadow-xl shadow-amber-500/20"
          style={{ background: "var(--gold-gradient)" }}
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          حفظ كافة التغييرات وتطبيقها فوراً
        </button>
      </div>
    </div><MediaLibrary open={Boolean(mediaTarget)} onClose={() => setMediaTarget(null)} accept="image" onSelect={(asset) => { if (mediaTarget === "ceremony") setCeremonyLogo(asset.url); if (mediaTarget === "school") setSchoolLogo(asset.url); setMediaTarget(null); toast.success("تم اختيار الشعار من المكتبة؛ اضغط حفظ كافة التغييرات لتطبيقه."); }} /></>
  );
}
