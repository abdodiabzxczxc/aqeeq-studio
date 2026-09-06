import React, { useState } from "react";
import { ABOUT_UNFURLING_ITEMS } from "@/pages/AqeeqSchoolAboutPage";
import { ACCREDITATIONS_PARALLAX_PRODUCTS } from "@/pages/AqeeqSchoolAccreditationsPage";
import { DEFAULT_ADMISSIONS_ITEMS } from "@/components/ui/admissions-scroll-campus-backdrop";
import MediaLibrary, { MediaAsset } from "@/components/MediaLibrary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Building2,
  Award,
  GraduationCap,
  Sparkles,
  RotateCcw,
  Save,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

interface BackdropsManagerProps {
  orchestrationForm: any;
  setOrchestrationForm: React.Dispatch<React.SetStateAction<any>>;
  onSave: () => void;
  isSaving: boolean;
  dark?: boolean;
}

export function BackdropsManager({
  orchestrationForm,
  setOrchestrationForm,
  onSave,
  isSaving,
  dark = true,
}: BackdropsManagerProps) {
  const [activeTab, setActiveTab] = useState<"about" | "accreditations" | "admissions">("about");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeEditingKey, setActiveEditingKey] = useState<{ section: "about" | "accreditations" | "admissions"; index: number } | null>(null);

  // Initialize current backdrops lists or fall back to defaults
  const aboutItems = orchestrationForm.backdrops?.about || ABOUT_UNFURLING_ITEMS;
  const accreditationsItems = orchestrationForm.backdrops?.accreditations || ACCREDITATIONS_PARALLAX_PRODUCTS;
  const admissionsItems = orchestrationForm.backdrops?.admissions || DEFAULT_ADMISSIONS_ITEMS;

  const updateCardImage = (
    section: "about" | "accreditations" | "admissions",
    index: number,
    newUrl: string
  ) => {
    const currentList = [
      ...(section === "about"
        ? aboutItems
        : section === "accreditations"
        ? accreditationsItems
        : admissionsItems),
    ];

    const currentItem = currentList[index];
    if (!currentItem) return;

    if (section === "accreditations") {
      currentList[index] = { ...currentItem, thumbnail: newUrl };
    } else {
      currentList[index] = { ...currentItem, image: newUrl };
    }

    setOrchestrationForm((prev: any) => ({
      ...prev,
      backdrops: {
        ...(prev.backdrops || {}),
        [section]: currentList,
      },
    }));
  };

  const resetCardToDefault = (section: "about" | "accreditations" | "admissions", index: number) => {
    let defaultUrl = "";
    if (section === "about") defaultUrl = ABOUT_UNFURLING_ITEMS[index]?.image || "";
    else if (section === "accreditations") defaultUrl = ACCREDITATIONS_PARALLAX_PRODUCTS[index]?.thumbnail || "";
    else defaultUrl = DEFAULT_ADMISSIONS_ITEMS[index]?.image || "";

    updateCardImage(section, index, defaultUrl);
    toast.info("تمت استعادة الصورة الافتراضية للبطاقة");
  };

  const resetSectionToDefault = (section: "about" | "accreditations" | "admissions") => {
    setOrchestrationForm((prev: any) => ({
      ...prev,
      backdrops: {
        ...(prev.backdrops || {}),
        [section]: null,
      },
    }));
    toast.success("تمت استعادة كافة صور هذا القسم الافتراضية");
  };

  const openPickerFor = (section: "about" | "accreditations" | "admissions", index: number) => {
    setActiveEditingKey({ section, index });
    setPickerOpen(true);
  };

  const handleMediaSelect = (asset: MediaAsset) => {
    if (activeEditingKey) {
      updateCardImage(activeEditingKey.section, activeEditingKey.index, asset.url);
      toast.success("تم اختيار وتحديث الصورة بنجاح 🖼️");
    }
    setPickerOpen(false);
    setActiveEditingKey(null);
  };

  return (
    <div className={`space-y-6 rounded-3xl border p-6 md:p-8 ${dark ? "border-white/10 bg-[#080d14]/90 text-white" : "border-black/10 bg-white text-slate-900"}`}>
      {/* Header & Actions Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-current/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-black text-amber-400 mb-2">
            <Sparkles size={13} />
            <span>إدارة خلفيات المنصة المتحركة</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black">صور الخلفيات المتحركة (مدارسنا · الاعتمادات · القبول)</h2>
          <p className="mt-1 text-xs md:text-sm opacity-70">
            يمكنك من هنا استبدال أي صورة من صور الخلفيات التي تتدفق مع السكرول في صفحات المدارس بضغطة زر واحدة.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="flex-1 md:flex-none gap-2 bg-[#f8ca14] hover:bg-[#e6bb10] text-black font-black text-xs px-6 py-2.5 rounded-xl shadow-lg transition active:scale-95"
          >
            <Save size={15} />
            <span>{isSaving ? "جاري الحفظ..." : "حفظ التعديلات ونشرها 💾"}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => resetSectionToDefault(activeTab)}
            className="gap-1.5 text-xs font-bold rounded-xl border-current/20 hover:bg-red-500/10 hover:text-red-400"
            title="استعادة الصور الافتراضية لهذا القسم"
          >
            <RotateCcw size={14} />
            <span>استعادة الافتراضي</span>
          </Button>
        </div>
      </div>

      {/* Segmented Switcher for the 3 Backdrops */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl border border-current/10 bg-current/[0.03] overflow-x-auto scrollbar-hide">
        <button
          type="button"
          onClick={() => setActiveTab("about")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition ${
            activeTab === "about"
              ? dark ? "bg-[#f8ca14] text-black shadow-md" : "bg-[#08467d] text-white shadow-md"
              : "opacity-70 hover:opacity-100"
          }`}
        >
          <Building2 size={15} />
          <span>خلفية صفحة مدارسنا (/about)</span>
          <span className="rounded-full bg-black/10 px-2 py-0.5 text-[10px]">{aboutItems.length} صورة</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("accreditations")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition ${
            activeTab === "accreditations"
              ? dark ? "bg-[#f8ca14] text-black shadow-md" : "bg-[#08467d] text-white shadow-md"
              : "opacity-70 hover:opacity-100"
          }`}
        >
          <Award size={15} />
          <span>خلفية صفحة الاعتمادات (/accreditations)</span>
          <span className="rounded-full bg-black/10 px-2 py-0.5 text-[10px]">{accreditationsItems.length} صورة</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("admissions")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition ${
            activeTab === "admissions"
              ? dark ? "bg-[#f8ca14] text-black shadow-md" : "bg-[#08467d] text-white shadow-md"
              : "opacity-70 hover:opacity-100"
          }`}
        >
          <GraduationCap size={15} />
          <span>خلفية صفحة القبول والتسجيل (/admissions)</span>
          <span className="rounded-full bg-black/10 px-2 py-0.5 text-[10px]">{admissionsItems.length} صورة</span>
        </button>
      </div>

      {/* Grid of Background Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {(activeTab === "about"
          ? aboutItems
          : activeTab === "accreditations"
          ? accreditationsItems
          : admissionsItems
        ).map((item: any, idx: number) => {
          const imageUrl = activeTab === "accreditations" ? item.thumbnail : item.image;
          const badgeText = item.badge || item.category || item.date || `بطاقة ${idx + 1}`;

          return (
            <div
              key={`${activeTab}-card-${item.id || idx}`}
              className={`group flex flex-col justify-between rounded-2xl border p-3.5 transition duration-300 ${
                dark ? "border-white/10 bg-[#0e141f] hover:border-amber-400/40" : "border-slate-200 bg-slate-50 hover:border-[#08467d]/40"
              }`}
            >
              {/* Preview Thumbnail */}
              <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-black/50 border border-white/5 mb-3">
                <img
                  src={imageUrl}
                  alt={item.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/covers/cover-about.jpg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <span className="absolute top-2 right-2 rounded-lg bg-black/75 px-2 py-0.5 text-[10px] font-black text-amber-300 border border-white/10 backdrop-blur-md">
                  {badgeText}
                </span>
                <span className="absolute bottom-2 right-2 left-2 truncate text-xs font-black text-white drop-shadow">
                  {item.title}
                </span>
              </div>

              {/* URL Input & Pick Action */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={imageUrl || ""}
                    onChange={(e) => updateCardImage(activeTab, idx, e.target.value.trim())}
                    placeholder="رابط الصورة أو معرّف درايف..."
                    dir="ltr"
                    className="h-8 text-[11px] font-mono rounded-lg flex-1 bg-black/20 border-current/10"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => openPickerFor(activeTab, idx)}
                    className="h-8 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold gap-1 shrink-0"
                    title="اختيار صورة من مكتبة العقيق"
                  >
                    <ImageIcon size={13} />
                    <span>المكتبة</span>
                  </Button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => resetCardToDefault(activeTab, idx)}
                    className="text-[10px] opacity-60 hover:opacity-100 hover:text-red-400 transition cursor-pointer"
                  >
                    استعادة الأصل
                  </button>
                  <span className="text-[10px] font-mono opacity-40">#{idx + 1}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Save Trigger */}
      <div className="flex justify-end pt-4 border-t border-current/10">
        <Button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="gap-2 bg-[#f8ca14] hover:bg-[#e6bb10] text-black font-black text-sm px-8 py-3 rounded-2xl shadow-xl transition active:scale-95"
        >
          <Save size={16} />
          <span>{isSaving ? "جاري الحفظ..." : "حفظ ونشر التغييرات على الموقع فوراً 💾"}</span>
        </Button>
      </div>

      {/* Integrated Media Library Modal */}
      {pickerOpen && (
        <MediaLibrary
          open={pickerOpen}
          onClose={() => {
            setPickerOpen(false);
            setActiveEditingKey(null);
          }}
          onSelect={handleMediaSelect}
          accept="image"
        />
      )}
    </div>
  );
}
