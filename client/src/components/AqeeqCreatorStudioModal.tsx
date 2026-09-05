import { useState } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Newspaper, Mic, Image as ImageIcon, BookOpen, Sparkles, Wand2 } from "lucide-react";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";

type CreatorModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AqeeqCreatorStudioModal({ open, onOpenChange }: CreatorModalProps) {
  const [, navigate] = useLocation();
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";

  const creationOptions = [
    {
      id: "article",
      title: "مقال إخباري",
      desc: "اكتب وانشر مقالاً إخبارياً أو إعلاناً مدرسياً",
      icon: <Newspaper size={32} className="text-[#de191e]" />,
      path: "/articles/manage",
      glow: "hover:shadow-[0_0_30px_rgba(222,25,30,0.3)] border-[#de191e]/25",
    },
    {
      id: "podcast",
      title: "حلقة بودكاست",
      desc: "إضافة حلقة بودكاست أو بث إذاعي جديد",
      icon: <Mic size={32} className="text-[#f8ca14]" />,
      path: "/podcast/manage",
      glow: "hover:shadow-[0_0_30px_rgba(248,202,20,0.3)] border-[#f8ca14]/25",
    },
    {
      id: "journal",
      title: "إصدار مجلة",
      desc: "إنشاء عدد جديد من مجلة العقيق الدورية",
      icon: <BookOpen size={32} className="text-[#08467d]" />,
      path: "/journal/manage",
      glow: "hover:shadow-[0_0_30px_rgba(8,70,125,0.3)] border-[#08467d]/25",
    },
    {
      id: "album",
      title: "ألبوم صور",
      desc: "توثيق لقطات الفعاليات في معرض الصور",
      icon: <ImageIcon size={32} className="text-[#367453]" />,
      path: "/albums/manage",
      glow: "hover:shadow-[0_0_30px_rgba(54,116,83,0.3)] border-[#367453]/25",
    },
  ];

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`max-w-4xl border-0 p-0 overflow-hidden rounded-[24px] shadow-2xl transition-all duration-500 ${
          dark 
            ? "bg-black/90 backdrop-blur-2xl text-white shadow-[0_0_50px_rgba(229,184,79,0.15)]" 
            : "bg-white/90 backdrop-blur-2xl text-black shadow-[0_20px_60px_rgba(0,0,0,0.1)]"
        }`}
        dir="rtl"
      >
        <div className={`absolute inset-0 opacity-20 pointer-events-none ${dark ? "bg-[radial-gradient(ellipse_at_top,#e5b84f_0%,transparent_70%)]" : "bg-[radial-gradient(ellipse_at_top,#e5b84f_0%,transparent_70%)]"}`} />
        
        <div className="relative z-10 p-8 md:p-12">
          <DialogHeader className="mb-10 space-y-3 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e5b84f] to-[#c59c3a] text-black shadow-lg mb-4">
              <Sparkles size={32} strokeWidth={1.5} />
            </div>
            <DialogTitle className="text-3xl font-black tracking-tight font-['Tajawal'] text-center mx-auto">
              ماذا تريد أن تبدع اليوم؟
            </DialogTitle>
            <p className={`text-lg font-medium text-center mx-auto ${dark ? "text-white/60" : "text-black/60"}`}>
              اختر نوع المحتوى للبدء في مساحة العمل المخصصة
            </p>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {creationOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  onOpenChange(false);
                  navigate(opt.path);
                }}
                className={`group flex items-center gap-6 rounded-2xl border p-6 text-right transition-all duration-300 hover:-translate-y-1 ${
                  dark ? "bg-white/[0.03] hover:bg-white/[0.06]" : "bg-black/[0.02] hover:bg-black/[0.04]"
                } ${opt.glow}`}
              >
                <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${
                  dark ? "bg-white/5" : "bg-white shadow-sm"
                }`}>
                  {opt.icon}
                </div>
                <div>
                  <h3 className="mb-1.5 text-xl font-bold">{opt.title}</h3>
                  <p className={`text-sm font-medium leading-relaxed ${dark ? "text-white/50" : "text-black/50"}`}>
                    {opt.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-center">
             <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${
               dark ? "bg-[#e5b84f]/10 text-[#e5b84f]" : "bg-[#e5b84f]/10 text-[#c59c3a]"
             }`}>
               <Wand2 size={16} />
               مدعوم بأدوات الذكاء الاصطناعي التحريرية
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
