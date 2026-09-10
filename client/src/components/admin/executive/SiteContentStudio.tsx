import React, { useState } from "react";
import {
  Globe,
  Home,
  Building2,
  ShieldCheck,
  DollarSign,
  Layers,
  Sparkles,
  Save,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { HomepageContentManager } from "@/components/admin/content/HomepageContentManager";
import { AboutPageContentManager } from "@/components/admin/content/AboutPageContentManager";
import { AccreditationsContentManager } from "@/components/admin/content/AccreditationsContentManager";
import { TuitionFeesContentManager } from "@/components/admin/content/TuitionFeesContentManager";

interface SiteContentStudioProps {
  dark: boolean;
  orchestration: any;
  onSaveOrchestration: (updated: any) => Promise<void>;
  isSaving: boolean;
}

export function SiteContentStudio({
  dark,
  orchestration,
  onSaveOrchestration,
  isSaving,
}: SiteContentStudioProps) {
  const [activeSection, setActiveSection] = useState<
    "homepage" | "about" | "accreditations" | "fees" | "covers"
  >("homepage");

  // Hero Covers State
  const currentHero = orchestration?.heroCovers || {};
  const [heroForm, setHeroForm] = useState(currentHero);

  const SECTIONS: Array<{
    id: "homepage" | "about" | "accreditations" | "fees" | "covers";
    label: string;
    icon: any;
    desc: string;
  }> = [
    {
      id: "homepage",
      label: "الرئيسية 🏠",
      icon: Home,
      desc: "القصص 24H · شبكة البنتو · العدادات الحية",
    },
    {
      id: "about",
      label: "مدارسنا 🏛️",
      icon: Building2,
      desc: "رؤية 2030 · القيادات التربوية · المرافق",
    },
    {
      id: "accreditations",
      label: "الاعتمادات 🛡️",
      icon: ShieldCheck,
      desc: "كوجنيا · مراكز الاختبارات · جوائز التميز",
    },
    {
      id: "fees",
      label: "الرسوم والدراسة 💰",
      icon: DollarSign,
      desc: "مصفوفة الرسوم السنوية · قواعد الخصومات",
    },
    {
      id: "covers",
      label: "أغلفة الهيرو 🎯",
      icon: ImageIcon,
      desc: "تخصيص أغلفة المجلات والألبومات بالرئيسية",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Studio Header & Section Tabs */}
      <div
        className={`p-4 sm:p-5 rounded-3xl border flex flex-wrap items-center justify-between gap-4 ${
          dark ? "border-white/10 bg-[#0c1015]" : "border-black/10 bg-white shadow-xs"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Globe size={20} />
          </div>
          <div>
            <h2 className="text-base font-black">استوديو محتوى الصفحات والمواقع الحية</h2>
            <p className="text-xs text-slate-400 font-bold">
              تعديل كافة العناصر التفاعلية والبيانات المؤسسية لصفحات الموقع مع انعكاس فوري للزوار
            </p>
          </div>
        </div>

        {/* Section Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-current/10">
          {SECTIONS.map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveSection(sec.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                activeSection === sec.id
                  ? dark
                    ? "bg-[#f8ca14] text-black shadow"
                    : "bg-[#08467d] text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Section Content */}
      <div className="animate-in fade-in duration-200">
        {activeSection === "homepage" && (
          <HomepageContentManager
            dark={dark}
            orchestration={orchestration}
            onSave={onSaveOrchestration}
            isSaving={isSaving}
          />
        )}

        {activeSection === "about" && (
          <AboutPageContentManager
            dark={dark}
            orchestration={orchestration}
            onSave={onSaveOrchestration}
            isSaving={isSaving}
          />
        )}

        {activeSection === "accreditations" && (
          <AccreditationsContentManager
            dark={dark}
            orchestration={orchestration}
            onSave={onSaveOrchestration}
            isSaving={isSaving}
          />
        )}

        {activeSection === "fees" && (
          <TuitionFeesContentManager
            dark={dark}
            orchestration={orchestration}
            onSave={onSaveOrchestration}
            isSaving={isSaving}
          />
        )}

        {activeSection === "covers" && (
          <div
            className={`p-6 rounded-3xl border space-y-6 ${
              dark ? "border-white/10 bg-[#0d1218]" : "border-black/10 bg-white shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-current/10">
              <div>
                <h3 className="text-base font-black">إعدادات أغلفة أقسام الهيرو بالصفحة الرئيسية</h3>
                <p className="text-xs text-slate-400 font-bold mt-0.5">
                  التحكم في مصادر الأغلفة (تلقائي من أحدث الإصدارات، أو مخصص بعدد وعنوان محدد)
                </p>
              </div>

              <Button
                type="button"
                onClick={async () => {
                  await onSaveOrchestration({ heroCovers: heroForm });
                  toast.success("تم حفظ إعدادات أغلفة الهيرو بنجاح");
                }}
                disabled={isSaving}
                className="rounded-xl font-black text-xs px-5 bg-amber-500 hover:bg-amber-400 text-black gap-1.5"
              >
                <Save size={13} />
                <span>{isSaving ? "جاري الحفظ..." : "حفظ الأغلفة 💾"}</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Journal Hero Mode */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-current/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black">غلاف قسم المجلة بالرئيسية</h4>
                  <span className="text-[10px] font-bold text-amber-400">مجلة العقيق 3D</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setHeroForm({ ...heroForm, journalMode: "auto" })}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition ${
                      heroForm.journalMode === "auto"
                        ? "bg-amber-500 text-black border-amber-500 font-black"
                        : "border-current/10 text-slate-400"
                    }`}
                  >
                    تلقائي (أحدث عدد)
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroForm({ ...heroForm, journalMode: "custom" })}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition ${
                      heroForm.journalMode === "custom"
                        ? "bg-amber-500 text-black border-amber-500 font-black"
                        : "border-current/10 text-slate-400"
                    }`}
                  >
                    تخصيص يدوي
                  </button>
                </div>
                {heroForm.journalMode === "custom" && (
                  <div className="space-y-2 pt-2 border-t border-current/10">
                    <input
                      type="text"
                      placeholder="عنوان مخصص للغلاف..."
                      value={heroForm.journalCustomTitle || ""}
                      onChange={(e) =>
                        setHeroForm({ ...heroForm, journalCustomTitle: e.target.value })
                      }
                      className="w-full rounded-xl border p-2.5 text-xs font-bold outline-none bg-white/5"
                    />
                    <input
                      type="text"
                      placeholder="وسام أو شارة (مثلاً: عدد خاص)..."
                      value={heroForm.journalCustomTag || ""}
                      onChange={(e) =>
                        setHeroForm({ ...heroForm, journalCustomTag: e.target.value })
                      }
                      className="w-full rounded-xl border p-2.5 text-xs font-bold outline-none bg-white/5"
                    />
                  </div>
                )}
              </div>

              {/* Albums Hero Mode */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-current/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black">غلاف قسم الألبومات بالرئيسية</h4>
                  <span className="text-[10px] font-bold text-emerald-400">معارض الفعاليات</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setHeroForm({ ...heroForm, albumsMode: "auto" })}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition ${
                      heroForm.albumsMode === "auto"
                        ? "bg-emerald-500 text-white border-emerald-500 font-black"
                        : "border-current/10 text-slate-400"
                    }`}
                  >
                    تلقائي (أحدث ألبوم)
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroForm({ ...heroForm, albumsMode: "custom" })}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition ${
                      heroForm.albumsMode === "custom"
                        ? "bg-emerald-500 text-white border-emerald-500 font-black"
                        : "border-current/10 text-slate-400"
                    }`}
                  >
                    تخصيص يدوي
                  </button>
                </div>
                {heroForm.albumsMode === "custom" && (
                  <div className="space-y-2 pt-2 border-t border-current/10">
                    <input
                      type="text"
                      placeholder="عنوان مخصص للغلاف..."
                      value={heroForm.albumsCustomTitle || ""}
                      onChange={(e) =>
                        setHeroForm({ ...heroForm, albumsCustomTitle: e.target.value })
                      }
                      className="w-full rounded-xl border p-2.5 text-xs font-bold outline-none bg-white/5"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
