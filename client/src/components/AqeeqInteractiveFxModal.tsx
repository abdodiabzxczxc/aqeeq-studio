import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UploadCloud, ImageIcon, Sparkles, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";

export interface InteractiveHoverItem {
  id: string;
  triggerText: string;
  title: string;
  badge: string;
  imageUrl: string;
  targetUrl?: string;
}

export const DEFAULT_WELLINGTON_HOVER_ITEMS: InteractiveHoverItem[] = [
  {
    id: "wellington-cognia",
    triggerText: "معتمدة من كوجنيا الأمريكية (Cognia)",
    title: "اعتماد كوجنيا الأمريكي لأعلى معايير الجودة التعليمية",
    badge: "Cognia USA Accredited",
    imageUrl: "/articles/is-quality-important-school-accreditation.jpg",
    targetUrl: "/accreditations",
  },
  {
    id: "wellington-ielts",
    triggerText: "مركز اختبارات IELTS المعتمد بالمدينة المنورة",
    title: "مركز اختبارات IELTS الرسمي والحاسوبي بالمدينة المنورة",
    badge: "IELTS on Computer · IDP",
    imageUrl: "/covers/student-lab-admissions.jpg",
    targetUrl: "/accreditations",
  },
  {
    id: "wellington-sat",
    triggerText: "مراكز معتمدة لاختبارات SAT و ACT",
    title: "المركز الدولي المعتمد لاختبارات SAT و ACT",
    badge: "SAT & ACT Testing Hub",
    imageUrl: "/covers/student-robotics-accreditations.jpg",
    targetUrl: "/accreditations",
  },
  {
    id: "wellington-community",
    triggerText: "+10,000 ولي أمر يثقون بمدارسنا",
    title: "مجتمع العقيق: فخر وثقة أكثر من 10,000 أسرة بطيبة الطيبة",
    badge: "مجتمع العقيق · 1994",
    imageUrl: "/covers/student-excellence-about.jpg",
    targetUrl: "/about",
  },
];

interface AqeeqInteractiveFxModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InteractiveHoverItem | null;
  onSave: (updatedItem: InteractiveHoverItem) => Promise<void> | void;
  isSaving?: boolean;
  dark?: boolean;
  openMediaPicker?: (title: string, currentUrl: string | null | undefined, onSelect: (item: any) => void) => void;
}

export function AqeeqInteractiveFxModal({
  isOpen,
  onClose,
  item,
  onSave,
  isSaving = false,
  dark = true,
  openMediaPicker,
}: AqeeqInteractiveFxModalProps) {
  const [form, setForm] = useState<InteractiveHoverItem>({
    id: "",
    triggerText: "",
    title: "",
    badge: "",
    imageUrl: "",
    targetUrl: "",
  });

  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (item) {
      setForm({ ...item });
      setImgError(false);
    }
  }, [item]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("الحد الأقصى لحجم الصورة هو 8 ميجابايت");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setForm((prev) => ({ ...prev, imageUrl: reader.result as string }));
        setImgError(false);
        toast.success("✅ تم اختيار الصورة من جهازك بنجاح!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.triggerText.trim()) {
      toast.error("يرجى إدخال الكلمة أو العبارة المعروضة");
      return;
    }
    if (!form.imageUrl.trim()) {
      toast.error("يرجى اختيار أو رفع صورة للبطاقة التفاعلية");
      return;
    }
    await onSave(form);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={`max-w-md sm:max-w-lg rounded-3xl p-6 ${dark ? "bg-[#11141c] text-white border-white/10" : "bg-white text-slate-900 border-black/10"}`} dir="rtl">
        <DialogHeader className="text-right pb-3 border-b border-current/10">
          <DialogTitle className="text-lg font-black flex items-center gap-2">
            <Sparkles className="text-amber-400" size={18} />
            <span>تعديل العنصر التفاعلي وصورة الماوس (Hover Preview)</span>
          </DialogTitle>
          <p className="text-xs text-slate-400 mt-1">
            التحكم في الصورة والكلمة التي تظهر عند تمرير مؤشر الفأرة على هذا العنصر.
          </p>
        </DialogHeader>

        {/* Hidden Native File Input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileUpload}
        />

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* 1. Trigger Word / Text */}
          <div>
            <label className="block text-xs font-black text-slate-400 mb-1">
              العبارة أو الكلمة المعروضة في الصفحة:
            </label>
            <input
              type="text"
              value={form.triggerText}
              onChange={(e) => setForm({ ...form, triggerText: e.target.value })}
              placeholder="مثال: معتمدة من كوجنيا الأمريكية"
              className={`w-full rounded-xl border p-2.5 text-xs font-bold outline-none ${
                dark ? "border-white/10 bg-black/40 text-white focus:border-amber-400" : "border-black/10 bg-white focus:border-amber-500"
              }`}
            />
          </div>

          {/* 2. Interactive Image with Preview, Upload & Library */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-400">
                الصورة التي تظهر عند الوقوف بالماوس 🖼️:
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-blue-400/30 bg-blue-500/10 px-2.5 py-1 text-[11px] font-black text-blue-400 hover:bg-blue-500/20 transition cursor-pointer"
                >
                  <UploadCloud size={13} />
                  <span>رفع من جهازك 📤</span>
                </button>
                {openMediaPicker && (
                  <button
                    type="button"
                    onClick={() =>
                      openMediaPicker("اختيار صورة التلميح التفاعلي", form.imageUrl, (item) => {
                        if (item?.url) {
                          setForm((prev) => ({ ...prev, imageUrl: item.url }));
                          setImgError(false);
                        }
                      })
                    }
                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-black text-amber-400 hover:bg-amber-500/20 transition cursor-pointer"
                  >
                    <ImageIcon size={13} />
                    <span>المكتبة 🖼️</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={form.imageUrl}
                onChange={(e) => {
                  setForm({ ...form, imageUrl: e.target.value });
                  setImgError(false);
                }}
                placeholder="https://... أو /covers/image.jpg"
                className={`flex-1 rounded-xl border p-2.5 text-xs font-mono font-bold outline-none ${
                  dark ? "border-white/10 bg-black/40 text-white focus:border-amber-400" : "border-black/10 bg-white focus:border-amber-500"
                }`}
              />
              {form.imageUrl && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, imageUrl: "" })}
                  className="px-2.5 rounded-xl border border-[#de191e]/30 bg-[#de191e]/10 text-[#de191e] hover:bg-[#de191e]/20 transition"
                  title="مسح الصورة"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            {/* Live Visual Preview of Hover Card */}
            <div className="relative h-36 w-full overflow-hidden rounded-2xl border border-white/10 bg-black/60 shadow-inner mt-2">
              {form.imageUrl && !imgError ? (
                <img
                  src={form.imageUrl}
                  alt={form.title || "Preview"}
                  onError={() => setImgError(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 text-xs gap-1 bg-gradient-to-br from-black/80 to-slate-900/90">
                  <ImageIcon size={24} className="opacity-40 mb-1" />
                  <span>{imgError ? "تعذر تحميل الصورة — يرجى التحقق من الرابط" : "لا توجد صورة محددة بعد"}</span>
                </div>
              )}
              {/* Badge Preview */}
              {form.badge && (
                <div className="absolute top-2 right-2 rounded-full bg-black/70 border border-[#f8ca14]/40 px-2.5 py-0.5 text-[9px] font-black text-[#f8ca14] backdrop-blur-md">
                  {form.badge}
                </div>
              )}
              {/* Title Preview */}
              {form.title && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-2.5">
                  <p className="text-right text-[11px] font-black text-white line-clamp-1 leading-snug">
                    {form.title}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 3. Tooltip Title & Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-400 mb-1">
                عنوان البطاقة التفاعلية (Title):
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="مثال: اعتماد كوجنيا الأمريكي لأعلى معايير الجودة"
                className={`w-full rounded-xl border p-2.5 text-xs font-bold outline-none ${
                  dark ? "border-white/10 bg-black/40 text-white" : "border-black/10 bg-white"
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 mb-1">
                الشارة العلوية (Badge):
              </label>
              <input
                type="text"
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                placeholder="مثال: Cognia USA Accredited"
                className={`w-full rounded-xl border p-2.5 text-xs font-bold outline-none ${
                  dark ? "border-white/10 bg-black/40 text-white" : "border-black/10 bg-white"
                }`}
              />
            </div>
          </div>

          {/* 4. Target Navigation Link */}
          <div>
            <label className="block text-xs font-black text-slate-400 mb-1">
              الرابط أو الصفحة المستهدفة عند النقر:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={form.targetUrl || ""}
                onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
                placeholder="/accreditations أو /about"
                className={`flex-1 rounded-xl border p-2.5 text-xs font-mono font-bold outline-none ${
                  dark ? "border-white/10 bg-black/40 text-white" : "border-black/10 bg-white"
                }`}
              />
              {form.targetUrl && (
                <a
                  href={form.targetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl border border-current/10 hover:bg-white/5 transition"
                  title="فتح الرابط"
                >
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between gap-2 pt-3 border-t border-current/10">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl text-xs font-bold"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-[#f8ca14] hover:bg-yellow-400 text-black text-xs font-black px-6 shadow-md shadow-[#f8ca14]/20"
            >
              {isSaving ? "جاري الحفظ..." : "حفظ التعديل فوراً ✨"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
