import React, { useState } from "react";
import { Plus, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Award, Save, ExternalLink, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export interface PartnerItem {
  id: string;
  name: string;
  logoUrl: string;
  targetUrl: string;
  category: "accreditation" | "ministry" | "academic" | "sponsor";
  visible: boolean;
  order: number;
}

export const DEFAULT_PARTNERS: PartnerItem[] = [
  {
    id: "partner-1",
    name: "وزارة التعليم بالمملكة العربية السعودية",
    logoUrl: "https://upload.wikimedia.org/wikipedia/ar/thumb/9/98/Ministry_of_Education_%28Saudi_Arabia%29_logo.svg/1200px-Ministry_of_Education_%28Saudi_Arabia%29_logo.svg.png",
    targetUrl: "https://moe.gov.sa",
    category: "ministry",
    visible: true,
    order: 1,
  },
  {
    id: "partner-2",
    name: "الاعتماد الأمريكي الدولي Cognia (99.2%)",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Cognia_Logo.png",
    targetUrl: "https://cognia.org",
    category: "accreditation",
    visible: true,
    order: 2,
  },
  {
    id: "partner-3",
    name: "مؤسسة موهبة للموهوبين والمبدعين",
    logoUrl: "https://www.mawhiba.org/AR/PublishingImages/Logo.png",
    targetUrl: "https://mawhiba.org",
    category: "academic",
    visible: true,
    order: 3,
  },
  {
    id: "partner-4",
    name: "منصة مدرستي للتعليم الموحد",
    logoUrl: "https://schools.madrasati.sa/assets/images/logo.png",
    targetUrl: "https://schools.madrasati.sa",
    category: "academic",
    visible: true,
    order: 4,
  },
  {
    id: "partner-5",
    name: "مراكز الاختبارات المعتمدة SAT & IELTS",
    logoUrl: "https://collegereadiness.collegeboard.org/static/media/cb-logo.svg",
    targetUrl: "https://collegereadiness.collegeboard.org/sat",
    category: "accreditation",
    visible: true,
    order: 5,
  },
];

interface PartnersContentManagerProps {
  dark?: boolean;
  orchestration: any;
  onSave: (updated: any) => Promise<void>;
  isSaving: boolean;
}

export function PartnersContentManager({
  dark = true,
  orchestration,
  onSave,
  isSaving,
}: PartnersContentManagerProps) {
  const [partners, setPartners] = useState<PartnerItem[]>(
    orchestration?.partners && orchestration.partners.length > 0
      ? orchestration.partners
      : DEFAULT_PARTNERS
  );

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newLogoUrl, setNewLogoUrl] = useState("");
  const [newTargetUrl, setNewTargetUrl] = useState("");
  const [newCategory, setNewCategory] = useState<PartnerItem["category"]>("accreditation");

  const handleToggle = (id: string) => {
    setPartners((prev) => prev.map((p) => (p.id === id ? { ...p, visible: !p.visible } : p)));
  };

  const handleMove = (id: string, direction: "up" | "down") => {
    const list = [...partners];
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
    setPartners(list.map((p, i) => ({ ...p, order: i + 1 })));
  };

  const handleDelete = (id: string) => {
    setPartners((prev) => prev.filter((p) => p.id !== id).map((p, i) => ({ ...p, order: i + 1 })));
    toast.success("تم حذف الشريك من القائمة");
  };

  const handleAdd = () => {
    if (!newName.trim() || !newLogoUrl.trim()) {
      toast.error("يرجى إدخال اسم الشريك ورابط الشعار");
      return;
    }
    const newP: PartnerItem = {
      id: "partner-" + Date.now(),
      name: newName.trim(),
      logoUrl: newLogoUrl.trim(),
      targetUrl: newTargetUrl.trim() || "https://moe.gov.sa",
      category: newCategory,
      visible: true,
      order: partners.length + 1,
    };
    setPartners([...partners, newP]);
    setNewName("");
    setNewLogoUrl("");
    setNewTargetUrl("");
    setIsAdding(false);
    toast.success("تمت إضافة الشريك بنجاح ➕");
  };

  const handleSaveAll = async () => {
    try {
      await onSave({
        ...orchestration,
        partners,
      });
      toast.success("✅ تم حفظ قائمة الشركاء والاعتمادات بنجاح");
    } catch {
      toast.error("حدث خطأ أثناء حفظ التعديلات");
    }
  };

  return (
    <div className="space-y-6">
      <div className={`p-5 rounded-3xl border flex flex-wrap items-center justify-between gap-4 ${
        dark ? "border-white/10 bg-[#0c1015]" : "border-black/10 bg-white shadow-xs"
      }`}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Award size={20} />
          </div>
          <div>
            <h3 className="text-base font-black">شريط الشركاء والاعتمادات والرعاة ({partners.length} شريك)</h3>
            <p className="text-xs text-slate-400 font-bold">
              إدارة شعارات الشركاء الرسميين والاعتمادات التي تعرض في شريط متحرك أنيق على الموقع الحي
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="bg-amber-400 hover:bg-yellow-400 text-black font-black text-xs gap-1.5 rounded-xl cursor-pointer"
          >
            <Plus size={14} />
            <span>إضافة شريك جديد ➕</span>
          </Button>

          <Button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs gap-1.5 rounded-xl px-5 cursor-pointer"
          >
            <Save size={13} />
            <span>{isSaving ? "جارِ الحفظ..." : "حفظ الشركاء 💾"}</span>
          </Button>
        </div>
      </div>

      {isAdding && (
        <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-amber-400">إضافة شريك أو جهة اعتماد جديدة</h4>
            <button type="button" onClick={() => setIsAdding(false)} className="text-xs text-slate-400 hover:text-white">إلغاء ✕</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">اسم الشريك / جهة الاعتماد</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="مثال: جامعة طيبة أو كوجنيا"
                className="w-full rounded-xl border p-2.5 text-xs font-bold outline-none bg-white/5"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">رابط الشعار (Image URL)</label>
              <input
                type="text"
                value={newLogoUrl}
                onChange={(e) => setNewLogoUrl(e.target.value)}
                placeholder="https://.../logo.png"
                className="w-full rounded-xl border p-2.5 text-xs font-mono outline-none bg-white/5"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">رابط الموقع الرسمي للشريك</label>
              <input
                type="text"
                value={newTargetUrl}
                onChange={(e) => setNewTargetUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border p-2.5 text-xs font-mono outline-none bg-white/5"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              onClick={handleAdd}
              className="bg-amber-400 hover:bg-yellow-400 text-black font-black text-xs px-6 rounded-xl cursor-pointer"
            >
              إدراج الشريك في الشريط ➕
            </Button>
          </div>
        </div>
      )}

      {/* Partners Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {partners.map((partner, idx) => (
          <div
            key={partner.id}
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
              partner.visible
                ? dark ? "bg-white/[0.02] border-white/10 hover:border-white/20" : "bg-slate-50 border-black/10"
                : "opacity-40 bg-black/20 border-dashed border-current/10"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-12 w-12 rounded-xl bg-white/10 p-1 flex items-center justify-center shrink-0 overflow-hidden border border-white/10">
                {partner.logoUrl ? (
                  <img src={partner.logoUrl} alt={partner.name} className="h-full w-full object-contain filter brightness-105" />
                ) : (
                  <ImageIcon size={18} className="text-slate-400" />
                )}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-black truncate">{partner.name}</h4>
                <a
                  href={partner.targetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-blue-400 hover:underline inline-flex items-center gap-1 font-mono truncate max-w-[160px]"
                >
                  <span>{partner.targetUrl}</span>
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => handleMove(partner.id, "up")}
                disabled={idx === 0}
                className="p-1 rounded-lg border text-slate-300 hover:text-white disabled:opacity-20 cursor-pointer"
                title="تحريك لأعلى"
              >
                <ArrowUp size={12} />
              </button>
              <button
                type="button"
                onClick={() => handleMove(partner.id, "down")}
                disabled={idx === partners.length - 1}
                className="p-1 rounded-lg border text-slate-300 hover:text-white disabled:opacity-20 cursor-pointer"
                title="تحريك لأسفل"
              >
                <ArrowDown size={12} />
              </button>
              <button
                type="button"
                onClick={() => handleToggle(partner.id)}
                className={`p-1 rounded-lg border transition cursor-pointer ${
                  partner.visible ? "text-emerald-400 hover:bg-emerald-400/10" : "text-slate-500 hover:bg-white/5"
                }`}
                title={partner.visible ? "إخفاء" : "إظهار"}
              >
                {partner.visible ? <Eye size={12} /> : <EyeOff size={12} />}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(partner.id)}
                className="p-1 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                title="حذف"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
