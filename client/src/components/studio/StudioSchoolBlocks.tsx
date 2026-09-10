import React from "react";
import { GraduationCap, Camera, BookOpen, Calculator, Calendar, Sparkles, Plus, Check } from "lucide-react";
import { toast } from "sonner";

export type SchoolBlock = {
  id: string;
  title: string;
  category: "students" | "media" | "news" | "admissions" | "events";
  description: string;
  badge: string;
  icon: React.ElementType;
  color: string;
  snippet: {
    tag: string;
    label: string;
    content: string;
  };
};

export const SCHOOL_BLOCKS: SchoolBlock[] = [
  {
    id: "block-honors",
    title: "لوحة أوائل الطلاب والمتفوقين",
    category: "students",
    description: "كرت تفاعلي يعرض أوائل المراحل الدراسية مع الصور والنسب المئوية وشارات التميز الأكاديمي حياً من قاعدة البيانات.",
    badge: "بيانات حية",
    icon: GraduationCap,
    color: "from-amber-500/20 to-amber-700/20 text-amber-300 border-amber-400/30",
    snippet: {
      tag: "section-block",
      label: "لوحة الشرف والتميز",
      content: "لوحة الشرف — أوائل الطلبة المتفوقين في مدارس العقيق الأهلية والدولية للعام الدراسي الحالي",
    },
  },
  {
    id: "block-latest-album",
    title: "أحدث ألبوم صور للفعاليات",
    category: "media",
    description: "شبكة عرض صور حديثة متصلة بأحدث ألبوم مدرسي مرفوع تلقائياً مع زر فتح معرض الصور الكامل.",
    badge: "معرض حي",
    icon: Camera,
    color: "from-sky-500/20 to-sky-700/20 text-sky-300 border-sky-400/30",
    snippet: {
      tag: "section-block",
      label: "معرض الصور الأخير",
      content: "ألبوم صور الأنشطة المدرسية والفعاليات الحديثة بمدارس العقيق",
    },
  },
  {
    id: "block-journal-feed",
    title: "نشرة مجلة العقيق الأسبوعية",
    category: "news",
    description: "قسم يعرض غلاف العدد الأخير ومقالات الطلاب الحصرية مع زر القراءة التفاعلي والبودكاست المرفق.",
    badge: "تحديث أسبوعي",
    icon: BookOpen,
    color: "from-emerald-500/20 to-emerald-700/20 text-emerald-300 border-emerald-400/30",
    snippet: {
      tag: "section-block",
      label: "نشرة مجلة العقيق",
      content: "العدد الأخير من مجلة العقيق المدرسية — مقالات وإنجازات الطلاب",
    },
  },
  {
    id: "block-admissions-calculator",
    title: "حاسبة الأقساط وبوابة القبول",
    category: "admissions",
    description: "نموذج تسجيل إلكتروني سريع مع حاسبة ذكية لخصومات الأشقاء والتسجيل المبكر برابط واتساب مباشر.",
    badge: "تفاعلي فوري",
    icon: Calculator,
    color: "from-purple-500/20 to-purple-700/20 text-purple-300 border-purple-400/30",
    snippet: {
      tag: "section-block",
      label: "بوابة التسجيل والقبول",
      content: "سجل ابنك الآن في مدارس العقيق — مقاعد محدودة وخصومات حصرية",
    },
  },
  {
    id: "block-events-timeline",
    title: "تقويم الأنشطة والمناسبات القادمة",
    category: "events",
    description: "جدول زمني بالفعاليات القادمة (اليوم الوطني، معرض العلوم، دوري المدارس) مع مواعيدها ومواقعها.",
    badge: "تقويم ذكي",
    icon: Calendar,
    color: "from-rose-500/20 to-rose-700/20 text-rose-300 border-rose-400/30",
    snippet: {
      tag: "section-block",
      label: "تقويم الفعاليات",
      content: "جدول الفعاليات والأنشطة القادمة بمدارس العقيق الأهلية والدولية",
    },
  },
];

export function StudioSchoolBlocks({ onInsertBlock }: { onInsertBlock?: (block: SchoolBlock) => void }) {
  return (
    <div className="space-y-4" dir="rtl">
      <div className="rounded-2xl border border-amber-400/25 bg-gradient-to-br from-amber-400/10 via-black/40 to-transparent p-3.5">
        <div className="flex items-center gap-2 text-xs font-black text-amber-300">
          <Sparkles size={15} />
          <span>كتل المدرسة الحية (Live CMS Blocks)</span>
        </div>
        <p className="mt-1 text-[11px] leading-5 text-slate-400">
          كتل ذكية جاهزة تتصل تلقائياً بقاعدة بيانات المدرسة الحية وتتحدث فورياً دون الحاجة لكتابة كود.
        </p>
      </div>

      <div className="space-y-3">
        {SCHOOL_BLOCKS.map((block) => {
          const Icon = block.icon;
          return (
            <div
              key={block.id}
              className={`rounded-2xl border bg-gradient-to-br p-3.5 transition duration-200 hover:border-amber-400/50 hover:shadow-lg ${block.color} bg-black/40`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/10 text-white shadow-inner">
                    <Icon size={16} />
                  </span>
                  <div>
                    <h4 className="text-xs font-black text-white">{block.title}</h4>
                    <span className="inline-block rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-bold text-amber-200">
                      {block.badge}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onInsertBlock?.(block);
                    toast.success(`✓ تمت إضافة «${block.title}» إلى مساحة العمل`);
                  }}
                  className="flex items-center gap-1 rounded-xl bg-amber-400 px-2.5 py-1.5 text-[11px] font-black text-amber-950 shadow transition hover:bg-amber-300 active:scale-95"
                >
                  <Plus size={13} />
                  <span>إدراج</span>
                </button>
              </div>
              <p className="mt-2 text-[10px] leading-4 text-slate-300">{block.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
